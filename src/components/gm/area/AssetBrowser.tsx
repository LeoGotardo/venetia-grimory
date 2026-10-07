import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { STAMPS, STAMP_CATEGORIES, stampUrl, type StampCategory } from '../../../data/areaMap/stamps'

interface AssetBrowserProps {
  selected: string | null
  onPick: (assetId: string | null) => void
}

const chip = (active: boolean) =>
  `shrink-0 rounded-full px-3 min-h-[34px] text-[12px] font-semibold border cursor-pointer transition-colors ${
    active ? 'bg-[#D4A017] text-[#131110] border-[#D4A017]' : 'bg-white/5 text-[#E8DFD0] border-white/[0.1] hover:bg-white/10'
  }`

/** Catálogo de stamps: busca pelo nome no idioma atual e filtro por categoria. */
export function AssetBrowser({ selected, onPick }: AssetBrowserProps) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<StampCategory | null>(null)

  const visible = useMemo(() => {
    const q = query.trim().toLocaleLowerCase()
    return STAMPS.filter(s =>
      (!category || s.category === category)
      && (!q || t(`gm.areaMap.stamps.${s.id}`).toLocaleLowerCase().includes(q)))
  }, [query, category, t])

  return (
    <div className="flex flex-col gap-3 min-h-0">
      <input
        type="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder={t('gm.areaMap.searchAssets')}
        aria-label={t('gm.areaMap.searchAssets')}
        className="w-full bg-[#131110] border border-white/[0.1] rounded-[9px] px-3 py-2 text-[14px] text-[#F5F0E8] placeholder:text-[#A8A09B] focus:outline-none focus:border-[#D4A017]"
      />
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1">
        <button type="button" onClick={() => setCategory(null)} className={chip(category === null)}>{t('gm.areaMap.allCategories')}</button>
        {STAMP_CATEGORIES.map(c => (
          <button key={c} type="button" onClick={() => setCategory(c === category ? null : c)} className={chip(category === c)}>
            {t(`gm.areaMap.categories.${c}`)}
          </button>
        ))}
      </div>
      {visible.length === 0 ? (
        <p className="text-[13px] text-[#A8A09B] py-4 text-center">{t('gm.areaMap.noAssets')}</p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(72px,1fr))] gap-1.5">
          {visible.map(s => {
            const active = selected === s.id
            const name = t(`gm.areaMap.stamps.${s.id}`)
            return (
              <button
                key={s.id}
                type="button"
                data-testid={`asset-${s.id}`}
                aria-pressed={active}
                title={name}
                onClick={() => onPick(active ? null : s.id)}
                className={`flex flex-col items-center gap-1 rounded-[10px] p-1.5 border cursor-pointer transition-colors ${
                  active ? 'bg-[rgba(212,160,23,0.16)] border-[#D4A017]' : 'bg-white/[0.03] border-white/[0.07] hover:border-[rgba(212,160,23,0.45)]'
                }`}
              >
                <img src={stampUrl(s)} alt="" className="w-full h-[48px] object-contain" draggable={false} />
                <span className="w-full text-[11px] leading-tight text-[#E8DFD0] truncate">{name}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
