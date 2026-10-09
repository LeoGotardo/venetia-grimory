import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Campaign, CampaignNote } from '../../../types'
import { noteMatches, noteSummary, sortNotes, type MentionTarget } from '../../../lib/gm/notes'
import { useGmStore } from '../../../store/gmStore'
import { useMediaQuery } from '../../../hooks/useMediaQuery'
import { useBackHandler } from '../../../hooks/useBackHandler'
import { useMentionTargets } from '../../../hooks/useMentionTargets'
import { gmPrimaryButton } from '../GmHeader'
import { EmptyState, PlusIcon, ScrollIcon } from '../ornaments'
import { NoteList } from './NoteList'
import { NoteEditor } from './NoteEditor'
import { MentionLink } from './MentionLink'
import { MentionPreviewModal } from './MentionPreviewModal'

/** Parâmetro da URL com a nota aberta: voltar de uma ficha citada cai na mesma nota. */
const NOTE_PARAM = 'nota'

/**
 * Aba Notas da campanha. Desktop: lista ao lado da nota aberta. Celular: a
 * lista, e a nota aberta ocupa a aba (o voltar do Android volta para a lista).
 */
export function NotesTab({ campaign }: { campaign: Campaign }) {
  const { t } = useTranslation()
  const createNote = useGmStore(s => s.createNote)
  const deleteNote = useGmStore(s => s.deleteNote)
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [preview, setPreview] = useState<MentionTarget | null>(null)

  const notes = sortNotes(campaign.notes)
  const requested = campaign.notes.find(n => n.id === searchParams.get(NOTE_PARAM)) ?? null
  const selected = requested ?? (isDesktop ? notes[0] ?? null : null)
  const { targets, srdReady, requestSrd } = useMentionTargets(campaign, selected?.body ?? '')

  function select(id: string | null) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (id) next.set(NOTE_PARAM, id)
      else next.delete(NOTE_PARAM)
      return next
    }, { replace: true })
  }

  useBackHandler(!isDesktop && requested != null, () => select(null))

  function handleCreate() {
    setQuery('')
    select(createNote())
  }

  function handleDelete(note: CampaignNote) {
    const name = noteSummary(note).title || t('gm.note.untitled')
    if (!confirm(t('gm.note.deleteConfirm', { name }))) return
    deleteNote(note.id)
    select(null)
  }

  if (campaign.notes.length === 0) {
    return (
      <EmptyState icon={<ScrollIcon size={34} />} title={t('gm.note.empty')} hint={t('gm.note.emptyHint')}>
        <button data-testid="nota-nova" onClick={handleCreate} className={gmPrimaryButton}>
          <PlusIcon size={16} /> {t('gm.note.newNote')}
        </button>
      </EmptyState>
    )
  }

  return (
    <section className="grid grid-cols-1 lg:grid-cols-[340px_minmax(0,1fr)] gap-6 items-start">
      {(isDesktop || !selected) && (
        <NoteList
          notes={notes.filter(n => noteMatches(n, query))}
          selectedId={isDesktop ? selected?.id ?? null : null}
          query={query}
          onQuery={setQuery}
          onSelect={select}
          onCreate={handleCreate}
        />
      )}
      {selected && (
        <NoteEditor
          key={selected.id}
          note={selected}
          targets={targets}
          renderMention={(mention, label) => (
            <MentionLink mention={mention} label={label} targets={targets} srdReady={srdReady} onOpen={setPreview} />
          )}
          onSuggest={requestSrd}
          onDelete={() => handleDelete(selected)}
          onBack={isDesktop ? undefined : () => select(null)}
        />
      )}
      <MentionPreviewModal target={preview} campaign={campaign} onClose={() => setPreview(null)} />
    </section>
  )
}
