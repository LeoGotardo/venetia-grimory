import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { Monster } from '../../types'
import { useGmStore } from '../../store/gmStore'
import { MonsterRow } from './MonsterRow'
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
  /** Classe do campo de busca — o modal e a página têm fundos diferentes. */
  inputClassName?: string
}

/**
 * Bestiário do mestre e catálogo do SRD com a mesma busca e os mesmos filtros.
 * O SRD é carregado só quando a aba dele é aberta (chunk próprio).
 */
export function MonsterBrowser({ actions, onPick, initialSource = 'custom', inputClassName }: MonsterBrowserProps) {
  const { t, i18n } = useTranslation()
  const { bestiary, srd, loadSrd } = useGmStore()
  const [source, setSource] = useState<MonsterSource>(initialSource)
  const [query, setQuery] = useState('')
  const [type, setType] = useState('')
  const [band, setBand] = useState<typeof CR_BANDS[number]['id']>('all')

  useEffect(() => {
    if (source === 'srd') void loadSrd(i18n.language)
  }, [source, i18n.language, loadSrd])

  const srdReady = srd?.language === i18n.language

  const results = useMemo(() => {
    const test = CR_BANDS.find(b => b.id === band)!.test
    const list = source === 'srd' ? (srdReady ? srd.monsters : []) : bestiary
    return list
      .filter(m => matchesSearch(m.statblock.name, query))
      .filter(m => !type || m.statblock.creature_type === type)
      .filter(m => test(crValue(m.statblock.cr)))
      .sort((a, b) => crValue(a.statblock.cr) - crValue(b.statblock.cr) || a.statblock.name.localeCompare(b.statblock.name))
  }, [source, srdReady, srd, bestiary, query, type, band])

  const field = inputClassName
    ?? 'bg-[#1A1714] border border-[rgba(212,160,23,0.25)] rounded-[9px] px-3 py-2 text-[14px] text-[#F5F0E8] placeholder:text-[#A8A09B] focus:outline-none focus:border-[#D4A017]'

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
            className={`px-3 py-1.5 text-[12px] font-semibold cursor-pointer ${source === s ? 'bg-[#D4A017] text-[#131110]' : 'text-[#E8DFD0] bg-white/5'}`}
          >
            {s === 'custom' ? t('gm.myMonsters') : t('gm.srdCatalog')}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2">
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder={t('gm.search')} aria-label={t('gm.search')} className={field} />
        <select value={type} onChange={e => setType(e.target.value)} aria-label={t('gm.filterType')} className={field}>
          <option value="">{t('gm.allTypes')}</option>
          {CREATURE_TYPES.map(c => <option key={c} value={c}>{t(`gm.creatureTypes.${c}`)}</option>)}
        </select>
        <select value={band} onChange={e => setBand(e.target.value as typeof band)} aria-label={t('gm.filterCr')} className={field}>
          {CR_BANDS.map(b => <option key={b.id} value={b.id}>{b.label ? `${t('gm.filterCr')} ${b.label}` : t('gm.anyCr')}</option>)}
        </select>
      </div>

      {source === 'srd' && !srdReady ? (
        <p className="text-sm text-[#A8A09B] py-6 text-center">{t('gm.loadingCatalog')}</p>
      ) : results.length === 0 ? (
        <p className="text-sm text-[#A8A09B] py-6 text-center">
          {source === 'custom' && bestiary.length === 0 ? t('gm.noMonstersHint') : t('gm.noMatches')}
        </p>
      ) : (
        <>
          <p className="text-[11px] text-[#A8A09B]">{t('gm.resultsCount', { n: results.length })}</p>
          <div className="flex flex-col gap-2">
            {results.slice(0, PAGE).map(m => (
              <MonsterRow key={m.id} block={m.statblock} onClick={onPick ? () => onPick(m) : undefined} actions={actions?.(m)} />
            ))}
          </div>
        </>
      )}

      {source === 'srd' && (
        <p className="text-[10px] leading-snug text-[#A8A09B] mt-2">{t('gm.srdAttribution')}</p>
      )}
    </div>
  )
}
