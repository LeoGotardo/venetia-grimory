import type { AbilityId, CharacterSheet, Armor, FreeCast } from '../types'
import {
  calcModifier,
  calcProfBonus,
  calcTotalHp,
  calcMulticlassHp,
  calcAc,
  calcSave,
  calcSkill,
  calcSpellDc,
  calcSpellAttackBonus,
  calcMulticlassCasterLevel,
  calcMulticlassSlots,
  calcPactCasterLevel,
  calcThirdCasterSlots,
  calcPrimaryClassLevel,
  isCasterClass,
  isThirdCaster,
  canChooseSubclass,
  ABILITIES,
} from './calculations'
import {
  CASTER_TYPE,
  MAGIC_INITIATE_LIST_BY_NAME,
  MYSTIC_ARCANUM_BY_LEVEL,
} from '../constants'
import { gameDataPt as gameData } from '../data/rules'

// Subclasse exige 3 níveis NA classe: redistribuir níveis entre classes pode
// invalidar uma escolha já feita, então ela é descartada aqui.
function enforceSubclassEligibility(sheet: CharacterSheet): CharacterSheet {
  const identity = sheet.identity
  const multiclasses = identity.multiclasses ?? []
  const primaryLevel = calcPrimaryClassLevel(identity.level, multiclasses)

  const subclassId = canChooseSubclass(primaryLevel) ? identity.subclass_id : null
  const newMulticlasses = multiclasses.map(m =>
    canChooseSubclass(m.level) ? m : { ...m, subclass_id: null },
  )

  const changed =
    subclassId !== identity.subclass_id ||
    newMulticlasses.some((m, i) => m.subclass_id !== multiclasses[i].subclass_id)
  if (!changed) return sheet

  return {
    ...sheet,
    identity: { ...identity, subclass_id: subclassId, multiclasses: newMulticlasses },
  }
}

function recalculateModifiers(sheet: CharacterSheet): CharacterSheet {
  let f = sheet

  ABILITIES.forEach(attr => {
    const val = f.abilities[attr].value
    f = {
      ...f,
      abilities: {
        ...f.abilities,
        [attr]: {
          ...f.abilities[attr],
          _modifier: val !== null ? calcModifier(val) : null,
        },
      },
    }
  })

  return f
}

function recalculateCombat(sheet: CharacterSheet, profBonus: number): CharacterSheet {
  const dexMod = sheet.abilities.DES._modifier ?? 0
  const conMod = sheet.abilities.CON._modifier ?? 0
  const wisMod = sheet.abilities.SAB._modifier ?? 0

  const totalSpeed =
    (sheet.combat.speed.base_meters ?? 0) + sheet.combat.speed.bonus_meters

  const charClass = gameData.classes.find(c => c.id === sheet.identity.class_id)
  const level = sheet.identity.level
  const multiclasses = sheet.identity.multiclasses ?? []

  let combat = {
    ...sheet.combat,
    _proficiency_bonus: profBonus,
    initiative: { _value: dexMod },
    speed: { ...sheet.combat.speed, _total_meters: totalSpeed },
  }

  if (charClass) {
    let maxHp: number
    if (multiclasses.length > 0) {
      const primaryLevel = level - multiclasses.reduce((s, m) => s + m.level, 0)
      const allClasses = [
        { hitDie: charClass.hit_die, level: Math.max(1, primaryLevel), isPrimary: true },
        ...multiclasses.map(m => {
          const c2 = gameData.classes.find(c => c.id === m.class_id)
          return { hitDie: c2?.hit_die ?? 8, level: m.level, isPrimary: false }
        }),
      ]
      maxHp = calcMulticlassHp(allClasses, conMod)
    } else {
      maxHp = calcTotalHp(level, charClass.hit_die, conMod)
    }

    combat = {
      ...combat,
      hit_points: {
        ...combat.hit_points,
        max: maxHp,
      },
      hit_dice: { ...combat.hit_dice, type: `d${charClass.hit_die}`, total: level },
    }

    // Salvaguardas: apenas da classe primária (multiclasse não concede novas salvaguardas)
    const saves = { ...combat.saves }
    ABILITIES.forEach(a => {
      saves[a] = { ...saves[a], proficient: false }
    })
    charClass.saves.forEach((s: string) => {
      const a = s as keyof typeof saves
      if (saves[a]) saves[a] = { ...saves[a], proficient: true }
    })
    combat = { ...combat, saves }
  }

  ABILITIES.forEach(attr => {
    const mod = sheet.abilities[attr]._modifier ?? 0
    const sv = combat.saves[attr]
    combat = {
      ...combat,
      saves: {
        ...combat.saves,
        [attr]: { ...sv, _value: calcSave(mod, sv.proficient, profBonus) },
      },
    }
  })

  const classIds = [
    ...(sheet.identity.class_id ? [sheet.identity.class_id] : []),
    ...multiclasses.map(m => m.class_id),
  ]

  const armorId = combat.armor_class.equipped_armor_id
  const armor = armorId
    ? (gameData.armors?.find((a: Armor) => a.id === armorId) ?? null)
    : null

  combat = {
    ...combat,
    armor_class: {
      ...combat.armor_class,
      value: calcAc({
        armor,
        dexMod,
        conMod,
        wisMod,
        classIds,
        shield: combat.armor_class.shield_equipped,
      }),
    },
  }

  return { ...sheet, combat }
}

