import type { TableState } from '../../lib/room/protocol'
import type { Cell } from '../../lib/gm/terrain'
import { FOG_HIDDEN } from '../../constants'
import { asCreatureSize } from '../../lib/gm/tableView'
import { VIS_REMEMBERED, VIS_UNKNOWN } from '../../lib/gm/vision'
import { MapCanvas } from '../gm/MapCanvas'
import { drawToken } from '../gm/drawToken'

type TableMapData = NonNullable<TableState['map']>

interface TableMapProps {
  map: TableMapData
  table: TableState
  /** Na vez do player: casas que ele alcança (índice → custo em casas), destacadas no mapa. */
  reachable?: Map<number, number> | null
  /** Destino escolhido, ainda não confirmado. */
  target?: Cell | null
  /** Token do player, com o contorno de "seu". */
  mineId?: string | null
  onCellTap?: (cell: Cell) => void
}

/**
 * Mapa da mesa transmitida: arrastar move a vista; nunca visto é preto, explorado
 * fica esmaecido. Na vez do player, as casas alcançáveis ficam douradas e um
 * toque escolhe o destino — quem move de fato é o mestre, ao aceitar.
 */
export function TableMap({ map, table, reachable, target, mineId, onCellTap }: TableMapProps) {
  const labels = map.labels.map((label, i) => ({ id: String(i), ...label }))
  const cellCount = map.width * map.height
  const vis = map.vis?.length === cellCount ? map.vis : null
  // Mesa de uma versão antiga do mestre: só a névoa manual.
  const fog = !vis && map.fog?.length === cellCount ? map.fog : null

  const shade = (ctx: CanvasRenderingContext2D, i: number, scale: number) =>
    ctx.fillRect((i % map.width) * scale, Math.floor(i / map.width) * scale, scale, scale)

  const drawOverlay = (ctx: CanvasRenderingContext2D, scale: number) => {
    for (let i = 0; i < cellCount; i++) {
      const state = vis?.[i]
      if (state === VIS_UNKNOWN || fog?.[i] === FOG_HIDDEN) {
        ctx.fillStyle = '#000'
        shade(ctx, i, scale)
      } else if (state === VIS_REMEMBERED) {
        // Explorada, fora de vista: o terreno aparece esmaecido, sem criaturas.
        ctx.fillStyle = 'rgba(0,0,0,0.6)'
        shade(ctx, i, scale)
      }
    }
    if (reachable) {
      ctx.fillStyle = 'rgba(212,160,23,0.22)'
      for (const i of reachable.keys()) shade(ctx, i, scale)
    }
    if (target) {
      ctx.strokeStyle = '#E8C25A'
      ctx.lineWidth = Math.max(2, scale * 0.1)
      ctx.strokeRect(target.x * scale + 1, target.y * scale + 1, scale - 2, scale - 2)
    }
    for (const c of table.combatants) {
      if (!c.position) continue
      drawToken(ctx, { ...c, size: asCreatureSize(c.size) }, c.position, scale, {
        active: c.id === table.turn_id, selected: c.id === mineId, ghost: false, showHp: false,
      })
    }
  }

  return (
    <div className="h-[62vh] min-h-[320px] lg:h-[calc(100dvh-260px)]">
      <MapCanvas
        width={map.width}
        height={map.height}
        cells={map.cells}
        labels={labels}
        panMode
        onCellTap={onCellTap}
        drawOverlay={drawOverlay}
      />
    </div>
  )
}
