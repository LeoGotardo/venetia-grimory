import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TermsNotice } from './TermsNotice'
import Button from './Button'
import { useCloudAccount } from '../../hooks/useCloudAccount'
import { useCloudStore } from '../../store/cloudStore'
import { DeleteAccountPanel } from './DeleteAccountPanel'
import { prepareSignOut, signIn, signOutAndWipe, syncNow } from '../../services/cloudSync'
import { firebaseErrorCode, isCancelledSignIn } from '../../services/firebaseAuth'
import { isDesktop } from '../../lib/platform'
import { GoogleIcon } from './GoogleIcon'


type SignOutStep = { kind: 'idle' } | { kind: 'preparing' } | { kind: 'confirm'; unsynced: number } | { kind: 'leaving' }

/**
 * Aba "Conta" das configurações: login com Google, estado do sync das fichas e
 * campanhas, sair e excluir a conta. Carregada sob demanda — traz o Firebase.
 */
export function AccountPanel() {
  const { t } = useTranslation()
  const { profile, pending, localOnly } = useCloudAccount()
  const { phase, error, sessionExpired } = useCloudStore()
  const [signingIn, setSigningIn] = useState(false)
  const [signInError, setSignInError] = useState<string | null>(null)
  const [signOut, setSignOut] = useState<SignOutStep>({ kind: 'idle' })
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deletedNotice, setDeletedNotice] = useState(false)
  // No desktop o login continua no navegador; quem fechou a aba sem terminar
  // clica de novo, e o pedido novo cancela o anterior. Só o último encerra o "Entrando…".
  const desktop = isDesktop()
  const attempt = useRef(0)

  async function handleSignIn() {
    const current = ++attempt.current
    setSigningIn(true)
    setSignInError(null)
    setDeletedNotice(false)
    try {
      await signIn()
    } catch (err) {
      const code = firebaseErrorCode(err)
      if (!isCancelledSignIn(code)) {
        console.error('[conta] Falha no login.', err)
        setSignInError(
          code === 'auth/popup-blocked' ? t('account.errorPopupBlocked')
            : code === 'no_credential' ? t('account.errorNoAccount')
            : code === 'config' ? t('account.errorAppSignature')
            : code === 'auth/unauthorized-domain' ? t('account.errorDomain')
              : code === 'auth/network-request-failed' ? t('account.errorNetwork')
                : t('account.errorGeneric'),
        )
      }
    } finally {
      if (attempt.current === current) setSigningIn(false)
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
    } catch (err) {
      console.error('[conta] Falha ao sair.', err)
      setSignOut({ kind: 'idle' })
    }
  }

  const signInButton = (
    <>
      <Button onClick={handleSignIn} disabled={signingIn && !desktop} size="lg" className="w-full">
        <GoogleIcon />
        {signingIn ? t('account.signingIn') : t('account.signInGoogle')}
      </Button>
      {signingIn && desktop && <p className="text-[13px] text-[#A8A09B] leading-relaxed">{t('account.desktopContinueInBrowser')}</p>}
    </>
  )

  return (
    <>
      {!profile ? (
        <div className="space-y-4">
          <p className="text-sm text-[#E8DFD0] leading-relaxed">{t('account.intro')}</p>
          {signInButton}
          <TermsNotice lead={t('terms.noticeSignIn')} />
          {deletedNotice && <p role="status" className="text-sm text-[#D4A017]">{t('account.deleted')}</p>}
          {signInError && <p role="alert" className="text-sm text-[#E8A0A0]">{signInError}</p>}
          {/* A conta foi excluída em outro aparelho: este foi desvinculado, com os dados mantidos. */}
          {!signInError && error === 'deleted' && <p role="status" className="text-sm text-[#D4A017]">{t('account.deletedElsewhere')}</p>}
          {/* O login deu certo, mas vincular a conta falhou (handleAuth desfez o vínculo): sem isto, nada aparecia. */}
          {!signInError && error && error !== 'deleted' && <p role="alert" className="text-sm text-[#E8A0A0]">{t('account.errorGeneric')}</p>}
        </div>
      ) : confirmingDelete ? (
        <DeleteAccountPanel
          onCancel={() => setConfirmingDelete(false)}
          onDeleted={() => {
            setConfirmingDelete(false)
            setDeletedNotice(true)
          }}
        />
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmingDelete(true)}
              disabled={sessionExpired || signOut.kind === 'preparing'}
              className="w-full mt-1 text-[#A8A09B]"
            >
              {t('account.deleteAccount')}
            </Button>
            {sessionExpired && <p className="text-xs text-[#A8A09B] text-center">{t('account.deleteNeedsSession')}</p>}
          </div>
        </div>
      )}
    </>
  )
}
