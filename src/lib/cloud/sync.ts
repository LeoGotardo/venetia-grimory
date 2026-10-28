/**
 * Regras puras do sync com a conta. O app continua local-first: cada registro
 * (ficha, campanha, monstro do bestiário, mapa de área) mora no aparelho e o
 * Neon guarda uma cópia por linha. Conflito é last-write-wins pelo
 * `updated_at` — o momento em que o conteúdo mudou no aparelho que o escreveu.
 *
 * Sem imports: as funções da Vercel também leem este arquivo.
 */

export const CLOUD_KINDS = ['sheet', 'campaign', 'monster', 'area_map'] as const

export type CloudKind = typeof CLOUD_KINDS[number]

/** Estado de sync de um registro local. */
export interface CloudRecord {
  /** Hash do conteúdo local atual; `null` = apagado neste aparelho. */
  hash: string | null
  /** Hash do que a nuvem tem (o último que subiu ou desceu); ausente = nunca chegou à nuvem. */
  synced?: string | null
  /** Quando o conteúdo local mudou — é o que o last-write-wins compara. */
  at: string
  /** Maior que `CLOUD_DOC_MAX_BYTES`: fica só neste aparelho. */
  too_large?: boolean
  /** Fora do contrato da API (id de um pacote de monstros importado, por exemplo): fica só neste aparelho. */
  invalid?: boolean
}

/** Registro lido da nuvem. `data` é o JSON do registro; `null` é a lápide de um apagado. */
export interface RemoteDoc {
  kind: CloudKind
  id: string
  data: string | null
  updated_at: string
  /** Ordem da escrita dentro da conta — o cursor das buscas incrementais. */
  seq: number
}

export const cloudKey = (kind: CloudKind, id: string) => `${kind}:${id}`

export function parseCloudKey(key: string): { kind: CloudKind; id: string } {
  const sep = key.indexOf(':')
  return { kind: key.slice(0, sep) as CloudKind, id: key.slice(sep + 1) }
}

/** Mudou aqui e a nuvem ainda não tem. */
export function isDirty(record: CloudRecord): boolean {
  return record.hash !== record.synced
}

/**
 * O que fazer com um registro que veio da nuvem:
 * - `in-sync`: a nuvem tem o mesmo conteúdo (ou a lápide de algo que nunca esteve aqui);
 * - `apply`: grava a versão da nuvem no aparelho;
 * - `keep-local`: a versão local mudou depois — fica, e sobe no próximo push.
 */
export function resolvePulled(
  record: CloudRecord | undefined,
  remoteHash: string | null,
  remoteAt: string,
): 'in-sync' | 'apply' | 'keep-local' {
  if (!record) return remoteHash === null ? 'in-sync' : 'apply'
  if (record.hash === remoteHash) return 'in-sync'
  if (!isDirty(record)) return 'apply'
  // Strings ISO do toISOString comparam na ordem do tempo.
  return record.at > remoteAt ? 'keep-local' : 'apply'
}

/** Formato exato do `toISOString` — o único que a API aceita em `updated_at`. */
export const ISO_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/

/** Data de um registro antigo no formato da API; inválida ou vazia vira agora. */
export function toCloudTimestamp(value: string | undefined | null): string {
  if (value && ISO_TIMESTAMP.test(value)) return value
  const date = value ? new Date(value) : null
  return date && !Number.isNaN(date.getTime()) ? date.toISOString() : new Date().toISOString()
}

/** Tamanho em bytes UTF-8. */
export function byteLength(text: string): number {
  return new TextEncoder().encode(text).length
}

/** Bytes do registro no corpo da requisição: o JSON dele escapado como string. */
export function wireBytes(data: string): number {
  return byteLength(JSON.stringify(data))
}
