import { Container, Graphics, BlurFilter, RenderTexture, Sprite, type Renderer } from 'pixi.js'
import type { AreaPaint, AreaRegion } from '../../../types'
import { dabsAlong, strokeSeed } from '../../../lib/gm/areaMap/brush'
import { boundsOf, smooth, type Box } from '../../../lib/gm/areaMap/shapes'
import { brushTipTexture } from './brushTips'
import { destroyHeightBlend, heightBlendMesh, type HeightBlendMesh } from './heightBlend'

/**
 * Tinta raster do mapa de área, como no Inkarnate. Cada camada com pinceladas
 * guarda o resultado numa textura ("assada"); cada traço é composto nela na
 * ordem em que foi feito:
 *
 * 1. máscara: carimbos da ponta do pincel (`dabsAlong`) com blend `max` — a
 *    borda fica macia e não escurece onde os carimbos se sobrepõem;
 * 2. cor: o material, alinhado às coordenadas do mundo, entra pela máscara com
 *    mistura por altura (`heightBlend.ts`) — na borda, os detalhes altos da
 *    textura nova avançam e os vãos deixam ver o que havia, em vez de um degradê
 *    de transparência;
 * 3. borracha: a mesma máscara, com rampa curta e blend `erase`, que só tira
 *    tinta (a textura assada é da camada, o fundo não é tocado).
 *
 * Só traços acrescentados no fim são compostos de novo; desfazer, apagar ou
 * trocar a ordem refaz a camada inteira. O traço em andamento não entra na
 * textura: seus carimbos vão para uma máscara ao vivo, e só os novos a cada
 * movimento.
 */

/** Pixels por unidade de mundo da tinta assada (limitado para caber na GPU de celular). */
export function paintResolution(mapW: number, mapH: number): number {
  return Math.min(1.5, 4096 / Math.max(mapW, mapH))
}

/** Máscaras são macias: meia resolução basta e economiza memória. */
export function maskResolution(mapW: number, mapH: number): number {
  return Math.min(1, 2048 / Math.max(mapW, mapH))
}

function clipToMap(box: Box, mapW: number, mapH: number): Box | null {
  const out = { minX: Math.max(0, Math.floor(box.minX)), minY: Math.max(0, Math.floor(box.minY)), maxX: Math.min(mapW, Math.ceil(box.maxX)), maxY: Math.min(mapH, Math.ceil(box.maxY)) }
  return out.maxX - out.minX < 1 || out.maxY - out.minY < 1 ? null : out
}

/**
 * Sprites de carimbo reaproveitados entre renders: criar e destruir centenas a
 * cada movimento do pincel enchia a coleta de lixo e dava picos de ~50 ms.
 */
const dabPool: Sprite[] = []
const dabBatch = new Container()

/** Desenha os carimbos `from…` do traço numa máscara cuja origem está em `origin`. */
function stampDabs(renderer: Renderer, target: RenderTexture, el: AreaPaint, origin: { x: number; y: number }, from: number, clear: boolean): number {
  const dabs = dabsAlong(el.points, el.size, el.edge, strokeSeed(el.id))
  if (from >= dabs.length && !clear) return dabs.length
  const tip = brushTipTexture(el.edge)
  const count = Math.max(0, dabs.length - from)
  while (dabPool.length < count) {
    const s = new Sprite()
    s.anchor.set(0.5)
    s.blendMode = 'max'
    dabPool.push(s)
  }
  for (let i = 0; i < count; i++) {
    const d = dabs[from + i]
    const s = dabPool[i]
    s.texture = tip
    s.position.set(d.x - origin.x, d.y - origin.y)
    s.width = s.height = el.size * d.scale
    s.rotation = d.rotation
    // Força do pincel fica no shader: na máscara ela empurraria o traço para baixo do limiar.
    s.alpha = 1
    dabBatch.addChild(s)
  }
  renderer.render({ container: dabBatch, target, clear })
  dabBatch.removeChildren()
  return dabs.length
}

interface Live {
  el: AreaPaint
  maskSprite: Sprite
  /** Material com mistura por altura (pincel) ou nada (borracha: a máscara recorta a tinta assada ao contrário). */
  mesh: HeightBlendMesh | null
  drawn: number
}

export class PaintLayer {
  /** Vai no grupo de tinta da camada, por baixo dos outros elementos. */
  readonly view = new Container()
  private baked: RenderTexture | null = null
  private bakedSprite: Sprite | null = null
  private bakedList: AreaPaint[] = []
  private size = { w: 0, h: 0 }
  private live: Live | null = null
  /** Máscara do traço ao vivo, do tamanho do mapa: alocada uma vez e só limpa a cada traço novo. */
  private liveMask: RenderTexture | null = null
  private readonly renderer: Renderer

  constructor(renderer: Renderer) {
    this.renderer = renderer
  }

  /** Põe a camada em dia com as pinceladas (`paints`, em ordem) e o traço ao vivo. */
  sync(paints: AreaPaint[], live: AreaPaint | null, mapW: number, mapH: number) {
    if (paints.length === 0 && !live) {
      this.release()
      return
    }
    if (!this.baked || this.size.w !== mapW || this.size.h !== mapH) this.allocate(mapW, mapH)

    const prefix = this.bakedList.length <= paints.length && this.bakedList.every((p, i) => paints[i] === p)
    if (!prefix) {
      this.renderer.render({ container: new Container(), target: this.baked!, clear: true })
      this.bakedList = []
    }
    for (const el of paints.slice(this.bakedList.length)) this.composite(el)
    this.bakedList = paints.slice()

    if (live) this.updateLive(live)
    else this.stopLive()
  }

