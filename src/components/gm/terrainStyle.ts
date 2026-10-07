import type { TerrainId } from '../../lib/gm/terrain'

/**
 * Cor e marca de cada terreno no canvas. A marca existe para não depender só
 * de cor (daltonismo, tela ao sol): aparece quando a casa é grande o bastante.
 */
export const TERRAIN_STYLE: Record<TerrainId, { fill: string; glyph: string; glyphColor: string }> = {
  void: { fill: '#0d0b0a', glyph: '', glyphColor: '' },
  floor: { fill: '#4a4138', glyph: '', glyphColor: '' },
  difficult: { fill: '#6b5532', glyph: '∴', glyphColor: '#c9a86a' },
  vegetation: { fill: '#2f5228', glyph: '♣', glyphColor: '#8fcf7a' },
  water: { fill: '#24506e', glyph: '≈', glyphColor: '#8cc4e8' },
  stairs: { fill: '#5d5650', glyph: '≡', glyphColor: '#d8cfc4' },
  door: { fill: '#7d4f22', glyph: '▯', glyphColor: '#f0c690' },
  hazard: { fill: '#7a2a24', glyph: '!', glyphColor: '#ffb4a8' },
  pit: { fill: '#050404', glyph: '◘', glyphColor: '#6b6560' },
  wall: { fill: '#9a9088', glyph: '', glyphColor: '' },
}
