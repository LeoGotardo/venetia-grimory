import { STORAGE_KEY_CLOUD } from '../constants'
import { contentHash } from '../lib/cloud/hash'
import { cloudKey, isDirty, parseCloudKey, type CloudKind, type CloudRecord } from '../lib/cloud/sync'

/**
 * Vínculo deste aparelho com a conta e o estado de sync de cada registro, no
 * localStorage. Não importa o Firebase: os storages (`sheetStorage`,
 * `gmStorage`, `areaMapStorage`) chamam `recordLocalWrite`/`recordLocalDelete`
 * a cada gravação, e isso só registra algo enquanto há conta vinculada — quem
 * nunca entrou paga uma leitura de flag, nada mais.
 */

export interface CloudProfile {
  uid: string
  email: string | null
  name: string | null
  photo: string | null
}

interface CloudState {
  profile: CloudProfile | null
  /** Por `kind:id`. */
  records: Record<string, CloudRecord>
  /** Maior `seq` já lido da conta: a próxima busca só pede o que mudou depois. */
  cursor: number
}

export interface CloudSnapshot {
  profile: CloudProfile | null
  /** Registros que mudaram aqui e a nuvem ainda não tem — inclui os grandes demais. */
  pending: number
  /** Não podem subir (grandes demais, fora do contrato): ficam só neste aparelho. */
  localOnly: number
}

const emptyState = (): CloudState => ({ profile: null, records: {}, cursor: 0 })

let state: CloudState = readState()
let snapshot: CloudSnapshot = buildSnapshot()
const stateListeners = new Set<() => void>()
const changeListeners = new Set<() => void>()

function readState(): CloudState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CLOUD)
    if (!raw) return emptyState()
    const parsed = JSON.parse(raw) as Partial<CloudState>
    return {
      profile: parsed.profile ?? null,
      records: parsed.records ?? {},
      cursor: typeof parsed.cursor === 'number' ? parsed.cursor : 0,
    }
  } catch (err) {
    console.error('[nuvem] Estado do sync corrompido, reiniciando.', err)
    return emptyState()
  }
}

function buildSnapshot(): CloudSnapshot {
  let pending = 0
  let localOnly = 0
  for (const record of Object.values(state.records)) {
    if (!isDirty(record)) continue
    pending++
    if (record.too_large || record.invalid) localOnly++
  }
  return { profile: state.profile, pending, localOnly }
}

function persist(): void {
  try {
    localStorage.setItem(STORAGE_KEY_CLOUD, JSON.stringify(state))
  } catch (err) {
    console.error('[nuvem] Falha ao gravar o estado do sync.', err)
  }
  snapshot = buildSnapshot()
  for (const listener of stateListeners) listener()
}

function notifyChange(): void {
  for (const listener of changeListeners) listener()
}

const now = () => new Date().toISOString()

export const isCloudLinked = () => state.profile !== null

/** Marca a mudança local; sem efeito se o conteúdo é o mesmo (abrir a ficha regrava igual). */
function writeRecord(key: string, payload: string): boolean {
  const hash = contentHash(payload)
  const prev = state.records[key]
  if (prev?.hash === hash) return false
  state.records[key] = { hash, synced: prev?.synced, at: now() }
  return true
}

function deleteRecord(key: string): boolean {
  const prev = state.records[key]
  if (!prev || prev.hash === null) return false
  // Nunca chegou à nuvem: não precisa de lápide.
  if (prev.synced === undefined) delete state.records[key]
  else state.records[key] = { hash: null, synced: prev.synced, at: now() }
  return true
}

/** `payload` é o JSON que sobe para a nuvem — o mesmo que `CloudLocal.read` devolve. */
export function recordLocalWrite(kind: CloudKind, id: string, payload: string): void {
  if (!isCloudLinked()) return
  if (!writeRecord(cloudKey(kind, id), payload)) return
  persist()
  notifyChange()
}

export function recordLocalDelete(kind: CloudKind, id: string): void {
  if (!isCloudLinked()) return
  if (!deleteRecord(cloudKey(kind, id))) return
  persist()
  notifyChange()
}

/**
 * Coleção gravada inteira de uma vez (o bestiário é um array numa chave só):
 * registra cada item e apaga os que saíram da lista.
 */
export function recordLocalCollection(kind: CloudKind, entries: Array<[id: string, payload: string]>): void {
  if (!isCloudLinked()) return
  let changed = false
  const present = new Set<string>()
  for (const [id, payload] of entries) {
    const key = cloudKey(kind, id)
    present.add(key)
    if (writeRecord(key, payload)) changed = true
  }
  for (const key of Object.keys(state.records)) {
    if (present.has(key) || parseCloudKey(key).kind !== kind) continue
    if (deleteRecord(key)) changed = true
  }
  if (!changed) return
  persist()
  notifyChange()
}

// ── Acesso do motor de sync (cloudEngine) ─────────────────────────────────────

export const getRecord = (key: string): CloudRecord | undefined => state.records[key]

export function setRecord(key: string, record: CloudRecord | undefined): void {
  if (record) state.records[key] = record
  else delete state.records[key]
  persist()
}

/** Várias de uma vez, gravando o estado uma vez só (uma busca pode trazer centenas). */
export function setRecords(entries: Array<[key: string, record: CloudRecord | undefined]>): void {
  if (entries.length === 0) return
  for (const [key, record] of entries) {
    if (record) state.records[key] = record
    else delete state.records[key]
  }
  persist()
}

export const allRecords = (): Array<[string, CloudRecord]> => Object.entries(state.records)

export const getCursor = (): number => state.cursor

export function setCursor(value: number): void {
  if (state.cursor === value) return
  state.cursor = value
  persist()
}

/** Vincula a conta com registros e cursores zerados — o motor escaneia o aparelho em seguida. */
export function linkProfile(profile: CloudProfile): void {
  state = { profile, records: {}, cursor: 0 }
  persist()
}

/** Atualiza nome/foto da mesma conta sem mexer nos registros. */
export function updateProfile(profile: CloudProfile): void {
  if (state.profile?.uid !== profile.uid) return
  const prev = state.profile
  if (prev.email === profile.email && prev.name === profile.name && prev.photo === profile.photo) return
  state = { ...state, profile }
  persist()
}

/**
 * Desvincula. Daqui em diante nada é registrado — por isso o logout chama isto
 * **antes** de apagar os dados do aparelho: apagar vinculado viraria lápides
 * que apagariam a conta inteira.
 */
export function unlinkProfile(): void {
  state = emptyState()
  persist()
}

// ── Assinaturas ───────────────────────────────────────────────────────────────

export const getCloudSnapshot = (): CloudSnapshot => snapshot

/** Qualquer mudança de estado (perfil, pendências) — para a UI. */
export function subscribeCloudState(listener: () => void): () => void {
  stateListeners.add(listener)
  return () => stateListeners.delete(listener)
}

/** Só gravações locais — para o motor agendar o push. */
export function subscribeLocalChanges(listener: () => void): () => void {
  changeListeners.add(listener)
  return () => changeListeners.delete(listener)
}

/** Testes: relê do localStorage. */
export function reloadCloudStateForTests(): void {
  state = readState()
  snapshot = buildSnapshot()
}
