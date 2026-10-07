import type { AreaMap, AreaMapListItem } from '../types'
import { AREA_DB_NAME, AREA_DB_STORE, AREA_DB_VERSION } from '../constants'
import { normalizeAreaMap } from '../lib/gm/normalize'
import { toAreaListItem } from '../lib/gm/areaMap/scene'

/**
 * Mapas de área no IndexedDB — um registro por mapa, com índice por campanha.
 * Ficam fora da campanha do localStorage porque uma cena com centenas de
 * elementos estouraria a cota de ~5 MB que o app inteiro divide.
 */

const CAMPAIGN_INDEX = 'campaign_id'

let dbPromise: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(AREA_DB_NAME, AREA_DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(AREA_DB_STORE)) {
        const store = db.createObjectStore(AREA_DB_STORE, { keyPath: 'id' })
        store.createIndex(CAMPAIGN_INDEX, CAMPAIGN_INDEX, { unique: false })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => {
      // Deixa a próxima chamada tentar de novo em vez de guardar a falha para sempre.
      dbPromise = null
      reject(req.error)
    }
  })
  return dbPromise
}

function done<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function finished(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
}

async function store(mode: IDBTransactionMode) {
  const db = await openDb()
  const tx = db.transaction(AREA_DB_STORE, mode)
  return { tx, store: tx.objectStore(AREA_DB_STORE) }
}

/** Mapas completos de uma campanha (export, cópia de campanha). */
export async function loadCampaignAreaMaps(campaignId: string): Promise<AreaMap[]> {
  const { store: s } = await store('readonly')
  const raw = await done(s.index(CAMPAIGN_INDEX).getAll(campaignId))
  return raw.map(normalizeAreaMap)
}

export async function listAreaMaps(campaignId: string): Promise<AreaMapListItem[]> {
  return (await loadCampaignAreaMaps(campaignId)).map(toAreaListItem)
}

export async function loadAreaMap(id: string): Promise<AreaMap | null> {
  const { store: s } = await store('readonly')
  const raw = await done(s.get(id))
  return raw ? normalizeAreaMap(raw) : null
}

export async function saveAreaMap(map: AreaMap): Promise<void> {
  const { tx, store: s } = await store('readwrite')
  s.put(map)
  await finished(tx)
}

export async function saveAreaMaps(maps: AreaMap[]): Promise<void> {
  if (maps.length === 0) return
  const { tx, store: s } = await store('readwrite')
  for (const map of maps) s.put(map)
  await finished(tx)
}

export async function deleteAreaMap(id: string): Promise<void> {
  const { tx, store: s } = await store('readwrite')
  s.delete(id)
  await finished(tx)
}

export async function deleteCampaignAreaMaps(campaignId: string): Promise<void> {
  const { tx, store: s } = await store('readwrite')
  const keys = await done(s.index(CAMPAIGN_INDEX).getAllKeys(campaignId))
  for (const key of keys) s.delete(key)
  await finished(tx)
}
