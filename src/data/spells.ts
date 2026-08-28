export type { Spell } from './spells/types'
import type { Spell } from './spells/types'
import i18n from '../i18n'

import { SPELLS0 as SPELLS0_PT } from './spells/pt/spell_lvl0'
import { SPELLS1 as SPELLS1_PT } from './spells/pt/spell_lvl1'
import { SPELLS2 as SPELLS2_PT } from './spells/pt/spell_lvl2'
import { SPELLS3 as SPELLS3_PT } from './spells/pt/spell_lvl3'
import { SPELLS4 as SPELLS4_PT } from './spells/pt/spell_lvl4'
import { SPELLS5 as SPELLS5_PT } from './spells/pt/spell_lvl5'
import { SPELLS6 as SPELLS6_PT } from './spells/pt/spell_lvl6'
import { SPELLS7 as SPELLS7_PT } from './spells/pt/spell_lvl7'
import { SPELLS8 as SPELLS8_PT } from './spells/pt/spell_lvl8'
import { SPELLS9 as SPELLS9_PT } from './spells/pt/spell_lvl9'

import { SPELLS0 as SPELLS0_EN } from './spells/en/spell_lvl0'
import { SPELLS1 as SPELLS1_EN } from './spells/en/spell_lvl1'
import { SPELLS2 as SPELLS2_EN } from './spells/en/spell_lvl2'
import { SPELLS3 as SPELLS3_EN } from './spells/en/spell_lvl3'
import { SPELLS4 as SPELLS4_EN } from './spells/en/spell_lvl4'
import { SPELLS5 as SPELLS5_EN } from './spells/en/spell_lvl5'
import { SPELLS6 as SPELLS6_EN } from './spells/en/spell_lvl6'
import { SPELLS7 as SPELLS7_EN } from './spells/en/spell_lvl7'
import { SPELLS8 as SPELLS8_EN } from './spells/en/spell_lvl8'
import { SPELLS9 as SPELLS9_EN } from './spells/en/spell_lvl9'

const ALL_SPELLS_PT: Spell[] = [
  ...SPELLS0_PT,
  ...SPELLS1_PT,
  ...SPELLS2_PT,
  ...SPELLS3_PT,
  ...SPELLS4_PT,
  ...SPELLS5_PT,
  ...SPELLS6_PT,
  ...SPELLS7_PT,
  ...SPELLS8_PT,
  ...SPELLS9_PT,
]

const ALL_SPELLS_EN: Spell[] = [
  ...SPELLS0_EN,
  ...SPELLS1_EN,
  ...SPELLS2_EN,
  ...SPELLS3_EN,
  ...SPELLS4_EN,
  ...SPELLS5_EN,
  ...SPELLS6_EN,
  ...SPELLS7_EN,
  ...SPELLS8_EN,
  ...SPELLS9_EN,
]

export function getSpells(): Spell[] {
  return i18n.language === 'pt' ? ALL_SPELLS_PT : ALL_SPELLS_EN
}

export function getSpellsByClass(classId: string): Spell[] {
  return getSpells().filter(m => m.classes.includes(classId))
}

export function getCantripsByClass(classId: string): Spell[] {
  return getSpells().filter(m => m.level === 0 && m.classes.includes(classId))
}

export function getSpellsByClassAndLevel(classId: string, maxSpellLevel: number): Spell[] {
  return getSpells().filter(m => m.level > 0 && m.level <= maxSpellLevel && m.classes.includes(classId))
}

// Multi-class variants: deduplication is implicit since each Magia has one entry with all its classes listed
export function getCantripsByClasses(classIds: string[]): Spell[] {
  if (classIds.length === 0) return []
  return getSpells().filter(m => m.level === 0 && m.classes.some(c => classIds.includes(c)))
}

export function getSpellsByClassesAndLevels(
  classes: Array<{ classId: string; maxSpellLevel: number }>,
): Spell[] {
  if (classes.length === 0) return []
  return getSpells().filter(m =>
    m.level > 0 &&
    classes.some(c => m.classes.includes(c.classId) && m.level <= c.maxSpellLevel),
  )
}
// As magias são gravadas na ficha pelo nome, no idioma em que foram escolhidas.
// Este índice permite reencontrá-las depois de uma troca de idioma.
const INDEX_BY_NAME = new Map<string, string>()
for (const list of [ALL_SPELLS_PT, ALL_SPELLS_EN]) {
  for (const m of list) INDEX_BY_NAME.set(m.name.toLowerCase(), m.id)
}

/** Resolve uma magia salva (nome em qualquer idioma, ou id) para o idioma atual. */
export function resolveSpell(nameOrId: string): Spell | null {
  const spells = getSpells()
  const id = INDEX_BY_NAME.get(nameOrId.toLowerCase()) ?? nameOrId
  return spells.find(m => m.id === id) ?? null
}
