import { useTranslation } from 'react-i18next'
import { useConfigStore } from '../../store/configStore'
import { itemRarityKey } from '../../data/items'
import type { InventoryItem } from '../../types'
import type { Item } from '../../data/items'

/** Cor da tarja por tipo de item do catálogo (`item_type`). */
const BADGE_COLOR: Record<string, string> = {
  arma:        'bg-red-900/40 text-red-300 border-red-700/40',
  armadura:    'bg-blue-900/40 text-blue-300 border-blue-700/40',
  ferramenta:  'bg-yellow-900/40 text-yellow-300 border-yellow-700/40',
  kit:         'bg-green-900/40 text-green-300 border-green-700/40',
  equipamento: 'bg-stone-700/50 text-stone-300 border-stone-500/40',
  transporte:  'bg-orange-900/40 text-orange-300 border-orange-700/40',
  item_magico: 'bg-purple-900/40 text-purple-300 border-purple-700/40',
}

/** Cor da tarja de raridade — escala visual crescente. */
const RARITY_COLOR: Record<string, string> = {
  common:    'bg-[#2D2520] text-[#A8A09B] border-[#A8A09B]/30',
  uncommon:  'bg-green-900/40 text-green-300 border-green-700/40',
  rare:      'bg-blue-900/40 text-blue-300 border-blue-700/40',
  very_rare: 'bg-purple-900/40 text-purple-300 border-purple-700/40',
  legendary: 'bg-amber-900/40 text-amber-300 border-amber-600/50',
  artifact:  'bg-red-900/40 text-red-300 border-red-600/50',
  varies:    'bg-[#2D2520] text-[#A8A09B] border-[#A8A09B]/30',
}

function subtitle(item: Item): string | null {
  const parts: string[] = [item.category]
  if (item.item_type === 'arma') parts.push(item.type)
  return parts.filter(Boolean).join(' · ') || null
}

interface Props {
  item: InventoryItem
  index: number
  displayedName: string
  catalogItem?: Item
  coins: { PO: number }
  onEquipToggle: () => void
  onQtyChange: (n: number) => void
  onSell?: () => void
  onRemove: () => void
  onShowDetails?: () => void
}

