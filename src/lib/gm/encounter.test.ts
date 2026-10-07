import { describe, it, expect } from 'vitest'
import type { Combatant, Encounter } from '../../types'
import {
  advanceTurn,
  applyDamage,
  applyHealing,
  applyTempHp,
  combatantFromStatBlock,
  concentrationDc,
  numberedNames,
  repairTurn,
  rollAttack,
  rollDamage,
  rollInitiative,
  sortByInitiative,
  startEncounter,
} from './encounter'
import { createBlankStatBlock } from './statblock'
import { encounterBudget, encounterXp } from './difficulty'

function c(name: string, initiative: number | null, init_bonus = 0, extra: Partial<Combatant> = {}): Combatant {
  return {
    ...combatantFromStatBlock('monster', null, createBlankStatBlock(name), name),
    id: name, initiative, init_bonus, ...extra,
  }
}

function enc(combatants: Combatant[], extra: Partial<Encounter> = {}): Encounter {
  return { id: 'e', name: '', status: 'preparing', map_id: null, fog: null, combatants, round: 0, turn_id: null, log: [], created_at: '', updated_at: '', ...extra }
}

describe('nomes numerados', () => {
  it('um sozinho fica sem número; vários continuam a contagem', () => {
    expect(numberedNames('Goblin', [], 1)).toEqual(['Goblin'])
    expect(numberedNames('Goblin', [], 3)).toEqual(['Goblin 1', 'Goblin 2', 'Goblin 3'])
    expect(numberedNames('Goblin', ['Goblin 1', 'Goblin 2', 'Orc'], 2)).toEqual(['Goblin 3', 'Goblin 4'])
    expect(numberedNames('Goblin', ['Goblin'], 1)).toEqual(['Goblin 2'])
    expect(numberedNames('Ogro (jovem)', ['Ogro (jovem) 1'], 1)).toEqual(['Ogro (jovem) 2'])
  })
})

describe('iniciativa e turnos', () => {
  it('rola d20 + bônus', () => {
    expect(rollInitiative(c('a', null, 3), () => 0.5)).toEqual({ roll: 11, total: 14 })
  })

  it('ordena por iniciativa, desempata pelo bônus, sem iniciativa no fim', () => {
    const order = sortByInitiative([c('a', 10, 1), c('b', null, 5), c('c', 15), c('d', 10, 3)])
    expect(order.map(x => x.id)).toEqual(['c', 'd', 'a', 'b'])
  })

  it('começa na rodada 1 com o primeiro; dar a volta abre rodada nova, pulando derrotados', () => {
    let e = startEncounter(enc([c('a', 5), c('b', 20), c('x', 10, 0, { defeated: true })]))
    expect([e.round, e.turn_id]).toEqual([1, 'b'])
    e = advanceTurn(e)
    expect([e.round, e.turn_id]).toEqual([1, 'a'])
    e = advanceTurn(e)
    expect([e.round, e.turn_id]).toEqual([2, 'b'])
    e = advanceTurn(e, -1)
    expect([e.round, e.turn_id]).toEqual([1, 'a'])
  })

  it('não volta antes da rodada 1', () => {
    const e = startEncounter(enc([c('a', 5), c('b', 20)]))
    expect(advanceTurn(e, -1)).toBe(e)
  })

  it('se o dono do turno sai da ordem, a vez passa para o seguinte', () => {
    const e = startEncounter(enc([c('a', 20), c('b', 10), c('c', 5)]))
    const previous = e.combatants
    const removed = { ...e, turn_id: 'a', combatants: previous.filter(x => x.id !== 'a') }
    expect(repairTurn(removed, previous).turn_id).toBe('b')
    const lastGone = { ...e, turn_id: 'c', combatants: previous.map(x => (x.id === 'c' ? { ...x, defeated: true } : x)) }
    expect(repairTurn(lastGone, previous).turn_id).toBe('a')
  })
})

describe('pontos de vida', () => {
  it('PV temporário absorve primeiro', () => {
    const goblin = c('g', 1, 0, { hp: { current: 7, max: 7, temp: 3 } })
    expect(applyDamage(goblin, 5).combatant.hp).toEqual({ current: 5, max: 7, temp: 0 })
  })

  it('monstro a 0 fica derrotado; player fica Inconsciente e a cura desfaz', () => {
    const goblin = c('g', 1, 0, { hp: { current: 4, max: 7, temp: 0 } })
    expect(applyDamage(goblin, 10).combatant).toMatchObject({ hp: { current: 0 }, defeated: true })
    const hero = c('h', 1, 0, { kind: 'player', hp: { current: 4, max: 20, temp: 0 } })
    const down = applyDamage(hero, 9).combatant
    expect(down).toMatchObject({ defeated: false, conditions: ['Inconsciente'] })
    expect(applyHealing(down, 30)).toMatchObject({ hp: { current: 20 }, conditions: [] })
  })

  it('concentração: CD 10 ou metade do dano, teto 30; só quem concentra', () => {
    expect([1, 22, 23, 100].map(concentrationDc)).toEqual([10, 11, 11, 30])
    const caster = c('m', 1, 0, { concentration: true, hp: { current: 30, max: 30, temp: 0 } })
    expect(applyDamage(caster, 24).concentrationDc).toBe(12)
    expect(applyDamage({ ...caster, concentration: false }, 24).concentrationDc).toBeNull()
  })

  it('PV temporário fica com o maior', () => {
    const x = c('x', 1, 0, { hp: { current: 5, max: 5, temp: 6 } })
    expect(applyTempHp(x, 4).hp.temp).toBe(6)
    expect(applyTempHp(x, 9).hp.temp).toBe(9)
  })
})

describe('ações', () => {
  it('ataque marca 20 e 1 natural', () => {
    expect(rollAttack(4, () => 0.99)).toEqual({ roll: 20, total: 24, crit: true, fumble: false })
    expect(rollAttack(4, () => 0)).toMatchObject({ roll: 1, fumble: true })
  })

  it('crítico dobra os dados, não o bônus', () => {
    expect(rollDamage('1d6+2', true, () => 0.99)).toEqual({ total: 14, rolls: [6, 6] })
    expect(rollDamage('veja o texto', false)).toBeNull()
  })
})

describe('dificuldade (2024)', () => {
  it('soma o XP dos monstros e compara com o orçamento da party', () => {
    const g = createBlankStatBlock('Goblin')
    g.cr = '1/4'
    const goblins = [1, 2, 3, 4].map(i => combatantFromStatBlock('monster', null, g, `Goblin ${i}`))
    expect(encounterXp(goblins)).toBe(200)
    expect(encounterBudget([1, 1, 1, 1], 200)).toEqual({ xp: 200, low: 200, moderate: 300, high: 400, difficulty: 'low' })
    expect(encounterBudget([1, 1, 1], 200).difficulty).toBe('moderate')
    expect(encounterBudget([1], 200).difficulty).toBe('beyond')
    expect(encounterBudget([], 200).difficulty).toBe('none')
  })
})
