import { Texture } from 'pixi.js'
import type { AreaBrushEdge } from '../../../types'

/**
 * Pontas de pincel em branco com alfa (a cor vem da textura do material na
 * composição). Geradas uma vez por tipo num canvas de `TIP_PX`.
 */

const TIP_PX = 256

/** Ruído de valor 2D com interpolação suave, semente fixa: a ponta orgânica é sempre a mesma. */
function valueNoise(seed: number) {
  const hash = (x: number, y: number) => {
    let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ seed
    h = Math.imul(h ^ (h >>> 13), 1274126177)
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296
  }
  const fade = (t: number) => t * t * (3 - 2 * t)
  return (x: number, y: number) => {
    const x0 = Math.floor(x)
    const y0 = Math.floor(y)
    const fx = fade(x - x0)
    const fy = fade(y - y0)
    const top = hash(x0, y0) + (hash(x0 + 1, y0) - hash(x0, y0)) * fx
    const bottom = hash(x0, y0 + 1) + (hash(x0 + 1, y0 + 1) - hash(x0, y0 + 1)) * fx
    return top + (bottom - top) * fy
  }
}

const smoothstep = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)))
  return t * t * (3 - 2 * t)
}

/** Alfa da ponta em (u, v) ∈ [-1, 1]², com `r` a distância ao centro. */
function tipAlpha(edge: AreaBrushEdge, u: number, v: number, noise: (x: number, y: number) => number): number {
  const r = Math.hypot(u, v)
  if (r >= 1) return 0
  if (edge === 'hard') return 1 - smoothstep(0.86, 1, r)
  // Com a mistura por altura o traço aparece onde a máscara passa de ~0,5: a rampa
  // começa em 0,45 para essa linha ficar perto da borda do círculo do cursor.
  if (edge === 'soft') return 1 - smoothstep(0.45, 1, r)
  // Orgânica: o miolo é cheio, e a beira é recortada por ruído fractal (4 oitavas) —
  // girando a ponta a cada carimbo, a borda do traço fica irregular e macia.
  let n = 0
  let amp = 0.5
  let freq = 2.4
  for (let o = 0; o < 4; o++) {
    n += noise(u * freq + 17, v * freq + 31) * amp
    amp *= 0.5
    freq *= 2.1
  }
  const base = 1 - r
  const ragged = smoothstep(0.02, 0.42, base + (n - 0.47) * 0.62)
  return ragged * (1 - smoothstep(0.9, 1, r))
}

const tips = new Map<AreaBrushEdge, Texture>()

export function brushTipCanvas(edge: AreaBrushEdge): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = TIP_PX
  canvas.height = TIP_PX
  const ctx = canvas.getContext('2d')!
  const img = ctx.createImageData(TIP_PX, TIP_PX)
  const noise = valueNoise(1013)
  for (let y = 0; y < TIP_PX; y++) {
    for (let x = 0; x < TIP_PX; x++) {
      const u = ((x + 0.5) / TIP_PX) * 2 - 1
      const v = ((y + 0.5) / TIP_PX) * 2 - 1
      const i = (y * TIP_PX + x) * 4
      img.data[i] = 255
      img.data[i + 1] = 255
      img.data[i + 2] = 255
      img.data[i + 3] = Math.round(tipAlpha(edge, u, v, noise) * 255)
    }
  }
  ctx.putImageData(img, 0, 0)
  return canvas
}

export function brushTipTexture(edge: AreaBrushEdge): Texture {
  let tex = tips.get(edge)
  if (!tex) {
    tex = Texture.from(brushTipCanvas(edge))
    tips.set(edge, tex)
  }
  return tex
}

const swatches = new Map<AreaBrushEdge, string>()

/** Prévia da ponta para o seletor (data URL). */
export function brushTipSwatch(edge: AreaBrushEdge): string {
  let url = swatches.get(edge)
  if (!url) {
    url = brushTipCanvas(edge).toDataURL()
    swatches.set(edge, url)
  }
  return url
}
