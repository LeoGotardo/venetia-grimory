import { describe, it, expect } from 'vitest'
import type { Combatant, Encounter, GridMap } from '../../types'
import { buildTableState, healthBand } from './tableView'
import { combatantFromStatBlock } from './encounter'
import { createBlankStatBlock } from './statblock'
import { tableStateSchema } from '../room/protocol'

function monster(name: string, extra: Partial<Combatant> = {}): Combatant {
  const block = { ...createBlankStatBlock(name), notes: 'segredo do mestre' }
  return { ...combatantFromStatBlock('monster', null, block, name), id: name, ...extra }
}

function enc(combatants: Combatant[], extra: Partial<Encounter> = {}): Encounter {
  return {
    id: 'e1', name: 'Emboscada', status: 'active', map_id: 'm1', fog: null, combatants, round: 2, turn_id: null,
    strict_movement: false, log: [], created_at: '', updated_at: '', ...extra,
  }
}

/** Mapa 3×2 de grama (`1`), com um rótulo em cada linha. */
const map: GridMap = {
  id: 'm1', name: '', width: 3, height: 2, cells: '111111',
  labels: [{ id: 'l1', x: 0, y: 0, text: 'Entrada' }, { id: 'l2', x: 2, y: 1, text: 'Tesouro' }],
  created_at: '', updated_at: '',
}

describe('faixa de vida', () => {
  it('segue a regra de Sangrando (metade ou menos)', () => {
    expect(healthBand({ hp: { current: 10, max: 10, temp: 0 }, defeated: false })).toBe('unhurt')
    expect(healthBand({ hp: { current: 6, max: 10, temp: 0 }, defeated: false })).toBe('wounded')
    expect(healthBand({ hp: { current: 5, max: 10, temp: 0 }, defeated: false })).toBe('bloodied')
    expect(healthBand({ hp: { current: 0, max: 10, temp: 0 }, defeated: false })).toBe('down')
    expect(healthBand({ hp: { current: 8, max: 10, temp: 0 }, defeated: true })).toBe('down')
  })
})

describe('mesa transmitida aos players', () => {
  it('escondido não sai — nem na lista, nem na vez', () => {
    const table = buildTableState(enc([monster('Goblin'), monster('Assassino', { hidden: true })], { turn_id: 'Assassino' }), null)
    expect(table.combatants.map(c => c.id)).toEqual(['Goblin'])
    expect(table.turn_id).toBeNull()
    expect(JSON.stringify(table)).not.toContain('Assassino')
  })

  it('quem está sob a névoa some, e o terreno e os rótulos de lá também', () => {
    const fog = '110' + '000' // só as duas primeiras casas da linha de cima estão reveladas
    const table = buildTableState(enc([
      monster('Visível', { position: { x: 1, y: 0 } }),
      monster('Na névoa', { position: { x: 2, y: 1 } }),
      monster('Fora do mapa'),
    ], { fog }), { ...map, cells: '123456' })
    expect(table.combatants.map(c => c.id)).toEqual(['Visível', 'Fora do mapa'])
    expect(table.map?.cells).toBe('120000')
    expect(table.map?.labels).toEqual([{ x: 0, y: 0, text: 'Entrada' }])
    expect(JSON.stringify(table)).not.toContain('Tesouro')
  })

  it('névoa de outro tamanho (mapa redimensionado) é ignorada, como no mapa do mestre', () => {
    const table = buildTableState(enc([monster('A', { position: { x: 2, y: 1 } })], { fog: '0' }), map)
    expect(table.combatants).toHaveLength(1)
    expect(table.map?.fog).toBeNull()
  })

  it('inimigo leva só a faixa de vida; player leva o PV; bloco e notas nunca saem', () => {
    const player: Combatant = { ...monster('Aria'), kind: 'player', side: 'party', statblock: null, hp: { current: 7, max: 12, temp: 2 } }
    const table = buildTableState(enc([monster('Ogro', { hp: { current: 20, max: 59, temp: 0 }, notes: 'foge com 10 PV' }), player]), null)
    expect(table.combatants[0]).toMatchObject({ health: 'bloodied', hp: null })
    expect(table.combatants[1].hp).toEqual({ current: 7, max: 12, temp: 2 })
    const json = JSON.stringify(table)
    expect(json).not.toMatch(/59|foge|segredo|statblock|notes/)
  })

  it('a vez aparece quando o dono está visível e o combate anda', () => {
    expect(buildTableState(enc([monster('Goblin')], { turn_id: 'Goblin' }), null).turn_id).toBe('Goblin')
    expect(buildTableState(enc([monster('Goblin')], { turn_id: 'Goblin', status: 'preparing' }), null).turn_id).toBeNull()
  })

  it('texto livre longo é cortado no limite do protocolo, e a mesa continua válida', () => {
    const long = 'x'.repeat(300)
    const table = buildTableState(enc([monster(long, { id: 'c1', conditions: [long] })], { name: long }), { ...map, labels: [{ id: 'l', x: 0, y: 0, text: long }] })
    expect(tableStateSchema.safeParse(table).success).toBe(true)
  })

  it('sai no formato que o servidor aceita', () => {
    const table = buildTableState(enc([monster('Goblin', { position: { x: 0, y: 0 } })], { fog: '100000' }), map)
    expect(tableStateSchema.safeParse(table).success).toBe(true)
  })
})
