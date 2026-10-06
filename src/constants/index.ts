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
