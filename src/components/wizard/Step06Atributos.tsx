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
  const { ficha, setAtributos, setPasso } = useFichaStore()
  const wizard = useAtributosWizard()

  const classeId = ficha.identidade.classe_id
  const sugeridos = dados.atributos_sugeridos_por_classe?.[classeId ?? ''] ?? []
  const nomePrimeiroSugerido = sugeridos[0]

  function handleNext() {
    if (!wizard.estaCompleto) return
    setAtributos(wizard.atributosAtuais as Record<AtributoId, number>, wizard.metodo)
    setPasso(7)
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

      <ResumoAtributos
        atributosAtuais={wizard.atributosAtuais}
        nomePrimeiroSugerido={nomePrimeiroSugerido}
      />

      <WizardNav onBack={() => setPasso(5)} onNext={handleNext} nextDisabled={!wizard.estaCompleto} />
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
              {ATRIBUTO_NOMES[attr]} {nomePrimeiroSugerido === attr && '⭐'}
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
        🎲 Rolar (4d6 descarta menor)
      </button>

      {wizard.rolagemValores.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {wizard.rolagemValores.map((v, i) => (
              <span
                key={i}
                className="w-12 h-12 flex items-center justify-center bg-[#3D332D] border border-[#B8860B]/30 rounded-lg font-cinzel font-bold text-xl text-[#F5F0E8]"
              >
                {v}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {ATRIBUTOS.map(attr => (
              <div key={attr} className="flex flex-col gap-1">
                <label htmlFor={`aleatorio-${attr}`} className="text-sm font-semibold text-[#B8860B]">
                  {ATRIBUTO_NOMES[attr]}
                </label>
                <select
                  id={`aleatorio-${attr}`}
                  value={wizard.aleatorio[attr] ?? ''}
                  onChange={e => wizard.setAleatorioAttr(attr, Number(e.target.value))}
                  className="bg-[#2D2520] border border-[#B8860B]/30 rounded px-2 py-1.5 text-[#F5F0E8] text-sm focus:outline-none focus:ring-1 focus:ring-[#B8860B]"
                >
                  {wizard.rolagemValores.map((v, j) => (
                    <option key={j} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
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
