import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

/**
 * "Ao entrar, você concorda com os Termos de uso." — `lead` é a frase até o link,
 * que fecha a frase nos dois idiomas. Vai onde a pessoa passa a usar o servidor:
 * login com Google, entrar numa sala e abrir uma.
 */
export function TermsNotice({ lead }: { lead: string }) {
  const { t } = useTranslation()
  return (
    <p className="text-[12px] leading-snug text-[#A8A09B]">
      {lead}{' '}
      <Link to="/termos" className="font-semibold text-[#D4A017] hover:text-[#E8C25A] underline-offset-4 hover:underline">
        {t('terms.linkLabel')}
      </Link>
      .
    </p>
  )
}
