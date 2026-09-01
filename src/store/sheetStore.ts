import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type { CharacterSheet, AbilityId, FreeCast, InventoryItem } from '../types'
import { createInitialSheet } from '../lib/initialSheet'
import { recalculate } from '../lib/recalculate'
import { migrateSheet } from '../lib/migrateSheet'
import { ABILITIES, calcPrimaryClassLevel, canChooseSubclass } from '../lib/calculations'
import {
  saveSheet,
  loadSheet as loadSheetFromStorage,
  deleteSheet as deleteSheetFromStorage,
  listSheets,
} from '../services/sheetStorage'
import { gameDataPt as gameData } from '../data/rules'
import { getItems } from '../data/items'
import {
  DEBOUNCE_SAVE_MS,
  MAX_EXHAUSTION,
  FIXED_LANGUAGES_BY_CLASS,
  MULTICLASS_PROFICIENCIES,
  CASTER_TYPE,
  FEAT_SOURCE_MANUAL,
  FEAT_SOURCE_SPECIES,
  ITEMS_RESTORING_PACT_SLOT,
  ITEMS_RESTORING_SPELL_SLOT,
} from '../constants'

export interface SheetListItem {
  id: string
  name: string
  charClass: string
  species: string
  level: number
  updatedAt: string
  complete?: boolean
}

interface SheetStore {
  sheet: CharacterSheet
  sheetId: string | null
  currentStep: number
  savedSheets: SheetListItem[]
  completeSheet: boolean
  abilityRolls: number[]
  setAbilityRolls: (vals: number[]) => void
  /** AVAs distribuídos no passo de atributos — a ficha só guarda o total já somado. */
  abilityAsi: Partial<Record<AbilityId, number>>
  setAbilityAsi: (dist: Partial<Record<AbilityId, number>>) => void

  // Wizard
  setLevel: (level: number) => void
  setCharClass: (classId: string) => void
  setSubclass: (subclassId: string | null) => void
  setSpecies: (speciesId: string, lineageId?: string) => void
  setSpeciesOriginFeat: (featId: string | null) => void
  addFeat: (featId: string) => void
  removeFeat: (featId: string) => void
  setBackgroundId: (backgroundId: string) => void
  setBackground: (backgroundId: string, distribution: Partial<Record<AbilityId, number>>) => void
  setAbilities: (values: Partial<Record<AbilityId, number>>, method?: string) => void
  setSkills: (skillIds: string[]) => void
  setClassChoices: (choices: {
    fighting_style?: string | null
    divine_order?: string | null
    primal_order?: string | null
    favored_enemy?: string | null
  }) => void
  setExpertise: (skillIds: string[]) => void
  setLanguages: (languages: string[]) => void
  setProficiencies: (p: Partial<CharacterSheet['proficiencies']>) => void
  setSpeed: (speed: Partial<Pick<CharacterSheet['combat']['speed'], 'base_meters' | 'bonus_meters'>>) => void
  setEquipment: (option: 'A' | 'B', items: InventoryItem[]) => void
  setPersonality: (p: Partial<CharacterSheet['personality']>) => void
  setIdentity: (id: Partial<CharacterSheet['identity']>) => void
  setStep: (step: number) => void

  // Ficha em jogo
  updateHp: (delta: number) => void
  updateTempHp: (val: number) => void
  spendHitDie: () => void
  spendSlot: (level: keyof CharacterSheet['spellcasting']['spell_slots']) => void
  restoreSlot: (level: keyof CharacterSheet['spellcasting']['spell_slots']) => void
  spendPactSlot: () => void
  restorePactSlot: () => void
  spendFreeCast: (id: string) => void
  restoreFreeCast: (id: string) => void
  setFreeCastChoices: (
    id: string,
    choices: Partial<Pick<FreeCast, 'spell_list' | 'ability' | 'cantrips' | 'spell'>>,
  ) => void
  shortRest: () => void
  longRest: () => void
  updateResource: (resource: string, delta: number) => void
  toggleCondition: (condition: string) => void
  setExhaustion: (n: number) => void
  setNotes: (notes: string) => void
  addAttack: (attack: CharacterSheet['combat']['attacks'][0]) => void
  removeAttack: (idx: number) => void
  addItem: (item: InventoryItem) => void
  removeItem: (idx: number) => void
  updateItem: (idx: number, item: Partial<InventoryItem>) => void
  /** `slotLevel` só é usado pelos itens que devolvem um espaço de Conjuração (Pérola do Poder). */
  spendItemUse: (idx: number, slotLevel?: number) => void
  restoreItemUse: (idx: number) => void
  updateCoins: (coins: Partial<CharacterSheet['inventory']['coins']>) => void
  toggleShield: () => void
  setArmor: (armorId: string | null) => void
  updateSpellcasting: (partial: Partial<Pick<CharacterSheet['spellcasting'], 'cantrips_by_class' | 'spells_by_class'>>) => void
  addXP: (amount: number) => void
  levelUp: (newLevel: number, asi?: Partial<Record<AbilityId, number>>, targetClassId?: string, featId?: string, expertises?: string[]) => void
  addMulticlass: (classId: string) => void
  removeMulticlass: (classId: string) => void
  setMulticlassLevel: (classId: string, level: number) => void
  setMulticlassSubclass: (classId: string, subclassId: string | null) => void

  // Persistência
  recalculateAll: () => void
  saveLocal: () => void
  exportSheetJson: () => string
  importSheetJson: (json: string) => void
  loadSheet: (id: string) => void
  newSheet: () => void
  deleteSheet: (id: string) => void
  reset: () => void
  loadSavedList: () => void
}

