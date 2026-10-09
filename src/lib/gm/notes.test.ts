import { describe, it, expect } from 'vitest'
import type { Monster, Npc, PartyMember } from '../../types'
import {
  applyNoteFormat, findMentionQuery, findMentionTarget, insertMention, mentionMarkdown, mentionTargets, mentionsIn, noteMatches,
  noteSummary, parseMentionHref, searchMentionTargets, sortNotes, toggleLinePrefix, toggleTaskAt, wrapSelection,
} from './notes'
import { createBlankStatBlock } from './statblock'
import { makeSheet } from '../../test/fixtures'

describe('menções', () => {
  it('vão e voltam pelo link', () => {
    const md = mentionMarkdown({ kind: 'npc', id: 'a1-b2' }, 'Grukk')
    expect(md).toBe('[Grukk](npc:a1-b2)')
    expect(parseMentionHref('npc:a1-b2')).toEqual({ kind: 'npc', id: 'a1-b2' })
  })

  it('só aceitam os esquemas conhecidos', () => {
    expect(parseMentionHref('javascript:alert(1)')).toBeNull()
    expect(parseMentionHref('https://example.com')).toBeNull()
    expect(parseMentionHref('npc:')).toBeNull()
    expect(parseMentionHref(undefined)).toBeNull()
  })

  it('escapam colchetes do nome para não quebrar o link', () => {
    expect(mentionMarkdown({ kind: 'monster', id: 'srd-x' }, 'Lobo [alfa]\\')).toBe('[Lobo \\[alfa\\]\\\\](monster:srd-x)')
    expect(mentionMarkdown({ kind: 'player', id: 'p' }, '   ')).toBe('[?](player:p)')
  })

  it('são achadas no texto', () => {
    expect(mentionsIn('[A](player:1) e [B](monster:srd-goblin) e [site](https://x.com)')).toEqual([
      { kind: 'player', id: '1' },
      { kind: 'monster', id: 'srd-goblin' },
    ])
  })
})

describe('busca do @', () => {
  it('abre com @ no começo ou depois de espaço', () => {
    expect(findMentionQuery('@gob', 4)).toEqual({ start: 0, query: 'gob' })
    expect(findMentionQuery('falar com @gru', 14)).toEqual({ start: 10, query: 'gru' })
    expect(findMentionQuery('linha\n@', 7)).toEqual({ start: 6, query: '' })
  })

  it('não abre no meio de palavra, depois de espaço ou longe do cursor', () => {
    expect(findMentionQuery('mestre@mesa.com', 15)).toBeNull()
    expect(findMentionQuery('@gob lin', 8)).toBeNull()
    expect(findMentionQuery('@gob', 0)).toBeNull()
  })

  it('troca o @busca pela menção e põe o cursor depois do espaço', () => {
    const edit = insertMention('oi @gru tudo', 3, 7, '[Grukk](npc:1)')
    expect(edit.text).toBe('oi [Grukk](npc:1) tudo')
    expect(edit.selectionStart).toBe(18)
    const atEnd = insertMention('oi @gru', 3, 7, '[Grukk](npc:1)')
    expect(atEnd.text).toBe('oi [Grukk](npc:1) ')
    expect(atEnd.selectionStart).toBe(atEnd.text.length)
  })
})

describe('barra de formatação', () => {
  it('envolve a seleção e desfaz no segundo toque', () => {
    const bold = wrapSelection('um dois', 3, 7, '**')
    expect(bold).toEqual({ text: 'um **dois**', selectionStart: 5, selectionEnd: 9 })
    expect(wrapSelection(bold.text, bold.selectionStart, bold.selectionEnd, '**')).toEqual({
      text: 'um dois', selectionStart: 3, selectionEnd: 7,
    })
  })

  it('sem seleção põe o par com o cursor no meio', () => {
    expect(wrapSelection('ab', 1, 1, '_')).toEqual({ text: 'a__b', selectionStart: 2, selectionEnd: 2 })
  })

  it('prefixa todas as linhas da seleção e alterna', () => {
    const list = toggleLinePrefix('a\nb\nc', 0, 3, '- ')
    expect(list.text).toBe('- a\n- b\nc')
    expect(list).toMatchObject({ selectionStart: 2, selectionEnd: 7 })
    expect(toggleLinePrefix(list.text, 2, 7, '- ').text).toBe('a\nb\nc')
  })

  it('prefixa a linha do cursor', () => {
    expect(toggleLinePrefix('título\ntexto', 3, 3, '## ')).toEqual({ text: '## título\ntexto', selectionStart: 6, selectionEnd: 6 })
    expect(toggleLinePrefix('x\ny', 3, 3, '> ').text).toBe('x\n> y')
  })
})

