import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from './Modal'
import Button from './Button'
import { useCloudAccount } from '../../hooks/useCloudAccount'
import { useCloudStore } from '../../store/cloudStore'
import { prepareSignOut, signIn, signOutAndWipe, syncNow } from '../../services/cloudSync'
import { firebaseErrorCode } from '../../services/firebaseAuth'

interface AccountModalProps {
  open: boolean
  onClose: () => void
}

/** Fechou o popup, ou abriu outro por cima: não é erro para mostrar. */
const CANCELLED = new Set(['auth/popup-closed-by-user', 'auth/cancelled-popup-request', 'auth/user-cancelled', 'cancelled'])

type SignOutStep = { kind: 'idle' } | { kind: 'preparing' } | { kind: 'confirm'; unsynced: number } | { kind: 'leaving' }

/** Login com Google e o estado do sync das fichas e campanhas com a conta. */
export function AccountModal({ open, onClose }: AccountModalProps) {
  const { t } = useTranslation()
  const { profile, pending, localOnly } = useCloudAccount()
  const { phase, error, sessionExpired } = useCloudStore()
  const [signingIn, setSigningIn] = useState(false)
  const [signInError, setSignInError] = useState<string | null>(null)
  const [signOut, setSignOut] = useState<SignOutStep>({ kind: 'idle' })

  async function handleSignIn() {
    setSigningIn(true)
    setSignInError(null)
    try {
      await signIn()
    } catch (err) {
      const code = firebaseErrorCode(err)
      if (!code || !CANCELLED.has(code)) {
        console.error('[conta] Falha no login.', err)
        setSignInError(
          code === 'auth/popup-blocked' ? t('account.errorPopupBlocked')
            : code === 'no_credential' ? t('account.errorNoAccount')
            : code === 'auth/unauthorized-domain' ? t('account.errorDomain')
              : code === 'auth/network-request-failed' ? t('account.errorNetwork')
                : t('account.errorGeneric'),
        )
      }
    } finally {
      setSigningIn(false)
    }
  }

  async function handlePrepareSignOut() {
    setSignOut({ kind: 'preparing' })
    setSignOut({ kind: 'confirm', unsynced: await prepareSignOut() })
  }

  async function handleSignOut() {
    setSignOut({ kind: 'leaving' })
    try {
      await signOutAndWipe()
      setSignOut({ kind: 'idle' })
      onClose()
    } catch (err) {
      console.error('[conta] Falha ao sair.', err)
      setSignOut({ kind: 'idle' })
    }
  }

  const signInButton = (
    <Button onClick={handleSignIn} disabled={signingIn} size="lg" className="w-full">
      <GoogleIcon />
      {signingIn ? t('account.signingIn') : t('account.signInGoogle')}
    </Button>
  )

  return (
    <Modal open={open} onClose={onClose} title={t('account.title')}>
      {!profile ? (
        <div className="space-y-4">
          <p className="text-sm text-[#E8DFD0] leading-relaxed">{t('account.intro')}</p>
          {signInButton}
          {signInError && <p role="alert" className="text-sm text-[#E8A0A0]">{signInError}</p>}
        </div>
      ) : signOut.kind === 'confirm' || signOut.kind === 'leaving' ? (
        <div className="space-y-4">
          <p className="text-sm text-[#E8DFD0] leading-relaxed">{t('account.signOutExplain')}</p>
          {signOut.kind === 'confirm' && signOut.unsynced > 0 && (
            <p role="alert" className="text-sm text-[#E8A0A0] leading-relaxed">
              {t('account.signOutUnsynced', { count: signOut.unsynced })}
            </p>
          )}
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
            <Button variant="secondary" onClick={() => setSignOut({ kind: 'idle' })} disabled={signOut.kind === 'leaving'}>
              {t('account.cancel')}
            </Button>
            <Button variant="danger" onClick={handleSignOut} disabled={signOut.kind === 'leaving'}>
              {signOut.kind === 'leaving' ? t('account.leaving') : t('account.signOutConfirm')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {profile.photo ? (
              <img src={profile.photo} alt="" referrerPolicy="no-referrer" className="w-11 h-11 rounded-full border border-[#B8860B]/40" />
            ) : (
              <span aria-hidden="true" className="w-11 h-11 rounded-full bg-[#2D2520] border border-[#B8860B]/40" />
            )}
            <div className="min-w-0">
              {profile.name && <p className="font-semibold text-[#F5F0E8] truncate">{profile.name}</p>}
              {profile.email && <p className="text-sm text-[#A8A09B] truncate">{profile.email}</p>}
            </div>
          </div>

          <div aria-live="polite" className="rounded-lg bg-[#2D2520] border border-white/[0.06] p-3 text-sm space-y-1.5">
            {sessionExpired ? (
              <p className="text-[#D4A017]">{t('account.sessionExpired')}</p>
            ) : phase === 'syncing' ? (
              <p className="text-[#E8DFD0]">{t('account.syncing')}</p>
            ) : phase === 'offline' ? (
              <p className="text-[#D4A017]">{t('account.offline')}</p>
            ) : phase === 'error' ? (
              <p className="text-[#E8A0A0]">{error === 'permission' ? t('account.errorPermission')
                : error === 'quota' ? t('account.errorQuota')
                  : t('account.errorSync')}</p>
            ) : pending - localOnly > 0 ? (
              <p className="text-[#E8DFD0]">{t('account.pending', { count: pending - localOnly })}</p>
            ) : (
              <p className="text-[#A8A09B]">{t('account.synced')}</p>
            )}
            {localOnly > 0 && <p className="text-[#D4A017]">{t('account.localOnly', { count: localOnly })}</p>}
          </div>

          {sessionExpired ? (
            <>
              {signInButton}
              {signInError && <p role="alert" className="text-sm text-[#E8A0A0]">{signInError}</p>}
            </>
          ) : (
            <Button variant="secondary" onClick={() => void syncNow()} disabled={phase === 'syncing'} className="w-full">
              {t('account.syncNow')}
            </Button>
          )}

          <div className="pt-1 border-t border-white/[0.06]">
            <Button
              variant="ghost"
              onClick={handlePrepareSignOut}
              disabled={signOut.kind === 'preparing'}
              className="w-full mt-3 text-[#E8A0A0]"
            >
              {signOut.kind === 'preparing' ? t('account.preparingSignOut') : t('account.signOut')}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/>
    </svg>
  )
}
