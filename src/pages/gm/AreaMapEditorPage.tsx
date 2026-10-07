import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { v4 as uuidv4 } from 'uuid'
import type { AreaLayerId, AreaLayerState, AreaMap, AreaStamp } from '../../types'
import { useAreaMapStore } from '../../store/areaMapStore'
import { GmHeader, gmContainer, gmSecondaryButton } from '../../components/gm/GmHeader'
import { AppFooter } from '../../components/ui/AppFooter'
import { AreaStage, type StagePointerInfo } from '../../components/gm/area/AreaStage'
import { AssetBrowser } from '../../components/gm/area/AssetBrowser'
import { LayersPanel } from '../../components/gm/area/LayersPanel'
import { AreaInspector } from '../../components/gm/area/AreaInspector'
import { AREA_TEXTURE_IDS, areaTextureSwatch } from '../../components/gm/area/areaTextures'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { stampDef, stampSize } from '../../data/areaMap/stamps'
import { NumberField } from '../../components/gm/fields'
import {
  addElements, clampAreaSize, duplicateElements, moveLayer, moveToLayer, removeElements, reorderElement, setLayer, updateElements,
  type ZMove,
} from '../../lib/gm/areaMap/scene'
import {
  gizmoHit, hitTest, quantize, rotationToward, scaleToward, type Point,
} from '../../lib/gm/areaMap/geometry'
import { AREA_MAP_MAX_SIZE, AREA_MAP_MIN_SIZE, MAP_UNDO_LIMIT } from '../../constants'
import { NotFound } from '../NotFound'

type Tool = 'select' | 'pan' | 'place'
type SheetTab = 'tools' | 'assets' | 'layers' | 'props'

/** Deslocamento da cópia ao duplicar, em unidades de mundo. */
const DUPLICATE_OFFSET = 24
/** Passo das setas do teclado (Shift multiplica por 10). */
const NUDGE = 1

interface Drag {
  mode: 'move' | 'rotate' | 'scale'
  id: string
  start: Point
  origin: AreaStamp
  moved: boolean
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
  const saveFailed = useAreaMapStore(s => s.saveFailed)
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  const [draft, setDraftState] = useState(initial)
  const draftRef = useRef(initial)
  /** Último estado que entrou no desfazer; gestos ao vivo só mexem no rascunho. */
  const committed = useRef(initial)
  const [past, setPast] = useState<AreaMap[]>([])
  const [future, setFuture] = useState<AreaMap[]>([])

