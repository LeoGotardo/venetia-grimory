import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { CreatureType, Monster } from '../../types'
import { useGmStore } from '../../store/gmStore'
import { MonsterRow, rowButton } from './MonsterRow'
import { CreatureTypeIcon } from './CreatureTypeIcon'
import { ChevronIcon } from './ornaments'
import { matchesSearch } from '../../lib/gm/search'
import { crValue } from '../../lib/gm/statblock'
import { CREATURE_TYPES } from '../../constants'

export type MonsterSource = 'custom' | 'srd'

const CR_BANDS = [
  { id: 'all', test: () => true, label: null },
  { id: '0-1', test: (v: number) => v <= 1, label: '0–1' },
  { id: '2-5', test: (v: number) => v > 1 && v <= 5, label: '2–5' },
  { id: '6-10', test: (v: number) => v > 5 && v <= 10, label: '6–10' },
  { id: '11+', test: (v: number) => v > 10, label: '11+' },
] as const

/** Lista longa: mostra os primeiros e a busca afunila o resto. */
const PAGE = 60

interface MonsterBrowserProps {
  /** Ações à direita de cada linha (ver, editar, adicionar…). */
  actions?: (monster: Monster) => ReactNode
  onPick?: (monster: Monster) => void
  initialSource?: MonsterSource
  /** Monstro aberto no painel ao lado (página do bestiário no desktop). */
  selectedId?: string | null
  /** Classe do campo de busca — o modal e a página têm fundos diferentes. */
  inputClassName?: string
}

/**
 * Bestiário do mestre e catálogo do SRD com a mesma busca e os mesmos filtros.
 * O SRD é carregado só quando a aba dele é aberta (chunk próprio).
 */
