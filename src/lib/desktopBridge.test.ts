import { describe, expect, it } from 'vitest'
import { desktopSignInReturnUrl, parseDesktopSignIn } from './desktopBridge'

const STATE = 'AbCdEfGhIjKlMnOpQrStUv'

describe('parseDesktopSignIn', () => {
  it('lê porta e estado', () => {
    expect(parseDesktopSignIn(`?porta=49152&estado=${STATE}`)).toEqual({ port: 49152, state: STATE })
    expect(parseDesktopSignIn(`porta=1024&estado=${STATE}-_x`)).toEqual({ port: 1024, state: `${STATE}-_x` })
  })

  it('recusa porta fora do intervalo ou que não é número', () => {
    for (const port of ['', '80', '1023', '65536', '99999', '8080.5', '0x1F90', ' 8080', '8080a', '-8080', '1e4']) {
      expect(parseDesktopSignIn(`?porta=${encodeURIComponent(port)}&estado=${STATE}`)).toBeNull()
    }
  })

  it('recusa estado ausente, curto ou com outros caracteres', () => {
    for (const state of ['', 'curto', `${STATE}!`, `${STATE}/x`, 'a'.repeat(65), `${STATE} `]) {
      expect(parseDesktopSignIn(`?porta=49152&estado=${encodeURIComponent(state)}`)).toBeNull()
    }
  })

  it('não aceita outro destino: o token só volta para 127.0.0.1', () => {
    expect(parseDesktopSignIn(`?porta=49152&estado=${STATE}&destino=https://evil.example`)).toEqual({ port: 49152, state: STATE })
    expect(desktopSignInReturnUrl(49152)).toBe('http://127.0.0.1:49152/')
  })
})
