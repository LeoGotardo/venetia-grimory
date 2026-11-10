/**
 * Diagramação da ficha do Grimório de Venetia: duas páginas A4 descritas como
 * uma lista de elementos, sem pdf-lib. As medidas estão em px do desenho
 * aprovado (794 × 1123, origem no canto superior esquerdo, margem de 40); o
 * `drawSheet` converte para pontos e inverte o eixo y.
 *
 * O layout é próprio — não segue a diagramação de nenhuma ficha oficial. As
 * informações são as que uma ficha da 5ª edição precisa ter.
 */
import type { AbilityId } from '../../types/gameData'
import {
  ARMOR_TRAINING,
  ATTACK_ROWS,
  ATTUNEMENT_ROWS,
  COIN_IDS,
  KEYS,
  PACT_SLOT_CIRCLES,
  SLOT_CIRCLES_PER_LEVEL,
  SPELL_ROWS_PER_COLUMN,
  abilityKey,
  armorKey,
  attackKey,
  attunementKey,
  coinKey,
  pactSpentKey,
  skillKey,
  slotSpentKey,
  slotTotalKey,
  spellKey,
  type ArmorTraining,
  type CoinId,
} from './sheetKeys'

export const PAGE_WIDTH = 794
export const PAGE_HEIGHT = 1123
export const PAGE_MARGIN = 40

export type FontId = 'regular' | 'bold' | 'title'
export type Ink = 'ink' | 'label' | 'line' | 'faint' | 'accent'

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

interface TextStyle {
  size: number
  font: FontId
  color: Ink
  /** Espaçamento entre letras, em em. */
  tracking?: number
}

export type TrailingItem = { dot: true } | { text: string }

export type LayoutElement =
  | { kind: 'box'; rect: Rect; radius: number; accentTop?: boolean }
  | { kind: 'line'; x1: number; y1: number; x2: number; y2: number; color: Ink; width: number }
  | ({
      kind: 'text'
      text: string
      x: number
      /** Linha de base. */
      baseline: number
      align?: 'left' | 'center' | 'right'
      /** Largura disponível: o texto quebra (`wrap`) ou encolhe (`shrink`) para caber. */
      maxWidth?: number
      fit?: 'wrap' | 'shrink'
    } & TextStyle)
  /** Título de seção: texto em Cinzel e filete dourado até `ruleTo`, com itens opcionais à direita. */
  | ({ kind: 'title'; text: string; x: number; centerY: number; ruleTo: number; gap: number; trailing?: TrailingItem[] } & TextStyle)
  | { kind: 'circle'; cx: number; cy: number; r: number; width: number }
  /** Marca de seleção: o contorno sempre, preenchida quando a chave está nas marcas. */
  | { kind: 'mark'; key: string; shape: 'circle' | 'square'; cx: number; cy: number; r: number; width: number }
  /** Rótulo seguido de caixinhas com nome, em sequência (os treinamentos em armadura). */
  | { kind: 'checklist'; x: number; centerY: number; label: string; items: Array<{ key: string; text: string }> }
  | { kind: 'ruled'; rect: Rect; step: number; offset: number }
  | { kind: 'gem'; x: number; y: number; size: number }
  | {
      kind: 'field'
      key: string
      rect: Rect
      size: number
      font: FontId
      align: 'left' | 'center' | 'right'
      valign: 'center' | 'bottom'
      /** Corpo mínimo antes de cortar com reticências (células de tabela: legível vence completo). */
      minSize?: number
      multiline?: { lineHeight: number; columns?: number; columnGap?: number }
    }

export interface SheetLabels {
  brand: string
  characterName: string
  charClass: string
  subclass: string
  level: string
  species: string
  background: string
  xp: string
  armorClass: string
  shield: string
  initiative: string
  speed: string
  size: string
  proficiency: string
  passivePerception: string
  heroicInspiration: string
  hitPoints: string
  hpMax: string
  hpCurrent: string
  hpTemp: string
  hitDice: string
  hitDiceTotal: string
  hitDiceSpent: string
  deathSaves: string
  successes: string
  failures: string
  abilitiesTitle: string
  proficient: string
  expertise: string
  modifier: string
  savingThrow: string
  noSkills: string
  attacksTitle: string
  attackName: string
  attackBonus: string
  attackDamage: string
  attackNotes: string
  classFeatures: string
  speciesTraits: string
  feats: string
  training: string
  armor: string
  armorTraining: Record<ArmorTraining, string>
  weapons: string
  tools: string
  footer: string
  page: (n: number, total: number) => string
  spellcasting: string
  castAbility: string
  castModifier: string
  castDc: string
  castAttack: string
  slots: string
  slotsHint: string
  slotLevel: (n: number) => string
  pactMagic: string
  pactLevel: string
  pactSlots: string
  freeCasts: string
  spellsTitle: string
  spellsLegend: string
  spellLevel: string
  spellName: string
  spellTime: string
  spellRange: string
  concentrationShort: string
  ritualShort: string
  materialShort: string
  spellNotes: string
  appearance: string
  languages: string
  alignment: string
  personality: string
  equipment: string
  attunement: string
  coins: string
  coinCodes: Record<CoinId, string>
  abilities: Array<{ id: AbilityId; name: string; skills: Array<{ id: string; name: string }> }>
}

