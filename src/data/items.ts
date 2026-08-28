import i18n from '../i18n'

import { WEAPONS as WEAPONS_PT } from './items/pt/weapons'
import { ARMORS as ARMORS_PT } from './items/pt/armors'
import { TOOLS as TOOLS_PT } from './items/pt/tools'
import { EQUIPMENT_PACKS as EQUIPMENT_PACKS_PT } from './items/pt/kits'
import { MOUNTS_AND_VEHICLES as MOUNTS_AND_VEHICLES_PT } from './items/pt/transport'
import { MAGIC_ITEMS as MAGIC_ITEMS_PT } from './items/pt/magic_items'

import { WEAPONS as WEAPONS_EN } from './items/en/weapons'
import { ARMORS as ARMORS_EN } from './items/en/armors'
import { TOOLS as TOOLS_EN } from './items/en/tools'
import { EQUIPMENT_PACKS as EQUIPMENT_PACKS_EN } from './items/en/kits'
import { MOUNTS_AND_VEHICLES as MOUNTS_AND_VEHICLES_EN } from './items/en/transport'
import { MAGIC_ITEMS as MAGIC_ITEMS_EN } from './items/en/magic_items'

export type { Item, Weapon, Armor, Tool, EquipmentPack, Transport, MagicItem } from './items/types'

export function getWeapons() {
  return i18n.language === 'pt' ? WEAPONS_PT : WEAPONS_EN
}

export function getArmors() {
  return i18n.language === 'pt' ? ARMORS_PT : ARMORS_EN
}

export function getTools() {
  return i18n.language === 'pt' ? TOOLS_PT : TOOLS_EN
}

export function getEquipmentPacks() {
  return i18n.language === 'pt' ? EQUIPMENT_PACKS_PT : EQUIPMENT_PACKS_EN
}

export function getMountsAndVehicles() {
  return i18n.language === 'pt' ? MOUNTS_AND_VEHICLES_PT : MOUNTS_AND_VEHICLES_EN
}

export function getMagicItems() {
  return i18n.language === 'pt' ? MAGIC_ITEMS_PT : MAGIC_ITEMS_EN
}

export function getItems() {
  return [
    ...getWeapons(),
    ...getArmors(),
    ...getTools(),
    ...getEquipmentPacks(),
    ...getMountsAndVehicles(),
    ...getMagicItems(),
  ]
}

export function getWeaponsByCategory(category: string) {
  return getWeapons().filter(a => a.category === category)
}

export function getWeaponsByType(type: string) {
  return getWeapons().filter(a => a.type === type)
}

export function getArmorsByCategory(category: string) {
  return getArmors().filter(a => a.category === category)
}

export function getToolsByCategory(category: string) {
  return getTools().filter(f => f.category === category)
}

export function getMagicItemsByRarity(rarity: string) {
  return getMagicItems().filter(i => i.rarity === rarity)
}

export function searchItems(term: string) {
  const t = term.toLowerCase()
  return getItems().filter(i => i.name.toLowerCase().includes(t) || i.description.toLowerCase().includes(t))
}