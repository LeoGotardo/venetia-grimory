import type { AreaGrid } from '../../../types'
import type { Point } from './geometry'

/**
 * Grade do mapa de área: só alinhamento, sem regra de jogo. Hexágonos de topo
 * pontudo; `size` é a largura do hexágono (distância entre centros na linha),
 * e as linhas ímpares deslocam meia largura.
 */

/** Acima disso a grade hexagonal não é desenhada (zoom muito afastado num mapa enorme). */
export const MAX_GRID_CELLS = 40000

export const hexRadius = (size: number) => size / Math.sqrt(3)
export const hexRowHeight = (size: number) => (size * Math.sqrt(3)) / 2

function nearestHex(p: Point, size: number): Point {
  const rowH = hexRowHeight(size)
  const row = Math.round(p.y / rowH)
  let best: Point = { x: 0, y: 0 }
  let bestDist = Infinity
  for (const r of [row - 1, row, row + 1]) {
    const offset = (((r % 2) + 2) % 2) * (size / 2)
    const cx = Math.round((p.x - offset) / size) * size + offset
    const cy = r * rowH
    const d = Math.hypot(p.x - cx, p.y - cy)
    if (d < bestDist) {
      bestDist = d
      best = { x: cx, y: cy }
    }
  }
  return best
}

/** Centro da casa (quadrado) ou do hexágono mais próximo; grade desligada devolve o ponto. */
export function snapToGrid(p: Point, grid: AreaGrid): Point {
  if (grid.kind === 'square') {
    const s = grid.size
    return { x: (Math.floor(p.x / s) + 0.5) * s, y: (Math.floor(p.y / s) + 0.5) * s }
  }
  if (grid.kind === 'hex') return nearestHex(p, grid.size)
  return p
}

/** Centros dos hexágonos que cobrem o retângulo do mapa (vazio se passar de `MAX_GRID_CELLS`). */
export function hexCenters(width: number, height: number, size: number): Point[] {
  const rowH = hexRowHeight(size)
  const rows = Math.ceil(height / rowH) + 1
  const cols = Math.ceil(width / size) + 1
  if (rows * cols > MAX_GRID_CELLS) return []
  const out: Point[] = []
  for (let r = 0; r <= rows; r++) {
    const offset = (r % 2) * (size / 2)
    for (let c = 0; c <= cols; c++) out.push({ x: c * size + offset, y: r * rowH })
  }
  return out
}

/** Vértices de um hexágono de topo pontudo, a partir do de cima, sentido horário. */
export function hexCorners(center: Point, size: number): number[] {
  const r = hexRadius(size)
  const out: number[] = []
  for (let i = 0; i < 6; i++) {
    const a = ((-90 + i * 60) * Math.PI) / 180
    out.push(center.x + r * Math.cos(a), center.y + r * Math.sin(a))
  }
  return out
}
