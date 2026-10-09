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
/** Assets favoritos do editor de mapa de área (`stamp:oak`, `icon:city`) — preferência do aparelho. */
export const STORAGE_KEY_AREA_FAVORITES = 'dnd_mestre_mapa_favoritos'
export const MONSTER_PACK_FORMAT = 'venetia-monsters'
export const MONSTER_PACK_VERSION = 1

/** Tamanhos e tipos de criatura (2024). Rótulos em `gm.size.*` / `gm.creatureType.*`. */
export const CREATURE_SIZES = ['tiny', 'small', 'medium', 'large', 'huge', 'gargantuan'] as const
export const CREATURE_TYPES = [
  'aberration', 'beast', 'celestial', 'construct', 'dragon', 'elemental', 'fey',
  'fiend', 'giant', 'humanoid', 'monstrosity', 'ooze', 'plant', 'undead',
] as const

/**
 * ND estimado de um NPC montado como personagem, por nível. Não há tabela
 * oficial em 2024; a régua é o SRD (Cavaleiro ND 3 ≈ guerreiro 5, Mago ND 6 ≈
 * mago 9, Arquimago ND 12 ≈ mago 18). Serve para o XP do encontro; o bônus de
 * proficiência do bloco continua sendo o do nível.
 */
export const PC_LEVEL_CR: Record<number, string> = {
  1: '1/2', 2: '1', 3: '2', 4: '2', 5: '3', 6: '4', 7: '5', 8: '5', 9: '6', 10: '7',
  11: '8', 12: '8', 13: '9', 14: '10', 15: '11', 16: '12', 17: '13', 18: '14', 19: '15', 20: '16',
}
/** Níveis de Aumento de Valor de Atributo (o 19 é Dádiva Épica em 2024); guerreiro e ladino têm extras. */
export const ASI_LEVELS = [4, 8, 12, 16]
export const EXTRA_ASI_LEVELS: Record<string, number[]> = { guerreiro: [6, 14], ladino: [10] }

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
 * Notas do mestre. Os tipos de menção são o esquema do link salvo no markdown
 * (`[Grukk](npc:<id>)`) — nunca renomear um, ele está nas notas gravadas.
 */
export const MENTION_KINDS = ['player', 'npc', 'monster'] as const
/** Sugestões mostradas ao digitar `@` e o tamanho máximo do texto buscado depois dele. */
export const MENTION_SUGGESTION_LIMIT = 8
export const MENTION_QUERY_MAX = 40
/** Caracteres do título deduzido da primeira linha e do resumo na lista de notas. */
export const NOTE_TITLE_FALLBACK_LENGTH = 60
export const NOTE_SNIPPET_LENGTH = 140

/**
 * Terrenos da grade do mapa. `code` é o caractere salvo por célula em
 * `GridMap.cells` — não mude um código existente, ele está nos mapas salvos.
 * `cost` é o multiplicador de movimento (2 = terreno difícil); `null` bloqueia.
 * `fly`: quem voa passa por cima (só parede, pilar e vazio barram). `swim`: com
 * deslocamento de natação, a casa custa 1. `group` organiza a paleta do editor.
 * `opaque`: bloqueia a linha de visão da mesa (`src/lib/gm/vision.ts`); porta não bloqueia.
 */
