import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SettingsButton } from '../ui/SettingsButton'
import { useBackHandler } from '../../hooks/useBackHandler'

interface GmHeaderProps {
  title: ReactNode
  backTo: string
  /** Substitui a navegação do botão voltar (ex.: confirmar antes de descartar). */
  onBack?: () => void
  actions?: ReactNode
}

/** Navbar fixa das telas do mestre, no mesmo estilo da Home, sempre com a engrenagem das configurações. */
export function GmHeader({ title, backTo, onBack, actions }: GmHeaderProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const back = () => (onBack ? onBack() : navigate(backTo))
  // O voltar do Android vai para o mesmo lugar (e pede a mesma confirmação) que este botão.
  useBackHandler(true, back, 'page')

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-3 h-[64px] px-4 sm:px-8 xl:px-12 bg-[#161311] border-b border-white/[0.06]">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={back}
          aria-label={t('gm.back')}
          className="w-[40px] h-[40px] flex-shrink-0 rounded-[10px] bg-white/5 border border-white/[0.09] text-[#A8A09B] hover:text-[#E8DFD0] flex items-center justify-center cursor-pointer transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>
        </button>
        <div className="min-w-0 font-extrabold text-[17px] text-[#E8DFD0] truncate">{title}</div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {actions}
        <SettingsButton className="w-[40px] h-[40px] rounded-[10px]" />
      </div>
    </header>
  )
}

/** Botão secundário das telas do mestre (mesmo visual dos botões da Home). */
/** Largura das telas do mestre: larga para o desktop usar a tela, com respiro lateral. */
export const gmContainer = 'w-full max-w-[1480px] mx-auto px-4 sm:px-8 xl:px-12'

export const gmSecondaryButton =
  'inline-flex items-center justify-center gap-2 min-h-[42px] text-[14px] font-semibold text-[#E8DFD0] bg-white/5 hover:bg-white/10 border border-[rgba(212,160,23,0.25)] hover:border-[rgba(212,160,23,0.5)] rounded-[10px] px-3.5 py-2 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-default'

export const gmPrimaryButton =
  'inline-flex items-center justify-center gap-2 min-h-[42px] text-[14px] font-bold text-[#131110] bg-[#D4A017] hover:bg-[#E8C25A] border-0 rounded-[10px] px-4 py-2 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-default'
