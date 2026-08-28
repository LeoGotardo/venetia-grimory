import type { CharacterSheet, Armor } from '../types'
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
  ABILITIES,
} from './calculations'
import { CASTER_TYPE } from '../constants'
import { gameDataPt as gameData } from '../data/rules'

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

function recalculateSpellcasting(sheet: CharacterSheet, profBonus: number): CharacterSheet {
  const multiclasses = sheet.identity.multiclasses ?? []

  // Determina se alguma classe é conjuradora
  const classesPrimaria = sheet.identity.class_id ? [sheet.identity.class_id] : []
  const todasClasseIds = [...classesPrimaria, ...multiclasses.map(m => m.class_id)]
  const ehConjuradorMulti = todasClasseIds.some(id => CASTER_TYPE[id] != null)

  if (!ehConjuradorMulti && !sheet.spellcasting.spellcaster) return sheet

  // Determina o atributo de conjuração: usa a classe primária se conjuradora, senão a primeira secundária
  let atributoConj = sheet.spellcasting.spellcasting_ability
  if (!atributoConj) {
    const primeiraConj = multiclasses.find(m => CASTER_TYPE[m.class_id] != null)
    if (primeiraConj) {
      const c = gameData.classes.find(c => c.id === primeiraConj.class_id)
      atributoConj = ((c as { spellcasting_ability?: string })?.spellcasting_ability ?? null) as typeof atributoConj
    }
  }
  if (!atributoConj) return sheet

  const modConj = sheet.abilities[atributoConj]._modifier ?? 0
  let spellcasting = {
    ...sheet.spellcasting,
    _spell_dc: calcSpellDc(profBonus, modConj),
    _spell_attack_bonus: calcSpellAttackBonus(profBonus, modConj),
  }

  const SPELL_LEVELS = ['c1','c2','c3','c4','c5','c6','c7','c8','c9'] as const

  if (multiclasses.length > 0 && ehConjuradorMulti) {
    // Multiclasse: tabela combinada (PHB 2024)
    const level = sheet.identity.level
    const primaryLevel = level - multiclasses.reduce((s, m) => s + m.level, 0)
    const allClassesForSlots = [
      { classId: sheet.identity.class_id ?? '', subclassId: sheet.identity.subclass_id, level: Math.max(1, primaryLevel) },
      ...multiclasses.map(m => ({ classId: m.class_id, subclassId: m.subclass_id, level: m.level })),
    ]
    const casterLevelTotal = calcMulticlassCasterLevel(allClassesForSlots)
    const multiSlots = calcMulticlassSlots(casterLevelTotal)
    const slots = { ...spellcasting.spell_slots }
    SPELL_LEVELS.forEach(k => {
      const newValue = multiSlots[k] ?? 0
      slots[k] = { max: newValue, spent: Math.min(slots[k].spent, newValue) }
    })
    spellcasting = { ...spellcasting, spell_slots: slots }
  } else {
    // Classe única: lê espaços diretamente da progressão da classe
    const classId = sheet.identity.class_id
    const level = sheet.identity.level
    const charClass = gameData.classes.find(c => c.id === classId)
    const progRow = charClass?.progression.find((p: { level: number }) => p.level === level) as Record<string, unknown> | undefined

    if (progRow) {
      const slots = { ...spellcasting.spell_slots }
      const progSlots = progRow.slots as Record<string, number> | undefined

      if (progSlots) {
        // Conjuradores padrão: campo `slots` com contagens por círculo
        SPELL_LEVELS.forEach(k => {
          const newValue = progSlots[k] ?? 0
          slots[k] = { max: newValue, spent: Math.min(slots[k].spent, newValue) }
        })
      } else {
        // Bruxo: Magia de Pacto usa `max_spell_level` + `spell_slots` (contagem)
        const maxSpellLevel = progRow.max_spell_level as number | undefined
        const slotCount = progRow.spell_slots as number | undefined
        SPELL_LEVELS.forEach(k => {
          slots[k] = { max: 0, spent: 0 }
        })
        if (maxSpellLevel && slotCount) {
          const key = `c${maxSpellLevel}` as typeof SPELL_LEVELS[number]
          slots[key] = { max: slotCount, spent: Math.min(spellcasting.spell_slots[key]?.spent ?? 0, slotCount) }
        }
      }

      spellcasting = { ...spellcasting, spell_slots: slots }
    }
  }

  return { ...sheet, spellcasting }
}

export function recalculate(sheet: CharacterSheet): CharacterSheet {
  const profBonus = calcProfBonus(sheet.identity.level)

  const withModifiers = recalculateModifiers(sheet)
  const withCombat = recalculateCombat(withModifiers, profBonus)
  const withSkills = recalculateSkills(withCombat, profBonus)
  const withSpellcasting = recalculateSpellcasting(withSkills, profBonus)

  return withSpellcasting
}
