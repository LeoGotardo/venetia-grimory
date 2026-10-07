import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { STAMPS, STAMP_CATEGORIES, stampUrl } from '../../../data/areaMap/stamps'
import { ICONS, ICON_CATEGORIES, ICONS_LICENSE, iconUrl } from '../../../data/areaMap/icons'

export type AssetKind = 'stamp' | 'icon'
export interface PickedAsset { kind: AssetKind; id: string }

interface AssetBrowserProps {
  selected: PickedAsset | null
  onPick: (asset: PickedAsset | null) => void
}

const chip = (active: boolean) =>
  `shrink-0 rounded-full px-3 min-h-[34px] text-[12px] font-semibold border cursor-pointer transition-colors ${
    active ? 'bg-[#D4A017] text-[#131110] border-[#D4A017]' : 'bg-white/5 text-[#E8DFD0] border-white/[0.1] hover:bg-white/10'
  }`

interface Entry { id: string; category: string; name: string; url: string }

/** Catálogo de objetos (stamps) e ícones: busca pelo nome no idioma atual e filtro por categoria. */
export function AssetBrowser({ selected, onPick }: AssetBrowserProps) {
  const { t } = useTranslation()
  const [kind, setKind] = useState<AssetKind>(selected?.kind ?? 'stamp')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string | null>(null)

  const categories: readonly string[] = kind === 'stamp' ? STAMP_CATEGORIES : ICON_CATEGORIES
  const entries: Entry[] = useMemo(() => kind === 'stamp'
    ? STAMPS.map(s => ({ id: s.id, category: s.category, name: t(`gm.areaMap.stamps.${s.id}`), url: stampUrl(s) }))
    : ICONS.map(i => ({ id: i.id, category: i.category, name: t(`gm.areaMap.icons.${i.id}`), url: iconUrl(i) })),
  [kind, t])

  const visible = useMemo(() => {
    const q = query.trim().toLocaleLowerCase()
    return entries.filter(e => (!category || e.category === category) && (!q || e.name.toLocaleLowerCase().includes(q)))
  }, [entries, query, category])

  function switchKind(next: AssetKind) {
    setKind(next)
    setCategory(null)
  }

  return (
    <div className="flex flex-col gap-3">
      <div role="tablist" className="grid grid-cols-2 gap-1.5">
        {(['stamp', 'icon'] as const).map(k => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={kind === k}
            data-testid={`assets-${k}`}
            onClick={() => switchKind(k)}
            className={`min-h-[38px] rounded-[9px] text-[13px] font-semibold border cursor-pointer transition-colors ${
              kind === k ? 'bg-[rgba(212,160,23,0.16)] border-[#D4A017] text-[#F5F0E8]' : 'bg-white/5 border-white/[0.1] text-[#A8A09B] hover:text-[#E8DFD0]'
            }`}
          >
            {t(k === 'stamp' ? 'gm.areaMap.objects' : 'gm.areaMap.iconsTab')}
          </button>
        ))}
      </div>
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
        {categories.map(c => (
          <button key={c} type="button" onClick={() => setCategory(c === category ? null : c)} className={chip(category === c)}>
            {t(kind === 'stamp' ? `gm.areaMap.categories.${c}` : `gm.areaMap.iconCategories.${c}`)}
          </button>
        ))}
      </div>
      {visible.length === 0 ? (
        <p className="text-[13px] text-[#A8A09B] py-4 text-center">{t('gm.areaMap.noAssets')}</p>
      ) : (
        <div className={`grid gap-1.5 ${kind === 'stamp' ? 'grid-cols-[repeat(auto-fill,minmax(72px,1fr))]' : 'grid-cols-[repeat(auto-fill,minmax(60px,1fr))]'}`}>
          {visible.map(e => {
            const active = selected?.kind === kind && selected.id === e.id
            return (
              <button
                key={e.id}
                type="button"
                data-testid={`${kind === 'stamp' ? 'asset' : 'icone'}-${e.id}`}
                aria-pressed={active}
                title={e.name}
                onClick={() => onPick(active ? null : { kind, id: e.id })}
                className={`flex flex-col items-center gap-1 rounded-[10px] p-1.5 border cursor-pointer transition-colors ${
                  active ? 'bg-[rgba(212,160,23,0.16)] border-[#D4A017]' : 'bg-white/[0.03] border-white/[0.07] hover:border-[rgba(212,160,23,0.45)]'
                }`}
              >
                <img src={e.url} alt="" className={`w-full object-contain ${kind === 'stamp' ? 'h-[48px]' : 'h-[34px]'}`} draggable={false} />
                <span className="w-full text-[11px] leading-tight text-[#E8DFD0] truncate">{e.name}</span>
              </button>
            )
          })}
        </div>
      )}
      {kind === 'icon' && (
        <p className="text-[11px] leading-snug text-[#A8A09B]">
          {t('gm.areaMap.iconsAttribution', { authors: ICONS_LICENSE.authors.join(', ') })}{' '}
          <a href={ICONS_LICENSE.source} target="_blank" rel="noopener noreferrer" className="text-[#D4A017] hover:text-[#E8C25A]">game-icons.net</a>
          {' · '}
          <a href={ICONS_LICENSE.url} target="_blank" rel="noopener noreferrer" className="text-[#D4A017] hover:text-[#E8C25A]">{ICONS_LICENSE.name}</a>
        </p>
      )}
    </div>
  )
}
