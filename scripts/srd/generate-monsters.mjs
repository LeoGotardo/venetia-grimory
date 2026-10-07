#!/usr/bin/env node
/**
 * Gera o catálogo de monstros do SRD 5.2.1 (CC-BY-4.0) para o app.
 *
 *   node scripts/srd/generate-monsters.mjs <pasta do SRD em markdown>
 *
 * A fonte é a conversão em markdown do SRD 5.2.1 feita por oldmanumby
 * (github.com/oldmanumby/dnd.srd.5.2.1): um arquivo por criatura em
 * `11_Monsters/Monsters_Each` e `12_Animals/Animals_Each`.
 *
 * Saída (gerada — não editar à mão):
 *   src/data/monsters/en/*.ts   — texto do SRD, distâncias convertidas para metros
 *   src/data/monsters/pt/*.ts   — parte estruturada traduzida aqui; nomes e textos
 *                                 vêm dos dicionários de scripts/srd/monsters-pt.json
 *                                 (`names`, `texts`, `misc`: inglês → português, o texto
 *                                 inglês já em metros); o que faltar fica em inglês
 *
 * Os dois idiomas saem com os mesmos ids, na mesma ordem (catalog.test.ts confere).
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const OUT = join(ROOT, 'src', 'data', 'monsters')
const PT_TRANSLATIONS = join(ROOT, 'scripts', 'srd', 'monsters-pt.json')
/**
 * Arquivos que a conversão em markdown estragou (cabeçalho cortado). As versões
 * corrigidas aqui foram montadas a partir de outra conversão CC-BY do mesmo SRD
 * (github.com/downfallx/dnd-5e-srd-markdown) e têm prioridade sobre a fonte.
 */
const OVERRIDES = join(ROOT, 'scripts', 'srd', 'overrides')
/** Páginas da fonte que não são um monstro (Red_Dragons.md repete o Red Dragon Wyrmling). */
const SKIP = new Set(['Red_Dragons.md'])

const srdDir = process.argv[2]
if (!srdDir || !existsSync(join(srdDir, '11_Monsters'))) {
  console.error('uso: node scripts/srd/generate-monsters.mjs <pasta dnd.srd.5.2.1>')
  process.exit(1)
}

// ── Tabelas de domínio ────────────────────────────────────────────────────────

const ABILITY = { Str: 'FOR', Dex: 'DES', Con: 'CON', Int: 'INT', Wis: 'SAB', Cha: 'CAR' }
const ABILITY_FULL = {
  Strength: 'FOR', Dexterity: 'DES', Constitution: 'CON', Intelligence: 'INT', Wisdom: 'SAB', Charisma: 'CAR',
}
const SIZES = { Tiny: 'tiny', Small: 'small', Medium: 'medium', Large: 'large', Huge: 'huge', Gargantuan: 'gargantuan' }
const TYPES = {
  Aberration: 'aberration', Beast: 'beast', Celestial: 'celestial', Construct: 'construct', Dragon: 'dragon',
  Elemental: 'elemental', Fey: 'fey', Fiend: 'fiend', Giant: 'giant', Humanoid: 'humanoid',
  Monstrosity: 'monstrosity', Ooze: 'ooze', Plant: 'plant', Undead: 'undead',
}
const SKILLS = {
  Acrobatics: 'acrobacia', 'Animal Handling': 'lidar_com_animais', Arcana: 'arcanismo', Athletics: 'atletismo',
  Deception: 'enganacao', History: 'historia', Insight: 'intuicao', Intimidation: 'intimidacao',
  Investigation: 'investigacao', Medicine: 'medicina', Nature: 'natureza', Perception: 'percepcao',
  Performance: 'atuacao', Persuasion: 'persuasao', Religion: 'religiao', 'Sleight of Hand': 'prestidigitacao',
  Stealth: 'furtividade', Survival: 'sobrevivencia',
}
/** Condição em inglês → nome canônico em português (`AVAILABLE_CONDITIONS`). */
const CONDITIONS = {
  Blinded: 'Cego', Charmed: 'Enfeitiçado', Deafened: 'Ensurdecido', Exhaustion: 'Exausto', Frightened: 'Amedrontado',
  Grappled: 'Imobilizado', Incapacitated: 'Incapacitado', Invisible: 'Invisível', Paralyzed: 'Paralisado',
  Petrified: 'Petrificado', Poisoned: 'Envenenado', Prone: 'Caído', Restrained: 'Contido', Stunned: 'Atordoado',
  Unconscious: 'Inconsciente',
}

