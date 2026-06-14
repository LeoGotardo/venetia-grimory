import { useState } from 'react'
import { useFichaStore } from '../../store/fichaStore'
import { formatModificador } from '../../lib/calculos'
import { DadoBadge } from '../ui/Badge'
import Button from '../ui/Button'

const INPUT_BASE = 'bg-[#2D2520] border border-[#B8860B]/30 rounded px-2 py-1 text-[#F5F0E8] text-sm text-center focus:outline-none focus:ring-1 focus:ring-[#B8860B] focus:border-[#B8860B]'

export function PainelCombate() {
  const { ficha, atualizarPV, atualizarPVTemp, gastarDadoVida, descansoCurto, descansoLongo, toggleEscudo } = useFichaStore()
  const { pontos_de_vida: pv, dados_de_vida: dv, classe_de_armadura: ca, iniciativa, deslocamento, _bonus_proficiencia } = ficha.combate
  const temEscudoNoInventario = ficha.inventario.itens.some(i => i.categoria === 'Escudo')
  const [pvDelta, setPvDelta] = useState('')
  const percepcaoPassiva = 10 + (ficha.pericias.percepcao._valor ?? 0)

  const pvMax = pv.maximo ?? 0
  const pvAtual = pv.atual
  const pvPct = pvMax > 0 ? (pvAtual / pvMax) * 100 : 0

  type Stat = { label: string; value: string | number; sub?: string; hero?: boolean }
  const stats: Stat[] = [
    { label: 'PV', value: `${pvAtual}/${pvMax}`, sub: pv.temporario > 0 ? `+${pv.temporario} temp` : undefined, hero: true },
    { label: 'CA', value: ca.valor ?? '—', sub: ca.escudo_equipado ? '+2 escudo' : undefined },
    { label: 'Iniciativa', value: iniciativa._valor !== null ? formatModificador(iniciativa._valor) : '—' },
    { label: 'Deslocamento', value: deslocamento._total_metros !== null ? `${deslocamento._total_metros}m` : '—' },
    { label: 'Prof.', value: _bonus_proficiencia !== null ? `+${_bonus_proficiencia}` : '—' },
    { label: 'Percepção Passiva', value: percepcaoPassiva },
  ]

  function handleAjustarPV() {
    const delta = parseInt(pvDelta)
    if (!isNaN(delta)) { atualizarPV(delta); setPvDelta('') }
  }

  return (
    <div className="space-y-4">
      {/* Stat grid — PV hero (text-3xl), demais text-2xl */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {stats.map(({ label, value, sub, hero }) => (
          <div
            key={label}
            className={`bg-[#2D2520] border rounded-lg p-3 flex flex-col items-center
              ${(hero as boolean | undefined) ? 'border-[#B8860B]/50' : 'border-[#B8860B]/20'}`}
          >
            <span className="text-[#A8A09B] text-xs mb-0.5">{label}</span>
            <span className={`font-cinzel font-bold text-[#F5F0E8] leading-none ${(hero as boolean | undefined) ? 'text-3xl' : 'text-2xl'}`}>
              {value}
            </span>
            {sub && <span className="text-xs text-[#B8860B] mt-0.5">{sub}</span>}
          </div>
        ))}
      </div>

      {/* PV bar */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-[#A8A09B]">Pontos de Vida</span>
          <span className="text-xs text-[#A8A09B]">{pvAtual}/{pvMax}</span>
        </div>
        <div
          className="h-3 bg-[#2D2520] rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={pvAtual}
          aria-valuemin={0}
          aria-valuemax={pvMax}
          aria-label="Pontos de vida"
        >
          <div
            className={`h-full rounded-full transition-all duration-500 ${pvPct > 50 ? 'bg-green-600' : pvPct > 20 ? 'bg-yellow-500' : 'bg-red-600'}`}
            style={{ width: `${pvPct}%` }}
          />
        </div>
      </div>

      {/* PV adjustment */}
      <div className="flex gap-2 items-center flex-wrap">
        <label htmlFor="pv-delta" className="text-xs text-[#A8A09B] flex-shrink-0">Ajuste PV</label>
        <input
          id="pv-delta"
          type="number"
          value={pvDelta}
          onChange={e => setPvDelta(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAjustarPV()}
          placeholder="±"
          className={`w-16 ${INPUT_BASE}`}
          aria-label="Quantidade de PV (positivo = cura, negativo = dano)"
        />
        <Button size="sm" variant="secondary" onClick={handleAjustarPV} disabled={!pvDelta}>
          Aplicar
        </Button>
        <Button size="sm" variant="ghost" onClick={() => atualizarPV(pvMax - pvAtual)}>
          Restaurar
        </Button>
      </div>

      {/* PV temporário */}
      <div className="flex items-center gap-2">
        <label htmlFor="pv-temp" className="text-xs text-[#A8A09B] flex-shrink-0">PV Temporário</label>
        <input
          id="pv-temp"
          type="number"
          value={pv.temporario}
          onChange={e => atualizarPVTemp(parseInt(e.target.value) || 0)}
          className={`w-16 ${INPUT_BASE}`}
          min={0}
          aria-label="Pontos de vida temporários"
        />
      </div>

      {/* Dados de vida */}
      {dv.tipo && (
        <div className="bg-[#2D2520] border border-[#B8860B]/20 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#A8A09B]">Dados de Vida</span>
              <DadoBadge tipo={dv.tipo ?? 'd8'} />
            </div>
            <span className="text-sm text-[#F5F0E8]">
              {(dv.total ?? 0) - dv.gastos}/{dv.total} disponíveis
            </span>
          </div>
          <div className="flex gap-1 flex-wrap mb-2" role="group" aria-label="Dados de vida">
            {Array.from({ length: dv.total ?? 0 }, (_, i) => {
              const disponivel = i < (dv.total ?? 0) - dv.gastos
              return (
                <span
                  key={i}
                  className={`w-5 h-5 rounded-full border ${disponivel ? 'bg-[#B8860B] border-[#B8860B]' : 'border-[#A8A09B]/40'}`}
                  aria-hidden="true"
                />
              )
            })}
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="secondary" onClick={gastarDadoVida} disabled={(dv.total ?? 0) - dv.gastos <= 0}>
              Gastar dado
            </Button>
            <Button size="sm" variant="ghost" onClick={descansoCurto}>Desc. Curto</Button>
            <Button size="sm" variant="ghost" onClick={descansoLongo}>Desc. Longo</Button>
          </div>
        </div>
      )}

      {/* Escudo toggle */}
      <button
        onClick={toggleEscudo}
        disabled={!ca.escudo_equipado && !temEscudoNoInventario}
        aria-pressed={ca.escudo_equipado}
        title={!temEscudoNoInventario && !ca.escudo_equipado ? 'Adicione um escudo ao inventário primeiro' : undefined}
        className={`px-3 py-1.5 rounded border text-sm font-medium transition-colors
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]
          ${ca.escudo_equipado
            ? 'bg-[#7B1D1D] border-[#7B1D1D] text-white cursor-pointer'
            : !temEscudoNoInventario
            ? 'border-[#B8860B]/10 text-[#A8A09B]/40 cursor-not-allowed'
            : 'border-[#B8860B]/30 text-[#A8A09B] hover:bg-[#3D332D] hover:text-[#F5F0E8] cursor-pointer'}`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill={ca.escudo_equipado ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        {ca.escudo_equipado ? 'Escudo equipado' : temEscudoNoInventario ? 'Equipar escudo' : 'Sem escudo no inventário'}
      </button>
    </div>
  )
}