function updateCombat(sheet: CharacterSheet, partial: Partial<CharacterSheet['combat']>): CharacterSheet {
  return { ...sheet, combat: { ...sheet.combat, ...partial } }
}

export const useSheetStore = create<SheetStore>((set, get) => ({
  sheet: createInitialSheet(),
  sheetId: null,
  currentStep: 1,
  savedSheets: [],
  completeSheet: false,
  abilityRolls: [],
  setAbilityRolls: vals => set({ abilityRolls: vals }),
  abilityAsi: {},
  setAbilityAsi: dist => set({ abilityAsi: dist }),

  setLevel: level =>
    set(s => ({ sheet: recalculate({ ...s.sheet, identity: { ...s.sheet.identity, level } }) })),

  setCharClass: classId =>
    set(s => {
      const charClass = gameData.classes.find(c => c.id === classId)
      if (!charClass) return s

      const existingLanguages = s.sheet.proficiencies.languages
      const classLanguages = FIXED_LANGUAGES_BY_CLASS[classId] ?? []
      const languages = [
        ...existingLanguages.filter(i => !Object.values(FIXED_LANGUAGES_BY_CLASS).flat().includes(i)),
        ...classLanguages,
      ]

      const background = gameData.backgrounds?.find(a => a.id === s.sheet.identity.background_id)
      const backgroundSkills = background?.skills ?? []
      const skills = { ...s.sheet.skills }
      Object.keys(skills).forEach(skillId => {
        if (backgroundSkills.includes(skillId)) return
        skills[skillId] = { ...skills[skillId], proficient: false }
      })

      const sheet: CharacterSheet = {
        ...s.sheet,
        identity: { ...s.sheet.identity, class_id: classId, subclass_id: null, multiclasses: [] },
        skills,
        proficiencies: {
          ...s.sheet.proficiencies,
          armors: charClass.armors,
          weapons: charClass.weapons,
          tools: charClass.tools,
          languages,
        },
        spellcasting: {
          ...s.sheet.spellcasting,
          spellcaster: charClass.spellcaster,
          spellcasting_ability: charClass.spellcasting_ability ?? null,
          cantrips_by_class: {},
          spells_by_class: {},
        },
      }

      return { sheet: recalculate(sheet) }
    }),

  setSubclass: subclassId =>
    set(s => {
      const identity = s.sheet.identity
      const primaryLevel = calcPrimaryClassLevel(identity.level, identity.multiclasses ?? [])
      if (subclassId && !canChooseSubclass(primaryLevel)) return s
      return { sheet: { ...s.sheet, identity: { ...identity, subclass_id: subclassId } } }
    }),

  setSpecies: (speciesId, lineageId) =>
    set(s => {
      const species = gameData.species?.find(e => e.id === speciesId)
      if (!species) return s

      const speciesTraits = species.traits.map(t => ({
        name: t.name,
        description: t.description,
        max_uses: t.max_uses,
        current_uses: typeof t.max_uses === 'number' ? t.max_uses : undefined,
      }))

      const lineage = lineageId
        ? species.lineages?.find(l => l.id === lineageId)
        : undefined

      const lineageTraits = lineage?.traits?.map(t => ({
        name: t.name,
        description: t.description,
        max_uses: t.max_uses,
        current_uses: typeof t.max_uses === 'number' ? t.max_uses : undefined,
      })) ?? []

      const sheet: CharacterSheet = {
        ...s.sheet,
        identity: { ...s.sheet.identity, species_id: speciesId, lineage_id: lineageId ?? null },
        // Trocar de espécie descarta o Talento de Origem concedido pela anterior.
        feats: { list: s.sheet.feats.list.filter(f => f.source !== FEAT_SOURCE_SPECIES) },
        species_traits: {
          darkvision_meters: species.darkvision ?? null,
          active_traits: [...speciesTraits, ...lineageTraits],
          choices_made: {},
        },
        combat: {
          ...s.sheet.combat,
          speed: { ...s.sheet.combat.speed, base_meters: species.speed },
        },
      }

      return { sheet: recalculate(sheet) }
    }),

  /**
   * Talento de Origem concedido pela espécie (Versátil, do Humano). Só um por
   * personagem: a escolha anterior é substituída.
   */
  setSpeciesOriginFeat: featId =>
    set(s => {
      const kept = s.sheet.feats.list.filter(f => f.source !== FEAT_SOURCE_SPECIES)
      const feat = featId ? gameData.origin_feats?.find(f => f.id === featId) : null
      const list = feat
        ? [
            ...kept,
            {
              feat_id: feat.id,
              name: feat.name,
              category: 'Origem',
              source: FEAT_SOURCE_SPECIES,
              choices: {},
            },
          ]
        : kept
      return { sheet: recalculate({ ...s.sheet, feats: { list } }) }
    }),

  /**
   * Talento adicionado à mão na aba Editar — para o que a ficha não deriva
   * sozinha (talento de subclasse, prêmio de campanha, correção de importação).
   */
  addFeat: featId =>
    set(s => {
      if (s.sheet.feats.list.some(f => f.feat_id === featId)) return s
      const origin = gameData.origin_feats?.find(f => f.id === featId)
      const general = gameData.general_feats?.find(f => f.id === featId)
      const feat = origin ?? general
      if (!feat) return s
      return {
        sheet: recalculate({
          ...s.sheet,
          feats: {
            list: [
              ...s.sheet.feats.list,
              {
                feat_id: feat.id,
                name: feat.name,
                category: origin ? 'Origem' : 'Geral',
                source: FEAT_SOURCE_MANUAL,
                choices: {},
              },
            ],
          },
        }),
      }
    }),

  removeFeat: featId =>
    set(s => ({
      sheet: recalculate({
        ...s.sheet,
        feats: { list: s.sheet.feats.list.filter(f => f.feat_id !== featId) },
      }),
    })),

  setBackgroundId: backgroundId =>
    set(s => ({
      sheet: { ...s.sheet, identity: { ...s.sheet.identity, background_id: backgroundId } },
    })),

  setBackground: (backgroundId, distribution) =>
    set(s => {
      const background = gameData.backgrounds?.find(a => a.id === backgroundId)
      if (!background) return s

      // Clear previous antecedente pericias, then apply new ones
      const previousBackground = gameData.backgrounds?.find(a => a.id === s.sheet.identity.background_id)
      const previousBackgroundSkills = previousBackground?.skills ?? []
      const skills = { ...s.sheet.skills }
      Object.keys(skills).forEach(skillId => {
        if (previousBackgroundSkills.includes(skillId)) skills[skillId] = { ...skills[skillId], proficient: false }
      })
      background.skills.forEach(skillId => {
        if (skills[skillId]) skills[skillId] = { ...skills[skillId], proficient: true }
      })

      // Remove old antecedente talent, add new one
      const previousFeatId = previousBackground?.feat
      const baseList = s.sheet.feats.list.filter(t => t.feat_id !== previousFeatId)
      // "Iniciado em Magia (Clérigo)" traz a lista entre parênteses, e o catálogo
      // de talentos guarda só "Iniciado em Magia" — sem tirar o sufixo, esses três
      // antecedentes não concediam talento nenhum. O rótulo completo continua sendo
      // o id gravado, porque é dele que `recalculateFreeCasts` tira a lista.
      const featLabel = background.feat
      const featBase = featLabel?.replace(/\s*\([^)]*\)\s*$/, '').trim()
      const featData = gameData.origin_feats?.find(
        t => t.id === featLabel || t.name === featLabel || t.name === featBase,
      )
      const featAlreadyAdded = baseList.some(t => t.feat_id === featLabel)
      const feats = featData && !featAlreadyAdded
        ? [...baseList, { feat_id: featLabel, name: featLabel, category: 'Origem', source: 'Antecedente', choices: {} }]
        : baseList

      // Undo previous attribute distribution, then apply new one
      const abilities = { ...s.sheet.abilities }
      const previousDistribution = s.sheet.identity.background_distribution ?? {}
      Object.entries(previousDistribution).forEach(([attr, bonus]) => {
        const a = attr as AbilityId
        abilities[a] = { ...abilities[a], value: (abilities[a].value ?? 0) - (bonus ?? 0) }
      })
      Object.entries(distribution).forEach(([attr, bonus]) => {
        const a = attr as AbilityId
        abilities[a] = { ...abilities[a], value: (abilities[a].value ?? 0) + (bonus ?? 0) }
      })

      return {
        sheet: recalculate({
          ...s.sheet,
          identity: {
            ...s.sheet.identity,
            background_id: backgroundId,
            background_distribution: distribution,
          },
          skills,
          feats: { list: feats },
          abilities,
        }),
      }
    }),

  setAbilities: (values, method) =>
    set(s => {
      const abilities = { ...s.sheet.abilities }
      ABILITIES.forEach(a => {
        if (values[a] !== undefined) {
          abilities[a] = { ...abilities[a], value: values[a]! }
        }
      })
      if (method) abilities.generation_method = method
      return { sheet: recalculate({ ...s.sheet, abilities }) }
    }),

  setClassChoices: choices =>
    set(s => {
      const classId = s.sheet.identity.class_id ?? ''
      const charClass = gameData.classes.find(c => c.id === classId)
      if (!charClass) return s

      const multiclasses = s.sheet.identity.multiclasses ?? []

      // Rebuild proficiencias from class base + multiclasse + nova ordem
      const merge = (arr: string[], newValues: string[]) => [...new Set([...arr, ...newValues])]
      let armors = [...charClass.armors]
      let weapons = [...charClass.weapons]
      multiclasses.forEach(m => {
        const p = MULTICLASS_PROFICIENCIES[m.class_id] ?? {}
        if (p.armors) armors = merge(armors, p.armors)
        if (p.weapons) weapons = merge(weapons, p.weapons)
      })

      const newDivineOrder = 'divine_order' in choices ? choices.divine_order : s.sheet.class_features.divine_order
      const newPrimalOrder = 'primal_order' in choices ? choices.primal_order : s.sheet.class_features.primal_order

      const divineOrder = newDivineOrder ? gameData.divine_orders?.find(o => o.id === newDivineOrder) : null
      const primalOrder = newPrimalOrder ? gameData.primal_orders?.find(o => o.id === newPrimalOrder) : null

      if (divineOrder?.armor_profs) armors = merge(armors, divineOrder.armor_profs)
      if (divineOrder?.weapon_profs) weapons = merge(weapons, divineOrder.weapon_profs)
      if (primalOrder?.armor_profs) armors = merge(armors, primalOrder.armor_profs)
      if (primalOrder?.weapon_profs) weapons = merge(weapons, primalOrder.weapon_profs)

      // Expertise em perícia concedida pela ordem (Arcanismo para taumaturgo/mágico)
      const skills = { ...s.sheet.skills }
      const orderSkillProf = divineOrder?.skill_prof ?? primalOrder?.skill_prof ?? null
      if (orderSkillProf && skills[orderSkillProf]) {
        const alreadyProficient = skills[orderSkillProf].proficient
        skills[orderSkillProf] = {
          ...skills[orderSkillProf],
          proficient: true,
          expertise: alreadyProficient,
        }
      }

      return {
        sheet: recalculate({
          ...s.sheet,
          proficiencies: { ...s.sheet.proficiencies, armors, weapons },
          skills,
          class_features: {
            ...s.sheet.class_features,
            fighting_style: 'fighting_style' in choices ? choices.fighting_style ?? null : s.sheet.class_features.fighting_style,
            divine_order: newDivineOrder ?? null,
            primal_order: newPrimalOrder ?? null,
            favored_enemy: 'favored_enemy' in choices ? choices.favored_enemy ?? null : s.sheet.class_features.favored_enemy,
          },
        }),
      }
    }),

  setExpertise: skillIds =>
    set(s => {
      const skills = { ...s.sheet.skills }
      Object.keys(skills).forEach(skillId => {
        skills[skillId] = { ...skills[skillId], expertise: skillIds.includes(skillId) }
      })
      return { sheet: recalculate({ ...s.sheet, skills }) }
    }),

  setSkills: skillIds =>
    set(s => {
      const background = gameData.backgrounds?.find(a => a.id === s.sheet.identity.background_id)
      const backgroundSkills = background?.skills ?? []
      const skills = { ...s.sheet.skills }

      Object.keys(skills).forEach(skillId => {
        if (backgroundSkills.includes(skillId)) return
        skills[skillId] = { ...skills[skillId], proficient: skillIds.includes(skillId) }
      })

      return { sheet: recalculate({ ...s.sheet, skills }) }
    }),

  setLanguages: languages =>
    set(s => ({
      sheet: { ...s.sheet, proficiencies: { ...s.sheet.proficiencies, languages } },
    })),

  setProficiencies: p =>
    set(s => ({
      sheet: { ...s.sheet, proficiencies: { ...s.sheet.proficiencies, ...p } },
    })),

  // Deslocamento base vem da espécie e o bônus de itens/talentos; ambos são
  // editáveis, mas `_total_meters` só é escrito por `recalculate`.
  setSpeed: speed =>
    set(s => ({
      sheet: recalculate(
        updateCombat(s.sheet, { speed: { ...s.sheet.combat.speed, ...speed } }),
      ),
    })),

  setEquipment: (option, items) =>
    set(s => ({
      sheet: {
        ...s.sheet,
        identity: { ...s.sheet.identity, equipment_option: option },
        inventory: { ...s.sheet.inventory, items },
      },
    })),

  setPersonality: p =>
    set(s => ({
      sheet: { ...s.sheet, personality: { ...s.sheet.personality, ...p } },
    })),

  setIdentity: id =>
    set(s => ({
      sheet: recalculate({ ...s.sheet, identity: { ...s.sheet.identity, ...id } }),
    })),

  setStep: step => set({ currentStep: step }),

  updateHp: delta =>
    set(s => {
      const { max, temporary, current } = s.sheet.combat.hit_points
      const newCurrent = Math.max(0, Math.min((max ?? 0) + temporary, current + delta))
      return {
        sheet: updateCombat(s.sheet, {
          hit_points: { ...s.sheet.combat.hit_points, current: newCurrent },
        }),
      }
    }),

  updateTempHp: val =>
    set(s => ({
      sheet: updateCombat(s.sheet, {
        hit_points: { ...s.sheet.combat.hit_points, temporary: Math.max(0, val) },
      }),
    })),

  spendHitDie: () =>
    set(s => {
      const dv = s.sheet.combat.hit_dice
      const max_hp = s.sheet.combat.hit_points.max ?? 0

      if (!dv.total || dv.spent >= dv.total || s.sheet.combat.hit_points.current >= max_hp) return s
      
      let vida = s.sheet.combat.hit_points.current
      const gameData = Number(s.sheet.combat.hit_dice.type?.split('d')[1])

      vida = Math.min(Math.floor((vida + Math.random() * (gameData - 1 + 1) + 1)), max_hp);

      return {
        sheet: updateCombat(s.sheet, {
          hit_dice: { ...dv, spent: dv.spent + 1 },
          hit_points: { ...s.sheet.combat.hit_points, current: vida }
        }),
      }
    }),

  spendSlot: level =>
    set(s => {
      const slot = s.sheet.spellcasting.spell_slots[level]
      if (slot.spent >= slot.max) return s
      return {
        sheet: {
          ...s.sheet,
          spellcasting: {
            ...s.sheet.spellcasting,
            spell_slots: {
              ...s.sheet.spellcasting.spell_slots,
              [level]: { ...slot, spent: slot.spent + 1 },
            },
          },
        },
      }
    }),

  restoreSlot: level =>
    set(s => {
      const slot = s.sheet.spellcasting.spell_slots[level]
      if (slot.spent <= 0) return s
      return {
        sheet: {
          ...s.sheet,
          spellcasting: {
            ...s.sheet.spellcasting,
            spell_slots: {
              ...s.sheet.spellcasting.spell_slots,
              [level]: { ...slot, spent: slot.spent - 1 },
            },
          },
        },
      }
    }),

  // Magia de Pacto tem reserva própria: nunca some nem divide com `spell_slots`.
  spendPactSlot: () =>
    set(s => {
      const pact = s.sheet.spellcasting.pact_slots
      if (pact.spent >= pact.max) return s
      return {
        sheet: {
          ...s.sheet,
          spellcasting: { ...s.sheet.spellcasting, pact_slots: { ...pact, spent: pact.spent + 1 } },
        },
      }
    }),

  restorePactSlot: () =>
    set(s => {
      const pact = s.sheet.spellcasting.pact_slots
      if (pact.spent <= 0) return s
      return {
        sheet: {
          ...s.sheet,
          spellcasting: { ...s.sheet.spellcasting, pact_slots: { ...pact, spent: pact.spent - 1 } },
        },
      }
    }),

  spendFreeCast: id =>
    set(s => {
      const casts = s.sheet.spellcasting.free_casts ?? []
      const cast = casts.find(c => c.id === id)
      if (!cast || cast.spent >= cast.max) return s
      return {
        sheet: {
          ...s.sheet,
          spellcasting: {
            ...s.sheet.spellcasting,
            free_casts: casts.map(c => (c.id === id ? { ...c, spent: c.spent + 1 } : c)),
          },
        },
      }
    }),

  restoreFreeCast: id =>
    set(s => {
      const casts = s.sheet.spellcasting.free_casts ?? []
      const cast = casts.find(c => c.id === id)
      if (!cast || cast.spent <= 0) return s
      return {
        sheet: {
          ...s.sheet,
          spellcasting: {
            ...s.sheet.spellcasting,
            free_casts: casts.map(c => (c.id === id ? { ...c, spent: c.spent - 1 } : c)),
          },
        },
      }
    }),

  setFreeCastChoices: (id, choices) =>
    set(s => {
      const casts = (s.sheet.spellcasting.free_casts ?? []).map(c => {
        if (c.id !== id) return c
        const next = { ...c, ...choices }
        // Trocar de lista descarta os truques e a magia escolhidos na anterior —
        // mas não o que vier junto nesta mesma chamada.
        if (choices.spell_list !== undefined && choices.spell_list !== c.spell_list) {
          if (choices.cantrips === undefined) next.cantrips = []
          if (choices.spell === undefined) next.spell = null
        }
        return next
      })
      return {
        sheet: recalculate({
          ...s.sheet,
          spellcasting: { ...s.sheet.spellcasting, free_casts: casts },
        }),
      }
    }),

  // Descanso Curto devolve os espaços de pacto (PHB 2024, Magia de Pacto);
  // os espaços de Conjuração só voltam no Descanso Longo.
  shortRest: () =>
    set(s => ({
      sheet: {
        ...updateCombat(s.sheet, {
          hit_dice: { ...s.sheet.combat.hit_dice, spent: 0 },
        }),
        spellcasting: {
          ...s.sheet.spellcasting,
          pact_slots: { ...s.sheet.spellcasting.pact_slots, spent: 0 },
        },
      },
    })),

  longRest: () =>
    set(s => {
      const maxHp = s.sheet.combat.hit_points.max ?? 0

      const restoredSlots = Object.fromEntries(
        Object.entries(s.sheet.spellcasting.spell_slots).map(([k, v]) => [k, { ...v, spent: 0 }]),
      ) as CharacterSheet['spellcasting']['spell_slots']

      const r = { ...s.sheet.class_features.class_resources }
      if (r.rages.max) r.rages = { ...r.rages, current: r.rages.max }
      if (r.wild_shapes.max) r.wild_shapes = { ...r.wild_shapes, current: r.wild_shapes.max }
      if (r.channel_divinity.max) r.channel_divinity = { ...r.channel_divinity, current: r.channel_divinity.max }
      if (r.lay_on_hands.hp_pool) r.lay_on_hands = { ...r.lay_on_hands, current: r.lay_on_hands.hp_pool }
      if (r.sorcery_points.max) r.sorcery_points = { ...r.sorcery_points, current: r.sorcery_points.max }
      if (r.focus_points.max) r.focus_points = { ...r.focus_points, current: r.focus_points.max }
      if (r.bardic_inspiration.max) r.bardic_inspiration = { ...r.bardic_inspiration, current: r.bardic_inspiration.max }

      // Itens de recarga diária: o Descanso Longo é o único marcador de virada de
      // dia que a ficha tem. Os de recarga lenta (`manual`) ficam como estão.
      const catalog = getItems()
      const restoredItems = s.sheet.inventory.items.map(it => {
        if (!it.item_id || !it.uses_spent) return it
        const catalogItem = catalog.find(i => i.id === it.item_id)
        const uses = (catalogItem as { uses?: { recharge: string } } | undefined)?.uses
        return uses?.recharge === 'dawn' ? { ...it, uses_spent: 0 } : it
      })

      return {
        sheet: {
          ...s.sheet,
          inventory: { ...s.sheet.inventory, items: restoredItems },
          combat: {
            ...s.sheet.combat,
            hit_points: { ...s.sheet.combat.hit_points, current: maxHp, temporary: 0 },
            hit_dice: { ...s.sheet.combat.hit_dice, spent: 0 },
          },
          spellcasting: {
            ...s.sheet.spellcasting,
            spell_slots: restoredSlots,
            pact_slots: { ...s.sheet.spellcasting.pact_slots, spent: 0 },
            free_casts: (s.sheet.spellcasting.free_casts ?? []).map(c => ({ ...c, spent: 0 })),
          },
          class_features: { ...s.sheet.class_features, class_resources: r },
        },
      }
    }),

  updateResource: (resource, delta) =>
    set(s => {
      const r = s.sheet.class_features.class_resources
      const res = r[resource as keyof typeof r]

      if (!res || typeof res !== 'object' || !('current' in res) || res.current === null) return s

      const maxVal = 'max' in res ? (res.max as number | null) : null
      const newCurrent = Math.max(0, Math.min(maxVal ?? Infinity, (res.current as number) + delta))

      return {
        sheet: {
          ...s.sheet,
          class_features: {
            ...s.sheet.class_features,
            class_resources: {
              ...r,
              [resource]: { ...res, current: newCurrent },
            } as typeof r,
          },
        },
      }
    }),

  toggleCondition: condition =>
    set(s => {
      const cs = s.sheet.active_conditions
      const newConditions = cs.includes(condition)
        ? cs.filter(c => c !== condition)
        : [...cs, condition]
      return { sheet: { ...s.sheet, active_conditions: newConditions } }
    }),

  setExhaustion: n =>
    set(s => ({ sheet: { ...s.sheet, exhaustion_levels: Math.max(0, Math.min(MAX_EXHAUSTION, n)) } })),

  setNotes: notes =>
    set(s => ({ sheet: { ...s.sheet, notes } })),

  addAttack: attack =>
    set(s => ({
      sheet: updateCombat(s.sheet, {
        attacks: [...s.sheet.combat.attacks, attack],
      }),
    })),

  removeAttack: idx =>
    set(s => ({
      sheet: updateCombat(s.sheet, {
        attacks: s.sheet.combat.attacks.filter((_, i) => i !== idx),
      }),
    })),

  addItem: item =>
    set(s => ({
      sheet: { ...s.sheet, inventory: { ...s.sheet.inventory, items: [...s.sheet.inventory.items, item] } },
    })),

  removeItem: idx =>
    set(s => ({
      sheet: { ...s.sheet, inventory: { ...s.sheet.inventory, items: s.sheet.inventory.items.filter((_, i) => i !== idx) } },
    })),

  updateItem: (idx, item) =>
    set(s => ({
      sheet: {
        ...s.sheet,
        inventory: {
          ...s.sheet.inventory,
          items: s.sheet.inventory.items.map((it, i) => (i === idx ? { ...it, ...item } : it)),
        },
      },
    })),

  /**
   * Gasta um uso de um item mágico. O máximo vem do catálogo; aqui só se conta o
   * gasto. O Bastão do Guardião do Pacto devolve um espaço de pacto no mesmo ato.
   */
  spendItemUse: (idx, slotLevel) =>
    set(s => {
      const item = s.sheet.inventory.items[idx]
      if (!item?.item_id) return s
      const catalogItem = getItems().find(i => i.id === item.item_id)
      const max = (catalogItem as { uses?: { max: number } } | undefined)?.uses?.max ?? 0
      const spent = item.uses_spent ?? 0
      if (max <= 0 || spent >= max) return s

      let spellcasting = s.sheet.spellcasting

      // Pérola do Poder e afins: gastar o uso devolve um espaço de Conjuração do
      // círculo escolhido. Sem círculo válido e gasto, o uso não é consumido.
      const maxSlotLevel = ITEMS_RESTORING_SPELL_SLOT[item.item_id]
      if (maxSlotLevel != null) {
        if (!slotLevel || slotLevel < 1 || slotLevel > maxSlotLevel) return s
        const key = `c${slotLevel}` as keyof typeof spellcasting.spell_slots
        const slot = spellcasting.spell_slots[key]
        if (!slot || slot.spent <= 0) return s
        spellcasting = {
          ...spellcasting,
          spell_slots: { ...spellcasting.spell_slots, [key]: { ...slot, spent: slot.spent - 1 } },
        }
      }

      // Bastão do Guardião do Pacto: devolve um espaço de pacto, sem escolha.
      const pact = spellcasting.pact_slots
      if (ITEMS_RESTORING_PACT_SLOT.includes(item.item_id) && pact.spent > 0) {
        spellcasting = { ...spellcasting, pact_slots: { ...pact, spent: pact.spent - 1 } }
      }

      return {
        sheet: {
          ...s.sheet,
          inventory: {
            ...s.sheet.inventory,
            items: s.sheet.inventory.items.map((it, i) =>
              i === idx ? { ...it, uses_spent: spent + 1 } : it,
            ),
          },
          spellcasting,
        },
      }
    }),

  restoreItemUse: idx =>
    set(s => {
      const item = s.sheet.inventory.items[idx]
      const spent = item?.uses_spent ?? 0
      if (spent <= 0) return s
      return {
        sheet: {
          ...s.sheet,
          inventory: {
            ...s.sheet.inventory,
            items: s.sheet.inventory.items.map((it, i) =>
              i === idx ? { ...it, uses_spent: spent - 1 } : it,
            ),
          },
        },
      }
    }),

  updateCoins: coins =>
    set(s => ({
      sheet: { ...s.sheet, inventory: { ...s.sheet.inventory, coins: { ...s.sheet.inventory.coins, ...coins } } },
    })),

  toggleShield: () =>
    set(s => {
      const alreadyEquipped = s.sheet.combat.armor_class.shield_equipped
      if (!alreadyEquipped) {
        const hasShield = s.sheet.inventory.items.some(i => i.category === 'Escudo')
        if (!hasShield) return s
      }
      return {
        sheet: recalculate(updateCombat(s.sheet, {
          armor_class: {
            ...s.sheet.combat.armor_class,
            shield_equipped: !alreadyEquipped,
          },
        })),
      }
    }),

  setArmor: armorId =>
    set(s => ({
      sheet: recalculate(updateCombat(s.sheet, {
        armor_class: { ...s.sheet.combat.armor_class, equipped_armor_id: armorId },
      })),
    })),

  updateSpellcasting: partial =>
    set(s => ({
      sheet: recalculate({ ...s.sheet, spellcasting: { ...s.sheet.spellcasting, ...partial } }),
    })),

  addXP: amount =>
    set(s => ({
      sheet: { ...s.sheet, identity: { ...s.sheet.identity, xp: s.sheet.identity.xp + amount } },
    })),

  levelUp: (newLevel, asi, targetClassId, featId, expertises) =>
    set(s => {
      const multiclasses = s.sheet.identity.multiclasses ?? []
      const isSecondary = targetClassId ? multiclasses.some(m => m.class_id === targetClassId) : false

      // Incrementa nível da classe alvo
      const newMulticlasses = isSecondary
        ? multiclasses.map(m =>
            m.class_id === targetClassId ? { ...m, level: m.level + 1 } : m,
          )
        : multiclasses

      // Classe e nível relevantes para lookup de progressão
      const lookupClassId = targetClassId ?? s.sheet.identity.class_id
      const targetClass = gameData.classes.find(c => c.id === lookupClassId)
      const levelInClass = isSecondary
        ? (newMulticlasses.find(m => m.class_id === targetClassId)?.level ?? 1)
        : newLevel - newMulticlasses.reduce((sum, m) => sum + m.level, 0)

      const progEntry = targetClass?.progression.find(
        (p: { level: number }) => p.level === levelInClass,
      ) as (Record<string, unknown> & { level: number }) | undefined
      void progEntry

      let abilities = s.sheet.abilities
      if (asi) {
        Object.entries(asi).forEach(([attr, bonus]) => {
          const a = attr as AbilityId
          const current = abilities[a].value ?? 10
          abilities = { ...abilities, [a]: { ...abilities[a], value: Math.min(20, current + (bonus ?? 0)) } }
        })
      }

      let feats = s.sheet.feats
      if (featId) {
        const feat = gameData.general_feats?.find(t => t.id === featId)
        if (feat) {
          feats = {
            list: [
              ...s.sheet.feats.list,
              { feat_id: featId, name: feat.name, category: 'Geral', source: `nivel_${newLevel}`, choices: {} },
            ],
          }
        }
      }

      let skills = s.sheet.skills
      if (expertises && expertises.length > 0) {
        expertises.forEach(skillId => {
          if (skills[skillId]?.proficient) {
            skills = { ...skills, [skillId]: { ...skills[skillId], expertise: true } }
          }
        })
      }

      // recalcular já aplica calcSlotsMulticlasse quando há multiclasses
      const sheet = recalculate({
        ...s.sheet,
        identity: { ...s.sheet.identity, level: newLevel, multiclasses: newMulticlasses },
        abilities,
        feats,
        skills,
      })

      return { sheet }
    }),

  addMulticlass: classId =>
    set(s => {
      const multi = s.sheet.identity.multiclasses ?? []
      if (classId === s.sheet.identity.class_id) return s
      if (multi.some(m => m.class_id === classId)) return s
      if (s.sheet.identity.level < 2) return s

      const newClass = gameData.classes.find(c => c.id === classId)
      if (!newClass) return s

      const partial = MULTICLASS_PROFICIENCIES[classId] ?? {}
      const prof = s.sheet.proficiencies
      const merge = (arr: string[], newValues?: string[]) =>
        newValues ? [...new Set([...arr, ...newValues])] : arr

      // Conjuração: se a nova classe for conjuradora e a primária não for, atualizar
      const currentCaster = s.sheet.spellcasting.spellcaster
      const newIsCaster = CASTER_TYPE[classId] != null
      const newCaster = currentCaster || newIsCaster
      const newCastingAbility = currentCaster
        ? s.sheet.spellcasting.spellcasting_ability
        : newIsCaster
          ? ((newClass as { spellcasting_ability?: string })?.spellcasting_ability as typeof s.sheet.spellcasting.spellcasting_ability ?? null)
          : s.sheet.spellcasting.spellcasting_ability

      const sheet: CharacterSheet = {
        ...s.sheet,
        identity: {
          ...s.sheet.identity,
          multiclasses: [...multi, { class_id: classId, subclass_id: null, level: 1 }],
        },
        proficiencies: {
          ...prof,
          armors: merge(prof.armors, partial.armors),
          weapons: merge(prof.weapons, partial.weapons),
          tools: merge(prof.tools, partial.tools),
        },
        spellcasting: {
          ...s.sheet.spellcasting,
          spellcaster: newCaster,
          spellcasting_ability: newCastingAbility,
        },
      }
      return { sheet: recalculate(sheet) }
    }),

  removeMulticlass: classId =>
    set(s => {
      const multi = s.sheet.identity.multiclasses ?? []
      const entry = multi.find(m => m.class_id === classId)
      if (!entry) return s

      const newMulticlass = multi.filter(m => m.class_id !== classId)

      // Reverte proficiências parciais (apenas as que não existem em nenhuma outra classe)
      const partial = MULTICLASS_PROFICIENCIES[classId] ?? {}
      const prof = s.sheet.proficiencies
      const primaryClass = gameData.classes.find(c => c.id === s.sheet.identity.class_id)
      const otherMulticlasses = newMulticlass.map(m => m.class_id)
      const survivingProfs = [
        ...(primaryClass?.armors ?? []),
        ...otherMulticlasses.flatMap(id => MULTICLASS_PROFICIENCIES[id]?.armors ?? []),
      ]
      const survivingWeapons = [
        ...(primaryClass?.weapons ?? []),
        ...otherMulticlasses.flatMap(id => MULTICLASS_PROFICIENCIES[id]?.weapons ?? []),
      ]

      const remove = (arr: string[], rem?: string[], surviving?: string[]) =>
        rem ? arr.filter(x => !rem.includes(x) || (surviving ?? []).includes(x)) : arr

      // Recomputa conjurador após remoção
      const primaryCaster = CASTER_TYPE[s.sheet.identity.class_id ?? ''] != null
      const multiclassCasterLevel = newMulticlass.some(m => CASTER_TYPE[m.class_id] != null)
      const newCaster = primaryCaster || multiclassCasterLevel

      const primaryClassObj = gameData.classes.find(c => c.id === s.sheet.identity.class_id)
      const primaryCastingAbility = (primaryClassObj as { spellcasting_ability?: string } | undefined)?.spellcasting_ability as typeof s.sheet.spellcasting.spellcasting_ability ?? null
      const newCastingAbility = primaryCaster
        ? primaryCastingAbility
        : newMulticlass
            .map(m => {
              const c = gameData.classes.find(cc => cc.id === m.class_id)
              return CASTER_TYPE[m.class_id] != null
                ? ((c as { spellcasting_ability?: string } | undefined)?.spellcasting_ability as typeof s.sheet.spellcasting.spellcasting_ability ?? null)
                : null
            })
            .find(Boolean) ?? null

      const sheet: CharacterSheet = {
        ...s.sheet,
        identity: { ...s.sheet.identity, multiclasses: newMulticlass },
        proficiencies: {
          ...prof,
          armors: remove(prof.armors, partial.armors, survivingProfs),
          weapons: remove(prof.weapons, partial.weapons, survivingWeapons),
          tools: prof.tools,
        },
        spellcasting: {
          ...s.sheet.spellcasting,
          spellcaster: newCaster,
          spellcasting_ability: newCastingAbility,
          cantrips_by_class: Object.fromEntries(
            Object.entries(s.sheet.spellcasting.cantrips_by_class).filter(([k]) => k !== classId),
          ),
          spells_by_class: Object.fromEntries(
            Object.entries(s.sheet.spellcasting.spells_by_class).filter(([k]) => k !== classId),
          ),
        },
      }
      return { sheet: recalculate(sheet) }
    }),

  setMulticlassLevel: (classId, level) =>
    set(s => {
      const multi = s.sheet.identity.multiclasses ?? []
      const totalSecondary = multi.reduce((sum, m) => sum + (m.class_id === classId ? 0 : m.level), 0)
      const totalLevel = s.sheet.identity.level
      const validatedLevel = Math.max(1, Math.min(level, totalLevel - totalSecondary - 1))
      const newMulticlass = multi.map(m =>
        m.class_id === classId ? { ...m, level: validatedLevel } : m,
      )
      return { sheet: recalculate({ ...s.sheet, identity: { ...s.sheet.identity, multiclasses: newMulticlass } }) }
    }),

  setMulticlassSubclass: (classId, subclassId) =>
    set(s => {
      const multi = s.sheet.identity.multiclasses ?? []
      const target = multi.find(m => m.class_id === classId)
      if (subclassId && (!target || !canChooseSubclass(target.level))) return s
      const newMulticlass = multi.map(m =>
        m.class_id === classId ? { ...m, subclass_id: subclassId } : m,
      )
      return { sheet: recalculate({ ...s.sheet, identity: { ...s.sheet.identity, multiclasses: newMulticlass } }) }
    }),

  recalculateAll: () => set(s => ({ sheet: recalculate(s.sheet) })),

  saveLocal: () => {
    const { sheet, sheetId, completeSheet } = get()
    const id = sheetId ?? uuidv4()
    const finalSheet = !completeSheet
      ? {
          ...sheet,
          combat: {
            ...sheet.combat,
            hit_points: {
              ...sheet.combat.hit_points,
              current: sheet.combat.hit_points.max ?? 0,
            },
          },
        }
      : sheet
    saveSheet(id, finalSheet, true)
    set({ sheet: finalSheet, sheetId: id, completeSheet: true })
  },

  exportSheetJson: () => JSON.stringify(get().sheet, null, 2),

  importSheetJson: json => {
    try {
      const sheet = migrateSheet(JSON.parse(json) as CharacterSheet)
      const id = uuidv4()
      saveSheet(id, sheet)
      set({ sheet: recalculate(sheet), sheetId: id })
      get().loadSavedList()
    } catch (err) {
      console.error('[fichaStore] Falha ao importar JSON:', err)
    }
  },

  loadSheet: id => {
    const sheet = loadSheetFromStorage(id)
    if (!sheet) return
    const list = listSheets()
    const complete = list.find(item => item.id === id)?.complete ?? true
    set({ sheet: recalculate(sheet), sheetId: id, currentStep: 1, completeSheet: complete })
  },

  newSheet: () => {
    const id = uuidv4()
    set({ sheet: createInitialSheet(), sheetId: id, currentStep: 1, completeSheet: false, abilityRolls: [], abilityAsi: {} })
  },

  deleteSheet: id => {
    deleteSheetFromStorage(id)
    get().loadSavedList()
  },

  reset: () => set({ sheet: createInitialSheet(), sheetId: null, currentStep: 1 }),

  loadSavedList: () => set({ savedSheets: listSheets() }),
}))

let saveTimeout: ReturnType<typeof setTimeout> | null = null

useSheetStore.subscribe(state => {
  if (!state.sheetId) return

  if (saveTimeout) clearTimeout(saveTimeout)

  saveTimeout = setTimeout(() => {
    saveSheet(state.sheetId!, state.sheet, state.completeSheet)
  }, DEBOUNCE_SAVE_MS)
})
