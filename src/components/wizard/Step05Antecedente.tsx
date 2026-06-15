import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useFichaStore } from '../../store/fichaStore'
import { WizardNav } from './WizardNav'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { TOTAL_PONTOS_ATRIBUTO_ANTECEDENTE } from '../../constants'
import dadosJson from '../../data/dnd_dados.json'
import type { DadosJogo, AtributoId } from '../../types'

const dados = dadosJson as unknown as DadosJogo

type ModoDistribuicao = '2+1' | '1+1+1'

export function Step05Antecedente() {
  const { ficha, setAntecedenteId, setAntecedente, setPasso } = useFichaStore()
  const { t } = useTranslation()
  const antecedenteId = ficha.identidade.antecedente_id

  const [distribuicao, setDistribuicao] = useState<Partial<Record<AtributoId, number>>>({})
  const [modoDistrib, setModoDistrib] = useState<ModoDistribuicao>('2+1')

  const ante = dados.antecedentes?.find(a => a.id === antecedenteId)
  const totalDistrib = Object.values(distribuicao).reduce((acc, b) => acc + b, 0)
  const distribOk = totalDistrib === TOTAL_PONTOS_ATRIBUTO_ANTECEDENTE
  const distribuicaoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!antecedenteId) return
    const timer = setTimeout(() => {
      distribuicaoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 150)
    return () => clearTimeout(timer)
  }, [antecedenteId])

  function autoDistribuir1Cada(sugeridos: AtributoId[]) {
    const auto: Partial<Record<AtributoId, number>> = {}
    sugeridos.slice(0, TOTAL_PONTOS_ATRIBUTO_ANTECEDENTE).forEach(attr => { auto[attr] = 1 })
    setDistribuicao(auto)
  }

  function selecionarAntecedente(id: string) {
    const novoAnte = dados.antecedentes?.find(a => a.id === id)
    if (modoDistrib === '1+1+1' && novoAnte && novoAnte.atributos_sugeridos.length >= TOTAL_PONTOS_ATRIBUTO_ANTECEDENTE) {
      autoDistribuir1Cada(novoAnte.atributos_sugeridos)
    } else {
      setDistribuicao({})
    }
    setAntecedenteId(id)
  }

  function setBonus(attr: AtributoId, val: number) {
    setDistribuicao(prev => {
      const next = { ...prev, [attr]: val }
      if (val === 0) delete next[attr]
      return next
    })
  }

  function trocarModo(modo: ModoDistribuicao) {
    setModoDistrib(modo)
    if (modo === '1+1+1' && ante && ante.atributos_sugeridos.length >= TOTAL_PONTOS_ATRIBUTO_ANTECEDENTE) {
      autoDistribuir1Cada(ante.atributos_sugeridos)
    } else {
      setDistribuicao({})
    }
  }

  function handleConfirm() {
    if (!antecedenteId || !distribOk) return
    setAntecedente(antecedenteId, distribuicao)
    setPasso(7)
  }

  const atributosRolados = (['FOR','DES','CON','INT','SAB','CAR'] as AtributoId[])
    .map(a => ({ attr: a, valor: ficha.atributos[a].valor }))
    .filter(x => x.valor !== null) as { attr: AtributoId; valor: number }[]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cinzel text-2xl font-bold text-[#F5F0E8] mb-1">{t('step05.heading')}</h2>
        <p className="text-[#A8A09B] text-sm">{t('step05.subtitle')}</p>
      </div>

      {/* Atributos definidos no passo anterior */}
      {atributosRolados.length > 0 && (
        <div className="bg-[#2D2520] border border-[#B8860B]/20 rounded-lg px-4 py-3">
          <p className="text-xs font-semibold text-[#B8860B] mb-2">{t('step05.yourAttrs')}</p>
          <div className="flex flex-wrap gap-2">
            {atributosRolados.map(({ attr, valor }) => (
              <div key={attr} className="flex flex-col items-center min-w-[44px] bg-[#3D332D] border border-[#B8860B]/20 rounded-lg px-2 py-1.5">
                <span className="text-[10px] text-[#A8A09B] font-semibold">{attr}</span>
                <span className="font-cinzel font-bold text-lg text-[#F5F0E8] leading-none">{valor}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {dados.antecedentes?.map(a => (
          <Card
            key={a.id}
            selected={antecedenteId === a.id}
            hoverable
            onClick={() => selecionarAntecedente(a.id)}
          >
            <h3 className="font-cinzel font-bold text-[#F5F0E8] mb-1">{a.nome}</h3>
            <div className="flex flex-wrap gap-1 mb-2">
              {a.pericias.map(p => (
                <Badge key={p} variant="blue">
                  {dados.pericias.find(x => x.id === p)?.nome ?? p}
                </Badge>
              ))}
            </div>
            {a.ferramenta && (
              <p className="flex items-center gap-1 text-xs text-[#A8A09B]">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                {a.ferramenta}
              </p>
            )}
            <p className="flex items-center gap-1 text-xs text-[#B8860B] mt-1">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0"><path d="M12 2l2.4 7.6H22l-6.2 4.5 2.4 7.6L12 17.2l-6.2 4.5 2.4-7.6L2 9.6h7.6z"/></svg>
              {a.talento}
            </p>
          </Card>
        ))}
      </div>

      {ante && (
        <div ref={distribuicaoRef}>
          <DistribuicaoAtributos
            ante={ante}
            distribuicao={distribuicao}
            modoDistrib={modoDistrib}
            totalDistrib={totalDistrib}
            atributosBase={ficha.atributos}
            onSetBonus={setBonus}
            onTrocarModo={trocarModo}
          />
        </div>
      )}

      <WizardNav
        onBack={() => setPasso(5)}
        onNext={handleConfirm}
        nextDisabled={!antecedenteId || !distribOk}
      />
    </div>
  )
}

interface DistribuicaoAtributosProps {
  ante: { nome: string; atributos_sugeridos: AtributoId[] }
  distribuicao: Partial<Record<AtributoId, number>>
  modoDistrib: ModoDistribuicao
  totalDistrib: number
  atributosBase: Record<AtributoId, { valor: number | null }>
  onSetBonus: (attr: AtributoId, val: number) => void
  onTrocarModo: (modo: ModoDistribuicao) => void
}

function DistribuicaoAtributos({
  ante,
  distribuicao,
  modoDistrib,
  totalDistrib,
  atributosBase,
  onSetBonus,
  onTrocarModo,
}: DistribuicaoAtributosProps) {
  const { t } = useTranslation()
  const maxPorAtributo = modoDistrib === '2+1' ? 2 : 1

  return (
    <div className="bg-[#3D332D] border border-[#B8860B]/30 rounded-lg p-4 space-y-4">
      <h3 className="font-cinzel font-semibold text-[#B8860B]">{t('step05.bonusHeading', { ante: ante.nome })}</h3>
      <p className="text-[#A8A09B] text-xs">
        {t('step05.distributeHint', { n: TOTAL_PONTOS_ATRIBUTO_ANTECEDENTE })}
      </p>

      <div className="flex gap-3">
        {(['2+1', '1+1+1'] as ModoDistribuicao[]).map(modo => (
          <button
            key={modo}
            onClick={() => onTrocarModo(modo)}
            className={`px-3 py-1 rounded text-sm border cursor-pointer transition-colors
              ${modoDistrib === modo
                ? 'bg-[#7B1D1D] border-[#7B1D1D] text-white'
                : 'border-[#B8860B]/30 text-[#A8A09B] hover:bg-[#4D4037]'}`}
          >
            +{modo}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {ante.atributos_sugeridos.map(attr => {
          const val = distribuicao[attr] ?? 0
          const baseRef = atributosBase[attr]?.valor ?? null
          return (
            <BonusAtributoControl
              key={attr}
              attr={attr}
              val={val}
              maxVal={maxPorAtributo}
              totalDistrib={totalDistrib}
              baseRef={baseRef}
              onSetBonus={onSetBonus}
            />
          )
        })}
      </div>

      <p className="text-xs text-right">
        <span className={totalDistrib === TOTAL_PONTOS_ATRIBUTO_ANTECEDENTE ? 'text-green-400' : 'text-[#A8A09B]'}>
          {t('step05.distributed', { current: totalDistrib, total: TOTAL_PONTOS_ATRIBUTO_ANTECEDENTE })}
        </span>
      </p>
    </div>
  )
}

interface BonusAtributoControlProps {
  attr: AtributoId
  val: number
  maxVal: number
  totalDistrib: number
  baseRef: number | null
  onSetBonus: (attr: AtributoId, val: number) => void
}

function BonusAtributoControl({ attr, val, maxVal, totalDistrib, baseRef, onSetBonus }: BonusAtributoControlProps) {
  const { t } = useTranslation()
  const podeDecrementar = val > 0
  const podeIncrementar = val < maxVal && totalDistrib < TOTAL_PONTOS_ATRIBUTO_ANTECEDENTE

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[#B8860B] text-xs font-bold">{attr}</span>
      {baseRef !== null && (
        <span className="text-[10px] text-[#A8A09B]">
          {t('step05.base', { n: baseRef })}{val > 0 && <span className="text-green-400"> →{baseRef + val}</span>}
        </span>
      )}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onSetBonus(attr, Math.max(0, val - 1))}
          disabled={!podeDecrementar}
          className="w-6 h-6 rounded bg-[#2D2520] border border-[#B8860B]/20 text-[#F5F0E8] text-xs hover:bg-[#3D332D] disabled:opacity-30 cursor-pointer disabled:cursor-default"
        >
          −
        </button>
        <span className={`w-8 text-center font-bold text-lg ${val > 0 ? 'text-green-400' : 'text-[#A8A09B]'}`}>
          {val > 0 ? `+${val}` : '0'}
        </span>
        <button
          onClick={() => onSetBonus(attr, Math.min(maxVal, val + 1))}
          disabled={!podeIncrementar}
          className="w-6 h-6 rounded bg-[#2D2520] border border-[#B8860B]/20 text-[#F5F0E8] text-xs hover:bg-[#3D332D] disabled:opacity-30 cursor-pointer disabled:cursor-default"
        >
          +
        </button>
      </div>
    </div>
  )
}
