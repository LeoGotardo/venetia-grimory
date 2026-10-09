import { useSyncExternalStore } from 'react'
import { isRoomSyncEnabled, subscribeRoomSync } from '../services/roomSyncGate'

export function useRoomSyncEnabled(): boolean {
  return useSyncExternalStore(subscribeRoomSync, isRoomSyncEnabled, () => false)
}
