import { useTranslation } from 'react-i18next'
import { useRoomStore } from '../../store/roomStore'
import { useGmStore } from '../../store/gmStore'
import { useActiveMembership, useBroadcastEncounter } from '../../hooks/useRoomSync'
import { useAnswerRequest, useRequestLabel } from '../../hooks/useRoomRequests'
import { attackHits, diceDetail, repliesTo, requestTargets, type AttackEvent, type HealEvent, type RequestEvent, type SaveEvent } from '../../lib/room/requests'
import { saveBonus } from '../../lib/gm/statblock'
import { formatModifier } from '../../lib/calculations'
import { translateTerm } from '../../data/rules/translation'
import { gmPrimaryButton, gmSecondaryButton } from '../gm/GmHeader'
import { DiceIcon, LockIcon, SwordsIcon } from '../gm/ornaments'

/** Selo de dados físicos: o player digitou quanto saiu (o servidor só conferiu a faixa). */
export function ManualDiceMark() {
  const { t } = useTranslation()
  return (
    <span className="ml-1.5 inline-flex items-center gap-0.5 rounded-full border border-[rgba(212,160,23,0.35)] px-1.5 align-middle text-[11px] font-semibold text-[#E8C25A]">
      <DiceIcon size={11} /> {t('room.dice.badge')}
    </span>
  )
}

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
          onClick={() => void answerer.answer(event)}
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
                    {diceDetail(reply.payload)} = <b className="text-[17px] text-[#E8C25A]">{reply.payload.total}</b>{reply.payload.manual && <ManualDiceMark />}
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

/** Cura de um player (poção, magia): todos veem quanto; o mestre aplica no PV do combate com um toque. */
export function HealCard({ event, time, mine }: { event: HealEvent; time: string; mine: boolean }) {
  const { t } = useTranslation()
  const { appliedAttacks, markAttackApplied, activeRoomId } = useRoomStore()
  const healCombatant = useGmStore(s => s.healCombatant)
  const broadcast = useBroadcastEncounter()
  const { label, target_name, heal } = event.payload
  const target = broadcast?.encounter.combatants.find(c => c.id === event.payload.target_id) ?? null
  const appliedKey = `${activeRoomId}:${event.version}`
  const applied = appliedAttacks.includes(appliedKey)
  const amount = Math.max(0, heal.total)

  function apply() {
    if (!broadcast || !target || amount <= 0) return
    healCombatant(broadcast.encounter.id, target.id, amount)
    markAttackApplied(appliedKey)
  }

  return (
    <li className={`rounded-[10px] border px-3 py-2.5 flex flex-col gap-1.5 bg-[#131110] ${mine ? 'border-[rgba(212,160,23,0.35)]' : 'border-white/[0.07]'}`}>
      <span className="text-[12px] text-[#A8A09B]"><b className="text-[#EAD9B0]">{event.actor_name}</b>{time && ` · ${time}`}</span>
      <span className="text-[15px] font-bold text-[#F5F0E8] truncate">{t('room.heal.line', { item: label, target: target_name })}</span>
      <span className="text-[13px] text-[#E8DFD0] tabular-nums">
        {t('room.heal.amount')} <b className="text-[18px] text-[#9fcf8f]">{amount}</b> <span className="text-[#A8A09B]">({diceDetail(heal)})</span>{heal.manual && <ManualDiceMark />}
      </span>
      {target && (
        applied
          ? <span className="text-[13px] text-[#A8A09B]">{t('room.attack.applied')}</span>
          : amount > 0 && <button onClick={apply} className={`${gmPrimaryButton} self-start`}>{t('room.heal.apply', { n: amount })}</button>
      )}
    </li>
  )
}

/** Condição de `AVAILABLE_CONDITIONS` que a falha no Agarrar impõe; o Empurrar deixa o mestre escolher Caído. */
const GRAPPLED = 'Imobilizado'
const PRONE = 'Caído'

/**
 * Efeito com salvaguarda de um player (magia de área, Agarrar, Empurrar). Todos
 * veem a CD, os alvos e o dano; o mestre, que tem os blocos, marca por alvo se
 * falhou (dano inteiro e a condição) ou passou (metade, ou nada).
 */
