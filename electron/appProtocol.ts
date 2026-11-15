import path from 'node:path'
import { DESKTOP_HOST } from '../src/lib/desktopBridge'

/**
 * Qual arquivo de `dist/` responde a uma URL `app://venetia/…` — puro, para o
 * teste. Segue o `vercel.json`: caminho sem extensão é rota do app e volta o
 * `index.html` (o `BrowserRouter` cuida do resto, inclusive ao recarregar
 * `/ficha/:id`); arquivo com extensão que não existe é 404, não o index.
 */
export type AppAsset = { kind: 'file'; path: string } | { kind: 'not-found' }

const NOT_FOUND: AppAsset = { kind: 'not-found' }

export function resolveAppAsset(root: string, requestUrl: string, isFile: (file: string) => boolean): AppAsset {
  let url: URL
  try {
    url = new URL(requestUrl)
  } catch {
    return NOT_FOUND
  }
  if (url.host !== DESKTOP_HOST) return NOT_FOUND

  let pathname: string
  try {
    pathname = decodeURIComponent(url.pathname)
  } catch {
    return NOT_FOUND
  }
  if (pathname.includes('\0')) return NOT_FOUND

  // `join` resolve os `..`; o que sair da raiz não é servido.
  const file = path.join(root, pathname)
  const relative = path.relative(root, file)
  if (relative.startsWith('..') || path.isAbsolute(relative)) return NOT_FOUND

  if (relative !== '' && isFile(file)) return { kind: 'file', path: file }
  if (path.extname(pathname) === '') return { kind: 'file', path: path.join(root, 'index.html') }
  return NOT_FOUND
}
