import fontkit from '@pdf-lib/fontkit'
import { PDFDocument, StandardFonts, TextAlignment, rgb, setCharacterSpacing } from 'pdf-lib'
import type { PDFFont, PDFForm, PDFPage, RGB } from 'pdf-lib'
import i18n from '../../i18n'
import type { CharacterSheet } from '../../types'
import { PAGE_WIDTH, buildSheetLayout, type FontId, type Ink, type LayoutElement, type Rect } from './sheetLayout'
import { sheetLabels } from './sheetLabels'
import { buildSheetValues, type SheetPdfMode, type SheetValues } from './sheetValues'
import { fitMultiline, fitSingleLine, sanitizeForFont, wrapLines, type MeasureText } from './textFit'

export type { SheetPdfMode } from './sheetValues'

/**
 * Desenha a ficha do Grimório de Venetia com o pdf-lib, sem modelo: as páginas
 * saem de `buildSheetLayout` e os valores de `buildSheetValues`.
 *
 * - `export`: tudo desenhado direto na página, sem formulário — o PDF final.
 * - `print`: o mesmo desenho, mas os campos viram campos de formulário
 *   (preenchidos com o que é fixo, vazios no que muda em jogo), para escrever
 *   à mão ou no leitor de PDF — exceto o texto de várias linhas já preenchido
 *   (ver `drawField`).
 *
 * Fontes: Helvetica (padrão do PDF, cobre os acentos via WinAnsi) para rótulos
 * e valores; Cinzel Bold, embutida inteira (OFL), nos títulos e no nome. O
 * texto passa por `sanitizeForFont` antes de chegar à fonte: as fontes padrão
 * lançam erro com emoji e outros caracteres fora da WinAnsi.
 */

/** A4 em pontos. */
const PAGE_SIZE: [number, number] = [595.28, 841.89]
/** Pontos por px do desenho. */
const SCALE = PAGE_SIZE[0] / PAGE_WIDTH

const hex = (value: string): RGB =>
  rgb(parseInt(value.slice(1, 3), 16) / 255, parseInt(value.slice(3, 5), 16) / 255, parseInt(value.slice(5, 7), 16) / 255)

const INKS: Record<Ink, RGB> = {
  ink: hex('#1F1B17'),
  label: hex('#5A524A'),
  line: hex('#A99E91'),
  faint: hex('#E2DBD2'),
  accent: hex('#B8860B'),
}
const GEM_STROKE = hex('#2C1A04')
const GEM_FACES: Array<[string, string]> = [
  ['M30 4 L55 22 L5 22 Z', '#7A5D0E'],
  ['M5 22 L30 22 L15 51 Z', '#B08018'],
  ['M55 22 L45 51 L30 22 Z', '#5E4508'],
  ['M30 22 L45 51 L15 51 Z', '#D4A017'],
]

/** Altura das maiúsculas, em em: centraliza o texto na vertical. */
const CAP_HEIGHT: Record<FontId, number> = { regular: 0.718, bold: 0.718, title: 0.7 }
/** Linhas de um rótulo que quebra, em múltiplos do corpo. */
const WRAPPED_LABEL_LEADING = 1.15
/** Pontos entre a linha de base e o fim da caixa nos campos sublinhados. */
const BOTTOM_PADDING = 3

interface FontSet {
  font: PDFFont
  supported: Set<number>
}

interface Context {
  page: PDFPage
  pageIndex: number
  fonts: Record<FontId, FontSet>
  values: SheetValues
  form: PDFForm | null
}

const pt = (px: number) => px * SCALE
const toX = (x: number) => x * SCALE
const toY = (y: number) => PAGE_SIZE[1] - y * SCALE

/** Mede em px do desenho, já contando o espaçamento entre letras. */
function measurer(set: FontSet, tracking = 0): MeasureText {
  return (text, size) => {
    const glyphs = [...text].length
    return (set.font.widthOfTextAtSize(text, pt(size)) + tracking * pt(size) * Math.max(0, glyphs - 1)) / SCALE
  }
}

function clean(ctx: Context, text: string, font: FontId): string {
  return sanitizeForFont(text, ctx.fonts[font].supported)
}

function drawText(
  ctx: Context,
  text: string,
  opts: { x: number; baseline: number; size: number; font: FontId; color: Ink; tracking?: number; align?: 'left' | 'center' | 'right' },
) {
  if (!text) return
  const set = ctx.fonts[opts.font]
  const tracking = opts.tracking ?? 0
  const width = measurer(set, tracking)(text, opts.size)
  const x = opts.align === 'center' ? opts.x - width / 2 : opts.align === 'right' ? opts.x - width : opts.x
  if (tracking) ctx.page.pushOperators(setCharacterSpacing(tracking * pt(opts.size)))
  ctx.page.drawText(text, { x: toX(x), y: toY(opts.baseline), size: pt(opts.size), font: set.font, color: INKS[opts.color] })
  if (tracking) ctx.page.pushOperators(setCharacterSpacing(0))
}

