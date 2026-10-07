import type { AreaLayerId } from '../../types'

/**
 * Stamps do mapa de área: desenhos vetoriais próprios (sem licença de terceiros),
 * em vista 3/4 como nos mapas ilustrados. O mesmo SVG vira `GraphicsContext` no
 * Pixi (nítido em qualquer zoom) e miniatura no navegador de assets.
 *
 * O parser SVG do Pixi não aceita `transform`, gradiente em `<g>` nem herança de
 * estilo útil: cada forma traz o próprio `fill`/`stroke`. `w`×`h` é o viewBox e o
 * tamanho padrão no mapa, em unidades de mundo.
 */

export const STAMP_CATEGORIES = [
  'nature', 'relief', 'water', 'roads', 'buildings', 'castles', 'ruins', 'religion', 'decor', 'fantasy',
] as const
export type StampCategory = typeof STAMP_CATEGORIES[number]

export interface StampDef {
  id: string
  category: StampCategory
  w: number
  h: number
  /** Camada onde o stamp entra quando colocado. */
  layer: AreaLayerId
  /** Formas SVG (sem a tag `<svg>`). */
  body: string
}

// Paleta: contorno marrom-escuro, cores terrosas próximas do resto do app.
const INK = '#2a1d10'
const LEAF = '#3f6b2e'
const LEAF_LIGHT = '#6a9a45'
const LEAF_DARK = '#2b4a20'
const PINE = '#2e5a3a'
const PINE_LIGHT = '#4a7f52'
const TRUNK = '#6b4a2b'
const STONE = '#8c8279'
const STONE_LIGHT = '#b3aaa0'
const STONE_DARK = '#5f5852'
const ROOF = '#9a3b2a'
const ROOF_DARK = '#6e2a1e'
const THATCH = '#b08a45'
const THATCH_DARK = '#8a6a32'
const WOOD = '#a07a4f'
const WOOD_DARK = '#7a5532'
const PLASTER = '#d9c8a6'
const WATER = '#3f7fa8'
const WATER_LIGHT = '#9fd0ea'
const SNOW = '#e8eef2'
const GOLD = '#d4a017'
const ARCANE = '#8f6bff'
const ARCANE_LIGHT = '#c8b6ff'

