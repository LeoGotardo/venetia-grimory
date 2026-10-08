import { GlProgram, Mesh, MeshGeometry, Shader, Texture } from 'pixi.js'
import { textureFill } from './areaTextures'
import { TILE_RESOLUTION, materialTexture } from './materials'

/**
 * Mistura por altura ("height blending"), como em editores de mapa e motores de
 * jogo: em vez de um degradê de transparência — onde as duas texturas aparecem
 * pela metade, uma fantasma sobre a outra —, cada pixel da faixa de transição
 * decide quem ganha pela "altura" do próprio desenho. Altura = brilho do pixel
 * relativo à cor média do material: tufos, copas, pedras e cristas (claros)
 * avançam primeiro, e o chão de baixo aparece nos vãos. A borda fica nítida e
 * entrelaçada no formato dos detalhes da textura.
 *
 * Desenhado como malha (quadrilátero com shader próprio), não filtro: as
 * coordenadas do mundo e da máscara vêm dos vértices, então o mesmo shader serve
 * para a tinta assada (render texture) e para a prévia ao vivo (cena).
 */

const vertex = /* glsl */ `
in vec2 aPosition;
in vec2 aUV;

out vec2 vUV;
out vec2 vWorld;

uniform mat3 uProjectionMatrix;
uniform mat3 uWorldTransformMatrix;
uniform mat3 uTransformMatrix;
uniform vec2 uOrigin;

void main(void) {
  mat3 mvp = uProjectionMatrix * uWorldTransformMatrix * uTransformMatrix;
  gl_Position = vec4((mvp * vec3(aPosition, 1.0)).xy, 0.0, 1.0);
  vUV = aUV;
  // Coordenada do mundo: o material repete preso ao mapa, onde quer que o traço comece.
  vWorld = aPosition + uOrigin;
}
`

const fragment = /* glsl */ `
in vec2 vUV;
in vec2 vWorld;

out vec4 finalColor;

uniform sampler2D uMaterial;
uniform sampler2D uMask;
uniform vec2 uTileSize;
uniform float uMeanLum;
uniform float uInfluence;
uniform float uSharpness;
uniform float uOpacity;
uniform vec3 uRimColor;
uniform float uRimStrength;

void main(void) {
  float m = texture(uMask, vUV).a;
  if (m <= 0.002) {
    finalColor = vec4(0.0);
    return;
  }
  vec4 mat = texture(uMaterial, vWorld / uTileSize);
  float lum = dot(mat.rgb, vec3(0.299, 0.587, 0.114));
  float h = clamp(0.5 + (lum - uMeanLum) * 2.5, 0.0, 1.0);
  // A máscara desloca o limiar; a altura decide quem passa primeiro.
  float t = m + (h - 0.5) * uInfluence;
  float a = smoothstep(0.5 - uSharpness, 0.5 + uSharpness, t);
  // Faixa logo dentro da borda: espuma na água, sombra de contato nas matas.
  float rim = 1.0 - smoothstep(0.0, uSharpness * 3.0 + 0.1, abs(t - 0.5));
  vec3 rgb = mix(mat.rgb, uRimColor, rim * uRimStrength);
  a *= uOpacity;
  finalColor = vec4(rgb * a, a);
}
`

let program: GlProgram | null = null

/** Quanto a altura desloca o limiar, e a meia-largura da rampa (em unidades de máscara). */
export const HEIGHT_INFLUENCE = 0.55
export const HEIGHT_SHARPNESS = 0.06

/** Realce da borda por material: espuma clara na água e no gelo, sombra leve nas matas. */
const RIM: Record<string, { color: [number, number, number]; strength: number }> = {
  water: { color: [0.86, 0.94, 0.98], strength: 0.32 },
  deepWater: { color: [0.62, 0.78, 0.88], strength: 0.28 },
  ice: { color: [0.95, 0.98, 1], strength: 0.25 },
  forest: { color: [0.06, 0.08, 0.04], strength: 0.22 },
  jungle: { color: [0.05, 0.08, 0.04], strength: 0.22 },
  darkGrass: { color: [0.05, 0.07, 0.04], strength: 0.12 },
  swamp: { color: [0.08, 0.08, 0.04], strength: 0.15 },
  deadForest: { color: [0.1, 0.08, 0.06], strength: 0.15 },
}

const fallbacks = new Map<string, Texture>()

/** Material ainda baixando: um pixel da cor média segura o lugar. */
function fallbackTexture(id: string): Texture {
  let tex = fallbacks.get(id)
  if (!tex) {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 1
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = textureFill(id)
    ctx.fillRect(0, 0, 1, 1)
    tex = Texture.from(canvas)
    fallbacks.set(id, tex)
  }
  return tex
}

function meanLuminance(id: string): number {
  const n = Number.parseInt(textureFill(id).slice(1), 16)
  return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255
}

export interface HeightBlendOptions {
  /** Material (id) — ignorado na borracha. */
  material: string
  /** Máscara macia do traço (canal alfa), cobrindo exatamente o quadrilátero. */
  mask: Texture
  width: number
  height: number
  /** Posição no mundo do canto (0, 0) do quadrilátero. */
  origin: { x: number; y: number }
  opacity: number
  /** Borracha: só o alfa importa, sem altura nem realce (o blend `erase` fica com o chamador). */
  erase?: boolean
}

export type HeightBlendMesh = Mesh<MeshGeometry, Shader>

/** Quadrilátero com o shader de mistura por altura, a ser posicionado em `origin`. */
export function heightBlendMesh(o: HeightBlendOptions): HeightBlendMesh {
  program ??= GlProgram.from({ vertex, fragment, name: 'area-height-blend' })
  const tex = o.erase ? Texture.WHITE : materialTexture(o.material) ?? fallbackTexture(o.material)
  // Repetição pelo próprio sampler (sem `fract` no shader): não quebra os mipmaps na emenda.
  tex.source.addressMode = 'repeat'
  const rim = (!o.erase && RIM[o.material]) || null
  const shader = new Shader({
    glProgram: program,
    resources: {
      uMaterial: tex.source,
      uMask: o.mask.source,
      blendUniforms: {
        uOrigin: { value: [o.origin.x, o.origin.y], type: 'vec2<f32>' },
        uTileSize: { value: [tex.source.pixelWidth / TILE_RESOLUTION, tex.source.pixelHeight / TILE_RESOLUTION], type: 'vec2<f32>' },
        uMeanLum: { value: o.erase ? 0.5 : meanLuminance(o.material), type: 'f32' },
        uInfluence: { value: o.erase ? 0 : HEIGHT_INFLUENCE, type: 'f32' },
        uSharpness: { value: o.erase ? 0.18 : HEIGHT_SHARPNESS, type: 'f32' },
        uOpacity: { value: o.opacity, type: 'f32' },
        uRimColor: { value: rim?.color ?? [0, 0, 0], type: 'vec3<f32>' },
        uRimStrength: { value: rim?.strength ?? 0, type: 'f32' },
      },
    },
  })
  const geometry = new MeshGeometry({
    positions: new Float32Array([0, 0, o.width, 0, o.width, o.height, 0, o.height]),
    uvs: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
    indices: new Uint32Array([0, 1, 2, 0, 2, 3]),
  })
  return new Mesh({ geometry, shader })
}

/** `Mesh.destroy` solta a geometria e o shader sem destruí-los: os buffers de GPU ficariam a cada traço. */
export function destroyHeightBlend(mesh: HeightBlendMesh) {
  const { geometry, shader } = mesh
  mesh.destroy()
  geometry.destroy(true)
  shader?.destroy()
}