export function SaveCard({ event, time, mine }: { event: SaveEvent; time: string; mine: boolean }) {
  const { t, i18n } = useTranslation()
  const { appliedAttacks, markAttackApplied, activeRoomId } = useRoomStore()
  const damageCombatant = useGmStore(s => s.damageCombatant)
  const toggleCondition = useGmStore(s => s.toggleCombatantCondition)
  const broadcast = useBroadcastEncounter()
  const { label, dc, abilities, damage, damage_type, half_on_success, effect, targets } = event.payload
  const total = Math.max(0, damage?.total ?? 0)
  const onSuccess = half_on_success ? Math.floor(total / 2) : 0
  const abilityNames = abilities.map(a => t(`attrs.${a}`)).join(t('room.save.or'))

  // Uma chave por alvo e resultado, na mesma lista dos ataques aplicados (por sala).
  const keyOf = (targetId: string, outcome: 'fail' | 'pass') => `${activeRoomId}:${event.version}:${targetId}:${outcome}`

  function resolve(targetId: string, outcome: 'fail' | 'pass') {
    if (!broadcast) return
    const amount = outcome === 'fail' ? total : onSuccess
    if (amount > 0) damageCombatant(broadcast.encounter.id, targetId, amount)
    const combatant = broadcast.encounter.combatants.find(c => c.id === targetId)
    if (outcome === 'fail' && effect === 'grappled' && combatant && !combatant.conditions.includes(GRAPPLED)) {
      toggleCondition(broadcast.encounter.id, targetId, GRAPPLED)
    }
    markAttackApplied(keyOf(targetId, outcome))
  }

  function knockProne(targetId: string) {
    const combatant = broadcast?.encounter.combatants.find(c => c.id === targetId)
    if (broadcast && combatant && !combatant.conditions.includes(PRONE)) toggleCondition(broadcast.encounter.id, targetId, PRONE)
  }

  return (
    <li className={`rounded-[10px] border px-3 py-2.5 flex flex-col gap-1.5 bg-[#131110] ${mine ? 'border-[rgba(212,160,23,0.35)]' : 'border-white/[0.07]'}`}>
      <span className="text-[12px] text-[#A8A09B]"><b className="text-[#EAD9B0]">{event.actor_name}</b>{time && ` · ${time}`}</span>
      <span className="flex items-center gap-2 text-[15px] font-bold text-[#F5F0E8] min-w-0">
        <span className="text-[#D4A017] flex-shrink-0"><SwordsIcon size={16} /></span>
        <span className="truncate">{label}</span>
      </span>
      <span className="text-[13px] text-[#E8DFD0]">
        {t('room.save.dc', { dc, ability: abilityNames })}
        {effect !== 'none' && <span className="text-[#A8A09B]"> · {t(`room.save.effect.${effect}`)}</span>}
      </span>
      {damage && (
        <span className="text-[13px] text-[#E8DFD0] tabular-nums">
          {t('room.attack.damage')} <b className="text-[18px] text-[#E8C25A]">{total}</b> {damage_type && translateTerm(damage_type, i18n.language)} <span className="text-[#A8A09B]">({diceDetail(damage)})</span>{damage.manual && <ManualDiceMark />}
          {half_on_success && <span className="text-[#A8A09B]"> · {t('room.save.halfOnSuccess')}</span>}
        </span>
      )}
      <ul className="flex flex-col gap-1.5 pt-1">
        {targets.map(target => {
          const combatant = broadcast?.encounter.combatants.find(c => c.id === target.id) ?? null
          const failed = appliedAttacks.includes(keyOf(target.id, 'fail'))
          const passed = appliedAttacks.includes(keyOf(target.id, 'pass'))
          // Dica para o mestre: o bônus de salvaguarda do bloco (players não têm bloco no encontro).
          const bonus = combatant?.statblock
            ? abilities.map(a => `${t(`attrs.${a}`)} ${formatModifier(saveBonus(combatant.statblock!, a))}`).join(' / ')
            : null
          return (
            <li key={target.id} className="flex flex-wrap items-center gap-2 text-[13px]">
              <span className="font-semibold text-[#F5F0E8]">{target.name}</span>
              {bonus && <span className="text-[#A8A09B] tabular-nums">{bonus}</span>}
              {failed || passed ? (
                <span className={failed ? 'text-[#f0a090]' : 'text-[#9fcf8f]'}>
                  {t(failed ? 'room.save.failed' : 'room.save.passed')}
                  {damage && ` · ${t('room.save.damageApplied', { n: failed ? total : onSuccess })}`}
                  {failed && effect === 'shoved' && (
                    <button onClick={() => knockProne(target.id)} className={`${gmSecondaryButton} ml-2`}>{t('room.save.knockProne')}</button>
                  )}
                </span>
              ) : combatant && (
                <>
                  <button onClick={() => resolve(target.id, 'fail')} className={gmPrimaryButton}>
                    {t('room.save.failed')}{damage && ` (${total})`}
                  </button>
                  <button onClick={() => resolve(target.id, 'pass')} className={gmSecondaryButton}>
                    {t('room.save.passed')}{damage && ` (${onSuccess})`}
                  </button>
                </>
              )}
            </li>
          )
        })}
      </ul>
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
        {t('room.attack.roll')} <b className="text-[18px] text-[#E8C25A]">{attack.total}</b> <span className="text-[#A8A09B]">({diceDetail(attack)})</span>{attack.manual && <ManualDiceMark />}
        {natural === 20 && <b className="ml-2 text-[#9fcf8f]">{t('room.attack.crit')}</b>}
        {natural === 1 && <b className="ml-2 text-[#f0a090]">{t('room.attack.fumble')}</b>}
      </span>
      {damage && (
        <span className="text-[13px] text-[#E8DFD0] tabular-nums">
          {t('room.attack.damage')} <b className="text-[18px] text-[#E8C25A]">{damageTotal}</b> {damage_type && translateTerm(damage_type, i18n.language)} <span className="text-[#A8A09B]">({diceDetail(damage)})</span>{damage.manual && <ManualDiceMark />}
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
