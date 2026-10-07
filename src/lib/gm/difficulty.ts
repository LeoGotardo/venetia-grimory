import type { Combatant } from '../../types'
import { XP_BUDGET_BY_LEVEL } from '../../constants'
import { crToXp } from './statblock'

export type Difficulty = 'none' | 'low' | 'moderate' | 'high' | 'beyond'

export interface EncounterBudget {
  xp: number
  low: number
  moderate: number
  high: number
  difficulty: Difficulty
}

/** XP de todos os monstros e NPCs com bloco — os derrotados contam: o encontro é o mesmo. */
export function encounterXp(combatants: Combatant[]): number {
  return combatants.reduce((sum, c) => sum + (c.kind !== 'player' && c.statblock ? crToXp(c.statblock.cr) : 0), 0)
}

/**
 * Regra de 2024: soma o orçamento de cada personagem pelo nível e compara com o
 * XP total dos monstros. Acima do Alto fica `beyond` — o livro não dá nome.
 */
export function encounterBudget(levels: number[], xp: number): EncounterBudget {
  const budget = levels.reduce(
    (acc, level) => {
      const row = XP_BUDGET_BY_LEVEL[Math.min(20, Math.max(1, level))]
      return { low: acc.low + row.low, moderate: acc.moderate + row.moderate, high: acc.high + row.high }
    },
    { low: 0, moderate: 0, high: 0 },
  )

  let difficulty: Difficulty = 'none'
  if (xp > 0 && levels.length > 0) {
    if (xp <= budget.low) difficulty = 'low'
    else if (xp <= budget.moderate) difficulty = 'moderate'
    else if (xp <= budget.high) difficulty = 'high'
    else difficulty = 'beyond'
  }
  return { xp, ...budget, difficulty }
}
