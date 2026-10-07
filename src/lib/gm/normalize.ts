import { v4 as uuidv4 } from 'uuid'
import type {
  AreaElement, AreaLabelStyle, AreaLayerId, AreaLayerState, AreaMap, AreaPathStyle, Campaign, Combatant, Encounter, GridMap, MapLabel, Monster, Npc, NpcProfile,
} from '../../types'
import { blankCells, clampMapSize, isTerrainCode } from './terrain'
import {
  AREA_BRUSH_DEFAULT, AREA_BRUSH_MAX, AREA_BRUSH_MIN, AREA_DEFAULT_TEXTURE, AREA_GRID_DEFAULT_SIZE, AREA_GRID_MAX_SIZE,
  AREA_GRID_MIN_SIZE, AREA_ICON_COLORS, AREA_ICON_DEFAULT_SIZE, AREA_ICON_MAX_SIZE, AREA_ICON_MIN_SIZE, AREA_LABEL_COLORS, AREA_LABEL_STYLES,
  AREA_LAYERS, AREA_PATH_MAX_WIDTH, AREA_PATH_MIN_WIDTH, AREA_PATH_STYLES, AREA_REGION_COLORS,
  CREATURE_SIZES, DEFAULT_SPEED_METERS, TERRAIN_VOID,
} from '../../constants'
import { clampAreaSize, defaultLayers } from './areaMap/scene'
import { clampLabelSize, clampScale, normalizeDegrees } from './areaMap/geometry'
import { normalizeStatBlock } from './statblock'

/**
 * Completa o que foi salvo por versões anteriores da área do mestre — a Fase 1
 * gravou campanhas sem `npcs`. Mesmo papel de `migrateSheet` para as fichas.
 */
export function normalizeCampaign(raw: unknown): Campaign {
  const c = raw as Partial<Campaign>
  const at = c.updated_at ?? new Date().toISOString()
  return {
    id: c.id ?? uuidv4(),
    name: c.name ?? '',
    party: Array.isArray(c.party) ? c.party : [],
    npcs: Array.isArray(c.npcs) ? c.npcs.map(normalizeNpc) : [],
    encounters: Array.isArray(c.encounters) ? c.encounters.map(normalizeEncounter) : [],
    maps: Array.isArray(c.maps) ? c.maps.map(normalizeMap) : [],
    notes: c.notes ?? '',
    created_at: c.created_at ?? at,
    updated_at: at,
  }
}

export function normalizeNpc(raw: unknown): Npc {
  const n = (raw ?? {}) as Partial<Npc>
  return {
    id: n.id ?? uuidv4(),
    statblock: normalizeStatBlock(n.statblock),
    base_monster_id: n.base_monster_id ?? null,
    notes: n.notes ?? '',
    profile: n.profile ? normalizeProfile(n.profile) : null,
    updated_at: n.updated_at ?? new Date().toISOString(),
  }
}

export const PROFILE_TEXT_FIELDS = [
  'species', 'archetype', 'age', 'occupation', 'appearance', 'mannerism',
  'personality', 'ideal', 'bond', 'flaw', 'motivation', 'secret',
] as const

export function normalizeProfile(raw: unknown): NpcProfile {
  const p = (raw ?? {}) as Partial<Record<keyof NpcProfile, unknown>>
  const text = (v: unknown) => (typeof v === 'string' ? v : '')
  const profile = { gender: p.gender === 'f' || p.gender === 'm' || p.gender === 'x' ? p.gender : '' } as NpcProfile
  for (const key of PROFILE_TEXT_FIELDS) profile[key] = text(p[key])
  return profile
}

export function normalizeMonster(raw: unknown): Monster {
  const m = (raw ?? {}) as Partial<Monster>
  return {
    id: m.id ?? uuidv4(),
    source: m.source === 'srd' ? 'srd' : 'custom',
    statblock: normalizeStatBlock(m.statblock),
    updated_at: m.updated_at ?? new Date().toISOString(),
  }
}

export function normalizeEncounter(raw: unknown): Encounter {
  const e = (raw ?? {}) as Partial<Encounter>
  const at = e.updated_at ?? new Date().toISOString()
  const combatants = Array.isArray(e.combatants) ? e.combatants.map(normalizeCombatant) : []
  return {
    id: e.id ?? uuidv4(),
    name: e.name ?? '',
    status: e.status === 'active' || e.status === 'finished' ? e.status : 'preparing',
    map_id: typeof e.map_id === 'string' ? e.map_id : null,
    fog: typeof e.fog === 'string' && /^[01]*$/.test(e.fog) ? e.fog : null,
    combatants,
    round: typeof e.round === 'number' ? e.round : 0,
    turn_id: combatants.some(c => c.id === e.turn_id) ? e.turn_id! : null,
    log: Array.isArray(e.log) ? e.log : [],
    created_at: e.created_at ?? at,
    updated_at: at,
  }
}

