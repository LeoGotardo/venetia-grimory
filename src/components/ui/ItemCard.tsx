import { useTranslation } from 'react-i18next'
import { Modal } from './Modal'
import type { Armor } from '../../types'
import type { Item } from '../../data/items'
import { itemRarityKey } from '../../data/items'

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

/**
 * A modal aceita duas formas de item: `ItemDetail` (armaduras do dataset de
 * regras, que a aba Editar usa) e `Item` (catálogo de `src/data/items`, com
 * preço e peso em texto). Ambas são normalizadas para o mesmo modelo de
 * exibição antes de renderizar.
 */
export type ItemCardInput = ItemDetail | Item

interface DetailRow {
  label: string
  value: React.ReactNode
}

interface ItemView {
  name: string
  tags: string[]
  rows: DetailRow[]
  bullets?: { label: string; items: string[] }
  cost: string | null
  weight: string | null
  description: string | null
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#B8860B]/15 border border-[#B8860B]/30 text-[#D4A017]">
      {children}
    </span>
  )
}

function Row({ label, value }: DetailRow) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-[#A8A09B] shrink-0 w-36">{label}</span>
      <span className="text-[#F5F0E8]">{value}</span>
    </div>
  )
}

function Chips({ values }: { values: string[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {values.map(v => (
        <span key={v} className="text-xs px-2 py-0.5 rounded bg-[#2D2520] border border-[#B8860B]/20 text-[#A8A09B]">{v}</span>
      ))}
    </div>
  )
}

function Damage({ dice, type }: { dice: string; type?: string }) {
  return (
    <span>
      <span className="font-bold text-[#D4A017]">{dice}</span>
      {type && <span className="text-[#A8A09B] ml-1">{type}</span>}
    </span>
  )
}

type Translate = (key: string, options?: Record<string, unknown>) => string

const isCatalogItem = (item: ItemCardInput): item is Item => 'item_type' in item

/** Formata custo/peso do dataset de regras, que já vêm numéricos. */
function num(value: number | null | undefined, unit: string): string | null {
  return value != null && value > 0 ? `${value} ${unit}` : null
}

function viewFromCatalog(item: Item, t: Translate): ItemView {
  const base = {
    name: item.name,
    cost: item.price && item.price !== '—' ? item.price : null,
    description: item.description || null,
  }
  const weight = 'weight' in item && item.weight ? item.weight : null

  switch (item.item_type) {
    case 'arma':
      return {
        ...base,
        weight,
        tags: [item.category, item.type],
        rows: [
          { label: t('inventory.damage'), value: <Damage dice={item.damage} type={item.damage_type} /> },
          ...(item.mastery ? [{ label: t('inventory.mastery'), value: item.mastery }] : []),
          ...(item.properties.length
            ? [{ label: t('inventory.properties'), value: <Chips values={item.properties} /> }]
            : []),
        ],
      }
    case 'armadura':
      return {
        ...base,
        weight,
        tags: [item.category],
        rows: [
          { label: t('inventory.armorClass'), value: <span className="font-bold text-[#D4A017]">{item.ac}</span> },
          ...(item.min_strength ? [{ label: t('inventory.strengthReq'), value: `${item.min_strength}` }] : []),
          ...(item.stealth_disadvantage
            ? [{ label: t('inventory.stealth'), value: <span className="text-red-400">{t('inventory.penalty')}</span> }]
            : []),
        ],
      }
    case 'ferramenta':
    case 'equipamento':
      return { ...base, weight, tags: [item.category], rows: [] }
    case 'kit':
      return {
        ...base,
        weight,
        tags: [item.category],
        rows: [],
        bullets: { label: t('inventory.content'), items: item.included_items },
      }
    case 'transporte':
      return {
        ...base,
        weight,
        tags: [item.category],
        rows: [
          ...(item.speed ? [{ label: t('inventory.speed'), value: item.speed }] : []),
          ...(item.carry_capacity ? [{ label: t('inventory.carryCapacity'), value: item.carry_capacity }] : []),
        ],
      }
    case 'item_magico': {
      const rarity = itemRarityKey(item)
      return {
        ...base,
        weight: null,
        tags: [item.category, rarity ? t(`inventory.rarity_${rarity}`) : item.rarity],
        rows: [
          ...(item.attunement
            ? [{ label: t('inventory.attunement'), value: t('inventory.attunementRequired') }]
            : []),
          ...(item.effect ? [{ label: t('inventory.effect'), value: item.effect }] : []),
        ],
      }
    }
  }
}

function viewFromDetail(item: ItemDetail, t: Translate): ItemView {
  const base = {
    name: item.name,
    cost: num(item.cost_gp, t('bag.gp')),
    weight: num(item.weight_kg, t('bag.kg')),
    description: null,
  }

  switch (item._type) {
    case 'armadura':
      return {
        ...base,
        tags: [item.category],
        rows: [
          { label: t('inventory.armorClass'), value: <span className="font-bold text-[#D4A017]">{item.ac}</span> },
          ...(item.str_requirement ? [{ label: t('inventory.strengthReq'), value: `${item.str_requirement}` }] : []),
          ...(item.stealth_penalty
            ? [{ label: t('inventory.stealth'), value: <span className="text-red-400">{t('inventory.penalty')}</span> }]
            : []),
        ],
      }
    case 'arma':
      return {
        ...base,
        tags: [item.category],
        rows: [
          { label: t('inventory.damage'), value: <Damage dice={item.damage} type={item.damage_type} /> },
          ...(item.maestria ? [{ label: t('inventory.attribute'), value: item.maestria }] : []),
          ...(item.properties.length
            ? [{ label: t('inventory.properties'), value: <Chips values={item.properties} /> }]
            : []),
        ],
      }
    case 'equipamento':
      return { ...base, tags: [item.category], rows: [], description: item.notes ?? null }
    case 'kit':
      return {
        ...base,
        tags: [t('bag.type_kit')],
        rows: [],
        bullets: item.content?.length ? { label: t('inventory.content'), items: item.content } : undefined,
      }
    case 'ferramenta':
      return {
        ...base,
        tags: [t('bag.type_ferramenta')],
        rows: item.ability ? [{ label: t('inventory.attribute'), value: item.ability }] : [],
      }
  }
}

interface ItemCardProps {
  item: ItemCardInput | null
  onClose: () => void
}

export function ItemCard({ item, onClose }: ItemCardProps) {
  const { t } = useTranslation()
  if (!item) return null

  const view = isCatalogItem(item) ? viewFromCatalog(item, t) : viewFromDetail(item, t)
  const hasBody = view.rows.length > 0 || view.bullets || view.cost || view.weight

  return (
    <Modal open={!!item} onClose={onClose}>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h3 className="font-cinzel font-bold text-xl text-[#F5F0E8] mb-2">{view.name}</h3>
          <div className="flex flex-wrap gap-1.5">
            {view.tags.filter(Boolean).map(tag => <Tag key={tag}>{tag}</Tag>)}
          </div>
        </div>

        <hr className="border-[#B8860B]/20" />

        {hasBody && (
          <div className="space-y-2">
            {view.rows.map(r => <Row key={r.label} label={r.label} value={r.value} />)}

            {view.bullets && view.bullets.items.length > 0 && (
              <div>
                <p className="text-xs text-[#A8A09B] mb-2">{view.bullets.label}</p>
                <ul className="space-y-0.5">
                  {view.bullets.items.map((c, i) => (
                    <li key={i} className="text-sm text-[#F5F0E8] flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-[#B8860B] shrink-0" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(view.cost ?? view.weight) && (
              <div className="flex gap-3 text-sm">
                {view.cost && <span className="text-[#B8860B] font-medium">{view.cost}</span>}
                {view.weight && <span className="text-[#A8A09B]">{view.weight}</span>}
              </div>
            )}
          </div>
        )}

        {/* Descrição completa */}
        {view.description ? (
          <>
            <hr className="border-[#B8860B]/20" />
            <p className="text-sm text-[#C8C0BA] leading-relaxed whitespace-pre-line">{view.description}</p>
          </>
        ) : (
          !hasBody && <p className="text-xs text-[#A8A09B] italic">{t('inventory.noDescription')}</p>
        )}
      </div>
    </Modal>
  )
}
