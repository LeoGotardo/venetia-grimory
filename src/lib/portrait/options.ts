/**
 * Retrato do personagem: só ids de opção e de paleta, nunca SVG nem cor livre — a
 * ficha vai ao mestre pela sala, para a conta e para JSON exportado, e o desenho é
 * montado no aparelho a partir destes ids (`render.ts`).
 *
 * A base é o Open Peeps (Pablo Stanley, CC0, pelo DiceBear): `hair`, `face` e
 * `beard` são ids dele. Orelhas, chifres, presas, marcas, auréola, tiara, brincos e
 * a cabeça dracônica são camadas nossas no mesmo traço.
 *
 * As listas só crescem no fim: o retrato padrão de uma ficha sem retrato salvo é
 * sorteado com semente, e mudar a ordem ou tirar um item mudaria o rosto de todas.
 */

/** Penteados do Open Peeps; bonés e gorros ficam de fora (modernos demais para a mesa). */
const PEEPS_HAIR = [
  'afro', 'bangs', 'bangs2', 'bantuKnots', 'bear', 'bun', 'bun2', 'buns', 'cornrows', 'cornrows2', 'dreads1', 'dreads2',
  'flatTop', 'flatTopLong', 'grayBun', 'grayMedium', 'grayShort', 'hijab', 'long', 'longAfro', 'longBangs', 'longCurly',
  'medium1', 'medium2', 'medium3', 'mediumBangs', 'mediumBangs2', 'mediumBangs3', 'mediumStraight', 'mohawk', 'mohawk2',
  'noHair1', 'noHair2', 'noHair3', 'pomp', 'shaved1', 'shaved2', 'shaved3', 'short1', 'short2', 'short3', 'short4',
  'short5', 'turban', 'twists', 'twists2',
] as const

const PEEPS_FACE = [
  'angryWithFang', 'awe', 'blank', 'calm', 'cheeky', 'concerned', 'concernedFear', 'contempt', 'cute', 'cyclops',
  'driven', 'eatingHappy', 'explaining', 'eyesClosed', 'fear', 'hectic', 'lovingGrin1', 'lovingGrin2', 'monster', 'old',
  'rage', 'serious', 'smile', 'smileBig', 'smileLOL', 'smileTeethGap', 'solemn', 'suspicious', 'tired', 'veryAngry',
] as const

const PEEPS_BEARD = [
  'chin', 'full', 'full2', 'full3', 'full4', 'goatee1', 'goatee2', 'moustache1', 'moustache2', 'moustache3',
  'moustache4', 'moustache5', 'moustache6', 'moustache7', 'moustache8', 'moustache9',
] as const

/** Acessórios do Open Peeps (óculos e tapa-olho; óculos escuros e máscara ficam de fora). */
export const PEEPS_ACCESSORIES = ['eyepatch', 'glasses', 'glasses2', 'glasses3', 'glasses4', 'glasses5'] as const

/** Carecas: o "cabelo" é só o contorno da cabeça, sem nada para pintar. */
export const BALD_HAIR: readonly string[] = ['noHair1', 'noHair2']

/** Todos os acessórios; um retrato pode ter vários, mas um só por lugar (`ACCESSORY_SLOT`). */
export const ACCESSORIES = [...PEEPS_ACCESSORIES, 'earring', 'circlet', 'halo'] as const
export type Accessory = (typeof ACCESSORIES)[number]

/**
 * Onde cada acessório fica: dois no mesmo lugar se sobrepõem (dois óculos, óculos
 * com tapa-olho), então escolher um troca o que já estava ali.
 */
export const ACCESSORY_SLOT: Record<Accessory, 'eyes' | 'ears' | 'brow' | 'above'> = {
  eyepatch: 'eyes', glasses: 'eyes', glasses2: 'eyes', glasses3: 'eyes', glasses4: 'eyes', glasses5: 'eyes',
  earring: 'ears', circlet: 'brow', halo: 'above',
}

export const PORTRAIT_OPTIONS = {
  head: ['human', 'draconic'],
  hair: PEEPS_HAIR,
  face: PEEPS_FACE,
  beard: ['none', ...PEEPS_BEARD],
  ears: ['round', 'pointed', 'long'],
  horns: ['none', 'nubs', 'curved', 'straight', 'swept'],
  tusks: ['none', 'small', 'large'],
  markings: ['none', 'freckles', 'scar', 'tattoo', 'warpaint', 'scales'],
} as const

const HAIR_COLORS = {
  black: '#1E1A1A', darkbrown: '#3B2618', brown: '#6B4426', auburn: '#8A3B1E', red: '#B5491F', blonde: '#D9B45A',
  platinum: '#E8E0C8', white: '#EDEDED', gray: '#8C8C8C', blue: '#3E5FA8', green: '#3F7D4E', purple: '#6A3E8F',
} as const

