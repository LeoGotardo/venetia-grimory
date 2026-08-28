import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useFichaStore } from '../../store/fichaStore'
import { WizardNav } from './WizardNav'

import { MULTICLASSE_PREREQUISITOS } from '../../constants'
import { dados } from '../../data/dados'

export function StepMulticlasse() {
  const {
    ficha, setPasso,
    addMulticlasse, removeMulticlasse, setMulticlasseNivel, setSubclasseMulticlasse,
  } = useFichaStore()
  const { t } = useTranslation()

  const nivel = ficha.identidade.nivel
  const classeId = ficha.identidade.classe_id
  const multiclasses = ficha.identidade.multiclasses ?? []
  const atributos = ficha.atributos
  const nivelPrimaria = nivel - multiclasses.reduce((s, m) => s + m.nivel, 0)

  const classesDisponiveis = dados.classes.filter(c =>
    c.id !== classeId && !multiclasses.some(m => m.classe_id === c.id)
  )

  useEffect(() => {
    for (const m of multiclasses) {
      if (m.nivel >= 3 && !m.subclasse_id) {
        const firstSub = dados.classes.find(c => c.id === m.classe_id)?.subclasses[0]
        if (firstSub) setSubclasseMulticlasse(m.classe_id, firstSub.id)
      }
    }
  }, [multiclasses])

  const multiclasseOk = multiclasses.every(m => m.nivel < 3 || !!m.subclasse_id)

  function checarPrerequisito(cId: string): boolean {
    const prereq = MULTICLASSE_PREREQUISITOS[cId]
    if (!prereq) return true
    const vals = prereq.atributos.map(a => atributos[a]?.valor)
    if (vals.some(v => v === null || v === undefined)) return true
    return prereq.modo === 'ou'
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
          <span className="font-cinzel font-bold text-[#B8860B]">{t('multiclass.levelIn', { n: nivelPrimaria })}</span>
        </div>
        <p className="font-cinzel font-semibold text-[#F5F0E8]">
          {dados.classes.find(c => c.id === classeId)?.nome ?? '—'}
        </p>

        {multiclasses.map(m => {
          const c = dados.classes.find(cc => cc.id === m.classe_id)
          const maxN = nivel - multiclasses.filter(x => x.classe_id !== m.classe_id).reduce((s, x) => s + x.nivel, 0) - 1
          return (
            <div key={m.classe_id} className="border-t border-[#B8860B]/10 pt-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex-1 text-sm text-[#F5F0E8] font-medium">{c?.nome ?? m.classe_id}</span>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => setMulticlasseNivel(m.classe_id, m.nivel - 1)} disabled={m.nivel <= 1}
                    className="w-6 h-6 rounded bg-[#2D2520] border border-[#B8860B]/20 text-[#F5F0E8] text-xs disabled:opacity-30 cursor-pointer disabled:cursor-default hover:bg-[#4D4037]">−</button>
                  <span className="w-6 text-center font-cinzel font-bold text-[#F5F0E8] text-sm">{m.nivel}</span>
                  <button type="button" onClick={() => setMulticlasseNivel(m.classe_id, m.nivel + 1)} disabled={m.nivel >= maxN}
                    className="w-6 h-6 rounded bg-[#2D2520] border border-[#B8860B]/20 text-[#F5F0E8] text-xs disabled:opacity-30 cursor-pointer disabled:cursor-default hover:bg-[#4D4037]">+</button>
                </div>
                <button type="button" onClick={() => removeMulticlasse(m.classe_id)}
                  className="text-[#A8A09B] hover:text-red-400 px-1 text-sm cursor-pointer transition-colors">×</button>
              </div>
              {m.nivel >= 3 && (
                <select value={m.subclasse_id ?? ''} onChange={e => setSubclasseMulticlasse(m.classe_id, e.target.value)}
                  className="w-full bg-[#2D2520] border border-[#B8860B]/30 rounded px-2 py-1.5 text-[#F5F0E8] text-xs focus:outline-none focus:ring-1 focus:ring-[#B8860B]">
                  {c?.subclasses.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                </select>
              )}
            </div>
          )
        })}

        <div className="border-t border-[#B8860B]/10 pt-3">
          <p className="text-xs text-[#A8A09B] mb-2">{t('multiclass.addClass')}</p>
          <div className="flex flex-wrap gap-2">
            {classesDisponiveis.map(c => {
              const ok = checarPrerequisito(c.id)
              const prereq = MULTICLASSE_PREREQUISITOS[c.id]
              return (
                <div key={c.id} className="flex flex-col items-center gap-0.5">
                  <button
                    type="button"
                    disabled={nivelPrimaria <= 1 || !ok}
                    onClick={() => addMulticlasse(c.id)}
                    className={[
                      'px-2 py-1 rounded border text-xs transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-40',
                      ok
                        ? 'border-[#B8860B]/40 text-[#F5F0E8] hover:bg-[#B8860B]/10'
                        : 'border-red-800/40 text-[#A8A09B]',
                    ].join(' ')}
                  >
                    {c.nome}
                  </button>
                  {!ok && prereq && (
                    <span className="text-[9px] text-red-400">
                      {prereq.atributos.join(prereq.modo === 'ou' ? '/' : '+')} 13+
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

      <WizardNav onBack={() => setPasso(6)} onNext={() => setPasso(8)} nextDisabled={!multiclasseOk} />
    </div>
  )
}
