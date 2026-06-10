import { useMemo, useState } from 'react'
import { useFichaStore } from '../../store/fichaStore'
import { WizardNav } from './WizardNav'
import { getTruquesPorClasse, getMagiasPorClasseECirculo } from '../../data/magias'
import type { Magia } from '../../data/magias'
import { SpellCard } from '../ui/SpellCard'
import dadosJson from '../../data/dnd_dados.json'
import type { DadosJogo } from '../../types'

const dados = dadosJson as unknown as DadosJogo

function SpellPill({
  magia,
  selecionado,
  desabilitado,
  onToggle,
  onInfo,
}: {
  magia: Magia
  selecionado: boolean
  desabilitado: boolean
  onToggle: () => void
  onInfo: () => void
}) {
  return (
    <div className="inline-flex items-center">
      <button
        type="button"
        onClick={onToggle}
        disabled={desabilitado && !selecionado}
        aria-pressed={selecionado}
        className={[
          'inline-flex items-center gap-1 pl-3 pr-2 py-1.5 rounded-l-full border-y border-l text-sm font-medium transition-colors cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]',
          selecionado
            ? 'bg-[#B8860B]/20 border-[#B8860B] text-[#D4A017]'
            : desabilitado
            ? 'border-[#B8860B]/10 text-[#A8A09B]/40 cursor-not-allowed'
            : 'border-[#B8860B]/30 text-[#A8A09B] hover:border-[#B8860B]/60 hover:text-[#F5F0E8]',
        ].join(' ')}
      >
        {magia.nome}
        {magia.concentracao && <span className="text-[10px] opacity-60">C</span>}
        {magia.ritual && <span className="text-[10px] opacity-60">R</span>}
      </button>
      <button
        type="button"
        onClick={onInfo}
        aria-label={`Ver detalhes de ${magia.nome}`}
        className={[
          'inline-flex items-center justify-center w-6 h-full px-1 py-1.5 rounded-r-full border-y border-r text-[10px] transition-colors cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]',
          selecionado
            ? 'bg-[#B8860B]/20 border-[#B8860B] text-[#D4A017] hover:bg-[#B8860B]/30'
            : desabilitado
            ? 'border-[#B8860B]/10 text-[#A8A09B]/40'
            : 'border-[#B8860B]/30 text-[#A8A09B] hover:border-[#B8860B]/60 hover:text-[#F5F0E8]',
        ].join(' ')}
      >
        ℹ
      </button>
    </div>
  )
}

