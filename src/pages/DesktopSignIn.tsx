import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../components/ui/Button'
import { GoogleIcon } from '../components/ui/GoogleIcon'
import { TermsNotice } from '../components/ui/TermsNotice'
import { VenetiaLogo } from '../components/ui/VenetiaLogo'
import { firebaseConfig } from '../lib/cloud/config'
import {
  DESKTOP_SIGN_IN_FIELDS, desktopSignInReturnUrl, parseDesktopSignIn, type DesktopSignInTarget,
} from '../lib/desktopBridge'
import { isApp, isDesktop } from '../lib/platform'
import { firebaseErrorCode, googleIdTokenForDesktop, isCancelledSignIn, prepareDesktopHandoff } from '../services/firebaseAuth'

type Stage = 'idle' | 'signingIn' | 'returning'

/**
 * Devolve o token ao app num POST de página inteira para o servidor local dele
 * (`electron/browserSignIn.ts`), que responde com a página "pode voltar ao app".
 * Formulário, não `fetch`: o token não aparece na URL nem no histórico, e o
 * navegador não pede permissão de acesso à rede local.
 */
function returnToApp(target: DesktopSignInTarget, idToken: string): void {
  const form = document.createElement('form')
  form.method = 'post'
  form.action = desktopSignInReturnUrl(target.port)
  for (const [name, value] of [[DESKTOP_SIGN_IN_FIELDS.state, target.state], [DESKTOP_SIGN_IN_FIELDS.token, idToken]]) {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = name
    input.value = value
    form.appendChild(input)
  }
  document.body.appendChild(form)
  form.submit()
}

/**
 * `/entrar-desktop`: o login com Google do app para Windows e Linux, aberto por
 * ele no navegador do sistema (o Google recusa login dentro do app). Faz o mesmo
 * popup do site e manda o ID token de volta ao app, que entra com ele como o
 * Android. A sessão do site neste navegador não muda (`googleIdTokenForDesktop`).
 */
export function DesktopSignIn() {
  const { t } = useTranslation()
  // Lida uma vez: a página só serve para o pedido que o app abriu.
  const target = useMemo(() => (isApp() || isDesktop() ? null : parseDesktopSignIn(window.location.search)), [])
  const available = firebaseConfig() !== null
  const [stage, setStage] = useState<Stage>('idle')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (target && available) prepareDesktopHandoff()
  }, [target, available])

  async function handleSignIn() {
    if (!target) return
    setStage('signingIn')
    setError(null)
    try {
      const idToken = await googleIdTokenForDesktop()
      setStage('returning')
      returnToApp(target, idToken)
    } catch (err) {
      setStage('idle')
      const code = firebaseErrorCode(err)
      if (isCancelledSignIn(code)) return
      console.error('[conta] Falha no login para o app desktop.', err)
      setError(
        code === 'auth/popup-blocked' ? t('account.errorPopupBlocked')
          : code === 'auth/unauthorized-domain' ? t('account.errorDomain')
            : code === 'auth/network-request-failed' ? t('account.errorNetwork')
              : t('account.errorGeneric'),
      )
    }
  }

  return (
    <div className="min-h-screen bg-[#131110] font-[Manrope,system-ui] flex items-center justify-center px-4 py-10">
      <main className="w-full max-w-md bg-[#2D2520] border border-[#B8860B]/30 rounded-xl p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-2 text-[#D4A017]">
          <VenetiaLogo size={22} />
          <span className="font-cinzel font-bold text-[#F5F0E8]">{t('home.title')}</span>
        </div>
        <h1 className="font-cinzel font-bold text-xl text-[#F5F0E8]">{t('desktopSignIn.title')}</h1>

        {!target ? (
          <p className="text-sm text-[#E8DFD0] leading-relaxed">{t('desktopSignIn.invalidLink')}</p>
        ) : !available ? (
          <p className="text-sm text-[#E8DFD0] leading-relaxed">{t('desktopSignIn.unavailable')}</p>
        ) : stage === 'returning' ? (
          <p role="status" className="text-sm text-[#E8DFD0] leading-relaxed">{t('desktopSignIn.returning')}</p>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-[#E8DFD0] leading-relaxed">{t('desktopSignIn.intro')}</p>
            <Button onClick={handleSignIn} disabled={stage === 'signingIn'} size="lg" className="w-full">
              <GoogleIcon />
              {stage === 'signingIn' ? t('account.signingIn') : t('account.signInGoogle')}
            </Button>
            <TermsNotice lead={t('terms.noticeSignIn')} />
            {error && <p role="alert" className="text-sm text-[#E8A0A0]">{error}</p>}
          </div>
        )}
      </main>
    </div>
  )
}
