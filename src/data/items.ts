import i18n from '../i18n'

import { WEAPONS as WEAPONS_PT } from './items/pt/weapons'
import { ARMORS as ARMORS_PT } from './items/pt/armors'
import { TOOLS as TOOLS_PT } from './items/pt/tools'
import { EQUIPMENT_PACKS as EQUIPMENT_PACKS_PT } from './items/pt/kits'
import { MOUNTS_AND_VEHICLES as MOUNTS_AND_VEHICLES_PT } from './items/pt/transport'
import { MAGIC_ITEMS as MAGIC_ITEMS_PT } from './items/pt/magic_items'
import { ADVENTURING_GEAR as ADVENTURING_GEAR_PT } from './items/pt/gear'

import { WEAPONS as WEAPONS_EN } from './items/en/weapons'
import { ARMORS as ARMORS_EN } from './items/en/armors'
import { TOOLS as TOOLS_EN } from './items/en/tools'
import { EQUIPMENT_PACKS as EQUIPMENT_PACKS_EN } from './items/en/kits'
import { MOUNTS_AND_VEHICLES as MOUNTS_AND_VEHICLES_EN } from './items/en/transport'
import { MAGIC_ITEMS as MAGIC_ITEMS_EN } from './items/en/magic_items'
import { ADVENTURING_GEAR as ADVENTURING_GEAR_EN } from './items/en/gear'

import type { Item } from './items/types'

export type { Item, Weapon, Armor, Tool, EquipmentPack, Transport, MagicItem, AdventuringGear } from './items/types'

function getWeapons() {
  return i18n.language === 'pt' ? WEAPONS_PT : WEAPONS_EN
}

function getArmors() {
  return i18n.language === 'pt' ? ARMORS_PT : ARMORS_EN
}

function getTools() {
  return i18n.language === 'pt' ? TOOLS_PT : TOOLS_EN
}

function getEquipmentPacks() {
  return i18n.language === 'pt' ? EQUIPMENT_PACKS_PT : EQUIPMENT_PACKS_EN
}

function getMountsAndVehicles() {
  return i18n.language === 'pt' ? MOUNTS_AND_VEHICLES_PT : MOUNTS_AND_VEHICLES_EN
}

function getMagicItems() {
  return i18n.language === 'pt' ? MAGIC_ITEMS_PT : MAGIC_ITEMS_EN
}

function getAdventuringGear() {
  return i18n.language === 'pt' ? ADVENTURING_GEAR_PT : ADVENTURING_GEAR_EN
}

export function getItems() {
  return [
    ...getWeapons(),
    ...getArmors(),
    ...getTools(),
    ...getEquipmentPacks(),
    ...getMountsAndVehicles(),
    ...getMagicItems(),
    ...getAdventuringGear(),
  ]
}

/** Raridades canônicas, em ordem crescente. Ids em inglês, rótulos vêm do i18n. */
export const RARITY_KEYS = ['common', 'uncommon', 'rare', 'very_rare', 'legendary', 'artifact', 'varies'] as const

export type RarityKey = (typeof RARITY_KEYS)[number]

// A raridade chega em PT ou EN conforme o idioma do catálogo; ambas mapeiam
// para a mesma chave canônica para que o filtro não varie com o idioma.
const RARITY_BY_LABEL: Record<string, RarityKey> = {
  'comum': 'common',
  'common': 'common',
  'incomum': 'uncommon',
  'uncommon': 'uncommon',
  'raro': 'rare',
  'rare': 'rare',
  'muito raro': 'very_rare',
  'very rare': 'very_rare',
  'lendário': 'legendary',
  'lendario': 'legendary',
  'legendary': 'legendary',
  'artefato': 'artifact',
  'artifact': 'artifact',
  'varia': 'varies',
  'varies': 'varies',
}

/** Converte o rótulo de raridade do catálogo na chave canônica. */
export function rarityKey(rarity: string | null | undefined): RarityKey | null {
  if (!rarity) return null
  return RARITY_BY_LABEL[rarity.trim().toLowerCase()] ?? null
}

/** Raridade de um item do catálogo — só itens mágicos têm uma. */
export function itemRarityKey(item: Item | null | undefined): RarityKey | null {
  if (!item || item.item_type !== 'item_magico') return null
  return rarityKey(item.rarity)
}
