import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import {
  app, BrowserWindow, ipcMain, Menu, net, protocol, session, shell,
  type IpcMainInvokeEvent,
} from 'electron'
import {
  DESKTOP_HOST, DESKTOP_IPC, DESKTOP_SCHEME, DESKTOP_SIGN_IN_ORIGIN,
  type DesktopSignInPages, type DesktopSignInResult,
} from '../src/lib/desktopBridge'
import { resolveAppAsset } from './appProtocol'
import { signInInBrowser } from './browserSignIn'
import { checkForUpdate, downloadUpdate, installUpdate } from './updater'
import { loadWindowState, trackWindowState } from './windowState'

/**
 * Processo principal do app desktop (Windows e Linux). O app é o mesmo bundle
 * da web (`dist/`), servido pelo protocolo `app://venetia/`; este arquivo só
 * cuida da janela, da segurança e do que o navegador não faz sozinho: login com
 * Google, abrir o PDF para imprimir e atualizar o app. Ver "Desktop" no CLAUDE.md.
 */

const APP_ID = 'com.venetia.grimory'
const APP_URL = `${DESKTOP_SCHEME}://${DESKTOP_HOST}/`
const DIST_DIR = path.join(__dirname, '..', 'dist')
const EXTERNAL_PROTOCOLS = new Set(['https:', 'http:', 'mailto:'])
/** Copiar o código da sala usa a área de transferência; nada mais é liberado. */
const ALLOWED_PERMISSIONS = new Set(['clipboard-sanitized-write', 'fullscreen'])
const MAX_PAGE_TEXT = 500
const ZOOM_STEP = 0.5
const ZOOM_LIMIT = 4

// O userData guarda o localStorage e o IndexedDB — as fichas. Fixado aqui
// porque o Electron o deriva do nome do produto: renomear o app abriria uma
// pasta vazia. **Nunca mude** este nome.
app.setPath('userData', path.join(app.getPath('appData'), app.isPackaged ? 'venetia-grimory' : 'venetia-grimory-dev'))

/** Só fora do pacote: `npm run desktop:dev` aponta para o servidor do Vite. */
const devServerUrl = !app.isPackaged ? process.env.VITE_DEV_SERVER_URL || null : null
const devOrigin = devServerUrl ? new URL(devServerUrl).origin : null
/**
 * Onde fica a página de login (`/entrar-desktop`): o site publicado, ou o
 * servidor do Vite no `desktop:dev` (o `localhost` já é domínio autorizado no Firebase).
 */
const signInOrigin = devOrigin ?? DESKTOP_SIGN_IN_ORIGIN

// Antes do `ready`: `standard` dá origem própria (localStorage, rotas com
// history), `secure` dá contexto seguro (crypto.subtle, IndexedDB) e
// `supportFetchAPI` deixa o app buscar os próprios arquivos (licenças, texturas).
protocol.registerSchemesAsPrivileged([
  { scheme: DESKTOP_SCHEME, privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, codeCache: true } },
])

function isAppUrl(raw: string): boolean {
  try {
    const url = new URL(raw)
    // `URL.origin` de esquema não especial é "null": compara protocolo e host.
    if (url.protocol === `${DESKTOP_SCHEME}:` && url.host === DESKTOP_HOST) return true
    return devOrigin !== null && url.origin === devOrigin
  } catch {
    return false
  }
}

function openExternally(raw: string): void {
  try {
    if (EXTERNAL_PROTOCOLS.has(new URL(raw).protocol)) void shell.openExternal(raw)
  } catch {
    // URL inválida: não abre nada.
  }
}

function isTrustedSender(event: IpcMainInvokeEvent): boolean {
  const url = event.senderFrame?.url
  return typeof url === 'string' && isAppUrl(url)
}

function isFile(file: string): boolean {
  try {
    return fs.statSync(file).isFile()
  } catch {
    return false
  }
}

function serveBundle(): void {
  protocol.handle(DESKTOP_SCHEME, request => {
    const asset = resolveAppAsset(DIST_DIR, request.url, isFile)
    if (asset.kind === 'not-found') return new Response('Not found', { status: 404 })
    return net.fetch(pathToFileURL(asset.path).toString())
  })
}

function lockDownContents(): void {
  // No Linux e no Windows o corretor baixa dicionários do CDN do Google (contato
  // que a política de privacidade não prevê). O `spellcheck: false` da janela só
  // desliga o sublinhado: sem isto a sessão baixa o dicionário do idioma mesmo assim.
  session.defaultSession.setSpellCheckerEnabled(false)
  session.defaultSession.setSpellCheckerLanguages([])

  app.on('web-contents-created', (_event, contents) => {
    // Links com target="_blank" (GitHub, formulário, termos do Google) abrem no navegador.
    contents.setWindowOpenHandler(({ url }) => {
      if (!isAppUrl(url)) openExternally(url)
      return { action: 'deny' }
    })
    contents.on('will-navigate', (event, url) => {
      if (isAppUrl(url)) return
      event.preventDefault()
      openExternally(url)
    })
    contents.on('will-attach-webview', event => event.preventDefault())
  })

  session.defaultSession.setPermissionRequestHandler((_contents, permission, callback, details) => {
    callback(ALLOWED_PERMISSIONS.has(permission) && isAppUrl(details.requestingUrl))
  })

  // `<a download>` (JSON, PNG do mapa, PDF) abre o "Salvar como" na pasta Downloads.
  session.defaultSession.on('will-download', (_event, item) => {
    item.setSaveDialogOptions({ defaultPath: path.join(app.getPath('downloads'), item.getFilename()) })
  })
}

