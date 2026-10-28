import type { AreaMap, Campaign, CharacterSheet, Monster } from '../types'
import type { CloudKind } from '../lib/cloud/sync'
import type { CloudLocal, RemoteChange } from './cloudEngine'
import { recalculate } from '../lib/recalculate'
import {
  deleteSheet,
  listSheets,
  loadSheet,
  readSheetCloudPayload,
  saveSheet,
} from './sheetStorage'
import {
  clearBestiary,
  deleteCampaign,
  listCampaigns,
  readBestiaryRaw,
  readCampaignJson,
  saveBestiary,
  saveCampaign,
} from './gmStorage'
import {
  clearAreaMaps,
  deleteAreaMap,
  loadAllAreaMapsRaw,
  readAreaMapJson,
  saveAreaMap,
} from './areaMapStorage'
import { flushPendingSheetSave, useSheetStore } from '../store/sheetStore'
import { flushPendingCampaignSave, useGmStore } from '../store/gmStore'
import { flushPendingAreaMapSave, useAreaMapStore } from '../store/areaMapStore'

/**
 * O aparelho visto pelo motor de sync: lê e grava pelos mesmos storages do app
 * e mantém os stores em dia com o que desceu da nuvem.
 *
 * O que desce é gravado cru, sem normalizar: só versões do app com sync
 * escrevem na nuvem, e elas já gravam normalizado. A leitura normaliza de
 * qualquer forma (`loadSheet` migra, `loadCampaign` normaliza).
 */

/** Editor de mapa de área aberto: o rascunho dele sobrescreveria a versão da nuvem. */
function isEditingAreaMap(id: string): boolean {
  if (typeof location === 'undefined') return false
  const match = /^\/mestre\/campanha\/[^/]+\/area\/([^/]+)/.exec(location.pathname)
  return match?.[1] === id
}

function applySheet(id: string, data: string | null, updatedAt: string) {
  if (data === null) {
    deleteSheet(id)
    return
  }
  const { sheet, complete } = JSON.parse(data) as { sheet: CharacterSheet; complete: boolean }
  saveSheet(id, sheet, complete, updatedAt)
  const store = useSheetStore.getState()
  if (store.sheetId !== id) return
  // A ficha aberta troca no lugar, sem `loadSheet`: ele volta o assistente ao primeiro passo.
  const loaded = loadSheet(id)
  if (!loaded) return
  const listed = listSheets().find(item => item.id === id)
  useSheetStore.setState({ sheet: recalculate(loaded), completeSheet: listed?.complete ?? true })
}

function applyCampaign(id: string, data: string | null) {
  const open = useGmStore.getState().campaign?.id === id
  if (data === null) {
    deleteCampaign(id)
    // Igual a abrir uma campanha que não existe: a tela mostra "não encontrada".
    if (open) useGmStore.setState({ campaign: null })
    return
  }
  saveCampaign(JSON.parse(data) as Campaign)
  if (open) useGmStore.getState().openCampaign(id)
}

/** O bestiário inteiro numa gravação só, por maior que seja o lote. */
function applyMonsters(changes: RemoteChange[]) {
  const byId = new Map(readBestiaryRaw().map(m => [m.id, m]))
  for (const { id, data } of changes) {
    if (data === null) byId.delete(id)
    else byId.set(id, JSON.parse(data) as Monster)
  }
  saveBestiary([...byId.values()])
}

async function applyAreaMap(id: string, data: string | null) {
  if (data === null) {
    await deleteAreaMap(id)
    return
  }
  await saveAreaMap(JSON.parse(data) as AreaMap)
  // Fora do editor o store pode guardar a versão velha; abrir de novo relê do banco.
  const store = useAreaMapStore.getState()
  if (store.map?.id === id) useAreaMapStore.setState({ map: null, openedId: null })
}

export async function flushLocal(): Promise<void> {
  flushPendingSheetSave()
  flushPendingCampaignSave()
  await flushPendingAreaMapSave()
}

export const cloudLocal: CloudLocal = {
  flush: flushLocal,

  async read(kind, ids) {
    switch (kind) {
      case 'sheet': return ids.map(readSheetCloudPayload)
      case 'campaign': return ids.map(readCampaignJson)
      case 'monster': {
        const byId = new Map(readBestiaryRaw().map(m => [m.id, m]))
        return ids.map(id => {
          const monster = byId.get(id)
          return monster ? JSON.stringify(monster) : null
        })
      }
      case 'area_map': return Promise.all(ids.map(readAreaMapJson))
    }
  },

  async apply(kind, changes) {
    switch (kind) {
      case 'sheet':
        for (const { id, data, updatedAt } of changes) applySheet(id, data, updatedAt)
        return
      case 'campaign':
        for (const { id, data } of changes) applyCampaign(id, data)
        return
      case 'monster':
        return applyMonsters(changes)
      case 'area_map':
        for (const { id, data } of changes) await applyAreaMap(id, data)
        return
    }
  },

  isBusy: (kind, id) => kind === 'area_map' && isEditingAreaMap(id),

  refresh(kinds: Set<CloudKind>) {
    if (kinds.has('sheet')) useSheetStore.getState().loadSavedList()
    if (kinds.has('campaign')) useGmStore.getState().loadCampaignList()
    if (kinds.has('monster')) useGmStore.getState().loadBestiary()
    if (kinds.has('area_map')) {
      const { listCampaignId, loadList } = useAreaMapStore.getState()
      if (listCampaignId) void loadList(listCampaignId)
    }
  },

  async scan() {
    const sheets = listSheets().flatMap(item => {
      const data = readSheetCloudPayload(item.id)
      return data ? [{ kind: 'sheet' as const, id: item.id, data, updatedAt: item.updatedAt }] : []
    })
    const campaigns = listCampaigns().flatMap(item => {
      const data = readCampaignJson(item.id)
      return data ? [{ kind: 'campaign' as const, id: item.id, data, updatedAt: item.updated_at }] : []
    })
    const monsters = readBestiaryRaw().map(m => ({
      kind: 'monster' as const, id: m.id, data: JSON.stringify(m), updatedAt: m.updated_at,
    }))
    const areaMaps = (await loadAllAreaMapsRaw()).map(m => ({
      kind: 'area_map' as const, id: m.id, data: JSON.stringify(m), updatedAt: m.updated_at,
    }))
    return [...sheets, ...campaigns, ...monsters, ...areaMaps]
  },
}

/**
 * Logout: tira do aparelho tudo o que é da conta. Só roda **depois** de
 * `unlinkProfile` — desvinculado, nenhum desses apagamentos vira lápide na nuvem.
 */
export async function wipeLocalData(): Promise<void> {
  // Uma gravação pendente recriaria a ficha ou a campanha depois de apagada.
  await flushLocal()
  for (const item of listSheets()) deleteSheet(item.id)
  for (const item of listCampaigns()) deleteCampaign(item.id)
  clearBestiary()
  await clearAreaMaps()

  useSheetStore.getState().reset()
  useSheetStore.getState().loadSavedList()
  useGmStore.setState({ campaign: null, openedId: null })
  useGmStore.getState().loadCampaignList()
  useGmStore.getState().loadBestiary()
  useAreaMapStore.setState({ map: null, openedId: null, list: null, listCampaignId: null })
}
