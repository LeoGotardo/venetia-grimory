#!/usr/bin/env node
/**
 * Gera src/data/areaMap/icons.generated.ts com os ícones curados do mapa de área.
 *
 * Fonte: @iconify-json/game-icons (devDependency) — o game-icons.net inteiro, CC BY 3.0.
 * `svgpath` (devDependency) normaliza os paths para o parser do Pixi.
 * A curadoria fica em scripts/areamap/icons.json: id nosso, nome no game-icons,
 * categoria e autor (a pasta do autor no repositório game-icons/icons; só entram
 * nomes que existem em uma pasta só, senão a atribuição ficaria ambígua).
 *
 * Uso: node scripts/areamap/generate-icons.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import svgpath from 'svgpath'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const set = JSON.parse(readFileSync(join(root, 'node_modules/@iconify-json/game-icons/icons.json'), 'utf8'))
const curated = JSON.parse(readFileSync(join(root, 'scripts/areamap/icons.json'), 'utf8'))

const AUTHORS = { lorc: 'Lorc', delapouite: 'Delapouite' }

/**
 * Reescreve o path só com comandos absolutos: arcos viram curvas e os atalhos
 * de curva (S/T) viram a forma completa (H/V ficam, o Pixi lê bem). O parser do Pixi 8 desenha errado
 * alguns atalhos e arcos do game-icons — 10 dos 58 ícones saíam do quadro.
 * Arredonda a 2 casas para o arquivo não inchar.
 */
function normalizePath(d) {
  return svgpath(d).abs().unarc().unshort().round(2).toString()
}

const size = set.width ?? 512
if (size !== 512) throw new Error(`viewBox inesperado: ${size}`)

const seen = new Set()
const icons = curated.map(({ id, source, category, author }) => {
  if (seen.has(id)) throw new Error(`id repetido: ${id}`)
  seen.add(id)
  const icon = set.icons[source]
  if (!icon) throw new Error(`ícone não existe no game-icons: ${source}`)
  if (!AUTHORS[author]) throw new Error(`autor sem nome de exibição: ${author}`)
  // Cada ícone do game-icons é um ou mais <path fill="currentColor" d="…"/>; juntamos os `d`.
  const paths = [...icon.body.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map(m => m[1])
  if (paths.length === 0 || /<(?!path)[a-z]/i.test(icon.body.replace(/<path[^>]*\/>/g, ''))) {
    throw new Error(`corpo inesperado em ${source}: ${icon.body.slice(0, 80)}`)
  }
  return { id, category, source, author, d: paths.map(normalizePath).join(' ') }
})

const categories = [...new Set(icons.map(i => i.category))]
const out = `// Gerado por scripts/areamap/generate-icons.mjs a partir de @iconify-json/game-icons — não edite à mão.
// Ícones de game-icons.net (${Object.values(AUTHORS).join(', ')}), licença CC BY 3.0.

export const ICON_CATEGORIES = ${JSON.stringify(categories)} as const
export type IconCategory = typeof ICON_CATEGORIES[number]

export interface IconDef {
  id: string
  category: IconCategory
  /** Nome no game-icons.net. */
  source: string
  /** Pasta do autor no repositório game-icons/icons. */
  author: keyof typeof ICON_AUTHORS
  /** Path SVG no viewBox 0 0 512 512. */
  d: string
}

export const ICON_AUTHORS = ${JSON.stringify(AUTHORS)} as const

export const ICONS: readonly IconDef[] = ${JSON.stringify(icons, null, 2)}
`
writeFileSync(join(root, 'src/data/areaMap/icons.generated.ts'), out)
console.log(`${icons.length} ícones em ${categories.length} categorias`)
