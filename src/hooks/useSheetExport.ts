import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSheetStore } from '../store/sheetStore'

/**
 * Mesmo caminho do PDF (`deliverFile`): no app o WebView ignora `<a download>`
 * e o JSON sai pela folha de compartilhamento.
 */
async function deliverJson(content: string, fileName: string) {
  try {
    const { deliverFile } = await import('../lib/deliverFile')
    await deliverFile({
      bytes: new TextEncoder().encode(content),
      fileName,
      mimeType: 'application/json',
    })
  } catch (err) {
    console.error('[useSheetExport] falha ao exportar o JSON:', err)
  }
}

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

  const importSheet = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json,application/json'

    input.onchange = event => {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = loadEvent => {
        const json = loadEvent.target?.result as string

        try {
          importSheetJson(json)
          loadSavedList()
          const { sheetId: newId, completeSheet } = useSheetStore.getState()
          // Rascunho importado continua de onde parou, como ao abrir pela Home.
          if (newId) navigate(completeSheet ? `/ficha/${newId}` : '/novo')
        } catch (err) {
          console.error('[useFichaExport] JSON inválido:', err)
        }
      }

      reader.readAsText(file)
    }

    input.click()
  }, [importSheetJson, loadSavedList, navigate])

  return { exportar, exportById, importSheet }
}
