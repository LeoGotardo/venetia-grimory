import { describe, expect, it } from 'vitest'
import { makeSheet } from '../test/fixtures'
import { recalculate } from './recalculate'
import {
  castableSpells, healTargets, scrollSpells, slotChoices, spellSaveAbility, suggestedDamage, suggestedMode, unarmedStrike, usableItems,
} from './turnActions'
import type { TableCombatant, TableState } from './room/protocol'
import { resolveSpellPt } from '../data/spells'

describe('Ataque Desarmado', () => {
  it('sem classe que mude: FOR + PB, dano fixo 1 + FOR, CD 8 + FOR + PB', () => {
    const sheet = makeSheet({ classId: 'guerreiro', level: 1, abilities: { FOR: 16, DES: 18 } })
    expect(unarmedStrike(sheet)).toEqual({ ability: 'FOR', attackBonus: 5, damage: '4', dc: 13 })
  })

  it('monge rola Artes Marciais e usa DES quando é maior', () => {
    const sheet = makeSheet({ classId: 'monge', level: 5, abilities: { FOR: 10, DES: 16 } })
    expect(unarmedStrike(sheet)).toEqual({ ability: 'DES', attackBonus: 6, damage: '1d8+3', dc: 14 })
  })

  it('monge em multiclasse usa o nível de monge', () => {
    const sheet = makeSheet({ classId: 'guerreiro', level: 3, multiclasses: [{ class_id: 'monge', level: 1 }], abilities: { DES: 16 } })
    expect(unarmedStrike(sheet).damage).toBe('1d6+3')
  })

  it('Valentão de Taverna rola 1d4 + FOR', () => {
    const sheet = makeSheet({
      classId: 'guerreiro', level: 1, abilities: { FOR: 8 },
      feats: [{ feat_id: 'valentao_de_taverna', name: 'Valentão de Taverna' }],
    })
    expect(unarmedStrike(sheet).damage).toBe('1d4-1')
  })
})

describe('magias na vez', () => {
  it('lê o atributo da salvaguarda do catálogo PT', () => {
    expect(spellSaveAbility('Destreza')).toBe('DES')
    expect(spellSaveAbility('Destreza (para se agarrar a algo fixo)')).toBe('DES')
    expect(spellSaveAbility('Constituição')).toBe('CON')
    expect(spellSaveAbility(undefined)).toBeNull()
    expect(spellSaveAbility('qualquer coisa')).toBeNull()
  })

  it('sugere o modo pelo catálogo', () => {
    expect(suggestedMode(resolveSpellPt('bola_de_fogo'))).toBe('save')
    expect(suggestedMode(resolveSpellPt('missil_de_fogo'))).toBe('attack')
    expect(suggestedMode(null)).toBe('none')
  })

  it('truque de um dado escala nos níveis 5, 11 e 17; o resto fica como está', () => {
    expect(suggestedDamage({ level: 0, damage: '1d10' }, 4)).toBe('1d10')
    expect(suggestedDamage({ level: 0, damage: '1d10' }, 5)).toBe('2d10')
    expect(suggestedDamage({ level: 0, damage: '1d10' }, 17)).toBe('4d10')
    expect(suggestedDamage({ level: 3, damage: '8d6' }, 17)).toBe('8d6')
    expect(suggestedDamage({ level: 1, damage: '2d6 (por raio)' }, 1)).toBe('')
  })

  it('lista o que a ficha prepara, com a CD e o ataque da classe', () => {
    const sheet = makeSheet({ classId: 'mago', level: 5, abilities: { INT: 18 } })
    sheet.spellcasting.cantrips_by_class = { mago: ['Míssil de Fogo'] }
    sheet.spellcasting.spells_by_class = { mago: ['bola_de_fogo'] }
    const castable = castableSpells(recalculate(sheet))
    expect(castable.map(c => [c.spell.id, c.dc, c.attackBonus])).toEqual([
      ['missil_de_fogo', 15, 7],
      ['bola_de_fogo', 15, 7],
    ])
  })

  it('paga com espaços do círculo para cima, e nada quando acabaram', () => {
    const sheet = recalculate(makeSheet({ classId: 'mago', level: 5, abilities: { INT: 18 } }))
    sheet.spellcasting.spells_by_class = { mago: ['bola_de_fogo'] }
    const [fireball] = castableSpells(sheet)
    expect(slotChoices(sheet, fireball)).toEqual([{ pool: 'slot', level: 3 }])
    sheet.spellcasting.spell_slots.c3.spent = sheet.spellcasting.spell_slots.c3.max
    expect(slotChoices(sheet, fireball)).toEqual([])
  })
})

describe('itens na vez', () => {
  it('reconhece poção de cura, outra poção e pergaminho de magia; o resto fica de fora', () => {
    const sheet = makeSheet({
      classId: 'mago', level: 5,
      items: [
        { item_id: 'pocao_de_cura', quantity: 2 },
        { item_id: 'espada_longa' },
        { item_id: 'potion_of_invisibility' },
        { item_id: 'pergaminho_circulo_3', notes: 'Bola de Fogo' },
        { item_id: 'pocao_de_cura_suprema', quantity: 0 },
        { item_id: null, name: 'Poção caseira' },
      ],
    })
    expect(usableItems(sheet).map(i => [i.kind, i.idx, i.kind === 'healing' ? i.heal : i.kind === 'scroll' ? i.level : null])).toEqual([
      ['healing', 0, '2d4+2'],
      ['other', 2, null],
      ['scroll', 3, 3],
    ])
  })

  it('pergaminho: só magias da lista das classes, com a CD e o ataque do pergaminho; a anotada vem primeiro', () => {
    const wizard = makeSheet({ classId: 'mago', level: 1 })
    const spells = scrollSpells(wizard, 3, 'Bola de Fogo')
    expect(spells[0].spell.id).toBe('bola_de_fogo')
    expect([spells[0].dc, spells[0].attackBonus]).toEqual([15, 7])
    expect(spells.every(s => s.spell.level === 3 && s.spell.classes.includes('mago'))).toBe(true)
    expect(scrollSpells(makeSheet({ classId: 'guerreiro', level: 5 }), 3, null)).toEqual([])
  })

  it('cura: o próprio primeiro, depois os aliados', () => {
    const c = (id: string, side: 'party' | 'enemy') => ({ id, side }) as TableCombatant
    const table = { combatants: [c('orc', 'enemy'), c('ana', 'party'), c('eu', 'party')] } as TableState
    expect(healTargets(table, table.combatants[2]).map(x => x.id)).toEqual(['eu', 'ana', 'orc'])
  })
})
