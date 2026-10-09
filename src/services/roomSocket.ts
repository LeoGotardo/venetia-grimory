import { ROOM_CLOSE, ROOM_HEARTBEAT_MS, ROOM_RECONNECT_DELAYS_MS } from '../constants'
import { serverMessageSchema, type ClientMessage, type ServerMessage } from '../lib/room/protocol'

export type SocketStatus = 'connecting' | 'online' | 'reconnecting'
/** Fins de sessão que não adianta reconectar. */
export type SocketEnd = 'closed' | 'kicked' | 'unauthorized' | 'invalid'

const END_BY_CODE: Record<number, SocketEnd> = {
  [ROOM_CLOSE.closed]: 'closed',
  [ROOM_CLOSE.kicked]: 'kicked',
  [ROOM_CLOSE.unauthorized]: 'unauthorized',
  [ROOM_CLOSE.invalid]: 'invalid',
}

interface RoomSocketOptions {
  url: string
  token: string
  /** Última versão da sala que o app viu — o servidor manda o que mudou depois dela. */
  since: () => number
  onMessage: (message: ServerMessage) => void
  onStatus: (status: SocketStatus) => void
  onEnd: (reason: SocketEnd) => void
}

/**
 * Conexão com a sala que se refaz sozinha: queda de rede, app em segundo plano
 * e o limite de duração da função (5 min no plano Hobby) só custam uma
 * reconexão com espera crescente. Fechamentos com código de fim
 * (`ROOM_CLOSE`) encerram de vez.
 */
export class RoomSocket {
  private readonly options: RoomSocketOptions
  private socket: WebSocket | null = null
  private attempt = 0
  private stopped = true
  private heartbeat: ReturnType<typeof setInterval> | null = null
  private retry: ReturnType<typeof setTimeout> | null = null

  constructor(options: RoomSocketOptions) {
    this.options = options
  }

  start(): void {
    if (!this.stopped) return
    this.stopped = false
    document.addEventListener('visibilitychange', this.reconnectNow)
    window.addEventListener('online', this.reconnectNow)
    this.open()
  }

  stop(): void {
    this.stopped = true
    this.clearTimers()
    document.removeEventListener('visibilitychange', this.reconnectNow)
    window.removeEventListener('online', this.reconnectNow)
    const socket = this.socket
    this.socket = null
    socket?.close(1000, 'bye')
  }

  /** Manda se a conexão está aberta; devolve se mandou (fechada, quem chama reenvia no próximo `ready`). */
  send(message: ClientMessage): boolean {
    if (this.socket?.readyState !== WebSocket.OPEN) return false
    this.socket.send(JSON.stringify(message))
    return true
  }

  private open(): void {
    this.options.onStatus(this.attempt === 0 ? 'connecting' : 'reconnecting')
    const socket = new WebSocket(this.options.url)
    this.socket = socket

    socket.onopen = () => this.send({ t: 'auth', token: this.options.token, since: this.options.since() })

    socket.onmessage = event => {
      const parsed = serverMessageSchema.safeParse(safeJson(event.data))
      if (!parsed.success) {
        console.error('[salas] Mensagem do servidor fora do contrato.', parsed.error)
        return
      }
      if (parsed.data.t === 'ready') {
        this.attempt = 0
        this.startHeartbeat()
        this.options.onStatus('online')
      }
      this.options.onMessage(parsed.data)
    }

    socket.onclose = event => {
      if (this.socket !== socket) return
      this.socket = null
      this.clearTimers()
      if (this.stopped) return
      const end = END_BY_CODE[event.code]
      if (end) {
        this.stop()
        this.options.onEnd(end)
        return
      }
      this.scheduleReconnect()
    }
  }

  private scheduleReconnect(): void {
    const delay = ROOM_RECONNECT_DELAYS_MS[Math.min(this.attempt, ROOM_RECONNECT_DELAYS_MS.length - 1)]
    this.attempt++
    this.options.onStatus('reconnecting')
    this.retry = setTimeout(() => this.open(), delay)
  }

  /** Voltou ao app ou à rede: não espera o fim do backoff. */
  private reconnectNow = () => {
    if (this.stopped || this.socket || document.visibilityState !== 'visible') return
    this.clearTimers()
    this.open()
  }

  private startHeartbeat(): void {
    if (this.heartbeat) clearInterval(this.heartbeat)
    this.heartbeat = setInterval(() => this.send({ t: 'ping' }), ROOM_HEARTBEAT_MS)
  }

  private clearTimers(): void {
    if (this.heartbeat) clearInterval(this.heartbeat)
    if (this.retry) clearTimeout(this.retry)
    this.heartbeat = null
    this.retry = null
  }
}

function safeJson(data: unknown): unknown {
  try {
    return JSON.parse(String(data))
  } catch {
    return null
  }
}
