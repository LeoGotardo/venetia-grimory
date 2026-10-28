import { create } from 'zustand'

/**
 * Estado de execução do sync com a conta (não persiste). O vínculo e as
 * pendências moram em `services/cloudState` — este store é só o que a UI
 * mostra enquanto o app roda. Sem Firebase: quem escreve aqui é `cloudSync`.
 */

export type CloudPhase = 'idle' | 'syncing' | 'offline' | 'error'
/** `permission`: a API recusou a sessão. `quota`: a conta encheu a cota de armazenamento. */
export type CloudError = 'permission' | 'quota' | 'generic'

interface CloudStore {
  phase: CloudPhase
  error: CloudError | null
  /** Vinculado, mas o Firebase não tem mais a sessão: as mudanças esperam um novo login. */
  sessionExpired: boolean
  lastSyncAt: string | null
}

export const useCloudStore = create<CloudStore>(() => ({
  phase: 'idle',
  error: null,
  sessionExpired: false,
  lastSyncAt: null,
}))
