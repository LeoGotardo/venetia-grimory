import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TableCombatant, TableState } from '../../lib/room/protocol'
import { healTargets, scrollSpells, usableItems, type UsableItem } from '../../lib/turnActions'
import { useRoomStore } from '../../store/roomStore'
import { useSheetStore } from '../../store/sheetStore'
import { readRoomSheet } from '../../hooks/useRoomSync'
import { Modal } from '../ui/Modal'
import { gmPrimaryButton } from '../gm/GmHeader'
import { CastForm } from './CastForm'
import { consumeItem } from './roomSheetActions'
import { choiceButton, turnLegend } from './turnStyles'

interface ItemModalProps {
  open: boolean
  onClose: () => void
  table: TableState
  mine: TableCombatant
  sheetId: string | null
}

/**
 * Usar um consumível do inventário na vez: poção de cura (bebe ou dá a um
 * aliado; o servidor rola e o mestre aplica), outra poção ou pergaminho (avisa a
 * mesa — o efeito o mestre aplica) e Pergaminho de Magia (lança a magia com a CD
 * e o ataque do pergaminho). O item sai do inventário só depois do envio.
 */
export function ItemModal({ open, onClose, table, mine, sheetId }: ItemModalProps) {
  const { t } = useTranslation()
  const { heal, say } = useRoomStore()
  // Reler ao consumir (a ficha carregada muda).
  useSheetStore(s => s.sheet)
  const sheet = readRoomSheet(sheetId)
  const items = sheet ? usableItems(sheet) : []
  const [idx, setIdx] = useState<number | null>(null)
  const [targetId, setTargetId] = useState<string | null>(null)
  const [spellKey, setSpellKey] = useState<string | null>(null)

  const chosen = items.find(i => i.idx === idx) ?? null
  const spells = sheet && chosen?.kind === 'scroll' ? scrollSpells(sheet, chosen.level, chosen.item.notes) : []
  const spell = spells.find(s => s.key === spellKey) ?? null

  function pick(item: UsableItem) {
    setIdx(item.idx)
    setTargetId(item.kind === 'healing' ? mine.id : null)
    setSpellKey(null)
  }

  function used() {
    if (sheetId && chosen) consumeItem(sheetId, chosen.idx)
    setIdx(null)
    onClose()
  }

  async function submit() {
    if (!chosen) return
    const sent = chosen.kind === 'healing'
      ? targetId != null && await heal({ combatantId: mine.id, targetId, label: chosen.name, heal: chosen.heal })
      : say(t('room.item.uses', { item: chosen.name }), false)
    if (sent) used()
  }

  const hint = (item: UsableItem) =>
    item.kind === 'healing' ? t('room.item.healHint', { heal: item.heal })
      : item.kind === 'scroll' ? (item.level === 0 ? t('room.cast.cantrip') : t('room.cast.circle', { n: item.level }))
        : t('room.item.otherHint')

  return (
    <Modal open={open} onClose={onClose} title={t('room.turn.item')}>
      <div className="flex flex-col gap-4">
        <fieldset className="flex flex-col gap-1.5">
          <legend className={turnLegend}>{t('room.item.pick')}</legend>
          {items.length === 0 && <p className="text-[14px] text-[#A8A09B]">{t('room.item.none')}</p>}
          {items.map(item => (
            <button key={item.idx} type="button" aria-pressed={idx === item.idx} onClick={() => pick(item)} className={choiceButton(idx === item.idx)}>
              <span className="block font-semibold text-[#F5F0E8]">
                {item.name}
                {sheet && sheet.inventory.items[item.idx].quantity > 1 && <span className="text-[#A8A09B] font-normal"> ×{sheet.inventory.items[item.idx].quantity}</span>}
              </span>
              <span className="block text-[12px] text-[#A8A09B] tabular-nums">{hint(item)}</span>
            </button>
          ))}
        </fieldset>

        {chosen?.kind === 'healing' && (
          <fieldset className="flex flex-col gap-1.5">
            <legend className={turnLegend}>{t('room.item.healWho')}</legend>
            {healTargets(table, mine).map(c => (
              <button key={c.id} type="button" aria-pressed={targetId === c.id} onClick={() => setTargetId(c.id)} className={choiceButton(targetId === c.id)}>
                <span className="block font-semibold text-[#F5F0E8]">{c.id === mine.id ? t('room.heal.self', { name: c.name }) : c.name}</span>
                <span className="block text-[12px] text-[#A8A09B]">{t(`room.health.${c.health}`)}</span>
              </button>
            ))}
          </fieldset>
        )}

        {chosen && chosen.kind !== 'scroll' && (
          <button disabled={chosen.kind === 'healing' && targetId == null} onClick={() => void submit()} className={`${gmPrimaryButton} self-start`}>
            {chosen.kind === 'healing' && targetId !== mine.id ? t('room.item.give', { item: chosen.name }) : t('room.item.use', { item: chosen.name })}
          </button>
        )}

        {chosen?.kind === 'scroll' && sheet && (
          <>
            <fieldset className="flex flex-col gap-1.5">
              <legend className={turnLegend}>{t('room.item.scrollSpell')}</legend>
              {spells.length === 0 && <p className="text-[14px] text-[#A8A09B]">{t('room.item.scrollUnreadable')}</p>}
              <div className="flex flex-col gap-1.5 max-h-[240px] overflow-y-auto">
                {spells.map(s => (
                  <button key={s.key} type="button" aria-pressed={spellKey === s.key} onClick={() => setSpellKey(s.key)} className={choiceButton(spellKey === s.key)}>
                    <span className="block font-semibold text-[#F5F0E8]">{s.spell.name}</span>
                  </button>
                ))}
              </div>
            </fieldset>
            {spell && (
              <CastForm
                key={spell.key}
                castable={spell}
                label={t('room.item.fromScroll', { spell: spell.spell.name })}
                table={table}
                mine={mine}
                characterLevel={sheet.identity.level}
                payable
                onSent={used}
              />
            )}
          </>
        )}
      </div>
    </Modal>
  )
}