const line = (w = 2) => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`
const shadow = (cx: number, cy: number, rx: number, ry: number) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#000000" fill-opacity="0.22"/>`
const circle = (cx: number, cy: number, r: number, fill: string, stroke = true) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${stroke ? line() : ''}/>`
const poly = (points: string, fill: string, w = 2) => `<polygon points="${points}" fill="${fill}" ${line(w)}/>`
const rect = (x: number, y: number, w: number, h: number, fill: string, sw = 2) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${line(sw)}/>`
const path = (d: string, fill: string, w = 2) => `<path d="${d}" fill="${fill}" ${line(w)}/>`
// `fill="none"` explícito: sem ele o navegador preenche de preto na miniatura (o Pixi ignora).
const stroke = (d: string, color: string, w: number) =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`

/** Janela com moldura. */
const win = (x: number, y: number, w = 8, h = 9) => rect(x, y, w, h, '#3a2a18', 1.5)
/** Porta com arco. */
const door = (x: number, y: number, w = 10, h = 14) =>
  path(`M${x} ${y + h} V${y + w / 2} A${w / 2} ${w / 2} 0 0 1 ${x + w} ${y + w / 2} V${y + h} Z`, WOOD_DARK, 1.5)
/** Ameias no topo de um muro de `x` a `x + w`. */
function battlements(x: number, y: number, w: number, fill: string, size = 8) {
  let out = ''
  for (let bx = x; bx + size <= x + w + 0.1; bx += size * 2) out += rect(bx, y - size, size, size, fill, 1.5)
  return out
}

/** Copa redonda feita de lóbulos, com luz em cima. */
function canopy(cx: number, cy: number, r: number, base = LEAF, light = LEAF_LIGHT, dark = LEAF_DARK) {
  const lobes = [[-0.55, 0.2], [0.55, 0.2], [0, -0.45], [-0.3, -0.15], [0.3, -0.15], [0, 0.3]]
  let out = lobes.map(([dx, dy]) => circle(cx + dx * r, cy + dy * r, r * 0.62, base)).join('')
  out += lobes.map(([dx, dy]) => `<circle cx="${cx + dx * r}" cy="${cy + dy * r}" r="${r * 0.6}" fill="${base}"/>`).join('')
  out += `<circle cx="${cx - r * 0.25}" cy="${cy - r * 0.45}" r="${r * 0.3}" fill="${light}" fill-opacity="0.7"/>`
  out += `<circle cx="${cx + r * 0.35}" cy="${cy + r * 0.35}" r="${r * 0.35}" fill="${dark}" fill-opacity="0.5"/>`
  return out
}

/** Pinheiro em camadas. */
function pine(cx: number, top: number, w: number, h: number, base = PINE, light = PINE_LIGHT) {
  const tiers = 3
  let out = ''
  for (let i = 0; i < tiers; i++) {
    const ty = top + (h / (tiers + 0.6)) * i
    const half = (w / 2) * ((i + 1.4) / (tiers + 0.4))
    const by = ty + h / (tiers - 0.4)
    out += poly(`${cx},${ty} ${cx + half},${by} ${cx - half},${by}`, base)
    out += `<polygon points="${cx},${ty + 3} ${cx - half * 0.15},${by - 4} ${cx - half + 6},${by - 3}" fill="${light}" fill-opacity="0.6"/>`
  }
  return out
}

/** Montanha com face iluminada e sombreada; `snow` põe neve no pico. */
function mountain(x0: number, base: number, peakX: number, peakY: number, x1: number, snow: boolean) {
  let out = poly(`${x0},${base} ${peakX},${peakY} ${x1},${base}`, STONE)
  out += `<polygon points="${peakX},${peakY} ${x1},${base} ${peakX + (x1 - peakX) * 0.15},${base}" fill="${STONE_DARK}" fill-opacity="0.75"/>`
  out += stroke(`M${peakX} ${peakY} L${peakX + (x1 - peakX) * 0.15} ${base}`, INK, 1.5)
  if (snow) {
    const k = 0.28
    const lx = peakX + (x0 - peakX) * k
    const rx = peakX + (x1 - peakX) * k
    const sy = peakY + (base - peakY) * k
    out += poly(`${peakX},${peakY} ${rx},${sy} ${peakX + (rx - peakX) * 0.45},${sy - 6} ${peakX - 2},${sy + 2} ${lx + (peakX - lx) * 0.4},${sy - 5} ${lx},${sy}`, SNOW, 1.5)
  }
  return out
}

/** Casa: parede + telhado de duas águas. */
function house(x: number, y: number, w: number, h: number, roofH: number, roof: string, roofDark: string, wall: string) {
  const top = y + roofH
  let out = rect(x, top, w, h - roofH, wall)
  out += poly(`${x - 5},${top + 2} ${x + w / 2},${y} ${x + w + 5},${top + 2}`, roof)
  out += `<polygon points="${x + w / 2},${y} ${x + w + 5},${top + 2} ${x + w / 2},${top + 2}" fill="${roofDark}" fill-opacity="0.55"/>`
  return out
}

/**
 * Arredonda as coordenadas calculadas a 2 casas e troca `<polygon>` por `<path>`:
 * o parser do Pixi 8 lê `points` só com inteiros (`/-?\d+/`), então `33.06`
 * virava dois números e o polígono explodia pela tela. `d` de path ele lê certo.
 */
function pixiSafe(body: string): string {
  return body
    .replace(/-?\d+\.\d{3,}/g, n => String(Math.round(Number(n) * 100) / 100))
    .replace(/<polygon points="([^"]+)"/g, (_, pts: string) => {
      const [first, ...rest] = pts.trim().split(/\s+/)
      return `<path d="M${first} ${rest.map(p => `L${p}`).join(' ')} Z"`
    })
}

const S = (id: string, category: StampCategory, w: number, h: number, layer: AreaLayerId, body: string): StampDef =>
  ({ id, category, w, h, layer, body: pixiSafe(body) })

export const STAMPS: readonly StampDef[] = [
  // Natureza
  S('oak', 'nature', 64, 72, 'vegetation',
    shadow(32, 66, 22, 5) + rect(28, 40, 8, 26, TRUNK) + canopy(32, 30, 24)),
  S('pine', 'nature', 48, 76, 'vegetation',
    shadow(24, 71, 16, 4) + rect(21, 58, 6, 13, TRUNK) + pine(24, 4, 44, 60)),
  S('birch', 'nature', 50, 72, 'vegetation',
    shadow(25, 67, 16, 4) + rect(22, 36, 6, 31, '#e6e0d2')
    + stroke('M22 46 h3 M25 54 h3 M22 61 h2', INK, 1.5) + canopy(25, 26, 19, '#7a9a3a', '#a9c46a', '#55702a')),
  S('willow', 'nature', 70, 70, 'vegetation',
    shadow(35, 64, 24, 5) + rect(31, 36, 8, 28, TRUNK) + canopy(35, 28, 24, '#5f7f3a', '#8fae5a', '#3f5a26')
    + stroke('M16 30 q-2 16 2 30 M26 36 q-1 14 1 24 M44 36 q1 14 -1 24 M54 30 q2 16 -2 30', '#3f5a26', 3)),
  S('deadTree', 'nature', 56, 70, 'vegetation',
    shadow(28, 65, 16, 4)
    + path('M25 65 L26 38 L14 22 L17 20 L28 33 L29 12 L33 12 L32 30 L42 18 L45 21 L33 38 L32 65 Z', '#5a4636')),
  S('bush', 'nature', 44, 32, 'vegetation',
    shadow(22, 28, 18, 4) + canopy(22, 17, 13)),
  S('flowers', 'nature', 36, 24, 'decor',
    canopy(18, 15, 9, '#4f7a35', '#7aa550', '#35552a')
    + circle(11, 11, 3, '#e86a8a', false) + circle(20, 8, 3, '#f2d24a', false) + circle(26, 14, 3, '#e8e8ff', false)
    + circle(15, 17, 2.5, '#f2d24a', false)),
  S('mushroom', 'nature', 28, 28, 'decor',
    shadow(14, 25, 10, 3) + rect(11, 13, 6, 11, '#efe4cc', 1.5) + path('M3 14 Q14 0 25 14 Z', '#b8342a', 1.5)
    + circle(10, 9, 1.8, '#ffffff', false) + circle(17, 7, 1.5, '#ffffff', false) + circle(20, 11, 1.2, '#ffffff', false)),
  S('grassClump', 'nature', 32, 22, 'vegetation',
    stroke('M6 20 L4 8 M10 20 L11 4 M14 20 L18 6 M18 20 L22 9 M24 20 L28 10 M12 20 L7 11', '#557a33', 2.5)),
  S('rock', 'nature', 34, 24, 'terrain',
    shadow(17, 20, 14, 3) + path('M4 19 L7 9 L16 4 L27 7 L31 18 Z', STONE) + stroke('M16 4 L19 12 L31 18', INK, 1.5)),
  S('boulder', 'nature', 56, 44, 'terrain',
    shadow(28, 38, 24, 5) + path('M5 36 L8 18 L22 6 L40 8 L51 22 L50 36 Z', STONE)
    + `<polygon points="40,8 51,22 50,36 34,36 32,20" fill="${STONE_DARK}" fill-opacity="0.6"/>`
    + `<polygon points="22,6 13,16 22,18" fill="${STONE_LIGHT}" fill-opacity="0.8"/>`),
  S('crystal', 'fantasy', 32, 44, 'decor',
    shadow(16, 40, 12, 3) + poly('16,2 23,16 19,40 12,40 9,16', ARCANE) + poly('24,14 29,24 26,40 21,40 20,26', '#6a4fd0', 1.5)
    + `<polygon points="16,2 12,16 14,38 12,40 9,16" fill="${ARCANE_LIGHT}" fill-opacity="0.7"/>`),

  // Relevo
  S('mountain', 'relief', 160, 110, 'terrain',
    shadow(80, 104, 70, 6) + mountain(10, 104, 98, 12, 150, false) + mountain(2, 104, 44, 40, 92, false)),
  S('peak', 'relief', 120, 120, 'terrain',
    shadow(60, 113, 52, 6) + mountain(6, 113, 60, 6, 114, true)),
  S('hill', 'relief', 140, 60, 'terrain',
    shadow(70, 54, 62, 5) + path('M6 54 Q40 6 74 22 Q104 8 134 54 Z', '#6f8a45')
    + `<path d="M74 22 Q104 8 134 54 L96 54 Q96 30 74 22 Z" fill="#4f6a32" fill-opacity="0.6"/>`
    + stroke('M30 40 q6 -4 12 0 M90 38 q6 -4 12 0', '#4f6a32', 2)),

  // Água
  S('pond', 'water', 90, 56, 'water',
    path('M8 30 Q10 8 44 8 Q84 8 84 30 Q82 50 44 50 Q8 50 8 30 Z', WATER, 2.5)
    + stroke('M26 24 q8 -4 16 0 M50 34 q8 -4 16 0', WATER_LIGHT, 2)),
  S('reeds', 'water', 34, 36, 'water',
    stroke('M8 34 L6 12 M13 34 L14 6 M19 34 L22 10 M25 34 L28 14', '#5f7f3a', 2.5)
    + `<ellipse cx="14" cy="9" rx="2.5" ry="5" fill="#6b4a2b"/>` + `<ellipse cx="22" cy="13" rx="2.5" ry="5" fill="#6b4a2b"/>`),
  S('lilyPads', 'water', 40, 28, 'water',
    path('M12 14 m-9 0 a9 6 0 1 0 18 0 a9 6 0 1 0 -18 0 Z', '#4f8a3a', 1.5)
    + path('M29 18 m-7 0 a7 5 0 1 0 14 0 a7 5 0 1 0 -14 0 Z', '#5f9a45', 1.5) + circle(13, 12, 2.5, '#f2b6c8', false)),
  S('waterfall', 'water', 60, 80, 'water',
    path('M4 20 L16 8 L44 8 L56 20 L56 30 L4 30 Z', STONE) + rect(16, 14, 28, 52, WATER, 2)
    + stroke('M22 18 V62 M30 16 V64 M38 18 V62', WATER_LIGHT, 2)
    + path('M6 70 Q14 60 22 66 Q30 58 38 66 Q46 60 54 70 Q30 78 6 70 Z', '#e8f4fa', 1.5)),

  // Estradas e transporte
  S('bridge', 'roads', 120, 48, 'roads',
    path('M4 34 Q60 4 116 34 L116 42 Q60 14 4 42 Z', WOOD)
    + stroke('M20 30 L20 37 M40 22 L40 29 M60 19 L60 26 M80 22 L80 29 M100 30 L100 37', WOOD_DARK, 2)
    + stroke('M4 30 Q60 0 116 30', INK, 2)),
  S('signpost', 'roads', 28, 44, 'roads',
    shadow(14, 41, 8, 2) + rect(12, 8, 4, 33, WOOD_DARK) + poly('4,10 22,10 26,14 22,18 4,18', WOOD, 1.5)
    + poly('24,22 6,22 2,26 6,30 24,30', WOOD, 1.5)),
  S('dock', 'roads', 90, 60, 'roads',
    rect(10, 8, 70, 30, WOOD) + stroke('M24 8 V38 M38 8 V38 M52 8 V38 M66 8 V38', WOOD_DARK, 1.5)
    + rect(12, 38, 6, 16, WOOD_DARK, 1.5) + rect(42, 38, 6, 16, WOOD_DARK, 1.5) + rect(72, 38, 6, 16, WOOD_DARK, 1.5)),

  // Construções
  S('house', 'buildings', 72, 64, 'structures',
    shadow(36, 60, 30, 4) + house(10, 6, 52, 54, 24, ROOF, ROOF_DARK, PLASTER) + door(31, 42) + win(16, 38) + win(48, 38)),
  S('cottage', 'buildings', 64, 56, 'structures',
    shadow(32, 52, 26, 4) + house(10, 6, 44, 46, 22, THATCH, THATCH_DARK, WOOD) + door(27, 36) + win(14, 34, 7, 8)
    + rect(42, 8, 6, 12, STONE_DARK, 1.5)),
  S('tavern', 'buildings', 96, 76, 'structures',
    shadow(48, 71, 42, 5) + house(8, 6, 80, 64, 28, ROOF_DARK, '#4a1c14', PLASTER)
    + stroke('M8 52 H88', WOOD_DARK, 3) + door(43, 54) + win(16, 40) + win(30, 40) + win(58, 40) + win(72, 40)
    + rect(78, 22, 4, 16, WOOD_DARK, 1.5) + rect(70, 36, 16, 10, GOLD, 1.5)),
  S('barn', 'buildings', 92, 64, 'structures',
    shadow(46, 60, 40, 4) + house(10, 6, 72, 54, 22, '#7a3020', '#52200f', '#a3402c')
    + path('M34 60 V36 H58 V60', WOOD_DARK, 2) + stroke('M34 36 L58 60 M58 36 L34 60', PLASTER, 2)),
  S('mill', 'buildings', 80, 96, 'structures',
    shadow(40, 91, 26, 4) + poly('24,90 30,40 50,40 56,90', STONE) + poly('22,42 40,24 58,42', ROOF, 2)
    + door(35, 74) + circle(40, 32, 4, WOOD_DARK)
    + poly('40,32 36,2 44,2', WOOD, 1.5) + poly('40,32 76,28 76,36', WOOD, 1.5)
    + poly('40,32 44,62 36,62', WOOD, 1.5) + poly('40,32 4,36 4,28', WOOD, 1.5)),
  S('tower', 'buildings', 48, 100, 'structures',
    shadow(24, 95, 18, 4) + rect(10, 32, 28, 63, STONE) + poly('6,34 24,2 42,34', ROOF, 2)
    + win(20, 44, 8, 10) + win(20, 64, 8, 10) + door(19, 81)),

  // Castelos e fortificações
  S('castle', 'castles', 180, 150, 'structures',
    shadow(90, 144, 82, 6)
    + rect(30, 70, 120, 74, STONE) + battlements(30, 70, 120, STONE)
    + rect(10, 40, 34, 104, STONE) + battlements(10, 40, 34, STONE_LIGHT, 7)
    + rect(136, 40, 34, 104, STONE) + battlements(136, 40, 34, STONE_LIGHT, 7)
    + rect(70, 24, 40, 60, STONE_LIGHT) + poly('66,26 90,0 114,26', ROOF, 2)
    + path('M76 144 V112 A14 14 0 0 1 104 112 V144 Z', '#3a2a18', 2)
    + win(22, 60, 8, 12) + win(148, 60, 8, 12) + win(86, 40, 8, 12)
    + `<polygon points="90,2 102,6 90,10" fill="${GOLD}"/>`),
  S('keep', 'castles', 96, 110, 'structures',
    shadow(48, 104, 40, 5) + rect(14, 24, 68, 80, STONE) + battlements(14, 24, 68, STONE)
    + win(26, 40, 8, 12) + win(62, 40, 8, 12) + win(44, 56, 8, 12)
    + path('M38 104 V84 A10 10 0 0 1 58 84 V104 Z', '#3a2a18', 2)),
  S('wallSegment', 'castles', 120, 44, 'structures',
    shadow(60, 40, 56, 4) + rect(4, 14, 112, 26, STONE) + battlements(4, 14, 112, STONE)
    + stroke('M4 27 H116 M30 14 V27 M70 27 V40 M95 14 V27', STONE_DARK, 1.5)),
  S('gatehouse', 'castles', 100, 80, 'structures',
    shadow(50, 75, 46, 5) + rect(6, 20, 26, 55, STONE) + battlements(6, 20, 26, STONE_LIGHT, 6)
    + rect(68, 20, 26, 55, STONE) + battlements(68, 20, 26, STONE_LIGHT, 6) + rect(32, 30, 36, 45, STONE)
    + path('M38 75 V52 A12 12 0 0 1 62 52 V75 Z', '#3a2a18', 2)
    + stroke('M42 46 V75 M50 41 V75 M58 46 V75 M38 60 H62', '#9a9088', 1.5)),

  // Ruínas
  S('ruinedTower', 'ruins', 50, 80, 'structures',
    shadow(25, 75, 20, 4) + path('M10 75 V30 L16 22 L22 30 L28 16 L34 28 L40 24 V75 Z', STONE)
    + win(21, 40, 8, 10) + `<polygon points="28,16 34,28 40,24 40,75 30,75" fill="${STONE_DARK}" fill-opacity="0.5"/>`
    + rect(40, 66, 8, 6, STONE_LIGHT, 1.5) + rect(2, 70, 7, 5, STONE_LIGHT, 1.5)),
  S('brokenPillar', 'ruins', 28, 52, 'structures',
    shadow(14, 48, 11, 3) + rect(4, 42, 20, 6, STONE_LIGHT, 1.5) + path('M7 42 V16 L12 10 L16 16 L21 12 V42 Z', STONE_LIGHT)
    + stroke('M11 40 V18 M17 40 V18', STONE_DARK, 1.5)),
  S('brokenWall', 'ruins', 100, 44, 'structures',
    shadow(50, 40, 46, 4) + path('M4 40 V16 H22 V10 H34 V22 H46 V30 H60 V14 H72 V24 H84 V18 H96 V40 Z', STONE)
    + stroke('M4 28 H46 M60 28 H96', STONE_DARK, 1.5) + rect(48, 34, 8, 6, STONE_LIGHT, 1.5)),

  // Religião
  S('temple', 'religion', 120, 96, 'structures',
    shadow(60, 91, 54, 5) + rect(8, 80, 104, 11, STONE_LIGHT) + poly('6,36 60,6 114,36', STONE_LIGHT)
    + rect(14, 36, 92, 8, STONE)
    + rect(20, 44, 10, 36, PLASTER, 1.5) + rect(42, 44, 10, 36, PLASTER, 1.5) + rect(68, 44, 10, 36, PLASTER, 1.5)
    + rect(90, 44, 10, 36, PLASTER, 1.5) + circle(60, 24, 6, GOLD)),
  S('shrine', 'religion', 48, 56, 'structures',
    shadow(24, 52, 18, 3) + rect(8, 44, 32, 8, STONE, 1.5) + rect(12, 22, 24, 22, STONE_LIGHT)
    + poly('6,24 24,6 42,24', ROOF, 2) + circle(24, 32, 4, GOLD)),
  S('obelisk', 'religion', 26, 80, 'structures',
    shadow(13, 76, 11, 3) + rect(4, 70, 18, 7, STONE, 1.5) + poly('8,70 10,12 13,4 16,12 18,70', STONE_LIGHT)
    + stroke('M13 24 v6 M13 38 v6 M13 52 v6', GOLD, 2)),

  // Decoração
  S('campfire', 'decor', 36, 32, 'decor',
    shadow(18, 27, 14, 3) + stroke('M6 26 L30 20 M6 20 L30 26', WOOD_DARK, 4)
    + path('M18 4 Q26 14 22 22 Q18 26 14 22 Q10 14 18 4 Z', '#e8762a', 1.5)
    + `<path d="M18 11 Q22 17 19 21 Q17 22 16 20 Q15 16 18 11 Z" fill="#ffd25a"/>`),
  S('tent', 'decor', 64, 48, 'decor',
    shadow(32, 44, 28, 4) + poly('4,44 32,6 60,44', '#c9a36a') + poly('32,6 60,44 32,44', '#a3804c', 2)
    + poly('26,44 32,26 38,44', '#3a2a18', 1.5) + stroke('M32 6 V0', INK, 1.5)),
  S('well', 'decor', 40, 44, 'decor',
    shadow(20, 40, 16, 3) + rect(6, 28, 28, 12, STONE) + `<ellipse cx="20" cy="28" rx="14" ry="4" fill="#1d2a33" ${line(1.5)}/>`
    + rect(8, 10, 3, 18, WOOD_DARK, 1.5) + rect(29, 10, 3, 18, WOOD_DARK, 1.5) + poly('4,12 20,2 36,12', ROOF, 1.5)),
  S('barrel', 'decor', 22, 28, 'decor',
    shadow(11, 25, 9, 2) + path('M4 6 Q2 14 4 22 Q11 26 18 22 Q20 14 18 6 Q11 2 4 6 Z', WOOD)
    + stroke('M3 10 Q11 13 19 10 M3 18 Q11 21 19 18', WOOD_DARK, 1.5)),
  S('crate', 'decor', 26, 24, 'decor',
    shadow(13, 21, 11, 2) + rect(3, 3, 20, 18, WOOD) + stroke('M3 3 L23 21 M23 3 L3 21', WOOD_DARK, 1.5)),
  S('fence', 'decor', 80, 28, 'decor',
    stroke('M2 12 H78 M2 20 H78', WOOD, 3) + rect(4, 6, 4, 20, WOOD_DARK, 1.5) + rect(28, 6, 4, 20, WOOD_DARK, 1.5)
    + rect(52, 6, 4, 20, WOOD_DARK, 1.5) + rect(72, 6, 4, 20, WOOD_DARK, 1.5)),
  S('grave', 'decor', 24, 32, 'decor',
    shadow(12, 29, 10, 2) + path('M4 28 V10 A8 8 0 0 1 20 10 V28 Z', STONE_LIGHT) + stroke('M12 10 V20 M8 14 H16', STONE_DARK, 1.5)),

  // Fantasia
  S('portal', 'fantasy', 60, 80, 'effects',
    shadow(30, 75, 24, 4) + path('M8 74 V30 A22 22 0 0 1 52 30 V74 Z', STONE)
    + path('M14 74 V31 A16 16 0 0 1 46 31 V74 Z', ARCANE, 1.5)
    + `<path d="M20 70 V33 A10 10 0 0 1 40 33 V70 Z" fill="${ARCANE_LIGHT}" fill-opacity="0.55"/>`
    + circle(30, 40, 3, '#ffffff', false)),
  S('runeStone', 'fantasy', 34, 50, 'decor',
    shadow(17, 46, 13, 3) + path('M6 46 L4 18 L12 4 L24 6 L30 20 L28 46 Z', STONE)
    + stroke('M16 14 V30 M12 18 L20 24 M14 34 L20 40 M20 34 L14 40', '#7fd8ff', 2)),
  S('magicCircle', 'fantasy', 80, 80, 'effects',
    `<circle cx="40" cy="40" r="36" fill="${ARCANE}" fill-opacity="0.12" stroke="${ARCANE}" stroke-width="2.5"/>`
    + `<circle cx="40" cy="40" r="26" fill="none" stroke="${ARCANE_LIGHT}" stroke-width="1.5"/>`
    + `<polygon points="40,14 62,53 18,53" fill="none" stroke="${ARCANE}" stroke-width="2"/>`
    + `<polygon points="40,66 18,27 62,27" fill="none" stroke="${ARCANE}" stroke-width="2"/>`),
]

const byId = new Map(STAMPS.map(s => [s.id, s]))

export function stampDef(id: string): StampDef | undefined {
  return byId.get(id)
}

/** Tamanho padrão; asset desconhecido (saiu do catálogo) vira um quadrado de marcador. */
export function stampSize(id: string): { w: number; h: number } {
  const def = byId.get(id)
  return def ? { w: def.w, h: def.h } : { w: 48, h: 48 }
}

export function stampSvg(def: StampDef): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${def.w} ${def.h}" width="${def.w}" height="${def.h}">${def.body}</svg>`
}

const urls = new Map<string, string>()

/** Data URL do SVG para `<img>` (miniaturas, arrastar do navegador de assets). */
export function stampUrl(def: StampDef): string {
  let url = urls.get(def.id)
  if (!url) {
    url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(stampSvg(def))}`
    urls.set(def.id, url)
  }
  return url
}
