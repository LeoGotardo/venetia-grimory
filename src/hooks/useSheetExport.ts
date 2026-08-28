import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSheetStore } from '../store/sheetStore'

function downloadBlob(content: string, fileName: string, type: string) {
  const blob = new Blob([content], { type: type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

export function useSheetExport() {
  const navigate = useNavigate()
  const { exportSheetJson, importSheetJson, loadSavedList } = useSheetStore()

  const exportar = useCallback(
    (characterName: string | null) => {
      const json = exportSheetJson()
      const name = characterName?.replace(/\s+/g, '_') ?? 'personagem'
      downloadBlob(json, `${name}.json`, 'application/json')
    },
    [exportSheetJson],
  )

  const exportById = useCallback(
    (id: string, characterName: string) => {
      const raw = localStorage.getItem(`dnd_ficha_${id}`)
      if (!raw) return
      const name = characterName.replace(/\s+/g, '_')
      downloadBlob(raw, `${name}.json`, 'application/json')
    },
    [],
  )

  const importSheet = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'

    input.onchange = event => {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = loadEvent => {
        const json = loadEvent.target?.result as string

        try {
          importSheetJson(json)
          loadSavedList()
          const newId = useSheetStore.getState().sheetId
          if (newId) navigate(`/ficha/${newId}`)
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
