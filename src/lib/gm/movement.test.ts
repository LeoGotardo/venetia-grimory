import { describe, it, expect } from 'vitest'
import { checkMove, combatantAt, movementCostMeters, occupancyFor, occupiedCells, reachableCells, remainingMovement, speedSquares } from './movement'
import { combatantFromStatBlock } from './encounter'
import { createBlankStatBlock } from './statblock'
import type { Combatant } from '../../types'

const grid = (rows: string[]) => ({ width: rows[0].length, height: rows.length, cells: rows.join('') })

describe('movimento na grade', () => {
  it('deslocamento em casas e o que resta no turno', () => {
    expect(speedSquares(9)).toBe(6)
    expect(speedSquares(10)).toBe(6)
    const walker = { speed_m: 9, fly_m: null, swim_m: null, move_mode: 'walk' as const }
    expect(remainingMovement({ ...walker, dash: false, movement_used_m: 4.5 })).toBe(4.5)
    expect(remainingMovement({ ...walker, dash: true, movement_used_m: 4.5 })).toBe(13.5)
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

  it('terrenos novos: obstáculos, água funda e quem voa ou nada', () => {
    const forest = grid(['.t.', '.k.', '.W.'])
    // Árvore e rocha barram quem anda; quem voa passa por cima.
    expect(movementCostMeters(grid(['.t.']), { x: 0, y: 0 }, { x: 2, y: 0 })).toBeNull()
    expect(movementCostMeters(grid(['.t.']), { x: 0, y: 0 }, { x: 2, y: 0 }, { mode: 'fly' })).toBe(3)
    expect(movementCostMeters(grid(['.o.']), { x: 0, y: 0 }, { x: 2, y: 0 }, { mode: 'fly' })).toBeNull()
    // Água funda custa o dobro a pé e o normal nadando; a ponte é chão.
    expect(movementCostMeters(grid(['.W']), { x: 0, y: 0 }, { x: 1, y: 0 })).toBe(3)
    expect(movementCostMeters(grid(['.W']), { x: 0, y: 0 }, { x: 1, y: 0 }, { mode: 'swim' })).toBe(1.5)
    expect(movementCostMeters(grid(['.b']), { x: 0, y: 0 }, { x: 1, y: 0 })).toBe(1.5)
    expect(movementCostMeters(forest, { x: 0, y: 0 }, { x: 0, y: 2 })).toBe(3)
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

describe('modos de movimento', () => {
  const pond = grid(['.ww.', '.ww.', '.pp.', '.##.'])

  it('trocar de modo desconta o que já foi andado do novo deslocamento', () => {
    const c = { speed_m: 9, fly_m: 18, swim_m: null, move_mode: 'fly' as const, dash: false, movement_used_m: 6 }
    expect(remainingMovement(c)).toBe(12)
    expect(remainingMovement({ ...c, move_mode: 'swim' })).toBe(0)
  })

  it('andando a água custa 2; nadando, 1; voando, fosso e água custam 1 mas parede bloqueia', () => {
    expect(movementCostMeters(pond, { x: 0, y: 0 }, { x: 3, y: 0 })).toBe(7.5)
    expect(movementCostMeters(pond, { x: 0, y: 0 }, { x: 3, y: 0 }, { mode: 'swim' })).toBe(4.5)
    expect(movementCostMeters(pond, { x: 1, y: 1 }, { x: 1, y: 2 })).toBeNull()
    expect(movementCostMeters(pond, { x: 1, y: 1 }, { x: 1, y: 2 }, { mode: 'fly' })).toBe(1.5)
    expect(movementCostMeters(pond, { x: 1, y: 2 }, { x: 1, y: 3 }, { mode: 'fly' })).toBeNull()
  })
})

describe('criaturas no caminho (2024)', () => {
  function at(name: string, x: number, extra: Partial<Combatant> = {}): Combatant {
    return { ...combatantFromStatBlock('monster', null, createBlankStatBlock(name), name), id: name, position: { x, y: 0 }, ...extra }
  }
  const corridor = grid(['.....'])

  it('inimigo bloqueia; aliado passa como terreno difícil', () => {
    const hero = at('hero', 0, { side: 'party' })
    const orc = at('orc', 2, { side: 'enemy' })
    const friend = at('friend', 2, { side: 'party' })
    const blocked = occupancyFor(hero, [hero, orc], corridor.width)
    expect(movementCostMeters(corridor, { x: 0, y: 0 }, { x: 4, y: 0 }, { occupancy: blocked })).toBeNull()
    const ally = occupancyFor(hero, [hero, friend], corridor.width)
    expect(movementCostMeters(corridor, { x: 0, y: 0 }, { x: 4, y: 0 }, { occupancy: ally })).toBe(7.5)
  })

  it('inimigo Incapacitado, Miúdo ou com 2+ tamanhos de diferença dá passagem; derrotado não ocupa', () => {
    const hero = at('hero', 0, { side: 'party' })
    const cases: Array<Partial<Combatant>> = [
      { conditions: ['Inconsciente'] },
      { size: 'tiny' },
      { size: 'huge' },
    ]
    for (const extra of cases) {
      const occ = occupancyFor(hero, [hero, at('foe', 2, { side: 'enemy', ...extra })], corridor.width)
      expect(occ.get(2)).toBe('pass')
    }
    expect(occupancyFor(hero, [hero, at('foe', 2, { defeated: true })], corridor.width).size).toBe(0)
  })
})

describe('respeitar deslocamento (modo estrito)', () => {
  const mk = (id: string, x: number, y: number, over: Partial<Combatant> = {}): Combatant => ({
    ...combatantFromStatBlock('monster', null, createBlankStatBlock(id), id),
    id, position: { x, y }, speed_m: 9, ...over,
  })
  // Parede de alto a baixo com uma passagem embaixo.
  const m = grid([
    '..#.....',
    '..#.....',
    '..#.....',
    '........',
  ])
  const strict = { strict: true, turnOwner: true }

  it('livre: aceita qualquer destino desocupado e devolve o custo quando há caminho', () => {
    const hero = mk('h', 0, 0)
    expect(checkMove(m, hero, { x: 7, y: 0 }, [hero], { strict: false, turnOwner: true })).toEqual({ ok: true, cost: 13.5 })
    expect(checkMove(grid(['.#.']), mk('h', 0, 0), { x: 2, y: 0 }, [], { strict: false, turnOwner: true })).toEqual({ ok: true, cost: null })
  })

  it('estrito: quem tem a vez para dentro do que resta, contornando a parede', () => {
    const hero = mk('h', 0, 0)
    // Até a passagem (2,3): 4 casas = 6 m, dentro dos 9 m.
    expect(checkMove(m, hero, { x: 2, y: 3 }, [hero], strict)).toEqual({ ok: true, cost: 6 })
    // Do outro lado da parede, (3,0): 8 casas = 12 m (sem cortar quina) — longe demais…
    expect(checkMove(m, hero, { x: 3, y: 0 }, [hero], strict)).toEqual({ ok: false, reason: 'tooFar' })
    // …a não ser com Disparada (18 m).
    expect(checkMove(m, mk('h', 0, 0, { dash: true }), { x: 3, y: 0 }, [hero], strict)).toEqual({ ok: true, cost: 12 })
    // O que já andou conta.
    expect(checkMove(m, mk('h', 0, 0, { movement_used_m: 4.5 }), { x: 2, y: 3 }, [hero], strict)).toEqual({ ok: false, reason: 'tooFar' })
  })

  it('estrito: ninguém atravessa parede fechada, mas fora do turno não há limite de distância', () => {
    const closed = grid(['..#.....', '..#.....'])
    const ogre = mk('o', 0, 0)
    expect(checkMove(closed, ogre, { x: 5, y: 0 }, [ogre], { strict: true, turnOwner: false })).toEqual({ ok: false, reason: 'noPath' })
    expect(checkMove(m, ogre, { x: 7, y: 0 }, [ogre], { strict: true, turnOwner: false })).toMatchObject({ ok: true })
    // Voando, a parede baixa (árvore) não barra.
    expect(checkMove(grid(['.t.']), mk('b', 0, 0, { move_mode: 'fly', fly_m: 9 }), { x: 2, y: 0 }, [], strict)).toMatchObject({ ok: true })
  })

  it('casa ocupada é recusada nos dois modos', () => {
    const hero = mk('h', 0, 0)
    const wolf = mk('w', 1, 0)
    expect(checkMove(m, hero, { x: 1, y: 0 }, [hero, wolf], { strict: false, turnOwner: true })).toEqual({ ok: false, reason: 'occupied' })
    expect(checkMove(m, hero, { x: 1, y: 0 }, [hero, wolf], strict)).toEqual({ ok: false, reason: 'occupied' })
  })
})
