import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const linkClass = 'font-semibold text-[#D4A017] hover:text-[#E8C25A] underline-offset-4 hover:underline'

/**
 * "Ao entrar, você concorda com os Termos de uso e a Política de privacidade." —
 * `lead` é a frase até o primeiro link; os dois links fecham a frase nos dois
 * idiomas. Vai onde a pessoa passa a usar o servidor: login com Google, entrar
 * numa sala e abrir uma.
 */
export function TermsNotice({ lead }: { lead: string }) {
  const { t } = useTranslation()
  return (
    <p className="text-[12px] leading-snug text-[#A8A09B]">
      {lead}{' '}
      <Link to="/termos" className={linkClass}>
        {t('terms.linkLabel')}
      </Link>
      {t('terms.noticeAnd')}
      <Link to="/privacidade" className={linkClass}>
        {t('privacy.linkLabel')}
      </Link>
      .
    </p>
  )
}