  destroy() {
    this.release()
    this.view.destroy({ children: true })
  }

  private allocate(mapW: number, mapH: number) {
    this.release()
    this.size = { w: mapW, h: mapH }
    this.baked = RenderTexture.create({ width: mapW, height: mapH, resolution: paintResolution(mapW, mapH) })
    this.bakedSprite = new Sprite(this.baked)
    this.view.addChild(this.bakedSprite)
    this.bakedList = []
  }

  private release() {
    this.stopLive()
    this.liveMask?.destroy(true)
    this.liveMask = null
    this.bakedSprite?.destroy()
    this.bakedSprite = null
    this.baked?.destroy(true)
    this.baked = null
    this.bakedList = []
  }

  private composite(el: AreaPaint) {
    const box = clipToMap(boundsOf(el.points, el.size * 0.6), this.size.w, this.size.h)
    if (!box || !this.baked) return
    const mask = RenderTexture.create({
      width: box.maxX - box.minX, height: box.maxY - box.minY, resolution: maskResolution(this.size.w, this.size.h),
    })
    stampDabs(this.renderer, mask, el, { x: box.minX, y: box.minY }, 0, true)
    const mesh = heightBlendMesh({
      material: el.texture, mask, width: box.maxX - box.minX, height: box.maxY - box.minY,
      origin: { x: box.minX, y: box.minY }, opacity: el.opacity, erase: el.erase,
    })
    mesh.position.set(box.minX, box.minY)
    if (el.erase) mesh.blendMode = 'erase'
    const holder = new Container()
    holder.addChild(mesh)
    this.renderer.render({ container: holder, target: this.baked, clear: false })
    destroyHeightBlend(mesh)
    holder.destroy()
    mask.destroy(true)
  }

  private updateLive(el: AreaPaint) {
    if (this.live && this.live.el.id !== el.id) this.stopLive()
    if (!this.live) {
      this.liveMask ??= RenderTexture.create({
        width: this.size.w, height: this.size.h, resolution: maskResolution(this.size.w, this.size.h),
      })
      const mask = this.liveMask
      this.renderer.render({ container: new Container(), target: mask, clear: true })
      const maskSprite = new Sprite(mask)
      let mesh: HeightBlendMesh | null = null
      if (el.erase) {
        this.view.addChild(maskSprite)
        this.bakedSprite?.setMask({ mask: maskSprite, channel: 'alpha', inverse: true })
      } else {
        // O mesmo shader da tinta assada: o traço ao vivo já tem a borda que vai ficar.
        mesh = heightBlendMesh({
          material: el.texture, mask, width: this.size.w, height: this.size.h,
          origin: { x: 0, y: 0 }, opacity: el.opacity,
        })
        this.view.addChild(mesh)
      }
      this.live = { el, maskSprite, mesh, drawn: 0 }
    }
    this.live.el = el
    this.live.drawn = stampDabs(this.renderer, this.liveMask!, el, { x: 0, y: 0 }, this.live.drawn, false)
  }

  private stopLive() {
    if (!this.live) return
    // `setMask({ mask: null })` não tira a máscara (só aplica quando há uma); a propriedade tira.
    // Sem isso a tinta ficava presa a uma máscara destruída e todo quadro seguinte quebrava.
    if (this.live.el.erase && this.bakedSprite) this.bakedSprite.mask = null
    if (this.live.mesh) destroyHeightBlend(this.live.mesh)
    this.live.maskSprite.destroy()
    this.live = null
  }
}

/**
 * Região com textura de borda macia: o polígono é desfocado numa máscara e
 * recorta o material, como uma pincelada grande. Devolve o sprite já
 * posicionado (o chamador destrói o anterior quando a região muda).
 */
export function bakeRegion(renderer: Renderer, el: AreaRegion & { texture: string }, mapW: number, mapH: number): Sprite | null {
  const outline = smooth(el.points, 2, true)
  const raw = boundsOf(outline)
  const feather = Math.max(6, Math.min(raw.maxX - raw.minX, raw.maxY - raw.minY) * 0.05)
  const box = boundsOf(outline, feather * 2.5)
  const w = Math.ceil(box.maxX - box.minX)
  const h = Math.ceil(box.maxY - box.minY)
  if (w < 1 || h < 1) return null
  const maskRes = maskResolution(mapW, mapH)
  const mask = RenderTexture.create({ width: w, height: h, resolution: maskRes })
  const shape = new Graphics()
  shape.poly(outline.map((n, i) => n - (i % 2 === 0 ? box.minX : box.minY)), true).fill({ color: 0xffffff })
  shape.filters = [new BlurFilter({ strength: feather * maskRes, quality: 4 })]
  const shapeHolder = new Container()
  shapeHolder.addChild(shape)
  renderer.render({ container: shapeHolder, target: mask, clear: true })
  shapeHolder.destroy({ children: true })

  const color = RenderTexture.create({ width: w, height: h, resolution: paintResolution(mapW, mapH) })
  const holder = new Container()
  // Opacidade da região fica no sprite final; aqui a mistura por altura só desenha a borda.
  const mesh = heightBlendMesh({ material: el.texture, mask, width: w, height: h, origin: { x: box.minX, y: box.minY }, opacity: 1 })
  holder.addChild(mesh)
  renderer.render({ container: holder, target: color, clear: true })
  destroyHeightBlend(mesh)
  holder.destroy()
  mask.destroy(true)

  const sprite = new Sprite(color)
  sprite.position.set(box.minX, box.minY)
  // O sprite é dono da textura: destruí-lo com `{ texture: true }` libera a GPU.
  return sprite
}
