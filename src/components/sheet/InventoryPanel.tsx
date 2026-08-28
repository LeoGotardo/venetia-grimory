import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useFichaStore } from '../../store/fichaStore'
import { useConfigStore } from '../../store/configStore'
import { calcCargaMaxima, calcTotalPO } from '../../lib/calculos'
import { MochilaBusca } from '../ui/MochilaBusca'
import { InventarioItem } from './InventarioItem'
import { getItens } from '../../data/itens'
import type { Item } from '../../data/itens'
import type { ItemInventario } from '../../types'

const MOEDAS_TODAS = ['PC', 'PP', 'PE', 'PO', 'PL'] as const
const MOEDAS_SIMPLES = ['PO'] as const

export function PainelInventario() {
  const { ficha, updateMoedas, removeItem, updateItem } = useFichaStore()
  const { config } = useConfigStore()
  const { t, i18n } = useTranslation()

  const itemMap = useMemo(() => {
    const map = new Map<string, Item>()
    getItens().forEach(i => map.set(i.id, i))
    return map
  }, [i18n.language])

  const resolveNome = (it: ItemInventario): string =>
    (it.id_item ? itemMap.get(it.id_item)?.nome : null) ?? it.nome ?? '—'
  const [modoCompra, setModoCompra] = useState(false)
  const { moedas, itens } = ficha.inventario
  const MOEDAS = config.moedas_simples ? MOEDAS_SIMPLES : MOEDAS_TODAS
  const forVal = ficha.atributos.FOR.valor ?? 10
  const cargaMax = calcCargaMaxima(forVal)
  const pesoAtual = itens.reduce((a, it) => a + (it.peso_kg ?? 0) * it.quantidade, 0)
  const porcentCarga = Math.min(100, (pesoAtual / cargaMax) * 100)
  const totalPO = calcTotalPO(moedas)

  return (
    <div className="space-y-4">
      {/* Moedas */}
      <section aria-label={t('inventory.coins')}>
        <h4 className="font-cinzel font-semibold text-[#B8860B] mb-2">{t('inventory.coins')}</h4>
        <div className="grid grid-cols-5 gap-1 sm:gap-2">
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
          <span className="text-[#B8860B] font-semibold">{t('inventory.totalGp', { n: totalPO.toFixed(2) })}</span>
        </p>
      </section>

      {/* Carga */}
      {config.rastrear_peso && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-[#A8A09B]">{t('inventory.load', { load: pesoAtual.toFixed(1), max: cargaMax })}</span>
            <span className={`text-xs ${porcentCarga > 80 ? 'text-red-400' : 'text-[#A8A09B]'}`}>
              {porcentCarga.toFixed(0)}%
            </span>
          </div>
          <div
            className="h-2 bg-[#2D2520] rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={pesoAtual}
            aria-valuemax={cargaMax}
            aria-label={t('inventory.loadAriaLabel')}
          >
            <div
              className={`h-full rounded-full transition-all ${porcentCarga > 80 ? 'bg-red-500' : porcentCarga > 50 ? 'bg-yellow-500' : 'bg-green-600'}`}
              style={{ width: `${porcentCarga}%` }}
            />
          </div>
        </div>
      )}

      {/* Itens */}
      <section aria-label={t('inventory.items')}>
        <h4 className="font-cinzel font-semibold text-[#B8860B] mb-2">{t('inventory.items')}</h4>
        <div className="space-y-2 mb-3">
          {itens.length === 0 && (
            <p className="text-xs text-[#A8A09B] text-center py-4 border border-dashed border-[#B8860B]/20 rounded-lg">
              {t('inventory.noItems')}
            </p>
          )}
          {itens.map((it, idx) => {
            const nomeExibido = resolveNome(it)
            const catalogItem = it.id_item ? itemMap.get(it.id_item) : undefined
            return (
              <InventarioItem
                key={`${it.id_item ?? it.nome ?? ''}_${idx}`}
                item={it}
                index={idx}
                nomeExibido={nomeExibido}
                catalogItem={catalogItem}
                moedas={moedas}
                onEquipToggle={() => updateItem(idx, { equipado: !it.equipado })}
                onQtdChange={n => updateItem(idx, { quantidade: n })}
                onSell={it.custo_po != null ? () => {
                  updateMoedas({ PO: +(moedas.PO + it.custo_po! * it.quantidade).toFixed(4) })
                  removeItem(idx)
                } : undefined}

                onRemove={() => removeItem(idx)}
              />
            )
          })}
        </div>

        <div className="border-t border-[#B8860B]/10 pt-3 mt-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-[#A8A09B]">{t('inventory.addItem')}</span>
            <div className="flex rounded overflow-hidden border border-[#B8860B]/20">
              <button
                type="button"
                onClick={() => setModoCompra(false)}
                aria-pressed={!modoCompra}
                className={[
                  'px-3 py-1 text-xs font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#B8860B]',
                  !modoCompra ? 'bg-[#B8860B] text-[#1A1612]' : 'bg-[#2D2520] text-[#A8A09B] hover:text-[#F5F0E8]',
                ].join(' ')}
              >
                {t('inventory.free')}
              </button>
              <button
                type="button"
                onClick={() => setModoCompra(true)}
                aria-pressed={modoCompra}
                className={[
                  'px-3 py-1 text-xs font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#B8860B]',
                  modoCompra ? 'bg-[#B8860B] text-[#1A1612]' : 'bg-[#2D2520] text-[#A8A09B] hover:text-[#F5F0E8]',
                ].join(' ')}
              >
                {t('inventory.buy')}
              </button>
            </div>
          </div>
          <MochilaBusca semLista cobrarItem={modoCompra} />
        </div>
      </section>
    </div>
  )
}
