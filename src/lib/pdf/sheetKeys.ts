/**
 * Nomes dos campos da ficha em PDF, compartilhados entre `sheetValues` (o que
 * vai em cada um) e `sheetLayout` (onde cada um fica). No modo `print` eles
 * viram os nomes dos campos do formulário, então não têm ponto: o pdf-lib leria
 * `a.b` como um campo `b` dentro de um grupo `a`.
 */
import type { AbilityId } from '../../types/gameData'

/** Linhas das tabelas e caixas de seleção que a ficha comporta. */
export const ATTACK_ROWS = 6
export const SPELL_ROWS_PER_COLUMN = 15
export const SPELL_ROWS = SPELL_ROWS_PER_COLUMN * 2
export const ATTUNEMENT_ROWS = 3
/** Máximo de espaços por círculo nas regras de 2024 (o 20º nível de um conjurador completo). */
export const SLOT_CIRCLES_PER_LEVEL = [4, 3, 3, 3, 3, 2, 2, 1, 1] as const
/** A Magia de Pacto chega a 4 espaços no 17º nível de bruxo. */
export const PACT_SLOT_CIRCLES = 4

export const COIN_IDS = ['PC', 'PP', 'PE', 'PO', 'PL'] as const
export type CoinId = (typeof COIN_IDS)[number]

export const ARMOR_TRAINING = ['light', 'medium', 'heavy', 'shields'] as const
export type ArmorTraining = (typeof ARMOR_TRAINING)[number]

export const KEYS = {
  name: 'name',
  charClass: 'class',
  subclass: 'subclass',
  level: 'level',
  species: 'species',
  background: 'background',
  xp: 'xp',
  ac: 'ac',
  shield: 'shield',
  initiative: 'initiative',
  speed: 'speed',
  size: 'size',
  proficiency: 'proficiency',
  passivePerception: 'passive_perception',
  hpMax: 'hp_max',
  hpCurrent: 'hp_current',
  hpTemp: 'hp_temp',
  hitDice: 'hit_dice',
  hitDiceSpent: 'hit_dice_spent',
  classFeatures: 'class_features',
  speciesTraits: 'species_traits',
  feats: 'feats',
  weapons: 'weapons',
  tools: 'tools',
  castAbility: 'cast_ability',
  castModifier: 'cast_modifier',
  castDc: 'cast_dc',
  castAttack: 'cast_attack',
  pactLevel: 'pact_level',
  pactTotal: 'pact_total',
  freeCasts: 'free_casts',
  appearance: 'appearance',
  personality: 'personality',
  alignment: 'alignment',
  languages: 'languages',
  equipment: 'equipment',
} as const

export const abilityKey = (ability: AbilityId, part: 'mod' | 'score' | 'save' | 'save_prof') => `ab_${ability}_${part}`
export const skillKey = (skillId: string, part: 'val' | 'prof' | 'exp') => `sk_${skillId}_${part}`
export const attackKey = (row: number, part: 'name' | 'bonus' | 'damage' | 'notes') => `atk_${row}_${part}`
export const armorKey = (armor: ArmorTraining) => `armor_${armor}`
export const slotTotalKey = (level: number) => `slot_${level}_total`
export const slotSpentKey = (level: number, circle: number) => `slot_${level}_spent_${circle}`
export const pactSpentKey = (circle: number) => `pact_spent_${circle}`
export const spellKey = (row: number, part: 'level' | 'name' | 'time' | 'range' | 'notes' | 'c' | 'r' | 'm') => `sp_${row}_${part}`
export const attunementKey = (row: number) => `attune_${row}`
export const coinKey = (coin: CoinId) => `coin_${coin}`
