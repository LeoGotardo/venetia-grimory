import { Capacitor } from '@capacitor/core'

/** Rodando dentro do app Android (WebView do Capacitor), não no navegador. */
export function isApp(): boolean {
  return Capacitor.isNativePlatform()
}

export function isTouchScreen(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches
}

/**
 * Onde o arquivo sai pela folha de compartilhamento em vez de download: no app o
 * WebView ignora `<a download>`, e no celular a folha é o caminho normal para
 * salvar, imprimir ou mandar o PDF para outro aplicativo.
 */
export function deliverViaShare(): boolean {
  return isApp() || (isTouchScreen() && typeof navigator.canShare === 'function')
}
