/**
 * Ponte mínima entre a ficha e a sala: a ponte da sala (carregada só para quem
 * usa salas) publica aqui quem pode rolar, e a ficha lê sem importar o store
 * da sala nem o zod. `null` = nenhuma ficha conectada a uma sala agora.
 */
export interface RoomRoller {
  /** Ficha local com que o player está na sala. */
  sheetId: string
  /** Rola no servidor e manda ao log; devolve se mandou. */
  roll: (expression: string, label: string) => boolean
}

const listeners = new Set<() => void>()
let current: RoomRoller | null = null

export function setRoomRoller(next: RoomRoller | null): void {
  if (current === next) return
  current = next
  for (const listener of listeners) listener()
}

export function subscribeRoomRoller(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const getRoomRoller = () => current
