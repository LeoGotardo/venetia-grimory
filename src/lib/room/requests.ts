import type { RoomEvent } from './protocol.js'

export type RequestEvent = Extract<RoomEvent, { kind: 'request' }>
export type RollEvent = Extract<RoomEvent, { kind: 'roll' }>
export type AttackEvent = Extract<RoomEvent, { kind: 'attack' }>

/** O pedido de teste é para este membro? `member_ids: null` = todos os players. */
export const requestTargets = (request: RequestEvent, memberId: string) =>
  request.payload.member_ids == null || request.payload.member_ids.includes(memberId)

/** Rolagens que respondem ao pedido `version`, na ordem do log. */
export function repliesTo(events: RoomEvent[], version: number): RollEvent[] {
  return events.filter((e): e is RollEvent => e.kind === 'roll' && e.payload.reply_to === version)
}

/** Pedidos para este membro que ele ainda não rolou, do mais velho ao mais novo. */
export function pendingRequests(events: RoomEvent[], memberId: string): RequestEvent[] {
  const answered = new Set(events.flatMap(e =>
    e.kind === 'roll' && e.actor_member_id === memberId && e.payload.reply_to != null ? [e.payload.reply_to] : []))
  return events.filter((e): e is RequestEvent => e.kind === 'request' && requestTargets(e, memberId) && !answered.has(e.version))
}

/** O ataque acerta a CA? 1 natural erra e 20 natural acerta sempre (2024). */
export function attackHits(attack: AttackEvent, ac: number): boolean {
  if (attack.payload.natural === 1) return false
  if (attack.payload.natural === 20) return true
  return attack.payload.attack.total >= ac
}

/** "14 + 3" — os dados e o bônus de uma rolagem, para conferir o total. */
export function diceDetail(result: { rolls: number[]; bonus: number }): string {
  return `${result.rolls.join(' + ')}${result.bonus ? ` ${result.bonus > 0 ? '+' : '−'} ${Math.abs(result.bonus)}` : ''}`
}
