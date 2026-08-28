import { useCallback, useState } from 'react'
import i18n from '../i18n'
import { useSheetStore } from '../store/sheetStore'
import type { SheetPdfMode } from '../lib/pdf/fillSheet'

/** Ficha oficial no idioma da interface — os dois modelos têm os mesmos campos. */
function templatePath(): string {
  const file = i18n.language === 'pt' ? 'sheet-template.pdf' : 'sheet-template-en.pdf'
  return `${import.meta.env.BASE_URL}${file}`
}

/** `download` salva o arquivo; `print` abre o diálogo de impressão do navegador. */
export type SheetPdfAction = 'download' | 'print'

export interface PdfTask {
  mode: SheetPdfMode
  action: SheetPdfAction
}

const modeloCache = new Map<string, ArrayBuffer>()

async function carregarModelo(): Promise<ArrayBuffer> {
  // Cada modelo tem ~4,5 MB: é buscado sob demanda e reaproveitado na sessão.
  const caminho = templatePath()
  const cached = modeloCache.get(caminho)
  if (cached) return cached

  const response = await fetch(caminho)
  if (!response.ok) throw new Error(`Modelo não encontrado (${response.status})`)
  const bytes = await response.arrayBuffer()
  modeloCache.set(caminho, bytes)
  return bytes
}

/**
 * Gera a ficha no modelo oficial (D&D 5.5). `export` sai preenchida e
 * achatada; `print` sai só com o que não muda em jogo e segue editável.
 * A entrega (download, folha de compartilhamento ou diálogo de impressão) fica
 * a cargo de `entregarPdf`, que conhece as limitações de cada plataforma.
 */
export function useSheetPdf() {
  const sheet = useSheetStore(s => s.sheet)
  const [generating, setGenerating] = useState<PdfTask | null>(null)
  const [error, setErro] = useState<string | null>(null)

  /**
   * Adianta o download do modelo e do chunk do pdf-lib. No celular, a folha de
   * compartilhamento precisa abrir logo após o toque; com isso já em cache, o
   * tempo entre o toque e a folha cai para a geração do PDF.
   */
  const preparePdf = useCallback(() => {
    void import('../lib/pdf/fillSheet')
    void carregarModelo().catch(() => {})
  }, [])

  const generatePdf = useCallback(
    async (mode: SheetPdfMode, action: SheetPdfAction = 'download') => {
      setGenerating({ mode, action })
      setErro(null)
      try {
        const [{ fillSheetPdf }, { deliverPdf }, template] = await Promise.all([
          import('../lib/pdf/fillSheet'),
          import('../lib/pdf/deliverPdf'),
          carregarModelo(),
        ])
        const bytes = await fillSheetPdf(sheet, mode, template)
        await deliverPdf(bytes, pdfFileName(sheet.identity.character_name, mode), action)
      } catch (err) {
        console.error('[useFichaPdf] falha ao gerar o PDF:', err)
        setErro(err instanceof Error ? err.message : String(err))
      } finally {
        setGenerating(null)
      }
    },
    [sheet],
  )

  return { generatePdf, preparePdf, generating, error }
}

/** `Ficha - Grukk Pedra-Cinza.pdf` / `Sheet - Grukk Pedra-Cinza (print).pdf` */
export function pdfFileName(characterName: string | null, mode: SheetPdfMode): string {
  const standard = i18n.t('sheet.fileFallbackName')
  const name = (characterName ?? standard).replace(/[\\/:*?"<>|]/g, '').trim() || standard
  const base = `${i18n.t('sheet.fileBase')} - ${name}`
  return mode === 'print' ? `${base} (${i18n.t('sheet.filePrint')}).pdf` : `${base}.pdf`
}
