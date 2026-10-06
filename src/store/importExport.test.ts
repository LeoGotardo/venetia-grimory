import { describe, it, expect, beforeEach } from 'vitest'
import { useSheetStore } from './sheetStore'
import { makeSheet } from '../test/fixtures'
import { listSheets } from '../services/sheetStorage'

const st = () => useSheetStore.getState()

function readySheet() {
  const sheet = makeSheet({ classId: 'guerreiro', level: 3 })
  sheet.identity.species_id = 'humano'
  sheet.identity.background_id = 'soldado'
  return sheet
}

const importedItem = () => listSheets().find(item => item.id === st().sheetId)

/**
 * A marca de "pronta" vive na lista, não na ficha. O JSON precisa levá-la,
 * senão a ficha importada volta como rascunho e reabre o wizard.
 */
describe('importar o JSON exportado', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('ficha pronta volta pronta', () => {
    useSheetStore.setState({ sheet: readySheet(), completeSheet: true })
    st().importSheetJson(st().exportSheetJson())
    expect(st().completeSheet).toBe(true)
    expect(importedItem()?.complete).toBe(true)
  })

  it('rascunho volta rascunho, mesmo com classe, espécie e antecedente', () => {
    useSheetStore.setState({ sheet: readySheet(), completeSheet: false })
    st().importSheetJson(st().exportSheetJson())
    expect(st().completeSheet).toBe(false)
    expect(importedItem()?.complete).toBe(false)
  })

  it('export antigo (ficha crua) com as escolhas feitas é tratado como pronto', () => {
    st().importSheetJson(JSON.stringify(readySheet()))
    expect(st().completeSheet).toBe(true)
    expect(importedItem()?.complete).toBe(true)
  })

  it('export antigo sem espécie continua rascunho', () => {
    const sheet = readySheet()
    sheet.identity.species_id = null
    st().importSheetJson(JSON.stringify(sheet))
    expect(st().completeSheet).toBe(false)
  })

  it('exporta uma ficha salva pela Home com a marca da lista', () => {
    useSheetStore.setState({ sheet: readySheet(), sheetId: null, completeSheet: false })
    st().saveLocal()
    const json = st().exportSavedSheetJson(st().sheetId!)
    expect(JSON.parse(json!).complete).toBe(true)
  })
})
