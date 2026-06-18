import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useFichaStore } from '../../store/fichaStore'
import { WizardNav } from './WizardNav'
import { getTruquesPorClasses, getMagiasPorClassesECirculos } from '../../data/magias'
import type { Magia } from '../../data/magias'
import { SpellCard } from '../ui/SpellCard'
import dadosJson from '../../data/dnd_dados.json'
import type { DadosJogo } from '../../types'
import { TIPO_CONJURADOR } from '../../constants'

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
  const { t } = useTranslation()
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
        aria-label={t('step08.viewDetails', { nome: magia.nome })}
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
  const { t } = useTranslation()
  const [circuloAtivo, setCirculoAtivo] = useState(1)
  const [busca, setBusca] = useState('')
  const [spellInfo, setSpellInfo] = useState<Magia | null>(null)

  const classeId = ficha.identidade.classe_id
  const nivel = ficha.identidade.nivel
  const multiclasses = ficha.identidade.multiclasses ?? []
  const nivelPrimaria = nivel - multiclasses.reduce((s, m) => s + m.nivel, 0)

  const ehConjurador = ficha.magia.conjurador

  // Classe conjuradora efetiva para limits de criação (primária se conjuradora, senão primeira secundária)
  const classeConjId = TIPO_CONJURADOR[classeId ?? ''] != null
    ? classeId
    : multiclasses.find(m => TIPO_CONJURADOR[m.classe_id] != null)?.classe_id ?? classeId
  const nivelConjEfetivo = classeConjId === classeId ? nivelPrimaria : (multiclasses.find(m => m.classe_id === classeConjId)?.nivel ?? 1)
  const classeConj = dados.classes.find(c => c.id === classeConjId)

  const prog = useMemo(() => {
    if (!classeConj?.progressao) return null
    const idx = Math.max(0, Math.min(nivelConjEfetivo - 1, classeConj.progressao.length - 1))
    return (classeConj.progressao[idx] ?? classeConj.progressao[0]) as Record<string, unknown> | null
  }, [classeConj, nivelConjEfetivo])

  const maxTruques = (prog?.truques as number | undefined) ?? 0
  const maxMagias = (prog?.magias_preparadas as number | undefined) ?? 0

  // Limites por círculo só se aplicam na classe única (multiclasse usa tabela combinada)
  const limitesPorCirculo = useMemo(() => {
    if (multiclasses.length > 0) return {} as Record<number, number>
    const espacos = prog?.espacos as Record<string, number> | undefined
    if (!espacos) return {} as Record<number, number>
    return Object.fromEntries(
      Object.entries(espacos).map(([k, v]) => [parseInt(k.replace('c', '')), v])
    ) as Record<number, number>
  }, [prog, multiclasses.length])

  // Acesso por classe: cada classe conjuradora com seu círculo máximo no seu próprio nível
  const classesParaMagias = useMemo<Array<{ classeId: string; maxCirculo: number }>>(() => {
    function getMaxCirc(cd: { progressao: unknown[] } | undefined, niv: number) {
      if (!cd?.progressao) return 0
      const idx = Math.max(0, Math.min(niv - 1, cd.progressao.length - 1))
      const p = cd.progressao[idx] as Record<string, unknown>
      const esp = p?.espacos as Record<string, number> | undefined
      if (!esp) return 0
      return Object.entries(esp).filter(([, v]) => v > 0).reduce((a, [k]) => Math.max(a, parseInt(k.replace('c', ''))), 0)
    }
    if (multiclasses.length === 0) {
      const classe = dados.classes.find(c => c.id === classeId)
      const mc = getMaxCirc(classe, nivel)
      return [{ classeId: classeId ?? '', maxCirculo: mc > 0 ? mc : 9 }]
    }
    const result: Array<{ classeId: string; maxCirculo: number }> = []
    if (TIPO_CONJURADOR[classeId ?? ''] != null) {
      const cd = dados.classes.find(c => c.id === classeId)
      const mc = getMaxCirc(cd, Math.max(1, nivelPrimaria))
      result.push({ classeId: classeId ?? '', maxCirculo: mc > 0 ? mc : 9 })
    }
    for (const m of multiclasses) {
      if (TIPO_CONJURADOR[m.classe_id] != null) {
        const cd = dados.classes.find(c => c.id === m.classe_id)
        const mc = getMaxCirc(cd, m.nivel)
        if (mc > 0) result.push({ classeId: m.classe_id, maxCirculo: mc })
      }
    }
    if (result.length === 0) result.push({ classeId: classeId ?? '', maxCirculo: 9 })
    return result
  }, [classeId, nivel, nivelPrimaria, multiclasses])

  const allClasseIds = useMemo(() => classesParaMagias.map(c => c.classeId), [classesParaMagias])

  const truquesDisponiveis = useMemo(() => getTruquesPorClasses(allClasseIds), [allClasseIds])
  const magiasDisponiveis = useMemo(() => getMagiasPorClassesECirculos(classesParaMagias), [classesParaMagias])

  const truquesSelecionados = ficha.magia.truques_conhecidos
  const magiasSelecionadas = ficha.magia.magias_preparadas

  const selecionadosPorCirculo = useMemo(() => {
    const counts: Record<number, number> = {}
    magiasSelecionadas.forEach(nome => {
      const m = magiasDisponiveis.find(x => x.nome === nome)
      if (m) counts[m.circulo] = (counts[m.circulo] ?? 0) + 1
    })
    return counts
  }, [magiasSelecionadas, magiasDisponiveis])

  function toggleTruque(nome: string) {
    const atual = truquesSelecionados
    if (atual.includes(nome)) {
      atualizarMagia({ truques_conhecidos: atual.filter(t => t !== nome) })
    } else if (atual.length < maxTruques || maxTruques === 0) {
      atualizarMagia({ truques_conhecidos: [...atual, nome] })
    }
  }

  function toggleMagia(nome: string, circulo: number) {
    const atual = magiasSelecionadas
    if (atual.includes(nome)) {
      atualizarMagia({ magias_preparadas: atual.filter(m => m !== nome) })
    } else {
      const limiteCirculo = limitesPorCirculo[circulo]
      const usadosCirculo = selecionadosPorCirculo[circulo] ?? 0
      const dentroDoCirculo = limiteCirculo === undefined || usadosCirculo < limiteCirculo
      const dentroDoTotal = maxMagias === 0 || atual.length < maxMagias
      if (dentroDoCirculo && dentroDoTotal) {
        atualizarMagia({ magias_preparadas: [...atual, nome] })
      }
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
      tr => !busca || tr.nome.toLowerCase().includes(busca.toLowerCase()),
    ),
    [truquesDisponiveis, busca],
  )

  if (!ehConjurador) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-cinzel text-2xl font-bold text-[#F5F0E8] mb-1">{t('step08.heading')}</h2>
          <p className="text-[#A8A09B] text-sm">
            {classeId ? t('step08.notCaster', { classe: classeConj?.nome }) : t('step08.chooseClassFirst')}
          </p>
        </div>
        <div className="bg-[#3D332D] border border-[#B8860B]/20 rounded-xl p-6 text-center">
          <div className="mb-3 flex justify-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#B8860B" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 17.5L3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/><path d="M9.5 17.5L21 6V3h-3L6.5 14.5"/><path d="M11 19l-6-6"/><path d="M8 16l-4 4"/></svg>
          </div>
          <p className="text-[#F5F0E8] font-medium">{t('step08.noMagic')}</p>
          <p className="text-[#A8A09B] text-sm mt-1">{t('step08.continueNext')}</p>
        </div>
        <WizardNav onBack={() => setPasso(7)} onNext={() => setPasso(9)} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cinzel text-2xl font-bold text-[#F5F0E8] mb-1">{t('step08.heading')}</h2>
        <p className="text-[#A8A09B] text-sm">{t('step08.subtitle')}</p>
      </div>

      {/* Busca */}
      <input
        type="text"
        value={busca}
        onChange={e => setBusca(e.target.value)}
        placeholder={t('step08.searchPlaceholder')}
        className="w-full bg-[#2D2520] border border-[#B8860B]/30 rounded-lg px-3 py-2 text-[#F5F0E8] text-sm placeholder:text-[#A8A09B] focus:outline-none focus:ring-1 focus:ring-[#B8860B] focus:border-[#B8860B]"
        aria-label={t('step08.searchAriaLabel')}
      />

      {/* Truques */}
      {maxTruques > 0 && (
        <div className="bg-[#3D332D] border border-[#B8860B]/20 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-cinzel font-semibold text-[#B8860B]">{t('step08.cantrips')}</h3>
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
            <p className="text-xs text-[#A8A09B]">{t('step08.noCantrips')}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {truquesFiltrados.map(tr => (
                <SpellPill
                  key={tr.id}
                  magia={tr}
                  selecionado={truquesSelecionados.includes(tr.nome)}
                  desabilitado={truquesSelecionados.length >= maxTruques}
                  onToggle={() => toggleTruque(tr.nome)}
                  onInfo={() => setSpellInfo(tr)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Magias */}
      {maxMagias > 0 && magiasDisponiveis.length > 0 && (
        <div className="bg-[#3D332D] border border-[#B8860B]/20 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-cinzel font-semibold text-[#B8860B]">{t('step08.preparedSpells')}</h3>
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
          <div className="flex gap-1 overflow-x-auto pb-1" role="tablist" aria-label={t('step08.circlesAriaLabel')}>
            {circulosDisponiveis.map(c => {
              const usados = selecionadosPorCirculo[c] ?? 0
              const limite = limitesPorCirculo[c]
              const cheio = limite !== undefined && usados >= limite
              return (
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
                      : cheio
                      ? 'bg-[#2D2520] text-[#D4A017]'
                      : 'bg-[#2D2520] text-[#A8A09B] hover:text-[#F5F0E8]',
                  ].join(' ')}
                >
                  {c}º {limite !== undefined && `${usados}/${limite}`}
                </button>
              )
            })}
          </div>

          <div
            role="tabpanel"
            aria-label={t('step08.circleAriaLabel', { n: circuloAtivo })}
          >
            {limitesPorCirculo[circuloAtivo] !== undefined && (
              <p className="text-xs text-[#A8A09B] mb-2">
                {t('step08.slotsAvailable', { used: selecionadosPorCirculo[circuloAtivo] ?? 0, total: limitesPorCirculo[circuloAtivo] })}
              </p>
            )}
            {magiasDoCirculo.length === 0 ? (
              <p className="text-xs text-[#A8A09B]">
                {busca ? t('step08.noSpellsFound') : t('step08.noSpellsCircle')}
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {magiasDoCirculo.map(m => {
                  const limiteCirculo = limitesPorCirculo[m.circulo]
                  const usadosCirculo = selecionadosPorCirculo[m.circulo] ?? 0
                  const circuloCheio = limiteCirculo !== undefined && usadosCirculo >= limiteCirculo
                  const totalCheio = maxMagias > 0 && magiasSelecionadas.length >= maxMagias
                  return (
                    <SpellPill
                      key={m.id}
                      magia={m}
                      selecionado={magiasSelecionadas.includes(m.nome)}
                      desabilitado={circuloCheio || totalCheio}
                      onToggle={() => toggleMagia(m.nome, m.circulo)}
                      onInfo={() => setSpellInfo(m)}
                    />
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Seleções atuais */}
      {(truquesSelecionados.length > 0 || magiasSelecionadas.length > 0) && (
        <div className="bg-[#2D2520] border border-[#B8860B]/10 rounded-xl p-4 space-y-2">
          <p className="text-xs text-[#A8A09B] font-medium uppercase tracking-wide">{t('step08.selectedLabel')}</p>
          {truquesSelecionados.length > 0 && (
            <div>
              <span className="text-xs text-[#B8860B] font-medium">{t('step08.cantripsLabel')}</span>
              <span className="text-xs text-[#F5F0E8]">{truquesSelecionados.join(', ')}</span>
            </div>
          )}
          {magiasSelecionadas.length > 0 && (
            <div>
              <span className="text-xs text-[#B8860B] font-medium">{t('step08.spellsLabel')}</span>
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