function normalizeCombatant(raw: unknown): Combatant {
  const c = (raw ?? {}) as Partial<Combatant>
  const max = c.hp?.max ?? 1
  return {
    id: c.id ?? uuidv4(),
    kind: c.kind === 'player' || c.kind === 'npc' ? c.kind : 'monster',
    ref_id: c.ref_id ?? null,
    name: c.name ?? '',
    initiative: typeof c.initiative === 'number' ? c.initiative : null,
    init_bonus: c.init_bonus ?? 0,
    ac: c.ac ?? 10,
    hp: { current: c.hp?.current ?? max, max, temp: c.hp?.temp ?? 0 },
    conditions: Array.isArray(c.conditions) ? c.conditions : [],
    concentration: c.concentration === true,
    hidden: c.hidden === true,
    defeated: c.defeated === true,
    statblock: c.statblock ? normalizeStatBlock(c.statblock) : null,
    level: typeof c.level === 'number' ? c.level : null,
    notes: c.notes ?? '',
    position: c.position && Number.isInteger(c.position.x) && Number.isInteger(c.position.y)
      ? { x: c.position.x, y: c.position.y }
      : null,
    size: CREATURE_SIZES.includes(c.size as typeof CREATURE_SIZES[number]) ? c.size! : 'medium',
    speed_m: typeof c.speed_m === 'number' ? c.speed_m : DEFAULT_SPEED_METERS,
    fly_m: typeof c.fly_m === 'number' ? c.fly_m : c.statblock?.speed?.fly ?? null,
    swim_m: typeof c.swim_m === 'number' ? c.swim_m : c.statblock?.speed?.swim ?? null,
    move_mode: c.move_mode === 'fly' || c.move_mode === 'swim' ? c.move_mode : 'walk',
    side: c.side === 'party' || c.side === 'enemy' ? c.side : c.kind === 'player' ? 'party' : 'enemy',
    movement_used_m: typeof c.movement_used_m === 'number' ? c.movement_used_m : 0,
    dash: c.dash === true,
  }
}

/** Tamanho dentro dos limites e `cells` com exatamente uma casa válida por posição. */
export function normalizeMap(raw: unknown): GridMap {
  const m = (raw ?? {}) as Partial<GridMap>
  const at = m.updated_at ?? new Date().toISOString()
  const width = clampMapSize(m.width ?? 0)
  const height = clampMapSize(m.height ?? 0)
  const source = typeof m.cells === 'string' ? m.cells : ''
  const cells = source.length === width * height && [...source].every(isTerrainCode)
    ? source
    : [...blankCells(width, height)].map((_, i) => (isTerrainCode(source[i] ?? '') ? source[i] : TERRAIN_VOID)).join('')
  const labels = Array.isArray(m.labels)
    ? m.labels.filter((l): l is MapLabel =>
        typeof l?.text === 'string' && Number.isInteger(l.x) && Number.isInteger(l.y)
        && l.x >= 0 && l.y >= 0 && l.x < width && l.y < height)
        .map(l => ({ id: l.id ?? uuidv4(), x: l.x, y: l.y, text: l.text }))
    : []
  return { id: m.id ?? uuidv4(), name: m.name ?? '', width, height, cells, labels, created_at: m.created_at ?? at, updated_at: at }
}

const isLayerId = (v: unknown): v is AreaLayerId => (AREA_LAYERS as readonly unknown[]).includes(v)
const finite = (v: unknown, fallback: number) => (typeof v === 'number' && Number.isFinite(v) ? v : fallback)
const unit = (v: unknown, fallback = 1) => Math.min(1, Math.max(0, finite(v, fallback)))

/**
 * Mapa de área lido do IndexedDB ou de um JSON importado. Camadas desconhecidas
 * somem e as que faltam voltam no fim; elementos de tipo desconhecido ou com
 * número inválido são descartados — um asset que saiu do catálogo fica (o
 * editor desenha um marcador no lugar).
 */
export function normalizeAreaMap(raw: unknown): AreaMap {
  const m = (raw ?? {}) as Partial<AreaMap>
  const at = m.updated_at ?? new Date().toISOString()

  const seen = new Set<AreaLayerId>()
  const layers: AreaLayerState[] = []
  for (const l of Array.isArray(m.layers) ? m.layers : []) {
    if (!isLayerId(l?.id) || seen.has(l.id)) continue
    seen.add(l.id)
    layers.push({ id: l.id, visible: l.visible !== false, locked: l.locked === true, opacity: unit(l.opacity) })
  }
  for (const l of defaultLayers()) if (!seen.has(l.id)) layers.push(l)

  const elements = (Array.isArray(m.elements) ? m.elements : [])
    .map(normalizeAreaElement)
    .filter((el): el is AreaElement => el !== null)

  return {
    id: m.id ?? uuidv4(),
    campaign_id: typeof m.campaign_id === 'string' ? m.campaign_id : '',
    name: typeof m.name === 'string' ? m.name : '',
    width: clampAreaSize(finite(m.width, 0)),
    height: clampAreaSize(finite(m.height, 0)),
    background: { texture: typeof m.background?.texture === 'string' ? m.background.texture : AREA_DEFAULT_TEXTURE },
    layers,
    elements,
    grid: normalizeGrid(m.grid),
    ...(typeof m.thumbnail === 'string' && m.thumbnail.startsWith('data:image/') ? { thumbnail: m.thumbnail } : {}),
    version: 1,
    created_at: m.created_at ?? at,
    updated_at: at,
  }
}

