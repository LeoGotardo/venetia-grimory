import type { CampaignNote, Monster, Npc, PartyMember } from '../../types'
import {
  MENTION_KINDS, MENTION_QUERY_MAX, NOTE_SNIPPET_LENGTH, NOTE_TITLE_FALLBACK_LENGTH,
} from '../../constants'
import { matchesSearch, searchKey } from './search'

/**
 * Notas do mestre: markdown puro, com menções gravadas como links de esquema
 * próprio — `[Grukk](npc:<id>)`. O texto do link é o nome na hora da menção;
 * quem mostra a nota resolve o id e usa o nome atual, então renomear o NPC não
 * deixa a nota velha. Tudo aqui é puro: a interface só aplica o resultado.
 */

export type MentionKind = typeof MENTION_KINDS[number]

export interface Mention {
  kind: MentionKind
  id: string
}

/** Alvo de menção: player da mesa, NPC da campanha ou monstro (bestiário ou SRD). */
export interface MentionTarget extends Mention {
  name: string
  source: 'party' | 'npc' | 'bestiary' | 'srd'
}

/** Edição de texto com a seleção que deve ficar depois dela. */
export interface TextEdit {
  text: string
  selectionStart: number
  selectionEnd: number
}

const MENTION_HREF = new RegExp(`^(${MENTION_KINDS.join('|')}):([\\w-]+)$`)
const MENTION_LINKS = new RegExp(`\\]\\((${MENTION_KINDS.join('|')}):([\\w-]+)\\)`, 'g')
/** `@` no começo do texto ou depois de espaço/parêntese — `email@x` não abre sugestões. */
const MENTION_TRIGGER = /(?:^|[\s([{])@([^\s@[\]()]*)$/
/** Marcador de item de lista seguido da caixinha de tarefa. */
const TASK_ITEM = /^(?:[-*+]|\d{1,9}[.)])[ \t]+\[([ xX])\]/

export function mentionHref({ kind, id }: Mention): string {
  return `${kind}:${id}`
}

export function parseMentionHref(href: string | null | undefined): Mention | null {
  const match = href ? MENTION_HREF.exec(href) : null
  return match ? { kind: match[1] as MentionKind, id: match[2] } : null
}

/** Link markdown da menção. `[`, `]` e `\` do nome são escapados para não fecharem o link antes da hora. */
export function mentionMarkdown(mention: Mention, name: string): string {
  const label = name.replace(/\s+/g, ' ').trim().replace(/[\\[\]]/g, '\\$&') || '?'
  return `[${label}](${mentionHref(mention)})`
}

/** Menções do texto, na ordem em que aparecem (repetidas inclusive). */
export function mentionsIn(markdown: string): Mention[] {
  return [...markdown.matchAll(MENTION_LINKS)].map(m => ({ kind: m[1] as MentionKind, id: m[2] }))
}

/** `@busca` logo antes do cursor: onde está o `@` e o que foi digitado depois dele. */
export function findMentionQuery(text: string, caret: number): { start: number; query: string } | null {
  const match = MENTION_TRIGGER.exec(text.slice(0, caret))
  if (!match || match[1].length > MENTION_QUERY_MAX) return null
  return { start: caret - match[1].length - 1, query: match[1] }
}

/** Troca o `@busca` (de `start` até o cursor) pela menção, com um espaço depois para seguir digitando. */
export function insertMention(text: string, start: number, caret: number, markdown: string): TextEdit {
  const after = text.slice(caret)
  const spacer = after.startsWith(' ') ? '' : ' '
  const position = start + markdown.length + 1
  return { text: text.slice(0, start) + markdown + spacer + after, selectionStart: position, selectionEnd: position }
}

/**
 * Envolve a seleção com o marcador (`**`, `_`). Sem seleção, põe o par e deixa
 * o cursor no meio. Se a seleção já está envolvida, tira — o botão alterna.
 */
export function wrapSelection(text: string, start: number, end: number, marker: string): TextEdit {
  const size = marker.length
  const wrapped = text.slice(start - size, start) === marker && text.slice(end, end + size) === marker
  if (wrapped) {
    return {
      text: text.slice(0, start - size) + text.slice(start, end) + text.slice(end + size),
      selectionStart: start - size,
      selectionEnd: end - size,
    }
  }
  return {
    text: text.slice(0, start) + marker + text.slice(start, end) + marker + text.slice(end),
    selectionStart: start + size,
    selectionEnd: end + size,
  }
}

/**
 * Prefixa cada linha tocada pela seleção (`## `, `- `, `- [ ] `, `> `). Se todas
 * já começam com o prefixo, tira — o botão alterna, como no negrito.
 */
export function toggleLinePrefix(text: string, start: number, end: number, prefix: string): TextEdit {
  const blockStart = text.lastIndexOf('\n', start - 1) + 1
  const newline = text.indexOf('\n', end)
  const blockEnd = newline === -1 ? text.length : newline
  const lines = text.slice(blockStart, blockEnd).split('\n')
  const remove = lines.every(line => line.startsWith(prefix))
  const next = lines.map(line => {
    if (remove) return line.slice(prefix.length)
    return line.startsWith(prefix) ? line : prefix + line
  })
  const block = next.join('\n')
  const firstShift = next[0].length - lines[0].length
  return {
    text: text.slice(0, blockStart) + block + text.slice(blockEnd),
    selectionStart: Math.max(blockStart, start + firstShift),
    selectionEnd: Math.max(blockStart, end + block.length - (blockEnd - blockStart)),
  }
}

export type NoteFormat = 'bold' | 'italic' | 'heading' | 'list' | 'checklist' | 'quote' | 'mention'

const FORMAT_WRAP: Partial<Record<NoteFormat, string>> = { bold: '**', italic: '_' }
const FORMAT_PREFIX: Partial<Record<NoteFormat, string>> = { heading: '## ', list: '- ', checklist: '- [ ] ', quote: '> ' }

/**
 * Botão da barra de formatação aplicado à seleção. `mention` põe um `@` no
 * cursor (com espaço antes se estiver colado numa palavra), o que abre as
 * sugestões; com texto selecionado, ele vira a busca.
 */
export function applyNoteFormat(text: string, start: number, end: number, format: NoteFormat): TextEdit {
  const wrap = FORMAT_WRAP[format]
  if (wrap) return wrapSelection(text, start, end, wrap)
  const prefix = FORMAT_PREFIX[format]
  if (prefix) return toggleLinePrefix(text, start, end, prefix)
  const before = text.slice(0, start)
  const at = before === '' || /\s$/.test(before) ? '@' : ' @'
  return { text: before + at + text.slice(start), selectionStart: end + at.length, selectionEnd: end + at.length }
}

/**
 * Marca ou desmarca a tarefa (`- [ ]`) do item de lista que começa em `offset`
 * (posição que o markdown renderizado informa). Sem tarefa ali, devolve o mesmo texto.
 */
export function toggleTaskAt(text: string, offset: number): string {
  const match = TASK_ITEM.exec(text.slice(offset))
  if (!match) return text
  const box = offset + match[0].length - 2
  return text.slice(0, box) + (match[1] === ' ' ? 'x' : ' ') + text.slice(box + 1)
}

/** Escapa o que o markdown leria como marcação num nome solto (`*`, `_`, colchetes…). */
function escapeMarkdown(text: string): string {
  return text.replace(/[\\`*_[\]#<>|~]/g, '\\$&')
}

const MENTION_LINK = new RegExp(`\\[((?:\\\\.|[^\\]\\\\])*)\\]\\((${MENTION_KINDS.join('|')}):([\\w-]+)\\)`, 'g')

/**
 * A nota como vai para a mesa: os players não têm as fichas de NPCs e
 * monstros do mestre, então cada citação vira o nome em negrito — o atual, se
 * `nameOf` souber, senão o texto do link. O título vazio vira o deduzido.
 */
export function shareableNote(
  note: Pick<CampaignNote, 'title' | 'body' | 'updated_at'>,
  nameOf: (mention: Mention) => string | null,
): { title: string; body: string; updated_at: string } {
  const body = note.body.replace(MENTION_LINK, (_whole, label: string, kind: MentionKind, id: string) => {
    const name = nameOf({ kind, id }) ?? label.replace(/\\(.)/g, '$1')
    return `**${escapeMarkdown(name)}**`
  })
  return { title: noteSummary(note).title, body, updated_at: note.updated_at }
}

/** Uma linha sem a sintaxe de markdown, para títulos e resumos. Links e menções viram o texto deles. */
function plainLine(line: string): string {
  return line
    .replace(/!?\[((?:\\.|[^\]\\])*)\]\((?:[^()]|\([^()]*\))*\)/g, '$1')
    .replace(/^\s{0,3}(?:#{1,6}\s+|>\s?)+/, '')
    .replace(/^\s*(?:[-*+]|\d{1,9}[.)])\s+(?:\[[ xX]\]\s+)?/, '')
    .replace(/^\s*(?:[-*_]\s*){3,}$/, '')
    .replace(/\*\*|__|~~|`/g, '')
    .replace(/(^|[\s(])[*_](?=\S)/g, '$1')
    .replace(/(\S)[*_](?=$|[\s).,;:!?])/g, '$1')
    .replace(/\\([\\[\]*_~`#>])/g, '$1')
    .trim()
}

function clip(text: string, size: number): string {
  return text.length > size ? `${text.slice(0, size - 1).trimEnd()}…` : text
}

/**
 * Título e resumo para a lista. Sem título digitado, a primeira linha do texto
 * vira o título (e sai do resumo); `title` vazio = nem isso, a interface põe "Sem título".
 */
export function noteSummary(note: Pick<CampaignNote, 'title' | 'body'>): { title: string; snippet: string } {
  const lines = note.body.split('\n').map(plainLine).filter(Boolean)
  const typed = note.title.trim()
  const title = typed || lines.shift() || ''
  return {
    title: clip(title, typed ? Infinity : NOTE_TITLE_FALLBACK_LENGTH),
    snippet: clip(lines.join(' · '), NOTE_SNIPPET_LENGTH),
  }
}

/** Busca no título e no texto — nomes mencionados inclusive, que estão no texto do link. */
export function noteMatches(note: Pick<CampaignNote, 'title' | 'body'>, query: string): boolean {
  return matchesSearch(`${note.title}\n${note.body.split('\n').map(plainLine).join('\n')}`, query)
}

/** Mais recente primeiro. */
export function sortNotes(notes: CampaignNote[]): CampaignNote[] {
  return [...notes].sort((a, b) => b.updated_at.localeCompare(a.updated_at))
}

/** Tudo o que dá para mencionar, na ordem das sugestões: mesa, NPCs, bestiário, SRD. */
export function mentionTargets(
  party: PartyMember[], npcs: Npc[], bestiary: Monster[], srd: Monster[],
): MentionTarget[] {
  return [
    ...party.map((m): MentionTarget => ({ kind: 'player', id: m.id, name: m.snapshot.identity.character_name ?? '', source: 'party' })),
    ...npcs.map((n): MentionTarget => ({ kind: 'npc', id: n.id, name: n.statblock.name, source: 'npc' })),
    ...bestiary.map((m): MentionTarget => ({ kind: 'monster', id: m.id, name: m.statblock.name, source: 'bestiary' })),
    ...srd.map((m): MentionTarget => ({ kind: 'monster', id: m.id, name: m.statblock.name, source: 'srd' })),
  ]
}

export function findMentionTarget(targets: MentionTarget[], { kind, id }: Mention): MentionTarget | null {
  return targets.find(x => x.kind === kind && x.id === id) ?? null
}

/** Quanto melhor o nome casa com a busca: começo do nome, começo de uma palavra, qualquer lugar. */
function matchRank(name: string, query: string): number {
  const key = searchKey(name)
  if (key.startsWith(query)) return 0
  return key.split(/\s+/).some(word => word.startsWith(query)) ? 1 : 2
}

/** Sugestões para `@busca`. Empate no ranking mantém a ordem de `mentionTargets`. */
export function searchMentionTargets(targets: MentionTarget[], query: string, limit: number): MentionTarget[] {
  const q = searchKey(query)
  return targets
    .filter(x => matchesSearch(x.name, q))
    .map((target, index) => ({ target, index, rank: matchRank(target.name, q) }))
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .slice(0, limit)
    .map(x => x.target)
}
