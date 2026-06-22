import { useTranslation } from 'react-i18next'
import { useFichaStore } from '../../store/fichaStore'
import { WizardNav } from './WizardNav'
import { formatModificador } from '../../lib/calculos'
import { dados } from '../../data/dados'

function numEspecializacoes(classeId: string | null, nivel: number): number {
  if (classeId === 'ladino') return nivel >= 6 ? 4 : 2
  if (classeId === 'bardo') {
    if (nivel >= 9) return 4
    if (nivel >= 2) return 2
  }
  return 0
}

export function Step07Pericias() {
  const { ficha, setPericias, setEspecializacao, setPasso } = useFichaStore()
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

  const numEspec = numEspecializacoes(classeId, ficha.identidade.nivel)
  const proficientesIds = dados.pericias
    .filter(p => ficha.pericias[p.id]?.proficiente)
    .map(p => p.id)
  const especIds = dados.pericias
    .filter(p => ficha.pericias[p.id]?.expertise)
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

  function toggleEspec(periciaId: string) {
    if (!ficha.pericias[periciaId]?.proficiente) return
    const jaEspec = especIds.includes(periciaId)
    if (!jaEspec && especIds.length >= numEspec) return
    const nova = jaEspec ? especIds.filter(p => p !== periciaId) : [...especIds, periciaId]
    setEspecializacao(nova)
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

      {numEspec > 0 && (
        <div className="space-y-3 pt-2 border-t border-[#B8860B]/20">
          <div>
            <p className="text-sm font-semibold text-[#F5F0E8]">{t('step07.especializacaoHeading')}</p>
            <p className="text-xs text-[#A8A09B] mt-1">{t('step07.especializacaoHint', { n: numEspec })}</p>
            <p className="text-xs text-[#B8860B] mt-1">{t('step07.especializacaoSelected', { n: especIds.length, max: numEspec })}</p>
          </div>
          <div className="space-y-1">
            {proficientesIds.map(pid => {
              const p = dados.pericias.find(x => x.id === pid)
              if (!p) return null
              const isEspec = especIds.includes(pid)
              const bloqueada = !isEspec && especIds.length >= numEspec
              return (
                <button
                  key={pid}
                  onClick={() => toggleEspec(pid)}
                  disabled={bloqueada}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded text-left transition-all cursor-pointer disabled:cursor-default
                    ${isEspec ? 'bg-[#1a3d2b] border border-green-700/60' : 'hover:bg-[#3D332D]'}
                    ${bloqueada ? 'opacity-40' : ''}`}
                >
                  <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${isEspec ? 'bg-green-700 border-green-700' : 'border-[#6B6560]'}`} />
                  <span className={`text-sm font-medium ${isEspec ? 'text-green-300' : 'text-[#B8860B]'}`}>{p.nome}</span>
                  {isEspec && <span className="text-xs text-green-400 ml-auto">{t('step07.expertiseBadge')}</span>}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <WizardNav
        onBack={() => setPasso(7)}
        onNext={() => setPasso(9)}
        nextDisabled={selecionadasClasse.length < numMax || (numEspec > 0 && especIds.length < numEspec)}
      />
    </div>
  )
}
