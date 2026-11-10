import { useCallback, useState } from 'react'
import i18n from '../i18n'
import { useSheetStore } from '../store/sheetStore'
import type { SheetPdfMode } from '../lib/pdf/sheetValues'
import titleFontUrl from '../assets/fonts/Cinzel-Bold.ttf?url'

/** `download` salva o arquivo; `print` abre o diálogo de impressão do navegador. */
export type SheetPdfAction = 'download' | 'print'

export interface PdfTask {
  mode: SheetPdfMode
  action: SheetPdfAction
}

let titleFont: Promise<ArrayBuffer> | null = null

/** A Cinzel dos títulos (~46 KB): buscada na primeira ficha e reaproveitada na sessão. */
function loadTitleFont(): Promise<ArrayBuffer> {
  titleFont ??= fetch(titleFontUrl).then(response => {
    if (!response.ok) throw new Error(`Fonte da ficha não encontrada (${response.status})`)
    return response.arrayBuffer()
  })
  // Uma falha (rede) não fica guardada: a próxima tentativa busca de novo.
  titleFont.catch(() => {
    titleFont = null
  })
  return titleFont
}

/**
 * Gera a ficha do Grimório de Venetia em PDF, no idioma da interface.
 * `export` sai preenchida, sem formulário; `print` sai só com o que não muda
 * em jogo e com formulário editável. A entrega (download, folha de
 * compartilhamento ou diálogo de impressão) fica a cargo de `deliverFile`,
 * que conhece as limitações de cada plataforma.
 */
export function useSheetPdf() {
  const sheet = useSheetStore(s => s.sheet)
  const [generating, setGenerating] = useState<PdfTask | null>(null)
  const [error, setErro] = useState<string | null>(null)

  /**
   * Adianta o download da fonte e do chunk do pdf-lib. No celular, a folha de
   * compartilhamento precisa abrir logo após o toque; com isso já em cache, o
   * tempo entre o toque e a folha cai para a geração do PDF.
   */
  const preparePdf = useCallback(() => {
    void import('../lib/pdf/drawSheet')
    loadTitleFont().catch(err => console.warn('[useSheetPdf] pré-carga da fonte falhou; nova tentativa ao gerar.', err))
  }, [])

  const generatePdf = useCallback(
    async (mode: SheetPdfMode, action: SheetPdfAction = 'download') => {
      setGenerating({ mode, action })
      setErro(null)
      try {
        const [{ drawSheetPdf }, { deliverFile }, font] = await Promise.all([
          import('../lib/pdf/drawSheet'),
          import('../lib/deliverFile'),
          loadTitleFont(),
        ])
        const bytes = await drawSheetPdf(sheet, mode, font)
        await deliverFile(
          {
            bytes,
            fileName: pdfFileName(sheet.identity.character_name, mode),
            mimeType: 'application/pdf',
          },
          action,
        )
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
