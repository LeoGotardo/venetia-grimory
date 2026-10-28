import { useSyncExternalStore } from 'react'
import { getCloudSnapshot, subscribeCloudState, type CloudSnapshot } from '../services/cloudState'

/** Conta vinculada e pendências do sync — sem carregar o Firebase. */
export function useCloudAccount(): CloudSnapshot {
  return useSyncExternalStore(subscribeCloudState, getCloudSnapshot, getCloudSnapshot)
}
