import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { rowButton } from './MonsterRow'

/** Quantidade + "Adicionar", com um "Adicionado" breve para o toque não passar em branco. */
export function QuantityAdd({ label, onAdd }: { label: string; onAdd: (count: number) => void }) {
  const { t } = useTranslation()
  const [count, setCount] = useState(1)
  const [added, setAdded] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  function add() {
    onAdd(count)
    setAdded(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setAdded(false), 1400)
  }

  return (
    <>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        max={50}
        value={count}
        onChange={e => setCount(Math.min(50, Math.max(1, Math.floor(Number(e.target.value)) || 1)))}
        aria-label={`${t('gm.quantity')}: ${label}`}
        className="w-14 h-9 text-center bg-[#131110] border border-white/[0.1] rounded-[8px] text-[14px] text-[#F5F0E8]"
      />
      <button onClick={add} className={`${rowButton} min-w-[92px] h-9 ${added ? 'text-[#D4A017] border-[rgba(212,160,23,0.45)]' : ''}`} aria-live="polite">
        {added ? `✓ ${t('gm.added')}` : `+ ${t('gm.add')}`}
      </button>
    </>
  )
}
