import { describe, it, expect } from 'vitest'
import { RELEASE_NOTES, noteItems, notesToShow, type ReleaseNote } from './releaseNotes'
import { versionCodeFromTag } from './appUpdate'

const note = (version: string): ReleaseNote => ({ version, pt: [`pt ${version}`], en: [`en ${version}`] })
const notes = ['v3.4.0', 'v3.3.0', 'v3.2.0', 'v3.1.0', 'v3.0.0'].map(note)

describe('novidades da versão', () => {
  it('instalação nova não vê novidades', () => {
    expect(notesToShow(null, false, notes)).toEqual([])
  })

  it('quem já usava, sem versão vista, vê só a atual', () => {
    expect(notesToShow(null, true, notes).map(n => n.version)).toEqual(['v3.4.0'])
  })

  it('versão já vista não mostra de novo', () => {
    expect(notesToShow('v3.4.0', true, notes)).toEqual([])
  })

  it('quem pulou versões vê todas as que perdeu, da mais antiga para a mais nova', () => {
    expect(notesToShow('v3.2.0', true, notes).map(n => n.version)).toEqual(['v3.3.0', 'v3.4.0'])
    expect(notesToShow('v3.0.0', true, notes).map(n => n.version)).toEqual(['v3.1.0', 'v3.2.0', 'v3.3.0', 'v3.4.0'])
  })

  it('sem teto: quem vem de muito antes vê todas as versões registradas', () => {
    expect(notesToShow('v2.0.0', true, notes).map(n => n.version)).toEqual(['v3.0.0', 'v3.1.0', 'v3.2.0', 'v3.3.0', 'v3.4.0'])
  })

  it('não altera a lista de notas recebida', () => {
    const before = notes.map(n => n.version)
    notesToShow('v2.0.0', true, notes)
    expect(notes.map(n => n.version)).toEqual(before)
  })

  it('idioma: inglês para en-*, português para o resto', () => {
    expect(noteItems(notes[0], 'en-US')).toEqual(['en v3.4.0'])
    expect(noteItems(notes[0], 'pt-BR')).toEqual(['pt v3.4.0'])
  })
})

describe('src/data/releaseNotes.json', () => {
  it('tags válidas, sem repetir, da mais nova para a mais velha', () => {
    const codes = RELEASE_NOTES.map(n => versionCodeFromTag(n.version))
    expect(codes.every(code => code !== null)).toBe(true)
    expect(codes).toEqual([...codes].sort((a, b) => b! - a!))
    expect(new Set(codes).size).toBe(codes.length)
  })

  it('cada versão tem os mesmos itens em pt e en', () => {
    for (const { version, pt, en } of RELEASE_NOTES) {
      expect(pt.length, version).toBeGreaterThan(0)
      expect(en.length, version).toBe(pt.length)
      expect([...pt, ...en].every(item => item.trim().length > 0), version).toBe(true)
    }
  })
})
