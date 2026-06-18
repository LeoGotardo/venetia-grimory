export const POOL_PONTOS_COMPRA = 27
export const TOTAL_PONTOS_ATRIBUTO_ANTECEDENTE = 3
export const NIVEL_SUBCLASSE = 3
export const NIVEL_MINIMO = 1
export const NIVEL_MAXIMO = 20
export const ATRIBUTO_MINIMO_COMPRA = 8
export const ATRIBUTO_MAXIMO_COMPRA = 15
export const BONUS_ESCUDO = 2
export const MAXIMO_EXAUSTAO = 6
export const DEBOUNCE_SAVE_MS = 500
export const IDIOMAS_LIVRES_INICIAIS = 2

export const STORAGE_KEY_LISTA = 'dnd_fichas_lista'
export const STORAGE_KEY_FICHA_PREFIX = 'dnd_ficha_'

export const IDIOMAS_FIXOS_POR_CLASSE: Record<string, string[]> = {
  druida: ['druidico'],
  ladino: ['giria_dos_ladroes'],
}

export const CUSTO_PONTOS_COMPRA: Record<number, number> = {
  8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9,
}

export const CONJUNTO_PADRAO_VALORES = [15, 14, 13, 12, 10, 8] as const

export const CONDICOES_DISPONIVEIS = [
  'Amedrontado', 'Cego', 'Caído', 'Contido', 'Enfeitiçado',
  'Ensurdecido', 'Envenenado', 'Exausto', 'Imobilizado', 'Incapacitado',
  'Inconsciente', 'Invisível', 'Paralisado', 'Petrificado', 'Surpreendido',
] as const

import type { AtributoId } from '../types'

export const MULTICLASSE_PREREQUISITOS: Record<string, { atributos: AtributoId[]; modo: 'e' | 'ou' }> = {
  barbaro:    { atributos: ['FOR'],        modo: 'e'  },
  bardo:      { atributos: ['CAR'],        modo: 'e'  },
  bruxo:      { atributos: ['CAR'],        modo: 'e'  },
  clerigo:    { atributos: ['SAB'],        modo: 'e'  },
  druida:     { atributos: ['SAB'],        modo: 'e'  },
  feiticeiro: { atributos: ['CAR'],        modo: 'e'  },
  guardiao:   { atributos: ['DES', 'SAB'], modo: 'e'  },
  guerreiro:  { atributos: ['FOR', 'DES'], modo: 'ou' },
  ladino:     { atributos: ['DES'],        modo: 'e'  },
  mago:       { atributos: ['INT'],        modo: 'e'  },
  monge:      { atributos: ['DES', 'SAB'], modo: 'e'  },
  paladino:   { atributos: ['FOR', 'CAR'], modo: 'e'  },
}

export const TIPO_CONJURADOR: Record<string, 'completo' | 'meio' | null> = {
  bardo: 'completo', clerigo: 'completo', druida: 'completo',
  feiticeiro: 'completo', mago: 'completo', bruxo: 'completo',
  paladino: 'meio', guardiao: 'meio',
  barbaro: null, guerreiro: null, ladino: null, monge: null,
}

export const SUBCLASSES_TERCEIRO_CONJURADOR = ['cavaleiro_mistico', 'trapaceiro_arcano']

export const PROFICIENCIAS_MULTICLASSE: Record<string, { armaduras?: string[]; armas?: string[]; ferramentas?: string[] }> = {
  barbaro:    { armas: ['Marciais'], armaduras: ['Escudo'] },
  bardo:      { armaduras: ['Leve'] },
  bruxo:      { armaduras: ['Leve'] },
  clerigo:    { armaduras: ['Leve', 'Média', 'Escudo'] },
  druida:     { armaduras: ['Leve', 'Escudo'] },
  feiticeiro: {},
  guardiao:   { armaduras: ['Leve', 'Média', 'Escudo'], armas: ['Simples', 'Marciais'] },
  guerreiro:  { armaduras: ['Leve', 'Média', 'Pesada', 'Escudo'], armas: ['Simples', 'Marciais'] },
  ladino:     { armaduras: ['Leve'] },
  mago:       {},
  monge:      {},
  paladino:   { armaduras: ['Leve', 'Média', 'Pesada', 'Escudo'], armas: ['Simples', 'Marciais'] },
}

export const EXAUSTAO_EFEITOS = [
  'Nenhum',
  'Desvantagem em testes de atributo',
  'Velocidade reduzida à metade',
  'Desvantagem em ataques e salvaguardas',
  'Máximo de PV reduzido à metade',
  'Velocidade = 0',
  'Morte',
] as const
