import i18n from '../i18n'

import { ARMAS as ARMAS_PT } from './itens/pt/weapons'
import { ARMADURAS as ARMADURAS_PT } from './itens/pt/armours'
import { FERRAMENTAS as FERRAMENTAS_PT } from './itens/pt/tools'
import { PACOTES_DE_EQUIPAMENTO as PACOTES_DE_EQUIPAMENTO_PT } from './itens/pt/kits'
import { MONTARIAS_E_VEICULOS as MONTARIAS_E_VEICULOS_PT } from './itens/pt/transport'
import { ITENS_MAGICOS as ITENS_MAGICOS_PT } from './itens/pt/magic_itens'

import { ARMAS as ARMAS_EN } from './itens/en/weapons'
import { ARMADURAS as ARMADURAS_EN } from './itens/en/armours'
import { FERRAMENTAS as FERRAMENTAS_EN } from './itens/en/tools'
import { PACOTES_DE_EQUIPAMENTO as PACOTES_DE_EQUIPAMENTO_EN } from './itens/en/kits'
import { MONTARIAS_E_VEICULOS as MONTARIAS_E_VEICULOS_EN } from './itens/en/transport'
import { ITENS_MAGICOS as ITENS_MAGICOS_EN } from './itens/en/magic_itens'

export type { Item, Arma, Armadura, Ferramenta, PacoteEquipamento, Transporte, ItemMagico } from './itens/types'

const current_lang = i18n.language

const ARMAS = current_lang === 'pt' ? ARMAS_PT : ARMAS_EN
const ARMADURAS = current_lang === 'pt' ? ARMADURAS_PT : ARMADURAS_EN
const FERRAMENTAS = current_lang === 'pt' ? FERRAMENTAS_PT : FERRAMENTAS_EN
const PACOTES_DE_EQUIPAMENTO = current_lang === 'pt' ? PACOTES_DE_EQUIPAMENTO_PT : PACOTES_DE_EQUIPAMENTO_EN
const MONTARIAS_E_VEICULOS = current_lang === 'pt' ? MONTARIAS_E_VEICULOS_PT : MONTARIAS_E_VEICULOS_EN
const ITENS_MAGICOS = current_lang === 'pt' ? ITENS_MAGICOS_PT : ITENS_MAGICOS_EN

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
