import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useFichaStore } from '../../store/fichaStore'
import { WizardNav } from './WizardNav'
import { MochilaBusca } from '../ui/MochilaBusca'
import dadosJson from '../../data/dnd_dados.json'
import type { DadosJogo, ItemInventario } from '../../types'

const dados = dadosJson as unknown as DadosJogo

function parseOuroInicial(texto: string): number {
  const m = texto.match(/(\d+)\s*PO/i)
  return m ? parseInt(m[1]) : 0
}

export function Step10Equipamento() {
  const { ficha, setEquipamento, updateMoedas, setPasso } = useFichaStore()
  const { t } = useTranslation()
  const [opcao, setOpcao] = useState<'A' | 'B'>('A')

  const classeId = ficha.identidade.classe_id
  const classe = dados.classes.find(c => c.id === classeId)

  function escolherOpcaoA() {
    if (!classe) return
    const itens: ItemInventario[] = [{
      id_item: 'kit_opcao_a',
      nome: classe.equipamento_inicial.A,
      categoria: 'kit',
      quantidade: 1,
      equipado: false,
      custo_po: null,
      peso_kg: null,
      notas: null,
    }]
    setEquipamento('A', itens)
    updateMoedas({ PO: 0 })
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

      <WizardNav onBack={() => setPasso(9)} onNext={() => setPasso(11)} />
    </div>
  )
}
