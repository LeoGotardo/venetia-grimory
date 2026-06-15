import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useFichaStore } from '../../store/fichaStore'
import { useConfigStore } from '../../store/configStore'
import { getItens } from '../../data/itens'
import type { Item } from '../../data/itens'
import type { ItemInventario } from '../../types'
import { calcCargaMaxima } from '../../lib/calculos'

type FiltroTipo = 'todos' | 'arma' | 'armadura' | 'ferramenta' | 'kit' | 'transporte' | 'item_magico'

function parsePreco(preco: string): number | null {
  if (!preco || preco === '—') return null
  const m = preco.match(/([\d.,]+)\s*(po|pp|pc)/i)
  if (!m) return null
  const val = parseFloat(m[1].replace(',', '.'))
  const unit = m[2].toLowerCase()
  if (unit === 'pp') return +(val * 0.1).toFixed(4)
  if (unit === 'pc') return +(val * 0.01).toFixed(4)
  return val
}

function parsePeso(item: Item): number | null {
  const raw = (item as unknown as Record<string, unknown>).peso
  if (typeof raw !== 'string') return null
  const m = raw.match(/([\d.,]+)/)
  return m ? parseFloat(m[1].replace(',', '.')) : null
}

function itemParaInventario(item: Item): ItemInventario {
  return {
    id_item: item.id,
    nome: item.nome,
    categoria: item.tipo_item,
    quantidade: 1,
    equipado: false,
    custo_po: parsePreco(item.preco),
    peso_kg: parsePeso(item),
    notas: null,
  }
}

function subtitulo(item: Item, t: (key: string, options?: any) => string): string {
  switch (item.tipo_item) {
    case 'arma':        return `${item.categoria} · ${item.tipo} · ${item.dano} ${item.tipo_dano}`
    case 'armadura':    return `${item.categoria} · CA ${item.ca}`
    case 'ferramenta':  return item.categoria
    case 'kit':         return `${t('bag.typeKit')} · ${item.peso}`
    case 'transporte':  return `${item.categoria}${item.deslocamento ? ` · ${item.deslocamento}` : ''}`
    case 'item_magico': return `${item.raridade}${item.sintonia ? ' · ' + t('bag.attunement') : ''}`
    default:            return ''
  }
}

const BADGE_COR: Record<string, string> = {
  arma:        'bg-red-900/30 text-red-300 border-red-900/40',
  armadura:    'bg-blue-900/30 text-blue-300 border-blue-900/40',
  ferramenta:  'bg-amber-900/30 text-amber-300 border-amber-900/40',
  kit:         'bg-green-900/30 text-green-300 border-green-900/40',
  transporte:  'bg-purple-900/30 text-purple-300 border-purple-900/40',
  item_magico: 'bg-pink-900/30 text-pink-300 border-pink-900/40',
}


interface MochilaBuscaProps {
  /** Omite a lista de itens da mochila — use quando o pai já exibe o inventário */
  semLista?: boolean
  /** Deduz o custo em PO ao adicionar e bloqueia itens inacessíveis */
  cobrarItem?: boolean
}

