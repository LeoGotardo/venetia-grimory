import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useGmStore } from './gmStore'
import { makeSheet } from '../test/fixtures'
import { saveSheet } from '../services/sheetStorage'
import { loadCampaign, listCampaigns } from '../services/gmStorage'
import { buildSheetExport } from '../lib/sheetExport'
import { DEBOUNCE_SAVE_MS } from '../constants'
import { createBlankStatBlock } from '../lib/gm/statblock'

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

describe('NPCs da campanha', () => {
  beforeEach(() => {
    localStorage.clear()
    useGmStore.setState({ campaigns: [], campaign: null, bestiary: [] })
    st().openCampaign(st().createCampaign('Mesa'))
  })

  it('adiciona, edita, duplica logo abaixo e remove', () => {
    const a = st().addNpc(createBlankStatBlock('Capitão'))
    const b = st().addNpc(createBlankStatBlock('Taverneiro'))
    st().updateNpc(a, { notes: 'suborno', statblock: { ...createBlankStatBlock('Capitão Vex'), ac: 16 } })
    const copy = st().duplicateNpc(a)!
    expect(st().campaign!.npcs.map(n => n.id)).toEqual([a, copy, b])
    expect(st().campaign!.npcs[1]).toMatchObject({ notes: 'suborno', statblock: { name: 'Capitão Vex', ac: 16 } })
    st().removeNpc(a)
    expect(st().campaign!.npcs.map(n => n.id)).toEqual([copy, b])
  })

  it('a cópia do bestiário não muda quando o NPC é editado', () => {
    const monsterId = st().saveMonster(createBlankStatBlock('Goblin'))
    const monster = st().bestiary[0]
    const npc = st().addNpc(structuredClone(monster.statblock), monsterId)
    st().updateNpc(npc, { statblock: { ...monster.statblock, name: 'Goblin chefe' } })
    st().loadBestiary()
    expect(st().bestiary[0].statblock.name).toBe('Goblin')
  })

  it('NPCs vão junto no export da campanha', () => {
    st().addNpc(createBlankStatBlock('Capitão'))
    const id = st().importCampaignJson(st().exportCampaignJson()!)
    expect(loadCampaign(id)!.npcs[0].statblock.name).toBe('Capitão')
  })
})

describe('bestiário', () => {
  beforeEach(() => {
    localStorage.clear()
    useGmStore.setState({ bestiary: [] })
  })

  it('salva, atualiza pelo id e apaga', () => {
    const id = st().saveMonster(createBlankStatBlock('Goblin'))
    st().saveMonster({ ...createBlankStatBlock('Goblin'), ac: 15 }, id)
    expect(st().bestiary).toHaveLength(1)
    expect(st().bestiary[0].statblock.ac).toBe(15)
    st().deleteMonster(id)
    expect(st().bestiary).toEqual([])
  })

  it('import de pacote substitui pelo id e acrescenta os novos', () => {
    const id = st().saveMonster(createBlankStatBlock('Goblin'))
    const pack = st().exportMonsterPack()
    const edited = pack.replace('"ac": 10', '"ac": 13')
    st().saveMonster(createBlankStatBlock('Orc'))
    expect(st().importMonsterPack(edited)).toBe(1)
    expect(st().bestiary.map(m => [m.statblock.name, m.statblock.ac])).toEqual([['Goblin', 13], ['Orc', 10]])
    expect(st().bestiary[0].id).toBe(id)
    expect(() => st().importMonsterPack('{}')).toThrow()
  })
})
