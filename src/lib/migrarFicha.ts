import type { Ficha } from '../types'
import { criarFichaInicial } from './fichaInicial'

/**
 * Formato anterior à separação de magias por classe (multiclasse).
 * Fichas salvas antes dessa mudança guardam truques e magias em listas únicas.
 */
type FichaLegada = Ficha & {
  magia: Ficha['magia'] & {
    truques_conhecidos?: string[]
    magias_preparadas?: string[]
  }
}

function agruparPorClasse(classeId: string, lista: string[] | undefined): Record<string, string[]> {
  if (!lista?.length) return {}
  return { [classeId]: lista }
}

/**
 * Normaliza uma ficha vinda do localStorage ou de um JSON importado, preenchendo
 * campos adicionados depois que ela foi salva. Sem isso, painéis que leem esses
 * campos quebram a página inteira (ex.: `Object.values(truques_por_classe)`).
 */
export function migrarFicha(ficha: Ficha): Ficha {
  const base = criarFichaInicial()
  const legada = ficha as FichaLegada
  const classeId = ficha.identidade?.classe_id ?? 'classe'

  const { truques_conhecidos, magias_preparadas, ...magiaSalva } = legada.magia ?? base.magia

  return {
    ...base,
    ...ficha,
    identidade: {
      ...base.identidade,
      ...ficha.identidade,
      multiclasses: ficha.identidade?.multiclasses ?? base.identidade.multiclasses,
      distribuicao_antecedente:
        ficha.identidade?.distribuicao_antecedente ?? base.identidade.distribuicao_antecedente,
    },
    atributos: { ...base.atributos, ...ficha.atributos },
    combate: {
      ...base.combate,
      ...ficha.combate,
      salvaguardas: { ...base.combate.salvaguardas, ...ficha.combate?.salvaguardas },
    },
    pericias: { ...base.pericias, ...ficha.pericias },
    proficiencias: { ...base.proficiencias, ...ficha.proficiencias },
    tracos_de_especie: { ...base.tracos_de_especie, ...ficha.tracos_de_especie },
    caracteristicas_de_classe: {
      ...base.caracteristicas_de_classe,
      ...ficha.caracteristicas_de_classe,
      recursos_de_classe: {
        ...base.caracteristicas_de_classe.recursos_de_classe,
        ...ficha.caracteristicas_de_classe?.recursos_de_classe,
      },
    },
    magia: {
      ...base.magia,
      ...magiaSalva,
      truques_por_classe: magiaSalva.truques_por_classe ?? agruparPorClasse(classeId, truques_conhecidos),
      magias_por_classe: magiaSalva.magias_por_classe ?? agruparPorClasse(classeId, magias_preparadas),
      espacos_de_magia: { ...base.magia.espacos_de_magia, ...magiaSalva.espacos_de_magia },
      espacos_pacto_bruxo: magiaSalva.espacos_pacto_bruxo ?? base.magia.espacos_pacto_bruxo,
    },
    inventario: {
      ...base.inventario,
      ...ficha.inventario,
      moedas: { ...base.inventario.moedas, ...ficha.inventario?.moedas },
    },
    talentos: { ...base.talentos, ...ficha.talentos },
    personalidade: { ...base.personalidade, ...ficha.personalidade },
  }
}
