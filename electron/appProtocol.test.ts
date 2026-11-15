import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { resolveAppAsset } from './appProtocol'

const root = path.resolve('/opt/venetia/dist')
const existing = new Set([
  path.join(root, 'index.html'),
  path.join(root, 'assets', 'index-abc.js'),
  path.join(root, 'third-party-licenses.json'),
  path.join(root, 'assets', 'Ficha de Venetia.png'),
])
const isFile = (file: string) => existing.has(file)

const resolve = (url: string) => resolveAppAsset(root, url, isFile)

describe('resolveAppAsset', () => {
  it('serve os arquivos do bundle', () => {
    expect(resolve('app://venetia/assets/index-abc.js')).toEqual({ kind: 'file', path: path.join(root, 'assets', 'index-abc.js') })
    expect(resolve('app://venetia/third-party-licenses.json?x=1')).toEqual({ kind: 'file', path: path.join(root, 'third-party-licenses.json') })
  })

  it('decodifica o caminho', () => {
    expect(resolve('app://venetia/assets/Ficha%20de%20Venetia.png')).toEqual({ kind: 'file', path: path.join(root, 'assets', 'Ficha de Venetia.png') })
  })

  it('devolve o index.html para as rotas do app', () => {
    const index = { kind: 'file', path: path.join(root, 'index.html') }
    expect(resolve('app://venetia/')).toEqual(index)
    expect(resolve('app://venetia/ficha/7d1c')).toEqual(index)
    expect(resolve('app://venetia/mestre/campanha/1/area/2?nota=3')).toEqual(index)
  })

  it('dá 404 para arquivo com extensão que não existe', () => {
    expect(resolve('app://venetia/assets/sumiu.js')).toEqual({ kind: 'not-found' })
    expect(resolve('app://venetia/favicon.ico')).toEqual({ kind: 'not-found' })
  })

  it('não sai da pasta do bundle', () => {
    const attempts = [
      'app://venetia/../package.json',
      'app://venetia/%2e%2e/%2e%2e/etc/passwd',
      'app://venetia/assets/%2e%2e%2f%2e%2e%2fsecret.txt',
      'app://venetia/assets/..%5c..%5csecret.txt',
    ]
    for (const url of attempts) {
      const asset = resolve(url)
      // O parser de URL já desfaz `..` e `%2e%2e`; o que sobra de `%2f` cai no `relative`.
      if (asset.kind === 'file') expect(path.relative(root, asset.path).startsWith('..')).toBe(false)
    }
    expect(resolve('app://venetia/assets/%2e%2e%2f%2e%2e%2fsecret.txt')).toEqual({ kind: 'not-found' })
    expect(resolve('app://venetia/a%00.js')).toEqual({ kind: 'not-found' })
    expect(resolve('app://venetia/%E0%A4%A')).toEqual({ kind: 'not-found' })
  })

  it('só responde ao host do app', () => {
    expect(resolve('app://outro/index.html')).toEqual({ kind: 'not-found' })
  })
})
