import { describe, it, expect } from 'vitest'
import type { Combatant, GridMap } from '../../types'
import { partyViewers, sightFrom, tableVision } from './vision'
import { combatantFromStatBlock } from './encounter'
import { createBlankStatBlock } from './statblock'

/** Mapa a partir de linhas de texto, um código de terreno por caractere. */
function grid(rows: string[], explored: string | null = null): GridMap {
  return {
    id: 'm', name: '', width: rows[0].length, height: rows.length, cells: rows.join(''), labels: [],
    explored, created_at: '', updated_at: '',
  }
}

/** Máscara de visão como linhas de texto (`#` em vista, `.` fora) — fácil de ler no teste. */
function seenRows(map: GridMap, mask: Uint8Array): string[] {
  return Array.from({ length: map.height }, (_, y) =>
    Array.from({ length: map.width }, (_, x) => (mask[y * map.width + x] ? '#' : '.')).join(''))
}

function token(name: string, x: number, y: number, extra: Partial<Combatant> = {}): Combatant {
  return { ...combatantFromStatBlock('npc', null, createBlankStatBlock(name), name), id: name, position: { x, y }, side: 'party', ...extra }
}

describe('linha de visão', () => {
  it('sala aberta: vê tudo', () => {
    const map = grid(['....', '....', '....'])
    expect(seenRows(map, sightFrom(map, [{ x: 0, y: 0 }]))).toEqual(['####', '####', '####'])
  })

  it('parede bloqueia o que está atrás, mas a parede em si é vista', () => {
    const map = grid(['..#..', '..#..', '..#..'])
    expect(seenRows(map, sightFrom(map, [{ x: 0, y: 1 }]))).toEqual(['###..', '###..', '###..'])
  })

  it('porta não bloqueia; árvore e pedra bloqueiam', () => {
    expect(seenRows(grid(['.+..']), sightFrom(grid(['.+..']), [{ x: 0, y: 0 }]))).toEqual(['####'])
    expect(seenRows(grid(['.t..']), sightFrom(grid(['.t..']), [{ x: 0, y: 0 }]))).toEqual(['##..'])
    expect(seenRows(grid(['.k..']), sightFrom(grid(['.k..']), [{ x: 0, y: 0 }]))).toEqual(['##..'])
  })

  it('não espia pela quina entre duas paredes', () => {
    const closed = grid(['.#', '#.'])
    expect(sightFrom(closed, [{ x: 0, y: 0 }])[3]).toBe(0)
    const open = grid(['..', '#.'])
    expect(sightFrom(open, [{ x: 0, y: 0 }])[3]).toBe(1)
  })

  it('vários tokens somam o que cada um vê', () => {
    const map = grid(['..#..'])
    expect(seenRows(map, sightFrom(map, [{ x: 0, y: 0 }, { x: 4, y: 0 }]))).toEqual(['#####'])
  })
})

describe('quem enxerga pelo grupo', () => {
  it('aliados no mapa, menos derrotado, escondido, fora do mapa e inimigo', () => {
    const viewers = partyViewers([
      token('Aria', 0, 0),
      token('Caído', 1, 0, { defeated: true }),
      token('Oculto', 2, 0, { hidden: true }),
      token('Goblin', 3, 0, { side: 'enemy' }),
      { ...token('Fora', 0, 0), position: null },
      token('Ogro', 5, 5, { size: 'large' }),
    ])
    expect(viewers).toEqual([{ x: 0, y: 0 }, { x: 5, y: 5 }, { x: 6, y: 5 }, { x: 5, y: 6 }, { x: 6, y: 6 }])
  })
})

describe('visão da mesa', () => {
  const map = grid(['..#..', '..#..'])

  it('em vista, nunca visto e explorado', () => {
    const first = tableVision({ combatants: [token('Aria', 0, 0)], fog: null }, map)
    expect(first.vis).toBe('22200' + '22200')
    expect(first.explored).toBe('11100' + '11100')

    // O grupo atravessou: o lado esquerdo continua explorado, agora fora de vista.
    const later = tableVision({ combatants: [token('Aria', 4, 0)], fog: null }, { ...map, explored: first.explored })
    expect(later.vis).toBe('11222' + '11222')
    expect(later.explored).toBe('11111' + '11111')
  })

  it('a névoa do mestre esconde mais, mesmo em linha de visão', () => {
    const fog = '10000' + '11111'
    const vision = tableVision({ combatants: [token('Aria', 0, 1)], fog }, map)
    expect(vision.vis).toBe('20000' + '22200')
  })

  it('sem ninguém do grupo no mapa, só o que já foi explorado', () => {
    expect(tableVision({ combatants: [], fog: null }, map).vis).toBe('0000000000')
    expect(tableVision({ combatants: [], fog: null }, { ...map, explored: '1000010000' }).vis).toBe('1000010000')
  })

  it('exploração de outro tamanho (mapa redimensionado) é ignorada', () => {
    expect(tableVision({ combatants: [], fog: null }, { ...map, explored: '111' }).vis).toBe('0000000000')
  })
})
