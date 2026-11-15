import { app, type WebContents } from 'electron'
import { autoUpdater } from 'electron-updater'
import type { DesktopUpdate } from '../src/lib/desktopBridge'

/**
 * Atualização do app desktop pelo GitHub Releases, com o electron-updater: ele
 * lê o `latest.yml` (Windows) ou `latest-linux.yml` (Linux) que o
 * electron-builder publica junto com os instaladores na release da tag.
 *
 * Quem decide baixar é a pessoa, no `UpdatePrompt` — nada baixa sozinho. Uma
 * atualização baixada e não instalada entra quando o app fecha.
 */

autoUpdater.autoDownload = false
autoUpdater.autoInstallOnAppQuit = true

let downloading: Promise<void> | null = null

/** Só no app empacotado: em `npm run desktop:dev` a versão é a do package.json, não a da release. */
export async function checkForUpdate(): Promise<DesktopUpdate | null> {
  if (!app.isPackaged) return null
  try {
    const result = await autoUpdater.checkForUpdates()
    if (!result?.isUpdateAvailable) return null
    return { version: `v${result.updateInfo.version}` }
  } catch (err) {
    // Sem internet, release sem os arquivos do desktop, AppImage rodando extraído…
    console.warn('[atualização] Não foi possível consultar a release.', err)
    return null
  }
}

export function downloadUpdate(sender: WebContents, progressChannel: string): Promise<void> {
  if (downloading) return downloading
  const onProgress = (progress: { percent: number }) => {
    if (!sender.isDestroyed()) sender.send(progressChannel, Math.round(progress.percent))
  }
  autoUpdater.on('download-progress', onProgress)
  downloading = autoUpdater
    .downloadUpdate()
    .then(() => undefined)
    .finally(() => {
      autoUpdater.off('download-progress', onProgress)
      downloading = null
    })
  return downloading
}

export function installUpdate(): void {
  // Silencioso e reabrindo o app: o instalador NSIS "one-click" não pergunta nada.
  autoUpdater.quitAndInstall(true, true)
}
