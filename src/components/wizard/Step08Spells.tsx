import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useFichaStore } from '../../store/fichaStore'
import { WizardNav } from './WizardNav'
import { getTruquesPorClasse, getMagiasPorClasseECirculo } from '../../data/magias'
import type { Magia } from '../../data/magias'
import { SpellCard } from '../ui/SpellCard'
import dadosJson from '../../data/dnd_dados.json'
import type { DadosJogo } from '../../types'
import { TIPO_CONJURADOR } from '../../constants'

const dados = dadosJson as unknown as DadosJogo

function getMaxCirc(cd: { progressao: unknown[] } | undefined, niv: number): number {
  if (!cd?.progressao) return 0
  const idx = Math.max(0, Math.min(niv - 1, cd.progressao.length - 1))
  const p = cd.progressao[idx] as Record<string, unknown>
  // Standard casters: `espacos` object with per-circle counts
  const esp = p?.espacos as Record<string, number> | undefined
  if (esp) {
    const mc = Object.entries(esp).filter(([, v]) => v > 0).reduce((a, [k]) => Math.max(a, parseInt(k.replace('c', ''))), 0)
    if (mc > 0) return mc
  }
  // Warlocks use `circulo_maximo` instead of per-circle `espacos`
  const circuloMax = p?.circulo_maximo as number | undefined
  if (circuloMax && circuloMax > 0) return circuloMax
  return 0
}

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

interface ClasseSpellSectionProps {
  classeId: string
  classNome: string
  maxCirculo: number
  nivel: number
  busca: string
  truquesSelecionados: string[]
  magiasSelecionadas: string[]
  onToggleTruque: (nome: string) => void
  onToggleMagia: (nome: string) => void
  onInfo: (m: Magia) => void
  i18nLang: string
}

