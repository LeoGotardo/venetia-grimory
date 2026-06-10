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
import { Input } from '../components/ui/Input'
import Button from '../components/ui/Button'
import dadosJson from '../data/dnd_dados.json'
import type { DadosJogo } from '../types'
import { XP_POR_NIVEL } from '../lib/calculos'

const dados = dadosJson as unknown as DadosJogo

type Aba = 'ficha' | 'magia' | 'inventario' | 'anotacoes' | 'editar'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#3D332D] border border-[#B8860B]/20 rounded-xl p-4">
      <h2 className="font-cinzel font-semibold text-[#B8860B] mb-4 pb-2 border-b border-[#B8860B]/20">
        {title}
      </h2>
      {children}
    </div>
  )
}

export function Ficha() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { ficha, fichaId, carregarFicha, setIdentidade } = useFichaStore()
  const { exportar } = useFichaExport()
  const [aba, setAba] = useState<Aba>('ficha')
  const [editandoNome, setEditandoNome] = useState(false)

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

  const abas = useMemo<Array<{ id: Aba; label: string; icon?: string }>>(
    () => [
      { id: 'ficha', label: 'Ficha' },
      ...(ficha.magia.conjurador ? [{ id: 'magia' as Aba, label: 'Magia' }] : []),
      { id: 'inventario', label: 'Inventário' },
      { id: 'anotacoes', label: 'Anotações' },
      { id: 'editar', label: '✎ Editar', icon: 'editar' },
    ],
    [ficha.magia.conjurador],
  )

  return (
    <div className="min-h-screen bg-[#2D2520]">
      <FichaTopbar
        nomePesonagem={identity.nome_personagem}
        editandoNome={editandoNome}
        onEditNome={() => setEditandoNome(true)}
        onBlurNome={() => setEditandoNome(false)}
        onChangeNome={nome => setIdentidade({ nome_personagem: nome })}
        onHome={() => navigate('/')}
        onExportar={() => exportar(identity.nome_personagem)}
      />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <FichaHeader
          identity={identity}
          classe={classe}
          subclasse={subclasse}
          especie={especie}
          ante={ante}
          xpAtual={xpAtual}
          xpProximo={xpProximo}
          xpPct={xpPct}
        />

        <nav
          className="flex gap-1 border-b border-[#B8860B]/20 mb-6 no-print overflow-x-auto"
          aria-label="Abas da ficha"
          role="tablist"
        >
          {abas.map(a => (
            <button
              key={a.id}
              role="tab"
              onClick={() => setAba(a.id)}
              aria-selected={aba === a.id}
              aria-controls={`tabpanel-${a.id}`}
              className={[
                'px-4 py-2 text-sm font-medium transition-colors border-b-2 cursor-pointer whitespace-nowrap',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B] focus-visible:ring-inset',
                aba === a.id
                  ? 'border-[#7B1D1D] text-[#F5F0E8]'
                  : a.id === 'editar'
                  ? 'border-transparent text-[#B8860B]/70 hover:text-[#B8860B] hover:border-[#B8860B]/30'
                  : 'border-transparent text-[#A8A09B] hover:text-[#F5F0E8]',
              ].join(' ')}
            >
              {a.label}
            </button>
          ))}
        </nav>

        <div role="tabpanel" id={`tabpanel-${aba}`} aria-label={abas.find(a => a.id === aba)?.label}>
          {aba === 'ficha' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <Section title="Combate"><PainelCombate /></Section>
              </div>
              <div className="space-y-6">
                <Section title="Atributos"><PainelAtributos /></Section>
                <Section title="Perícias"><PainelPericias /></Section>
                <PainelRecursos />
              </div>
            </div>
          )}

          {aba === 'magia' && (
            <div className="max-w-2xl">
              <Section title="Magia"><PainelMagia /></Section>
            </div>
          )}

          {aba === 'inventario' && (
            <div className="max-w-2xl">
              <Section title="Inventário"><PainelInventario /></Section>
            </div>
          )}

          {aba === 'anotacoes' && (
            <div className="max-w-2xl">
              <Section title="Anotações"><PainelAnotacoes /></Section>
            </div>
          )}

          {aba === 'editar' && <PainelEditar />}
        </div>
      </div>
    </div>
  )
}

interface FichaTopbarProps {
  nomePesonagem: string | null | undefined
  editandoNome: boolean
  onEditNome: () => void
  onBlurNome: () => void
  onChangeNome: (nome: string) => void
  onHome: () => void
  onExportar: () => void
}

function FichaTopbar({
  nomePesonagem,
  editandoNome,
  onEditNome,
  onBlurNome,
  onChangeNome,
  onHome,
  onExportar,
}: FichaTopbarProps) {
  return (
    <div className="no-print bg-[#2D2520] border-b border-[#B8860B]/20 px-4 py-3 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onHome}
            className="text-[#A8A09B] hover:text-[#F5F0E8] transition-colors text-sm cursor-pointer"
          >
            ← Home
          </button>
          <span className="text-[#3D332D]">|</span>
          {editandoNome ? (
            <Input
              value={nomePesonagem ?? ''}
              onChange={e => onChangeNome(e.target.value)}
              onBlur={onBlurNome}
              autoFocus
              className="w-48"
            />
          ) : (
            <button
              onClick={onEditNome}
              title="Clique para editar o nome"
              className="font-cinzel font-bold text-[#F5F0E8] hover:text-[#D4A017] transition-colors cursor-pointer"
            >
              {nomePesonagem || 'Sem nome'}
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={onExportar}>📤 Exportar</Button>
          <Button size="sm" variant="ghost" onClick={() => window.print()}>🖨 Imprimir</Button>
        </div>
      </div>
    </div>
  )
}

interface FichaHeaderProps {
  identity: { nome_personagem?: string | null; nivel: number; xp: number; alinhamento: { etico?: string | null; moral?: string | null } }
  classe: { nome: string } | undefined
  subclasse: { nome: string } | undefined
  especie: { nome: string } | undefined
  ante: { nome: string } | undefined
  xpAtual: number
  xpProximo: number | undefined
  xpPct: number
}

function FichaHeader({ identity, classe, subclasse, especie, ante, xpAtual, xpProximo, xpPct }: FichaHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="font-cinzel text-3xl font-bold text-[#F5F0E8]">
        {identity.nome_personagem || 'Personagem Sem Nome'}
      </h1>
      <p className="text-[#A8A09B] text-sm mt-1">
        Nível {identity.nivel} {classe?.nome ?? '—'}
        {subclasse ? ` (${subclasse.nome})` : ''}
        {especie ? ` · ${especie.nome}` : ''}
        {ante ? ` · ${ante.nome}` : ''}
        {identity.alinhamento.etico ? ` · ${identity.alinhamento.etico} ${identity.alinhamento.moral}` : ''}
      </p>
      {xpProximo && (
        <div className="mt-2 max-w-sm">
          <div className="flex justify-between text-xs text-[#A8A09B] mb-1">
            <span>XP: {xpAtual.toLocaleString('pt-BR')}</span>
            <span>Próximo nível: {xpProximo.toLocaleString('pt-BR')}</span>
          </div>
          <div className="h-1.5 bg-[#3D332D] rounded-full overflow-hidden">
            <div className="h-full bg-[#B8860B] rounded-full transition-all" style={{ width: `${xpPct}%` }} />
          </div>
        </div>
      )}
    </div>
  )
}