const PATH_STYLES = Object.keys(AREA_PATH_STYLES) as AreaPathStyle[]
const LABEL_STYLES = Object.keys(AREA_LABEL_STYLES) as AreaLabelStyle[]
const HEX = /^#[0-9a-f]{6}$/i

/** Array plano de coordenadas finitas com pelo menos `min` pontos; senão `null`. */
function flatPoints(v: unknown, min: number): number[] | null {
  if (!Array.isArray(v) || v.length % 2 !== 0 || v.length < min * 2) return null
  return v.every(n => typeof n === 'number' && Number.isFinite(n)) ? v as number[] : null
}

function normalizeAreaElement(raw: unknown): AreaElement | null {
  const e = (raw ?? {}) as Record<string, unknown>
  const id = typeof e.id === 'string' ? e.id : uuidv4()
  const layer = isLayerId(e.layer) ? e.layer : 'decor'
  const point = typeof e.x === 'number' && Number.isFinite(e.x) && typeof e.y === 'number' && Number.isFinite(e.y)

  switch (e.kind) {
    case 'stamp':
      if (typeof e.asset !== 'string' || !point) return null
      return {
        kind: 'stamp', id, layer, asset: e.asset, x: e.x as number, y: e.y as number,
        scale: clampScale(finite(e.scale, 1)),
        rotation: normalizeDegrees(finite(e.rotation, 0)),
        flip: e.flip === true,
        opacity: unit(e.opacity),
        ...(e.effect === 'shadow' || e.effect === 'glow' ? { effect: e.effect } : {}),
      }
    case 'paint': {
      const points = flatPoints(e.points, 1)
      if (!points || typeof e.texture !== 'string') return null
      return {
        kind: 'paint', id, layer, texture: e.texture, points, erase: e.erase === true,
        size: Math.min(AREA_BRUSH_MAX, Math.max(AREA_BRUSH_MIN, finite(e.size, AREA_BRUSH_DEFAULT))),
      }
    }
    case 'region': {
      const points = flatPoints(e.points, 3)
      if (!points) return null
      return {
        kind: 'region', id, layer, points,
        texture: typeof e.texture === 'string' ? e.texture : null,
        color: typeof e.color === 'string' && HEX.test(e.color) ? e.color : AREA_REGION_COLORS[0],
        border: e.border === true,
        opacity: unit(e.opacity),
      }
    }
    case 'path': {
      const points = flatPoints(e.points, 2)
      if (!points) return null
      const style = PATH_STYLES.includes(e.style as AreaPathStyle) ? e.style as AreaPathStyle : 'dirtRoad'
      return {
        kind: 'path', id, layer, style, points,
        width: Math.min(AREA_PATH_MAX_WIDTH, Math.max(AREA_PATH_MIN_WIDTH, finite(e.width, AREA_PATH_STYLES[style].width))),
      }
    }
    case 'label': {
      if (typeof e.text !== 'string' || !point) return null
      const style = LABEL_STYLES.includes(e.style as AreaLabelStyle) ? e.style as AreaLabelStyle : 'city'
      return {
        kind: 'label', id, layer, text: e.text, x: e.x as number, y: e.y as number, style,
        size: clampLabelSize(finite(e.size, AREA_LABEL_STYLES[style].size)),
        rotation: normalizeDegrees(finite(e.rotation, 0)),
        color: typeof e.color === 'string' && HEX.test(e.color) ? e.color : AREA_LABEL_COLORS[0],
      }
    }
    case 'icon':
      if (typeof e.icon !== 'string' || !point) return null
      return {
        kind: 'icon', id, layer, icon: e.icon, x: e.x as number, y: e.y as number,
        size: Math.min(AREA_ICON_MAX_SIZE, Math.max(AREA_ICON_MIN_SIZE, finite(e.size, AREA_ICON_DEFAULT_SIZE))),
        color: typeof e.color === 'string' && HEX.test(e.color) ? e.color : AREA_ICON_COLORS[0],
        badge: e.badge !== false,
      }
    default:
      return null
  }
}

function normalizeGrid(raw: unknown): AreaMap['grid'] {
  const g = (raw ?? {}) as Partial<AreaMap['grid']>
  return {
    kind: g.kind === 'square' || g.kind === 'hex' ? g.kind : 'off',
    size: Math.min(AREA_GRID_MAX_SIZE, Math.max(AREA_GRID_MIN_SIZE, finite(g.size, AREA_GRID_DEFAULT_SIZE))),
    opacity: unit(g.opacity, 0.35),
  }
}
