import { useState, useMemo } from 'react'
import { useFichaStore } from '../../store/fichaStore'
import { WizardNav } from './WizardNav'
import { calcModificador, formatModificador, ATRIBUTOS, ATRIBUTO_NOMES } from '../../lib/calculos'
import { useAtributosWizard } from '../../hooks/useAtributosWizard'
import { CUSTO_PONTOS_COMPRA } from '../../constants'
import dadosJson from '../../data/dnd_dados.json'
import type { DadosJogo, AtributoId } from '../../types'
import type { MetodoAtributos } from '../../hooks/useAtributosWizard'

const dados = dadosJson as unknown as DadosJogo

const LABEL_METODO: Record<MetodoAtributos, string> = {
  padrao: 'Conjunto Padrão',
  aleatorio: 'Aleatório',
  compra: 'Compra de Pontos',
}

export function Step06Atributos() {
  const { ficha, setAtributos, setPasso, rolagemAtributos, setRolagemAtributos } = useFichaStore()
  const wizard = useAtributosWizard({ initialRoll: rolagemAtributos, onRoll: setRolagemAtributos })

  const classeId = ficha.identidade.classe_id
  const nivel = ficha.identidade.nivel ?? 1
  const sugeridos = dados.atributos_sugeridos_por_classe?.[classeId ?? ''] ?? []
  const nomePrimeiroSugerido = sugeridos[0]

  const numASIs = useMemo(() => {
    if (!classeId) return 0
    const classe = dados.classes.find(c => c.id === classeId)
    if (!classe) return 0
    return classe.progressao
      .filter(p => p.nivel <= nivel)
      .reduce((acc, p) => acc + p.destaques.filter(
        d => d === 'AVA' || d === 'Aumento no Valor de Atributo'
      ).length, 0)
  }, [classeId, nivel])

  const totalASIPool = numASIs * 2
  const [asiDistrib, setAsiDistrib] = useState<Partial<Record<AtributoId, number>>>({})
  const totalASIUsado = Object.values(asiDistrib).reduce((a, b) => a + b, 0)

  function setAsiBonus(attr: AtributoId, val: number) {
    setAsiDistrib(prev => {
      const next = { ...prev, [attr]: val }
      if (val === 0) delete next[attr]
      return next
    })
  }

  const atributosComASI: Record<AtributoId, number | null> = ATRIBUTOS.reduce((acc, a) => {
    const base = wizard.atributosAtuais[a]
    const asi = asiDistrib[a] ?? 0
    return { ...acc, [a]: base !== null ? Math.min(20, base + asi) : null }
  }, {} as Record<AtributoId, number | null>)

  const asiCompleto = numASIs === 0 || totalASIUsado === totalASIPool

  function handleNext() {
    if (!wizard.estaCompleto || !asiCompleto) return
    setAtributos(atributosComASI as Record<AtributoId, number>, wizard.metodo)
    setPasso(6)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cinzel text-2xl font-bold text-[#F5F0E8] mb-1">Atributos</h2>
        <p className="text-[#A8A09B] text-sm">Determine as capacidades físicas e mentais do personagem.</p>
      </div>

      <div className="flex gap-2 border-b border-[#B8860B]/20 pb-2 overflow-x-auto">
        {(Object.keys(LABEL_METODO) as MetodoAtributos[]).map(tab => (
          <button
            key={tab}
            onClick={() => wizard.trocarMetodo(tab)}
            className={`px-3 sm:px-4 py-2 rounded-t text-sm font-medium transition-colors cursor-pointer whitespace-nowrap
              ${wizard.metodo === tab ? 'bg-[#7B1D1D] text-white' : 'text-[#A8A09B] hover:text-[#F5F0E8] hover:bg-[#3D332D]'}`}
          >
            {LABEL_METODO[tab]}
          </button>
        ))}
      </div>

      {wizard.metodo === 'padrao' && (
        <PainelConjuntoPadrao
          wizard={wizard}
          sugeridos={sugeridos}
          nomePrimeiroSugerido={nomePrimeiroSugerido}
        />
      )}

      {wizard.metodo === 'aleatorio' && (
        <PainelAleatorio wizard={wizard} />
      )}

      {wizard.metodo === 'compra' && (
        <PainelCompra wizard={wizard} />
      )}

      {numASIs > 0 && wizard.estaCompleto && (
        <PainelASI
          numASIs={numASIs}
          totalPool={totalASIPool}
          totalUsado={totalASIUsado}
          atributosBase={wizard.atributosAtuais}
          asiDistrib={asiDistrib}
          onSetBonus={setAsiBonus}
        />
      )}

      <ResumoAtributos
        atributosAtuais={atributosComASI}
        nomePrimeiroSugerido={nomePrimeiroSugerido}
      />

      <WizardNav onBack={() => setPasso(4)} onNext={handleNext} nextDisabled={!wizard.estaCompleto || !asiCompleto} />
    </div>
  )
}

type WizardHook = ReturnType<typeof useAtributosWizard>

function PainelConjuntoPadrao({
  wizard,
  sugeridos,
  nomePrimeiroSugerido,
}: {
  wizard: WizardHook
  sugeridos: AtributoId[]
  nomePrimeiroSugerido: AtributoId | undefined
}) {
  const classeId = useFichaStore(s => s.ficha.identidade.classe_id)
  const classe = dados.classes.find(c => c.id === classeId)

  return (
    <div className="space-y-3">
      {classe && sugeridos.length > 0 && (
        <p className="text-xs text-[#A8A09B]">
          Sugestão para {classe.nome}:{' '}
          <span className="text-[#B8860B]">{sugeridos.join(' → ')}</span>
        </p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ATRIBUTOS.map(attr => (
          <div key={attr} className="flex flex-col gap-1">
            <label
              htmlFor={`padrao-${attr}`}
              className={`text-sm font-semibold ${nomePrimeiroSugerido === attr ? 'text-[#D4A017]' : 'text-[#B8860B]'}`}
            >
              {ATRIBUTO_NOMES[attr]}{nomePrimeiroSugerido === attr && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#D4A017" className="inline ml-1 mb-0.5"><path d="M12 2l2.2 5.6L20 8.2l-4.4 3.9L17 18l-5-3.2L7 18l1.4-5.9L4 8.2l5.8-.6z"/></svg>
          )}
            </label>
            <select
              id={`padrao-${attr}`}
              value={wizard.padrao[attr] ?? ''}
              onChange={e => wizard.setPadraoAttr(attr, e.target.value ? Number(e.target.value) : null)}
              className="bg-[#2D2520] border border-[#B8860B]/30 rounded px-2 py-1.5 text-[#F5F0E8] text-sm focus:outline-none focus:ring-1 focus:ring-[#B8860B]"
            >
              <option value="">—</option>
              {wizard.conjuntoPadrao.map(v => (
                <option
                  key={v}
                  value={v}
                  disabled={!wizard.isValorDisponivelNoPadrao(v, attr)}
                >
                  {v} {!wizard.isValorDisponivelNoPadrao(v, attr) ? '(usado)' : ''}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}

function PainelAleatorio({ wizard }: { wizard: WizardHook }) {
  return (
    <div className="space-y-4">
      <button
        onClick={wizard.rolarAleatorio}
        className="px-6 py-3 bg-[#7B1D1D] hover:bg-[#9B2C2C] border border-[#B8860B]/30 rounded-lg text-[#F5F0E8] font-cinzel font-semibold text-lg transition-colors cursor-pointer"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none"/><circle cx="16" cy="8" r="1.5" fill="currentColor" stroke="none"/><circle cx="8" cy="16" r="1.5" fill="currentColor" stroke="none"/><circle cx="16" cy="16" r="1.5" fill="currentColor" stroke="none"/></svg>
        Rolar (4d6 descarta menor)
      </button>

      {wizard.rolagemValores.length > 0 && (
        <div className="space-y-3">
          {/* Dados rolados — mostra quais já foram atribuídos */}
          <div className="flex flex-wrap gap-2">
            {wizard.rolagemValores.map((v, i) => {
              const assignedTo = ATRIBUTOS.find(a => wizard.aleatorioIndices[a] === i)
              return (
                <span
                  key={i}
                  className={`w-12 h-12 flex flex-col items-center justify-center rounded-lg font-cinzel font-bold text-xl border transition-colors
                    ${assignedTo
                      ? 'bg-[#B8860B]/20 border-[#B8860B] text-[#D4A017]'
                      : 'bg-[#3D332D] border-[#B8860B]/30 text-[#F5F0E8]'}`}
                >
                  {v}
                  {assignedTo && <span className="text-[8px] font-sans font-semibold leading-none">{assignedTo}</span>}
                </span>
              )
            })}
          </div>

          {/* Seleção por atributo */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {ATRIBUTOS.map(attr => {
              const idxAtual = wizard.aleatorioIndices[attr]
              return (
                <div key={attr} className="flex flex-col gap-1">
                  <label htmlFor={`aleatorio-${attr}`} className="text-sm font-semibold text-[#B8860B]">
                    {ATRIBUTO_NOMES[attr]}
                  </label>
                  <div className="flex gap-1">
                    <select
                      id={`aleatorio-${attr}`}
                      value={idxAtual ?? ''}
                      onChange={e => wizard.setAleatorioAttr(attr, e.target.value === '' ? null : Number(e.target.value))}
                      className={`flex-1 bg-[#2D2520] border rounded px-2 py-1.5 text-[#F5F0E8] text-sm focus:outline-none focus:ring-1 focus:ring-[#B8860B]
                        ${idxAtual !== null ? 'border-[#B8860B]' : 'border-[#B8860B]/30'}`}
                    >
                      <option value="">— escolher —</option>
                      {wizard.rolagemValores.map((v, j) => {
                        const emUso = !wizard.isDieAvailable(j, attr)
                        return (
                          <option key={j} value={j} disabled={emUso}>
                            {v}{emUso ? ' (em uso)' : ''}
                          </option>
                        )
                      })}
                    </select>
                    {idxAtual !== null && (
                      <button
                        type="button"
                        onClick={() => wizard.setAleatorioAttr(attr, null)}
                        title="Remover dado"
                        className="w-7 h-[34px] flex items-center justify-center rounded bg-[#2D2520] border border-[#B8860B]/30 text-[#A8A09B] hover:text-[#F5F0E8] hover:border-[#B8860B]/60 cursor-pointer text-sm"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Progresso */}
          <p className="text-xs text-right">
            <span className={ATRIBUTOS.every(a => wizard.aleatorioIndices[a] !== null) ? 'text-green-400' : 'text-[#A8A09B]'}>
              {ATRIBUTOS.filter(a => wizard.aleatorioIndices[a] !== null).length}/6 atributos atribuídos
            </span>
          </p>
        </div>
      )}
    </div>
  )
}

function PainelCompra({ wizard }: { wizard: WizardHook }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-[#A8A09B] text-sm">Pool restante:</span>
        <span
          className={`font-cinzel font-bold text-xl ${
            wizard.poolRestante === 0 ? 'text-green-400' : wizard.poolRestante < 0 ? 'text-red-400' : 'text-[#F5F0E8]'
          }`}
        >
          {wizard.poolRestante}
        </span>
        <span className="text-[#A8A09B] text-xs">/ 27</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ATRIBUTOS.map(attr => (
          <div key={attr} className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-[#B8860B]">{ATRIBUTO_NOMES[attr]}</label>
              <span className="text-xs text-[#A8A09B]">c:{CUSTO_PONTOS_COMPRA[wizard.compra[attr]] ?? 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => wizard.setCompraAttr(attr, wizard.compra[attr] - 1)}
                disabled={wizard.compra[attr] <= 8}
                className="w-7 h-7 rounded bg-[#3D332D] border border-[#B8860B]/20 text-[#F5F0E8] font-bold hover:bg-[#4D4037] disabled:opacity-30 cursor-pointer disabled:cursor-default"
              >
                −
              </button>
              <span className="flex-1 text-center font-cinzel font-bold text-lg text-[#F5F0E8]">
                {wizard.compra[attr]}
              </span>
              <button
                onClick={() => wizard.setCompraAttr(attr, wizard.compra[attr] + 1)}
                disabled={wizard.compra[attr] >= 15 || wizard.poolRestante <= 0}
                className="w-7 h-7 rounded bg-[#3D332D] border border-[#B8860B]/20 text-[#F5F0E8] font-bold hover:bg-[#4D4037] disabled:opacity-30 cursor-pointer disabled:cursor-default"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface PainelASIProps {
  numASIs: number
  totalPool: number
  totalUsado: number
  atributosBase: Record<AtributoId, number | null>
  asiDistrib: Partial<Record<AtributoId, number>>
  onSetBonus: (attr: AtributoId, val: number) => void
}

function PainelASI({ numASIs, totalPool, totalUsado, atributosBase, asiDistrib, onSetBonus }: PainelASIProps) {
  return (
    <div className="bg-[#3D332D] border border-[#B8860B]/30 rounded-lg p-4 space-y-4">
      <div>
        <h3 className="font-cinzel font-semibold text-[#B8860B]">
          Melhoria de Atributo{numASIs > 1 ? ` (×${numASIs})` : ''}
        </h3>
        <p className="text-xs text-[#A8A09B] mt-1">
          Seu nível inicial concede {numASIs} AVA{numASIs > 1 ? 's' : ''} — distribua +{totalPool} pontos entre os atributos (máx. 20 por atributo).
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ATRIBUTOS.map(attr => {
          const base = atributosBase[attr] ?? 0
          const bonus = asiDistrib[attr] ?? 0
          const final = Math.min(20, base + bonus)
          const noTeto = base >= 20
          const podeIncrementar = !noTeto && final < 20 && totalUsado < totalPool
          const podeDecrementar = bonus > 0

          return (
            <div key={attr} className="flex flex-col items-center gap-1 p-2 rounded border border-[#2D2520]">
              <span className="text-xs font-bold text-[#B8860B]">{attr}</span>
              <span className="text-[10px] text-[#A8A09B]">
                {base}
                {bonus > 0 && <span className="text-green-400"> +{bonus} = {final}</span>}
                {noTeto && <span className="text-[#B8860B]"> (máx.)</span>}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onSetBonus(attr, Math.max(0, bonus - 1))}
                  disabled={!podeDecrementar}
                  className="w-6 h-6 rounded bg-[#2D2520] border border-[#B8860B]/20 text-[#F5F0E8] text-xs hover:bg-[#4D4037] disabled:opacity-30 cursor-pointer disabled:cursor-default"
                >
                  −
                </button>
                <span className={`w-8 text-center font-bold text-lg ${bonus > 0 ? 'text-green-400' : 'text-[#A8A09B]'}`}>
                  {bonus > 0 ? `+${bonus}` : '0'}
                </span>
                <button
                  onClick={() => onSetBonus(attr, bonus + 1)}
                  disabled={!podeIncrementar}
                  className="w-6 h-6 rounded bg-[#2D2520] border border-[#B8860B]/20 text-[#F5F0E8] text-xs hover:bg-[#4D4037] disabled:opacity-30 cursor-pointer disabled:cursor-default"
                >
                  +
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-xs text-right">
        <span className={totalUsado === totalPool ? 'text-green-400' : 'text-[#A8A09B]'}>
          {totalUsado}/{totalPool} pontos de melhoria distribuídos
        </span>
      </p>
    </div>
  )
}

function ResumoAtributos({
  atributosAtuais,
  nomePrimeiroSugerido,
}: {
  atributosAtuais: Record<AtributoId, number | null>
  nomePrimeiroSugerido: AtributoId | undefined
}) {
  return (
    <div className="bg-[#3D332D] border border-[#B8860B]/30 rounded-lg p-4">
      <h3 className="font-cinzel font-semibold text-[#B8860B] mb-3">Resumo dos Atributos</h3>
      <div className="grid grid-cols-3 gap-2">
        {ATRIBUTOS.map(attr => {
          const val = atributosAtuais[attr]
          const mod = val !== null ? calcModificador(val) : null
          const isPrimario = nomePrimeiroSugerido === attr

          return (
            <div
              key={attr}
              className={`flex flex-col items-center p-2 rounded border ${
                isPrimario ? 'border-[#D4A017]/50 bg-[#B8860B]/10' : 'border-[#2D2520]'
              }`}
              aria-live="polite"
            >
              <span className="text-xs text-[#A8A09B]">{attr}</span>
              <span className="font-cinzel font-bold text-2xl text-[#F5F0E8]">{val ?? '—'}</span>
              <span
                className={`text-sm font-semibold ${
                  !mod ? 'text-[#A8A09B]' : mod > 0 ? 'text-green-400' : mod < 0 ? 'text-red-400' : 'text-[#A8A09B]'
                }`}
              >
                {mod !== null ? formatModificador(mod) : ''}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