function roundedRectPath(w: number, h: number, r: number): string {
  const k = r * 0.5523
  return [
    `M ${r} 0 L ${w - r} 0 C ${w - r + k} 0 ${w} ${r - k} ${w} ${r}`,
    `L ${w} ${h - r} C ${w} ${h - r + k} ${w - r + k} ${h} ${w - r} ${h}`,
    `L ${r} ${h} C ${r - k} ${h} 0 ${h - r + k} 0 ${h - r}`,
    `L 0 ${r} C 0 ${r - k} ${r - k} 0 ${r} 0 Z`,
  ].join(' ')
}

function drawBox(ctx: Context, rect: Rect, radius: number, accentTop?: boolean) {
  ctx.page.drawSvgPath(roundedRectPath(pt(rect.w), pt(rect.h), pt(radius)), {
    x: toX(rect.x),
    y: toY(rect.y),
    borderColor: INKS.line,
    borderWidth: pt(1),
  })
  if (accentTop) {
    ctx.page.drawLine({
      start: { x: toX(rect.x + radius * 0.6), y: toY(rect.y + 1.5) },
      end: { x: toX(rect.x + rect.w - radius * 0.6), y: toY(rect.y + 1.5) },
      thickness: pt(3),
      color: INKS.accent,
    })
  }
}

function drawLine(ctx: Context, x1: number, y1: number, x2: number, y2: number, color: Ink, width: number) {
  ctx.page.drawLine({ start: { x: toX(x1), y: toY(y1) }, end: { x: toX(x2), y: toY(y2) }, thickness: pt(width), color: INKS[color] })
}

function drawCircle(ctx: Context, cx: number, cy: number, r: number, width: number, filled = false) {
  ctx.page.drawCircle({
    x: toX(cx),
    y: toY(cy),
    size: pt(r),
    borderColor: INKS.ink,
    borderWidth: pt(width),
    ...(filled ? { color: INKS.ink } : {}),
  })
}

function drawSquare(ctx: Context, cx: number, cy: number, r: number, width: number, filled: boolean) {
  ctx.page.drawRectangle({
    x: toX(cx - r),
    y: toY(cy + r),
    width: pt(r * 2),
    height: pt(r * 2),
    borderColor: INKS.ink,
    borderWidth: pt(width),
    ...(filled ? { color: INKS.ink } : {}),
  })
}

function drawStaticText(ctx: Context, el: Extract<LayoutElement, { kind: 'text' }>) {
  const text = clean(ctx, el.text, el.font)
  const measure = measurer(ctx.fonts[el.font], el.tracking)
  if (el.maxWidth && el.fit === 'wrap') {
    wrapLines(text, el.maxWidth, el.size, measure).forEach((line, i) =>
      drawText(ctx, line, { ...el, baseline: el.baseline + i * el.size * WRAPPED_LABEL_LEADING }),
    )
    return
  }
  const fitted = el.maxWidth ? fitSingleLine(text, el.maxWidth, el.size, measure) : { text, size: el.size }
  drawText(ctx, fitted.text, { ...el, size: fitted.size })
}

function drawTitle(ctx: Context, el: Extract<LayoutElement, { kind: 'title' }>) {
  const text = clean(ctx, el.text, el.font)
  const baseline = el.centerY + (CAP_HEIGHT[el.font] * el.size) / 2
  drawText(ctx, text, { ...el, baseline })
  const textEnd = el.x + measurer(ctx.fonts[el.font], el.tracking)(text, el.size)

  // Itens à direita (legendas): da direita para a esquerda, e o filete para antes deles.
  let cursor = el.ruleTo
  for (const item of [...(el.trailing ?? [])].reverse()) {
    if ('dot' in item) {
      drawCircle(ctx, cursor - 3.5, el.centerY, 3.5, 0, true)
      cursor -= 9
      continue
    }
    const label = clean(ctx, item.text, 'regular')
    drawText(ctx, label, { x: cursor, baseline: el.centerY + 2.9, size: 8, font: 'regular', color: 'label', align: 'right' })
    cursor -= measurer(ctx.fonts.regular)(label, 8) + 5
  }
  const ruleEnd = el.trailing?.length ? cursor - el.gap + 5 : el.ruleTo
  if (ruleEnd > textEnd + el.gap) drawLine(ctx, textEnd + el.gap, el.centerY, ruleEnd, el.centerY, 'accent', 1)
}

