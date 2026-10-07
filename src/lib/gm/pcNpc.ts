import type { AbilityId, CharacterSheet, CreatureSize, StatBlock, StatBlockFeature } from '../../types'
import { createInitialSheet } from '../initialSheet'
import { recalculate } from '../recalculate'
import { applyBackground, applyClass, applySpecies } from '../characterBuild'
import {
  ABILITIES,
  calcModifier,
  calcThirdCasterCantrips,
  calcThirdCasterPreparedSpells,
  isCasterClass,
  isThirdCaster,
  maxSpellCircle,
  spellListForClass,
} from '../calculations'
import { gameDataPt } from '../../data/rules'
import { translateTerm } from '../../data/rules/translation'
import { getBackgrounds } from '../../data/backgrounds'
import { getCantripsByClass, getSpells, getSpellsByClassAndLevel, type Spell } from '../../data/spells'
import { getItems, type Weapon } from '../../data/items'
import { WEAPONS as WEAPONS_PT } from '../../data/items/pt/weapons'
import { ASI_LEVELS, EXTRA_ASI_LEVELS, PC_LEVEL_CR, STANDARD_ARRAY_VALUES } from '../../constants'
import { NPC_SPECIES, PC_ARMOR_BY_TIER, PC_CLASS_WEIGHTS, PC_LOADOUT } from '../../data/npcTables'
import { createBlankFeature, createBlankStatBlock } from './statblock'
import { parseDice } from './dice'

type Random = () => number
type Translate = (key: string, options?: Record<string, unknown>) => string

const pick = <T,>(list: readonly T[], random: Random): T => list[Math.floor(random() * list.length)]

function pickWeighted(weights: Record<string, number>, random: Random): string {
  const entries = Object.entries(weights)
  let roll = random() * entries.reduce((sum, [, w]) => sum + w, 0)
  for (const [id, w] of entries) {
    roll -= w
    if (roll < 0) return id
  }
  return entries[entries.length - 1][0]
}

/** `n` itens distintos, sem repetir, na ordem do sorteio. */
function sample<T>(list: readonly T[], n: number, random: Random): T[] {
  const pool = [...list]
  const out: T[] = []
  while (out.length < n && pool.length > 0) out.push(pool.splice(Math.floor(random() * pool.length), 1)[0])
  return out
}

/** O que o mestre decidiu sobre o personagem. Vazio = sorteado. */
export interface PcDraft {
  classId?: string
  /** 0 ou ausente = sorteado. */
  level?: number
  subclassId?: string
  speciesId?: string
  backgroundId?: string
}

/** As escolhas resolvidas — o que a tela mostra e o que se rerrola. */
export interface PcBuild {
  classId: string
  level: number
  subclassId: string | null
  speciesId: string
  lineageId: string | null
  backgroundId: string
}

/** Sem nível escolhido, sorteia 1–6: o grosso dos NPCs que cruzam o caminho do grupo. */
const RANDOM_LEVEL_MAX = 6

export function resolvePcBuild(draft: PcDraft, random: Random = Math.random): PcBuild {
  const classId = draft.classId && gameDataPt.classes.some(c => c.id === draft.classId)
    ? draft.classId
    : pickWeighted(PC_CLASS_WEIGHTS, random)
  const charClass = gameDataPt.classes.find(c => c.id === classId)!
  const level = draft.level && draft.level >= 1 && draft.level <= 20
    ? Math.floor(draft.level)
    : 1 + Math.floor(random() * RANDOM_LEVEL_MAX)
  const subclassLevel = charClass.subclass_level ?? 3
  const subclassId = level < subclassLevel
    ? null
    : charClass.subclasses.some(s => s.id === draft.subclassId)
      ? draft.subclassId!
      : pick(charClass.subclasses, random).id
  const speciesId = draft.speciesId && gameDataPt.species.some(s => s.id === draft.speciesId)
    ? draft.speciesId
    : pick(NPC_SPECIES, random)
  const species = gameDataPt.species.find(s => s.id === speciesId)!
  const lineageId = species.lineages?.length ? pick(species.lineages, random).id : null
  const backgroundId = draft.backgroundId && gameDataPt.backgrounds.some(b => b.id === draft.backgroundId)
    ? draft.backgroundId
    : pick(gameDataPt.backgrounds, random).id
  return { classId, level, subclassId, speciesId, lineageId, backgroundId }
}

