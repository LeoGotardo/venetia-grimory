import { describe, expect, it } from 'vitest'
import pt from '../../i18n/pt'
import en from '../../i18n/en'
import { createAvatar } from '@dicebear/core'
import * as openPeeps from '@dicebear/open-peeps'
import { ACCESSORIES, DEFAULT_PORTRAIT, PORTRAIT_OPTIONS, PORTRAIT_PALETTES, SPECIES_POOLS } from './options'
import { defaultPortrait, normalizePortrait, randomPortrait, withAccessory } from './generate'
import { PEEPS_MARKERS, portraitSvg } from './render'
import { migrateSheet } from '../migrateSheet'
import { createInitialSheet } from '../initialSheet'

describe('retrato vindo de fora', () => {
  it('só passa id conhecido; o resto vira o padrão', () => {
    expect(normalizePortrait(null)).toBeNull()
    expect(normalizePortrait('oval')).toBeNull()
    expect(normalizePortrait([])).toBeNull()
    const hostile = normalizePortrait({
      skin: '"/><script>alert(1)</script>', hair: 'mohawk', head: 42, background: 'toString', face: '__proto__',
      accessories: ['halo', 'glasses2', 'glasses', 'nope', 42, 'halo'],
    })!
    // Um por lugar (o primeiro vence), na ordem do catálogo.
    expect(hostile).toEqual({ ...DEFAULT_PORTRAIT, hair: 'mohawk', accessories: ['glasses2', 'halo'] })
    expect(normalizePortrait({ accessories: 'halo' })!.accessories).toEqual([])
    // (o metadado de licença do DiceBear traz "rdf:Description": procurar a tag, não a palavra)
    expect(portraitSvg(hostile)).not.toMatch(/<script|alert\(/)
  })

  it('a ficha migrada normaliza o retrato; sem retrato, o JSON não muda', () => {
    const base = createInitialSheet()
    expect(migrateSheet(base).portrait).toBeUndefined()
    expect(JSON.stringify(migrateSheet(base))).toBe(JSON.stringify(migrateSheet(migrateSheet(base))))
    expect(JSON.stringify(migrateSheet(base))).not.toContain('portrait')
    const saved = { ...base, portrait: { hair: 'bun', skin: 'javascript:' } } as unknown as typeof base
    expect(migrateSheet(saved).portrait).toEqual({ ...DEFAULT_PORTRAIT, hair: 'bun' })
  })
})

describe('retrato sorteado', () => {
  it('a mesma semente dá o mesmo rosto; sementes diferentes variam', () => {
    expect(defaultPortrait('elfo', 'ficha-1')).toEqual(defaultPortrait('elfo', 'ficha-1'))
    const faces = new Set(['a', 'b', 'c', 'd', 'e', 'f'].map(seed => JSON.stringify(defaultPortrait('humano', seed))))
    expect(faces.size).toBeGreaterThan(1)
  })

  it('segue o jeito da espécie', () => {
    const many = (species: string) => Array.from({ length: 30 }, (_, i) => defaultPortrait(species, `s${i}`))
    expect(many('tiferino').every(p => p.horns !== 'none')).toBe(true)
    expect(many('orc').every(p => p.tusks !== 'none')).toBe(true)
    expect(many('elfo').every(p => p.ears === 'pointed' || p.ears === 'long')).toBe(true)
    expect(many('draconato').every(p => p.head === 'draconic')).toBe(true)
    expect(many('anao').every(p => p.beard !== 'none')).toBe(true)
    // Espécie desconhecida sorteia como humano.
    expect(SPECIES_POOLS.humano.head).toContain(randomPortrait('desconhecida', () => 0).head)
  })

  it('cabeça dracônica ignora cabelo, barba e presas', () => {
    const plain = portraitSvg({ ...DEFAULT_PORTRAIT, head: 'draconic' })
    expect(portraitSvg({ ...DEFAULT_PORTRAIT, head: 'draconic', hair: 'long', beard: 'full4', tusks: 'large' })).toBe(plain)
    // Num rosto comum, as mesmas escolhas mudam o desenho.
    expect(portraitSvg({ ...DEFAULT_PORTRAIT, hair: 'long', beard: 'full4', tusks: 'large' })).not.toBe(portraitSvg(DEFAULT_PORTRAIT))
  })
})

describe('cores e acessórios', () => {
  it('escolher um acessório troca o que estava no mesmo lugar', () => {
    expect(withAccessory(['glasses', 'earring'], 'eyepatch')).toEqual(['eyepatch', 'earring'])
    expect(withAccessory(['glasses'], 'halo')).toEqual(['glasses', 'halo'])
  })

  it('o DiceBear ainda monta os grupos que o tingimento procura', () => {
    // Se uma versão nova mudar estes grupos, cabelo e barba perdem a cor: o teste avisa antes.
    const svg = createAvatar(openPeeps, { seed: 'x', facialHairProbability: 100 }).toString()
    const at = Object.values(PEEPS_MARKERS).map(mark => svg.indexOf(mark))
    expect(at.every(i => i >= 0)).toBe(true)
    expect([...at].sort((a, b) => a - b)).toEqual(at)
  })

  it('cabelo e barba levam a cor escolhida; careca não é tingido', () => {
    const blue = PORTRAIT_PALETTES.hairColor.blue
    const red = PORTRAIT_PALETTES.beardColor.red
    expect(portraitSvg({ ...DEFAULT_PORTRAIT, hair: 'long', hairColor: 'blue' })).toContain(`fill="${blue}"`)
    expect(portraitSvg({ ...DEFAULT_PORTRAIT, hair: 'noHair1', hairColor: 'blue' })).not.toContain(`fill="${blue}"`)
    expect(portraitSvg({ ...DEFAULT_PORTRAIT, beard: 'full', beardColor: 'red' })).toContain(`fill="${red}"`)
  })

  it('cabeça dracônica deixa de fora os óculos e o brinco', () => {
    const plain = portraitSvg({ ...DEFAULT_PORTRAIT, head: 'draconic', accessories: ['circlet'] })
    expect(portraitSvg({ ...DEFAULT_PORTRAIT, head: 'draconic', accessories: ['glasses', 'earring', 'circlet'] })).toBe(plain)
  })
})

describe('rótulos do editor', () => {
  it('toda opção e toda cor têm nome nos dois idiomas', () => {
    for (const catalog of [pt, en]) {
      const labels = catalog.portrait as unknown as {
        field: Record<string, string>
        option: Record<string, Record<string, string>>
        color: Record<string, Record<string, string>>
      }
      for (const [part, ids] of Object.entries(PORTRAIT_OPTIONS)) {
        expect(labels.field[part], part).toBeTruthy()
        // Cabelo, expressão e barba escolhem-se por miniatura numerada; o resto, por nome.
        if (['hair', 'face', 'beard'].includes(part)) continue
        for (const id of ids) expect(labels.option[part]?.[id], `${part}.${id}`).toBeTruthy()
      }
      for (const [palette, colors] of Object.entries(PORTRAIT_PALETTES)) {
        expect(labels.field[palette], palette).toBeTruthy()
        // A barba usa os nomes das cores do cabelo.
        const names = palette === 'beardColor' ? 'hairColor' : palette
        for (const id of Object.keys(colors)) expect(labels.color[names]?.[id], `${palette}.${id}`).toBeTruthy()
      }
      expect(labels.field.accessories).toBeTruthy()
      for (const id of ACCESSORIES) expect(labels.option.accessories?.[id], `accessories.${id}`).toBeTruthy()
    }
  })
})