const X0 = PAGE_MARGIN
const X1 = PAGE_WIDTH - PAGE_MARGIN
const CONTENT_WIDTH = X1 - X0
const FOOTER_BASELINE = 1080

const LABEL: TextStyle = { size: 8.5, font: 'bold', color: 'label', tracking: 0.08 }
const SMALL_LABEL: TextStyle = { size: 8, font: 'bold', color: 'label', tracking: 0.08 }
const TITLE: TextStyle = { size: 11, font: 'title', color: 'ink', tracking: 0.14 }
/** Menor corpo nas células das tabelas de ataques e magias. */
const TABLE_MIN_SIZE = 7

/** Colunas de mesma largura dentro de `width`. */
function columns(x: number, width: number, count: number, gap: number): Array<{ x: number; w: number }> {
  const w = (width - gap * (count - 1)) / count
  return Array.from({ length: count }, (_, i) => ({ x: x + i * (w + gap), w }))
}

/** Colunas proporcionais aos pesos, como `flex` no desenho. */
function weighted(x: number, width: number, weights: number[], gap: number): Array<{ x: number; w: number }> {
  const total = weights.reduce((a, b) => a + b, 0)
  const free = width - gap * (weights.length - 1)
  let cursor = x
  return weights.map(weight => {
    const w = (free * weight) / total
    const col = { x: cursor, w }
    cursor += w + gap
    return col
  })
}

const upper = (text: string) => text.toLocaleUpperCase()

type TextElement = Extract<LayoutElement, { kind: 'text' }>

function label(text: string, x: number, baseline: number, style: TextStyle = LABEL, extra: Partial<TextElement> = {}): TextElement {
  return { kind: 'text', text: upper(text), x, baseline, ...style, ...extra }
}

function title(text: string, x: number, y: number, ruleTo: number, trailing?: TrailingItem[]): LayoutElement {
  return { kind: 'title', text: upper(text), x, centerY: y + 8, ruleTo, gap: 10, trailing, ...TITLE }
}

function footer(labels: SheetLabels, page: number): LayoutElement[] {
  const style: TextStyle = { size: 8, font: 'regular', color: 'label', tracking: 0.04 }
  return [
    { kind: 'text', text: labels.footer, x: X0, baseline: FOOTER_BASELINE, ...style },
    { kind: 'text', text: labels.page(page, 2), x: X1, baseline: FOOTER_BASELINE, align: 'right', ...style },
  ]
}

/** Campo com sublinhado e rótulo embaixo (identidade, tendência). */
function underlinedField(key: string, rect: Rect, size: number, caption: string, font: FontId = 'regular'): LayoutElement[] {
  return [
    { kind: 'field', key, rect, size, font, align: 'left', valign: 'bottom' },
    { kind: 'line', x1: rect.x, y1: rect.y + rect.h, x2: rect.x + rect.w, y2: rect.y + rect.h, color: 'line', width: 1 },
    label(caption, rect.x, rect.y + rect.h + 9.5),
  ]
}

function multilineBox(key: string, box: Rect, lineHeight: number, padding = { x: 8, y: 6 }): LayoutElement[] {
  return [
    { kind: 'box', rect: box, radius: 6 },
    {
      kind: 'field',
      key,
      rect: { x: box.x + padding.x, y: box.y + padding.y, w: box.w - padding.x * 2, h: box.h - padding.y * 2 },
      size: 9.5,
      font: 'regular',
      align: 'left',
      valign: 'bottom',
      multiline: { lineHeight },
    },
  ]
}

// ─── Página 1 ────────────────────────────────────────────────────────────────

