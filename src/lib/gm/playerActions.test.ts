import { describe, it, expect } from 'vitest'
import type { Combatant, Encounter, PartyMember } from '../../types'
import { resolvePlayerMove } from './playerActions'
import { combatantFromStatBlock } from './encounter'
import { createBlankStatBlock } from './statblock'
import { createInitialSheet } from '../initialSheet'
import { buildTableState } from './tableView'

const MEMBER = '00000000-0000-4000-8000-000000000002'
const party: PartyMember[] = [{
  id: 'pm1', source: 'room', sheet_id: null, snapshot: createInitialSheet(), imported_at: '', updated_at: '',
  room_member_id: MEMBER, room_version: 1,
}]

const base = combatantFromStatBlock('monster', null, createBlankStatBlock('x'), 'x')
const hero: Combatant = { ...base, id: 'hero', kind: 'player', ref_id: 'pm1', side: 'party', statblock: null, speed_m: 9, position: { x: 0, y: 0 } }
const goblin: Combatant = { ...base, id: 'gob', side: 'enemy', position: { x: 3, y: 0 } }

/** Corredor 6×1 de chão; parede no fim. */
const map = { width: 6, height: 1, cells: '.....#' }
const enc = (extra: Partial<Encounter> = {}): Encounter => ({
  id: 'e', name: '', status: 'active', map_id: 'm', fog: null, combatants: [hero, goblin], round: 1, turn_id: 'hero',
  strict_movement: false, log: [], created_at: '', updated_at: '', ...extra,
})

describe('movimento pedido pelo player', () => {
  it('na vez dele, até onde o deslocamento alcança', () => {
    expect(resolvePlayerMove(enc(), map, party, MEMBER, 'hero', { x: 2, y: 0 })).toBe(3)
  })

  it('recusa fora da vez, combatente de outro, casa ocupada, parede e além do deslocamento', () => {
    expect(resolvePlayerMove(enc({ turn_id: 'gob' }), map, party, MEMBER, 'hero', { x: 1, y: 0 })).toBeNull()
    expect(resolvePlayerMove(enc(), map, party, '00000000-0000-4000-8000-000000000009', 'hero', { x: 1, y: 0 })).toBeNull()
    expect(resolvePlayerMove(enc(), map, party, MEMBER, 'hero', { x: 3, y: 0 })).toBeNull()
    expect(resolvePlayerMove(enc(), map, party, MEMBER, 'hero', { x: 5, y: 0 })).toBeNull()
    expect(resolvePlayerMove(enc({ status: 'preparing' }), map, party, MEMBER, 'hero', { x: 1, y: 0 })).toBeNull()
    // Inimigo no caminho bloqueia: a casa 4 só se alcança atravessando o goblin.
    expect(resolvePlayerMove(enc(), map, party, MEMBER, 'hero', { x: 4, y: 0 })).toBeNull()
  })

  it('a mesa diz qual combatente é de quem e quanto movimento resta', () => {
    const table = buildTableState(enc({ map_id: null }), null, null, party)
    expect(table.combatants.find(c => c.id === 'hero')).toMatchObject({ member_id: MEMBER, move: { left_m: 9, mode: 'walk' } })
    expect(table.combatants.find(c => c.id === 'gob')).toMatchObject({ member_id: null, move: null })
  })
})