function ClasseSpellSection({
  classeId,
  classNome,
  maxCirculo,
  nivel,
  busca,
  truquesSelecionados,
  magiasSelecionadas,
  onToggleTruque,
  onToggleMagia,
  onInfo,
  i18nLang,
}: ClasseSpellSectionProps) {
  const { t } = useTranslation()
  const [circuloAtivo, setCirculoAtivo] = useState(1)

  const classeData = dados.classes.find(c => c.id === classeId)
  const prog = useMemo(() => {
    if (!classeData?.progressao) return null
    const idx = Math.max(0, Math.min(nivel - 1, classeData.progressao.length - 1))
    return (classeData.progressao[idx] ?? classeData.progressao[0]) as Record<string, unknown> | null
  }, [classeData, nivel])

  const maxTruques = (prog?.truques as number | undefined) ?? 0
  const maxMagias = (prog?.magias_preparadas as number | undefined) ?? 0

  const truquesDisponiveis = useMemo(
    () => getTruquesPorClasse(classeId).filter(tr => !busca || tr.nome.toLowerCase().includes(busca.toLowerCase())),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [classeId, busca, i18nLang],
  )

  const magiasDisponiveis = useMemo(
    () => getMagiasPorClasseECirculo(classeId, maxCirculo),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [classeId, maxCirculo, i18nLang],
  )

  const circulosDisponiveis = useMemo(() => {
    const circs = new Set(magiasDisponiveis.map(m => m.circulo))
    return Array.from(circs).sort((a, b) => a - b)
  }, [magiasDisponiveis])

  const magiasDoCirculo = useMemo(
    () => magiasDisponiveis
      .filter(m => m.circulo === circuloAtivo)
      .filter(m => !busca || m.nome.toLowerCase().includes(busca.toLowerCase())),
    [magiasDisponiveis, circuloAtivo, busca],
  )

  return (
    <div className="bg-[#3D332D] border border-[#B8860B]/20 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-cinzel font-bold text-[#D4A017]">{classNome}</h3>
        <span className="text-xs text-[#A8A09B] bg-[#2D2520] border border-[#B8860B]/20 rounded-full px-2 py-0.5">
          {t('step08.upToCircle', { n: maxCirculo })}
        </span>
      </div>

      {/* Truques */}
      {maxTruques > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#B8860B]">{t('step08.cantrips')}</span>
            <span className={[
              'text-xs font-bold px-2 py-0.5 rounded-full',
              truquesSelecionados.length >= maxTruques ? 'bg-[#B8860B]/20 text-[#D4A017]' : 'bg-[#2D2520] text-[#A8A09B]',
            ].join(' ')}>
              {truquesSelecionados.length}/{maxTruques}
            </span>
          </div>
          {truquesDisponiveis.length === 0 ? (
            <p className="text-xs text-[#A8A09B]">{t('step08.noCantrips')}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {truquesDisponiveis.map(tr => (
                <SpellPill
                  key={tr.id}
                  magia={tr}
                  selecionado={truquesSelecionados.includes(tr.nome)}
                  desabilitado={truquesSelecionados.length >= maxTruques}
                  onToggle={() => onToggleTruque(tr.nome)}
                  onInfo={() => onInfo(tr)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Magias preparadas */}
      {maxMagias > 0 && magiasDisponiveis.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#B8860B]">{t('step08.preparedSpells')}</span>
            <span className={[
              'text-xs font-bold px-2 py-0.5 rounded-full',
              magiasSelecionadas.length >= maxMagias ? 'bg-[#B8860B]/20 text-[#D4A017]' : 'bg-[#2D2520] text-[#A8A09B]',
            ].join(' ')}>
              {magiasSelecionadas.length}/{maxMagias}
            </span>
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1" role="tablist" aria-label={t('step08.circlesAriaLabel')}>
            {circulosDisponiveis.map(c => (
              <button
                key={c}
                role="tab"
                aria-selected={circuloAtivo === c}
                onClick={() => setCirculoAtivo(c)}
                className={[
                  'px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]',
                  circuloAtivo === c ? 'bg-[#B8860B] text-[#1A1612]' : 'bg-[#2D2520] text-[#A8A09B] hover:text-[#F5F0E8]',
                ].join(' ')}
              >
                {c}º
              </button>
            ))}
          </div>

          <div role="tabpanel" aria-label={t('step08.circleAriaLabel', { n: circuloAtivo })}>
            {magiasDoCirculo.length === 0 ? (
              <p className="text-xs text-[#A8A09B]">
                {busca ? t('step08.noSpellsFound') : t('step08.noSpellsCircle')}
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {magiasDoCirculo.map(m => (
                  <SpellPill
                    key={m.id}
                    magia={m}
                    selecionado={magiasSelecionadas.includes(m.nome)}
                    desabilitado={maxMagias > 0 && magiasSelecionadas.length >= maxMagias}
                    onToggle={() => onToggleMagia(m.nome)}
                    onInfo={() => onInfo(m)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function Step08Spells() {
  const { ficha, atualizarMagia, setPasso } = useFichaStore()
  const { t, i18n } = useTranslation()
  const [busca, setBusca] = useState('')
  const [spellInfo, setSpellInfo] = useState<Magia | null>(null)

  const classeId = ficha.identidade.classe_id
  const nivel = ficha.identidade.nivel
  const multiclasses = ficha.identidade.multiclasses ?? []
  const nivelPrimaria = nivel - multiclasses.reduce((s, m) => s + m.nivel, 0)

  // True if any class in the build is a spellcaster
  const ehConjurador =
    ficha.magia.conjurador ||
    TIPO_CONJURADOR[classeId ?? ''] != null ||
    multiclasses.some(m => TIPO_CONJURADOR[m.classe_id] != null)

  // List of { classeId, nivel, maxCirculo } for each caster class in the build
  const casterClasses = useMemo(() => {
    const result: Array<{ classeId: string; nivel: number; maxCirculo: number }> = []
    if (TIPO_CONJURADOR[classeId ?? ''] != null) {
      const cd = dados.classes.find(c => c.id === classeId)
      const niv = Math.max(1, nivelPrimaria)
      const mc = getMaxCirc(cd, niv)
      if (mc > 0) result.push({ classeId: classeId!, nivel: niv, maxCirculo: mc })
    }
    for (const m of multiclasses) {
      if (TIPO_CONJURADOR[m.classe_id] != null) {
        const cd = dados.classes.find(c => c.id === m.classe_id)
        const mc = getMaxCirc(cd, m.nivel)
        if (mc > 0) result.push({ classeId: m.classe_id, nivel: m.nivel, maxCirculo: mc })
      }
    }
    return result
  }, [classeId, nivelPrimaria, multiclasses])

  const truquesPorClasse = ficha.magia.truques_por_classe
  const magiasPorClasse = ficha.magia.magias_por_classe

  function toggleTruque(cid: string, nome: string) {
    const atual = truquesPorClasse[cid] ?? []
    atualizarMagia({
      truques_por_classe: {
        ...truquesPorClasse,
        [cid]: atual.includes(nome) ? atual.filter(t => t !== nome) : [...atual, nome],
      },
    })
  }

  function toggleMagia(cid: string, nome: string) {
    const atual = magiasPorClasse[cid] ?? []
    atualizarMagia({
      magias_por_classe: {
        ...magiasPorClasse,
        [cid]: atual.includes(nome) ? atual.filter(m => m !== nome) : [...atual, nome],
      },
    })
  }

  const allTruques = Object.values(truquesPorClasse).flat()
  const allMagias = Object.values(magiasPorClasse).flat()

  if (!ehConjurador) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-cinzel text-2xl font-bold text-[#F5F0E8] mb-1">{t('step08.heading')}</h2>
          <p className="text-[#A8A09B] text-sm">
            {classeId ? t('step08.notCaster', { classe: dados.classes.find(c => c.id === classeId)?.nome }) : t('step08.chooseClassFirst')}
          </p>
        </div>
        <div className="bg-[#3D332D] border border-[#B8860B]/20 rounded-xl p-6 text-center">
          <div className="mb-3 flex justify-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#B8860B" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 17.5L3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/><path d="M9.5 17.5L21 6V3h-3L6.5 14.5"/><path d="M11 19l-6-6"/><path d="M8 16l-4 4"/></svg>
          </div>
          <p className="text-[#F5F0E8] font-medium">{t('step08.noMagic')}</p>
          <p className="text-[#A8A09B] text-sm mt-1">{t('step08.continueNext')}</p>
        </div>
        <WizardNav onBack={() => setPasso(8)} onNext={() => setPasso(10)} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cinzel text-2xl font-bold text-[#F5F0E8] mb-1">{t('step08.heading')}</h2>
        <p className="text-[#A8A09B] text-sm">{t('step08.subtitle')}</p>
      </div>

      <input
        type="text"
        value={busca}
        onChange={e => setBusca(e.target.value)}
        placeholder={t('step08.searchPlaceholder')}
        className="w-full bg-[#2D2520] border border-[#B8860B]/30 rounded-lg px-3 py-2 text-[#F5F0E8] text-sm placeholder:text-[#A8A09B] focus:outline-none focus:ring-1 focus:ring-[#B8860B] focus:border-[#B8860B]"
        aria-label={t('step08.searchAriaLabel')}
      />

      {casterClasses.map(({ classeId: cid, nivel: niv, maxCirculo }) => {
        const classData = dados.classes.find(c => c.id === cid)
        return (
          <ClasseSpellSection
            key={cid}
            classeId={cid}
            classNome={classData?.nome ?? cid}
            maxCirculo={maxCirculo}
            nivel={niv}
            busca={busca}
            truquesSelecionados={truquesPorClasse[cid] ?? []}
            magiasSelecionadas={magiasPorClasse[cid] ?? []}
            onToggleTruque={nome => toggleTruque(cid, nome)}
            onToggleMagia={nome => toggleMagia(cid, nome)}
            onInfo={setSpellInfo}
            i18nLang={i18n.language}
          />
        )
      })}

      {/* Summary of all selections */}
      {(allTruques.length > 0 || allMagias.length > 0) && (
        <div className="bg-[#2D2520] border border-[#B8860B]/10 rounded-xl p-4 space-y-2">
          <p className="text-xs text-[#A8A09B] font-medium uppercase tracking-wide">{t('step08.selectedLabel')}</p>
          {allTruques.length > 0 && (
            <div>
              <span className="text-xs text-[#B8860B] font-medium">{t('step08.cantripsLabel')}</span>
              <span className="text-xs text-[#F5F0E8]">{allTruques.join(', ')}</span>
            </div>
          )}
          {allMagias.length > 0 && (
            <div>
              <span className="text-xs text-[#B8860B] font-medium">{t('step08.spellsLabel')}</span>
              <span className="text-xs text-[#F5F0E8]">{allMagias.join(', ')}</span>
            </div>
          )}
        </div>
      )}

      <WizardNav onBack={() => setPasso(8)} onNext={() => setPasso(10)} />

      <SpellCard magia={spellInfo} onClose={() => setSpellInfo(null)} />
    </div>
  )
}