function page1Header(l: SheetLabels): LayoutElement[] {
  const leftWidth = CONTENT_WIDTH - 404 - 18
  const elements: LayoutElement[] = [
    { kind: 'gem', x: X0, y: 40, size: 18 },
    { kind: 'title', text: upper(l.brand), x: X0 + 26, centerY: 49, ruleTo: X0 + leftWidth, gap: 8, size: 10, font: 'title', color: 'ink', tracking: 0.2 },
    { kind: 'field', key: KEYS.name, rect: { x: X0, y: 78, w: leftWidth, h: 34 }, size: 24, font: 'title', align: 'left', valign: 'bottom' },
    { kind: 'line', x1: X0, y1: 112, x2: X0 + leftWidth, y2: 112, color: 'ink', width: 1.5 },
    label(l.characterName, X0, 122.5),
  ]
  const cells: Array<[string, string]> = [
    [KEYS.charClass, l.charClass],
    [KEYS.subclass, l.subclass],
    [KEYS.level, l.level],
    [KEYS.species, l.species],
    [KEYS.background, l.background],
    [KEYS.xp, l.xp],
  ]
  const cols = columns(X1 - 404, 404, 3, 12)
  cells.forEach(([key, caption], i) => {
    const col = cols[i % 3]
    const y = i < 3 ? 52 : 93
    elements.push(...underlinedField(key, { x: col.x, y, w: col.w, h: 20 }, 12.5, caption))
  })
  return elements
}

function page1Vitals(l: SheetLabels): LayoutElement[] {
  const elements: LayoutElement[] = []
  const top = 140
  const tiles: Array<{ caption: string; key?: string; size?: number; accent?: boolean }> = [
    { caption: l.armorClass, key: KEYS.ac, accent: true },
    { caption: l.initiative, key: KEYS.initiative },
    { caption: l.speed, key: KEYS.speed },
    { caption: l.size, key: KEYS.size, size: 16 },
    { caption: l.proficiency, key: KEYS.proficiency },
    { caption: l.passivePerception, key: KEYS.passivePerception },
    { caption: l.heroicInspiration },
  ]
  columns(X0, CONTENT_WIDTH, tiles.length, 8).forEach((col, i) => {
    const tile = tiles[i]
    const cx = col.x + col.w / 2
    elements.push({ kind: 'box', rect: { x: col.x, y: top, w: col.w, h: 66 }, radius: 5, accentTop: tile.accent })
    elements.push(label(tile.caption, cx, top + 12.5, SMALL_LABEL, { align: 'center', maxWidth: col.w - 8, fit: 'wrap' }))
    if (tile.key) {
      elements.push({ kind: 'field', key: tile.key, rect: { x: col.x + 4, y: top + 22, w: col.w - 8, h: 26 }, size: tile.size ?? 20, font: 'bold', align: 'center', valign: 'center' })
    } else {
      // Inspiração heroica: não existe no modelo de dados, fica para o lápis.
      elements.push({ kind: 'circle', cx, cy: top + 36, r: 9, width: 1.5 })
    }
    if (tile.accent) {
      elements.push({ kind: 'mark', key: KEYS.shield, shape: 'square', cx: col.x + 26, cy: top + 56.5, r: 4, width: 1 })
      elements.push(label(l.shield, col.x + 34, top + 59.5, SMALL_LABEL, { font: 'regular' }))
    }
  })

  const rowTop = 214
  const [hp, dice, death] = weighted(X0, CONTENT_WIDTH, [2.4, 1.3, 1.3], 8)
  const pairBoxes = (box: { x: number; w: number }, caption: string, cells: Array<{ key: string; caption: string; size: number }>) => {
    elements.push({ kind: 'box', rect: { x: box.x, y: rowTop, w: box.w, h: 78 }, radius: 5 })
    elements.push(label(caption, box.x + 8, rowTop + 12.5))
    columns(box.x + 8, box.w - 16, cells.length, 8).forEach((col, i) => {
      const rect = { x: col.x, y: rowTop + 21, w: col.w, h: 39 }
      elements.push({ kind: 'box', rect, radius: 4 })
      elements.push({ kind: 'field', key: cells[i].key, rect, size: cells[i].size, font: 'bold', align: 'center', valign: 'center' })
      elements.push(label(cells[i].caption, col.x + col.w / 2, rowTop + 69, SMALL_LABEL, { font: 'regular', align: 'center' }))
    })
  }
  pairBoxes(hp, l.hitPoints, [
    { key: KEYS.hpMax, caption: l.hpMax, size: 18 },
    { key: KEYS.hpCurrent, caption: l.hpCurrent, size: 18 },
    { key: KEYS.hpTemp, caption: l.hpTemp, size: 18 },
  ])
  pairBoxes(dice, l.hitDice, [
    { key: KEYS.hitDice, caption: l.hitDiceTotal, size: 15 },
    { key: KEYS.hitDiceSpent, caption: l.hitDiceSpent, size: 15 },
  ])

  // Testes contra a morte: não existem no modelo de dados, ficam para o lápis.
  elements.push({ kind: 'box', rect: { x: death.x, y: rowTop, w: death.w, h: 78 }, radius: 5 })
  elements.push(label(l.deathSaves, death.x + 10, rowTop + 12.5, LABEL, { maxWidth: death.w - 20, fit: 'shrink' }))
  ;[
    { caption: l.successes, cy: rowTop + 42 },
    { caption: l.failures, cy: rowTop + 62 },
  ].forEach(row => {
    elements.push({ kind: 'text', text: row.caption, x: death.x + 10, baseline: row.cy + 3.4, size: 9.5, font: 'regular', color: 'ink' })
    for (let i = 0; i < 3; i++) elements.push({ kind: 'circle', cx: death.x + death.w - 15.5 - i * 17, cy: row.cy, r: 5.5, width: 1.2 })
  })
  return elements
}

