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

export function getArmas() {
  return i18n.language === 'pt' ? ARMAS_PT : ARMAS_EN
}

export function getArmaduras() {
  return i18n.language === 'pt' ? ARMADURAS_PT : ARMADURAS_EN
}

export function getFerramentas() {
  return i18n.language === 'pt' ? FERRAMENTAS_PT : FERRAMENTAS_EN
}

export function getPacotesDeEquipamento() {
  return i18n.language === 'pt' ? PACOTES_DE_EQUIPAMENTO_PT : PACOTES_DE_EQUIPAMENTO_EN
}

export function getMontariasEVeiculos() {
  return i18n.language === 'pt' ? MONTARIAS_E_VEICULOS_PT : MONTARIAS_E_VEICULOS_EN
}

export function getItensMagicos() {
  return i18n.language === 'pt' ? ITENS_MAGICOS_PT : ITENS_MAGICOS_EN
}

export function getItens() {
  return [
    ...getArmas(),
    ...getArmaduras(),
    ...getFerramentas(),
    ...getPacotesDeEquipamento(),
    ...getMontariasEVeiculos(),
    ...getItensMagicos(),
  ]
}

export function getArmasPorCategoria(categoria: 'Simples' | 'Marcial') {
  return getArmas().filter(a => a.categoria === categoria)
}

export function getArmasPorTipo(tipo: 'Corpo a Corpo' | 'À Distância') {
  return getArmas().filter(a => a.tipo === tipo)
}

export function getArmadurasPorCategoria(categoria: 'Leve' | 'Média' | 'Pesada' | 'Escudo') {
  return getArmaduras().filter(a => a.categoria === categoria)
}

export function getFerramentasPorCategoria(categoria: string) {
  return getFerramentas().filter(f => f.categoria === categoria)
}

export function getItensMagicosPorRaridade(raridade: string) {
  return getItensMagicos().filter(i => i.raridade === raridade)
}

export function buscarItens(termo: string) {
  const t = termo.toLowerCase()
  return getItens().filter(i => i.nome.toLowerCase().includes(t) || i.descricao.toLowerCase().includes(t))
}