import { describe, it, expect } from 'vitest'
import { combatantAt, movementCostMeters, occupiedCells, reachableCells, remainingMovement, speedSquares } from './movement'

const grid = (rows: string[]) => ({ width: rows[0].length, height: rows.length, cells: rows.join('') })

describe('movimento na grade', () => {
  it('deslocamento em casas e o que resta no turno', () => {
    expect(speedSquares(9)).toBe(6)
    expect(speedSquares(10)).toBe(6)
    expect(remainingMovement({ speed_m: 9, dash: false, movement_used_m: 4.5 })).toBe(4.5)
    expect(remainingMovement({ speed_m: 9, dash: true, movement_used_m: 4.5 })).toBe(13.5)
  })

  it('diagonal custa uma casa; terreno difícil custa duas', () => {
    expect(movementCostMeters(grid(['....', '....', '....', '....']), { x: 0, y: 0 }, { x: 3, y: 3 })).toBe(4.5)
    const m = grid(['.....', '.....', '..dd.', '.....'])
    expect(movementCostMeters(m, { x: 2, y: 1 }, { x: 2, y: 2 })).toBe(3)
    // A diagonal direta passaria pelo difícil (4 casas); o desvio também custa 4.
    expect(movementCostMeters(m, { x: 0, y: 0 }, { x: 3, y: 3 })).toBe(6)
  })

  it('parede bloqueia e a diagonal não corta quina', () => {
    const m = grid(['.#.', '#..', '...'])
    expect(movementCostMeters(m, { x: 0, y: 0 }, { x: 1, y: 1 })).toBeNull()
    // Uma quina só: a diagonal é proibida, mas contornar a pé custa 2 casas.
    expect(movementCostMeters(grid(['.#', '..']), { x: 0, y: 0 }, { x: 1, y: 1 })).toBe(3)
  })

  it('o alcance respeita o orçamento', () => {
    const reach = reachableCells(grid(['.....']), { x: 0, y: 0 }, 2)
    expect([...reach.keys()].sort()).toEqual([0, 1, 2])
  })

  it('criatura Grande ocupa 2×2 e é achada por qualquer casa', () => {
    const ogre = { id: 'o', position: { x: 1, y: 1 }, size: 'large' as const }
    expect(occupiedCells(ogre)).toHaveLength(4)
    expect(combatantAt([ogre as never], { x: 2, y: 2 })).toBe(ogre)
    expect(combatantAt([ogre as never], { x: 0, y: 0 })).toBeNull()
  })
})
