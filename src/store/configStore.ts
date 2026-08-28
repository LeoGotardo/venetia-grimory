import { persist } from 'zustand/middleware'
import { create } from 'zustand'
import { translateLegacyPtConfig } from '../lib/migrateLegacyPt'

export interface Config {
  track_weight: boolean
  manage_gold: boolean
  sale_refund: boolean
  simple_coins: boolean
  language: string
}

interface ConfigStore {
  config: Config
  setConfig: (partial: Partial<Config>) => void
}

const DEFAULT_CONFIG: Config = {
  track_weight: true,
  manage_gold: true,
  sale_refund: true,
  simple_coins: false,
  language: 'en',
}

export const useConfigStore = create<ConfigStore>()(
  persist(
    set => ({
      config: DEFAULT_CONFIG,
      setConfig: (partial: Partial<Config>) =>
        set((s: ConfigStore) => ({
          config: { ...s.config, ...partial },
        })),
    }),
    {
      name: 'venetia-config',
      // v1: campos renomeados de PT para EN (rastrear_peso → track_weight, …).
      version: 1,
      migrate: (persisted, version) => {
        const state = persisted as { config?: unknown } | undefined
        if (version >= 1) return state as ConfigStore
        return { config: translateLegacyPtConfig(state?.config) } as ConfigStore
      },
      // O merge padrão é raso e trocaria `config` inteiro pelo objeto salvo,
      // perdendo qualquer preferência adicionada depois que ele foi gravado.
      merge: (persisted, current) => ({
        ...current,
        config: { ...DEFAULT_CONFIG, ...(persisted as { config?: Partial<Config> })?.config },
      }),
    }
  )
)
