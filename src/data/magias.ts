export type { Magia } from './spells/types'
import type { Magia } from './spells/types'
import i18n from '../i18n'

import { MAGIAS0 as MAGIAS0_PT } from './spells/pt/spell_lvl0'
import { MAGIAS1 as MAGIAS1_PT } from './spells/pt/spell_lvl1'
import { MAGIAS2 as MAGIAS2_PT } from './spells/pt/spell_lvl2'
import { MAGIAS3 as MAGIAS3_PT } from './spells/pt/spell_lvl3'
import { MAGIAS4 as MAGIAS4_PT } from './spells/pt/spell_lvl4'
import { MAGIAS5 as MAGIAS5_PT } from './spells/pt/spell_lvl5'
import { MAGIAS6 as MAGIAS6_PT } from './spells/pt/spell_lvl6'
import { MAGIAS7 as MAGIAS7_PT } from './spells/pt/spell_lvl7'
import { MAGIAS8 as MAGIAS8_PT } from './spells/pt/spell_lvl8'
import { MAGIAS9 as MAGIAS9_PT } from './spells/pt/spell_lvl9'

import { MAGIAS0 as MAGIAS0_EN } from './spells/en/spell_lvl0'
import { MAGIAS1 as MAGIAS1_EN } from './spells/en/spell_lvl1'
import { MAGIAS2 as MAGIAS2_EN } from './spells/en/spell_lvl2'
import { MAGIAS3 as MAGIAS3_EN } from './spells/en/spell_lvl3'
import { MAGIAS4 as MAGIAS4_EN } from './spells/en/spell_lvl4'
import { MAGIAS5 as MAGIAS5_EN } from './spells/en/spell_lvl5'
import { MAGIAS6 as MAGIAS6_EN } from './spells/en/spell_lvl6'
import { MAGIAS7 as MAGIAS7_EN } from './spells/en/spell_lvl7'
import { MAGIAS8 as MAGIAS8_EN } from './spells/en/spell_lvl8'
import { MAGIAS9 as MAGIAS9_EN } from './spells/en/spell_lvl9'

function setLang(){
  const current_lang = i18n.language

  const spells_pt = [
    ...MAGIAS0_PT,
    ...MAGIAS1_PT,
    ...MAGIAS2_PT,
    ...MAGIAS3_PT,
    ...MAGIAS4_PT,
    ...MAGIAS5_PT,
    ...MAGIAS6_PT,
    ...MAGIAS7_PT,
    ...MAGIAS8_PT,
    ...MAGIAS9_PT,
  ]

  const spells_en = [
    ...MAGIAS0_EN,
    ...MAGIAS1_EN,
    ...MAGIAS2_EN,
    ...MAGIAS3_EN,
    ...MAGIAS4_EN,
    ...MAGIAS5_EN,
    ...MAGIAS6_EN,
    ...MAGIAS7_EN,
    ...MAGIAS8_EN,
    ...MAGIAS9_EN,
  ]

  if (current_lang === 'pt'){
    return spells_pt
  }else{
    return spells_en
  }
}

export const MAGIAS: Magia[] = setLang()

export function getMagiasPorClasse(classeId: string): Magia[] {
  return MAGIAS.filter(m => m.classes.includes(classeId))
}

export function getTruquesPorClasse(classeId: string): Magia[] {
  return MAGIAS.filter(m => m.circulo === 0 && m.classes.includes(classeId))
}

export function getMagiasPorClasseECirculo(classeId: string, circuloMax: number): Magia[] {
  return MAGIAS.filter(m => m.circulo > 0 && m.circulo <= circuloMax && m.classes.includes(classeId))
}
