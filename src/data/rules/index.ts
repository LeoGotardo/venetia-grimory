import type { GameData } from '../../types/gameData'
import i18n from '../../i18n'
import { translateData } from './translation'

import meta from './meta'
import skills from './skills'
import languages from './languages'
import classes from './classes'
import species from './species'
import backgrounds from './backgrounds'
import suggested_abilities_by_class from './suggested_abilities'
import armors from './armors'
import origin_feats from './origin_feats'
import general_feats from './general_feats'
import fighting_styles from './fighting_styles'
import divine_orders from './divine_orders'
import primal_orders from './primal_orders'
import favored_enemies from './favored_enemies'

/**
 * Dados canônicos, sempre em português. É a fonte das regras: cálculos e store
 * comparam strings como 'Leve' ou 'Escudo', que não podem variar com o idioma.
 */
export const gameDataPt: GameData = {
  meta,
  skills,
  languages,
  classes,
  species,
  backgrounds,
  suggested_abilities_by_class,
  armors,
  origin_feats,
  general_feats,
  fighting_styles,
  divine_orders,
  primal_orders,
  favored_enemies,
} as unknown as GameData

/** Dados no idioma da interface. Use na UI; as regras usam `dadosPT`. */
export function getGameData(): GameData {
  return translateData(gameDataPt, i18n.language)
}

/**
 * Mesma forma de `dadosPT`, mas resolvido no idioma atual a cada leitura —
 * assim os componentes já existentes continuam usando `dados.classes` e passam
 * a acompanhar a troca de idioma sem alteração.
 */
export const gameData: GameData = new Proxy({} as GameData, {
  get: (_target, prop) => getGameData()[prop as keyof GameData],
  has: (_target, prop) => prop in getGameData(),
  ownKeys: () => Reflect.ownKeys(getGameData()),
  getOwnPropertyDescriptor: (_target, prop) =>
    Object.getOwnPropertyDescriptor(getGameData(), prop) ?? {
      configurable: true,
      enumerable: true,
      value: getGameData()[prop as keyof GameData],
    },
})
