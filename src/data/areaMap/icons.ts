import { ICONS, type IconDef } from './icons.generated'

export { ICONS, ICON_CATEGORIES, ICON_AUTHORS, type IconDef, type IconCategory } from './icons.generated'
export { ICONS_LICENSE } from './iconsLicense'

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