export function InventoryItemRow({ item, displayedName, catalogItem, onEquipToggle, onQtyChange, onSell, onRemove, onShowDetails }: Props) {
  const { t } = useTranslation()
  const { config } = useConfigStore()

  const typeKey = catalogItem?.item_type ?? item.category ?? null
  const badgeColor = typeKey ? BADGE_COLOR[typeKey] : null
  const badgeLabel = typeKey
    ? (badgeColor ? t(`bag.type_${typeKey}`) : typeKey)
    : null

  const rarity = itemRarityKey(catalogItem)
  const sub = catalogItem ? subtitle(catalogItem) : null
  const damage = catalogItem?.item_type === 'arma' ? `${catalogItem.damage} ${catalogItem.damage_type}` : null
  const ac = catalogItem?.item_type === 'armadura' ? `CA ${catalogItem.ac}` : null

  return (
    <div className={`rounded-lg border px-3 py-2.5 transition-colors ${
      item.equipped
        ? 'bg-[#3D2020] border-[#7B1D1D]/60'
        : 'bg-[#2D2520] border-[#B8860B]/15 hover:border-[#B8860B]/35'
    }`}>

      {/* Cabeçalho */}
      <div className="flex items-start gap-2.5">
        {/* Equip toggle */}
        <button
          type="button"
          onClick={onEquipToggle}
          aria-pressed={item.equipped}
          aria-label={item.equipped ? t('inventory.unequip', { name: displayedName }) : t('inventory.equip', { name: displayedName })}
          className="mt-0.5 w-4 h-4 rounded-sm border-2 flex-shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B] transition-colors"
          style={{
            backgroundColor: item.equipped ? '#B8860B' : 'transparent',
            borderColor: item.equipped ? '#B8860B' : '#A8A09B',
          }}
        />

        {/* Nome + info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#F5F0E8] leading-tight">{displayedName}</p>
          {sub && <p className="text-[10px] text-[#A8A09B] mt-0.5 leading-tight">{sub}</p>}
          {(damage ?? ac) && (
            <p className="text-[10px] text-[#B8860B] font-semibold mt-0.5">{damage ?? ac}</p>
          )}
        </div>

        {/* Tarjas: raridade só existe em itens mágicos */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {badgeLabel && (
            <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border ${badgeColor ?? 'bg-[#2D2520] text-[#A8A09B] border-[#A8A09B]/30'}`}>
              {badgeLabel}
            </span>
          )}
          {rarity && (
            <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border ${RARITY_COLOR[rarity]}`}>
              {t(`inventory.rarity_${rarity}`)}
            </span>
          )}
        </div>

        {/* Detalhes */}
        {onShowDetails && (
          <button
            type="button"
            onClick={onShowDetails}
            aria-label={t('edit.viewDetails', { name: displayedName })}
            title={t('inventory.detailsTitle')}
            className="w-6 h-6 shrink-0 flex items-center justify-center text-[11px] text-[#A8A09B] hover:text-[#F5F0E8] border border-[#B8860B]/20 hover:border-[#B8860B]/50 rounded-full transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]"
          >
            ℹ
          </button>
        )}
      </div>

      {/* Controles */}
      <div className="flex items-center gap-2 mt-2 ml-6">
        {/* Quantidade */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => onQtyChange(Math.max(1, item.quantity - 1))}
            className="w-5 h-5 rounded-l bg-[#3D332D] border border-[#B8860B]/20 text-[#A8A09B] hover:text-[#F5F0E8] hover:bg-[#4D433D] transition-colors text-xs cursor-pointer focus-visible:outline-none flex items-center justify-center"
          >−</button>
          <input
            type="number"
            min={1}
            value={item.quantity}
            onChange={e => onQtyChange(Math.max(1, parseInt(e.target.value) || 1))}
            aria-label={t('inventory.itemQtyAriaLabel', { name: displayedName })}
            className="w-9 text-center bg-[#3D332D] border-y border-[#B8860B]/20 text-[#F5F0E8] text-xs focus:outline-none focus:bg-[#4D433D]"
          />
          <button
            type="button"
            onClick={() => onQtyChange(item.quantity + 1)}
            className="w-5 h-5 rounded-r bg-[#3D332D] border border-[#B8860B]/20 text-[#A8A09B] hover:text-[#F5F0E8] hover:bg-[#4D433D] transition-colors text-xs cursor-pointer focus-visible:outline-none flex items-center justify-center"
          >+</button>
        </div>

        {/* Peso */}
        {config.track_weight && item.weight_kg != null && (
          <span className="text-[10px] text-[#A8A09B]">{item.weight_kg} {t('bag.kg')}</span>
        )}

        {/* Custo */}
        {item.cost_gp != null && (
          <span className="text-[10px] text-[#A8A09B]">{item.cost_gp} po</span>
        )}

        <div className="flex-1" />

        {/* Vender */}
        {onSell && item.cost_gp != null && (
          <button
            type="button"
            onClick={onSell}
            title={t('inventory.sellTitle', { n: (item.cost_gp * item.quantity).toFixed(1) })}
            aria-label={t('inventory.sellAriaLabel', { name: displayedName, n: (item.cost_gp * item.quantity).toFixed(1) })}
            className="px-2 py-0.5 text-[10px] font-semibold rounded border cursor-pointer transition-colors focus-visible:outline-none text-[#B8860B] border-[#B8860B]/40 hover:bg-[#B8860B]/15 hover:border-[#B8860B]/70"
          >
            {t('inventory.sellLabel')}
          </button>
        )}

        {/* Perder */}
        <button
          type="button"
          onClick={onRemove}
          aria-label={t('inventory.loseAriaLabel', { name: displayedName })}
          title={t('inventory.loseTitle')}
          className="px-2 py-0.5 text-[10px] font-semibold rounded border cursor-pointer transition-colors focus-visible:outline-none text-red-400/70 border-red-700/30 hover:bg-red-900/20 hover:text-red-300 hover:border-red-600/50"
        >
          {t('inventory.loseLabel')}
        </button>
      </div>
    </div>
  )
}
