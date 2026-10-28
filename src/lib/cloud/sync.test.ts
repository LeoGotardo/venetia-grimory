import { describe, it, expect } from 'vitest'
import { cloudKey, isDirty, parseCloudKey, resolvePulled } from './sync'
import { contentHash } from './hash'

describe('regras do sync com a conta', () => {
  it('chave por tipo e id, com id que tem dois-pontos', () => {
    expect(parseCloudKey(cloudKey('area_map', 'a:b'))).toEqual({ kind: 'area_map', id: 'a:b' })
  })

  it('sujo é o que mudou aqui e a nuvem não tem', () => {
    expect(isDirty({ hash: 'a', at: '' })).toBe(true)
    expect(isDirty({ hash: 'a', synced: 'a', at: '' })).toBe(false)
    expect(isDirty({ hash: null, synced: 'a', at: '' })).toBe(true)
  })

  it('registro desconhecido: aplica conteúdo, ignora lápide', () => {
    expect(resolvePulled(undefined, 'x', '2026-01-01T00:00:00.000Z')).toBe('apply')
    expect(resolvePulled(undefined, null, '2026-01-01T00:00:00.000Z')).toBe('in-sync')
  })

  it('mesmo conteúdo está em dia, mesmo se o registro estava sujo', () => {
    expect(resolvePulled({ hash: 'x', synced: 'y', at: '2026-02-01T00:00:00.000Z' }, 'x', '2026-01-01T00:00:00.000Z')).toBe('in-sync')
  })

  it('limpo aqui: a nuvem ganha', () => {
    expect(resolvePulled({ hash: 'a', synced: 'a', at: '2026-02-01T00:00:00.000Z' }, 'b', '2026-01-01T00:00:00.000Z')).toBe('apply')
  })

  it('sujo dos dois lados: ganha a mudança mais nova', () => {
    const local = { hash: 'a', synced: 'o', at: '2026-01-02T00:00:00.000Z' }
    expect(resolvePulled(local, 'b', '2026-01-01T00:00:00.000Z')).toBe('keep-local')
    expect(resolvePulled(local, 'b', '2026-01-03T00:00:00.000Z')).toBe('apply')
  })

  it('hash muda com o conteúdo e repete para o mesmo texto', () => {
    expect(contentHash('{"a":1}')).toBe(contentHash('{"a":1}'))
    expect(contentHash('{"a":1}')).not.toBe(contentHash('{"a":2}'))
  })
})
