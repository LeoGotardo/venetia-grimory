import { useTranslation } from 'react-i18next'
import {
  ANPD_URL,
  AUTHOR_NAME,
  LEGAL_CONTACT_URL,
  PRIVACY_EFFECTIVE_DATE,
  ROOM_CLOSED_RETENTION_DAYS,
  ROOM_IDLE_DAYS,
  ROOM_LOG_MAX,
  TERMS_MIN_AGE,
} from '../constants'
import { LegalLinks, LegalPage, LegalParagraphs, LegalSection } from '../components/ui/LegalPage'
import { formatLegalDate } from '../lib/legalDate'

/**
 * Política de privacidade (LGPD). Só afirma o que o código faz — conferido em
 * `api/_lib/cloud.ts` (o servidor guarda uid e conteúdo, não e-mail nem nome),
 * `api/_lib/rooms.ts` (nome, hash do token, docs e eventos das salas) e nos
 * limites de taxa. Mudou o tratamento de dados: mude o texto e
 * `PRIVACY_EFFECTIVE_DATE`. Os prazos das salas vêm das constantes do servidor.
 */
export function Privacy() {
  const { t, i18n } = useTranslation()
  const contact = [{ href: LEGAL_CONTACT_URL, label: t('privacy.contactLink') }]

  return (
    <LegalPage title={t('privacy.title')} subtitle={t('privacy.effective', { date: formatLegalDate(PRIVACY_EFFECTIVE_DATE, i18n.language) })}>
      <p className="mt-4 text-[15px] leading-relaxed text-[#E8DFD0]">{t('privacy.intro')}</p>

      <LegalSection title={t('privacy.controllerTitle')}>
        <LegalParagraphs text={t('privacy.controllerBody', { author: AUTHOR_NAME })} />
        <LegalLinks links={contact} />
      </LegalSection>

      <LegalSection title={t('privacy.localTitle')}>
        <LegalParagraphs text={t('privacy.localBody')} />
      </LegalSection>

      <LegalSection title={t('privacy.accountTitle')}>
        <LegalParagraphs text={t('privacy.accountBody')} />
      </LegalSection>

      <LegalSection title={t('privacy.roomsTitle')}>
        <LegalParagraphs
          text={t('privacy.roomsBody', { logMax: ROOM_LOG_MAX, closedDays: ROOM_CLOSED_RETENTION_DAYS, idleDays: ROOM_IDLE_DAYS })}
        />
      </LegalSection>

      <LegalSection title={t('privacy.technicalTitle')}>
        <LegalParagraphs text={t('privacy.technicalBody')} />
      </LegalSection>

      <LegalSection title={t('privacy.purposesTitle')}>
        <LegalParagraphs text={t('privacy.purposesBody')} />
      </LegalSection>

      <LegalSection title={t('privacy.sharingTitle')}>
        <LegalParagraphs text={t('privacy.sharingBody')} />
      </LegalSection>

      <LegalSection title={t('privacy.retentionTitle')}>
        <LegalParagraphs text={t('privacy.retentionBody')} />
      </LegalSection>

      <LegalSection title={t('privacy.rightsTitle')}>
        <LegalParagraphs text={t('privacy.rightsBody')} />
        <LegalLinks links={[...contact, { href: ANPD_URL, label: t('privacy.anpdLink') }]} />
      </LegalSection>

      <LegalSection title={t('privacy.childrenTitle')}>
        <LegalParagraphs text={t('privacy.childrenBody', { minAge: TERMS_MIN_AGE })} />
      </LegalSection>

      <LegalSection title={t('privacy.securityTitle')}>
        <LegalParagraphs text={t('privacy.securityBody')} />
      </LegalSection>

      <LegalSection title={t('privacy.changesTitle')}>
        <LegalParagraphs text={t('privacy.changesBody')} />
      </LegalSection>

      <LegalSection title={t('privacy.contactTitle')}>
        <LegalParagraphs text={t('privacy.contactBody')} />
        <LegalLinks links={[...contact, { to: '/termos', label: t('terms.title') }]} />
      </LegalSection>
    </LegalPage>
  )
}
