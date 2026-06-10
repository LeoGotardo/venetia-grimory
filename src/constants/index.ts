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

export const EXAUSTAO_EFEITOS = [
  'Nenhum',
  'Desvantagem em testes de atributo',
  'Velocidade reduzida à metade',
  'Desvantagem em ataques e salvaguardas',
  'Máximo de PV reduzido à metade',
  'Velocidade = 0',
  'Morte',
] as const
