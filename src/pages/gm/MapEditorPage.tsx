import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Campaign, GridMap } from '../../types'
import { useGmStore } from '../../store/gmStore'
import { GmHeader, gmPrimaryButton, gmSecondaryButton } from '../../components/gm/GmHeader'
import { MapCanvas } from '../../components/gm/MapCanvas'
import { TERRAIN_STYLE } from '../../components/gm/terrainStyle'
import { Modal } from '../../components/ui/Modal'
import { NumberField } from '../../components/gm/fields'
import {
  cellAt, distanceMeters, floodFill, gridDistance, lineCells, paintCells, rectCells, terrainOf, type Cell,
} from '../../lib/gm/terrain'
import { MAP_MAX_SIZE, MAP_MIN_SIZE, MAP_UNDO_LIMIT, TERRAINS, TERRAIN_VOID } from '../../constants'
import { NotFound } from '../NotFound'

type Tool = 'brush' | 'erase' | 'rect' | 'fill' | 'label' | 'ruler' | 'pan'

const TOOLS: Array<{ id: Tool; key: string; icon: string }> = [
  { id: 'brush', key: 'gm.toolBrush', icon: 'M3 21c3 0 5-2 5-5l9-9-4-4-9 9c-3 0-5 2-5 5' },
  { id: 'erase', key: 'gm.toolErase', icon: 'M7 21h10M5 15l8-8 6 6-6 6H9z' },
  { id: 'rect', key: 'gm.toolRect', icon: 'M4 5h16v14H4z' },
  { id: 'fill', key: 'gm.toolFill', icon: 'M5 11l7-7 7 7-7 7zM20 15s2 2.5 2 4a2 2 0 0 1-4 0c0-1.5 2-4 2-4' },
  { id: 'label', key: 'gm.toolLabel', icon: 'M4 7V5h16v2M9 19h6M12 5v14' },
  { id: 'ruler', key: 'gm.toolRuler', icon: 'M3 17L17 3l4 4L7 21zM7 13l2 2M10 10l2 2M13 7l2 2' },
  { id: 'pan', key: 'gm.toolPan', icon: 'M12 3v18M3 12h18M12 3l-3 3M12 3l3 3M12 21l-3-3M12 21l3-3M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3' },
]

/** `/mestre/campanha/:id/mapa/:mapId` — editor da grade. */
export function MapEditorPage() {
  const { id, mapId } = useParams<{ id: string; mapId: string }>()
  const { campaign, openedId, openCampaign } = useGmStore()

  useEffect(() => {
    if (id) openCampaign(id)
  }, [id, openCampaign])

  if (openedId === id && !campaign) return <NotFound />
  if (!campaign || campaign.id !== id) return null

  const map = campaign.maps.find(m => m.id === mapId)
  if (!map) return <NotFound />

  return <MapEditor key={map.id} campaign={campaign} map={map} />
}

