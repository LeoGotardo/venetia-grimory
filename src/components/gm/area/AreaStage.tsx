import { useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, type Ref } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AlphaFilter, Application, BlurFilter, Container, Graphics, GraphicsContext, Rectangle, Text, Texture, TilingSprite,
} from 'pixi.js'
import type { AreaElement, AreaIcon, AreaLayerId, AreaMap, AreaStamp } from '../../../types'
import { stampDef, stampSize, stampSvg } from '../../../data/areaMap/stamps'
import { ICON_VIEWBOX, iconDef, iconSvg } from '../../../data/areaMap/icons'
import { hexCenters, hexCorners } from '../../../lib/gm/areaMap/grid'
import { AREA_EXPORT_MAX_PX } from '../../../constants'
import { areaTextureTile } from './areaTextures'
import { TILE_RESOLUTION, applyLabel, drawPaint, drawPath, drawRegion, labelStyle } from './areaStyles'
import {
  boxCorners, canRotate, elementBounds, elementBox, rotateHandle, GIZMO_HANDLE_PX, type Point,
} from '../../../lib/gm/areaMap/geometry'
import { fitView, panBy, screenToWorld, zoomAt, type View } from '../../../lib/gm/areaMap/viewport'

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
  /** Círculo do pincel/borracha seguindo o ponteiro, em unidades de mundo. */
  brushSize: number | null
  /** Devolve `false` quando o toque não interessa à ferramenta: o gesto vira arraste do mapa. */
  onDown: (world: Point, info: StagePointerInfo) => boolean
  onMove: (world: Point, info: StagePointerInfo) => void
  onUp: (world: Point) => void
  /** Um segundo dedo virou pinça: o gesto em andamento deve ser descartado. */
  onCancel: () => void
  /** Exportação em imagem e miniatura (precisam do renderer). */
  apiRef?: Ref<AreaStageApi>
}

export interface CaptureOptions {
  /** Pixels por unidade de mundo (limitado por `AREA_EXPORT_MAX_PX`). */
  scale: number
  labels: boolean
  grid: boolean
}

