import type { DadosJogo } from '../../types/dados'
import i18n from '../../i18n'
import { traduzirDados } from './traducao'

import meta from './meta'
import pericias from './pericias'
import idiomas from './idiomas'
import classes from './classes'
import especies from './especies'
import antecedentes from './antecedentes'
import atributos_sugeridos_por_classe from './atributos_sugeridos'
import armaduras from './armaduras'
import talentos_de_origem from './talentos_de_origem'
import talentos_gerais from './talentos_gerais'
import estilos_de_luta from './estilos_de_luta'
import ordens_divinas from './ordens_divinas'
import ordens_primais from './ordens_primais'
import inimigos_favoritos from './inimigos_favoritos'

/**
 * Dados canônicos, sempre em português. É a fonte das regras: cálculos e store
 * comparam strings como 'Leve' ou 'Escudo', que não podem variar com o idioma.
 */
export const dadosPT: DadosJogo = {
  meta,
  pericias,
  idiomas,
  classes,
  especies,
  antecedentes,
  atributos_sugeridos_por_classe,
  armaduras,
  talentos_de_origem,
  talentos_gerais,
  estilos_de_luta,
  ordens_divinas,
  ordens_primais,
  inimigos_favoritos,
} as unknown as DadosJogo

/** Dados no idioma da interface. Use na UI; as regras usam `dadosPT`. */
export function getDados(): DadosJogo {
  return traduzirDados(dadosPT, i18n.language)
}

/**
 * Mesma forma de `dadosPT`, mas resolvido no idioma atual a cada leitura —
 * assim os componentes já existentes continuam usando `dados.classes` e passam
 * a acompanhar a troca de idioma sem alteração.
 */
export const dados: DadosJogo = new Proxy({} as DadosJogo, {
  get: (_alvo, prop) => getDados()[prop as keyof DadosJogo],
  has: (_alvo, prop) => prop in getDados(),
  ownKeys: () => Reflect.ownKeys(getDados()),
  getOwnPropertyDescriptor: (_alvo, prop) =>
    Object.getOwnPropertyDescriptor(getDados(), prop) ?? {
      configurable: true,
      enumerable: true,
      value: getDados()[prop as keyof DadosJogo],
    },
})