function page1Abilities(l: SheetLabels): LayoutElement[] {
  const elements: LayoutElement[] = [
    title(l.abilitiesTitle, X0, 306, X1, [{ dot: true }, { text: l.proficient }, { dot: true }, { dot: true }, { text: l.expertise }]),
  ]
  const cols = columns(X0, CONTENT_WIDTH, 3, 10)
  l.abilities.forEach((ability, i) => {
    const { x, w } = cols[i % 3]
    const y = 328 + Math.floor(i / 3) * 126
    const cx = x + 36
    const rx = x + 73
    const rw = w - 82
    elements.push(
      { kind: 'box', rect: { x, y, w, h: 116 }, radius: 6 },
      { kind: 'text', text: upper(ability.name), x: cx, baseline: y + 15, align: 'center', maxWidth: 60, fit: 'shrink', size: 9.5, font: 'title', color: 'ink', tracking: 0.08 },
      { kind: 'circle', cx, cy: y + 46, r: 23, width: 1.5 },
      { kind: 'field', key: abilityKey(ability.id, 'mod'), rect: { x: cx - 20, y: y + 33, w: 40, h: 26 }, size: 19, font: 'bold', align: 'center', valign: 'center' },
      label(l.modifier, cx, y + 79, { size: 7.5, font: 'regular', color: 'label', tracking: 0.06 }, { align: 'center', maxWidth: 62, fit: 'shrink' }),
      { kind: 'box', rect: { x: cx - 17, y: y + 86, w: 34, h: 18 }, radius: 4 },
      { kind: 'field', key: abilityKey(ability.id, 'score'), rect: { x: cx - 17, y: y + 86, w: 34, h: 18 }, size: 11, font: 'regular', align: 'center', valign: 'center' },
      { kind: 'mark', key: abilityKey(ability.id, 'save_prof'), shape: 'circle', cx: rx + 3.5, cy: y + 14.5, r: 3.5, width: 1 },
      { kind: 'field', key: abilityKey(ability.id, 'save'), rect: { x: rx + 21, y: y + 7, w: 22, h: 15 }, size: 9.5, font: 'bold', align: 'right', valign: 'center' },
      { kind: 'text', text: l.savingThrow, x: rx + 48, baseline: y + 18, size: 9.5, font: 'bold', color: 'ink', maxWidth: rw - 48, fit: 'shrink' },
      { kind: 'line', x1: rx, y1: y + 23, x2: rx + rw, y2: y + 23, color: 'faint', width: 1 },
    )
    if (ability.skills.length === 0) {
      elements.push({ kind: 'text', text: l.noSkills, x: rx, baseline: y + 36, size: 8.5, font: 'regular', color: 'label' })
    }
    ability.skills.forEach((skill, k) => {
      const cy = y + 32 + k * 16
      elements.push(
        { kind: 'mark', key: skillKey(skill.id, 'prof'), shape: 'circle', cx: rx + 3.5, cy, r: 3.5, width: 1 },
        { kind: 'mark', key: skillKey(skill.id, 'exp'), shape: 'circle', cx: rx + 12.5, cy, r: 3.5, width: 1 },
        { kind: 'field', key: skillKey(skill.id, 'val'), rect: { x: rx + 21, y: cy - 7, w: 22, h: 14 }, size: 9.5, font: 'bold', align: 'right', valign: 'center' },
        { kind: 'text', text: skill.name, x: rx + 48, baseline: cy + 3.4, size: 9.5, font: 'regular', color: 'ink', maxWidth: rw - 48, fit: 'shrink' },
      )
    })
  })
  return elements
}

