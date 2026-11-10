import i18n from '../../i18n'
import { gameData } from '../../data/rules'
import { getBackgrounds } from '../../data/backgrounds'
import { getItems } from '../../data/items'
import { resolveSpell } from '../../data/spells'
import { ABILITIES, calcPassivePerception, formatModifier } from '../calculations'
import type { CharacterSheet, InventoryItem } from '../../types'
import {
  ARMOR_TRAINING,
  ATTACK_ROWS,
  COIN_IDS,
  KEYS,
  PACT_SLOT_CIRCLES,
  SLOT_CIRCLES_PER_LEVEL,
  SPELL_ROWS,
  abilityKey,
  armorKey,
  attackKey,
  coinKey,
  pactSpentKey,
  skillKey,
  slotSpentKey,
  slotTotalKey,
  spellKey,
  type ArmorTraining,
} from './sheetKeys'

/**
 * `export` preenche tudo e sai como PDF final, sem formulário. `print` deixa em
 * branco o que muda em jogo, para ser escrito a lápis, e sai com formulário
 * editável.
 *
 * O que é "muda em jogo" foi cruzado com três fontes:
 *
 * 1. as regras de 2024 — Descanso Longo devolve todos os PV e **todos** os dados
 *    de vida gastos (mudou em relação a 2014, que devolvia metade), e Descanso
 *    Curto é onde se *gastam* dados de vida;
 * 2. o desenho da ficha — são medidores as caixas em par (atuais/temporários,
 *    total/gastos), as bolinhas de espaços gastos, a experiência e as moedas;
 * 3. as ações do store — o que `longRest`/`shortRest` restauram e o que
 *    `updateHp`, `spendHitDie`, `spendSlot`, `updateCoins` e `addXP` alteram
 *    fora do wizard.
 *
 * Resultado: ficam em branco no modo `print` os PV atuais e temporários, os
 * dados de vida gastos, o XP, os espaços de magia gastos (da Conjuração e da
 * Magia de Pacto) e as moedas.
 *
 * Nunca são preenchidos, em modo nenhum, por não existirem no modelo de dados:
 * testes contra a morte, inspiração heroica e sintonização de itens.
 *
 * As três reservas de magia saem separadas, como no app: os espaços da
 * Conjuração por círculo, a Magia de Pacto numa linha própria e as conjurações
 * sem espaço (Iniciado em Magia, Arcana Mística) em outra. As magias dessas
 * últimas também entram na lista de magias preparadas.
 *
 * Dos recursos de classe (fúrias, pontos de foco, …) sai só o **máximo**, que é
 * derivado do nível; o valor atual é gasto em jogo e fica de fora.
 */
export type SheetPdfMode = 'print' | 'export'

export interface SheetValues {
  texts: Map<string, string>
  marks: Set<string>
}

const ARMOR_CATEGORIES: Record<ArmorTraining, string[]> = {
  light: ['leve', 'light'],
  medium: ['média', 'media', 'medium'],
  heavy: ['pesada', 'heavy'],
  shields: ['escudo', 'escudos', 'shield', 'shields'],
}

type ClassResources = CharacterSheet['class_features']['class_resources']

/** Recursos de classe: só o máximo entra na ficha — o atual muda a cada descanso. */
const CLASS_RESOURCES: Array<[string, (r: ClassResources) => number | null]> = [
  ['resources.rages', r => r.rages.max],
  ['resources.bardicInspiration', r => r.bardic_inspiration.max],
  ['resources.channelDivinity', r => r.channel_divinity.max],
  ['resources.wildShapes', r => r.wild_shapes.max],
  ['resources.sorceryPoints', r => r.sorcery_points.max],
  ['resources.focusPoints', r => r.focus_points.max],
  ['resources.actionSurge', r => r.action_surge.uses],
  ['resources.secondWind', r => r.second_wind.max],
  ['resources.layOnHands', r => r.lay_on_hands.hp_pool],
]

function itemName(item: InventoryItem): string {
  if (item.name) return item.name
  const catalog = getItems().find(i => i.id === item.item_id)
  return catalog?.name ?? item.item_id ?? '?'
}

const list = (items: Array<string | null | undefined>) => items.filter(Boolean).join('\n')

/** O tipo diz `string`, mas espécies com dois tamanhos (Humano: Médio ou Pequeno) trazem uma lista. */
function formatSize(size: string | string[] | undefined): string | undefined {
  return Array.isArray(size) ? size.join(' / ') : size
}

