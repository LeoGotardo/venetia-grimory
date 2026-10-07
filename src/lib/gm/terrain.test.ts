import { describe, it, expect } from 'vitest'
import {
  blankCells, cellAt, distanceMeters, floodFill, gridDistance, lineCells, paintCells, rectCells, resizeCells, terrainOf,
} from './terrain'
import { normalizeMap } from './normalize'

const map = (rows: string[]) => ({ width: rows[0].length, height: rows.length, cells: rows.join('') })
const rows = (m: { width: number; cells: string }) => m.cells.match(new RegExp(`.{${m.width}}`, 'g'))

describe('grade', () => {
  it('pinta e devolve a mesma string quando nada muda', () => {
    const m = map(['000', '000'])
    const painted = paintCells(m, [{ x: 1, y: 0 }, { x: 9, y: 9 }], '#')
    expect(rows({ ...m, cells: painted })).toEqual(['0#0', '000'])
    expect(paintCells({ ...m, cells: painted }, [{ x: 1, y: 0 }], '#')).toBe(painted)
  })

  it('retângulo em qualquer ordem e linha sem buracos', () => {
    expect(rectCells({ x: 2, y: 1 }, { x: 1, y: 0 })).toHaveLength(4)
    expect(lineCells({ x: 0, y: 0 }, { x: 3, y: 1 })).toEqual([
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 1 }, { x: 3, y: 1 },
    ])
  })

  it('balde preenche só a região contígua, sem diagonal', () => {
    const m = map(['..#0', '.#00', '#000'])
    expect(rows({ ...m, cells: floodFill(m, { x: 3, y: 0 }, 'w') })).toEqual(['..#w', '.#ww', '#www'])
    expect(floodFill(m, { x: 0, y: 0 }, '.')).toBe(m.cells)
  })

  it('redimensiona mantendo o canto superior esquerdo', () => {
    const m = map(['ab', 'cd'].map(r => r.replace('a', '.').replace('b', '#').replace('c', 'w').replace('d', 'd')))
    expect(rows({ width: 3, cells: resizeCells(m, 3, 1) })).toEqual(['.#0'])
  })

  it('distância de 2024: diagonal conta uma casa de 1,5 m', () => {
    expect(gridDistance({ x: 0, y: 0 }, { x: 3, y: 2 })).toBe(3)
    expect(distanceMeters({ x: 0, y: 0 }, { x: 4, y: 4 })).toBe(6)
  })

  it('terreno desconhecido cai no vazio', () => {
    expect(terrainOf('?').id).toBe('void')
    expect(terrainOf('d').cost).toBe(2)
    expect(cellAt(map(['.#']), { x: 1, y: 0 })).toBe('#')
  })
})

describe('normalizeMap', () => {
  it('corrige tamanho, células inválidas e rótulos fora do mapa', () => {
    const m = normalizeMap({ width: 2, height: 999, cells: 'x', labels: [{ x: 1, y: 1, text: 'A' }, { x: 50, y: 1, text: 'B' }] })
    expect([m.width, m.height]).toEqual([5, 100])
    expect(m.cells).toBe(blankCells(5, 100))
    expect(m.labels.map(l => l.text)).toEqual(['A'])
  })
})

describe('catálogo de terrenos', () => {
  it('códigos únicos de um caractere, os antigos preservados, todo terreno com aparência e grupo', async () => {
    const { TERRAINS, TERRAIN_GROUPS } = await import('../../constants')
    const { TERRAIN_STYLE } = await import('../../components/gm/terrainStyle')
    const codes = TERRAINS.map(t => t.code)
    expect(new Set(codes).size).toBe(codes.length)
    expect(codes.every(c => c.length === 1)).toBe(true)
    // Códigos gravados nos mapas salvos: mudar um deles corrompe mapas antigos.
    const legacy = { '0': 'void', '.': 'floor', d: 'difficult', v: 'vegetation', w: 'water', s: 'stairs', '+': 'door', h: 'hazard', p: 'pit', '#': 'wall' }
    for (const [code, id] of Object.entries(legacy)) expect(TERRAINS.find(t => t.code === code)?.id).toBe(id)
    for (const t of TERRAINS) {
      expect(TERRAIN_STYLE[t.id], t.id).toBeDefined()
      if (t.id !== 'void') expect(TERRAIN_GROUPS as readonly string[]).toContain(t.group)
    }
  })
})
