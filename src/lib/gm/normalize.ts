import { v4 as uuidv4 } from 'uuid'
import type { Campaign, Monster, Npc } from '../../types'
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
