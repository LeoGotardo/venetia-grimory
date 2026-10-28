import { CLOUD_DOC_MAX_BYTES, CLOUD_PUSH_BATCH_BYTES, CLOUD_PUSH_BATCH_MAX } from '../constants'
import { contentHash } from '../lib/cloud/hash'
import { pushItemSchema, type PushItem, type PushResponse } from '../lib/cloud/protocol'
import {
  cloudKey,
  isDirty,
  parseCloudKey,
  resolvePulled,
  toCloudTimestamp,
  wireBytes,
  type CloudKind,
  type CloudRecord,
  type RemoteDoc,
} from '../lib/cloud/sync'
import { allRecords, getCursor, getRecord, setCursor, setRecords } from './cloudState'

/**
 * Motor do sync, sem rede nem stores: a nuvem e o aparelho chegam como
 * interfaces (`cloudApi` e `cloudLocal` no app, fakes em memória nos testes).
 */

export interface CloudRemote {
  /** Tudo o que mudou na conta com `seq` depois de `since`, em ordem; 0 traz tudo. */
  pull(since: number): Promise<RemoteDoc[]>
  /** Grava o lote; o que a nuvem já tinha mais novo volta em `conflicts` (last-write-wins no servidor). */
  push(items: PushItem[]): Promise<PushResponse>
}

/** Versão da nuvem a gravar no aparelho; `data` nulo apaga. */
export interface RemoteChange {
  id: string
  data: string | null
  updatedAt: string
}

export interface CloudLocal {
  /** Grava as edições que esperam o debounce dos stores — antes de comparar com a nuvem. */
  flush(): Promise<void>
  /** JSON atual de cada registro como sobe para a nuvem; `null` se não existe aqui. */
  read(kind: CloudKind, ids: string[]): Promise<Array<string | null>>
  /**
   * Grava as versões da nuvem no aparelho, atualizando o que estiver aberto. Em
   * lote: o bestiário é um array numa chave só, e regravá-lo por monstro seria quadrático.
   */
  apply(kind: CloudKind, changes: RemoteChange[]): Promise<void>
  /** Aberto num editor com rascunho próprio: a versão da nuvem espera ele fechar. */
  isBusy(kind: CloudKind, id: string): boolean
  /** Recarrega as listas dos stores depois de aplicar mudanças. */
  refresh(kinds: Set<CloudKind>): void
  /** Tudo o que existe no aparelho, com o `updated_at` de cada um. */
  scan(): Promise<Array<{ kind: CloudKind; id: string; data: string; updatedAt: string }>>
}

const now = () => new Date().toISOString()
const hashOf = (data: string | null) => (data === null ? null : contentHash(data))

/**
 * Quantos itens do aparelho a nuvem não tem como estão — conferido no próprio
 * aparelho, não só nos registros: é o que o logout apaga, e um item sem
 * registro (vínculo que falhou no meio) também se perderia. Apagados que não
 * subiram contam: voltariam no próximo login.
 */
export async function countUnsynced(local: CloudLocal): Promise<number> {
  const items = await local.scan()
  const present = new Set<string>()
  let count = 0
  for (const { kind, id, data } of items) {
    const key = cloudKey(kind, id)
    present.add(key)
    const record = getRecord(key)
    if (!record || isDirty(record) || record.hash !== contentHash(data)) count++
  }
  for (const [key, record] of allRecords()) {
    if (!present.has(key) && record.hash === null && isDirty(record)) count++
  }
  return count
}

/** Lotes que cabem num corpo de requisição. */
function batches<T extends { bytes: number }>(items: T[]): T[][] {
  const out: T[][] = []
  let current: T[] = []
  let bytes = 0
  for (const item of items) {
    if (current.length > 0 && (current.length >= CLOUD_PUSH_BATCH_MAX || bytes + item.bytes > CLOUD_PUSH_BATCH_BYTES)) {
      out.push(current)
      current = []
      bytes = 0
    }
    current.push(item)
    bytes += item.bytes
  }
  if (current.length > 0) out.push(current)
  return out
}

function groupByKind<T extends { kind: CloudKind }>(items: T[]): Map<CloudKind, T[]> {
  const byKind = new Map<CloudKind, T[]>()
  for (const item of items) byKind.set(item.kind, [...(byKind.get(item.kind) ?? []), item])
  return byKind
}

