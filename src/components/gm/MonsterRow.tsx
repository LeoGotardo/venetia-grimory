import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { StatBlock } from '../../types'

interface MonsterRowProps {
  block: StatBlock
  /** Botões à direita. */
  actions?: ReactNode
  onClick?: () => void
  /** Linha aberta no painel ao lado. */
  selected?: boolean
}

/** Linha de monstro/NPC: nome, tipo, ND, CA e PV — o que se procura numa lista. */
export function MonsterRow({ block, actions, onClick, selected }: MonsterRowProps) {
  const { t } = useTranslation()
  const info = (
    <div className="min-w-0 flex-1 text-left">
      <div className="font-bold text-[16px] text-[#F5F0E8] truncate">{block.name || t('gm.unnamed')}</div>
      <div className="text-[13px] text-[#A8A09B] mt-0.5">
        {t('gm.sizeType', { size: t(`gm.sizes.${block.size}`), type: t(`gm.creatureTypes.${block.creature_type}`) })} · {t('gm.cr')} {block.cr} · {t('gm.ac')} {block.ac} · {t('gm.hp')} {block.hp.average}
      </div>
    </div>
  )

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center gap-2 rounded-[12px] border transition-colors px-4 py-3 ${
      selected ? 'border-[#D4A017] bg-[rgba(212,160,23,0.08)]' : 'border-white/[0.07] bg-[#1A1714] hover:border-[rgba(212,160,23,0.3)]'
    }`}>
      {onClick ? (
        <button onClick={onClick} aria-pressed={selected} className="flex-1 min-w-0 flex cursor-pointer">{info}</button>
      ) : info}
      {actions && <div className="flex items-center gap-1.5 flex-shrink-0">{actions}</div>}
    </div>
  )
}

/** Botão pequeno das linhas de lista. */
export const rowButton =
  'inline-flex items-center justify-center min-h-[36px] text-[13px] font-semibold text-[#E8DFD0] bg-white/5 hover:bg-white/10 border border-white/[0.1] rounded-[8px] px-3 py-1.5 cursor-pointer transition-colors'
export const rowDangerButton =
  'inline-flex items-center justify-center min-h-[36px] text-[13px] font-semibold text-[#b56a6a] bg-[rgba(181,57,47,0.1)] border border-[rgba(181,57,47,0.28)] hover:bg-[rgba(181,57,47,0.2)] rounded-[8px] px-3 py-1.5 cursor-pointer transition-colors'
