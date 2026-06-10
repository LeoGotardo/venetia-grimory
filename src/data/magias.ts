import { MAGIAS0 } from './spells/spell_lvl0'
import { MAGIA1 } from './spells/spell_lvl1'
import { MAGIA2 } from './spells/spell_lvl2'
import { MAGIA3 } from './spells/spell_lvl3'
import { MAGIAS4 } from './spells/spell_lvl4'
import { MAGIAS5 } from './spells/spell_lvl5'
import { MAGIAS6 } from './spells/spell_lvl6'
import { MAGIAS7 } from './spells/spell_lvl7'
import { MAGIAS8 } from './spells/spell_lvl8'
import { MAGIAS9 } from './spells/spell_lvl9'

export type { Magia } from './spells/types'
import type { Magia } from './spells/types'

export const MAGIAS: Magia[] = [
  ...MAGIAS0,
  ...MAGIA1,
  ...MAGIA2,
  ...MAGIA3,
  ...MAGIAS4,
  ...MAGIAS5,
  ...MAGIAS6,
  ...MAGIAS7,
  ...MAGIAS8,
  ...MAGIAS9,
]

export function getMagiasPorClasse(classeId: string): Magia[] {
  return MAGIAS.filter(m => m.classes.includes(classeId))
}

export function getTruquesPorClasse(classeId: string): Magia[] {
  return MAGIAS.filter(m => m.circulo === 0 && m.classes.includes(classeId))
}

export function getMagiasPorClasseECirculo(classeId: string, circuloMax: number): Magia[] {
  return MAGIAS.filter(m => m.circulo > 0 && m.circulo <= circuloMax && m.classes.includes(classeId))
}
