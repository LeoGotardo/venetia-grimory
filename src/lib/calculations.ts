import type { AbilityId, Armor } from '../types'
import { CASTER_TYPE, SUBCLASS_LEVEL, THIRD_CASTER_SUBCLASSES } from '../constants'

export function calcModifier(value: number): number {
  return Math.floor((value - 10) / 2)
}

export function calcProfBonus(level: number): number {
  return Math.ceil(level / 4) + 1
}

/** Nível na classe primária: total menos os níveis alocados nas multiclasses. */
export function calcPrimaryClassLevel(
  totalLevel: number,
  multiclasses: Array<{ level: number }> = [],
): number {
  return totalLevel - multiclasses.reduce((sum, m) => sum + m.level, 0)
}

/** Subclasse só é liberada com 3+ níveis NAQUELA classe, não no nível total. */
export function canChooseSubclass(classLevel: number): boolean {
  return classLevel >= SUBCLASS_LEVEL
}

export function calcHpAtLevel1(hitDie: number, conMod: number): number {
  return hitDie + conMod
}

export function calcHpPerLevel(hitDie: number, conMod: number): number {
  return Math.floor(hitDie / 2 + 1) + conMod
}

export function calcTotalHp(level: number, hitDie: number, conMod: number): number {
  const hp1 = calcHpAtLevel1(hitDie, conMod)
  if (level <= 1) return hp1
  const extra = (level - 1) * calcHpPerLevel(hitDie, conMod)
  return hp1 + extra
}

export function calcMulticlassHp(
  classes: Array<{ hitDie: number; level: number; isPrimary: boolean }>,
  conMod: number,
): number {
  return classes.reduce((total, c) => {
    if (c.level <= 0) return total
    const perLevel = Math.floor(c.hitDie / 2 + 1) + conMod
    if (c.isPrimary) {
      return total + (c.hitDie + conMod) + Math.max(0, c.level - 1) * perLevel
    }
    return total + c.level * perLevel
  }, 0)
}

const MULTICLASS_SLOT_TABLE: Record<number, Partial<Record<string, number>>> = {
  1:  { c1:2 },
  2:  { c1:3 },
  3:  { c1:4, c2:2 },
  4:  { c1:4, c2:3 },
  5:  { c1:4, c2:3, c3:2 },
  6:  { c1:4, c2:3, c3:3 },
  7:  { c1:4, c2:3, c3:3, c4:1 },
  8:  { c1:4, c2:3, c3:3, c4:2 },
  9:  { c1:4, c2:3, c3:3, c4:3, c5:1 },
  10: { c1:4, c2:3, c3:3, c4:3, c5:2 },
  11: { c1:4, c2:3, c3:3, c4:3, c5:2, c6:1 },
  12: { c1:4, c2:3, c3:3, c4:3, c5:2, c6:1 },
  13: { c1:4, c2:3, c3:3, c4:3, c5:2, c6:1, c7:1 },
  14: { c1:4, c2:3, c3:3, c4:3, c5:2, c6:1, c7:1 },
  15: { c1:4, c2:3, c3:3, c4:3, c5:2, c6:1, c7:1, c8:1 },
  16: { c1:4, c2:3, c3:3, c4:3, c5:2, c6:1, c7:1, c8:1 },
  17: { c1:4, c2:3, c3:3, c4:3, c5:2, c6:1, c7:1, c8:1, c9:1 },
  18: { c1:4, c2:3, c3:3, c4:3, c5:3, c6:1, c7:1, c8:1, c9:1 },
  19: { c1:4, c2:3, c3:3, c4:3, c5:3, c6:2, c7:1, c8:1, c9:1 },
  20: { c1:4, c2:3, c3:3, c4:3, c5:3, c6:2, c7:2, c8:1, c9:1 },
}

/**
 * Nível de conjurador para a tabela de multiclasse (PHB 2024, "Espaços de Magia"):
 * níveis inteiros em bardo/clérigo/druida/feiticeiro/mago, METADE ARREDONDADA PARA
 * CIMA em paladino/guardião, e UM TERÇO ARREDONDADO PARA BAIXO dos níveis de
 * guerreiro/ladino com subclasse de 1/3 conjurador.
 *
 * O bruxo (`pacto`) fica de fora de propósito: Magia de Pacto é uma reserva
 * separada — veja `calcPactCasterLevel`.
 */
