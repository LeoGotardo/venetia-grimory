import { ICONS, ICON_AUTHORS, type IconDef } from './icons.generated'

export { ICONS, ICON_CATEGORIES, ICON_AUTHORS, type IconDef, type IconCategory } from './icons.generated'

/** Licença dos ícones — aparece no editor e nos READMEs (o CC BY exige o crédito). */
export const ICONS_LICENSE = {
  name: 'CC BY 3.0',
  url: 'https://creativecommons.org/licenses/by/3.0/',
  source: 'https://game-icons.net',
  authors: Object.values(ICON_AUTHORS),
}

/** Lado do viewBox dos ícones do game-icons. */
export const ICON_VIEWBOX = 512

const byId = new Map(ICONS.map(i => [i.id, i]))

export function iconDef(id: string): IconDef | undefined {
  return byId.get(id)
}

export function iconSvg(def: IconDef, color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ICON_VIEWBOX} ${ICON_VIEWBOX}"><path fill="${color}" d="${def.d}"/></svg>`
}

const urls = new Map<string, string>()

/** Data URL para `<img>` (navegador de assets, inspector). */
export function iconUrl(def: IconDef, color = '#E8DFD0'): string {
  const key = `${def.id}:${color}`
  let url = urls.get(key)
  if (!url) {
    url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(iconSvg(def, color))}`
    urls.set(key, url)
  }
  return url
}
