import { describe, it, expect } from 'vitest'
import { summarizePlayer } from './party'
import { makeSheet } from '../../test/fixtures'

describe('summarizePlayer', () => {
  it('lê os campos calculados da ficha', () => {
    const sheet = makeSheet({ classId: 'guerreiro', level: 5 })
    const summary = summarizePlayer(sheet)
    expect(summary.level).toBe(5)
    expect(summary.hpMax).toBe(sheet.combat.hit_points.max)
    expect(summary.passivePerception).toBe(10 + (sheet.skills.percepcao._value ?? 0))
    expect(summary.spellDc).toBeNull()
    expect(summary.saves.FOR).toBe(sheet.combat.saves.FOR._value)
  })
})
