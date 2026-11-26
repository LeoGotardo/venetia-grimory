import { create } from 'zustand'
import type { CharacterSheet } from '../types'
import { ROOM_SHEET_MAX_BYTES, ROOM_TABLE_MAX_BYTES } from '../constants'
import {
  roomScheduleSchema, sharedNoteSchema, tableStateSchema,
  type RollCheck, type RoomJoined, type RoomSchedule, type RoomSession, type ServerMessage, type SharedNote, type TableState,
} from '../lib/room/protocol'
import { EMPTY_ROOM_VIEW, applyServerMessage, type RoomView } from '../lib/room/session'
import { readMemberships, rememberActiveRoom, writeMemberships, type RoomMembership } from '../services/roomStorage'
import { roomApi, roomSocketUrl } from '../services/roomApi'
import { RoomSocket, type SocketEnd, type SocketStatus } from '../services/roomSocket'
import { enableRoomSync } from '../services/roomSyncGate'

/** `idle` = sem sala conectada; os fins (`closed`, `kicked`…) ficam até a pessoa dispensar. */
export type RoomConnectionStatus = 'idle' | SocketStatus | SocketEnd

interface RoomState extends RoomView {
  /** Salas deste aparelho, persistidas em `dnd_salas`. */
  memberships: RoomMembership[]
  /** Sala com socket aberto (só uma por vez). */
  activeRoomId: string | null
  /** Agenda de sessões de cada sala deste aparelho (lida ao abrir o app e ao vivo na sala conectada). */
  schedules: Record<string, RoomSession[]>
  setSchedule: (roomId: string, sessions: RoomSession[]) => void
  /** Mestre: ataques (`sala:versão` do evento) cujo dano já foi aplicado neste aparelho — o botão não aplica duas vezes. */
  appliedAttacks: string[]
  markAttackApplied: (key: string) => void
  status: RoomConnectionStatus

  /** Mestre: abre a sala da campanha. Lança `RoomApiError`. */
  createRoom: (campaign: { id: string; name: string }, displayName: string) => Promise<RoomMembership>
  /** Player: entra pelo código com uma ficha deste aparelho. Lança `RoomApiError`. */
  joinRoom: (code: string, displayName: string, sheetId: string | null) => Promise<RoomMembership>
  /** Liga o socket da sala (troca de sala se outra estiver ligada). */
  connect: (roomId: string) => void
  disconnect: () => void
  /** Mestre: fecha a sala para todos e a esquece neste aparelho. */
  closeRoom: (roomId: string) => Promise<void>
  /** Mestre: tira um player da sala conectada. */
  kick: (memberId: string) => Promise<void>
  /** Player: sai da sala e a esquece neste aparelho. */
  leaveRoom: (roomId: string) => Promise<void>
  /** Relê as salas gravadas (vieram da conta, de outro aparelho); a conectada que sumiu desliga. */
  reloadMemberships: () => void
  /** Esquece a sala neste aparelho sem avisar o servidor (já fechada ou removido). */
  forgetRoom: (roomId: string) => void
  /** Player: manda a ficha à sala conectada. Igual à última enviada nesta conexão, não manda. */
  pushSheet: (sheet: CharacterSheet) => void
  /** Mestre: escolhe o encontro transmitido como mesa (`null` para de transmitir). */
  setBroadcast: (roomId: string, encounterId: string | null) => void
  /** Mestre: manda a mesa filtrada (`null` apaga a mesa dos players). Igual à última, não manda. */
  publishTable: (table: TableState | null) => void
  /** Rola no servidor (a expressão já validada por `parseRoomRoll`). `replyTo`: o pedido de teste que responde. Devolve se mandou. */
  roll: (expression: string, label: string, isPrivate: boolean, replyTo?: number) => boolean
  /** Mestre: pede um teste (`memberIds: null` = todos os players). */
  requestRoll: (check: RollCheck, label: string, memberIds: string[] | null, secret: boolean) => boolean
  /** Player: ataca na mesa com o próprio combatente (o servidor rola acerto e dano). */
  attack: (input: { combatantId: string; targetId: string; label: string; attack: string; damage: string | null; damageType: string }) => boolean
  /** Player: pede ao mestre para mover o próprio combatente. */
  requestMove: (combatantId: string, to: { x: number; y: number }) => boolean
  /** Mestre: grava a agenda de sessões inteira. */
  publishSchedule: (schedule: RoomSchedule) => boolean
  /** Mensagem no chat da sala. Devolve se mandou. */
  say: (text: string, isPrivate: boolean) => boolean
  /** Mestre: publica a nota compartilhada (`null` tira da sala). Igual à última enviada, não manda. */
  publishNote: (id: string, note: SharedNote | null) => void
}

