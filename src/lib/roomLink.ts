import { ROOM_API_URL_APP } from '../constants'
import { isRoomCode, normalizeRoomCode } from './room/code'

/**
 * Link de convite da sala. Sempre o domínio de produção (site e API moram no mesmo):
 * no app a origem é `https://localhost` e no desktop `app://venetia`, que não abrem
 * em outro aparelho. O mesmo host está no intent-filter do AndroidManifest e no
 * `public/.well-known/assetlinks.json` — com o app instalado o Android abre o app,
 * sem ele (ou no PC) abre o site.
 */
export function roomInviteUrl(code: string): string {
  return `${ROOM_API_URL_APP}/sala/${code}`
}

/**
 * Rota da sala de um link aberto no app (`appUrlOpen` / launch URL), ou null.
 * Qualquer app pode disparar o intent, então só passa `/sala/<código válido>`.
 */
export function roomLinkPath(url: string): string | null {
  try {
    const match = /^\/sala\/([^/]+)\/?$/.exec(new URL(url).pathname)
    if (!match) return null
    const code = normalizeRoomCode(decodeURIComponent(match[1]))
    return isRoomCode(code) ? `/sala/${code}` : null
  } catch {
    return null
  }
}
