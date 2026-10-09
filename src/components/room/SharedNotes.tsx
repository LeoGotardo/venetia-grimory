import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { RoomDoc, SharedNote } from '../../lib/room/protocol'
import { sharedNoteSchema } from '../../lib/room/protocol'
import { MarkdownNote } from '../gm/notes/MarkdownNote'
import { ChevronIcon, EmptyState, ScrollIcon } from '../gm/ornaments'

interface NoteEntry extends SharedNote {
  id: string
}

/**
 * Notas que o mestre compartilhou, mais recentes primeiro; tocar abre a nota.
 * Só leitura: o texto já chega sem os links das citações. Carregada sob demanda
 * (o markdown fica fora da página da sala até a aba abrir).
 */
export function SharedNotes({ docs }: { docs: RoomDoc[] }) {
  const { t } = useTranslation()
  const [openId, setOpenId] = useState<string | null>(null)

  const notes = useMemo(() => docs.flatMap((doc): NoteEntry[] => {
    const parsed = sharedNoteSchema.safeParse(doc.data)
    if (!parsed.success) {
      console.error('[salas] Nota compartilhada fora do contrato.', parsed.error)
      return []
    }
    return [{ id: doc.id, ...parsed.data }]
  }).sort((a, b) => b.updated_at.localeCompare(a.updated_at)), [docs])

  if (notes.length === 0) return <EmptyState icon={<ScrollIcon size={34} />} title={t('room.notesEmpty')} />

  return (
    <ul className="flex flex-col gap-2">
      {notes.map(note => {
        const open = note.id === openId
        return (
          <li key={note.id} className="vg-card overflow-hidden">
            <button
              aria-expanded={open}
              onClick={() => setOpenId(open ? null : note.id)}
              className="w-full flex items-center gap-2 px-4 py-3 text-left cursor-pointer"
            >
              <span className="text-[#D4A017]"><ChevronIcon open={open} size={16} /></span>
              <span className="min-w-0 flex-1">
                <span className="block font-cinzel font-semibold text-[16px] text-[#F5F0E8] truncate">{note.title || t('gm.note.untitled')}</span>
                <span className="block text-[12px] text-[#A8A09B]">{t('gm.note.updated', { date: new Date(note.updated_at).toLocaleString() })}</span>
              </span>
            </button>
            {open && (
              <div className="border-t border-white/[0.07] px-4 py-4">
                <MarkdownNote markdown={note.body} renderMention={(_, label) => label} />
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
