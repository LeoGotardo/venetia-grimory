import {
  useGmPlayerIntents, useGmRoomParty, useGmSharedNotes, useGmTableBroadcast, usePlayerAutoConnect, usePlayerEncounterRedirect,
  usePlayerRoller, usePlayerSheetPush, useSessionSchedules,
} from '../../hooks/useRoomSync'
import { RoomDock } from './RoomDock'
import { PhysicalDiceModal } from './PhysicalDiceModal'

/** Liga a sala online às fichas e à campanha em qualquer tela do app, e põe o botão das rolagens e do chat. */
export function RoomSyncBridge() {
  usePlayerAutoConnect()
  usePlayerSheetPush()
  usePlayerRoller()
  useGmRoomParty()
  useGmTableBroadcast()
  useGmSharedNotes()
  useGmPlayerIntents()
  usePlayerEncounterRedirect()
  useSessionSchedules()
  return (
    <>
      <RoomDock />
      <PhysicalDiceModal />
    </>
  )
}
