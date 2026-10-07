import type { Combatant, GridMap, MoveMode } from '../../types'
import { CREATURE_SIZES, CREATURE_SIZE_SQUARES, GRID_CELL_METERS, INCAPACITATING_CONDITIONS } from '../../constants'
import { inBounds, terrainOf, type Cell } from './terrain'

/** Casas inteiras que um deslocamento em metros permite (9 m → 6). */
export function speedSquares(meters: number): number {
  return Math.floor(meters / GRID_CELL_METERS + 1e-9)
}

export function sizeSquares(c: Pick<Combatant, 'size'>): number {
  return CREATURE_SIZE_SQUARES[c.size] ?? 1
}

/** Deslocamento do modo atual; sem voo/natação, o modo não tem deslocamento (0). */
export function modeSpeed(c: Pick<Combatant, 'speed_m' | 'fly_m' | 'swim_m' | 'move_mode'>): number {
  if (c.move_mode === 'fly') return c.fly_m ?? 0
  if (c.move_mode === 'swim') return c.swim_m ?? 0
  return c.speed_m
}

/**
 * Metros que ainda restam no turno: deslocamento do modo atual (×2 com
 * Disparada) menos o já andado. Trocar de modo no meio do turno desconta o que
 * já foi andado do novo deslocamento — é a regra de 2024.
 */
export function remainingMovement(
  c: Pick<Combatant, 'speed_m' | 'fly_m' | 'swim_m' | 'move_mode' | 'dash' | 'movement_used_m'>,
): number {
  return Math.max(0, modeSpeed(c) * (c.dash ? 2 : 1) - c.movement_used_m)
}

/**
 * Custo de entrar numa casa, por modo. Voando, o chão não importa (terreno
 * difícil, água e fosso custam 1); só parede e vazio bloqueiam. Nadando, a água
 * custa 1 em vez de 2. `null` bloqueia.
 */
function terrainCost(code: string, mode: MoveMode): number | null {
  const t = terrainOf(code)
  if (mode === 'fly') return t.fly ? 1 : null
  if (mode === 'swim' && t.swim) return 1
  return t.cost
}

/** Casa ocupada por outra criatura: `pass` = atravessável como terreno difícil; `block` = não passa. */
export type Occupancy = Map<number, 'pass' | 'block'>

export interface MoveOptions {
  mode?: MoveMode
  occupancy?: Occupancy
}

const STEPS = [
  [1, 0], [-1, 0], [0, 1], [0, -1],
  [1, 1], [1, -1], [-1, 1], [-1, -1],
] as const

/**
 * Custo mínimo, em casas, para chegar a cada casa a partir de `start` sem passar
 * de `budget` (Dijkstra simples — mapas de até 100×100). Terreno difícil custa
 * 2 por casa; parede, pilar, árvore, rocha, fosso e vazio bloqueiam. Diagonal custa o mesmo que reta
 * (2024), mas não corta quina de parede.
 */
export function reachableCells(
  map: Pick<GridMap, 'width' | 'height' | 'cells'>,
  start: Cell,
  budget: number,
  options: MoveOptions = {},
): Map<number, number> {
  const mode = options.mode ?? 'walk'
  const occupancy = options.occupancy
  const cost = (x: number, y: number): number | null => {
    const idx = y * map.width + x
    const base = terrainCost(map.cells[idx], mode)
    const occupied = occupancy?.get(idx)
    if (base == null || occupied === 'block') return null
    // Espaço de outra criatura conta como terreno difícil — não acumula com o do chão.
    return occupied === 'pass' ? Math.max(base, 2) : base
  }

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
      const step = cost(nx, ny)
      if (step == null) continue
      // Diagonal não corta quina de parede (as criaturas no caminho não contam aqui).
      if (dx !== 0 && dy !== 0
        && (terrainCost(map.cells[y * map.width + x + dx], mode) == null
          || terrainCost(map.cells[(y + dy) * map.width + x], mode) == null)) continue
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
  options: MoveOptions = {},
): number | null {
  const reach = reachableCells(map, from, map.width * map.height * 2, options)
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

function sizeIndex(c: Pick<Combatant, 'size'>): number {
  return CREATURE_SIZES.indexOf(c.size)
}

/**
 * Quais casas os outros combatentes ocupam, do ponto de vista de quem se move.
 * Dá para atravessar (como terreno difícil) um aliado, uma criatura Incapacitada,
 * uma Miúda, ou uma com 2+ tamanhos de diferença; os demais bloqueiam. Derrotados
 * não ocupam espaço. Parar no espaço de outra criatura continua proibido — isso
 * é com quem solta o token.
 */
export function occupancyFor(mover: Combatant, combatants: Combatant[], mapWidth: number): Occupancy {
  const occupancy: Occupancy = new Map()
  for (const other of combatants) {
    if (other.id === mover.id || other.defeated || !other.position) continue
    const passable = other.side === mover.side
      || other.conditions.some(c => INCAPACITATING_CONDITIONS.includes(c))
      || other.size === 'tiny'
      || Math.abs(sizeIndex(other) - sizeIndex(mover)) >= 2
    for (const cell of occupiedCells(other)) {
      const idx = cell.y * mapWidth + cell.x
      if (occupancy.get(idx) !== 'block') occupancy.set(idx, passable ? 'pass' : 'block')
    }
  }
  return occupancy
}
