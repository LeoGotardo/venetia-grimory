import type { CharacterSheet, InventoryItem } from '../types'
import { gameDataPt } from '../data/rules'
import { getSpells, resolveSpell, resolveSpellPt, type Spell } from '../data/spells'
import { getItems, type MagicItem } from '../data/items'
import { spellListForClass } from './calculations'
import { parseRoomRoll } from './room/rolls'
import type { SaveAbility, TableCombatant, TableState } from './room/protocol'

/**
 * O que o player faz na vez dele pela mesa da sala, a partir da própria ficha:
 * Ataque Desarmado (com Agarrar e Empurrar) e lançar magia. Puro: a UI monta o
 * pedido, o servidor rola e o mestre aplica.
 */

const MONK = 'monge'
const TAVERN_BRAWLER = 'valentao_de_taverna'

const signed = (n: number) => (n === 0 ? '' : n > 0 ? `+${n}` : `${n}`)

/** Nível numa classe: a principal é o nível total menos o das multiclasses. */
function classLevel(sheet: CharacterSheet, classId: string): number {
  const { class_id, level, multiclasses } = sheet.identity
  const secondary = multiclasses.find(m => m.class_id === classId)
  if (secondary) return secondary.level
  return class_id === classId ? level - multiclasses.reduce((sum, m) => sum + m.level, 0) : 0
}

export interface UnarmedStrike {
  ability: 'FOR' | 'DES'
  attackBonus: number
  /** Expressão de dano; sem dado é fixa ("1+FOR"). */
  damage: string
  /** CD da salvaguarda do Agarrar e do Empurrar. */
  dc: number
}

/**
 * Ataque Desarmado (2024): sempre com proficiência — acerto FOR + PB, dano
 * 1 + FOR de Concussão, CD 8 + FOR + PB para Agarrar e Empurrar. O monge rola o
 * dado de Artes Marciais e pode usar DES nos três; o Valentão de Taverna rola 1d4.
 */
export function unarmedStrike(sheet: CharacterSheet): UnarmedStrike {
  const str = sheet.abilities.FOR._modifier ?? 0
  const dex = sheet.abilities.DES._modifier ?? 0
  const pb = sheet.combat._proficiency_bonus ?? 2
  const monkLevel = classLevel(sheet, MONK)
  const row = monkLevel > 0
    ? gameDataPt.classes.find(c => c.id === MONK)?.progression.find(p => p.level === monkLevel)
    : undefined
  const martialDie = typeof row?.dado_artes_marciais === 'string' ? row.dado_artes_marciais : null
  const ability = martialDie && dex > str ? 'DES' : 'FOR'
  const mod = ability === 'DES' ? dex : str
  const die = martialDie ?? (sheet.feats.list.some(f => f.feat_id === TAVERN_BRAWLER) ? '1d4' : null)
  return { ability, attackBonus: mod + pb, damage: die ? `${die}${signed(mod)}` : String(1 + mod), dc: 8 + mod + pb }
}

const SAVE_BY_NAME: ReadonlyArray<[string, SaveAbility]> = [
  ['Força', 'FOR'], ['Destreza', 'DES'], ['Constituição', 'CON'],
  ['Inteligência', 'INT'], ['Sabedoria', 'SAB'], ['Carisma', 'CAR'],
]

/** Atributo da salvaguarda a partir do `save` do catálogo PT ("Destreza (para…)" → DES). */
export function spellSaveAbility(save: string | undefined): SaveAbility | null {
  if (!save) return null
  return SAVE_BY_NAME.find(([name]) => save.startsWith(name))?.[1] ?? null
}

/** `heal`: cura rolada que o mestre aplica (Curar Ferimentos, Palavra de Cura). */
export type CastMode = 'attack' | 'save' | 'heal' | 'none'

/**
 * Como a magia se resolve, pelo catálogo: com salvaguarda, ataque mágico quando
 * só tem dano, senão sem rolagem. É sugestão — o catálogo não marca ataque nem
 * acerto automático (Mísseis Mágicos), e o player pode trocar.
 */
export function suggestedMode(rules: Spell | null): CastMode {
  if (spellSaveAbility(rules?.save)) return 'save'
  return rules?.damage ? 'attack' : 'none'
}

