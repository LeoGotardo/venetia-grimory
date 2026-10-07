import { v4 as uuidv4 } from 'uuid'
import type { AbilityId, Monster, StatBlock, StatBlockFeature } from '../../types'
import { ABILITIES, calcModifier } from '../calculations'
import { gameDataPt } from '../../data/rules'
import {
  AVAILABLE_CONDITIONS,
  CHALLENGE_RATINGS,
  CR_XP,
  CREATURE_SIZES,
  CREATURE_TYPES,
  MONSTER_PACK_FORMAT,
  MONSTER_PACK_VERSION,
} from '../../constants'

export const FEATURE_LISTS = ['traits', 'actions', 'bonus_actions', 'reactions', 'legendary_actions'] as const
export type FeatureList = typeof FEATURE_LISTS[number]

export function createBlankFeature(): StatBlockFeature {
  return {
    id: uuidv4(),
    name: '',
    usage: '',
    description: '',
    attack_bonus: null,
    damage: null,
    damage_type: '',
    save_dc: null,
    save_ability: null,
  }
}

export function createBlankStatBlock(name = ''): StatBlock {
  return {
    name,
    size: 'medium',
    creature_type: 'humanoid',
    tags: '',
    alignment: '',
    ac: 10,
    ac_note: '',
    hp: { average: 4, formula: '1d8' },
    speed: { walk: 9, fly: null, swim: null, climb: null, burrow: null, hover: false },
    abilities: { FOR: 10, DES: 10, CON: 10, INT: 10, SAB: 10, CAR: 10 },
    save_proficiencies: [],
    skills: {},
    vulnerabilities: '',
    resistances: '',
    immunities: '',
    condition_immunities: [],
    senses: { darkvision: null, blindsight: null, tremorsense: null, truesight: null },
    languages: '',
    cr: '0',
    initiative_bonus: null,
    traits: [],
    actions: [],
    bonus_actions: [],
    reactions: [],
    legendary_actions: [],
    legendary_uses: null,
    description: '',
  }
}

// ── Números derivados ─────────────────────────────────────────────────────────

export function crToXp(cr: string): number {
  return CR_XP[cr] ?? 0
}

/** Valor numérico do ND, para ordenar (`'1/4'` → 0.25). */
export function crValue(cr: string): number {
  const [num, den] = cr.split('/').map(Number)
  return den ? num / den : num
}

/** ND 0–4 → +2, 5–8 → +3, … 29–30 → +9. */
export function crProficiencyBonus(cr: string): number {
  return 2 + Math.floor(Math.max(crValue(cr) - 1, 0) / 4)
}

/** O bônus que o bloco usa: o fixo, se houver, senão o do ND. */
export function blockProficiencyBonus(block: StatBlock): number {
  return block.proficiency_bonus ?? crProficiencyBonus(block.cr)
}

export function abilityModifier(block: StatBlock, ability: AbilityId): number {
  return calcModifier(block.abilities[ability])
}

export function saveBonus(block: StatBlock, ability: AbilityId): number {
  const proficient = block.save_proficiencies.includes(ability)
  return abilityModifier(block, ability) + (proficient ? blockProficiencyBonus(block) : 0)
}

export function initiativeBonus(block: StatBlock): number {
  return block.initiative_bonus ?? abilityModifier(block, 'DES')
}

export function skillAbility(skillId: string): AbilityId | null {
  return gameDataPt.skills.find(s => s.id === skillId)?.ability ?? null
}

/** Bônus sugerido ao adicionar uma perícia: modificador + proficiência. */
export function proficientSkillBonus(block: StatBlock, skillId: string): number {
  const ability = skillAbility(skillId)
  return (ability ? abilityModifier(block, ability) : 0) + blockProficiencyBonus(block)
}

export function passivePerception(block: StatBlock): number {
  return 10 + (block.skills.percepcao ?? abilityModifier(block, 'SAB'))
}

// ── Leitura tolerante (import de pacote, dados salvos de versões antigas) ─────

function num(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function numOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback
}

function normalizeFeature(raw: unknown): StatBlockFeature {
  const f = (raw && typeof raw === 'object' ? raw : {}) as Partial<StatBlockFeature>
  return {
    id: str(f.id) || uuidv4(),
    name: str(f.name),
    usage: str(f.usage),
    description: str(f.description),
    attack_bonus: numOrNull(f.attack_bonus),
    damage: typeof f.damage === 'string' && f.damage.trim() ? f.damage : null,
    damage_type: str(f.damage_type),
    save_dc: numOrNull(f.save_dc),
    save_ability: ABILITIES.includes(f.save_ability as AbilityId) ? (f.save_ability as AbilityId) : null,
  }
}

/**
 * Completa e saneia um bloco vindo de fora — JSON de outra pessoa ou salvo por
 * uma versão anterior. O que faltar ou vier com tipo errado cai no padrão do
 * bloco em branco, como `migrateSheet` faz com as fichas.
 */
