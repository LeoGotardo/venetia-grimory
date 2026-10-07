import { v4 as uuidv4 } from 'uuid'
import type { Combatant, Encounter, PartyMember, StatBlock } from '../../types'
import { initiativeBonus } from './statblock'
import { parseDice, rollDice } from './dice'
import { CONCENTRATION_DC_MAX, CONCENTRATION_DC_MIN, CONDITION_UNCONSCIOUS, DEFAULT_SPEED_METERS } from '../../constants'

// ── Montagem ──────────────────────────────────────────────────────────────────

type CombatantBase = Omit<Combatant, 'kind' | 'ref_id' | 'name' | 'init_bonus' | 'ac' | 'hp' | 'statblock' | 'level' | 'size' | 'speed_m'>

function baseCombatant(): CombatantBase {
  return {
    id: uuidv4(), initiative: null, conditions: [], concentration: false, hidden: false, defeated: false,
    notes: '', position: null, movement_used_m: 0, dash: false,
  }
}

export function combatantFromPlayer(member: PartyMember): Combatant {
  const sheet = member.snapshot
  const max = sheet.combat.hit_points.max ?? 1
  return {
    ...baseCombatant(),
    kind: 'player',
    ref_id: member.id,
    name: sheet.identity.character_name || '?',
    init_bonus: sheet.combat.initiative._value ?? 0,
    ac: sheet.combat.armor_class.value ?? 10,
    hp: { current: max, max, temp: 0 },
    statblock: null,
    level: sheet.identity.level,
    // A ficha não guarda tamanho; as espécies jogáveis de 2024 são Pequenas ou Médias (1 casa).
    size: 'medium',
    speed_m: sheet.combat.speed._total_meters || DEFAULT_SPEED_METERS,
  }
}

export function combatantFromStatBlock(
  kind: 'npc' | 'monster',
  refId: string | null,
  block: StatBlock,
  name: string,
): Combatant {
  return {
    ...baseCombatant(),
    kind,
    ref_id: refId,
    name,
    init_bonus: initiativeBonus(block),
    ac: block.ac,
    hp: { current: block.hp.average, max: block.hp.average, temp: 0 },
    statblock: structuredClone(block),
    level: null,
    size: block.size,
    speed_m: block.speed.walk,
  }
}

/**
 * Nomes para `count` cópias: "Goblin" sozinho fica "Goblin"; vários viram
 * "Goblin 1…N", continuando a numeração de quem já está no encontro.
 */
export function numberedNames(base: string, existing: string[], count: number): string[] {
  const pattern = new RegExp(`^${base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?: (\\d+))?$`)
  const taken = existing.map(n => pattern.exec(n)).filter(Boolean) as RegExpExecArray[]
  if (count === 1 && taken.length === 0) return [base]
  const highest = taken.reduce((max, m) => Math.max(max, m[1] ? Number(m[1]) : 1), 0)
  return Array.from({ length: count }, (_, i) => `${base} ${highest + i + 1}`)
}

// ── Iniciativa e turnos ───────────────────────────────────────────────────────

/** d20 + bônus. Devolve o dado para o log. */
export function rollInitiative(c: Combatant, random: () => number = Math.random): { roll: number; total: number } {
  const roll = rollDice({ terms: [{ count: 1, sides: 20, sign: 1 }], bonus: 0 }, random).total
  return { roll, total: roll + c.init_bonus }
}

/**
 * Maior iniciativa primeiro; empate pelo bônus (a regra de 2024 deixa o
 * desempate com o mestre — o bônus maior é o critério usual); sem iniciativa vai
 * para o fim. Estável: quem empata em tudo mantém a ordem em que entrou.
 */
export function sortByInitiative(combatants: Combatant[]): Combatant[] {
  return combatants
    .map((c, i) => ({ c, i }))
    .sort((a, b) =>
      (b.c.initiative ?? -Infinity) - (a.c.initiative ?? -Infinity)
      || b.c.init_bonus - a.c.init_bonus
      || a.i - b.i)
    .map(x => x.c)
}

function inTurnOrder(encounter: Encounter): Combatant[] {
  return encounter.combatants.filter(c => !c.defeated)
}

export function startEncounter(encounter: Encounter): Encounter {
  const combatants = sortByInitiative(encounter.combatants)
  return {
    ...encounter,
    combatants,
    status: 'active',
    round: 1,
    turn_id: combatants.find(c => !c.defeated)?.id ?? null,
  }
}

