import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSheetStore } from '../../store/sheetStore'
import { WizardNav } from './WizardNav'

import { MULTICLASS_PREREQUISITES } from '../../constants'
import { gameData } from '../../data/rules'
import { canChooseSubclass } from '../../lib/calculations'

export function StepMulticlass() {
  const {
    sheet, setStep,
    addMulticlass, removeMulticlass, setMulticlassLevel, setMulticlassSubclass,
  } = useSheetStore()
  const { t } = useTranslation()

  const level = sheet.identity.level
  const classId = sheet.identity.class_id
  const multiclasses = useMemo(() => sheet.identity.multiclasses ?? [], [sheet.identity.multiclasses])
  const abilities = sheet.abilities
  const primaryLevel = level - multiclasses.reduce((s, m) => s + m.level, 0)

  const availableClasses = gameData.classes.filter(c =>
    c.id !== classId && !multiclasses.some(m => m.class_id === c.id)
  )

  useEffect(() => {
    for (const m of multiclasses) {
      if (canChooseSubclass(m.level) && !m.subclass_id) {
        const firstSub = gameData.classes.find(c => c.id === m.class_id)?.subclasses[0]
        if (firstSub) setMulticlassSubclass(m.class_id, firstSub.id)
      }
    }
  }, [multiclasses, setMulticlassSubclass])

  const multiclassOk = multiclasses.every(m => !canChooseSubclass(m.level) || !!m.subclass_id)

  function checkPrerequisite(classId: string): boolean {
    const prereq = MULTICLASS_PREREQUISITES[classId]
    if (!prereq) return true
    const vals = prereq.abilities.map(a => abilities[a]?.value)
    if (vals.some(v => v === null || v === undefined)) return true
    return prereq.mode === 'ou'
      ? vals.some(v => (v as number) >= 13)
      : vals.every(v => (v as number) >= 13)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cinzel text-2xl font-bold text-[#F5F0E8] mb-1">{t('multiclass.title')}</h2>
        <p className="text-[#A8A09B] text-sm">{t('multiclass.wizardHint')}</p>
      </div>

      <div className="bg-[#3D332D] border border-[#B8860B]/20 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#A8A09B] uppercase tracking-wide">{t('multiclass.primaryClass')}</span>
          <span className="font-cinzel font-bold text-[#B8860B]">{t('multiclass.levelIn', { n: primaryLevel })}</span>
        </div>
        <p className="font-cinzel font-semibold text-[#F5F0E8]">
          {gameData.classes.find(c => c.id === classId)?.name ?? '—'}
        </p>

        {multiclasses.map(m => {
          const c = gameData.classes.find(cc => cc.id === m.class_id)
          const maxN = level - multiclasses.filter(x => x.class_id !== m.class_id).reduce((s, x) => s + x.level, 0) - 1
          return (
            <div key={m.class_id} className="border-t border-[#B8860B]/10 pt-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex-1 text-sm text-[#F5F0E8] font-medium">{c?.name ?? m.class_id}</span>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => setMulticlassLevel(m.class_id, m.level - 1)} disabled={m.level <= 1}
                    className="w-6 h-6 rounded bg-[#2D2520] border border-[#B8860B]/20 text-[#F5F0E8] text-xs disabled:opacity-30 cursor-pointer disabled:cursor-default hover:bg-[#4D4037]">−</button>
                  <span className="w-6 text-center font-cinzel font-bold text-[#F5F0E8] text-sm">{m.level}</span>
                  <button type="button" onClick={() => setMulticlassLevel(m.class_id, m.level + 1)} disabled={m.level >= maxN}
                    className="w-6 h-6 rounded bg-[#2D2520] border border-[#B8860B]/20 text-[#F5F0E8] text-xs disabled:opacity-30 cursor-pointer disabled:cursor-default hover:bg-[#4D4037]">+</button>
                </div>
                <button type="button" onClick={() => removeMulticlass(m.class_id)}
                  className="text-[#A8A09B] hover:text-red-400 px-1 text-sm cursor-pointer transition-colors">×</button>
              </div>
              {canChooseSubclass(m.level) && (
                <select value={m.subclass_id ?? ''} onChange={e => setMulticlassSubclass(m.class_id, e.target.value)}
                  className="w-full bg-[#2D2520] border border-[#B8860B]/30 rounded px-2 py-1.5 text-[#F5F0E8] text-xs focus:outline-none focus:ring-1 focus:ring-[#B8860B]">
                  {c?.subclasses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              )}
            </div>
          )
        })}

        <div className="border-t border-[#B8860B]/10 pt-3">
          <p className="text-xs text-[#A8A09B] mb-2">{t('multiclass.addClass')}</p>
          <div className="flex flex-wrap gap-2">
            {availableClasses.map(c => {
              const ok = checkPrerequisite(c.id)
              const prereq = MULTICLASS_PREREQUISITES[c.id]
              return (
                <div key={c.id} className="flex flex-col items-center gap-0.5">
                  <button
                    type="button"
                    disabled={primaryLevel <= 1 || !ok}
                    onClick={() => addMulticlass(c.id)}
                    className={[
                      'px-2 py-1 rounded border text-xs transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-40',
                      ok
                        ? 'border-[#B8860B]/40 text-[#F5F0E8] hover:bg-[#B8860B]/10'
                        : 'border-red-800/40 text-[#A8A09B]',
                    ].join(' ')}
                  >
                    {c.name}
                  </button>
                  {!ok && prereq && (
                    <span className="text-[9px] text-red-400">
                      {prereq.abilities.join(prereq.mode === 'ou' ? '/' : '+')} 13+
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <p className="text-xs text-[#A8A09B] bg-[#2D2520] border border-[#B8860B]/10 rounded-lg px-3 py-2">
        {t('multiclass.prereqNote')}
      </p>

      <WizardNav onBack={() => setStep(6)} onNext={() => setStep(8)} nextDisabled={!multiclassOk} />
    </div>
  )
}