/**
 * Prioridade dos atributos: a ordem do arranjo sugerido da classe, maior
 * primeiro. Cavaleiro Místico e Trapaceiro Arcano conjuram com INT, que a
 * sugestão do guerreiro e do ladino deixa no fim — sobe para terceiro.
 */
function abilityPriority(classId: string, subclassId: string | null): AbilityId[] {
  const suggested = (gameDataPt.suggested_abilities_by_class?.[classId] ?? {}) as unknown as Record<AbilityId, number>
  const order = [...ABILITIES].sort((a, b) => (suggested[b] ?? 10) - (suggested[a] ?? 10))
  if (!isThirdCaster(subclassId)) return order
  const rest = order.filter(a => a !== 'INT')
  return [...rest.slice(0, 2), 'INT', ...rest.slice(2)]
}

/**
 * Monta a ficha com as mesmas regras do assistente do jogador: espécie, classe,
 * antecedente (+2/+1 nos atributos que a classe mais usa), arranjo padrão,
 * Aumentos de Valor de Atributo nos níveis certos, perícias, armadura do tier
 * do nível, subclasse e magias.
 */
export function buildPcSheet(build: PcBuild, random: Random = Math.random): CharacterSheet {
  const { classId, level, subclassId, speciesId, lineageId, backgroundId } = build
  const charClass = gameDataPt.classes.find(c => c.id === classId)!

  let sheet = createInitialSheet()
  sheet = applySpecies(sheet, speciesId, lineageId ?? undefined)
  sheet = applyClass(sheet, classId)

  // Arranjo padrão (15, 14, 13, 12, 10, 8) na ordem de prioridade.
  const priority = abilityPriority(classId, subclassId)
  const abilities = { ...sheet.abilities }
  priority.forEach((a, i) => {
    abilities[a] = { ...abilities[a], value: STANDARD_ARRAY_VALUES[i] }
  })
  sheet = recalculate({
    ...sheet,
    abilities: { ...abilities, generation_method: 'standard' },
    identity: { ...sheet.identity, level, subclass_id: subclassId },
  })

  // Antecedente: +2 no atributo permitido que a classe mais usa, +1 no seguinte.
  const allowed = getBackgrounds().find(b => b.id === backgroundId)?.suggested_abilities ?? ABILITIES
  const ranked = priority.filter(a => allowed.includes(a))
  const distribution: Partial<Record<AbilityId, number>> = ranked.length >= 2
    ? { [ranked[0]]: 2, [ranked[1]]: 1 }
    : { [priority[0]]: 2, [priority[1]]: 1 }
  sheet = applyBackground(sheet, backgroundId, distribution)

  // Aumentos de Valor de Atributo: +2 no primeiro atributo da prioridade ainda abaixo de 20.
  const asiCount = [...ASI_LEVELS, ...(EXTRA_ASI_LEVELS[classId] ?? [])].filter(l => l <= level).length
  const raised = { ...sheet.abilities }
  for (let i = 0; i < asiCount; i++) {
    let points = 2
    for (const a of priority) {
      if (points === 0) break
      const room = 20 - (raised[a].value ?? 10)
      const add = Math.min(room, points)
      if (add > 0) {
        raised[a] = { ...raised[a], value: (raised[a].value ?? 10) + add }
        points -= add
      }
    }
  }

  // Perícias da classe (as do antecedente já vieram) e especialização de ladino e bardo.
  const skills = { ...sheet.skills }
  const pool = (charClass.available_skills === 'qualquer' ? Object.keys(skills) : charClass.available_skills)
    .filter(id => skills[id] && !skills[id].proficient)
  for (const id of sample(pool, charClass.num_skills, random)) skills[id] = { ...skills[id], proficient: true }
  const expertiseCount = classId === 'ladino' ? (level >= 6 ? 4 : 2)
    : classId === 'bardo' && level >= 2 ? (level >= 9 ? 4 : 2) : 0
  const proficient = Object.keys(skills).filter(id => skills[id].proficient)
  for (const id of sample(proficient, expertiseCount, random)) skills[id] = { ...skills[id], expertise: true }

  // Armadura: a melhor peça da categoria que o nível já alcança.
  const loadout = PC_LOADOUT[classId]
  const armorId = loadout?.armor
    ? [...PC_ARMOR_BY_TIER[loadout.armor]].reverse().find(a => a.minLevel <= level)!.id
    : null

  // Idiomas de 2024: Comum mais dois da lista padrão (os fixos da classe já vieram).
  const known = new Set(sheet.proficiencies.languages)
  const extra = sample(gameDataPt.languages.common.map(l => l.id).filter(id => id !== 'comum' && !known.has(id)), 2, random)
  const languages = ['comum', ...[...known].filter(id => id !== 'comum'), ...extra]

  sheet = recalculate({
    ...sheet,
    abilities: raised,
    skills,
    proficiencies: { ...sheet.proficiencies, languages },
    combat: {
      ...sheet.combat,
      armor_class: { ...sheet.combat.armor_class, equipped_armor_id: armorId, shield_equipped: loadout?.shield ?? false },
    },
  })
  sheet = { ...sheet, combat: { ...sheet.combat, hit_points: { ...sheet.combat.hit_points, current: sheet.combat.hit_points.max ?? 0 } } }

  return recalculate(pickSpells(sheet, build, random))
}

