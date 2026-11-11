import { useTranslation } from 'react-i18next'
import {
  GITHUB_REPO_URL,
  LEGAL_CONTACT_URL,
  ROOM_CLOSED_RETENTION_DAYS,
  ROOM_IDLE_DAYS,
  ROOM_LOG_MAX,
  TERMS_EFFECTIVE_DATE,
  TERMS_MIN_AGE,
} from '../constants'
import { LegalLinks, LegalPage, LegalParagraphs, LegalSection } from '../components/ui/LegalPage'
import { formatLegalDate } from '../lib/legalDate'

/**
 * Termos de uso. Só prometem o que o app faz; o tratamento de dados está na
 * política de privacidade (`/privacidade`). Os prazos das salas vêm das
 * constantes que o cron e o servidor usam, para não divergirem.
 */
export function Terms() {
  const { t, i18n } = useTranslation()
  const contact = [{ href: LEGAL_CONTACT_URL, label: t('terms.contactLink') }]

  return (
    <LegalPage title={t('terms.title')} subtitle={t('terms.effective', { date: formatLegalDate(TERMS_EFFECTIVE_DATE, i18n.language) })}>
      <p className="mt-4 text-[15px] leading-relaxed text-[#E8DFD0]">{t('terms.intro')}</p>

      <LegalSection title={t('terms.serviceTitle')}>
        <LegalParagraphs text={t('terms.serviceBody')} />
      </LegalSection>

      <LegalSection title={t('terms.accountTitle')}>
        <LegalParagraphs text={t('terms.accountBody', { minAge: TERMS_MIN_AGE })} />
      </LegalSection>

      <LegalSection title={t('terms.contentTitle')}>
        <LegalParagraphs text={t('terms.contentBody')} />
        <LegalLinks links={[{ to: '/privacidade', label: t('privacy.title') }]} />
      </LegalSection>

      <LegalSection title={t('terms.importTitle')}>
        <LegalParagraphs text={t('terms.importBody')} />
      </LegalSection>

      <LegalSection title={t('terms.roomsTitle')}>
        <LegalParagraphs
          text={t('terms.roomsBody', { logMax: ROOM_LOG_MAX, closedDays: ROOM_CLOSED_RETENTION_DAYS, idleDays: ROOM_IDLE_DAYS })}
        />
      </LegalSection>

      <LegalSection title={t('terms.ipTitle')}>
        <LegalParagraphs text={t('terms.ipBody')} />
        <LegalLinks links={[{ to: '/sobre', label: t('about.title') }, { href: GITHUB_REPO_URL, label: t('footer.github') }]} />
      </LegalSection>

      <LegalSection title={t('terms.takedownTitle')}>
        <LegalParagraphs text={t('terms.takedownBody')} />
        <LegalLinks links={contact} />
      </LegalSection>

      <LegalSection title={t('terms.warrantyTitle')}>
        <LegalParagraphs text={t('terms.warrantyBody')} />
      </LegalSection>

      <LegalSection title={t('terms.liabilityTitle')}>
        <LegalParagraphs text={t('terms.liabilityBody')} />
      </LegalSection>

      <LegalSection title={t('terms.changesTitle')}>
        <LegalParagraphs text={t('terms.changesBody')} />
      </LegalSection>

      <LegalSection title={t('terms.lawTitle')}>
        <LegalParagraphs text={t('terms.lawBody')} />
      </LegalSection>

      <LegalSection title={t('terms.contactTitle')}>
        <LegalParagraphs text={t('terms.contactBody')} />
        <LegalLinks links={contact} />
      </LegalSection>
    </LegalPage>
  )
}
