import { describe, it, expect } from 'vitest'
import type { AreaMap, AreaStamp } from '../../../types'
import {
  addElements, createAreaMap, drawOrder, duplicateElements, isEditable, moveLayer, moveToLayer,
  removeElements, reorderElement, setLayer, updateElements,
} from './scene'
import { hitTest, rotationToward, scaleToward, stampContains, stampCorners } from './geometry'
import { fitView, screenToWorld, worldToScreen, zoomAt } from './viewport'
import { normalizeAreaMap } from '../normalize'
import { AREA_LAYERS, AREA_MAP_MAX_ELEMENTS, AREA_MAP_MAX_SIZE, AREA_STAMP_MAX_SCALE } from '../../../constants'

const stamp = (id: string, over: Partial<AreaStamp> = {}): AreaStamp => ({
  kind: 'stamp', id, layer: 'vegetation', asset: 'oak', x: 100, y: 100, scale: 1, rotation: 0, flip: false, opacity: 1, ...over,
})
const SIZE = { w: 40, h: 20 }
const sizeOf = () => SIZE
const ids = (m: AreaMap) => m.elements.map(e => e.id)

function mapWith(...els: AreaStamp[]): AreaMap {
  return addElements(createAreaMap('c1', 'Vale', 1000, 800), els)
}

describe('cena do mapa de área', () => {
  it('nasce com todas as camadas, na ordem, e tamanho limitado', () => {
    const m = createAreaMap('c1', 'Vale', 99999, 10)
    expect(m.layers.map(l => l.id)).toEqual([...AREA_LAYERS])
    expect(m.width).toBe(AREA_MAP_MAX_SIZE)
    expect(m.height).toBeGreaterThan(10)
  })

  it('desenha camada por camada, mantendo a ordem do array dentro de cada uma', () => {
    const m = mapWith(stamp('a', { layer: 'structures' }), stamp('b', { layer: 'terrain' }), stamp('c', { layer: 'structures' }))
    expect(drawOrder(m).map(e => e.id)).toEqual(['b', 'a', 'c'])
    expect(drawOrder(moveLayer(m, 'terrain', 1)).map(e => e.id)).toEqual(['b', 'a', 'c'])
    const reordered = moveLayer(moveLayer(m, 'terrain', 1), 'terrain', 1)
    expect(reordered.layers.indexOf(reordered.layers.find(l => l.id === 'terrain')!)).toBe(3)
  })

  it('recusa passar do limite de elementos', () => {
    const m = createAreaMap('c1', 'x', 500, 500)
    const many = Array.from({ length: AREA_MAP_MAX_ELEMENTS + 1 }, (_, i) => stamp(`s${i}`))
    expect(addElements(m, many)).toBe(m)
  })

  it('atualiza e remove devolvendo o mesmo mapa quando nada muda', () => {
    const m = mapWith(stamp('a'), stamp('b'))
    expect(updateElements(m, ['zz'], e => ({ ...e }))).toBe(m)
    expect(removeElements(m, ['zz'])).toBe(m)
    const moved = updateElements(m, ['a'], e => ({ ...e, x: 5 }))
    expect(moved.elements[0]).toMatchObject({ id: 'a', x: 5 })
    expect(moved.elements[1]).toBe(m.elements[1])
    expect(ids(removeElements(m, ['a']))).toEqual(['b'])
  })

  it('duplica com ids novos e deslocamento', () => {
    let n = 0
    const { map, ids: copies } = duplicateElements(mapWith(stamp('a')), ['a'], 16, () => `n${++n}`)
    expect(copies).toEqual(['n1'])
    expect(map.elements[1]).toMatchObject({ id: 'n1', x: 116, y: 116, asset: 'oak' })
  })

  it('reordena só entre os da mesma camada', () => {
    const m = mapWith(stamp('a'), stamp('x', { layer: 'water' }), stamp('b'), stamp('c'))
    expect(ids(reorderElement(m, 'a', 'up'))).toEqual(['x', 'b', 'a', 'c'])
    expect(ids(reorderElement(m, 'a', 'top'))).toEqual(['x', 'b', 'c', 'a'])
    expect(ids(reorderElement(m, 'c', 'bottom'))).toEqual(['c', 'a', 'x', 'b'])
    expect(reorderElement(m, 'a', 'down')).toBe(m)
  })

  it('troca de camada indo para o topo da nova', () => {
    const m = moveToLayer(mapWith(stamp('a'), stamp('b', { layer: 'decor' })), ['a'], 'decor')
    expect(m.elements.map(e => `${e.id}:${e.layer}`)).toEqual(['b:decor', 'a:decor'])
  })

  it('camada oculta ou travada não é editável', () => {
    const m = mapWith(stamp('a'))
    expect(isEditable(m, m.elements[0])).toBe(true)
    expect(isEditable(setLayer(m, 'vegetation', { locked: true }), m.elements[0])).toBe(false)
    expect(isEditable(setLayer(m, 'vegetation', { visible: false }), m.elements[0])).toBe(false)
  })
})

