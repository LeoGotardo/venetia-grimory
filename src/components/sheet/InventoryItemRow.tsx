import { useTranslation } from 'react-i18next'
import { useConfigStore } from '../../store/configStore'
import type { InventoryItem } from '../../types'
import type { Item } from '../../data/items'

const BADGE: Record<string, { color: string; label: string }> = {
  weapon:        { color: 'bg-red-900/40 text-red-300 border-red-700/40',       label: 'Arma' },
  armor:    { color: 'bg-blue-900/40 text-blue-300 border-blue-700/40',    label: 'Armadura' },
  tool:  { color: 'bg-yellow-900/40 text-yellow-300 border-yellow-700/40', label: 'Ferramenta' },
  kit:         { color: 'bg-green-900/40 text-green-300 border-green-700/40', label: 'Kit' },
  transport:  { color: 'bg-orange-900/40 text-orange-300 border-orange-700/40', label: 'Transporte' },
  magic_item: { color: 'bg-purple-900/40 text-purple-300 border-purple-700/40', label: 'Mágico' },
}

function subtitle(cat: Item): string | null {
  const parts: string[] = []
  if ('categoria' in cat) parts.push(String(cat.category))
  if ('tipo' in cat) parts.push(String((cat as { type: string }).type))
  if ('raridade' in cat) parts.push(String((cat as { rarity: string }).rarity))
  return parts.length ? parts.join(' · ') : null
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
}

export function InventoryItemRow({ item, displayedName, catalogItem, coins, onEquipToggle, onQtyChange, onSell, onRemove }: Props) {
  const { t } = useTranslation()
  const { config } = useConfigStore()

  const typeKey = item.category ?? catalogItem?.item_type ?? null
  const badge = typeKey ? (BADGE[typeKey] ?? null) : null

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
            borderColor: item.equipped ? '#B8860B' : '#6B6560',
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

        {/* Badge */}
        {badge && (
          <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border flex-shrink-0 ${badge.color}`}>
            {badge.label}
          </span>
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
