import type { TerrainId } from '../../../lib/gm/terrain'
import { TERRAIN_STYLE, mulberry, speckle, stroke, type Painter } from '../terrainStyle'
import { PAINTED_TEXTURE_FILLS } from '../../../data/areaMap/paintedTextures.generated'

/**
 * Materiais do mapa de área (fundo, pincel, regiões). Quem tem imagem pintada
 * em `src/assets/area-textures/` (geradas no Gemini e tratadas por
 * `scripts/areamap/process-textures.sh`) usa a imagem; quem não tem — e todos
 * enquanto a imagem carrega — usa a textura procedural: o desenho de um terreno
 * do mapa de combate (`TERRAIN_STYLE`) num ladrilho de 4×4 casas com sementes
 * diferentes, repetido nas 8 vizinhanças para emendar sem costura.
 */

interface AreaTextureDef {
  id: string
  /** Terreno do mapa de combate cuja textura procedural é usada. */
  terrain?: TerrainId
  fill?: string
  paint?: Painter
}

// Imagens pintadas, com URL (hash do Vite) e fora do bundle JS — só baixam quando usadas.
const paintedFiles = import.meta.glob<string>('../../../assets/area-textures/*.webp', { eager: true, query: '?url', import: 'default' })

interface PaintedTexture {
  url: string
  thumb: string
}

const PAINTED = new Map<string, PaintedTexture>()
for (const [path, url] of Object.entries(paintedFiles)) {
  const file = path.split('/').pop()!
  if (file.endsWith('.thumb.webp')) continue
  const id = file.replace(/\.webp$/, '')
  const thumb = paintedFiles[path.replace(/\.webp$/, '.thumb.webp')]
  if (thumb) PAINTED.set(id, { url, thumb })
}

/** URL da imagem pintada do material, ou `null` se ele só tem a procedural. */
export function paintedTextureUrl(id: string): string | null {
  return PAINTED.get(id)?.url ?? null
}

export const PAINTED_TEXTURE_IDS = [...PAINTED.keys()]

const parchment: Painter = (ctx, s, r) => {
  speckle('rgba(120,90,40,0.12)', 10, 0.05)(ctx, s, r)
  speckle('rgba(255,250,230,0.18)', 6, 0.04)(ctx, s, r)
  ctx.beginPath()
  const y = s * (0.2 + r() * 0.6)
  ctx.moveTo(0, y)
  ctx.bezierCurveTo(s * 0.3, y + s * 0.08, s * 0.7, y - s * 0.08, s, y)
  stroke(ctx, 'rgba(120,90,40,0.10)', Math.max(1, s * 0.02))
}

const magic: Painter = (ctx, s, r) => {
  speckle('rgba(20,10,40,0.35)', 6, 0.06)(ctx, s, r)
  for (let i = 0; i < 3; i++) {
    ctx.beginPath()
    ctx.arc(r() * s, r() * s, s * (0.02 + r() * 0.03), 0, Math.PI * 2)
    ctx.fillStyle = i % 2 ? 'rgba(170,140,255,0.7)' : 'rgba(120,230,255,0.6)'
    ctx.fill()
  }
  ctx.beginPath()
  const x = r() * s
  ctx.moveTo(x, s * 0.2)
  ctx.lineTo(x + s * 0.15, s * 0.5)
  ctx.lineTo(x - s * 0.05, s * 0.8)
  stroke(ctx, 'rgba(160,120,255,0.35)', Math.max(1, s * 0.025))
}

const ash: Painter = (ctx, s, r) => {
  speckle('rgba(0,0,0,0.35)', 8, 0.05)(ctx, s, r)
  speckle('rgba(255,120,40,0.35)', 2, 0.03)(ctx, s, r)
}

