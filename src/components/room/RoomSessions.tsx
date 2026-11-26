import { useState, type FormEvent } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useTranslation } from 'react-i18next'
import { useRoomStore } from '../../store/roomStore'
import { useConfigStore } from '../../store/configStore'
import { upcomingSessions } from '../../lib/room/reminders'
import { ROOM_SCHEDULE_MAX, ROOM_SESSION_TITLE_MAX, SESSION_REMINDER_LEAD_MS } from '../../constants'
import { enableReminders, remindersSupported } from '../../services/sessionReminders'
import { gmPrimaryButton, gmSecondaryButton } from '../gm/GmHeader'
import { rowDangerButton } from '../gm/MonsterRow'
import { SectionTitle } from '../gm/ornaments'

const field =
  'w-full bg-[#2D2520] border border-[#B8860B]/30 rounded-[9px] px-3 py-2.5 text-[15px] text-[#F5F0E8] placeholder:text-[#A8A09B] focus:outline-none focus:border-[#D4A017]'

const isFuture = (date: Date) => !Number.isNaN(date.getTime()) && date.getTime() > Date.now()

/** Sessão que começou há menos disto ainda aparece ("começou agora"). */
const STARTED_GRACE_MS = 3 * 60 * 60_000

/**
 * Próximas sessões da sala. O mestre marca e desmarca (`editable`); todos veem,
 * e no app cada um liga os lembretes no próprio celular.
 */
export function RoomSessions({ roomId, editable = false }: { roomId: string | null; editable?: boolean }) {
  const { t, i18n } = useTranslation()
  const sessions = useRoomStore(s => (roomId ? s.schedules[roomId] : undefined))
  const connected = useRoomStore(s => s.activeRoomId === roomId && s.status === 'online')
  const publishSchedule = useRoomStore(s => s.publishSchedule)
  const remindersOn = useConfigStore(s => s.config.session_reminders)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('20:00')
  const [title, setTitle] = useState('')
  const [notice, setNotice] = useState<string | null>(null)
  const [now] = useState(() => Date.now())
  const upcoming = upcomingSessions(sessions ?? [], now, STARTED_GRACE_MS)
  const format = (iso: string) =>
    new Date(iso).toLocaleString(i18n.language, { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })

  function save(next: typeof upcoming) {
    if (!publishSchedule({ sessions: next })) setNotice(t('room.sessions.offline'))
  }

  function add(event: FormEvent) {
    event.preventDefault()
    // Data e hora locais do mestre; o ISO em UTC chega certo a cada fuso.
    const starts = new Date(`${date}T${time}`)
    if (!isFuture(starts)) {
      setNotice(t('room.sessions.past'))
      return
    }
    setNotice(null)
    save([...upcoming, { id: uuidv4(), starts_at: starts.toISOString(), title: title.trim() }].slice(-ROOM_SCHEDULE_MAX))
    setTitle('')
  }

  async function turnOnReminders() {
    setNotice((await enableReminders()) ? null : t('room.sessions.permissionDenied'))
  }

  return (
    <section className="flex flex-col gap-3">
      <SectionTitle align="start" count={upcoming.length || undefined}>{t('room.sessions.title')}</SectionTitle>
      {upcoming.length === 0 ? (
        <p className="text-[14px] text-[#A8A09B]">{t(editable ? 'room.sessions.emptyGm' : 'room.sessions.empty')}</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {upcoming.map(s => (
            <li key={s.id} className="flex items-center gap-3 rounded-[10px] bg-[#131110] border border-white/[0.06] px-3 py-2">
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-[15px] text-[#F5F0E8] first-letter:uppercase">{format(s.starts_at)}</span>
                {s.title && <span className="block text-[13px] text-[#A8A09B] truncate">{s.title}</span>}
              </span>
              {editable && (
                <button onClick={() => save(upcoming.filter(x => x.id !== s.id))} disabled={!connected} className={rowDangerButton}>
                  {t('room.sessions.remove')}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {remindersSupported() && upcoming.length > 0 && !remindersOn && (
        <button onClick={() => void turnOnReminders()} className={`${gmSecondaryButton} self-start`}>
          {t('room.sessions.enableReminders', { minutes: Math.round(SESSION_REMINDER_LEAD_MS / 60_000) })}
        </button>
      )}
      {remindersSupported() && remindersOn && upcoming.length > 0 && (
        <p className="text-[13px] text-[#9fcf8f]">{t('room.sessions.remindersOn', { minutes: Math.round(SESSION_REMINDER_LEAD_MS / 60_000) })}</p>
      )}

      {editable && (
        <form onSubmit={add} className="flex flex-col gap-2 rounded-[12px] border border-white/[0.07] p-3">
          <div className="flex gap-2">
            <label className="flex-1 flex flex-col gap-1 text-[13px] font-semibold text-[#E8DFD0]">
              {t('room.sessions.date')}
              <input type="date" required value={date} onChange={e => setDate(e.target.value)} className={field} />
            </label>
            <label className="w-[120px] flex flex-col gap-1 text-[13px] font-semibold text-[#E8DFD0]">
              {t('room.sessions.time')}
              <input type="time" required value={time} onChange={e => setTime(e.target.value)} className={field} />
            </label>
          </div>
          <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#E8DFD0]">
            {t('room.sessions.sessionTitle')}
            <input value={title} onChange={e => setTitle(e.target.value)} maxLength={ROOM_SESSION_TITLE_MAX} placeholder={t('room.sessions.titlePlaceholder')} className={field} />
          </label>
          <button type="submit" disabled={!connected || !date} className={`${gmPrimaryButton} self-start`}>{t('room.sessions.add')}</button>
        </form>
      )}
      {notice && <p role="alert" className="text-[13px] text-[#d4564a]">{notice}</p>}
    </section>
  )
}