/** Mesma ordem de `AVAILABLE_CONDITIONS` (src/constants) — a ordem em que o app normaliza. */
const CONDITION_ORDER = [
  'Amedrontado', 'Atordoado', 'Cego', 'Caído', 'Contido', 'Enfeitiçado', 'Ensurdecido', 'Envenenado', 'Exausto',
  'Imobilizado', 'Incapacitado', 'Inconsciente', 'Invisível', 'Paralisado', 'Petrificado', 'Surpreendido',
]

// Tradução da parte estruturada — termos fechados, que se repetem em todo o bestiário.
const PT_ALIGNMENT = {
  Unaligned: 'Sem tendência', Neutral: 'Neutro', 'Chaotic Evil': 'Caótico e Mau', 'Lawful Evil': 'Ordeiro e Mau',
  'Neutral Evil': 'Neutro e Mau', 'Lawful Good': 'Ordeiro e Bom', 'Chaotic Good': 'Caótico e Bom',
  'Chaotic Neutral': 'Caótico e Neutro', 'Neutral Good': 'Neutro e Bom', 'Lawful Neutral': 'Ordeiro e Neutro',
}
const PT_DAMAGE = {
  Acid: 'Ácido', Bludgeoning: 'Contundente', Cold: 'Frio', Fire: 'Fogo', Force: 'Energia', Lightning: 'Elétrico',
  Necrotic: 'Necrótico', Piercing: 'Perfurante', Poison: 'Veneno', Psychic: 'Psíquico', Radiant: 'Radiante',
  Slashing: 'Cortante', Thunder: 'Trovejante',
}
const PT_LANGUAGES = {
  Common: 'Comum', 'Common Sign Language': 'Linguagem de Sinais Comum', Draconic: 'Dracônico', Dwarvish: 'Anão',
  Elvish: 'Élfico', Giant: 'Gigante', Gnomish: 'Gnômico', Goblin: 'Goblin', Halfling: 'Halfling', Orc: 'Orc',
  Abyssal: 'Abissal', Celestial: 'Celestial', 'Deep Speech': 'Dialeto Subterrâneo', Infernal: 'Infernal',
  Primordial: 'Primordial', Sylvan: 'Silvestre', Undercommon: 'Subcomum', Aquan: 'Aquan', Auran: 'Auran',
  Ignan: 'Ignan', Terran: 'Terran', telepathy: 'telepatia', 'any one language': 'um idioma qualquer',
  'understands': 'entende', 'but can\'t speak': 'mas não fala', 'plus': 'mais', 'languages': 'idiomas',
  'All': 'Todos',
}
const PT_TAGS = {
  Goblinoid: 'Goblinoide', Chromatic: 'Cromático', Metallic: 'Metálico', Demon: 'Demônio', Devil: 'Diabo',
  Angel: 'Anjo', Wizard: 'Mago', Cleric: 'Clérigo', Titan: 'Titã', Shapechanger: 'Metamorfo', Lycanthrope: 'Licantropo',
  Genie: 'Gênio', Yugoloth: 'Yugoloth', Swarm: 'Enxame',
}

// ── Utilidades ────────────────────────────────────────────────────────────────

const MINUS = /[−–]/g
const num = s => Number(String(s).replace(MINUS, '-').replace(/,/g, ''))
const slug = name => name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const feetToMeters = ft => Math.round((ft / 5) * 1.5 * 10) / 10