export function MonsterBrowser({ actions, onPick, initialSource = 'custom', inputClassName, selectedId }: MonsterBrowserProps) {
  const { t, i18n } = useTranslation()
  const { bestiary, srd, loadSrd } = useGmStore()
  const [source, setSource] = useState<MonsterSource>(initialSource)
  const [query, setQuery] = useState('')
  const [type, setType] = useState<CreatureType | ''>('')
  const [band, setBand] = useState<typeof CR_BANDS[number]['id']>('all')
  const [limit, setLimit] = useState(PAGE)

  useEffect(() => {
    if (source === 'srd') void loadSrd(i18n.language)
  }, [source, i18n.language, loadSrd])

  const srdReady = srd?.language === i18n.language

  // Busca e ND primeiro; a categoria vem depois, para os chips mostrarem quantos há em cada uma.
  const filtered = useMemo(() => {
    const test = CR_BANDS.find(b => b.id === band)!.test
    const list = source === 'srd' ? (srdReady ? srd.monsters : []) : bestiary
    return list
      .filter(m => matchesSearch(m.statblock.name, query))
      .filter(m => test(crValue(m.statblock.cr)))
      .sort((a, b) => crValue(a.statblock.cr) - crValue(b.statblock.cr) || a.statblock.name.localeCompare(b.statblock.name))
  }, [source, srdReady, srd, bestiary, query, band])

  const groups = useMemo(() => CREATURE_TYPES
    .map(c => ({ type: c, monsters: filtered.filter(m => m.statblock.creature_type === c) }))
    .filter(g => g.monsters.length > 0), [filtered])

  const results = type ? filtered.filter(m => m.statblock.creature_type === type) : filtered
  // Sem busca nem categoria, a lista vira estante por tipo; com filtro, lista corrida.
  const grouped = !type && !query.trim() && groups.length > 1

  const field = inputClassName
    ?? 'bg-[#1A1714] border border-[rgba(212,160,23,0.25)] rounded-[10px] px-4 py-2.5 text-[15px] text-[#F5F0E8] placeholder:text-[#A8A09B] focus:outline-none focus:border-[#D4A017]'

  const row = (m: Monster) => (
    <MonsterRow key={m.id} block={m.statblock} selected={m.id === selectedId} onClick={onPick ? () => onPick(m) : undefined} actions={actions?.(m)} />
  )

  const chip = (active: boolean) =>
    `flex-shrink-0 inline-flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-full text-[13px] font-semibold border cursor-pointer transition-colors ${
      active ? 'bg-[#D4A017] border-[#D4A017] text-[#131110]' : 'bg-white/[0.03] border-white/[0.1] text-[#E8DFD0] hover:border-[rgba(212,160,23,0.5)]'
    }`

  return (
    <div className="flex flex-col gap-3">
      <div role="tablist" className="inline-flex self-start rounded-[9px] border border-white/[0.1] overflow-hidden">
        {(['custom', 'srd'] as const).map(s => (
          <button
            key={s}
            role="tab"
            aria-selected={source === s}
            data-testid={`fonte-${s}`}
            onClick={() => setSource(s)}
            className={`px-4 min-h-[42px] text-[14px] font-semibold cursor-pointer ${source === s ? 'bg-[#D4A017] text-[#131110]' : 'text-[#E8DFD0] bg-white/5'}`}
          >
            {s === 'custom' ? t('gm.myMonsters') : t('gm.srdCatalog')}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder={t('gm.search')} aria-label={t('gm.search')} className={field} />
        <select value={band} onChange={e => setBand(e.target.value as typeof band)} aria-label={t('gm.filterCr')} className={field}>
          {CR_BANDS.map(b => <option key={b.id} value={b.id}>{b.label ? `${t('gm.filterCr')} ${b.label}` : t('gm.anyCr')}</option>)}
        </select>
      </div>

      {groups.length > 0 && (
        <div role="group" aria-label={t('gm.categories')} className="flex gap-1.5 overflow-x-auto sm:flex-wrap -mx-1 px-1 pb-1">
          <button aria-pressed={!type} onClick={() => setType('')} className={chip(!type)}>
            {t('gm.allCategories')} <span className="tabular-nums opacity-70">{filtered.length}</span>
          </button>
          {groups.map(g => (
            <button
              key={g.type}
              data-testid={`categoria-${g.type}`}
              aria-pressed={type === g.type}
              onClick={() => setType(type === g.type ? '' : g.type)}
              className={chip(type === g.type)}
            >
              <CreatureTypeIcon type={g.type} size={15} />
              {t(`gm.creatureTypesPlural.${g.type}`)} <span className="tabular-nums opacity-70">{g.monsters.length}</span>
            </button>
          ))}
        </div>
      )}

      {source === 'srd' && !srdReady ? (
        <p className="text-sm text-[#A8A09B] py-6 text-center">{t('gm.loadingCatalog')}</p>
      ) : results.length === 0 ? (
        <p className="text-sm text-[#A8A09B] py-6 text-center">
          {source === 'custom' && bestiary.length === 0 ? t('gm.noMonstersHint') : t('gm.noMatches')}
        </p>
      ) : grouped ? (
        <div className="flex flex-col gap-1.5">
          {groups.map(g => (
            <TypeGroup key={g.type} type={g.type} count={g.monsters.length} defaultOpen={filtered.length <= 12}>
              {g.monsters.map(row)}
            </TypeGroup>
          ))}
        </div>
      ) : (
        <>
          <p className="text-[11px] text-[#A8A09B]">{t('gm.resultsCount', { n: results.length })}</p>
          <div className="flex flex-col gap-2">{results.slice(0, limit).map(row)}</div>
          {results.length > limit && (
            <button onClick={() => setLimit(l => l + PAGE)} className={`${rowButton} self-center min-h-[40px] px-4`}>
              {t('gm.showMore', { n: results.length - limit })}
            </button>
          )}
        </>
      )}

      {source === 'srd' && (
        <p className="text-[10px] leading-snug text-[#A8A09B] mt-2">{t('gm.srdAttribution')}</p>
      )}
    </div>
  )
}

/** Uma prateleira do bestiário: cabeçalho com glifo, nome e contagem; abre e fecha. */
function TypeGroup({ type, count, defaultOpen, children }: { type: CreatureType; count: number; defaultOpen: boolean; children: ReactNode }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section className="rounded-[12px] border border-white/[0.07] bg-[rgba(26,23,20,0.6)]">
      <button
        aria-expanded={open}
        data-testid={`grupo-${type}`}
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 min-h-[54px] cursor-pointer text-left"
      >
        <span className="w-9 h-9 flex items-center justify-center rounded-full border border-[rgba(212,160,23,0.35)] text-[#D4A017]">
          <CreatureTypeIcon type={type} size={17} />
        </span>
        <span className="flex-1 font-cinzel text-[16px] font-semibold tracking-[0.04em] text-[#EAD9B0]">{t(`gm.creatureTypesPlural.${type}`)}</span>
        <span className="text-[14px] font-semibold text-[#A8A09B] tabular-nums">{count}</span>
        <span className="text-[#A8A09B]"><ChevronIcon open={open} size={16} /></span>
      </button>
      {open && <div className="flex flex-col gap-2 px-2 pb-2">{children}</div>}
    </section>
  )
}
