export type { Background } from './backgrounds/types'
import i18n from '../i18n'
import { BACKGROUNDS as BACKGROUNDS_PT } from './backgrounds/pt'
import { BACKGROUNDS as BACKGROUNDS_EN } from './backgrounds/en'

export function getBackgrounds() {
  return i18n.language === 'pt' ? BACKGROUNDS_PT : BACKGROUNDS_EN
}
