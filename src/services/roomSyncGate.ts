import { STORAGE_KEY_ROOMS } from '../constants'

/**
 * Liga a ponte da sala (`RoomSyncBridge`) só para quem usa salas: o código
 * dela (stores da mesa, zod) fica fora do carregamento de quem nunca entrou numa.
 * Começa ligada se o aparelho já guarda alguma sala; `enableRoomSync` liga ao entrar.
 */

const listeners = new Set<() => void>()
let enabled = hasStoredRooms()

function hasStoredRooms(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ROOMS)
    return raw != null && raw !== '[]'
  } catch (err) {
    console.error('[salas] Falha ao ler as salas salvas.', err)
    return false
  }
}

export function enableRoomSync(): void {
  if (enabled) return
  enabled = true
  for (const listener of listeners) listener()
}

export function subscribeRoomSync(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const isRoomSyncEnabled = () => enabled
