import { createRoomRequest, joinRoomRequest, kickRequest } from '../../src/lib/room/protocol.js'
import { ROOM_JOIN_RATE_LIMIT, ROOM_JOIN_RATE_WINDOW_S } from '../../src/lib/room/constants.js'
import { RoomFailure, bearerToken, clientIp, fail, json, preflight, readBody } from '../_lib/http.js'
import { overRateLimit } from '../_lib/redis.js'
import { closeRoom, createRoom, joinRoom, kickMember, leaveRoom, requireMember } from '../_lib/rooms.js'

/**
 * Ciclo de vida da sala, numa função só (`/api/rooms/<ação>`): criar, entrar,
 * fechar, remover player e sair. O que acontece durante a sessão vai pelo
 * WebSocket (`/api/room-ws`).
 */

type Handler = (request: Request) => Promise<Response>

/** Criar e entrar dividem o limite por IP: os dois aceitam quem não tem token. */
async function limitByIp(request: Request): Promise<void> {
  const limited = await overRateLimit(`ratelimit:rooms:${clientIp(request)}`, ROOM_JOIN_RATE_LIMIT, ROOM_JOIN_RATE_WINDOW_S)
  if (limited) throw new RoomFailure('rate_limited')
}

const ACTIONS: Record<string, Handler> = {
  create: async request => {
    await limitByIp(request)
    return json(await createRoom(await readBody(request, createRoomRequest)))
  },
  join: async request => {
    await limitByIp(request)
    return json(await joinRoom(await readBody(request, joinRoomRequest)))
  },
  close: async request => {
    await closeRoom(await requireMember(bearerToken(request)))
    return json({ ok: true })
  },
  kick: async request => {
    const gm = await requireMember(bearerToken(request))
    const { member_id } = await readBody(request, kickRequest)
    await kickMember(gm, member_id)
    return json({ ok: true })
  },
  leave: async request => {
    await leaveRoom(await requireMember(bearerToken(request)))
    return json({ ok: true })
  },
}

export function OPTIONS(): Response {
  return preflight()
}

export async function POST(request: Request): Promise<Response> {
  const action = new URL(request.url).pathname.split('/').pop() ?? ''
  const handler = Object.hasOwn(ACTIONS, action) ? ACTIONS[action] : null
  if (!handler) return fail('invalid_request')
  try {
    return await handler(request)
  } catch (err) {
    if (err instanceof RoomFailure) return fail(err.code)
    console.error(`[rooms/${action}] Falha inesperada.`, err)
    return fail('server_error')
  }
}
