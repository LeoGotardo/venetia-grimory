import { parseDice, type DiceExpression } from '../gm/dice.js'
import { ROOM_ROLL_MAX_BONUS, ROOM_ROLL_MAX_DICE, ROOM_ROLL_MAX_SIDES } from './constants.js'

/**
 * Expressão de rolagem aceita na sala: a mesma sintaxe dos blocos (`2d6+3`,
 * `1d8+2d6-1`), com teto de dados no total, de faces e de bônus — o servidor
 * rola, e uma expressão absurda não pode travá-lo nem encher o log.
 */
export function parseRoomRoll(text: string): DiceExpression | null {
  const expression = parseDice(text)
  if (!expression || expression.terms.length === 0) return null
  const dice = expression.terms.reduce((sum, term) => sum + term.count, 0)
  if (dice > ROOM_ROLL_MAX_DICE) return null
  if (expression.terms.some(term => term.sides < 2 || term.sides > ROOM_ROLL_MAX_SIDES)) return null
  if (Math.abs(expression.bonus) > ROOM_ROLL_MAX_BONUS) return null
  return expression
}
