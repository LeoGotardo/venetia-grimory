import { useTranslation } from 'react-i18next'
import { useSheetStore } from '../../store/sheetStore'
import { formatModifier } from '../../lib/calculations'
import { gameData } from '../../data/rules'
import { RollButton } from './RollButton'

export function SkillsPanel() {
  const { sheet } = useSheetStore()
  const { t } = useTranslation()
  const passivePerception = 10 + (sheet.skills.percepcao._value ?? 0)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-cinzel font-semibold text-[#B8860B]">{t('skills.heading')}</h3>
        <span className="text-xs text-[#A8A09B]">{t('skills.passivePerception', { n: passivePerception })}</span>
      </div>
      {/* Duas colunas quando sobra largura: 18 perícias em fila só alongam a página. */}
      <div className="space-y-0.5 xl:space-y-0 xl:grid xl:grid-cols-2 xl:gap-x-4 xl:gap-y-0.5">
        {gameData.skills.map(p => {
          const partialSheet = sheet.skills[p.id]
          if (!partialSheet) return null
          const val = partialSheet._value
          const isHigh = (val ?? 0) >= 3
          return (
            <div key={p.id} className={`flex items-center gap-2 px-2 py-1.5 rounded transition-colors
              ${partialSheet.proficient ? 'bg-[#2D2520]' : 'hover:bg-[#3D332D]/50'}`}>
              <span className={`w-3 h-3 rounded-full flex-shrink-0 ${partialSheet.expertise ? 'border-2 border-[#B8860B] bg-[#B8860B]' : partialSheet.proficient ? 'bg-[#B8860B]' : 'border border-[#6B6560]'}`} />
              <span className={`text-xs flex-1 ${isHigh ? 'text-[#F5F0E8] font-medium' : 'text-[#B8860B]'}`}>{p.name}</span>
              <span className="text-[10px] text-[#A8A09B]">{p.ability}</span>
              <span className={`text-sm font-bold min-w-[2.5rem] text-right ${isHigh ? 'text-green-400' : (val ?? 0) > 0 ? 'text-[#F5F0E8]' : 'text-[#A8A09B]'}`} aria-live="polite">
                {val !== null && val !== undefined ? formatModifier(val) : '—'}
              </span>
              <RollButton label={p.name} modifier={val} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