/** Truques e magias preparadas da lista da classe, no limite do nível; ao menos uma do maior círculo. */
function pickSpells(sheet: CharacterSheet, build: PcBuild, random: Random): CharacterSheet {
  const { classId, subclassId, level } = build
  if (!isCasterClass(classId, subclassId)) return sheet
  const charClass = gameDataPt.classes.find(c => c.id === classId)!
  const maxCircle = maxSpellCircle(charClass, level, subclassId)
  if (maxCircle <= 0) return sheet

  const prog = charClass.progression[Math.min(level, charClass.progression.length) - 1] as unknown as Record<string, unknown>
  const cantripCount = isThirdCaster(subclassId) ? calcThirdCasterCantrips(subclassId, level) : Number(prog?.cantrips ?? 0)
  const spellCount = isThirdCaster(subclassId) ? calcThirdCasterPreparedSpells(level) : Number(prog?.prepared_spells ?? 0)

  const list = spellListForClass(classId, subclassId)
  // Truques que causam dano primeiro: o NPC precisa ter o que fazer no turno.
  const cantripPool = getCantripsByClass(list)
  const damaging = cantripPool.filter(s => s.damage)
  const firstCantrip = damaging.length ? sample(damaging, 1, random) : []
  const cantrips = [...firstCantrip, ...sample(cantripPool.filter(s => !firstCantrip.includes(s)), cantripCount - firstCantrip.length, random)]

  const spellPool = getSpellsByClassAndLevel(list, maxCircle)
  const top = sample(spellPool.filter(s => s.level === maxCircle), 1, random)
  const spells = [...top, ...sample(spellPool.filter(s => !top.includes(s)), spellCount - top.length, random)]

  return {
    ...sheet,
    spellcasting: {
      ...sheet.spellcasting,
      cantrips_by_class: { [classId]: cantrips.map(s => s.id) },
      spells_by_class: { [classId]: spells.map(s => s.id) },
    },
  }
}

// ── Ficha → bloco de estatísticas ──────────────────────────────────────────────

function speciesSize(speciesId: string | null): CreatureSize {
  const size = gameDataPt.species.find(s => s.id === speciesId)?.size as unknown
  const sizes = Array.isArray(size) ? size : [size]
  return sizes.includes('Médio') ? 'medium' : sizes.includes('Pequeno') ? 'small' : 'medium'
}

function feature(name: string, description: string, extra: Partial<StatBlockFeature> = {}): StatBlockFeature {
  return { ...createBlankFeature(), name, description, ...extra }
}

