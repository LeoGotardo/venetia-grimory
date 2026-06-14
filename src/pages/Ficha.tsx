import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useFichaStore } from '../store/fichaStore'
import { useFichaExport } from '../hooks/useFichaExport'
import { PainelCombate } from '../components/ficha/PainelCombate'
import { PainelAtributos } from '../components/ficha/PainelAtributos'
import { PainelPericias } from '../components/ficha/PainelPericias'
import { PainelRecursos } from '../components/ficha/PainelRecursos'
import { PainelMagia } from '../components/ficha/PainelMagia'
import { PainelInventario } from '../components/ficha/PainelInventario'
import { PainelAnotacoes } from '../components/ficha/PainelAnotacoes'
import { PainelEditar } from '../components/ficha/PainelEditar'
import { ConfigModal } from '../components/ui/ConfigModal'
import { LevelUpModal } from '../components/ficha/LevelUpModal'
import dadosJson from '../data/dnd_dados.json'
import type { DadosJogo } from '../types'
import { XP_POR_NIVEL, formatModificador } from '../lib/calculos'
import { CharacterAvatar } from '../components/ui/CharacterAvatar'

const dados = dadosJson as unknown as DadosJogo

type Aba = 'ficha' | 'magia' | 'inventario' | 'anotacoes' | 'editar'

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-[11px] mb-4">
      <span className="w-1 h-[19px] rounded-sm flex-shrink-0 bg-gradient-to-b from-[#E8C25A] to-[#B8860B]" />
      <h3 className="font-extrabold text-[17px] text-[#EAD9B0]">{children}</h3>
    </div>
  )
}

