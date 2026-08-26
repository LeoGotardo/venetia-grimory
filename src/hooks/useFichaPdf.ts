import { useCallback, useState } from 'react'
import i18n from '../i18n'
import { useFichaStore } from '../store/fichaStore'
import type { ModoFichaPdf } from '../lib/pdf/preencherFicha'

const MS_ATE_LIMPAR_IMPRESSAO = 60_000

/** Ficha oficial no idioma da interface — os dois modelos têm os mesmos campos. */
function caminhoDoModelo(): string {
  const arquivo = i18n.language === 'pt' ? 'ficha-modelo.pdf' : 'ficha-modelo-en.pdf'
  return `${import.meta.env.BASE_URL}${arquivo}`
}

/** `baixar` salva o arquivo; `imprimir` abre o diálogo de impressão do navegador. */
export type AcaoFichaPdf = 'baixar' | 'imprimir'

export interface TarefaPdf {
  modo: ModoFichaPdf
  acao: AcaoFichaPdf
}

const modeloCache = new Map<string, ArrayBuffer>()

async function carregarModelo(): Promise<ArrayBuffer> {
  // Cada modelo tem ~4,5 MB: é buscado sob demanda e reaproveitado na sessão.
  const caminho = caminhoDoModelo()
  const emCache = modeloCache.get(caminho)
  if (emCache) return emCache

  const resposta = await fetch(caminho)
  if (!resposta.ok) throw new Error(`Modelo não encontrado (${resposta.status})`)
  const bytes = await resposta.arrayBuffer()
  modeloCache.set(caminho, bytes)
  return bytes
}

function urlDoPdf(bytes: Uint8Array): string {
  const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' })
  return URL.createObjectURL(blob)
}

function baixar(bytes: Uint8Array, nomeArquivo: string) {
  const url = urlDoPdf(bytes)
  const link = document.createElement('a')
  link.href = url
  link.download = nomeArquivo
  link.click()
  URL.revokeObjectURL(url)
}

function imprimir(bytes: Uint8Array) {
  const url = urlDoPdf(bytes)
  const iframe = document.createElement('iframe')
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0'
  iframe.src = url

  iframe.onload = () => {
    try {
      iframe.contentWindow?.focus()
      iframe.contentWindow?.print()
    } catch {
      // Alguns navegadores não imprimem PDF em iframe — cai para abrir em aba.
      window.open(url, '_blank')
    }
  }

  document.body.appendChild(iframe)
  // O diálogo bloqueia a aba na maioria dos navegadores, mas não em todos:
  // a limpeza espera o suficiente para a impressão terminar.
  window.setTimeout(() => {
    URL.revokeObjectURL(url)
    iframe.remove()
  }, MS_ATE_LIMPAR_IMPRESSAO)
}

/**
 * Gera a ficha no modelo oficial (D&D 5.5). `exportar` sai preenchida e
 * achatada; `imprimir` sai só com o que não muda em jogo e segue editável.
 */
export function useFichaPdf() {
  const ficha = useFichaStore(s => s.ficha)
  const [gerando, setGerando] = useState<TarefaPdf | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  const gerarPdf = useCallback(
    async (modo: ModoFichaPdf, acao: AcaoFichaPdf = 'baixar') => {
      setGerando({ modo, acao })
      setErro(null)
      try {
        const [{ preencherFichaPdf }, modelo] = await Promise.all([
          import('../lib/pdf/preencherFicha'),
          carregarModelo(),
        ])
        const bytes = await preencherFichaPdf(ficha, modo, modelo)
        if (acao === 'imprimir') imprimir(bytes)
        else baixar(bytes, nomeDoArquivo(ficha.identidade.nome_personagem, modo))
      } catch (err) {
        console.error('[useFichaPdf] falha ao gerar o PDF:', err)
        setErro(err instanceof Error ? err.message : String(err))
      } finally {
        setGerando(null)
      }
    },
    [ficha],
  )

  return { gerarPdf, gerando, erro }
}

/** `Ficha - Grukk Pedra-Cinza.pdf` / `Sheet - Grukk Pedra-Cinza (print).pdf` */
export function nomeDoArquivo(nomePersonagem: string | null, modo: ModoFichaPdf): string {
  const padrao = i18n.t('ficha.fileFallbackName')
  const nome = (nomePersonagem ?? padrao).replace(/[\\/:*?"<>|]/g, '').trim() || padrao
  const base = `${i18n.t('ficha.fileBase')} - ${nome}`
  return modo === 'imprimir' ? `${base} (${i18n.t('ficha.filePrint')}).pdf` : `${base}.pdf`
}
