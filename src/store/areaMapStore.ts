import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type { AreaMap, AreaMapListItem } from '../types'
import { createAreaMap as buildAreaMap, toAreaListItem } from '../lib/gm/areaMap/scene'
import {
  deleteAreaMap as deleteFromDb,
  listAreaMaps,
  loadAreaMap,
  saveAreaMap,
} from '../services/areaMapStorage'
import { DEBOUNCE_SAVE_MS } from '../constants'

interface AreaMapState {
  /** Campanha cuja lista está carregada; a lista é `null` até o IndexedDB responder. */
  listCampaignId: string | null
  list: AreaMapListItem[] | null
  /** Mapa aberto no editor. */
  map: AreaMap | null
  /** Último id pedido a `openAreaMap` — com `map` nulo depois de carregar, o mapa não existe. */
  openedId: string | null
  loading: boolean
  /** A última gravação falhou (IndexedDB indisponível ou cheio): a tela avisa em vez de perder em silêncio. */
  saveFailed: boolean

  loadList: (campaignId: string) => Promise<void>
  createAreaMap: (campaignId: string, name: string, width: number, height: number) => Promise<string>
  duplicateAreaMap: (id: string, name: string) => Promise<string | null>
  deleteAreaMap: (id: string) => Promise<void>
  openAreaMap: (id: string) => Promise<boolean>
  closeAreaMap: () => void
  /** Troca a cena do mapa aberto (o editor manda um snapshot por gesto). */
  commitAreaMap: (next: AreaMap) => void
}

const now = () => new Date().toISOString()

let pending: { map: AreaMap; timeout: ReturnType<typeof setTimeout> } | null = null

async function persist(map: AreaMap) {
  try {
    await saveAreaMap(map)
    useAreaMapStore.setState(s => ({
      saveFailed: false,
      list: s.listCampaignId === map.campaign_id && s.list
        ? upsert(s.list, toAreaListItem(map))
        : s.list,
    }))
  } catch (err) {
    console.error('[areaMapStore] Falha ao gravar o mapa de área.', err)
    useAreaMapStore.setState({ saveFailed: true })
  }
}

/** Grava já o que estiver no debounce — antes de abrir outro mapa e quando a página some. */
export function flushPendingAreaMapSave(): Promise<void> {
  if (!pending) return Promise.resolve()
  clearTimeout(pending.timeout)
  const { map } = pending
  pending = null
  return persist(map)
}

function upsert(list: AreaMapListItem[], item: AreaMapListItem): AreaMapListItem[] {
  const idx = list.findIndex(x => x.id === item.id)
  if (idx < 0) return [...list, item]
  const next = [...list]
  next[idx] = item
  return next
}

export const useAreaMapStore = create<AreaMapState>((set, get) => ({
  listCampaignId: null,
  list: null,
  map: null,
  openedId: null,
  loading: false,
  saveFailed: false,

  loadList: async campaignId => {
    await flushPendingAreaMapSave()
    if (get().listCampaignId !== campaignId) set({ listCampaignId: campaignId, list: null })
    try {
      const list = await listAreaMaps(campaignId)
      // Outra campanha pode ter sido aberta enquanto o IndexedDB respondia.
      if (get().listCampaignId === campaignId) set({ list })
    } catch (err) {
      console.error('[areaMapStore] Falha ao listar os mapas de área.', err)
      if (get().listCampaignId === campaignId) set({ list: [] })
    }
  },

  createAreaMap: async (campaignId, name, width, height) => {
    const map = buildAreaMap(campaignId, name, width, height)
    await persist(map)
    return map.id
  },

  duplicateAreaMap: async (id, name) => {
    await flushPendingAreaMapSave()
    const source = await loadAreaMap(id)
    if (!source) return null
    const at = now()
    const copy: AreaMap = { ...source, id: uuidv4(), name, created_at: at, updated_at: at }
    await persist(copy)
    return copy.id
  },

  deleteAreaMap: async id => {
    if (pending?.map.id === id) {
      clearTimeout(pending.timeout)
      pending = null
    }
    try {
      await deleteFromDb(id)
    } catch (err) {
      console.error('[areaMapStore] Falha ao apagar o mapa de área.', err)
      return
    }
    set(s => ({
      list: s.list?.filter(x => x.id !== id) ?? null,
      map: s.map?.id === id ? null : s.map,
    }))
  },

  openAreaMap: async id => {
    await flushPendingAreaMapSave()
    set({ openedId: id, loading: true, map: get().map?.id === id ? get().map : null })
    let map: AreaMap | null = null
    try {
      map = await loadAreaMap(id)
    } catch (err) {
      console.error('[areaMapStore] Falha ao abrir o mapa de área.', err)
    }
    if (get().openedId !== id) return false
    set({ map, loading: false })
    return map !== null
  },

  closeAreaMap: () => set({ map: null, openedId: null }),

  commitAreaMap: next => {
    const current = get().map
    if (!current || current.id !== next.id || current === next) return
    const map = { ...next, updated_at: now() }
    set({ map })
    if (pending) clearTimeout(pending.timeout)
    pending = {
      map,
      timeout: setTimeout(() => {
        pending = null
        void persist(map)
      }, DEBOUNCE_SAVE_MS),
    }
  },
}))

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => void flushPendingAreaMapSave())
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') void flushPendingAreaMapSave()
  })
}