/**
 * Converte distâncias em pés no texto para metros (o app inteiro usa metros).
 * "ft." no fim de frase vira "m." — o ponto é da frase, não só da abreviação.
 */
function metricText(text, decimal) {
  const m = ft => String(feetToMeters(ft)).replace('.', decimal)
  const cm = inch => String(Math.round(inch * 2.5 * 10) / 10).replace('.', decimal)
  // Ponto final só quando a frase acaba ali ("reach 5 ft. Hit:"), não em "5 ft. or range".
  const end = '(?=\\s+[A-Z]|\\s*$)'
  return text
    .replace(/footwide/g, 'foot-wide')
    .replace(new RegExp(`(\\d+)\\/(\\d+)\\s*ft\\.${end}`, 'g'), (_, a, b) => `${m(+a)}/${m(+b)} m.`)
    .replace(/(\d+)\/(\d+)\s*ft\.?/g, (_, a, b) => `${m(+a)}/${m(+b)} m`)
    .replace(/(\d+)-(?:foot|feet)(?=[\s-])/g, (_, a) => `${m(+a)}-meter`)
    .replace(/(\d+)\+\s*(?:feet|foot|ft\.?)/g, (_, a) => `${m(+a)}+ m`)
    .replace(new RegExp(`(\\d+)\\s*ft\\.${end}`, 'g'), (_, a) => `${m(+a)} m.`)
    .replace(/(\d+)\s*(?:ft\.?|feet|foot)/g, (_, a) => `${m(+a)} m`)
    .replace(/(\d+)-inch(?=[\s-])/g, (_, a) => `${cm(+a)}-centimeter`)
    .replace(/(\d+)\s*inch(?:es)?/g, (_, a) => `${cm(+a)} cm`)
}

/** Marca de sublinha (listas de magias da Conjuração) — vira quebra de linha no fim. */
const SUBLINE = '\u00a7'

/** Tira a marcação markdown e normaliza espaços; parágrafos quebrados viram uma linha só. */
function plain(text) {
  return text
    .replace(/\*+/g, '')
    .replace(/\s+/g, ' ')
    // Artefatos da conversão do PDF: hifenização de fim de linha e itálico colado.
    .replace(/([a-z])- ([a-z])/g, '$1$2')
    .replace(/\b(the|a|an|cast|casts|casting)([A-Z][a-z])/g, '$1 $2')
    .replace(/^\s*\.\s*/, '')
    .replace(/\s+([,.;:])/g, '$1')
    .replace(/:(?=[^\s/\d])/g, ': ')
    .replace(/\.(?=[A-Z])/g, '. ')
    .replace(new RegExp(`\\s*${SUBLINE}\\s*`, 'g'), '\n')
    .trim()
}

function dice(text) {
  const m = /\((\d+d\d+(?:\s*[+−-]\s*\d+)?)\)/.exec(text)
  return m ? m[1].replace(MINUS, '-').replace(/\s+/g, '') : null
}

// ── Parser de um arquivo ──────────────────────────────────────────────────────

const HEADER_KEYS = ['Skills', 'Resistances', 'Vulnerabilities', 'Immunities', 'Gear', 'Senses', 'Languages', 'CR']
const SECTION_LIST = {
  Traits: 'traits', Actions: 'actions', 'Bonus Actions': 'bonus_actions', Reactions: 'reactions',
  'Legendary Actions': 'legendary_actions',
}

function headerField(block, key) {
  const others = HEADER_KEYS.filter(k => k !== key).join('|')
  const re = new RegExp(`\\*\\*${key}\\*\\*\\s*([\\s\\S]*?)(?=\\*\\*(?:${others})\\*\\*|\\n\\n|$)`)
  const m = re.exec(block)
  return m ? m[1].trim() : ''
}

