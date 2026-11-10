import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'
import {
  THIRD_PARTY_LICENSES_FILE,
  UNKNOWN_LICENSE,
  packageRootOf,
  type ThirdPartyPackage,
} from '../../src/lib/thirdPartyLicenses.ts'

/**
 * Só no build: lista os pacotes do `node_modules` cujo código entrou no bundle e
 * grava `THIRD_PARTY_LICENSES_FILE` com nome, versão, licença e o texto do
 * LICENSE/NOTICE de cada um — o aviso que MIT, BSD e Apache pedem que acompanhe
 * o app distribuído. Lê os módulos de cada chunk, então dependências só do
 * servidor (`api/`) e o que o tree-shaking descartou não aparecem.
 *
 * `extraPackages` cobre o que chega ao app sem passar por um chunk de JS — o
 * preflight do Tailwind vai embutido no CSS, sem o banner da licença.
 * `extraAssets` são arquivos de terceiros fora do `node_modules` (a fonte da
 * ficha em PDF), com o texto da licença num arquivo do repositório.
 */
export interface ExtraAsset {
  name: string
  version: string
  license: string
  url?: string
  /** Texto da licença, relativo à raiz do projeto. */
  licenseFile: string
}

export function thirdPartyLicenses({ extraPackages = [], extraAssets = [] }: { extraPackages?: string[]; extraAssets?: ExtraAsset[] } = {}): Plugin {
  let root = process.cwd()
  return {
    name: 'venetia-third-party-licenses',
    apply: 'build',
    configResolved(config) {
      root = config.root
    },
    generateBundle(_options, bundle) {
      const roots = new Set<string>(extraPackages.map(name => path.join(root, 'node_modules', name)))
      for (const output of Object.values(bundle)) {
        if (output.type !== 'chunk') continue
        for (const [id, info] of Object.entries(output.modules)) {
          if (info.renderedLength === 0) continue
          const root = packageRootOf(id)
          if (root) roots.add(root)
        }
      }

      const byKey = new Map<string, ThirdPartyPackage>()
      for (const root of roots) {
        const pkg = readPackage(root)
        byKey.set(`${pkg.name}@${pkg.version}`, pkg)
      }
      for (const asset of extraAssets) {
        const text = fs.readFileSync(path.join(root, asset.licenseFile), 'utf8').trim()
        byKey.set(`${asset.name}@${asset.version}`, { name: asset.name, version: asset.version, license: asset.license, url: asset.url, text })
      }
      const packages = [...byKey.values()].sort((a, b) => a.name.localeCompare(b.name))

      this.emitFile({ type: 'asset', fileName: THIRD_PARTY_LICENSES_FILE, source: JSON.stringify(packages) })
    },
  }
}

const LICENSE_FILE = /^(licen[cs]e|copying)([-._].*)?$/i
const NOTICE_FILE = /^notice([-._].*)?$/i

function readPackage(root: string): ThirdPartyPackage {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')) as Record<string, unknown>
  const files = fs.readdirSync(root)
  return {
    name: String(manifest.name ?? path.basename(root)),
    version: String(manifest.version ?? '0.0.0'),
    license: licenseId(manifest),
    url: projectUrl(manifest),
    text: readFirst(root, files, LICENSE_FILE),
    notice: readFirst(root, files, NOTICE_FILE),
  }
}

/** `license` em texto (o atual) ou nos formatos antigos `{ type }` e `licenses: [{ type }]`. */
function licenseId(manifest: Record<string, unknown>): string {
  const { license, licenses } = manifest
  if (typeof license === 'string') return license
  if (license && typeof license === 'object' && 'type' in license) return String(license.type)
  if (Array.isArray(licenses)) {
    const types = licenses.map(l => (l && typeof l === 'object' && 'type' in l ? String(l.type) : null)).filter(Boolean)
    if (types.length > 0) return types.join(' OR ')
  }
  return UNKNOWN_LICENSE
}

/** `homepage`, ou o `repository` convertido em endereço que abre no navegador. */
function projectUrl(manifest: Record<string, unknown>): string | undefined {
  if (typeof manifest.homepage === 'string' && manifest.homepage.startsWith('http')) return manifest.homepage
  const repo = manifest.repository
  const raw = typeof repo === 'string' ? repo : repo && typeof repo === 'object' && 'url' in repo ? String(repo.url) : null
  if (!raw) return undefined
  if (/^[\w.-]+\/[\w.-]+$/.test(raw)) return `https://github.com/${raw}`
  const github = raw.match(/^github:(.+)$/)
  if (github) return `https://github.com/${github[1]}`
  const url = raw.replace(/^git\+/, '').replace(/^git:\/\//, 'https://').replace(/\.git$/, '')
  return url.startsWith('http') ? url : undefined
}

function readFirst(root: string, files: string[], pattern: RegExp): string | undefined {
  const name = files
    .filter(f => pattern.test(f) && fs.statSync(path.join(root, f)).isFile())
    .sort((a, b) => a.length - b.length)[0]
  if (!name) return undefined
  const text = fs.readFileSync(path.join(root, name), 'utf8').trim()
  return text === '' ? undefined : text
}
