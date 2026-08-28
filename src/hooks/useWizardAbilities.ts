import { useState } from 'react'
import type { AtributoId } from '../types'
import {
  CONJUNTO_PADRAO_VALORES,
  CUSTO_PONTOS_COMPRA,
  POOL_PONTOS_COMPRA,
  ATRIBUTO_MINIMO_COMPRA,
  ATRIBUTO_MAXIMO_COMPRA,
} from '../constants'
import { ATRIBUTOS } from '../lib/calculos'

export type MetodoAtributos = 'padrao' | 'aleatorio' | 'compra'

type ValoresAtributos = Record<AtributoId, number | null>
type ValoresCompra = Record<AtributoId, number>

const VALORES_NULOS: ValoresAtributos = {
  FOR: null, DES: null, CON: null, INT: null, SAB: null, CAR: null,
}

const VALORES_COMPRA_INICIAIS: ValoresCompra = {
  FOR: 8, DES: 8, CON: 8, INT: 8, SAB: 8, CAR: 8,
}

export function rolar4d6(): number {
  const rolls = Array.from({ length: 4 }, () => Math.ceil(Math.random() * 6))
  return rolls.reduce((a, b) => a + b, 0) - Math.min(...rolls)
}

const INDICES_NULOS: Record<AtributoId, number | null> = {
  FOR: null, DES: null, CON: null, INT: null, SAB: null, CAR: null,
}

export function useAtributosWizard(opts?: {
  initialRoll?: number[]
  onRoll?: (vals: number[]) => void
}) {
  const [metodo, setMetodo] = useState<MetodoAtributos>('padrao')
  const [padrao, setPadrao] = useState<ValoresAtributos>(VALORES_NULOS)
  const [rolagemValores, setRolagemValores] = useState<number[]>(() => opts?.initialRoll ?? [])
  const [aleatorioIndices, setAleatorioIndices] = useState<Record<AtributoId, number | null>>(INDICES_NULOS)
  const [compra, setCompra] = useState<ValoresCompra>(VALORES_COMPRA_INICIAIS)

  const poolGasto = Object.values(compra).reduce(
    (acc, v) => acc + (CUSTO_PONTOS_COMPRA[v] ?? 0),
    0,
  )
  const poolRestante = POOL_PONTOS_COMPRA - poolGasto

  const aleatorio: ValoresAtributos = ATRIBUTOS.reduce((acc, a) => {
    const idx = aleatorioIndices[a]
    return { ...acc, [a]: idx !== null && rolagemValores[idx] !== undefined ? rolagemValores[idx] : null }
  }, {} as ValoresAtributos)

  function isDieAvailable(dieIndex: number, forAttr: AtributoId): boolean {
    return !ATRIBUTOS.some(a => a !== forAttr && aleatorioIndices[a] === dieIndex)
  }

  function getAtributosAtuais(): ValoresAtributos {
    if (metodo === 'padrao') return padrao
    if (metodo === 'aleatorio') return aleatorio
    return compra
  }

  const atributosAtuais = getAtributosAtuais()
  const estaCompleto = metodo === 'aleatorio'
    ? rolagemValores.length === 6 && ATRIBUTOS.every(a => aleatorioIndices[a] !== null)
    : ATRIBUTOS.every(a => atributosAtuais[a] !== null && (atributosAtuais[a] ?? 0) > 0)

  function isValorDisponivelNoPadrao(valor: number, attrAtual: AtributoId): boolean {
    return !Object.entries(padrao).some(([a, v]) => a !== attrAtual && v === valor)
  }

  function setPadraoAttr(attr: AtributoId, valor: number | null) {
    setPadrao(prev => ({ ...prev, [attr]: valor }))
  }

  function rolarAleatorio() {
    const vals = Array.from({ length: 6 }, rolar4d6)
    setRolagemValores(vals)
    setAleatorioIndices(INDICES_NULOS)
    opts?.onRoll?.(vals)
  }

  function setAleatorioAttr(attr: AtributoId, novoIndice: number | null) {
    setAleatorioIndices(prev => ({ ...prev, [attr]: novoIndice }))
  }

  function setCompraAttr(attr: AtributoId, novoVal: number) {
    const val = Math.max(ATRIBUTO_MINIMO_COMPRA, Math.min(ATRIBUTO_MAXIMO_COMPRA, novoVal))
    const custoDiff = (CUSTO_PONTOS_COMPRA[val] ?? 0) - (CUSTO_PONTOS_COMPRA[compra[attr]] ?? 0)
    if (custoDiff > poolRestante) return
    setCompra(prev => ({ ...prev, [attr]: val }))
  }

  function trocarMetodo(novoMetodo: MetodoAtributos) {
    setMetodo(novoMetodo)
  }

  return {
    metodo,
    trocarMetodo,
    padrao,
    setPadraoAttr,
    isValorDisponivelNoPadrao,
    conjuntoPadrao: CONJUNTO_PADRAO_VALORES,
    aleatorio,
    aleatorioIndices,
    isDieAvailable,
    rolagemValores,
    rolarAleatorio,
    setAleatorioAttr,
    compra,
    setCompraAttr,
    poolRestante,
    atributosAtuais,
    estaCompleto,
  }
}