/**
 * Dano sugerido: o do catálogo quando é uma expressão rolável (texto livre como
 * "2d6 (por raio)" fica vazio). Truque de um dado só escala nos níveis 5, 11 e
 * 17 (2024). Elevar o círculo não entra: o catálogo não traz a escala.
 */
export function suggestedDamage(spell: Pick<Spell, 'level' | 'damage'>, characterLevel: number): string {
  const text = spell.damage?.replace(/\s+/g, '') ?? ''
  const parsed = text ? parseRoomRoll(text) : null
  if (!parsed) return ''
  if (spell.level !== 0 || parsed.terms.length !== 1) return text
  const tier = characterLevel >= 17 ? 4 : characterLevel >= 11 ? 3 : characterLevel >= 5 ? 2 : 1
  const [term] = parsed.terms
  return `${term.count * tier}d${term.sides}${signed(parsed.bonus)}`
}

export interface CastableSpell {
  key: string
  /** No idioma da interface. */
  spell: Spell
  /** O mesmo no catálogo PT, para as regras (`save`). */
  rules: Spell | null
  dc: number | null
  attackBonus: number | null
  /** Magia de uma conjuração grátis (Iniciado em Magia, Arcana Mística): gasta essa reserva. */
  freeCastId: string | null
}

/** O que a ficha pode lançar: truques e magias preparadas de cada classe, e as conjurações grátis. */
export function castableSpells(sheet: CharacterSheet): CastableSpell[] {
  const sc = sheet.spellcasting
  const out: CastableSpell[] = []
  const seen = new Set<string>()
  const push = (ref: string, dc: number | null, attackBonus: number | null, freeCastId: string | null, source: string) => {
    const spell = resolveSpell(ref)
    if (!spell || seen.has(`${spell.id}:${source}`)) return
    seen.add(`${spell.id}:${source}`)
    out.push({ key: `${spell.id}:${source}`, spell, rules: resolveSpellPt(ref), dc, attackBonus, freeCastId })
  }
  for (const [classId, refs] of [...Object.entries(sc.cantrips_by_class), ...Object.entries(sc.spells_by_class)]) {
    const dc = sc._spell_dc_by_class[classId] ?? sc._spell_dc
    const attack = sc._spell_attack_by_class[classId] ?? sc._spell_attack_bonus
    for (const ref of refs) push(ref, dc, attack, null, classId)
  }
  for (const cast of sc.free_casts) {
    for (const ref of cast.cantrips) push(ref, cast._spell_dc, cast._spell_attack_bonus, null, cast.id)
    if (cast.spell) push(cast.spell, cast._spell_dc, cast._spell_attack_bonus, cast.id, cast.id)
  }
  return out.sort((a, b) => a.spell.level - b.spell.level || a.spell.name.localeCompare(b.spell.name))
}

/** De onde sai a conjuração: espaço de um círculo, Magia de Pacto ou a reserva grátis. */
export type SlotChoice =
  | { pool: 'slot'; level: number }
  | { pool: 'pact'; level: number }
  | { pool: 'free'; id: string }

/**
 * Como pagar uma magia de 1º círculo ou mais: a conjuração grátis dela, espaços
 * com sobra do círculo dela para cima e a Magia de Pacto, se alcança. Truque
 * não gasta nada; lista vazia = sem como lançar agora.
 */
export function slotChoices(sheet: CharacterSheet, castable: CastableSpell): SlotChoice[] {
  const { level } = castable.spell
  if (level === 0) return []
  const sc = sheet.spellcasting
  const out: SlotChoice[] = []
  const free = castable.freeCastId ? sc.free_casts.find(c => c.id === castable.freeCastId) : null
  if (free && free.spent < free.max) out.push({ pool: 'free', id: free.id })
  for (let n = level; n <= 9; n++) {
    const slot = sc.spell_slots[`c${n}` as keyof typeof sc.spell_slots]
    if (slot && slot.spent < slot.max) out.push({ pool: 'slot', level: n })
  }
  const pact = sc.pact_slots
  if (pact.level != null && pact.level >= level && pact.spent < pact.max) out.push({ pool: 'pact', level: pact.level })
  return out
}

/** Alvos da mesa para quem age: inimigos primeiro; quem já caiu não é alvo. */
export function tableTargets(table: TableState, mine: TableCombatant): TableCombatant[] {
  return table.combatants
    .filter(c => c.id !== mine.id && !c.defeated)
    .sort((a, b) => (a.side === b.side ? 0 : a.side === 'enemy' ? -1 : 1))
}

