import type { CharacterSheet } from './sheet'
import type { AbilityId } from './gameData'
import type { CREATURE_SIZES, CREATURE_TYPES } from '../constants'

/**
 * Área do mestre. Toda entidade tem id uuid e `updated_at`: é o que vai permitir
 * sincronizar com uma mesa online depois ("vale a última edição") sem mudar o
 * formato do que já está salvo.
 */

/**
 * Player da mesa. `local` aponta para uma ficha deste aparelho (`sheet_id`) e o
 * snapshot é renovado sempre que a campanha abre; `imported` veio de um JSON e
 * só muda quando o mestre reimporta.
 */
export interface PartyMember {
  id: string
  source: 'local' | 'imported'
  sheet_id: string | null
  snapshot: CharacterSheet
  imported_at: string
  updated_at: string
}

export type CreatureSize = typeof CREATURE_SIZES[number]
export type CreatureType = typeof CREATURE_TYPES[number]

/**
 * Traço, ação, ação bônus, reação ou ação lendária. `attack_bonus` e `damage`
 * (expressão de dados, ex.: `2d6+3`) são opcionais: é o que o rastreador de
 * combate sabe rolar; o resto fica no texto.
 */
export interface StatBlockFeature {
  id: string
  name: string
  /** "Recarga 5–6", "3/Dia", "Custa 2 ações"… */
  usage: string
  description: string
  attack_bonus: number | null
  damage: string | null
  damage_type: string
  save_dc: number | null
  save_ability: AbilityId | null
}

/** Distâncias em metros, como o resto do app. */
export interface StatBlock {
  name: string
  size: CreatureSize
  creature_type: CreatureType
  /** Etiquetas do tipo: "goblinoide", "mago"… */
  tags: string
  alignment: string
  ac: number
  ac_note: string
  hp: { average: number; formula: string }
  speed: { walk: number; fly: number | null; swim: number | null; climb: number | null; burrow: number | null; hover: boolean }
  abilities: Record<AbilityId, number>
  save_proficiencies: AbilityId[]
  /** Bônus final por perícia (id do domínio, ex.: `percepcao`) — o bloco mostra o número pronto. */
  skills: Record<string, number>
  vulnerabilities: string
  resistances: string
  immunities: string
  /** Nomes canônicos em português (`AVAILABLE_CONDITIONS`), traduzidos na exibição. */
  condition_immunities: string[]
  senses: { darkvision: number | null; blindsight: number | null; tremorsense: number | null; truesight: number | null }
  languages: string
  /** `'0'`, `'1/8'`, `'1/4'`, `'1/2'`, `'1'`…`'30'`. */
  cr: string
  /** `null` usa o modificador de Destreza. */
  initiative_bonus: number | null
  traits: StatBlockFeature[]
  actions: StatBlockFeature[]
  bonus_actions: StatBlockFeature[]
  reactions: StatBlockFeature[]
  legendary_actions: StatBlockFeature[]
  legendary_uses: number | null
  description: string
}

/** Monstro do bestiário do mestre — vale para todas as campanhas. */
export interface Monster {
  id: string
  source: 'custom' | 'srd'
  statblock: StatBlock
  updated_at: string
}

/** NPC de uma campanha: cópia própria do bloco, editável sem mexer no bestiário. */
export interface Npc {
  id: string
  statblock: StatBlock
  /** Monstro do bestiário de onde a cópia saiu, se saiu de um. */
  base_monster_id: string | null
  notes: string
  updated_at: string
}

export interface Campaign {
  id: string
  name: string
  party: PartyMember[]
  npcs: Npc[]
  notes: string
  created_at: string
  updated_at: string
}

/** Item do índice de campanhas — o bastante para a lista sem abrir cada uma. */
export interface CampaignListItem {
  id: string
  name: string
  players: number
  updated_at: string
}
