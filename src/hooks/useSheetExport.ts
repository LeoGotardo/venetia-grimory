import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSheetStore } from '../store/sheetStore'
import { pickTextFile } from '../lib/pickTextFile'
import { deliverJson } from '../lib/deliverJson'

export function useSheetExport() {
  const navigate = useNavigate()
  const { exportSheetJson, exportSavedSheetJson, importSheetJson, loadSavedList } = useSheetStore()

  const exportar = useCallback(
    (characterName: string | null) => {
      const json = exportSheetJson()
      const name = characterName?.replace(/\s+/g, '_') ?? 'personagem'
      void deliverJson(json, `${name}.json`)
    },
    [exportSheetJson],
  )

  const exportById = useCallback(
    (id: string, characterName: string) => {
      const json = exportSavedSheetJson(id)
      if (!json) return
      const name = characterName.replace(/\s+/g, '_')
      void deliverJson(json, `${name}.json`)
    },
    [exportSavedSheetJson],
  )

  const importSheet = useCallback(async () => {
    const json = await pickTextFile()
    if (!json) return

    try {
      importSheetJson(json)
      loadSavedList()
      const { sheetId: newId, completeSheet } = useSheetStore.getState()
      // Rascunho importado continua de onde parou, como ao abrir pela Home.
      if (newId) navigate(completeSheet ? `/ficha/${newId}` : '/novo')
    } catch (err) {
      console.error('[useFichaExport] JSON inválido:', err)
    }
  }, [importSheetJson, loadSavedList, navigate])

  return { exportar, exportById, importSheet }
}