function parseFeature(name, body) {
  const usageMatch = /^(.*?)\s*\(([^)]*)\)$/.exec(name)
  const feature = {
    name: usageMatch ? usageMatch[1] : name,
    usage: usageMatch ? usageMatch[2] : '',
    raw: body,
    attack_bonus: null,
    damage: null,
    damage_type: '',
    save_dc: null,
    save_ability: null,
  }
  const attack = /Attack Roll:\*?\s*([+−-]\d+)/.exec(body)
  if (attack) feature.attack_bonus = num(attack[1])
  const save = /(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma) Saving Throw:\*?\s*DC (\d+)/.exec(body.replace(/\n/g, ' '))
  if (save) {
    feature.save_ability = ABILITY_FULL[save[1]]
    feature.save_dc = num(save[2])
  }
  // Dano do acerto, ou da falha numa salvaguarda: "5 (1d6 + 2) Slashing damage".
  const hit = /(?:Hit|Failure):\*?\s*\d+\s*(\([^)]*\))\s*(\w+)\s+damage/.exec(body.replace(/\n/g, ' '))
  if (hit) {
    feature.damage = dice(hit[1])
    feature.damage_type = hit[2]
  }
  return feature
}

function parseMonster(markdown, file) {
  const lines = markdown.replace(/\r/g, '').split('\n')
  const name = lines.find(l => l.startsWith('# '))?.slice(2).trim()
  if (!name) throw new Error(`${file}: sem título`)

  // Dois cabeçalhos no mesmo arquivo = a conversão colou outra criatura (Giant Eagle,
  // Wraith, Bone Devil…). Os números sairiam errados em silêncio: exige um override.
  const subtitles = markdown.match(/^\*(Tiny|Small|Medium|Large|Huge|Gargantuan)[^*]*,[^*]*\*$/gm) ?? []
  if (subtitles.length > 1) throw new Error(`${file}: dois cabeçalhos — crie scripts/srd/overrides/${file}`)
  const subtitle = /^\*([^*]+)\*$/m.exec(markdown)?.[1] ?? ''
  const [sizeType, ...alignParts] = subtitle.split(',')
  const alignment = alignParts.join(',').trim()
  const sizeWord = sizeType.trim().split(/\s+/)[0]
  const size = SIZES[sizeWord]
  if (!size) throw new Error(`${file}: tamanho "${sizeWord}"`)
  const typeWord = Object.keys(TYPES).find(t => new RegExp(`\\b${t}s?\\b`).test(sizeType.replace(/\(.*\)/, '')))
  if (!typeWord) throw new Error(`${file}: tipo "${sizeType}"`)
  const swarm = /Swarm of (\w+)/.exec(sizeType)
  const tagParts = [/\(([^)]*)\)/.exec(sizeType)?.[1], swarm ? `Swarm (${swarm[1]})` : null].filter(Boolean)

  const firstSection = markdown.search(/^## /m)
  const header = firstSection === -1 ? markdown : markdown.slice(0, firstSection)

  const ac = /\*\*AC\*\*\s*(\d+)/.exec(header)
  const init = /\*\*Initiative\*\*\s*([+−-]\d+)/.exec(header)
  const hp = /\*\*HP\*\*\s*(\d+)(?:\s*\(([^)]*)\))?/.exec(header)
  if (!ac || !hp) throw new Error(`${file}: CA/PV`)

  const speedText = /\*\*Speed\*\*\s*([^\n]*)/.exec(header)?.[1] ?? ''
  const speedOf = kind => {
    const m = new RegExp(`${kind}\\s+(\\d+)\\s*ft`, 'i').exec(speedText)
    return m ? feetToMeters(+m[1]) : null
  }
  const walk = /^\s*(\d+)\s*ft/.exec(speedText)

  const abilities = {}
  const saveProficiencies = []
  // Tolerante a dois defeitos da fonte: MOD e SAVE na mesma célula (Solar) e o
  // sinal de menos perdido no SAVE (Young White Dragon: "−2 | 2").
  for (const m of header.matchAll(/\*\*(Str|Dex|Con|Int|Wis|Cha)\s+(\d+)\*\*\s*\|\s*([+−-]\d+)\s*\|?\s*([+−-]?\d+)/g)) {
    const id = ABILITY[m[1]]
    const mod = num(m[3])
    const save = /^[+−-]/.test(m[4]) ? num(m[4]) : Math.sign(mod || 1) * num(m[4])
    abilities[id] = num(m[2])
    if (save !== mod) saveProficiencies.push(id)
  }
  if (Object.keys(abilities).length !== 6) throw new Error(`${file}: atributos`)

  const skills = {}
  for (const part of headerField(header, 'Skills').split(',')) {
    const m = /^\s*(.+?)\s+([+−-]\d+)/.exec(part)
    if (!m) continue
    const id = SKILLS[m[1].trim()]
    if (!id) throw new Error(`${file}: perícia "${m[1]}"`)
    skills[id] = num(m[2])
  }

  // Imunidades: "Poison; Charmed, Poisoned" — antes do ';' é dano, depois condições.
  const immunityText = headerField(header, 'Immunities')
  const immunityParts = immunityText.split(';').map(s => s.trim()).filter(Boolean)
  const damageImmunities = []
  const conditionImmunities = []
  for (const part of immunityParts) {
    for (const term of part.split(',').map(s => s.trim()).filter(Boolean)) {
      const bare = term.replace(/\s*\(.*\)$/, '')
      if (CONDITIONS[bare]) conditionImmunities.push(CONDITIONS[bare])
      else damageImmunities.push(term)
    }
  }

  const sensesText = headerField(header, 'Senses')
  const sense = kind => {
    const m = new RegExp(`${kind}\\s+(\\d+)\\s*ft`, 'i').exec(sensesText)
    return m ? feetToMeters(+m[1]) : null
  }

  const crText = headerField(header, 'CR')
  const cr = /^([\d/]+)/.exec(crText)?.[1]
  if (!cr) throw new Error(`${file}: ND`)

  // Seções: "## Actions" … cada habilidade começa com ***Nome.***
  const lists = { traits: [], actions: [], bonus_actions: [], reactions: [], legendary_actions: [] }
  let legendaryUses = null
  const sectionRe = /^## (.+)$/gm
  const sections = [...markdown.matchAll(sectionRe)].map((m, i, all) => ({
    title: m[1].trim(),
    body: markdown.slice(m.index + m[0].length, all[i + 1]?.index ?? markdown.length),
  }))
  for (const section of sections) {
    const list = SECTION_LIST[section.title]
    if (!list) continue
    let body = section.body
    if (list === 'legendary_actions') {
      const uses = /Legendary Action Uses:\s*(\d+)/.exec(body)
      if (uses) legendaryUses = +uses[1]
      body = body.replace(/^\s*\*Legendary Action Uses:[\s\S]*?\*\s*$/m, '')
    }
    const parts = body.split(/^\*\*\*(.+?)\*\*\*/m)
    // parts: [antes, nome1, corpo1, nome2, corpo2, ...]
    for (let i = 1; i < parts.length; i += 2) {
      const rawName = parts[i].trim()
      const text = parts[i + 1] ?? ''
      // "At Will:", "1/Day Each:" são sublinhas de Conjuração, não habilidades próprias.
      if (rawName.endsWith(':') && lists[list].length > 0) {
        lists[list][lists[list].length - 1].raw += `${SUBLINE}${rawName} ${text}`
        continue
      }
      lists[list].push(parseFeature(rawName.replace(/\.$/, ''), text))
    }
  }

  return {
    id: `srd-${slug(name)}`,
    name,
    size,
    creature_type: TYPES[typeWord],
    tags: tagParts.join(', '),
    alignment,
    ac: num(ac[1]),
    initiative: init ? num(init[1]) : null,
    hp: { average: num(hp[1]), formula: (hp[2] ?? '').replace(MINUS, '-').replace(/\s+/g, '') },
    speed: {
      walk: walk ? feetToMeters(+walk[1]) : 0,
      fly: speedOf('Fly'),
      swim: speedOf('Swim'),
      climb: speedOf('Climb'),
      burrow: speedOf('Burrow'),
      hover: /hover/i.test(speedText),
    },
    abilities,
    save_proficiencies: saveProficiencies,
    skills,
    vulnerabilities: headerField(header, 'Vulnerabilities'),
    resistances: headerField(header, 'Resistances'),
    immunities: damageImmunities.join(', '),
    condition_immunities: CONDITION_ORDER.filter(c => conditionImmunities.includes(c)),
    senses: {
      darkvision: sense('Darkvision'),
      blindsight: sense('Blindsight'),
      tremorsense: sense('Tremorsense'),
      truesight: sense('Truesight'),
    },
    languages: headerField(header, 'Languages').replace(/\s+/g, ' '),
    gear: headerField(header, 'Gear').replace(/\s+/g, ' '),
    cr,
    lists,
    legendary_uses: legendaryUses,
  }
}

