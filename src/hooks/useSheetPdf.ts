import { useCallback, useState } from 'react'
import i18n from '../i18n'
import { useFichaStore } from '../store/fichaStore'
import type { ModoFichaPdf } from '../lib/pdf/preencherFicha'

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

/**
 * Gera a ficha no modelo oficial (D&D 5.5). `exportar` sai preenchida e
 * achatada; `imprimir` sai só com o que não muda em jogo e segue editável.
 * A entrega (download, folha de compartilhamento ou diálogo de impressão) fica
 * a cargo de `entregarPdf`, que conhece as limitações de cada plataforma.
 */
export function useFichaPdf() {
  const ficha = useFichaStore(s => s.ficha)
  const [gerando, setGerando] = useState<TarefaPdf | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  /**
   * Adianta o download do modelo e do chunk do pdf-lib. No celular, a folha de
   * compartilhamento precisa abrir logo após o toque; com isso já em cache, o
   * tempo entre o toque e a folha cai para a geração do PDF.
   */
  const prepararPdf = useCallback(() => {
    void import('../lib/pdf/preencherFicha')
    void carregarModelo().catch(() => {})
  }, [])

  const gerarPdf = useCallback(
    async (modo: ModoFichaPdf, acao: AcaoFichaPdf = 'baixar') => {
      setGerando({ modo, acao })
      setErro(null)
      try {
        const [{ preencherFichaPdf }, { entregarPdf }, modelo] = await Promise.all([
          import('../lib/pdf/preencherFicha'),
          import('../lib/pdf/entregarPdf'),
          carregarModelo(),
        ])
        const bytes = await preencherFichaPdf(ficha, modo, modelo)
        await entregarPdf(bytes, nomeDoArquivo(ficha.identidade.nome_personagem, modo), acao)
      } catch (err) {
        console.error('[useFichaPdf] falha ao gerar o PDF:', err)
        setErro(err instanceof Error ? err.message : String(err))
      } finally {
        setGerando(null)
      }
    },
    [ficha],
  )

  return { gerarPdf, prepararPdf, gerando, erro }
}

/** `Ficha - Grukk Pedra-Cinza.pdf` / `Sheet - Grukk Pedra-Cinza (print).pdf` */
export function nomeDoArquivo(nomePersonagem: string | null, modo: ModoFichaPdf): string {
  const padrao = i18n.t('ficha.fileFallbackName')
  const nome = (nomePersonagem ?? padrao).replace(/[\\/:*?"<>|]/g, '').trim() || padrao
  const base = `${i18n.t('ficha.fileBase')} - ${nome}`
  return modo === 'imprimir' ? `${base} (${i18n.t('ficha.filePrint')}).pdf` : `${base}.pdf`
}
