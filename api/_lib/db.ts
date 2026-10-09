import { neon, type NeonQueryFunction } from '@neondatabase/serverless'

let client: NeonQueryFunction<false, false> | null = null

/**
 * Cliente HTTP da Neon, criado na primeira consulta — não no carregamento do
 * módulo, para uma variável ausente virar erro da requisição e não da função inteira.
 */
export function db(): NeonQueryFunction<false, false> {
  if (client) return client
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL não definida.')
  client = neon(url)
  return client
}

/** Violação de `unique` (código 23505 do Postgres) — o código da sala colidiu. */
export function isUniqueViolation(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { code?: unknown }).code === '23505'
}

/** O driver devolve `timestamptz` como `Date` ou texto, conforme a configuração: sempre ISO. */
export function toIso(value: unknown): string {
  return new Date(value as string | Date).toISOString()
}
