import { z } from 'zod'
import { STORAGE_KEY_ACTIVE_ROOM, STORAGE_KEY_ROOMS } from '../constants'
import { isCloudLinked, recordLocalCollection } from './cloudState'
import { ROOM_ROLES, roomCodeSchema } from '../lib/room/protocol'

/**
 * Participação deste aparelho numa sala. O token é o que prova quem é quem no
 * servidor — perder a participação é ter que entrar de novo pelo código.
 */
const membershipSchema = z.object({
  room_id: z.uuid(),
  code: roomCodeSchema,
  name: z.string(),
  role: z.enum(ROOM_ROLES),
  member_id: z.uuid(),
  display_name: z.string(),
  token: z.string(),
  /** Mestre: a campanha local que a sala espelha. */
  campaign_id: z.string().nullable(),
  /** Player: a ficha local com que entrou. */
  sheet_id: z.string().nullable(),
  /** Mestre: encontro que está sendo transmitido como mesa (persiste no reload). */
  broadcast_encounter_id: z.string().nullable().default(null),
  joined_at: z.string(),
})
export type RoomMembership = z.infer<typeof membershipSchema>

/** Entradas corrompidas ou de um formato antigo são descartadas, não derrubam a lista. */
export function readMemberships(): RoomMembership[] {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY_ROOMS) ?? '[]') as unknown
    if (!Array.isArray(raw)) return []
    return raw.flatMap(item => {
      const parsed = membershipSchema.safeParse(item)
      return parsed.success ? [parsed.data] : []
    })
  } catch (err) {
    console.error('[salas] Lista de salas ilegível no localStorage.', err)
    return []
  }
}

/**
 * Grava a lista e, com conta vinculada, registra cada sala para subir à nuvem.
 * Passa pelo schema antes: a ordem das chaves é a da leitura, então o JSON (e o
 * hash do sync) é o mesmo que `membershipJson` devolve depois.
 */
export function writeMemberships(memberships: RoomMembership[]): void {
  const normalized = memberships.map(m => membershipSchema.parse(m))
  try {
    localStorage.setItem(STORAGE_KEY_ROOMS, JSON.stringify(normalized))
  } catch (err) {
    console.error('[salas] Falha ao gravar a lista de salas.', err)
    return
  }
  if (isCloudLinked()) recordLocalCollection('room', normalized.map(m => [m.room_id, JSON.stringify(m)]))
}

/** JSON de uma sala como sobe para a nuvem (`null` = não está neste aparelho). */
export function membershipJson(roomId: string): string | null {
  const membership = readMemberships().find(m => m.room_id === roomId)
  return membership ? JSON.stringify(membership) : null
}

/** Aplica o que desceu da nuvem: `null` tira a sala; o resto entra se passar no schema. */
export function applyRemoteMemberships(changes: Array<{ id: string; data: string | null }>): RoomMembership[] {
  const byId = new Map(readMemberships().map(m => [m.room_id, m]))
  for (const { id, data } of changes) {
    if (data === null) {
      byId.delete(id)
      continue
    }
    const parsed = membershipSchema.safeParse(JSON.parse(data))
    if (parsed.success) byId.set(id, parsed.data)
    else console.error(`[salas] Sala ${id} da nuvem fora do formato; ignorada.`, parsed.error)
  }
  const next = [...byId.values()]
  writeMemberships(next)
  return next
}

/** Última sala conectada neste aparelho: é a que o app religa ao abrir. */
export function rememberActiveRoom(roomId: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_ROOM, roomId)
  } catch (err) {
    console.error('[salas] Falha ao gravar a sala ativa.', err)
  }
}

/** Sala que o app liga sozinho ao abrir: a última usada, senão a mais recente em que entrou. */
export function preferredRoom(memberships: RoomMembership[], lastActive: string | null = readActiveRoom()): string | null {
  if (lastActive && memberships.some(m => m.room_id === lastActive)) return lastActive
  return memberships.reduce<RoomMembership | null>((best, m) => (!best || m.joined_at > best.joined_at ? m : best), null)?.room_id ?? null
}

function readActiveRoom(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY_ACTIVE_ROOM)
  } catch {
    return null
  }
}

/** Página da sala: a do player (`/sala/:code`) ou a da campanha, para o mestre. */
export function roomPagePath(membership: Pick<RoomMembership, 'role' | 'code' | 'campaign_id'>): string | null {
  if (membership.role === 'player') return `/sala/${membership.code}`
  return membership.campaign_id ? `/mestre/campanha/${membership.campaign_id}/sala` : null
}
