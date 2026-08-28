import type { CharacterSheet } from '../types'
import type { SheetListItem } from '../store/sheetStore'
import { migrateSheet } from '../lib/migrateSheet'
import { translateLegacyPtListItem } from '../lib/migrateLegacyPt'
import { STORAGE_KEY_SHEET_PREFIX, STORAGE_KEY_LIST } from '../constants'

function buildListItem(id: string, sheet: CharacterSheet, complete: boolean): SheetListItem {
  return {
    id,
    name: sheet.identity.character_name ?? '',
    charClass: sheet.identity.class_id ?? '—',
    species: sheet.identity.species_id ?? '—',
    level: sheet.identity.level,
    updatedAt: new Date().toISOString(),
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

export function saveSheet(id: string, sheet: CharacterSheet, complete = false): void {
  localStorage.setItem(`${STORAGE_KEY_SHEET_PREFIX}${id}`, JSON.stringify(sheet))

  const list = readList()
  const idx = list.findIndex(item => item.id === id)
  const novoItem = buildListItem(id, sheet, complete)

  if (idx >= 0) {
    // Never downgrade from complete to incomplete
    const alreadyComplete = list[idx].complete === true
    list[idx] = { ...novoItem, complete: alreadyComplete || complete }
  } else {
    list.push(novoItem)
  }

  saveList(list)
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
}

export function listSheets(): SheetListItem[] {
  return readList()
}
