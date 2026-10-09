import {
  useGmRoomParty, useGmSharedNotes, useGmTableBroadcast, usePlayerAutoConnect, usePlayerRoller, usePlayerSheetPush,
} from '../../hooks/useRoomSync'
import { RoomDock } from './RoomDock'

/** Liga a sala online às fichas e à campanha em qualquer tela do app, e põe o botão das rolagens e do chat. */
export function RoomSyncBridge() {
  usePlayerAutoConnect()
  usePlayerSheetPush()
  usePlayerRoller()
  useGmRoomParty()
  useGmTableBroadcast()
  useGmSharedNotes()
  return <RoomDock />
}
