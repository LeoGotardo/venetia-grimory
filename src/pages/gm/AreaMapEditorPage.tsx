import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { v4 as uuidv4 } from 'uuid'
import type { AreaElement, AreaGrid, AreaIcon, AreaLabel, AreaLayerId, AreaLayerState, AreaMap, AreaStamp } from '../../types'
import { useAreaMapStore } from '../../store/areaMapStore'
import { GmHeader, gmContainer, gmSecondaryButton } from '../../components/gm/GmHeader'
import { AppFooter } from '../../components/ui/AppFooter'
import { AreaStage, type AreaStageApi, type StagePointerInfo } from '../../components/gm/area/AreaStage'
import { AssetBrowser, type PickedAsset } from '../../components/gm/area/AssetBrowser'
import { ExportDialog, type ExportOptions } from '../../components/gm/area/ExportDialog'
import { LayersPanel } from '../../components/gm/area/LayersPanel'
import { AreaInspector, type ElementPatch } from '../../components/gm/area/AreaInspector'
import { AreaToolOptions, type AreaTool, type ToolSettings } from '../../components/gm/area/AreaToolOptions'
import { PanelLabel, Segmented, Slider, TexturePicker } from '../../components/gm/area/pickers'
import { textureLayer } from '../../components/gm/area/areaStyles'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { stampDef, stampSize } from '../../data/areaMap/stamps'
import { iconDef } from '../../data/areaMap/icons'
import { deliverFile } from '../../lib/deliverFile'
import { NumberField } from '../../components/gm/fields'
import {
  addElements, clampAreaSize, duplicateElements, isEditable, moveLayer, moveToLayer, removeElements, reorderElement,
  setLayer, translateElement, updateElements, type ZMove,
} from '../../lib/gm/areaMap/scene'
import {
  canRotate, elementBox, gizmoHit, hitTest, quantize, resizeToward, rotationToward, type Point,
} from '../../lib/gm/areaMap/geometry'
import { quantizePoints, simplify } from '../../lib/gm/areaMap/shapes'
import { snapToGrid } from '../../lib/gm/areaMap/grid'
import {
  AREA_BRUSH_DEFAULT, AREA_GRID_MAX_SIZE, AREA_GRID_MIN_SIZE, AREA_ICON_COLORS, AREA_ICON_DEFAULT_SIZE,
  AREA_THUMBNAIL_DELAY_MS, AREA_THUMBNAIL_PX, AREA_THUMBNAIL_QUALITY, AREA_EXPORT_JPEG_QUALITY, AREA_LABEL_COLORS, AREA_LABEL_STYLES, AREA_MAP_MAX_SIZE, AREA_MAP_MIN_SIZE, AREA_PATH_STYLES,
  AREA_REGION_COLORS, AREA_REGION_TERRITORY_OPACITY, AREA_SIMPLIFY_PX, AREA_STROKE_STEP_PX, MAP_UNDO_LIMIT,
} from '../../constants'
import { NotFound } from '../NotFound'

type SheetTab = 'tools' | 'assets' | 'layers' | 'props'

/** Deslocamento da cópia ao duplicar, em unidades de mundo. */
const DUPLICATE_OFFSET = 24
/** Passo das setas do teclado (Shift multiplica por 10). */
const NUDGE = 1

const DRAW_TOOLS: readonly AreaTool[] = ['brush', 'erase', 'region', 'path']

interface Drag {
  mode: 'move' | 'rotate' | 'scale'
  id: string
  start: Point
  origin: AreaElement
  moved: boolean
}

/** Traço em andamento (pincel, borracha, região, caminho): o elemento já está no rascunho. */
interface Stroke {
  id: string
  last: Point
  zoom: number
}

const DEFAULT_SETTINGS: ToolSettings = {
  brushTexture: 'forest',
  brushSize: AREA_BRUSH_DEFAULT,
  eraseLayer: 'terrain',
  regionMode: 'textured',
  regionTexture: 'forest',
  regionColor: AREA_REGION_COLORS[0],
  pathStyle: 'dirtRoad',
  pathWidth: AREA_PATH_STYLES.dirtRoad.width,
  labelStyle: 'city',
}

