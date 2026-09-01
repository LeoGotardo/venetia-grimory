import { createInitialSheet } from '../lib/initialSheet'
import { recalculate } from '../lib/recalculate'
import type { AbilityId, AcquiredFeat, CharacterSheet, InventoryItem } from '../types'

export interface SheetOptions {
  classId: string
  level: number
  subclassId?: string | null
  multiclasses?: Array<{ class_id: string; level: number; subclass_id?: string | null }>
  /** Valores de atributo; o que não vier fica em 14 (modificador +2). */
  abilities?: Partial<Record<AbilityId, number>>
  feats?: Array<Pick<AcquiredFeat, 'feat_id' | 'name'> & Partial<AcquiredFeat>>
  items?: Array<Partial<InventoryItem> & Pick<InventoryItem, 'item_id'>>
}

/**
 * Ficha pronta para asserção: monta o mínimo e passa por `recalculate`, que é
 * quem deriva conjuração, espaços e conjurações grátis.
 */
export function makeSheet(opts: SheetOptions): CharacterSheet {
  const sheet = createInitialSheet()

  sheet.identity.class_id = opts.classId
  sheet.identity.level = opts.level
  sheet.identity.subclass_id = opts.subclassId ?? null
  sheet.identity.multiclasses = (opts.multiclasses ?? []).map(m => ({
    class_id: m.class_id,
    level: m.level,
    subclass_id: m.subclass_id ?? null,
  }))

  for (const key of ['FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR'] as AbilityId[]) {
    sheet.abilities[key].value = opts.abilities?.[key] ?? 14
  }

  sheet.feats.list = (opts.feats ?? []).map(f => ({
    category: 'Origem',
    source: 'Antecedente',
    choices: {},
    ...f,
  }))

  sheet.inventory.items = (opts.items ?? []).map(i => ({
    name: null,
    category: null,
    quantity: 1,
    equipped: true,
    cost_gp: null,
    weight_kg: null,
    notes: null,
    uses_spent: null,
    ...i,
  }))

  return recalculate(sheet)
}

/** Círculos com espaço, no formato `c1:4 c2:3` — mais legível que o objeto inteiro. */
export function slotSummary(sheet: CharacterSheet): string {
  return Object.entries(sheet.spellcasting.spell_slots)
    .filter(([, slot]) => slot.max > 0)
    .map(([circle, slot]) => `${circle}:${slot.max}`)
    .join(' ')
}
