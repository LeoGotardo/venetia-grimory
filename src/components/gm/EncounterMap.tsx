import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Combatant, Encounter, GridMap } from '../../types'
import { useGmStore } from '../../store/gmStore'
import { MapCanvas } from './MapCanvas'
import { drawToken } from './drawToken'
import { TOKEN_FILL, tokenInitials } from './tokenStyle'
import { distanceMeters, gridDistance, inBounds, lineCells, paintCells, type Cell } from '../../lib/gm/terrain'
import {
  checkMove, combatantAt, occupancyFor, reachableCells, remainingMovement, sizeSquares, speedSquares, type MoveCheck,
} from '../../lib/gm/movement'
import { FOG_HIDDEN, FOG_REVEALED } from '../../constants'
import { VIS_REMEMBERED, VIS_SEEN, tableVision } from '../../lib/gm/vision'

type Tool = 'tokens' | 'ruler' | 'reveal' | 'hide' | 'pan'

interface EncounterMapProps {
  encounter: Encounter
  map: GridMap
  selectedId: string | null
  onSelect: (id: string | null) => void
  /** Visão da mesa: só o que os jogadores podem ver, sem ferramentas nem interação. */
  playerView: boolean
  onPlayerViewChange: (on: boolean) => void
}

const same = (a: Cell | null, b: Cell | null) => !!a && !!b && a.x === b.x && a.y === b.y

/**
 * Combate no mapa. Arrastar o token de quem tem a vez gasta movimento (com o
 * custo real do caminho); arrastar outro é reposicionamento do mestre. Com
 * "respeitar deslocamento" ligado e o combate em andamento, ninguém atravessa
 * parede e quem tem a vez não passa do que lhe resta (`checkMove`).
 */
