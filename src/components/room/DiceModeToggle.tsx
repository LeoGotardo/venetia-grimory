import { useTranslation } from 'react-i18next'
import { useConfigStore } from '../../store/configStore'
import { DiceIcon } from '../gm/ornaments'

/**
 * Onde o player rola: no app (o servidor rola) ou na mesa, com dados de verdade
 * (cada rolagem pergunta quanto saiu). Preferência do aparelho, também em Configurações.
 */
export function DiceModeToggle({ className = '', compact = false }: { className?: string; compact?: boolean }) {
  const { t } = useTranslation()
  const physical = useConfigStore(s => s.config.physical_dice)
  const setConfig = useConfigStore(s => s.setConfig)
  const option = (selected: boolean) =>
    `flex-1 ${compact ? 'min-h-[28px] px-2 text-[12px]' : 'min-h-[36px] px-3 text-[13px]'} rounded-[8px] font-semibold whitespace-nowrap cursor-pointer transition-colors ${
      selected ? 'bg-[#D4A017] text-[#131110]' : 'text-[#E8DFD0] hover:bg-white/10'
    }`
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="flex items-center gap-1 text-[12px] text-[#A8A09B]"><DiceIcon size={14} /> {!compact && t('room.dice.mode')}</span>
      <div role="radiogroup" aria-label={t('room.dice.mode')} className={`flex ${compact ? '' : 'flex-1'} gap-1 rounded-[10px] border border-white/[0.1] bg-[#131110] p-1`}>
        <button type="button" role="radio" aria-checked={!physical} onClick={() => setConfig({ physical_dice: false })} className={option(!physical)}>
          {t('room.dice.inApp')}
        </button>
        <button type="button" role="radio" aria-checked={physical} onClick={() => setConfig({ physical_dice: true })} className={option(physical)}>
          {t('room.dice.physical')}
        </button>
      </div>
    </div>
  )
}