export function Ficha() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { ficha, fichaId, carregarFicha, setIdentidade, addXP, atualizarPV } = useFichaStore()
  const { exportar } = useFichaExport()
  const [aba, setAba] = useState<Aba>('ficha')
  const [configAberta, setConfigAberta] = useState(false)
  const [levelUpAberto, setLevelUpAberto] = useState(false)
  const [xpInput, setXpInput] = useState('')
  const [pvDelta, setPvDelta] = useState('')

  useEffect(() => {
    if (id && id !== fichaId) carregarFicha(id)
  }, [id, fichaId, carregarFicha])

  const identity = ficha.identidade
  const classe = dados.classes.find(c => c.id === identity.classe_id)
  const especie = dados.especies?.find(e => e.id === identity.especie_id)
  const ante = dados.antecedentes?.find(a => a.id === identity.antecedente_id)
  const subclasse = classe?.subclasses.find(s => s.id === identity.subclasse_id)

  const xpAtual = identity.xp
  const xpProximo = XP_POR_NIVEL[identity.nivel + 1]
  const xpPct = xpProximo ? Math.min(100, (xpAtual / xpProximo) * 100) : 100
  const podeSubirNivel = xpProximo !== undefined && xpAtual >= xpProximo && identity.nivel < 20

  const combate = ficha.combate
  const pvAtual = combate.pontos_de_vida.atual
  const pvMax = combate.pontos_de_vida.maximo ?? 0
  const pvPct = pvMax > 0 ? Math.min(100, (pvAtual / pvMax) * 100) : 0
  const pvEstado = pvPct > 66 ? 'Saudável' : pvPct > 33 ? 'Ferido' : pvPct > 0 ? 'Crítico' : 'Inconsciente'
  const pvBarColor = pvPct > 50 ? '#5a9e52' : pvPct > 25 ? '#c9a32b' : '#d4564a'

  const visaoEscuro = especie?.tracos?.find(t => t.nome?.toLowerCase().includes('escuro'))
    ? '18 m'
    : '—'

  const percepcaoPassiva = 10 + (ficha.pericias.percepcao._valor ?? 0)

  const abas = useMemo<Array<{ id: Aba; label: string }>>(
    () => [
      { id: 'ficha', label: 'Visão Geral' },
      ...(ficha.magia.conjurador ? [{ id: 'magia' as Aba, label: 'Magia' }] : []),
      { id: 'inventario', label: 'Inventário' },
      { id: 'anotacoes', label: 'Anotações' },
      { id: 'editar', label: '✎ Editar' },
    ],
    [ficha.magia.conjurador],
  )

  function handleGanharXP() {
    const v = parseInt(xpInput)
    if (!isNaN(v) && v > 0) { addXP(v); setXpInput('') }
  }

  function handleAjustarPV(delta: number) {
    atualizarPV(delta)
    setPvDelta('')
  }


  const classeNivel = classe ? `${classe.nome} ${identity.nivel}` : `Nível ${identity.nivel}`
  const especieNome = especie?.nome ?? null
  const anteNome = ante?.nome ?? null

  return (
    <div className="min-h-screen bg-[#131110]">
      {/* Topbar */}
      <header className="no-print sticky top-0 z-40 flex items-center justify-between h-[60px] px-4 sm:px-7 bg-[#161311] border-b border-white/[0.06]">
        <div className="flex items-center gap-[10px] sm:gap-[18px]">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-[#A8A09B] hover:text-[#E8DFD0] text-sm font-medium bg-transparent border-0 cursor-pointer transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            Fichas
          </button>
          <div className="hidden sm:block w-px h-[22px] bg-white/10" />
          <div className="hidden sm:flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#B8860B"><path d="M12 2l2.2 5.6L20 8.2l-4.4 3.9L17 18l-5-3.2L7 18l1.4-5.9L4 8.2l5.8-.6z"/></svg>
            <span className="font-extrabold tracking-[0.04em] text-sm text-[#E8DFD0]">Venetia</span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-[14px]">
          {/* XP input + button */}
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={1}
              value={xpInput}
              onChange={e => setXpInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGanharXP()}
              placeholder="XP"
              aria-label="XP a ganhar"
              className="w-14 sm:w-16 bg-white/5 border border-white/10 rounded-[7px] px-2 py-1.5 text-[#F5F0E8] text-xs placeholder:text-[#6B6560] focus:outline-none focus:border-[rgba(212,160,23,0.5)]"
            />
            <button
              onClick={handleGanharXP}
              disabled={!xpInput || parseInt(xpInput) <= 0}
              className="text-[13px] font-bold text-[#131110] bg-[#D4A017] hover:bg-[#E8C25A] border-0 rounded-[9px] px-[10px] sm:px-[14px] py-[9px] cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-default"
            >
              + XP
            </button>
          </div>
          <button
            onClick={() => setConfigAberta(true)}
            aria-label="Configurações"
            className="w-[34px] h-[34px] rounded-[9px] bg-white/5 border border-white/[0.09] text-[#A8A09B] hover:text-[#E8DFD0] flex items-center justify-center cursor-pointer transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </button>
          <button
            onClick={() => exportar(identity.nome_personagem)}
            className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#A8A09B] hover:text-[#E8DFD0] bg-white/[0.04] border border-white/[0.08] rounded-[9px] px-3 py-2 cursor-pointer transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 15v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4"/><path d="M7 9l5-5 5 5"/><path d="M12 4v12"/></svg>
            Exportar
          </button>
          <span className="hidden sm:inline-flex items-center gap-[7px] text-[#7c9b6e] text-[13px] font-medium">
            <span className="w-[7px] h-[7px] rounded-full bg-[#7c9b6e]" />
            Salvo
          </span>
        </div>
      </header>

      <ConfigModal open={configAberta} onClose={() => setConfigAberta(false)} />
      <LevelUpModal open={levelUpAberto} onClose={() => setLevelUpAberto(false)} novoNivel={identity.nivel + 1} />

      {/* Main content */}
      <div className="max-w-[1180px] mx-auto px-4 sm:px-8 py-6 sm:py-8 pb-14">

        {/* Character header */}
        <div className="flex items-start justify-between gap-5 mb-7 flex-wrap">
          {/* Name + badges */}
          <div className="flex items-center gap-[14px]">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex-shrink-0 bg-[#221d18] border border-[rgba(212,160,23,0.35)] overflow-hidden">
              <CharacterAvatar nome={identity.nome_personagem} id={fichaId ?? id} size={64} />
            </div>
            <div className="min-w-0">
              <h2 className="font-extrabold text-[20px] sm:text-[26px] leading-tight tracking-tight text-[#F5F0E8] mb-2 truncate max-w-[200px] sm:max-w-none">
                {identity.nome_personagem || 'Personagem Sem Nome'}
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[13px] font-bold text-[#131110] bg-[#D4A017] px-[10px] py-[3px] rounded-[7px]">
                  {classeNivel}
                  {subclasse ? ` — ${subclasse.nome}` : ''}
                </span>
                {especieNome && (
                  <span className="text-[13px] font-medium text-[#A8A09B] bg-white/5 border border-white/[0.08] px-[10px] py-[3px] rounded-[7px]">
                    {especieNome}
                  </span>
                )}
                {anteNome && (
                  <span className="text-[13px] font-medium text-[#A8A09B] bg-white/5 border border-white/[0.08] px-[10px] py-[3px] rounded-[7px]">
                    {anteNome}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* XP bar */}
          <div className="w-full sm:min-w-[300px] flex-1 sm:max-w-[360px]">
            <div className="flex items-center justify-between mb-[10px]">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-semibold tracking-[0.1em] uppercase text-[#6B6560]">Nível</span>
                <span className="font-extrabold text-[22px] text-[#D4A017] leading-none">{identity.nivel}</span>
              </div>
              <span className="text-[13px] font-semibold text-[#A8A09B] whitespace-nowrap">
                {xpAtual.toLocaleString('pt-BR')} / {xpProximo !== undefined ? xpProximo.toLocaleString('pt-BR') : '—'} XP
              </span>
            </div>
            {/* XP bar with shimmer */}
            <div className="h-2 rounded-[5px] bg-[#221d18] overflow-hidden relative">
              <div
                className="h-full rounded-[5px] transition-all duration-700"
                style={{ width: `${xpPct}%`, background: 'linear-gradient(90deg, #B8860B, #D4A017)' }}
              />
              <div
                className="absolute inset-0 rounded-[5px] pointer-events-none"
                style={{
                  width: `${xpPct}%`,
                  backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                  backgroundSize: '200% 100%',
                  animation: 'vg-shimmer 2.6s linear infinite',
                }}
              />
            </div>
            <div className="mt-2 flex items-center justify-end gap-[10px] min-h-[22px]">
              {podeSubirNivel ? (
                <button
                  onClick={() => setLevelUpAberto(true)}
                  className="text-xs font-bold text-[#131110] border-0 rounded-[7px] px-3 py-[5px] cursor-pointer"
                  style={{ background: 'linear-gradient(180deg,#E8C25A,#D4A017)' }}
                >
                  ⬆ Subir de Nível
                </button>
              ) : (
                <span className="text-xs text-[#6B6560]">
                  {xpProximo !== undefined ? `${(xpProximo - xpAtual).toLocaleString('pt-BR')} XP para o próximo nível` : 'Nível máximo'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* KPI row: HP + CA + Iniciativa + Deslocamento */}
        <div className="grid grid-cols-2 md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-4 mb-[14px]">
          {/* HP card */}
          <div
            className="rounded-2xl p-3 sm:p-[18px_20px]"
            style={{
              background: 'rgba(181,57,47,0.08)',
              border: '1px solid rgba(181,57,47,0.42)',
              boxShadow: 'inset 0 0 0 5px #1c1512, inset 0 0 0 6px rgba(212,160,23,0.18)',
            }}
          >
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.08em] uppercase text-[#e0a3a3] mb-2">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#d4564a"><path d="M12 21s-7-4.35-9.5-8.5C.5 9 2 5 5.5 5 7.5 5 9 6.2 12 9c3-2.8 4.5-4 6.5-4C22 5 23.5 9 21.5 12.5 19 16.65 12 21 12 21z"/></svg>
              Vida
            </span>
            <div className="flex items-baseline gap-[5px] whitespace-nowrap mb-2">
              <span className="font-extrabold text-[34px] sm:text-[42px] leading-none text-[#F5F0E8] tracking-tight">{pvAtual}</span>
              <span className="text-[16px] sm:text-[19px] font-semibold text-[#c98c8c]">/ {pvMax}</span>
            </div>
            {/* Quick HP adjust — linha própria, sem concorrer com o label */}
            <div className="flex items-center gap-1 mb-2">
              <input
                type="number"
                value={pvDelta}
                onChange={e => setPvDelta(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') { const n = parseInt(pvDelta); if (!isNaN(n)) handleAjustarPV(n) }
                }}
                placeholder="±"
                aria-label="Delta de PV"
                className="w-14 text-center bg-black/20 border border-[rgba(181,57,47,0.4)] rounded-[6px] px-1 py-1 text-[#F5F0E8] text-xs focus:outline-none"
              />
              <button
                onClick={() => { const n = parseInt(pvDelta); if (!isNaN(n)) handleAjustarPV(-Math.abs(n)) }}
                aria-label="Aplicar dano"
                className="w-7 h-7 rounded-[6px] bg-[rgba(181,57,47,0.18)] border border-[rgba(181,57,47,0.5)] text-[#e0a3a3] text-base font-bold cursor-pointer flex items-center justify-center hover:bg-[rgba(181,57,47,0.3)] transition-colors"
              >−</button>
              <button
                onClick={() => { const n = parseInt(pvDelta); if (!isNaN(n)) handleAjustarPV(Math.abs(n)) }}
                aria-label="Aplicar cura"
                className="w-7 h-7 rounded-[6px] bg-[rgba(124,155,110,0.18)] border border-[rgba(124,155,110,0.5)] text-[#9cc090] text-base font-bold cursor-pointer flex items-center justify-center hover:bg-[rgba(124,155,110,0.3)] transition-colors"
              >+</button>
            </div>
            <div className="h-[7px] rounded bg-black/35 mt-[14px] overflow-hidden">
              <div
                className="h-full rounded transition-all duration-350"
                style={{ width: `${pvPct}%`, background: pvBarColor }}
              />
            </div>
            <div className="flex justify-between mt-[11px] text-xs text-[#c98c8c] font-medium">
              <span>Dado de Vida {combate.dados_de_vida.tipo ?? '—'}</span>
              <span>{pvEstado}</span>
            </div>
          </div>

          {/* CA */}
          <div className="vg-card p-3 sm:p-[18px_20px] flex flex-col justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.08em] uppercase text-[#8a8278]">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#B8860B" strokeWidth="1.5"><path d="M12 2l7 3v6c0 4.5-3 8.5-7 9.5C8 19.5 5 15.5 5 11V5z"/></svg>
              CA
            </span>
            <div className="font-extrabold text-[30px] sm:text-[38px] leading-none tracking-tight text-[#F5F0E8] mt-2 sm:mt-4">
              {combate.classe_de_armadura.valor ?? '—'}
            </div>
          </div>

          {/* Iniciativa */}
          <div className="vg-card p-3 sm:p-[18px_20px] flex flex-col justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.08em] uppercase text-[#8a8278]">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#B8860B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h7l-1 8 10-12h-7z"/></svg>
              Inic.
            </span>
            <div className="font-extrabold text-[30px] sm:text-[38px] leading-none tracking-tight text-[#F5F0E8] mt-2 sm:mt-4">
              {combate.iniciativa._valor !== null ? formatModificador(combate.iniciativa._valor) : '—'}
            </div>
          </div>

          {/* Deslocamento */}
          <div className="vg-card p-3 sm:p-[18px_20px] flex flex-col justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.08em] uppercase text-[#8a8278]">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#B8860B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 4v7l5 3M4 7l3 2-2 4 4 1 1 5"/></svg>
              Deslocam.
            </span>
            <div className="font-extrabold text-[30px] sm:text-[38px] leading-none tracking-tight text-[#F5F0E8] mt-2 sm:mt-4">
              {combate.deslocamento._total_metros !== null ? (
                <>{combate.deslocamento._total_metros}<span className="text-[14px] sm:text-[17px] text-[#6B6560] font-semibold"> m</span></>
              ) : '—'}
            </div>
          </div>
        </div>

        {/* Secondary stats row */}
        <div className="flex flex-wrap gap-[10px] mb-[30px]">
          {[
            { label: 'Proficiência', value: combate._bonus_proficiencia !== null ? `+${combate._bonus_proficiencia}` : '—', gold: true },
            { label: 'Percepção passiva', value: String(percepcaoPassiva) },
            { label: 'Visão no escuro', value: visaoEscuro },
          ].map(({ label, value, gold }) => (
            <div key={label} className="flex-1 min-w-[100px] flex flex-col sm:flex-row items-center justify-center gap-[4px] sm:gap-[9px] py-3 rounded-[12px] bg-[#1A1714] border border-[rgba(212,160,23,0.18)]">
              <span className="text-[11px] sm:text-[13px] text-[#8a8278] font-medium text-center">{label}</span>
              <span className={`font-extrabold text-[16px] ${gold ? 'text-[#D4A017]' : 'text-[#F5F0E8]'}`}>{value}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-[rgba(212,160,23,0.22)] mb-7 overflow-x-auto no-print" role="tablist" aria-label="Abas da ficha">
          {abas.map(a => (
            <button
              key={a.id}
              role="tab"
              onClick={() => setAba(a.id)}
              aria-selected={aba === a.id}
              aria-controls={`tabpanel-${a.id}`}
              className={[
                'text-sm pb-[13px] border-b-2 mr-[22px] cursor-pointer whitespace-nowrap transition-colors focus-visible:outline-none',
                aba === a.id
                  ? 'font-bold text-[#F5F0E8] border-[#D4A017]'
                  : 'font-medium text-[#8a8278] border-transparent hover:text-[#A8A09B]',
              ].join(' ')}
            >
              {a.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div role="tabpanel" id={`tabpanel-${aba}`}>
          {aba === 'ficha' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
              <div className="space-y-7">
                <div className="vg-card p-5">
                  <SectionTitle>Combate</SectionTitle>
                  <PainelCombate />
                </div>
              </div>
              <div className="space-y-7">
                <div className="vg-card p-5">
                  <SectionTitle>Atributos</SectionTitle>
                  <PainelAtributos />
                </div>
                <div className="vg-card p-5">
                  <SectionTitle>Perícias</SectionTitle>
                  <PainelPericias />
                </div>
                <PainelRecursos />
              </div>
            </div>
          )}

          {aba === 'magia' && (
            <div className="max-w-2xl">
              <div className="vg-card p-5">
                <SectionTitle>Magia</SectionTitle>
                <PainelMagia />
              </div>
            </div>
          )}

          {aba === 'inventario' && (
            <div className="max-w-2xl">
              <div className="vg-card p-5">
                <SectionTitle>Inventário</SectionTitle>
                <PainelInventario />
              </div>
            </div>
          )}

          {aba === 'anotacoes' && (
            <div className="max-w-2xl">
              <div className="vg-card p-5">
                <SectionTitle>Anotações</SectionTitle>
                <PainelAnotacoes />
              </div>
            </div>
          )}

          {aba === 'editar' && <PainelEditar />}
        </div>
      </div>
    </div>
  )
}