/** `1d10` × 2 → `2d10`: truques sobem de dado nos níveis 5, 11 e 17. */
function scaleCantrip(damage: string, level: number): string | null {
  const dice = parseDice(damage)
  const term = dice?.terms[0]
  if (!term || dice.terms.length !== 1) return null
  const mult = level >= 17 ? 4 : level >= 11 ? 3 : level >= 5 ? 2 : 1
  return `${term.count * mult}d${term.sides}${dice.bonus ? (dice.bonus > 0 ? `+${dice.bonus}` : dice.bonus) : ''}`
}

const SAVE_ABILITY: Record<string, AbilityId> = {
  Força: 'FOR', Destreza: 'DES', Constituição: 'CON', Inteligência: 'INT', Sabedoria: 'SAB', Carisma: 'CAR',
  Strength: 'FOR', Dexterity: 'DES', Constitution: 'CON', Intelligence: 'INT', Wisdom: 'SAB', Charisma: 'CAR',
}

const withSign = (n: number) => (n >= 0 ? `+${n}` : String(n))
const dmg = (die: string, mod: number) => (mod === 0 ? die : `${die}${withSign(mod)}`)

/**
 * O bloco que vai para a campanha: números já calculados pela ficha, ações com
 * as armas do equipamento e os truques de dano, conjuração resumida num traço.
 * Os textos saem no idioma atual (`t` e os catálogos localizados).
 */
