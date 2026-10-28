import { lazy, Suspense, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCloudAccount } from '../../hooks/useCloudAccount'
import { useCloudStore } from '../../store/cloudStore'
import { isCloudAvailable } from '../../lib/cloud/config'

// O modal traz o Firebase consigo: só carrega quando alguém abre.
const AccountModal = lazy(() => import('./AccountModal').then(m => ({ default: m.AccountModal })))

/** Botão da conta na navbar: foto de quem entrou, ou o ícone de entrar. Some sem Firebase configurado e no app Android. */
export function AccountButton() {
  const { t } = useTranslation()
  const { profile } = useCloudAccount()
  const attention = useCloudStore(s => s.sessionExpired || s.phase === 'error')
  const [open, setOpen] = useState(false)

  if (!isCloudAvailable()) return null

  return (
    <>
      <button
        data-testid="conta"
        onClick={() => setOpen(true)}
        aria-label={profile ? t('account.openAccount') : t('account.signIn')}
        className="relative w-[34px] h-[34px] rounded-[9px] flex-shrink-0 bg-white/5 border border-white/[0.09] text-[#A8A09B] hover:text-[#E8DFD0] flex items-center justify-center cursor-pointer transition-colors overflow-hidden"
      >
        {profile?.photo ? (
          <img src={profile.photo} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 21a8 8 0 0 1 16 0"/>
          </svg>
        )}
        {attention && (
          <span aria-hidden="true" className="absolute top-[3px] right-[3px] w-2 h-2 rounded-full bg-[#D4A017] ring-2 ring-[#161311]" />
        )}
      </button>
      {open && (
        <Suspense fallback={null}>
          <AccountModal open onClose={() => setOpen(false)} />
        </Suspense>
      )}
    </>
  )
}
