import type { RoomDoc, RoomEvent, RoomInfo, RoomMember, ServerMessage } from './protocol.js'
import { docKey } from './docs.js'
import { ROOM_LOG_MAX } from './constants.js'

/** O que o app sabe da sala conectada, montado só a partir das mensagens do servidor. */
export interface RoomView {
  room: RoomInfo | null
  members: RoomMember[]
  /** Ids dos membros com socket aberto. */
  online: string[]
  version: number
  closed: boolean
  /** Documentos vivos por `docKey`; lápides tiram a entrada. */
  docs: Record<string, RoomDoc>
  /** Rolagens e mensagens, da mais velha para a mais nova (só os últimos `ROOM_LOG_MAX`). */
  events: RoomEvent[]
}

export const EMPTY_ROOM_VIEW: RoomView = { room: null, members: [], online: [], version: 0, closed: false, docs: {}, events: [] }

/** Junta eventos sem repetir (reconexão pode reenviar) e mantém a ordem e o teto. */
function appendEvents(current: RoomEvent[], incoming: RoomEvent[]): RoomEvent[] {
  const seen = new Set(current.map(e => e.version))
  const fresh = incoming.filter(e => !seen.has(e.version))
  if (fresh.length === 0) return current
  return [...current, ...fresh].sort((a, b) => a.version - b.version).slice(-ROOM_LOG_MAX)
}

/** Aplica documentos novos sobre os que já havia: lápide apaga, o resto substitui. */
function mergeDocs(current: Record<string, RoomDoc>, incoming: RoomDoc[]): Record<string, RoomDoc> {
  const next = { ...current }
  for (const doc of incoming) {
    const key = docKey(doc)
    // Fora de ordem (reconexão no meio de um envio): o mais novo ganha.
    if ((next[key]?.version ?? -1) > doc.version) continue
    if (doc.deleted) delete next[key]
    else next[key] = doc
  }
  return next
}

const without = (ids: string[], id: string) => ids.filter(x => x !== id)

/** Aplica uma mensagem do socket. Puro: o store só guarda o resultado. */
export function applyServerMessage(view: RoomView, message: ServerMessage): RoomView {
  switch (message.t) {
    case 'ready':
      return {
        room: message.room,
        members: message.members,
        online: message.online,
        version: message.version,
        closed: false,
        docs: mergeDocs(message.full ? {} : view.docs, message.docs),
        events: appendEvents(message.full ? [] : view.events, message.events),
      }
    case 'doc':
      return { ...view, docs: mergeDocs(view.docs, [message.doc]), version: Math.max(view.version, message.doc.version) }
    case 'event':
      return { ...view, events: appendEvents(view.events, [message.event]), version: Math.max(view.version, message.event.version) }
    case 'member': {
      const exists = view.members.some(m => m.id === message.member.id)
      const members = exists
        ? view.members.map(m => (m.id === message.member.id ? message.member : m))
        : [...view.members, message.member]
      return { ...view, members }
    }
    case 'member_left':
      return {
        ...view,
        members: view.members.filter(m => m.id !== message.member_id),
        online: without(view.online, message.member_id),
      }
    case 'presence':
      return {
        ...view,
        online: message.online ? [...without(view.online, message.member_id), message.member_id] : without(view.online, message.member_id),
      }
    case 'closed':
      return { ...view, closed: true, online: [] }
    case 'pong':
      return view
  }
}
