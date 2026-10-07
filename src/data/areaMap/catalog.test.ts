import { describe, it, expect } from 'vitest'
import pt from '../../i18n/pt'
import en from '../../i18n/en'
import { STAMPS, STAMP_CATEGORIES, stampSize } from './stamps'
import { AREA_TEXTURE_IDS } from '../../components/gm/area/areaTextures'
import { AREA_DEFAULT_TEXTURE, AREA_LAYERS } from '../../constants'

type Names = Record<string, string>
const catalogs = { pt: pt.gm.areaMap, en: en.gm.areaMap }

/**
 * Tags que o parser SVG do Pixi 8 desenha certo; qualquer outra some em silêncio.
 * `polygon`/`polyline` ficam de fora: ele lê `points` só com inteiros.
 */
const PIXI_SVG_TAGS = new Set(['path', 'circle', 'rect', 'ellipse', 'line', 'g'])

describe('catálogo do mapa de área', () => {
  it('ids únicos e camada/categoria válidas', () => {
    const ids = STAMPS.map(s => s.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const s of STAMPS) {
      expect(AREA_LAYERS).toContain(s.layer)
      expect(STAMP_CATEGORIES).toContain(s.category)
      expect(stampSize(s.id)).toEqual({ w: s.w, h: s.h })
    }
    expect(AREA_TEXTURE_IDS).toContain(AREA_DEFAULT_TEXTURE)
  })

  it('o SVG só usa o que o Pixi entende', () => {
    for (const s of STAMPS) {
      const tags = [...s.body.matchAll(/<([a-zA-Z]+)/g)].map(m => m[1])
      const unknown = tags.filter(tag => !PIXI_SVG_TAGS.has(tag))
      expect(unknown, s.id).toEqual([])
      expect(s.body, s.id).not.toMatch(/transform=|NaN|undefined/)
      // Mais de 2 casas decimais quebra o parser de pontos do Pixi.
      expect(s.body, s.id).not.toMatch(/\d\.\d{3,}/)
    }
  })

  it('tudo tem nome em pt e en', () => {
    for (const [lang, c] of Object.entries(catalogs)) {
      const missing = [
        ...STAMPS.filter(s => !(c.stamps as Names)[s.id]).map(s => `stamps.${s.id}`),
        ...STAMP_CATEGORIES.filter(k => !(c.categories as Names)[k]).map(k => `categories.${k}`),
        ...AREA_TEXTURE_IDS.filter(k => !(c.textures as Names)[k]).map(k => `textures.${k}`),
        ...AREA_LAYERS.filter(k => !(c.layers as Names)[k]).map(k => `layers.${k}`),
      ]
      expect(missing, lang).toEqual([])
    }
  })
})
