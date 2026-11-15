import { Capacitor } from '@capacitor/core'
import type { DesktopBridge } from './desktopBridge'

declare global {
  interface Window {
    /** Exposto pelo preload do app desktop (`electron/preload.ts`). */
    venetiaDesktop?: DesktopBridge
  }
}

/**
 * Rodando dentro do app Android (WebView do Capacitor), não no navegador.
 * Falso no app desktop, que não tem os plugins do Capacitor — ver `isDesktop`.
 */
export function isApp(): boolean {
  return Capacitor.isNativePlatform()
}

/** A ponte do app desktop (Electron), ou null no navegador e no Android. */
export function desktopBridge(): DesktopBridge | null {
  return typeof window !== 'undefined' ? window.venetiaDesktop ?? null : null
}

/** Rodando no app desktop para Windows/Linux (Electron). */
export function isDesktop(): boolean {
  return desktopBridge() !== null
}

export function isTouchScreen(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches
}

/**
 * Onde o arquivo sai pela folha de compartilhamento em vez de download: no app o
 * WebView ignora `<a download>`, e no celular a folha é o caminho normal para
 * salvar, imprimir ou mandar o PDF para outro aplicativo. O desktop, mesmo com
 * tela de toque, salva com o "Salvar como".
 */
export function deliverViaShare(): boolean {
  if (isDesktop()) return false
  return isApp() || (isTouchScreen() && typeof navigator.canShare === 'function')
}
