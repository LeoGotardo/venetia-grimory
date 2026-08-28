import type { CharacterSheet } from '../types'
import { createInitialSheet } from './initialSheet'
import { isLegacyPtSheet, translateLegacyPtSheet } from './migrateLegacyPt'

/**
 * Formato anterior à separação de magias por classe (multiclasse).
 * Fichas salvas antes dessa mudança guardam truques e magias em listas únicas.
 */
type LegacySheet = CharacterSheet & {
  spellcasting: CharacterSheet['spellcasting'] & {
    known_cantrips?: string[]
    prepared_spells?: string[]
  }
}

function groupByClass(classId: string, list: string[] | undefined): Record<string, string[]> {
  if (!list?.length) return {}
  return { [classId]: list }
}

/**
 * Normaliza uma ficha vinda do localStorage ou de um JSON importado, preenchendo
 * campos adicionados depois que ela foi salva. Sem isso, painéis que leem esses
 * campos quebram a página inteira (ex.: `Object.values(cantrips_by_class)`).
 */
export function migrateSheet(saved: CharacterSheet): CharacterSheet {
  const sheet = isLegacyPtSheet(saved) ? translateLegacyPtSheet(saved) : saved
  const base = createInitialSheet()
  const legacy = sheet as LegacySheet
  const classId = sheet.identity?.class_id ?? 'classe'

  const { known_cantrips, prepared_spells, ...savedSpellcasting } = legacy.spellcasting ?? base.spellcasting

  return {
    ...base,
    ...sheet,
    identity: {
      ...base.identity,
      ...sheet.identity,
      multiclasses: sheet.identity?.multiclasses ?? base.identity.multiclasses,
      background_distribution:
        sheet.identity?.background_distribution ?? base.identity.background_distribution,
    },
    abilities: { ...base.abilities, ...sheet.abilities },
    combat: {
      ...base.combat,
      ...sheet.combat,
      saves: { ...base.combat.saves, ...sheet.combat?.saves },
    },
    skills: { ...base.skills, ...sheet.skills },
    proficiencies: { ...base.proficiencies, ...sheet.proficiencies },
    species_traits: { ...base.species_traits, ...sheet.species_traits },
    class_features: {
      ...base.class_features,
      ...sheet.class_features,
      class_resources: {
        ...base.class_features.class_resources,
        ...sheet.class_features?.class_resources,
      },
    },
    spellcasting: {
      ...base.spellcasting,
      ...savedSpellcasting,
      cantrips_by_class: savedSpellcasting.cantrips_by_class ?? groupByClass(classId, known_cantrips),
      spells_by_class: savedSpellcasting.spells_by_class ?? groupByClass(classId, prepared_spells),
      spell_slots: { ...base.spellcasting.spell_slots, ...savedSpellcasting.spell_slots },
      pact_slots: savedSpellcasting.pact_slots ?? base.spellcasting.pact_slots,
    },
    inventory: {
      ...base.inventory,
      ...sheet.inventory,
      coins: { ...base.inventory.coins, ...sheet.inventory?.coins },
    },
    feats: { ...base.feats, ...sheet.feats },
    personality: { ...base.personality, ...sheet.personality },
  }
}
