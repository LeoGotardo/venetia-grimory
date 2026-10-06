import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useGmStore } from './gmStore'
import { makeSheet } from '../test/fixtures'
import { saveSheet } from '../services/sheetStorage'
import { loadCampaign, listCampaigns } from '../services/gmStorage'
import { buildSheetExport } from '../lib/sheetExport'
import { DEBOUNCE_SAVE_MS } from '../constants'

const st = () => useGmStore.getState()
const party = () => st().campaign!.party

function localSheet(id: string, name: string) {
  const sheet = makeSheet({ classId: 'guerreiro', level: 3 })
  sheet.identity.character_name = name
  saveSheet(id, sheet, true)
  return sheet
}

describe('campanhas do mestre', () => {
  beforeEach(() => {
    localStorage.clear()
    useGmStore.setState({ campaigns: [], campaign: null })
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('cria, abre e lista', () => {
    const id = st().createCampaign('  Mina Perdida ')
    expect(st().campaigns).toEqual([expect.objectContaining({ id, name: 'Mina Perdida', players: 0 })])
    expect(st().openCampaign(id)).toBe(true)
    expect(st().campaign?.name).toBe('Mina Perdida')
  })

  it('auto-save grava edições depois do debounce', () => {
    const id = st().createCampaign('A')
    st().openCampaign(id)
    st().renameCampaign('B')
    vi.advanceTimersByTime(DEBOUNCE_SAVE_MS)
    expect(loadCampaign(id)?.name).toBe('B')
    expect(listCampaigns()[0].name).toBe('B')
  })

  it('apagar a campanha aberta cancela o save pendente', () => {
    const id = st().createCampaign('A')
    st().openCampaign(id)
    st().renameCampaign('B')
    st().deleteCampaign(id)
    vi.advanceTimersByTime(DEBOUNCE_SAVE_MS)
    expect(loadCampaign(id)).toBeNull()
    expect(listCampaigns()).toEqual([])
  })

  it('trocar de campanha grava a edição pendente da anterior', () => {
    const a = st().createCampaign('A')
    const b = st().createCampaign('B')
    st().openCampaign(a)
    st().renameCampaign('A editada')
    st().openCampaign(b)
    expect(loadCampaign(a)?.name).toBe('A editada')
  })
})

describe('players da mesa', () => {
  beforeEach(() => {
    localStorage.clear()
    useGmStore.setState({ campaigns: [], campaign: null })
    st().openCampaign(st().createCampaign('Mesa'))
  })

  it('adiciona ficha local uma vez só', () => {
    localSheet('s1', 'Grukk')
    expect(st().addLocalPlayer('s1')).toBe(true)
    expect(st().addLocalPlayer('s1')).toBe(false)
    expect(st().addLocalPlayer('nao-existe')).toBe(false)
    expect(party()).toHaveLength(1)
    expect(party()[0]).toMatchObject({ source: 'local', sheet_id: 's1' })
  })

  it('player local acompanha a ficha ao reabrir a campanha', () => {
    const sheet = localSheet('s1', 'Grukk')
    st().addLocalPlayer('s1')
    const id = st().campaign!.id
    saveSheet('s1', { ...sheet, identity: { ...sheet.identity, character_name: 'Grukk II' } })
    st().openCampaign(id)
    expect(party()[0].snapshot.identity.character_name).toBe('Grukk II')
  })

  it('ficha local apagada vira snapshot importado', () => {
    localSheet('s1', 'Grukk')
    st().addLocalPlayer('s1')
    const id = st().campaign!.id
    localStorage.removeItem('dnd_ficha_s1')
    st().openCampaign(id)
    expect(party()[0]).toMatchObject({ source: 'imported', sheet_id: null })
    expect(party()[0].snapshot.identity.character_name).toBe('Grukk')
  })

  it('importa JSON no formato novo e no antigo, e reimporta', () => {
    const sheet = makeSheet({ classId: 'mago', level: 5 })
    sheet.identity.character_name = 'Ilsa'
    st().importPlayerJson(buildSheetExport(sheet, true))
    st().importPlayerJson(JSON.stringify(sheet))
    expect(party().map(m => m.snapshot.identity.character_name)).toEqual(['Ilsa', 'Ilsa'])

    const memberId = party()[0].id
    st().reimportPlayerJson(memberId, JSON.stringify({ ...sheet, identity: { ...sheet.identity, level: 6 } }))
    expect(party()[0].snapshot.identity.level).toBe(6)
    expect(() => st().importPlayerJson('não é json')).toThrow()
  })

  it('exporta e importa a campanha como nova, sem link local', () => {
    localSheet('s1', 'Grukk')
    st().addLocalPlayer('s1')
    const json = st().exportCampaignJson()!
    const newId = st().importCampaignJson(json)
    expect(newId).not.toBe(st().campaign!.id)
    const imported = loadCampaign(newId)!
    expect(imported.party[0]).toMatchObject({ source: 'imported', sheet_id: null })
    expect(() => st().importCampaignJson('{"format":"venetia-sheet"}')).toThrow()
  })
})
