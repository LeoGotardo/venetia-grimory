import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Application, Container, Graphics, GraphicsContext, Texture, TilingSprite } from 'pixi.js'
import type { AreaElement, AreaLayerId, AreaMap, AreaStamp } from '../../../types'
import { stampDef, stampSize, stampSvg } from '../../../data/areaMap/stamps'
import { areaTextureTile } from './areaTextures'
import { rotateHandle, stampCorners, GIZMO_HANDLE_PX, type Point } from '../../../lib/gm/areaMap/geometry'
import { fitView, panBy, screenToWorld, zoomAt, type View } from '../../../lib/gm/areaMap/viewport'

/** Resolução do ladrilho do fundo (px por unidade de mundo). */
const TILE_RESOLUTION = 2
const GOLD = 0xd4a017

export interface StagePointerInfo {
  zoom: number
  shift: boolean
}

interface AreaStageProps {
  map: AreaMap
  selectedId: string | null
  /** Um dedo/mouse arrasta o mapa em vez de usar a ferramenta. */
  panMode: boolean
  /** Stamp que segue o ponteiro enquanto a ferramenta de colocar está ativa. */
  ghostAsset: string | null
  /** Devolve `false` quando o toque não interessa à ferramenta: o gesto vira arraste do mapa. */
  onDown: (world: Point, info: StagePointerInfo) => boolean
  onMove: (world: Point, info: StagePointerInfo) => void
  onUp: (world: Point) => void
  /** Um segundo dedo virou pinça: o gesto em andamento deve ser descartado. */
  onCancel: () => void
}

// Um `GraphicsContext` por asset, compartilhado por todos os stamps iguais: o SVG
// é lido uma vez e cada instância só guarda a transformação.
const contexts = new Map<string, GraphicsContext>()

function assetContext(asset: string): GraphicsContext {
  let ctx = contexts.get(asset)
  if (ctx) return ctx
  const def = stampDef(asset)
  if (def) {
    ctx = new GraphicsContext().svg(stampSvg(def))
  } else {
    // Asset que saiu do catálogo: marcador tracejado no lugar, para o mestre achar e trocar.
    const { w, h } = stampSize(asset)
    ctx = new GraphicsContext()
      .rect(0, 0, w, h).fill({ color: 0x6e2620, alpha: 0.35 }).stroke({ color: 0xffd2c8, width: 2 })
      .moveTo(w * 0.3, h * 0.3).lineTo(w * 0.7, h * 0.7).moveTo(w * 0.7, h * 0.3).lineTo(w * 0.3, h * 0.7)
      .stroke({ color: 0xffd2c8, width: 2 })
  }
  contexts.set(asset, ctx)
  return ctx
}

function applyStamp(node: Graphics, el: AreaStamp) {
  const { w, h } = stampSize(el.asset)
  node.pivot.set(w / 2, h / 2)
  node.position.set(el.x, el.y)
  node.angle = el.rotation
  node.scale.set(el.flip ? -el.scale : el.scale, el.scale)
  node.alpha = el.opacity
}

interface Scene {
  app: Application
  world: Container
  background: TilingSprite
  frame: Graphics
  layers: Map<AreaLayerId, Container>
  nodes: Map<string, { el: AreaElement; node: Graphics }>
  overlay: Graphics
  ghost: Graphics
  texture: string
}

/**
 * Palco do mapa de área (PixiJS). Não conhece ferramentas: converte ponteiro em
 * coordenada de mundo e avisa quem usa; o pan/zoom (roda, botões, pinça) é dele.
 * Desenha sob demanda — sem loop contínuo, para não gastar bateria no tablet.
 */
