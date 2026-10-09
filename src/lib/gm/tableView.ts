import type { Combatant, Encounter, GridMap } from '../../types'
import { TABLE_LIMITS, type TableCombatant, type TableHealth, type TableState } from '../room/protocol'
import { TERRAIN_VOID } from '../../constants'
import { VIS_SEEN, VIS_UNKNOWN, tableVision, type TableVision } from './vision'

/**
 * Faixa de vida de 2024: "Sangrando" é estar com metade ou menos dos PV. O
 * player vê a faixa dos inimigos, nunca o número.
 */
export function healthBand(c: Pick<Combatant, 'hp' | 'defeated'>): TableHealth {
  if (c.defeated || c.hp.current <= 0) return 'down'
  if (c.hp.current >= c.hp.max) return 'unhurt'
  return c.hp.current * 2 <= c.hp.max ? 'bloodied' : 'wounded'
}

const clip = (text: string, max: number) => text.slice(0, max)

/**
 * O que vai para a tela dos players, montado no aparelho do mestre — o
 * servidor e os players nunca recebem o resto. No mapa vale a visão do grupo
 * (`tableVision`): só aparece quem está numa casa em vista (pela casa do canto)
 * e não foi escondido pelo mestre; casa nunca vista vai com o terreno apagado
 * e sem rótulos, para o JSON não entregar a sala secreta. Inimigos levam só a
 * faixa de vida; PV exato, só os players. `vision` evita recalcular quando
 * quem chama já calculou (para gravar a exploração).
 */
export function buildTableState(
  encounter: Encounter,
  map: GridMap | null,
  vision: TableVision | null = map ? tableVision(encounter, map) : null,
): TableState {
  const stateAt = (x: number, y: number) => (map && vision ? vision.vis[y * map.width + x] : VIS_SEEN)
  const visible = encounter.combatants.filter(c => !c.hidden && (!c.position || stateAt(c.position.x, c.position.y) === VIS_SEEN))
  const turnVisible = encounter.status === 'active' && visible.some(c => c.id === encounter.turn_id)

  return {
    encounter_id: encounter.id,
    name: clip(encounter.name, TABLE_LIMITS.title),
    status: encounter.status,
    round: encounter.round,
    turn_id: turnVisible ? encounter.turn_id : null,
    combatants: visible.slice(0, TABLE_LIMITS.combatants).map(c => toTableCombatant(c, Boolean(map))),
    map: map && {
      width: map.width,
      height: map.height,
      cells: vision ? [...map.cells].map((code, i) => (vision.vis[i] === VIS_UNKNOWN ? TERRAIN_VOID : code)).join('') : map.cells,
      labels: map.labels
        .filter(l => stateAt(l.x, l.y) !== VIS_UNKNOWN)
        .slice(0, TABLE_LIMITS.labels)
        .map(({ x, y, text }) => ({ x, y, text: clip(text, TABLE_LIMITS.label) })),
      fog: null,
      vis: vision?.vis ?? null,
    },
  }
}

function toTableCombatant(c: Combatant, onMap: boolean): TableCombatant {
  return {
    id: c.id,
    name: clip(c.name, TABLE_LIMITS.name),
    kind: c.kind,
    side: c.side,
    health: healthBand(c),
    hp: c.kind === 'player' ? { ...c.hp } : null,
    defeated: c.defeated,
    initiative: c.initiative,
    conditions: c.conditions.slice(0, TABLE_LIMITS.conditions).map(cond => clip(cond, TABLE_LIMITS.condition)),
    size: c.size,
    position: onMap && c.position ? { ...c.position } : null,
  }
}
