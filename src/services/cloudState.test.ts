import { describe, it, expect, beforeEach } from 'vitest'
import {
  allRecords,
  getCloudSnapshot,
  getRecord,
  linkProfile,
  reloadCloudStateForTests,
  setRecord,
  subscribeLocalChanges,
  unlinkProfile,
} from './cloudState'
import { deleteSheet, listSheets, saveSheet } from './sheetStorage'
import { deleteCampaign, listCampaigns, loadBestiary, saveBestiary, saveCampaign } from './gmStorage'
import { deleteCampaignAreaMaps, loadCampaignAreaMaps, saveAreaMap } from './areaMapStorage'
import { wipeLocalData } from './cloudLocal'
import { createInitialSheet } from '../lib/initialSheet'
import { createAreaMap } from '../lib/gm/areaMap/scene'
import { STORAGE_KEY_CLOUD } from '../constants'
import type { Campaign, Monster } from '../types'

const campaign = (id: string): Campaign => ({
  id, name: 'Mesa', party: [], npcs: [], encounters: [], maps: [], notes: [],
  created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z',
})
const monster = (id: string, name: string): Monster => ({
  id, source: 'custom', updated_at: '2026-01-01T00:00:00.000Z',
  statblock: { name } as Monster['statblock'],
})
const link = () => linkProfile({ uid: 'u1', email: 'a@b.c', name: 'A', photo: null })

/** Marca tudo como já na nuvem, como depois de um sync. */
function markAllSynced() {
  for (const [key, record] of allRecords()) setRecord(key, { ...record, synced: record.hash })
}

beforeEach(async () => {
  for (const item of listSheets()) deleteSheet(item.id)
  for (const item of listCampaigns()) deleteCampaign(item.id)
  saveBestiary([])
  await deleteCampaignAreaMaps('c1')
  localStorage.removeItem(STORAGE_KEY_CLOUD)
  reloadCloudStateForTests()
})

describe('registro das gravações locais para a nuvem', () => {
  it('sem conta vinculada não registra nada', () => {
    saveSheet('s1', createInitialSheet(), true)
    saveCampaign(campaign('c1'))
    expect(allRecords()).toEqual([])
  })

  it('vinculado: ficha, campanha e mapa de área viram registros sujos', async () => {
    link()
    saveSheet('s1', createInitialSheet(), true)
    saveCampaign(campaign('c1'))
    await saveAreaMap(createAreaMap('c1', 'Vale', 100, 100))
    expect(getCloudSnapshot().pending).toBe(3)
  })

  it('regravar a mesma ficha não muda o registro, mesmo com outra data na lista', () => {
    link()
    const sheet = createInitialSheet()
    saveSheet('s1', sheet, true, '2026-01-01T00:00:00.000Z')
    const first = getRecord('sheet:s1')
    saveSheet('s1', sheet, true, '2026-05-01T00:00:00.000Z')
    expect(getRecord('sheet:s1')).toEqual(first)
  })

  it('bestiário: cada monstro é um registro e o que sai do array vira lápide', () => {
    link()
    saveBestiary([monster('m1', 'Goblin'), monster('m2', 'Orc')])
    markAllSynced()
    saveBestiary([monster('m2', 'Orc')])
    expect(getRecord('monster:m1')).toMatchObject({ hash: null })
    expect(getRecord('monster:m2')?.hash).toBe(getRecord('monster:m2')?.synced)
  })

  it('apagar os mapas de uma campanha deixa lápide de cada um', async () => {
    link()
    const map = createAreaMap('c1', 'Vale', 100, 100)
    await saveAreaMap(map)
    markAllSynced()
    await deleteCampaignAreaMaps('c1')
    expect(getRecord(`area_map:${map.id}`)).toMatchObject({ hash: null })
  })

  it('logout desvincula antes de apagar: nenhuma lápide, nenhum push', async () => {
    link()
    saveSheet('s1', createInitialSheet(), true)
    saveCampaign(campaign('c1'))
    saveBestiary([monster('m1', 'Goblin')])
    await saveAreaMap(createAreaMap('c1', 'Vale', 100, 100))
    markAllSynced()

    let changes = 0
    const stop = subscribeLocalChanges(() => { changes++ })
    unlinkProfile()
    await wipeLocalData()
    stop()

    expect(changes).toBe(0)
    expect(allRecords()).toEqual([])
    expect(getCloudSnapshot().profile).toBeNull()
    expect(listSheets()).toEqual([])
    expect(listCampaigns()).toEqual([])
    expect(loadBestiary()).toEqual([])
    expect(await loadCampaignAreaMaps('c1')).toEqual([])
  })
})