export const TERRAINS = [
  { code: '0', id: 'void', cost: null, group: 'void', fly: false, swim: false, opaque: true },
  // Chão
  { code: '.', id: 'floor', cost: 1, group: 'ground', fly: true, swim: false, opaque: false },
  { code: 'f', id: 'wood', cost: 1, group: 'ground', fly: true, swim: false, opaque: false },
  { code: 'e', id: 'dirt', cost: 1, group: 'ground', fly: true, swim: false, opaque: false },
  { code: 'g', id: 'grass', cost: 1, group: 'ground', fly: true, swim: false, opaque: false },
  { code: 'a', id: 'sand', cost: 1, group: 'ground', fly: true, swim: false, opaque: false },
  // Terreno difícil
  { code: 'd', id: 'difficult', cost: 2, group: 'difficult', fly: true, swim: false, opaque: false },
  { code: 'r', id: 'rubble', cost: 2, group: 'difficult', fly: true, swim: false, opaque: false },
  { code: 'm', id: 'mud', cost: 2, group: 'difficult', fly: true, swim: false, opaque: false },
  { code: 'n', id: 'snow', cost: 2, group: 'difficult', fly: true, swim: false, opaque: false },
  { code: 'i', id: 'ice', cost: 2, group: 'difficult', fly: true, swim: false, opaque: false },
  { code: 'v', id: 'vegetation', cost: 2, group: 'difficult', fly: true, swim: false, opaque: false },
  { code: 'u', id: 'furniture', cost: 2, group: 'difficult', fly: true, swim: false, opaque: false },
  // Água: sem deslocamento de natação, nadar custa o dobro
  { code: 'w', id: 'water', cost: 2, group: 'water', fly: true, swim: true, opaque: false },
  { code: 'W', id: 'deepWater', cost: 2, group: 'water', fly: true, swim: true, opaque: false },
  { code: 'b', id: 'bridge', cost: 1, group: 'water', fly: true, swim: false, opaque: false },
  // Construção e obstáculos
  { code: '#', id: 'wall', cost: null, group: 'structure', fly: false, swim: false, opaque: true },
  { code: 'o', id: 'pillar', cost: null, group: 'structure', fly: false, swim: false, opaque: true },
  { code: '+', id: 'door', cost: 1, group: 'structure', fly: true, swim: false, opaque: false },
  { code: 's', id: 'stairs', cost: 1, group: 'structure', fly: true, swim: false, opaque: false },
  { code: 't', id: 'tree', cost: null, group: 'structure', fly: true, swim: false, opaque: true },
  { code: 'k', id: 'boulder', cost: null, group: 'structure', fly: true, swim: false, opaque: true },
  // Perigo
  { code: 'h', id: 'hazard', cost: 1, group: 'danger', fly: true, swim: false, opaque: false },
  { code: 'l', id: 'lava', cost: 1, group: 'danger', fly: true, swim: false, opaque: false },
  { code: 'p', id: 'pit', cost: null, group: 'danger', fly: true, swim: false, opaque: false },
] as const
export const TERRAIN_GROUPS = ['ground', 'difficult', 'water', 'structure', 'danger'] as const
export const TERRAIN_VOID = '0'
export const TERRAIN_FLOOR = '.'
/** Uma casa da grade: 1,5 m (5 pés), diagonal inclusive — regra de 2024. */
export const GRID_CELL_METERS = 1.5
export const MAP_MIN_SIZE = 5
export const MAP_MAX_SIZE = 100
export const MAP_DEFAULT_WIDTH = 30
export const MAP_DEFAULT_HEIGHT = 20
export const MAP_UNDO_LIMIT = 50
/** Mapa de área (IndexedDB): banco, store e limites. Unidades de mundo = px a 1×. */
export const AREA_DB_NAME = 'venetia-gm'
export const AREA_DB_VERSION = 1
export const AREA_DB_STORE = 'area_maps'
/** Ordem padrão de desenho, de baixo para cima: textos por último para nenhum território cobrir um nome. */
export const AREA_LAYERS = [
  'background', 'terrain', 'water', 'roads', 'structures', 'vegetation', 'decor', 'effects', 'labels',
] as const
export const AREA_MAP_DEFAULT_WIDTH = 1600
export const AREA_MAP_DEFAULT_HEIGHT = 1100
export const AREA_MAP_MIN_SIZE = 400
export const AREA_MAP_MAX_SIZE = 8000
export const AREA_MAP_MAX_ELEMENTS = 5000
export const AREA_DEFAULT_TEXTURE = 'grass'
export const AREA_STAMP_MIN_SCALE = 0.1
export const AREA_STAMP_MAX_SCALE = 10
/** Pincel e borracha: espessura em unidades de mundo. */
export const AREA_BRUSH_MIN = 8
export const AREA_BRUSH_MAX = 400
export const AREA_BRUSH_DEFAULT = 80
/** Força padrão do pincel (opacidade dos carimbos) e o mínimo aceito. */
export const AREA_BRUSH_OPACITY_DEFAULT = 1
export const AREA_BRUSH_OPACITY_MIN = 0.05
/** Distância mínima (em px de tela) entre dois pontos gravados de um traço. */
export const AREA_STROKE_STEP_PX = 4
/** Tolerância da simplificação de traços (Ramer-Douglas-Peucker), em px de tela. */
export const AREA_SIMPLIFY_PX = 1.5
/** Estilos de caminho: largura padrão e camada onde entram. */
export const AREA_PATH_STYLES = {
  dirtRoad: { width: 18, layer: 'roads' },
  stoneRoad: { width: 20, layer: 'roads' },
  trail: { width: 8, layer: 'roads' },
  river: { width: 28, layer: 'water' },
  stream: { width: 10, layer: 'water' },
  wall: { width: 16, layer: 'structures' },
  border: { width: 6, layer: 'effects' },
} as const
export const AREA_PATH_MIN_WIDTH = 2
export const AREA_PATH_MAX_WIDTH = 200
/** Cores das regiões de território (preenchimento translúcido + borda). */
export const AREA_REGION_COLORS = ['#b5392f', '#d4a017', '#3f7fa8', '#4f8a3a', '#8f6bff', '#e8e0d0', '#2a1d10'] as const
export const AREA_REGION_TERRITORY_OPACITY = 0.25
/** Estilos de texto: tamanho padrão (altura da fonte em unidades de mundo). */
export const AREA_LABEL_STYLES = {
  region: { size: 64 },
  city: { size: 34 },
  note: { size: 20 },
} as const
export const AREA_LABEL_MIN_SIZE = 8
export const AREA_LABEL_MAX_SIZE = 400
export const AREA_LABEL_COLORS = ['#f5f0e8', '#2a1d10', '#d4a017', '#b5392f', '#9fd0ea'] as const
/** Ícones: diâmetro padrão e limites (unidades de mundo). Cores do glifo/selo. */
export const AREA_ICON_DEFAULT_SIZE = 56
export const AREA_ICON_MIN_SIZE = 12
export const AREA_ICON_MAX_SIZE = 400
export const AREA_ICON_COLORS = ['#2a1d10', '#f5f0e8', '#d4a017', '#b5392f', '#3f7fa8', '#4f8a3a', '#8f6bff'] as const
/** Grade de alinhamento. */
export const AREA_GRID_DEFAULT_SIZE = 64
export const AREA_GRID_MIN_SIZE = 16
export const AREA_GRID_MAX_SIZE = 1000
/** Exportação em imagem: lado máximo em pixels (cabe na textura de GPU de celular). */
export const AREA_EXPORT_MAX_PX = 8192
export const AREA_EXPORT_JPEG_QUALITY = 0.92
/** Miniatura da lista: lado maior em pixels, qualidade JPEG e espera depois da última edição. */
export const AREA_THUMBNAIL_PX = 360
export const AREA_THUMBNAIL_QUALITY = 0.72
export const AREA_THUMBNAIL_DELAY_MS = 1500
/** Zoom do editor: pixels de tela por unidade de mundo. */
export const AREA_MIN_ZOOM = 0.05
export const AREA_MAX_ZOOM = 8
/** Casas ocupadas por lado, por tamanho de criatura. */
export const CREATURE_SIZE_SQUARES: Record<string, number> = {
  tiny: 1, small: 1, medium: 1, large: 2, huge: 3, gargantuan: 4,
}
/** Deslocamento quando a ficha não informa (o padrão das espécies de 2024). */
export const DEFAULT_SPEED_METERS = 9
/**
 * Condições que incluem Incapacitado (2024): quem está com uma delas pode ter o
 * espaço atravessado até por inimigos.
 */
