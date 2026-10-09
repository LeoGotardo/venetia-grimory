import { useEffect } from 'react'
import { ROOM_SHEET_PUSH_DEBOUNCE_MS, ROOM_TABLE_DOC_ID, ROOM_TABLE_PUSH_DEBOUNCE_MS } from '../constants'
import { useRoomStore } from '../store/roomStore'
import { useSheetStore } from '../store/sheetStore'
import { useGmStore } from '../store/gmStore'
import { loadSheet } from '../services/sheetStorage'
import type { RoomSheetEntry } from '../lib/gm/party'
import { buildTableState } from '../lib/gm/tableView'
import { docKey } from '../lib/room/docs'

/** Participação da sala conectada (a do socket aberto), se houver. */
function useActiveMembership() {
  return useRoomStore(s => s.memberships.find(m => m.room_id === s.activeRoomId) ?? null)
}

/**
 * Player: a cada conexão (e reconexão) manda a ficha gravada, e depois cada
 * edição dela, com debounce — mesmo com a página da sala fechada, porque a
 * ficha se edita em `/ficha/:id`.
 */
export function usePlayerSheetPush() {
  const membership = useActiveMembership()
  const online = useRoomStore(s => s.status === 'online')
  const pushSheet = useRoomStore(s => s.pushSheet)
  const sheetId = membership?.role === 'player' ? membership.sheet_id : null

  useEffect(() => {
    if (!online || !sheetId) return
    const stored = loadSheet(sheetId)
    if (stored) pushSheet(stored)

    let timer: ReturnType<typeof setTimeout> | null = null
    const unsubscribe = useSheetStore.subscribe(state => {
      if (state.sheetId !== sheetId) return
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => pushSheet(state.sheet), ROOM_SHEET_PUSH_DEBOUNCE_MS)
    })
    return () => {
      if (timer) clearTimeout(timer)
      unsubscribe()
    }
  }, [online, sheetId, pushSheet])
}

/**
 * Mestre: com a campanha da sala aberta e o socket pronto, as fichas da sala
 * entram na mesa. Só com `online`: antes do `ready` a lista de documentos está
 * vazia, e o merge tomaria isso por "todo mundo saiu".
 */
export function useGmRoomParty() {
  const membership = useActiveMembership()
  const online = useRoomStore(s => s.status === 'online')
  const docs = useRoomStore(s => s.docs)
  const campaignId = useGmStore(s => s.campaign?.id ?? null)
  const syncRoomPlayers = useGmStore(s => s.syncRoomPlayers)
  const linked = membership?.role === 'gm' && membership.campaign_id === campaignId

  useEffect(() => {
    if (!online || !linked) return
    const entries: RoomSheetEntry[] = Object.values(docs)
      .filter(doc => doc.kind === 'sheet' && doc.owner_member_id)
      .map(doc => ({ memberId: doc.owner_member_id!, version: doc.version, sheet: doc.data }))
    syncRoomPlayers(entries)
  }, [online, linked, docs, syncRoomPlayers])
}

/**
 * Mestre: transmite a mesa do encontro escolhido (`broadcast_encounter_id`) a
 * cada mudança, já filtrada. Encontro apagado ou transmissão desligada apagam a
 * mesa dos players — só se havia uma, para não gastar versão à toa.
 */
export function useGmTableBroadcast() {
  const membership = useActiveMembership()
  const online = useRoomStore(s => s.status === 'online')
  const hasTable = useRoomStore(s => Boolean(s.docs[docKey({ kind: 'table', id: ROOM_TABLE_DOC_ID })]))
  const publishTable = useRoomStore(s => s.publishTable)
  const campaign = useGmStore(s => s.campaign)
  const linked = membership?.role === 'gm' && campaign != null && membership.campaign_id === campaign.id
  const encounterId = linked ? membership.broadcast_encounter_id : null
  const encounter = encounterId ? campaign?.encounters.find(e => e.id === encounterId) ?? null : null
  const map = encounter?.map_id ? campaign?.maps.find(m => m.id === encounter.map_id) ?? null : null

  useEffect(() => {
    if (!online || !linked) return
    if (!encounter && !hasTable) return
    const timer = setTimeout(() => publishTable(encounter ? buildTableState(encounter, map) : null), ROOM_TABLE_PUSH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [online, linked, encounter, map, hasTable, publishTable])
}
