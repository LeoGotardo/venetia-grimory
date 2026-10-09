import type { TableState } from '../../lib/room/protocol'
import type { CreatureSize } from '../../types'
import { CREATURE_SIZES, FOG_HIDDEN } from '../../constants'
import { MapCanvas } from '../gm/MapCanvas'
import { drawToken } from '../gm/drawToken'

type TableMapData = NonNullable<TableState['map']>

const asSize = (size: string): CreatureSize =>
  (CREATURE_SIZES as readonly string[]).includes(size) ? (size as CreatureSize) : 'medium'

/** Mapa da mesa transmitida, só de leitura: arrastar move a vista, a névoa é preta. */
export function TableMap({ map, table }: { map: TableMapData; table: TableState }) {
  const labels = map.labels.map((label, i) => ({ id: String(i), ...label }))
  const cellCount = map.width * map.height
  const fog = map.fog?.length === cellCount ? map.fog : null

  const drawOverlay = (ctx: CanvasRenderingContext2D, scale: number) => {
    if (fog) {
      ctx.fillStyle = '#000'
      for (let i = 0; i < cellCount; i++) {
        if (fog[i] === FOG_HIDDEN) ctx.fillRect((i % map.width) * scale, Math.floor(i / map.width) * scale, scale, scale)
      }
    }
    for (const c of table.combatants) {
      if (!c.position) continue
      drawToken(ctx, { ...c, size: asSize(c.size) }, c.position, scale, {
        active: c.id === table.turn_id, selected: false, ghost: false, showHp: false,
      })
    }
  }

  return (
    <div className="h-[62vh] min-h-[320px] lg:h-[calc(100dvh-260px)]">
      <MapCanvas width={map.width} height={map.height} cells={map.cells} labels={labels} panMode drawOverlay={drawOverlay} />
    </div>
  )
}
