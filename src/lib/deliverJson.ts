/**
 * Entrega um JSON pelo mesmo caminho do PDF (`deliverFile`): no app o WebView
 * ignora `<a download>` e o arquivo sai pela folha de compartilhamento. O módulo
 * de entrega é carregado sob demanda para os plugins do Capacitor ficarem fora
 * do chunk principal.
 */
export async function deliverJson(content: string, fileName: string): Promise<void> {
  try {
    const { deliverFile } = await import('./deliverFile')
    await deliverFile({
      bytes: new TextEncoder().encode(content),
      fileName,
      mimeType: 'application/json',
    })
  } catch (err) {
    console.error('[deliverJson] falha ao exportar o JSON:', err)
  }
}