export function Step08Spells() {
  const { ficha, atualizarMagia, setPasso } = useFichaStore()
  const [circuloAtivo, setCirculoAtivo] = useState(1)
  const [busca, setBusca] = useState('')
  const [spellInfo, setSpellInfo] = useState<Magia | null>(null)

  const classeId = ficha.identidade.classe_id
  const nivel = ficha.identidade.nivel
  const classe = dados.classes.find(c => c.id === classeId)
  const ehConjurador = !!classe?.conjurador

  const prog = useMemo(() => {
    if (!classe?.progressao) return null
    return classe.progressao[nivel - 1] ?? classe.progressao[0]
  }, [classe, nivel])

  const progRaw = prog as Record<string, unknown> | null
  const maxTruques = (progRaw?.truques as number | undefined) ?? 0
  const maxMagias = (progRaw?.magias_preparadas as number | undefined) ?? 0

  const maxCirculo = useMemo(() => {
    const espacos = progRaw?.espacos as Record<string, number> | undefined
    if (!espacos) return 0
    return Object.entries(espacos)
      .filter(([, v]) => v > 0)
      .reduce((acc, [k]) => Math.max(acc, parseInt(k.replace('c', ''))), 0)
  }, [progRaw])

  const truquesDisponiveis = useMemo(
    () => getTruquesPorClasse(classeId ?? ''),
    [classeId],
  )

  const magiasDisponiveis = useMemo(
    () => getMagiasPorClasseECirculo(classeId ?? '', maxCirculo),
    [classeId, maxCirculo],
  )

  const truquesSelecionados = ficha.magia.truques_conhecidos
  const magiasSelecionadas = ficha.magia.magias_preparadas

  function toggleTruque(nome: string) {
    const atual = truquesSelecionados
    if (atual.includes(nome)) {
      atualizarMagia({ truques_conhecidos: atual.filter(t => t !== nome) })
    } else if (atual.length < maxTruques || maxTruques === 0) {
      atualizarMagia({ truques_conhecidos: [...atual, nome] })
    }
  }

  function toggleMagia(nome: string) {
    const atual = magiasSelecionadas
    if (atual.includes(nome)) {
      atualizarMagia({ magias_preparadas: atual.filter(m => m !== nome) })
    } else if (atual.length < maxMagias || maxMagias === 0) {
      atualizarMagia({ magias_preparadas: [...atual, nome] })
    }
  }

  const circulosDisponiveis = useMemo(() => {
    const circs = new Set(magiasDisponiveis.map(m => m.circulo))
    return Array.from(circs).sort((a, b) => a - b) as number[]
  }, [magiasDisponiveis])

  const magiasDoCirculo = useMemo(
    () => magiasDisponiveis
      .filter(m => m.circulo === circuloAtivo)
      .filter(m => !busca || m.nome.toLowerCase().includes(busca.toLowerCase())),
    [magiasDisponiveis, circuloAtivo, busca],
  )

  const truquesFiltrados = useMemo(
    () => truquesDisponiveis.filter(
      t => !busca || t.nome.toLowerCase().includes(busca.toLowerCase()),
    ),
    [truquesDisponiveis, busca],
  )

  if (!ehConjurador) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-cinzel text-2xl font-bold text-[#F5F0E8] mb-1">Magias</h2>
          <p className="text-[#A8A09B] text-sm">
            {classeId ? `${classe?.nome} não é uma classe conjuradora.` : 'Escolha uma classe primeiro.'}
          </p>
        </div>
        <div className="bg-[#3D332D] border border-[#B8860B]/20 rounded-xl p-6 text-center">
          <p className="text-4xl mb-3">⚔️</p>
          <p className="text-[#F5F0E8] font-medium">Esta classe não utiliza magia</p>
          <p className="text-[#A8A09B] text-sm mt-1">Continue para o próximo passo.</p>
        </div>
        <WizardNav onBack={() => setPasso(7)} onNext={() => setPasso(9)} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cinzel text-2xl font-bold text-[#F5F0E8] mb-1">Magias</h2>
        <p className="text-[#A8A09B] text-sm">
          Escolha as magias iniciais do seu personagem com base na classe e nível.
        </p>
      </div>

      {/* Busca */}
      <input
        type="text"
        value={busca}
        onChange={e => setBusca(e.target.value)}
        placeholder="Buscar magia ou truque..."
        className="w-full bg-[#2D2520] border border-[#B8860B]/30 rounded-lg px-3 py-2 text-[#F5F0E8] text-sm placeholder:text-[#A8A09B] focus:outline-none focus:ring-1 focus:ring-[#B8860B] focus:border-[#B8860B]"
        aria-label="Buscar magia ou truque"
      />

      {/* Truques */}
      {maxTruques > 0 && (
        <div className="bg-[#3D332D] border border-[#B8860B]/20 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-cinzel font-semibold text-[#B8860B]">Truques</h3>
            <span className={[
              'text-sm font-bold px-2 py-0.5 rounded-full',
              truquesSelecionados.length >= maxTruques
                ? 'bg-[#B8860B]/20 text-[#D4A017]'
                : 'bg-[#2D2520] text-[#A8A09B]',
            ].join(' ')}>
              {truquesSelecionados.length}/{maxTruques}
            </span>
          </div>
          {truquesDisponiveis.length === 0 ? (
            <p className="text-xs text-[#A8A09B]">Nenhum truque disponível para esta classe.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {truquesFiltrados.map(t => (
                <SpellPill
                  key={t.id}
                  magia={t}
                  selecionado={truquesSelecionados.includes(t.nome)}
                  desabilitado={truquesSelecionados.length >= maxTruques}
                  onToggle={() => toggleTruque(t.nome)}
                  onInfo={() => setSpellInfo(t)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Magias */}
      {maxMagias > 0 && maxCirculo > 0 && (
        <div className="bg-[#3D332D] border border-[#B8860B]/20 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-cinzel font-semibold text-[#B8860B]">Magias Preparadas</h3>
            <span className={[
              'text-sm font-bold px-2 py-0.5 rounded-full',
              magiasSelecionadas.length >= maxMagias
                ? 'bg-[#B8860B]/20 text-[#D4A017]'
                : 'bg-[#2D2520] text-[#A8A09B]',
            ].join(' ')}>
              {magiasSelecionadas.length}/{maxMagias}
            </span>
          </div>

          {/* Tabs por círculo */}
          <div className="flex gap-1 overflow-x-auto pb-1" role="tablist" aria-label="Círculos de magia">
            {circulosDisponiveis.map(c => (
              <button
                key={c}
                role="tab"
                aria-selected={circuloAtivo === c}
                onClick={() => setCirculoAtivo(c)}
                className={[
                  'px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]',
                  circuloAtivo === c
                    ? 'bg-[#B8860B] text-[#1A1612]'
                    : 'bg-[#2D2520] text-[#A8A09B] hover:text-[#F5F0E8]',
                ].join(' ')}
              >
                {c}º
              </button>
            ))}
          </div>

          <div
            role="tabpanel"
            aria-label={`Magias de círculo ${circuloAtivo}`}
          >
            {magiasDoCirculo.length === 0 ? (
              <p className="text-xs text-[#A8A09B]">
                {busca ? 'Nenhuma magia encontrada.' : 'Nenhuma magia disponível neste círculo.'}
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {magiasDoCirculo.map(m => (
                  <SpellPill
                    key={m.id}
                    magia={m}
                    selecionado={magiasSelecionadas.includes(m.nome)}
                    desabilitado={magiasSelecionadas.length >= maxMagias}
                    onToggle={() => toggleMagia(m.nome)}
                    onInfo={() => setSpellInfo(m)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Seleções atuais */}
      {(truquesSelecionados.length > 0 || magiasSelecionadas.length > 0) && (
        <div className="bg-[#2D2520] border border-[#B8860B]/10 rounded-xl p-4 space-y-2">
          <p className="text-xs text-[#A8A09B] font-medium uppercase tracking-wide">Selecionados</p>
          {truquesSelecionados.length > 0 && (
            <div>
              <span className="text-xs text-[#B8860B] font-medium">Truques: </span>
              <span className="text-xs text-[#F5F0E8]">{truquesSelecionados.join(', ')}</span>
            </div>
          )}
          {magiasSelecionadas.length > 0 && (
            <div>
              <span className="text-xs text-[#B8860B] font-medium">Magias: </span>
              <span className="text-xs text-[#F5F0E8]">{magiasSelecionadas.join(', ')}</span>
            </div>
          )}
        </div>
      )}

      <WizardNav onBack={() => setPasso(7)} onNext={() => setPasso(9)} />

      <SpellCard magia={spellInfo} onClose={() => setSpellInfo(null)} />
    </div>
  )
}
