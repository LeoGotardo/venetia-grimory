import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useFichaStore } from '../../store/fichaStore'
import { WizardNav } from './WizardNav'
import { Card } from '../ui/Card'
import { Badge, DadoBadge } from '../ui/Badge'
import { Modal } from '../ui/Modal'
import type { Classe } from '../../types'
import { dados } from '../../data/dados'

const complexidadeCor: Record<string, string> = {
  Low: 'green',
  Medium: 'gold',
  High: 'crimson',
  Baixa: 'green',
  Média: 'gold',
  Alta: 'crimson',
}

export function Step02Classe() {
  const { ficha, setClasse, setPasso } = useFichaStore()
  const { t } = useTranslation()
  const classeId = ficha.identidade.classe_id
  const [modalClasse, setModalClasse] = useState<Classe | null>(null)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cinzel text-2xl font-bold text-[#F5F0E8] mb-1">{t('step02.heading')}</h2>
        <p className="text-[#A8A09B] text-sm">{t('step02.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {dados.classes.map(classe => (
          <Card
            key={classe.id}
            selected={classeId === classe.id}
            hoverable
            onClick={() => setClasse(classe.id)}
            className="relative"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-cinzel font-bold text-[#F5F0E8]">{classe.nome}</h3>
                <p className="text-[#A8A09B] text-xs">{classe.interesse}</p>
              </div>
              <DadoBadge tipo={`d${classe.dado_vida}`} />
            </div>
            <p className="text-[#B8860B] text-xs mb-2">{classe.atributos_primarios.join(', ')}</p>
            <p className="text-[#A8A09B] text-xs line-clamp-2 mb-3">{classe.descricao}</p>
            <div className="flex items-center justify-between">
              <Badge variant={complexidadeCor[classe.complexidade] as 'green' | 'gold' | 'crimson'}>
                {classe.complexidade === 'Baixa' ? 'Low' : classe.complexidade === 'Média' ? 'Medium' : classe.complexidade === 'Alta' ? 'High' : classe.complexidade}
              </Badge>
              <button
                onClick={e => { e.stopPropagation(); setModalClasse(classe) }}
                className="text-xs text-[#B8860B] hover:text-[#D4A017] underline cursor-pointer"
              >
                {t('step02.details')}
              </button>
            </div>
          </Card>
        ))}
      </div>

      {classeId && (() => {
        const c = dados.classes.find(c => c.id === classeId)
        if (!c) return null
        return (
          <div className="bg-[#3D332D] border border-[#B8860B]/30 rounded-lg p-4 space-y-2">
            <h3 className="font-cinzel font-semibold text-[#B8860B]">{c.nome} — {t('step02.summary')}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div><span className="text-[#A8A09B]">{t('step02.hitDie')}</span> <span className="text-[#F5F0E8] font-semibold">d{c.dado_vida}</span></div>
              <div><span className="text-[#A8A09B]">{t('step02.saves')}</span> <span className="text-[#F5F0E8]">{c.salvaguardas.join(', ')}</span></div>
              <div><span className="text-[#A8A09B]">{t('step02.armors')}</span> <span className="text-[#F5F0E8]">{c.armaduras.join(', ') || t('step02.noArmor')}</span></div>
              <div><span className="text-[#A8A09B]">{t('step02.skills')}</span> <span className="text-[#F5F0E8]">{t('step02.skillChoice', { n: c.num_pericias })}</span></div>
            </div>

            <CaracteristicasDeClasse classe={c} nivel={ficha.identidade.nivel} />
          </div>
        )
      })()}

      <Modal
        open={!!modalClasse}
        onClose={() => setModalClasse(null)}
        title={modalClasse?.nome}
        wide
      >
        {modalClasse && (
          <div className="space-y-4 text-sm">
            <p className="text-[#A8A09B]">{modalClasse.descricao}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#2D2520] rounded p-3">
                <div className="text-[#B8860B] font-semibold mb-1">{t('step02.hitDieSection')}</div>
                <DadoBadge tipo={`d${modalClasse.dado_vida}`} />
              </div>
              <div className="bg-[#2D2520] rounded p-3">
                <div className="text-[#B8860B] font-semibold mb-1">{t('step02.primaryAttrs')}</div>
                <div className="text-[#F5F0E8]">{modalClasse.atributos_primarios.join(', ')}</div>
              </div>
              <div className="bg-[#2D2520] rounded p-3">
                <div className="text-[#B8860B] font-semibold mb-1">{t('step02.savesSection')}</div>
                <div className="text-[#F5F0E8]">{modalClasse.salvaguardas.join(', ')}</div>
              </div>
              <div className="bg-[#2D2520] rounded p-3">
                <div className="text-[#B8860B] font-semibold mb-1">{t('step02.profs')}</div>
                <div className="text-[#F5F0E8]">{[...modalClasse.armaduras, ...modalClasse.armas].join(', ')}</div>
              </div>
            </div>
            <div>
              <div className="text-[#B8860B] font-semibold mb-2">{t('step02.subclassesSection')}</div>
              <div className="grid grid-cols-2 gap-2">
                {modalClasse.subclasses.map(s => (
                  <div key={s.id} className="bg-[#2D2520] rounded p-2">
                    <div className="text-[#F5F0E8] text-sm font-semibold">{s.nome}</div>
                    {s.descricao && <p className="text-[#A8A09B] text-xs mt-0.5 leading-relaxed">{s.descricao}</p>}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[#B8860B] font-semibold mb-2">{t('step02.progressionSection')}</div>
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#B8860B]/20">
                    <th className="py-1 px-2 text-left text-[#B8860B]">{t('step02.colLevel')}</th>
                    <th className="py-1 px-2 text-left text-[#B8860B]">{t('step02.colProfBonus')}</th>
                    <th className="py-1 px-2 text-left text-[#B8860B]">{t('step02.colHighlights')}</th>
                  </tr>
                </thead>
                <tbody>
                  {modalClasse.progressao.map(p => {
                    const bloqueado = p.nivel > ficha.identidade.nivel
                    return (
                      <tr key={p.nivel} className={`border-b border-[#3D332D] ${bloqueado ? 'opacity-45' : ''}`}>
                        <td className="py-1 px-2 text-[#F5F0E8] whitespace-nowrap">
                          {bloqueado && <LockIcon />} {p.nivel}
                        </td>
                        <td className="py-1 px-2 text-[#F5F0E8]">+{p.bonus_prof}</td>
                        <td className="py-1 px-2 text-[#A8A09B]">{p.destaques.join(', ')}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      <WizardNav onBack={() => setPasso(1)} onNext={() => setPasso(3)} nextDisabled={!classeId} />
    </div>
  )
}

interface CaracteristicasProps {
  classe: Classe
  nivel: number
}

/**
 * Características de classe por nível: as já desbloqueadas no nível escolhido
 * aparecem destacadas; as de níveis acima ficam esmaecidas com cadeado.
 */
function CaracteristicasDeClasse({ classe, nivel }: CaracteristicasProps) {
  const { t } = useTranslation()
  const linhas = classe.progressao.filter(p => p.destaques.length > 0)
  const desbloqueadas = linhas
    .filter(p => p.nivel <= nivel)
    .reduce((soma, p) => soma + p.destaques.length, 0)

  return (
    <div className="pt-3 border-t border-[#B8860B]/20 space-y-2">
      <div className="flex items-baseline justify-between">
        <h4 className="font-cinzel font-semibold text-[#B8860B] text-sm">{t('step02.featuresHeading')}</h4>
        <span className="text-xs text-[#A8A09B]">
          {t('step02.featuresUnlocked', { n: desbloqueadas, nivel })}
        </span>
      </div>

      <div className="max-h-56 overflow-y-auto pr-1 space-y-1.5">
        {linhas.map(p => {
          const bloqueado = p.nivel > nivel
          return (
            <div key={p.nivel} className="flex items-start gap-2">
              <span
                title={bloqueado ? t('step02.lockedAtLevel', { n: p.nivel }) : undefined}
                className={[
                  'shrink-0 w-9 text-center text-[11px] font-bold rounded px-1 py-0.5 border',
                  bloqueado
                    ? 'border-[#A8A09B]/25 text-[#A8A09B]/60'
                    : 'border-[#B8860B]/50 bg-[#B8860B]/15 text-[#D4A017]',
                ].join(' ')}
              >
                {p.nivel}
              </span>
              <div className="flex flex-wrap gap-1">
                {p.destaques.map(d => (
                  <span
                    key={d}
                    className={[
                      'inline-flex items-center gap-1 text-xs rounded px-2 py-0.5 border',
                      bloqueado
                        ? 'bg-transparent border-[#A8A09B]/20 text-[#A8A09B]/60'
                        : 'bg-[#2D2520] border-[#B8860B]/25 text-[#F5F0E8]',
                    ].join(' ')}
                  >
                    {bloqueado && <LockIcon />}
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function LockIcon() {
  return (
    <svg
      width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      className="inline-block shrink-0 opacity-70"
      aria-hidden="true"
    >
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  )
}
