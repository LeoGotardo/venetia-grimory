import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { critExpression, manualRoll, parseRoomDamage } from '../../lib/room/rolls'
import type { DiceExpression } from '../../lib/gm/dice'
import { useDiceEntryStore, type DiceEntryAnswer, type DiceEntryGroup, type DiceEntryRequest } from '../../store/diceEntryStore'
import { Modal } from '../ui/Modal'
import { gmPrimaryButton, gmSecondaryButton } from '../gm/GmHeader'
import { turnField } from './turnStyles'

/**
 * "Quanto saiu nos dados?": aberto pelo store da sala quando o player rola na
 * mesa de verdade. Um campo por termo de dado (a soma daquele grupo de dados),
 * conferido na hora contra o mínimo e o máximo — o servidor confere de novo.
 */
export function PhysicalDiceModal() {
  const { t } = useTranslation()
  const { request, answer } = useDiceEntryStore()
  if (!request) return null
  return (
    <Modal open top onClose={() => answer(null)} title={t('room.dice.title')}>
      <DiceEntryForm request={request} onAnswer={answer} />
    </Modal>
  )
}

const signed = (n: number) => (n > 0 ? `+ ${n}` : `− ${Math.abs(n)}`)

function DiceEntryForm({ request, onAnswer }: { request: DiceEntryRequest; onAnswer: (answer: DiceEntryAnswer) => void }) {
  const { t } = useTranslation()
  const [values, setValues] = useState<Record<string, string>>({})
  const numbers = (key: string, count: number) => Array.from({ length: count }, (_, i) => Number(values[`${key}:${i}`] ?? ''))

  // O d20 do ataque decide o crítico, que dobra os dados do dano antes da conferência.
  const natural = Number(values['attack:0'] ?? '')
  const expressionOf = (group: DiceEntryGroup): DiceExpression | null => {
    const parsed = parseRoomDamage(group.expression)
    return parsed && group.critFrom === 'attack' && natural === 20 ? critExpression(parsed) : parsed
  }
  const groups = request.groups.map(group => {
    const expression = expressionOf(group)
    const result = expression ? manualRoll(expression, numbers(group.key, expression.terms.length)) : null
    return { group, expression, result }
  })
  const valid = groups.every(g => g.result != null)

  function submit() {
    if (!valid) return
    onAnswer(Object.fromEntries(groups.map(g => [g.group.key, g.result!.rolls])))
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={e => { e.preventDefault(); submit() }}>
      <p className="text-[14px] text-[#E8DFD0]">{t('room.dice.intro', { label: request.title })}</p>
      {groups.map(({ group, expression, result }) => (
        <fieldset key={group.key} className="flex flex-col gap-2 rounded-[10px] border border-white/[0.08] p-3">
          <legend className="px-1 text-[13px] font-semibold text-[#E8DFD0]">
            {t(`room.dice.group.${group.key}`)} <span className="font-normal text-[#A8A09B]">{group.expression}</span>
          </legend>
          {group.critFrom && natural === 20 && <p className="text-[13px] font-semibold text-[#9fcf8f]">{t('room.dice.crit')}</p>}
          <div className="flex flex-wrap items-end gap-3">
            {expression?.terms.map((term, i) => (
              <label key={i} className="flex flex-col gap-1 text-[13px] font-semibold text-[#E8DFD0]">
                {term.sign < 0 ? '−' : ''}{term.count}d{term.sides}
                <input
                  type="number"
                  inputMode="numeric"
                  min={term.count}
                  max={term.count * term.sides}
                  placeholder={`${term.count}–${term.count * term.sides}`}
                  value={values[`${group.key}:${i}`] ?? ''}
                  onChange={e => setValues(v => ({ ...v, [`${group.key}:${i}`]: e.target.value }))}
                  className={`${turnField} w-[110px] text-center tabular-nums`}
                  autoFocus={group === request.groups[0] && i === 0}
                />
              </label>
            ))}
            {expression != null && expression.bonus !== 0 && <span className="pb-2.5 text-[15px] text-[#A8A09B] tabular-nums">{signed(expression.bonus)}</span>}
            {result && <span className="pb-2 text-[18px] font-extrabold text-[#E8C25A] tabular-nums">= {result.total}</span>}
          </div>
        </fieldset>
      ))}
      <p className="text-[12px] text-[#A8A09B]">{t('room.dice.hint')}</p>
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={!valid} className={gmPrimaryButton}>{t('room.dice.send')}</button>
        <button type="button" onClick={() => onAnswer('app')} className={gmSecondaryButton}>{t('room.dice.useApp')}</button>
      </div>
    </form>
  )
}