function recalculateSkills(sheet: CharacterSheet, profBonus: number): CharacterSheet {
  const skills = { ...sheet.skills }

  Object.keys(skills).forEach(skillId => {
    const p = skills[skillId]
    const mod = sheet.abilities[p.ability]._modifier ?? 0
    skills[skillId] = { ...p, _value: calcSkill(mod, p.proficient, p.expertise, profBonus) }
  })

  return { ...sheet, skills }
}

const SPELL_LEVELS = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9'] as const
type SpellSlots = CharacterSheet['spellcasting']['spell_slots']

/** Aplica novos máximos preservando o que já foi gasto, limitado ao novo máximo. */
function applySlotMaxes(current: SpellSlots, maxes: Partial<Record<string, number>>): SpellSlots {
  const slots = { ...current }
  SPELL_LEVELS.forEach(k => {
    const max = maxes[k] ?? 0
    slots[k] = { max, spent: Math.min(current[k]?.spent ?? 0, max) }
  })
  return slots
}

interface ClassEntry {
  classId: string
  subclassId: string | null
  level: number
}

/** Classe primária (nível já descontado das multiclasses) seguida das secundárias. */
function classEntries(sheet: CharacterSheet): ClassEntry[] {
  const identity = sheet.identity
  const multiclasses = identity.multiclasses ?? []
  return [
    {
      classId: identity.class_id ?? '',
      subclassId: identity.subclass_id,
      level: Math.max(1, calcPrimaryClassLevel(identity.level, multiclasses)),
    },
    ...multiclasses.map(m => ({ classId: m.class_id, subclassId: m.subclass_id, level: m.level })),
  ]
}

/** Atributo de conjuração da classe — INT nas subclasses de 1/3 conjurador. */
function classCastingAbility(entry: ClassEntry): AbilityId | null {
  if (isThirdCaster(entry.subclassId)) return 'INT'
  if (CASTER_TYPE[entry.classId] == null) return null
  const cd = gameData.classes.find(c => c.id === entry.classId)
  return ((cd as { spellcasting_ability?: string })?.spellcasting_ability ?? null) as AbilityId | null
}

// Antecedentes gravam o nome do talento como id, e já traduzido — daí o casamento
// pelos dois idiomas além do id canônico.
const MAGIC_INITIATE = /^(iniciado em magia|magic initiate)/i

function isMagicInitiate(feat: { feat_id: string; name: string }): boolean {
  return (
    feat.feat_id.startsWith('iniciado_em_magia') ||
    MAGIC_INITIATE.test(feat.feat_id) ||
    MAGIC_INITIATE.test(feat.name)
  )
}

/** Sem acentos e em minúsculas, para casar nomes de lista nos dois idiomas. */
function normalizeName(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

/** Lista já fixada pelo nome do talento, como em "Iniciado em Magia (Clérigo)". */
function magicInitiateList(feat: { feat_id: string; name: string }): string | null {
  const match = /\(([^)]+)\)/.exec(feat.name) ?? /\(([^)]+)\)/.exec(feat.feat_id)
  if (!match) return null
  return MAGIC_INITIATE_LIST_BY_NAME[normalizeName(match[1])] ?? null
}

