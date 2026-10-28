import type { CharacterSheet } from '../types'
import type { SheetListItem } from '../store/sheetStore'
import { migrateSheet } from '../lib/migrateSheet'
import { translateLegacyPtListItem } from '../lib/migrateLegacyPt'
import { STORAGE_KEY_SHEET_PREFIX, STORAGE_KEY_LIST } from '../constants'
import { recordLocalDelete, recordLocalWrite } from './cloudState'

function buildListItem(id: string, sheet: CharacterSheet, complete: boolean, updatedAt: string): SheetListItem {
  return {
    id,
    name: sheet.identity.character_name ?? '',
    charClass: sheet.identity.class_id ?? '—',
    species: sheet.identity.species_id ?? '—',
    level: sheet.identity.level,
    updatedAt,
    complete,
  }
}

function readList(): SheetListItem[] {
  const raw = localStorage.getItem(STORAGE_KEY_LIST)
  if (!raw) return []

  try {
    return (JSON.parse(raw) as unknown[]).map(translateLegacyPtListItem)
  } catch {
    console.error('[fichaStorage] Lista corrompida, reiniciando.')
    return []
  }
}

function saveList(list: SheetListItem[]): void {
  localStorage.setItem(STORAGE_KEY_LIST, JSON.stringify(list))
}

/** O que sobe para a nuvem: a ficha crua e o `complete`, que mora na lista e não na ficha. */
function sheetCloudPayload(json: string, complete: boolean): string {
  return `{"complete":${complete},"sheet":${json}}`
}

/** `updatedAt` só vem de fora quando a ficha desce da nuvem e mantém a data de lá. */
export function saveSheet(id: string, sheet: CharacterSheet, complete = false, updatedAt = new Date().toISOString()): void {
  const json = JSON.stringify(sheet)
  localStorage.setItem(`${STORAGE_KEY_SHEET_PREFIX}${id}`, json)

  const list = readList()
  const idx = list.findIndex(item => item.id === id)
  // Never downgrade from complete to incomplete
  const finalComplete = (idx >= 0 && list[idx].complete === true) || complete
  const novoItem = buildListItem(id, sheet, finalComplete, updatedAt)

  if (idx >= 0) list[idx] = novoItem
  else list.push(novoItem)

  saveList(list)
  recordLocalWrite('sheet', id, sheetCloudPayload(json, finalComplete))
}

/** Conteúdo da ficha como sobe para a nuvem; `null` se ela não existe aqui. */
export function readSheetCloudPayload(id: string): string | null {
  const json = localStorage.getItem(`${STORAGE_KEY_SHEET_PREFIX}${id}`)
  if (json == null) return null
  return sheetCloudPayload(json, readList().find(item => item.id === id)?.complete ?? true)
}

export function loadSheet(id: string): CharacterSheet | null {
  const raw = localStorage.getItem(`${STORAGE_KEY_SHEET_PREFIX}${id}`)
  if (!raw) return null

  try {
    return migrateSheet(JSON.parse(raw) as CharacterSheet)
  } catch {
    console.error(`[fichaStorage] Ficha ${id} corrompida.`)
    return null
  }
}

export function deleteSheet(id: string): void {
  localStorage.removeItem(`${STORAGE_KEY_SHEET_PREFIX}${id}`)
  const list = readList().filter(item => item.id !== id)
  saveList(list)
  recordLocalDelete('sheet', id)
}

export function listSheets(): SheetListItem[] {
  return readList()
}