/** Cores por id. A ficha guarda o id; a cor só existe aqui. */
export const PORTRAIT_PALETTES = {
  skin: {
    porcelain: '#F3D9C5', fair: '#E8BFA0', tan: '#C99470', bronze: '#A0704A', brown: '#7A5235', deep: '#4F3322',
    ash: '#9A9590', stone: '#7E8A8F', green: '#7C9A5A', olive: '#93A06A', red: '#B5473A', crimson: '#8E2B33',
    violet: '#7A5A9E', blue: '#4F7FB0', gold: '#C9A24A', silver: '#B8BEC6', jade: '#4F8F6E', obsidian: '#3A3440',
  },
  hairColor: HAIR_COLORS,
  /** Mesmas cores do cabelo (os rótulos também são os do cabelo). */
  beardColor: HAIR_COLORS,
  /** Só o olho da cabeça dracônica tem cor; o do Open Peeps é traço. */
  eyeColor: { amber: '#D39B21', red: '#C0352B', green: '#3F9D4E', blue: '#4FA3D9', violet: '#8B5BC0', white: '#E8F0F5' },
  hornColor: { bone: '#D8CBB0', dark: '#3A2A22', red: '#7A2A22', gray: '#6E6A66' },
  clothes: { leather: '#5B3A29', navy: '#2E4A6B', forest: '#4B5E3A', wine: '#6B2B2B', shadow: '#3A3440', sand: '#8A7A5A' },
  background: { ember: '#3A2A1A', night: '#1E2A33', dusk: '#2A2033', moss: '#203024', hearth: '#2D2520', steel: '#2A2E33' },
} as const

type Options = typeof PORTRAIT_OPTIONS
type Palettes = typeof PORTRAIT_PALETTES

export type Portrait =
  { [K in keyof Options]: Options[K][number] } &
  { [K in keyof Palettes]: keyof Palettes[K] } &
  { accessories: Accessory[] }

export type PortraitPart = keyof Options
export type PortraitColor = keyof Palettes

/** O que vale quando um campo falta ou não é reconhecido. */
export const DEFAULT_PORTRAIT: Portrait = {
  head: 'human', hair: 'short1', face: 'smile', beard: 'none', ears: 'round', horns: 'none', tusks: 'none',
  markings: 'none', accessories: [],
  skin: 'fair', hairColor: 'brown', beardColor: 'brown', eyeColor: 'amber', hornColor: 'bone', clothes: 'leather', background: 'hearth',
}

type Pool<K extends Exclude<keyof Portrait, 'accessories'>> = readonly Portrait[K][]

/**
 * O que o sorteio escolhe por espécie (ids de `species.ts`). Repetir um id pesa a
 * escolha (anões quase sempre de barba). O editor mostra todas as opções; isto só
 * guia o "Sortear" e o retrato padrão.
 */
export type SpeciesPools =
  { [K in Exclude<keyof Portrait, 'clothes' | 'background' | 'accessories' | 'beardColor'>]: Pool<K> } &
  { /** Sorteados um ou dois, no máximo um por lugar; `none` pesa a favor de nenhum. */ accessories: readonly (Accessory | 'none')[] }

/** Na cabeça dracônica, óculos, tapa-olho e brinco ficariam por baixo dela; só o que vai por cima. */
export const DRACONIC_ACCESSORIES: readonly Accessory[] = ['circlet', 'halo']

const HUMAN_SKIN = ['porcelain', 'fair', 'tan', 'bronze', 'brown', 'deep'] as const
const NATURAL_HAIR = ['black', 'darkbrown', 'brown', 'auburn', 'red', 'blonde', 'gray'] as const
/** Expressões que não são de monstro nem de ciclope. */
const PLAIN_FACES = PEEPS_FACE.filter(f => f !== 'monster' && f !== 'cyclops')
const FIERCE_FACES = ['rage', 'angryWithFang', 'veryAngry', 'driven', 'serious', 'contempt', 'suspicious'] as const
const PLAIN_HAIR = PEEPS_HAIR.filter(h => h !== 'hijab' && h !== 'turban')
const LONG_HAIR = ['long', 'longCurly', 'longBangs', 'mediumStraight', 'medium1', 'medium2', 'mediumBangs', 'bun', 'bun2', 'buns'] as const

const HUMAN: SpeciesPools = {
  head: ['human'],
  hair: PEEPS_HAIR,
  face: PLAIN_FACES,
  beard: ['none', 'none', 'none', 'none', ...PEEPS_BEARD],
  ears: ['round'],
  horns: ['none'],
  tusks: ['none'],
  markings: ['none', 'none', 'none', 'freckles', 'scar'],
  accessories: ['none', 'none', 'none', 'none', 'none', 'none', 'none', 'glasses', 'glasses3', 'earring', 'circlet', 'eyepatch'],
  skin: HUMAN_SKIN,
  hairColor: NATURAL_HAIR,
  eyeColor: ['amber'],
  hornColor: ['bone'],
}

