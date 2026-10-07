import type { Combatant } from '../../types'

export const TOKEN_FILL: Record<Combatant['kind'], string> = {
  player: '#3a6ea5',
  npc: '#a07c22',
  monster: '#a3352b',
}

/** "Goblin 3" → "G3"; "Ilsa" → "IL". Cabe num círculo pequeno. */
export function tokenInitials(name: string): string {
  const trimmed = name.trim()
  const numbered = /^(.*?)\s+(\d+)$/.exec(trimmed)
  if (numbered) return `${numbered[1].charAt(0).toUpperCase()}${numbered[2]}`
  return trimmed.slice(0, 2).toUpperCase() || '?'
}
