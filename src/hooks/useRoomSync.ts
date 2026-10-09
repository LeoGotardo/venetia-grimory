import { useEffect } from 'react'
import {
  ROOM_NOTE_PUSH_DEBOUNCE_MS, ROOM_SHEET_PUSH_DEBOUNCE_MS, ROOM_TABLE_DOC_ID, ROOM_TABLE_PUSH_DEBOUNCE_MS,
} from '../constants'
import { useRoomStore } from '../store/roomStore'
import { useSheetStore } from '../store/sheetStore'
import { useGmStore } from '../store/gmStore'
import { loadSheet } from '../services/sheetStorage'
import { setRoomRoller } from '../services/roomRoller'
import { useRoomConnection } from './useRoomConnection'
import type { RoomSheetEntry } from '../lib/gm/party'
import { buildTableState } from '../lib/gm/tableView'
import { tableVision } from '../lib/gm/vision'
import { docKey } from '../lib/room/docs'
import { findMentionTarget, mentionTargets, shareableNote } from '../lib/gm/notes'

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
 * cada mudança, já filtrada pela visão do grupo, e grava no mapa o que ele explorou. Encontro apagado ou transmissão desligada apagam a
 * mesa dos players — só se havia uma, para não gastar versão à toa.
 */
export function useGmTableBroadcast() {
  const membership = useActiveMembership()
  const online = useRoomStore(s => s.status === 'online')
  const hasTable = useRoomStore(s => Boolean(s.docs[docKey({ kind: 'table', id: ROOM_TABLE_DOC_ID })]))
  const publishTable = useRoomStore(s => s.publishTable)
  const campaign = useGmStore(s => s.campaign)
  const setMapExplored = useGmStore(s => s.setMapExplored)
  const linked = membership?.role === 'gm' && campaign != null && membership.campaign_id === campaign.id
  const encounterId = linked ? membership.broadcast_encounter_id : null
  const encounter = encounterId ? campaign?.encounters.find(e => e.id === encounterId) ?? null : null
  const map = encounter?.map_id ? campaign?.maps.find(m => m.id === encounter.map_id) ?? null : null

  useEffect(() => {
    if (!online || !linked) return
    if (!encounter && !hasTable) return
    const timer = setTimeout(() => {
      if (!encounter) {
        publishTable(null)
        return
      }
      // A exploração fica no mapa: a próxima batalha nele começa com o que o grupo já viu.
      const vision = map ? tableVision(encounter, map) : null
      if (map && vision && vision.explored !== (map.explored ?? null)) setMapExplored(map.id, vision.explored)
      publishTable(buildTableState(encounter, map, vision))
    }, ROOM_TABLE_PUSH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [online, linked, encounter, map, hasTable, publishTable, setMapExplored])
}

/**
 * Mestre: a sala espelha as notas marcadas como compartilhadas — publica cada
 * uma (com as citações já viradas nome) e tira as que deixaram de ser
 * compartilhadas ou foram apagadas.
 */
export function useGmSharedNotes() {
  const membership = useActiveMembership()
  const online = useRoomStore(s => s.status === 'online')
  const docs = useRoomStore(s => s.docs)
  const publishNote = useRoomStore(s => s.publishNote)
  const campaign = useGmStore(s => s.campaign)
  const bestiary = useGmStore(s => s.bestiary)
  const srd = useGmStore(s => s.srd)
  const linked = membership?.role === 'gm' && campaign != null && membership.campaign_id === campaign.id

  useEffect(() => {
    if (!online || !linked || !campaign) return
    const timer = setTimeout(() => {
      const targets = mentionTargets(campaign.party, campaign.npcs, bestiary, srd?.monsters ?? [])
      const nameOf = (mention: Parameters<typeof findMentionTarget>[1]) => findMentionTarget(targets, mention)?.name || null
      const shared = campaign.notes.filter(note => note.shared)
      for (const note of shared) publishNote(note.id, shareableNote(note, nameOf))
      const sharedIds = new Set(shared.map(note => note.id))
      for (const doc of Object.values(docs)) {
        if (doc.kind === 'note' && !sharedIds.has(doc.id)) publishNote(doc.id, null)
      }
    }, ROOM_NOTE_PUSH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [online, linked, campaign, bestiary, srd, docs, publishNote])
}

/** Player conectado: a ficha da sala ganha botões de rolar (ver `useSheetRoller`). */
export function usePlayerRoller() {
  const membership = useActiveMembership()
  const online = useRoomStore(s => s.status === 'online')
  const roll = useRoomStore(s => s.roll)
  const sheetId = membership?.role === 'player' ? membership.sheet_id : null

  useEffect(() => {
    if (!online || !sheetId) return
    setRoomRoller({ sheetId, roll: (expression, label) => roll(expression, label, false) })
    return () => setRoomRoller(null)
  }, [online, sheetId, roll])
}

/**
 * Player que abre o app direto na ficha: se ela está numa sala deste aparelho,
 * conecta — senão a ficha só sincronizaria (e só rolaria na sala) depois de
 * passar pela página da sala.
 */
export function usePlayerAutoConnect() {
  const sheetId = useSheetStore(s => s.sheetId)
  const roomId = useRoomStore(s => s.memberships.find(m => m.role === 'player' && m.sheet_id === sheetId)?.room_id ?? null)
  useRoomConnection(sheetId ? roomId : null)
}
