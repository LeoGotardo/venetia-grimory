import { v4 as uuidv4 } from 'uuid'
import type { AreaElement, AreaLayerId, AreaLayerState, AreaMap, AreaMapListItem } from '../../../types'
import {
  AREA_DEFAULT_TEXTURE, AREA_LAYERS, AREA_MAP_MAX_ELEMENTS, AREA_MAP_MAX_SIZE, AREA_MAP_MIN_SIZE,
} from '../../../constants'
import { translatePoints } from './shapes'

/**
 * Operações puras sobre a cena do mapa de área. Toda função devolve um mapa novo
 * (ou o mesmo, se nada mudou) — o editor guarda os snapshots para desfazer e o
 * Pixi só redesenha os elementos cuja referência mudou.
 */

export function defaultLayers(): AreaLayerState[] {
  return AREA_LAYERS.map(id => ({ id, visible: true, locked: false, opacity: 1 }))
}

export function clampAreaSize(n: number): number {
  if (!Number.isFinite(n)) return AREA_MAP_MIN_SIZE
  return Math.min(AREA_MAP_MAX_SIZE, Math.max(AREA_MAP_MIN_SIZE, Math.round(n)))
}

export function createAreaMap(campaignId: string, name: string, width: number, height: number, at = new Date().toISOString()): AreaMap {
  return {
    id: uuidv4(),
    campaign_id: campaignId,
    name,
    width: clampAreaSize(width),
    height: clampAreaSize(height),
    background: { texture: AREA_DEFAULT_TEXTURE },
    layers: defaultLayers(),
    elements: [],
    version: 1,
    created_at: at,
    updated_at: at,
  }
}

export function toAreaListItem(map: AreaMap): AreaMapListItem {
  return {
    id: map.id,
    name: map.name,
    width: map.width,
    height: map.height,
    background: map.background.texture,
    elements: map.elements.length,
    updated_at: map.updated_at,
  }
}

export function layerOf(map: AreaMap, id: AreaLayerId): AreaLayerState | undefined {
  return map.layers.find(l => l.id === id)
}

/** Dá para selecionar e mexer: a camada está visível e destravada. */
export function isEditable(map: AreaMap, element: AreaElement): boolean {
  const layer = layerOf(map, element.layer)
  return !!layer && layer.visible && !layer.locked
}

/**
 * Elementos na ordem de desenho: camada por camada (ordem de `map.layers`) e,
 * dentro da camada, a ordem do array.
 */
export function drawOrder(map: AreaMap): AreaElement[] {
  const rank = new Map(map.layers.map((l, i) => [l.id, i]))
  return map.elements
    .map((el, i) => ({ el, i }))
    .sort((a, b) => (rank.get(a.el.layer) ?? 0) - (rank.get(b.el.layer) ?? 0) || a.i - b.i)
    .map(x => x.el)
}

/** Acrescenta no topo da camada; recusa (devolve o mesmo mapa) acima do limite. */
export function addElements(map: AreaMap, added: AreaElement[]): AreaMap {
  if (added.length === 0 || map.elements.length + added.length > AREA_MAP_MAX_ELEMENTS) return map
  return { ...map, elements: [...map.elements, ...added] }
}

export function updateElements(map: AreaMap, ids: readonly string[], change: (el: AreaElement) => AreaElement): AreaMap {
  const wanted = new Set(ids)
  let changed = false
  const elements = map.elements.map(el => {
    if (!wanted.has(el.id)) return el
    const next = change(el)
    if (next !== el) changed = true
    return next
  })
  return changed ? { ...map, elements } : map
}

export function removeElements(map: AreaMap, ids: readonly string[]): AreaMap {
  const gone = new Set(ids)
  const elements = map.elements.filter(el => !gone.has(el.id))
  return elements.length === map.elements.length ? map : { ...map, elements }
}

const q = (n: number) => Math.round(n * 10) / 10

/** Desloca qualquer elemento: centro para stamp/texto, todos os pontos para linhas e regiões. */
export function translateElement<T extends AreaElement>(el: T, dx: number, dy: number): T {
  if (el.kind === 'stamp' || el.kind === 'label') return { ...el, x: q(el.x + dx), y: q(el.y + dy) }
  return { ...el, points: translatePoints(el.points, dx, dy).map(q) }
}

/**
 * Copia os elementos com um deslocamento, logo acima dos originais. Devolve os
 * ids novos para a seleção passar para as cópias.
 */
export function duplicateElements(
  map: AreaMap, ids: readonly string[], offset: number, newId: () => string = uuidv4,
): { map: AreaMap; ids: string[] } {
  const wanted = new Set(ids)
  const copies = map.elements
    .filter(el => wanted.has(el.id))
    .map(el => ({ ...translateElement(el, offset, offset), id: newId() }))
  const next = addElements(map, copies)
  return next === map ? { map, ids: [] } : { map: next, ids: copies.map(c => c.id) }
}

export type ZMove = 'up' | 'down' | 'top' | 'bottom'

/** Sobe/desce um elemento entre os da mesma camada (os de outras camadas não contam). */
export function reorderElement(map: AreaMap, id: string, move: ZMove): AreaMap {
  const idx = map.elements.findIndex(el => el.id === id)
  if (idx < 0) return map
  const layer = map.elements[idx].layer
  const peers = map.elements.map((el, i) => (el.layer === layer ? i : -1)).filter(i => i >= 0)
  const pos = peers.indexOf(idx)
  const target =
    move === 'up' ? peers[pos + 1]
    : move === 'down' ? peers[pos - 1]
    : move === 'top' ? peers[peers.length - 1]
    : peers[0]
  if (target === undefined || target === idx) return map
  const elements = [...map.elements]
  const [el] = elements.splice(idx, 1)
  elements.splice(target, 0, el)
  return { ...map, elements }
}

/** Troca de camada indo para o topo da nova. */
export function moveToLayer(map: AreaMap, ids: readonly string[], layer: AreaLayerId): AreaMap {
  const wanted = new Set(ids)
  const moving = map.elements.filter(el => wanted.has(el.id) && el.layer !== layer)
  if (moving.length === 0) return map
  const moved = new Set(moving.map(el => el.id))
  return {
    ...map,
    elements: [...map.elements.filter(el => !moved.has(el.id)), ...moving.map(el => ({ ...el, layer }))],
  }
}

export function setLayer(map: AreaMap, id: AreaLayerId, patch: Partial<Omit<AreaLayerState, 'id'>>): AreaMap {
  return { ...map, layers: map.layers.map(l => (l.id === id ? { ...l, ...patch } : l)) }
}

/** `+1` sobe a camada (desenha por cima), `-1` desce. */
export function moveLayer(map: AreaMap, id: AreaLayerId, direction: 1 | -1): AreaMap {
  const idx = map.layers.findIndex(l => l.id === id)
  const target = idx + direction
  if (idx < 0 || target < 0 || target >= map.layers.length) return map
  const layers = [...map.layers]
  ;[layers[idx], layers[target]] = [layers[target], layers[idx]]
  return { ...map, layers }
}
