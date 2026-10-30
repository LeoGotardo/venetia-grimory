import http from 'node:http'
import { WebSocket, WebSocketServer, type RawData } from 'ws'
import { clientMessageSchema, type RoomError, type ServerMessage } from '../src/lib/room/protocol.js'
import {
  ROOM_AUTH_TIMEOUT_MS, ROOM_CLOSE, ROOM_CLOSE_RETRY, ROOM_CONNECT_RATE_LIMIT, ROOM_CONNECT_RATE_WINDOW_S,
  ROOM_DOC_RATE_LIMIT, ROOM_DOC_RATE_WINDOW_S, ROOM_EVENT_RATE_LIMIT, ROOM_EVENT_RATE_WINDOW_S, ROOM_LOG_MAX,
  ROOM_LOG_ON_READY, ROOM_PING_MIN_INTERVAL_MS,
} from '../src/lib/room/constants.js'
import { docVisibleTo, eventVisibleTo } from '../src/lib/room/docs.js'
import {
  ROOM_CHANNEL_PREFIX, createSubscriber, markOffline, markOnline, onlineMembers, overRateLimit, publish, roomChannel,
} from './_lib/redis.js'
import {
  addChat, addRoll, clearNote, clearTable, docsSince, eventsSince, listMembers, memberByToken, putNote, putSheet,
  putTable, touchMember, type AuthedMember,
} from './_lib/rooms.js'
import { RoomFailure, UNKNOWN_IP, socketClientIp } from './_lib/http.js'

/**
 * Socket da sala. O cliente conecta, manda `auth` com o token e recebe `ready`
 * (sala, membros, quem está online). Daí em diante esta instância repassa o que
 * chega no canal Redis da sala aos sockets dela — as escritas acontecem em
 * qualquer instância (HTTP ou outro socket) e publicam ali.
 *
 * Nada de estado durável em memória: a conexão cai no limite de duração da
 * função e o cliente reconecta, talvez em outra instância.
 */

/** Maior frame aceito — a ficha (fase 3) e a mesa (fase 4) cabem com folga. */
const MAX_PAYLOAD_BYTES = 1024 * 1024

interface Session {
  socket: WebSocket
  member: AuthedMember | null
  /** Quando este socket renovou a presença no Redis pela última vez. */
  presenceAt: number
}

const CLOSE_BY_ERROR: Partial<Record<RoomError, number>> = {
  kicked: ROOM_CLOSE.kicked,
  room_closed: ROOM_CLOSE.closed,
}

const sessionsByRoom = new Map<string, Set<Session>>()
const subscriber = createSubscriber()

subscriber.on('message', (channel: string, raw: string) => {
  const sessions = sessionsByRoom.get(channel.slice(ROOM_CHANNEL_PREFIX.length))
  if (!sessions) return
  let message: ServerMessage
  try {
    message = JSON.parse(raw) as ServerMessage
  } catch (err) {
    console.error('[room-ws] Mensagem do Redis ilegível.', err)
    return
  }
  for (const session of sessions) deliver(session, message, raw)
})

/** Repassa ao socket; mensagens que encerram a sessão dele também fecham o socket. */
function deliver(session: Session, message: ServerMessage, raw: string) {
  const { socket, member } = session
  if (!member) return
  if (message.t === 'doc' && !docVisibleTo(message.doc, member)) return
  if (message.t === 'event' && !eventVisibleTo(message.event, member)) return
  if (message.t === 'member_left' && message.member_id === member.id) {
    socket.close(message.reason === 'kicked' ? ROOM_CLOSE.kicked : ROOM_CLOSE.unauthorized, message.reason)
    return
  }
  socket.send(raw)
  if (message.t === 'closed') socket.close(ROOM_CLOSE.closed, 'closed')
}

function send(socket: WebSocket, message: ServerMessage) {
  socket.send(JSON.stringify(message))
}

/** Limite que falha aberto: um soluço do Redis não pode derrubar a sessão nem recusar todo mundo. */
async function limited(key: string, max: number, windowS: number): Promise<boolean> {
  try {
    return await overRateLimit(key, max, windowS)
  } catch (err) {
    console.error('[room-ws] Rate limit indisponível.', err)
    return false
  }
}

/** Conexões novas por IP. Sem IP não limita: um balde só para todos viraria um limite global. */
async function admit(socket: WebSocket, ip: string) {
  if (ip === UNKNOWN_IP) return
  if (await limited(`ratelimit:ws:${ip}`, ROOM_CONNECT_RATE_LIMIT, ROOM_CONNECT_RATE_WINDOW_S)) {
    console.warn(`[room-ws] Conexões acima do limite para ${ip}.`)
    socket.close(ROOM_CLOSE_RETRY, 'rate limited')
  }
}

async function attach(session: Session, member: AuthedMember) {
  const roomId = member.room.id
  const sessions = sessionsByRoom.get(roomId) ?? new Set()
  sessions.add(session)
  sessionsByRoom.set(roomId, sessions)
  if (sessions.size === 1) await subscriber.subscribe(roomChannel(roomId))
  session.presenceAt = Date.now()
  if (await markOnline(roomId, member.id)) await publish(roomId, { t: 'presence', member_id: member.id, online: true })
}

async function detach(session: Session) {
  const member = session.member
  if (!member) return
  const roomId = member.room.id
  const sessions = sessionsByRoom.get(roomId)
  sessions?.delete(session)
  if (sessions && sessions.size === 0) {
    sessionsByRoom.delete(roomId)
    await subscriber.unsubscribe(roomChannel(roomId))
  }
  // Outra aba do mesmo aparelho ainda conectada aqui: continua online.
  const stillHere = [...(sessions ?? [])].some(s => s.member?.id === member.id)
  if (stillHere) return
  await markOffline(roomId, member.id)
  await publish(roomId, { t: 'presence', member_id: member.id, online: false })
}

