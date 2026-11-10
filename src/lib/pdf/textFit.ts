/**
 * Medida e quebra de texto para a ficha em PDF, independentes do pdf-lib: basta
 * uma função que mede a largura de um texto num tamanho de fonte.
 */
export type MeasureText = (text: string, size: number) => number

/** Menor corpo aceitável antes de cortar o texto com reticências. */
export const MIN_FONT_SIZE = 5
const ELLIPSIS = '…'

/** Trocas para caracteres que a WinAnsi (Helvetica do pdf-lib) não tem. */
const REPLACEMENTS: Record<string, string> = {
  '−': '-', // sinal de menos
  '‐': '-',
  '‑': '-',
  ' ': ' ',
  ' ': ' ',
  ' ': ' ',
  '\t': ' ',
}

/**
 * Deixa só o que a fonte consegue desenhar: as fontes padrão do PDF lançam erro
 * com qualquer caractere fora da WinAnsi (emoji, ideogramas, `−`). O que não tem
 * troca conhecida vira `?`, para o resto do texto continuar legível.
 */
export function sanitizeForFont(text: string, supported: ReadonlySet<number>): string {
  let out = ''
  for (const char of text.normalize('NFC')) {
    if (char === '\n' || supported.has(char.codePointAt(0)!)) {
      out += char
      continue
    }
    const replacement = REPLACEMENTS[char]
    out += replacement !== undefined && [...replacement].every(c => supported.has(c.codePointAt(0)!)) ? replacement : '?'
  }
  return out
}

/** Corta o texto até caber na largura, terminando em reticências. */
export function truncateToWidth(text: string, width: number, size: number, measure: MeasureText): string {
  if (measure(text, size) <= width) return text
  let end = text.length
  while (end > 0 && measure(text.slice(0, end).trimEnd() + ELLIPSIS, size) > width) end--
  return end > 0 ? text.slice(0, end).trimEnd() + ELLIPSIS : ''
}

/** Uma linha: reduz o corpo até caber; abaixo de `minSize`, corta com reticências. */
export function fitSingleLine(
  text: string,
  width: number,
  size: number,
  measure: MeasureText,
  minSize = MIN_FONT_SIZE,
): { text: string; size: number } {
  const line = text.replace(/\s*\n\s*/g, ' · ')
  const natural = measure(line, size)
  if (natural <= width) return { text: line, size }
  const scaled = Math.floor(((size * width) / natural) * 10) / 10
  const floor = Math.min(size, minSize)
  if (scaled >= floor) return { text: line, size: scaled }
  return { text: truncateToWidth(line, width, floor, measure), size: floor }
}

/** Quebra em linhas que cabem na largura, respeitando as quebras do próprio texto. */
export function wrapLines(text: string, width: number, size: number, measure: MeasureText): string[] {
  const lines: string[] = []
  for (const paragraph of text.split('\n')) {
    const words = paragraph.split(/\s+/).filter(Boolean)
    if (words.length === 0) {
      lines.push('')
      continue
    }
    let current = ''
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word
      if (measure(candidate, size) <= width) {
        current = candidate
        continue
      }
      if (current) lines.push(current)
      // Palavra maior que a linha inteira: é cortada para não sair da caixa.
      current = measure(word, size) <= width ? word : truncateToWidth(word, width, size, measure)
    }
    lines.push(current)
  }
  return lines
}

export interface FittedBlock {
  lines: string[]
  size: number
  lineHeight: number
}

/**
 * Várias linhas numa caixa (de largura `width` por coluna, com `columns`
 * colunas que se enchem em sequência): reduz corpo e entrelinha juntos até
 * caber; se nem no mínimo couber, a última linha termina em reticências.
 */
export function fitMultiline(
  text: string,
  box: { width: number; height: number; columns?: number },
  style: { size: number; lineHeight: number },
  measure: MeasureText,
): FittedBlock {
  const ratio = style.lineHeight / style.size
  const columns = box.columns ?? 1
  const capacityAt = (lineHeight: number) => columns * Math.max(1, Math.floor(box.height / lineHeight))
  for (let size = style.size; size >= MIN_FONT_SIZE; size = Math.round((size - 0.25) * 100) / 100) {
    const lineHeight = size * ratio
    const lines = wrapLines(text, box.width, size, measure)
    if (lines.length <= capacityAt(lineHeight)) return { lines, size, lineHeight }
  }
  const size = MIN_FONT_SIZE
  const lineHeight = size * ratio
  const capacity = capacityAt(lineHeight)
  const lines = wrapLines(text, box.width, size, measure).slice(0, capacity)
  lines[capacity - 1] = truncateToWidth(`${lines[capacity - 1]}${ELLIPSIS}`, box.width, size, measure)
  return { lines, size, lineHeight }
}
