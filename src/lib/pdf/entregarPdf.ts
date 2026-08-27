import { ehApp, ehTelaDeToque } from '../plataforma'

const MS_ATE_LIMPAR_IMPRESSAO = 60_000
const TAMANHO_PEDACO_BASE64 = 0x8000

/** Como o arquivo chegou até a pessoa — o rótulo muda conforme a plataforma. */
export type EntregaPdf = 'baixado' | 'compartilhado' | 'impresso'

function blobDoPdf(bytes: Uint8Array): Blob {
  return new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' })
}

function baixar(bytes: Uint8Array, nomeArquivo: string): EntregaPdf {
  const url = URL.createObjectURL(blobDoPdf(bytes))
  const link = document.createElement('a')
  link.href = url
  link.download = nomeArquivo
  link.click()
  URL.revokeObjectURL(url)
  return 'baixado'
}

function imprimirNoNavegador(bytes: Uint8Array): EntregaPdf {
  const url = URL.createObjectURL(blobDoPdf(bytes))
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

  return 'impresso'
}

/** Web Share API: no celular é ela que dá "Salvar em Arquivos", "Imprimir" e o resto. */
async function compartilharNaWeb(bytes: Uint8Array, nomeArquivo: string): Promise<boolean> {
  const arquivo = new File([blobDoPdf(bytes)], nomeArquivo, { type: 'application/pdf' })
  if (!navigator.canShare?.({ files: [arquivo] })) return false

  try {
    await navigator.share({ files: [arquivo], title: nomeArquivo })
    return true
  } catch (err) {
    // Cancelar a folha de compartilhamento não é erro — e não deve virar um download.
    return err instanceof Error && err.name === 'AbortError'
  }
}

function paraBase64(bytes: Uint8Array): string {
  let binario = ''
  for (let i = 0; i < bytes.length; i += TAMANHO_PEDACO_BASE64) {
    binario += String.fromCharCode(...bytes.subarray(i, i + TAMANHO_PEDACO_BASE64))
  }
  return btoa(binario)
}

/**
 * No app, o WebView ignora `<a download>` e não tem diálogo de impressão: o PDF é
 * gravado no cache e entregue à folha de compartilhamento do sistema, de onde dá
 * para salvar, imprimir ou mandar para outro app.
 */
async function compartilharNoApp(bytes: Uint8Array, nomeArquivo: string): Promise<EntregaPdf> {
  const [{ Filesystem, Directory }, { Share }] = await Promise.all([
    import('@capacitor/filesystem'),
    import('@capacitor/share'),
  ])

  const { uri } = await Filesystem.writeFile({
    path: nomeArquivo,
    data: paraBase64(bytes),
    directory: Directory.Cache,
  })

  await Share.share({ title: nomeArquivo, files: [uri] })
  return 'compartilhado'
}

/** Entrega o PDF pelo caminho que a plataforma atual suporta. */
export async function entregarPdf(
  bytes: Uint8Array,
  nomeArquivo: string,
  acao: 'baixar' | 'imprimir',
): Promise<EntregaPdf> {
  if (ehApp()) return compartilharNoApp(bytes, nomeArquivo)

  if (ehTelaDeToque() && (await compartilharNaWeb(bytes, nomeArquivo))) return 'compartilhado'

  return acao === 'imprimir' ? imprimirNoNavegador(bytes) : baixar(bytes, nomeArquivo)
}