export function MochilaBusca({ semLista = false, cobrarItem = false }: MochilaBuscaProps) {
  const { ficha, addItem, removeItem, updateItem, updateMoedas } = useFichaStore()
  const { config } = useConfigStore()
  const { t } = useTranslation()
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState<FiltroTipo>('todos')

  const FILTROS: { id: FiltroTipo; label: string }[] = [
    { id: 'todos',       label: t('bag.filterAll') },
    { id: 'arma',        label: t('bag.filterWeapons') },
    { id: 'armadura',    label: t('bag.filterArmors') },
    { id: 'ferramenta',  label: t('bag.filterTools') },
    { id: 'kit',         label: t('bag.filterKits') },
    { id: 'transporte',  label: t('bag.filterTransport') },
    { id: 'item_magico', label: t('bag.filterMagic') },
  ]

  const TIPO_LABEL: Record<string, string> = {
    arma: t('bag.typeWeapon'), armadura: t('bag.typeArmor'), ferramenta: t('bag.typeTool'),
    kit: t('bag.typeKit'), transporte: t('bag.typeTransport'), item_magico: t('bag.typeMagic'),
  }

  const efetivoCobrar = cobrarItem && config.gerenciar_ouro

  const forVal = ficha.atributos.FOR.valor ?? 10
  const cargaMax = calcCargaMaxima(forVal)
  const pesoAtual = ficha.inventario.itens.reduce((a, it) => a + (it.peso_kg ?? 0) * it.quantidade, 0)
  const porcentCarga = Math.min(100, (pesoAtual / cargaMax) * 100)

  const resultados = useMemo(() => {
    const termo = busca.toLowerCase().trim()
    return getItens().filter(item => {
      const tipoOk = filtro === 'todos' || item.tipo_item === filtro
      if (!tipoOk) return false
      if (filtro === 'todos' && !termo) return false
      if (termo) return item.nome.toLowerCase().includes(termo) || item.descricao.toLowerCase().includes(termo)
      return true
    }).slice(0, 30)
  }, [busca, filtro])

  const mostrarResultados = busca.trim() !== '' || filtro !== 'todos'

  function adicionarItem(item: Item) {
    if (efetivoCobrar) {
      const custo = parsePreco(item.preco) ?? 0
      if (custo > ficha.inventario.moedas.PO) return
      updateMoedas({ PO: +(ficha.inventario.moedas.PO - custo).toFixed(4) })
    }
    const idx = ficha.inventario.itens.findIndex(it => it.id_item === item.id)
    if (idx >= 0) {
      updateItem(idx, { quantidade: ficha.inventario.itens[idx].quantidade + 1 })
    } else {
      addItem(itemParaInventario(item))
    }
  }

  return (
    <div className="space-y-4">

      {/* Barra de carga + saldo PO */}
      {(config.rastrear_peso || efetivoCobrar) && (
        <div className="flex items-center gap-3">
          {config.rastrear_peso && (
            <>
              <span className="text-xs text-[#A8A09B] shrink-0">{t('bag.load')}</span>
              <div className="flex-1 h-1.5 bg-[#2D2520] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    porcentCarga > 80 ? 'bg-red-500' : porcentCarga > 50 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${porcentCarga}%` }}
                />
              </div>
              <span className="text-xs text-[#A8A09B] shrink-0 tabular-nums">
                {pesoAtual.toFixed(1)}/{cargaMax} {t('bag.kg')}
              </span>
            </>
          )}
          {efetivoCobrar && (
            <span className={`text-xs font-semibold text-[#B8860B] shrink-0 tabular-nums ${!config.rastrear_peso ? 'ml-auto' : ''}`}>
              {ficha.inventario.moedas.PO.toFixed(1)} {t('bag.gp')}
            </span>
          )}
        </div>
      )}

      {/* Busca */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A09B] text-sm pointer-events-none">⌕</span>
        <input
          type="text"
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder={t('bag.searchPlaceholder')}
          className="w-full bg-[#2D2520] border border-[#B8860B]/30 rounded-lg pl-8 pr-3 py-2 text-[#F5F0E8] text-sm placeholder:text-[#A8A09B] focus:outline-none focus:ring-1 focus:ring-[#B8860B]"
          aria-label={t('bag.searchAriaLabel')}
        />
      </div>

      {/* Filtros */}
      <div className="flex gap-1 overflow-x-auto pb-0.5" role="tablist" aria-label={t('bag.filterAriaLabel')}>
        {FILTROS.map(f => (
          <button
            key={f.id}
            role="tab"
            aria-selected={filtro === f.id}
            onClick={() => setFiltro(f.id)}
            className={[
              'px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]',
              filtro === f.id
                ? 'bg-[#B8860B] text-[#1A1612]'
                : 'bg-[#2D2520] text-[#A8A09B] hover:text-[#F5F0E8]',
            ].join(' ')}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Resultados */}
      {mostrarResultados && (
        <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
          {resultados.length === 0 ? (
            <p className="text-xs text-[#A8A09B] py-2 text-center">{t('bag.noItems')}</p>
          ) : (
            resultados.map(item => {
              const semFundos = efetivoCobrar && (parsePreco(item.preco) ?? 0) > ficha.inventario.moedas.PO
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-2 bg-[#2D2520] rounded-lg px-3 py-2 group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-sm font-medium ${semFundos ? 'text-[#A8A09B]' : 'text-[#F5F0E8]'}`}>{item.nome}</span>
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold border ${BADGE_COR[item.tipo_item]}`}>
                        {TIPO_LABEL[item.tipo_item]}
                      </span>
                    </div>
                    <div className="text-xs text-[#A8A09B] truncate">{subtitulo(item, t)}</div>
                    <div className={`text-xs ${semFundos ? 'text-red-400/70' : 'text-[#B8860B]'}`}>{item.preco}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => adicionarItem(item)}
                    disabled={semFundos}
                    aria-label={semFundos ? t('bag.insufficientGold', { nome: item.nome }) : t('bag.addItem', { nome: item.nome })}
                    title={semFundos ? t('bag.insufficientGoldTitle') : undefined}
                    className={[
                      'w-7 h-7 shrink-0 flex items-center justify-center rounded-full border font-bold text-base leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]',
                      semFundos
                        ? 'bg-[#2D2520] border-[#A8A09B]/20 text-[#A8A09B]/30 cursor-not-allowed'
                        : 'bg-[#B8860B]/10 border-[#B8860B]/30 text-[#D4A017] hover:bg-[#B8860B]/30 hover:border-[#B8860B] cursor-pointer',
                    ].join(' ')}
                  >
                    +
                  </button>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Mochila atual — omitida quando pai já exibe inventário */}
      {!semLista && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#B8860B] font-medium">{t('bag.bagSection')}</span>
            <span className="text-xs text-[#A8A09B]">
              {ficha.inventario.itens.length === 1
                ? t('bag.itemCount_one', { n: ficha.inventario.itens.length })
                : t('bag.itemCount_other', { n: ficha.inventario.itens.length })}
            </span>
          </div>

          {ficha.inventario.itens.length === 0 ? (
            <p className="text-xs text-[#A8A09B] py-2">
              {t('bag.emptyBag')}
            </p>
          ) : (
            <div className="space-y-1">
              {ficha.inventario.itens.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-[#2D2520] rounded-lg px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-[#F5F0E8] font-medium truncate">{item.nome}</div>
                    <div className="text-xs text-[#A8A09B]">
                      {TIPO_LABEL[item.categoria] ?? item.categoria}
                      {config.rastrear_peso && item.peso_kg ? ` · ${(item.peso_kg * item.quantidade).toFixed(1)} ${t('bag.kg')}` : ''}
                      {item.custo_po ? ` · ${item.custo_po} ${t('bag.gp')}` : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        item.quantidade <= 1
                          ? removeItem(idx)
                          : updateItem(idx, { quantidade: item.quantidade - 1 })
                      }
                      aria-label={t('bag.decreaseQty')}
                      className="w-6 h-6 flex items-center justify-center rounded bg-[#3D332D] border border-[#B8860B]/20 text-[#A8A09B] hover:text-[#F5F0E8] hover:border-[#B8860B]/50 transition-colors cursor-pointer text-sm font-bold"
                    >−</button>
                    <span className="w-5 text-center text-xs text-[#F5F0E8] font-medium tabular-nums">
                      {item.quantidade}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateItem(idx, { quantidade: item.quantidade + 1 })}
                      aria-label={t('bag.increaseQty')}
                      className="w-6 h-6 flex items-center justify-center rounded bg-[#3D332D] border border-[#B8860B]/20 text-[#A8A09B] hover:text-[#F5F0E8] hover:border-[#B8860B]/50 transition-colors cursor-pointer text-sm font-bold"
                    >+</button>
                    {config.reembolso_venda && item.custo_po !== null && (
                      <button
                        type="button"
                        onClick={() => {
                          updateMoedas({ PO: +(ficha.inventario.moedas.PO + item.custo_po! * item.quantidade).toFixed(4) })
                          removeItem(idx)
                        }}
                        title={t('bag.sellFor', { n: (item.custo_po * item.quantidade).toFixed(1) })}
                        aria-label={t('bag.sellAriaLabel', { nome: item.nome, n: (item.custo_po * item.quantidade).toFixed(1) })}
                        className="w-6 h-6 flex items-center justify-center rounded bg-[#3D332D] border border-[#B8860B]/30 text-[#B8860B]/60 hover:text-[#B8860B] hover:border-[#B8860B] transition-colors cursor-pointer text-[9px] font-bold ml-1"
                      >{t('bag.sellBtn')}</button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      aria-label={t('bag.spendAriaLabel', { nome: item.nome })}
                      title={t('bag.spendTitle')}
                      className="w-6 h-6 flex items-center justify-center rounded bg-[#3D332D] border border-red-900/20 text-red-500/50 hover:text-red-400 hover:border-red-900/50 transition-colors cursor-pointer text-xs"
                    >✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
