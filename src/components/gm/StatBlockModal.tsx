import type { ReactNode } from 'react'
import type { NpcProfile, StatBlock } from '../../types'
import { Modal } from '../ui/Modal'
import { StatBlockCard } from './StatBlockCard'
import { NpcPortrait } from './NpcPortrait'

interface StatBlockModalProps {
  block: StatBlock | null
  notes?: string
  profile?: NpcProfile | null
  /** Botões acima do bloco (ex.: editar). */
  actions?: ReactNode
  onClose: () => void
}

/** Consulta rápida de um bloco durante a sessão. */
export function StatBlockModal({ block, notes, profile, actions, onClose }: StatBlockModalProps) {
  return (
    <Modal open={block != null} onClose={onClose} title={block?.name} wide>
      {block && (
        <div className="flex flex-col gap-3">
          {actions && <div className="flex flex-wrap gap-1.5">{actions}</div>}
          {profile && <NpcPortrait name={block.name} profile={profile} />}
          <StatBlockCard block={block} />
          {notes && <p className="text-[13px] leading-relaxed text-[#E8DFD0] whitespace-pre-line">{notes}</p>}
        </div>
      )}
    </Modal>
  )
}
