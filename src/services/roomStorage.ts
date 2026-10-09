import { z } from 'zod'
import { STORAGE_KEY_ROOMS } from '../constants'
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

export function writeMemberships(memberships: RoomMembership[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ROOMS, JSON.stringify(memberships))
  } catch (err) {
    console.error('[salas] Falha ao gravar a lista de salas.', err)
  }
}