export function normalizeStatBlock(raw: unknown): StatBlock {
  const blank = createBlankStatBlock()
  const b = (raw && typeof raw === 'object' ? raw : {}) as Partial<Record<keyof StatBlock, unknown>>
  const hp = (b.hp ?? {}) as Partial<StatBlock['hp']>
  const speed = (b.speed ?? {}) as Partial<StatBlock['speed']>
  const abilities = (b.abilities ?? {}) as Partial<Record<AbilityId, unknown>>
  const senses = (b.senses ?? {}) as Partial<StatBlock['senses']>
  const skills = (b.skills && typeof b.skills === 'object' ? b.skills : {}) as Record<string, unknown>
  const list = (value: unknown) => (Array.isArray(value) ? value.map(normalizeFeature) : [])

  return {
    name: str(b.name),
    size: oneOf(b.size, CREATURE_SIZES, blank.size),
    creature_type: oneOf(b.creature_type, CREATURE_TYPES, blank.creature_type),
    tags: str(b.tags),
    alignment: str(b.alignment),
    ac: num(b.ac, blank.ac),
    ac_note: str(b.ac_note),
    hp: { average: num(hp.average, blank.hp.average), formula: str(hp.formula) },
    speed: {
      walk: num(speed.walk, blank.speed.walk),
      fly: numOrNull(speed.fly),
      swim: numOrNull(speed.swim),
      climb: numOrNull(speed.climb),
      burrow: numOrNull(speed.burrow),
      hover: speed.hover === true,
    },
    abilities: Object.fromEntries(ABILITIES.map(a => [a, num(abilities[a], 10)])) as Record<AbilityId, number>,
    save_proficiencies: Array.isArray(b.save_proficiencies)
      ? ABILITIES.filter(a => (b.save_proficiencies as unknown[]).includes(a))
      : [],
    skills: Object.fromEntries(
      Object.entries(skills).filter(([id, v]) => skillAbility(id) && typeof v === 'number'),
    ) as Record<string, number>,
    vulnerabilities: str(b.vulnerabilities),
    resistances: str(b.resistances),
    immunities: str(b.immunities),
    condition_immunities: Array.isArray(b.condition_immunities)
      ? (AVAILABLE_CONDITIONS as readonly string[]).filter(c => (b.condition_immunities as unknown[]).includes(c))
      : [],
    senses: {
      darkvision: numOrNull(senses.darkvision),
      blindsight: numOrNull(senses.blindsight),
      tremorsense: numOrNull(senses.tremorsense),
      truesight: numOrNull(senses.truesight),
    },
    languages: str(b.languages),
    cr: oneOf(typeof b.cr === 'number' ? String(b.cr) : b.cr, CHALLENGE_RATINGS, blank.cr),
    // Opcional e só presente quando vale: os blocos do SRD não têm o campo.
    ...(typeof b.proficiency_bonus === 'number' && Number.isFinite(b.proficiency_bonus)
      ? { proficiency_bonus: Math.min(10, Math.max(0, Math.round(b.proficiency_bonus))) }
      : {}),
    initiative_bonus: numOrNull(b.initiative_bonus),
    traits: list(b.traits),
    actions: list(b.actions),
    bonus_actions: list(b.bonus_actions),
    reactions: list(b.reactions),
    legendary_actions: list(b.legendary_actions),
    legendary_uses: numOrNull(b.legendary_uses),
    description: str(b.description),
  }
}

// ── Pacote de monstros ────────────────────────────────────────────────────────

export interface MonsterPack {
  format: typeof MONSTER_PACK_FORMAT
  version: number
  monsters: Array<{ id: string; statblock: StatBlock }>
}

export function buildMonsterPack(monsters: Monster[]): string {
  const pack: MonsterPack = {
    format: MONSTER_PACK_FORMAT,
    version: MONSTER_PACK_VERSION,
    monsters: monsters.map(m => ({ id: m.id, statblock: m.statblock })),
  }
  return JSON.stringify(pack, null, 2)
}

/**
 * Lê um pacote exportado pelo app. Lança se não for um. Monstros sem nome são
 * descartados — não há como mostrá-los nem achá-los na busca.
 */
export function parseMonsterPack(json: string): Array<{ id: string; statblock: StatBlock }> {
  const data = JSON.parse(json) as Partial<MonsterPack> | null
  if (data?.format !== MONSTER_PACK_FORMAT || !Array.isArray(data.monsters)) {
    throw new Error('not a monster pack')
  }
  return data.monsters
    .map(m => ({
      id: typeof m?.id === 'string' && m.id ? m.id : uuidv4(),
      statblock: normalizeStatBlock(m?.statblock),
    }))
    .filter(m => m.statblock.name.trim() !== '')
}
