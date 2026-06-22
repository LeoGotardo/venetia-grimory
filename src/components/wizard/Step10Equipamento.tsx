import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useFichaStore } from '../../store/fichaStore'
import { WizardNav } from './WizardNav'
import { MochilaBusca } from '../ui/MochilaBusca'
import type { ItemInventario } from '../../types'
import { dados } from '../../data/dados'
import { getItens } from '../../data/itens'
import type { Item } from '../../data/itens'

function normStr(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\(.*?\)/g, '')
    .trim()
}

function buscarNoCatalogo(nome: string, catalogo: Item[]): Item | undefined {
  const n = normStr(nome)
  return catalogo.find(it => {
    const c = normStr(it.nome)
    return c === n || c === n.replace(/s$/, '') || c + 's' === n || c === n + 's'
  })
}

function parsePO(preco: string): number | null {
  const m = preco.match(/([\d.,]+)\s*(po|gp)/i)
  return m ? parseFloat(m[1].replace(',', '.')) : null
}

function parsePeso(peso: string | undefined): number | null {
  if (!peso) return null
  const m = peso.match(/([\d.,]+)\s*kg/i)
  return m ? parseFloat(m[1].replace(',', '.')) : null
}

function parsearEquipamentoA(texto: string, catalogo: Item[]): { itens: ItemInventario[]; ouro: number } {
  const partes = texto.split(',').map(p => p.trim()).filter(Boolean)
  const itensParsed: ItemInventario[] = []
  let ouro = 0

  for (const parte of partes) {
    // Ouro: "15 PO", "75 PO"
    const poMatch = parte.match(/^(\d+(?:[.,]\d+)?)\s*PO$/i)
    if (poMatch) {
      ouro += parseFloat(poMatch[1].replace(',', '.'))
      continue
    }

    // Quantidade inicial: "4 Machadinhas", "2 Adagas"
    const qtyMatch = parte.match(/^(\d+)\s+(.+)$/)
    const quantidade = qtyMatch ? parseInt(qtyMatch[1]) : 1
    const nomeRaw = qtyMatch ? qtyMatch[2] : parte

    const found = buscarNoCatalogo(nomeRaw, catalogo)

    itensParsed.push({
      id_item: found?.id ?? null,
      nome: found ? null : nomeRaw,
      categoria: found?.tipo_item ?? null,
      quantidade,
      equipado: false,
      custo_po: found ? parsePO(found.preco) : null,
      peso_kg: found ? parsePeso((found as { peso?: string }).peso) : null,
      notas: null,
    })
  }

  return { itens: itensParsed, ouro }
}

function parseOuroInicial(texto: string): number {
  const m = texto.match(/(\d+)\s*PO/i)
  return m ? parseInt(m[1]) : 0
}

export function Step10Equipamento() {
  const { ficha, setEquipamento, updateMoedas, setPasso } = useFichaStore()
  const { t, i18n } = useTranslation()
  const [opcao, setOpcao] = useState<'A' | 'B'>('A')

  const catalogo = useMemo(() => getItens(), [i18n.language])

  const classeId = ficha.identidade.classe_id
  const classe = dados.classes.find(c => c.id === classeId)

  function escolherOpcaoA() {
    if (!classe) return
    const { itens, ouro } = parsearEquipamentoA(classe.equipamento_inicial.A, catalogo)
    setEquipamento('A', itens)
    if (ouro > 0) updateMoedas({ PO: ouro })
    setOpcao('A')
  }

  function escolherOpcaoB() {
    const ouro = parseOuroInicial(classe?.equipamento_inicial.B ?? '')
    setEquipamento('B', [])
    updateMoedas({ PO: ouro })
    setOpcao('B')
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
          onClick={escolherOpcaoA}
          className={`cursor-pointer rounded-lg border p-4 transition-all ${opcao === 'A' ? 'border-[#7B1D1D] bg-[#4D2020]' : 'border-[#B8860B]/30 bg-[#3D332D] hover:border-[#B8860B]/60'}`}
        >
          <h3 className="font-cinzel font-bold text-[#F5F0E8] mb-2">{t('step10.optionA')}</h3>
          <p className="text-sm text-[#A8A09B] leading-relaxed">{classe?.equipamento_inicial.A ?? '—'}</p>
        </div>

        <div
          onClick={escolherOpcaoB}
          className={`cursor-pointer rounded-lg border p-4 transition-all ${opcao === 'B' ? 'border-[#7B1D1D] bg-[#4D2020]' : 'border-[#B8860B]/30 bg-[#3D332D] hover:border-[#B8860B]/60'}`}
        >
          <h3 className="font-cinzel font-bold text-[#F5F0E8] mb-2">{t('step10.optionB')}</h3>
          <p className="text-sm text-[#A8A09B] leading-relaxed">{classe?.equipamento_inicial.B ?? '—'}</p>
          <p className="text-xs text-[#B8860B] mt-2">{t('step10.optionBHint')}</p>
        </div>
      </div>

      {/* Mochila com busca — disponível apenas na Opção B */}
      {opcao === 'B' && (
        <div className="bg-[#3D332D] border border-[#B8860B]/20 rounded-xl p-4">
          <h3 className="font-cinzel font-semibold text-[#B8860B] text-sm mb-4 pb-2 border-b border-[#B8860B]/20">
            {t('step10.bagHeading')}
          </h3>
          <MochilaBusca cobrarItem />
        </div>
      )}

      <WizardNav onBack={() => setPasso(10)} onNext={() => setPasso(12)} />
    </div>
  )
}