function page1Attacks(l: SheetLabels): LayoutElement[] {
  const top = 606
  const inner = { x: X0 + 10, w: CONTENT_WIDTH - 20 }
  const widths = [0.31, 0.13, 0.22, 0.34].map(p => p * inner.w)
  const xs = widths.map((_, i) => inner.x + widths.slice(0, i).reduce((a, b) => a + b, 0))
  const captions = [l.attackName, l.attackBonus, l.attackDamage, l.attackNotes]
  const parts = ['name', 'bonus', 'damage', 'notes'] as const
  const elements: LayoutElement[] = [
    title(l.attacksTitle, X0, 584, X1),
    { kind: 'box', rect: { x: X0, y: top, w: CONTENT_WIDTH, h: 148 }, radius: 6 },
    ...captions.map((caption, i) => label(caption, xs[i], top + 16, SMALL_LABEL)),
    { kind: 'line', x1: inner.x, y1: top + 18.5, x2: inner.x + inner.w, y2: top + 18.5, color: 'line', width: 1 },
  ]
  for (let row = 0; row < ATTACK_ROWS; row++) {
    const y = top + 19 + row * 21
    parts.forEach((part, c) => {
      elements.push({
        kind: 'field',
        key: attackKey(row, part),
        rect: { x: xs[c], y, w: widths[c] - 6, h: 21 },
        size: part === 'notes' ? 9 : 10,
        font: part === 'name' ? 'bold' : 'regular',
        align: 'left',
        valign: 'center',
        minSize: TABLE_MIN_SIZE,
      })
    })
    elements.push({ kind: 'line', x1: inner.x, y1: y + 21, x2: inner.x + inner.w, y2: y + 21, color: 'faint', width: 1 })
  }
  return elements
}

function page1Bottom(l: SheetLabels): LayoutElement[] {
  const [left, right] = weighted(X0, CONTENT_WIDTH, [1.45, 1], 14)
  const box = { x: left.x, y: 790, w: left.w, h: 267 }
  const content = { x: box.x + 10, y: box.y + 6, w: box.w - 20, h: box.h - 12 }
  const columnGap = 16
  const elements: LayoutElement[] = [
    title(l.classFeatures, left.x, 768, left.x + left.w),
    { kind: 'box', rect: box, radius: 6 },
    { kind: 'ruled', rect: content, step: 16, offset: 15 },
    { kind: 'line', x1: content.x + (content.w - columnGap) / 2 + columnGap / 2, y1: content.y, x2: content.x + (content.w - columnGap) / 2 + columnGap / 2, y2: content.y + content.h, color: 'faint', width: 1 },
    { kind: 'field', key: KEYS.classFeatures, rect: content, size: 9.5, font: 'regular', align: 'left', valign: 'bottom', multiline: { lineHeight: 16, columns: 2, columnGap } },
  ]

  elements.push(title(l.speciesTraits, right.x, 768, right.x + right.w))
  elements.push(...multilineBox(KEYS.speciesTraits, { x: right.x, y: 789, w: right.w, h: 71 }, 14, { x: 8, y: 5 }))
  elements.push(title(l.feats, right.x, 868, right.x + right.w))
  elements.push(...multilineBox(KEYS.feats, { x: right.x, y: 889, w: right.w, h: 49 }, 14, { x: 8, y: 5 }))

  elements.push(title(l.training, right.x, 946, right.x + right.w))
  elements.push({ kind: 'box', rect: { x: right.x, y: 967, w: right.w, h: 90 }, radius: 6 })
  const ix = right.x + 8
  const iw = right.w - 16
  elements.push({
    kind: 'checklist',
    x: ix,
    centerY: 979,
    label: upper(l.armor),
    items: ARMOR_TRAINING.map(a => ({ key: armorKey(a), text: l.armorTraining[a] })),
  })
  elements.push(label(l.weapons, ix, 997, SMALL_LABEL))
  elements.push({ kind: 'field', key: KEYS.weapons, rect: { x: ix, y: 1000, w: iw, h: 16 }, size: 9.5, font: 'regular', align: 'left', valign: 'bottom' })
  elements.push({ kind: 'line', x1: ix, y1: 1016, x2: ix + iw, y2: 1016, color: 'faint', width: 1 })
  elements.push(label(l.tools, ix, 1028, SMALL_LABEL))
  elements.push({ kind: 'field', key: KEYS.tools, rect: { x: ix, y: 1031, w: iw, h: 16 }, size: 9.5, font: 'regular', align: 'left', valign: 'bottom' })
  elements.push({ kind: 'line', x1: ix, y1: 1047, x2: ix + iw, y2: 1047, color: 'faint', width: 1 })
  return elements
}

