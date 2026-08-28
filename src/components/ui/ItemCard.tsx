import { useTranslation } from 'react-i18next'
import { Modal } from './Modal'
import type { Armor } from '../../types'

interface Weapon {
  id: string
  name: string
  category: string
  damage: string
  damage_type: string
  maestria?: string
  properties: string[]
  cost_gp?: number
  weight_kg?: number
}

interface AdventuringGear {
  id: string
  name: string
  category: string
  notes?: string
  cost_gp?: number
  weight_kg?: number
}

export type KitItem = {
  _type: 'kit'
  id: string
  name: string
  cost_gp?: number
  weight_kg?: number
  content?: string[]
}

export type ToolItem = {
  _type: 'ferramenta'
  id: string
  name: string
  cost_gp?: number
  weight_kg?: number
  ability?: string
}

export type ItemDetail =
  | (Armor & { _type: 'armadura' })
  | (Weapon & { _type: 'arma' })
  | (AdventuringGear & { _type: 'equipamento' })
  | KitItem
  | ToolItem

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#B8860B]/15 border border-[#B8860B]/30 text-[#D4A017]">
      {children}
    </span>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-[#A8A09B] shrink-0 w-36">{label}</span>
      <span className="text-[#F5F0E8]">{value}</span>
    </div>
  )
}

function CostRow({ cost_gp, weight_kg }: { cost_gp?: number | null; weight_kg?: number | null }) {
  const { t } = useTranslation()
  if (!cost_gp && !weight_kg) return null
  return (
    <div className="flex gap-3 text-sm">
      {cost_gp != null && cost_gp > 0 && (
        <span className="text-[#B8860B] font-medium">{cost_gp} {t('bag.gp')}</span>
      )}
      {weight_kg != null && weight_kg > 0 && (
        <span className="text-[#A8A09B]">{weight_kg} {t('bag.kg')}</span>
      )}
    </div>
  )
}

interface ItemCardProps {
  item: ItemDetail | null
  onClose: () => void
}

export function ItemCard({ item, onClose }: ItemCardProps) {
  const { t } = useTranslation()
  if (!item) return null

  const getCategoryLabel = () => {
    switch (item._type) {
      case 'armadura': return item.category
      case 'arma': return item.category
      case 'kit': return t('bag.typeKit')
      case 'ferramenta': return t('bag.typeTool')
      case 'equipamento': return (item as AdventuringGear).category
      default: return ''
    }
  }

  return (
    <Modal open={!!item} onClose={onClose}>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h3 className="font-cinzel font-bold text-xl text-[#F5F0E8] mb-2">{item.name}</h3>
          <div className="flex flex-wrap gap-1.5">
            <Tag>{getCategoryLabel()}</Tag>
          </div>
        </div>

        <hr className="border-[#B8860B]/20" />

        {/* Fields by type */}
        {item._type === 'armadura' && (
          <div className="space-y-2">
            <Row label={t('inventory.armorClass')} value={<span className="font-bold text-[#D4A017]">{item.ac}</span>} />
            {item.str_requirement && (
              <Row label={t('inventory.strengthReq')} value={`${item.str_requirement}`} />
            )}
            {item.stealth_penalty && (
              <Row label={t('inventory.stealth')} value={<span className="text-red-400">{t('inventory.penalty')}</span>} />
            )}
            <CostRow cost_gp={item.cost_gp} weight_kg={item.weight_kg} />
          </div>
        )}

        {item._type === 'arma' && (
          <div className="space-y-2">
            <Row
              label={t('inventory.damage')}
              value={
                <span>
                  <span className="font-bold text-[#D4A017]">{item.damage}</span>
                  <span className="text-[#A8A09B] ml-1">{item.damage_type}</span>
                </span>
              }
            />
            {item.maestria && (
              <Row label={t('inventory.attribute')} value={item.maestria} />
            )}
            {item.properties.length > 0 && (
              <Row
                label={t('inventory.properties')}
                value={
                  <div className="flex flex-wrap gap-1">
                    {item.properties.map(p => (
                      <span key={p} className="text-xs px-2 py-0.5 rounded bg-[#2D2520] border border-[#B8860B]/20 text-[#A8A09B]">{p}</span>
                    ))}
                  </div>
                }
              />
            )}
            <CostRow cost_gp={item.cost_gp} weight_kg={item.weight_kg} />
          </div>
        )}

        {item._type === 'equipamento' && (
          <div className="space-y-2">
            {item.notes && (
              <p className="text-sm text-[#C8C0BA] leading-relaxed">{item.notes}</p>
            )}
            <CostRow cost_gp={item.cost_gp} weight_kg={item.weight_kg} />
          </div>
        )}

        {item._type === 'kit' && (
          <div className="space-y-2">
            {item.content && item.content.length > 0 && (
              <div>
                <p className="text-xs text-[#A8A09B] mb-2">{t('inventory.content')}</p>
                <ul className="space-y-0.5">
                  {item.content.map((c, i) => (
                    <li key={i} className="text-sm text-[#F5F0E8] flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-[#B8860B] shrink-0" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <CostRow cost_gp={item.cost_gp} weight_kg={item.weight_kg} />
          </div>
        )}

        {item._type === 'ferramenta' && (
          <div className="space-y-2">
            {item.ability && (
              <Row label={t('inventory.attribute')} value={item.ability} />
            )}
            <CostRow cost_gp={item.cost_gp} weight_kg={item.weight_kg} />
          </div>
        )}
      </div>
    </Modal>
  )
}
