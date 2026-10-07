import type { Point } from './geometry'

/**
 * Geometria de linhas e polígonos guardados como array plano `[x, y, x, y, …]`
 * — o formato dos traços, caminhos e regiões do mapa de área (metade do JSON de
 * um array de objetos).
 */

export function pointsOf(flat: readonly number[]): Point[] {
  const out: Point[] = []
  for (let i = 0; i + 1 < flat.length; i += 2) out.push({ x: flat[i], y: flat[i + 1] })
  return out
}

export function flatten(points: readonly Point[]): number[] {
  return points.flatMap(p => [p.x, p.y])
}

/** 1 casa decimal: o JSON fica menor e nada visível muda. */
export function quantizePoints(flat: readonly number[]): number[] {
  return flat.map(n => Math.round(n * 10) / 10)
}

function distToSegment(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len2 = dx * dx + dy * dy
  if (len2 === 0) return Math.hypot(p.x - a.x, p.y - a.y)
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2))
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy))
}

/**
 * Ramer-Douglas-Peucker: tira os pontos que se afastam menos de `tolerance` da
 * reta entre os vizinhos. Um traço de mão livre cai para uma fração dos pontos.
 */
export function simplify(flat: readonly number[], tolerance: number): number[] {
  const pts = pointsOf(flat)
  if (pts.length <= 2) return [...flat]
  const keep = new Uint8Array(pts.length)
  keep[0] = 1
  keep[pts.length - 1] = 1
  const stack: Array<[number, number]> = [[0, pts.length - 1]]
  while (stack.length) {
    const [a, b] = stack.pop()!
    let max = 0
    let idx = -1
    for (let i = a + 1; i < b; i++) {
      const d = distToSegment(pts[i], pts[a], pts[b])
      if (d > max) {
        max = d
        idx = i
      }
    }
    if (idx >= 0 && max > tolerance) {
      keep[idx] = 1
      stack.push([a, idx], [idx, b])
    }
  }
  return flatten(pts.filter((_, i) => keep[i]))
}

/**
 * Chaikin: corta os cantos `iterations` vezes — a linha simplificada volta a
 * parecer curva sem guardar os pontos extras. Mantém as pontas (linha aberta)
 * ou fecha o laço (`closed`).
 */
export function smooth(flat: readonly number[], iterations = 2, closed = false): number[] {
  let pts = pointsOf(flat)
  if (pts.length < 3) return [...flat]
  for (let it = 0; it < iterations; it++) {
    const next: Point[] = closed ? [] : [pts[0]]
    const n = pts.length
    const last = closed ? n : n - 1
    for (let i = 0; i < last; i++) {
      const a = pts[i]
      const b = pts[(i + 1) % n]
      next.push({ x: a.x * 0.75 + b.x * 0.25, y: a.y * 0.75 + b.y * 0.25 })
      next.push({ x: a.x * 0.25 + b.x * 0.75, y: a.y * 0.25 + b.y * 0.75 })
    }
    if (!closed) next.push(pts[n - 1])
    pts = next
  }
  return flatten(pts)
}

/**
 * Corta a linha em traços de `dash` com intervalos de `gap` (o Pixi não tem
 * linha tracejada). Devolve cada traço como um pedaço de linha plano.
 */
export function dashLine(flat: readonly number[], dash: number, gap: number, closed = false): number[][] {
  const pts = pointsOf(flat)
  if (closed && pts.length > 2) pts.push(pts[0])
  if (pts.length < 2 || dash <= 0) return []
  const out: number[][] = []
  let drawing = true
  let left = dash
  let current: number[] = [pts[0].x, pts[0].y]
  for (let i = 0; i + 1 < pts.length; i++) {
    let a = pts[i]
    const b = pts[i + 1]
    let seg = Math.hypot(b.x - a.x, b.y - a.y)
    while (seg > 0) {
      const step = Math.min(left, seg)
      const t = step / seg
      const p = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
      if (drawing) current.push(p.x, p.y)
      seg -= step
      left -= step
      a = p
      if (left <= 1e-9) {
        if (drawing && current.length >= 4) out.push(current)
        drawing = !drawing
        left = drawing ? dash : gap
        current = drawing ? [p.x, p.y] : []
      }
    }
  }
  if (drawing && current.length >= 4) out.push(current)
  return out
}

export function distanceToLine(flat: readonly number[], p: Point): number {
  const pts = pointsOf(flat)
  if (pts.length === 0) return Infinity
  if (pts.length === 1) return Math.hypot(p.x - pts[0].x, p.y - pts[0].y)
  let min = Infinity
  for (let i = 0; i + 1 < pts.length; i++) min = Math.min(min, distToSegment(p, pts[i], pts[i + 1]))
  return min
}

/** Par-ímpar: funciona com o laço desenhado à mão mesmo que ele se cruze. */
export function pointInPolygon(flat: readonly number[], p: Point): boolean {
  const pts = pointsOf(flat)
  let inside = false
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i]
    const b = pts[j]
    if ((a.y > p.y) !== (b.y > p.y) && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) inside = !inside
  }
  return inside
}

export interface Box { minX: number; minY: number; maxX: number; maxY: number }

export function boundsOf(flat: readonly number[], pad = 0): Box {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (let i = 0; i + 1 < flat.length; i += 2) {
    minX = Math.min(minX, flat[i])
    maxX = Math.max(maxX, flat[i])
    minY = Math.min(minY, flat[i + 1])
    maxY = Math.max(maxY, flat[i + 1])
  }
  return { minX: minX - pad, minY: minY - pad, maxX: maxX + pad, maxY: maxY + pad }
}

export function translatePoints(flat: readonly number[], dx: number, dy: number): number[] {
  return flat.map((n, i) => (i % 2 === 0 ? n + dx : n + dy))
}

function segmentsCross(a: Point, b: Point, c: Point, d: Point): boolean {
  const cross = (p: Point, q: Point, r: Point) => (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x)
  const d1 = cross(c, d, a)
  const d2 = cross(c, d, b)
  const d3 = cross(a, b, c)
  const d4 = cross(a, b, d)
  return ((d1 > 0) !== (d2 > 0)) && ((d3 > 0) !== (d4 > 0))
}

/**
 * A linha (ou o polígono, se `closed`) encosta na caixa: algum ponto dentro,
 * algum segmento cruzando uma borda ou, no polígono, a caixa inteira dentro dele.
 */
export function lineTouchesBox(flat: readonly number[], box: Box, closed: boolean): boolean {
  const pts = pointsOf(flat)
  const inside = (p: Point) => p.x >= box.minX && p.x <= box.maxX && p.y >= box.minY && p.y <= box.maxY
  if (pts.some(inside)) return true
  const corners = [
    { x: box.minX, y: box.minY }, { x: box.maxX, y: box.minY }, { x: box.maxX, y: box.maxY }, { x: box.minX, y: box.maxY },
  ]
  const edges = corners.map((c, i) => [c, corners[(i + 1) % 4]] as const)
  const n = closed ? pts.length : pts.length - 1
  for (let i = 0; i < n; i++) {
    const a = pts[i]
    const b = pts[(i + 1) % pts.length]
    if (edges.some(([c, d]) => segmentsCross(a, b, c, d))) return true
  }
  return closed && pointInPolygon(flat, corners[0])
}