describe('botões de formatação', () => {
  it('cada um aplica a marcação certa', () => {
    expect(applyNoteFormat('x', 0, 1, 'italic').text).toBe('_x_')
    expect(applyNoteFormat('x', 0, 1, 'checklist').text).toBe('- [ ] x')
    expect(applyNoteFormat('x', 0, 1, 'quote').text).toBe('> x')
  })

  it('o @ abre a busca: colado em palavra ganha espaço, seleção vira a busca', () => {
    expect(applyNoteFormat('falar com', 9, 9, 'mention')).toEqual({ text: 'falar com @', selectionStart: 11, selectionEnd: 11 })
    const edit = applyNoteFormat('ver Grukk', 4, 9, 'mention')
    expect(edit).toEqual({ text: 'ver @Grukk', selectionStart: 10, selectionEnd: 10 })
    expect(findMentionQuery(edit.text, edit.selectionStart)).toEqual({ start: 4, query: 'Grukk' })
  })
})

describe('tarefas', () => {
  it('marca e desmarca pelo início do item', () => {
    const text = 'lista:\n- [ ] comprar corda\n  1. [x] falar com o rei'
    const marked = toggleTaskAt(text, 7)
    expect(marked).toBe('lista:\n- [x] comprar corda\n  1. [x] falar com o rei')
    expect(toggleTaskAt(marked, 29)).toBe('lista:\n- [x] comprar corda\n  1. [ ] falar com o rei')
  })

  it('ignora item que não é tarefa', () => {
    expect(toggleTaskAt('- item', 0)).toBe('- item')
  })
})

describe('resumo e busca das notas', () => {
  it('usa o título digitado e resume o texto sem marcação', () => {
    const s = noteSummary({ title: 'Sessão 3', body: '## Ganchos\n- [ ] falar com [Grukk](npc:1)\n**ouro** escondido' })
    expect(s).toEqual({ title: 'Sessão 3', snippet: 'Ganchos · falar com Grukk · ouro escondido' })
  })

  it('link com parênteses no endereço some inteiro do resumo', () => {
    expect(noteSummary({ title: 'x', body: 'ver [mapa](https://w.org/a_(b)) agora' }).snippet).toBe('ver mapa agora')
  })

  it('sem título, a primeira linha vira título', () => {
    expect(noteSummary({ title: ' ', body: '\n# Taverna do _Pônei_\nbarulhenta' })).toEqual({ title: 'Taverna do Pônei', snippet: 'barulhenta' })
    expect(noteSummary({ title: '', body: '' })).toEqual({ title: '', snippet: '' })
  })

  it('busca acha nome mencionado, sem acento', () => {
    const note = { title: 'Mina', body: 'o [Dragão Verde](monster:srd-x) dorme' }
    expect(noteMatches(note, 'dragao')).toBe(true)
    expect(noteMatches(note, 'monster')).toBe(false)
  })

  it('ordena pela edição mais recente', () => {
    const n = (id: string, updated_at: string) => ({ id, title: '', body: '', created_at: '', updated_at })
    expect(sortNotes([n('a', '2026-01-01'), n('b', '2026-03-01'), n('c', '2026-02-01')]).map(x => x.id)).toEqual(['b', 'c', 'a'])
  })
})

describe('alvos de menção', () => {
  const sheet = makeSheet({ classId: 'guerreiro', level: 3 })
  sheet.identity.character_name = 'Aria'
  const party: PartyMember[] = [{ id: 'p1', source: 'imported', sheet_id: null, snapshot: sheet, imported_at: '', updated_at: '' }]
  const npcs: Npc[] = [{ id: 'n1', statblock: createBlankStatBlock('Grukk, o Goblin'), base_monster_id: null, notes: '', profile: null, updated_at: '' }]
  const monster = (id: string, name: string, source: Monster['source']): Monster => ({ id, source, statblock: createBlankStatBlock(name), updated_at: '' })
  const targets = mentionTargets(party, npcs, [monster('b1', 'Goblin Xamã', 'custom')], [monster('srd-goblin', 'Goblin', 'srd'), monster('srd-hob', 'Hobgoblin', 'srd')])

  it('juntam mesa, NPCs, bestiário e SRD', () => {
    expect(targets.map(x => `${x.kind}:${x.source}:${x.name}`)).toEqual([
      'player:party:Aria', 'npc:npc:Grukk, o Goblin', 'monster:bestiary:Goblin Xamã', 'monster:srd:Goblin', 'monster:srd:Hobgoblin',
    ])
    expect(findMentionTarget(targets, { kind: 'monster', id: 'srd-hob' })?.name).toBe('Hobgoblin')
    expect(findMentionTarget(targets, { kind: 'npc', id: 'srd-hob' })).toBeNull()
  })

  it('sugerem quem começa com a busca primeiro', () => {
    expect(searchMentionTargets(targets, 'gob', 10).map(x => x.name)).toEqual([
      'Goblin Xamã', 'Goblin', 'Grukk, o Goblin', 'Hobgoblin',
    ])
    expect(searchMentionTargets(targets, '', 2).map(x => x.name)).toEqual(['Aria', 'Grukk, o Goblin'])
  })
})
