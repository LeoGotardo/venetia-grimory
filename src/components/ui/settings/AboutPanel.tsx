import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FEEDBACK_FORM_URL, GITHUB_REPO_URL } from '../../../constants'
import { currentVersion } from '../../../lib/releaseNotes'

const rowClass =
  'flex items-center justify-between gap-3 min-h-[44px] px-3 rounded-[9px] text-sm text-[#E8DFD0] hover:bg-white/[0.05] transition-colors'

function Chevron() {
  return <span aria-hidden="true" className="text-[#A8A09B]">›</span>
}

function InternalRow({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className={rowClass}>
      <span>{children}</span>
      <Chevron />
    </Link>
  )
}

function ExternalRow({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={rowClass}>
      <span>{children}</span>
      <Chevron />
    </a>
  )
}

/** Aba "Sobre" das configurações: versão, páginas legais, código e o canal de sugestões. */
export function AboutPanel() {
  const { t } = useTranslation()
  const version = currentVersion()?.replace(/^v/, '')

  return (
    <div className="space-y-3">
      <div>
        <p className="font-cinzel text-[15px] tracking-[0.04em] text-[#EAD9B0]">{t('home.title')}</p>
        {version && <p className="text-xs text-[#A8A09B] mt-0.5">{t('about.version', { version })}</p>}
      </div>
      <nav className="-mx-3 flex flex-col">
        <InternalRow to="/sobre">{t('footer.about')}</InternalRow>
        <InternalRow to="/termos">{t('terms.linkLabel')}</InternalRow>
        <InternalRow to="/privacidade">{t('privacy.linkLabel')}</InternalRow>
        <ExternalRow href={GITHUB_REPO_URL}>{t('footer.github')}</ExternalRow>
        <ExternalRow href={FEEDBACK_FORM_URL}>{t('footer.feedbackLink')}</ExternalRow>
      </nav>
    </div>
  )
}
