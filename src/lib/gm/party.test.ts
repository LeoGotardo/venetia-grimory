import { describe, it, expect } from 'vitest'
import { mergeRoomPlayers, summarizePlayer } from './party'
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

describe('mergeRoomPlayers', () => {
  const toSheet = (raw: unknown) => (raw && typeof raw === 'object' && 'level' in raw
    ? makeSheet({ classId: 'guerreiro', level: (raw as { level: number }).level })
    : null)
  const at = '2026-10-09T12:00:00.000Z'

  it('player novo da sala entra na mesa como `room`', () => {
    const party = mergeRoomPlayers([], [{ memberId: 'm1', version: 3, sheet: { level: 2 } }], toSheet, at)
    expect(party).toHaveLength(1)
    expect(party[0]).toMatchObject({ source: 'room', room_member_id: 'm1', room_version: 3, sheet_id: null })
    expect(party[0].snapshot.identity.level).toBe(2)
  })

  it('a mesma versão não muda nada (mesmo array); versão nova troca o snapshot', () => {
    const party = mergeRoomPlayers([], [{ memberId: 'm1', version: 3, sheet: { level: 2 } }], toSheet, at)
    expect(mergeRoomPlayers(party, [{ memberId: 'm1', version: 3, sheet: { level: 9 } }], toSheet, at)).toBe(party)
    const updated = mergeRoomPlayers(party, [{ memberId: 'm1', version: 4, sheet: { level: 5 } }], toSheet, at)
    expect(updated[0].id).toBe(party[0].id)
    expect(updated[0].snapshot.identity.level).toBe(5)
    expect(updated[0].room_version).toBe(4)
  })

  it('quem sumiu da sala vira importado com a última ficha; os outros ficam', () => {
    const local = { ...mergeRoomPlayers([], [{ memberId: 'x', version: 1, sheet: { level: 1 } }], toSheet, at)[0], source: 'local' as const, room_member_id: null, sheet_id: 's1' }
    const party = [local, ...mergeRoomPlayers([], [{ memberId: 'm1', version: 3, sheet: { level: 2 } }], toSheet, at)]
    const after = mergeRoomPlayers(party, [], toSheet, '2026-10-10T00:00:00.000Z')
    expect(after[0]).toBe(local)
    expect(after[1]).toMatchObject({ source: 'imported', room_member_id: null, imported_at: '2026-10-10T00:00:00.000Z' })
    expect(after[1].snapshot.identity.level).toBe(2)
  })

  it('dado que não é ficha não entra nem apaga a cópia boa', () => {
    expect(mergeRoomPlayers([], [{ memberId: 'm1', version: 1, sheet: 'lixo' }], toSheet, at)).toEqual([])
    const party = mergeRoomPlayers([], [{ memberId: 'm1', version: 1, sheet: { level: 3 } }], toSheet, at)
    const after = mergeRoomPlayers(party, [{ memberId: 'm1', version: 2, sheet: 'lixo' }], toSheet, at)
    expect(after).toBe(party)
  })
})
