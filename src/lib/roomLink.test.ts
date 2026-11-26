import { describe, expect, it } from 'vitest'
import { ROOM_API_URL_APP } from '../constants'
import { roomInviteUrl, roomLinkPath } from './roomLink'

describe('roomLink', () => {
  it('monta o link no domínio de produção', () => {
    expect(roomInviteUrl('ABC234')).toBe(`${ROOM_API_URL_APP}/sala/ABC234`)
  })

  it('o link montado volta como a rota da sala', () => {
    expect(roomLinkPath(roomInviteUrl('ABC234'))).toBe('/sala/ABC234')
  })

  it('normaliza o código do link', () => {
    expect(roomLinkPath('https://venetia.leogotardo.com.br/sala/abc234/')).toBe('/sala/ABC234')
  })

  it('recusa o que não é link de sala', () => {
    expect(roomLinkPath('https://venetia.leogotardo.com.br/termos')).toBeNull()
    expect(roomLinkPath('https://venetia.leogotardo.com.br/sala/ABC234/extra')).toBeNull()
    expect(roomLinkPath('https://venetia.leogotardo.com.br/sala/IO0123')).toBeNull()
    expect(roomLinkPath('https://venetia.leogotardo.com.br/sala/%E0%A4%A')).toBeNull()
    expect(roomLinkPath('não é url')).toBeNull()
  })
})