export function calcMulticlassCasterLevel(
  classes: Array<{ classId: string; subclassId: string | null; level: number }>,
): number {
  return classes.reduce((total, c) => {
    const type = CASTER_TYPE[c.classId]
    if (type === 'pacto') return total
    if (type === 'completo') return total + c.level
    if (type === 'meio') return total + Math.ceil(c.level / 2)
    if (c.subclassId && THIRD_CASTER_SUBCLASSES.includes(c.subclassId)) {
      return total + Math.floor(c.level / 3)
    }
    return total
  }, 0)
}

/** Soma dos níveis nas classes de Magia de Pacto (bruxo), que alimentam a reserva própria. */
export function calcPactCasterLevel(
  classes: Array<{ classId: string; level: number }>,
): number {
  return classes.reduce(
    (total, c) => (CASTER_TYPE[c.classId] === 'pacto' ? total + c.level : total),
    0,
  )
}

export function calcMulticlassSlots(casterLevel: number): Partial<Record<string, number>> {
  const level = Math.max(0, Math.min(20, casterLevel))
  return MULTICLASS_SLOT_TABLE[level] ?? {}
}

/**
 * Cavaleiro Místico e Trapaceiro Arcano têm tabela PRÓPRIA de espaços, que não é
 * a do multiclasse: no nível 4, por exemplo, a subclasse dá 3 espaços de 1º
 * círculo e a tabela de multiclasse daria 2. As duas subclasses usam a mesma
 * tabela (PHB 2024, "Eldritch Knight Spellcasting" / "Arcane Trickster
 * Spellcasting"), indexada pelo nível NA CLASSE.
 */
const THIRD_CASTER_SLOT_TABLE: Record<number, Partial<Record<string, number>>> = {
  3:  { c1:2 },
  4:  { c1:3 },
  5:  { c1:3 },
  6:  { c1:3 },
  7:  { c1:4, c2:2 },
  8:  { c1:4, c2:2 },
  9:  { c1:4, c2:2 },
  10: { c1:4, c2:3 },
  11: { c1:4, c2:3 },
  12: { c1:4, c2:3 },
  13: { c1:4, c2:3, c3:2 },
  14: { c1:4, c2:3, c3:2 },
  15: { c1:4, c2:3, c3:2 },
  16: { c1:4, c2:3, c3:3 },
  17: { c1:4, c2:3, c3:3 },
  18: { c1:4, c2:3, c3:3 },
  19: { c1:4, c2:3, c3:3, c4:1 },
  20: { c1:4, c2:3, c3:3, c4:1 },
}

/** Magias preparadas do 1/3 conjurador, por nível na classe (PHB 2024). */
const THIRD_CASTER_PREPARED: Record<number, number> = {
  3:3, 4:4, 5:4, 6:4, 7:5, 8:6, 9:6, 10:7, 11:8, 12:8,
  13:9, 14:10, 15:10, 16:11, 17:11, 18:11, 19:12, 20:13,
}

export function calcThirdCasterSlots(classLevel: number): Partial<Record<string, number>> {
  return THIRD_CASTER_SLOT_TABLE[Math.max(0, Math.min(20, classLevel))] ?? {}
}

export function calcThirdCasterPreparedSpells(classLevel: number): number {
  return THIRD_CASTER_PREPARED[Math.max(0, Math.min(20, classLevel))] ?? 0
}

/**
 * Truques do 1/3 conjurador: 2 no Cavaleiro Místico, 3 no Trapaceiro Arcano
 * (Mão Mágica já entra na conta), mais um ao chegar no nível 10 da classe.
 */
export function calcThirdCasterCantrips(subclassId: string | null, classLevel: number): number {
  if (!isThirdCaster(subclassId) || classLevel < SUBCLASS_LEVEL) return 0
  const base = subclassId === 'trapaceiro_arcano' ? 3 : 2
  return classLevel >= 10 ? base + 1 : base
}

