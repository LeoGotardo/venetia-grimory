import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Config {
  rastrear_peso: boolean
  gerenciar_ouro: boolean
  reembolso_venda: boolean
  moedas_simples: boolean
}

interface ConfigStore {
  config: Config
  setConfig: (partial: Partial<Config>) => void
}

export const useConfigStore = create<ConfigStore>()(
  persist(
    set => ({
      config: {
        rastrear_peso: true,
        gerenciar_ouro: true,
        reembolso_venda: true,
        moedas_simples: false,
      },
      setConfig: partial => set(s => ({ config: { ...s.config, ...partial } })),
    }),
    { name: 'venetia-config' }
  )
)
