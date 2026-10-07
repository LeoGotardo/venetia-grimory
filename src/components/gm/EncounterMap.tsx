import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Combatant, Encounter, GridMap } from '../../types'
import { useGmStore } from '../../store/gmStore'
import { MapCanvas } from './MapCanvas'
import { TOKEN_FILL, tokenInitials } from './tokenStyle'
import { distanceMeters, gridDistance, inBounds, lineCells, paintCells, type Cell } from '../../lib/gm/terrain'
import {
  combatantAt, movementCostMeters, reachableCells, remainingMovement, sizeSquares, speedSquares,
} from '../../lib/gm/movement'
import { FOG_HIDDEN, FOG_REVEALED } from '../../constants'

type Tool = 'tokens' | 'ruler' | 'reveal' | 'hide' | 'pan'

interface EncounterMapProps {
  encounter: Encounter
  map: GridMap
  selectedId: string | null
  onSelect: (id: string | null) => void
}

const same = (a: Cell | null, b: Cell | null) => !!a && !!b && a.x === b.x && a.y === b.y

/**
 * Combate no mapa. Arrastar o token de quem tem a vez gasta movimento (com o
 * custo real do caminho); arrastar outro é reposicionamento livre do mestre.
 */
export function EncounterMap({ encounter, map, selectedId, onSelect }: EncounterMapProps) {
  const { t, i18n } = useTranslation()
  const { placeCombatant, moveCombatant, setFog } = useGmStore()
  const [tool, setTool] = useState<Tool>('tokens')
  const [playerView, setPlayerView] = useState(false)
  const [drag, setDrag] = useState<{ id: string; from: Cell; to: Cell } | null>(null)
  const [ruler, setRuler] = useState<{ a: Cell; b: Cell } | null>(null)
  const [hover, setHover] = useState<Cell | null>(null)
  const [fogDraft, setFogDraft] = useState<string | null>(null)
  const dragRef = useRef<{ id: string; from: Cell; to: Cell } | null>(null)
  const fogRef = useRef<string | null>(null)
  const lastFog = useRef<Cell | null>(null)

  const cellCount = map.width * map.height
  // Névoa de outro tamanho (o mapa foi redimensionado) é ignorada.
  const fog = encounter.fog?.length === cellCount ? fogDraft ?? encounter.fog : null
  const isRevealed = (c: Cell) => !fog || fog[c.y * map.width + c.x] === FOG_REVEALED

  // Na visão da mesa somem os ocultos e quem está sob a névoa.
  const visible = encounter.combatants.filter(c =>
    c.position && !(playerView && (c.hidden || !isRevealed(c.position))))

  const turnOwner = encounter.status === 'active' ? encounter.combatants.find(c => c.id === encounter.turn_id) ?? null : null
  const reach = useMemo(() => {
    if (!turnOwner?.position || tool !== 'tokens') return null
    return reachableCells(map, turnOwner.position, speedSquares(remainingMovement(turnOwner)))
  }, [turnOwner, map, tool])

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
    const blocker = combatantAt(encounter.combatants.filter(c => c.id !== d.id), d.to)
    if (blocker) return
    const cost = movementCostMeters(map, d.from, d.to)
    if (mover.id === turnOwner?.id && cost != null) moveCombatant(encounter.id, mover.id, d.to, cost)
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

    if (fog) {
      ctx.fillStyle = playerView ? '#000' : 'rgba(0,0,0,0.55)'
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
    const cost = movementCostMeters(map, drag.from, drag.to)
    if (cost == null) status = t('gm.noPath')
    else if (mover && mover.id === turnOwner?.id) {
      const left = remainingMovement(mover)
      status = t(cost > left ? 'gm.moveTooFar' : 'gm.moveReading', {
        meters: cost.toLocaleString(i18n.language), left: Math.max(0, left - cost).toLocaleString(i18n.language),
      })
    } else status = t('gm.rulerReading', { squares: gridDistance(drag.from, drag.to), meters: cost.toLocaleString(i18n.language) })
  } else if (ruler && !same(ruler.a, ruler.b)) {
    status = t('gm.rulerReading', { squares: gridDistance(ruler.a, ruler.b), meters: distanceMeters(ruler.a, ruler.b).toLocaleString(i18n.language) })
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
      <div className="flex flex-wrap items-center gap-1.5">
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
        <button aria-pressed={!!fog} onClick={toggleFog} className={toolButton(!!fog)}>{t('gm.fog')}</button>
        {fog && (
          <>
            <button onClick={() => setFog(encounter.id, FOG_REVEALED.repeat(cellCount))} className={toolButton(false)}>{t('gm.fogRevealAll')}</button>
            <button onClick={() => setFog(encounter.id, FOG_HIDDEN.repeat(cellCount))} className={toolButton(false)}>{t('gm.fogHideAll')}</button>
          </>
        )}
        <button aria-pressed={playerView} onClick={() => setPlayerView(v => !v)} className={toolButton(playerView)}>
          {t('gm.playerView')}
        </button>
      </div>

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

      <div className="h-[58vh] min-h-[320px] lg:h-[calc(100dvh-330px)]">
        <MapCanvas
          width={map.width}
          height={map.height}
          cells={map.cells}
          labels={map.labels}
          panMode={tool === 'pan'}
          onCellDown={handleDown}
          onCellMove={handleMove}
          onCellUp={handleUp}
          onCellCancel={handleCancel}
          onHover={cell => setHover(cell && inBounds(map, cell) ? cell : null)}
          drawOverlay={drawOverlay}
        />
      </div>
      <p className="min-h-[18px] text-[12px] text-[#A8A09B] tabular-nums" aria-live="polite">{status}</p>
    </div>
  )
}

