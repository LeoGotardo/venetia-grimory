import { useSyncExternalStore } from 'react'

/** `true` enquanto a media query casar — acompanha giro de tela e redimensionamento. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    onChange => {
      const list = matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    () => matchMedia(query).matches,
    () => false,
  )
}
