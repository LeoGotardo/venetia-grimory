import type { RoomDoc, RoomEvent, RoomMember, ServerMessage } from './protocol.js'

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

/** O que existia antes do protocolo 2: só isto vai para um app que não mandou `protocol` no `auth`. */
const V1_DOC_KINDS: ReadonlySet<string> = new Set(['sheet', 'table', 'note'])
const V1_EVENT_KINDS: ReadonlySet<string> = new Set(['roll', 'chat'])
/** E antes do protocolo 3 (salvaguarda e cura dos players). */
const V2_EVENT_KINDS: ReadonlySet<string> = new Set(['roll', 'chat', 'request', 'attack'])

export const docForProtocol = (doc: Pick<RoomDoc, 'kind'>, protocol: number) => protocol >= 2 || V1_DOC_KINDS.has(doc.kind)
export const eventForProtocol = (event: Pick<RoomEvent, 'kind'>, protocol: number) =>
  protocol >= 3 || (protocol === 2 ? V2_EVENT_KINDS : V1_EVENT_KINDS).has(event.kind)

/** Mensagem avulsa do canal da sala: pode ir a um socket que fala `protocol`? */
export function messageForProtocol(message: ServerMessage, protocol: number): boolean {
  if (message.t === 'doc') return docForProtocol(message.doc, protocol)
  if (message.t === 'event') return eventForProtocol(message.event, protocol)
  if (message.t === 'intent') return protocol >= 2
  return true
}