// ─── Página 2 ────────────────────────────────────────────────────────────────

function page2Header(l: SheetLabels): LayoutElement[] {
  const nameX = X1 - 300
  return [
    { kind: 'gem', x: X0, y: 54, size: 18 },
    { kind: 'title', text: upper(l.brand), x: X0 + 26, centerY: 63, ruleTo: nameX - 18, gap: 8, size: 10, font: 'title', color: 'ink', tracking: 0.2 },
    { kind: 'field', key: KEYS.name, rect: { x: nameX, y: 50, w: 300, h: 26 }, size: 17, font: 'title', align: 'left', valign: 'bottom' },
    { kind: 'line', x1: nameX, y1: 76, x2: X1, y2: 76, color: 'ink', width: 1.5 },
    label(l.characterName, nameX, 86.5),
  ]
}

function page2Spellcasting(l: SheetLabels): LayoutElement[] {
  const elements: LayoutElement[] = [title(l.spellcasting, X0, 102, X1)]
  const tiles: Array<{ caption: string; key: string; size: number }> = [
    { caption: l.castAbility, key: KEYS.castAbility, size: 14 },
    { caption: l.castModifier, key: KEYS.castModifier, size: 19 },
    { caption: l.castDc, key: KEYS.castDc, size: 19 },
    { caption: l.castAttack, key: KEYS.castAttack, size: 19 },
  ]
  columns(X0, CONTENT_WIDTH, 4, 8).forEach((col, i) => {
    elements.push(
      { kind: 'box', rect: { x: col.x, y: 124, w: col.w, h: 56 }, radius: 5, accentTop: i === 0 },
      label(tiles[i].caption, col.x + col.w / 2, 141, SMALL_LABEL, { align: 'center', maxWidth: col.w - 12, fit: 'shrink' }),
      { kind: 'field', key: tiles[i].key, rect: { x: col.x + 6, y: 147, w: col.w - 12, h: 24 }, size: tiles[i].size, font: 'bold', align: 'center', valign: 'center' },
    )
  })

  // Espaços de magia da Conjuração, por círculo.
  elements.push({ kind: 'box', rect: { x: X0, y: 188, w: CONTENT_WIDTH, h: 62 }, radius: 6 })
  elements.push(label(l.slots, X0 + 8, 199, SMALL_LABEL))
  elements.push({ kind: 'text', text: l.slotsHint, x: X1 - 8, baseline: 199, align: 'right', size: 8, font: 'regular', color: 'label' })
  columns(X0 + 9, CONTENT_WIDTH - 18, 9, 6).forEach((col, i) => {
    const level = i + 1
    const cx = col.x + 4 + (col.w - 4) / 2
    elements.push(
      { kind: 'line', x1: col.x, y1: 205, x2: col.x, y2: 245, color: 'faint', width: 1 },
      { kind: 'text', text: l.slotLevel(level), x: cx - 4, baseline: 216.9, align: 'right', size: 11, font: 'title', color: 'ink' },
      { kind: 'box', rect: { x: cx + 1, y: 205, w: 22, h: 16 }, radius: 3 },
      { kind: 'field', key: slotTotalKey(level), rect: { x: cx + 1, y: 205, w: 22, h: 16 }, size: 10, font: 'bold', align: 'center', valign: 'center' },
    )
    const circles = SLOT_CIRCLES_PER_LEVEL[i]
    const start = cx - (circles * 9 + (circles - 1) * 3) / 2 + 4.5
    for (let k = 0; k < circles; k++) {
      elements.push({ kind: 'mark', key: slotSpentKey(level, k), shape: 'circle', cx: start + k * 12, cy: 240, r: 4.5, width: 1.2 })
    }
  })

  // Magia de Pacto e conjurações sem espaço, cada uma na sua reserva.
  const [pact, free] = weighted(X0, CONTENT_WIDTH, [1, 1.35], 8)
  elements.push(
    { kind: 'box', rect: { x: pact.x, y: 256, w: pact.w, h: 26 }, radius: 5 },
    label(l.pactMagic, pact.x + 8, 272, SMALL_LABEL, { maxWidth: 82, fit: 'shrink' }),
    { kind: 'text', text: l.pactLevel, x: pact.x + 96, baseline: 272.4, size: 9.5, font: 'regular', color: 'ink', maxWidth: 36, fit: 'shrink' },
    { kind: 'box', rect: { x: pact.x + 134, y: 261.5, w: 22, h: 15 }, radius: 3 },
    { kind: 'field', key: KEYS.pactLevel, rect: { x: pact.x + 134, y: 261.5, w: 22, h: 15 }, size: 9.5, font: 'bold', align: 'center', valign: 'center' },
    { kind: 'text', text: l.pactSlots, x: pact.x + 164, baseline: 272.4, size: 9.5, font: 'regular', color: 'ink', maxWidth: 40, fit: 'shrink' },
    { kind: 'box', rect: { x: pact.x + 206, y: 261.5, w: 22, h: 15 }, radius: 3 },
    { kind: 'field', key: KEYS.pactTotal, rect: { x: pact.x + 206, y: 261.5, w: 22, h: 15 }, size: 9.5, font: 'bold', align: 'center', valign: 'center' },
  )
  for (let k = 0; k < PACT_SLOT_CIRCLES; k++) {
    elements.push({ kind: 'mark', key: pactSpentKey(k), shape: 'circle', cx: pact.x + 242.5 + k * 12, cy: 269, r: 4.5, width: 1.2 })
  }
  elements.push(
    { kind: 'box', rect: { x: free.x, y: 256, w: free.w, h: 26 }, radius: 5 },
    label(l.freeCasts, free.x + 8, 272, SMALL_LABEL, { maxWidth: 80, fit: 'shrink' }),
    { kind: 'field', key: KEYS.freeCasts, rect: { x: free.x + 92, y: 256, w: free.w - 100, h: 26 }, size: 9.5, font: 'regular', align: 'left', valign: 'center' },
  )
  return elements
}

