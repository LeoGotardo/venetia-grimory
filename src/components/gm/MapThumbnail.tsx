import { useEffect, useRef } from 'react'
import type { GridMap } from '../../types'
import { terrainOf } from '../../lib/gm/terrain'
import { TERRAIN_STYLE, cellVariant, terrainTile } from './terrainStyle'

/** Até ~960 px de lado: casas grandes o bastante para a textura aparecer na miniatura. */
const MAX_SIDE_PX = 960
const TEXTURE_MIN_PX = 8

/** Miniatura da grade para listas: textura dos terrenos, sem grade nem rótulos. */
export function MapThumbnail({ map }: { map: GridMap }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const px = Math.max(4, Math.min(16, Math.floor(MAX_SIDE_PX / Math.max(map.width, map.height))))

  useEffect(() => {
    const ctx = ref.current?.getContext('2d')
    if (!ctx) return
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const id = terrainOf(map.cells[y * map.width + x]).id
        if (px >= TEXTURE_MIN_PX) {
          ctx.drawImage(terrainTile(id, px, cellVariant(x, y)), x * px, y * px)
        } else {
          ctx.fillStyle = TERRAIN_STYLE[id].fill
          ctx.fillRect(x * px, y * px, px, px)
        }
      }
    }
  }, [map.cells, map.width, map.height, px])

  return (
    <canvas
      ref={ref}
      width={map.width * px}
      height={map.height * px}
      aria-hidden="true"
      className="w-full aspect-[3/2] object-contain rounded-[8px] bg-[#0d0b0a]"
    />
  )
}
