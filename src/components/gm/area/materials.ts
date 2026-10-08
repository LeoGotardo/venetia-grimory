import { Assets, Texture } from 'pixi.js'
import type { AreaMap } from '../../../types'
import { areaTextureTile, paintedTextureUrl } from './areaTextures'

/**
 * Texturas de material para o Pixi. A procedural sai na hora (canvas); a pintada
 * baixa sob demanda — `materialTexture` devolve `null` até ela chegar, e quem
 * desenha usa a cor média no lugar e pede de novo depois de `loadMaterials`.
 * As duas têm a mesma densidade (2 px por unidade de mundo), então usam a mesma
 * escala de ladrilho.
 */

/** Pixels de textura por unidade de mundo, iguais na procedural e na pintada (1024 px = 512 unidades). */
export const TILE_RESOLUTION = 2

const ready = new Map<string, Texture>()
const pending = new Map<string, Promise<void>>()

function procedural(id: string): Texture {
  const tex = Texture.from(areaTextureTile(id, TILE_RESOLUTION))
  ready.set(id, tex)
  return tex
}

/** Textura pronta do material, ou `null` se a imagem pintada ainda está baixando (já pede). */
export function materialTexture(id: string): Texture | null {
  const tex = ready.get(id)
  if (tex) return tex
  if (!paintedTextureUrl(id)) return procedural(id)
  void loadMaterial(id)
  return null
}

export function isMaterialReady(id: string): boolean {
  return ready.has(id) || !paintedTextureUrl(id)
}

export function loadMaterial(id: string): Promise<void> {
  if (isMaterialReady(id)) return Promise.resolve()
  let job = pending.get(id)
  if (!job) {
    job = Assets.load<Texture>({ src: paintedTextureUrl(id)!, data: { autoGenerateMipmaps: true } })
      // Mipmaps: afastado, a imagem de 1024 px encolhe muito e sem eles cintila.
      .then(tex => {
        ready.set(id, tex)
      })
      .catch(err => {
        // Sem a imagem (offline, arquivo faltando), a procedural segura o lugar.
        console.error(`[materials] Falha ao carregar a textura ${id}; usando a procedural.`, err)
        procedural(id)
      })
      .finally(() => pending.delete(id))
    pending.set(id, job)
  }
  return job
}

export function loadMaterials(ids: Iterable<string>): Promise<void> {
  return Promise.all([...ids].map(loadMaterial)).then(() => undefined)
}

/** Materiais que o mapa desenha: fundo, pinceladas e regiões com textura. */
export function usedMaterials(map: AreaMap): Set<string> {
  const ids = new Set<string>([map.background.texture])
  for (const el of map.elements) {
    if (el.kind === 'paint' && !el.erase) ids.add(el.texture)
    if (el.kind === 'region' && el.texture) ids.add(el.texture)
  }
  return ids
}
