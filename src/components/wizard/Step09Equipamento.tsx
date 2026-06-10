import { useState } from 'react'
import { useFichaStore } from '../../store/fichaStore'
import { WizardNav } from './WizardNav'
import { calcCargaMaxima } from '../../lib/calculos'
import dadosJson from '../../data/dnd_dados.json'
import type { DadosJogo, ItemInventario } from '../../types'

const dados = dadosJson as unknown as DadosJogo

export function Step09Equipamento() {
  const { ficha, setEquipamento, setPasso } = useFichaStore()
  const [opcao, setOpcao] = useState<'A' | 'B'>('A')
  const classeId = ficha.identidade.classe_id
  const classe = dados.classes.find(c => c.id === classeId)
  const forVal = ficha.atributos.FOR.valor ?? 10
  const cargaMax = calcCargaMaxima(forVal)
  const pesoAtual = ficha.inventario.itens.reduce((a, it) => a + (it.peso_kg ?? 0) * it.quantidade, 0)
  const porcentCarga = Math.min(100, (pesoAtual / cargaMax) * 100)

  function escolherOpcaoA() {
    if (!classe) return
    const itens: ItemInventario[] = [{
      id_item: 'kit_opcao_a',
      nome: classe.equipamento_inicial.A,
      categoria: 'Kit',
      quantidade: 1,
      equipado: false,
      custo_po: null,
      peso_kg: null,
      notas: null,
    }]
    setEquipamento('A', itens)
    setOpcao('A')
  }

  function escolherOpcaoB() {
    setEquipamento('B', [])
    setOpcao('B')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cinzel text-2xl font-bold text-[#F5F0E8] mb-1">Equipamento</h2>
        <p className="text-[#A8A09B] text-sm">Escolha o equipamento inicial.</p>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-xs text-[#A8A09B]">Capacidade de carga:</span>
        <div className="flex-1 max-w-xs">
          <div className="h-2 bg-[#2D2520] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${porcentCarga > 80 ? 'bg-red-500' : porcentCarga > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
              style={{ width: `${porcentCarga}%` }}
            />
          </div>
          <span className="text-xs text-[#A8A09B]">{pesoAtual.toFixed(1)} / {cargaMax} kg</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          onClick={escolherOpcaoA}
          className={`cursor-pointer rounded-lg border p-4 transition-all ${opcao === 'A' ? 'border-[#7B1D1D] bg-[#4D2020]' : 'border-[#B8860B]/30 bg-[#3D332D] hover:border-[#B8860B]/60'}`}
        >
          <h3 className="font-cinzel font-bold text-[#F5F0E8] mb-2">Opção A — Kit de Classe</h3>
          <p className="text-sm text-[#A8A09B] leading-relaxed">{classe?.equipamento_inicial.A ?? '—'}</p>
        </div>

        <div
          onClick={escolherOpcaoB}
          className={`cursor-pointer rounded-lg border p-4 transition-all ${opcao === 'B' ? 'border-[#7B1D1D] bg-[#4D2020]' : 'border-[#B8860B]/30 bg-[#3D332D] hover:border-[#B8860B]/60'}`}
        >
          <h3 className="font-cinzel font-bold text-[#F5F0E8] mb-2">Opção B — Moedas</h3>
          <p className="text-sm text-[#A8A09B] leading-relaxed">{classe?.equipamento_inicial.B ?? '—'}</p>
          <p className="text-xs text-[#B8860B] mt-2">Compre seu equipamento livremente.</p>
        </div>
      </div>

      {opcao === 'B' && dados.armas && (
        <div className="bg-[#3D332D] border border-[#B8860B]/20 rounded-lg p-4">
          <h3 className="font-cinzel font-semibold text-[#B8860B] mb-3">Armas Disponíveis (amostra)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
            {dados.armas.slice(0, 18).map(a => (
              <div key={a.id} className="text-xs p-2 bg-[#2D2520] rounded">
                <div className="text-[#F5F0E8] font-medium">{a.nome}</div>
                <div className="text-[#A8A09B]">{a.dano} {a.tipo_dano}</div>
                {a.custo_po && <div className="text-[#B8860B]">{a.custo_po} PO</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      <WizardNav onBack={() => setPasso(8)} onNext={() => setPasso(10)} />
    </div>
  )
}
