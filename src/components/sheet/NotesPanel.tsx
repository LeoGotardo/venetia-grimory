import { useTranslation } from 'react-i18next'
import { useSheetStore } from '../../store/sheetStore'
import { Textarea } from '../ui/Input'
import { Badge } from '../ui/Badge'
import { AVAILABLE_CONDITIONS, EXHAUSTION_EFFECTS, MAX_EXHAUSTION } from '../../constants'
import { translateTerm } from '../../data/rules/translation'

export function NotesPanel() {
  const { sheet, toggleCondition, setExhaustion, setNotes } = useSheetStore()
  const { t, i18n } = useTranslation()
  // As condições são guardadas na ficha em português (valor canônico das regras).
  const translate = (term: string) => translateTerm(term, i18n.language)
  const p = sheet.personality

  const traitsMap = [
    { label: t('notes.traits'), items: p.traits },
    { label: t('notes.ideals'), items: p.ideals },
    { label: t('notes.bonds'), items: p.bonds },
    { label: t('notes.flaws'), items: p.flaws },
  ]

  return (
    <div className="space-y-5">
      {/* Personalidade */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {traitsMap.map(({ label, items }) => (
          <div key={label} className="bg-[#2D2520] border border-[#B8860B]/20 rounded-lg p-3">
            <div className="text-xs text-[#B8860B] font-semibold mb-1">{label}</div>
            {items.length > 0
              ? items.map((tr, i) => <p key={i} className="text-sm text-[#F5F0E8]">{tr}</p>)
              : <p className="text-xs text-[#A8A09B]">—</p>}
          </div>
        ))}
      </div>

      {/* No desktop: história e notas de um lado, condições e exaustão do outro. */}
      <div className="space-y-5 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)] lg:gap-6 lg:items-start lg:space-y-0">
        <div className="space-y-5">
          {p.backstory && (
            <div className="bg-[#2D2520] border border-[#B8860B]/20 rounded-lg p-3">
              <div className="text-xs text-[#B8860B] font-semibold mb-1">{t('notes.backstory')}</div>
              <p className="text-sm text-[#F5F0E8] whitespace-pre-wrap">{p.backstory}</p>
            </div>
          )}

          <Textarea
            label={t('notes.freeNotes')}
            value={sheet.notes ?? ''}
            onChange={e => setNotes(e.target.value)}
            placeholder={t('notes.notesPlaceholder')}
            className="min-h-[150px] lg:min-h-[280px]"
          />
        </div>

        <aside className="space-y-5">
          {/* Condições */}
          <section aria-label={t('notes.activeConditions')}>
            <h4 className="font-cinzel font-semibold text-[#B8860B] mb-2">{t('notes.activeConditions')}</h4>
            <div className="flex flex-wrap gap-2 mb-2" role="group" aria-label={t('notes.removeCondition')}>
              {sheet.active_conditions.map(c => (
                <button
                  key={c}
                  onClick={() => toggleCondition(c)}
                  aria-label={t('notes.removeConditionAriaLabel', { c: translate(c) })}
                  className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B] rounded"
                >
                  <Badge variant="red">{translate(c)} ×</Badge>
                </button>
              ))}
              {sheet.active_conditions.length === 0 && (
                <span className="text-xs text-[#A8A09B]">{t('notes.noConditions')}</span>
              )}
            </div>
            <div className="flex flex-wrap gap-1" role="group" aria-label={t('notes.addCondition')}>
              {(AVAILABLE_CONDITIONS as readonly string[]).filter(c => !sheet.active_conditions.includes(c)).map(c => (
                <button
                  key={c}
                  onClick={() => toggleCondition(c)}
                  aria-label={t('notes.applyCondition', { c: translate(c) })}
                  className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B] rounded"
                >
                  <Badge variant="default" className="hover:border-[#7B1D1D]/60">{translate(c)}</Badge>
                </button>
              ))}
            </div>
          </section>

          {/* Exaustão */}
          <section aria-label={t('notes.exhaustionAriaLabel')}>
            <h4 className="font-cinzel font-semibold text-[#B8860B] mb-2">
              {t('notes.exhaustionHeading', { n: sheet.exhaustion_levels, max: MAX_EXHAUSTION })}
            </h4>
            <div className="flex gap-1 mb-1" role="group" aria-label={t('notes.selectExhaustion')}>
              {Array.from({ length: MAX_EXHAUSTION }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setExhaustion(i + 1 === sheet.exhaustion_levels ? i : i + 1)}
                  aria-pressed={i < sheet.exhaustion_levels}
                  aria-label={t('notes.exhaustionLevelAriaLabel', { n: i + 1 })}
                  className={`w-8 h-8 rounded border text-sm font-bold cursor-pointer transition-colors
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]
                    ${i < sheet.exhaustion_levels
                      ? 'bg-red-800 border-red-600 text-white'
                      : 'border-[#A8A09B]/40 text-[#A8A09B] hover:border-red-600 hover:text-red-400'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <p className="text-xs text-[#A8A09B]">
              {translate((EXHAUSTION_EFFECTS as readonly string[])[sheet.exhaustion_levels])}
            </p>
          </section>
        </aside>
      </div>
    </div>
  )
}
