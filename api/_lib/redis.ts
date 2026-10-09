import { Redis } from 'ioredis'
import type { ServerMessage } from '../../src/lib/room/protocol.js'
import { ROOM_PRESENCE_TTL_MS } from '../../src/lib/room/constants.js'

/** Presença some sozinha se a sala ficar um dia sem ninguém. */
const PRESENCE_KEY_TTL_S = 24 * 60 * 60

let commands: Redis | null = null

function redisUrl(): string {
  const url = process.env.REDIS_URL
  if (!url) throw new Error('REDIS_URL não definida.')
  return url
}

/** Conexão para comandos e PUBLISH — reaproveitada entre invocações da mesma instância. */
export function redis(): Redis {
  if (commands) return commands
  commands = new Redis(redisUrl(), { maxRetriesPerRequest: 2 })
  commands.on('error', err => console.error('[redis] Erro na conexão de comandos.', err))
  return commands
}

/** Conexão nova em modo SUBSCRIBE (nesse modo ela não aceita outros comandos). */
export function createSubscriber(): Redis {
  const subscriber = new Redis(redisUrl())
  subscriber.on('error', err => console.error('[redis] Erro na conexão de assinatura.', err))
  return subscriber
}

export const ROOM_CHANNEL_PREFIX = 'room:'
export const roomChannel = (roomId: string) => `${ROOM_CHANNEL_PREFIX}${roomId}`
const presenceKey = (roomId: string) => `presence:${roomId}`

/** Avisa todas as instâncias com sockets na sala. */
export async function publish(roomId: string, message: ServerMessage): Promise<void> {
  await redis().publish(roomChannel(roomId), JSON.stringify(message))
}

/** Janela fixa: `true` se esta chamada passou do limite. */
export async function overRateLimit(key: string, max: number, windowS: number): Promise<boolean> {
  const hits = await redis().incr(key)
  if (hits === 1) await redis().expire(key, windowS)
  return hits > max
}

/** Marca o membro online até `agora + TTL`; o `ping` do cliente renova. Devolve se ele estava offline. */
export async function markOnline(roomId: string, memberId: string): Promise<boolean> {
  const key = presenceKey(roomId)
  const previous = Number(await redis().hget(key, memberId)) || 0
  await redis().hset(key, memberId, String(Date.now() + ROOM_PRESENCE_TTL_MS))
  await redis().expire(key, PRESENCE_KEY_TTL_S)
  return previous < Date.now()
}

export async function markOffline(roomId: string, memberId: string): Promise<void> {
  await redis().hdel(presenceKey(roomId), memberId)
}

export async function onlineMembers(roomId: string): Promise<string[]> {
  const entries = await redis().hgetall(presenceKey(roomId))
  const now = Date.now()
  return Object.entries(entries).filter(([, until]) => Number(until) > now).map(([memberId]) => memberId)
}
