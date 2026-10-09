import type { Combatant, Encounter, GridMap } from '../../types'
import { TABLE_LIMITS, type TableCombatant, type TableHealth, type TableState } from '../room/protocol'
import { FOG_REVEALED, TERRAIN_VOID } from '../../constants'

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
 * servidor e os players nunca recebem o resto. Mesma regra da "visão da mesa":
 * somem os ocultos e quem está sob a névoa (pela casa do canto, como no mapa);
 * o terreno e os rótulos sob a névoa também somem, para o JSON não entregar a
 * sala secreta. Inimigos levam só a faixa de vida; PV exato, só os players.
 */
export function buildTableState(encounter: Encounter, map: GridMap | null): TableState {
  const cellCount = map ? map.width * map.height : 0
  const fog = map && encounter.fog?.length === cellCount ? encounter.fog : null
  const revealed = (x: number, y: number) => !fog || fog[y * map!.width + x] === FOG_REVEALED

  const visible = encounter.combatants.filter(c => !c.hidden && (!c.position || !map || revealed(c.position.x, c.position.y)))
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
      cells: fog ? [...map.cells].map((code, i) => (fog[i] === FOG_REVEALED ? code : TERRAIN_VOID)).join('') : map.cells,
      labels: map.labels
        .filter(l => revealed(l.x, l.y))
        .slice(0, TABLE_LIMITS.labels)
        .map(({ x, y, text }) => ({ x, y, text: clip(text, TABLE_LIMITS.label) })),
      fog,
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