function pdfDir(): string {
  return path.join(app.getPath('temp'), 'venetia-grimory')
}

function isPdf(bytes: Uint8Array): boolean {
  return bytes.length > 5 && Buffer.from(bytes.subarray(0, 5)).toString('latin1') === '%PDF-'
}

/** "Imprimir" no desktop: o PDF abre no leitor do sistema, que tem o diálogo de impressão. */
async function openPdf(file: unknown): Promise<boolean> {
  if (typeof file !== 'object' || file === null) return false
  const { bytes, fileName } = file as { bytes?: unknown; fileName?: unknown }
  if (!(bytes instanceof Uint8Array) || !isPdf(bytes) || typeof fileName !== 'string') return false

  const base = path.basename(fileName).replace(/[\\/:*?"<>|\p{Cc}]/gu, '').trim().slice(0, 120) || 'ficha'
  const name = base.toLowerCase().endsWith('.pdf') ? base : `${base}.pdf`
  await fsp.mkdir(pdfDir(), { recursive: true })
  const target = path.join(pdfDir(), name)
  await fsp.writeFile(target, bytes)
  const error = await shell.openPath(target)
  if (error) console.error('[pdf] O sistema não abriu o PDF.', error)
  return error === ''
}

function isSignInPages(value: unknown): value is DesktopSignInPages {
  if (typeof value !== 'object' || value === null) return false
  const pages = value as Record<string, unknown>
  return ['lang', 'title', 'done', 'failed'].every(key => typeof pages[key] === 'string' && (pages[key] as string).length <= MAX_PAGE_TEXT)
}

function registerIpc(): void {
  ipcMain.handle(DESKTOP_IPC.signIn, async (event, pages: unknown): Promise<DesktopSignInResult> => {
    if (!isTrustedSender(event) || !isSignInPages(pages)) return { ok: false, code: 'failed' }
    const result = await signInInBrowser(signInOrigin, pages, url => shell.openExternal(url))
    // A pessoa terminou no navegador: traz o app de volta para a frente.
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
    }
    return result
  })

  ipcMain.handle(DESKTOP_IPC.openPdf, async (event, file: unknown) => {
    if (!isTrustedSender(event)) return false
    return openPdf(file)
  })

  ipcMain.handle(DESKTOP_IPC.updateCheck, async event => (isTrustedSender(event) ? checkForUpdate() : null))

  ipcMain.handle(DESKTOP_IPC.updateDownload, async event => {
    if (!isTrustedSender(event)) throw new Error('remetente não confiável')
    await downloadUpdate(event.sender, DESKTOP_IPC.updateProgress)
  })

  ipcMain.handle(DESKTOP_IPC.updateInstall, async event => {
    if (isTrustedSender(event)) installUpdate()
  })
}

/** Sem o menu padrão do Electron (em inglês, com links do Electron): os atalhos úteis ficam aqui. */
function handleShortcuts(win: BrowserWindow): void {
  win.webContents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown') return
    const contents = win.webContents
    const mod = input.control || input.meta
    const key = input.key.toLowerCase()
    const zoom = (level: number) => contents.setZoomLevel(Math.max(-ZOOM_LIMIT, Math.min(ZOOM_LIMIT, level)))

    if (input.key === 'F11') win.setFullScreen(!win.isFullScreen())
    else if (mod && (key === '=' || key === '+')) zoom(contents.getZoomLevel() + ZOOM_STEP)
    else if (mod && key === '-') zoom(contents.getZoomLevel() - ZOOM_STEP)
    else if (mod && key === '0') zoom(0)
    else if (input.key === 'F5' || (mod && key === 'r')) contents.reload()
    else if (!app.isPackaged && (input.key === 'F12' || (mod && input.shift && key === 'i'))) contents.toggleDevTools()
    else return
    event.preventDefault()
  })
}

function createWindow(): void {
  const userData = app.getPath('userData')
  const { bounds, maximized } = loadWindowState(userData)
  const win = new BrowserWindow({
    ...bounds,
    minWidth: 360,
    minHeight: 560,
    show: false,
    backgroundColor: '#1A1612',
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      webviewTag: false,
      // No Linux o corretor baixaria dicionários do CDN do Google (contato que a
      // política de privacidade não prevê), e sublinharia todo nome de NPC.
      spellcheck: false,
    },
  })

  trackWindowState(win, userData)
  handleShortcuts(win)
  win.once('ready-to-show', () => {
    if (maximized) win.maximize()
    win.show()
  })
  void win.loadURL(devServerUrl ?? APP_URL)
}

function focusExistingWindow(): void {
  const win = BrowserWindow.getAllWindows()[0]
  if (!win) return
  if (win.isMinimized()) win.restore()
  win.focus()
}

// Uma instância só: duas janelas sobre o mesmo localStorage disputariam os
// saves com debounce e uma apagaria a edição da outra.
if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', focusExistingWindow)
  app.on('window-all-closed', () => app.quit())

  void app.whenReady().then(async () => {
    if (process.platform === 'win32') app.setAppUserModelId(APP_ID)
    Menu.setApplicationMenu(null)
    // PDFs abertos para imprimir em sessões anteriores.
    await fsp.rm(pdfDir(), { recursive: true, force: true }).catch(() => undefined)
    serveBundle()
    lockDownContents()
    registerIpc()
    createWindow()
  })
}