// ── Saída por idioma ──────────────────────────────────────────────────────────

function translateTerms(text, dict) {
  return Object.keys(dict)
    .sort((a, b) => b.length - a.length)
    .reduce((acc, en) => acc.replace(new RegExp(`\\b${en.replace(/[.*+?^${}()|[\]\\']/g, '\\$&')}\\b`, 'g'), dict[en]), text)
}

function toStatBlock(m, lang, pt) {
  const isPt = lang === 'pt'
  const decimal = isPt ? ',' : '.'
  // Dicionários globais: um texto que se repete em vários monstros é traduzido uma vez.
  const names = isPt ? pt?.names ?? {} : {}
  const texts = isPt ? pt?.texts ?? {} : {}
  const misc = isPt ? pt?.misc ?? {} : {}

  const feature = (f, list, index) => {
    const description = metricText(plain(f.raw), '.')
    return {
      id: `${m.id}-${list}-${index}`,
      name: names[f.name] ?? f.name,
      usage: misc[f.usage] ?? (isPt ? translateUsage(f.usage) : f.usage),
      description: texts[description] ?? (isPt ? description.replace(/(\d)\.(\d)/g, '$1,$2') : description),
      attack_bonus: f.attack_bonus,
      damage: f.damage,
      damage_type: isPt ? PT_DAMAGE[f.damage_type] ?? f.damage_type : f.damage_type,
      save_dc: f.save_dc,
      save_ability: f.save_ability,
    }
  }

  const lists = Object.fromEntries(
    Object.entries(m.lists).map(([list, features]) => [list, features.map((f, i) => feature(f, list, i))]),
  )

  const damageText = text => (isPt ? misc[text] ?? translateTerms(text, PT_DAMAGE) : text)
  const languages = metricText(m.languages, '.')
  const gear = m.gear ? `Gear: ${m.gear}` : ''
  return {
    name: names[m.name] ?? m.name,
    size: m.size,
    creature_type: m.creature_type,
    tags: misc[m.tags] ?? (isPt ? translateTerms(m.tags, PT_TAGS) : m.tags),
    alignment: isPt ? PT_ALIGNMENT[m.alignment] ?? m.alignment : m.alignment,
    ac: m.ac,
    ac_note: '',
    hp: m.hp,
    speed: m.speed,
    abilities: m.abilities,
    save_proficiencies: m.save_proficiencies,
    skills: m.skills,
    vulnerabilities: damageText(m.vulnerabilities),
    resistances: damageText(m.resistances),
    immunities: damageText(m.immunities),
    condition_immunities: m.condition_immunities,
    senses: m.senses,
    languages: misc[languages] ?? (isPt ? translateTerms(languages, PT_LANGUAGES).replace(/(\d)\.(\d)/g, '$1,$2') : languages),
    cr: m.cr,
    initiative_bonus: m.initiative,
    traits: lists.traits,
    actions: lists.actions,
    bonus_actions: lists.bonus_actions,
    reactions: lists.reactions,
    legendary_actions: lists.legendary_actions,
    legendary_uses: m.legendary_uses,
    description: gear ? misc[gear] ?? (isPt ? `Equipamento: ${m.gear}` : gear) : '',
  }
}