  const [tool, setTool] = useState<Tool>('select')
  const [asset, setAsset] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sheet, setSheet] = useState<SheetTab | null>('assets')
  const [size, setSize] = useState({ w: initial.width, h: initial.height })
  const drag = useRef<Drag | null>(null)

  const setDraft = useCallback((next: AreaMap) => {
    draftRef.current = next
    setDraftState(next)
  }, [])

  /** Fecha um gesto: o estado anterior vai para o desfazer e o novo para o store. */
  const commit = useCallback((next: AreaMap = draftRef.current) => {
    setDraft(next)
    if (next === committed.current) return
    const prev = committed.current
    committed.current = next
    setPast(p => [...p, prev].slice(-MAP_UNDO_LIMIT))
    setFuture([])
    commitToStore(next)
  }, [commitToStore, setDraft])

  const restore = useCallback((next: AreaMap) => {
    committed.current = next
    setDraft(next)
    commitToStore(next)
    setSelectedId(s => (s && next.elements.some(e => e.id === s) ? s : null))
  }, [commitToStore, setDraft])

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

  const updateSelected = useCallback((patch: Partial<AreaStamp>, live: boolean) => {
    if (!selectedId) return
    const next = updateElements(draftRef.current, [selectedId], el => ({ ...el, ...patch }))
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
        setTool('select')
        setAsset(null)
      } else if (selectedId && key.startsWith('arrow')) {
        e.preventDefault()
        const step = NUDGE * (e.shiftKey ? 10 : 1)
        const dx = key === 'arrowleft' ? -step : key === 'arrowright' ? step : 0
        const dy = key === 'arrowup' ? -step : key === 'arrowdown' ? step : 0
        commit(updateElements(draftRef.current, [selectedId], el => ({ ...el, x: el.x + dx, y: el.y + dy })))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo, duplicateSelected, removeSelected, selectedId, commit])

  function pickAsset(next: string | null) {
    setAsset(next)
    setTool(next ? 'place' : 'select')
    if (next) setSelectedId(null)
    // No celular a folha fecha para o toque cair no mapa.
    if (next && !isDesktop) setSheet(null)
  }

  function handleDown(world: Point, info: StagePointerInfo): boolean {
    const m = draftRef.current
    if (tool === 'place' && asset) {
      // Fora do mapa o toque arrasta a vista em vez de largar um stamp onde não se vê.
      if (world.x < 0 || world.y < 0 || world.x > m.width || world.y > m.height) return false
      const def = stampDef(asset)
      const stamp: AreaStamp = {
        kind: 'stamp', id: uuidv4(), layer: def?.layer ?? 'decor', asset,
        x: quantize(world.x), y: quantize(world.y), scale: 1, rotation: 0, flip: false, opacity: 1,
      }
      const next = addElements(m, [stamp])
      if (next === m) {
        alert(t('gm.areaMap.limitReached'))
        return true
      }
      commit(next)
      return true
    }
    if (tool !== 'select') return false

    const current = selectedId ? m.elements.find(e => e.id === selectedId) : undefined
    if (current?.kind === 'stamp') {
      const handle = gizmoHit(current, stampSize(current.asset), info.zoom, world)
      if (handle) {
        drag.current = { mode: handle, id: current.id, start: world, origin: current, moved: false }
        return true
      }
    }
    const hit = hitTest(m, world, stampSize)
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
    const d = drag.current
    if (!d) return
    d.moved = true
    const o = d.origin
    const patch: Partial<AreaStamp> =
      d.mode === 'move' ? { x: quantize(o.x + world.x - d.start.x), y: quantize(o.y + world.y - d.start.y) }
      : d.mode === 'rotate' ? { rotation: rotationToward(o, world, info.shift ? 15 : 0) }
      : { scale: scaleToward(o, stampSize(o.asset), world) }
    setDraft(updateElements(draftRef.current, [d.id], el => ({ ...el, ...patch })))
  }

  function handleUp() {
    if (drag.current?.moved) commit()
    drag.current = null
  }

  function handleCancel() {
    if (drag.current?.moved) setDraft(committed.current)
    drag.current = null
  }

  const layerToggle = (layerId: AreaLayerId, patch: Partial<Omit<AreaLayerState, 'id'>>) => {
    commit(setLayer(draftRef.current, layerId, patch))
    if (patch.visible === false || patch.locked === true) {
      if (selected?.layer === layerId) setSelectedId(null)
    }
  }

  const tools: Array<{ id: Tool; label: string; icon: ReactNode }> = [
    { id: 'select', label: t('gm.areaMap.toolSelect'), icon: <path d="M5 3l14 8-6 2-3 6z" /> },
    { id: 'pan', label: t('gm.areaMap.toolPan'), icon: <path d="M12 3v18M3 12h18M12 3l-3 3M12 3l3 3M12 21l-3-3M12 21l3-3M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3" /> },
  ]

  const toolButtons = (
    <div role="toolbar" aria-label={t('gm.tool')} className="flex gap-1.5">
      {tools.map(tl => (
        <button
          key={tl.id}
          type="button"
          aria-pressed={tool === tl.id}
          onClick={() => {
            setTool(tl.id)
            setAsset(null)
          }}
          className={`flex-1 inline-flex items-center justify-center gap-1.5 min-h-[40px] rounded-[9px] px-2.5 text-[13px] font-semibold border cursor-pointer transition-colors ${
            tool === tl.id ? 'bg-[#D4A017] text-[#131110] border-[#D4A017]' : 'bg-white/5 text-[#E8DFD0] border-white/[0.1] hover:bg-white/10'
          }`}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{tl.icon}</svg>
          {tl.label}
        </button>
      ))}
    </div>
  )

  const backgroundPicker = (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A8A09B]">{t('gm.areaMap.background')}</span>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(44px,1fr))] gap-1.5">
        {AREA_TEXTURE_IDS.map(tex => {
          const active = draft.background.texture === tex
          const name = t(`gm.areaMap.textures.${tex}`)
          return (
            <button
              key={tex}
              type="button"
              title={name}
              aria-label={name}
              aria-pressed={active}
              onClick={() => commit({ ...draftRef.current, background: { texture: tex } })}
              className={`aspect-square rounded-[8px] border-2 bg-cover cursor-pointer ${active ? 'border-[#D4A017]' : 'border-transparent hover:border-white/30'}`}
              style={{ backgroundImage: `url(${areaTextureSwatch(tex)})` }}
            />
          )
        })}
      </div>
    </div>
  )

  const sizeChanged = size.w !== draft.width || size.h !== draft.height
  const sizeControl = (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A8A09B]">{t('gm.areaMap.mapSize')}</span>
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
  )

  const inspector = selected ? (
    <AreaInspector
      stamp={selected}
      onLive={patch => updateSelected(patch, true)}
      onCommit={() => commit()}
      onChange={patch => {
        if (patch.layer && selectedId) commit(moveToLayer(draftRef.current, [selectedId], patch.layer))
        else updateSelected(patch, false)
      }}
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

  const status = tool === 'place' && asset
    ? t('gm.areaMap.placeHint', { name: t(`gm.areaMap.stamps.${asset}`) })
    : t('gm.areaMap.status', { w: draft.width, h: draft.height, count: draft.elements.length })

  const stage = (
    <AreaStage
      map={draft}
      selectedId={selectedId}
      panMode={tool === 'pan'}
      ghostAsset={tool === 'place' ? asset : null}
      onDown={handleDown}
      onMove={handleMove}
      onUp={handleUp}
      onCancel={handleCancel}
    />
  )

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
            <aside className="min-h-0 overflow-y-auto vg-card p-4 flex flex-col gap-4">
              {toolButtons}
              {backgroundPicker}
              {sizeControl}
              <div className="gm-rule gm-rule-start text-[12px] font-semibold uppercase tracking-wider text-[#EAD9B0]">{t('gm.areaMap.tabAssets')}</div>
              {assets}
            </aside>
            <div className="min-h-0 flex flex-col gap-2">
              <div className="flex-1 min-h-0">{stage}</div>
              <p className="px-1 text-[12px] text-[#A8A09B] tabular-nums" aria-live="polite">{status}</p>
            </div>
            <aside className="min-h-0 overflow-y-auto vg-card p-4 flex flex-col gap-4">
              <div className="gm-rule gm-rule-start text-[12px] font-semibold uppercase tracking-wider text-[#EAD9B0]">{t('gm.areaMap.tabProps')}</div>
              {inspector}
              <div className="gm-rule gm-rule-start text-[12px] font-semibold uppercase tracking-wider text-[#EAD9B0]">{t('gm.areaMap.tabLayers')}</div>
              {layers}
            </aside>
          </div>
        ) : (
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex-1 min-h-0 p-2 pb-1">{stage}</div>
            <p className="px-3 pb-1 text-[12px] text-[#A8A09B] tabular-nums truncate" aria-live="polite">{status}</p>
            {sheet && (
              <div className="max-h-[44dvh] overflow-y-auto border-t border-white/[0.08] bg-[#1A1714] px-3 py-3">
                {sheet === 'tools' && <div className="flex flex-col gap-4">{toolButtons}{backgroundPicker}{sizeControl}</div>}
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
      {/* O editor ocupa a tela inteira; o rodapé fica logo abaixo, ao rolar. */}
      <AppFooter containerClassName={gmContainer} />
    </>
  )
}
