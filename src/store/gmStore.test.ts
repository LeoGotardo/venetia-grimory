import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useGmStore } from './gmStore'
import { makeSheet } from '../test/fixtures'
import { saveSheet } from '../services/sheetStorage'
import { loadCampaign, listCampaigns } from '../services/gmStorage'
import { buildSheetExport } from '../lib/sheetExport'
import { DEBOUNCE_SAVE_MS } from '../constants'
import { createBlankFeature, createBlankStatBlock } from '../lib/gm/statblock'

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

describe('encontros', () => {
  const enc = () => st().campaign!.encounters[0]
  const byName = (name: string) => enc().combatants.find(c => c.name === name)!
  const kinds = () => enc().log.map(l => l.kind)

  beforeEach(() => {
    localStorage.clear()
    useGmStore.setState({ campaigns: [], campaign: null, bestiary: [] })
    st().openCampaign(st().createCampaign('Mesa'))
  })

  function setup() {
    localSheet('s1', 'Grukk')
    st().addLocalPlayer('s1')
    const goblin = createBlankStatBlock('Goblin')
    goblin.cr = '1/4'
    goblin.hp = { average: 7, formula: '2d6' }
    goblin.actions = [{ ...createBlankFeature(), id: 'cim', name: 'Cimitarra', attack_bonus: 4, damage: '1d6+2', damage_type: 'cortante' }]
    const monsterId = st().saveMonster(goblin)
    const encounterId = st().createEncounter('Emboscada')
    st().addPlayersToEncounter(encounterId, [st().campaign!.party[0].id])
    st().addPlayersToEncounter(encounterId, [st().campaign!.party[0].id])
    st().addMonsterToEncounter(encounterId, monsterId, 2)
    return encounterId
  }

  it('monta com players (sem repetir) e monstros numerados', () => {
    setup()
    expect(enc().combatants.map(c => [c.kind, c.name])).toEqual([
      ['player', 'Grukk'], ['monster', 'Goblin 1'], ['monster', 'Goblin 2'],
    ])
    expect(byName('Goblin 1').hp).toEqual({ current: 7, max: 7, temp: 0 })
  })

  it('rola iniciativa, ordena e passa os turnos com rodadas', () => {
    const id = setup()
    st().updateCombatant(id, byName('Grukk').id, { initiative: 25 })
    st().rollInitiatives(id, 'npcs', () => 0)
    expect(enc().combatants.map(c => c.name)).toEqual(['Grukk', 'Goblin 1', 'Goblin 2'])
    st().startEncounter(id)
    expect(enc().turn_id).toBe(byName('Grukk').id)
    st().nextTurn(id); st().nextTurn(id); st().nextTurn(id)
    expect([enc().round, enc().turn_id]).toEqual([2, byName('Grukk').id])
    expect(kinds()).toContain('round')
  })

  it('dano derrota o monstro e a vez pula para o próximo', () => {
    const id = setup()
    st().rollInitiatives(id, 'all', () => 0.5)
    st().updateCombatant(id, byName('Grukk').id, { initiative: 1 })
    st().startEncounter(id)
    const current = enc().turn_id
    expect(current).toBe(byName('Goblin 1').id)
    st().damageCombatant(id, current!, 50)
    expect(enc().combatants.find(c => c.id === current)!.hp.current).toBe(0)
    expect(enc().turn_id).not.toBe(current)
    st().healCombatant(id, current!, 3)
    expect(kinds().slice(-2)).toEqual(['heal', 'defeated'])
  })

  it('dano em quem concentra devolve a CD e registra', () => {
    const id = setup()
    const target = byName('Grukk').id
    st().toggleConcentration(id, target)
    expect(st().damageCombatant(id, target, 30)).toBe(15)
    expect(kinds()).toEqual(['damage', 'concentration'])
  })

  it('rola uma ação do bloco: crítico dobra os dados', () => {
    const id = setup()
    st().rollFeature(id, byName('Goblin 1').id, 'cim', () => 0.99)
    const [attack, damage] = enc().log
    expect(attack).toMatchObject({ kind: 'attack', roll: 20, total: 24, crit: true })
    expect(damage).toMatchObject({ kind: 'damage_roll', rolls: [6, 6], total: 14, damage_type: 'cortante' })
  })

  it('cópia do bloco no encontro não muda quando o bestiário muda', () => {
    const id = setup()
    const monster = st().bestiary[0]
    st().saveMonster({ ...monster.statblock, ac: 99 }, monster.id)
    expect(byName('Goblin 1').ac).toBe(10)
    expect(enc().id).toBe(id)
  })

  it('o log fica limitado', () => {
    const id = setup()
    for (let i = 0; i < 120; i++) st().rollInitiatives(id, 'all')
    expect(enc().log.length).toBe(200)
  })
})

