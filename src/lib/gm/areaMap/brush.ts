import type { AreaBrushEdge } from '../../../types'
import { pointsOf } from './shapes'

/**
 * Pincel do mapa de área como no Inkarnate: o traço é uma fileira de carimbos
 * ("dabs") de uma ponta macia, não uma linha de borda dura. Na borda orgânica
 * cada carimbo gira e varia de tamanho, então a beira fica irregular sem repetir
 * padrão. Tudo determinístico pela semente do traço: o mesmo traço desenha
 * sempre igual, e a fileira de um traço mais longo começa igual à do mais curto
 * (o desenho ao vivo só acrescenta carimbos novos).
 */

export interface Dab {
  x: number
  y: number
  /** Radianos. */
  rotation: number
  /** Multiplica o tamanho do pincel. */
  scale: number
}

/** Distância entre carimbos, em frações do tamanho do pincel. */
export const DAB_SPACING: Record<AreaBrushEdge, number> = { rough: 0.08, soft: 0.1, hard: 0.06 }

/** Semente estável a partir do id do traço (FNV-1a). */
export function strokeSeed(id: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

function rng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Carimbos ao longo da linha (array plano), a cada `DAB_SPACING × size`. */
export function dabsAlong(flat: readonly number[], size: number, edge: AreaBrushEdge, seed: number): Dab[] {
  const pts = pointsOf(flat)
  if (pts.length === 0) return []
  const r = rng(seed)
  const jitter = edge === 'rough'
  const make = (x: number, y: number): Dab => {
    const rotation = jitter ? r() * Math.PI * 2 : 0
    const scale = jitter ? 0.86 + r() * 0.28 : 1
    return { x, y, rotation, scale }
  }
  const spacing = Math.max(0.5, size * DAB_SPACING[edge])
  const out: Dab[] = [make(pts[0].x, pts[0].y)]
  // Quanto falta andar até o próximo carimbo; sobra de um segmento passa para o seguinte.
  let left = spacing
  for (let i = 0; i + 1 < pts.length; i++) {
    const a = pts[i]
    const b = pts[i + 1]
    const len = Math.hypot(b.x - a.x, b.y - a.y)
    let walked = 0
    while (len - walked >= left) {
      walked += left
      const t = walked / len
      out.push(make(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t))
      left = spacing
    }
    left -= len - walked
  }
  return out
}