/**
 * As conjurações que não gastam espaço, derivadas dos talentos e do nível de bruxo:
 * Iniciado em Magia (1 magia de 1º círculo, atributo escolhido pelo jogador) e
 * Arcana Mística (1 magia de 6º a 9º, atributo do bruxo). Ambas voltam no Descanso
 * Longo, e nenhuma delas concede espaço de magia.
 *
 * A lista é derivada, mas as escolhas do jogador (lista, atributo, truques, magia)
 * são preservadas pelo id entre recálculos.
 */
function recalculateFreeCasts(sheet: CharacterSheet, profBonus: number): CharacterSheet {
  const previous = sheet.spellcasting.free_casts ?? []
  const prevById = new Map(previous.map(c => [c.id, c]))
  const modOf = (ability: AbilityId | null) => (ability ? (sheet.abilities[ability]._modifier ?? 0) : 0)

  const casts: FreeCast[] = []

  // Iniciado em Magia — repetível, um registro por talento adquirido.
  sheet.feats.list.filter(isMagicInitiate).forEach(feat => {
    const prev = prevById.get(feat.feat_id)
    const fixedList = magicInitiateList(feat)
    const spellList = fixedList ?? prev?.spell_list ?? null
    // Trocar de lista invalida as magias já escolhidas.
    const keptChoices = prev?.spell_list === spellList
    const ability = prev?.ability ?? null
    casts.push({
      id: feat.feat_id,
      kind: 'magic_initiate',
      spell_list: spellList,
      list_locked: fixedList !== null,
      ability,
      cantrips: keptChoices ? (prev?.cantrips ?? []) : [],
      spell: keptChoices ? (prev?.spell ?? null) : null,
      level: 1,
      max: 1,
      spent: Math.min(prev?.spent ?? 0, 1),
      _spell_dc: ability ? calcSpellDc(profBonus, modOf(ability)) : null,
      _spell_attack_bonus: ability ? calcSpellAttackBonus(profBonus, modOf(ability)) : null,
    })
  })

  // Arcana Mística — derivada do nível de bruxo, com o atributo do próprio bruxo.
  const entries = classEntries(sheet)
  const pactEntry = entries.find(c => CASTER_TYPE[c.classId] === 'pacto')
  const pactLevel = calcPactCasterLevel(entries)
  if (pactEntry && pactLevel > 0) {
    const ability = classCastingAbility(pactEntry)
    Object.entries(MYSTIC_ARCANUM_BY_LEVEL)
      .map(([classLevel, circle]) => [Number(classLevel), circle] as const)
      .sort((a, b) => a[0] - b[0])
      .forEach(([classLevel, circle]) => {
        if (pactLevel < classLevel) return
        const id = `mystic_arcanum_${circle}`
        const prev = prevById.get(id)
        casts.push({
          id,
          kind: 'mystic_arcanum',
          spell_list: pactEntry.classId,
          list_locked: true,
          ability,
          cantrips: [],
          spell: prev?.spell ?? null,
          level: circle,
          max: 1,
          spent: Math.min(prev?.spent ?? 0, 1),
          _spell_dc: ability ? calcSpellDc(profBonus, modOf(ability)) : null,
          _spell_attack_bonus: ability ? calcSpellAttackBonus(profBonus, modOf(ability)) : null,
        })
      })
  }

  if (JSON.stringify(casts) === JSON.stringify(previous)) return sheet

  return { ...sheet, spellcasting: { ...sheet.spellcasting, free_casts: casts } }
}

/**
 * Espaços de magia em três reservas separadas, porque as regras de 2024 as tratam
 * como coisas distintas:
 * - `spell_slots`: Conjuração. Classe única lê a própria progressão; em multiclasse
 *   soma-se o nível de conjurador e consulta-se a tabela do PHB.
 * - `pact_slots`: Magia de Pacto do bruxo. Fora da tabela de multiclasse, todos do
 *   mesmo círculo, recuperados em Descanso Curto.
 * - `free_casts`: conjurações sem espaço (Iniciado em Magia), calculadas à parte.
 */
