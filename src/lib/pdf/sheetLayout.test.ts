import { describe, expect, it } from 'vitest'
import { PAGE_HEIGHT, PAGE_MARGIN, PAGE_WIDTH, buildSheetLayout, type LayoutElement, type Rect } from './sheetLayout'
import { sheetLabels } from './sheetLabels'
import { KEYS, SPELL_ROWS, attackKey, skillKey, spellKey } from './sheetKeys'
import { gameData } from '../../data/rules'

const pages = buildSheetLayout(sheetLabels())
const fieldsOf = (page: LayoutElement[]) => page.filter((el): el is Extract<LayoutElement, { kind: 'field' }> => el.kind === 'field')

const EPSILON = 0.01
const overlaps = (a: Rect, b: Rect) =>
  a.x < b.x + b.w - EPSILON && b.x < a.x + a.w - EPSILON && a.y < b.y + b.h - EPSILON && b.y < a.y + a.h - EPSILON

describe('buildSheetLayout', () => {
  it('tem duas páginas', () => {
    expect(pages).toHaveLength(2)
  })

  it('todo campo fica dentro da margem da página', () => {
    for (const page of pages) {
      for (const { key, rect } of fieldsOf(page)) {
        expect(rect.x, key).toBeGreaterThanOrEqual(PAGE_MARGIN - EPSILON)
        expect(rect.y, key).toBeGreaterThanOrEqual(PAGE_MARGIN - EPSILON)
        expect(rect.x + rect.w, key).toBeLessThanOrEqual(PAGE_WIDTH - PAGE_MARGIN + EPSILON)
        expect(rect.y + rect.h, key).toBeLessThanOrEqual(PAGE_HEIGHT - PAGE_MARGIN + EPSILON)
        expect(rect.w, key).toBeGreaterThan(0)
        expect(rect.h, key).toBeGreaterThan(0)
      }
    }
  })

  it('nenhum campo se sobrepõe a outro na mesma página', () => {
    for (const page of pages) {
      const fields = fieldsOf(page)
      const clashes = fields.flatMap((a, i) => fields.slice(i + 1).filter(b => overlaps(a.rect, b.rect)).map(b => `${a.key} × ${b.key}`))
      expect(clashes).toEqual([])
    }
  })

  it('cada chave aparece uma vez por página', () => {
    for (const page of pages) {
      const keys = fieldsOf(page).map(f => f.key)
      expect(keys.length).toBe(new Set(keys).size)
    }
  })

  it('tem lugar para todas as perícias, ataques e magias', () => {
    const keys = new Set(pages.flat().flatMap(el => (el.kind === 'field' || el.kind === 'mark' ? [el.key] : [])))
    for (const skill of gameData.skills) expect(keys.has(skillKey(skill.id, 'val')), skill.id).toBe(true)
    expect(keys.has(attackKey(5, 'name'))).toBe(true)
    expect(keys.has(spellKey(SPELL_ROWS - 1, 'name'))).toBe(true)
    for (const key of Object.values(KEYS)) expect(keys.has(key), key).toBe(true)
  })
})
