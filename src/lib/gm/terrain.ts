import type { GridMap } from '../../types'
import { GRID_CELL_METERS, MAP_MAX_SIZE, MAP_MIN_SIZE, TERRAINS, TERRAIN_VOID } from '../../constants'

export type TerrainCode = typeof TERRAINS[number]['code']
export type TerrainId = typeof TERRAINS[number]['id']

const BY_CODE = new Map<string, typeof TERRAINS[number]>(TERRAINS.map(t => [t.code, t]))

export function isTerrainCode(code: string): code is TerrainCode {
  return BY_CODE.has(code)
}

export function terrainOf(code: string): typeof TERRAINS[number] {
  return BY_CODE.get(code) ?? TERRAINS[0]
}

export interface Cell {
  x: number
  y: number
}

export function clampMapSize(n: number): number {
  return Math.min(MAP_MAX_SIZE, Math.max(MAP_MIN_SIZE, Math.floor(n) || MAP_MIN_SIZE))
}

export function blankCells(width: number, height: number, code: string = TERRAIN_VOID): string {
  return code.repeat(width * height)
}

export function inBounds(map: Pick<GridMap, 'width' | 'height'>, { x, y }: Cell): boolean {
  return x >= 0 && y >= 0 && x < map.width && y < map.height
}

export function cellAt(map: Pick<GridMap, 'width' | 'cells'>, { x, y }: Cell): string {
  return map.cells[y * map.width + x] ?? TERRAIN_VOID
}

/** Troca as células indicadas. Devolve a mesma string se nada mudou (o undo não empilha à toa). */
export function paintCells(map: Pick<GridMap, 'width' | 'height' | 'cells'>, cells: Cell[], code: string): string {
  const chars = map.cells.split('')
  let changed = false
  for (const c of cells) {
    if (!inBounds(map, c)) continue
    const i = c.y * map.width + c.x
    if (chars[i] !== code) {
      chars[i] = code
      changed = true
    }
  }
  return changed ? chars.join('') : map.cells
}

/** Retângulo entre dois cantos, em qualquer ordem. */
export function rectCells(a: Cell, b: Cell): Cell[] {
  const cells: Cell[] = []
  for (let y = Math.min(a.y, b.y); y <= Math.max(a.y, b.y); y++) {
    for (let x = Math.min(a.x, b.x); x <= Math.max(a.x, b.x); x++) cells.push({ x, y })
  }
  return cells
}

/** Células numa linha reta entre dois pontos (Bresenham) — o pincel não deixa buracos ao arrastar rápido. */
export function lineCells(a: Cell, b: Cell): Cell[] {
  const cells: Cell[] = []
  let { x, y } = a
  const dx = Math.abs(b.x - a.x)
  const dy = -Math.abs(b.y - a.y)
  const sx = a.x < b.x ? 1 : -1
  const sy = a.y < b.y ? 1 : -1
  let err = dx + dy
  for (;;) {
    cells.push({ x, y })
    if (x === b.x && y === b.y) return cells
    const e2 = 2 * err
    if (e2 >= dy) { err += dy; x += sx }
    if (e2 <= dx) { err += dx; y += sy }
  }
}

/** Balde: troca a região contígua (4 vizinhos) do mesmo terreno da célula de origem. */
export function floodFill(map: Pick<GridMap, 'width' | 'height' | 'cells'>, start: Cell, code: string): string {
  if (!inBounds(map, start)) return map.cells
  const target = cellAt(map, start)
  if (target === code) return map.cells

  const chars = map.cells.split('')
  const stack = [start.y * map.width + start.x]
  while (stack.length > 0) {
    const i = stack.pop()!
    if (chars[i] !== target) continue
    chars[i] = code
    const x = i % map.width
    const y = Math.floor(i / map.width)
    if (x > 0) stack.push(i - 1)
    if (x < map.width - 1) stack.push(i + 1)
    if (y > 0) stack.push(i - map.width)
    if (y < map.height - 1) stack.push(i + map.width)
  }
  return chars.join('')
}

/** Novo tamanho mantendo o canto superior esquerdo; o que entra de novo é vazio. */
export function resizeCells(map: Pick<GridMap, 'width' | 'height' | 'cells'>, width: number, height: number): string {
  let out = ''
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      out += x < map.width && y < map.height ? map.cells[y * map.width + x] : TERRAIN_VOID
    }
  }
  return out
}

/** Casas entre duas células na grade de 2024: diagonal conta 1 (Chebyshev). */
export function gridDistance(a: Cell, b: Cell): number {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y))
}

export function distanceMeters(a: Cell, b: Cell): number {
  return gridDistance(a, b) * GRID_CELL_METERS
}
