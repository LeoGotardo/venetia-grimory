import { useTranslation } from 'react-i18next'
import type { RoomConnectionStatus } from '../../store/roomStore'

const DOT: Record<RoomConnectionStatus, string> = {
  idle: 'bg-[#A8A09B]',
  connecting: 'bg-[#E8C25A] animate-pulse',
  reconnecting: 'bg-[#E8C25A] animate-pulse',
  online: 'bg-[#6FBF73]',
  closed: 'bg-[#d4564a]',
  kicked: 'bg-[#d4564a]',
  unauthorized: 'bg-[#d4564a]',
  invalid: 'bg-[#d4564a]',
}

/** Bolinha + texto do estado da conexão; `role="status"` para leitores de tela anunciarem a troca. */
export function RoomStatusBadge({ status }: { status: RoomConnectionStatus }) {
  const { t } = useTranslation()
  return (
    <span role="status" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#E8DFD0] whitespace-nowrap">
      <span aria-hidden="true" className={`w-2 h-2 rounded-full ${DOT[status]}`} />
      {t(`room.status.${status}`)}
    </span>
  )
}
