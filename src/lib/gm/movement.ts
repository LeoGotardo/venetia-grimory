import type { Combatant, GridMap } from '../../types'
import { CREATURE_SIZE_SQUARES, GRID_CELL_METERS } from '../../constants'
import { inBounds, terrainOf, type Cell } from './terrain'

/** Casas inteiras que um deslocamento em metros permite (9 m → 6). */
export function speedSquares(meters: number): number {
  return Math.floor(meters / GRID_CELL_METERS + 1e-9)
}

export function sizeSquares(c: Pick<Combatant, 'size'>): number {
  return CREATURE_SIZE_SQUARES[c.size] ?? 1
}

/** Metros que ainda restam no turno: deslocamento (×2 com Disparada) menos o já andado. */
export function remainingMovement(c: Pick<Combatant, 'speed_m' | 'dash' | 'movement_used_m'>): number {
  return Math.max(0, c.speed_m * (c.dash ? 2 : 1) - c.movement_used_m)
}

function cost(map: Pick<GridMap, 'width' | 'cells'>, x: number, y: number): number | null {
  return terrainOf(map.cells[y * map.width + x]).cost
}

const STEPS = [
  [1, 0], [-1, 0], [0, 1], [0, -1],
  [1, 1], [1, -1], [-1, 1], [-1, -1],
] as const

/**
 * Custo mínimo, em casas, para chegar a cada casa a partir de `start` sem passar
 * de `budget` (Dijkstra simples — mapas de até 100×100). Terreno difícil custa
 * 2 por casa; parede, fosso e vazio bloqueiam. Diagonal custa o mesmo que reta
 * (2024), mas não corta quina de parede.
 */
export function reachableCells(
  map: Pick<GridMap, 'width' | 'height' | 'cells'>,
  start: Cell,
  budget: number,
): Map<number, number> {
  const best = new Map<number, number>()
  if (!inBounds(map, start)) return best
  const startIdx = start.y * map.width + start.x
  best.set(startIdx, 0)
  const queue: Array<[number, number]> = [[0, startIdx]]

  while (queue.length > 0) {
    // Fila pequena: achar o mínimo linearmente é mais simples que um heap e basta.
    let min = 0
    for (let i = 1; i < queue.length; i++) if (queue[i][0] < queue[min][0]) min = i
    const [spent, idx] = queue.splice(min, 1)[0]
    if (spent > (best.get(idx) ?? Infinity)) continue
    const x = idx % map.width
    const y = Math.floor(idx / map.width)

    for (const [dx, dy] of STEPS) {
      const nx = x + dx
      const ny = y + dy
      if (!inBounds(map, { x: nx, y: ny })) continue
      const step = cost(map, nx, ny)
      if (step == null) continue
      if (dx !== 0 && dy !== 0 && (cost(map, x + dx, y) == null || cost(map, x, y + dy) == null)) continue
      const total = spent + step
      if (total > budget) continue
      const nIdx = ny * map.width + nx
      if (total < (best.get(nIdx) ?? Infinity)) {
        best.set(nIdx, total)
        queue.push([total, nIdx])
      }
    }
  }
  return best
}

/** Custo em metros de `from` até `to`, ou `null` se não houver caminho. */
export function movementCostMeters(
  map: Pick<GridMap, 'width' | 'height' | 'cells'>,
  from: Cell,
  to: Cell,
): number | null {
  const reach = reachableCells(map, from, map.width * map.height * 2)
  const squares = reach.get(to.y * map.width + to.x)
  return squares == null ? null : squares * GRID_CELL_METERS
}

/** Casas que um combatente cobre no mapa (criaturas Grandes ou maiores ocupam mais de uma). */
export function occupiedCells(c: Pick<Combatant, 'position' | 'size'>): Cell[] {
  if (!c.position) return []
  const n = sizeSquares(c)
  const cells: Cell[] = []
  for (let dy = 0; dy < n; dy++) for (let dx = 0; dx < n; dx++) cells.push({ x: c.position.x + dx, y: c.position.y + dy })
  return cells
}

/** Quem está nesta casa (o primeiro da lista, se houver sobreposição). */
export function combatantAt(combatants: Combatant[], cell: Cell): Combatant | null {
  return combatants.find(c => occupiedCells(c).some(o => o.x === cell.x && o.y === cell.y)) ?? null
}