export interface AreaStageApi {
  /** O mapa inteiro, sem seleção nem prévia, num canvas. `null` se o palco ainda não montou. */
  capture: (options: CaptureOptions) => HTMLCanvasElement | null
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

/** Stamp = contêiner com o desenho e, se houver efeito, uma cópia borrada por trás. */
interface StampNode extends Container {
  main: Graphics
  fx: Graphics | null
}

const GLOW_COLOR = 0xc8b6ff

function applyStamp(node: StampNode, el: AreaStamp) {
  const ctx = assetContext(el.asset)
  if (node.main.context !== ctx) node.main.context = ctx
  const { w, h } = stampSize(el.asset)
  node.pivot.set(w / 2, h / 2)
  node.position.set(el.x, el.y)
  node.angle = el.rotation
  node.scale.set(el.flip ? -el.scale : el.scale, el.scale)
  node.alpha = el.opacity

  if (!el.effect) {
    if (node.fx) {
      node.fx.destroy()
      node.fx = null
    }
    return
  }
  if (!node.fx) {
    node.fx = new Graphics(ctx)
    node.addChildAt(node.fx, 0)
  }
  const fx = node.fx
  if (fx.context !== ctx) fx.context = ctx
  if (el.effect === 'shadow') {
    // Sombra projetada para baixo e à direita (luz vindo de cima à esquerda, como nas texturas).
    fx.tint = 0x000000
    fx.alpha = 0.4
    fx.scale.set(1)
    fx.position.set(w * 0.06, h * 0.08)
    fx.filters = [new BlurFilter({ strength: 3, quality: 2 })]
  } else {
    fx.tint = GLOW_COLOR
    fx.alpha = 0.85
    fx.scale.set(1.12)
    fx.position.set(-w * 0.06, -h * 0.06)
    fx.filters = [new BlurFilter({ strength: 10, quality: 3 })]
  }
}

// Glifo de cada ícone em branco, compartilhado; a cor vem do `tint` da instância.
const iconContexts = new Map<string, GraphicsContext>()

function iconContext(icon: string): GraphicsContext {
  let ctx = iconContexts.get(icon)
  if (ctx) return ctx
  const def = iconDef(icon)
  ctx = def
    ? new GraphicsContext().svg(iconSvg(def, '#ffffff'))
    : new GraphicsContext().circle(ICON_VIEWBOX / 2, ICON_VIEWBOX / 2, ICON_VIEWBOX * 0.3).fill({ color: 0xffffff })
  iconContexts.set(icon, ctx)
  return ctx
}

interface IconNode extends Container {
  badge: Graphics
  glyph: Graphics
}

const hexColor = (c: string) => Number.parseInt(c.slice(1), 16)

function applyIcon(node: IconNode, el: AreaIcon) {
  node.position.set(el.x, el.y)
  const r = el.size / 2
  node.badge.clear()
  node.badge.visible = el.badge
  if (el.badge) {
    node.badge.circle(0, 0, r).fill({ color: 0x1a1714, alpha: 0.88 }).stroke({ color: hexColor(el.color), width: Math.max(1.5, r * 0.09) })
  }
  const ctx = iconContext(el.icon)
  if (node.glyph.context !== ctx) node.glyph.context = ctx
  const glyphSize = el.badge ? el.size * 0.6 : el.size
  node.glyph.scale.set(glyphSize / ICON_VIEWBOX)
  node.glyph.position.set(-glyphSize / 2, -glyphSize / 2)
  node.glyph.tint = hexColor(el.color)
}

function createNode(el: AreaElement, textResolution: number): Container {
  if (el.kind === 'stamp') {
    const node = new Container() as StampNode
    node.main = new Graphics(assetContext(el.asset))
    node.fx = null
    node.addChild(node.main)
    return node
  }
  if (el.kind === 'icon') {
    const node = new Container() as IconNode
    node.badge = new Graphics()
    node.glyph = new Graphics(iconContext(el.icon))
    node.addChild(node.badge, node.glyph)
    return node
  }
  if (el.kind === 'label') return new Text({ text: '', resolution: textResolution })
  return new Graphics()
}

function updateNode(node: Container, el: AreaElement) {
  switch (el.kind) {
    case 'stamp': return applyStamp(node as StampNode, el)
    case 'icon': return applyIcon(node as IconNode, el)
    case 'paint': return drawPaint(node as Graphics, el)
    case 'region': return drawRegion(node as Graphics, el)
    case 'path': return drawPath(node as Graphics, el)
    case 'label': return applyLabel(node as Text, el)
  }
}

/**
 * Resolução dos textos pelo zoom (potências de 2 até 4×): o Pixi rasteriza o
 * texto, e sem isso o nome da cidade borra quando o mestre aproxima.
 */
function textResolutionFor(zoom: number): number {
  const target = zoom * (window.devicePixelRatio || 1)
  return Math.min(4, Math.max(1, 2 ** Math.ceil(Math.log2(Math.max(target, 1)))))
}

/**
 * Põe (ou tira) um filtro neutro no grupo de tinta: com ele o grupo é desenhado
 * numa textura à parte, e o blend `erase` da borracha só apaga tinta — sem ele
 * apagaria o fundo também.
 */
function isolatePaint(group: Container, on: boolean) {
  if (on === !!group.filters?.length) return
  // AlphaFilter com alpha 1 em vez de PassthroughFilter: o deste Pixi (8.22) quebra ao montar o shader WGSL.
  group.filters = on ? [new AlphaFilter({ alpha: 1 })] : []
}

/**
 * Grade só de alinhamento, logo abaixo da camada de textos. Linhas de 1 px de
 * tela (`pixelLine`), qualquer que seja o zoom.
 */
function drawGrid(scene: Scene, m: AreaMap) {
  const labelsIdx = m.layers.findIndex(l => l.id === 'labels')
  scene.grid.zIndex = (labelsIdx < 0 ? m.layers.length : labelsIdx) - 0.5
  scene.grid.alpha = m.grid.opacity
  const key = `${m.grid.kind}:${m.grid.size}:${m.width}:${m.height}`
  if (key === scene.gridKey) return
  scene.gridKey = key
  const g = scene.grid
  g.clear()
  if (m.grid.kind === 'square') {
    for (let x = 0; x <= m.width; x += m.grid.size) g.moveTo(x, 0).lineTo(x, m.height)
    for (let y = 0; y <= m.height; y += m.grid.size) g.moveTo(0, y).lineTo(m.width, y)
    g.stroke({ color: 0x131110, pixelLine: true })
  } else if (m.grid.kind === 'hex') {
    for (const c of hexCenters(m.width, m.height, m.grid.size)) g.poly(hexCorners(c, m.grid.size), true)
    g.stroke({ color: 0x131110, pixelLine: true })
  }
  // Os hexágonos passam da borda: a máscara corta no retângulo do mapa.
  if (!g.mask) {
    const mask = new Graphics()
    g.parent?.addChild(mask)
    g.mask = mask
  }
  ;(g.mask as Graphics).clear().rect(0, 0, m.width, m.height).fill({ color: 0xffffff })
}

interface LayerNodes {
  root: Container
  /** Pinceladas da camada. Ganha um filtro quando há borracha, para o `erase` só apagar tinta. */
  paint: Container
}

interface Scene {
  app: Application
  world: Container
  background: TilingSprite
  frame: Graphics
  layers: Map<AreaLayerId, LayerNodes>
  nodes: Map<string, { el: AreaElement; node: Container }>
  overlay: Graphics
  ghost: Graphics
  grid: Graphics
  /** Chave do que a grade desenhou por último (tipo, tamanho, mapa) — redesenha só quando muda. */
  gridKey: string
  texture: string
  textResolution: number
}

/**
 * Palco do mapa de área (PixiJS). Não conhece ferramentas: converte ponteiro em
 * coordenada de mundo e avisa quem usa; o pan/zoom (roda, botões, pinça) é dele.
 * Desenha sob demanda — sem loop contínuo, para não gastar bateria no tablet.
 */
export function AreaStage({ map, selectedId, panMode, ghostAsset, brushSize, onDown, onMove, onUp, onCancel, apiRef }: AreaStageProps) {
  const { t } = useTranslation()
  const hostRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<Scene | null>(null)
  const view = useRef<View>({ zoom: 1, x: 0, y: 0 })
  const fittedFor = useRef<string | null>(null)
  const frame = useRef<number | null>(null)
  const hover = useRef<Point | null>(null)

  const latest = useRef({ map, selectedId, panMode, ghostAsset, brushSize, onDown, onMove, onUp, onCancel })
  useLayoutEffect(() => {
    latest.current = { map, selectedId, panMode, ghostAsset, brushSize, onDown, onMove, onUp, onCancel }
  })

  const drawOverlay = useCallback(() => {
    const scene = sceneRef.current
    if (!scene) return
    const { map: m, selectedId: sel, ghostAsset: ghostId, brushSize: brush, panMode: pan } = latest.current
    const zoom = view.current.zoom
    const px = 1 / zoom
    const o = scene.overlay
    o.clear()

    const el = sel ? m.elements.find(e => e.id === sel) : undefined
    const box = el ? elementBox(el, stampSize) : null
    if (box && el) {
      const corners = boxCorners(box)
      o.poly(corners.flatMap(c => [c.x, c.y])).stroke({ color: GOLD, width: 2 * px, alpha: 0.95 })
      const r = (GIZMO_HANDLE_PX * 0.55) * px
      if (canRotate(el)) {
        const handle = rotateHandle(box, zoom)
        const top = { x: (corners[0].x + corners[1].x) / 2, y: (corners[0].y + corners[1].y) / 2 }
        o.moveTo(top.x, top.y).lineTo(handle.x, handle.y).stroke({ color: GOLD, width: 1.5 * px })
        o.circle(handle.x, handle.y, r).fill({ color: 0x1a1714 }).stroke({ color: GOLD, width: 2 * px })
      }
      for (const c of corners) {
        o.rect(c.x - r * 0.8, c.y - r * 0.8, r * 1.6, r * 1.6).fill({ color: GOLD }).stroke({ color: 0x1a1714, width: 1.5 * px })
      }
    } else if (el) {
      // Linhas e regiões só se movem: caixa simples, sem alças.
      const b = elementBounds(el, stampSize)
      const pad = 4 * px
      o.rect(b.minX - pad, b.minY - pad, b.maxX - b.minX + pad * 2, b.maxY - b.minY + pad * 2)
        .stroke({ color: GOLD, width: 2 * px, alpha: 0.95 })
    }

    if (brush && hover.current && !pan) {
      o.circle(hover.current.x, hover.current.y, brush / 2)
        .stroke({ color: 0xf5f0e8, width: 1.5 * px, alpha: 0.9 })
        .circle(hover.current.x, hover.current.y, brush / 2 + px)
        .stroke({ color: 0x131110, width: 1 * px, alpha: 0.6 })
    }

    const g = scene.ghost
    if (ghostId && hover.current && !pan) {
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
    const res = textResolutionFor(v.zoom)
    if (res !== scene.textResolution) {
      scene.textResolution = res
      for (const { node } of scene.nodes.values()) if (node instanceof Text) node.resolution = res
    }
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

    drawGrid(scene, m)

    m.layers.forEach((layer, i) => {
      const nodes = scene.layers.get(layer.id)
      if (!nodes) return
      nodes.root.zIndex = i
      nodes.root.visible = layer.visible
      nodes.root.alpha = layer.opacity
    })

    const alive = new Set<string>()
    const erasing = new Set<AreaLayerId>()
    m.elements.forEach((el, i) => {
      alive.add(el.id)
      const existing = scene.nodes.get(el.id)
      let node = existing?.node
      if (!node || existing!.el.kind !== el.kind) {
        node?.destroy()
        node = createNode(el, scene.textResolution)
        scene.nodes.set(el.id, { el, node })
        updateNode(node, el)
      } else if (existing!.el !== el) {
        existing!.el = el
        updateNode(node, el)
      }
      const layer = scene.layers.get(el.layer)!
      const parent = el.kind === 'paint' ? layer.paint : layer.root
      if (node.parent !== parent) parent.addChild(node)
      node.zIndex = i
      if (el.kind === 'paint' && el.erase) erasing.add(el.layer)
    })
    for (const [id, entry] of scene.nodes) {
      if (alive.has(id)) continue
      entry.node.destroy()
      scene.nodes.delete(id)
    }
    for (const [id, layer] of scene.layers) {
      isolatePaint(layer.paint, erasing.has(id))
    }
    schedule()
  }, [schedule])

  useImperativeHandle(apiRef, () => ({
    capture: ({ scale, labels, grid }) => {
      const scene = sceneRef.current
      if (!scene) return null
      const m = latest.current.map
      const resolution = Math.max(0.05, Math.min(scale, AREA_EXPORT_MAX_PX / Math.max(m.width, m.height)))
      const labelsRoot = scene.layers.get('labels')?.root
      const labelsLayer = m.layers.find(l => l.id === 'labels')
      const saved = {
        x: scene.world.x, y: scene.world.y, scale: scene.world.scale.x,
        grid: scene.grid.visible, labels: labelsRoot?.visible ?? true, textRes: scene.textResolution,
      }
      // Só o mapa: sem seleção, prévia, moldura; grade e textos conforme o pedido.
      scene.overlay.visible = false
      scene.ghost.visible = false
      scene.frame.visible = false
      scene.grid.visible = grid && m.grid.kind !== 'off'
      if (labelsRoot) labelsRoot.visible = labels && (labelsLayer?.visible ?? true)
      const textRes = Math.min(8, Math.max(1, Math.ceil(resolution * 2)))
      for (const { node } of scene.nodes.values()) if (node instanceof Text) node.resolution = textRes
      scene.world.position.set(0, 0)
      scene.world.scale.set(1)
      try {
        return scene.app.renderer.extract.canvas({
          target: scene.world,
          frame: new Rectangle(0, 0, m.width, m.height),
          resolution,
          clearColor: '#131110',
        }) as HTMLCanvasElement
      } finally {
        scene.world.position.set(saved.x, saved.y)
        scene.world.scale.set(saved.scale)
        scene.overlay.visible = true
        scene.frame.visible = true
        scene.grid.visible = saved.grid
        if (labelsRoot) labelsRoot.visible = saved.labels
        for (const { node } of scene.nodes.values()) if (node instanceof Text) node.resolution = saved.textRes
        schedule()
      }
    },
  }), [schedule])

  /** Fontes carregadas depois do primeiro desenho: os textos são medidos de novo. */
  const refreshLabels = useCallback(() => {
    const scene = sceneRef.current
    if (!scene) return
    for (const { el, node } of scene.nodes.values()) {
      if (el.kind === 'label' && node instanceof Text) node.style = labelStyle(el)
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
      const layers = new Map<AreaLayerId, LayerNodes>()
      for (const layer of latest.current.map.layers) {
        const root = new Container()
        root.sortableChildren = true
        // Tinta sempre por baixo dos outros elementos da camada (é o chão dela).
        const paint = new Container()
        paint.sortableChildren = true
        paint.zIndex = -1
        root.addChild(paint)
        layers.set(layer.id, { root, paint })
        world.addChild(root)
      }
      const grid = new Graphics()
      world.addChild(grid)
      const ghost = new Graphics()
      ghost.alpha = 0.55
      ghost.zIndex = 1000
      const overlay = new Graphics()
      overlay.zIndex = 1001
      world.addChild(ghost, overlay)
      app.stage.addChild(world)

      sceneRef.current = {
        app, world, background, frame: frameG, layers, nodes: new Map(), overlay, ghost, grid, gridKey: '', texture: '', textResolution: 1,
      }
      sync()
      void Promise.all([
        document.fonts?.load('600 32px Cinzel'),
        document.fonts?.load('700 32px Cinzel'),
        document.fonts?.load('italic 600 32px Manrope'),
      ]).then(() => {
        if (!cancelled) refreshLabels()
      }).catch(() => {})

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
  }, [sync, fit, schedule, refreshLabels])

  useEffect(sync, [map, sync])
  useEffect(schedule, [selectedId, ghostAsset, brushSize, panMode, schedule])

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
      if (latest.current.ghostAsset || latest.current.brushSize) schedule()
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
    if (gesture.current === 'tool') {
      latest.current.onMove(hover.current, info(e))
      if (latest.current.brushSize) schedule()
    }
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
        className={`absolute inset-0 ${panMode ? 'cursor-grab' : ghostAsset ? 'cursor-copy' : brushSize ? 'cursor-none' : 'cursor-default'}`}
        style={{ touchAction: 'none' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={() => {
          hover.current = null
          if (latest.current.ghostAsset || latest.current.brushSize) schedule()
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
