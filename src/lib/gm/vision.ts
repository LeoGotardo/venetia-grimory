import type { Combatant, Encounter, GridMap } from '../../types'
import { FOG_REVEALED } from '../../constants'
import { terrainOf, type Cell } from './terrain'
import { occupiedCells } from './movement'

/**
 * O que a mesa (os players) vê no mapa do encontro. Cada casa tem um de três
 * estados, guardados numa string com um caractere por casa, como `cells`:
 * `VIS_SEEN` (em vista agora), `VIS_REMEMBERED` (explorada antes, fora de
 * vista) e `VIS_UNKNOWN` (nunca vista).
 *
 * Em vista = linha de visão a partir de qualquer token do grupo (casas opacas
 * — parede, pilar, árvore, pedra, vazio — bloqueiam; a própria casa opaca é
 * vista), cortada pela névoa manual do mestre. A exploração é a união de tudo
 * que já esteve em vista, guardada no mapa (`GridMap.explored`), então vale
 * entre batalhas no mesmo mapa.
 */

export const VIS_UNKNOWN = '0'
export const VIS_REMEMBERED = '1'
export const VIS_SEEN = '2'

const EXPLORED = '1'
const UNEXPLORED = '0'

/** Casas opacas do mapa, por índice. */
function opacityOf(map: Pick<GridMap, 'cells'>): Uint8Array {
  const opaque = new Uint8Array(map.cells.length)
  for (let i = 0; i < map.cells.length; i++) opaque[i] = terrainOf(map.cells[i]).opaque ? 1 : 0
  return opaque
}

/**
 * Há linha de visão de `from` até `to`? Bresenham entre os centros: nenhuma
 * casa no meio do caminho pode ser opaca, e um passo diagonal não passa entre
 * duas opacas que se tocam pela quina (a mesma regra do movimento).
 */
function lineOfSight(opaque: Uint8Array, width: number, from: Cell, to: Cell): boolean {
  let { x, y } = from
  const dx = Math.abs(to.x - x)
  const dy = -Math.abs(to.y - y)
  const sx = x < to.x ? 1 : -1
  const sy = y < to.y ? 1 : -1
  let err = dx + dy
  while (x !== to.x || y !== to.y) {
    const e2 = 2 * err
    const stepX = e2 >= dy
    const stepY = e2 <= dx
    if (stepX && stepY && opaque[y * width + x + sx] && opaque[(y + sy) * width + x]) return false
    if (stepX) {
      err += dy
      x += sx
    }
    if (stepY) {
      err += dx
      y += sy
    }
    if ((x !== to.x || y !== to.y) && opaque[y * width + x]) return false
  }
  return true
}

/** Casas em linha de visão de qualquer uma das casas de origem (máscara por índice). */
export function sightFrom(map: Pick<GridMap, 'width' | 'height' | 'cells'>, origins: Cell[]): Uint8Array {
  const { width, height } = map
  const seen = new Uint8Array(width * height)
  const opaque = opacityOf(map)
  const inside = origins.filter(o => o.x >= 0 && o.y >= 0 && o.x < width && o.y < height)
  for (let i = 0; i < seen.length; i++) {
    const target = { x: i % width, y: Math.floor(i / width) }
    if (inside.some(origin => lineOfSight(opaque, width, origin, target))) seen[i] = 1
  }
  return seen
}

/** Quem enxerga pelo grupo: aliados no mapa que não estão derrotados nem escondidos pelo mestre. */
export function partyViewers(combatants: Combatant[]): Cell[] {
  return combatants
    .filter(c => c.side === 'party' && c.position && !c.defeated && !c.hidden)
    .flatMap(occupiedCells)
}

export interface TableVision {
  /** Um estado por casa: `VIS_SEEN`, `VIS_REMEMBERED` ou `VIS_UNKNOWN`. */
  vis: string
  /** Exploração do mapa depois desta olhada (`'1'` = já esteve em vista). */
  explored: string
}

/**
 * Visão da mesa agora: linha de visão do grupo ∩ névoa revelada pelo mestre,
 * somada à exploração que o mapa já tinha. Exploração e névoa de outro tamanho
 * (mapa redimensionado) são ignoradas.
 */
export function tableVision(encounter: Pick<Encounter, 'combatants' | 'fog'>, map: GridMap): TableVision {
  const count = map.width * map.height
  const fog = encounter.fog?.length === count ? encounter.fog : null
  const previous = map.explored?.length === count ? map.explored : null
  const sight = sightFrom(map, partyViewers(encounter.combatants))

  let vis = ''
  let explored = ''
  for (let i = 0; i < count; i++) {
    const seen = sight[i] === 1 && (!fog || fog[i] === FOG_REVEALED)
    const known = seen || previous?.[i] === EXPLORED
    vis += seen ? VIS_SEEN : known ? VIS_REMEMBERED : VIS_UNKNOWN
    explored += known ? EXPLORED : UNEXPLORED
  }
  return { vis, explored }
}
