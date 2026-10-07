import type { AreaElement, AreaIcon, AreaLabel, AreaMap, AreaStamp } from '../../../types'
import {
  AREA_ICON_MAX_SIZE, AREA_ICON_MIN_SIZE, AREA_LABEL_MAX_SIZE, AREA_LABEL_MIN_SIZE, AREA_STAMP_MAX_SCALE,
  AREA_STAMP_MIN_SCALE,
} from '../../../constants'
import { drawOrder, isEditable } from './scene'
import { boundsOf, distanceToLine, lineTouchesBox, pointInPolygon, type Box } from './shapes'

/** Geometria dos elementos em coordenadas de mundo. Sem Pixi: testável em node. */

export interface Point { x: number; y: number }
export interface Size { w: number; h: number }
/** Tamanho padrão (escala 1) de um asset do catálogo. */
export type SizeOf = (asset: string) => Size

/** Caixa orientada (centro, giro e meias-medidas) — o que stamps e textos têm em comum. */
export interface OBox {
  x: number
  y: number
  rotation: number
  hw: number
  hh: number
}

const RAD = Math.PI / 180

export function rotate(p: Point, degrees: number): Point {
  const a = degrees * RAD
  const cos = Math.cos(a)
  const sin = Math.sin(a)
  return { x: p.x * cos - p.y * sin, y: p.x * sin + p.y * cos }
}

export function stampBox(stamp: AreaStamp, size: Size): OBox {
  return { x: stamp.x, y: stamp.y, rotation: stamp.rotation, hw: (size.w * stamp.scale) / 2, hh: (size.h * stamp.scale) / 2 }
}

/** Largura média de um caractere, em alturas de fonte, por estilo (Cinzel espaçada é larga). */
const LABEL_CHAR_WIDTH = { region: 0.95, city: 0.68, note: 0.55 } as const

/**
 * Medida aproximada do texto, sem canvas: basta para tocar e para a caixa da
 * seleção. O Pixi mede de verdade ao desenhar.
 */
export function labelBox(label: AreaLabel): OBox {
  const chars = Math.max(1, [...label.text].length)
  return {
    x: label.x,
    y: label.y,
    rotation: label.rotation,
    hw: (chars * label.size * LABEL_CHAR_WIDTH[label.style]) / 2,
    hh: (label.size * 1.3) / 2,
  }
}

export function iconBox(icon: AreaIcon): OBox {
  return { x: icon.x, y: icon.y, rotation: 0, hw: icon.size / 2, hh: icon.size / 2 }
}

/** Caixa de quem escala pelas alças (stamp, texto, ícone); `null` para linhas e regiões. */
export function elementBox(el: AreaElement, sizeOf: SizeOf): OBox | null {
  if (el.kind === 'stamp') return stampBox(el, sizeOf(el.asset))
  if (el.kind === 'label') return labelBox(el)
  if (el.kind === 'icon') return iconBox(el)
  return null
}

/** Ícones ficam sempre de pé: só stamps e textos têm alça de rotação. */
export function canRotate(el: AreaElement): boolean {
  return el.kind === 'stamp' || el.kind === 'label'
}

export function boxContains(box: OBox, p: Point): boolean {
  const local = rotate({ x: p.x - box.x, y: p.y - box.y }, -box.rotation)
  return Math.abs(local.x) <= box.hw && Math.abs(local.y) <= box.hh
}

/** Cantos na ordem topo-esquerdo, topo-direito, baixo-direito, baixo-esquerdo. */
export function boxCorners(box: OBox): Point[] {
  return [
    { x: -box.hw, y: -box.hh }, { x: box.hw, y: -box.hh }, { x: box.hw, y: box.hh }, { x: -box.hw, y: box.hh },
  ].map(c => {
    const r = rotate(c, box.rotation)
    return { x: r.x + box.x, y: r.y + box.y }
  })
}

/** Caixa alinhada aos eixos que envolve o elemento (seleção de linhas e regiões). */
export function elementBounds(el: AreaElement, sizeOf: SizeOf): Box {
  switch (el.kind) {
    case 'stamp':
    case 'label':
    case 'icon': {
      const c = boxCorners(elementBox(el, sizeOf)!)
      return boundsOf(c.flatMap(p => [p.x, p.y]))
    }
    case 'path':
      return boundsOf(el.points, el.width / 2)
    case 'paint':
      return boundsOf(el.points, el.size / 2)
    case 'region':
      return boundsOf(el.points)
  }
}

/** Folga do toque em linhas finas, em px de tela. */
const LINE_TOUCH_PX = 8

function hits(el: AreaElement, p: Point, sizeOf: SizeOf, zoom: number): boolean {
  switch (el.kind) {
    case 'stamp':
    case 'label':
    case 'icon':
      return boxContains(elementBox(el, sizeOf)!, p)
    case 'path':
      return distanceToLine(el.points, p) <= el.width / 2 + LINE_TOUCH_PX / zoom
    case 'region':
      return pointInPolygon(el.points, p)
    case 'paint':
      // Pinceladas formam o chão: tocar nelas não seleciona (a borracha e o desfazer cuidam delas).
      return false
  }
}

/** Elemento editável mais acima sob o ponto, ou `null`. */
export function hitTest(map: AreaMap, p: Point, sizeOf: SizeOf, zoom = 1): string | null {
  const ordered = drawOrder(map)
  for (let i = ordered.length - 1; i >= 0; i--) {
    const el = ordered[i]
    if (isEditable(map, el) && hits(el, p, sizeOf, zoom)) return el.id
  }
  return null
}

export function normalizeDegrees(deg: number): number {
  const d = deg % 360
  return d < 0 ? d + 360 : d
}