describe('mapas', () => {
  const map = () => st().campaign!.maps[0]

  beforeEach(() => {
    localStorage.clear()
    useGmStore.setState({ campaigns: [], campaign: null })
    st().openCampaign(st().createCampaign('Mesa'))
  })

  it('cria vazio dentro dos limites e grava a grade', () => {
    const id = st().createMap('Masmorra', 3, 500)
    expect([map().width, map().height, map().cells.length]).toEqual([5, 100, 500])
    st().setMapCells(id, '.'.repeat(500))
    expect(map().cells).toBe('.'.repeat(500))
    st().setMapCells(id, '...')
    expect(map().cells).toBe('.'.repeat(500))
  })

  it('redimensionar descarta rótulos que ficaram de fora', () => {
    const id = st().createMap('Masmorra', 10, 10)
    st().addMapLabel(id, 1, 1, ' Altar ')
    st().addMapLabel(id, 8, 8, 'Porta')
    st().addMapLabel(id, 2, 2, '   ')
    st().resizeMap(id, 6, 6)
    expect(map().labels.map(l => l.text)).toEqual(['Altar'])
    expect(map().cells.length).toBe(36)
  })

  it('duplica com ids novos e vai junto no export', () => {
    const id = st().createMap('A', 5, 5)
    st().addMapLabel(id, 0, 0, 'x')
    const copy = st().duplicateMap(id, 'B')!
    const maps = st().campaign!.maps
    expect(maps.map(m => m.name)).toEqual(['A', 'B'])
    expect(maps[1].labels[0].id).not.toBe(maps[0].labels[0].id)
    st().deleteMap(id)
    const imported = loadCampaign(st().importCampaignJson(st().exportCampaignJson()!))!
    expect(imported.maps.map(m => m.id)).toEqual([copy])
  })
})

describe('encontro no mapa', () => {
  const enc = () => st().campaign!.encounters[0]
  const first = () => enc().combatants[0]

  beforeEach(() => {
    localStorage.clear()
    useGmStore.setState({ campaigns: [], campaign: null, bestiary: [] })
    st().openCampaign(st().createCampaign('Mesa'))
  })

  function setup() {
    const mapId = st().createMap('Sala', 10, 10)
    const encounterId = st().createEncounter('Luta')
    const a = createBlankStatBlock('Ogro')
    a.size = 'large'
    a.speed.walk = 12
    st().addNpcToEncounter(encounterId, st().addNpc(a))
    st().addNpcToEncounter(encounterId, st().addNpc(createBlankStatBlock('Goblin')))
    st().setEncounterMap(encounterId, mapId)
    return { encounterId, mapId }
  }

  it('o combatente leva tamanho e deslocamento do bloco', () => {
    setup()
    expect(first()).toMatchObject({ size: 'large', speed_m: 12, position: null, movement_used_m: 0 })
  })

  it('mover soma o gasto; o turno seguinte do mesmo zera e tira a Disparada', () => {
    const { encounterId } = setup()
    st().updateCombatant(encounterId, first().id, { initiative: 20 })
    st().startEncounter(encounterId)
    st().placeCombatant(encounterId, first().id, { x: 1, y: 1 })
    st().moveCombatant(encounterId, first().id, { x: 3, y: 1 }, 3)
    st().toggleDash(encounterId, first().id)
    expect(first()).toMatchObject({ position: { x: 3, y: 1 }, movement_used_m: 3, dash: true })
    st().nextTurn(encounterId)
    st().nextTurn(encounterId)
    expect(first()).toMatchObject({ movement_used_m: 0, dash: false })
  })

  it('trocar de mapa tira todos do mapa e desliga a névoa', () => {
    const { encounterId } = setup()
    st().placeCombatant(encounterId, first().id, { x: 1, y: 1 })
    st().setFog(encounterId, '0'.repeat(100))
    st().setEncounterMap(encounterId, st().createMap('Outra', 5, 5))
    expect(first().position).toBeNull()
    expect(enc().fog).toBeNull()
  })
})

describe('SRD no bestiário e no encontro', () => {
  beforeEach(() => {
    localStorage.clear()
    useGmStore.setState({ campaigns: [], campaign: null, bestiary: [], srd: null })
    st().openCampaign(st().createCampaign('Mesa'))
  })

  it('carrega por idioma, copia para o bestiário e entra direto no encontro', async () => {
    await st().loadSrd('en')
    expect(st().srd?.monsters).toHaveLength(330)
    const copy = st().copySrdToBestiary('srd-goblin-warrior')!
    expect(st().bestiary.find(m => m.id === copy)).toMatchObject({ source: 'custom', statblock: { name: 'Goblin Warrior' } })

    const encounterId = st().createEncounter('Luta')
    st().addMonsterToEncounter(encounterId, 'srd-ogre', 2)
    expect(st().campaign!.encounters[0].combatants.map(c => c.name)).toEqual(['Ogre 1', 'Ogre 2'])
  })
})