function MapEditor({ campaign, map }: { campaign: Campaign; map: GridMap }) {
  const { t, i18n } = useTranslation()
  const { renameMap, setMapCells, resizeMap, addMapLabel, updateMapLabel, removeMapLabel } = useGmStore()
  const [tool, setTool] = useState<Tool>('brush')
  const [terrain, setTerrain] = useState<string>('.')
  const [draft, setDraft] = useState<string | null>(null)
  const [rect, setRect] = useState<{ a: Cell; b: Cell } | null>(null)
  const [ruler, setRuler] = useState<{ a: Cell; b: Cell } | null>(null)
  const [hover, setHover] = useState<Cell | null>(null)
  const [past, setPast] = useState<string[]>([])
  const [future, setFuture] = useState<string[]>([])
  const [sizeOpen, setSizeOpen] = useState(false)
  const [size, setSize] = useState({ w: map.width, h: map.height })
  const last = useRef<Cell | null>(null)
  // Espelhos síncronos do traço: o `pointerup` pode chegar antes do render do último movimento.
  const stroke = useRef<string | null>(null)
  const rectRef = useRef<{ a: Cell; b: Cell } | null>(null)

  function setStroke(next: string | null) {
    stroke.current = next
    setDraft(next)
  }

  function setRectBoth(next: { a: Cell; b: Cell } | null) {
    rectRef.current = next
    setRect(next)
  }

  const cells = draft ?? map.cells
  const paintCode = tool === 'erase' ? TERRAIN_VOID : terrain

  const commit = useCallback((next: string) => {
    stroke.current = null
    setDraft(null)
    if (next === map.cells) return
    setPast(p => [...p, map.cells].slice(-MAP_UNDO_LIMIT))
    setFuture([])
    setMapCells(map.id, next)
  }, [map.cells, map.id, setMapCells])

  const undo = useCallback(() => {
    const prev = past[past.length - 1]
    if (prev == null || prev.length !== map.width * map.height) return
    setPast(p => p.slice(0, -1))
    setFuture(f => [map.cells, ...f])
    setMapCells(map.id, prev)
  }, [past, map, setMapCells])

  const redo = useCallback(() => {
    const next = future[0]
    if (next == null || next.length !== map.width * map.height) return
    setFuture(f => f.slice(1))
    setPast(p => [...p, map.cells])
    setMapCells(map.id, next)
  }, [future, map, setMapCells])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'z') return
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return
      e.preventDefault()
      if (e.shiftKey) redo()
      else undo()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo])

  function handleDown(cell: Cell) {
    last.current = cell
    if (tool === 'brush' || tool === 'erase') setStroke(paintCells(map, [cell], paintCode))
    else if (tool === 'rect') setRectBoth({ a: cell, b: cell })
    else if (tool === 'ruler') setRuler({ a: cell, b: cell })
    else if (tool === 'fill') commit(floodFill(map, cell, terrain))
    else if (tool === 'label') editLabelAt(cell)
  }

  function handleMove(cell: Cell) {
    if (tool === 'brush' || tool === 'erase') {
      const from = last.current ?? cell
      setStroke(paintCells({ ...map, cells: stroke.current ?? map.cells }, lineCells(from, cell), paintCode))
    } else if (tool === 'rect' && rectRef.current) setRectBoth({ ...rectRef.current, b: cell })
    else if (tool === 'ruler') setRuler(r => (r ? { ...r, b: cell } : r))
    last.current = cell
  }

  function handleUp() {
    if ((tool === 'brush' || tool === 'erase') && stroke.current != null) commit(stroke.current)
    else if (tool === 'rect' && rectRef.current) {
      commit(paintCells(map, rectCells(rectRef.current.a, rectRef.current.b), terrain))
      setRectBoth(null)
    }
    last.current = null
  }

  function handleCancel() {
    setStroke(null)
    setRectBoth(null)
    last.current = null
  }

  function editLabelAt(cell: Cell) {
    const existing = map.labels.find(l => l.x === cell.x && l.y === cell.y)
    const text = prompt(t('gm.labelPrompt'), existing?.text ?? '')
    if (text == null) return
    if (existing) {
      if (text.trim()) updateMapLabel(map.id, existing.id, text.trim())
      else removeMapLabel(map.id, existing.id)
    } else {
      addMapLabel(map.id, cell.x, cell.y, text)
    }
  }

  function applySize() {
    const shrinking = size.w < map.width || size.h < map.height
    if (shrinking && !confirm(t('gm.shrinkConfirm'))) return
    resizeMap(map.id, size.w, size.h)
    setPast([])
    setFuture([])
    setSizeOpen(false)
  }

  const drawOverlay = (ctx: CanvasRenderingContext2D, scale: number) => {
    if (rect) {
      const x = Math.min(rect.a.x, rect.b.x) * scale
      const y = Math.min(rect.a.y, rect.b.y) * scale
      const w = (Math.abs(rect.a.x - rect.b.x) + 1) * scale
      const h = (Math.abs(rect.a.y - rect.b.y) + 1) * scale
      ctx.fillStyle = `${TERRAIN_STYLE[terrainOf(terrain).id].fill}cc`
      ctx.fillRect(x, y, w, h)
      ctx.strokeStyle = '#D4A017'
      ctx.lineWidth = 2
      ctx.strokeRect(x, y, w, h)
    }
    if (ruler && (ruler.a.x !== ruler.b.x || ruler.a.y !== ruler.b.y)) {
      const cx = (c: Cell) => c.x * scale + scale / 2
      const cy = (c: Cell) => c.y * scale + scale / 2
      ctx.strokeStyle = '#D4A017'
      ctx.lineWidth = 3
      ctx.setLineDash([8, 6])
      ctx.beginPath()
      ctx.moveTo(cx(ruler.a), cy(ruler.a))
      ctx.lineTo(cx(ruler.b), cy(ruler.b))
      ctx.stroke()
      ctx.setLineDash([])
      for (const c of [ruler.a, ruler.b]) {
        ctx.fillStyle = '#D4A017'
        ctx.beginPath()
        ctx.arc(cx(c), cy(c), Math.max(3, scale * 0.15), 0, Math.PI * 2)
        ctx.fill()
      }
    }
    if (hover && tool !== 'pan') {
      ctx.strokeStyle = 'rgba(245,240,232,0.7)'
      ctx.lineWidth = 1.5
      ctx.strokeRect(hover.x * scale + 1, hover.y * scale + 1, scale - 2, scale - 2)
    }
  }

  const status = ruler && (ruler.a.x !== ruler.b.x || ruler.a.y !== ruler.b.y)
    ? t('gm.rulerReading', {
        squares: gridDistance(ruler.a, ruler.b),
        meters: distanceMeters(ruler.a, ruler.b).toLocaleString(i18n.language),
      })
    : hover
      ? t('gm.cellReading', { x: hover.x + 1, y: hover.y + 1, terrain: t(`gm.terrains.${terrainOf(cellAt({ ...map, cells }, hover)).id}`) })
      : t('gm.mapSize', { w: map.width, h: map.height })

  const iconButton = (active: boolean) =>
    `inline-flex items-center gap-1.5 rounded-[9px] px-2.5 py-2 text-[12px] font-semibold border cursor-pointer transition-colors ${
      active ? 'bg-[#D4A017] text-[#131110] border-[#D4A017]' : 'bg-white/5 text-[#E8DFD0] border-white/[0.1] hover:bg-white/10'
    }`

  return (
    <div className="h-[100dvh] flex flex-col bg-[#131110] font-[Manrope,system-ui]">
      <GmHeader
        backTo={`/mestre/campanha/${campaign.id}?aba=mapas`}
        title={
          <input
            value={map.name}
            onChange={e => renameMap(map.id, e.target.value)}
            aria-label={t('gm.mapName')}
            placeholder={t('gm.untitledMap')}
            className="w-full bg-transparent border-0 border-b border-transparent focus:border-[#D4A017] text-[15px] font-extrabold text-[#E8DFD0] placeholder:text-[#A8A09B] focus:outline-none"
          />
        }
        actions={
          <>
            <button onClick={undo} disabled={past.length === 0} aria-label={t('gm.undo')} className={gmSecondaryButton}>↶</button>
            <button onClick={redo} disabled={future.length === 0} aria-label={t('gm.redo')} className={gmSecondaryButton}>↷</button>
            <button
              onClick={() => {
                setSize({ w: map.width, h: map.height })
                setSizeOpen(true)
              }}
              className={gmSecondaryButton}
            >
              {t('gm.mapSettings')}
            </button>
          </>
        }
      />

      <div className="flex flex-col gap-2 px-3 sm:px-6 pt-3">
        <div role="toolbar" aria-label={t('gm.tool')} className="flex flex-wrap gap-1.5">
          {TOOLS.map(tl => (
            <button
              key={tl.id}
              data-testid={`ferramenta-${tl.id}`}
              aria-pressed={tool === tl.id}
              onClick={() => {
                setTool(tl.id)
                if (tl.id !== 'ruler') setRuler(null)
              }}
              className={iconButton(tool === tl.id)}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={tl.icon} /></svg>
              <span className="hidden sm:inline">{t(tl.key)}</span>
              <span className="sr-only sm:hidden">{t(tl.key)}</span>
            </button>
          ))}
        </div>
        <div role="radiogroup" aria-label={t('gm.terrain')} className="flex gap-1.5 overflow-x-auto pb-1">
          {TERRAINS.filter(tr => tr.code !== TERRAIN_VOID).map(tr => {
            const style = TERRAIN_STYLE[tr.id]
            const active = terrain === tr.code
            return (
              <button
                key={tr.code}
                role="radio"
                aria-checked={active}
                data-testid={`terreno-${tr.id}`}
                onClick={() => {
                  setTerrain(tr.code)
                  if (tool !== 'brush' && tool !== 'rect' && tool !== 'fill') setTool('brush')
                }}
                className={`flex-shrink-0 inline-flex items-center gap-1.5 rounded-[9px] pl-1.5 pr-2.5 py-1.5 text-[12px] font-semibold border cursor-pointer ${
                  active ? 'border-[#D4A017] text-[#F5F0E8] bg-white/[0.06]' : 'border-white/[0.1] text-[#A8A09B] hover:text-[#E8DFD0]'
                }`}
              >
                <span
                  className="w-5 h-5 rounded-[5px] flex items-center justify-center text-[11px] border border-black/30"
                  style={{ background: style.fill, color: style.glyphColor }}
                  aria-hidden="true"
                >
                  {style.glyph}
                </span>
                {t(`gm.terrains.${tr.id}`)}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex-1 min-h-[280px] px-3 sm:px-6 py-2">
        <MapCanvas
          width={map.width}
          height={map.height}
          cells={cells}
          labels={map.labels}
          panMode={tool === 'pan'}
          onCellDown={handleDown}
          onCellMove={handleMove}
          onCellUp={handleUp}
          onCellCancel={handleCancel}
          onHover={setHover}
          drawOverlay={drawOverlay}
        />
      </div>
      <p className="px-3 sm:px-6 pb-3 text-[12px] text-[#A8A09B] tabular-nums" aria-live="polite">{status}</p>

      <Modal open={sizeOpen} onClose={() => setSizeOpen(false)} title={t('gm.mapSettings')}>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <NumberField label={t('gm.width')} value={size.w} min={MAP_MIN_SIZE} max={MAP_MAX_SIZE} onChange={w => setSize(s => ({ ...s, w: w ?? s.w }))} />
            <NumberField label={t('gm.height')} value={size.h} min={MAP_MIN_SIZE} max={MAP_MAX_SIZE} onChange={h => setSize(s => ({ ...s, h: h ?? s.h }))} />
          </div>
          <button onClick={applySize} className={gmPrimaryButton}>{t('gm.apply')}</button>
        </div>
      </Modal>
    </div>
  )
}
