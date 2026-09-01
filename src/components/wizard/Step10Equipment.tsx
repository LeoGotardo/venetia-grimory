import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSheetStore } from '../../store/sheetStore'
import { WizardNav } from './WizardNav'
import { BackpackSearch } from '../ui/BackpackSearch'
import type { InventoryItem } from '../../types'
import { gameData } from '../../data/rules'
import { getItems } from '../../data/items'
import type { Item } from '../../data/items'

function normStr(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\(.*?\)/g, '')
    .trim()
}

function searchCatalog(name: string, catalog: Item[]): Item | undefined {
  const n = normStr(name)
  return catalog.find(it => {
    const c = normStr(it.name)
    return c === n || c === n.replace(/s$/, '') || c + 's' === n || c === n + 's'
  })
}

function parseGp(price: string): number | null {
  const m = price.match(/([\d.,]+)\s*(po|gp)/i)
  return m ? parseFloat(m[1].replace(',', '.')) : null
}

function parseWeight(weight: string | undefined): number | null {
  if (!weight) return null
  const m = weight.match(/([\d.,]+)\s*kg/i)
  return m ? parseFloat(m[1].replace(',', '.')) : null
}

function parseEquipmentA(text: string, catalog: Item[]): { items: InventoryItem[]; gold: number } {
  const parts = text.split(',').map(p => p.trim()).filter(Boolean)
  const parsedItems: InventoryItem[] = []
  let gold = 0

  for (const part of parts) {
    // Ouro: "15 PO", "75 PO"
    const gpMatch = part.match(/^(\d+(?:[.,]\d+)?)\s*PO$/i)
    if (gpMatch) {
      gold += parseFloat(gpMatch[1].replace(',', '.'))
      continue
    }

    // Quantidade inicial: "4 Machadinhas", "2 Adagas"
    const qtyMatch = part.match(/^(\d+)\s+(.+)$/)
    const quantity = qtyMatch ? parseInt(qtyMatch[1]) : 1
    const rawName = qtyMatch ? qtyMatch[2] : part

    const found = searchCatalog(rawName, catalog)

    parsedItems.push({
      item_id: found?.id ?? null,
      name: found ? null : rawName,
      category: found?.item_type ?? null,
      quantity,
      equipped: false,
      uses_spent: null,
      cost_gp: found ? parseGp(found.price) : null,
      weight_kg: found ? parseWeight((found as { weight?: string }).weight) : null,
      notes: null,
    })
  }

  return { items: parsedItems, gold }
}

function parseStartingGold(text: string): number {
  const m = text.match(/(\d+)\s*PO/i)
  return m ? parseInt(m[1]) : 0
}

export function Step10Equipment() {
  const { sheet, setEquipment, updateCoins, setStep } = useSheetStore()
  const { t, i18n } = useTranslation()
  // Sem hidratar, voltar ao passo mostrava sempre a Opção A marcada — e escondia
  // a mochila de quem tinha escolhido a B.
  const [option, setOption] = useState<'A' | 'B' | null>(() => sheet.identity.equipment_option)

  const catalog = useMemo(() => getItems(), [i18n.language])

  const classId = sheet.identity.class_id
  const charClass = gameData.classes.find(c => c.id === classId)

  function chooseOptionA() {
    if (!charClass) return
    const { items, gold } = parseEquipmentA(charClass.starting_equipment.A, catalog)
    setEquipment('A', items)
    if (gold > 0) updateCoins({ PO: gold })
    setOption('A')
  }

  function chooseOptionB() {
    const gold = parseStartingGold(charClass?.starting_equipment.B ?? '')
    setEquipment('B', [])
    updateCoins({ PO: gold })
    setOption('B')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cinzel text-2xl font-bold text-[#F5F0E8] mb-1">{t('step10.heading')}</h2>
        <p className="text-[#A8A09B] text-sm">{t('step10.subtitle')}</p>
      </div>

      {/* Opções A / B */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          onClick={chooseOptionA}
          className={`cursor-pointer rounded-lg border p-4 transition-all ${option === 'A' ? 'border-[#7B1D1D] bg-[#4D2020]' : 'border-[#B8860B]/30 bg-[#3D332D] hover:border-[#B8860B]/60'}`}
        >
          <h3 className="font-cinzel font-bold text-[#F5F0E8] mb-2">{t('step10.optionA')}</h3>
          <p className="text-sm text-[#A8A09B] leading-relaxed">{charClass?.starting_equipment.A ?? '—'}</p>
        </div>

        <div
          onClick={chooseOptionB}
          className={`cursor-pointer rounded-lg border p-4 transition-all ${option === 'B' ? 'border-[#7B1D1D] bg-[#4D2020]' : 'border-[#B8860B]/30 bg-[#3D332D] hover:border-[#B8860B]/60'}`}
        >
          <h3 className="font-cinzel font-bold text-[#F5F0E8] mb-2">{t('step10.optionB')}</h3>
          <p className="text-sm text-[#A8A09B] leading-relaxed">{charClass?.starting_equipment.B ?? '—'}</p>
          <p className="text-xs text-[#B8860B] mt-2">{t('step10.optionBHint')}</p>
        </div>
      </div>

      {/* Mochila com busca — disponível apenas na Opção B */}
      {option === 'B' && (
        <div className="bg-[#3D332D] border border-[#B8860B]/20 rounded-xl p-4">
          <h3 className="font-cinzel font-semibold text-[#B8860B] text-sm mb-4 pb-2 border-b border-[#B8860B]/20">
            {t('step10.bagHeading')}
          </h3>
          <BackpackSearch chargeItem />
        </div>
      )}

      <WizardNav onBack={() => setStep(10)} onNext={() => setStep(12)} />
    </div>
  )
}
