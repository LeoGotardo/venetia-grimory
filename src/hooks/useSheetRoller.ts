import { useSyncExternalStore } from 'react'
import { getRoomRoller, subscribeRoomRoller } from '../services/roomRoller'

/** Função de rolar na sala, se a ficha `sheetId` estiver numa sala conectada agora. */
export function useSheetRoller(sheetId: string | null): ((expression: string, label: string) => boolean) | null {
  const roller = useSyncExternalStore(subscribeRoomRoller, getRoomRoller, () => null)
  return roller && sheetId && roller.sheetId === sheetId ? roller.roll : null
}
