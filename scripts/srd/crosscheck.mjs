#!/usr/bin/env node
/**
 * Confere o catálogo gerado contra outra conversão do SRD 5.2.1
 * (github.com/downfallx/dnd-5e-srd-markdown, monsters-A-Z.md + animals.md).
 *
 *   node scripts/srd/crosscheck.mjs <monsters-A-Z.md> <animals.md>
 *
 * Compara CA, PV, ND, atributos e todas as expressões de dados de cada criatura.
 * Uma divergência quase sempre é defeito de uma das conversões: confira no PDF
 * oficial e, se for a fonte principal, crie um override (veja scripts/README.md).
 * A referência lê mal algumas tabelas (aparece NaN) — essas não são nossas.
 */
import { readFileSync } from 'node:fs'

const [monstersMd, animalsMd] = process.argv.slice(2)
if (!monstersMd || !animalsMd) {
  console.error('uso: node scripts/srd/crosscheck.mjs <monsters-A-Z.md> <animals.md>')
  process.exit(1)
}

// animals.md usa "## Nome" e "### Actions"; normaliza para o formato de monsters-A-Z.md.
const animals = readFileSync(animalsMd, 'utf-8')
  .replace(/^### (Traits|Actions|Bonus Actions|Reactions|Legendary Actions)\s*$/gm, '#### $1')
  .replace(/^## /gm, '### ')
const md = `${readFileSync(monstersMd, 'utf-8')}\n${animals}`

const norm = d => d.replace(/[−–]/g, '-').replace(/\s+/g, '')
const DICE = /\((\d+d\d+(?:\s*[+−–-]\s*\d+)?)\)/g
const ref = new Map()
for (const part of md.split(/^### /m).slice(1)) {
  const name = part.split('\n')[0].trim().toLowerCase()
  const ac = /\*\*AC\*\*\s*(\d+)/.exec(part)
  const hp = /\*\*HP\*\*\s*(\d+)/.exec(part)
  const cr = /\*\*CR\*\*\s*([\d/]+)/.exec(part)
  if (!ac || !hp || !cr) continue
  const cells = [...part.slice(0, 4000).matchAll(/<td>(.*?)<\/td>/gs)].map(m => m[1].replace(/<[^>]+>/g, '').trim())
  const scores = cells.flatMap((c, i) => (/^(STR|DEX|CON|INT|WIS|CHA)$/.test(c) ? [+cells[i + 1]] : [])).slice(0, 6)
  const body = part.replace(/\*\*HP\*\*[^\n]*/, '')
  ref.set(name, {
    ac: +ac[1], hp: +hp[1], cr: cr[1], scores: scores.join(','),
    dice: [...body.matchAll(DICE)].map(m => norm(m[1])).sort(),
  })
}

const all = []
for (const f of ['cr0-1', 'cr2-5', 'cr6-10', 'cr11-30']) {
  const src = readFileSync(`src/data/monsters/en/${f}.ts`, 'utf-8')
  all.push(...JSON.parse(src.slice(src.indexOf('= [') + 2, src.lastIndexOf(']') + 1).replace(/,\n\]$/, ']')))
}

let problems = 0
for (const { statblock: b } of all) {
  const r = ref.get(b.name.toLowerCase())
  if (!r) {
    console.log(`sem referência: ${b.name}`)
    continue
  }
  const ours = {
    ac: b.ac, hp: b.hp.average, cr: b.cr,
    scores: ['FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR'].map(a => b.abilities[a]).join(','),
  }
  const diff = Object.keys(ours).filter(k => String(ours[k]) !== String(r[k]))
  const text = ['traits', 'actions', 'bonus_actions', 'reactions', 'legendary_actions']
    .flatMap(l => b[l].map(f => f.description)).join(' ')
  const dice = [...text.matchAll(DICE)].map(m => norm(m[1])).sort()
  const count = (arr, d) => arr.filter(x => x === d).length
  const missing = [...new Set(r.dice)].filter(d => count(r.dice, d) > count(dice, d))
  if (diff.length || missing.length) {
    problems++
    console.log(`${b.name}: ${diff.map(k => `${k} ${ours[k]} ≠ ${r[k]}`).join('; ')}${missing.length ? ` dados faltando: ${missing.join(' ')}` : ''}`)
  }
}
console.log(`${all.length} criaturas conferidas; ${problems} com divergência.`)