export const SPECIES_POOLS: Record<string, SpeciesPools> = {
  humano: HUMAN,
  elfo: {
    ...HUMAN,
    hair: LONG_HAIR,
    face: ['calm', 'serious', 'solemn', 'smile', 'suspicious', 'contempt', 'cute'],
    beard: ['none'],
    ears: ['pointed', 'long'],
    accessories: ['none', 'none', 'circlet', 'earring'],
    skin: ['porcelain', 'fair', 'tan', 'bronze', 'obsidian', 'violet'],
    hairColor: ['platinum', 'blonde', 'black', 'white', 'auburn', 'brown'],
  },
  anao: {
    ...HUMAN,
    hair: ['noHair1', 'noHair2', 'noHair3', 'short1', 'short2', 'bun', 'flatTop', 'grayShort'],
    face: ['driven', 'serious', 'smileBig', 'old', 'suspicious', 'rage', 'calm'],
    beard: ['full', 'full2', 'full3', 'full4', 'full4', 'full2'],
    accessories: ['none', 'none', 'earring', 'eyepatch'],
  },
  pequenino: {
    ...HUMAN,
    hair: ['afro', 'longCurly', 'medium3', 'bangs', 'short3', 'twists', 'mediumBangs3'],
    face: ['cute', 'smile', 'smileBig', 'cheeky', 'eatingHappy', 'lovingGrin1', 'smileLOL'],
    beard: ['none', 'none', 'none', 'chin'],
    ears: ['round', 'pointed'],
    markings: ['none', 'freckles', 'freckles'],
  },
  gnomo: {
    ...HUMAN,
    hair: ['mohawk', 'mohawk2', 'bangs', 'twists2', 'noHair3', 'grayMedium', 'short4'],
    face: ['cheeky', 'awe', 'explaining', 'smileTeethGap', 'hectic', 'lovingGrin2'],
    beard: ['none', 'none', 'goatee1', 'moustache3', 'moustache7'],
    ears: ['pointed'],
    accessories: ['glasses', 'glasses2', 'glasses4', 'none', 'earring'],
    hairColor: ['white', 'red', 'blonde', 'blue', 'green', 'purple', 'brown'],
  },
  orc: {
    ...HUMAN,
    hair: ['dreads1', 'dreads2', 'shaved1', 'shaved2', 'mohawk', 'cornrows', 'noHair1', 'flatTopLong'],
    face: FIERCE_FACES,
    beard: ['none', 'none', 'chin', 'goatee2'],
    ears: ['pointed'],
    tusks: ['small', 'large', 'large'],
    markings: ['none', 'warpaint', 'scar', 'tattoo'],
    accessories: ['none', 'none', 'earring', 'eyepatch'],
    skin: ['green', 'olive', 'ash', 'stone', 'green'],
    hairColor: ['black', 'darkbrown', 'gray'],
  },
  tiferino: {
    ...HUMAN,
    hair: PLAIN_HAIR,
    face: ['contempt', 'smile', 'suspicious', 'calm', 'cheeky', 'serious'],
    beard: ['none', 'none', 'none', 'goatee1', 'goatee2'],
    ears: ['pointed'],
    horns: ['curved', 'straight', 'swept', 'nubs'],
    accessories: ['none', 'none', 'earring', 'circlet'],
    skin: ['red', 'crimson', 'violet', 'blue', 'tan', 'fair'],
    hairColor: ['black', 'purple', 'red', 'darkbrown', 'white'],
    hornColor: ['dark', 'red', 'bone', 'gray'],
  },
  aasimar: {
    ...HUMAN,
    hair: LONG_HAIR,
    face: ['solemn', 'calm', 'smile', 'serious', 'eyesClosed'],
    beard: ['none', 'none', 'none', 'full'],
    accessories: ['halo', 'halo', 'circlet', 'earring'],
    skin: ['porcelain', 'fair', 'tan', 'bronze', 'brown', 'silver'],
    hairColor: ['platinum', 'white', 'blonde', 'auburn', 'black'],
  },
  golias: {
    ...HUMAN,
    hair: ['noHair1', 'noHair2', 'shaved1', 'shaved3', 'cornrows2', 'flatTop'],
    face: ['serious', 'driven', 'calm', 'solemn', 'smileBig'],
    beard: ['none', 'none', 'chin', 'goatee1'],
    markings: ['tattoo', 'tattoo', 'scar'],
    skin: ['ash', 'stone', 'silver'],
  },
  draconato: {
    ...HUMAN,
    head: ['draconic'],
    hair: ['noHair1'],
    face: ['smile'],
    beard: ['none'],
    ears: ['round'],
    horns: ['swept', 'straight', 'curved'],
    markings: ['scales', 'scales', 'scar', 'none'],
    accessories: ['none', 'none', 'circlet', 'halo'],
    skin: ['gold', 'bronze', 'silver', 'red', 'crimson', 'blue', 'jade', 'obsidian'],
    eyeColor: ['amber', 'red', 'green', 'blue', 'violet'],
    hornColor: ['bone', 'dark', 'gray'],
  },
}

/** O que não existe numa cabeça dracônica (cabelo, barba, presas, orelha humana, expressão do Open Peeps). */
export const DRACONIC_HIDDEN: readonly (PortraitPart | PortraitColor)[] = ['hair', 'face', 'beard', 'ears', 'tusks', 'hairColor', 'beardColor']