/** `/mestre/campanha/:id/area/:mapId` — editor do mapa de área. */
export function AreaMapEditorPage() {
  const { id, mapId } = useParams<{ id: string; mapId: string }>()
  const { map, openedId, loading, openAreaMap } = useAreaMapStore()

  useEffect(() => {
    if (mapId) void openAreaMap(mapId)
  }, [mapId, openAreaMap])

  if (openedId === mapId && !loading && (!map || map.campaign_id !== id)) return <NotFound />
  if (!map || map.id !== mapId) return null
  return <Editor key={map.id} initial={map} />
}

function Editor({ initial }: { initial: AreaMap }) {
  const { t } = useTranslation()
  const commitToStore = useAreaMapStore(s => s.commitAreaMap)
  const setThumbnail = useAreaMapStore(s => s.setAreaThumbnail)
  const saveFailed = useAreaMapStore(s => s.saveFailed)
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  const [draft, setDraftState] = useState(initial)
  const draftRef = useRef(initial)
  /** Último estado que entrou no desfazer; gestos ao vivo só mexem no rascunho. */
  const committed = useRef(initial)
  const [past, setPast] = useState<AreaMap[]>([])
  const [future, setFuture] = useState<AreaMap[]>([])

  const [tool, setTool] = useState<AreaTool>('select')
  const [asset, setAsset] = useState<PickedAsset | null>(null)
  /** Encaixar na grade ao colocar e mover (só vale com a grade ligada). */
  const [snap, setSnap] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const stageApi = useRef<AreaStageApi>(null)
  const thumbTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [settings, setSettings] = useState<ToolSettings>(DEFAULT_SETTINGS)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  /** Texto recém-criado: o inspector foca o campo para digitar o nome. */
  const [focusLabel, setFocusLabel] = useState<string | null>(null)
  const [sheet, setSheet] = useState<SheetTab | null>('assets')
  const [size, setSize] = useState({ w: initial.width, h: initial.height })
  const drag = useRef<Drag | null>(null)
  const stroke = useRef<Stroke | null>(null)

  const setDraft = useCallback((next: AreaMap) => {
    draftRef.current = next
    setDraftState(next)
  }, [])

  /**
   * Refaz a miniatura da lista um pouco depois da última edição (renderizar o
   * mapa inteiro a cada gesto seria desperdício).
   */
  const scheduleThumbnail = useCallback(() => {
    if (thumbTimer.current) clearTimeout(thumbTimer.current)
    thumbTimer.current = setTimeout(() => {
      thumbTimer.current = null
      const m = draftRef.current
      const canvas = stageApi.current?.capture({ scale: AREA_THUMBNAIL_PX / Math.max(m.width, m.height), labels: true, grid: false })
      if (canvas) setThumbnail(m.id, canvas.toDataURL('image/jpeg', AREA_THUMBNAIL_QUALITY))
    }, AREA_THUMBNAIL_DELAY_MS)
  }, [setThumbnail])

  useEffect(() => {
    // Mapa sem miniatura (criado antes dela existir, ou recém-criado): gera uma ao abrir.
    if (!initial.thumbnail) scheduleThumbnail()
    return () => {
      if (thumbTimer.current) clearTimeout(thumbTimer.current)
    }
  }, [initial.thumbnail, scheduleThumbnail])

  /** Fecha um gesto: o estado anterior vai para o desfazer e o novo para o store. */
  const commit = useCallback((next: AreaMap = draftRef.current) => {
    setDraft(next)
    if (next === committed.current) return
    const prev = committed.current
    committed.current = next
    setPast(p => [...p, prev].slice(-MAP_UNDO_LIMIT))
    setFuture([])
    commitToStore(next)
    scheduleThumbnail()
  }, [commitToStore, setDraft, scheduleThumbnail])

  const restore = useCallback((next: AreaMap) => {
    committed.current = next
    setDraft(next)
    commitToStore(next)
    scheduleThumbnail()
    setSelectedId(s => (s && next.elements.some(e => e.id === s) ? s : null))
  }, [commitToStore, setDraft, scheduleThumbnail])

  // `current` é lido antes de `restore`: o updater do setState roda depois e já veria o estado restaurado.
  const undo = useCallback(() => {
    const prev = past[past.length - 1]
    if (!prev) return
    const current = committed.current
    setPast(past.slice(0, -1))
    setFuture(f => [current, ...f])
    restore(prev)
  }, [past, restore])

  const redo = useCallback(() => {
    const [next, ...rest] = future
    if (!next) return
    const current = committed.current
    setFuture(rest)
    setPast(p => [...p, current])
    restore(next)
  }, [future, restore])

  /** Nome não entra no desfazer: digitar não deve gerar um passo por letra. */
  function rename(name: string) {
    const next = { ...draftRef.current, name }
    committed.current = { ...committed.current, name }
    setDraft(next)
    commitToStore(next)
  }

  const selected = draft.elements.find(e => e.id === selectedId) ?? null

  const updateSelected = useCallback((patch: ElementPatch, live: boolean) => {
    if (!selectedId) return
    const next = updateElements(draftRef.current, [selectedId], el => ({ ...el, ...patch }) as AreaElement)
    if (live) setDraft(next)
    else commit(next)
  }, [selectedId, setDraft, commit])

  const removeSelected = useCallback(() => {
    if (!selectedId) return
    commit(removeElements(draftRef.current, [selectedId]))
    setSelectedId(null)
  }, [selectedId, commit])

  const duplicateSelected = useCallback(() => {
    if (!selectedId) return
    const result = duplicateElements(draftRef.current, [selectedId], DUPLICATE_OFFSET)
    if (result.ids.length === 0) return
    commit(result.map)
    setSelectedId(result.ids[0])
  }, [selectedId, commit])

  const chooseTool = useCallback((next: AreaTool) => {
    setTool(next)
    if (next !== 'place') setAsset(null)
    if (next !== 'select') setSelectedId(null)
  }, [])

  // Atalhos: desfazer/refazer, apagar, duplicar, setas e Esc.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      const mod = e.ctrlKey || e.metaKey
      const key = e.key.toLowerCase()
      if (mod && key === 'z') {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
      } else if (mod && key === 'y') {
        e.preventDefault()
        redo()
      } else if (mod && key === 'd') {
        e.preventDefault()
        duplicateSelected()
      } else if (key === 'delete' || key === 'backspace') {
        if (selectedId) {
          e.preventDefault()
          removeSelected()
        }
      } else if (key === 'escape') {
        setSelectedId(null)
        chooseTool('select')
      } else if (selectedId && key.startsWith('arrow')) {
        e.preventDefault()
        const step = NUDGE * (e.shiftKey ? 10 : 1)
        const dx = key === 'arrowleft' ? -step : key === 'arrowright' ? step : 0
        const dy = key === 'arrowup' ? -step : key === 'arrowdown' ? step : 0
        commit(updateElements(draftRef.current, [selectedId], el => translateElement(el, dx, dy)))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo, duplicateSelected, removeSelected, selectedId, commit, chooseTool])

  function pickAsset(next: PickedAsset | null) {
    setAsset(next)
    setTool(next ? 'place' : 'select')
    if (next) setSelectedId(null)
    // No celular a folha fecha para o toque cair no mapa.
    if (next && !isDesktop) setSheet(null)
  }

  /** Começo de um traço: o elemento novo, com um ponto só, na camada certa para a ferramenta. */
  function startElement(world: Point): AreaElement | null {
    const id = uuidv4()
    const points = [quantize(world.x), quantize(world.y)]
    const s = settings
    switch (tool) {
      case 'brush':
        return { kind: 'paint', id, layer: textureLayer(s.brushTexture), texture: s.brushTexture, size: s.brushSize, points, erase: false }
      case 'erase':
        return { kind: 'paint', id, layer: s.eraseLayer, texture: s.brushTexture, size: s.brushSize, points, erase: true }
      case 'path':
        return { kind: 'path', id, layer: AREA_PATH_STYLES[s.pathStyle].layer, style: s.pathStyle, width: s.pathWidth, points }
      case 'region':
        return s.regionMode === 'textured'
          ? { kind: 'region', id, layer: textureLayer(s.regionTexture), texture: s.regionTexture, color: s.regionColor, border: false, opacity: 1, points }
          : { kind: 'region', id, layer: 'effects', texture: null, color: s.regionColor, border: true, opacity: AREA_REGION_TERRITORY_OPACITY, points }
      default:
        return null
    }
  }

  const insideMap = (m: AreaMap, p: Point) => p.x >= 0 && p.y >= 0 && p.x <= m.width && p.y <= m.height
  const snapping = snap && draft.grid.kind !== 'off'
  const snapPoint = (p: Point): Point => {
    if (!snapping) return { x: quantize(p.x), y: quantize(p.y) }
    const q = snapToGrid(p, draftRef.current.grid)
    return { x: quantize(q.x), y: quantize(q.y) }
  }

  function handleDown(world: Point, info: StagePointerInfo): boolean {
    const m = draftRef.current
    if (tool === 'place' && asset) {
      // Fora do mapa o toque arrasta a vista em vez de largar algo onde não se vê.
      if (!insideMap(m, world)) return false
      const at = snapPoint(world)
      let el: AreaElement
      if (asset.kind === 'stamp') {
        const def = stampDef(asset.id)
        el = {
          kind: 'stamp', id: uuidv4(), layer: def?.layer ?? 'decor', asset: asset.id,
          x: at.x, y: at.y, scale: 1, rotation: 0, flip: false, opacity: 1,
          // Objetos mágicos já entram brilhando.
          ...(def?.category === 'fantasy' ? { effect: 'glow' as const } : {}),
        } satisfies AreaStamp
      } else {
        el = {
          kind: 'icon', id: uuidv4(), layer: 'labels', icon: asset.id,
          x: at.x, y: at.y, size: AREA_ICON_DEFAULT_SIZE, color: AREA_ICON_COLORS[0], badge: true,
        } satisfies AreaIcon
      }
      const next = addElements(m, [el])
      if (next === m) {
        alert(t('gm.areaMap.limitReached'))
        return true
      }
      commit(next)
      return true
    }

    if (DRAW_TOOLS.includes(tool)) {
      if (!insideMap(m, world)) return false
      const el = startElement(world)
      // Camada oculta ou travada não recebe traço: o toque vira arraste.
      if (!el || !isEditable(m, el)) return false
      const next = addElements(m, [el])
      if (next === m) {
        alert(t('gm.areaMap.limitReached'))
        return true
      }
      setDraft(next)
      stroke.current = { id: el.id, last: world, zoom: info.zoom }
      return true
    }

    if (tool === 'label') {
      if (!insideMap(m, world)) return false
      const at = snapPoint(world)
      const label: AreaLabel = {
        kind: 'label', id: uuidv4(), layer: 'labels', text: t('gm.areaMap.newLabel'),
        x: at.x, y: at.y, size: AREA_LABEL_STYLES[settings.labelStyle].size,
        rotation: 0, style: settings.labelStyle, color: AREA_LABEL_COLORS[0],
      }
      const next = addElements(m, [label])
      if (next === m) return true
      commit(next)
      setTool('select')
      setSelectedId(label.id)
      setFocusLabel(label.id)
      if (!isDesktop) setSheet('props')
      return true
    }

    if (tool !== 'select') return false

    const current = selectedId ? m.elements.find(e => e.id === selectedId) : undefined
    const box = current ? elementBox(current, stampSize) : null
    if (current && box) {
      const handle = gizmoHit(box, info.zoom, world, canRotate(current))
      if (handle) {
        drag.current = { mode: handle, id: current.id, start: world, origin: current, moved: false }
        return true
      }
    }
    const hit = hitTest(m, world, stampSize, info.zoom)
    if (!hit) {
      setSelectedId(null)
      return false
    }
    setSelectedId(hit)
    if (!isDesktop && sheet !== null) setSheet('props')
    const el = m.elements.find(e => e.id === hit)!
    drag.current = { mode: 'move', id: hit, start: world, origin: el, moved: false }
    return true
  }

  function handleMove(world: Point, info: StagePointerInfo) {
    const s = stroke.current
    if (s) {
      // Só grava um ponto a cada poucos pixels de tela: o traço não incha com o mouse parado.
      if (Math.hypot(world.x - s.last.x, world.y - s.last.y) < AREA_STROKE_STEP_PX / info.zoom) return
      s.last = world
      setDraft(updateElements(draftRef.current, [s.id], el =>
        'points' in el ? { ...el, points: [...el.points, quantize(world.x), quantize(world.y)] } : el))
      return
    }
    const d = drag.current
    if (!d) return
    d.moved = true
    const o = d.origin
    let next: AreaElement
    if (d.mode === 'move') {
      let dx = world.x - d.start.x
      let dy = world.y - d.start.y
      // Com encaixe, quem tem centro (objeto, texto, ícone) pula de casa em casa.
      if (snapping && 'x' in o) {
        const target = snapToGrid({ x: o.x + dx, y: o.y + dy }, draftRef.current.grid)
        dx = target.x - o.x
        dy = target.y - o.y
      }
      next = translateElement(o, dx, dy)
    } else if (o.kind !== 'stamp' && o.kind !== 'label' && o.kind !== 'icon') return
    else if (d.mode === 'rotate') {
      if (o.kind === 'icon') return
      next = { ...o, rotation: rotationToward(o, world, info.shift ? 15 : 0) }
    } else next = { ...o, ...resizeToward(o, stampSize, world) } as AreaElement
    setDraft(updateElements(draftRef.current, [d.id], () => next))
  }

  function handleUp() {
    const s = stroke.current
    if (s) {
      stroke.current = null
      const el = draftRef.current.elements.find(e => e.id === s.id)
      if (!el || !('points' in el)) return
      const points = quantizePoints(simplify(el.points, AREA_SIMPLIFY_PX / s.zoom))
      const minPoints = el.kind === 'region' ? 3 : el.kind === 'path' ? 2 : 1
      // Toque sem arrastar em caminho/região não vira nada: volta ao que estava.
      if (points.length / 2 < minPoints) {
        setDraft(committed.current)
        return
      }
      commit(updateElements(draftRef.current, [s.id], e => ({ ...e, points }) as AreaElement))
      return
    }
    if (drag.current?.moved) commit()
    drag.current = null
  }

  function handleCancel() {
    if (stroke.current || drag.current?.moved) setDraft(committed.current)
    stroke.current = null
    drag.current = null
  }

  const layerToggle = (layerId: AreaLayerId, patch: Partial<Omit<AreaLayerState, 'id'>>) => {
    commit(setLayer(draftRef.current, layerId, patch))
    if ((patch.visible === false || patch.locked === true) && selected?.layer === layerId) setSelectedId(null)
  }

  const tools: Array<{ id: AreaTool; label: string; icon: ReactNode }> = [
    { id: 'select', label: t('gm.areaMap.toolSelect'), icon: <path d="M5 3l14 8-6 2-3 6z" /> },
    { id: 'pan', label: t('gm.areaMap.toolPan'), icon: <path d="M12 3v18M3 12h18M12 3l-3 3M12 3l3 3M12 21l-3-3M12 21l3-3M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3" /> },
    { id: 'brush', label: t('gm.areaMap.toolBrush'), icon: <path d="M3 21c3 0 5-2 5-5l9-9-4-4-9 9c-3 0-5 2-5 5M14 6l4 4" /> },
    { id: 'erase', label: t('gm.areaMap.toolErase'), icon: <path d="M7 21h10M5 15l8-8 6 6-6 6H9z" /> },
    { id: 'region', label: t('gm.areaMap.toolRegion'), icon: <path d="M5 8c2-4 9-5 12-2s4 9 0 11-12 3-13-2 0-5 1-7z" /> },
    { id: 'path', label: t('gm.areaMap.toolPath'), icon: <path d="M4 20c4-2 2-8 7-9s5-6 9-7" /> },
    { id: 'label', label: t('gm.areaMap.toolLabel'), icon: <path d="M4 7V5h16v2M9 19h6M12 5v14" /> },
  ]

  const toolButtons = (
    <div role="toolbar" aria-label={t('gm.tool')} className="grid grid-cols-4 gap-1.5">
      {tools.map(tl => (
        <button
          key={tl.id}
          type="button"
          aria-pressed={tool === tl.id}
          data-testid={`area-tool-${tl.id}`}
          onClick={() => chooseTool(tl.id)}
          className={`flex flex-col items-center justify-center gap-1 min-h-[54px] rounded-[9px] px-1 text-[11px] font-semibold border cursor-pointer transition-colors ${
            tool === tl.id ? 'bg-[#D4A017] text-[#131110] border-[#D4A017]' : 'bg-white/5 text-[#E8DFD0] border-white/[0.1] hover:bg-white/10'
          }`}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{tl.icon}</svg>
          <span className="leading-tight text-center">{tl.label}</span>
        </button>
      ))}
    </div>
  )

  const toolOptions = (
    <AreaToolOptions tool={tool} settings={settings} onChange={patch => setSettings(s => ({ ...s, ...patch }))} />
  )

  const sizeChanged = size.w !== draft.width || size.h !== draft.height
  const mapSettings = (
    <div className="flex flex-col gap-4">
      <TexturePicker
        label={t('gm.areaMap.background')}
        value={draft.background.texture}
        onPick={tex => commit({ ...draftRef.current, background: { texture: tex } })}
      />
      <div className="flex flex-col gap-3">
        <Segmented<AreaGrid['kind']>
          label={t('gm.areaMap.grid')}
          value={draft.grid.kind}
          options={(['off', 'square', 'hex'] as const).map(k => ({ value: k, label: t(`gm.areaMap.gridKinds.${k}`) }))}
          onPick={kind => commit({ ...draftRef.current, grid: { ...draftRef.current.grid, kind } })}
        />
        {draft.grid.kind !== 'off' && (
          <>
            <Slider
              label={t('gm.areaMap.gridSize')} value={draft.grid.size} display={String(draft.grid.size)}
              min={AREA_GRID_MIN_SIZE} max={Math.min(AREA_GRID_MAX_SIZE, 256)} step={4}
              onChange={size => setDraft({ ...draftRef.current, grid: { ...draftRef.current.grid, size } })}
              onCommit={() => commit()}
            />
            <Slider
              label={t('gm.areaMap.opacity')} value={draft.grid.opacity} display={`${Math.round(draft.grid.opacity * 100)}%`}
              min={0.1} max={1} step={0.05}
              onChange={opacity => setDraft({ ...draftRef.current, grid: { ...draftRef.current.grid, opacity } })}
              onCommit={() => commit()}
            />
            <button type="button" aria-pressed={snap} onClick={() => setSnap(v => !v)} className={gmSecondaryButton}>
              {t(snap ? 'gm.areaMap.snapOn' : 'gm.areaMap.snapOff')}
            </button>
          </>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <PanelLabel>{t('gm.areaMap.mapSize')}</PanelLabel>
        <div className="grid grid-cols-2 gap-2">
          <NumberField label={t('gm.width')} value={size.w} min={AREA_MAP_MIN_SIZE} max={AREA_MAP_MAX_SIZE} onChange={w => setSize(s => ({ ...s, w: w ?? s.w }))} />
          <NumberField label={t('gm.height')} value={size.h} min={AREA_MAP_MIN_SIZE} max={AREA_MAP_MAX_SIZE} onChange={h => setSize(s => ({ ...s, h: h ?? s.h }))} />
        </div>
        {sizeChanged && (
          <button
            type="button"
            onClick={() => {
              const next = { w: clampAreaSize(size.w), h: clampAreaSize(size.h) }
              setSize(next)
              commit({ ...draftRef.current, width: next.w, height: next.h })
            }}
            className={gmSecondaryButton}
          >
            {t('gm.apply')}
          </button>
        )}
      </div>
    </div>
  )

  const sectionTitle = (label: string) => (
    <div className="gm-rule gm-rule-start text-[12px] font-semibold uppercase tracking-wider text-[#EAD9B0]">{label}</div>
  )

  const inspector = selected ? (
    <AreaInspector
      element={selected}
      focusText={focusLabel === selected.id}
      onLive={patch => updateSelected(patch, true)}
      onCommit={() => {
        setFocusLabel(null)
        commit()
      }}
      onChange={patch => updateSelected(patch, false)}
      onLayer={layer => selectedId && commit(moveToLayer(draftRef.current, [selectedId], layer))}
      onOrder={(move: ZMove) => selectedId && commit(reorderElement(draftRef.current, selectedId, move))}
      onDuplicate={duplicateSelected}
      onDelete={removeSelected}
    />
  ) : (
    <p className="text-[13px] text-[#A8A09B] leading-snug">{t('gm.areaMap.nothingSelected')}</p>
  )

  const layers = (
    <LayersPanel
      map={draft}
      onToggle={layerToggle}
      onOpacity={(layerId, opacity) => setDraft(setLayer(draftRef.current, layerId, { opacity }))}
      onCommit={() => commit()}
      onMove={(layerId, dir) => commit(moveLayer(draftRef.current, layerId, dir))}
    />
  )

  const assets = <AssetBrowser selected={asset} onPick={pickAsset} />

  const assetName = asset
    ? t(asset.kind === 'stamp' ? `gm.areaMap.stamps.${asset.id}` : `gm.areaMap.icons.${iconDef(asset.id)?.id ?? asset.id}`)
    : ''
  const status = tool === 'place' && asset
    ? t('gm.areaMap.placeHint', { name: assetName })
    : tool !== 'select' && tool !== 'pan'
      ? t(`gm.areaMap.hints.${tool}`)
      : t('gm.areaMap.status', { w: draft.width, h: draft.height, count: draft.elements.length })

  const stage = (
    <AreaStage
      map={draft}
      selectedId={selectedId}
      panMode={tool === 'pan'}
      ghostAsset={tool === 'place' && asset?.kind === 'stamp' ? asset.id : null}
      brushSize={tool === 'brush' || tool === 'erase' ? settings.brushSize : null}
      onDown={handleDown}
      onMove={handleMove}
      onUp={handleUp}
      onCancel={handleCancel}
      apiRef={stageApi}
    />
  )

  async function exportImage(options: ExportOptions) {
    const canvas = stageApi.current?.capture({ scale: options.scale, labels: options.labels, grid: options.grid })
    if (!canvas) throw new Error('palco não montado')
    const mimeType = options.format === 'png' ? 'image/png' : 'image/jpeg'
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, mimeType, AREA_EXPORT_JPEG_QUALITY))
    if (!blob) throw new Error('canvas vazio')
    const base = (draftRef.current.name || t('gm.untitledMap')).replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, '_')
    await deliverFile({ bytes: new Uint8Array(await blob.arrayBuffer()), fileName: `${base}.${options.format === 'png' ? 'png' : 'jpg'}`, mimeType })
  }

  const sheetTabs: Array<{ id: SheetTab; label: string }> = [
    { id: 'tools', label: t('gm.areaMap.tabTools') },
    { id: 'assets', label: t('gm.areaMap.tabAssets') },
    { id: 'layers', label: t('gm.areaMap.tabLayers') },
    { id: 'props', label: t('gm.areaMap.tabProps') },
  ]

  return (
    <>
      <div className="h-[100dvh] flex flex-col bg-[#131110] font-[Manrope,system-ui]">
        <GmHeader
          backTo={`/mestre/campanha/${draft.campaign_id}?aba=mapas`}
          title={
            <input
              value={draft.name}
              onChange={e => rename(e.target.value)}
              aria-label={t('gm.mapName')}
              placeholder={t('gm.untitledMap')}
              className="w-full bg-transparent border-0 border-b border-transparent focus:border-[#D4A017] text-[15px] font-extrabold text-[#E8DFD0] placeholder:text-[#A8A09B] focus:outline-none"
            />
          }
          actions={
            <>
              <button onClick={undo} disabled={past.length === 0} aria-label={t('gm.undo')} className={gmSecondaryButton}>↶</button>
              <button onClick={redo} disabled={future.length === 0} aria-label={t('gm.redo')} className={gmSecondaryButton}>↷</button>
              <button onClick={() => setExportOpen(true)} data-testid="area-exportar-abrir" aria-label={t('gm.areaMap.exportTitle')} className={gmSecondaryButton}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5" /><path d="M12 15V3" /></svg>
                <span className="hidden sm:inline">{t('gm.areaMap.exportShort')}</span>
              </button>
            </>
          }
        />

        {saveFailed && (
          <p role="alert" className="mx-3 sm:mx-6 mt-2 rounded-[10px] border border-[rgba(181,57,47,0.4)] bg-[rgba(181,57,47,0.12)] px-3 py-2 text-[13px] text-[#f0c2bb]">
            {t('gm.areaMap.saveFailed')}
          </p>
        )}

        {isDesktop ? (
          <div className="flex-1 min-h-0 grid grid-cols-[300px_minmax(0,1fr)_300px] gap-3 p-3">
            <aside className="min-h-0 overflow-y-auto vg-card p-4 flex flex-col gap-4 [&>*]:shrink-0">
              {toolButtons}
              {toolOptions}
              {sectionTitle(t('gm.areaMap.tabAssets'))}
              {assets}
              {sectionTitle(t('gm.areaMap.mapSection'))}
              {mapSettings}
            </aside>
            <div className="min-h-0 flex flex-col gap-2">
              <div className="flex-1 min-h-0">{stage}</div>
              <p className="px-1 text-[12px] text-[#A8A09B] tabular-nums" aria-live="polite">{status}</p>
            </div>
            <aside className="min-h-0 overflow-y-auto vg-card p-4 flex flex-col gap-4 [&>*]:shrink-0">
              {sectionTitle(t('gm.areaMap.tabProps'))}
              {inspector}
              {sectionTitle(t('gm.areaMap.tabLayers'))}
              {layers}
            </aside>
          </div>
        ) : (
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex-1 min-h-0 p-2 pb-1">{stage}</div>
            <p className="px-3 pb-1 text-[12px] text-[#A8A09B] tabular-nums truncate" aria-live="polite">{status}</p>
            {sheet && (
              <div className="max-h-[44dvh] overflow-y-auto border-t border-white/[0.08] bg-[#1A1714] px-3 py-3">
                {sheet === 'tools' && (
                  <div className="flex flex-col gap-4">
                    {toolButtons}
                    {toolOptions}
                    {sectionTitle(t('gm.areaMap.mapSection'))}
                    {mapSettings}
                  </div>
                )}
                {sheet === 'assets' && assets}
                {sheet === 'layers' && layers}
                {sheet === 'props' && inspector}
              </div>
            )}
            <nav role="tablist" className="grid grid-cols-4 border-t border-white/[0.08] bg-[#161311] pb-[env(safe-area-inset-bottom)]">
              {sheetTabs.map(tab => (
                <button
                  key={tab.id}
                  role="tab"
                  type="button"
                  aria-selected={sheet === tab.id}
                  onClick={() => setSheet(s => (s === tab.id ? null : tab.id))}
                  className={`min-h-[50px] text-[12px] font-semibold cursor-pointer transition-colors ${
                    sheet === tab.id ? 'text-[#D4A017] bg-white/[0.04]' : 'text-[#A8A09B]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
      <ExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        width={draft.width}
        height={draft.height}
        hasGrid={draft.grid.kind !== 'off'}
        onExport={exportImage}
      />
      {/* O editor ocupa a tela inteira; o rodapé fica logo abaixo, ao rolar. */}
      <AppFooter containerClassName={gmContainer} />
    </>
  )
}
