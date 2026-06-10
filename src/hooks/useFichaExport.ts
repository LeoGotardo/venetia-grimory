import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFichaStore } from '../store/fichaStore'

function downloadBlob(conteudo: string, nomeArquivo: string, tipo: string) {
  const blob = new Blob([conteudo], { type: tipo })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = nomeArquivo
  link.click()
  URL.revokeObjectURL(url)
}

export function useFichaExport() {
  const navigate = useNavigate()
  const { exportarJSON, importarJSON, carregarListaSalvas } = useFichaStore()

  const exportar = useCallback(
    (nomePersonagem: string | null) => {
      const json = exportarJSON()
      const nome = nomePersonagem?.replace(/\s+/g, '_') ?? 'personagem'
      downloadBlob(json, `${nome}.json`, 'application/json')
    },
    [exportarJSON],
  )

  const exportarPorId = useCallback(
    (id: string, nomePersonagem: string) => {
      const raw = localStorage.getItem(`dnd_ficha_${id}`)
      if (!raw) return
      const nome = nomePersonagem.replace(/\s+/g, '_')
      downloadBlob(raw, `${nome}.json`, 'application/json')
    },
    [],
  )

  const importar = useCallback(() => {
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
          importarJSON(json)
          carregarListaSalvas()
          const newId = useFichaStore.getState().fichaId
          if (newId) navigate(`/ficha/${newId}`)
        } catch (err) {
          console.error('[useFichaExport] JSON inválido:', err)
        }
      }

      reader.readAsText(file)
    }

    input.click()
  }, [importarJSON, carregarListaSalvas, navigate])

  return { exportar, exportarPorId, importar }
}
