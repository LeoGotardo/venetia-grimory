import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { CampaignNote } from '../../../types'
import { toggleTaskAt, type Mention, type MentionTarget } from '../../../lib/gm/notes'
import { useGmStore } from '../../../store/gmStore'
import { rowButton, rowDangerButton } from '../MonsterRow'
import { PeopleIcon } from '../ornaments'
import { MarkdownNote } from './MarkdownNote'
import { NoteWriter } from './NoteWriter'

type Mode = 'write' | 'read'

interface NoteEditorProps {
  note: CampaignNote
  targets: MentionTarget[]
  renderMention: (mention: Mention, label: ReactNode) => ReactNode
  onSuggest: () => void
  onDelete: () => void
  /** Só no celular, onde a nota aberta toma o lugar da lista. */
  onBack?: () => void
  /** A campanha tem sala aberta: mostra "Compartilhar com a mesa". */
  canShare: boolean
}

/** Uma nota: título, alternância Escrever/Ler e o texto. Nota vazia já abre escrevendo. */
export function NoteEditor({ note, targets, renderMention, onSuggest, onDelete, onBack, canShare }: NoteEditorProps) {
  const { t } = useTranslation()
  const updateNote = useGmStore(s => s.updateNote)
  const isBlank = !note.title && !note.body
  const [mode, setMode] = useState<Mode>(note.body ? 'read' : 'write')

  const modes: Array<{ id: Mode; label: string }> = [
    { id: 'write', label: t('gm.note.write') },
    { id: 'read', label: t('gm.note.read') },
  ]

  return (
    <article className="vg-card min-w-0 flex flex-col">
      <div className="flex items-center gap-2 px-4 sm:px-6 pt-4">
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 min-h-[38px] pr-2 text-[14px] font-semibold text-[#A8A09B] hover:text-[#E8DFD0] cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M11 18l-6-6 6-6" /></svg>
            {t('gm.note.backToList')}
          </button>
        )}
        <div role="radiogroup" aria-label={t('gm.note.mode')} className="inline-flex rounded-[10px] bg-[#131110] border border-white/[0.08] p-0.5">
          {modes.map(m => (
            <button
              key={m.id}
              role="radio"
              aria-checked={mode === m.id}
              onClick={() => setMode(m.id)}
              className={`min-h-[34px] px-3.5 rounded-[8px] text-[13px] font-semibold cursor-pointer transition-colors ${
                mode === m.id ? 'bg-[#D4A017] text-[#131110]' : 'text-[#A8A09B] hover:text-[#E8DFD0]'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <span className="flex-1" />
        {canShare && (
          <button
            data-testid="nota-compartilhar"
            aria-pressed={note.shared}
            onClick={() => updateNote(note.id, { shared: !note.shared })}
            title={note.shared ? t('gm.note.sharedHint') : t('gm.note.share')}
            className={`${rowButton} gap-1.5 ${note.shared ? '!border-[#D4A017] !bg-[rgba(212,160,23,0.14)] !text-[#E8C25A]' : ''}`}
          >
            <PeopleIcon size={15} />
            <span className="hidden sm:inline">{note.shared ? t('gm.note.shared') : t('gm.note.share')}</span>
          </button>
        )}
        <button onClick={onDelete} className={rowDangerButton}>{t('gm.note.delete')}</button>
      </div>

      <input
        value={note.title}
        onChange={e => updateNote(note.id, { title: e.target.value })}
        placeholder={t('gm.note.titlePlaceholder')}
        aria-label={t('gm.note.titlePlaceholder')}
        autoFocus={isBlank}
        data-testid="nota-titulo"
        className="mx-4 sm:mx-6 mt-3 mb-3 bg-transparent border-0 border-b border-transparent focus:border-[#D4A017] font-cinzel text-[22px] font-semibold text-[#F5F0E8] placeholder:text-[#A8A09B] focus:outline-none"
      />

      {mode === 'write' ? (
        <NoteWriter
          value={note.body}
          onChange={body => updateNote(note.id, { body })}
          targets={targets}
          onSuggest={onSuggest}
        />
      ) : (
        <div className="border-t border-white/[0.07] px-4 sm:px-6 py-5 min-h-[30vh]">
          {note.body.trim() ? (
            <MarkdownNote
              markdown={note.body}
              renderMention={renderMention}
              onToggleTask={offset => updateNote(note.id, { body: toggleTaskAt(note.body, offset) })}
            />
          ) : (
            <p className="text-[14px] text-[#A8A09B]">{t('gm.note.emptyBody')}</p>
          )}
        </div>
      )}

      <p className="px-4 sm:px-6 py-3 text-[12px] text-[#A8A09B] border-t border-white/[0.05]">
        {t('gm.note.updated', { date: new Date(note.updated_at).toLocaleString() })}
      </p>
    </article>
  )
}
