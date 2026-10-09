import type { RoomDoc, RoomEvent, RoomMember } from './protocol.js'

export const docKey = (doc: Pick<RoomDoc, 'kind' | 'id'>) => `${doc.kind}:${doc.id}`

/**
 * Quem recebe cada documento. A ficha vai só ao mestre e ao dono — os outros
 * players não precisam dela; mesa e notas compartilhadas vão a todos.
 * O servidor aplica isto antes de mandar qualquer coisa a um socket.
 */
export function docVisibleTo(doc: Pick<RoomDoc, 'kind' | 'owner_member_id'>, member: Pick<RoomMember, 'id' | 'role'>): boolean {
  if (doc.kind !== 'sheet') return true
  return member.role === 'gm' || doc.owner_member_id === member.id
}

/** Evento privado (rolagem ou mensagem "só o mestre") chega ao mestre e a quem o fez. */
export function eventVisibleTo(event: Pick<RoomEvent, 'private' | 'actor_member_id'>, member: Pick<RoomMember, 'id' | 'role'>): boolean {
  return !event.private || member.role === 'gm' || event.actor_member_id === member.id
}
