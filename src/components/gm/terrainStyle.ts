import type { TerrainId } from '../../lib/gm/terrain'

/**
 * Aparência de cada terreno no canvas. `fill` é a cor lisa (miniatura, zoom
 * muito afastado); `paint` desenha a textura de uma casa — o padrão é o que
 * distingue os terrenos sem depender só da cor (daltonismo, tela ao sol).
 * Cada casa sorteia uma de VARIANTS versões pela posição, para o chão não
 * parecer carimbado.
 */

type Rand = () => number
type Painter = (ctx: CanvasRenderingContext2D, s: number, r: Rand) => void

interface TerrainLook {
  fill: string
  paint?: Painter
}

export const VARIANTS = 4

function speckle(color: string, count: number, size: number): Painter {
  return (ctx, s, r) => {
    ctx.fillStyle = color
    for (let i = 0; i < count; i++) ctx.fillRect(r() * s, r() * s, s * size, s * size)
  }
}

function stroke(ctx: CanvasRenderingContext2D, color: string, width: number) {
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.lineCap = 'round'
  ctx.stroke()
}

function blob(ctx: CanvasRenderingContext2D, cx: number, cy: number, rad: number, r: Rand, points = 7) {
  ctx.beginPath()
  for (let i = 0; i < points; i++) {
    const a = (i / points) * Math.PI * 2
    const k = rad * (0.75 + r() * 0.35)
    const x = cx + Math.cos(a) * k
    const y = cy + Math.sin(a) * k
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
}

const flagstone: Painter = (ctx, s, r) => {
  speckle('rgba(0,0,0,0.12)', 6, 0.05)(ctx, s, r)
  ctx.beginPath()
  const split = s * (0.35 + r() * 0.3)
  if (r() < 0.5) {
    ctx.moveTo(split, 0)
    ctx.lineTo(split, s)
  } else {
    ctx.moveTo(0, split)
    ctx.lineTo(s, split)
  }
  stroke(ctx, 'rgba(0,0,0,0.22)', Math.max(1, s * 0.03))
}

const planks = (dir: 'h' | 'v'): Painter => (ctx, s, r) => {
  ctx.beginPath()
  for (let i = 1; i < 3; i++) {
    const p = (s / 3) * i
    if (dir === 'h') {
      ctx.moveTo(0, p)
      ctx.lineTo(s, p)
    } else {
      ctx.moveTo(p, 0)
      ctx.lineTo(p, s)
    }
  }
  stroke(ctx, 'rgba(30,18,8,0.55)', Math.max(1, s * 0.035))
  ctx.beginPath()
  const seam = r() * s
  if (dir === 'h') {
    ctx.moveTo(seam, s / 3)
    ctx.lineTo(seam, (2 * s) / 3)
  } else {
    ctx.moveTo(s / 3, seam)
    ctx.lineTo((2 * s) / 3, seam)
  }
  stroke(ctx, 'rgba(30,18,8,0.45)', Math.max(1, s * 0.03))
}

const grassTufts = (color: string): Painter => (ctx, s, r) => {
  ctx.beginPath()
  for (let i = 0; i < 5; i++) {
    const x = r() * s
    const y = s * 0.2 + r() * s * 0.75
    const h = s * (0.12 + r() * 0.1)
    ctx.moveTo(x, y)
    ctx.lineTo(x - h * 0.4, y - h)
    ctx.moveTo(x, y)
    ctx.lineTo(x + h * 0.4, y - h)
  }
  stroke(ctx, color, Math.max(1, s * 0.035))
}

const waves = (color: string): Painter => (ctx, s, r) => {
  ctx.beginPath()
  for (let row = 0; row < 2; row++) {
    const y = s * (0.3 + row * 0.4) + (r() - 0.5) * s * 0.1
    const x0 = r() * s * 0.25
    ctx.moveTo(x0, y)
    ctx.quadraticCurveTo(x0 + s * 0.15, y - s * 0.1, x0 + s * 0.3, y)
    ctx.quadraticCurveTo(x0 + s * 0.45, y + s * 0.1, x0 + s * 0.6, y)
  }
  stroke(ctx, color, Math.max(1, s * 0.045))
}

const stones = (color: string, shade: string, count: number, size: number): Painter => (ctx, s, r) => {
  for (let i = 0; i < count; i++) {
    blob(ctx, s * (0.15 + r() * 0.7), s * (0.15 + r() * 0.7), s * size * (0.6 + r() * 0.6), r, 6)
    ctx.fillStyle = color
    ctx.fill()
    ctx.strokeStyle = shade
    ctx.lineWidth = Math.max(1, s * 0.03)
    ctx.stroke()
  }
}

/** Contorno grande ocupando a casa (árvore, rocha, pilar) sobre um chão. */
const onGround = (ground: string, top: Painter): Painter => (ctx, s, r) => {
  ctx.fillStyle = ground
  ctx.fillRect(0, 0, s, s)
  top(ctx, s, r)
}

export const TERRAIN_STYLE: Record<TerrainId, TerrainLook> = {
  void: { fill: '#0d0b0a' },
  floor: { fill: '#4d443b', paint: flagstone },
  wood: { fill: '#6b4b2d', paint: planks('h') },
  dirt: { fill: '#5b4630', paint: (ctx, s, r) => {
    speckle('rgba(30,20,10,0.35)', 7, 0.06)(ctx, s, r)
    speckle('rgba(200,170,120,0.18)', 4, 0.05)(ctx, s, r)
  } },
  grass: { fill: '#3f5e2b', paint: grassTufts('rgba(150,200,100,0.55)') },
  sand: { fill: '#a88f5e', paint: (ctx, s, r) => {
    speckle('rgba(90,70,30,0.3)', 9, 0.035)(ctx, s, r)
    ctx.beginPath()
    const y = s * (0.3 + r() * 0.4)
    ctx.moveTo(s * 0.1, y)
    ctx.quadraticCurveTo(s * 0.5, y - s * 0.12, s * 0.9, y)
    stroke(ctx, 'rgba(255,240,200,0.25)', Math.max(1, s * 0.03))
  } },

  difficult: { fill: '#6b5532', paint: stones('#8c7450', 'rgba(0,0,0,0.35)', 3, 0.09) },
  rubble: { fill: '#55504a', paint: stones('#857c72', 'rgba(0,0,0,0.45)', 5, 0.12) },
  mud: { fill: '#4a3923', paint: (ctx, s, r) => {
    // Poças rasas: elipse escura com brilho de água na borda de cima.
    for (let i = 0; i < 2; i++) {
      const cx = s * (0.28 + r() * 0.44)
      const cy = s * (0.28 + r() * 0.44)
      const rx = s * (0.16 + r() * 0.1)
      ctx.beginPath()
      ctx.ellipse(cx, cy, rx, rx * 0.55, 0, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(28,20,10,0.6)'
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(cx, cy, rx * 0.8, rx * 0.4, 0, Math.PI * 1.1, Math.PI * 1.7)
      stroke(ctx, 'rgba(200,180,140,0.35)', Math.max(1, s * 0.025))
    }
  } },
  snow: { fill: '#cfd6da', paint: (ctx, s, r) => {
    speckle('rgba(90,110,130,0.35)', 6, 0.04)(ctx, s, r)
    ctx.beginPath()
    const y = s * (0.4 + r() * 0.3)
    ctx.moveTo(0, y)
    ctx.quadraticCurveTo(s * 0.5, y - s * 0.15, s, y)
    stroke(ctx, 'rgba(120,140,160,0.35)', Math.max(1, s * 0.03))
  } },
  ice: { fill: '#8fb9cf', paint: (ctx, s, r) => {
    ctx.beginPath()
    const x = r() * s
    ctx.moveTo(x, 0)
    ctx.lineTo(x + s * 0.2, s * 0.45)
    ctx.lineTo(x - s * 0.1, s)
    ctx.moveTo(x + s * 0.2, s * 0.45)
    ctx.lineTo(s, s * (0.3 + r() * 0.4))
    stroke(ctx, 'rgba(240,250,255,0.75)', Math.max(1, s * 0.03))
  } },
  vegetation: { fill: '#2b4a24', paint: (ctx, s, r) => {
    for (let i = 0; i < 4; i++) {
      ctx.beginPath()
      ctx.arc(s * (0.2 + r() * 0.6), s * (0.2 + r() * 0.6), s * (0.12 + r() * 0.08), 0, Math.PI * 2)
      ctx.fillStyle = i % 2 ? 'rgba(120,180,90,0.55)' : 'rgba(70,120,55,0.8)'
      ctx.fill()
    }
  } },
  furniture: { fill: '#6b4b2d', paint: (ctx, s) => {
    planks('h')(ctx, s, () => 0.5)
    ctx.fillStyle = '#8a6238'
    ctx.fillRect(s * 0.15, s * 0.2, s * 0.7, s * 0.6)
    ctx.strokeStyle = 'rgba(25,14,4,0.8)'
    ctx.lineWidth = Math.max(1, s * 0.05)
    ctx.strokeRect(s * 0.15, s * 0.2, s * 0.7, s * 0.6)
  } },

  water: { fill: '#2a5878', paint: waves('rgba(170,215,240,0.55)') },
  deepWater: { fill: '#16344d', paint: waves('rgba(110,160,200,0.45)') },
  bridge: { fill: '#2a5878', paint: (ctx, s, r) => {
    ctx.fillStyle = '#7a5532'
    ctx.fillRect(0, s * 0.1, s, s * 0.8)
    planks('v')(ctx, s, r)
    ctx.fillStyle = 'rgba(30,18,8,0.7)'
    ctx.fillRect(0, s * 0.1, s, Math.max(1, s * 0.06))
    ctx.fillRect(0, s * 0.84, s, Math.max(1, s * 0.06))
  } },

  wall: { fill: '#8c8279', paint: (ctx, s) => {
    // Alvenaria: duas fiadas de tijolo, meia peça deslocada.
    ctx.beginPath()
    ctx.moveTo(0, s / 2)
    ctx.lineTo(s, s / 2)
    ctx.moveTo(s / 2, 0)
    ctx.lineTo(s / 2, s / 2)
    ctx.moveTo(s * 0.15, s / 2)
    ctx.lineTo(s * 0.15, s)
    ctx.moveTo(s * 0.75, s / 2)
    ctx.lineTo(s * 0.75, s)
    stroke(ctx, 'rgba(40,34,30,0.55)', Math.max(1, s * 0.04))
    ctx.fillStyle = 'rgba(255,250,240,0.12)'
    ctx.fillRect(0, 0, s, Math.max(1, s * 0.06))
  } },
  pillar: { fill: '#4d443b', paint: onGround('#4d443b', (ctx, s) => {
    ctx.beginPath()
    ctx.arc(s / 2, s / 2, s * 0.38, 0, Math.PI * 2)
    ctx.fillStyle = '#9a9088'
    ctx.fill()
    ctx.strokeStyle = 'rgba(30,26,22,0.8)'
    ctx.lineWidth = Math.max(1, s * 0.06)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(s * 0.42, s * 0.42, s * 0.14, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,250,240,0.25)'
    ctx.fill()
  }) },
  door: { fill: '#4d443b', paint: onGround('#4d443b', (ctx, s) => {
    ctx.fillStyle = '#8a5a2b'
    ctx.fillRect(s * 0.08, s * 0.3, s * 0.84, s * 0.4)
    ctx.strokeStyle = 'rgba(30,16,4,0.85)'
    ctx.lineWidth = Math.max(1, s * 0.05)
    ctx.strokeRect(s * 0.08, s * 0.3, s * 0.84, s * 0.4)
    ctx.beginPath()
    ctx.arc(s * 0.75, s / 2, Math.max(1, s * 0.05), 0, Math.PI * 2)
    ctx.fillStyle = '#e8c25a'
    ctx.fill()
  }) },
  stairs: { fill: '#5f5852', paint: (ctx, s) => {
    for (let i = 0; i < 4; i++) {
      const y = (s / 4) * i
      ctx.fillStyle = `rgba(255,250,240,${0.05 + i * 0.05})`
      ctx.fillRect(0, y, s, s / 4)
    }
    ctx.beginPath()
    for (let i = 1; i < 4; i++) {
      ctx.moveTo(0, (s / 4) * i)
      ctx.lineTo(s, (s / 4) * i)
    }
    stroke(ctx, 'rgba(20,18,16,0.6)', Math.max(1, s * 0.04))
  } },
  tree: { fill: '#2f4a22', paint: onGround('#3f5e2b', (ctx, s, r) => {
    // Copa vista de cima: cachos de folhas sobrepostos, sombra embaixo, luz em cima.
    const lobes = Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI * 2 + r() * 0.5
      return [s / 2 + Math.cos(a) * s * 0.2, s / 2 + Math.sin(a) * s * 0.2, s * (0.2 + r() * 0.06)] as const
    })
    ctx.fillStyle = 'rgba(10,20,6,0.45)'
    for (const [x, y, rad] of lobes) {
      ctx.beginPath()
      ctx.arc(x + s * 0.04, y + s * 0.05, rad, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.fillStyle = '#2a4a1f'
    for (const [x, y, rad] of lobes) {
      ctx.beginPath()
      ctx.arc(x, y, rad, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.fillStyle = 'rgba(130,180,90,0.4)'
    for (const [x, y, rad] of lobes.slice(3)) {
      ctx.beginPath()
      ctx.arc(x - rad * 0.25, y - rad * 0.3, rad * 0.45, 0, Math.PI * 2)
      ctx.fill()
    }
  }) },
  boulder: { fill: '#6b655e', paint: onGround('#5b4630', (ctx, s, r) => {
    blob(ctx, s / 2, s * 0.53, s * 0.42, r, 8)
    ctx.fillStyle = '#7d766e'
    ctx.fill()
    ctx.strokeStyle = 'rgba(20,18,16,0.8)'
    ctx.lineWidth = Math.max(1, s * 0.05)
    ctx.stroke()
    blob(ctx, s * 0.42, s * 0.42, s * 0.15, r, 6)
    ctx.fillStyle = 'rgba(255,250,240,0.22)'
    ctx.fill()
  }) },

  hazard: { fill: '#6e2620', paint: (ctx, s) => {
    ctx.save()
    ctx.beginPath()
    ctx.rect(0, 0, s, s)
    ctx.clip()
    ctx.beginPath()
    for (let i = -1; i < 3; i++) {
      ctx.moveTo(i * s * 0.5, s)
      ctx.lineTo(i * s * 0.5 + s, 0)
    }
    stroke(ctx, 'rgba(255,170,150,0.28)', s * 0.12)
    ctx.restore()
    ctx.fillStyle = '#ffd2c8'
    ctx.font = `700 ${Math.round(s * 0.55)}px system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('!', s / 2, s / 2 + s * 0.03)
  } },
  lava: { fill: '#7a1f0c', paint: (ctx, s, r) => {
    ctx.beginPath()
    const y = r() * s
    ctx.moveTo(0, y)
    ctx.lineTo(s * 0.4, y + (r() - 0.5) * s * 0.5)
    ctx.lineTo(s, r() * s)
    ctx.moveTo(s * 0.4, y + (r() - 0.5) * s * 0.3)
    ctx.lineTo(s * (0.3 + r() * 0.4), s)
    stroke(ctx, '#ffb020', Math.max(1.5, s * 0.08))
    ctx.beginPath()
    ctx.arc(r() * s, r() * s, s * 0.08, 0, Math.PI * 2)
    ctx.fillStyle = '#ffe28a'
    ctx.fill()
  } },
  pit: { fill: '#050404', paint: (ctx, s) => {
    const g = ctx.createRadialGradient(s / 2, s / 2, s * 0.1, s / 2, s / 2, s * 0.7)
    g.addColorStop(0, '#000')
    g.addColorStop(1, '#2a221c')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, s, s)
  } },
}

function mulberry(seed: number): Rand {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Variante estável por casa: o mesmo mapa desenha sempre igual. */
export function cellVariant(x: number, y: number): number {
  return (((x * 73856093) ^ (y * 19349663)) >>> 0) % VARIANTS
}

const tiles = new Map<string, HTMLCanvasElement>()

/**
 * Ladrilho pronto de um terreno em `px` pixels (já multiplicado pelo DPR).
 * O canvas copia ladrilhos em vez de redesenhar a textura de cada casa.
 */
export function terrainTile(id: TerrainId, px: number, variant: number): HTMLCanvasElement {
  const size = Math.max(4, Math.round(px))
  const key = `${id}:${size}:${variant}`
  const cached = tiles.get(key)
  if (cached) return cached
  // O zoom gera tamanhos novos; sem limite o cache cresceria sem parar.
  if (tiles.size > 600) tiles.clear()
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const look = TERRAIN_STYLE[id]
  ctx.fillStyle = look.fill
  ctx.fillRect(0, 0, size, size)
  look.paint?.(ctx, size, mulberry(variant * 977 + id.length * 131 + 7))
  tiles.set(key, canvas)
  return canvas
}

const swatches = new Map<TerrainId, string>()

/** Amostra da paleta (data URL), desenhada uma vez por terreno. */
export function terrainSwatch(id: TerrainId): string {
  let url = swatches.get(id)
  if (!url) {
    url = terrainTile(id, 48, 1).toDataURL()
    swatches.set(id, url)
  }
  return url
}
