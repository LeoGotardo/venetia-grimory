import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

interface GmHeaderProps {
  title: ReactNode
  backTo: string
  /** Substitui a navegação do botão voltar (ex.: confirmar antes de descartar). */
  onBack?: () => void
  actions?: ReactNode
}

/** Navbar fixa das telas do mestre, no mesmo estilo da Home. */
export function GmHeader({ title, backTo, onBack, actions }: GmHeaderProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-3 h-[60px] px-4 sm:px-7 bg-[#161311] border-b border-white/[0.06]">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => (onBack ? onBack() : navigate(backTo))}
          aria-label={t('gm.back')}
          className="w-[34px] h-[34px] flex-shrink-0 rounded-[9px] bg-white/5 border border-white/[0.09] text-[#A8A09B] hover:text-[#E8DFD0] flex items-center justify-center cursor-pointer transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>
        </button>
        <div className="min-w-0 font-extrabold text-[15px] text-[#E8DFD0] truncate">{title}</div>
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </header>
  )
}

/** Botão secundário das telas do mestre (mesmo visual dos botões da Home). */
export const gmSecondaryButton =
  'inline-flex items-center gap-[7px] text-[13px] font-semibold text-[#E8DFD0] bg-white/5 hover:bg-white/10 border border-[rgba(212,160,23,0.25)] hover:border-[rgba(212,160,23,0.5)] rounded-[9px] px-3 py-2 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-default'

export const gmPrimaryButton =
  'inline-flex items-center justify-center gap-[7px] text-[13px] font-bold text-[#131110] bg-[#D4A017] hover:bg-[#E8C25A] border-0 rounded-[9px] px-4 py-2 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-default'
