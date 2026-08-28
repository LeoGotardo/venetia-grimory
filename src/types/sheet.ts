import type { AbilityId } from './gameData'

export interface SheetAbility {
  value: number | null
  _modifier: number | null
}

export interface InventoryItem {
  item_id: string | null
  name: string | null      // null for catalog items — resolved dynamically via id_item
  category: string | null // null for catalog items
  quantity: number
  equipped: boolean
  cost_gp: number | null
  weight_kg: number | null
  notes: string | null
}

export interface Attack {
  name: string
  weapon_id: string | null
  type: 'Corpo a Corpo' | 'À Distância' | 'Magia'
  ability_used: AbilityId | null
  _attack_bonus: number | null
  _damage: string | null
  damage_type: string | null
  properties: string[]
  notes: string | null
}

export interface AcquiredFeat {
  feat_id: string
  name: string
  category: string
  source: string
  choices: Record<string, unknown>
}

export interface SpellSlot {
  max: number
  spent: number
}

export interface CharacterSheet {
  identity: {
    character_name: string | null
    player_name: string | null
    campaign: string | null
    class_id: string | null
    subclass_id: string | null
    level: number
    multiclasses: Array<{ class_id: string; subclass_id: string | null; level: number }>
    species_id: string | null
    lineage_id: string | null
    background_id: string | null
    background_distribution: Partial<Record<AbilityId, number>>
    alignment: { ethical: string | null; moral: string | null }
    age: string | null
    height: string | null
    weight: string | null
    eyes: string | null
    skin: string | null
    hair: string | null
    xp: number
  }
  abilities: {
    FOR: SheetAbility
    DES: SheetAbility
    CON: SheetAbility
    INT: SheetAbility
    SAB: SheetAbility
    CAR: SheetAbility
    generation_method: string | null
  }
  combat: {
    _proficiency_bonus: number | null
    hit_points: { max: number | null; current: number; temporary: number }
    hit_dice: { type: string | null; total: number | null; spent: number }
    armor_class: {
      value: number | null
      source: string | null
      shield_equipped: boolean
      equipped_armor_id: string | null
    }
    initiative: { _value: number | null }
    speed: { base_meters: number | null; bonus_meters: number; _total_meters: number | null }
    attacks: Attack[]
    saves: Record<AbilityId, { proficient: boolean; _value: number | null }>
  }
  skills: Record<string, { ability: AbilityId; proficient: boolean; expertise: boolean; _value: number | null }>
  proficiencies: { armors: string[]; weapons: string[]; tools: string[]; languages: string[] }
  species_traits: {
    darkvision_meters: number | null
    active_traits: Array<{ name: string; description: string; max_uses?: number | string; current_uses?: number }>
    choices_made: Record<string, unknown>
  }
  class_features: {
    active: Array<{ name: string; description?: string; level_gained?: number }>
    choices_made: Record<string, unknown>
    class_resources: {
      rages: { max: number | null; current: number | null }
      bardic_inspiration: { die: string | null; max: number | null; current: number | null }
      channel_divinity: { max: number | null; current: number | null }
      wild_shapes: { max: number | null; current: number | null }
      sorcery_points: { max: number | null; current: number | null }
      lay_on_hands: { hp_pool: number | null; current: number | null }
      focus_points: { max: number | null; current: number | null }
      action_surge: { uses: number | null; current: number | null }
      second_wind: { max: number | null; current: number | null }
      sneak_attack: { die: string | null }
      arcane_recovery: { recoverable_slot_levels: number | null }
    }
    divine_order: string | null
    primal_order: string | null
    fighting_style: string | null
    favored_enemy: string | null
    oath: string | null
  }
  spellcasting: {
    spellcaster: boolean
    spellcasting_ability: AbilityId | null
    _spell_dc: number | null
    _spell_attack_bonus: number | null
    cantrips_by_class: Record<string, string[]>
    spells_by_class: Record<string, string[]>
    spellbook: string[]
    spell_slots: Record<'c1' | 'c2' | 'c3' | 'c4' | 'c5' | 'c6' | 'c7' | 'c8' | 'c9', SpellSlot>
    pact_slots: { level: number | null; max: number; spent: number }
  }
  inventory: {
    coins: { PC: number; PP: number; PE: number; PO: number; PL: number }
    items: InventoryItem[]
  }
  feats: { list: AcquiredFeat[] }
  personality: {
    traits: string[]
    ideals: string[]
    bonds: string[]
    flaws: string[]
    backstory: string | null
    appearance_description: string | null
    allies_and_organizations: string | null
    symbol_or_treasure: string | null
  }
  active_conditions: string[]
  exhaustion_levels: number
  notes: string | null
}

export type PartialCharacterSheet = Partial<CharacterSheet>
