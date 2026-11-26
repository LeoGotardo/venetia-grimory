import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ROOM_NOTE_PUSH_DEBOUNCE_MS, ROOM_SCHEDULE_DOC_ID, ROOM_SHEET_PUSH_DEBOUNCE_MS, ROOM_TABLE_DOC_ID, ROOM_TABLE_PUSH_DEBOUNCE_MS,
  SESSION_SCHEDULE_REFRESH_MS,
} from '../constants'
import { subscribeIntents, useRoomStore } from '../store/roomStore'
import { useSheetStore } from '../store/sheetStore'
import { useGmStore } from '../store/gmStore'
import { loadSheet } from '../services/sheetStorage'
import { preferredRoom, roomPagePath } from '../services/roomStorage'
import { roomApi } from '../services/roomApi'
import { cancelRemindersExcept, onReminderTap, syncRoomReminders } from '../services/sessionReminders'
import { useConfigStore } from '../store/configStore'
import { setRoomRoller } from '../services/roomRoller'
import { useRoomConnection } from './useRoomConnection'
import type { RoomSheetEntry } from '../lib/gm/party'
import { buildTableState } from '../lib/gm/tableView'
import { tableVision } from '../lib/gm/vision'
import { docKey } from '../lib/room/docs'
import { roomScheduleSchema, tableStateSchema } from '../lib/room/protocol'
import { resolvePlayerMove } from '../lib/gm/playerActions'
import { findMentionTarget, mentionTargets, shareableNote } from '../lib/gm/notes'

/** Participação da sala conectada (a do socket aberto), se houver. */
export function useActiveMembership() {
  return useRoomStore(s => s.memberships.find(m => m.room_id === s.activeRoomId) ?? null)
}

/** A ficha com que o player entrou: a aberta no store (com a edição mais recente) ou a gravada. */
export function readRoomSheet(sheetId: string | null) {
  if (!sheetId) return null
  const state = useSheetStore.getState()
  return state.sheetId === sheetId ? state.sheet : loadSheet(sheetId)
}

/**
 * Mestre: o encontro transmitido à mesa da sala conectada, com a campanha dele
 * aberta — é onde caem os ataques e os movimentos que os players pedem.
 */
export function useBroadcastEncounter() {
  const membership = useActiveMembership()
  const campaign = useGmStore(s => s.campaign)
  if (membership?.role !== 'gm' || !campaign || membership.campaign_id !== campaign.id || !membership.broadcast_encounter_id) return null
  const encounter = campaign.encounters.find(e => e.id === membership.broadcast_encounter_id)
  return encounter ? { campaign, encounter } : null
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
      publishTable(buildTableState(encounter, map, vision, campaign?.party))
    }, ROOM_TABLE_PUSH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [online, linked, encounter, map, hasTable, publishTable, setMapExplored, campaign?.party])
}

/**
 * Mestre: aplica o movimento que um player pediu na mesa — se for o dele, na
 * vez dele e dentro do alcance (`resolvePlayerMove`). Lê o estado na hora em
 * que o pedido chega, não o da última renderização.
 */
export function useGmPlayerIntents() {
  useEffect(() => subscribeIntents(({ member_id, intent }) => {
    const room = useRoomStore.getState()
    const membership = room.memberships.find(m => m.room_id === room.activeRoomId)
    const { campaign, moveCombatant } = useGmStore.getState()
    if (membership?.role !== 'gm' || !campaign || membership.campaign_id !== campaign.id) return
    const encounter = campaign.encounters.find(e => e.id === membership.broadcast_encounter_id)
    const map = encounter?.map_id ? campaign.maps.find(m => m.id === encounter.map_id) : null
    if (!encounter || !map) return
    const cost = resolvePlayerMove(encounter, map, campaign.party, member_id, intent.combatant_id, intent.to)
    if (cost != null) moveCombatant(encounter.id, intent.combatant_id, intent.to, cost)
  }), [])
}

/** Encontros para os quais este app já levou o player à mesa — uma vez por encontro, para não prendê-lo lá. */
const redirectedEncounters = new Set<string>()

/**
 * Player: quando o mestre começa o combate transmitido, o app vai para a mesa
 * da sala (de qualquer tela). Uma vez por encontro: voltar para a ficha não
 * puxa a pessoa de novo.
 */
