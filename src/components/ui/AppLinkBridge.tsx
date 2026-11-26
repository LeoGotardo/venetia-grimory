import { useEffect, useLayoutEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { App as CapacitorApp } from '@capacitor/app'
import type { PluginListenerHandle } from '@capacitor/core'
import { isApp } from '../../lib/platform'
import { roomLinkPath } from '../../lib/roomLink'

/**
 * Link de convite aberto no app Android (App Links, montado dentro do `BrowserRouter`).
 * Com o app fechado o WebView sobe em `/` e o link vem de `getLaunchUrl`; com ele
 * aberto (`singleTask`) chega como `appUrlOpen`.
 */
export function AppLinkBridge() {
  const navigate = useNavigate()
  // O `navigate` muda a cada rota; o efeito roda uma vez só, senão o link de abertura seria reaplicado.
  const latest = useRef(navigate)
  useLayoutEffect(() => {
    latest.current = navigate
  })

  useEffect(() => {
    if (!isApp()) return
    let handle: PluginListenerHandle | null = null
    let cancelled = false
    const open = (url: string | undefined) => {
      const path = url ? roomLinkPath(url) : null
      if (path && !cancelled) latest.current(path)
    }
    void CapacitorApp.getLaunchUrl().then(launch => open(launch?.url))
    void CapacitorApp.addListener('appUrlOpen', event => open(event.url)).then(h => {
      if (cancelled) void h.remove()
      else handle = h
    })
    return () => {
      cancelled = true
      void handle?.remove()
    }
  }, [])

  return null
}
