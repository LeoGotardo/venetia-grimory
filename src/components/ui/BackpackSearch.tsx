import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSheetStore } from '../../store/sheetStore'
import { useConfigStore } from '../../store/configStore'
import { ItemCard } from './ItemCard'
import { getItems, itemRarityKey, RARITY_KEYS, type RarityKey } from '../../data/items'
import type { Item } from '../../data/items'
import type { InventoryItem } from '../../types'
import { calcMaxCarry } from '../../lib/calculations'

type FilterType = 'todos' | 'arma' | 'armadura' | 'ferramenta' | 'equipamento' | 'kit' | 'transporte' | 'item_magico'
/** Só itens mágicos têm raridade, então o filtro só faz sentido sobre eles. */
type RarityFilter = 'todas' | RarityKey

/** Quantos itens a lista renderiza de uma vez. O catálogo tem centenas. */
const RESULT_LIMIT = 60

function parsePrice(price: string): number | null {
  if (!price || price === '—') return null
  const m = price.match(/([\d.,]+)\s*(po|pp|pc)/i)
  if (!m) return null
  const val = parseFloat(m[1].replace(',', '.'))
  const unit = m[2].toLowerCase()
  if (unit === 'pp') return +(val * 0.1).toFixed(4)
  if (unit === 'pc') return +(val * 0.01).toFixed(4)
  return val
}

function parseWeight(item: Item): number | null {
  const raw = (item as unknown as Record<string, unknown>).weight
  if (typeof raw !== 'string') return null
  const m = raw.match(/([\d.,]+)/)
  return m ? parseFloat(m[1].replace(',', '.')) : null
}

function itemToInventory(item: Item): InventoryItem {
  return {
    item_id: item.id,
    name: null,
    category: null,
    quantity: 1,
    equipped: false,
    uses_spent: null,
    cost_gp: parsePrice(item.price),
    weight_kg: parseWeight(item),
    notes: null,
  }
}

function subtitle(item: Item, t: (key: string, options?: Record<string, unknown>) => string): string {
  switch (item.item_type) {
    case 'arma':        return `${item.category} · ${item.type} · ${item.damage} ${item.damage_type}`
    case 'armadura':    return `${item.category} · CA ${item.ac}`
    case 'ferramenta':  return item.category
    case 'equipamento': return item.category
    case 'kit':         return `${t('bag.type_kit')} · ${item.weight}`
    case 'transporte':  return `${item.category}${item.speed ? ` · ${item.speed}` : ''}`
    case 'item_magico': {
      const rarity = itemRarityKey(item)
      const label = rarity ? t(`inventory.rarity_${rarity}`) : item.rarity
      return `${label}${item.attunement ? ' · ' + t('bag.attunement') : ''}`
    }
    default:            return ''
  }
}

/** Chaveado por `item_type` do catálogo. */
const BADGE_COLOR: Record<string, string> = {
  arma:        'bg-red-900/30 text-red-300 border-red-900/40',
  armadura:    'bg-blue-900/30 text-blue-300 border-blue-900/40',
  ferramenta:  'bg-amber-900/30 text-amber-300 border-amber-900/40',
  equipamento: 'bg-stone-700/40 text-stone-300 border-stone-500/40',
  kit:         'bg-green-900/30 text-green-300 border-green-900/40',
  transporte:  'bg-purple-900/30 text-purple-300 border-purple-900/40',
  item_magico: 'bg-pink-900/30 text-pink-300 border-pink-900/40',
}


interface BackpackSearchProps {
  /** Omite a lista de itens da mochila — use quando o pai já exibe o inventário */
  noList?: boolean
  /** Deduz o custo em PO ao adicionar e bloqueia itens inacessíveis */
  chargeItem?: boolean
}

