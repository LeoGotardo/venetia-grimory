import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { RoomSocket, type SocketEnd, type SocketStatus } from './roomSocket'
import { ROOM_CLOSE, ROOM_HEARTBEAT_MS, ROOM_RECONNECT_DELAYS_MS } from '../constants'

/** WebSocket de mentira: o teste decide quando abre, o que chega e como fecha. */
class FakeSocket {
  static OPEN = 1
  static instances: FakeSocket[] = []
  readyState = 0
  sent: unknown[] = []
  onopen: (() => void) | null = null
  onmessage: ((event: { data: string }) => void) | null = null
  onclose: ((event: { code: number }) => void) | null = null
  readonly url: string

  constructor(url: string) {
    this.url = url
    FakeSocket.instances.push(this)
  }
  send(data: string) { this.sent.push(JSON.parse(data)) }
  close(code = 1000) { this.drop(code) }
  open() { this.readyState = FakeSocket.OPEN; this.onopen?.() }
  receive(message: unknown) { this.onmessage?.({ data: JSON.stringify(message) }) }
  drop(code: number) { this.readyState = 3; this.onclose?.({ code }) }
}

const READY = {
  t: 'ready',
  room: { id: '00000000-0000-4000-8000-000000000009', code: 'ABC234', name: 'Mina', created_at: '2026-10-09T12:00:00.000Z' },
  member: { id: '00000000-0000-4000-8000-000000000001', role: 'player', display_name: 'Aria', joined_at: '2026-10-09T12:00:00.000Z' },
  members: [],
  online: [],
  version: 7,
  docs: [],
  full: true,
  events: [],
}

function setup() {
  const statuses: SocketStatus[] = []
  const ends: SocketEnd[] = []
  const socket = new RoomSocket({
    url: 'ws://teste/api/room-ws',
    token: 't'.repeat(43),
    since: () => 7,
    onMessage: () => {},
    onStatus: s => statuses.push(s),
    onEnd: e => ends.push(e),
  })
  socket.start()
  return { socket, statuses, ends, last: () => FakeSocket.instances.at(-1)! }
}

describe('RoomSocket', () => {
  beforeEach(() => {
    FakeSocket.instances = []
    vi.useFakeTimers()
    vi.stubGlobal('WebSocket', FakeSocket)
    vi.stubGlobal('document', { visibilityState: 'visible', addEventListener: vi.fn(), removeEventListener: vi.fn() })
    vi.stubGlobal('window', { addEventListener: vi.fn(), removeEventListener: vi.fn() })
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('autentica no primeiro frame, com a versão já vista', () => {
    const { last, statuses } = setup()
    last().open()
    expect(last().sent).toEqual([{ t: 'auth', token: 't'.repeat(43), since: 7 }])
    last().receive(READY)
    expect(statuses).toEqual(['connecting', 'online'])
  })

  it('queda comum reconecta com espera crescente e zera depois do ready', () => {
    const { last, statuses } = setup()
    last().open()
    last().receive(READY)
    last().drop(1006)
    expect(statuses.at(-1)).toBe('reconnecting')
    vi.advanceTimersByTime(ROOM_RECONNECT_DELAYS_MS[0])
    expect(FakeSocket.instances).toHaveLength(2)

    last().drop(1006)
    vi.advanceTimersByTime(ROOM_RECONNECT_DELAYS_MS[1] - 1)
    expect(FakeSocket.instances).toHaveLength(2)
    vi.advanceTimersByTime(1)
    expect(FakeSocket.instances).toHaveLength(3)

    last().open()
    last().receive(READY)
    last().drop(1006)
    vi.advanceTimersByTime(ROOM_RECONNECT_DELAYS_MS[0])
    expect(FakeSocket.instances).toHaveLength(4)
  })

  it('fechamento com código de fim encerra sem reconectar', () => {
    const { last, ends } = setup()
    last().open()
    last().drop(ROOM_CLOSE.kicked)
    vi.advanceTimersByTime(60_000)
    expect(ends).toEqual(['kicked'])
    expect(FakeSocket.instances).toHaveLength(1)
  })

  it('manda ping depois do ready e para ao ser parado', () => {
    const { socket, last } = setup()
    last().open()
    last().receive(READY)
    vi.advanceTimersByTime(ROOM_HEARTBEAT_MS)
    expect(last().sent.at(-1)).toEqual({ t: 'ping' })
    socket.stop()
    vi.advanceTimersByTime(ROOM_HEARTBEAT_MS * 3)
    expect(last().sent.filter(m => (m as { t: string }).t === 'ping')).toHaveLength(1)
    expect(FakeSocket.instances).toHaveLength(1)
  })

  it('ignora mensagem fora do contrato', () => {
    const onMessage = vi.fn()
    const socket = new RoomSocket({
      url: 'ws://x', token: 't'.repeat(43), since: () => 0, onMessage, onStatus: () => {}, onEnd: () => {},
    })
    vi.spyOn(console, 'error').mockImplementation(() => {})
    socket.start()
    FakeSocket.instances[0].open()
    FakeSocket.instances[0].receive({ t: 'hack', payload: 1 })
    expect(onMessage).not.toHaveBeenCalled()
  })
})