function recalculateSpellcasting(sheet: CharacterSheet, profBonus: number): CharacterSheet {
  const identity = sheet.identity
  const multiclasses = identity.multiclasses ?? []
  const allClasses = classEntries(sheet)

  const anyCaster = allClasses.some(c => isCasterClass(c.classId, c.subclassId))
  if (!anyCaster && !sheet.spellcasting.spellcaster) return sheet

  // Atributo de conjuração: o da classe primária se ela conjura, senão o da
  // primeira secundária conjuradora. O Cavaleiro Místico e o Trapaceiro Arcano
  // caem aqui também, porque a classe deles não declara atributo nenhum.
  const castingAbility =
    sheet.spellcasting.spellcasting_ability ??
    allClasses.map(classCastingAbility).find(a => a != null) ??
    null
  if (!castingAbility) return sheet

  const castingMod = sheet.abilities[castingAbility]._modifier ?? 0

  // Cada classe conjura com o próprio atributo — em multiclasse a CD não é uma só.
  const dcByClass: Record<string, number> = {}
  const attackByClass: Record<string, number> = {}
  allClasses.forEach(entry => {
    const ability = classCastingAbility(entry)
    if (!entry.classId || !ability) return
    const mod = sheet.abilities[ability]._modifier ?? 0
    dcByClass[entry.classId] = calcSpellDc(profBonus, mod)
    attackByClass[entry.classId] = calcSpellAttackBonus(profBonus, mod)
  })

  // ---- Magia de Pacto (bruxo): reserva própria, um único círculo
  const pactLevel = calcPactCasterLevel(allClasses)
  const pactClass = allClasses.find(c => CASTER_TYPE[c.classId] === 'pacto')
  const pactRow =
    pactLevel > 0 && pactClass
      ? (gameData.classes
          .find(c => c.id === pactClass.classId)
          ?.progression.find((p: { level: number }) => p.level === pactLevel) as
          | Record<string, unknown>
          | undefined)
      : undefined
  const pactMax = (pactRow?.spell_slots as number | undefined) ?? 0
  const pactSlots = {
    level: pactMax > 0 ? ((pactRow?.max_spell_level as number | undefined) ?? null) : null,
    max: pactMax,
    spent: Math.min(sheet.spellcasting.pact_slots?.spent ?? 0, pactMax),
  }

  // ---- Conjuração padrão: `null` significa "não sei calcular, mantém o que está"
  let maxes: Partial<Record<string, number>> | null = null
  if (multiclasses.length > 0) {
    maxes = calcMulticlassSlots(calcMulticlassCasterLevel(allClasses))
  } else if (CASTER_TYPE[identity.class_id ?? ''] === 'pacto') {
    // Bruxo puro só tem Magia de Pacto — nenhum espaço de Conjuração.
    maxes = {}
  } else if (isThirdCaster(identity.subclass_id)) {
    // Cavaleiro Místico / Trapaceiro Arcano: a progressão da CLASSE não tem
    // `slots` (quem conjura é a subclasse) e a tabela deles não é a do
    // multiclasse, que daria menos espaços em vários níveis.
    maxes = calcThirdCasterSlots(identity.level)
  } else {
    const charClass = gameData.classes.find(c => c.id === identity.class_id)
    const progRow = charClass?.progression.find(
      (p: { level: number }) => p.level === identity.level,
    ) as Record<string, unknown> | undefined
    if (progRow) maxes = (progRow.slots as Record<string, number> | undefined) ?? {}
  }

  const spellSlots =
    maxes === null ? sheet.spellcasting.spell_slots : applySlotMaxes(sheet.spellcasting.spell_slots, maxes)

  return {
    ...sheet,
    spellcasting: {
      ...sheet.spellcasting,
      spellcaster: anyCaster || sheet.spellcasting.spellcaster,
      spellcasting_ability: castingAbility,
      _spell_dc: calcSpellDc(profBonus, castingMod),
      _spell_attack_bonus: calcSpellAttackBonus(profBonus, castingMod),
      _spell_dc_by_class: dcByClass,
      _spell_attack_by_class: attackByClass,
      spell_slots: spellSlots,
      pact_slots: pactSlots,
    },
  }
}

export function recalculate(sheet: CharacterSheet): CharacterSheet {
  const profBonus = calcProfBonus(sheet.identity.level)

  const eligible = enforceSubclassEligibility(sheet)
  const withModifiers = recalculateModifiers(eligible)
  const withCombat = recalculateCombat(withModifiers, profBonus)
  const withSkills = recalculateSkills(withCombat, profBonus)
  const withSpellcasting = recalculateSpellcasting(withSkills, profBonus)
  const withFreeCasts = recalculateFreeCasts(withSpellcasting, profBonus)

  return withFreeCasts
}
