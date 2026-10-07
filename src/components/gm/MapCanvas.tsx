import { useCallback, useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { MapLabel } from '../../types'
import { terrainOf, type Cell } from '../../lib/gm/terrain'
import { TERRAIN_STYLE } from './terrainStyle'

const MIN_CELL_PX = 6
const MAX_CELL_PX = 96
const GLYPH_MIN_PX = 16
const GRID_MIN_PX = 8

interface View {
  /** Pixels (CSS) por casa. */
  scale: number
  ox: number
  oy: number
}

interface MapCanvasProps {
  width: number
  height: number
  cells: string
  labels: MapLabel[]
  /** Arrastar com um dedo move o mapa em vez de desenhar. */
  panMode?: boolean
  onCellDown?: (cell: Cell) => void
  onCellMove?: (cell: Cell) => void
  onCellUp?: (cell: Cell) => void
  /** Um segundo dedo virou pinça: o traço em andamento deve ser descartado. */
  onCellCancel?: () => void
  onHover?: (cell: Cell | null) => void
  /** Desenho extra por cima da grade (prévias, régua, tokens), em coordenadas de casa × `scale`. */
  drawOverlay?: (ctx: CanvasRenderingContext2D, scale: number) => void
  children?: ReactNode
}

/**
 * Canvas da grade com zoom e arraste — roda do mouse, botões e pinça. Não sabe
 * de ferramentas: só converte ponteiro em casa e avisa quem usa.
 */
export function MapCanvas({
  width, height, cells, labels, panMode, onCellDown, onCellMove, onCellUp, onCellCancel, onHover, drawOverlay, children,
}: MapCanvasProps) {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const view = useRef<View>({ scale: 24, ox: 0, oy: 0 })
  const fitted = useRef(false)
  const frame = useRef<number | null>(null)

  // Props mais recentes para o desenho agendado e os handlers de ponteiro.
  const latest = useRef({ width, height, cells, labels, drawOverlay, panMode, onCellDown, onCellMove, onCellUp, onCellCancel, onHover })
  useLayoutEffect(() => {
    latest.current = { width, height, cells, labels, drawOverlay, panMode, onCellDown, onCellMove, onCellUp, onCellCancel, onHover }
  })

  const draw = useCallback(() => {
    frame.current = null
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const { width: w, height: h, cells: grid, labels: marks, drawOverlay: overlay } = latest.current
    const { scale, ox, oy } = view.current
    const dpr = window.devicePixelRatio || 1
    const cw = canvas.clientWidth
    const ch = canvas.clientHeight

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.fillStyle = '#131110'
    ctx.fillRect(0, 0, cw, ch)
    ctx.translate(ox, oy)

    const x0 = Math.max(0, Math.floor(-ox / scale))
    const y0 = Math.max(0, Math.floor(-oy / scale))
    const x1 = Math.min(w, Math.ceil((cw - ox) / scale))
    const y1 = Math.min(h, Math.ceil((ch - oy) / scale))

    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        ctx.fillStyle = TERRAIN_STYLE[terrainOf(grid[y * w + x]).id].fill
        ctx.fillRect(x * scale, y * scale, scale, scale)
      }
    }

    if (scale >= GLYPH_MIN_PX) {
      ctx.font = `${Math.round(scale * 0.55)}px system-ui, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const style = TERRAIN_STYLE[terrainOf(grid[y * w + x]).id]
          if (!style.glyph) continue
          ctx.fillStyle = style.glyphColor
          ctx.fillText(style.glyph, x * scale + scale / 2, y * scale + scale / 2)
        }
      }
    }

    if (scale >= GRID_MIN_PX) {
      ctx.strokeStyle = 'rgba(255,255,255,0.08)'
      ctx.lineWidth = 1
      ctx.beginPath()
      for (let x = x0; x <= x1; x++) {
        ctx.moveTo(x * scale + 0.5, y0 * scale)
        ctx.lineTo(x * scale + 0.5, y1 * scale)
      }
      for (let y = y0; y <= y1; y++) {
        ctx.moveTo(x0 * scale, y * scale + 0.5)
        ctx.lineTo(x1 * scale, y * scale + 0.5)
      }
      ctx.stroke()
    }
    ctx.strokeStyle = 'rgba(212,160,23,0.45)'
    ctx.strokeRect(0, 0, w * scale, h * scale)

    if (marks.length > 0) {
      const size = Math.max(10, Math.min(16, scale * 0.45))
      ctx.font = `600 ${size}px Manrope, system-ui, sans-serif`
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      for (const label of marks) {
        const tx = label.x * scale + 3
        const ty = label.y * scale + scale / 2
        const tw = ctx.measureText(label.text).width
        ctx.fillStyle = 'rgba(19,17,16,0.85)'
        ctx.fillRect(tx - 3, ty - size * 0.75, tw + 6, size * 1.5)
        ctx.fillStyle = '#F5F0E8'
        ctx.fillText(label.text, tx, ty)
      }
    }

    overlay?.(ctx, scale)
  }, [])

  const schedule = useCallback(() => {
    if (frame.current == null) frame.current = requestAnimationFrame(draw)
  }, [draw])

  const fit = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const { width: w, height: h } = latest.current
    const scale = Math.min(MAX_CELL_PX, Math.max(MIN_CELL_PX, Math.floor(Math.min(el.clientWidth / w, el.clientHeight / h))))
    view.current = { scale, ox: (el.clientWidth - w * scale) / 2, oy: (el.clientHeight - h * scale) / 2 }
    schedule()
  }, [schedule])

  const zoomAt = useCallback((factor: number, px: number, py: number) => {
    const v = view.current
    const scale = Math.min(MAX_CELL_PX, Math.max(MIN_CELL_PX, v.scale * factor))
    const k = scale / v.scale
    view.current = { scale, ox: px - (px - v.ox) * k, oy: py - (py - v.oy) * k }
    schedule()
  }, [schedule])

  // Tamanho do canvas acompanha o container (giro de tela, barra de ferramentas que quebra linha).
  useEffect(() => {
    const el = containerRef.current
    const canvas = canvasRef.current
    if (!el || !canvas) return
    const observer = new ResizeObserver(() => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.round(el.clientWidth * dpr)
      canvas.height = Math.round(el.clientHeight * dpr)
      if (!fitted.current && el.clientWidth > 0) {
        fitted.current = true
        fit()
      }
      schedule()
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [fit, schedule])

  // Qualquer mudança de props redesenha (rascunho do traço, prévia, tokens).
  useEffect(schedule)

  // Zera o id junto: sem isso, um cancelamento (StrictMode monta duas vezes)
  // deixaria `frame` preenchido e `schedule` nunca mais pediria quadro.
  useEffect(() => () => {
    if (frame.current != null) cancelAnimationFrame(frame.current)
    frame.current = null
  }, [])

  // Roda do mouse: zoom em torno do cursor. `passive: false` para poder impedir a rolagem da página.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = canvas.getBoundingClientRect()
      zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX - rect.left, e.clientY - rect.top)
    }
    canvas.addEventListener('wheel', onWheel, { passive: false })
    return () => canvas.removeEventListener('wheel', onWheel)
  }, [zoomAt])

  // ── Ponteiros: 1 dedo desenha (ou move, no modo mover), 2 dedos fazem pinça ──
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const gesture = useRef<'none' | 'draw' | 'pan' | 'pinch'>('none')
  const lastCell = useRef<Cell | null>(null)
  const pinchStart = useRef<{ dist: number; cx: number; cy: number } | null>(null)

  function local(e: React.PointerEvent): { x: number; y: number } {
    const rect = canvasRef.current!.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  function toCell(p: { x: number; y: number }): Cell | null {
    const { scale, ox, oy } = view.current
    const cell = { x: Math.floor((p.x - ox) / scale), y: Math.floor((p.y - oy) / scale) }
    const { width: w, height: h } = latest.current
    return cell.x >= 0 && cell.y >= 0 && cell.x < w && cell.y < h ? cell : null
  }

  function pinchInfo() {
    const [a, b] = [...pointers.current.values()]
    return { dist: Math.hypot(a.x - b.x, a.y - b.y), cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 }
  }

  function onPointerDown(e: React.PointerEvent) {
    const p = local(e)
    pointers.current.set(e.pointerId, p)
    try {
      canvasRef.current?.setPointerCapture(e.pointerId)
    } catch {
      // Ponteiro já liberado pelo navegador — o gesto segue sem captura.
    }

    if (pointers.current.size === 2) {
      if (gesture.current === 'draw') latest.current.onCellCancel?.()
      gesture.current = 'pinch'
      pinchStart.current = pinchInfo()
      return
    }
    if (pointers.current.size > 2) return

    if (latest.current.panMode || e.button === 1 || e.button === 2) {
      gesture.current = 'pan'
      return
    }
    const cell = toCell(p)
    if (!cell) {
      gesture.current = 'pan'
      return
    }
    gesture.current = 'draw'
    lastCell.current = cell
    latest.current.onCellDown?.(cell)
  }

  function onPointerMove(e: React.PointerEvent) {
    const p = local(e)
    const prev = pointers.current.get(e.pointerId)
    if (!prev) {
      latest.current.onHover?.(toCell(p))
      return
    }
    pointers.current.set(e.pointerId, p)

    if (gesture.current === 'pinch' && pointers.current.size === 2 && pinchStart.current) {
      const now = pinchInfo()
      const v = view.current
      view.current = { ...v, ox: v.ox + now.cx - pinchStart.current.cx, oy: v.oy + now.cy - pinchStart.current.cy }
      zoomAt(now.dist / pinchStart.current.dist, now.cx, now.cy)
      pinchStart.current = now
      return
    }
    if (gesture.current === 'pan') {
      const v = view.current
      view.current = { ...v, ox: v.ox + p.x - prev.x, oy: v.oy + p.y - prev.y }
      schedule()
      return
    }
    if (gesture.current === 'draw') {
      const cell = toCell(p)
      latest.current.onHover?.(cell)
      if (cell && (cell.x !== lastCell.current?.x || cell.y !== lastCell.current?.y)) {
        lastCell.current = cell
        latest.current.onCellMove?.(cell)
      }
    }
  }

  function onPointerUp(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId)
    if (gesture.current === 'draw' && lastCell.current) latest.current.onCellUp?.(lastCell.current)
    if (pointers.current.size === 0) {
      gesture.current = 'none'
      lastCell.current = null
      pinchStart.current = null
    } else if (gesture.current === 'pinch') {
      // Sobrou um dedo da pinça: ele só move, para não riscar sem querer.
      gesture.current = 'pan'
    }
  }

  function zoomButton(factor: number) {
    const el = containerRef.current
    if (el) zoomAt(factor, el.clientWidth / 2, el.clientHeight / 2)
  }

  const zoomClass =
    'w-9 h-9 flex items-center justify-center rounded-[9px] bg-[#1A1714]/90 border border-white/[0.12] text-[#E8DFD0] text-[18px] font-bold hover:bg-[#2a2420] cursor-pointer'

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden rounded-[11px] border border-white/[0.07]">
      <canvas
        ref={canvasRef}
        data-testid="mapa-canvas"
        className={`absolute inset-0 w-full h-full ${panMode ? 'cursor-grab' : 'cursor-crosshair'}`}
        style={{ touchAction: 'none' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={() => latest.current.onHover?.(null)}
        onContextMenu={e => e.preventDefault()}
      />
      <div className="absolute right-2 bottom-2 flex flex-col gap-1.5">
        <button type="button" onClick={() => zoomButton(1.25)} aria-label={t('gm.zoomIn')} className={zoomClass}>+</button>
        <button type="button" onClick={() => zoomButton(0.8)} aria-label={t('gm.zoomOut')} className={zoomClass}>−</button>
        <button type="button" onClick={fit} aria-label={t('gm.zoomFit')} className={`${zoomClass} text-[13px]`}>⤢</button>
      </div>
      {children}
    </div>
  )
}
