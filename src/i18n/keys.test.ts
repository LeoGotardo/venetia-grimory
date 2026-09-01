import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import pt from './pt'
import en from './en'

const SRC = join(import.meta.dirname, '..')

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap(entry => {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) return sourceFiles(full)
    return /\.tsx?$/.test(entry) && !entry.endsWith('.test.ts') ? [full] : []
  })
}

/** Só as chaves literais: `t('ns.key')`. As montadas em template ficam de fora. */
function usedKeys(): Map<string, string[]> {
  const found = new Map<string, string[]>()
  for (const file of sourceFiles(SRC)) {
    const code = readFileSync(file, 'utf-8')
    for (const [, key] of code.matchAll(/\bt\(\s*'([a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)+)'/g)) {
      found.set(key, [...(found.get(key) ?? []), file.slice(SRC.length + 1)])
    }
  }
  return found
}

function resolve(catalog: unknown, key: string): unknown {
  return key.split('.').reduce<unknown>(
    (node, part) => (node && typeof node === 'object' ? (node as Record<string, unknown>)[part] : undefined),
    catalog,
  )
}

/**
 * Rede contra o erro silencioso de gravar uma chave no namespace errado: a
 * paridade pt/en continua passando (as duas ficam erradas do mesmo jeito) e a
 * interface mostra `edit.attackName` cru na tela.
 */
describe('chaves de tradução usadas no código', () => {
  const keys = [...usedKeys().entries()]

  it('encontra chamadas de `t` para verificar', () => {
    expect(keys.length).toBeGreaterThan(200)
  })

  it('existem em pt e en, no namespace certo', () => {
    const faltando = keys
      .filter(([key]) => typeof resolve(pt, key) !== 'string' || typeof resolve(en, key) !== 'string')
      .map(([key, files]) => `${key} (${[...new Set(files)].join(', ')})`)
    expect(faltando).toEqual([])
  })
})
