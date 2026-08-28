export const POINT_BUY_POOL = 27
export const BACKGROUND_ABILITY_POINTS_TOTAL = 3
export const SUBCLASS_LEVEL = 3
export const MIN_LEVEL = 1
export const MAX_LEVEL = 20
export const POINT_BUY_ABILITY_MIN = 8
export const POINT_BUY_ABILITY_MAX = 15
export const SHIELD_BONUS = 2
export const MAX_EXHAUSTION = 6
export const DEBOUNCE_SAVE_MS = 500
export const INITIAL_FREE_LANGUAGES = 2

export const STORAGE_KEY_LIST = 'dnd_fichas_lista'
export const STORAGE_KEY_SHEET_PREFIX = 'dnd_ficha_'

export const FIXED_LANGUAGES_BY_CLASS: Record<string, string[]> = {
  druida: ['druidico'],
  ladino: ['giria_dos_ladroes'],
}

export const POINT_BUY_COSTS: Record<number, number> = {
  8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9,
}

export const STANDARD_ARRAY_VALUES = [15, 14, 13, 12, 10, 8] as const

export const AVAILABLE_CONDITIONS = [
  'Amedrontado', 'Cego', 'Caído', 'Contido', 'Enfeitiçado',
  'Ensurdecido', 'Envenenado', 'Exausto', 'Imobilizado', 'Incapacitado',
  'Inconsciente', 'Invisível', 'Paralisado', 'Petrificado', 'Surpreendido',
] as const

import type { AbilityId } from '../types'

export const MULTICLASS_PREREQUISITES: Record<string, { abilities: AbilityId[]; mode: 'e' | 'ou' }> = {
  barbaro:    { abilities: ['FOR'],        mode: 'e'  },
  bardo:      { abilities: ['CAR'],        mode: 'e'  },
  bruxo:      { abilities: ['CAR'],        mode: 'e'  },
  clerigo:    { abilities: ['SAB'],        mode: 'e'  },
  druida:     { abilities: ['SAB'],        mode: 'e'  },
  feiticeiro: { abilities: ['CAR'],        mode: 'e'  },
  guardiao:   { abilities: ['DES', 'SAB'], mode: 'e'  },
  guerreiro:  { abilities: ['FOR', 'DES'], mode: 'ou' },
  ladino:     { abilities: ['DES'],        mode: 'e'  },
  mago:       { abilities: ['INT'],        mode: 'e'  },
  monge:      { abilities: ['DES', 'SAB'], mode: 'e'  },
  paladino:   { abilities: ['FOR', 'CAR'], mode: 'e'  },
}

export const CASTER_TYPE: Record<string, 'completo' | 'meio' | null> = {
  bardo: 'completo', clerigo: 'completo', druida: 'completo',
  feiticeiro: 'completo', mago: 'completo', bruxo: 'completo',
  paladino: 'meio', guardiao: 'meio',
  barbaro: null, guerreiro: null, ladino: null, monge: null,
}

export const THIRD_CASTER_SUBCLASSES = ['cavaleiro_mistico', 'trapaceiro_arcano']

export const MULTICLASS_PROFICIENCIES: Record<string, { armors?: string[]; weapons?: string[]; tools?: string[] }> = {
  barbaro:    { weapons: ['Marciais'], armors: ['Escudo'] },
  bardo:      { armors: ['Leve'] },
  bruxo:      { armors: ['Leve'] },
  clerigo:    { armors: ['Leve', 'Média', 'Escudo'] },
  druida:     { armors: ['Leve', 'Escudo'] },
  feiticeiro: {},
  guardiao:   { armors: ['Leve', 'Média', 'Escudo'], weapons: ['Simples', 'Marciais'] },
  guerreiro:  { armors: ['Leve', 'Média', 'Pesada', 'Escudo'], weapons: ['Simples', 'Marciais'] },
  ladino:     { armors: ['Leve'] },
  mago:       {},
  monge:      {},
  paladino:   { armors: ['Leve', 'Média', 'Pesada', 'Escudo'], weapons: ['Simples', 'Marciais'] },
}

export const EXHAUSTION_EFFECTS = [
  'Nenhum',
  'Desvantagem em testes de atributo',
  'Velocidade reduzida à metade',
  'Desvantagem em ataques e salvaguardas',
  'Máximo de PV reduzido à metade',
  'Velocidade = 0',
  'Morte',
] as const
