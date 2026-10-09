import { useTranslation } from 'react-i18next'
import type { RoomMember } from '../../lib/room/protocol'
import { rowDangerButton } from '../gm/MonsterRow'

interface RoomMemberListProps {
  members: RoomMember[]
  online: string[]
  /** Este aparelho, marcado como "você". */
  selfId: string | null
  /** Só o mestre recebe: botão de remover em cada player. */
  onKick?: (member: RoomMember) => void
}

/** Quem está na sala, mestre primeiro, com o ponto de online. */
export function RoomMemberList({ members, online, selfId, onKick }: RoomMemberListProps) {
  const { t } = useTranslation()
  const sorted = [...members].sort((a, b) => (a.role === b.role ? a.joined_at.localeCompare(b.joined_at) : a.role === 'gm' ? -1 : 1))

  return (
    <ul className="flex flex-col gap-1.5">
      {sorted.map(member => {
        const isOnline = online.includes(member.id)
        return (
          <li key={member.id} className="flex items-center gap-3 rounded-[10px] bg-[#131110] border border-white/[0.06] px-3 py-2">
            <span
              aria-hidden="true"
              className={`w-2.5 h-2.5 flex-shrink-0 rounded-full ${isOnline ? 'bg-[#6FBF73]' : 'bg-white/15'}`}
            />
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-[15px] text-[#F5F0E8] truncate">
                {member.display_name}
                {member.id === selfId && <span className="ml-1.5 text-[12px] font-normal text-[#A8A09B]">({t('room.you')})</span>}
              </span>
              <span className="block text-[12px] text-[#A8A09B]">
                {member.role === 'gm' ? `${t('room.roleGm')} · ` : ''}{isOnline ? t('room.online') : t('room.offline')}
              </span>
            </span>
            {onKick && member.role === 'player' && (
              <button onClick={() => onKick(member)} className={rowDangerButton}>{t('room.kick')}</button>
            )}
          </li>
        )
      })}
    </ul>
  )
}