export function AreaStage({ map, selectedId, panMode, ghostAsset, onDown, onMove, onUp, onCancel }: AreaStageProps) {
  const { t } = useTranslation()
  const hostRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<Scene | null>(null)
  const view = useRef<View>({ zoom: 1, x: 0, y: 0 })
  const fittedFor = useRef<string | null>(null)
  const frame = useRef<number | null>(null)
  const hover = useRef<Point | null>(null)

  const latest = useRef({ map, selectedId, panMode, ghostAsset, onDown, onMove, onUp, onCancel })
  useLayoutEffect(() => {
    latest.current = { map, selectedId, panMode, ghostAsset, onDown, onMove, onUp, onCancel }
  })

  const drawOverlay = useCallback(() => {
    const scene = sceneRef.current
    if (!scene) return
    const { map: m, selectedId: sel, ghostAsset: ghostId } = latest.current
    const zoom = view.current.zoom
    const o = scene.overlay
    o.clear()

    const el = sel ? m.elements.find(e => e.id === sel) : undefined
    if (el?.kind === 'stamp') {
      const size = stampSize(el.asset)
      const corners = stampCorners(el, size)
      const px = 1 / zoom
      o.poly(corners.flatMap(c => [c.x, c.y])).stroke({ color: GOLD, width: 2 * px, alpha: 0.95 })
      const handle = rotateHandle(el, size, zoom)
      const top = { x: (corners[0].x + corners[1].x) / 2, y: (corners[0].y + corners[1].y) / 2 }
      o.moveTo(top.x, top.y).lineTo(handle.x, handle.y).stroke({ color: GOLD, width: 1.5 * px })
      const r = (GIZMO_HANDLE_PX * 0.55) * px
      o.circle(handle.x, handle.y, r).fill({ color: 0x1a1714 }).stroke({ color: GOLD, width: 2 * px })
      for (const c of corners) {
        o.rect(c.x - r * 0.8, c.y - r * 0.8, r * 1.6, r * 1.6).fill({ color: GOLD }).stroke({ color: 0x1a1714, width: 1.5 * px })
      }
    }

    const g = scene.ghost
    if (ghostId && hover.current && !latest.current.panMode) {
      const ctx = assetContext(ghostId)
      if (g.context !== ctx) g.context = ctx
      const { w, h } = stampSize(ghostId)
      g.pivot.set(w / 2, h / 2)
      g.position.set(hover.current.x, hover.current.y)
      g.visible = true
    } else {
      g.visible = false
    }
  }, [])

  const render = useCallback(() => {
    frame.current = null
    const scene = sceneRef.current
    if (!scene) return
    const v = view.current
    scene.world.position.set(v.x, v.y)
    scene.world.scale.set(v.zoom)
    drawOverlay()
    scene.app.render()
  }, [drawOverlay])

  const schedule = useCallback(() => {
    if (frame.current == null) frame.current = requestAnimationFrame(render)
  }, [render])

  /** Sincroniza camadas e elementos com o mapa, recriando só o que mudou de referência. */
  const sync = useCallback(() => {
    const scene = sceneRef.current
    if (!scene) return
    const m = latest.current.map

    if (scene.texture !== m.background.texture) {
      scene.texture = m.background.texture
      scene.background.texture = Texture.from(areaTextureTile(m.background.texture, TILE_RESOLUTION))
    }
    scene.background.width = m.width
    scene.background.height = m.height
    scene.frame.clear().rect(0, 0, m.width, m.height).stroke({ color: 0x000000, width: 3, alpha: 0.6 })

    m.layers.forEach((layer, i) => {
      const c = scene.layers.get(layer.id)
      if (!c) return
      c.zIndex = i
      c.visible = layer.visible
      c.alpha = layer.opacity
    })

    const alive = new Set<string>()
    m.elements.forEach((el, i) => {
      alive.add(el.id)
      const existing = scene.nodes.get(el.id)
      let node = existing?.node
      if (!node) {
        node = new Graphics(assetContext(el.asset))
        scene.nodes.set(el.id, { el, node })
      } else if (existing!.el !== el) {
        const ctx = assetContext(el.asset)
        if (node.context !== ctx) node.context = ctx
        existing!.el = el
      }
      const parent = scene.layers.get(el.layer)!
      if (node.parent !== parent) parent.addChild(node)
      node.zIndex = i
      applyStamp(node, el)
    })
    for (const [id, entry] of scene.nodes) {
      if (alive.has(id)) continue
      entry.node.destroy()
      scene.nodes.delete(id)
    }
    schedule()
  }, [schedule])

  const fit = useCallback(() => {
    const host = hostRef.current
    if (!host) return
    const m = latest.current.map
    view.current = fitView(m.width, m.height, host.clientWidth, host.clientHeight)
    schedule()
  }, [schedule])

  // Monta o Pixi uma vez. O init é assíncrono: se o componente desmontar antes
  // (StrictMode monta duas vezes), a app é destruída assim que terminar.
  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    let cancelled = false
    const app = new Application()
    let observer: ResizeObserver | null = null

    void app.init({
      width: Math.max(1, host.clientWidth),
      height: Math.max(1, host.clientHeight),
      background: 0x131110,
      antialias: true,
      autoStart: false,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    }).then(() => {
      if (cancelled) {
        app.destroy(true, { children: true })
        return
      }
      app.ticker.stop()
      app.canvas.style.position = 'absolute'
      app.canvas.style.inset = '0'
      app.canvas.dataset.testid = 'area-canvas'
      host.prepend(app.canvas)

      const world = new Container()
      world.sortableChildren = true
      const background = new TilingSprite({ texture: Texture.WHITE, width: 1, height: 1 })
      background.tileScale.set(1 / TILE_RESOLUTION)
      background.zIndex = -2
      const frameG = new Graphics()
      frameG.zIndex = -1
      world.addChild(background, frameG)
      const layers = new Map<AreaLayerId, Container>()
      for (const layer of latest.current.map.layers) {
        const c = new Container()
        c.sortableChildren = true
        layers.set(layer.id, c)
        world.addChild(c)
      }
      const ghost = new Graphics()
      ghost.alpha = 0.55
      ghost.zIndex = 1000
      const overlay = new Graphics()
      overlay.zIndex = 1001
      world.addChild(ghost, overlay)
      app.stage.addChild(world)

      sceneRef.current = { app, world, background, frame: frameG, layers, nodes: new Map(), overlay, ghost, texture: '' }
      sync()

      let last = { w: host.clientWidth, h: host.clientHeight }
      observer = new ResizeObserver(() => {
        const w = host.clientWidth
        const h = host.clientHeight
        if (w === 0 || h === 0) return
        app.renderer.resize(w, h)
        if (fittedFor.current !== latest.current.map.id) {
          fittedFor.current = latest.current.map.id
          fit()
        } else {
          // A folha de painéis abriu/fechou ou a tela girou: o centro da vista fica onde estava.
          view.current = panBy(view.current, (w - last.w) / 2, (h - last.h) / 2)
        }
        last = { w, h }
        schedule()
      })
      observer.observe(host)
    })

    return () => {
      cancelled = true
      observer?.disconnect()
      if (frame.current != null) cancelAnimationFrame(frame.current)
      frame.current = null
      if (sceneRef.current) {
        sceneRef.current = null
        app.destroy(true, { children: true })
      }
    }
  }, [sync, fit, schedule])

  useEffect(sync, [map, sync])
  useEffect(schedule, [selectedId, ghostAsset, panMode, schedule])

  // Roda do mouse: zoom em torno do cursor. `passive: false` para impedir a rolagem da página.
  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = host.getBoundingClientRect()
      view.current = zoomAt(view.current, { x: e.clientX - rect.left, y: e.clientY - rect.top }, e.deltaY < 0 ? 1.15 : 1 / 1.15)
      schedule()
    }
    host.addEventListener('wheel', onWheel, { passive: false })
    return () => host.removeEventListener('wheel', onWheel)
  }, [schedule])

  // ── Ponteiros: 1 dedo usa a ferramenta (ou arrasta), 2 dedos fazem pinça ──
  const pointers = useRef(new Map<number, Point>())
  const gesture = useRef<'none' | 'tool' | 'pan' | 'pinch'>('none')
  const pinchStart = useRef<{ dist: number; cx: number; cy: number } | null>(null)

  function local(e: React.PointerEvent): Point {
    const rect = hostRef.current!.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  function info(e: React.PointerEvent): StagePointerInfo {
    return { zoom: view.current.zoom, shift: e.shiftKey }
  }

  function pinchInfo() {
    const [a, b] = [...pointers.current.values()]
    return { dist: Math.hypot(a.x - b.x, a.y - b.y), cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 }
  }

  function onPointerDown(e: React.PointerEvent) {
    const p = local(e)
    pointers.current.set(e.pointerId, p)
    try {
      hostRef.current?.setPointerCapture(e.pointerId)
    } catch {
      // Ponteiro já liberado pelo navegador — o gesto segue sem captura.
    }
    if (pointers.current.size === 2) {
      if (gesture.current === 'tool') latest.current.onCancel()
      gesture.current = 'pinch'
      pinchStart.current = pinchInfo()
      return
    }
    if (pointers.current.size > 2) return
    if (latest.current.panMode || e.button === 1 || e.button === 2) {
      gesture.current = 'pan'
      return
    }
    const world = screenToWorld(view.current, p)
    gesture.current = latest.current.onDown(world, info(e)) ? 'tool' : 'pan'
  }

  function onPointerMove(e: React.PointerEvent) {
    const p = local(e)
    const prev = pointers.current.get(e.pointerId)
    hover.current = screenToWorld(view.current, p)
    if (!prev) {
      if (latest.current.ghostAsset) schedule()
      return
    }
    pointers.current.set(e.pointerId, p)

    if (gesture.current === 'pinch' && pointers.current.size === 2 && pinchStart.current) {
      const now = pinchInfo()
      const panned = panBy(view.current, now.cx - pinchStart.current.cx, now.cy - pinchStart.current.cy)
      view.current = zoomAt(panned, { x: now.cx, y: now.cy }, now.dist / pinchStart.current.dist)
      pinchStart.current = now
      schedule()
      return
    }
    if (gesture.current === 'pan') {
      view.current = panBy(view.current, p.x - prev.x, p.y - prev.y)
      schedule()
      return
    }
    if (gesture.current === 'tool') latest.current.onMove(hover.current, info(e))
  }

  function onPointerUp(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId)
    if (gesture.current === 'tool') latest.current.onUp(screenToWorld(view.current, local(e)))
    if (pointers.current.size === 0) {
      gesture.current = 'none'
      pinchStart.current = null
    } else if (gesture.current === 'pinch') {
      // Sobrou um dedo da pinça: ele só arrasta, para não mexer em nada sem querer.
      gesture.current = 'pan'
    }
  }

  function zoomButton(factor: number) {
    const host = hostRef.current
    if (!host) return
    view.current = zoomAt(view.current, { x: host.clientWidth / 2, y: host.clientHeight / 2 }, factor)
    schedule()
  }

  const zoomClass =
    'w-10 h-10 flex items-center justify-center rounded-[10px] bg-[#1A1714]/90 border border-white/[0.12] text-[#E8DFD0] text-[18px] font-bold hover:bg-[#2a2420] cursor-pointer'

  return (
    <div className="relative w-full h-full overflow-hidden rounded-[11px] border border-white/[0.07] bg-[#131110]">
      <div
        ref={hostRef}
        className={`absolute inset-0 ${panMode ? 'cursor-grab' : ghostAsset ? 'cursor-copy' : 'cursor-default'}`}
        style={{ touchAction: 'none' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={() => {
          hover.current = null
          if (latest.current.ghostAsset) schedule()
        }}
        onContextMenu={e => e.preventDefault()}
      />
      <div className="absolute right-2 bottom-2 flex flex-col gap-1.5">
        <button type="button" onClick={() => zoomButton(1.25)} aria-label={t('gm.zoomIn')} className={zoomClass}>+</button>
        <button type="button" onClick={() => zoomButton(0.8)} aria-label={t('gm.zoomOut')} className={zoomClass}>−</button>
        <button type="button" onClick={fit} aria-label={t('gm.zoomFit')} className={`${zoomClass} text-[13px]`}>⤢</button>
      </div>
    </div>
  )
}
