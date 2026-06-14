import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFichaStore } from '../store/fichaStore'
import { useFichaExport } from '../hooks/useFichaExport'
import type { FichaListItem } from '../store/fichaStore'
import dadosJson from '../data/dnd_dados.json'
import type { DadosJogo } from '../types'
import { ConfigModal } from '../components/ui/ConfigModal'
import { CharacterAvatar } from '../components/ui/CharacterAvatar'
import { useState } from 'react'

const dados = dadosJson as unknown as DadosJogo

export function Home() {
  const navigate = useNavigate()
  const { fichasSalvas, novaFicha, carregarFicha, deletarFicha, carregarListaSalvas } = useFichaStore()
  const { exportarPorId, importar } = useFichaExport()
  const [configAberta, setConfigAberta] = useState(false)

  useEffect(() => { carregarListaSalvas() }, [carregarListaSalvas])

  const fichasOrdenadas = useMemo(
    () => [...fichasSalvas].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [fichasSalvas],
  )

  function handleNova() { novaFicha(); navigate('/novo') }
  function handleCarregar(id: string) { carregarFicha(id); navigate(`/ficha/${id}`) }
  function handleDeletar(f: FichaListItem) {
    if (!confirm(`Deletar "${f.nome}"? Esta ação não pode ser desfeita.`)) return
    deletarFicha(f.id)
  }

  return (
    <div className="min-h-screen bg-[#131110] font-[Manrope,system-ui]">
      {/* Sticky navbar */}
      <header className="sticky top-0 z-10 flex items-center justify-between h-[60px] px-7 bg-[#161311] border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <StarIcon />
          <span className="font-extrabold tracking-[0.04em] text-sm text-[#E8DFD0]">Venetia</span>
        </div>
        <button
          onClick={() => setConfigAberta(true)}
          aria-label="Configurações"
          className="w-[34px] h-[34px] rounded-[9px] bg-white/5 border border-white/[0.09] text-[#A8A09B] hover:text-[#E8DFD0] flex items-center justify-center cursor-pointer transition-colors"
        >
          <GearIcon />
        </button>
      </header>

      <ConfigModal open={configAberta} onClose={() => setConfigAberta(false)} />

      {/* Main content */}
      <div className="max-w-[920px] mx-auto px-4 sm:px-8 py-10 sm:py-16 pb-20">
        {/* Hero */}
        <div className="text-center mb-10">
          <SwordsIcon />
          <h1 className="font-extrabold text-[28px] sm:text-[40px] tracking-tight leading-tight mt-5 mb-2 text-[#F5F0E8]">
            Grimório de Venetia
          </h1>
          <p className="text-[16px] font-semibold text-[#D4A017]">Criador de Personagens D&amp;D 5.5 (2024)</p>
          <p className="text-[13px] text-[#6B6560] mt-1.5">
            {dados.meta.fonte} · {dados.meta.traducao}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 justify-center mb-[52px]">
          <button
            onClick={handleNova}
            className="inline-flex items-center gap-[9px] text-[15px] font-bold text-[#131110] bg-[#D4A017] hover:bg-[#E8C25A] border-0 rounded-[11px] px-6 py-[14px] cursor-pointer transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            Criar Personagem
          </button>
          <button
            onClick={importar}
            className="inline-flex items-center gap-[9px] text-[15px] font-semibold text-[#E8DFD0] bg-white/5 hover:bg-white/10 border border-[rgba(212,160,23,0.25)] hover:border-[rgba(212,160,23,0.5)] rounded-[11px] px-6 py-[14px] cursor-pointer transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
            Importar JSON
          </button>
        </div>

        {/* Section header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-[11px]">
            <span className="w-1 h-[19px] rounded-sm bg-gradient-to-b from-[#E8C25A] to-[#B8860B]" />
            <h2 className="font-extrabold text-[17px] text-[#EAD9B0]">Personagens Salvos</h2>
          </div>
          <span className="text-xs text-[#6B6560]">{fichasOrdenadas.length}</span>
        </div>

        {fichasOrdenadas.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
            {fichasOrdenadas.map(f => (
              <FichaCard
                key={f.id}
                ficha={f}
                onCarregar={() => handleCarregar(f.id)}
                onExportar={() => exportarPorId(f.id, f.nome)}
                onDeletar={() => handleDeletar(f)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-14 border border-dashed border-[rgba(212,160,23,0.25)] rounded-2xl">
            <p className="text-[#A8A09B] font-semibold">Nenhum personagem salvo ainda.</p>
            <p className="text-[#6B6560] text-sm mt-1">Crie seu primeiro aventureiro acima!</p>
          </div>
        )}
      </div>
    </div>
  )
}

interface FichaCardProps {
  ficha: FichaListItem
  onCarregar: () => void
  onExportar: () => void
  onDeletar: () => void
}

function FichaCard({ ficha, onCarregar, onExportar, onDeletar }: FichaCardProps) {
  const classe = dados.classes.find(c => c.id === ficha.classe)
  const especie = dados.especies?.find(e => e.id === ficha.especie)
  const dataFormatada = new Date(ficha.updatedAt).toLocaleDateString('pt-BR')

  return (
    <div className="vg-card p-[18px_20px]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-[14px]">
          <div className="w-12 h-12 rounded-[13px] flex-shrink-0 bg-[#221d18] border border-[rgba(212,160,23,0.3)] overflow-hidden">
            <CharacterAvatar nome={ficha.nome || null} id={ficha.id} size={48} />
          </div>
          <div>
            <div className="font-bold text-[17px] text-[#F5F0E8]">{ficha.nome || 'Sem nome'}</div>
            <div className="text-[13px] text-[#8a8278] mt-[3px]">
              Nível {ficha.nivel} {classe?.nome ?? ficha.classe} · {especie?.nome ?? ficha.especie}
            </div>
          </div>
        </div>
        <span className="text-xs text-[#6B6560] whitespace-nowrap">{dataFormatada}</span>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={onCarregar}
          className="flex-1 inline-flex items-center justify-center gap-[7px] text-[13px] font-bold text-[#131110] bg-[#D4A017] hover:bg-[#E8C25A] border-0 rounded-[9px] py-[9px] cursor-pointer transition-colors"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          Continuar
        </button>
        <button
          onClick={onExportar}
          className="inline-flex items-center gap-[6px] text-[13px] font-semibold text-[#A8A09B] hover:text-[#E8DFD0] bg-white/[0.04] border border-white/[0.08] rounded-[9px] px-[13px] py-[9px] cursor-pointer transition-colors"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 15v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4"/><path d="M7 9l5-5 5 5"/><path d="M12 4v12"/></svg>
          Exportar
        </button>
        <button
          onClick={onDeletar}
          aria-label={`Deletar ${ficha.nome}`}
          className="inline-flex items-center justify-center text-[#b56a6a] bg-[rgba(181,57,47,0.1)] border border-[rgba(181,57,47,0.28)] hover:bg-[rgba(181,57,47,0.2)] rounded-[9px] px-[11px] py-[9px] cursor-pointer transition-colors"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
        </button>
      </div>
    </div>
  )
}

function StarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#B8860B">
      <path d="M12 2l2.2 5.6L20 8.2l-4.4 3.9L17 18l-5-3.2L7 18l1.4-5.9L4 8.2l5.8-.6z"/>
    </svg>
  )
}

function GearIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  )
}

function SwordsIcon() {
  return (
    <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="#D4A017" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
      <path d="M14.5 17.5L3 6V3h3l11.5 11.5"/>
      <path d="M13 19l6-6"/>
      <path d="M16 16l4 4"/>
      <path d="M9.5 17.5L21 6V3h-3L6.5 14.5"/>
      <path d="M11 19l-6-6"/>
      <path d="M8 16l-4 4"/>
    </svg>
  )
}