/** Quem pode receber cura: o próprio primeiro, depois os aliados; caído (0 PV) também, é quando mais precisa. */
export function healTargets(table: TableState, mine: TableCombatant): TableCombatant[] {
  const others = table.combatants.filter(c => c.id !== mine.id)
  return [mine, ...others.filter(c => c.side === mine.side), ...others.filter(c => c.side !== mine.side)]
}

/**
 * CD e bônus de ataque de quem lê um Pergaminho de Magia (2024), pelo círculo:
 * o pergaminho usa os próprios números, não os da ficha.
 */
export const SPELL_SCROLL_STATS: ReadonlyArray<{ dc: number; attack: number }> = [
  { dc: 13, attack: 5 }, { dc: 13, attack: 5 }, { dc: 13, attack: 5 }, { dc: 15, attack: 7 }, { dc: 15, attack: 7 },
  { dc: 17, attack: 9 }, { dc: 17, attack: 9 }, { dc: 18, attack: 10 }, { dc: 18, attack: 10 }, { dc: 19, attack: 11 },
]

export type UsableItem =
  | { kind: 'healing'; idx: number; name: string; heal: string }
  | { kind: 'scroll'; idx: number; name: string; level: number; item: InventoryItem }
  | { kind: 'other'; idx: number; name: string }

/** "2d4 + 2 PV" / "2d4 + 2 HP" → "2d4+2"; vazio se o efeito não é uma cura rolável. */
function healingOf(effect: string | undefined): string {
  const text = effect?.replace(/\s*(PV|HP)\s*$/i, '').replace(/\s+/g, '') ?? ''
  return text && parseRoomRoll(text) ? text : ''
}

/**
 * Consumíveis do inventário que se usam na vez: poções (as de cura rolam a cura)
 * e pergaminhos (o de magia lança a magia escrita nele). Reconhecidos pelo id do
 * catálogo, igual nos dois idiomas; item digitado à mão não entra.
 */
export function usableItems(sheet: CharacterSheet): UsableItem[] {
  const catalog = new Map(getItems().map(item => [item.id, item]))
  return sheet.inventory.items.flatMap((it, idx): UsableItem[] => {
    const id = it.item_id
    const item = id ? catalog.get(id) : undefined
    if (!id || !item || it.quantity < 1 || item.item_type !== 'item_magico') return []
    const magic = item as MagicItem
    if (typeof magic.level === 'number' && magic.spell_id !== undefined) {
      return [{ kind: 'scroll', idx, name: magic.name, level: magic.level, item: it }]
    }
    if (id.startsWith('pocao_') || id.startsWith('potion_')) {
      const heal = healingOf(magic.effect)
      return [heal ? { kind: 'healing', idx, name: magic.name, heal } : { kind: 'other', idx, name: magic.name }]
    }
    return id.startsWith('scroll_') ? [{ kind: 'other', idx, name: magic.name }] : []
  })
}

/**
 * Magias que dá para ler num Pergaminho de Magia desse círculo: só as da lista
 * de uma classe da ficha (2024 — fora dela o pergaminho é ilegível), com a CD e o
 * ataque do pergaminho. A anotação do item, se for o nome de uma magia, vem primeiro.
 */
export function scrollSpells(sheet: CharacterSheet, level: number, note: string | null): CastableSpell[] {
  const { class_id, subclass_id, multiclasses } = sheet.identity
  const lists = new Set([
    ...(class_id ? [spellListForClass(class_id, subclass_id)] : []),
    ...multiclasses.map(m => spellListForClass(m.class_id, m.subclass_id)),
  ])
  const stats = SPELL_SCROLL_STATS[level] ?? SPELL_SCROLL_STATS[0]
  const noted = note ? resolveSpell(note.trim())?.id : undefined
  return getSpells()
    .filter(spell => spell.level === level && spell.classes.some(c => lists.has(c)))
    .sort((a, b) => Number(b.id === noted) - Number(a.id === noted) || a.name.localeCompare(b.name))
    .map(spell => ({ key: `scroll:${spell.id}`, spell, rules: resolveSpellPt(spell.id), dc: stats.dc, attackBonus: stats.attack, freeCastId: null }))
}