async function authenticate(session: Session, token: string, requestedSince: number) {
  const result = await memberByToken(token)
  if (typeof result === 'string') {
    session.socket.close(CLOSE_BY_ERROR[result] ?? ROOM_CLOSE.unauthorized, result)
    return
  }
  session.member = result
  await attach(session, result)
  // `since` de outra sala ou de um banco recriado passaria da versão atual: recomeça do zero.
  const since = requestedSince <= result.version ? requestedSince : 0
  const [members, online, changed, logged] = await Promise.all([
    listMembers(result.room.id), onlineMembers(result.room.id), docsSince(result.room.id, since),
    eventsSince(result.room.id, since, since === 0 ? ROOM_LOG_ON_READY : ROOM_LOG_MAX),
  ])
  const { room, version, ...member } = result
  const docs = changed.filter(doc => docVisibleTo(doc, member) && (since > 0 || !doc.deleted))
  const events = logged.filter(event => eventVisibleTo(event, member))
  send(session.socket, { t: 'ready', room, member, members, online, version, docs, full: since === 0, events })
  touchMember(result).catch(err => console.error('[room-ws] Falha ao gravar last_seen_at.', err))
}

async function handle(session: Session, data: RawData) {
  // Socket já fechado (limite, auth recusado…): o que ainda estava na fila não vale mais.
  if (session.socket.readyState !== WebSocket.OPEN) return
  let payload: unknown
  try {
    payload = JSON.parse(String(data))
  } catch {
    session.socket.close(ROOM_CLOSE.invalid, 'json')
    return
  }
  const parsed = clientMessageSchema.safeParse(payload)
  if (!parsed.success) {
    session.socket.close(ROOM_CLOSE.invalid, 'message')
    return
  }
  const message = parsed.data

  if (message.t === 'auth') {
    if (!session.member) await authenticate(session, message.token, message.since)
    return
  }
  if (!session.member) {
    session.socket.close(ROOM_CLOSE.unauthorized, 'auth first')
    return
  }
  if (message.t === 'ping') {
    const now = Date.now()
    if (now - session.presenceAt >= ROOM_PING_MIN_INTERVAL_MS) {
      session.presenceAt = now
      await markOnline(session.member.room.id, session.member.id)
    }
    send(session.socket, { t: 'pong' })
    return
  }
  const member = session.member
  if (message.t === 'roll' || message.t === 'chat') {
    if (await limited(`ratelimit:events:${member.id}`, ROOM_EVENT_RATE_LIMIT, ROOM_EVENT_RATE_WINDOW_S)) {
      console.warn(`[room-ws] ${message.t} acima do limite para ${member.id}.`)
      return
    }
    try {
      const event = message.t === 'roll' ? await addRoll(member, message) : await addChat(member, message)
      await publish(member.room.id, { t: 'event', event })
    } catch (err) {
      if (!(err instanceof RoomFailure)) throw err
      console.warn(`[room-ws] ${message.t} recusado (${err.code}) para ${member.id}.`)
    }
    return
  }
  if (await limited(`ratelimit:docs:${member.id}`, ROOM_DOC_RATE_LIMIT, ROOM_DOC_RATE_WINDOW_S)) {
    // Descartar deixaria a sala velha (o cliente já marcou como enviado); ao reconectar ele reenvia tudo.
    console.warn(`[room-ws] ${message.t} acima do limite para ${member.id}; fechando para reenviar.`)
    session.socket.close(ROOM_CLOSE_RETRY, 'rate limited')
    return
  }
  try {
    const doc = message.t === 'sheet_put' ? await putSheet(member, message.sheet)
      : message.t === 'table_put' ? await putTable(member, message.table)
      : message.t === 'table_clear' ? await clearTable(member)
      : message.t === 'note_put' ? await putNote(member, message.id, message.note)
      : await clearNote(member, message.id)
    if (doc) await publish(member.room.id, { t: 'doc', doc })
  } catch (err) {
    // Grande demais ou papel errado (player transmitindo mesa): erro do cliente, não derruba a sessão.
    if (!(err instanceof RoomFailure)) throw err
    console.warn(`[room-ws] ${message.t} recusado (${err.code}) para ${member.id}.`)
  }
}

const server = http.createServer((_req, res) => {
  res.writeHead(426, { 'content-type': 'text/plain' }).end('Upgrade Required')
})
const wss = new WebSocketServer({ server, maxPayload: MAX_PAYLOAD_BYTES })

wss.on('connection', (socket, request) => {
  const session: Session = { socket, member: null, presenceAt: 0 }
  const authTimer = setTimeout(() => {
    if (!session.member) socket.close(ROOM_CLOSE.unauthorized, 'auth timeout')
  }, ROOM_AUTH_TIMEOUT_MS)

  // Em ordem: o limite de conexões e o `auth` terminam antes do próximo frame ser tratado.
  let queue = admit(socket, socketClientIp(request))
  socket.on('message', data => {
    queue = queue.then(() => handle(session, data)).catch(err => {
      console.error('[room-ws] Falha ao tratar mensagem.', err)
      socket.close(1011, 'server error')
    })
  })

  socket.on('close', () => {
    clearTimeout(authTimer)
    queue.then(() => detach(session)).catch(err => console.error('[room-ws] Falha ao sair da sala.', err))
  })
})

export default server
