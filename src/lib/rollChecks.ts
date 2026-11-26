import type { TFunction } from 'i18next'
import type { AbilityId, CharacterSheet } from '../types'
import type { RollCheck } from './room/protocol'
import { gameData } from '../data/rules'

const ABILITIES: readonly string[] = ['FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR'] satisfies AbilityId[]
const isAbility = (id: string | null): id is AbilityId => id != null && ABILITIES.includes(id)

/**
 * Modificador do teste que o mestre pediu, lido da ficha do player — o mesmo
 * número que a ficha mostra. `null` quando a ficha não tem esse valor.
 */
export function checkModifier(sheet: CharacterSheet, check: RollCheck): number | null {
  switch (check.kind) {
    case 'ability':
      return isAbility(check.id) ? sheet.abilities[check.id]._modifier : null
    case 'save':
      return isAbility(check.id) ? sheet.combat.saves[check.id]?._value ?? null : null
    case 'skill':
      return check.id ? sheet.skills[check.id]?._value ?? null : null
    case 'initiative':
      return sheet.combat.initiative._value
  }
}

/** Nome do teste no idioma da tela: "Teste de Força", "Salvaguarda de Destreza", "Percepção". */
export function checkLabel(check: RollCheck, t: TFunction): string {
  switch (check.kind) {
    case 'ability':
      return isAbility(check.id) ? t('room.check.abilityOf', { name: t(`attrs.${check.id}`) }) : ''
    case 'save':
      return isAbility(check.id) ? t('room.check.saveOf', { name: t(`attrs.${check.id}`) }) : ''
    case 'skill':
      return gameData.skills.find(s => s.id === check.id)?.name ?? check.id ?? ''
    case 'initiative':
      return t('combat.initiative')
  }
}