export function isThirdCaster(subclassId: string | null): boolean {
  return subclassId != null && THIRD_CASTER_SUBCLASSES.includes(subclassId)
}

/** A classe conjura — pela própria classe ou por uma subclasse de 1/3 conjurador. */
export function isCasterClass(classId: string, subclassId: string | null): boolean {
  return CASTER_TYPE[classId] != null || isThirdCaster(subclassId)
}

/**
 * Qual lista do catálogo de magias a classe usa. Cavaleiro Místico e Trapaceiro
 * Arcano conjuram da lista de mago, não de uma lista de guerreiro/ladino — que
 * nem existe.
 */
export function spellListForClass(classId: string, subclassId: string | null): string {
  return isThirdCaster(subclassId) ? 'mago' : classId
}

export function calcAc(params: {
  armor: Armor | null
  dexMod: number
  conMod: number
  wisMod: number
  classIds: string[]
  shield: boolean
}): number {
  const { armor, dexMod, conMod, wisMod, classIds, shield } = params
  const shieldBonus = shield ? 2 : 0

  if (!armor) {
    if (classIds.includes('barbaro')) return 10 + dexMod + conMod + shieldBonus
    if (classIds.includes('monge')) return 10 + dexMod + wisMod + shieldBonus
    return 10 + dexMod + shieldBonus
  }

  const acStr = String(armor.ac)
  if (armor.category === 'Leve') {
    const base = parseInt(acStr.split('+')[0])
    return base + dexMod + shieldBonus
  }
  if (armor.category === 'Média') {
    const base = parseInt(acStr.split('+')[0])
    return base + Math.min(dexMod, 2) + shieldBonus
  }
  if (armor.category === 'Pesada') {
    return parseInt(acStr) + shieldBonus
  }
  if (armor.category === 'Escudo') {
    return 10 + dexMod + shieldBonus
  }
  return 10 + dexMod + shieldBonus
}

export function calcSave(abilityMod: number, proficient: boolean, profBonus: number): number {
  return abilityMod + (proficient ? profBonus : 0)
}

export function calcSkill(abilityMod: number, proficient: boolean, expertise: boolean, profBonus: number): number {
  if (expertise) return abilityMod + profBonus * 2
  if (proficient) return abilityMod + profBonus
  return abilityMod
}

export function calcPassivePerception(perceptionValue: number): number {
  return 10 + perceptionValue
}

export function calcSpellDc(profBonus: number, abilityMod: number): number {
  return 8 + profBonus + abilityMod
}

export function calcSpellAttackBonus(profBonus: number, abilityMod: number): number {
  return profBonus + abilityMod
}

export function calcTotalGp(coins: { PC: number; PP: number; PE: number; PO: number; PL: number }): number {
  return (coins.PC / 100) + (coins.PP / 10) + (coins.PE / 2) + coins.PO + (coins.PL * 10)
}

export function calcMaxCarry(strValue: number): number {
  return strValue * 7.5
}

export function formatModifier(mod: number | null): string {
  if (mod === null) return '—'
  return mod >= 0 ? `+${mod}` : `${mod}`
}

export const ABILITIES: AbilityId[] = ['FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR']

/** Nome do atributo no idioma da interface (recebe o `t` do react-i18next). */
export function abilityName(attr: AbilityId, t: (key: string) => string): string {
  return t(`attrs.${attr}`)
}

/** Nomes em português — fallback para contextos sem i18n. */
export const ABILITY_NAMES: Record<AbilityId, string> = {
  FOR: 'Força',
  DES: 'Destreza',
  CON: 'Constituição',
  INT: 'Inteligência',
  SAB: 'Sabedoria',
  CAR: 'Carisma',
}

export const XP_PER_LEVEL: Record<number, number> = {
  1: 0, 2: 300, 3: 900, 4: 2700, 5: 6500, 6: 14000, 7: 23000, 8: 34000,
  9: 48000, 10: 64000, 11: 85000, 12: 100000, 13: 120000, 14: 140000,
  15: 165000, 16: 195000, 17: 225000, 18: 260000, 19: 300000, 20: 355000,
}
