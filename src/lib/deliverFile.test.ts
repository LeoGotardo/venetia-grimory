import { describe, expect, it } from 'vitest'
import { appCacheFileName } from './deliverFile'

describe('appCacheFileName', () => {
  it('troca espaço, acento e parênteses por _ e mantém a extensão', () => {
    expect(appCacheFileName('Ficha - Grukk Pedra-Cinza (impressão).pdf'))
      .toBe('Ficha_-_Grukk_Pedra-Cinza_impressao.pdf')
  })

  it('cai para um nome padrão quando nada sobra', () => {
    expect(appCacheFileName('???.json')).toBe('arquivo.json')
  })
})
