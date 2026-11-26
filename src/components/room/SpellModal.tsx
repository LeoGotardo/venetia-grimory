import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TableCombatant, TableState } from '../../lib/room/protocol'
import { castableSpells, slotChoices, type SlotChoice } from '../../lib/turnActions'
import { useSheetStore } from '../../store/sheetStore'
import { readRoomSheet } from '../../hooks/useRoomSync'
import { Modal } from '../ui/Modal'
import { CastForm } from './CastForm'
import { choiceButton, turnField, turnLegend } from './turnStyles'
import { withRoomSheet } from './roomSheetActions'

interface SpellModalProps {
  open: boolean
  onClose: () => void
  table: TableState
  mine: TableCombatant
  sheetId: string | null
}

/**
 * Lançar uma magia na vez: uma magia da ficha, como pagar (espaço, Magia de
 * Pacto ou conjuração grátis) e como ela se resolve (`CastForm`). O gasto entra
 * na ficha só depois do envio, e chega ao mestre pelo envio da ficha.
 */
export function SpellModal({ open, onClose, table, mine, sheetId }: SpellModalProps) {
  const { t } = useTranslation()
  // Reler ao gastar um espaço (a ficha carregada muda).
  useSheetStore(s => s.sheet)
  const sheet = readRoomSheet(sheetId)
  const castable = sheet ? castableSpells(sheet) : []
  const [key, setKey] = useState<string | null>(null)
  const [choiceIdx, setChoiceIdx] = useState(0)

  const chosen = castable.find(c => c.key === key) ?? null
  const choices = sheet && chosen ? slotChoices(sheet, chosen) : []
  const choice = choices[choiceIdx] ?? null
  const slotLevel = choice?.pool === 'free' ? chosen?.spell.level ?? 0 : choice?.level ?? 0

  function sent() {
    if (choice && sheetId) {
      withRoomSheet(sheetId, store => {
        if (choice.pool === 'slot') store.spendSlot(`c${choice.level}` as Parameters<typeof store.spendSlot>[0])
        else if (choice.pool === 'pact') store.spendPactSlot()
        else store.spendFreeCast(choice.id)
      })
    }
    setKey(null)
    onClose()
  }

  const choiceLabel = (c: SlotChoice) =>
    c.pool === 'free' ? t('room.cast.free') : c.pool === 'pact' ? t('room.cast.pact', { n: c.level }) : t('room.cast.slot', { n: c.level })

  return (
    <Modal open={open} onClose={onClose} title={t('room.turn.cast')}>
      <div className="flex flex-col gap-4">
        <fieldset className="flex flex-col gap-1.5">
          <legend className={turnLegend}>{t('room.cast.pickSpell')}</legend>
          {castable.length === 0 && <p className="text-[14px] text-[#A8A09B]">{t('room.cast.noSpells')}</p>}
          {castable.map(c => {
            const payable = c.spell.level === 0 || (sheet != null && slotChoices(sheet, c).length > 0)
            return (
              <button
                key={c.key} type="button" disabled={!payable} aria-pressed={key === c.key}
                onClick={() => { setKey(c.key); setChoiceIdx(0) }} className={choiceButton(key === c.key)}
              >
                <span className="block font-semibold text-[#F5F0E8]">{c.spell.name}</span>
                <span className="block text-[12px] text-[#A8A09B]">
                  {c.spell.level === 0 ? t('room.cast.cantrip') : t('room.cast.circle', { n: c.spell.level })}
                  {!payable && ` · ${t('room.cast.noSlots')}`}
                </span>
              </button>
            )
          })}
        </fieldset>

        {chosen && sheet && (
          <>
            {choices.length > 0 && (
              <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#E8DFD0]">
                {t('room.cast.payWith')}
                <select value={choiceIdx} onChange={e => setChoiceIdx(Number(e.target.value))} className={turnField}>
                  {choices.map((c, i) => <option key={i} value={i}>{choiceLabel(c)}</option>)}
                </select>
              </label>
            )}
            <CastForm
              key={chosen.key}
              castable={chosen}
              label={slotLevel > 0 ? t('room.cast.label', { spell: chosen.spell.name, n: slotLevel }) : chosen.spell.name}
              table={table}
              mine={mine}
              characterLevel={sheet.identity.level}
              payable={chosen.spell.level === 0 || choice != null}
              onSent={sent}
            />
          </>
        )}
      </div>
    </Modal>
  )
}
