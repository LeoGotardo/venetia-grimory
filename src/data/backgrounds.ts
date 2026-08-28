export type { Antecedente } from './antecedentes/types'
import i18n from '../i18n'
import { ANTECEDENTES as ANTECEDENTES_PT } from './antecedentes/pt'
import { ANTECEDENTES as ANTECEDENTES_EN } from './antecedentes/en'

export function getAntecedentes() {
  return i18n.language === 'pt' ? ANTECEDENTES_PT : ANTECEDENTES_EN
}
