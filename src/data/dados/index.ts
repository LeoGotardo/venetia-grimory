import type { DadosJogo } from '../../types/dados'

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

export const dados: DadosJogo = {
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