/** O que vai em cada campo da ficha (`sheetKeys`), no idioma atual da interface. */
export function buildSheetValues(sheet: CharacterSheet, mode: SheetPdfMode): SheetValues {
  const texts = new Map<string, string>()
  const marks = new Set<string>()
  const complete = mode === 'export'

  const text = (key: string, value: unknown) => {
    if (value === null || value === undefined || value === '') return
    texts.set(key, String(value))
  }
  /** Só sai no modo `export`; no modo `print` fica em branco. */
  const volatile = (key: string, value: unknown) => {
    if (complete) text(key, value)
  }
  const mark = (key: string, on: boolean | null | undefined) => {
    if (on) marks.add(key)
  }
  /** Bolinhas de gasto: as `spent` primeiras, só no modo `export`. */
  const spentMarks = (keyOf: (circle: number) => string, circles: number, spent: number) => {
    if (!complete) return
    for (let i = 0; i < Math.min(circles, spent); i++) marks.add(keyOf(i))
  }

  const { identity, combat, spellcasting, inventory, personality, proficiencies } = sheet

  // ---- identidade
  const multiclasses = identity.multiclasses ?? []
  const charClass = gameData.classes.find(c => c.id === identity.class_id)
  const species = gameData.species?.find(e => e.id === identity.species_id)
  const background = getBackgrounds().find(a => a.id === identity.background_id)
  const subclass = charClass?.subclasses.find(s => s.id === identity.subclass_id)
  const primaryLevel = identity.level - multiclasses.reduce((sum, m) => sum + m.level, 0)

  text(KEYS.name, identity.character_name)
  text(KEYS.background, background?.name)
  text(
    KEYS.charClass,
    multiclasses.length === 0
      ? charClass?.name
      : [
          `${charClass?.name ?? '?'} ${primaryLevel}`,
          ...multiclasses.map(m => `${gameData.classes.find(c => c.id === m.class_id)?.name ?? '?'} ${m.level}`),
        ].join(' / '),
  )
  const lineage = species?.lineages?.find(l => l.id === identity.lineage_id)
  text(KEYS.species, lineage ? `${species?.name} (${lineage.name})` : species?.name)
  text(
    KEYS.subclass,
    [
      subclass?.name,
      ...multiclasses.map(m => {
        const mc = gameData.classes.find(c => c.id === m.class_id)
        return mc?.subclasses.find(s => s.id === m.subclass_id)?.name
      }),
    ]
      .filter(Boolean)
      .join(' / '),
  )
  text(KEYS.level, identity.level)
  volatile(KEYS.xp, identity.xp)

  // ---- combate
  const hitDice = combat.hit_dice
  text(KEYS.ac, combat.armor_class.value)
  mark(KEYS.shield, combat.armor_class.shield_equipped)
  text(KEYS.hpMax, combat.hit_points.max)
  volatile(KEYS.hpCurrent, combat.hit_points.current)
  volatile(KEYS.hpTemp, combat.hit_points.temporary || null)
  text(KEYS.hitDice, hitDice.total ? `${hitDice.total}${hitDice.type ?? ''}` : null)
  volatile(KEYS.hitDiceSpent, hitDice.spent || null)
  text(KEYS.proficiency, formatModifier(combat._proficiency_bonus))
  text(KEYS.initiative, formatModifier(combat.initiative._value))
  text(KEYS.speed, combat.speed._total_meters ? `${combat.speed._total_meters} m` : null)
  text(KEYS.size, formatSize(species?.size))
  text(KEYS.passivePerception, calcPassivePerception(sheet.skills.percepcao?._value ?? 0))

  // ---- atributos, salvaguardas e perícias
  for (const ability of ABILITIES) {
    const save = combat.saves[ability]
    text(abilityKey(ability, 'mod'), formatModifier(sheet.abilities[ability]._modifier))
    text(abilityKey(ability, 'score'), sheet.abilities[ability].value)
    text(abilityKey(ability, 'save'), formatModifier(save?._value ?? null))
    mark(abilityKey(ability, 'save_prof'), save?.proficient)
  }

  for (const [id, skill] of Object.entries(sheet.skills)) {
    text(skillKey(id, 'val'), formatModifier(skill._value))
    // Especialização pressupõe proficiência: as duas bolinhas saem marcadas.
    mark(skillKey(id, 'prof'), skill.proficient || skill.expertise)
    mark(skillKey(id, 'exp'), skill.expertise)
  }

  // ---- ataques
  combat.attacks.slice(0, ATTACK_ROWS).forEach((attack, i) => {
    text(attackKey(i, 'name'), attack.name)
    text(attackKey(i, 'bonus'), formatModifier(attack._attack_bonus))
    text(attackKey(i, 'damage'), [attack._damage, attack.damage_type].filter(Boolean).join(' '))
    text(attackKey(i, 'notes'), attack.notes)
  })

  // ---- características, talentos e proficiências
  const resources = sheet.class_features.class_resources
  text(
    KEYS.classFeatures,
    list([
      ...sheet.class_features.active.map(c => c.name),
      ...CLASS_RESOURCES.flatMap(([key, max]) => {
        const total = max(resources)
        return total ? [`${i18n.t(key)}: ${total}`] : []
      }),
    ]),
  )
  text(KEYS.speciesTraits, list(sheet.species_traits.active_traits.map(t => t.name)))
  text(KEYS.feats, list(sheet.feats.list.map(t => t.name)))
  text(KEYS.weapons, proficiencies.weapons.join(', '))
  text(KEYS.tools, proficiencies.tools.join(', '))

  const armors = proficiencies.armors.map(a => a.toLowerCase())
  for (const armor of ARMOR_TRAINING) {
    mark(armorKey(armor), armors.some(a => ARMOR_CATEGORIES[armor].includes(a)))
  }

  // ---- magia
  // Iniciado em Magia dá magias a quem não tem classe conjuradora — daí o `||`.
  if (spellcasting.spellcaster || spellcasting.free_casts.length > 0) {
    const ability = spellcasting.spellcasting_ability
    text(KEYS.castAbility, ability ? i18n.t(`attrs.${ability}`) : null)
    text(KEYS.castModifier, ability ? formatModifier(sheet.abilities[ability]._modifier) : null)
    text(KEYS.castDc, spellcasting._spell_dc)
    text(KEYS.castAttack, formatModifier(spellcasting._spell_attack_bonus))

    SLOT_CIRCLES_PER_LEVEL.forEach((circles, i) => {
      const level = i + 1
      const slot = spellcasting.spell_slots[`c${level}` as keyof typeof spellcasting.spell_slots]
      if (!slot?.max) return
      text(slotTotalKey(level), slot.max)
      spentMarks(c => slotSpentKey(level, c), circles, slot.spent)
    })

    const pact = spellcasting.pact_slots
    if (pact.max > 0) {
      text(KEYS.pactLevel, pact.level)
      text(KEYS.pactTotal, pact.max)
      spentMarks(pactSpentKey, PACT_SLOT_CIRCLES, pact.spent)
    }

    text(
      KEYS.freeCasts,
      spellcasting.free_casts
        .flatMap(c => (c.spell ? [`${resolveSpell(c.spell)?.name ?? c.spell} (${c.max}×)`] : []))
        .join(' · '),
    )

    const spellNames = [
      ...Object.values(spellcasting.cantrips_by_class).flat(),
      ...Object.values(spellcasting.spells_by_class).flat(),
      // Iniciado em Magia e Arcana Mística: sempre preparadas, mas não vêm de
      // nenhuma classe do personagem, então não estão nos mapas acima.
      ...spellcasting.free_casts.flatMap(c => [...c.cantrips, ...(c.spell ? [c.spell] : [])]),
    ]
    const prepared = [...new Set(spellNames)]
      .map(name => resolveSpell(name))
      .filter((m): m is NonNullable<typeof m> => m !== null)
      .sort((a, b) => a.level - b.level || a.name.localeCompare(b.name))

    prepared.slice(0, SPELL_ROWS).forEach((m, i) => {
      text(spellKey(i, 'level'), m.level)
      text(spellKey(i, 'name'), m.name)
      text(spellKey(i, 'time'), m.casting_time)
      text(spellKey(i, 'range'), m.range)
      mark(spellKey(i, 'c'), m.concentration)
      mark(spellKey(i, 'r'), m.ritual)
      mark(spellKey(i, 'm'), m.componentes?.includes('M'))
      text(spellKey(i, 'notes'), [m.damage, m.damage_type].filter(Boolean).join(' ') || m.duration)
    })
  }

  // ---- inventário e perfil
  text(
    KEYS.equipment,
    list(inventory.items.map(item => (item.quantity > 1 ? `${item.quantity}× ${itemName(item)}` : itemName(item)))),
  )
  for (const coin of COIN_IDS) volatile(coinKey(coin), inventory.coins[coin] || null)

  text(KEYS.appearance, personality.appearance_description)
  text(
    KEYS.personality,
    list([personality.backstory, ...personality.traits, ...personality.ideals, ...personality.bonds, ...personality.flaws]),
  )
  text(KEYS.alignment, [identity.alignment.ethical, identity.alignment.moral].filter(Boolean).join(' '))
  text(KEYS.languages, proficiencies.languages.join(', '))

  return { texts, marks }
}