function translateUsage(usage) {
  return usage
    .replace(/Recharge/g, 'Recarga')
    .replace(/(\d+)\/Day/g, '$1/Dia')
    .replace(/or (\d+)\/Day in Lair/g, 'ou $1/Dia no Covil')
    .replace(/Costs (\d+) Actions/g, 'Custa $1 ações')
    .replace(/after a Short or Long Rest/g, 'após Descanso Curto ou Longo')
}

const BANDS = [
  { file: 'cr0-1', test: v => v <= 1 },
  { file: 'cr2-5', test: v => v > 1 && v <= 5 },
  { file: 'cr6-10', test: v => v > 5 && v <= 10 },
  { file: 'cr11-30', test: v => v > 10 },
]
const crValue = cr => (cr.includes('/') ? +cr.split('/')[0] / +cr.split('/')[1] : +cr)

function writeLanguage(lang, monsters, pt) {
  const dir = join(OUT, lang)
  mkdirSync(dir, { recursive: true })
  for (const band of BANDS) {
    const entries = monsters
      .filter(m => band.test(crValue(m.cr)))
      .map(m => ({ id: m.id, statblock: toStatBlock(m, lang, pt) }))
    const body = [
      '// Gerado por scripts/srd/generate-monsters.mjs — não editar à mão.',
      '// Contém material do System Reference Document 5.2.1 ("SRD 5.2.1") da Wizards of the',
      '// Coast LLC, licenciado sob a Creative Commons Attribution 4.0 International License.',
      "import type { SrdMonster } from '../types'",
      '',
      // Um monstro por linha: diff legível sem o peso da indentação.
      `const monsters: SrdMonster[] = [\n${entries.map(e => JSON.stringify(e)).join(',\n')},\n]`,
      '',
      'export default monsters',
      '',
    ].join('\n')
    writeFileSync(join(dir, `${band.file}.ts`), body)
  }
}

