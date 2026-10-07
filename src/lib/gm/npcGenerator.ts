import type { AbilityId, NpcProfile, StatBlock } from '../../types'
import {
  NPC_AGES,
  NPC_ARCHETYPES,
  NPC_NAMES,
  NPC_PHRASES,
  NPC_SPECIES,
  type NpcArchetypeId,
  type NpcSpecies,
} from '../../data/npcTables'
import { ABILITIES, calcModifier } from '../calculations'
import { averageDice, parseDice } from './dice'
import { skillAbility } from './statblock'

type Random = () => number

const pick = <T,>(list: readonly T[], random: Random): T => list[Math.floor(random() * list.length)]

/**
 * O que o mestre decidiu. Campo vazio (ou ausente) é sorteado; o que veio
 * preenchido é mantido como está — "eu escolho, o sistema completa".
 */
export interface NpcDraft {
  name?: string
  gender?: NpcProfile['gender']
  species?: string
  archetype?: string
  age?: string
  occupation?: string
  appearance?: string
  mannerism?: string
  personality?: string
  ideal?: string
  bond?: string
  flaw?: string
  motivation?: string
  secret?: string
}

/** Resolve as marcas `{masc|fem}` das frases PT. Sem gênero definido, usa o masculino genérico. */
export function genderize(text: string, gender: NpcProfile['gender']): string {
  return text.replace(/\{([^|{}]*)\|([^|{}]*)\}/g, (_, m: string, f: string) => (gender === 'f' ? f : m))
}

const filled = (v: string | undefined): v is string => typeof v === 'string' && v.trim() !== ''

export function archetypeById(id: string) {
  return NPC_ARCHETYPES.find(a => a.id === id) ?? null
}

/** Arquétipo pedido ou sorteado — 3 em 4 vezes um comum, como numa cidade de verdade. */
export function resolveArchetype(draft: NpcDraft, random: Random = Math.random): NpcArchetypeId {
  if (filled(draft.archetype) && archetypeById(draft.archetype)) return draft.archetype as NpcArchetypeId
  const common = NPC_ARCHETYPES.filter(a => a.tier === 'common')
  return (random() < 0.75 ? pick(common, random) : pick(NPC_ARCHETYPES, random)).id
}

export function randomName(species: NpcSpecies, gender: NpcProfile['gender'], random: Random = Math.random): string {
  const table = NPC_NAMES[species]
  const first = gender === 'f' ? pick(table.f, random)
    : gender === 'm' ? pick(table.m, random)
      : pick([...table.f, ...table.m], random)
  return `${first} ${pick(table.family, random)}`
}

/**
 * Pequena variação nos atributos (−2 a +2, puxada para 0) para dois guardas não
 * saírem idênticos. PV, iniciativa e perícias acompanham a mudança dos
 * modificadores; CA e ataques ficam como no bloco de base.
 */
export function varyStatBlock(block: StatBlock, random: Random = Math.random): StatBlock {
  const deltas = [-2, -1, 0, 0, 0, 1, 2]
  const abilities = { ...block.abilities }
  const modDelta = {} as Record<AbilityId, number>
  for (const a of ABILITIES) {
    const next = Math.min(30, Math.max(1, block.abilities[a] + pick(deltas, random)))
    modDelta[a] = calcModifier(next) - calcModifier(block.abilities[a])
    abilities[a] = next
  }

  // PV: média dos dados de vida + modificador de CON por dado (o bloco é NdM + K).
  let hp = block.hp
  const parsed = parseDice(block.hp.formula)
  const term = parsed?.terms[0]
  if (term && parsed.terms.length === 1) {
    const con = calcModifier(abilities.CON)
    const bonus = con * term.count
    hp = {
      average: Math.max(1, averageDice({ terms: [term], bonus })),
      formula: bonus === 0 ? `${term.count}d${term.sides}` : `${term.count}d${term.sides}${bonus > 0 ? '+' : ''}${bonus}`,
    }
  }

  const skills = Object.fromEntries(Object.entries(block.skills).map(([id, bonus]) => {
    const ability = skillAbility(id)
    return [id, bonus + (ability ? modDelta[ability] : 0)]
  }))

  return {
    ...block,
    abilities,
    hp,
    skills,
    initiative_bonus: block.initiative_bonus == null ? null : block.initiative_bonus + modDelta.DES,
  }
}

export interface GeneratedNpc {
  statblock: StatBlock
  profile: NpcProfile
}

/**
 * Monta o NPC: perfil (nome, espécie, aparência, personalidade, gancho…) no
 * idioma pedido e o bloco do arquétipo com variação. `base` é o bloco do SRD do
 * arquétipo — quem chama resolve com `resolveArchetype` e carrega o catálogo.
 */
export function generateNpc(
  draft: NpcDraft,
  archetype: NpcArchetypeId,
  base: StatBlock,
  language: 'pt' | 'en',
  random: Random = Math.random,
): GeneratedNpc {
  const phrases = NPC_PHRASES[language]
  const arch = archetypeById(archetype)!
  const gender = draft.gender || pick(['f', 'm', 'f', 'm', 'x'] as const, random)
  const species = (filled(draft.species) && (NPC_SPECIES as readonly string[]).includes(draft.species)
    ? draft.species
    : pick(NPC_SPECIES, random)) as NpcSpecies
  const choose = (value: string | undefined, list: readonly string[]) => (filled(value) ? value.trim() : genderize(pick(list, random), gender))

  const profile: NpcProfile = {
    gender,
    species,
    archetype,
    age: choose(draft.age, NPC_AGES),
    occupation: choose(draft.occupation, phrases.occupations[arch.group]),
    appearance: choose(draft.appearance, phrases.appearance),
    mannerism: choose(draft.mannerism, phrases.mannerism),
    personality: choose(draft.personality, phrases.personality),
    ideal: choose(draft.ideal, phrases.ideal),
    bond: choose(draft.bond, phrases.bond),
    flaw: choose(draft.flaw, phrases.flaw),
    motivation: choose(draft.motivation, phrases.motivation),
    secret: choose(draft.secret, phrases.secret),
  }

  const name = filled(draft.name) ? draft.name.trim() : randomName(species, gender, random)
  const statblock = { ...varyStatBlock(base, random), name }
  return { statblock, profile }
}

/** Sorteia um único campo de texto do perfil (o 🎲 ao lado de cada campo). */
export function rerollField(
  field: Exclude<keyof NpcProfile, 'gender' | 'species' | 'archetype'>,
  archetype: NpcArchetypeId,
  language: 'pt' | 'en',
  gender: NpcProfile['gender'] = '',
  random: Random = Math.random,
): string {
  const phrases = NPC_PHRASES[language]
  if (field === 'age') return pick(NPC_AGES, random)
  if (field === 'occupation') return genderize(pick(phrases.occupations[archetypeById(archetype)!.group], random), gender)
  return genderize(pick(phrases[field], random), gender)
}
