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
/** Marca do JSON exportado — distingue o envelope de uma ficha crua (exports antigos). */
export const SHEET_EXPORT_FORMAT = 'venetia-sheet'
export const SHEET_EXPORT_VERSION = 1

/** Área do mestre — chaves em português, como as das fichas. */
export const STORAGE_KEY_CAMPAIGN_LIST = 'dnd_mestre_campanhas'
export const STORAGE_KEY_CAMPAIGN_PREFIX = 'dnd_mestre_campanha_'
export const CAMPAIGN_EXPORT_FORMAT = 'venetia-campaign'
export const CAMPAIGN_EXPORT_VERSION = 1
export const STORAGE_KEY_BESTIARY = 'dnd_mestre_bestiario'
export const MONSTER_PACK_FORMAT = 'venetia-monsters'
export const MONSTER_PACK_VERSION = 1

/** Tamanhos e tipos de criatura (2024). Rótulos em `gm.size.*` / `gm.creatureType.*`. */
export const CREATURE_SIZES = ['tiny', 'small', 'medium', 'large', 'huge', 'gargantuan'] as const
export const CREATURE_TYPES = [
  'aberration', 'beast', 'celestial', 'construct', 'dragon', 'elemental', 'fey',
  'fiend', 'giant', 'humanoid', 'monstrosity', 'ooze', 'plant', 'undead',
] as const

/** Nível de Desafio → XP (tabela do Livro dos Monstros / SRD 5.2). */
export const CR_XP: Record<string, number> = {
  '0': 10, '1/8': 25, '1/4': 50, '1/2': 100,
  '1': 200, '2': 450, '3': 700, '4': 1100, '5': 1800, '6': 2300, '7': 2900, '8': 3900,
  '9': 5000, '10': 5900, '11': 7200, '12': 8400, '13': 10000, '14': 11500, '15': 13000,
  '16': 15000, '17': 18000, '18': 20000, '19': 22000, '20': 25000, '21': 33000, '22': 41000,
  '23': 50000, '24': 62000, '25': 75000, '26': 90000, '27': 105000, '28': 120000,
  '29': 135000, '30': 155000,
}
/**
 * Orçamento de XP por personagem, por nível (Livro do Mestre 2024): dificuldade
 * Baixa, Moderada e Alta. O encontro soma o XP de todos os monstros, sem multiplicador.
 */
export const XP_BUDGET_BY_LEVEL: Record<number, { low: number; moderate: number; high: number }> = {
  1: { low: 50, moderate: 75, high: 100 },
  2: { low: 100, moderate: 150, high: 200 },
  3: { low: 150, moderate: 225, high: 400 },
  4: { low: 250, moderate: 375, high: 500 },
  5: { low: 500, moderate: 750, high: 1100 },
  6: { low: 600, moderate: 1000, high: 1400 },
  7: { low: 750, moderate: 1300, high: 1700 },
  8: { low: 1000, moderate: 1700, high: 2100 },
  9: { low: 1300, moderate: 2000, high: 2600 },
  10: { low: 1600, moderate: 2300, high: 3100 },
  11: { low: 1900, moderate: 2900, high: 4100 },
  12: { low: 2200, moderate: 3700, high: 4700 },
  13: { low: 2600, moderate: 4200, high: 5400 },
  14: { low: 2900, moderate: 4900, high: 6200 },
  15: { low: 3300, moderate: 5400, high: 7800 },
  16: { low: 3800, moderate: 6100, high: 9800 },
  17: { low: 4500, moderate: 7200, high: 11700 },
  18: { low: 5000, moderate: 8700, high: 14200 },
  19: { low: 5500, moderate: 10700, high: 17200 },
  20: { low: 6400, moderate: 13200, high: 22000 },
}

/** Condição que a regra aplica a quem cai a 0 PV (nome canônico). */
export const CONDITION_UNCONSCIOUS = 'Inconsciente'
export const CONCENTRATION_DC_MIN = 10
/** Registros guardados por encontro — o resto cai fora para o save não crescer sem fim. */
export const MAX_ENCOUNTER_LOG = 200
export const CONCENTRATION_DC_MAX = 30

/**
 * Terrenos da grade do mapa. `code` é o caractere salvo por célula em
 * `GridMap.cells` — não mude um código existente, ele está nos mapas salvos.
 * `cost` é o multiplicador de movimento (2 = terreno difícil); `null` bloqueia.
 */
export const TERRAINS = [
  { code: '0', id: 'void', cost: null },
  { code: '.', id: 'floor', cost: 1 },
  { code: 'd', id: 'difficult', cost: 2 },
  { code: 'v', id: 'vegetation', cost: 2 },
  { code: 'w', id: 'water', cost: 2 },
  { code: 's', id: 'stairs', cost: 1 },
  { code: '+', id: 'door', cost: 1 },
  { code: 'h', id: 'hazard', cost: 1 },
  { code: 'p', id: 'pit', cost: null },
  { code: '#', id: 'wall', cost: null },
] as const
export const TERRAIN_VOID = '0'
export const TERRAIN_FLOOR = '.'
/** Uma casa da grade: 1,5 m (5 pés), diagonal inclusive — regra de 2024. */
export const GRID_CELL_METERS = 1.5
export const MAP_MIN_SIZE = 5
export const MAP_MAX_SIZE = 100
export const MAP_DEFAULT_WIDTH = 30
export const MAP_DEFAULT_HEIGHT = 20
export const MAP_UNDO_LIMIT = 50
/** Casas ocupadas por lado, por tamanho de criatura. */
export const CREATURE_SIZE_SQUARES: Record<string, number> = {
  tiny: 1, small: 1, medium: 1, large: 2, huge: 3, gargantuan: 4,
}
/** Deslocamento quando a ficha não informa (o padrão das espécies de 2024). */
export const DEFAULT_SPEED_METERS = 9
export const FOG_REVEALED = '1'
export const FOG_HIDDEN = '0'

