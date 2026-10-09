import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSheetStore } from '../../store/sheetStore'
import { useSheetRoller } from '../../hooks/useSheetRoller'
import { d20Roll, parseRoomRoll } from '../../lib/room/rolls'
import { DiceIcon } from '../gm/ornaments'

interface RollButtonProps {
  /** Rótulo no log da sala ("Atletismo", "Espada longa — dano"). */
  label: string
  /** Teste de d20 com este modificador… */
  modifier?: number | null
  /** …ou uma expressão pronta (dano). */
  expression?: string | null
  className?: string
}

/**
 * Dado ao lado de um número da ficha. Só aparece quando esta ficha está numa
 * sala conectada: rola no servidor e o resultado sai no log da sala.
 */
export function RollButton({ label, modifier, expression, className = '' }: RollButtonProps) {
  const { t } = useTranslation()
  const sheetId = useSheetStore(s => s.sheetId)
  const roll = useSheetRoller(sheetId)
  const [sent, setSent] = useState(false)
  const formula = expression ?? (modifier != null ? d20Roll(modifier) : null)
  if (!roll || !formula || !parseRoomRoll(formula)) return null

  function handleClick() {
    if (!roll || !formula || !roll(formula, label)) return
    setSent(true)
    setTimeout(() => setSent(false), 900)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={t('sheet.rollInRoom', { label })}
      title={t('sheet.rollInRoom', { label })}
      className={`inline-flex items-center justify-center w-8 h-8 flex-shrink-0 rounded-[8px] border cursor-pointer transition-colors ${
        sent ? 'border-[#D4A017] bg-[rgba(212,160,23,0.25)] text-[#F5F0E8]' : 'border-[#B8860B]/30 text-[#D4A017] hover:bg-[rgba(212,160,23,0.12)]'
      } ${className}`}
    >
      <DiceIcon size={15} />
    </button>
  )
}