export const INCAPACITATING_CONDITIONS = ['Incapacitado', 'Inconsciente', 'Paralisado', 'Petrificado', 'Atordoado']
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

// Crédito do autor exibido no rodapé (AppFooter)
export const AUTHOR_NAME = 'Leo Gotardo'
export const AUTHOR_URL = 'https://leogotardo.com.br/'

// Formulário de bugs e sugestões, linkado no rodapé
export const FEEDBACK_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSf3qvBBaJqDrYXhJqQxOm4mHK8uTZX_YpNpk_lgUYa2ptZpVQ/viewform'

// Atualização do app Android pelo GitHub Releases (src/lib/appUpdate.ts)
export const GITHUB_REPO = 'LeoGotardo/venetia-grimory'
export const GITHUB_REPO_URL = `https://github.com/${GITHUB_REPO}`
export const GITHUB_RELEASES_URL = `${GITHUB_REPO_URL}/releases/latest`
export const LATEST_RELEASE_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`
export const UPDATE_CHECK_TIMEOUT_MS = 8000

// Salas online. As constantes do protocolo moram em src/lib/room (as funções da Vercel também as leem).
export * from '../lib/room/constants'
/** Participações deste aparelho em salas (código, papel, token) — chave em português, como as outras. */
export const STORAGE_KEY_ROOMS = 'dnd_salas'
/** Servidor das salas para o app Android, que roda em `https://localhost` e não tem a API na mesma origem. */
export const ROOM_API_URL_APP = 'https://venetia.leogotardo.com.br'
/** Espera de uma chamada HTTP da sala antes de desistir. */
export const ROOM_HTTP_TIMEOUT_MS = 15_000
