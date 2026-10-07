import { v4 as uuidv4 } from 'uuid'
import type { Campaign, Combatant, Encounter, GridMap, MapLabel, Monster, Npc } from '../../types'
import { blankCells, clampMapSize, isTerrainCode } from './terrain'
import { CREATURE_SIZES, DEFAULT_SPEED_METERS, TERRAIN_VOID } from '../../constants'
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
    updated_at: n.updated_at ?? new Date().toISOString(),
  }
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
