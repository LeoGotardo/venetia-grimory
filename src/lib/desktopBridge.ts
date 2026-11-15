/**
 * Contrato entre o app desktop (Electron, pasta `electron/`) e o bundle web.
 *
 * O preload expõe um `DesktopBridge` em `window.venetiaDesktop`; o resto do app
 * só o lê por `desktopBridge()` / `isDesktop()` (`src/lib/platform.ts`). Este
 * arquivo não importa nada: o processo principal e o preload também o usam.
 */

/**
 * Origem do bundle no app desktop: `app://venetia/`. **Nunca mude** — o
 * `localStorage` e o IndexedDB são separados por origem, e outra origem
 * abriria o app sem nenhuma ficha.
 */
export const DESKTOP_SCHEME = 'app'
export const DESKTOP_HOST = 'venetia'

/**
 * Login com Google do app desktop, como no Android: o ID token do Google para o
 * Web client do Firebase, trocado pela sessão com `signInWithCredential`. Quem
 * pega o token é esta página do site, aberta no navegador do sistema (o Google
 * recusa login dentro do Electron); ela o devolve por um POST ao servidor local
 * que o processo principal abriu (`electron/browserSignIn.ts`).
 */
export const DESKTOP_SIGN_IN_PATH = '/entrar-desktop'

/** Site com essa página nos builds empacotados — o mesmo de `ROOM_API_URL_APP`. */
export const DESKTOP_SIGN_IN_ORIGIN = 'https://venetia.leogotardo.com.br'

/** Nomes na URL da página (porta e estado) e no POST de volta ao app (estado e token). */
export const DESKTOP_SIGN_IN_FIELDS = { port: 'porta', state: 'estado', token: 'token' } as const

const STATE_PATTERN = /^[A-Za-z0-9_-]{22,64}$/
const PORT_PATTERN = /^[0-9]{4,5}$/
const MIN_PORT = 1024
const MAX_PORT = 65535

export interface DesktopSignInTarget {
  port: number
  state: string
}

/**
 * Lê a porta e o estado da URL da página. Só aceita porta numérica: o token vai
 * sempre para `127.0.0.1` (`desktopSignInReturnUrl`), nunca para um endereço vindo
 * da URL — senão a página viraria um jeito de mandar o token para qualquer lugar.
 */
export function parseDesktopSignIn(search: string): DesktopSignInTarget | null {
  const params = new URLSearchParams(search)
  const port = params.get(DESKTOP_SIGN_IN_FIELDS.port) ?? ''
  const state = params.get(DESKTOP_SIGN_IN_FIELDS.state) ?? ''
  if (!PORT_PATTERN.test(port) || !STATE_PATTERN.test(state)) return null
  const value = Number(port)
  if (value < MIN_PORT || value > MAX_PORT) return null
  return { port: value, state }
}

/** Para onde a página devolve o token: o servidor local do app, nesta máquina. */
export function desktopSignInReturnUrl(port: number): string {
  return `http://127.0.0.1:${port}/`
}

export const DESKTOP_IPC = {
  signIn: 'venetia:sign-in',
  openPdf: 'venetia:open-pdf',
  updateCheck: 'venetia:update-check',
  updateDownload: 'venetia:update-download',
  updateProgress: 'venetia:update-progress',
  updateInstall: 'venetia:update-install',
} as const

/** Textos da página que o navegador mostra ao voltar do Google (o processo principal não tem i18n). */
export interface DesktopSignInPages {
  lang: string
  title: string
  done: string
  failed: string
}

/**
 * `cancelled`: a pessoa clicou de novo (o pedido novo substitui este) ou o tempo acabou.
 * `failed`: o navegador não abriu ou a página devolveu um pedido sem token.
 */
export type DesktopSignInResult =
  | { ok: true; idToken: string }
  | { ok: false; code: 'cancelled' | 'failed' }

export interface DesktopUpdate {
  /** Tag da release, `v1.2.3`. */
  version: string
}

export interface DesktopPdf {
  bytes: Uint8Array
  fileName: string
}

export interface DesktopBridge {
  platform: string
  /** Abre a página de login do site no navegador do sistema e devolve o ID token do Google. */
  signInWithGoogle(pages: DesktopSignInPages): Promise<DesktopSignInResult>
  /** Grava o PDF numa pasta temporária e abre no leitor de PDF do sistema, de onde se imprime. */
  openPdf(file: DesktopPdf): Promise<boolean>
  /** Versão nova no GitHub Releases, ou null (sem internet, build local, nada novo). */
  checkForUpdate(): Promise<DesktopUpdate | null>
  /** Baixa a versão encontrada por `checkForUpdate`; resolve quando ela está pronta para instalar. */
  downloadUpdate(): Promise<void>
  /** Progresso do download, de 0 a 100. Devolve a função que para de ouvir. */
  onUpdateProgress(listener: (percent: number) => void): () => void
  /** Fecha o app, instala e abre de novo. */
  installUpdate(): Promise<void>
}
