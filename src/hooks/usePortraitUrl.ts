import { useEffect, useMemo, useState } from 'react'
import type { Portrait } from '../lib/portrait/options'

type Renderer = typeof import('../lib/portrait/render')

let loading: Promise<Renderer> | null = null
let loaded: Renderer | null = null

/** O renderizador traz o Open Peeps (pesado): só carrega quando um retrato aparece, uma vez por sessão. */
export function loadPortraitRenderer(): Promise<Renderer> {
  loading ??= import('../lib/portrait/render').then(m => (loaded = m))
  return loading
}

/** O renderizador já carregado, ou null; re-renderiza quando ele chega. */
export function usePortraitRenderer(): Renderer | null {
  const [ready, setReady] = useState(loaded != null)
  useEffect(() => {
    if (!ready) void loadPortraitRenderer().then(() => setReady(true))
  }, [ready])
  return ready ? loaded : null
}

/** Data URL do retrato, ou null enquanto o desenho carrega. */
export function usePortraitUrl(portrait: Portrait): string | null {
  const renderer = usePortraitRenderer()
  const key = JSON.stringify(portrait)
  return useMemo(() => (renderer ? renderer.portraitDataUrl(JSON.parse(key) as Portrait) : null), [renderer, key])
}
