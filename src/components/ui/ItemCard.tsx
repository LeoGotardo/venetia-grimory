import { Modal } from './Modal'
import type { Armadura, Arma, EquipamentoAventura } from '../../types'

export type ItemKit = {
  _tipo: 'kit'
  id: string
  nome: string
  custo_po?: number
  peso_kg?: number
  conteudo?: string[]
}

export type ItemFerramenta = {
  _tipo: 'ferramenta'
  id: string
  nome: string
  custo_po?: number
  peso_kg?: number
  atributo?: string
}

export type ItemDetalhe =
  | (Armadura & { _tipo: 'armadura' })
  | (Arma & { _tipo: 'arma' })
  | (EquipamentoAventura & { _tipo: 'equipamento' })
  | ItemKit
  | ItemFerramenta

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

function CustoRow({ custo_po, peso_kg }: { custo_po?: number | null; peso_kg?: number | null }) {
  if (!custo_po && !peso_kg) return null
  return (
    <div className="flex gap-3 text-sm">
      {custo_po != null && custo_po > 0 && (
        <span className="text-[#B8860B] font-medium">{custo_po} PO</span>
      )}
      {peso_kg != null && peso_kg > 0 && (
        <span className="text-[#A8A09B]">{peso_kg} kg</span>
      )}
    </div>
  )
}

interface ItemCardProps {
  item: ItemDetalhe | null
  onClose: () => void
}

export function ItemCard({ item, onClose }: ItemCardProps) {
  if (!item) return null

  return (
    <Modal open={!!item} onClose={onClose}>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h3 className="font-cinzel font-bold text-xl text-[#F5F0E8] mb-2">{item.nome}</h3>
          <div className="flex flex-wrap gap-1.5">
            <Tag>{item._tipo === 'armadura' ? item.categoria : item._tipo === 'arma' ? item.categoria : item._tipo === 'kit' ? 'Kit' : item._tipo === 'ferramenta' ? 'Ferramenta' : (item as EquipamentoAventura).categoria}</Tag>
          </div>
        </div>

        <hr className="border-[#B8860B]/20" />

        {/* Fields by type */}
        {item._tipo === 'armadura' && (
          <div className="space-y-2">
            <Row label="Classe de Armadura" value={<span className="font-bold text-[#D4A017]">{item.ca}</span>} />
            {item.requisito_for && (
              <Row label="Requisito FOR" value={`${item.requisito_for}`} />
            )}
            {item.penalidade_furtividade && (
              <Row label="Furtividade" value={<span className="text-red-400">Penalidade</span>} />
            )}
            <CustoRow custo_po={item.custo_po} peso_kg={item.peso_kg} />
          </div>
        )}

        {item._tipo === 'arma' && (
          <div className="space-y-2">
            <Row
              label="Dano"
              value={
                <span>
                  <span className="font-bold text-[#D4A017]">{item.dano}</span>
                  <span className="text-[#A8A09B] ml-1">{item.tipo_dano}</span>
                </span>
              }
            />
            {item.maestria && (
              <Row label="Maestria" value={item.maestria} />
            )}
            {item.propriedades.length > 0 && (
              <Row
                label="Propriedades"
                value={
                  <div className="flex flex-wrap gap-1">
                    {item.propriedades.map(p => (
                      <span key={p} className="text-xs px-2 py-0.5 rounded bg-[#2D2520] border border-[#B8860B]/20 text-[#A8A09B]">{p}</span>
                    ))}
                  </div>
                }
              />
            )}
            <CustoRow custo_po={item.custo_po} peso_kg={item.peso_kg} />
          </div>
        )}

        {item._tipo === 'equipamento' && (
          <div className="space-y-2">
            {item.notas && (
              <p className="text-sm text-[#C8C0BA] leading-relaxed">{item.notas}</p>
            )}
            <CustoRow custo_po={item.custo_po} peso_kg={item.peso_kg} />
          </div>
        )}

        {item._tipo === 'kit' && (
          <div className="space-y-2">
            {item.conteudo && item.conteudo.length > 0 && (
              <div>
                <p className="text-xs text-[#A8A09B] mb-2">Conteúdo</p>
                <ul className="space-y-0.5">
                  {item.conteudo.map((c, i) => (
                    <li key={i} className="text-sm text-[#F5F0E8] flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-[#B8860B] shrink-0" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <CustoRow custo_po={item.custo_po} peso_kg={item.peso_kg} />
          </div>
        )}

        {item._tipo === 'ferramenta' && (
          <div className="space-y-2">
            {item.atributo && (
              <Row label="Atributo" value={item.atributo} />
            )}
            <CustoRow custo_po={item.custo_po} peso_kg={item.peso_kg} />
          </div>
        )}
      </div>
    </Modal>
  )
}