export function BackpackSearch({ noList = false, chargeItem = false }: BackpackSearchProps) {
  const { sheet, addItem, removeItem, updateItem, updateCoins } = useSheetStore()
  const { config } = useConfigStore()
  const { t, i18n } = useTranslation()
  const [search, setSearch] = useState('')
  const [filtro, setFiltro] = useState<FilterType>('todos')
  const [raridade, setRaridade] = useState<RarityFilter>('todas')
  const [detailItem, setDetailItem] = useState<Item | null>(null)

  const itemMap = useMemo(() => {
    const map = new Map<string, Item>()
    getItems().forEach(i => map.set(i.id, i))
    return map
  // eslint-disable-next-line react-hooks/exhaustive-deps -- os getters leem i18n.language na chamada; a dep refaz o memo na troca de idioma
  }, [i18n.language])

  const FILTROS: { id: FilterType; label: string }[] = [
    { id: 'todos',       label: t('bag.filterAll') },
    { id: 'arma',        label: t('bag.filterWeapons') },
    { id: 'armadura',    label: t('bag.filterArmors') },
    { id: 'ferramenta',  label: t('bag.filterTools') },
    { id: 'equipamento', label: t('bag.filterGear') },
    { id: 'kit',         label: t('bag.filterKits') },
    { id: 'transporte',  label: t('bag.filterTransport') },
    { id: 'item_magico', label: t('bag.filterMagic') },
  ]

  const TIPO_LABEL: Record<string, string> = {
    arma: t('bag.type_arma'), armadura: t('bag.type_armadura'), ferramenta: t('bag.type_ferramenta'),
    equipamento: t('bag.type_equipamento'), kit: t('bag.type_kit'),
    transporte: t('bag.type_transporte'), item_magico: t('bag.type_item_magico'),
  }

  const efetivoCobrar = chargeItem && config.manage_gold

  const strVal = sheet.abilities.FOR.value ?? 10
  const maxCarry = calcMaxCarry(strVal)
  const currentWeight = sheet.inventory.items.reduce((a, it) => a + (it.weight_kg ?? 0) * it.quantity, 0)
  const carryPercent = Math.min(100, (currentWeight / maxCarry) * 100)

  const encontrados = useMemo(() => {
    const term = search.toLowerCase().trim()
    return getItems().filter(item => {
      if (filtro !== 'todos' && item.item_type !== filtro) return false
      // A raridade é comparada pela chave canônica, então o filtro não muda de
      // comportamento quando o catálogo troca de idioma.
      if (raridade !== 'todas' && itemRarityKey(item) !== raridade) return false
      if (!term) return true
      return item.name.toLowerCase().includes(term) || item.description.toLowerCase().includes(term)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps -- os getters leem i18n.language na chamada; a dep refaz o memo na troca de idioma
  }, [search, filtro, raridade, i18n.language])

  // A lista inteira são centenas de itens: mostra uma página e diz quantos ficaram
  // de fora, para a busca não parecer vazia nem travar a rolagem.
  const resultados = encontrados.slice(0, RESULT_LIMIT)

  function selecionarTipo(id: FilterType) {
    setFiltro(id)
    // Sair dos itens mágicos deixaria um filtro de raridade invisível ativo.
    if (id !== 'item_magico') setRaridade('todas')
  }

  function selecionarRaridade(r: RarityFilter) {
    setRaridade(r)
    // Raridade só existe em item mágico: escolher uma já leva para essa aba.
    if (r !== 'todas') setFiltro('item_magico')
  }

  function adicionarItem(item: Item) {
    if (efetivoCobrar) {
      const custo = parsePrice(item.price) ?? 0
      if (custo > sheet.inventory.coins.PO) return
      updateCoins({ PO: +(sheet.inventory.coins.PO - custo).toFixed(4) })
    }
    const idx = sheet.inventory.items.findIndex(it => it.item_id === item.id)
    if (idx >= 0) {
      updateItem(idx, { quantity: sheet.inventory.items[idx].quantity + 1 })
    } else {
      addItem(itemToInventory(item))
    }
  }

  return (
    <div className="space-y-4">

      {/* Barra de carga + saldo PO. Com `noList` quem mostra a carga é o pai. */}
      {((config.track_weight && !noList) || efetivoCobrar) && (
        <div className="flex items-center gap-3">
          {config.track_weight && !noList && (
            <>
              <span className="text-xs text-[#A8A09B] shrink-0">{t('bag.load')}</span>
              <div className="flex-1 h-1.5 bg-[#2D2520] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    carryPercent > 80 ? 'bg-red-500' : carryPercent > 50 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${carryPercent}%` }}
                />
              </div>
              <span className="text-xs text-[#A8A09B] shrink-0 tabular-nums">
                {currentWeight.toFixed(1)}/{maxCarry} {t('bag.kg')}
              </span>
            </>
          )}
          {efetivoCobrar && (
            <span className={`text-xs font-semibold text-[#B8860B] shrink-0 tabular-nums ${!config.track_weight || noList ? 'ml-auto' : ''}`}>
              {sheet.inventory.coins.PO.toFixed(1)} {t('bag.gp')}
            </span>
          )}
        </div>
      )}

      {/* Busca */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A09B] text-sm pointer-events-none">⌕</span>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('bag.searchPlaceholder')}
          className="w-full bg-[#2D2520] border border-[#B8860B]/30 rounded-lg pl-8 pr-3 py-2 text-[#F5F0E8] text-sm placeholder:text-[#A8A09B] focus:outline-none focus:ring-1 focus:ring-[#B8860B]"
          aria-label={t('bag.searchAriaLabel')}
        />
      </div>

      {/* Filtros */}
      <div className="flex gap-1 overflow-x-auto pb-0.5" role="tablist" aria-label={t('bag.filterAriaLabel')}>
        {FILTROS.map(f => (
          <button
            key={f.id}
            role="tab"
            aria-selected={filtro === f.id}
            onClick={() => selecionarTipo(f.id)}
            className={[
              'px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]',
              filtro === f.id
                ? 'bg-[#B8860B] text-[#1A1612]'
                : 'bg-[#2D2520] text-[#A8A09B] hover:text-[#F5F0E8]',
            ].join(' ')}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Raridade — só itens mágicos têm, e escolher uma já muda para essa aba */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] uppercase tracking-wide text-[#A8A09B] shrink-0">
          {t('bag.rarityLabel')}
        </span>
        <div
          className="flex gap-1 overflow-x-auto pb-0.5"
          role="tablist"
          aria-label={t('bag.rarityAriaLabel')}
        >
          {(['todas', ...RARITY_KEYS] as RarityFilter[]).map(r => (
            <button
              key={r}
              role="tab"
              aria-selected={raridade === r}
              onClick={() => selecionarRaridade(r)}
              className={[
                'px-3 py-1 text-xs font-medium rounded-full border transition-colors whitespace-nowrap cursor-pointer',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]',
                raridade === r
                  ? 'bg-[#B8860B]/20 border-[#B8860B] text-[#D4A017]'
                  : 'bg-[#2D2520] border-[#B8860B]/20 text-[#A8A09B] hover:text-[#F5F0E8] hover:border-[#B8860B]/50',
              ].join(' ')}
            >
              {r === 'todas' ? t('bag.rarityAll') : t(`inventory.rarity_${r}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Resultados */}
      <div className="space-y-1">
        <p className="text-[11px] text-[#A8A09B]">
          {encontrados.length > RESULT_LIMIT
            ? t('bag.resultCountCapped', { n: resultados.length, total: encontrados.length })
            : t('bag.resultCount', { n: encontrados.length })}
        </p>
        <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
          {resultados.length === 0 ? (
            <p className="text-xs text-[#A8A09B] py-2 text-center">{t('bag.noItems')}</p>
          ) : (
            resultados.map(item => {
              const insufficientFunds = efetivoCobrar && (parsePrice(item.price) ?? 0) > sheet.inventory.coins.PO
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-2 bg-[#2D2520] rounded-lg px-3 py-2 group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-sm font-medium ${insufficientFunds ? 'text-[#A8A09B]' : 'text-[#F5F0E8]'}`}>{item.name}</span>
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold border ${BADGE_COLOR[item.item_type]}`}>
                        {TIPO_LABEL[item.item_type]}
                      </span>
                    </div>
                    <div className="text-xs text-[#A8A09B] truncate">{subtitle(item, t)}</div>
                    <div className={`text-xs ${insufficientFunds ? 'text-red-400/70' : 'text-[#B8860B]'}`}>{item.price}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDetailItem(item)}
                    aria-label={t('edit.viewDetails', { name: item.name })}
                    title={t('inventory.detailsTitle')}
                    className="w-7 h-7 shrink-0 flex items-center justify-center rounded-full border border-[#B8860B]/20 text-[#A8A09B] hover:text-[#F5F0E8] hover:border-[#B8860B]/50 text-xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]"
                  >
                    ℹ
                  </button>
                  <button
                    type="button"
                    onClick={() => adicionarItem(item)}
                    disabled={insufficientFunds}
                    aria-label={insufficientFunds ? t('bag.insufficientGold', { name: item.name }) : t('bag.addItem', { name: item.name })}
                    title={insufficientFunds ? t('bag.insufficientGoldTitle') : undefined}
                    className={[
                      'w-7 h-7 shrink-0 flex items-center justify-center rounded-full border font-bold text-base leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]',
                      insufficientFunds
                        ? 'bg-[#2D2520] border-[#A8A09B]/20 text-[#A8A09B]/30 cursor-not-allowed'
                        : 'bg-[#B8860B]/10 border-[#B8860B]/30 text-[#D4A017] hover:bg-[#B8860B]/30 hover:border-[#B8860B] cursor-pointer',
                    ].join(' ')}
                  >
                    +
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Mochila atual — omitida quando pai já exibe inventário */}
      {!noList && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#B8860B] font-medium">{t('bag.bagSection')}</span>
            <span className="text-xs text-[#A8A09B]">
              {sheet.inventory.items.length === 1
                ? t('bag.itemCount_one', { n: sheet.inventory.items.length })
                : t('bag.itemCount_other', { n: sheet.inventory.items.length })}
            </span>
          </div>

          {sheet.inventory.items.length === 0 ? (
            <p className="text-xs text-[#A8A09B] py-2">
              {t('bag.emptyBag')}
            </p>
          ) : (
            <div className="space-y-1">
              {sheet.inventory.items.map((item, idx) => {
                const catalogItem = item.item_id ? itemMap.get(item.item_id) : null
                const displayedName = catalogItem?.name ?? item.name ?? '—'
                const tipoLabel = catalogItem ? (TIPO_LABEL[catalogItem.item_type] ?? catalogItem.item_type) : (TIPO_LABEL[item.category ?? ''] ?? item.category ?? '')
                return (
                <div key={idx} className="flex items-center gap-2 bg-[#2D2520] rounded-lg px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-[#F5F0E8] font-medium truncate">{displayedName}</div>
                    <div className="text-xs text-[#A8A09B]">
                      {tipoLabel}
                      {config.track_weight && item.weight_kg ? ` · ${(item.weight_kg * item.quantity).toFixed(1)} ${t('bag.kg')}` : ''}
                      {item.cost_gp ? ` · ${item.cost_gp} ${t('bag.gp')}` : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        item.quantity <= 1
                          ? removeItem(idx)
                          : updateItem(idx, { quantity: item.quantity - 1 })
                      }
                      aria-label={t('bag.decreaseQty')}
                      className="w-6 h-6 flex items-center justify-center rounded bg-[#3D332D] border border-[#B8860B]/20 text-[#A8A09B] hover:text-[#F5F0E8] hover:border-[#B8860B]/50 transition-colors cursor-pointer text-sm font-bold"
                    >−</button>
                    <span className="w-5 text-center text-xs text-[#F5F0E8] font-medium tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateItem(idx, { quantity: item.quantity + 1 })}
                      aria-label={t('bag.increaseQty')}
                      className="w-6 h-6 flex items-center justify-center rounded bg-[#3D332D] border border-[#B8860B]/20 text-[#A8A09B] hover:text-[#F5F0E8] hover:border-[#B8860B]/50 transition-colors cursor-pointer text-sm font-bold"
                    >+</button>
                    {config.sale_refund && item.cost_gp !== null && (
                      <button
                        type="button"
                        onClick={() => {
                          updateCoins({ PO: +(sheet.inventory.coins.PO + item.cost_gp! * item.quantity).toFixed(4) })
                          removeItem(idx)
                        }}
                        title={t('bag.sellFor', { n: (item.cost_gp * item.quantity).toFixed(1) })}
                        aria-label={t('bag.sellAriaLabel', { name: displayedName, n: (item.cost_gp * item.quantity).toFixed(1) })}
                        className="w-6 h-6 flex items-center justify-center rounded bg-[#3D332D] border border-[#B8860B]/30 text-[#B8860B]/60 hover:text-[#B8860B] hover:border-[#B8860B] transition-colors cursor-pointer text-[9px] font-bold ml-1"
                      >{t('bag.sellBtn')}</button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      aria-label={t('bag.spendAriaLabel', { name: displayedName })}
                      title={t('bag.spendTitle')}
                      className="w-6 h-6 flex items-center justify-center rounded bg-[#3D332D] border border-red-900/20 text-red-500/50 hover:text-red-400 hover:border-red-900/50 transition-colors cursor-pointer text-xs"
                    >✕</button>
                  </div>
                </div>
              )})}
            </div>
          )}
        </div>
      )}

      <ItemCard item={detailItem} onClose={() => setDetailItem(null)} />
    </div>
  )
}
