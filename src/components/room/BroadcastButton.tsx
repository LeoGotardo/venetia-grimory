import { useTranslation } from 'react-i18next'
import { campaignRoom, useRoomStore } from '../../store/roomStore'
import { useRoomConnection } from '../../hooks/useRoomConnection'
import { gmSecondaryButton } from '../gm/GmHeader'

/**
 * "Transmitir para a mesa": só aparece com a sala da campanha aberta. Liga a
 * transmissão deste encontro (a ponte `useGmTableBroadcast` manda a mesa
 * filtrada a cada mudança); ligar em outro encontro troca o transmitido.
 */
export function BroadcastButton({ campaignId, encounterId }: { campaignId: string; encounterId: string }) {
  const { t } = useTranslation()
  const { memberships, setBroadcast, activeRoomId, status } = useRoomStore()
  const room = campaignRoom(memberships, campaignId)
  useRoomConnection(room?.room_id ?? null)
  if (!room) return null

  const on = room.broadcast_encounter_id === encounterId
  const live = on && activeRoomId === room.room_id && status === 'online'
  return (
    <button
      data-testid="transmitir-mesa"
      aria-pressed={on}
      onClick={() => setBroadcast(room.room_id, on ? null : encounterId)}
      title={on ? t('room.broadcastStop') : t('room.broadcast')}
      className={`${gmSecondaryButton} ${on ? '!border-[#D4A017] !bg-[rgba(212,160,23,0.14)]' : ''}`}
    >
      <span aria-hidden="true" className={`w-2 h-2 rounded-full ${live ? 'bg-[#d4564a] animate-pulse' : on ? 'bg-[#E8C25A]' : 'bg-white/25'}`} />
      <span className="hidden sm:inline">{on ? t('room.broadcasting') : t('room.broadcast')}</span>
      <span className="sm:hidden">{t('room.table')}</span>
    </button>
  )
}
