import { useEffect } from 'react'
import { startCloudSync } from '../../services/cloudSync'

/** Liga o sync com a conta em qualquer tela; montado sob demanda só quando há conta vinculada. */
export function CloudSyncBridge() {
  useEffect(() => { startCloudSync() }, [])
  return null
}
