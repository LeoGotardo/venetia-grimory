import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRoomStore } from '../../store/roomStore'
import { pendingRequests } from '../../lib/room/requests'
import { formatModifier } from '../../lib/calculations'
import { ROOM_REQUEST_PROMPT_MS } from '../../constants'
import { gmPrimaryButton } from '../gm/GmHeader'
import { DiceIcon } from '../gm/ornaments'
import { useAnswerRequest, useRequestLabel } from '../../hooks/useRoomRequests'

/**
 * Player: o teste mais recente que o mestre pediu e ele ainda não rolou, com o
 * botão de rolar com o modificador da ficha. Flutua em qualquer tela; na página
 * da sala vai `inline`, no topo. Pedido velho (fora de `ROOM_REQUEST_PROMPT_MS`)
 * fica só no log.
 */
export function RollRequestPrompt({ inline = false }: { inline?: boolean }) {
  const { t } = useTranslation()
  const events = useRoomStore(s => s.events)
  const online = useRoomStore(s => s.status === 'online')
  const answerer = useAnswerRequest()
  const labelOf = useRequestLabel()
  const [dismissed, setDismissed] = useState<number[]>([])
  // Pedido feito antes disto (o app abriu bem depois) fica só no log.
  const [freshSince] = useState(() => Date.now() - ROOM_REQUEST_PROMPT_MS)
  if (!answerer) return null

  const request = pendingRequests(events, answerer.memberId)
    .filter(e => !dismissed.includes(e.version) && Date.parse(e.created_at) > freshSince)
    .at(-1)
  if (!request) return null

  return (
    <div
      role="alertdialog"
      aria-label={t('room.request.asks', { check: labelOf(request) })}
      className={`${inline ? 'mb-4' : 'fixed z-40 inset-x-4 bottom-[76px] mx-auto max-w-[420px] shadow-2xl'} rounded-[14px] border border-[#D4A017] bg-[#1A1714] px-4 py-3 flex items-center gap-3 font-[Manrope,system-ui]`}
    >
      <span className="text-[#D4A017] flex-shrink-0"><DiceIcon size={22} /></span>
      <span className="min-w-0 flex-1">
        <span className="block text-[12px] text-[#A8A09B]">{t('room.request.fromGm', { name: request.actor_name })}</span>
        <span className="block text-[15px] font-bold text-[#F5F0E8] truncate">{labelOf(request)}</span>
      </span>
      <button disabled={!online} onClick={() => answerer.answer(request)} className={gmPrimaryButton}>
        {t('room.request.roll', { mod: formatModifier(answerer.modifierOf(request)) })}
      </button>
      <button
        onClick={() => setDismissed(d => [...d, request.version])}
        aria-label={t('room.request.dismiss')}
        className="w-9 h-9 flex-shrink-0 rounded-[8px] text-[#A8A09B] hover:text-[#F5F0E8] hover:bg-white/5 flex items-center justify-center cursor-pointer"
      >
        ×
      </button>
    </div>
  )
}
