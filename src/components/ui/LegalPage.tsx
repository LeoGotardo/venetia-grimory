import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useBackHandler } from '../../hooks/useBackHandler'
import { VenetiaLogo } from './VenetiaLogo'

interface LegalPageProps {
  title: string
  /** Linha dourada sob o título (versão do app, data de vigência). */
  subtitle?: string
  children: ReactNode
}

/**
 * Moldura das páginas de texto institucional ("Sobre e licenças", "Termos de uso"):
 * cabeçalho com voltar, título e coluna de leitura. Chega-se a elas pelo rodapé da
 * Home ou da área do mestre, então o voltar (o do cabeçalho e o do Android) volta
 * para onde a pessoa estava; aberta direto pela URL, vai para a Home.
 */
export function LegalPage({ title, subtitle, children }: LegalPageProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()

  function goBack() {
    if (location.key === 'default') navigate('/')
    else navigate(-1)
  }
  useBackHandler(true, goBack, 'page')

  return (
    <div className="min-h-screen flex flex-col bg-[#131110] font-[Manrope,system-ui]">
      <header className="sticky top-0 z-10 flex items-center gap-3 h-[60px] px-4 sm:px-7 bg-[#161311] border-b border-white/[0.06]">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex items-center gap-2 h-[36px] rounded-[9px] px-3 text-[13px] font-semibold text-[#E8DFD0] bg-white/5 hover:bg-white/10 border border-white/[0.09] cursor-pointer transition-colors"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          {t('about.back')}
        </button>
        <div className="flex items-center gap-2 ml-auto">
          <VenetiaLogo />
          <span className="font-extrabold tracking-[0.04em] text-sm text-[#E8DFD0]">Venetia</span>
        </div>
      </header>

      <main className="w-full max-w-[760px] mx-auto px-4 sm:px-8 py-10 pb-[calc(40px+env(safe-area-inset-bottom))]">
        <h1 className="font-cinzel text-[28px] sm:text-[34px] leading-tight text-[#F5F0E8]">{title}</h1>
        {subtitle && <p className="mt-1 text-[13px] font-semibold text-[#D4A017]">{subtitle}</p>}
        {children}
      </main>
    </div>
  )
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10 pt-6 border-t border-[rgba(212,160,23,0.18)]">
      <h2 className="font-cinzel text-[17px] tracking-[0.04em] text-[#EAD9B0]">{title}</h2>
      <div className="mt-3 text-[14px] leading-relaxed text-[#A8A09B] [overflow-wrap:anywhere]">{children}</div>
    </section>
  )
}

/** Parágrafos de um texto do catálogo separados por linha em branco (`\n\n`). */
export function LegalParagraphs({ text }: { text: string }) {
  return text.split('\n\n').map((paragraph, i) => (
    <p key={i} className={i > 0 ? 'mt-3' : undefined}>{paragraph}</p>
  ))
}

const linkClass = 'font-semibold text-[#D4A017] hover:text-[#E8C25A] underline-offset-4 hover:underline'

interface LegalLink {
  label: string
  /** Endereço externo (abre fora do app)… */
  href?: string
  /** …ou rota interna. */
  to?: string
}

export function LegalLinks({ links }: { links: LegalLink[] }) {
  return (
    <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
      {links.map(link =>
        link.to ? (
          <Link key={link.to} to={link.to} className={linkClass}>{link.label}</Link>
        ) : (
          <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
            {link.label}
          </a>
        ),
      )}
    </p>
  )
}
