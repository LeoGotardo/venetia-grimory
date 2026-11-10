import { describe, expect, it } from 'vitest'
import { packageRootOf, parseThirdPartyLicenses } from './thirdPartyLicenses'

describe('packageRootOf', () => {
  it('acha a pasta de um pacote simples', () => {
    expect(packageRootOf('/app/node_modules/react/cjs/react.production.js')).toBe('/app/node_modules/react')
  })

  it('entende pacotes com escopo', () => {
    expect(packageRootOf('/app/node_modules/@capacitor/core/dist/index.js')).toBe('/app/node_modules/@capacitor/core')
  })

  it('usa o node_modules mais interno em dependências aninhadas', () => {
    expect(packageRootOf('/app/node_modules/a/node_modules/@x/b/index.js')).toBe('/app/node_modules/a/node_modules/@x/b')
  })

  it('tira o \\0 e a query dos proxies do CommonJS', () => {
    expect(packageRootOf('\0/app/node_modules/pdf-lib/cjs/index.js?commonjs-exports')).toBe('/app/node_modules/pdf-lib')
  })

  it('normaliza barras do Windows', () => {
    expect(packageRootOf('C:\\app\\node_modules\\zod\\index.js')).toBe('C:/app/node_modules/zod')
  })

  it('devolve null para código do projeto e módulos virtuais', () => {
    expect(packageRootOf('/app/src/main.tsx')).toBeNull()
    expect(packageRootOf('\0vite/preload-helper.js')).toBeNull()
    expect(packageRootOf('/app/node_modules/@scope')).toBeNull()
  })
})

describe('parseThirdPartyLicenses', () => {
  it('aceita a lista e descarta campos opcionais vazios', () => {
    const parsed = parseThirdPartyLicenses([{ name: 'zod', version: '4.0.0', license: 'MIT', text: 'MIT License', url: '' }])
    expect(parsed).toEqual([{ name: 'zod', version: '4.0.0', license: 'MIT', text: 'MIT License', url: undefined, notice: undefined }])
  })

  it('recusa o que não é a lista gerada', () => {
    expect(() => parseThirdPartyLicenses({ name: 'zod' })).toThrow()
    expect(() => parseThirdPartyLicenses([{ name: 'zod', version: '4.0.0' }])).toThrow()
  })
})
