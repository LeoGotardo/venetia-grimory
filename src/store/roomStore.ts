import { create } from 'zustand'
import type { CharacterSheet } from '../types'
import { ROOM_SHEET_MAX_BYTES, ROOM_TABLE_MAX_BYTES } from '../constants'
import { tableStateSchema, type RoomJoined, type TableState } from '../lib/room/protocol'
import { EMPTY_ROOM_VIEW, applyServerMessage, type RoomView } from '../lib/room/session'
import { readMemberships, writeMemberships, type RoomMembership } from '../services/roomStorage'
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
  /** Esquece a sala neste aparelho sem avisar o servidor (já fechada ou removido). */
  forgetRoom: (roomId: string) => void
  /** Player: manda a ficha à sala conectada. Igual à última enviada nesta conexão, não manda. */
  pushSheet: (sheet: CharacterSheet) => void
  /** Mestre: escolhe o encontro transmitido como mesa (`null` para de transmitir). */
  setBroadcast: (roomId: string, encounterId: string | null) => void
  /** Mestre: manda a mesa filtrada (`null` apaga a mesa dos players). Igual à última, não manda. */
  publishTable: (table: TableState | null) => void
  /** Rola no servidor (a expressão já validada por `parseRoomRoll`). Devolve se mandou. */
  roll: (expression: string, label: string, isPrivate: boolean) => boolean
  /** Mensagem no chat da sala. Devolve se mandou. */
  say: (text: string, isPrivate: boolean) => boolean
}

let socket: RoomSocket | null = null
/** JSON da última ficha e da última mesa enviadas nesta conexão — reconectar zera, porque o envio pode ter se perdido. */
let lastPushedSheet: string | null = null
let lastPushedTable: string | null = null

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

    createRoom: async (campaign, displayName) => {
      const joined = await roomApi.create({ name: campaign.name, campaign_id: campaign.id, display_name: displayName })
      return addMembership(membershipFrom(joined, { campaign_id: campaign.id, sheet_id: null }))
    },

    joinRoom: async (code, displayName, sheetId) => {
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
      set({ ...EMPTY_ROOM_VIEW, activeRoomId: roomId, status: 'connecting' })
      socket = new RoomSocket({
        url: roomSocketUrl(),
        token: membership.token,
        since: () => (get().activeRoomId === roomId ? get().version : 0),
        onMessage: message => {
          if (get().activeRoomId !== roomId) return
          set(applyServerMessage(get(), message))
        },
        onStatus: next => {
          if (get().activeRoomId !== roomId) return
          if (next === 'online') {
            lastPushedSheet = null
            lastPushedTable = null
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

    roll: (expression, label, isPrivate) =>
      get().status === 'online' && socket != null && socket.send({ t: 'roll', expression, label, private: isPrivate }),

    say: (text, isPrivate) =>
      get().status === 'online' && socket != null && socket.send({ t: 'chat', text, private: isPrivate }),
  }
})

/** Sala que o mestre abriu para esta campanha, se houver. */
export function campaignRoom(memberships: RoomMembership[], campaignId: string): RoomMembership | null {
  return memberships.find(m => m.role === 'gm' && m.campaign_id === campaignId) ?? null
}
