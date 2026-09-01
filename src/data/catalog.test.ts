import { describe, it, expect } from 'vitest'
import { rarityKey, itemRarityKey, RARITY_KEYS } from './items'
import type { Item, MagicItem } from './items'

import { WEAPONS as WEAPONS_PT } from './items/pt/weapons'
import { ARMORS as ARMORS_PT } from './items/pt/armors'
import { TOOLS as TOOLS_PT } from './items/pt/tools'
import { EQUIPMENT_PACKS as PACKS_PT } from './items/pt/kits'
import { MOUNTS_AND_VEHICLES as TRANSPORT_PT } from './items/pt/transport'
import { MAGIC_ITEMS as MAGIC_PT } from './items/pt/magic_items'
import { ADVENTURING_GEAR as GEAR_PT } from './items/pt/gear'

import { WEAPONS as WEAPONS_EN } from './items/en/weapons'
import { ARMORS as ARMORS_EN } from './items/en/armors'
import { TOOLS as TOOLS_EN } from './items/en/tools'
import { EQUIPMENT_PACKS as PACKS_EN } from './items/en/kits'
import { MOUNTS_AND_VEHICLES as TRANSPORT_EN } from './items/en/transport'
import { MAGIC_ITEMS as MAGIC_EN } from './items/en/magic_items'
import { ADVENTURING_GEAR as GEAR_EN } from './items/en/gear'

const GROUPS: Array<[string, readonly Item[], readonly Item[]]> = [
  ['armas', WEAPONS_PT, WEAPONS_EN],
  ['armaduras', ARMORS_PT, ARMORS_EN],
  ['ferramentas', TOOLS_PT, TOOLS_EN],
  ['pacotes', PACKS_PT, PACKS_EN],
  ['transporte', TRANSPORT_PT, TRANSPORT_EN],
  ['itens mágicos', MAGIC_PT, MAGIC_EN],
  ['equipamento', GEAR_PT, GEAR_EN],
]

const ALL_PT = GROUPS.flatMap(([, pt]) => pt)

describe.each(GROUPS)('catálogo de %s', (_label, pt, en) => {
  it('tem os mesmos ids em pt e en', () => {
    expect(pt.map(i => i.id)).toEqual(en.map(i => i.id))
  })

  it('não repete ids', () => {
    expect(new Set(pt.map(i => i.id)).size).toBe(pt.length)
  })

  it('tem nome, descrição e preço em ambos os idiomas', () => {
    for (const list of [pt, en]) {
      for (const item of list) {
        expect(item.name?.trim(), `${item.id}: nome`).toBeTruthy()
        expect(item.description?.trim(), `${item.id}: descrição`).toBeTruthy()
        expect(item.price, `${item.id}: preço`).toBeDefined()
      }
    }
  })
})

describe('catálogo achatado', () => {
  it('não tem id repetido entre categorias — `getItems` acha por id', () => {
    const ids = ALL_PT.map(i => i.id)
    const repetidos = ids.filter((id, i) => ids.indexOf(id) !== i)
    expect([...new Set(repetidos)]).toEqual([])
  })
})

describe('raridade', () => {
  it('mapeia os rótulos dos dois idiomas para a mesma chave', () => {
    expect(rarityKey('Muito Raro')).toBe('very_rare')
    expect(rarityKey('Very Rare')).toBe('very_rare')
    expect(rarityKey('Lendário')).toBe(rarityKey('Legendary'))
    expect(rarityKey('inexistente')).toBeNull()
    expect(rarityKey(null)).toBeNull()
  })

  it('todo item mágico tem uma raridade reconhecida, nos dois idiomas', () => {
    for (const list of [MAGIC_PT, MAGIC_EN]) {
      for (const item of list) {
        expect(rarityKey(item.rarity), `${item.id}: "${item.rarity}"`).not.toBeNull()
      }
    }
  })

  it('cada raridade canônica é usada por pelo menos um item', () => {
    const usadas = new Set(MAGIC_PT.map(i => rarityKey(i.rarity)))
    for (const key of RARITY_KEYS) expect(usadas.has(key), key).toBe(true)
  })

  it('só itens mágicos têm raridade', () => {
    expect(itemRarityKey(WEAPONS_PT[0])).toBeNull()
    expect(itemRarityKey(MAGIC_PT[0])).not.toBeNull()
    expect(itemRarityKey(null)).toBeNull()
  })
})

describe('orçamento de usos dos itens mágicos', () => {
  const usesOf = (list: readonly MagicItem[], id: string) => list.find(i => i.id === id)?.uses

  it('é idêntico em pt e en — o número não depende do idioma', () => {
    for (const item of MAGIC_PT) {
      expect(usesOf(MAGIC_EN, item.id), item.id).toEqual(item.uses)
    }
  })

  it('tem máximo positivo e recarga conhecida', () => {
    for (const item of MAGIC_PT) {
      if (!item.uses) continue
      expect(item.uses.max, item.id).toBeGreaterThan(0)
      expect(['dawn', 'manual'], item.id).toContain(item.uses.recharge)
    }
  })

  it('marca os itens que a ficha usa nas regras de espaço', () => {
    expect(usesOf(MAGIC_PT, 'rod_of_the_pact_keeper')).toEqual({ max: 1, recharge: 'dawn' })
    expect(usesOf(MAGIC_PT, 'pearl_of_power')).toEqual({ max: 1, recharge: 'dawn' })
  })

  it('deixa sem orçamento os itens cujo máximo é variável', () => {
    // "1d8+1 cargas" e "até 3 cargas por golpe" não são orçamentos fixos
    expect(usesOf(MAGIC_PT, 'nine_lives_stealer')).toBeUndefined()
    expect(usesOf(MAGIC_PT, 'staff_of_striking')).toBeUndefined()
  })
})

describe('filtro de raridade', () => {
  // Mesma lógica de `BackpackSearch`: chave canônica, então independe do idioma.
  const filtrar = (list: readonly Item[], key: string) =>
    list.filter(i => itemRarityKey(i) === key)

  it('devolve os mesmos itens em pt e en', () => {
    for (const key of RARITY_KEYS) {
      expect(filtrar(MAGIC_PT, key).map(i => i.id)).toEqual(filtrar(MAGIC_EN, key).map(i => i.id))
    }
  })

  it('particiona o catálogo mágico inteiro, sem sobra', () => {
    const total = RARITY_KEYS.reduce((n, key) => n + filtrar(MAGIC_PT, key).length, 0)
    expect(total).toBe(MAGIC_PT.length)
  })

  it('não deixa passar item não-mágico', () => {
    expect(filtrar(ALL_PT, 'rare').every(i => i.item_type === 'item_magico')).toBe(true)
  })
})
