import { isApp, isTouchScreen } from '../platform'

const MS_UNTIL_PRINT_CLEANUP = 60_000
const BASE64_CHUNK_SIZE = 0x8000

/** Como o arquivo chegou até a pessoa — o rótulo muda conforme a plataforma. */
export type PdfDelivery = 'baixado' | 'compartilhado' | 'impresso'

function pdfBlob(bytes: Uint8Array): Blob {
  return new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' })
}

function downloadFile(bytes: Uint8Array, fileName: string): PdfDelivery {
  const url = URL.createObjectURL(pdfBlob(bytes))
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
  return 'baixado'
}

function printInBrowser(bytes: Uint8Array): PdfDelivery {
  const url = URL.createObjectURL(pdfBlob(bytes))
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
  }, MS_UNTIL_PRINT_CLEANUP)

  return 'impresso'
}

/** Web Share API: no celular é ela que dá "Salvar em Arquivos", "Imprimir" e o resto. */
async function shareOnWeb(bytes: Uint8Array, fileName: string): Promise<boolean> {
  const file = new File([pdfBlob(bytes)], fileName, { type: 'application/pdf' })
  if (!navigator.canShare?.({ files: [file] })) return false

  try {
    await navigator.share({ files: [file], title: fileName })
    return true
  } catch (err) {
    // Cancelar a folha de compartilhamento não é erro — e não deve virar um download.
    return err instanceof Error && err.name === 'AbortError'
  }
}

function toBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i += BASE64_CHUNK_SIZE) {
    binary += String.fromCharCode(...bytes.subarray(i, i + BASE64_CHUNK_SIZE))
  }
  return btoa(binary)
}

/**
 * No app, o WebView ignora `<a download>` e não tem diálogo de impressão: o PDF é
 * gravado no cache e entregue à folha de compartilhamento do sistema, de onde dá
 * para salvar, imprimir ou mandar para outro app.
 */
async function shareInApp(bytes: Uint8Array, fileName: string): Promise<PdfDelivery> {
  const [{ Filesystem, Directory }, { Share }] = await Promise.all([
    import('@capacitor/filesystem'),
    import('@capacitor/share'),
  ])

  const { uri } = await Filesystem.writeFile({
    path: fileName,
    data: toBase64(bytes),
    directory: Directory.Cache,
  })

  await Share.share({ title: fileName, files: [uri] })
  return 'compartilhado'
}

/** Entrega o PDF pelo caminho que a plataforma atual suporta. */
export async function deliverPdf(
  bytes: Uint8Array,
  fileName: string,
  action: 'download' | 'print',
): Promise<PdfDelivery> {
  if (isApp()) return shareInApp(bytes, fileName)

  if (isTouchScreen() && (await shareOnWeb(bytes, fileName))) return 'compartilhado'

  return action === 'print' ? printInBrowser(bytes) : downloadFile(bytes, fileName)
}
