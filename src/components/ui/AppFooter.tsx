import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { AUTHOR_NAME, AUTHOR_URL, FEEDBACK_FORM_URL, GITHUB_RELEASES_URL, GITHUB_REPO_URL } from '../../constants'
import { isApp } from '../../lib/platform'
import { VenetiaLogo } from './VenetiaLogo'

interface AppFooterProps {
  /** Classe do contêiner interno, para alinhar com a largura da página (ex.: `gmContainer`). */
  containerClassName?: string
}

/**
 * Rodapé compartilhado pela Home e pela área do mestre: crédito, sugestões, GitHub e APK.
 * No app Android o layout é sempre o de celular (mesmo em tablet) e o link do APK some —
 * quem está no app já o instalou, e as atualizações chegam pelo `UpdatePrompt`.
 */
export function AppFooter({ containerClassName = 'max-w-[920px] mx-auto px-4 sm:px-8' }: AppFooterProps) {
  const { t } = useTranslation()
  const app = isApp()

  const links: Array<{ href: string; label: string; icon: ReactNode }> = [
    { href: FEEDBACK_FORM_URL, label: t('footer.feedbackLink'), icon: <ChatIcon /> },
    { href: GITHUB_REPO_URL, label: t('footer.github'), icon: <GithubIcon /> },
    ...(app ? [] : [{ href: GITHUB_RELEASES_URL, label: t('footer.downloadApk'), icon: <DownloadIcon /> }]),
  ]

  return (
    // `mt-auto` empurra o rodapé para o fim quando a página é flex-col e curta.
    <footer className="mt-auto pt-12 pb-[calc(28px+env(safe-area-inset-bottom))] text-[#A8A09B]">
      <div className={`${containerClassName} flex flex-col items-center text-center`}>
        <div className="gm-rule w-full max-w-[560px]" aria-hidden="true">
          <VenetiaLogo size={22} />
        </div>

        <p className="font-cinzel mt-4 text-[15px] tracking-[0.06em] text-[#EAD9B0]">{t('home.title')}</p>
        <p className="mt-1 text-[13px]">{t('footer.feedbackPrompt')}</p>

        <nav
          className={
            app
              ? 'mt-5 w-full max-w-[420px] grid grid-cols-1 gap-2'
              : 'mt-5 w-full max-w-[420px] grid grid-cols-1 gap-2 sm:max-w-none sm:w-auto sm:flex sm:flex-wrap sm:justify-center'
          }
        >
          {links.map(link => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={
                app
                  ? footerLinkMobile
                  : `${footerLinkMobile} sm:min-h-[38px] sm:justify-center sm:rounded-full sm:px-4`
              }
            >
              <span className="text-[#D4A017]">{link.icon}</span>
              <span className="flex-1 text-left sm:flex-none">{link.label}</span>
              <span className={app ? 'text-[#A8A09B]' : 'text-[#A8A09B] sm:hidden'} aria-hidden="true">›</span>
            </a>
          ))}
        </nav>

        <p className="mt-6 text-[12px]">
          {t('footer.madeWith')}{' '}
          <a
            href={AUTHOR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#D4A017] hover:text-[#E8C25A] underline-offset-4 hover:underline transition-colors"
          >
            {AUTHOR_NAME}
          </a>
        </p>
      </div>
    </footer>
  )
}

/** Linha de toque cheia (44px) no celular; no desktop vira pílula (classes `sm:` no uso). */
const footerLinkMobile =
  'inline-flex items-center gap-3 min-h-[46px] rounded-[12px] px-4 text-[13px] font-semibold text-[#E8DFD0] bg-white/[0.04] hover:bg-white/[0.08] border border-[rgba(212,160,23,0.18)] hover:border-[rgba(212,160,23,0.45)] transition-colors'

function ChatIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.4-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z"/>
    </svg>
  )
}
