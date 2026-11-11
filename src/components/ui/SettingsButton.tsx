import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ConfigModal } from './ConfigModal'
import { isCloudAvailable } from '../../lib/cloud/config'
import { useCloudStore } from '../../store/cloudStore'

interface SettingsButtonProps {
  className?: string
}

/**
 * Engrenagem da navbar que abre as configurações (preferências, conta, sobre);
 * dona do estado do modal. Com a conta pedindo atenção (sessão expirada, erro de
 * sync), mostra um ponto e abre direto na aba da conta.
 */
export function SettingsButton({ className = 'w-[34px] h-[34px] rounded-[9px]' }: SettingsButtonProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const attention = useCloudStore(s => isCloudAvailable() && (s.sessionExpired || s.phase === 'error'))

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={t('home.settings')}
        className={`${className} relative flex-shrink-0 bg-white/5 border border-white/[0.09] text-[#A8A09B] hover:text-[#E8DFD0] flex items-center justify-center cursor-pointer transition-colors`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
        {attention && (
          <span aria-hidden="true" className="absolute top-[3px] right-[3px] w-2 h-2 rounded-full bg-[#D4A017] ring-2 ring-[#161311]" />
        )}
      </button>
      {/* Montado só aberto: cada abertura começa na aba certa. */}
      {open && <ConfigModal open onClose={() => setOpen(false)} initialTab={attention ? 'account' : 'preferences'} />}
    </>
  )
}
