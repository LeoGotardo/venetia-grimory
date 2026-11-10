import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { useThirdPartyLicenses, type ThirdPartyLicensesState } from '../../hooks/useThirdPartyLicenses'
import { UNKNOWN_LICENSE, type ThirdPartyPackage } from '../../lib/thirdPartyLicenses'
import { SPDX_LICENSES_URL } from '../../constants'

/** Lista das bibliotecas do bundle com o texto da licença de cada uma, carregada sob demanda. */
export function ThirdPartyLicenses() {
  const { t } = useTranslation()
  const { state, load } = useThirdPartyLicenses()

  if (state.status === 'ready') return <PackageList packages={state.packages} />

  return (
    <div className="mt-4">
      {state.status === 'error' && (
        <p role="alert" className="mb-3 text-[13px] text-[#E8A0A0]">{t('about.libsError')}</p>
      )}
      <button
        type="button"
        onClick={load}
        disabled={state.status === 'loading'}
        className="inline-flex items-center min-h-[40px] rounded-[10px] px-4 text-[13px] font-semibold text-[#E8DFD0] bg-white/[0.05] hover:bg-white/[0.09] border border-[rgba(212,160,23,0.25)] hover:border-[rgba(212,160,23,0.5)] disabled:opacity-60 disabled:cursor-wait cursor-pointer transition-colors"
      >
        {loadButtonLabel(state, t)}
      </button>
    </div>
  )
}

function loadButtonLabel(state: ThirdPartyLicensesState, t: TFunction): string {
  if (state.status === 'loading') return t('about.libsLoading')
  if (state.status === 'error') return t('about.libsRetry')
  return t('about.libsShow')
}

function PackageList({ packages }: { packages: ThirdPartyPackage[] }) {
  const { t } = useTranslation()
  return (
    <div className="mt-4">
      <p className="text-[12px] text-[#A8A09B]">{t('about.libsCount', { n: packages.length })}</p>
      <ul className="mt-2 divide-y divide-white/[0.06] border-y border-white/[0.06]">
        {packages.map(pkg => (
          <PackageItem key={`${pkg.name}@${pkg.version}`} pkg={pkg} />
        ))}
      </ul>
    </div>
  )
}

/** O texto só é montado ao abrir: com ele em todos os itens fechados, a página levaria centenas de KB de DOM. */
function PackageItem({ pkg }: { pkg: ThirdPartyPackage }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <li>
      <details className="group" onToggle={e => setOpen(e.currentTarget.open)}>
        <summary className="flex items-baseline gap-2 min-h-[44px] py-2.5 cursor-pointer text-[13px] text-[#E8DFD0] hover:text-[#F5F0E8]">
          <span className="shrink-0 text-[#A8A09B] transition-transform group-open:rotate-90" aria-hidden="true">›</span>
          <span className="font-semibold break-all">{pkg.name}</span>
          <span className="text-[#A8A09B]">{pkg.version}</span>
          <span className="ml-auto shrink-0 text-[12px] text-[#D4A017]">{pkg.license}</span>
        </summary>
        {open && (
          <div className="pb-4">
            {pkg.url && (
              <a
                href={pkg.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12px] font-semibold text-[#D4A017] hover:text-[#E8C25A] underline-offset-4 hover:underline"
              >
                {t('about.projectPage')}
              </a>
            )}
            {pkg.text ? <LicenseText text={pkg.text} /> : <MissingLicenseText license={pkg.license} />}
            {pkg.notice && <LicenseText text={pkg.notice} />}
          </div>
        )}
      </details>
    </li>
  )
}

/** Um identificador SPDX simples (`Apache-2.0`, `MIT`) — expressões como `(MIT AND Zlib)` ficam sem link. */
const SPDX_ID = /^[A-Za-z0-9.+-]+$/

/** Sem o arquivo no pacote, aponta para o texto da licença no SPDX. */
function MissingLicenseText({ license }: { license: string }) {
  const { t } = useTranslation()
  return (
    <p className="mt-2 text-[12px] text-[#A8A09B]">
      {t('about.libsNoText')}{' '}
      {license !== UNKNOWN_LICENSE && SPDX_ID.test(license) && (
        <a
          href={`${SPDX_LICENSES_URL}/${license}.html`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[#D4A017] hover:text-[#E8C25A] underline-offset-4 hover:underline"
        >
          {t('about.libsLicenseText', { license })}
        </a>
      )}
    </p>
  )
}

function LicenseText({ text }: { text: string }) {
  return (
    <pre className="mt-2 max-h-[320px] overflow-auto rounded-[10px] bg-black/25 p-3 font-mono text-[11.5px] leading-snug text-[#A8A09B] whitespace-pre-wrap break-words">
      {text}
    </pre>
  )
}
