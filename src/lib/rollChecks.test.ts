import { describe, it, expect } from 'vitest'
import { checkModifier } from './rollChecks'
import { makeSheet } from '../test/fixtures'

describe('modificador do teste pedido pelo mestre', () => {
  const sheet = makeSheet({ classId: 'guerreiro', level: 3, abilities: { DES: 16, SAB: 8 } })

  it('lê atributo, salvaguarda, perícia e iniciativa da ficha', () => {
    expect(checkModifier(sheet, { kind: 'ability', id: 'DES' })).toBe(sheet.abilities.DES._modifier)
    expect(checkModifier(sheet, { kind: 'save', id: 'SAB' })).toBe(sheet.combat.saves.SAB._value)
    expect(checkModifier(sheet, { kind: 'skill', id: 'percepcao' })).toBe(sheet.skills.percepcao._value)
    expect(checkModifier(sheet, { kind: 'initiative', id: null })).toBe(sheet.combat.initiative._value)
  })

  it('id desconhecido dá null em vez de um número errado', () => {
    expect(checkModifier(sheet, { kind: 'ability', id: 'XYZ' })).toBeNull()
    expect(checkModifier(sheet, { kind: 'skill', id: 'voar' })).toBeNull()
  })
})