function drawChecklist(ctx: Context, el: Extract<LayoutElement, { kind: 'checklist' }>) {
  const label = clean(ctx, el.label, 'bold')
  drawText(ctx, label, { x: el.x, baseline: el.centerY + 2.9, size: 8, font: 'bold', color: 'label', tracking: 0.08 })
  let cursor = el.x + measurer(ctx.fonts.bold, 0.08)(label, 8) + 8
  for (const item of el.items) {
    drawSquare(ctx, cursor + 4, el.centerY, 4, 1, ctx.values.marks.has(item.key))
    const text = clean(ctx, item.text, 'regular')
    drawText(ctx, text, { x: cursor + 11, baseline: el.centerY + 3.4, size: 9.5, font: 'regular', color: 'ink' })
    cursor += 11 + measurer(ctx.fonts.regular)(text, 9.5) + 10
  }
}

function drawGem(ctx: Context, x: number, y: number, size: number) {
  const scale = pt(size) / 60
  for (const [path, fill] of GEM_FACES) {
    ctx.page.drawSvgPath(path, { x: toX(x), y: toY(y), scale, color: hex(fill), borderColor: GEM_STROKE, borderWidth: 1.1 })
  }
}

type FieldElement = Extract<LayoutElement, { kind: 'field' }>

function singleLineBaseline(rect: Rect, size: number, el: FieldElement): number {
  if (el.valign === 'bottom') return rect.y + rect.h - Math.max(BOTTOM_PADDING, size * 0.2)
  return rect.y + rect.h / 2 + (CAP_HEIGHT[el.font] * size) / 2
}

/** As colunas de um campo de várias linhas; as linhas enchem uma coluna de cada vez. */
function columnRects(el: FieldElement): Rect[] {
  const count = el.multiline?.columns ?? 1
  const gap = el.multiline?.columnGap ?? 0
  const w = (el.rect.w - gap * (count - 1)) / count
  return Array.from({ length: count }, (_, i) => ({ ...el.rect, x: el.rect.x + i * (w + gap), w }))
}

function drawFieldValue(ctx: Context, el: FieldElement, value: string) {
  const measure = measurer(ctx.fonts[el.font])
  if (el.multiline) {
    const rects = columnRects(el)
    const fitted = fitMultiline(
      value,
      { width: rects[0].w, height: el.rect.h, columns: rects.length },
      { size: el.size, lineHeight: el.multiline.lineHeight },
      measure,
    )
    const rows = Math.max(1, Math.floor(el.rect.h / fitted.lineHeight))
    fitted.lines.forEach((line, i) => {
      const rect = rects[Math.floor(i / rows)] ?? rects[rects.length - 1]
      const row = i % rows
      drawText(ctx, line, { x: rect.x, baseline: rect.y + row * fitted.lineHeight + fitted.lineHeight * 0.75, size: fitted.size, font: el.font, color: 'ink' })
    })
    return
  }
  const fitted = fitSingleLine(value, el.rect.w, el.size, measure, el.minSize)
  const x = el.align === 'center' ? el.rect.x + el.rect.w / 2 : el.align === 'right' ? el.rect.x + el.rect.w : el.rect.x
  drawText(ctx, fitted.text, { x, baseline: singleLineBaseline(el.rect, fitted.size, el), size: fitted.size, font: el.font, color: 'ink', align: el.align })
}

const ALIGNMENT = { left: TextAlignment.Left, center: TextAlignment.Center, right: TextAlignment.Right } as const

/** Campo de formulário sem borda nem fundo: o desenho da página continua aparecendo. */
function addFormField(ctx: Context, form: PDFForm, name: string, rect: Rect, el: FieldElement, text: string, size: number) {
  const field = form.createTextField(name)
  if (el.multiline) field.enableMultiline()
  else field.setAlignment(ALIGNMENT[el.align])
  if (text) field.setText(text)
  const font = ctx.fonts[el.font].font
  field.addToPage(ctx.page, {
    x: toX(rect.x),
    y: toY(rect.y + rect.h),
    width: pt(rect.w),
    height: pt(rect.h),
    font,
    textColor: INKS.ink,
    backgroundColor: undefined,
    borderColor: undefined,
    borderWidth: 0,
  })
  // O corpo vai no /DA, que só existe depois do `addToPage`.
  field.setFontSize(pt(size))
  // Sem isto, o `save()` refaria a aparência com a fonte padrão do formulário.
  field.updateAppearances(font)
}

/** O nome se repete na página 2: lá o campo ganha um sufixo, senão o pdf-lib recusa o nome duplicado. */
function uniqueName(ctx: Context, form: PDFForm, name: string): string {
  return form.getFieldMaybe(name) ? `${name}_p${ctx.pageIndex + 1}` : name
}

