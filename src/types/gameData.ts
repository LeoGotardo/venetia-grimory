export type AbilityId = 'FOR' | 'DES' | 'CON' | 'INT' | 'SAB' | 'CAR'

export interface Skill {
  id: string
  name: string
  ability: AbilityId
}

export interface Subclass {
  id: string
  name: string
  description?: string
}

export interface LevelProgression {
  level: number
  prof_bonus: number
  highlights: string[]
  rages?: number
  rage_damage?: number
  spell_slots?: Record<string, number>
  [key: string]: unknown
}

export interface CharClass {
  id: string
  name: string
  description: string
  appeal: string
  hit_die: number
  primary_abilities: AbilityId[]
  saves: AbilityId[]
  num_skills: number
  available_skills: string[] | 'qualquer'
  weapons: string[]
  armors: string[]
  tools: string[]
  starting_equipment: { A: string; B: string }
  spellcaster: boolean
  spellcasting_ability?: AbilityId
  complexity: 'Baixa' | 'Média' | 'Alta'
  subclasses: Subclass[]
  subclass_level?: number
  progression: LevelProgression[]
  granted_languages?: string[]
}

export interface Trait {
  name: string
  description: string
  max_uses?: number | string
}

export interface Lineage {
  id: string
  name: string
  description?: string
  traits?: Trait[]
}

export interface Species {
  id: string
  name: string
  size: string
  speed: number
  darkvision?: number
  traits: Trait[]
  lineages?: Lineage[]
}

export interface Background {
  id: string
  feat: string
  skills: string[]
  tool?: string
  starting_equipment: string
}

export interface Armor {
  id: string
  name: string
  category: 'Leve' | 'Média' | 'Pesada' | 'Escudo'
  ac: string | number
  str_requirement?: number
  stealth_penalty?: boolean
  cost_gp?: number
  weight_kg?: number
}

export interface Feat {
  id: string
  name: string
  description: string
  prereq?: string
}

export interface FightingStyle {
  id: string
  name: string
  description: string
}

export interface DivineOrder {
  id: string
  name: string
  description: string
  armor_profs: string[]
  weapon_profs: string[]
  skill_prof?: string
}

export interface PrimalOrder {
  id: string
  name: string
  description: string
  armor_profs: string[]
  weapon_profs: string[]
  skill_prof?: string
}

export interface FavoredEnemy {
  id: string
  name: string
}

export interface GameData {
  meta: { font: string; translation: string; version: string }
  skills: Skill[]
  languages: { common: Array<{ id: string; name: string; source: string }>; rare: Array<{ id: string; name: string; source: string }> }
  classes: CharClass[]
  species: Species[]
  backgrounds: Background[]
  suggested_abilities_by_class?: Record<string, AbilityId[]>
  origin_feats?: Feat[]
  general_feats?: Feat[]
  armors: Armor[]
  fighting_styles?: FightingStyle[]
  divine_orders?: DivineOrder[]
  primal_orders?: PrimalOrder[]
  favored_enemies?: FavoredEnemy[]
}