/** Na ordem crescente — é a ordem do seletor de ND. */
export const CHALLENGE_RATINGS = Object.keys(CR_XP)

export const FIXED_LANGUAGES_BY_CLASS: Record<string, string[]> = {
  druida: ['druidico'],
  ladino: ['giria_dos_ladroes'],
}

export const POINT_BUY_COSTS: Record<number, number> = {
  8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9,
}

export const STANDARD_ARRAY_VALUES = [15, 14, 13, 12, 10, 8] as const

export const AVAILABLE_CONDITIONS = [
  'Amedrontado', 'Atordoado', 'Cego', 'Caído', 'Contido', 'Enfeitiçado',
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

/**
 * Como cada classe conjura (PHB 2024):
 * - `completo`: nível inteiro na tabela de multiclasse;
 * - `meio`: metade do nível, arredondada para CIMA (paladino e guardião ganham
 *   Conjuração no nível 1 na edição de 2024);
 * - `pacto`: Magia de Pacto do bruxo — NÃO entra na tabela de multiclasse, tem
 *   reserva própria (`spellcasting.pact_slots`) recuperada em Descanso Curto;
 * - `null`: não conjura pela classe (subclasses de 1/3 são tratadas à parte, em
 *   THIRD_CASTER_SUBCLASSES).
 */
export const CASTER_TYPE: Record<string, 'completo' | 'meio' | 'pacto' | null> = {
  bardo: 'completo', clerigo: 'completo', druida: 'completo',
  feiticeiro: 'completo', mago: 'completo',
  bruxo: 'pacto',
  paladino: 'meio', guardiao: 'meio',
  barbaro: null, guerreiro: null, ladino: null, monge: null,
}

export const THIRD_CASTER_SUBCLASSES = ['cavaleiro_mistico', 'trapaceiro_arcano']

/** Listas que o talento Iniciado em Magia pode abrir — ids de classe, como em `Spell.classes`. */
export const MAGIC_INITIATE_LISTS = ['clerigo', 'druida', 'mago'] as const

/**
 * Nome da lista (como vem no talento e nos antecedentes, nos dois idiomas) → id da
 * classe. A chave é comparada sem acento e em minúsculas.
 */
export const MAGIC_INITIATE_LIST_BY_NAME: Record<string, string> = {
  clerigo: 'clerigo', cleric: 'clerigo',
  druida: 'druida', druid: 'druida',
  mago: 'mago', wizard: 'mago',
}

/** Arcana Mística: nível de bruxo → círculo da magia concedida (PHB 2024). */
export const MYSTIC_ARCANUM_BY_LEVEL: Record<number, number> = {
  11: 6, 13: 7, 15: 8, 17: 9,
}

/** Atributos que o Iniciado em Magia pode usar para conjurar. */
export const MAGIC_INITIATE_ABILITIES = ['INT', 'SAB', 'CAR'] as const

/**
 * Espécies que concedem um Talento de Origem à escolha (Humano, traço "Versátil").
 * É o único jeito, pelas regras de 2024, de ganhar um talento de Origem fora do
 * antecedente: o AVA de nível 4 concede talento GERAL, não de Origem.
 */
export const SPECIES_WITH_ORIGIN_FEAT = ['humano']

/** Marca de origem dos talentos concedidos pela espécie, em `AcquiredFeat.source`. */
export const FEAT_SOURCE_SPECIES = 'especie'

/** Marca dos talentos adicionados à mão na aba Editar. */
export const FEAT_SOURCE_MANUAL = 'manual'

/**
 * Itens mágicos cujo uso devolve um espaço de Magia de Pacto (Bastão do Guardião
 * do Pacto). Gastar o uso do item restaura o espaço na mesma ação.
 */
export const ITEMS_RESTORING_PACT_SLOT = ['rod_of_the_pact_keeper']

/**
 * Itens que devolvem um espaço de Conjuração gasto, mapeados para o círculo mais
 * alto que alcançam (Pérola do Poder: "um espaço de até 3º círculo"). Diferente do
 * Bastão do Guardião do Pacto, exigem escolher de qual círculo — daí o parâmetro
 * de `spendItemUse`.
 */
export const ITEMS_RESTORING_SPELL_SLOT: Record<string, number> = {
  pearl_of_power: 3,
}

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

// Crédito do autor exibido no rodapé da Home
export const AUTHOR_NAME = 'Leo Gotardo'
export const AUTHOR_URL = 'https://leogotardo.vercel.app/'

// Formulário de bugs e sugestões, também linkado no rodapé da Home
export const FEEDBACK_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSf3qvBBaJqDrYXhJqQxOm4mHK8uTZX_YpNpk_lgUYa2ptZpVQ/viewform'

// Atualização do app Android pelo GitHub Releases (src/lib/appUpdate.ts)
export const GITHUB_REPO = 'LeoGotardo/venetia-grimory'
export const LATEST_RELEASE_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`
export const UPDATE_CHECK_TIMEOUT_MS = 8000
