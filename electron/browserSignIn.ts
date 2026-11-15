import { randomBytes } from 'node:crypto'
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http'
import type { AddressInfo } from 'node:net'
import {
  DESKTOP_SIGN_IN_FIELDS, DESKTOP_SIGN_IN_PATH,
  type DesktopSignInPages, type DesktopSignInResult,
} from '../src/lib/desktopBridge'

/**
 * Login com Google no app desktop, como no Android: o app recebe o ID token do
 * Google para o Web client do Firebase e o renderer o troca pela sessão com
 * `signInWithCredential`. Nenhum cliente OAuth próprio do desktop.
 *
 * O Google recusa login dentro do Electron (navegador embutido), então quem
 * pega o token é a página `/entrar-desktop` do site, aberta no navegador do
 * sistema: ela faz o mesmo popup do Google que o site já faz e devolve o token
 * num POST de formulário para um servidor HTTP efêmero em
 * `127.0.0.1:<porta aleatória>`, aberto aqui. O `estado` aleatório na URL é o
 * que prova que o POST veio da página que este pedido abriu.
 *
 * O POST é uma navegação de página inteira (não um `fetch`): o token não fica
 * na URL nem no histórico, e o navegador não pede permissão de rede local.
 */

const SIGN_IN_TIMEOUT_MS = 5 * 60_000
/** Um ID token do Google tem ~1 KB; o resto é margem. */
const MAX_BODY_BYTES = 16 * 1024
const JWT_PATTERN = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/

interface PendingSignIn {
  cancel(): void
}

let pending: PendingSignIn | null = null

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`)
}

function page(pages: DesktopSignInPages, message: string): string {
  return `<!doctype html><html lang="${escapeHtml(pages.lang)}"><head><meta charset="utf-8"><title>${escapeHtml(pages.title)}</title>`
    + '<meta name="viewport" content="width=device-width, initial-scale=1">'
    + '<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#1A1612;color:#F5F0E8;font:16px/1.5 system-ui,sans-serif;padding:24px;box-sizing:border-box;text-align:center}h1{font-size:20px;color:#EAD9B0;margin:0 0 8px}</style>'
    + `</head><body><main><h1>${escapeHtml(pages.title)}</h1><p>${escapeHtml(message)}</p></main></body></html>`
}

/** Corpo do POST, ou null se passar do limite ou a conexão cair. */
function readBody(req: IncomingMessage): Promise<string | null> {
  return new Promise(resolve => {
    const chunks: Buffer[] = []
    let size = 0
    req.on('data', (chunk: Buffer) => {
      size += chunk.length
      if (size > MAX_BODY_BYTES) {
        resolve(null)
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', () => resolve(null))
  })
}

/** URL da página de login no site, com a porta e o estado deste pedido. */
export function signInPageUrl(siteOrigin: string, port: number, state: string): string {
  const url = new URL(DESKTOP_SIGN_IN_PATH, siteOrigin)
  url.searchParams.set(DESKTOP_SIGN_IN_FIELDS.port, String(port))
  url.searchParams.set(DESKTOP_SIGN_IN_FIELDS.state, state)
  return url.toString()
}

/**
 * Abre a página de login no navegador e espera o token. Um segundo pedido
 * cancela o anterior (a pessoa fechou a aba sem terminar e clicou de novo).
 */
export async function signInInBrowser(
  siteOrigin: string,
  pages: DesktopSignInPages,
  openBrowser: (url: string) => Promise<void>,
): Promise<DesktopSignInResult> {
  pending?.cancel()

  const state = randomBytes(16).toString('base64url')
  const server: Server = createServer()
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => resolve())
  })
  const { port } = server.address() as AddressInfo

  return new Promise<DesktopSignInResult>(resolve => {
    let settled = false
    const finish = (result: DesktopSignInResult) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      if (pending === current) pending = null
      // Não espera conexões keep-alive do navegador para devolver.
      server.close()
      server.closeAllConnections()
      resolve(result)
    }
    const current: PendingSignIn = { cancel: () => finish({ ok: false, code: 'cancelled' }) }
    pending = current
    const timer = setTimeout(() => finish({ ok: false, code: 'cancelled' }), SIGN_IN_TIMEOUT_MS)

    // Responde e só depois encerra: fechar as conexões antes cortaria a página.
    const reply = (res: ServerResponse, message: string, result: DesktopSignInResult) => {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', connection: 'close' })
      res.end(page(pages, message), () => finish(result))
    }

    server.on('request', (req, res) => {
      const path = new URL(req.url ?? '/', 'http://127.0.0.1').pathname
      // O navegador também pede /favicon.ico e afins; só o POST na raiz é a volta da página.
      if (path !== '/' || req.method !== 'POST') {
        res.writeHead(404).end()
        return
      }
      if (!(req.headers['content-type'] ?? '').startsWith('application/x-www-form-urlencoded')) {
        res.writeHead(415).end()
        return
      }

      void readBody(req).then(body => {
        if (body === null) {
          if (!res.headersSent) res.writeHead(413).end()
          return
        }
        const form = new URLSearchParams(body)
        // Estado errado não encerra o pedido: não foi a página que este pedido abriu.
        if (form.get(DESKTOP_SIGN_IN_FIELDS.state) !== state) {
          res.writeHead(403).end()
          return
        }
        const idToken = form.get(DESKTOP_SIGN_IN_FIELDS.token) ?? ''
        if (JWT_PATTERN.test(idToken)) reply(res, pages.done, { ok: true, idToken })
        else reply(res, pages.failed, { ok: false, code: 'failed' })
      })
    })

    openBrowser(signInPageUrl(siteOrigin, port, state)).catch(err => {
      console.error('[login] Não foi possível abrir o navegador.', err)
      finish({ ok: false, code: 'failed' })
    })
  })
}
