import { describe, expect, it } from 'vitest'
import { fitMultiline, fitSingleLine, sanitizeForFont, truncateToWidth, wrapLines, type MeasureText } from './textFit'

/** Fonte monoespaçada de mentira: cada caractere mede metade do corpo. */
const measure: MeasureText = (text, size) => [...text].length * size * 0.5
const LATIN1 = new Set(Array.from({ length: 256 }, (_, i) => i))

describe('sanitizeForFont', () => {
  it('troca o sinal de menos e põe ? no que a fonte não tem', () => {
    expect(sanitizeForFont('−1 Grukk 🐉', LATIN1)).toBe('-1 Grukk ?')
  })

  it('mantém acentos e quebras de linha', () => {
    expect(sanitizeForFont('Ação\nCoração', LATIN1)).toBe('Ação\nCoração')
  })
})

describe('fitSingleLine', () => {
  it('deixa como está o que cabe', () => {
    expect(fitSingleLine('abcd', 100, 10, measure)).toEqual({ text: 'abcd', size: 10 })
  })

  it('encolhe até caber', () => {
    expect(fitSingleLine('abcdefghij', 40, 10, measure)).toEqual({ text: 'abcdefghij', size: 8 })
  })

  it('abaixo do corpo mínimo corta com reticências', () => {
    const fitted = fitSingleLine('a'.repeat(40), 40, 10, measure, 8)
    expect(fitted.size).toBe(8)
    expect(fitted.text.endsWith('…')).toBe(true)
    expect(measure(fitted.text, fitted.size)).toBeLessThanOrEqual(40)
  })
})

describe('wrapLines', () => {
  it('quebra por palavra e respeita as quebras do texto', () => {
    expect(wrapLines('um dois tres\nquatro', 35, 10, measure)).toEqual(['um dois', 'tres', 'quatro'])
  })

  it('corta a palavra maior que a linha', () => {
    const [line] = wrapLines('a'.repeat(20), 30, 10, measure)
    expect(measure(line, 10)).toBeLessThanOrEqual(30)
  })
})

describe('fitMultiline', () => {
  it('usa todas as colunas antes de encolher', () => {
    const text = Array.from({ length: 6 }, (_, i) => `linha${i}`).join('\n')
    const fitted = fitMultiline(text, { width: 100, height: 30, columns: 2 }, { size: 10, lineHeight: 10 }, measure)
    expect(fitted).toMatchObject({ size: 10, lineHeight: 10 })
    expect(fitted.lines).toHaveLength(6)
  })

  it('sem espaço nem no mínimo, termina em reticências', () => {
    const text = Array.from({ length: 50 }, () => 'x').join('\n')
    const fitted = fitMultiline(text, { width: 100, height: 20 }, { size: 10, lineHeight: 10 }, measure)
    expect(fitted.size).toBe(5)
    expect(fitted.lines.at(-1)?.endsWith('…')).toBe(true)
    expect(fitted.lines.length).toBeLessThanOrEqual(4)
  })

  it('truncateToWidth devolve vazio se nem as reticências cabem', () => {
    expect(truncateToWidth('abc', 1, 10, measure)).toBe('')
  })
})
