import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { RoomEvent } from '../../lib/room/protocol'
import { parseComposer } from '../../lib/room/composer'
import { parseRoomRoll } from '../../lib/room/rolls'
import { ROOM_CHAT_MAX } from '../../constants'
import { useRoomStore } from '../../store/roomStore'
import { DiceIcon, LockIcon } from '../gm/ornaments'

const QUICK_DICE = [20, 12, 10, 8, 6, 4, 100] as const

/**
 * Rolagens e chat da sala: o log (o mais novo embaixo) e o campo — mensagem,
 * `/r 1d20+5 Ataque` ou um dado rápido. "Privado" mostra só ao mestre (e a
 * quem mandou); o dado é rolado no servidor.
 */
export function RoomLog() {
  const { t } = useTranslation()
  const { events, status, roll, say, memberships, activeRoomId } = useRoomStore()
  const me = memberships.find(m => m.room_id === activeRoomId) ?? null
  const [text, setText] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const online = status === 'online'

  function rollExpression(expression: string, label: string) {
    if (!parseRoomRoll(expression)) {
      setError(t('room.log.invalidRoll'))
      return false
    }
    return roll(expression, label, isPrivate)
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    const intent = parseComposer(text)
    if (!intent) return
    const sent = intent.kind === 'roll' ? rollExpression(intent.expression, intent.label) : say(intent.text, isPrivate)
    if (sent) setText('')
  }

  return (
    <div className="flex flex-col min-h-0 h-full">
      {/* col-reverse: a lista nasce rolada até o fim e fica lá quando chega coisa nova. */}
      <div className="flex-1 min-h-[200px] overflow-y-auto flex flex-col-reverse" aria-live="polite">
        {events.length === 0 ? (
          <p className="text-center text-[14px] text-[#A8A09B] py-8 px-4">{t('room.log.empty')}</p>
        ) : (
          <ol className="flex flex-col gap-1.5 py-2">
            {events.map(event => <EventLine key={event.version} event={event} mine={event.actor_member_id === me?.member_id} />)}
          </ol>
        )}
      </div>

      <div className="border-t border-white/[0.07] pt-2 flex flex-col gap-2">
        <div className="flex flex-wrap gap-1" role="group" aria-label={t('room.log.quickDice')}>
          {QUICK_DICE.map(sides => (
            <button
              key={sides}
              type="button"
              disabled={!online}
              onClick={() => rollExpression(`1d${sides}`, '')}
              aria-label={t('room.log.rollDie', { die: `d${sides}` })}
              className="min-h-[34px] min-w-[44px] rounded-[8px] border border-white/[0.1] bg-white/5 hover:bg-white/10 px-2 text-[13px] font-bold text-[#E8DFD0] tabular-nums cursor-pointer disabled:opacity-50 disabled:cursor-default"
            >
              d{sides}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="flex gap-1.5">
          <button
            type="button"
            aria-pressed={isPrivate}
            onClick={() => setIsPrivate(p => !p)}
            title={me?.role === 'gm' ? t('room.log.privateGm') : t('room.log.privatePlayer')}
            aria-label={me?.role === 'gm' ? t('room.log.privateGm') : t('room.log.privatePlayer')}
            className={`flex-shrink-0 w-[42px] min-h-[42px] rounded-[10px] border flex items-center justify-center cursor-pointer transition-colors ${
              isPrivate ? 'border-[#D4A017] bg-[rgba(212,160,23,0.16)] text-[#E8C25A]' : 'border-white/[0.1] bg-white/5 text-[#A8A09B]'
            }`}
          >
            <LockIcon size={16} open={!isPrivate} />
          </button>
          <input
            data-testid="sala-chat"
            value={text}
            onChange={e => setText(e.target.value)}
            maxLength={ROOM_CHAT_MAX}
            placeholder={t('room.log.placeholder')}
            aria-label={t('room.log.placeholder')}
            className="flex-1 min-w-0 bg-[#1A1714] border border-[rgba(212,160,23,0.25)] rounded-[10px] px-3 py-2 text-[15px] text-[#F5F0E8] placeholder:text-[#A8A09B] focus:outline-none focus:border-[#D4A017]"
          />
          <button
            type="submit"
            disabled={!online || !text.trim()}
            className="flex-shrink-0 min-h-[42px] rounded-[10px] bg-[#D4A017] hover:bg-[#E8C25A] px-3.5 text-[14px] font-bold text-[#131110] cursor-pointer disabled:opacity-50 disabled:cursor-default"
          >
            {t('room.log.send')}
          </button>
        </form>
        {isPrivate && (
          <p className="text-[12px] text-[#E8C25A]">{me?.role === 'gm' ? t('room.log.privateGmHint') : t('room.log.privatePlayerHint')}</p>
        )}
        {error && <p role="alert" className="text-[12px] text-[#d4564a]">{error}</p>}
      </div>
    </div>
  )
}

function EventLine({ event, mine }: { event: RoomEvent; mine: boolean }) {
  const { t } = useTranslation()
  const time = new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const badge = event.private && (
    <span className="ml-1.5 inline-flex items-center gap-0.5 align-middle text-[11px] font-semibold text-[#E8C25A]">
      <LockIcon size={11} /> {t('room.log.private')}
    </span>
  )

  if (event.kind === 'chat') {
    return (
      <li className={`rounded-[10px] px-3 py-1.5 ${mine ? 'bg-[rgba(212,160,23,0.08)]' : 'bg-[#131110]'}`}>
        <span className="text-[12px] text-[#A8A09B]">
          <b className="text-[#EAD9B0]">{event.actor_name}</b> · {time}{badge}
        </span>
        <p className="text-[14px] text-[#F5F0E8] whitespace-pre-wrap break-words">{event.payload.text}</p>
      </li>
    )
  }

  const { expression, label, rolls, bonus, total } = event.payload
  const detail = `${rolls.join(' + ')}${bonus ? ` ${bonus > 0 ? '+' : '−'} ${Math.abs(bonus)}` : ''}`
  return (
    <li className={`flex items-center gap-3 rounded-[10px] border px-3 py-2 ${mine ? 'border-[rgba(212,160,23,0.35)]' : 'border-white/[0.07]'} bg-[#131110]`}>
      <span className="text-[#D4A017]"><DiceIcon size={18} /></span>
      <span className="min-w-0 flex-1">
        <span className="block text-[12px] text-[#A8A09B]">
          <b className="text-[#EAD9B0]">{event.actor_name}</b> · {time}{badge}
        </span>
        <span className="block text-[14px] text-[#F5F0E8] truncate">{label || expression}</span>
        <span className="block text-[12px] text-[#A8A09B] tabular-nums truncate">{label ? `${expression}: ` : ''}{detail}</span>
      </span>
      <span aria-label={t('room.log.total', { total })} className="flex-shrink-0 text-[26px] font-extrabold tabular-nums text-[#E8C25A]">{total}</span>
    </li>
  )
}
