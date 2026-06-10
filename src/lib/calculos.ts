import type { AtributoId, Armadura } from '../types'

export function calcModificador(valor: number): number {
  return Math.floor((valor - 10) / 2)
}

export function calcBonusProf(nivel: number): number {
  return Math.ceil(nivel / 4) + 1
}

export function calcPVNivel1(dadoVida: number, modCON: number): number {
  return dadoVida + modCON
}

export function calcPVPorNivel(dadoVida: number, modCON: number): number {
  return Math.floor(dadoVida / 2 + 1) + modCON
}

export function calcPVTotal(nivel: number, dadoVida: number, modCON: number): number {
  const pv1 = calcPVNivel1(dadoVida, modCON)
  if (nivel <= 1) return pv1
  const extra = (nivel - 1) * calcPVPorNivel(dadoVida, modCON)
  return pv1 + extra
}

export function calcCA(params: {
  armadura: Armadura | null
  modDES: number
  modCON: number
  modSAB: number
  classeId: string | null
  escudo: boolean
}): number {
  const { armadura, modDES, modCON, modSAB, classeId, escudo } = params
  const bonusEscudo = escudo ? 2 : 0

  if (!armadura) {
    if (classeId === 'barbaro') return 10 + modDES + modCON + bonusEscudo
    if (classeId === 'monge') return 10 + modDES + modSAB + bonusEscudo
    return 10 + modDES + bonusEscudo
  }

  const caStr = String(armadura.ca)
  if (armadura.categoria === 'Leve') {
    const base = parseInt(caStr.split('+')[0])
    return base + modDES + bonusEscudo
  }
  if (armadura.categoria === 'Média') {
    const base = parseInt(caStr.split('+')[0])
    return base + Math.min(modDES, 2) + bonusEscudo
  }
  if (armadura.categoria === 'Pesada') {
    return parseInt(caStr) + bonusEscudo
  }
  if (armadura.categoria === 'Escudo') {
    return 10 + modDES + bonusEscudo
  }
  return 10 + modDES + bonusEscudo
}

export function calcSalvaguarda(modAtributo: number, proficiente: boolean, bonusProf: number): number {
  return modAtributo + (proficiente ? bonusProf : 0)
}

export function calcPericia(modAtributo: number, proficiente: boolean, expertise: boolean, bonusProf: number): number {
  if (expertise) return modAtributo + bonusProf * 2
  if (proficiente) return modAtributo + bonusProf
  return modAtributo
}

export function calcPercepcaoPassiva(valorPercepcao: number): number {
  return 10 + valorPercepcao
}

export function calcCDMagia(bonusProf: number, modAtributo: number): number {
  return 8 + bonusProf + modAtributo
}

export function calcBonusAtaqueMagico(bonusProf: number, modAtributo: number): number {
  return bonusProf + modAtributo
}

export function calcTotalPO(moedas: { PC: number; PP: number; PE: number; PO: number; PL: number }): number {
  return (moedas.PC / 100) + (moedas.PP / 10) + (moedas.PE / 2) + moedas.PO + (moedas.PL * 10)
}

export function calcCargaMaxima(valorFOR: number): number {
  return valorFOR * 7.5
}

export function formatModificador(mod: number | null): string {
  if (mod === null) return '—'
  return mod >= 0 ? `+${mod}` : `${mod}`
}

export const ATRIBUTOS: AtributoId[] = ['FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR']

export const ATRIBUTO_NOMES: Record<AtributoId, string> = {
  FOR: 'Força',
  DES: 'Destreza',
  CON: 'Constituição',
  INT: 'Inteligência',
  SAB: 'Sabedoria',
  CAR: 'Carisma',
}

export const XP_POR_NIVEL: Record<number, number> = {
  1: 0, 2: 300, 3: 900, 4: 2700, 5: 6500, 6: 14000, 7: 23000, 8: 34000,
  9: 48000, 10: 64000, 11: 85000, 12: 100000, 13: 120000, 14: 140000,
  15: 165000, 16: 195000, 17: 225000, 18: 260000, 19: 300000, 20: 355000,
}
