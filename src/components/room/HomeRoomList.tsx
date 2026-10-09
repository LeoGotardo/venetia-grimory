import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useRoomStore } from '../../store/roomStore'

/** "Suas salas" na tela inicial: as salas em que este aparelho entrou como player. */
export function HomeRoomList() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const rooms = useRoomStore(s => s.memberships).filter(m => m.role === 'player')
  if (rooms.length === 0) return null

  return (
    <section className="mb-10">
      <div className="flex items-center gap-[11px] mb-4">
        <span className="w-1 h-[19px] rounded-sm bg-gradient-to-b from-[#E8C25A] to-[#B8860B]" />
        <h2 className="font-extrabold text-[17px] text-[#EAD9B0]">{t('room.myRooms')}</h2>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
        {rooms.map(room => (
          <li key={room.room_id}>
            <button
              onClick={() => navigate(`/sala/${room.code}`)}
              className="w-full flex items-center justify-between gap-3 text-left rounded-[14px] bg-[#1A1714] border border-[rgba(212,160,23,0.2)] hover:border-[rgba(212,160,23,0.45)] px-5 py-4 cursor-pointer transition-colors"
            >
              <span className="min-w-0">
                <span className="block font-bold text-[16px] text-[#F5F0E8] truncate">{room.name || t('room.untitled')}</span>
                <span className="block text-[13px] text-[#A8A09B] truncate">{room.display_name} · {room.code}</span>
              </span>
              <span className="flex-shrink-0 text-[13px] font-semibold text-[#E8C25A]">{t('room.openRoomPage')}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
