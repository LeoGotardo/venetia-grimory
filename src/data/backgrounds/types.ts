import type { AbilityId } from '../../types/gameData'

export interface Background {
  id: string
  name: string
  description: string
  suggested_abilities: AbilityId[]
  feat: string
  skills: string[]
  tool: string
  starting_equipment: {
    A: string
    B: string
  }
}
