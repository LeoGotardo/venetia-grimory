import { useTranslation } from 'react-i18next'
import { useRoomStore } from '../../store/roomStore'
import { useGmStore } from '../../store/gmStore'
import { useActiveMembership, useBroadcastEncounter } from '../../hooks/useRoomSync'
import { useAnswerRequest, useRequestLabel } from '../../hooks/useRoomRequests'
import { attackHits, diceDetail, repliesTo, requestTargets, type AttackEvent, type RequestEvent } from '../../lib/room/requests'
import { formatModifier } from '../../lib/calculations'
import { translateTerm } from '../../data/rules/translation'
import { gmPrimaryButton, gmSecondaryButton } from '../gm/GmHeader'
import { DiceIcon, LockIcon, SwordsIcon } from '../gm/ornaments'

/** Pedido de teste no log: o player alvo rola com um toque; o mestre vê quem já rolou e quanto tirou. */
export function RequestCard({ event, time }: { event: RequestEvent; time: string }) {
  const { t } = useTranslation()
  const { events, members, status } = useRoomStore()
  const me = useActiveMembership()
  const answerer = useAnswerRequest()
  const labelOf = useRequestLabel()
  const replies = repliesTo(events, event.version)
  const targets = members.filter(m => m.role === 'player' && requestTargets(event, m.id))
  const mineAnswered = answerer != null && replies.some(r => r.actor_member_id === answerer.memberId)
  const canAnswer = answerer != null && requestTargets(event, answerer.memberId) && !mineAnswered

  return (
    <li className="rounded-[10px] border border-[rgba(212,160,23,0.45)] bg-[rgba(212,160,23,0.07)] px-3 py-2.5 flex flex-col gap-2">
      <span className="text-[12px] text-[#A8A09B]">
        <b className="text-[#EAD9B0]">{event.actor_name}</b> · {time}
        {event.payload.secret && (
          <span className="ml-1.5 inline-flex items-center gap-0.5 align-middle text-[11px] font-semibold text-[#E8C25A]">
            <LockIcon size={11} /> {t('room.request.secret')}
          </span>
        )}
      </span>
      <span className="flex items-center gap-2 text-[15px] font-bold text-[#F5F0E8]">
        <span className="text-[#D4A017]"><DiceIcon size={18} /></span>
        {t('room.request.asks', { check: labelOf(event) })}
      </span>
      {canAnswer && (
        <button
          disabled={status !== 'online'}
          onClick={() => answerer.answer(event)}
          className={`${gmPrimaryButton} self-start`}
        >
          {t('room.request.roll', { mod: formatModifier(answerer.modifierOf(event)) })}
        </button>
      )}
      {mineAnswered && <span className="text-[13px] text-[#9fcf8f]">{t('room.request.done')}</span>}
      {me?.role === 'gm' && (
        <ul className="flex flex-col gap-1">
          {targets.map(m => {
            const reply = replies.find(r => r.actor_member_id === m.id)
            return (
              <li key={m.id} className="flex items-center justify-between gap-2 text-[13px]">
                <span className="text-[#E8DFD0] truncate">{m.display_name}</span>
                {reply ? (
                  <span className="tabular-nums text-[#A8A09B]">
                    {diceDetail(reply.payload)} = <b className="text-[17px] text-[#E8C25A]">{reply.payload.total}</b>
                  </span>
                ) : (
                  <span className="text-[#A8A09B]">{t('room.request.waiting')}</span>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </li>
  )
}

/**
 * Ataque de um player. Todos veem acerto e dano; o mestre, que tem a CA no
 * encontro transmitido, vê se acerta e aplica o dano com um toque.
 */
export function AttackCard({ event, time, mine }: { event: AttackEvent; time: string; mine: boolean }) {
  const { t, i18n } = useTranslation()
  const { appliedAttacks, markAttackApplied, activeRoomId } = useRoomStore()
  // A versão é por sala: a mesma versão em outra sala é outro ataque.
  const damageCombatant = useGmStore(s => s.damageCombatant)
  const broadcast = useBroadcastEncounter()
  const { attack, damage, natural, target_name, label, damage_type } = event.payload
  const target = broadcast?.encounter.combatants.find(c => c.id === event.payload.target_id) ?? null
  const hits = target ? attackHits(event, target.ac) : null
  const appliedKey = `${activeRoomId}:${event.version}`
  const applied = appliedAttacks.includes(appliedKey)
  const damageTotal = Math.max(0, damage?.total ?? 0)

  function apply() {
    if (!broadcast || !target || damageTotal <= 0) return
    damageCombatant(broadcast.encounter.id, target.id, damageTotal)
    markAttackApplied(appliedKey)
  }

  return (
    <li className={`rounded-[10px] border px-3 py-2.5 flex flex-col gap-1.5 bg-[#131110] ${mine ? 'border-[rgba(212,160,23,0.35)]' : 'border-white/[0.07]'}`}>
      <span className="text-[12px] text-[#A8A09B]"><b className="text-[#EAD9B0]">{event.actor_name}</b>{time && ` · ${time}`}</span>
      <span className="flex items-center gap-2 text-[15px] font-bold text-[#F5F0E8] min-w-0">
        <span className="text-[#D4A017] flex-shrink-0"><SwordsIcon size={16} /></span>
        <span className="truncate">{t('room.attack.line', { attack: label, target: target_name })}</span>
      </span>
      <span className="text-[13px] text-[#E8DFD0] tabular-nums">
        {t('room.attack.roll')} <b className="text-[18px] text-[#E8C25A]">{attack.total}</b> <span className="text-[#A8A09B]">({diceDetail(attack)})</span>
        {natural === 20 && <b className="ml-2 text-[#9fcf8f]">{t('room.attack.crit')}</b>}
        {natural === 1 && <b className="ml-2 text-[#f0a090]">{t('room.attack.fumble')}</b>}
      </span>
      {damage && (
        <span className="text-[13px] text-[#E8DFD0] tabular-nums">
          {t('room.attack.damage')} <b className="text-[18px] text-[#E8C25A]">{damageTotal}</b> {damage_type && translateTerm(damage_type, i18n.language)} <span className="text-[#A8A09B]">({diceDetail(damage)})</span>
        </span>
      )}
      {target && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className={`text-[13px] font-bold ${hits ? 'text-[#9fcf8f]' : 'text-[#f0a090]'}`}>
            {t(hits ? 'room.attack.hitsAc' : 'room.attack.missesAc', { ac: target.ac })}
          </span>
          {applied ? (
            <span className="text-[13px] text-[#A8A09B]">{t('room.attack.applied')}</span>
          ) : damageTotal > 0 && (
            <button onClick={apply} className={hits ? gmPrimaryButton : gmSecondaryButton}>
              {t(hits ? 'room.attack.apply' : 'room.attack.applyAnyway', { n: damageTotal })}
            </button>
          )}
        </div>
      )}
    </li>
  )
}