// ── Execução ──────────────────────────────────────────────────────────────────

const folders = [join(srdDir, '11_Monsters', 'Monsters_Each'), join(srdDir, '12_Animals', 'Animals_Each')]
const monsters = []
const failures = []
for (const folder of folders) {
  for (const file of readdirSync(folder).filter(f => f.endsWith('.md') && !SKIP.has(f))) {
    const override = join(OVERRIDES, file)
    const source = existsSync(override) ? override : join(folder, file)
    try {
      monsters.push(parseMonster(readFileSync(source, 'utf-8'), file))
    } catch (err) {
      failures.push(err.message)
    }
  }
}
if (failures.length > 0) {
  console.error(`falhou em ${failures.length}:\n${failures.join('\n')}`)
  process.exit(1)
}

const ids = new Set()
for (const m of monsters) {
  if (ids.has(m.id)) throw new Error(`id repetido: ${m.id}`)
  ids.add(m.id)
}
monsters.sort((a, b) => a.name.localeCompare(b.name, 'en'))

const pt = existsSync(PT_TRANSLATIONS) ? JSON.parse(readFileSync(PT_TRANSLATIONS, 'utf-8')) : {}
writeLanguage('en', monsters, null)
writeLanguage('pt', monsters, pt)

const translated = monsters.filter(m => pt.names?.[m.name]).length
console.log(`${monsters.length} monstros; nome traduzido em ${translated}; ${Object.keys(pt.texts ?? {}).length} textos traduzidos.`)
