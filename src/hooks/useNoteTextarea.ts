import { useLayoutEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react'
import {
  applyNoteFormat, findMentionQuery, insertMention, mentionMarkdown, searchMentionTargets,
  type MentionTarget, type NoteFormat, type TextEdit,
} from '../lib/gm/notes'
import { MENTION_SUGGESTION_LIMIT } from '../constants'

interface NoteTextareaOptions {
  value: string
  onChange: (value: string) => void
  targets: MentionTarget[]
  /** Nome gravado no texto do link — o alvo pode não ter nome. */
  labelOf: (target: MentionTarget) => string
  /** Chamado quando as sugestões abrem (o SRD carrega sob demanda). */
  onSuggest: () => void
}

/** Atalhos de teclado (Ctrl/⌘ + tecla) da barra de formatação. */
const SHORTCUTS: Record<string, NoteFormat> = { b: 'bold', i: 'italic' }

/**
 * Textarea de nota com barra de formatação e menções por `@`. As edições
 * programáticas (botões, menção escolhida) trocam o valor e devolvem o cursor
 * para onde a edição diz — o React, sozinho, o jogaria para o fim do texto.
 */
export function useNoteTextarea({ value, onChange, targets, labelOf, onSuggest }: NoteTextareaOptions) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const pendingSelection = useRef<[number, number] | null>(null)
  const [mention, setMention] = useState<{ start: number; query: string } | null>(null)
  const [dismissedAt, setDismissedAt] = useState<number | null>(null)
  const [focused, setFocused] = useState(false)
  const [active, setActive] = useState(0)

  useLayoutEffect(() => {
    const selection = pendingSelection.current
    const el = textareaRef.current
    if (!selection || !el) return
    pendingSelection.current = null
    el.setSelectionRange(selection[0], selection[1])
  }, [value])

  const open = focused && mention != null && mention.start !== dismissedAt
  const suggestions = open ? searchMentionTargets(targets, mention.query, MENTION_SUGGESTION_LIMIT) : []
  const activeIndex = Math.min(active, Math.max(0, suggestions.length - 1))

  /** Relê o `@busca` antes do cursor depois de digitar ou mover o cursor. */
  function syncMention(el: HTMLTextAreaElement) {
    const next = el.selectionStart === el.selectionEnd ? findMentionQuery(el.value, el.selectionStart) : null
    if (next?.start !== mention?.start || next?.query !== mention?.query) setActive(0)
    if (next && next.start !== mention?.start) onSuggest()
    setMention(next)
  }

  function apply(edit: TextEdit) {
    pendingSelection.current = [edit.selectionStart, edit.selectionEnd]
    onChange(edit.text)
    textareaRef.current?.focus()
  }

  function format(kind: NoteFormat) {
    const el = textareaRef.current
    if (!el) return
    apply(applyNoteFormat(value, el.selectionStart, el.selectionEnd, kind))
  }

  function pick(target: MentionTarget) {
    const el = textareaRef.current
    if (!el || !mention) return
    apply(insertMention(value, mention.start, el.selectionStart, mentionMarkdown(target, labelOf(target))))
    setMention(null)
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    const shortcut = (e.ctrlKey || e.metaKey) && !e.altKey ? SHORTCUTS[e.key.toLowerCase()] : undefined
    if (shortcut) {
      e.preventDefault()
      format(shortcut)
      return
    }
    if (!open) return
    if (e.key === 'Escape') {
      e.preventDefault()
      setDismissedAt(mention.start)
      return
    }
    if (suggestions.length === 0) return
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const step = e.key === 'ArrowDown' ? 1 : -1
      setActive((activeIndex + step + suggestions.length) % suggestions.length)
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault()
      pick(suggestions[activeIndex])
    }
  }

  return {
    textareaRef,
    /** `null` com as sugestões fechadas; lista vazia = nada casa com a busca. */
    suggestions: open ? suggestions : null,
    query: mention?.query ?? '',
    activeIndex,
    format,
    pick,
    dismiss: () => setDismissedAt(mention?.start ?? null),
    textareaProps: {
      ref: textareaRef,
      value,
      onChange: (e: ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e.target.value)
        syncMention(e.target)
      },
      onSelect: (e: { currentTarget: HTMLTextAreaElement }) => syncMention(e.currentTarget),
      onKeyDown,
      onFocus: () => setFocused(true),
      onBlur: () => setFocused(false),
    },
  }
}
