/**
 * Contrato entre o build e a tela "Sobre e licenças": o plugin do Vite
 * (`scripts/vite/thirdPartyLicenses.ts`) lista os pacotes do `node_modules` que
 * entraram de fato no bundle e grava este JSON ao lado do `index.html`; a página
 * busca o arquivo só quando a pessoa abre a lista. Sem imports — o `vite.config.ts`
 * também lê este módulo.
 */

/** Arquivo gerado na raiz do build (`dist/`), servido como estático na web e no APK. */
export const THIRD_PARTY_LICENSES_FILE = 'third-party-licenses.json'

/** Licença de um pacote cujo `package.json` não declara nenhuma. */
export const UNKNOWN_LICENSE = 'UNKNOWN'

export interface ThirdPartyPackage {
  name: string
  version: string
  /** Identificador SPDX do `package.json` (ex.: `MIT`), ou `UNKNOWN_LICENSE`. */
  license: string
  /** Página do projeto ou repositório, quando o pacote declara. */
  url?: string
  /** Texto do arquivo LICENSE do pacote. */
  text?: string
  /** Texto do arquivo NOTICE (a Apache 2.0 exige reproduzi-lo). */
  notice?: string
}

const NODE_MODULES = '/node_modules/'

/**
 * Pasta do pacote dono de um módulo do bundle, ou `null` para código do próprio
 * projeto e módulos virtuais. Usa o último `node_modules/` (dependências aninhadas)
 * e entende escopo (`@scope/nome`). Ids do Rollup podem vir com `\0` na frente
 * (proxies do plugin de CommonJS) e com query (`?commonjs-exports`).
 */
export function packageRootOf(moduleId: string): string | null {
  const id = moduleId.replace(/^\0/, '').split('?')[0].replaceAll('\\', '/')
  const at = id.lastIndexOf(NODE_MODULES)
  if (at < 0) return null
  const rest = id.slice(at + NODE_MODULES.length).split('/')
  const nameParts = rest[0]?.startsWith('@') ? 2 : 1
  if (rest.length <= nameParts || rest.slice(0, nameParts).some(part => part === '')) return null
  return id.slice(0, at + NODE_MODULES.length) + rest.slice(0, nameParts).join('/')
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value !== '' ? value : undefined
}

function toPackage(raw: unknown): ThirdPartyPackage | null {
  if (typeof raw !== 'object' || raw === null) return null
  const entry = raw as Record<string, unknown>
  const name = optionalString(entry.name)
  const version = optionalString(entry.version)
  const license = optionalString(entry.license)
  if (!name || !version || !license) return null
  return {
    name,
    version,
    license,
    url: optionalString(entry.url),
    text: optionalString(entry.text),
    notice: optionalString(entry.notice),
  }
}

/** Valida o JSON baixado; lança se o formato não for o esperado. */
export function parseThirdPartyLicenses(data: unknown): ThirdPartyPackage[] {
  if (!Array.isArray(data)) throw new Error('Lista de licenças inválida: esperado um array.')
  const packages = data.map(toPackage)
  if (packages.some(p => p === null)) throw new Error('Lista de licenças inválida: entrada sem nome, versão ou licença.')
  return packages as ThirdPartyPackage[]
}
