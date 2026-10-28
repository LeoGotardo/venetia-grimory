import { CLOUD_SYNC_RATE_LIMIT, CLOUD_SYNC_RATE_WINDOW_S } from '../../src/lib/cloud/constants.js'
import { pullRequest, pushRequest, type CloudErrorCode } from '../../src/lib/cloud/protocol.js'
import { CloudFailure, pullRecords, pushRecords, type Sql } from '../_lib/cloud.js'
import { db } from '../_lib/db.js'
import { verifyFirebaseToken } from '../_lib/firebaseAuth.js'
import { RoomFailure, bearerToken, json, preflight, readBody } from '../_lib/http.js'
import { overRateLimit } from '../_lib/redis.js'

/**
 * Sync das fichas e campanhas com a conta (`/api/sync/<ação>`): `pull` traz o
 * que mudou depois de um cursor, `push` grava um lote. O uid vem sempre do ID
 * token do Firebase validado aqui — nunca do corpo.
 */

const STATUS: Record<CloudErrorCode, number> = {
  invalid_request: 400,
  unauthorized: 401,
  quota_exceeded: 413,
  rate_limited: 429,
  server_error: 500,
}

const fail = (code: CloudErrorCode) => json({ error: code }, STATUS[code])

type Handler = (uid: string, request: Request) => Promise<Response>

const ACTIONS: Record<string, Handler> = {
  pull: async (uid, request) => {
    const { since } = await readBody(request, pullRequest)
    return json(await pullRecords(db() as Sql, uid, since))
  },
  push: async (uid, request) => {
    const { items } = await readBody(request, pushRequest)
    return json(await pushRecords(db() as Sql, uid, items))
  },
}

/** Limite por conta. Redis fora do ar não derruba o sync: o limite é proteção, não regra. */
async function limited(uid: string): Promise<boolean> {
  try {
    return await overRateLimit(`ratelimit:sync:${uid}`, CLOUD_SYNC_RATE_LIMIT, CLOUD_SYNC_RATE_WINDOW_S)
  } catch (err) {
    console.error('[sync] Rate limit indisponível.', err)
    return false
  }
}

export function OPTIONS(): Response {
  return preflight()
}

export async function POST(request: Request): Promise<Response> {
  const action = new URL(request.url).pathname.split('/').pop() ?? ''
  const handler = Object.hasOwn(ACTIONS, action) ? ACTIONS[action] : null
  if (!handler) return fail('invalid_request')
  try {
    const uid = await verifyFirebaseToken(bearerToken(request))
    if (!uid) return fail('unauthorized')
    if (await limited(uid)) return fail('rate_limited')
    return await handler(uid, request)
  } catch (err) {
    if (err instanceof CloudFailure) return fail(err.code)
    // `readBody` lança a falha da sala para corpo inválido.
    if (err instanceof RoomFailure) return fail('invalid_request')
    console.error(`[sync/${action}] Falha inesperada.`, err)
    return fail('server_error')
  }
}
