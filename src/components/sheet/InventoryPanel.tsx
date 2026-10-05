import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSheetStore } from '../../store/sheetStore'
import { useConfigStore } from '../../store/configStore'
import { calcMaxCarry, calcTotalGp } from '../../lib/calculations'
import { BackpackSearch } from '../ui/BackpackSearch'
import { InventoryItemRow } from './InventoryItemRow'
import { ItemCard } from '../ui/ItemCard'
import { getItems, itemRarityKey, RARITY_KEYS } from '../../data/items'
import type { Item, RarityKey } from '../../data/items'
import type { InventoryItem } from '../../types'

const ALL_COINS = ['PC', 'PP', 'PE', 'PO', 'PL'] as const
const SIMPLE_COINS = ['PO'] as const

/** `all` = sem filtro; `none` = itens sem raridade (tudo que não é mágico). */
type RarityFilter = 'all' | 'none' | RarityKey

export function InventoryPanel() {
  const { sheet, updateCoins, removeItem, updateItem } = useSheetStore()
  const { config } = useConfigStore()
  const { t, i18n } = useTranslation()

  const itemMap = useMemo(() => {
    const map = new Map<string, Item>()
    getItems().forEach(i => map.set(i.id, i))
    return map
  // eslint-disable-next-line react-hooks/exhaustive-deps -- os getters leem i18n.language na chamada; a dep refaz o memo na troca de idioma
  }, [i18n.language])

  const resolveName = (it: InventoryItem): string =>
    (it.item_id ? itemMap.get(it.item_id)?.name : null) ?? it.name ?? '—'
  const [pointBuyMode, setPointBuyMode] = useState(false)
  const [detailItem, setDetailItem] = useState<Item | null>(null)
  const [rarityFilter, setRarityFilter] = useState<RarityFilter>('all')
  const { coins, items } = sheet.inventory
  const COINS = config.simple_coins ? SIMPLE_COINS : ALL_COINS
  const strVal = sheet.abilities.FOR.value ?? 10
  const maxCarry = calcMaxCarry(strVal)
  const currentWeight = items.reduce((a, it) => a + (it.weight_kg ?? 0) * it.quantity, 0)
  const carryPercent = Math.min(100, (currentWeight / maxCarry) * 100)
  const totalGp = calcTotalGp(coins)

  // A raridade vem do catálogo: itens avulsos e não-mágicos caem em `none`.
  const itemRarities = items.map(it => itemRarityKey(it.item_id ? itemMap.get(it.item_id) : undefined))
  const presentRarities = new Set(itemRarities.map(r => r ?? 'none'))
  const rarityOptions: RarityFilter[] = [
    'all',
    ...RARITY_KEYS.filter(r => presentRarities.has(r)),
    ...(presentRarities.has('none') ? (['none'] as RarityFilter[]) : []),
  ]
  // Só vale mostrar o filtro quando ele consegue separar alguma coisa.
  const showRarityFilter = rarityOptions.length > 2
  const visibleItems = items
    .map((it, idx) => ({ it, idx, rarity: itemRarities[idx] ?? 'none' }))
    .filter(e => rarityFilter === 'all' || e.rarity === rarityFilter)

  return (
    <>
      {/* No desktop a lista de itens fica na coluna larga e moedas, carga e loja
          viram uma coluna de apoio, em vez de tudo empilhar. */}
      <div className="space-y-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] lg:gap-6 lg:items-start lg:space-y-0">

        {/* Itens — coluna principal */}
        <section aria-label={t('inventory.items')}>
          <h4 className="font-cinzel font-semibold text-[#B8860B] mb-2">{t('inventory.items')}</h4>
          {showRarityFilter && (
            <div className="flex gap-1 overflow-x-auto pb-0.5 mb-2" role="tablist" aria-label={t('inventory.rarityFilterAriaLabel')}>
              {rarityOptions.map(r => (
                <button
                  key={r}
                  role="tab"
                  aria-selected={rarityFilter === r}
                  onClick={() => setRarityFilter(r)}
                  className={[
                    'px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]',
                    rarityFilter === r
                      ? 'bg-[#B8860B] text-[#1A1612]'
                      : 'bg-[#2D2520] text-[#A8A09B] hover:text-[#F5F0E8]',
                  ].join(' ')}
                >
                  {r === 'all' ? t('inventory.rarityAll') : t(`inventory.rarity_${r}`)}
                </button>
              ))}
            </div>
          )}

          {/* Cards estreitos: a coluna larga do desktop deixava cada item
              esticado demais para o pouco conteúdo que ele mostra. */}
          <div className="space-y-2 mb-3 max-w-[560px]">
            {items.length === 0 && (
              <p className="text-xs text-[#A8A09B] text-center py-4 border border-dashed border-[#B8860B]/20 rounded-lg">
                {t('inventory.noItems')}
              </p>
            )}
            {items.length > 0 && visibleItems.length === 0 && (
              <p className="text-xs text-[#A8A09B] text-center py-4 border border-dashed border-[#B8860B]/20 rounded-lg">
                {t('inventory.noItemsForRarity')}
              </p>
            )}
            {visibleItems.map(({ it, idx }) => {
              const displayedName = resolveName(it)
              const catalogItem = it.item_id ? itemMap.get(it.item_id) : undefined
              return (
                <InventoryItemRow
                  key={`${it.item_id ?? it.name ?? ''}_${idx}`}
                  item={it}
                  index={idx}
                  displayedName={displayedName}
                  catalogItem={catalogItem}
                  coins={coins}
                  onEquipToggle={() => updateItem(idx, { equipped: !it.equipped })}
                  onQtyChange={n => updateItem(idx, { quantity: n })}
                  onSell={it.cost_gp != null ? () => {
                    updateCoins({ PO: +(coins.PO + it.cost_gp! * it.quantity).toFixed(4) })
                    removeItem(idx)
                  } : undefined}
                  onRemove={() => removeItem(idx)}
                  onShowDetails={catalogItem ? () => setDetailItem(catalogItem) : undefined}
                />
              )
            })}
          </div>
        </section>

        <aside className="space-y-4">
        <section aria-label={t('inventory.coins')}>
          <h4 className="font-cinzel font-semibold text-[#B8860B] mb-2">{t('inventory.coins')}</h4>
          <div className="grid grid-cols-5 gap-1 sm:gap-2">
            {COINS.map(m => (
              <div key={m} className="flex flex-col items-center gap-1">
                <label htmlFor={`moeda-${m}`} className="text-xs text-[#A8A09B]">{m}</label>
                <input
                  id={`moeda-${m}`}
                  type="number"
                  min={0}
                  value={coins[m]}
                  onChange={e => updateCoins({ [m]: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="w-full text-center bg-[#2D2520] border border-[#B8860B]/30 rounded px-1 py-1.5 text-[#F5F0E8] text-sm focus:outline-none focus:ring-1 focus:ring-[#B8860B]"
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-right text-[#A8A09B] mt-1">
            <span className="text-[#B8860B] font-semibold">{t('inventory.totalGp', { n: totalGp.toFixed(2) })}</span>
          </p>
        </section>

        {/* Carga */}
        {config.track_weight && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[#A8A09B]">{t('inventory.load', { load: currentWeight.toFixed(1), max: maxCarry })}</span>
              <span className={`text-xs ${carryPercent > 80 ? 'text-red-400' : 'text-[#A8A09B]'}`}>
                {carryPercent.toFixed(0)}%
              </span>
            </div>
            <div
              className="h-2 bg-[#2D2520] rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={currentWeight}
              aria-valuemax={maxCarry}
              aria-label={t('inventory.loadAriaLabel')}
            >
              <div
                className={`h-full rounded-full transition-all ${carryPercent > 80 ? 'bg-red-500' : carryPercent > 50 ? 'bg-yellow-500' : 'bg-green-600'}`}
                style={{ width: `${carryPercent}%` }}
              />
            </div>
          </div>
        )}

          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-[#A8A09B]">{t('inventory.addItem')}</span>
              <div className="flex rounded overflow-hidden border border-[#B8860B]/20">
                <button
                  type="button"
                  onClick={() => setPointBuyMode(false)}
                  aria-pressed={!pointBuyMode}
                  className={[
                    'px-3 py-1 text-xs font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#B8860B]',
                    !pointBuyMode ? 'bg-[#B8860B] text-[#1A1612]' : 'bg-[#2D2520] text-[#A8A09B] hover:text-[#F5F0E8]',
                  ].join(' ')}
                >
                  {t('inventory.free')}
                </button>
                <button
                  type="button"
                  onClick={() => setPointBuyMode(true)}
                  aria-pressed={pointBuyMode}
                  className={[
                    'px-3 py-1 text-xs font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#B8860B]',
                    pointBuyMode ? 'bg-[#B8860B] text-[#1A1612]' : 'bg-[#2D2520] text-[#A8A09B] hover:text-[#F5F0E8]',
                  ].join(' ')}
                >
                  {t('inventory.buy')}
                </button>
              </div>
            </div>
            <BackpackSearch noList chargeItem={pointBuyMode} />
          </div>
        </aside>
      </div>

      <ItemCard item={detailItem} onClose={() => setDetailItem(null)} />
    </>
  )
}
