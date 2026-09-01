/**
 * Quais escolhas de classe o personagem precisa fazer. Ficam aqui, e não dentro do
 * passo do wizard, porque a aba Editar oferece as mesmas escolhas depois — as duas
 * telas têm que concordar sobre quem escolhe o quê.
 */

/** Guerreiro tem Estilo de Luta desde o nível 1; guardião e paladino a partir do 2. */
export function hasFightingStyle(classId: string, classLevel: number): boolean {
  if (classId === 'guerreiro') return classLevel >= 1
  if (classId === 'guardiao' || classId === 'paladino') return classLevel >= 2
  return false
}

export function hasDivineOrder(classId: string): boolean {
  return classId === 'clerigo'
}

export function hasPrimalOrder(classId: string): boolean {
  return classId === 'druida'
}

export function hasFavoredEnemy(classId: string): boolean {
  return classId === 'guardiao'
}

export function hasAnyClassChoice(classId: string, classLevel: number): boolean {
  return (
    hasFightingStyle(classId, classLevel) ||
    hasDivineOrder(classId) ||
    hasPrimalOrder(classId) ||
    hasFavoredEnemy(classId)
  )
}
