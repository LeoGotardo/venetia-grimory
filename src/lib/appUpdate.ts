import { Capacitor, registerPlugin, type PluginListenerHandle } from '@capacitor/core'
import { LATEST_RELEASE_API_URL, UPDATE_CHECK_TIMEOUT_MS } from '../constants'

/**
 * Atualização do APK distribuído pelo GitHub Releases.
 *
 * A cada abertura do app (Android, build de release) consulta a última release;
 * se a tag gerar um versionCode maior que o instalado, a UI oferece baixar e
 * instalar. O lado nativo é android/.../AppUpdaterPlugin.java.
 */

interface AppUpdaterPlugin {
  getInfo(): Promise<{ versionName: string; versionCode: number; debug: boolean }>
  canInstall(): Promise<{ granted: boolean }>
  openInstallSettings(): Promise<{ granted: boolean }>
  download(options: { url: string; fileName: string }): Promise<{ path: string }>
  install(options: { path: string }): Promise<void>
  addListener(
    event: 'downloadProgress',
    listener: (progress: { loaded: number; total: number }) => void,
  ): Promise<PluginListenerHandle>
}

export const AppUpdater = registerPlugin<AppUpdaterPlugin>('AppUpdater')

export interface AvailableUpdate {
  version: string
  apkUrl: string
  apkName: string
}

const TAG_PATTERN = /^v(\d+)\.(\d+)\.(\d+)$/

/**
 * Mesma fórmula de scripts/build-android-release.sh: v1.2.3 → 10203. É ela que
 * o Android compara, então a decisão de atualizar usa o mesmo número.
 */
export function versionCodeFromTag(tag: string): number | null {
  const m = TAG_PATTERN.exec(tag.trim())
  if (!m) return null
  const [major, minor, patch] = m.slice(1).map(Number)
  if (minor >= 100 || patch >= 100) return null
  return major * 10000 + minor * 100 + patch
}

interface GithubRelease {
  tag_name?: string
  draft?: boolean
  prerelease?: boolean
  assets?: Array<{ name?: string; browser_download_url?: string }>
}

/** Atualização disponível na release, ou null se não houver nada mais novo. */
export function pickUpdate(release: GithubRelease, installedVersionCode: number): AvailableUpdate | null {
  if (!release.tag_name || release.draft || release.prerelease) return null
  const code = versionCodeFromTag(release.tag_name)
  if (code === null || code <= installedVersionCode) return null
  const apk = release.assets?.find(a => a.name?.endsWith('.apk') && a.browser_download_url)
  if (!apk?.name || !apk.browser_download_url) return null
  return { version: release.tag_name, apkUrl: apk.browser_download_url, apkName: apk.name }
}

/**
 * Consulta o GitHub. Qualquer falha (sem internet, timeout, limite da API)
 * vira null: sem conexão o app simplesmente abre, sem aviso.
 */
export async function checkForUpdate(): Promise<AvailableUpdate | null> {
  if (Capacitor.getPlatform() !== 'android' || !navigator.onLine) return null
  try {
    const info = await AppUpdater.getInfo()
    // APK de debug é assinado com outra chave: o instalador recusaria a release.
    if (info.debug) return null

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), UPDATE_CHECK_TIMEOUT_MS)
    try {
      const res = await fetch(LATEST_RELEASE_API_URL, {
        headers: { Accept: 'application/vnd.github+json' },
        signal: controller.signal,
      })
      if (!res.ok) return null
      return pickUpdate((await res.json()) as GithubRelease, info.versionCode)
    } finally {
      clearTimeout(timer)
    }
  } catch {
    return null
  }
}