describe('geometria', () => {
  it('acerta o stamp girado e escolhe o de cima', () => {
    const rotated = stamp('a', { rotation: 90 })
    // Girado 90°, o stamp 40×20 vira 20×40: (100, 118) está dentro, (118, 100) fora.
    expect(stampContains(rotated, SIZE, { x: 100, y: 118 })).toBe(true)
    expect(stampContains(rotated, SIZE, { x: 118, y: 100 })).toBe(false)
    const m = mapWith(stamp('baixo', { layer: 'structures' }), stamp('cima', { layer: 'terrain' }))
    expect(hitTest(m, { x: 100, y: 100 }, sizeOf)).toBe('baixo')
    expect(hitTest(setLayer(m, 'structures', { locked: true }), { x: 100, y: 100 }, sizeOf)).toBe('cima')
    expect(hitTest(m, { x: 500, y: 500 }, sizeOf)).toBeNull()
  })

  it('cantos seguem rotação e escala', () => {
    const [tl] = stampCorners(stamp('a', { scale: 2 }), SIZE)
    expect(tl).toEqual({ x: 60, y: 80 })
  })

  it('alça de rotação: para cima é 0°, com snap', () => {
    const c = { x: 0, y: 0 }
    expect(rotationToward(c, { x: 0, y: -10 })).toBe(0)
    expect(rotationToward(c, { x: 10, y: 0 })).toBe(90)
    expect(rotationToward(c, { x: -10, y: 0.5 }, 15)).toBe(270)
  })

  it('escala pela distância ao canto, dentro dos limites', () => {
    const s = stamp('a', { x: 0, y: 0 })
    expect(scaleToward(s, SIZE, { x: 40, y: 20 })).toBe(2)
    expect(scaleToward(s, SIZE, { x: 1e6, y: 0 })).toBe(AREA_STAMP_MAX_SCALE)
  })
})

describe('viewport', () => {
  it('converte ida e volta e dá zoom mantendo o ponto sob o ponteiro', () => {
    const v = { zoom: 2, x: 10, y: 20 }
    const p = { x: 33, y: 44 }
    expect(worldToScreen(v, screenToWorld(v, p))).toEqual(p)
    const z = zoomAt(v, p, 1.5)
    expect(z.zoom).toBe(3)
    expect(screenToWorld(z, p).x).toBeCloseTo(screenToWorld(v, p).x)
    expect(screenToWorld(z, p).y).toBeCloseTo(screenToWorld(v, p).y)
  })

  it('enquadra o mapa centrado', () => {
    const v = fitView(1000, 500, 548, 548, 24)
    expect(v.zoom).toBe(0.5)
    expect(v.x).toBe(24)
    expect(v.y).toBe(149)
  })
})

describe('normalizeAreaMap', () => {
  it('completa camadas, descarta elementos inválidos e limita números', () => {
    const m = normalizeAreaMap({
      id: 'm1',
      campaign_id: 'c1',
      width: 'x',
      layers: [{ id: 'water', visible: false, opacity: 4 }, { id: 'lixo' }, { id: 'water' }],
      elements: [
        stamp('ok', { scale: 999, rotation: -90, opacity: -1 }),
        { kind: 'stamp', id: 'sem-x', asset: 'oak', y: 1 },
        { kind: 'desconhecido', id: 'z' },
        { ...stamp('camada'), layer: 'inexistente' },
      ],
    })
    expect(m.layers[0]).toEqual({ id: 'water', visible: false, locked: false, opacity: 1 })
    expect(m.layers).toHaveLength(AREA_LAYERS.length)
    expect(m.elements.map(e => e.id)).toEqual(['ok', 'camada'])
    expect(m.elements[0]).toMatchObject({ scale: AREA_STAMP_MAX_SCALE, rotation: 270, opacity: 0 })
    expect(m.elements[1].layer).toBe('decor')
    expect(m.background.texture).toBeTruthy()
  })

  it('não altera um mapa válido', () => {
    const m = mapWith(stamp('a', { rotation: 45, scale: 1.5, flip: true }))
    expect(normalizeAreaMap(structuredClone(m))).toEqual(m)
  })
})