function drawFormField(ctx: Context, form: PDFForm, el: FieldElement, value: string) {
  const measure = measurer(ctx.fonts[el.font])
  if (!el.multiline) {
    const fitted = value ? fitSingleLine(value, el.rect.w, el.size, measure, el.minSize) : { text: '', size: el.size }
    addFormField(ctx, form, uniqueName(ctx, form, el.key), el.rect, el, fitted.text, fitted.size)
    return
  }
  const rects = columnRects(el)
  const fitted = value
    ? fitMultiline(value, { width: rects[0].w, height: el.rect.h, columns: rects.length }, { size: el.size, lineHeight: el.multiline.lineHeight }, measure)
    : { lines: [], size: el.size, lineHeight: el.multiline.lineHeight }
  const rows = Math.max(1, Math.floor(el.rect.h / fitted.lineHeight))
  rects.forEach((rect, i) => {
    const name = rects.length > 1 ? `${el.key}_${i + 1}` : el.key
    addFormField(ctx, form, uniqueName(ctx, form, name), rect, el, fitted.lines.slice(i * rows, (i + 1) * rows).join('\n'), fitted.size)
  })
}

/**
 * No modo `print`, texto de várias linhas já preenchido (características,
 * história…) não muda em jogo e sai desenhado, alinhado às linhas da caixa: o
 * campo de formulário do pdf-lib não tem entrelinha ajustável e cruzaria as
 * linhas. Caixas vazias seguem como campo editável.
 */
function drawField(ctx: Context, el: FieldElement) {
  const value = clean(ctx, ctx.values.texts.get(el.key) ?? '', el.font)
  if (ctx.form && !(el.multiline && value)) drawFormField(ctx, ctx.form, el, value)
  else if (value) drawFieldValue(ctx, el, value)
}

function drawElement(ctx: Context, el: LayoutElement) {
  switch (el.kind) {
    case 'box':
      return drawBox(ctx, el.rect, el.radius, el.accentTop)
    case 'line':
      return drawLine(ctx, el.x1, el.y1, el.x2, el.y2, el.color, el.width)
    case 'text':
      return drawStaticText(ctx, el)
    case 'title':
      return drawTitle(ctx, el)
    case 'circle':
      return drawCircle(ctx, el.cx, el.cy, el.r, el.width)
    case 'mark':
      if (el.shape === 'square') return drawSquare(ctx, el.cx, el.cy, el.r, el.width, ctx.values.marks.has(el.key))
      return drawCircle(ctx, el.cx, el.cy, el.r, el.width, ctx.values.marks.has(el.key))
    case 'checklist':
      return drawChecklist(ctx, el)
    case 'ruled':
      for (let y = el.rect.y + el.offset; y <= el.rect.y + el.rect.h; y += el.step) {
        drawLine(ctx, el.rect.x, y, el.rect.x + el.rect.w, y, 'faint', 1)
      }
      return
    case 'gem':
      return drawGem(ctx, el.x, el.y, el.size)
    case 'field':
      return drawField(ctx, el)
  }
}

async function embedFonts(pdf: PDFDocument, titleFont: ArrayBuffer | Uint8Array): Promise<Record<FontId, FontSet>> {
  pdf.registerFontkit(fontkit)
  const [regular, bold, title] = await Promise.all([
    pdf.embedFont(StandardFonts.Helvetica),
    pdf.embedFont(StandardFonts.HelveticaBold),
    // Inteira, não um subconjunto: no modo `print` o nome é um campo que a pessoa pode reescrever.
    pdf.embedFont(titleFont, { subset: false }),
  ])
  const set = (font: PDFFont): FontSet => ({ font, supported: new Set(font.getCharacterSet()) })
  return { regular: set(regular), bold: set(bold), title: set(title) }
}

/** Gera a ficha em PDF; `titleFont` são os bytes da Cinzel Bold (TTF). */
export async function drawSheetPdf(
  sheet: CharacterSheet,
  mode: SheetPdfMode,
  titleFont: ArrayBuffer | Uint8Array,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  const fonts = await embedFonts(pdf, titleFont)
  const values = buildSheetValues(sheet, mode)
  const form = mode === 'print' ? pdf.getForm() : null
  const labels = sheetLabels()

  pdf.setTitle([sheet.identity.character_name, labels.brand].filter(Boolean).join(' — '))
  pdf.setCreator(labels.brand)
  pdf.setLanguage(i18n.language === 'pt' ? 'pt-BR' : 'en')

  buildSheetLayout(labels).forEach((elements, pageIndex) => {
    const ctx: Context = { page: pdf.addPage(PAGE_SIZE), pageIndex, fonts, values, form }
    for (const el of elements) drawElement(ctx, el)
  })

  return pdf.save()
}
