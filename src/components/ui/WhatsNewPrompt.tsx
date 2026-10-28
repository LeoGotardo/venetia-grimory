import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from './Modal'
import Button from './Button'
import { currentVersion, noteItems, notesToShow } from '../../lib/releaseNotes'
import { hasSavedData, markVersionSeen, readSeenVersion } from '../../services/seenVersion'

interface WhatsNewPromptProps {
  /** Chamado quando não há o que mostrar ou a pessoa fecha — o `App` segura o aviso de atualização até lá. */
  onDone: () => void
}

/** Novidades da versão, uma vez na primeira abertura depois de atualizar (web e app). */
export function WhatsNewPrompt({ onDone }: WhatsNewPromptProps) {
  const { t, i18n } = useTranslation()
  const [notes] = useState(() => notesToShow(readSeenVersion(), hasSavedData()))
  const [open, setOpen] = useState(notes.length > 0)

  useEffect(() => {
    if (open) return
    // Instalação nova ou versão já vista: só registra, sem mostrar nada.
    const version = currentVersion()
    if (version) markVersionSeen(version)
    onDone()
  }, [open, onDone])

  if (!open) return null

  return (
    <Modal open onClose={() => setOpen(false)} title={t('whatsNew.title')}>
      <div className="space-y-5 text-sm text-[#F5F0E8]">
        {notes.map(note => (
          <section key={note.version} aria-labelledby={`novidades-${note.version}`}>
            <h3 id={`novidades-${note.version}`} className="font-semibold text-[#D4A017] mb-2">
              {t('whatsNew.version', { version: note.version.replace(/^v/, '') })}
            </h3>
            <ul className="space-y-2 list-disc pl-5 leading-relaxed marker:text-[#B8860B]">
              {noteItems(note, i18n.language).map(item => <li key={item}>{item}</li>)}
            </ul>
          </section>
        ))}
        <div className="flex justify-end">
          <Button onClick={() => setOpen(false)}>{t('whatsNew.close')}</Button>
        </div>
      </div>
    </Modal>
  )
}
