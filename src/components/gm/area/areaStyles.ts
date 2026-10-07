import { FillPattern, Graphics, Matrix, Text, Texture } from 'pixi.js'
import type { AreaLabel, AreaLabelStyle, AreaLayerId, AreaPaint, AreaPath, AreaPathStyle, AreaRegion } from '../../../types'
import { dashLine, smooth } from '../../../lib/gm/areaMap/shapes'
import { areaTextureTile } from './areaTextures'

/**
 * Como cada tipo de elemento vira desenho no Pixi. Fica separado do palco para
 * o palco só cuidar de sincronizar e de ponteiro.
 */

/** Resolução dos ladrilhos (px por unidade de mundo) — o mesmo do fundo. */
export const TILE_RESOLUTION = 2

const patterns = new Map<string, FillPattern>()

/**
 * Padrão repetido de um material, em coordenadas de mundo: duas pinceladas da
 * mesma textura se emendam sem costura, onde quer que comecem.
 */
export function texturePattern(id: string): FillPattern {
  let pattern = patterns.get(id)
  if (!pattern) {
    pattern = new FillPattern(Texture.from(areaTextureTile(id, TILE_RESOLUTION)), 'repeat')
    pattern.setTransform(new Matrix().scale(1 / TILE_RESOLUTION, 1 / TILE_RESOLUTION))
    patterns.set(id, pattern)
  }
  return pattern
}

/** Materiais de água vão para a camada de água; o resto é terreno. */
export function textureLayer(id: string): AreaLayerId {
  return id === 'water' || id === 'deepWater' || id === 'ice' ? 'water' : 'terrain'
}

const hex = (color: string) => Number.parseInt(color.slice(1), 16)

function trace(g: Graphics, flat: readonly number[]) {
  g.moveTo(flat[0], flat[1])
  for (let i = 2; i + 1 < flat.length; i += 2) g.lineTo(flat[i], flat[i + 1])
}

/**
 * Pincelada: uma passada larga e translúcida por baixo da passada cheia — a
 * borda sai suave sem filtro de desfoque. A borracha usa o mesmo traço com
 * blend `erase` (o grupo de tinta da camada é isolado por um filtro, então ela
 * só apaga tinta).
 */
export function drawPaint(g: Graphics, el: AreaPaint) {
  g.clear()
  g.blendMode = el.erase ? 'erase' : 'normal'
  const line = el.points.length >= 4 ? smooth(el.points, 2) : el.points
  const fill = el.erase ? undefined : texturePattern(el.texture)
  const color = el.erase ? 0xffffff : undefined
  const passes: Array<[number, number]> = [[1.25, 0.45], [1, 1]]
  for (const [k, alpha] of passes) {
    if (line.length < 4) {
      g.circle(line[0], line[1], (el.size * k) / 2).fill(fill ? { fill, alpha } : { color, alpha })
      continue
    }
    trace(g, line)
    g.stroke({ width: el.size * k, alpha, cap: 'round', join: 'round', ...(fill ? { fill } : { color }) })
  }
}

export function drawRegion(g: Graphics, el: AreaRegion) {
  g.clear()
  const outline = smooth(el.points, 2, true)
  g.poly(outline, true)
  if (el.texture) g.fill({ fill: texturePattern(el.texture), alpha: el.opacity })
  else g.fill({ color: hex(el.color), alpha: el.opacity })
  if (!el.border) return
  if (el.texture) {
    g.poly(outline, true).stroke({ width: 3, color: 0x2a1d10, alpha: 0.55, join: 'round' })
    return
  }
  // Território: borda tracejada na cor da região, por cima do preenchimento translúcido.
  for (const dash of dashLine(outline, 22, 12, true)) {
    trace(g, dash)
    g.stroke({ width: 5, color: hex(el.color), alpha: 0.9, cap: 'round', join: 'round' })
  }
}

interface StrokeLook {
  /** Multiplica a largura do caminho. */
  w: number
  color: number
  alpha?: number
  /** Traço e intervalo, em larguras do caminho. */
  dash?: [number, number]
}

/** Cada estilo é uma pilha de passadas, da de baixo para a de cima. */
const PATH_LOOK: Record<AreaPathStyle, StrokeLook[]> = {
  dirtRoad: [{ w: 1.25, color: 0x4a3520, alpha: 0.85 }, { w: 1, color: 0x9a7a4e }],
  stoneRoad: [{ w: 1.3, color: 0x3a3530 }, { w: 1, color: 0x8c8279 }, { w: 0.18, color: 0xc9c0b6, alpha: 0.8, dash: [0.9, 0.9] }],
  trail: [{ w: 1, color: 0x8a6a3e, alpha: 0.9, dash: [1.6, 1.2] }],
  river: [{ w: 1.35, color: 0x24506e }, { w: 1, color: 0x3f7fa8 }, { w: 0.35, color: 0x9fd0ea, alpha: 0.55 }],
  stream: [{ w: 1.4, color: 0x24506e }, { w: 1, color: 0x4f8fb8 }],
  wall: [{ w: 1.3, color: 0x2a1d10 }, { w: 1, color: 0x8c8279 }, { w: 1, color: 0x5f5852, alpha: 0.7, dash: [0.25, 0.9] }],
  border: [{ w: 1, color: 0xb5392f, alpha: 0.9, dash: [3, 2] }],
}

export function drawPath(g: Graphics, el: AreaPath) {
  g.clear()
  const line = smooth(el.points, 2)
  for (const look of PATH_LOOK[el.style]) {
    const width = el.width * look.w
    const parts = look.dash ? dashLine(line, look.dash[0] * el.width, look.dash[1] * el.width) : [line]
    for (const part of parts) {
      trace(g, part)
      g.stroke({ width, color: look.color, alpha: look.alpha ?? 1, cap: 'round', join: 'round' })
    }
  }
}

const LABEL_LOOK: Record<AreaLabelStyle, { family: string; weight: '400' | '600' | '700'; spacing: number; italic?: boolean }> = {
  region: { family: 'Cinzel', weight: '600', spacing: 0.28 },
  city: { family: 'Cinzel', weight: '700', spacing: 0.06 },
  note: { family: 'Manrope', weight: '600', spacing: 0, italic: true },
}

/** Contorno contrastante: texto claro ganha borda escura e vice-versa. */
function outlineFor(color: string): number {
  const n = hex(color)
  const lum = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255
  return lum > 0.55 ? 0x1a1208 : 0xf5f0e8
}

export function labelStyle(el: AreaLabel) {
  const look = LABEL_LOOK[el.style]
  return {
    fontFamily: look.family,
    fontWeight: look.weight,
    fontStyle: look.italic ? 'italic' as const : 'normal' as const,
    fontSize: el.size,
    letterSpacing: el.size * look.spacing,
    fill: hex(el.color),
    stroke: { color: outlineFor(el.color), width: Math.max(2, el.size * 0.14), join: 'round' as const },
    align: 'center' as const,
  }
}

export function applyLabel(node: Text, el: AreaLabel) {
  node.text = el.text
  node.style = labelStyle(el)
  node.anchor.set(0.5)
  node.position.set(el.x, el.y)
  node.angle = el.rotation
}
