import type { z } from 'zod'
import { ROOM_API_URL_APP, ROOM_HTTP_TIMEOUT_MS } from '../constants'
import { isApp } from '../lib/platform'
import {
  roomErrorResponse, roomJoinedResponse, roomOkResponse, type RoomError, type RoomJoined,
} from '../lib/room/protocol'

/** Falha da API da sala: `code` vira a mensagem em `room.errors.<code>`; `network` = sem servidor. */
export class RoomApiError extends Error {
  readonly code: RoomError | 'network'

  constructor(code: RoomError | 'network') {
    super(code)
    this.code = code
  }
}

/**
 * Onde a API está. Na web é a mesma origem; no app Android (servido em
 * `https://localhost`) é o domínio de produção, a não ser que o build diga outro.
 */
export function roomApiBase(): string {
  const configured = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '')
  if (configured) return configured
  return isApp() ? ROOM_API_URL_APP : ''
}

export function roomSocketUrl(): string {
  const base = roomApiBase() || window.location.origin
  return `${base.replace(/^http/, 'ws')}/api/room-ws`
}

async function call<T>(action: string, body: unknown, schema: z.ZodType<T>, token?: string): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${roomApiBase()}/api/rooms/${action}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(ROOM_HTTP_TIMEOUT_MS),
    })
  } catch (err) {
    console.error(`[salas] ${action}: sem resposta do servidor.`, err)
    throw new RoomApiError('network')
  }

  const data: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const failure = roomErrorResponse.safeParse(data)
    if (!failure.success) console.error(`[salas] ${action}: HTTP ${response.status} sem código de erro.`)
    throw new RoomApiError(failure.success ? failure.data.error : 'server_error')
  }
  const parsed = schema.safeParse(data)
  if (!parsed.success) {
    console.error(`[salas] ${action}: resposta fora do contrato.`, parsed.error)
    throw new RoomApiError('server_error')
  }
  return parsed.data
}

export const roomApi = {
  create: (body: { name: string; campaign_id: string; display_name: string }): Promise<RoomJoined> =>
    call('create', body, roomJoinedResponse),
  join: (body: { code: string; display_name: string }): Promise<RoomJoined> => call('join', body, roomJoinedResponse),
  close: (token: string) => call('close', {}, roomOkResponse, token),
  kick: (token: string, memberId: string) => call('kick', { member_id: memberId }, roomOkResponse, token),
  leave: (token: string) => call('leave', {}, roomOkResponse, token),
}
