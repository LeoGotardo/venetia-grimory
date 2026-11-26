import { useTranslation } from 'react-i18next'
import { useRoomStore } from '../store/roomStore'
import { readRoomSheet, useActiveMembership } from './useRoomSync'
import { checkLabel, checkModifier } from '../lib/rollChecks'
import { d20Roll } from '../lib/room/rolls'
import type { RequestEvent } from '../lib/room/requests'

/** Nome do teste pedido: o rótulo do mestre ou o nome do teste no idioma da tela. */
export function useRequestLabel() {
  const { t } = useTranslation()
  return (request: RequestEvent) => request.payload.label || checkLabel(request.payload.check, t)
}

/**
 * Player: responde ao pedido rolando com o modificador da própria ficha. `null`
 * para quem não é player da sala conectada.
 */
export function useAnswerRequest() {
  const me = useActiveMembership()
  const roll = useRoomStore(s => s.roll)
  const labelOf = useRequestLabel()
  if (me?.role !== 'player') return null
  const modifierOf = (request: RequestEvent) => {
    const sheet = readRoomSheet(me.sheet_id)
    return (sheet ? checkModifier(sheet, request.payload.check) : null) ?? 0
  }
  return {
    memberId: me.member_id,
    modifierOf,
    answer: (request: RequestEvent) => roll(d20Roll(modifierOf(request)), labelOf(request), request.payload.secret, request.version),
  }
}
