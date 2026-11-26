import { create } from 'zustand'

/**
 * Dados físicos: quando o player rola na mesa de verdade, cada envio (rolagem,
 * ataque, dano, cura) pergunta antes quanto saiu. Um pedido por vez; o modal
 * (`PhysicalDiceModal`, montado uma vez na ponte da sala) responde.
 */

export interface DiceEntryGroup {
  /** `roll` | `attack` | `damage` | `heal` — rótulo no modal e chave da resposta. */
  key: 'roll' | 'attack' | 'damage' | 'heal'
  expression: string
  /** Dano de ataque: os dados dobram quando o d20 do grupo `attack` sai 20. */
  critFrom?: 'attack'
}

export interface DiceEntryRequest {
  title: string
  groups: DiceEntryGroup[]
}

/** Subtotais por grupo; `'app'` = rolar no app desta vez; `null` = desistiu (nada é enviado). */
export type DiceEntryAnswer = Partial<Record<DiceEntryGroup['key'], number[]>> | 'app' | null

interface DiceEntryState {
  request: DiceEntryRequest | null
  ask: (request: DiceEntryRequest) => Promise<DiceEntryAnswer>
  answer: (answer: DiceEntryAnswer) => void
}

let resolver: ((answer: DiceEntryAnswer) => void) | null = null

export const useDiceEntryStore = create<DiceEntryState>(set => ({
  request: null,
  ask: request => new Promise(resolve => {
    // Um pedido novo cancela o que estava aberto.
    resolver?.(null)
    resolver = resolve
    set({ request })
  }),
  answer: answer => {
    const resolve = resolver
    resolver = null
    set({ request: null })
    resolve?.(answer)
  },
}))