function drawToken(
  ctx: CanvasRenderingContext2D,
  c: Combatant,
  pos: Cell,
  scale: number,
  o: { active: boolean; selected: boolean; ghost: boolean; showHp: boolean },
) {
  const size = sizeSquares(c) * scale
  const cx = pos.x * scale + size / 2
  const cy = pos.y * scale + size / 2
  const r = size / 2 - Math.max(2, scale * 0.08)

  ctx.globalAlpha = o.ghost ? 0.35 : 1
  ctx.fillStyle = c.defeated ? '#4a4540' : TOKEN_FILL[c.kind]
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.lineWidth = o.active ? 3 : o.selected ? 2.5 : 1.5
  ctx.strokeStyle = o.active ? '#D4A017' : o.selected ? '#F5F0E8' : 'rgba(0,0,0,0.6)'
  ctx.stroke()

  // Token pequeno demais (mapa todo enquadrado no celular) fica só com a cor.
  if (r >= 6) {
    ctx.fillStyle = '#fff'
    ctx.font = `700 ${Math.round(r * 0.75)}px Manrope, system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(tokenInitials(c.name), cx, cy + 1, r * 1.8)
  }

  if (c.defeated) {
    ctx.strokeStyle = '#d4564a'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(cx - r * 0.6, cy - r * 0.6)
    ctx.lineTo(cx + r * 0.6, cy + r * 0.6)
    ctx.moveTo(cx + r * 0.6, cy - r * 0.6)
    ctx.lineTo(cx - r * 0.6, cy + r * 0.6)
    ctx.stroke()
  }

  if (o.showHp && c.hp.max > 0 && scale >= 14) {
    const w = size * 0.8
    const x = pos.x * scale + (size - w) / 2
    const y = pos.y * scale + size - 4
    ctx.fillStyle = 'rgba(0,0,0,0.7)'
    ctx.fillRect(x, y, w, 3)
    const pct = c.hp.current / c.hp.max
    ctx.fillStyle = pct > 0.5 ? '#6f9f5f' : pct > 0.25 ? '#D4A017' : '#c0473b'
    ctx.fillRect(x, y, w * pct, 3)
  }
  ctx.globalAlpha = 1
}
