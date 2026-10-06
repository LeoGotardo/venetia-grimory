import type { CharacterSheet } from './sheet'

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

export interface Campaign {
  id: string
  name: string
  party: PartyMember[]
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