export function usePlayerEncounterRedirect() {
  const membership = useActiveMembership()
  const tableDoc = useRoomStore(s => s.docs[docKey({ kind: 'table', id: ROOM_TABLE_DOC_ID })])
  const navigate = useNavigate()
  const code = membership?.role === 'player' ? membership.code : null

  useEffect(() => {
    if (!code || !tableDoc) return
    const table = tableStateSchema.safeParse(tableDoc.data)
    if (!table.success || table.data.status !== 'active') return
    const key = `${code}:${table.data.encounter_id}`
    if (redirectedEncounters.has(key)) return
    redirectedEncounters.add(key)
    navigate(`/sala/${code}?aba=mesa`)
  }, [code, tableDoc, navigate])
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
 * Quem está numa sala fica nela: ao abrir o app (em qualquer tela) o socket
 * liga na última sala usada, e abrir a ficha de uma sala troca para ela. Antes
 * a conexão só existia na página da sala ou na ficha, e a pessoa não sabia se
 * estava "dentro" — nem recebia o início do combate ou os pedidos do mestre.
 */
export function usePlayerAutoConnect() {
  const sheetId = useSheetStore(s => s.sheetId)
  const sheetRoom = useRoomStore(s => s.memberships.find(m => m.role === 'player' && m.sheet_id === sheetId)?.room_id ?? null)
  const idle = useRoomStore(s => s.activeRoomId == null)
  const memberships = useRoomStore(s => s.memberships)
  const connect = useRoomStore(s => s.connect)
  useRoomConnection(sheetId ? sheetRoom : null)
  useEffect(() => {
    const fallback = idle ? preferredRoom(memberships) : null
    if (fallback) connect(fallback)
  }, [idle, memberships, connect])
}

/**
 * Agenda de sessões de todas as salas deste aparelho: lida pela API ao abrir o
 * app e ao voltar a ele (no máximo a cada `SESSION_SCHEDULE_REFRESH_MS`), e ao
 * vivo pela sala conectada. Cada mudança reagenda os lembretes daquela sala.
 */
export function useSessionSchedules() {
  const memberships = useRoomStore(s => s.memberships)
  const activeRoomId = useRoomStore(s => s.activeRoomId)
  const scheduleDoc = useRoomStore(s => s.docs[docKey({ kind: 'schedule', id: ROOM_SCHEDULE_DOC_ID })])
  const schedules = useRoomStore(s => s.schedules)
  const setSchedule = useRoomStore(s => s.setSchedule)
  const remindersOn = useConfigStore(s => s.config.session_reminders)
  const navigate = useNavigate()

  useEffect(() => onReminderTap(path => navigate(path)), [navigate])

  // Ao vivo: a sala conectada manda a agenda no `ready` e a cada mudança do mestre.
  useEffect(() => {
    if (!activeRoomId || !scheduleDoc) return
    const parsed = roomScheduleSchema.safeParse(scheduleDoc.data)
    if (parsed.success) setSchedule(activeRoomId, parsed.data.sessions)
  }, [activeRoomId, scheduleDoc, setSchedule])

  useEffect(() => {
    let last = 0
    async function refresh() {
      if (document.visibilityState !== 'visible' || Date.now() - last < SESSION_SCHEDULE_REFRESH_MS) return
      last = Date.now()
      for (const m of useRoomStore.getState().memberships) {
        try {
          setSchedule(m.room_id, (await roomApi.schedule(m.token)).sessions)
        } catch (err) {
          // Sala fechada ou acesso perdido: a página da sala mostra isso ao conectar.
          console.warn(`[sessões] Agenda da sala ${m.code} indisponível.`, err)
        }
      }
    }
    void refresh()
    document.addEventListener('visibilitychange', refresh)
    return () => document.removeEventListener('visibilitychange', refresh)
  }, [memberships.length, setSchedule])

  // Agenda nova (ou lembretes religados): troca os lembretes de cada sala.
  useEffect(() => {
    if (!remindersOn) return
    void cancelRemindersExcept(memberships.map(m => m.room_id))
    for (const m of memberships) {
      const sessions = schedules[m.room_id]
      if (sessions) void syncRoomReminders({ id: m.room_id, name: m.name, path: roomPagePath(m) }, sessions)
    }
  }, [schedules, memberships, remindersOn])
}