let socket: RoomSocket | null = null

type Intent = Extract<ServerMessage, { t: 'intent' }>
const intentListeners = new Set<(intent: Intent) => void>()
/** Mestre: pedidos dos players (mover o combatente) — quem decide é o encontro aberto. */
export function subscribeIntents(listener: (intent: Intent) => void): () => void {
  intentListeners.add(listener)
  return () => intentListeners.delete(listener)
}
/** JSON da última ficha e da última mesa enviadas nesta conexão — reconectar zera, porque o envio pode ter se perdido. */
let lastPushedSheet: string | null = null
let lastPushedTable: string | null = null
const lastPushedNotes = new Map<string, string>()

function membershipFrom(joined: RoomJoined, extra: Pick<RoomMembership, 'campaign_id' | 'sheet_id'>): RoomMembership {
  return {
    room_id: joined.room.id,
    code: joined.room.code,
    name: joined.room.name,
    role: joined.member.role,
    member_id: joined.member.id,
    display_name: joined.member.display_name,
    token: joined.token,
    joined_at: joined.member.joined_at,
    broadcast_encounter_id: null,
    ...extra,
  }
}

export const useRoomStore = create<RoomState>((set, get) => {
  function saveMemberships(memberships: RoomMembership[]) {
    writeMemberships(memberships)
    set({ memberships })
  }

  function addMembership(membership: RoomMembership) {
    saveMemberships([...get().memberships.filter(m => m.room_id !== membership.room_id), membership])
    enableRoomSync()
    return membership
  }

  function tokenOf(roomId: string): string {
    const membership = get().memberships.find(m => m.room_id === roomId)
    if (!membership) throw new Error(`Sala ${roomId} não está neste aparelho.`)
    return membership.token
  }

  return {
    ...EMPTY_ROOM_VIEW,
    memberships: readMemberships(),
    activeRoomId: null,
    status: 'idle',
    schedules: {},
    setSchedule: (roomId, sessions) => set(s => ({ schedules: { ...s.schedules, [roomId]: sessions } })),
    appliedAttacks: [],
    markAttackApplied: key => set(s => ({ appliedAttacks: [...s.appliedAttacks, key] })),

    createRoom: async (campaign, displayName) => {
      const joined = await roomApi.create({ name: campaign.name, campaign_id: campaign.id, display_name: displayName })
      return addMembership(membershipFrom(joined, { campaign_id: campaign.id, sheet_id: null }))
    },

    joinRoom: async (code, displayName, sheetId) => {
      // Já está nesta sala: entrar de novo criaria um segundo membro no servidor (o mestre veria a ficha duas vezes).
      const existing = get().memberships.find(m => m.code === code && m.role === 'player')
      if (existing) return existing
      const joined = await roomApi.join({ code, display_name: displayName })
      return addMembership(membershipFrom(joined, { campaign_id: null, sheet_id: sheetId }))
    },

    connect: roomId => {
      const { activeRoomId, status } = get()
      if (socket && activeRoomId === roomId) return
      const membership = get().memberships.find(m => m.room_id === roomId)
      if (!membership) return
      // Fim já mostrado para esta sala (fechada, removido): não insiste até a pessoa dispensar.
      if (activeRoomId === roomId && (status === 'closed' || status === 'kicked' || status === 'unauthorized')) return

      get().disconnect()
      rememberActiveRoom(roomId)
      set({ ...EMPTY_ROOM_VIEW, activeRoomId: roomId, status: 'connecting' })
      socket = new RoomSocket({
        url: roomSocketUrl(),
        token: membership.token,
        since: () => (get().activeRoomId === roomId ? get().version : 0),
        onMessage: message => {
          if (get().activeRoomId !== roomId) return
          if (message.t === 'intent') {
            for (const listener of intentListeners) listener(message)
            return
          }
          set(applyServerMessage(get(), message))
        },
        onStatus: next => {
          if (get().activeRoomId !== roomId) return
          if (next === 'online') {
            lastPushedSheet = null
            lastPushedTable = null
            lastPushedNotes.clear()
          }
          set({ status: next })
        },
        onEnd: reason => {
          if (get().activeRoomId !== roomId) return
          socket = null
          set({ status: reason, online: [] })
        },
      })
      socket.start()
    },

    disconnect: () => {
      socket?.stop()
      socket = null
      set({ ...EMPTY_ROOM_VIEW, activeRoomId: null, status: 'idle' })
    },

    closeRoom: async roomId => {
      await roomApi.close(tokenOf(roomId))
      get().forgetRoom(roomId)
    },

    kick: async memberId => {
      const { activeRoomId } = get()
      if (!activeRoomId) return
      await roomApi.kick(tokenOf(activeRoomId), memberId)
    },

    leaveRoom: async roomId => {
      await roomApi.leave(tokenOf(roomId))
      get().forgetRoom(roomId)
    },

    reloadMemberships: () => {
      const memberships = readMemberships()
      set({ memberships })
      const { activeRoomId } = get()
      if (activeRoomId && !memberships.some(m => m.room_id === activeRoomId)) get().disconnect()
      if (memberships.length > 0) enableRoomSync()
    },

    forgetRoom: roomId => {
      if (get().activeRoomId === roomId) get().disconnect()
      saveMemberships(get().memberships.filter(m => m.room_id !== roomId))
    },

    pushSheet: sheet => {
      if (!socket || get().status !== 'online') return
      const json = JSON.stringify(sheet)
      if (json === lastPushedSheet) return
      if (json.length > ROOM_SHEET_MAX_BYTES) {
        console.error(`[salas] Ficha com ${json.length} bytes passa do limite da sala; não foi enviada.`)
        return
      }
      if (socket.send({ t: 'sheet_put', sheet: sheet as unknown as Record<string, unknown> })) lastPushedSheet = json
    },

    setBroadcast: (roomId, encounterId) => {
      saveMemberships(get().memberships.map(m => (m.room_id === roomId ? { ...m, broadcast_encounter_id: encounterId } : m)))
    },

    publishTable: table => {
      if (!socket || get().status !== 'online') return
      // Mesa fora do contrato faria o servidor fechar o socket do mestre: não manda e registra.
      const check = table ? tableStateSchema.safeParse(table) : null
      if (check && !check.success) {
        console.error('[salas] Mesa fora do contrato; não foi transmitida.', check.error)
        return
      }
      const json = table ? JSON.stringify(table) : 'clear'
      if (json === lastPushedTable) return
      if (json.length > ROOM_TABLE_MAX_BYTES) {
        console.error(`[salas] Mesa com ${json.length} bytes passa do limite da sala; não foi transmitida.`)
        return
      }
      if (socket.send(table ? { t: 'table_put', table } : { t: 'table_clear' })) lastPushedTable = json
    },

    roll: (expression, label, isPrivate, replyTo) =>
      get().status === 'online' && socket != null && socket.send({ t: 'roll', expression, label, private: isPrivate, reply_to: replyTo ?? null }),

    requestRoll: (check, label, memberIds, secret) =>
      get().status === 'online' && socket != null && socket.send({ t: 'request', check, label, member_ids: memberIds, secret }),

    attack: input =>
      get().status === 'online' && socket != null && socket.send({
        t: 'attack', combatant_id: input.combatantId, target_id: input.targetId, label: input.label,
        attack: input.attack, damage: input.damage, damage_type: input.damageType,
      }),

    requestMove: (combatantId, to) =>
      get().status === 'online' && socket != null && socket.send({ t: 'move', combatant_id: combatantId, to }),

    publishSchedule: schedule => {
      if (!socket || get().status !== 'online') return false
      if (!roomScheduleSchema.safeParse(schedule).success) {
        console.error('[salas] Agenda fora do contrato; não foi enviada.')
        return false
      }
      return socket.send({ t: 'schedule_put', schedule })
    },

    say: (text, isPrivate) =>
      get().status === 'online' && socket != null && socket.send({ t: 'chat', text, private: isPrivate }),

    publishNote: (id, note) => {
      if (!socket || get().status !== 'online') return
      const json = note ? JSON.stringify(note) : 'clear'
      if (lastPushedNotes.get(id) === json) return
      const check = note ? sharedNoteSchema.safeParse(note) : null
      if (check && !check.success) {
        console.error('[salas] Nota grande demais para a sala; não foi publicada.', check.error)
        return
      }
      if (socket.send(note ? { t: 'note_put', id, note } : { t: 'note_clear', id })) lastPushedNotes.set(id, json)
    },
  }
})

/** Sala que o mestre abriu para esta campanha, se houver. */
export function campaignRoom(memberships: RoomMembership[], campaignId: string): RoomMembership | null {
  return memberships.find(m => m.role === 'gm' && m.campaign_id === campaignId) ?? null
}