/** Ordem da paleta: por família (relva, mata, chão, pedra, frio, água, fogo, magia, papel). */
export const AREA_TEXTURES: readonly AreaTextureDef[] = [
  { id: 'grass', terrain: 'grass' },
  { id: 'darkGrass', terrain: 'grass' },
  { id: 'dryGrass', terrain: 'grass' },
  { id: 'forest', terrain: 'vegetation' },
  { id: 'jungle', terrain: 'vegetation' },
  { id: 'deadForest', terrain: 'rubble' },
  { id: 'swamp', terrain: 'mud' },
  { id: 'dirt', terrain: 'dirt' },
  { id: 'mud', terrain: 'mud' },
  { id: 'sand', terrain: 'sand' },
  { id: 'rock', terrain: 'rubble' },
  { id: 'stone', terrain: 'floor' },
  { id: 'snow', terrain: 'snow' },
  { id: 'ice', terrain: 'ice' },
  { id: 'water', terrain: 'water' },
  { id: 'deepWater', terrain: 'deepWater' },
  { id: 'ash', fill: '#3a3330', paint: ash },
  { id: 'volcanicRock', terrain: 'rubble' },
  { id: 'magic', fill: '#2c2342', paint: magic },
  { id: 'parchment', fill: '#c9b48a', paint: parchment },
]

export const AREA_TEXTURE_IDS = AREA_TEXTURES.map(t => t.id)

const byId = new Map(AREA_TEXTURES.map(t => [t.id, t]))

/** Cor lisa do material (miniatura, carregamento): a média da imagem pintada, ou a da procedural. */
export function textureFill(id: string): string {
  const def = byId.get(id) ?? byId.get('grass')!
  return PAINTED_TEXTURE_FILLS[def.id] ?? def.fill ?? TERRAIN_STYLE[def.terrain!].fill
}

/** Casas por lado em um ladrilho. */
const CELLS = 4
/** Tamanho de uma casa no ladrilho, em unidades de mundo. */
export const AREA_TEXTURE_CELL = 48

const tiles = new Map<string, HTMLCanvasElement>()

/**
 * Ladrilho sem emenda de `CELLS × CELLS` casas, em `resolution` px por unidade.
 * Cada elemento é desenhado também deslocado de ±1 ladrilho, então o que vaza
 * por uma borda reaparece na oposta.
 */
export function areaTextureTile(id: string, resolution = 2): HTMLCanvasElement {
  const key = `${id}:${resolution}`
  const cached = tiles.get(key)
  if (cached) return cached
  const def = byId.get(id) ?? byId.get('grass')!
  const cell = AREA_TEXTURE_CELL * resolution
  const size = cell * CELLS
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = textureFill(def.id)
  ctx.fillRect(0, 0, size, size)
  const paint = def.paint ?? TERRAIN_STYLE[def.terrain!].paint

  // Manchas largas de luz e sombra quebram a repetição que a grade de casas deixaria ver.
  const r0 = mulberry(def.id.length * 7919 + 13)
  for (let i = 0; i < 6; i++) {
    const cx = r0() * size
    const cy = r0() * size
    const rad = size * (0.15 + r0() * 0.2)
    const light = i % 2 === 0
    for (const ox of [-size, 0, size]) {
      for (const oy of [-size, 0, size]) {
        const g = ctx.createRadialGradient(cx + ox, cy + oy, 0, cx + ox, cy + oy, rad)
        g.addColorStop(0, light ? 'rgba(255,245,220,0.07)' : 'rgba(0,0,0,0.10)')
        g.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = g
        ctx.fillRect(0, 0, size, size)
      }
    }
  }

  if (paint) {
    for (let cy = 0; cy < CELLS; cy++) {
      for (let cx = 0; cx < CELLS; cx++) {
        const seed = (cy * CELLS + cx) * 977 + def.id.length * 131 + 7
        for (const ox of [-size, 0, size]) {
          for (const oy of [-size, 0, size]) {
            ctx.save()
            ctx.translate(cx * cell + ox, cy * cell + oy)
            paint(ctx, cell, mulberry(seed))
            ctx.restore()
          }
        }
      }
    }
  }
  tiles.set(key, canvas)
  return canvas
}

const swatches = new Map<string, string>()

/** Amostra para a paleta: a miniatura da imagem pintada ou, sem ela, a procedural (data URL). */
export function areaTextureSwatch(id: string): string {
  const painted = PAINTED.get(id)
  if (painted) return painted.thumb
  let url = swatches.get(id)
  if (!url) {
    url = areaTextureTile(id, 1).toDataURL()
    swatches.set(id, url)
  }
  return url
}