function page2Spells(l: SheetLabels): LayoutElement[] {
  const elements: LayoutElement[] = [title(l.spellsTitle, X0, 294, X1, [{ text: l.spellsLegend }])]
  // Colunas dentro de cada tabela: [início, fim] a partir da margem interna.
  const cols = {
    level: [0, 26],
    name: [30, 121],
    time: [125, 169],
    range: [173, 221],
    c: [225, 238],
    r: [242, 255],
    m: [259, 272],
    notes: [276, 334],
  } as const
  const captions: Array<[keyof typeof cols, string]> = [
    ['level', l.spellLevel],
    ['name', l.spellName],
    ['time', l.spellTime],
    ['range', l.spellRange],
    ['c', l.concentrationShort],
    ['r', l.ritualShort],
    ['m', l.materialShort],
    ['notes', l.spellNotes],
  ]
  columns(X0, CONTENT_WIDTH, 2, 14).forEach((table, t) => {
    const ix = table.x + 8
    elements.push({ kind: 'box', rect: { x: table.x, y: 316, w: table.w, h: 292 }, radius: 6 })
    for (const [col, caption] of captions) {
      const [from, to] = cols[col]
      const centered = col === 'c' || col === 'r' || col === 'm' || col === 'level'
      elements.push(
        label(caption, centered ? ix + (from + to) / 2 : ix + from, 332, { size: 7.5, font: 'bold', color: 'label', tracking: 0.06 }, {
          align: centered ? 'center' : 'left',
          maxWidth: to - from + (centered ? 4 : 0),
          fit: 'shrink',
        }),
      )
    }
    elements.push({ kind: 'line', x1: ix, y1: 334.5, x2: ix + 334, y2: 334.5, color: 'line', width: 1 })
    for (let i = 0; i < SPELL_ROWS_PER_COLUMN; i++) {
      const row = t * SPELL_ROWS_PER_COLUMN + i
      const y = 335 + i * 18
      const cell = (col: keyof typeof cols): Rect => ({ x: ix + cols[col][0], y, w: cols[col][1] - cols[col][0], h: 18 })
      elements.push(
        { kind: 'field', key: spellKey(row, 'level'), rect: cell('level'), size: 9, font: 'bold', align: 'center', valign: 'center' },
        { kind: 'field', key: spellKey(row, 'name'), rect: cell('name'), size: 9, font: 'bold', align: 'left', valign: 'center', minSize: TABLE_MIN_SIZE },
        { kind: 'field', key: spellKey(row, 'time'), rect: cell('time'), size: 9, font: 'regular', align: 'left', valign: 'center', minSize: TABLE_MIN_SIZE },
        { kind: 'field', key: spellKey(row, 'range'), rect: cell('range'), size: 9, font: 'regular', align: 'left', valign: 'center', minSize: TABLE_MIN_SIZE },
        { kind: 'field', key: spellKey(row, 'notes'), rect: cell('notes'), size: 8, font: 'regular', align: 'left', valign: 'center', minSize: TABLE_MIN_SIZE },
      )
      for (const mark of ['c', 'r', 'm'] as const) {
        const [from, to] = cols[mark]
        elements.push({ kind: 'mark', key: spellKey(row, mark), shape: 'square', cx: ix + (from + to) / 2, cy: y + 9, r: 4, width: 1 })
      }
      elements.push({ kind: 'line', x1: ix, y1: y + 18, x2: ix + 334, y2: y + 18, color: 'faint', width: 1 })
    }
  })
  return elements
}