/**
 * Rotação de quem tem a alça acima do centro: apontar para cima é 0°.
 * `snap` arredonda para múltiplos (ex.: 15° com Shift).
 */
export function rotationToward(center: Point, pointer: Point, snap = 0): number {
  const deg = Math.atan2(pointer.y - center.y, pointer.x - center.x) / RAD + 90
  const snapped = snap > 0 ? Math.round(deg / snap) * snap : deg
  return Math.round(normalizeDegrees(snapped) * 10) / 10
}

export function clampScale(scale: number): number {
  if (!Number.isFinite(scale)) return 1
  return Math.min(AREA_STAMP_MAX_SCALE, Math.max(AREA_STAMP_MIN_SCALE, scale))
}

export function clampLabelSize(size: number): number {
  if (!Number.isFinite(size)) return AREA_LABEL_MIN_SIZE
  return Math.min(AREA_LABEL_MAX_SIZE, Math.max(AREA_LABEL_MIN_SIZE, size))
}

/**
 * Escala uniforme ao arrastar um canto: a razão entre a distância do ponteiro
 * ao centro e a meia-diagonal da caixa. Stamp muda `scale`; texto muda `size`.
 */
export function resizeToward(el: AreaStamp | AreaLabel | AreaIcon, sizeOf: SizeOf, pointer: Point): { scale?: number; size?: number } {
  const dist = Math.hypot(pointer.x - el.x, pointer.y - el.y)
  if (el.kind === 'icon') {
    const size = (dist / Math.SQRT2) * 2
    return { size: Math.round(Math.min(AREA_ICON_MAX_SIZE, Math.max(AREA_ICON_MIN_SIZE, size))) }
  }
  if (el.kind === 'stamp') {
    const { w, h } = sizeOf(el.asset)
    const diagonal = Math.hypot(w / 2, h / 2)
    return diagonal === 0 ? {} : { scale: Math.round(clampScale(dist / diagonal) * 100) / 100 }
  }
  const box = labelBox(el)
  const diagonal = Math.hypot(box.hw, box.hh)
  return diagonal === 0 ? {} : { size: Math.round(clampLabelSize((el.size * dist) / diagonal)) }
}

/** Arredonda a 1 casa decimal: o JSON fica menor e nada visível muda. */
export function quantize(n: number): number {
  return Math.round(n * 10) / 10
}

/** Alças da seleção, em pixels de tela: viram unidades de mundo dividindo pelo zoom. */
export const GIZMO_ROTATE_OFFSET_PX = 30
/** Raio de toque das alças — folgado para o dedo. */
export const GIZMO_HANDLE_PX = 14

/** Alça de rotação: acima do meio da borda de cima, acompanhando o giro. */
export function rotateHandle(box: OBox, zoom: number): Point {
  const r = rotate({ x: 0, y: -box.hh - GIZMO_ROTATE_OFFSET_PX / zoom }, box.rotation)
  return { x: box.x + r.x, y: box.y + r.y }
}

/** Qual alça está sob o ponteiro: girar (se `rotatable`), escalar (qualquer canto) ou nenhuma. */
export function gizmoHit(box: OBox, zoom: number, p: Point, rotatable = true): 'rotate' | 'scale' | null {
  const reach = GIZMO_HANDLE_PX / zoom
  const near = (q: Point) => Math.hypot(q.x - p.x, q.y - p.y) <= reach
  if (rotatable && near(rotateHandle(box, zoom))) return 'rotate'
  if (boxCorners(box).some(near)) return 'scale'
  return null
}

/**
 * Elementos editáveis que encostam no retângulo da seleção em caixa (pinceladas
 * ficam de fora, como no toque). Caminho e região contam pela linha, não pelo
 * retângulo que os envolve — uma estrada diagonal longa não entra só porque a
 * caixa caiu no meio do "quadrado" dela. Na ordem do array.
 */
export function elementsInRect(map: AreaMap, rect: Box, sizeOf: SizeOf): string[] {
  const box: Box = {
    minX: Math.min(rect.minX, rect.maxX), maxX: Math.max(rect.minX, rect.maxX),
    minY: Math.min(rect.minY, rect.maxY), maxY: Math.max(rect.minY, rect.maxY),
  }
  return map.elements
    .filter(el => el.kind !== 'paint' && isEditable(map, el))
    .filter(el => {
      if (el.kind === 'path') return lineTouchesBox(el.points, box, false)
      if (el.kind === 'region') return lineTouchesBox(el.points, box, true)
      const b = elementBounds(el, sizeOf)
      return b.minX <= box.maxX && b.maxX >= box.minX && b.minY <= box.maxY && b.maxY >= box.minY
    })
    .map(el => el.id)
}

/** Raio de toque dos pontos editáveis de caminhos e regiões, em px de tela. */
export const VERTEX_HANDLE_PX = 12

/** Índice do ponto (vértice) de um caminho/região sob o ponteiro, ou -1. */
export function vertexHit(el: AreaElement, zoom: number, p: Point): number {
  if (el.kind !== 'path' && el.kind !== 'region') return -1
  const reach = VERTEX_HANDLE_PX / zoom
  let best = -1
  let bestDist = Infinity
  for (let i = 0; i + 1 < el.points.length; i += 2) {
    const d = Math.hypot(el.points[i] - p.x, el.points[i + 1] - p.y)
    if (d <= reach && d < bestDist) {
      bestDist = d
      best = i / 2
    }
  }
  return best
}

/** Move um vértice para `p` (quantizado). */
export function moveVertex<T extends AreaElement>(el: T, index: number, p: Point): T {
  if (el.kind !== 'path' && el.kind !== 'region') return el
  const points = [...el.points]
  points[index * 2] = quantize(p.x)
  points[index * 2 + 1] = quantize(p.y)
  return { ...el, points }
}
