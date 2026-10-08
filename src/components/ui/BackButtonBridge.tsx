import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { App as CapacitorApp } from '@capacitor/app'
import type { PluginListenerHandle } from '@capacitor/core'
import { isApp } from '../../lib/platform'
import { parentPath, runBackHandler } from '../../lib/backButton'

/**
 * Liga o botão voltar do Android às telas (montado dentro do `BrowserRouter`).
 * Com um listener registrado, o plugin deixa de fechar o app e a decisão fica aqui.
 */
export function BackButtonBridge() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const latest = useRef({ navigate, pathname })
  useLayoutEffect(() => {
    latest.current = { navigate, pathname }
  })

  useEffect(() => {
    if (!isApp()) return
    let handle: PluginListenerHandle | null = null
    let cancelled = false
    void CapacitorApp.addListener('backButton', () => {
      if (runBackHandler()) return
      const up = parentPath(latest.current.pathname)
      // Na tela inicial o voltar faz o que o Android faz com a Activity raiz: vai
      // para segundo plano, sem matar o processo nem perder o estado.
      if (up == null) {
        void CapacitorApp.minimizeApp()
        return
      }
      // `idx` é o índice que o React Router guarda no histórico: 0 = o app abriu nesta rota.
      const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0
      if (idx > 0) latest.current.navigate(-1)
      else latest.current.navigate(up, { replace: true })
    }).then(h => {
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
