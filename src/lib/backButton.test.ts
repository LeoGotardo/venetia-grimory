import { describe, expect, it, vi } from 'vitest'
import { parentPath, pushBackHandler, runBackHandler } from './backButton'

describe('botão voltar', () => {
  it('sem nada registrado, não trata', () => {
    expect(runBackHandler()).toBe(false)
  })

  it('sobreposição ganha da página, mesmo registrada antes dela', () => {
    const modal = vi.fn()
    const page = vi.fn()
    const offModal = pushBackHandler(modal, 'overlay')
    const offPage = pushBackHandler(page, 'page')
    expect(runBackHandler()).toBe(true)
    expect(modal).toHaveBeenCalledOnce()
    expect(page).not.toHaveBeenCalled()
    offModal()
    runBackHandler()
    expect(page).toHaveBeenCalledOnce()
    offPage()
    expect(runBackHandler()).toBe(false)
  })

  it('na mesma camada, o mais recente primeiro', () => {
    const first = vi.fn()
    const second = vi.fn()
    const offFirst = pushBackHandler(first)
    const offSecond = pushBackHandler(second)
    runBackHandler()
    expect(second).toHaveBeenCalledOnce()
    expect(first).not.toHaveBeenCalled()
    offSecond()
    offSecond()
    runBackHandler()
    expect(first).toHaveBeenCalledOnce()
    offFirst()
  })

  it('sobe de rota até a tela inicial', () => {
    expect(parentPath('/')).toBeNull()
    expect(parentPath('/novo')).toBe('/')
    expect(parentPath('/ficha/abc')).toBe('/')
    expect(parentPath('/mestre')).toBe('/')
    expect(parentPath('/mestre/bestiario')).toBe('/mestre')
    expect(parentPath('/mestre/bestiario/m1')).toBe('/mestre/bestiario')
    expect(parentPath('/mestre/campanha/c1')).toBe('/mestre')
    expect(parentPath('/mestre/campanha/c1/area/a1')).toBe('/mestre/campanha/c1')
    expect(parentPath('/mestre/campanha/c1/npc/gerar')).toBe('/mestre/campanha/c1')
  })
})
