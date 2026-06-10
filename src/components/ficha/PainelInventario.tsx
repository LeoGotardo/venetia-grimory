import { useState } from 'react'
import { useFichaStore } from '../../store/fichaStore'
import { calcCargaMaxima, calcTotalPO } from '../../lib/calculos'
import Button from '../ui/Button'
import type { ItemInventario } from '../../types'

const MOEDAS = ['PC', 'PP', 'PE', 'PO', 'PL'] as const

export function PainelInventario() {
  const { ficha, updateMoedas, addItem, removeItem, updateItem } = useFichaStore()
  const { moedas, itens } = ficha.inventario
  const [novoNome, setNovoNome] = useState('')
  const forVal = ficha.atributos.FOR.valor ?? 10
  const cargaMax = calcCargaMaxima(forVal)
  const pesoAtual = itens.reduce((a, it) => a + (it.peso_kg ?? 0) * it.quantidade, 0)
  const porcentCarga = Math.min(100, (pesoAtual / cargaMax) * 100)
  const totalPO = calcTotalPO(moedas)

  function addItemSimples() {
    if (!novoNome.trim()) return
    const item: ItemInventario = {
      id_item: null,
      nome: novoNome,
      categoria: 'Misc',
      quantidade: 1,
      equipado: false,
      custo_po: null,
      peso_kg: null,
      notas: null,
    }
    addItem(item)
    setNovoNome('')
  }

  return (
    <div className="space-y-4">
      {/* Moedas */}
      <section aria-label="Moedas">
        <h4 className="font-cinzel font-semibold text-[#B8860B] mb-2">Moedas</h4>
        <div className="grid grid-cols-5 gap-2">
          {MOEDAS.map(m => (
            <div key={m} className="flex flex-col items-center gap-1">
              <label htmlFor={`moeda-${m}`} className="text-xs text-[#A8A09B]">{m}</label>
              <input
                id={`moeda-${m}`}
                type="number"
                min={0}
                value={moedas[m]}
                onChange={e => updateMoedas({ [m]: Math.max(0, parseInt(e.target.value) || 0) })}
                className="w-full text-center bg-[#2D2520] border border-[#B8860B]/30 rounded px-1 py-1.5 text-[#F5F0E8] text-sm focus:outline-none focus:ring-1 focus:ring-[#B8860B]"
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-right text-[#A8A09B] mt-1">
          Total: <span className="text-[#B8860B] font-semibold">{totalPO.toFixed(2)} PO</span>
        </p>
      </section>

      {/* Carga */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-[#A8A09B]">Carga: {pesoAtual.toFixed(1)} / {cargaMax} kg</span>
          <span className={`text-xs ${porcentCarga > 80 ? 'text-red-400' : 'text-[#A8A09B]'}`}>
            {porcentCarga.toFixed(0)}%
          </span>
        </div>
        <div
          className="h-2 bg-[#2D2520] rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={pesoAtual}
          aria-valuemax={cargaMax}
          aria-label="Capacidade de carga"
        >
          <div
            className={`h-full rounded-full transition-all ${porcentCarga > 80 ? 'bg-red-500' : porcentCarga > 50 ? 'bg-yellow-500' : 'bg-green-600'}`}
            style={{ width: `${porcentCarga}%` }}
          />
        </div>
      </div>

      {/* Itens */}
      <section aria-label="Itens do inventário">
        <h4 className="font-cinzel font-semibold text-[#B8860B] mb-2">Itens</h4>
        <div className="space-y-1 mb-3">
          {itens.length === 0 && (
            <p className="text-xs text-[#A8A09B] text-center py-4 border border-dashed border-[#B8860B]/20 rounded-lg">
              Nenhum item no inventário.
            </p>
          )}
          {itens.map((it, idx) => (
            // Composite key: nome + categoria + idx evita reorder bugs com idx puro
            <div
              key={`${it.nome}_${it.categoria}_${idx}`}
              className={`flex items-center gap-2 px-2 py-1.5 rounded ${it.equipado ? 'bg-[#3D2020] border border-[#7B1D1D]/20' : 'bg-[#2D2520]'}`}
            >
              <button
                onClick={() => updateItem(idx, { equipado: !it.equipado })}
                aria-pressed={it.equipado}
                aria-label={it.equipado ? `Desequipar ${it.nome}` : `Equipar ${it.nome}`}
                className="w-3 h-3 rounded-sm border flex-shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B] focus-visible:ring-offset-1 focus-visible:ring-offset-[#2D2520]"
                style={{ backgroundColor: it.equipado ? '#B8860B' : 'transparent', borderColor: it.equipado ? '#B8860B' : '#A8A09B' }}
              />
              <span className="text-sm text-[#F5F0E8] flex-1 min-w-0 truncate">{it.nome}</span>
              <input
                type="number"
                min={1}
                value={it.quantidade}
                onChange={e => updateItem(idx, { quantidade: Math.max(1, parseInt(e.target.value) || 1) })}
                aria-label={`Quantidade de ${it.nome}`}
                className="w-12 text-center bg-transparent border-b border-[#B8860B]/20 text-[#F5F0E8] text-sm focus:outline-none focus:border-[#B8860B]"
              />
              {it.peso_kg && <span className="text-xs text-[#A8A09B]">{it.peso_kg}kg</span>}
              <button
                onClick={() => removeItem(idx)}
                aria-label={`Remover ${it.nome} do inventário`}
                className="text-[#A8A09B] hover:text-red-400 transition-colors text-sm cursor-pointer w-5 h-5 flex items-center justify-center flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B] rounded"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={novoNome}
            onChange={e => setNovoNome(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItemSimples()}
            placeholder="Nome do item..."
            aria-label="Nome do novo item"
            className="flex-1 bg-[#2D2520] border border-[#B8860B]/30 rounded px-2 py-1.5 text-[#F5F0E8] text-sm focus:outline-none focus:ring-1 focus:ring-[#B8860B] placeholder:text-[#A8A09B]"
          />
          <Button size="sm" onClick={addItemSimples} disabled={!novoNome.trim()} aria-label="Adicionar item">
            + Adicionar
          </Button>
        </div>
      </section>
    </div>
  )
}
