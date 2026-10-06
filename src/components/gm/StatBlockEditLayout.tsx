import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { StatBlock } from '../../types'
import { GmHeader, gmPrimaryButton } from './GmHeader'
import { StatBlockEditor } from './StatBlockEditor'
import { StatBlockCard } from './StatBlockCard'

interface StatBlockEditLayoutProps {
  title: string
  backTo: string
  initial: StatBlock
  /** Campos extras acima do bloco (ex.: notas do NPC). Recebem o aviso de alteração. */
  extra?: (markDirty: () => void) => ReactNode
  onSave: (statblock: StatBlock) => void
}

/**
 * Tela de edição de um bloco: formulário à esquerda, prévia ao vivo à direita a
 * partir do `lg:`. O rascunho fica aqui e só vai para o store ao salvar.
 */
export function StatBlockEditLayout({ title, backTo, initial, extra, onSave }: StatBlockEditLayoutProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [draft, setDraft] = useState(initial)
  const [dirty, setDirty] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function change(next: StatBlock) {
    setDraft(next)
    setDirty(true)
    setError(null)
  }

  function back() {
    if (dirty && !confirm(t('gm.discardConfirm'))) return
    navigate(backTo)
  }

  function save() {
    if (!draft.name.trim()) {
      setError(t('gm.nameRequired'))
      return
    }
    onSave({ ...draft, name: draft.name.trim() })
    navigate(backTo)
  }

  return (
    <div className="min-h-screen bg-[#131110] font-[Manrope,system-ui]">
      <GmHeader
        title={title}
        backTo={backTo}
        onBack={back}
        actions={
          <button data-testid="bloco-salvar" onClick={save} className={gmPrimaryButton}>
            {t('gm.save')}
          </button>
        }
      />
      <div className="max-w-[1180px] mx-auto px-4 sm:px-8 py-6 pb-20">
        {error && <p role="alert" className="text-[13px] text-[#d4564a] mb-4">{error}</p>}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 items-start">
          <div className="flex flex-col gap-4 min-w-0">
            {extra?.(() => setDirty(true))}
            <StatBlockEditor value={draft} onChange={change} />
          </div>
          <aside className="lg:sticky lg:top-[76px] flex flex-col gap-2">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-[#A8A09B]">{t('gm.preview')}</h2>
            <StatBlockCard block={draft} />
          </aside>
        </div>
      </div>
    </div>
  )
}
