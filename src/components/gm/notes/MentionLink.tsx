import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { findMentionTarget, type Mention, type MentionKind, type MentionTarget } from '../../../lib/gm/notes'
import { PeopleIcon, QuillIcon, SkullIcon } from '../ornaments'
import { mentionName } from './mentionLabels'

export function MentionKindIcon({ kind, size = 13 }: { kind: MentionKind; size?: number }) {
  if (kind === 'player') return <PeopleIcon size={size} />
  if (kind === 'npc') return <QuillIcon size={size} />
  return <SkullIcon size={size} />
}

interface MentionLinkProps {
  mention: Mention
  /** Texto do link no markdown: o nome na hora da menção. */
  label: ReactNode
  targets: MentionTarget[]
  srdReady: boolean
  onOpen: (target: MentionTarget) => void
}

/**
 * Menção dentro da nota: mostra o nome atual (renomear o NPC atualiza a nota)
 * e abre a ficha. Quem foi apagado aparece riscado; monstro do SRD espera o catálogo.
 */
export function MentionLink({ mention, label, targets, srdReady, onOpen }: MentionLinkProps) {
  const { t } = useTranslation()
  const target = findMentionTarget(targets, mention)

  if (!target) {
    const loading = mention.kind === 'monster' && !srdReady
    return (
      <span
        title={loading ? undefined : t('gm.note.missing')}
        className={`inline-flex items-baseline gap-1 rounded-[6px] px-1.5 text-[#A8A09B] ${loading ? '' : 'line-through decoration-[#b56a6a]'}`}
      >
        <span className="self-center"><MentionKindIcon kind={mention.kind} /></span>
        {label}
      </span>
    )
  }

  const name = mentionName(t, target)
  return (
    <button
      type="button"
      onClick={() => onOpen(target)}
      aria-label={t('gm.note.openMention', { name })}
      className="inline-flex items-baseline gap-1 rounded-[6px] px-1.5 font-semibold text-[#E8C25A] bg-[rgba(212,160,23,0.12)] border border-[rgba(212,160,23,0.28)] hover:bg-[rgba(212,160,23,0.22)] hover:text-[#F5F0E8] cursor-pointer transition-colors"
    >
      <span className="self-center"><MentionKindIcon kind={target.kind} /></span>
      {name}
    </button>
  )
}