export function createCloudEngine(remote: CloudRemote, local: CloudLocal) {
  /** Grava as versões da nuvem e deixa os registros em dia com elas. */
  async function applyRemote(kind: CloudKind, changes: RemoteChange[]) {
    if (changes.length === 0) return
    await local.apply(kind, changes)
    // O que ficou gravado pode diferir do que veio (o `complete` da ficha não regride):
    // nesse caso o registro fica sujo e a versão local sobe.
    const stored = await local.read(kind, changes.map(c => c.id))
    setRecords(changes.map((change, i): [string, CloudRecord | undefined] => {
      const remoteHash = hashOf(change.data)
      const hash = hashOf(stored[i])
      const key = cloudKey(kind, change.id)
      return [key, hash === null && remoteHash === null ? undefined : { hash, synced: remoteHash, at: change.updatedAt }]
    }))
  }

  /**
   * Decide cada registro que veio da nuvem: aplica, marca em dia ou deixa para o
   * push. Devolve os tipos que mudaram aqui e os `seq` dos adiados (abertos num editor).
   */
  async function receive(docs: RemoteDoc[]): Promise<{ changed: Set<CloudKind>; deferred: number[] }> {
    const toApply: Array<RemoteChange & { kind: CloudKind }> = []
    const inSync: Array<[string, CloudRecord]> = []
    const deferred: number[] = []
    for (const doc of docs) {
      const key = cloudKey(doc.kind, doc.id)
      const record = getRecord(key)
      const remoteHash = hashOf(doc.data)
      const action = resolvePulled(record, remoteHash, doc.updated_at)
      if (action === 'apply' && local.isBusy(doc.kind, doc.id)) deferred.push(doc.seq)
      else if (action === 'apply') toApply.push({ kind: doc.kind, id: doc.id, data: doc.data, updatedAt: doc.updated_at })
      else if (record && record.synced !== remoteHash) inSync.push([key, { ...record, synced: remoteHash }])
    }
    setRecords(inSync)
    const changed = new Set<CloudKind>()
    for (const [kind, changes] of groupByKind(toApply)) {
      await applyRemote(kind, changes)
      changed.add(kind)
    }
    return { changed, deferred }
  }

  /** Traz o que mudou na nuvem desde a última busca. Devolve os tipos que mudaram aqui. */
  async function pull(): Promise<Set<CloudKind>> {
    const since = getCursor()
    const docs = await remote.pull(since)
    // Edições feitas enquanto a busca corria entram na comparação.
    await local.flush()
    const { changed, deferred } = await receive(docs)
    const latest = docs.reduce((max, doc) => Math.max(max, doc.seq), since)
    // Não avança o cursor além de um adiado: ele volta na próxima busca.
    setCursor(deferred.length > 0 ? Math.min(latest, Math.min(...deferred) - 1) : latest)
    if (changed.size > 0) local.refresh(changed)
    return changed
  }

  /** Sobe tudo o que mudou aqui, em lotes. Conflito perdido aplica a versão da nuvem. */
  async function push(): Promise<Set<CloudKind>> {
    const dirty = allRecords()
      .filter(([, record]) => isDirty(record))
      .map(([key, record]) => ({ key, record, ...parseCloudKey(key) }))
    const outgoing: Array<{ key: string; hash: string | null; item: PushItem; bytes: number }> = []
    const fixes: Array<[string, CloudRecord]> = []

    for (const [kind, entries] of groupByKind(dirty)) {
      const live = entries.filter(e => e.record.hash !== null)
      const data = live.length > 0 ? await local.read(kind, live.map(e => e.id)) : []
      const dataByKey = new Map(live.map((e, i) => [e.key, data[i]]))
      for (const { key, record, id } of entries) {
        const value = record.hash === null ? null : dataByKey.get(key) ?? null
        if (record.hash !== null && value === null) {
          // Sumiu do aparelho sem passar pelo storage: vira apagado.
          fixes.push([key, { ...record, hash: null, at: now() }])
          continue
        }
        const bytes = value === null ? 0 : wireBytes(value)
        if (bytes > CLOUD_DOC_MAX_BYTES) {
          if (!record.too_large) fixes.push([key, { ...record, too_large: true }])
          continue
        }
        const item: PushItem = { kind, id, data: value, updated_at: toCloudTimestamp(record.at) }
        // A API recusa o lote inteiro por um item fora do contrato: ele fica aqui e o resto sobe.
        if (!pushItemSchema.safeParse(item).success) {
          if (!record.invalid) fixes.push([key, { ...record, invalid: true }])
          continue
        }
        outgoing.push({ key, hash: hashOf(value), item, bytes: bytes + 200 })
      }
    }
    setRecords(fixes)

    const changed = new Set<CloudKind>()
    for (const batch of batches(outgoing)) {
      const result = await remote.push(batch.map(b => b.item))
      const written = new Set(result.written.map(w => cloudKey(w.kind, w.id)))
      setRecords(batch.flatMap(({ key, hash }): Array<[string, CloudRecord]> => {
        const current = getRecord(key)
        return written.has(key) && current ? [[key, { ...current, synced: hash, too_large: undefined, invalid: undefined }]] : []
      }))
      // A nuvem tinha versão mais nova: decide como se tivesse vindo numa busca.
      for (const kind of (await receive(result.conflicts)).changed) changed.add(kind)
    }
    if (changed.size > 0) local.refresh(changed)
    return changed
  }

  /** Primeiro vínculo: tudo o que já existe no aparelho entra como mudança local. */
  async function scanLocal(): Promise<void> {
    await local.flush()
    const items = await local.scan()
    setRecords(items.map(({ kind, id, data, updatedAt }): [string, CloudRecord] => [
      cloudKey(kind, id),
      { hash: contentHash(data), at: toCloudTimestamp(updatedAt) },
    ]))
  }

  async function sync(): Promise<void> {
    await local.flush()
    await pull()
    await push()
  }

  return { pull, push, scanLocal, sync }
}

export type CloudEngine = ReturnType<typeof createCloudEngine>
