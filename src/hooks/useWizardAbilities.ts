import { useState } from 'react'
import type { AbilityId } from '../types'
import {
  STANDARD_ARRAY_VALUES,
  POINT_BUY_COSTS,
  POINT_BUY_POOL,
  POINT_BUY_ABILITY_MIN,
  POINT_BUY_ABILITY_MAX,
} from '../constants'
import { ABILITIES } from '../lib/calculations'

export type AbilityMethod = 'standard' | 'random' | 'pointBuy'

type AbilityValues = Record<AbilityId, number | null>
type PointBuyValues = Record<AbilityId, number>

const NULL_VALUES: AbilityValues = {
  FOR: null, DES: null, CON: null, INT: null, SAB: null, CAR: null,
}

const INITIAL_POINT_BUY_VALUES: PointBuyValues = {
  FOR: 8, DES: 8, CON: 8, INT: 8, SAB: 8, CAR: 8,
}

export function roll4d6(): number {
  const rolls = Array.from({ length: 4 }, () => Math.ceil(Math.random() * 6))
  return rolls.reduce((a, b) => a + b, 0) - Math.min(...rolls)
}

const NULL_INDICES: Record<AbilityId, number | null> = {
  FOR: null, DES: null, CON: null, INT: null, SAB: null, CAR: null,
}

export function useWizardAbilities(opts?: {
  initialRoll?: number[]
  onRoll?: (vals: number[]) => void
}) {
  const [method, setMethod] = useState<AbilityMethod>('standard')
  const [standard, setStandard] = useState<AbilityValues>(NULL_VALUES)
  const [rollValues, setRollValues] = useState<number[]>(() => opts?.initialRoll ?? [])
  const [randomIndices, setRandomIndices] = useState<Record<AbilityId, number | null>>(NULL_INDICES)
  const [pointBuy, setPointBuy] = useState<PointBuyValues>(INITIAL_POINT_BUY_VALUES)

  const spentPool = Object.values(pointBuy).reduce(
    (acc, v) => acc + (POINT_BUY_COSTS[v] ?? 0),
    0,
  )
  const remainingPool = POINT_BUY_POOL - spentPool

  const random: AbilityValues = ABILITIES.reduce((acc, a) => {
    const idx = randomIndices[a]
    return { ...acc, [a]: idx !== null && rollValues[idx] !== undefined ? rollValues[idx] : null }
  }, {} as AbilityValues)

  function isDieAvailable(dieIndex: number, strAttr: AbilityId): boolean {
    return !ABILITIES.some(a => a !== strAttr && randomIndices[a] === dieIndex)
  }

  function getCurrentAbilities(): AbilityValues {
    if (method === 'standard') return standard
    if (method === 'random') return random
    return pointBuy
  }

  const currentAbilities = getCurrentAbilities()
  const isComplete = method === 'random'
    ? rollValues.length === 6 && ABILITIES.every(a => randomIndices[a] !== null)
    : ABILITIES.every(a => currentAbilities[a] !== null && (currentAbilities[a] ?? 0) > 0)

  function isValueAvailableInStandardArray(value: number, currentAttr: AbilityId): boolean {
    return !Object.entries(standard).some(([a, v]) => a !== currentAttr && v === value)
  }

  function setStandardAttr(attr: AbilityId, value: number | null) {
    setStandard(prev => ({ ...prev, [attr]: value }))
  }

  function rollRandom() {
    const vals = Array.from({ length: 6 }, roll4d6)
    setRollValues(vals)
    setRandomIndices(NULL_INDICES)
    opts?.onRoll?.(vals)
  }

  function setRandomAttr(attr: AbilityId, newIndex: number | null) {
    setRandomIndices(prev => ({ ...prev, [attr]: newIndex }))
  }

  function setPointBuyAttr(attr: AbilityId, newVal: number) {
    const val = Math.max(POINT_BUY_ABILITY_MIN, Math.min(POINT_BUY_ABILITY_MAX, newVal))
    const costDiff = (POINT_BUY_COSTS[val] ?? 0) - (POINT_BUY_COSTS[pointBuy[attr]] ?? 0)
    if (costDiff > remainingPool) return
    setPointBuy(prev => ({ ...prev, [attr]: val }))
  }

  function switchMethod(newMethod: AbilityMethod) {
    setMethod(newMethod)
  }

  return {
    method,
    switchMethod,
    standard,
    setStandardAttr,
    isValueAvailableInStandardArray,
    standardArray: STANDARD_ARRAY_VALUES,
    random,
    randomIndices,
    isDieAvailable,
    rollValues,
    rollRandom,
    setRandomAttr,
    pointBuy,
    setPointBuyAttr,
    remainingPool,
    currentAbilities,
    isComplete,
  }
}
