import { useEffect, useLayoutEffect, useRef } from 'react'
import { pushBackHandler, type BackLayer } from '../lib/backButton'

/**
 * Enquanto `active`, o botão voltar do Android chama `handler` (ver
 * `src/lib/backButton.ts`). O registro só muda com `active`: um handler novo a
 * cada render não pode tirar a página de baixo de um modal aberto depois dela.
 */
export function useBackHandler(active: boolean, handler: () => void, layer: BackLayer = 'overlay') {
  const latest = useRef(handler)
  useLayoutEffect(() => {
    latest.current = handler
  })

  useEffect(() => {
    if (!active) return
    return pushBackHandler(() => latest.current(), layer)
  }, [active, layer])
}
