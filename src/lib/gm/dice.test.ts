import { describe, it, expect } from 'vitest'
import { averageDice, parseDice, rollDice } from './dice'

describe('parseDice', () => {
  it('lê expressões comuns', () => {
    expect(parseDice('2d6+3')).toEqual({ terms: [{ count: 2, sides: 6, sign: 1 }], bonus: 3 })
    expect(parseDice('d20')).toEqual({ terms: [{ count: 1, sides: 20, sign: 1 }], bonus: 0 })
    expect(parseDice('1d8 + 2d6 - 1')).toEqual({
      terms: [{ count: 1, sides: 8, sign: 1 }, { count: 2, sides: 6, sign: 1 }],
      bonus: -1,
    })
    expect(parseDice('7')).toEqual({ terms: [], bonus: 7 })
  })

  it('recusa texto que não é só dados', () => {
    expect(parseDice('')).toBeNull()
    expect(parseDice('veja a descrição')).toBeNull()
    expect(parseDice('2d6 cortante')).toBeNull()
    expect(parseDice('2d6 3')).toBeNull()
    expect(parseDice('0d6')).toBeNull()
  })
})

describe('averageDice / rollDice', () => {
  it('média arredondada para baixo', () => {
    expect(averageDice(parseDice('2d8+2')!)).toBe(11)
    expect(averageDice(parseDice('1d6')!)).toBe(3)
  })

  it('rola com o RNG injetado', () => {
    const roll = rollDice(parseDice('2d6+3')!, () => 0.99)
    expect(roll).toEqual({ total: 15, rolls: [6, 6], bonus: 3 })
    expect(rollDice(parseDice('1d20')!, () => 0).total).toBe(1)
  })
})
