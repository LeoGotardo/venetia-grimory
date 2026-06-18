import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useFichaStore } from '../../store/fichaStore'
import { WizardNav } from './WizardNav'
import { Card } from '../ui/Card'
import dadosJson from '../../data/dnd_dados.json'
import type { DadosJogo, AtributoId } from '../../types'
import { MULTICLASSE_PREREQUISITOS } from '../../constants'

const dados = dadosJson as unknown as DadosJogo

export function Step03Subclasse() {
  const { ficha, setSubclasse, addMulticlasse, removeMulticlasse, setMulticlasseNivel, setSubclasseMulticlasse, setPasso } = useFichaStore()
  const { t } = useTranslation()
  const nivel = ficha.identidade.nivel
  const classeId = ficha.identidade.classe_id
  const subclasseId = ficha.identidade.subclasse_id
  const classe = dados.classes.find(c => c.id === classeId)
  const multiclasses = ficha.identidade.multiclasses ?? []

  // Tela interna: 'subclasse' | 'multiclasse'
  const [tela, setTela] = useState<'subclasse' | 'multiclasse'>('subclasse')

  const subclasseOk = nivel < 3 || !!subclasseId

  // Navegar para próximo passo depois da tela de multiclasse
  function avancar() {
    setPasso(4)
  }

  if (tela === 'subclasse') {
    return (
      <SubclasseTela
        nivel={nivel}
        classeId={classeId}
        subclasseId={subclasseId}
        classe={classe}
        onBack={() => setPasso(2)}
        onNext={() => nivel > 1 ? setTela('multiclasse') : avancar()}
        subclasseOk={subclasseOk}
        setSubclasse={setSubclasse}
      />
    )
  }

  return (
    <MulticlasseTela
      nivel={nivel}
      classeId={classeId}
      multiclasses={multiclasses}
      atributos={ficha.atributos}
      addMulticlasse={addMulticlasse}
      removeMulticlasse={removeMulticlasse}
      setMulticlasseNivel={setMulticlasseNivel}
      setSubclasseMulticlasse={setSubclasseMulticlasse}
      onBack={() => setTela('subclasse')}
      onNext={avancar}
      t={t}
    />
  )
}

function SubclasseTela({
  nivel, classeId, subclasseId, classe, onBack, onNext, subclasseOk, setSubclasse,
}: {
  nivel: number
  classeId: string | null
  subclasseId: string | null
  classe: { nome: string; subclasses: { id: string; nome: string; descricao?: string }[] } | undefined
  onBack: () => void
  onNext: () => void
  subclasseOk: boolean
  setSubclasse: (id: string | null) => void
}) {
  const { t } = useTranslation()

  if (nivel < 3) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-cinzel text-2xl font-bold text-[#F5F0E8] mb-1">{t('step03.heading')}</h2>
        </div>
        <div className="bg-[#3D332D] border border-[#B8860B]/30 rounded-lg p-6 text-center">
          <div className="text-4xl mb-3">🔒</div>
          <h3 className="font-cinzel text-lg text-[#F5F0E8] mb-2">{t('step03.lockedHeading')}</h3>
          <p className="text-[#A8A09B] text-sm">{t('step03.lockedDesc', { n: nivel })}</p>
        </div>
        <WizardNav onBack={onBack} onNext={onNext} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cinzel text-2xl font-bold text-[#F5F0E8] mb-1">{t('step03.heading')}</h2>
        <p className="text-[#A8A09B] text-sm">{t('step03.subtitle', { classe: classe?.nome })}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {classe?.subclasses.map(sub => (
          <Card
            key={sub.id}
            selected={subclasseId === sub.id}
            hoverable
            onClick={() => setSubclasse(sub.id)}
          >
            <h3 className="font-cinzel font-bold text-[#F5F0E8] mb-1">{sub.nome}</h3>
            <p className="text-[#A8A09B] text-xs">{sub.descricao ?? t('step03.subtitle', { classe: classe.nome })}</p>
          </Card>
        ))}
      </div>

      <WizardNav onBack={onBack} onNext={onNext} nextDisabled={!subclasseOk} />
    </div>
  )
}

function MulticlasseTela({
  nivel, classeId, multiclasses, atributos,
  addMulticlasse, removeMulticlasse, setMulticlasseNivel, setSubclasseMulticlasse,
  onBack, onNext, t,
}: {
  nivel: number
  classeId: string | null
  multiclasses: { classe_id: string; subclasse_id: string | null; nivel: number }[]
  atributos: Record<AtributoId, { valor: number | null }>
  addMulticlasse: (id: string) => void
  removeMulticlasse: (id: string) => void
  setMulticlasseNivel: (id: string, n: number) => void
  setSubclasseMulticlasse: (id: string, sub: string | null) => void
  onBack: () => void
  onNext: () => void
  t: ReturnType<typeof useTranslation>['t']
}) {
  const nivelPrimaria = nivel - multiclasses.reduce((s, m) => s + m.nivel, 0)
  const classesDisponiveis = dados.classes.filter(c =>
    c.id !== classeId && !multiclasses.some(m => m.classe_id === c.id)
  )

  function checarPrerequisito(cId: string): boolean {
    const prereq = MULTICLASSE_PREREQUISITOS[cId]
    if (!prereq) return true
    const vals = prereq.atributos.map(a => atributos[a]?.valor ?? 0)
    return prereq.modo === 'ou' ? vals.some(v => v >= 13) : vals.every(v => v >= 13)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cinzel text-2xl font-bold text-[#F5F0E8] mb-1">{t('multiclass.title')}</h2>
        <p className="text-[#A8A09B] text-sm">{t('multiclass.wizardHint')}</p>
      </div>

      {/* Classe primária */}
      <div className="bg-[#3D332D] border border-[#B8860B]/20 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#A8A09B] uppercase tracking-wide">{t('multiclass.primaryClass')}</span>
          <span className="font-cinzel font-bold text-[#B8860B]">{t('multiclass.levelIn', { n: nivelPrimaria })}</span>
        </div>
        <p className="font-cinzel font-semibold text-[#F5F0E8]">
          {dados.classes.find(c => c.id === classeId)?.nome ?? '—'}
        </p>

        {/* Classes secundárias */}
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
                <select value={m.subclasse_id ?? ''} onChange={e => setSubclasseMulticlasse(m.classe_id, e.target.value || null)}
                  className="w-full bg-[#2D2520] border border-[#B8860B]/30 rounded px-2 py-1.5 text-[#F5F0E8] text-xs focus:outline-none focus:ring-1 focus:ring-[#B8860B]">
                  <option value="">{t('step03.heading')}</option>
                  {c?.subclasses.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                </select>
              )}
            </div>
          )
        })}

        {/* Adicionar nova classe */}
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
                    disabled={nivelPrimaria <= 1}
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

      <WizardNav onBack={onBack} onNext={onNext} />
    </div>
  )
}
