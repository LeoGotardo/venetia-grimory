import { describe, it, expect, beforeEach } from 'vitest'
import { useAreaMapStore, flushPendingAreaMapSave } from './areaMapStore'
import { useGmStore } from './gmStore'
import { deleteCampaignAreaMaps, listAreaMaps, loadAreaMap, loadCampaignAreaMaps } from '../services/areaMapStorage'
import { addElements } from '../lib/gm/areaMap/scene'
import type { AreaStamp } from '../types'

const st = () => useAreaMapStore.getState()
const tree = (id: string): AreaStamp => ({
  kind: 'stamp', id, layer: 'vegetation', asset: 'oak', x: 10, y: 10, scale: 1, rotation: 0, flip: false, opacity: 1,
})

beforeEach(async () => {
  await flushPendingAreaMapSave()
  for (const c of ['c1', 'c2']) await deleteCampaignAreaMaps(c)
  useAreaMapStore.setState({ listCampaignId: null, list: null, map: null, openedId: null, saveFailed: false })
})

describe('mapas de área no IndexedDB', () => {
  it('cria, lista por campanha, duplica e apaga', async () => {
    const a = await st().createAreaMap('c1', 'Vale', 1200, 900)
    await st().createAreaMap('c2', 'Outra', 1200, 900)
    await st().loadList('c1')
    expect(st().list!.map(m => m.name)).toEqual(['Vale'])

    const copy = (await st().duplicateAreaMap(a, 'Vale (cópia)'))!
    expect(copy).not.toBe(a)
    expect((await listAreaMaps('c1')).map(m => m.name).sort()).toEqual(['Vale', 'Vale (cópia)'])
    expect(st().list).toHaveLength(2)

    await st().deleteAreaMap(a)
    expect(await loadAreaMap(a)).toBeNull()
    expect(st().list!.map(m => m.id)).toEqual([copy])
  })

  it('grava cada commit na hora, e a fila fica só com o mais recente', async () => {
    const id = await st().createAreaMap('c1', 'Vale', 1200, 900)
    expect(await st().openAreaMap(id)).toBe(true)
    st().commitAreaMap(addElements(st().map!, [tree('t1')]))
    st().commitAreaMap(addElements(st().map!, [tree('t2')]))
    st().commitAreaMap(addElements(st().map!, [tree('t3')]))
    expect(st().map!.elements).toHaveLength(3)
    await flushPendingAreaMapSave()
    expect((await loadAreaMap(id))!.elements.map(e => e.id)).toEqual(['t1', 't2', 't3'])
  })

  it('mapa inexistente abre como nulo', async () => {
    expect(await st().openAreaMap('nao-existe')).toBe(false)
    expect(st().map).toBeNull()
    expect(st().loading).toBe(false)
  })

  it('vão junto no export da campanha, com ids novos no import, e somem com ela', async () => {
    localStorage.clear()
    const gm = useGmStore.getState()
    const campaignId = gm.createCampaign('Mesa')
    gm.openCampaign(campaignId)
    const id = await st().createAreaMap(campaignId, 'Vale', 1200, 900)
    await st().openAreaMap(id)
    st().commitAreaMap(addElements(st().map!, [tree('t1')]))

    // O export grava o pendente antes de ler o IndexedDB.
    const json = (await useGmStore.getState().exportCampaignJson())!
    const newId = await useGmStore.getState().importCampaignJson(json)
    const imported = await loadCampaignAreaMaps(newId)
    expect(imported).toHaveLength(1)
    expect(imported[0]).toMatchObject({ name: 'Vale', campaign_id: newId })
    expect(imported[0].id).not.toBe(id)
    expect(imported[0].elements.map(e => e.id)).toEqual(['t1'])

    useGmStore.getState().deleteCampaign(newId)
    await new Promise(r => setTimeout(r, 0))
    await expect.poll(() => loadCampaignAreaMaps(newId)).toEqual([])
    expect(await loadCampaignAreaMaps(campaignId)).toHaveLength(1)
  })
})
