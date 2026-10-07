import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useSheetStore, flushPendingSheetSave } from './sheetStore'
import { makeSheet } from '../test/fixtures'
import { loadSheet } from '../services/sheetStorage'

describe('salvamento da ficha', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
  })
  afterEach(() => vi.useRealTimers())

  it('grava na hora quando o pendente é descarregado (app fechando)', () => {
    const sheet = makeSheet({ classId: 'guerreiro', level: 2 })
    useSheetStore.setState({ sheet, sheetId: 's1', completeSheet: true })
    expect(loadSheet('s1')).toBeNull()
    flushPendingSheetSave()
    expect(loadSheet('s1')?.identity.level).toBe(2)
  })

  it('reabrir a ficha dentro do debounce não perde a última edição', () => {
    const sheet = makeSheet({ classId: 'guerreiro', level: 2 })
    useSheetStore.setState({ sheet, sheetId: 's1', completeSheet: true })
    useSheetStore.setState({ sheet: { ...sheet, notes: 'última' } })
    useSheetStore.getState().loadSheet('s1')
    expect(useSheetStore.getState().sheet.notes).toBe('última')
  })
})
