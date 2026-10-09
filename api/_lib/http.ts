import type { z } from 'zod'
import type { RoomError } from '../../src/lib/room/protocol.js'

/**
 * A API autentica por token no cabeçalho, sem cookie: não há credencial
 * ambiente para um site alheio aproveitar, então o CORS pode ser aberto — e
 * precisa aceitar o app Android (`https://localhost`) e os previews.
 */
const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-allow-headers': 'authorization, content-type',
  'access-control-max-age': '86400',
}

const STATUS_BY_ERROR: Record<RoomError, number> = {
  invalid_request: 400,
  unauthorized: 401,
  forbidden: 403,
  kicked: 403,
  room_not_found: 404,
  room_full: 409,
  room_closed: 410,
  rate_limited: 429,
  server_error: 500,
}

/** Falha esperada (dado inválido, sala fechada…): vira `{ error }` com o status certo. */
export class RoomFailure extends Error {
  readonly code: RoomError

  constructor(code: RoomError) {
    super(code)
    this.code = code
  }
}

export function json(data: unknown, status = 200): Response {
  return Response.json(data, { status, headers: { ...CORS_HEADERS, 'cache-control': 'no-store' } })
}

export function fail(code: RoomError): Response {
  return json({ error: code }, STATUS_BY_ERROR[code])
}

export function preflight(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export function bearerToken(request: Request): string | null {
  const header = request.headers.get('authorization') ?? ''
  return header.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() || null : null
}

/** IP de quem chamou, para o rate limit. Atrás da Vercel, o primeiro de `x-forwarded-for`. */
export function clientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'
}

/** Corpo validado pelo schema; lança `invalid_request` se não for JSON ou não bater. */
export async function readBody<T>(request: Request, schema: z.ZodType<T>): Promise<T> {
  let data: unknown
  try {
    data = await request.json()
  } catch {
    throw new RoomFailure('invalid_request')
  }
  const parsed = schema.safeParse(data)
  if (!parsed.success) throw new RoomFailure('invalid_request')
  return parsed.data
}
