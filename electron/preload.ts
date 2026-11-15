import { contextBridge, ipcRenderer } from 'electron'
import { DESKTOP_IPC, type DesktopBridge } from '../src/lib/desktopBridge'

/**
 * Preload em sandbox: só fala com o processo principal pelo IPC e expõe ao
 * app a ponte de `src/lib/desktopBridge.ts` em `window.venetiaDesktop`. Nada
 * do Node chega à página. Empacotado sozinho em `preload.cjs` — o preload em
 * sandbox não pode dar `require` em outro arquivo do app.
 */

const bridge: DesktopBridge = {
  platform: process.platform,
  signInWithGoogle: pages => ipcRenderer.invoke(DESKTOP_IPC.signIn, pages),
  openPdf: file => ipcRenderer.invoke(DESKTOP_IPC.openPdf, file),
  checkForUpdate: () => ipcRenderer.invoke(DESKTOP_IPC.updateCheck),
  downloadUpdate: () => ipcRenderer.invoke(DESKTOP_IPC.updateDownload),
  onUpdateProgress: listener => {
    const handler = (_event: Electron.IpcRendererEvent, percent: unknown) => {
      if (typeof percent === 'number') listener(percent)
    }
    ipcRenderer.on(DESKTOP_IPC.updateProgress, handler)
    return () => {
      ipcRenderer.removeListener(DESKTOP_IPC.updateProgress, handler)
    }
  },
  installUpdate: () => ipcRenderer.invoke(DESKTOP_IPC.updateInstall),
}

contextBridge.exposeInMainWorld('venetiaDesktop', bridge)
