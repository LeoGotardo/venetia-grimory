import type { RoomSession } from './protocol.js'

export interface PlannedReminder {
  /** Id inteiro do Android, estável por sessão (reagendar substitui em vez de duplicar). */
  id: number
  at: Date
  session: RoomSession
}

/** Hash de 31 bits (FNV-1a): o id da notificação precisa ser um inteiro positivo de Java. */
export function reminderId(sessionId: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < sessionId.length; i++) {
    hash ^= sessionId.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0) & 0x7fffffff
}

/**
 * Lembretes a agendar: `leadMs` antes de cada sessão futura. Sessão que começa
 * antes do lembrete caber (marcada em cima da hora) não ganha aviso atrasado.
 */
export function planReminders(sessions: RoomSession[], leadMs: number, now: number): PlannedReminder[] {
  return sessions.flatMap(session => {
    const at = Date.parse(session.starts_at) - leadMs
    return at > now ? [{ id: reminderId(session.id), at: new Date(at), session }] : []
  })
}

/** Próximas sessões, da mais próxima à mais distante; a que já começou há pouco (`graceMs`) ainda conta. */
export function upcomingSessions(sessions: RoomSession[], now: number, graceMs = 0): RoomSession[] {
  return sessions
    .filter(s => Date.parse(s.starts_at) + graceMs > now)
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at))
}
