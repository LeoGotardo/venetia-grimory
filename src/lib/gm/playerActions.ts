import type { Encounter, GridMap, PartyMember } from '../../types'
import { checkMove } from './movement'
import { controllerOf } from './tableView'

/**
 * Pedido de movimento de um player da sala, decidido no aparelho do mestre —
 * que vê o que a mesa não mostra (criatura escondida, terreno sob a névoa).
 * Vale só para o combatente dele, na vez dele, com o combate em andamento e
 * dentro do que resta do deslocamento por um caminho real, esteja ou não o
 * "Respeitar movimento" ligado: o mestre move livre, o player não.
 * Devolve o custo em metros, ou `null` (recusado).
 */
export function resolvePlayerMove(
  encounter: Encounter,
  map: Pick<GridMap, 'width' | 'height' | 'cells'>,
  party: PartyMember[],
  memberId: string,
  combatantId: string,
  to: { x: number; y: number },
): number | null {
  if (encounter.status !== 'active' || encounter.turn_id !== combatantId) return null
  const mover = encounter.combatants.find(c => c.id === combatantId)
  if (!mover?.position || mover.defeated || controllerOf(mover, party) !== memberId) return null
  const check = checkMove(map, mover, to, encounter.combatants, { strict: true, turnOwner: true })
  return check.ok ? check.cost : null
}
