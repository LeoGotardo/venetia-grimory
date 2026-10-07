import { AREA_MAX_ZOOM, AREA_MIN_ZOOM } from '../../../constants'
import type { Point } from './geometry'

/**
 * Câmera do editor: `tela = mundo × zoom + (x, y)`. Funções puras para o pan,
 * o zoom em torno do ponteiro/pinça e o enquadramento inicial.
 */
export interface View {
  zoom: number
  x: number
  y: number
}

export function clampZoom(zoom: number): number {
  return Math.min(AREA_MAX_ZOOM, Math.max(AREA_MIN_ZOOM, zoom))
}

export function screenToWorld(view: View, p: Point): Point {
  return { x: (p.x - view.x) / view.zoom, y: (p.y - view.y) / view.zoom }
}

export function worldToScreen(view: View, p: Point): Point {
  return { x: p.x * view.zoom + view.x, y: p.y * view.zoom + view.y }
}

/** Multiplica o zoom mantendo fixo o ponto de mundo que está sob `anchor` (tela). */
export function zoomAt(view: View, anchor: Point, factor: number): View {
  const zoom = clampZoom(view.zoom * factor)
  const world = screenToWorld(view, anchor)
  return { zoom, x: anchor.x - world.x * zoom, y: anchor.y - world.y * zoom }
}

export function panBy(view: View, dx: number, dy: number): View {
  return { ...view, x: view.x + dx, y: view.y + dy }
}

/** Mapa inteiro centrado na tela, com margem. */
export function fitView(mapW: number, mapH: number, screenW: number, screenH: number, padding = 24): View {
  const availW = Math.max(1, screenW - padding * 2)
  const availH = Math.max(1, screenH - padding * 2)
  const zoom = clampZoom(Math.min(availW / mapW, availH / mapH))
  return { zoom, x: (screenW - mapW * zoom) / 2, y: (screenH - mapH * zoom) / 2 }
}
