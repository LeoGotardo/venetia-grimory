import { useTranslation } from 'react-i18next'
import { APACHE_2_URL, CC_BY_4_URL, OFL_URL, SRD_URL } from '../constants'
import { ICONS_LICENSE } from '../data/areaMap/iconsLicense'
import { currentVersion } from '../lib/releaseNotes'
import { ThirdPartyLicenses } from '../components/ui/ThirdPartyLicenses'
import { LegalLinks, LegalPage, LegalSection } from '../components/ui/LegalPage'

/**
 * Sobre e licenças: as atribuições que as licenças exigem dentro do app — o
 * README não vai no APK. SRD 5.2.1 (CC BY 4.0, com a indicação de alterações),
 * ícones do game-icons.net (CC BY 3.0), fontes (OFL) e as bibliotecas do bundle,
 * cuja lista o build gera (`scripts/vite/thirdPartyLicenses.ts`).
 */
export function About() {
  const { t } = useTranslation()
  const version = currentVersion()?.replace(/^v/, '')
  const subtitle = version ? `${t('home.title')} · ${t('about.version', { version })}` : t('home.title')

  return (
    <LegalPage title={t('about.title')} subtitle={subtitle}>
      <p className="mt-4 text-[15px] leading-relaxed text-[#E8DFD0]">{t('about.intro')}</p>
      <LegalLinks links={[{ to: '/termos', label: t('terms.title') }]} />

      <LegalSection title={t('about.rulesTitle')}>
        <p data-testid="sobre-srd">{t('about.srdAttribution')}</p>
        <p className="mt-3">{t('about.srdChanges')}</p>
        <LegalLinks links={[{ href: SRD_URL, label: 'SRD 5.2.1' }, { href: CC_BY_4_URL, label: 'CC BY 4.0' }]} />
      </LegalSection>

      <LegalSection title={t('about.iconsTitle')}>
        <p>{t('about.iconsCredit', { authors: ICONS_LICENSE.authors.join(', ') })}</p>
        <LegalLinks links={[{ href: ICONS_LICENSE.source, label: 'game-icons.net' }, { href: ICONS_LICENSE.url, label: ICONS_LICENSE.name }]} />
      </LegalSection>

      <LegalSection title={t('about.fontsTitle')}>
        <p>{t('about.fontsCredit')}</p>
        <LegalLinks links={[{ href: OFL_URL, label: 'SIL OFL 1.1' }]} />
      </LegalSection>

      <LegalSection title={t('about.libsTitle')}>
        <p>{t('about.libsIntro')}</p>
        <p className="mt-3">{t('about.libsNative')}</p>
        <LegalLinks links={[{ href: APACHE_2_URL, label: 'Apache 2.0' }]} />
        <ThirdPartyLicenses />
      </LegalSection>
    </LegalPage>
  )
}
