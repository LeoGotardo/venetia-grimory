import {
  ACCESSORIES, ACCESSORY_SLOT, DEFAULT_PORTRAIT, PORTRAIT_OPTIONS, PORTRAIT_PALETTES, SPECIES_POOLS,
  type Accessory, type Portrait, type SpeciesPools,
} from './options'

const OPTION_KEYS = Object.keys(PORTRAIT_OPTIONS) as Array<keyof typeof PORTRAIT_OPTIONS>
const COLOR_KEYS = Object.keys(PORTRAIT_PALETTES) as Array<keyof typeof PORTRAIT_PALETTES>

/**
 * Retrato vindo de fora (ficha salva, JSON importado, ficha de outro aparelho pela
 * sala): só passa id conhecido, campo a campo; o resto vira o padrão. `null` quando
 * nem é um objeto — a ficha fica sem retrato e usa o sorteado.
 */
export function normalizePortrait(raw: unknown): Portrait | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const value = raw as Record<string, unknown>
  const out: Record<string, unknown> = { ...DEFAULT_PORTRAIT }
  for (const key of OPTION_KEYS) {
    const v = value[key]
    if (typeof v === 'string' && (PORTRAIT_OPTIONS[key] as readonly string[]).includes(v)) out[key] = v
  }
  for (const key of COLOR_KEYS) {
    const v = value[key]
    if (typeof v === 'string' && Object.hasOwn(PORTRAIT_PALETTES[key], v)) out[key] = v
  }
  return { ...(out as Portrait), accessories: normalizeAccessories(value.accessories) }
}

/** Ids conhecidos, um por lugar (o primeiro vence), na ordem do catálogo. */
export function normalizeAccessories(raw: unknown): Accessory[] {
  if (!Array.isArray(raw)) return []
  const known = raw.filter((a): a is Accessory => typeof a === 'string' && (ACCESSORIES as readonly string[]).includes(a))
  const bySlot = new Map<string, Accessory>()
  for (const a of known) if (!bySlot.has(ACCESSORY_SLOT[a])) bySlot.set(ACCESSORY_SLOT[a], a)
  return ACCESSORIES.filter(a => bySlot.get(ACCESSORY_SLOT[a]) === a)
}

/** Põe um acessório no lugar dele, tirando o que estava ali (dois óculos não cabem no mesmo rosto). */
export function withAccessory(list: readonly Accessory[], item: Accessory): Accessory[] {
  return normalizeAccessories([item, ...list.filter(a => ACCESSORY_SLOT[a] !== ACCESSORY_SLOT[item])])
}

/** Semente estável de um texto (FNV-1a). */
function hashSeed(text: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 0x01000193)
  return h >>> 0
}

/** Gerador determinístico (mulberry32): a mesma semente, o mesmo rosto. */
function seededRandom(seed: number): () => number {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const pick = <T>(list: readonly T[], random: () => number): T => list[Math.floor(random() * list.length)]

/** Rosto sorteado com o jeito da espécie (`SPECIES_POOLS`); espécie desconhecida sorteia como humano. */
export function randomPortrait(speciesId: string | null | undefined, random: () => number = Math.random): Portrait {
  const pools: SpeciesPools = SPECIES_POOLS[speciesId ?? ''] ?? SPECIES_POOLS.humano
  // A ordem dos campos é a do objeto de grupos: mudar a ordem muda os rostos sorteados com semente.
  const { accessories: accessoryPool, ...single } = pools
  const picked = Object.fromEntries(Object.entries(single).map(([key, pool]) => [key, pick(pool as readonly string[], random)])) as
    Omit<Portrait, 'clothes' | 'background' | 'accessories' | 'beardColor'>
  // Um acessório e, às vezes, um segundo; `normalizeAccessories` descarta o que cair no mesmo lugar.
  const first = pick(accessoryPool, random)
  const second = random() < 0.35 ? pick(accessoryPool, random) : 'none'
  return {
    ...picked,
    // Quase sempre a barba é da cor do cabelo.
    beardColor: random() < 0.85 ? picked.hairColor : pick(Object.keys(PORTRAIT_PALETTES.beardColor) as Portrait['beardColor'][], random),
    accessories: normalizeAccessories([first, second]),
    clothes: pick(Object.keys(PORTRAIT_PALETTES.clothes) as Portrait['clothes'][], random),
    background: pick(Object.keys(PORTRAIT_PALETTES.background) as Portrait['background'][], random),
  }
}

/**
 * Rosto de uma ficha que ainda não tem retrato salvo: sorteado com a semente do id
 * da ficha (não do nome — renomear não muda o rosto), igual em toda tela.
 * shortcut: mudar a ordem ou o tamanho de um grupo em `SPECIES_POOLS` muda estes
 * rostos; se isso incomodar, gravar o retrato sorteado na criação da ficha.
 */
export function defaultPortrait(speciesId: string | null | undefined, seed: string): Portrait {
  return randomPortrait(speciesId, seededRandom(hashSeed(seed)))
}
