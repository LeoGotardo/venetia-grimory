import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useRoomStore } from '../../store/roomStore'
import { useBackHandler } from '../../hooks/useBackHandler'
import { DiceIcon } from '../gm/ornaments'
import type { RoomEvent } from '../../lib/room/protocol'
import { RoomLog } from './RoomLog'

/** Quanto tempo o resultado da própria rolagem fica à vista, e o quanto ela pode ser antiga para aparecer. */
const OWN_ROLL_TOAST_MS = 4000
const OWN_ROLL_FRESH_MS = 15_000

/**
 * Rolagens e chat da sala em qualquer tela (ficha, encontro, campanha): um
 * botão flutuante com o número de novidades e um painel lateral. Na página da
 * sala o log já está na tela, então o botão some.
 */
export function RoomDock() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const { activeRoomId, status, events, memberships } = useRoomStore()
  const me = memberships.find(m => m.room_id === activeRoomId) ?? null
  const [open, setOpen] = useState(false)
  const [seenVersion, setSeenVersion] = useState(0)
  useBackHandler(open, () => setOpen(false))

  // Resultado da rolagem que eu acabei de fazer (pela ficha, por exemplo), sem abrir o painel.
  const lastOwnRoll = events.findLast(e => e.kind === 'roll' && e.actor_member_id === me?.member_id) ?? null
  const [toast, setToast] = useState<RoomEvent | null>(null)
  useEffect(() => {
    if (!lastOwnRoll || open) return
    const age = Date.now() - Date.parse(lastOwnRoll.created_at)
    if (age > OWN_ROLL_FRESH_MS) return
    const show = setTimeout(() => setToast(lastOwnRoll), 0)
    const hide = setTimeout(() => setToast(current => (current === lastOwnRoll ? null : current)), OWN_ROLL_TOAST_MS)
    return () => {
      clearTimeout(show)
      clearTimeout(hide)
    }
  }, [lastOwnRoll, open])

  const latest = events.at(-1)?.version ?? 0
  // Aberto, tudo é visto; o que eu mesmo mandei nunca conta como novidade.
  const seen = open ? latest : seenVersion
  const unread = events.filter(e => e.version > seen && e.actor_member_id !== me?.member_id).length
  const connected = me != null && (status === 'online' || status === 'reconnecting' || status === 'connecting')
  if (!connected || pathname.startsWith('/sala/')) return null

  function toggle(next: boolean) {
    setSeenVersion(latest)
    setOpen(next)
  }

  return (
    <>
      {!open && toast?.kind === 'roll' && (
        <div
          role="status"
          className="fixed z-40 right-4 bottom-[88px] max-w-[260px] rounded-[12px] border border-[rgba(212,160,23,0.4)] bg-[#1A1714] shadow-xl px-3.5 py-2.5 flex items-center gap-3 font-[Manrope,system-ui]"
        >
          <span className="min-w-0">
            <span className="block text-[13px] text-[#F5F0E8] truncate">{toast.payload.label || toast.payload.expression}</span>
            <span className="block text-[11px] text-[#A8A09B] tabular-nums truncate">{toast.payload.expression}: {toast.payload.rolls.join(' + ')}</span>
          </span>
          <span className="text-[26px] font-extrabold tabular-nums text-[#E8C25A]">{toast.payload.total}</span>
        </div>
      )}
      {!open && (
        <button
          data-testid="sala-dock"
          onClick={() => toggle(true)}
          aria-label={unread > 0 ? t('room.log.openUnread', { n: unread }) : t('room.log.open')}
          className="fixed z-40 right-4 bottom-4 w-14 h-14 rounded-full bg-[#D4A017] hover:bg-[#E8C25A] text-[#131110] shadow-xl flex items-center justify-center cursor-pointer transition-colors"
        >
          <DiceIcon size={24} />
          {unread > 0 && (
            <span aria-hidden="true" className="absolute -top-1 -right-1 min-w-[22px] h-[22px] rounded-full bg-[#c0473b] text-white text-[12px] font-bold flex items-center justify-center px-1 tabular-nums">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </button>
      )}
      {open && (
        <div
          role="dialog"
          aria-label={t('room.log.title')}
          className="fixed z-40 inset-x-0 bottom-0 top-[64px] lg:inset-x-auto lg:right-0 lg:top-0 lg:w-[420px] flex flex-col bg-[#1A1714] border-t lg:border-t-0 lg:border-l border-[rgba(212,160,23,0.3)] shadow-2xl p-3 font-[Manrope,system-ui]"
        >
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-cinzel text-[15px] font-semibold text-[#EAD9B0]">{t('room.log.title')}</h2>
            <button
              onClick={() => toggle(false)}
              aria-label={t('common.closeModal')}
              className="w-9 h-9 rounded-[8px] text-[#A8A09B] hover:text-[#F5F0E8] hover:bg-white/5 flex items-center justify-center cursor-pointer"
            >
              ×
            </button>
          </div>
          <RoomLog />
        </div>
      )}
    </>
  )
}
