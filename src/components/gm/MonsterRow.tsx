import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { StatBlock } from '../../types'

interface MonsterRowProps {
  block: StatBlock
  /** Botões à direita. */
  actions?: ReactNode
  onClick?: () => void
}

/** Linha de monstro/NPC: nome, tipo, ND, CA e PV — o que se procura numa lista. */
export function MonsterRow({ block, actions, onClick }: MonsterRowProps) {
  const { t } = useTranslation()
  const info = (
    <div className="min-w-0 flex-1 text-left">
      <div className="font-bold text-[15px] text-[#F5F0E8] truncate">{block.name || t('gm.unnamed')}</div>
      <div className="text-[12px] text-[#A8A09B]">
        {t(`gm.sizes.${block.size}`)} {t(`gm.creatureTypes.${block.creature_type}`)} · {t('gm.cr')} {block.cr} · {t('gm.ac')} {block.ac} · {t('gm.hp')} {block.hp.average}
      </div>
    </div>
  )

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-[11px] border border-white/[0.07] bg-[#1A1714] px-3 py-2.5">
      {onClick ? (
        <button onClick={onClick} className="flex-1 min-w-0 flex cursor-pointer">{info}</button>
      ) : info}
      {actions && <div className="flex items-center gap-1.5 flex-shrink-0">{actions}</div>}
    </div>
  )
}

/** Botão pequeno das linhas de lista. */
export const rowButton =
  'text-[12px] font-semibold text-[#E8DFD0] bg-white/5 hover:bg-white/10 border border-white/[0.1] rounded-[8px] px-2.5 py-1.5 cursor-pointer transition-colors'
export const rowDangerButton =
  'text-[12px] font-semibold text-[#b56a6a] bg-[rgba(181,57,47,0.1)] border border-[rgba(181,57,47,0.28)] hover:bg-[rgba(181,57,47,0.2)] rounded-[8px] px-2.5 py-1.5 cursor-pointer transition-colors'