/**
 * Passa a vez. Pula derrotados; dar a volta na lista começa uma rodada nova.
 * Voltando, não passa da rodada 1.
 */
export function advanceTurn(encounter: Encounter, direction: 1 | -1 = 1): Encounter {
  const order = inTurnOrder(encounter)
  if (order.length === 0) return { ...encounter, turn_id: null }

  const idx = order.findIndex(c => c.id === encounter.turn_id)
  if (idx === -1) return { ...encounter, turn_id: order[0].id }

  let next = idx + direction
  let round = encounter.round
  if (next >= order.length) {
    next = 0
    round += 1
  } else if (next < 0) {
    if (round <= 1) return encounter
    next = order.length - 1
    round -= 1
  }
  return { ...encounter, turn_id: order[next].id, round }
}

/**
 * Depois de mexer na lista (derrotar, remover, reordenar): se o dono do turno
 * saiu da ordem, a vez passa para o próximo dele na lista completa.
 */
export function repairTurn(encounter: Encounter, previous: Combatant[]): Encounter {
  if (encounter.status !== 'active') return encounter
  const order = inTurnOrder(encounter)
  if (order.some(c => c.id === encounter.turn_id)) return encounter
  if (order.length === 0) return { ...encounter, turn_id: null }

  const oldIdx = previous.findIndex(c => c.id === encounter.turn_id)
  const after = previous.slice(oldIdx + 1).find(c => order.some(o => o.id === c.id))
  return { ...encounter, turn_id: (after ?? order[0]).id }
}

// ── Pontos de vida ────────────────────────────────────────────────────────────

/** CD da salvaguarda de Constituição para manter concentração. */
export function concentrationDc(damage: number): number {
  return Math.min(CONCENTRATION_DC_MAX, Math.max(CONCENTRATION_DC_MIN, Math.floor(damage / 2)))
}

/**
 * Dano: PV temporário absorve primeiro. A 0 PV, monstro/NPC fica derrotado e
 * player fica Inconsciente (testes de morte ficam com a mesa).
 */
export function applyDamage(c: Combatant, amount: number): { combatant: Combatant; concentrationDc: number | null } {
  const dmg = Math.max(0, Math.floor(amount))
  const absorbed = Math.min(c.hp.temp, dmg)
  const current = Math.max(0, c.hp.current - (dmg - absorbed))
  const down = current === 0 && dmg > 0
  const combatant: Combatant = {
    ...c,
    hp: { ...c.hp, temp: c.hp.temp - absorbed, current },
    defeated: c.defeated || (down && c.kind !== 'player'),
    conditions: down && c.kind === 'player' && !c.conditions.includes(CONDITION_UNCONSCIOUS)
      ? [...c.conditions, CONDITION_UNCONSCIOUS]
      : c.conditions,
  }
  return { combatant, concentrationDc: c.concentration && dmg > 0 ? concentrationDc(dmg) : null }
}

/** Cura até o máximo. Sair de 0 PV desfaz o "derrotado" e o Inconsciente. */
export function applyHealing(c: Combatant, amount: number): Combatant {
  const heal = Math.max(0, Math.floor(amount))
  if (heal === 0) return c
  const wasDown = c.hp.current === 0
  return {
    ...c,
    hp: { ...c.hp, current: Math.min(c.hp.max, c.hp.current + heal) },
    defeated: wasDown ? false : c.defeated,
    conditions: wasDown ? c.conditions.filter(x => x !== CONDITION_UNCONSCIOUS) : c.conditions,
  }
}

/** PV temporários não se somam: fica o maior (2024). */
export function applyTempHp(c: Combatant, amount: number): Combatant {
  return { ...c, hp: { ...c.hp, temp: Math.max(c.hp.temp, Math.max(0, Math.floor(amount))) } }
}

// ── Ações do bloco ────────────────────────────────────────────────────────────

export function rollAttack(attackBonus: number, random: () => number = Math.random) {
  const roll = Math.floor(random() * 20) + 1
  return { roll, total: roll + attackBonus, crit: roll === 20, fumble: roll === 1 }
}

/** Crítico rola o dobro de dados; o bônus fixo entra uma vez só. `null` se o texto não for dados. */
export function rollDamage(damage: string, crit: boolean, random: () => number = Math.random) {
  const parsed = parseDice(damage)
  if (!parsed) return null
  const expression = crit
    ? { ...parsed, terms: parsed.terms.map(t => ({ ...t, count: t.count * 2 })) }
    : parsed
  const { total, rolls } = rollDice(expression, random)
  return { total: Math.max(0, total), rolls }
}
