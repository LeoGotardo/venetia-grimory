import { useTranslation } from 'react-i18next'
import type { CampaignNote } from '../../../types'
import { noteSummary } from '../../../lib/gm/notes'
import { gmPrimaryButton } from '../GmHeader'
import { PeopleIcon, PlusIcon } from '../ornaments'

interface NoteListProps {
  notes: CampaignNote[]
  /** Nota aberta ao lado (desktop); `null` no celular. */
  selectedId: string | null
  query: string
  onQuery: (query: string) => void
  onSelect: (id: string) => void
  onCreate: () => void
}

/** Lista de notas com busca: título (ou a primeira linha), resumo e data da última edição. */
export function NoteList({ notes, selectedId, query, onQuery, onSelect, onCreate }: NoteListProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-3 min-w-0 lg:sticky lg:top-[88px] lg:max-h-[calc(100dvh-108px)]">
      <div className="flex gap-2">
        <input
          type="search"
          value={query}
          onChange={e => onQuery(e.target.value)}
          placeholder={t('gm.note.search')}
          aria-label={t('gm.note.search')}
          className="flex-1 min-w-0 bg-[#1A1714] border border-[rgba(212,160,23,0.25)] rounded-[10px] px-3.5 py-2.5 text-[15px] text-[#F5F0E8] placeholder:text-[#A8A09B] focus:outline-none focus:border-[#D4A017]"
        />
        <button data-testid="nota-nova" onClick={onCreate} className={gmPrimaryButton}>
          <PlusIcon size={16} /> {t('gm.note.newNote')}
        </button>
      </div>

      {notes.length === 0 ? (
        <p className="text-center text-[14px] text-[#A8A09B] py-8">{t('gm.note.noMatches')}</p>
      ) : (
        <ul className="flex flex-col gap-2 lg:overflow-y-auto lg:pr-1">
          {notes.map(note => (
            <li key={note.id}>
              <NoteRow note={note} selected={note.id === selectedId} onOpen={() => onSelect(note.id)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function NoteRow({ note, selected, onOpen }: { note: CampaignNote; selected: boolean; onOpen: () => void }) {
  const { t } = useTranslation()
  const { title, snippet } = noteSummary(note)

  return (
    <button
      onClick={onOpen}
      aria-pressed={selected}
      className={`w-full text-left rounded-[12px] border px-4 py-3 cursor-pointer transition-colors ${
        selected ? 'border-[#D4A017] bg-[rgba(212,160,23,0.08)]' : 'border-white/[0.07] bg-[#1A1714] hover:border-[rgba(212,160,23,0.3)]'
      }`}
    >
      <span className={`flex items-center gap-1.5 font-bold text-[16px] ${title ? 'text-[#F5F0E8]' : 'text-[#A8A09B] italic'}`}>
        <span className="truncate">{title || t('gm.note.untitled')}</span>
        {note.shared && (
          <span title={t('gm.note.shared')} className="flex-shrink-0 text-[#E8C25A]">
            <PeopleIcon size={14} />
            <span className="sr-only">{t('gm.note.shared')}</span>
          </span>
        )}
      </span>
      {snippet && <span className="block text-[13px] text-[#E8DFD0] mt-0.5 line-clamp-2">{snippet}</span>}
      <span className="block text-[12px] text-[#A8A09B] mt-1 tabular-nums">{new Date(note.updated_at).toLocaleDateString()}</span>
    </button>
  )
}
