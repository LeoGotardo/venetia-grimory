import { useId, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { MentionTarget, NoteFormat } from '../../../lib/gm/notes'
import { useNoteTextarea } from '../../../hooks/useNoteTextarea'
import { AtIcon, ChecklistIcon, ListIcon, QuoteIcon } from '../ornaments'
import { MentionKindIcon } from './MentionLink'
import { mentionKindLabel, mentionName } from './mentionLabels'

interface NoteWriterProps {
  value: string
  onChange: (value: string) => void
  targets: MentionTarget[]
  onSuggest: () => void
}

const toolButton =
  'inline-flex items-center justify-center min-w-[38px] h-[38px] px-2 rounded-[8px] text-[#E8DFD0] hover:bg-white/10 hover:text-[#F5F0E8] cursor-pointer transition-colors'

/**
 * Editor da nota: barra fixa no topo (formatação, que vira a faixa de
 * sugestões enquanto há um `@busca`) e o texto em markdown, que cresce com o conteúdo.
 */
export function NoteWriter({ value, onChange, targets, onSuggest }: NoteWriterProps) {
  const { t } = useTranslation()
  const listId = useId()
  const editor = useNoteTextarea({ value, onChange, targets, labelOf: target => mentionName(t, target), onSuggest })
  const { suggestions, activeIndex } = editor
  const optionId = (index: number) => `${listId}-${index}`

  const tools: Array<{ format: NoteFormat; label: string; icon: ReactNode }> = [
    { format: 'bold', label: t('gm.note.bold'), icon: <b className="text-[15px]">B</b> },
    { format: 'italic', label: t('gm.note.italic'), icon: <i className="font-cinzel text-[15px]">I</i> },
    { format: 'heading', label: t('gm.note.heading'), icon: <span className="font-cinzel font-semibold text-[15px]">H</span> },
    { format: 'list', label: t('gm.note.list'), icon: <ListIcon size={17} /> },
    { format: 'checklist', label: t('gm.note.checklist'), icon: <ChecklistIcon size={17} /> },
    { format: 'quote', label: t('gm.note.quote'), icon: <QuoteIcon size={17} /> },
    { format: 'mention', label: t('gm.note.mention'), icon: <AtIcon size={17} /> },
  ]

  return (
    <div className="flex flex-col">
      {/* Fica sob o cabeçalho (64 px): a faixa de sugestões aparece mesmo no fim de uma nota longa. */}
      <div className="sticky top-[64px] z-[5] -mx-px bg-[#1A1714] border-y border-white/[0.07] px-2 py-1.5 min-h-[52px] flex items-center">
        {suggestions ? (
          <div className="flex items-center gap-1.5 w-full min-w-0">
            <span className="flex-shrink-0 pl-1 text-[12px] font-semibold uppercase tracking-wider text-[#A8A09B]">
              {t('gm.note.suggestions')}
            </span>
            <div id={listId} role="listbox" aria-label={t('gm.note.suggestions')} className="flex-1 min-w-0 flex gap-1.5 overflow-x-auto no-scrollbar">
              {suggestions.length === 0 && (
                <span className="px-2 text-[13px] text-[#A8A09B] whitespace-nowrap">{t('gm.note.noSuggestions')}</span>
              )}
              {suggestions.map((target, index) => (
                <button
                  key={`${target.kind}:${target.id}`}
                  id={optionId(index)}
                  role="option"
                  aria-selected={index === activeIndex}
                  // Sem tirar o foco do texto: o clique escolhe e o teclado continua aberto.
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => editor.pick(target)}
                  className={`flex-shrink-0 inline-flex items-center gap-1.5 h-[38px] rounded-[9px] border px-2.5 text-left cursor-pointer transition-colors ${
                    index === activeIndex
                      ? 'border-[#D4A017] bg-[rgba(212,160,23,0.14)]'
                      : 'border-white/[0.1] bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <span className="text-[#D4A017]"><MentionKindIcon kind={target.kind} size={14} /></span>
                  <span className="flex flex-col leading-tight">
                    <span className="text-[14px] font-semibold text-[#F5F0E8] whitespace-nowrap">{mentionName(t, target)}</span>
                    <span className="text-[11px] text-[#A8A09B] whitespace-nowrap">{mentionKindLabel(t, target)}</span>
                  </span>
                </button>
              ))}
            </div>
            <button
              onMouseDown={e => e.preventDefault()}
              onClick={editor.dismiss}
              aria-label={t('gm.note.closeSuggestions')}
              className={`${toolButton} flex-shrink-0 text-[#A8A09B]`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
            </button>
          </div>
        ) : (
          <div role="toolbar" aria-label={t('gm.note.toolbar')} className="flex items-center gap-0.5 overflow-x-auto no-scrollbar">
            {tools.map(tool => (
              <button
                key={tool.format}
                onMouseDown={e => e.preventDefault()}
                onClick={() => editor.format(tool.format)}
                aria-label={tool.label}
                title={tool.label}
                className={toolButton}
              >
                {tool.icon}
              </button>
            ))}
          </div>
        )}
      </div>

      <textarea
        {...editor.textareaProps}
        data-testid="nota-texto"
        placeholder={t('gm.note.bodyPlaceholder')}
        aria-label={t('gm.tabNotes')}
        aria-autocomplete="list"
        aria-controls={suggestions ? listId : undefined}
        aria-activedescendant={suggestions?.length ? optionId(activeIndex) : undefined}
        className="w-full min-h-[45vh] field-sizing-content bg-transparent px-4 sm:px-6 py-4 text-[15px] leading-relaxed text-[#F5F0E8] placeholder:text-[#A8A09B] focus:outline-none resize-y"
      />
      <p className="px-4 sm:px-6 pb-1 text-[12px] text-[#A8A09B] font-mono break-words">{t('gm.note.markdownHint')}</p>
    </div>
  )
}