function page2Bottom(l: SheetLabels): LayoutElement[] {
  const [c1, c2, c3] = columns(X0, CONTENT_WIDTH, 3, 14)
  const elements: LayoutElement[] = [
    title(l.appearance, c1.x, 620, c1.x + c1.w),
    ...multilineBox(KEYS.appearance, { x: c1.x, y: 641, w: c1.w, h: 189 }, 15),
    title(l.languages, c1.x, 838, c1.x + c1.w),
    ...multilineBox(KEYS.languages, { x: c1.x, y: 859, w: c1.w, h: 148 }, 15),
    ...underlinedField(KEYS.alignment, { x: c1.x, y: 1017, w: c1.w, h: 20 }, 11, l.alignment),

    title(l.personality, c2.x, 620, c2.x + c2.w),
    { kind: 'box', rect: { x: c2.x, y: 641, w: c2.w, h: 418 }, radius: 6 },
    { kind: 'ruled', rect: { x: c2.x + 8, y: 647, w: c2.w - 16, h: 406 }, step: 15, offset: 14 },
    { kind: 'field', key: KEYS.personality, rect: { x: c2.x + 8, y: 647, w: c2.w - 16, h: 406 }, size: 9.5, font: 'regular', align: 'left', valign: 'bottom', multiline: { lineHeight: 15 } },

    title(l.equipment, c3.x, 620, c3.x + c3.w),
    ...multilineBox(KEYS.equipment, { x: c3.x, y: 641, w: c3.w, h: 250 }, 15),
    title(l.attunement, c3.x, 899, c3.x + c3.w),
  ]
  // Sintonização: não existe no modelo de dados, fica para o lápis (ou o formulário).
  for (let i = 0; i < ATTUNEMENT_ROWS; i++) {
    const cy = 930 + i * 20
    elements.push(
      { kind: 'circle', cx: c3.x + 4.5, cy, r: 4.5, width: 1.2 },
      { kind: 'field', key: attunementKey(i), rect: { x: c3.x + 15, y: cy - 9, w: c3.w - 15, h: 14 }, size: 9.5, font: 'regular', align: 'left', valign: 'bottom' },
      { kind: 'line', x1: c3.x + 15, y1: cy + 5, x2: c3.x + c3.w, y2: cy + 5, color: 'line', width: 1 },
    )
  }
  elements.push(title(l.coins, c3.x, 989, c3.x + c3.w))
  columns(c3.x, c3.w, COIN_IDS.length, 5).forEach((col, i) => {
    const coin = COIN_IDS[i]
    const rect = { x: col.x, y: 1010, w: col.w, h: 37 }
    elements.push(
      { kind: 'box', rect, radius: 4 },
      { kind: 'field', key: coinKey(coin), rect, size: 11, font: 'bold', align: 'center', valign: 'center' },
      label(l.coinCodes[coin], col.x + col.w / 2, 1056, SMALL_LABEL, { align: 'center' }),
    )
  })
  return elements
}

export function buildSheetLayout(labels: SheetLabels): LayoutElement[][] {
  return [
    [
      ...page1Header(labels),
      ...page1Vitals(labels),
      ...page1Abilities(labels),
      ...page1Attacks(labels),
      ...page1Bottom(labels),
      ...footer(labels, 1),
    ],
    [...page2Header(labels), ...page2Spellcasting(labels), ...page2Spells(labels), ...page2Bottom(labels), ...footer(labels, 2)],
  ]
}
