import { useState } from 'react'
import { THIRD_PARTY_LICENSES_FILE, parseThirdPartyLicenses, type ThirdPartyPackage } from '../lib/thirdPartyLicenses'

export type ThirdPartyLicensesState =
  | { status: 'idle' | 'loading' | 'error' }
  | { status: 'ready'; packages: ThirdPartyPackage[] }

/**
 * Busca a lista de licenças gerada no build (`THIRD_PARTY_LICENSES_FILE`) só
 * quando a pessoa pede — são centenas de KB de texto que quase ninguém abre.
 * No `npm run dev` o arquivo não existe (o plugin só roda no build) e a busca
 * cai no estado de erro.
 */
export function useThirdPartyLicenses() {
  const [state, setState] = useState<ThirdPartyLicensesState>({ status: 'idle' })

  async function load() {
    setState({ status: 'loading' })
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}${THIRD_PARTY_LICENSES_FILE}`)
      if (!response.ok) throw new Error(`HTTP ${response.status} ao buscar ${THIRD_PARTY_LICENSES_FILE}`)
      setState({ status: 'ready', packages: parseThirdPartyLicenses(await response.json()) })
    } catch (err) {
      console.error('[licenças] Falha ao carregar a lista de bibliotecas de terceiros.', err)
      setState({ status: 'error' })
    }
  }

  return { state, load }
}
