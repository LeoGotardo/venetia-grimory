import { useTranslation } from 'react-i18next'
import { useFichaStore } from '../../store/fichaStore'
import { WizardNav } from './WizardNav'
import { formatModificador } from '../../lib/calculos'
import dadosJson from '../../data/dnd_dados.json'
import type { DadosJogo } from '../../types'

const dados = dadosJson as unknown as DadosJogo

export function Step07Pericias() {
  const { ficha, setPericias, setPasso } = useFichaStore()
  const { t } = useTranslation()
  const classeId = ficha.identidade.classe_id
  const classe = dados.classes.find(c => c.id === classeId)
  const antecedenteId = ficha.identidade.antecedente_id
  const ante = dados.antecedentes?.find(a => a.id === antecedenteId)
  const antePerics = ante?.pericias ?? []

  const numMax = classe?.num_pericias ?? 2
  const disponiveisClasse = classe?.pericias_disponiveis === 'qualquer'
    ? dados.pericias.map(p => p.id)
    : (classe?.pericias_disponiveis ?? [])

  const selecionadasClasse = dados.pericias
    .filter(p => ficha.pericias[p.id]?.proficiente && !antePerics.includes(p.id))
    .map(p => p.id)

  function togglePericia(periciaId: string) {
    if (antePerics.includes(periciaId)) return
    if (!disponiveisClasse.includes(periciaId)) return
    const jaSelecionada = selecionadasClasse.includes(periciaId)
    if (!jaSelecionada && selecionadasClasse.length >= numMax) return
    const novaLista = jaSelecionada
      ? selecionadasClasse.filter(p => p !== periciaId)
      : [...selecionadasClasse, periciaId]
    setPericias([...antePerics, ...novaLista])
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cinzel text-2xl font-bold text-[#F5F0E8] mb-1">{t('step07.heading')}</h2>
        <p className="text-[#A8A09B] text-sm">
          {t('step07.chooseN', { n: numMax })}
          {' '}<span className="text-[#B8860B]">{t('step07.selected', { n: selecionadasClasse.length, max: numMax })}</span>
        </p>
      </div>

      <div className="space-y-1">
        {dados.pericias.map(p => {
          const fichaP = ficha.pericias[p.id]
          const daAnte = antePerics.includes(p.id)
          const daClasse = disponiveisClasse.includes(p.id)
          const selecionada = fichaP?.proficiente
          const mod = fichaP?._valor
          const bloqueada = daAnte || (!daClasse && !selecionada)

          return (
            <button
              key={p.id}
              onClick={() => togglePericia(p.id)}
              disabled={bloqueada}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded text-left transition-all cursor-pointer disabled:cursor-default
                ${selecionada ? 'bg-[#4D2020] border border-[#7B1D1D]/60' : 'hover:bg-[#3D332D]'}
                ${bloqueada ? 'opacity-50' : ''}`}
            >
              <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${selecionada ? 'bg-[#7B1D1D] border-[#7B1D1D]' : 'border-[#6B6560]'}`} />
              <div className="flex-1">
                <span className={`text-sm font-medium ${selecionada ? 'text-[#F5F0E8]' : 'text-[#B8860B]'}`}>{p.nome}</span>
                <span className="text-xs text-[#A8A09B] ml-2">({p.atributo})</span>
                {daAnte && <span className="text-xs text-[#B8860B] ml-2">{t('step07.backgroundBadge')}</span>}
              </div>
              <span className={`text-sm font-bold min-w-[3rem] text-right ${(mod ?? 0) >= 3 ? 'text-green-400' : mod && mod > 0 ? 'text-[#F5F0E8]' : 'text-[#A8A09B]'}`}>
                {mod !== null && mod !== undefined ? formatModificador(mod) : '—'}
              </span>
            </button>
          )
        })}
      </div>

      <WizardNav
        onBack={() => setPasso(6)}
        onNext={() => setPasso(8)}
        nextDisabled={selecionadasClasse.length < numMax}
      />
    </div>
  )
}
