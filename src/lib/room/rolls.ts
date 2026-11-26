import { parseDice, type DiceExpression } from '../gm/dice.js'
import { ROOM_ROLL_MAX_BONUS, ROOM_ROLL_MAX_DICE, ROOM_ROLL_MAX_SIDES } from './constants.js'

/**
 * Expressão de rolagem aceita na sala: a mesma sintaxe dos blocos (`2d6+3`,
 * `1d8+2d6-1`), com teto de dados no total, de faces e de bônus — o servidor
 * rola, e uma expressão absurda não pode travá-lo nem encher o log.
 */
export function parseRoomRoll(text: string): DiceExpression | null {
  const expression = parseDice(text)
  return expression && expression.terms.length > 0 && withinCaps(expression) ? expression : null
}

/**
 * Dano: o mesmo teto, mas aceita valor fixo sem dado — o Ataque Desarmado causa
 * 1 + FOR. Só para dano: uma rolagem `/r 5` ou a resposta a um pedido de teste
 * continuam exigindo dado.
 */
export function parseRoomDamage(text: string): DiceExpression | null {
  const expression = parseDice(text)
  return expression && withinCaps(expression) ? expression : null
}

function withinCaps(expression: DiceExpression): boolean {
  const dice = expression.terms.reduce((sum, term) => sum + term.count, 0)
  if (dice > ROOM_ROLL_MAX_DICE) return false
  if (expression.terms.some(term => term.sides < 2 || term.sides > ROOM_ROLL_MAX_SIDES)) return false
  return Math.abs(expression.bonus) <= ROOM_ROLL_MAX_BONUS
}

/** Teste de d20 com modificador: `1d20+5`, `1d20-1`, `1d20`. */
export function d20Roll(modifier: number): string {
  if (modifier === 0) return '1d20'
  return `1d20${modifier > 0 ? '+' : '-'}${Math.abs(modifier)}`
}

/** Crítico: o dobro de dados de cada termo; o bônus fixo não dobra (2024). */
export function critExpression(expression: DiceExpression): DiceExpression {
  return { ...expression, terms: expression.terms.map(term => ({ ...term, count: term.count * 2 })) }
}

/**
 * Dados físicos: o player rolou na mesa e diz quanto saiu, um subtotal por termo
 * de dado (a soma dos dados daquele termo — em `8d6+3`, um número de 8 a 48). O
 * servidor confere o mínimo e o máximo possíveis e monta o resultado como se
 * tivesse rolado; `rolls` guarda os subtotais. Crítico: passe a expressão já
 * dobrada por `critExpression`.
 */
export function manualRoll(expression: DiceExpression, subtotals: number[]): { rolls: number[]; bonus: number; total: number } | null {
  if (subtotals.length !== expression.terms.length) return null
  let total = expression.bonus
  for (const [i, term] of expression.terms.entries()) {
    const value = subtotals[i]
    if (!Number.isInteger(value) || value < term.count || value > term.count * term.sides) return null
    total += term.sign * value
  }
  return { rolls: [...subtotals], bonus: expression.bonus, total }
}
