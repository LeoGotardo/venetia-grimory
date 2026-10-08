import { describe, it, expect } from 'vitest'
import pt from '../../i18n/pt'
import en from '../../i18n/en'
import { STAMPS, STAMP_CATEGORIES, stampSize } from './stamps'
import { ICONS, ICON_AUTHORS, ICON_CATEGORIES, ICONS_LICENSE } from './icons'
import { AREA_TEXTURE_IDS, PAINTED_TEXTURE_IDS, areaTextureSwatch, paintedTextureUrl } from '../../components/gm/area/areaTextures'
import { PAINTED_TEXTURE_FILLS } from './paintedTextures.generated'
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
        ...ICONS.filter(i => !(c.icons as Names)[i.id]).map(i => `icons.${i.id}`),
        ...ICON_CATEGORIES.filter(k => !(c.iconCategories as Names)[k]).map(k => `iconCategories.${k}`),
      ]
      expect(missing, lang).toEqual([])
    }
  })
})

describe('ícones do game-icons.net', () => {
  it('ids únicos, autor com nome de exibição e path SVG', () => {
    const ids = ICONS.map(i => i.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const i of ICONS) {
      expect(ICON_AUTHORS[i.author], i.id).toBeTruthy()
      // Só comandos absolutos, sem arco nem S/T: o parser do Pixi desenha errado esses.
      expect(i.d, i.id).toMatch(/^M[MLHVCQZ\d\s.\-eE]+$/)
      expect(ICON_CATEGORIES).toContain(i.category)
    }
  })

  it('a atribuição CC BY cita todos os autores usados', () => {
    expect(ICONS_LICENSE.name).toBe('CC BY 3.0')
    const used = new Set(ICONS.map(i => ICON_AUTHORS[i.author]))
    for (const name of used) expect(ICONS_LICENSE.authors).toContain(name)
  })
})

describe('texturas pintadas', () => {
  it('cada imagem é de um material conhecido, com miniatura e cor média', () => {
    expect(PAINTED_TEXTURE_IDS.length).toBeGreaterThan(0)
    for (const id of PAINTED_TEXTURE_IDS) {
      expect(AREA_TEXTURE_IDS, id).toContain(id)
      expect(paintedTextureUrl(id), id).toMatch(/\.webp/)
      expect(areaTextureSwatch(id), id).toMatch(/\.thumb\.webp/)
      expect(PAINTED_TEXTURE_FILLS[id], id).toMatch(/^#[0-9A-F]{6}$/i)
    }
    // O manifesto de cores e as imagens andam juntos (o script gera os dois).
    expect(Object.keys(PAINTED_TEXTURE_FILLS).sort()).toEqual([...PAINTED_TEXTURE_IDS].sort())
  })
})
