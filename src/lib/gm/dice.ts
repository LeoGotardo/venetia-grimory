/** Um termo `NdM`; `sign` -1 para expressões como `1d8-1d4`. */
export interface DiceTerm {
  count: number
  sides: number
  sign: 1 | -1
}

export interface DiceExpression {
  terms: DiceTerm[]
  bonus: number
}

export interface DiceRoll {
  total: number
  /** Cada dado rolado, na ordem dos termos — o que o log do combate mostra. */
  rolls: number[]
  bonus: number
}

const TERM = /([+-]?)\s*(?:(\d*)d(\d+)|(\d+))/gi
const MAX_DICE = 100

/**
 * Lê `2d6+3`, `d20`, `1d8 + 2d6 - 1`. Devolve `null` para texto que não é só
 * dados e números — campo de dano livre ("veja a descrição") não vira zero.
 */
export function parseDice(text: string): DiceExpression | null {
  const clean = text.trim()
  if (!clean) return null

  const terms: DiceTerm[] = []
  let bonus = 0
  let consumed = ''

  for (const match of clean.matchAll(TERM)) {
    const [whole, signText, countText, sidesText, flatText] = match
    if (consumed.length > 0 && !signText) return null
    const sign = signText === '-' ? -1 : 1
    if (sidesText) {
      const count = countText === '' ? 1 : Number(countText)
      const sides = Number(sidesText)
      if (count < 1 || count > MAX_DICE || sides < 1) return null
      terms.push({ count, sides, sign })
    } else {
      bonus += sign * Number(flatText)
    }
    consumed += whole
  }

  if (consumed.replace(/\s/g, '') !== clean.replace(/\s/g, '')) return null
  return terms.length > 0 || consumed ? { terms, bonus } : null
}

/** Média arredondada para baixo, como nos blocos de estatística (`2d8+2` → 11). */
export function averageDice(expression: DiceExpression): number {
  const dice = expression.terms.reduce((sum, t) => sum + t.sign * t.count * (t.sides + 1) / 2, 0)
  return Math.floor(dice + expression.bonus)
}

/** `random` devolve [0, 1), como `Math.random` — injetável para os testes. */
export function rollDice(expression: DiceExpression, random: () => number = Math.random): DiceRoll {
  const rolls: number[] = []
  let total = expression.bonus
  for (const term of expression.terms) {
    for (let i = 0; i < term.count; i++) {
      const roll = Math.floor(random() * term.sides) + 1
      rolls.push(roll)
      total += term.sign * roll
    }
  }
  return { total, rolls, bonus: expression.bonus }
}
