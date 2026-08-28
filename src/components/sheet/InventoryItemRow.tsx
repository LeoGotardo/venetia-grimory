import { useTranslation } from 'react-i18next'
import { useConfigStore } from '../../store/configStore'
import type { ItemInventario } from '../../types'
import type { Item } from '../../data/itens'

const BADGE: Record<string, { cor: string; label: string }> = {
  arma:        { cor: 'bg-red-900/40 text-red-300 border-red-700/40',       label: 'Arma' },
  armadura:    { cor: 'bg-blue-900/40 text-blue-300 border-blue-700/40',    label: 'Armadura' },
  ferramenta:  { cor: 'bg-yellow-900/40 text-yellow-300 border-yellow-700/40', label: 'Ferramenta' },
  kit:         { cor: 'bg-green-900/40 text-green-300 border-green-700/40', label: 'Kit' },
  transporte:  { cor: 'bg-orange-900/40 text-orange-300 border-orange-700/40', label: 'Transporte' },
  item_magico: { cor: 'bg-purple-900/40 text-purple-300 border-purple-700/40', label: 'Mágico' },
}

function subtitulo(cat: Item): string | null {
  const parts: string[] = []
  if ('categoria' in cat) parts.push(String(cat.categoria))
  if ('tipo' in cat) parts.push(String((cat as { tipo: string }).tipo))
  if ('raridade' in cat) parts.push(String((cat as { raridade: string }).raridade))
  return parts.length ? parts.join(' · ') : null
}

interface Props {
  item: ItemInventario
  index: number
  nomeExibido: string
  catalogItem?: Item
  moedas: { PO: number }
  onEquipToggle: () => void
  onQtdChange: (n: number) => void
  onSell?: () => void
  onRemove: () => void
}

export function InventarioItem({ item, nomeExibido, catalogItem, moedas, onEquipToggle, onQtdChange, onSell, onRemove }: Props) {
  const { t } = useTranslation()
  const { config } = useConfigStore()

  const tipoKey = item.categoria ?? catalogItem?.tipo_item ?? null
  const badge = tipoKey ? (BADGE[tipoKey] ?? null) : null

  const sub = catalogItem ? subtitulo(catalogItem) : null
  const dano = catalogItem?.tipo_item === 'arma' ? `${catalogItem.dano} ${catalogItem.tipo_dano}` : null
  const ca = catalogItem?.tipo_item === 'armadura' ? `CA ${catalogItem.ca}` : null

  return (
    <div className={`rounded-lg border px-3 py-2.5 transition-colors ${
      item.equipado
        ? 'bg-[#3D2020] border-[#7B1D1D]/60'
        : 'bg-[#2D2520] border-[#B8860B]/15 hover:border-[#B8860B]/35'
    }`}>

      {/* Cabeçalho */}
      <div className="flex items-start gap-2.5">
        {/* Equip toggle */}
        <button
          type="button"
          onClick={onEquipToggle}
          aria-pressed={item.equipado}
          aria-label={item.equipado ? t('inventory.unequip', { nome: nomeExibido }) : t('inventory.equip', { nome: nomeExibido })}
          className="mt-0.5 w-4 h-4 rounded-sm border-2 flex-shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B] transition-colors"
          style={{
            backgroundColor: item.equipado ? '#B8860B' : 'transparent',
            borderColor: item.equipado ? '#B8860B' : '#6B6560',
          }}
        />

        {/* Nome + info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#F5F0E8] leading-tight">{nomeExibido}</p>
          {sub && <p className="text-[10px] text-[#A8A09B] mt-0.5 leading-tight">{sub}</p>}
          {(dano ?? ca) && (
            <p className="text-[10px] text-[#B8860B] font-semibold mt-0.5">{dano ?? ca}</p>
          )}
        </div>

        {/* Badge */}
        {badge && (
          <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border flex-shrink-0 ${badge.cor}`}>
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
            onClick={() => onQtdChange(Math.max(1, item.quantidade - 1))}
            className="w-5 h-5 rounded-l bg-[#3D332D] border border-[#B8860B]/20 text-[#A8A09B] hover:text-[#F5F0E8] hover:bg-[#4D433D] transition-colors text-xs cursor-pointer focus-visible:outline-none flex items-center justify-center"
          >−</button>
          <input
            type="number"
            min={1}
            value={item.quantidade}
            onChange={e => onQtdChange(Math.max(1, parseInt(e.target.value) || 1))}
            aria-label={t('inventory.itemQtyAriaLabel', { nome: nomeExibido })}
            className="w-9 text-center bg-[#3D332D] border-y border-[#B8860B]/20 text-[#F5F0E8] text-xs focus:outline-none focus:bg-[#4D433D]"
          />
          <button
            type="button"
            onClick={() => onQtdChange(item.quantidade + 1)}
            className="w-5 h-5 rounded-r bg-[#3D332D] border border-[#B8860B]/20 text-[#A8A09B] hover:text-[#F5F0E8] hover:bg-[#4D433D] transition-colors text-xs cursor-pointer focus-visible:outline-none flex items-center justify-center"
          >+</button>
        </div>

        {/* Peso */}
        {config.rastrear_peso && item.peso_kg != null && (
          <span className="text-[10px] text-[#A8A09B]">{item.peso_kg} {t('bag.kg')}</span>
        )}

        {/* Custo */}
        {item.custo_po != null && (
          <span className="text-[10px] text-[#A8A09B]">{item.custo_po} po</span>
        )}

        <div className="flex-1" />

        {/* Vender */}
        {onSell && item.custo_po != null && (
          <button
            type="button"
            onClick={onSell}
            title={t('inventory.sellTitle', { n: (item.custo_po * item.quantidade).toFixed(1) })}
            aria-label={t('inventory.sellAriaLabel', { nome: nomeExibido, n: (item.custo_po * item.quantidade).toFixed(1) })}
            className="px-2 py-0.5 text-[10px] font-semibold rounded border cursor-pointer transition-colors focus-visible:outline-none text-[#B8860B] border-[#B8860B]/40 hover:bg-[#B8860B]/15 hover:border-[#B8860B]/70"
          >
            {t('inventory.sellLabel')}
          </button>
        )}

        {/* Perder */}
        <button
          type="button"
          onClick={onRemove}
          aria-label={t('inventory.loseAriaLabel', { nome: nomeExibido })}
          title={t('inventory.loseTitle')}
          className="px-2 py-0.5 text-[10px] font-semibold rounded border cursor-pointer transition-colors focus-visible:outline-none text-red-400/70 border-red-700/30 hover:bg-red-900/20 hover:text-red-300 hover:border-red-600/50"
        >
          {t('inventory.loseLabel')}
        </button>
      </div>
    </div>
  )
}
