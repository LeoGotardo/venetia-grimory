import { useEffect, useRef } from 'react'
import type { GridMap } from '../../types'
import { terrainOf } from '../../lib/gm/terrain'
import { TERRAIN_STYLE } from './terrainStyle'

const PX = 4

/** Miniatura da grade para a lista de mapas: uma casa = 4 px, sem grade nem rótulos. */
export function MapThumbnail({ map }: { map: GridMap }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const ctx = ref.current?.getContext('2d')
    if (!ctx) return
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        ctx.fillStyle = TERRAIN_STYLE[terrainOf(map.cells[y * map.width + x]).id].fill
        ctx.fillRect(x * PX, y * PX, PX, PX)
      }
    }
  }, [map.cells, map.width, map.height])

  return (
    <canvas
      ref={ref}
      width={map.width * PX}
      height={map.height * PX}
      aria-hidden="true"
      className="w-full aspect-[3/2] object-contain rounded-[8px] bg-[#0d0b0a] [image-rendering:pixelated]"
    />
  )
}
