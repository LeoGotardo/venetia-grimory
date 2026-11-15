import { describe, expect, it } from 'vitest'
import { DESKTOP_SIGN_IN_PATH, parseDesktopSignIn, type DesktopSignInPages } from '../src/lib/desktopBridge'
import { signInInBrowser } from './browserSignIn'

const pages: DesktopSignInPages = { lang: 'pt', title: 'Login <no> app', done: 'Pronto', failed: 'Falhou' }
// Só precisa ter o formato de um JWT (três partes); um token "de verdade" aqui cai no gitleaks.
const TOKEN = 'header.payload.signature'
const SITE = 'https://venetia.example'

/** O que a página do site faz: lê porta e estado da URL e devolve o formulário ao app. */
function post(port: number, fields: Record<string, string>, init: RequestInit = {}) {
  return fetch(`http://127.0.0.1:${port}/`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(fields).toString(),
    ...init,
  })
}

/** Começa o login e devolve a URL que o app abriria no navegador. */
function start() {
  let opened!: (url: URL) => void
  const url = new Promise<URL>(resolve => { opened = resolve })
  const result = signInInBrowser(SITE, pages, async raw => opened(new URL(raw)))
  return { result, url }
}

describe('signInInBrowser', () => {
  it('abre a página do site e recebe o token do formulário', async () => {
    const { result, url } = start()
    const opened = await url
    expect(opened.origin).toBe(SITE)
    expect(opened.pathname).toBe(DESKTOP_SIGN_IN_PATH)
    const target = parseDesktopSignIn(opened.search)
    expect(target).not.toBeNull()

    const response = await post(target!.port, { estado: target!.state, token: TOKEN })
    expect(response.status).toBe(200)
    const html = await response.text()
    expect(html).toContain('Pronto')
    expect(html).toContain('Login &#60;no&#62; app')
    await expect(result).resolves.toEqual({ ok: true, idToken: TOKEN })
  })

  it('ignora pedidos que não são a volta da página', async () => {
    const { result, url } = start()
    const target = parseDesktopSignIn((await url).search)!

    expect((await post(target.port, { estado: 'outro-estado-qualquer-aqui', token: TOKEN })).status).toBe(403)
    expect((await fetch(`http://127.0.0.1:${target.port}/?estado=${target.state}&token=${TOKEN}`)).status).toBe(404)
    expect((await post(target.port, { estado: target.state, token: TOKEN }, { headers: { 'content-type': 'application/json' } })).status).toBe(415)
    expect((await fetch(`http://127.0.0.1:${target.port}/favicon.ico`, { method: 'POST' })).status).toBe(404)

    // Nada disso encerrou o pedido: o certo ainda entra.
    await post(target.port, { estado: target.state, token: TOKEN })
    await expect(result).resolves.toEqual({ ok: true, idToken: TOKEN })
  })

  it('recusa corpo grande demais sem encerrar o pedido', async () => {
    const { result, url } = start()
    const target = parseDesktopSignIn((await url).search)!
    const big = await post(target.port, { estado: target.state, token: 'x'.repeat(20_000) }).then(r => r.status, () => 'reset')
    expect([413, 'reset']).toContain(big)
    await post(target.port, { estado: target.state, token: TOKEN })
    await expect(result).resolves.toEqual({ ok: true, idToken: TOKEN })
  })

  it('falha com estado certo e token inválido', async () => {
    const { result, url } = start()
    const target = parseDesktopSignIn((await url).search)!
    const response = await post(target.port, { estado: target.state, token: 'nao-e-um-jwt' })
    expect(await response.text()).toContain('Falhou')
    await expect(result).resolves.toEqual({ ok: false, code: 'failed' })
  })

  it('um pedido novo cancela o anterior', async () => {
    const first = start()
    const firstTarget = parseDesktopSignIn((await first.url).search)!
    const second = start()
    await expect(first.result).resolves.toEqual({ ok: false, code: 'cancelled' })
    // O servidor do primeiro fechou.
    await expect(post(firstTarget.port, { estado: firstTarget.state, token: TOKEN })).rejects.toThrow()

    const target = parseDesktopSignIn((await second.url).search)!
    expect(target.state).not.toBe(firstTarget.state)
    await post(target.port, { estado: target.state, token: TOKEN })
    await expect(second.result).resolves.toEqual({ ok: true, idToken: TOKEN })
  })

  it('falha se o navegador não abre', async () => {
    const result = signInInBrowser(SITE, pages, async () => { throw new Error('sem navegador') })
    await expect(result).resolves.toEqual({ ok: false, code: 'failed' })
  })
})