export function sheetToStatBlock(sheet: CharacterSheet, name: string, language: string, t: Translate): StatBlock {
  const classId = sheet.identity.class_id ?? ''
  const level = sheet.identity.level
  const subclassId = sheet.identity.subclass_id
  const charClass = gameDataPt.classes.find(c => c.id === classId)!
  const pb = sheet.combat._proficiency_bonus ?? 2
  const mod = (a: AbilityId) => calcModifier(sheet.abilities[a].value ?? 10)
  const className = translateTerm(charClass.name, language)
  const subclass = charClass.subclasses.find(s => s.id === subclassId)

  const block = createBlankStatBlock(name)
  const armor = gameDataPt.armors.find(a => a.id === sheet.combat.armor_class.equipped_armor_id)
  const acParts = [armor ? translateTerm(armor.name, language) : null, sheet.combat.armor_class.shield_equipped ? translateTerm('Escudo', language) : null]
  const con = mod('CON')

  // Ações: ataques múltiplos, armas do equipamento, truques de dano.
  const actions: StatBlockFeature[] = []
  const progression = charClass.progression.slice(0, level).flatMap(p => p.highlights)
  const attacks = progression.includes('Três Ataques Extras') ? 4
    : progression.includes('Dois Ataques Extras') ? 3
      : progression.includes('Ataque Extra') ? 2 : 1
  if (attacks > 1) actions.push(feature(t('gm.pcNpc.multiattack'), t('gm.pcNpc.multiattackText', { n: attacks })))

  const items = getItems()
  for (const weaponId of PC_LOADOUT[classId]?.weapons ?? []) {
    const canon = WEAPONS_PT.find(w => w.id === weaponId)
    const local = items.find(i => i.id === weaponId) as Weapon | undefined
    if (!canon || !local) continue
    const ranged = canon.type === 'À Distância'
    const finesse = canon.properties.includes('Acuidade') || classId === 'monge'
    const abilityMod = ranged ? mod('DES') : finesse ? Math.max(mod('FOR'), mod('DES')) : mod('FOR')
    const bonus = abilityMod + pb
    const damage = dmg(canon.damage, abilityMod)
    const type = local.damage_type.toLowerCase()
    actions.push(feature(local.name, t(ranged ? 'gm.pcNpc.rangedHit' : 'gm.pcNpc.meleeHit', { bonus: withSign(bonus), damage, type }), {
      attack_bonus: bonus,
      damage,
      damage_type: type,
    }))
  }

  const sc = sheet.spellcasting
  const castingAbility = sc.spellcasting_ability
  const dc = sc._spell_dc
  const spellAttack = sc._spell_attack_bonus
  const spells = getSpells()
  const byId = (id: string) => spells.find(s => s.id === id)
  const cantrips = (sc.cantrips_by_class[classId] ?? []).map(byId).filter((s): s is Spell => !!s)
  const prepared = (sc.spells_by_class[classId] ?? []).map(byId).filter((s): s is Spell => !!s)

  for (const spell of cantrips) {
    if (!spell.damage || dc == null || spellAttack == null) continue
    const damage = scaleCantrip(spell.damage, level)
    if (!damage) continue
    const type = (spell.damage_type ?? '').toLowerCase()
    const saveAbility = spell.save ? SAVE_ABILITY[spell.save] ?? null : null
    actions.push(feature(spell.name, saveAbility
      ? t('gm.pcNpc.spellSave', { ability: t(`attrs.${saveAbility}`), dc, damage, type })
      : t('gm.pcNpc.spellAttack', { bonus: withSign(spellAttack), damage, type }), {
      attack_bonus: saveAbility ? null : spellAttack,
      damage,
      damage_type: type,
      save_dc: saveAbility ? dc : null,
      save_ability: saveAbility,
    }))
  }

  // Traços: espécie, características da classe até o nível, conjuração.
  const traits: StatBlockFeature[] = sheet.species_traits.active_traits.map(tr =>
    feature(translateTerm(tr.name, language), translateTerm(tr.description, language)))
  const skipped = new Set(['Subclasse', 'AVA', 'Dádiva Épica'])
  const classFeatures = [...new Set(progression.filter(h => !skipped.has(h)))].map(h => translateTerm(h, language))
  if (classFeatures.length) {
    traits.push(feature(
      t('gm.pcNpc.classFeatures', { class: className }),
      [subclass ? translateTerm(subclass.name, language) : null, classFeatures.join(', ')].filter(Boolean).join('. ') + '.',
    ))
  }
  if (castingAbility && dc != null && spellAttack != null && (cantrips.length || prepared.length)) {
    const lines = [t('gm.pcNpc.spellcastingText', { ability: t(`attrs.${castingAbility}`), dc, attack: withSign(spellAttack) })]
    if (cantrips.length) lines.push(t('gm.pcNpc.cantrips', { list: cantrips.map(s => s.name).join(', ') }))
    for (let circle = 1; circle <= 9; circle++) {
      const ofCircle = prepared.filter(s => s.level === circle)
      if (!ofCircle.length) continue
      const slots = sc.spell_slots[`c${circle}` as keyof typeof sc.spell_slots]?.max ?? 0
      lines.push(t('gm.pcNpc.circle', { n: circle, slots, list: ofCircle.map(s => s.name).join(', ') }))
    }
    if (sc.pact_slots.max > 0 && sc.pact_slots.level) {
      lines.push(t('gm.pcNpc.pact', { slots: sc.pact_slots.max, n: sc.pact_slots.level }))
    }
    traits.push(feature(t('gm.pcNpc.spellcasting'), lines.join(' ')))
  }

  const languageNames = sheet.proficiencies.languages.length ? sheet.proficiencies.languages : ['comum']
  const allLanguages = [...gameDataPt.languages.common, ...gameDataPt.languages.rare]

  return {
    ...block,
    size: speciesSize(sheet.identity.species_id),
    creature_type: 'humanoid',
    tags: `${className} ${level}`,
    ac: sheet.combat.armor_class.value ?? 10,
    ac_note: acParts.filter(Boolean).join(', '),
    hp: {
      average: sheet.combat.hit_points.max ?? 1,
      formula: `${level}d${charClass.hit_die}${con * level === 0 ? '' : withSign(con * level)}`,
    },
    speed: { ...block.speed, walk: sheet.combat.speed._total_meters ?? 9 },
    abilities: Object.fromEntries(ABILITIES.map(a => [a, sheet.abilities[a].value ?? 10])) as Record<AbilityId, number>,
    save_proficiencies: ABILITIES.filter(a => sheet.combat.saves[a]?.proficient),
    skills: Object.fromEntries(Object.entries(sheet.skills).filter(([, s]) => s.proficient).map(([id, s]) => [id, s._value ?? 0])),
    senses: { ...block.senses, darkvision: sheet.species_traits.darkvision_meters },
    languages: languageNames
      .map(id => translateTerm(allLanguages.find(l => l.id === id)?.name ?? id, language))
      .join(', '),
    cr: PC_LEVEL_CR[level] ?? '1',
    proficiency_bonus: pb,
    initiative_bonus: sheet.combat.initiative._value,
    traits,
    actions,
  }
}
