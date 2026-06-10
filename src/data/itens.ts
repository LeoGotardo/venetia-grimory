import { ARMAS } from './itens/weapons'
import { ARMADURAS } from './itens/armours'
import { FERRAMENTAS } from './itens/tools'
import { PACOTES_DE_EQUIPAMENTO } from './itens/kits'
import { MONTARIAS_E_VEICULOS } from './itens/transport'
import { ITENS_MAGICOS } from './itens/magic_itens'

export type { Item, Arma, Armadura, Ferramenta, PacoteEquipamento, Transporte, ItemMagico } from './itens/types'

export { ARMAS, ARMADURAS, FERRAMENTAS, PACOTES_DE_EQUIPAMENTO, MONTARIAS_E_VEICULOS, ITENS_MAGICOS }

export const ITENS = [
  ...ARMAS,
  ...ARMADURAS,
  ...FERRAMENTAS,
  ...PACOTES_DE_EQUIPAMENTO,
  ...MONTARIAS_E_VEICULOS,
  ...ITENS_MAGICOS,
]

export function getArmas() {
  return ARMAS
}

export function getArmasPorCategoria(categoria: 'Simples' | 'Marcial') {
  return ARMAS.filter(a => a.categoria === categoria)
}

export function getArmasPorTipo(tipo: 'Corpo a Corpo' | 'À Distância') {
  return ARMAS.filter(a => a.tipo === tipo)
}

export function getArmaduras() {
  return ARMADURAS
}

export function getArmadurasPorCategoria(categoria: 'Leve' | 'Média' | 'Pesada' | 'Escudo') {
  return ARMADURAS.filter(a => a.categoria === categoria)
}

export function getFerramentas() {
  return FERRAMENTAS
}

export function getFerramentasPorCategoria(categoria: string) {
  return FERRAMENTAS.filter(f => f.categoria === categoria)
}

export function getItensMagicos() {
  return ITENS_MAGICOS
}

export function getItensMagicosPorRaridade(raridade: string) {
  return ITENS_MAGICOS.filter(i => i.raridade === raridade)
}

export function buscarItens(termo: string) {
  const t = termo.toLowerCase()
  return ITENS.filter(i => i.nome.toLowerCase().includes(t) || i.descricao.toLowerCase().includes(t))
}
