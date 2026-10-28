import { STORAGE_KEY_CAMPAIGN_LIST, STORAGE_KEY_LIST, STORAGE_KEY_SEEN_VERSION } from '../constants'

/**
 * Qual versão o aparelho já viu nas novidades. Lê as chaves cruas, sem os
 * storages das fichas e campanhas: isto roda na abertura do app, e eles trariam
 * o código do mestre para o carregamento inicial.
 */

export function readSeenVersion(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY_SEEN_VERSION)
  } catch {
    return null
  }
}

export function markVersionSeen(version: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_SEEN_VERSION, version)
  } catch (err) {
    console.error('[novidades] Falha ao gravar a versão vista.', err)
  }
}

/** Já usava o app antes (tem ficha ou campanha salva): é atualização, não instalação nova. */
export function hasSavedData(): boolean {
  try {
    return [STORAGE_KEY_LIST, STORAGE_KEY_CAMPAIGN_LIST].some(key => {
      const raw = localStorage.getItem(key)
      return raw != null && raw !== '[]'
    })
  } catch {
    return false
  }
}
