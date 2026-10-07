import type { AreaMap, AreaStamp } from '../../../types'
import { AREA_STAMP_MAX_SCALE, AREA_STAMP_MIN_SCALE } from '../../../constants'
import { drawOrder, isEditable } from './scene'

/** Geometria dos elementos em coordenadas de mundo. Sem Pixi: testável em node. */

export interface Point { x: number; y: number }
export interface Size { w: number; h: number }
/** Tamanho padrão (escala 1) de um asset do catálogo. */
export type SizeOf = (asset: string) => Size

const RAD = Math.PI / 180

export function rotate(p: Point, degrees: number): Point {
  const a = degrees * RAD
  const cos = Math.cos(a)
  const sin = Math.sin(a)
  return { x: p.x * cos - p.y * sin, y: p.x * sin + p.y * cos }
}

/** Ponto do mundo no espaço do stamp (origem no centro, sem rotação; a escala continua aplicada). */
export function toStampSpace(stamp: AreaStamp, p: Point): Point {
  return rotate({ x: p.x - stamp.x, y: p.y - stamp.y }, -stamp.rotation)
}

export function halfExtents(stamp: AreaStamp, size: Size): Point {
  return { x: (size.w * stamp.scale) / 2, y: (size.h * stamp.scale) / 2 }
}

export function stampContains(stamp: AreaStamp, size: Size, p: Point): boolean {
  const local = toStampSpace(stamp, p)
  const half = halfExtents(stamp, size)
  return Math.abs(local.x) <= half.x && Math.abs(local.y) <= half.y
}

/** Cantos na ordem topo-esquerdo, topo-direito, baixo-direito, baixo-esquerdo. */
export function stampCorners(stamp: AreaStamp, size: Size): Point[] {
  const { x: hx, y: hy } = halfExtents(stamp, size)
  return [
    { x: -hx, y: -hy }, { x: hx, y: -hy }, { x: hx, y: hy }, { x: -hx, y: hy },
  ].map(c => {
    const r = rotate(c, stamp.rotation)
    return { x: r.x + stamp.x, y: r.y + stamp.y }
  })
}

/** Elemento editável mais acima sob o ponto, ou `null`. */
export function hitTest(map: AreaMap, p: Point, sizeOf: SizeOf): string | null {
  const ordered = drawOrder(map)
  for (let i = ordered.length - 1; i >= 0; i--) {
    const el = ordered[i]
    if (!isEditable(map, el)) continue
    if (el.kind === 'stamp' && stampContains(el, sizeOf(el.asset), p)) return el.id
  }
  return null
}

export function normalizeDegrees(deg: number): number {
  const d = deg % 360
  return d < 0 ? d + 360 : d
}

/**
 * Rotação de um stamp cuja alça fica acima do centro: apontar para cima é 0°.
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

/**
 * Escala uniforme ao arrastar um canto: a razão entre a distância do ponteiro ao
 * centro e a do canto ao centro na escala 1.
 */
export function scaleToward(stamp: AreaStamp, size: Size, pointer: Point): number {
  const diagonal = Math.hypot(size.w / 2, size.h / 2)
  if (diagonal === 0) return stamp.scale
  const dist = Math.hypot(pointer.x - stamp.x, pointer.y - stamp.y)
  return Math.round(clampScale(dist / diagonal) * 100) / 100
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
export function rotateHandle(stamp: AreaStamp, size: Size, zoom: number): Point {
  const half = halfExtents(stamp, size)
  const r = rotate({ x: 0, y: -half.y - GIZMO_ROTATE_OFFSET_PX / zoom }, stamp.rotation)
  return { x: stamp.x + r.x, y: stamp.y + r.y }
}

/** Qual alça está sob o ponteiro: girar, escalar (qualquer canto) ou nenhuma. */
export function gizmoHit(stamp: AreaStamp, size: Size, zoom: number, p: Point): 'rotate' | 'scale' | null {
  const reach = GIZMO_HANDLE_PX / zoom
  const near = (q: Point) => Math.hypot(q.x - p.x, q.y - p.y) <= reach
  if (near(rotateHandle(stamp, size, zoom))) return 'rotate'
  if (stampCorners(stamp, size).some(near)) return 'scale'
  return null
}
