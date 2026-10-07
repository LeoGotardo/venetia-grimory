import { useTranslation } from 'react-i18next'
import type { EncounterBudget } from '../../lib/gm/difficulty'

const LABEL_KEY = {
  none: 'gm.difficultyNone',
  low: 'gm.difficultyLow',
  moderate: 'gm.difficultyModerate',
  high: 'gm.difficultyHigh',
  beyond: 'gm.difficultyBeyond',
} as const

const COLOR = {
  none: 'text-[#A8A09B]',
  low: 'text-[#8fbf7f]',
  moderate: 'text-[#D4A017]',
  high: 'text-[#e08a4a]',
  beyond: 'text-[#d4564a]',
} as const

/** Dificuldade de 2024: XP dos monstros contra o orçamento da party. */
export function DifficultyMeter({ budget }: { budget: EncounterBudget }) {
  const { t, i18n } = useTranslation()
  const pct = budget.high > 0 ? Math.min(100, (budget.xp / budget.high) * 100) : 0
  const mark = (v: number) => `${budget.high > 0 ? (v / budget.high) * 100 : 0}%`

  return (
    <div className="rounded-[11px] border border-white/[0.07] bg-[#1A1714] px-3 py-2.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A8A09B]">{t('gm.difficulty')}</span>
        <span className={`text-[14px] font-bold ${COLOR[budget.difficulty]}`}>{t(LABEL_KEY[budget.difficulty])}</span>
      </div>
      <div className="relative h-2 mt-2 rounded-full bg-white/[0.06] overflow-hidden" aria-hidden="true">
        <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#8fbf7f] via-[#D4A017] to-[#d4564a]" style={{ width: `${pct}%` }} />
        {budget.high > 0 && (
          <>
            <span className="absolute inset-y-0 w-px bg-[#131110]" style={{ left: mark(budget.low) }} />
            <span className="absolute inset-y-0 w-px bg-[#131110]" style={{ left: mark(budget.moderate) }} />
          </>
        )}
      </div>
      <p className="text-[11px] text-[#A8A09B] mt-1.5">
        {t('gm.budgetLine', {
          xp: budget.xp.toLocaleString(i18n.language),
          low: budget.low.toLocaleString(i18n.language),
          moderate: budget.moderate.toLocaleString(i18n.language),
          high: budget.high.toLocaleString(i18n.language),
        })}
      </p>
    </div>
  )
}
