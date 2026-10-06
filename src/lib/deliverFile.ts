import { isApp, isTouchScreen } from './platform'

const MS_UNTIL_PRINT_CLEANUP = 60_000
/**
 * Bytes por escrita no app. Múltiplo de 3, para cada bloco virar base64 sem
 * `=` no meio do arquivo. A ficha em PDF passa de 4 MB: mandá-la inteira numa
 * única mensagem da bridge do Capacitor (~6 MB de base64) derruba o app em
 * aparelhos com pouca memória, então ela vai em pedaços de ~1 MB.
 */
const APP_WRITE_CHUNK_BYTES = 3 * 256 * 1024
const BASE64_CHUNK_SIZE = 0x8000

/** Como o arquivo chegou até a pessoa — o rótulo muda conforme a plataforma. */
export type FileDelivery = 'baixado' | 'compartilhado' | 'impresso'

export interface DeliverableFile {
  bytes: Uint8Array
  fileName: string
  mimeType: string
}

function toBlob({ bytes, mimeType }: DeliverableFile): Blob {
  return new Blob([bytes as unknown as BlobPart], { type: mimeType })
}

function downloadFile(file: DeliverableFile): FileDelivery {
  const url = URL.createObjectURL(toBlob(file))
  const link = document.createElement('a')
  link.href = url
  link.download = file.fileName
  link.click()
  URL.revokeObjectURL(url)
  return 'baixado'
}

function printInBrowser(file: DeliverableFile): FileDelivery {
  const url = URL.createObjectURL(toBlob(file))
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
async function shareOnWeb(file: DeliverableFile): Promise<boolean> {
  const shared = new File([toBlob(file)], file.fileName, { type: file.mimeType })
  if (!navigator.canShare?.({ files: [shared] })) return false

  try {
    await navigator.share({ files: [shared], title: file.fileName })
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
 * Nome seguro para o cache do app: a URI `file://` passa pelo `FileProvider` e
 * pelo `MimeTypeMap` do Android, que tropeçam em espaço, acento e parênteses.
 * O nome bonito continua no título da folha de compartilhamento.
 */
export function appCacheFileName(fileName: string): string {
  const dot = fileName.lastIndexOf('.')
  const ext = dot > 0 ? fileName.slice(dot) : ''
  const base = (dot > 0 ? fileName.slice(0, dot) : fileName)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
  return `${base || 'arquivo'}${ext}`
}

/**
 * No app, o WebView ignora `<a download>` e não tem diálogo de impressão: o
 * arquivo é gravado no cache e entregue à folha de compartilhamento do sistema,
 * de onde dá para salvar, imprimir ou mandar para outro app.
 */
async function shareInApp(file: DeliverableFile): Promise<FileDelivery> {
  const [{ Filesystem, Directory }, { Share }] = await Promise.all([
    import('@capacitor/filesystem'),
    import('@capacitor/share'),
  ])

  const path = appCacheFileName(file.fileName)
  let uri = ''
  for (let offset = 0; offset === 0 || offset < file.bytes.length; offset += APP_WRITE_CHUNK_BYTES) {
    const data = toBase64(file.bytes.subarray(offset, offset + APP_WRITE_CHUNK_BYTES))
    if (offset === 0) {
      ;({ uri } = await Filesystem.writeFile({ path, data, directory: Directory.Cache }))
    } else {
      await Filesystem.appendFile({ path, data, directory: Directory.Cache })
    }
  }

  try {
    await Share.share({ title: file.fileName, dialogTitle: file.fileName, files: [uri] })
  } catch (err) {
    // Fechar a folha sem escolher nada volta como "Share canceled" — não é erro.
    if (!(err instanceof Error && /cancel/i.test(err.message))) throw err
  }
  return 'compartilhado'
}

/** Entrega o arquivo pelo caminho que a plataforma atual suporta. */
export async function deliverFile(
  file: DeliverableFile,
  action: 'download' | 'print' = 'download',
): Promise<FileDelivery> {
  if (isApp()) return shareInApp(file)

  if (isTouchScreen() && (await shareOnWeb(file))) return 'compartilhado'

  return action === 'print' ? printInBrowser(file) : downloadFile(file)
}