export function EncounterMap({ encounter, map, selectedId, onSelect, playerView, onPlayerViewChange }: EncounterMapProps) {
  const { t, i18n } = useTranslation()
  const { placeCombatant, moveCombatant, setFog, setStrictMovement, setMapExplored } = useGmStore()
  const [tool, setTool] = useState<Tool>('tokens')
  const [drag, setDrag] = useState<{ id: string; from: Cell; to: Cell } | null>(null)
  const [ruler, setRuler] = useState<{ a: Cell; b: Cell } | null>(null)
  const [hover, setHover] = useState<Cell | null>(null)
  const [fogDraft, setFogDraft] = useState<string | null>(null)
  const dragRef = useRef<{ id: string; from: Cell; to: Cell } | null>(null)
  const fogRef = useRef<string | null>(null)
  /** Por que o último arraste foi recusado (some no próximo toque). */
  const [refused, setRefused] = useState<Exclude<MoveCheck, { ok: true }>['reason'] | null>(null)
  const lastFog = useRef<Cell | null>(null)

  const cellCount = map.width * map.height
  // Névoa de outro tamanho (o mapa foi redimensionado) é ignorada.
  const fog = encounter.fog?.length === cellCount ? fogDraft ?? encounter.fog : null

  // Visão da mesa: a mesma dos players (linha de visão do grupo, exploração, névoa). Cara de calcular.
  const vision = useMemo(
    () => (playerView ? tableVision({ combatants: encounter.combatants, fog }, map) : null),
    [playerView, encounter.combatants, fog, map],
  )
  const visible = encounter.combatants.filter(c => {
    if (!c.position) return false
    if (!vision) return true
    return !c.hidden && vision.vis[c.position.y * map.width + c.position.x] === VIS_SEEN
  })

  const turnOwner = encounter.status === 'active' ? encounter.combatants.find(c => c.id === encounter.turn_id) ?? null : null
  /** O modo estrito só vale com o combate andando: na preparação o mestre posiciona livre. */
  const strict = encounter.strict_movement && encounter.status === 'active'
  const checkFor = (mover: Combatant, to: Cell): MoveCheck =>
    checkMove(map, mover, to, encounter.combatants, { strict, turnOwner: mover.id === turnOwner?.id })

  const reach = useMemo(() => {
    if (!turnOwner?.position || tool !== 'tokens') return null
    const options = { mode: turnOwner.move_mode, occupancy: occupancyFor(turnOwner, encounter.combatants, map.width) }
    const cells = reachableCells(map, turnOwner.position, speedSquares(remainingMovement(turnOwner)), options)
    // Dá para atravessar o espaço de um aliado, mas não parar nele.
    for (const idx of options.occupancy.keys()) cells.delete(idx)
    return cells
  }, [turnOwner, map, tool, encounter.combatants])

  const selected = encounter.combatants.find(c => c.id === selectedId) ?? null
  const unplaced = encounter.combatants.filter(c => !c.position && !c.defeated)

  function setDragBoth(next: typeof drag) {
    dragRef.current = next
    setDrag(next)
  }

  function setFogBoth(next: string | null) {
    fogRef.current = next
    setFogDraft(next)
  }

  function paintFog(cells: Cell[]) {
    const base = fogRef.current ?? encounter.fog
    if (!base || base.length !== cellCount) return
    setFogBoth(paintCells({ ...map, cells: base }, cells, tool === 'reveal' ? FOG_REVEALED : FOG_HIDDEN))
  }

  function handleDown(cell: Cell) {
    setRefused(null)
    if (tool === 'ruler') {
      setRuler({ a: selected?.position ?? cell, b: cell })
      return
    }
    if (tool === 'reveal' || tool === 'hide') {
      lastFog.current = cell
      paintFog([cell])
      return
    }
    const hit = combatantAt(visible, cell)
    if (hit) {
      onSelect(hit.id)
      setDragBoth({ id: hit.id, from: hit.position!, to: hit.position! })
    } else if (selected && !selected.position) {
      placeCombatant(encounter.id, selected.id, cell)
    } else {
      onSelect(null)
    }
  }

  function handleMove(cell: Cell) {
    if (tool === 'ruler') setRuler(r => (r ? { ...r, b: cell } : r))
    else if (tool === 'reveal' || tool === 'hide') {
      paintFog(lineCells(lastFog.current ?? cell, cell))
      lastFog.current = cell
    } else if (dragRef.current) setDragBoth({ ...dragRef.current, to: cell })
  }

  function handleUp() {
    if (tool === 'reveal' || tool === 'hide') {
      if (fogRef.current && fogRef.current !== encounter.fog) setFog(encounter.id, fogRef.current)
      setFogBoth(null)
      lastFog.current = null
      return
    }
    const d = dragRef.current
    setDragBoth(null)
    if (!d || same(d.from, d.to)) return
    const mover = encounter.combatants.find(c => c.id === d.id)
    if (!mover) return
    const check = checkFor(mover, d.to)
    if (!check.ok) {
      // O token volta para onde estava; o status diz o motivo.
      setRefused(check.reason)
      return
    }
    if (mover.id === turnOwner?.id && check.cost != null) moveCombatant(encounter.id, mover.id, d.to, check.cost)
    else placeCombatant(encounter.id, mover.id, d.to)
  }

  function handleCancel() {
    setDragBoth(null)
    setFogBoth(null)
  }

  function toggleFog() {
    setFog(encounter.id, fog ? null : FOG_HIDDEN.repeat(cellCount))
  }

  const drawOverlay = (ctx: CanvasRenderingContext2D, scale: number) => {
    if (reach && !playerView) {
      ctx.fillStyle = 'rgba(212,160,23,0.16)'
      for (const idx of reach.keys()) ctx.fillRect((idx % map.width) * scale, Math.floor(idx / map.width) * scale, scale, scale)
    }

    if (vision) {
      for (let i = 0; i < cellCount; i++) {
        if (vision.vis[i] === VIS_SEEN) continue
        ctx.fillStyle = vision.vis[i] === VIS_REMEMBERED ? 'rgba(0,0,0,0.6)' : '#000'
        ctx.fillRect((i % map.width) * scale, Math.floor(i / map.width) * scale, scale, scale)
      }
    } else if (fog) {
      ctx.fillStyle = 'rgba(0,0,0,0.55)'
      for (let i = 0; i < cellCount; i++) {
        if (fog[i] === FOG_HIDDEN) ctx.fillRect((i % map.width) * scale, Math.floor(i / map.width) * scale, scale, scale)
      }
    }

    for (const c of visible) {
      const pos = drag?.id === c.id ? drag.from : c.position!
      drawToken(ctx, c, pos, scale, { active: c.id === turnOwner?.id, selected: c.id === selectedId, ghost: drag?.id === c.id, showHp: !playerView })
    }

    if (drag && !same(drag.from, drag.to)) {
      const mover = encounter.combatants.find(c => c.id === drag.id)
      if (mover) {
        const half = (sizeSquares(mover) * scale) / 2
        ctx.strokeStyle = '#D4A017'
        ctx.lineWidth = 2
        ctx.setLineDash([6, 5])
        ctx.beginPath()
        ctx.moveTo(drag.from.x * scale + half, drag.from.y * scale + half)
        ctx.lineTo(drag.to.x * scale + half, drag.to.y * scale + half)
        ctx.stroke()
        ctx.setLineDash([])
        drawToken(ctx, mover, drag.to, scale, { active: false, selected: true, ghost: false, showHp: false })
        // Destino que o modo estrito vai recusar: moldura vermelha antes de soltar.
        if (!checkFor(mover, drag.to).ok) {
          const side = sizeSquares(mover) * scale
          ctx.strokeStyle = '#e0533f'
          ctx.lineWidth = 3
          ctx.strokeRect(drag.to.x * scale + 1.5, drag.to.y * scale + 1.5, side - 3, side - 3)
        }
      }
    }

    if (ruler && !same(ruler.a, ruler.b)) {
      const center = (c: Cell) => [c.x * scale + scale / 2, c.y * scale + scale / 2] as const
      ctx.strokeStyle = '#e8cf86'
      ctx.lineWidth = 3
      ctx.setLineDash([8, 6])
      ctx.beginPath()
      ctx.moveTo(...center(ruler.a))
      ctx.lineTo(...center(ruler.b))
      ctx.stroke()
      ctx.setLineDash([])
    }

    if (hover && tool !== 'pan') {
      ctx.strokeStyle = 'rgba(245,240,232,0.6)'
      ctx.lineWidth = 1.5
      ctx.strokeRect(hover.x * scale + 1, hover.y * scale + 1, scale - 2, scale - 2)
    }
  }

  // Leitura da barra de status: custo do arraste, régua, ou dica de posicionamento.
  let status = ''
  if (drag && !same(drag.from, drag.to)) {
    const mover = encounter.combatants.find(c => c.id === drag.id)
    const check = mover ? checkFor(mover, drag.to) : null
    const cost = check?.ok ? check.cost : null
    if (check && !check.ok) status = t(`gm.moveRefused.${check.reason}`)
    else if (cost == null) status = t('gm.noPath')
    else if (mover && mover.id === turnOwner?.id) {
      const left = remainingMovement(mover)
      status = t(cost > left ? 'gm.moveTooFar' : 'gm.moveReading', {
        meters: cost.toLocaleString(i18n.language), left: Math.max(0, left - cost).toLocaleString(i18n.language),
      })
    } else status = t('gm.rulerReading', { squares: gridDistance(drag.from, drag.to), meters: cost.toLocaleString(i18n.language) })
  } else if (ruler && !same(ruler.a, ruler.b)) {
    status = t('gm.rulerReading', { squares: gridDistance(ruler.a, ruler.b), meters: distanceMeters(ruler.a, ruler.b).toLocaleString(i18n.language) })
  } else if (refused) {
    status = t(`gm.moveRefused.${refused}`)
  } else if (selected && !selected.position) {
    status = t('gm.placeHint')
  }

  const toolButton = (active: boolean) =>
    `rounded-[9px] px-2.5 py-1.5 text-[12px] font-semibold border cursor-pointer transition-colors ${
      active ? 'bg-[#D4A017] text-[#131110] border-[#D4A017]' : 'bg-white/5 text-[#E8DFD0] border-white/[0.1] hover:bg-white/10'
    }`
  const tools: Array<{ id: Tool; key: string }> = [
    { id: 'tokens', key: 'gm.toolTokens' },
    { id: 'ruler', key: 'gm.toolRuler' },
    { id: 'pan', key: 'gm.toolPan' },
    ...(fog ? [{ id: 'reveal' as const, key: 'gm.fogReveal' }, { id: 'hide' as const, key: 'gm.fogHide' }] : []),
  ]

  return (
    <div className="flex flex-col gap-2">
      {!playerView && <div className="flex flex-wrap items-center gap-1.5">
        {tools.map(tl => (
          <button
            key={tl.id}
            aria-pressed={tool === tl.id}
            onClick={() => {
              setTool(tl.id)
              setRuler(null)
            }}
            className={toolButton(tool === tl.id)}
          >
            {t(tl.key)}
          </button>
        ))}
        <span className="w-px h-5 bg-white/[0.1] mx-1" aria-hidden="true" />
        <button
          aria-pressed={encounter.strict_movement}
          data-testid="respeitar-deslocamento"
          title={t('gm.strictMovementHint')}
          onClick={() => setStrictMovement(encounter.id, !encounter.strict_movement)}
          className={toolButton(encounter.strict_movement)}
        >
          {t('gm.strictMovement')}
        </button>
        <button aria-pressed={!!fog} onClick={toggleFog} className={toolButton(!!fog)}>{t('gm.fog')}</button>
        {fog && (
          <>
            <button onClick={() => setFog(encounter.id, FOG_REVEALED.repeat(cellCount))} className={toolButton(false)}>{t('gm.fogRevealAll')}</button>
            <button onClick={() => setFog(encounter.id, FOG_HIDDEN.repeat(cellCount))} className={toolButton(false)}>{t('gm.fogHideAll')}</button>
          </>
        )}
        <button aria-pressed={playerView} onClick={() => onPlayerViewChange(!playerView)} className={toolButton(playerView)}>
          {t('gm.playerView')}
        </button>
        {map.explored?.includes('1') && (
          <button
            onClick={() => confirm(t('gm.forgetExploredConfirm')) && setMapExplored(map.id, null)}
            title={t('gm.forgetExploredHint')}
            className={toolButton(false)}
          >
            {t('gm.forgetExplored')}
          </button>
        )}
      </div>}

      {unplaced.length > 0 && !playerView && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A8A09B]">{t('gm.offMap')}</span>
          {unplaced.map(c => (
            <button
              key={c.id}
              aria-pressed={c.id === selectedId}
              onClick={() => onSelect(c.id)}
              className={`inline-flex items-center gap-1.5 rounded-full pl-1 pr-2.5 py-0.5 text-[12px] font-semibold border cursor-pointer ${
                c.id === selectedId ? 'border-[#F5F0E8] text-[#F5F0E8]' : 'border-white/[0.12] text-[#E8DFD0]'
              }`}
            >
              <span className="w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center text-white" style={{ background: TOKEN_FILL[c.kind] }}>
                {tokenInitials(c.name)}
              </span>
              {c.name}
            </button>
          ))}
        </div>
      )}

      <div className={playerView ? 'h-[calc(100dvh-120px)] min-h-[320px]' : 'h-[62vh] min-h-[320px] lg:h-[calc(100dvh-250px)] lg:min-h-[520px]'}>
        <MapCanvas
          width={map.width}
          height={map.height}
          cells={map.cells}
          labels={map.labels}
          panMode={tool === 'pan' || playerView}
          onCellDown={handleDown}
          onCellMove={handleMove}
          onCellUp={handleUp}
          onCellCancel={handleCancel}
          onHover={cell => setHover(cell && inBounds(map, cell) ? cell : null)}
          drawOverlay={drawOverlay}
        />
      </div>
      {!playerView && <p className="min-h-[18px] text-[12px] text-[#A8A09B] tabular-nums" aria-live="polite">{status}</p>}
    </div>
  )
}
