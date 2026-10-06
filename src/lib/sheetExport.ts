import type { CharacterSheet } from '../types'
import { SHEET_EXPORT_FORMAT, SHEET_EXPORT_VERSION } from '../constants'

/**
 * O JSON exportado leva, além da ficha, se ela já passou pela revisão final do
 * wizard. Essa marca vive na lista (`dnd_fichas_lista`), não na ficha — sem ela
 * no arquivo, toda ficha importada voltava como rascunho.
 */
export interface SheetExport {
  format: typeof SHEET_EXPORT_FORMAT
  version: number
  complete: boolean
  sheet: CharacterSheet
}

export function buildSheetExport(sheet: CharacterSheet, complete: boolean): string {
  const payload: SheetExport = {
    format: SHEET_EXPORT_FORMAT,
    version: SHEET_EXPORT_VERSION,
    complete,
    sheet,
  }
  return JSON.stringify(payload, null, 2)
}

function isSheetExport(data: unknown): data is SheetExport {
  return typeof data === 'object' && data !== null
    && (data as { format?: unknown }).format === SHEET_EXPORT_FORMAT
}

/**
 * Exports antigos são a ficha crua, sem a marca. Classe, espécie e antecedente
 * são as escolhas sem as quais a ficha não abre direito — com as três feitas, a
 * ficha é tratada como pronta.
 */
function looksComplete(sheet: CharacterSheet): boolean {
  const identity = sheet?.identity
  return Boolean(identity?.class_id && identity.species_id && identity.background_id)
}

/** Lê o envelope atual ou uma ficha crua de export antigo. Lança se não for JSON. */
export function parseSheetImport(json: string): { sheet: CharacterSheet; complete: boolean } {
  const data: unknown = JSON.parse(json)
  if (isSheetExport(data)) return { sheet: data.sheet, complete: data.complete === true }

  const sheet = data as CharacterSheet
  return { sheet, complete: looksComplete(sheet) }
}
