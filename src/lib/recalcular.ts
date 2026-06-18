import type { Ficha, Armadura } from '../types'
import {
  calcModificador,
  calcBonusProf,
  calcPVTotal,
  calcPVMulticlasse,
  calcCA,
  calcSalvaguarda,
  calcPericia,
  calcCDMagia,
  calcBonusAtaqueMagico,
  calcNivelConjuradorMulticlasse,
  calcSlotsMulticlasse,
  ATRIBUTOS,
} from './calculos'
import { TIPO_CONJURADOR } from '../constants'
import dadosJson from '../data/dnd_dados.json'
import type { DadosJogo } from '../types'

const dados = dadosJson as unknown as DadosJogo

function recalcularModificadores(ficha: Ficha): Ficha {
  let f = ficha

  ATRIBUTOS.forEach(attr => {
    const val = f.atributos[attr].valor
    f = {
      ...f,
      atributos: {
        ...f.atributos,
        [attr]: {
          ...f.atributos[attr],
          _modificador: val !== null ? calcModificador(val) : null,
        },
      },
    }
  })

  return f
}

function recalcularCombate(ficha: Ficha, bonusProf: number): Ficha {
  const modDES = ficha.atributos.DES._modificador ?? 0
  const modCON = ficha.atributos.CON._modificador ?? 0
  const modSAB = ficha.atributos.SAB._modificador ?? 0

  const deslocamentoTotal =
    (ficha.combate.deslocamento.base_metros ?? 0) + ficha.combate.deslocamento.bonus_metros

  const classe = dados.classes.find(c => c.id === ficha.identidade.classe_id)
  const nivel = ficha.identidade.nivel
  const multiclasses = ficha.identidade.multiclasses ?? []

  let combate = {
    ...ficha.combate,
    _bonus_proficiencia: bonusProf,
    iniciativa: { _valor: modDES },
    deslocamento: { ...ficha.combate.deslocamento, _total_metros: deslocamentoTotal },
  }

  if (classe) {
    let pvMax: number
    if (multiclasses.length > 0) {
      const nivelPrimario = nivel - multiclasses.reduce((s, m) => s + m.nivel, 0)
      const todasClasses = [
        { dadoVida: classe.dado_vida, nivel: Math.max(1, nivelPrimario), isPrimaria: true },
        ...multiclasses.map(m => {
          const c2 = dados.classes.find(c => c.id === m.classe_id)
          return { dadoVida: c2?.dado_vida ?? 8, nivel: m.nivel, isPrimaria: false }
        }),
      ]
      pvMax = calcPVMulticlasse(todasClasses, modCON)
    } else {
      pvMax = calcPVTotal(nivel, classe.dado_vida, modCON)
    }

    combate = {
      ...combate,
      pontos_de_vida: {
        ...combate.pontos_de_vida,
        maximo: pvMax,
        atual: combate.pontos_de_vida.atual === 0 && pvMax > 0 ? pvMax : combate.pontos_de_vida.atual,
      },
      dados_de_vida: { ...combate.dados_de_vida, tipo: `d${classe.dado_vida}`, total: nivel },
    }

    // Salvaguardas: union de todas as classes
    const salvaguardas = { ...combate.salvaguardas }
    ATRIBUTOS.forEach(a => {
      salvaguardas[a] = { ...salvaguardas[a], proficiente: false }
    })
    const todasSalvaguardas = new Set<string>([
      ...classe.salvaguardas,
      ...multiclasses.flatMap(m => dados.classes.find(c => c.id === m.classe_id)?.salvaguardas ?? []),
    ])
    todasSalvaguardas.forEach(s => {
      const a = s as keyof typeof salvaguardas
      if (salvaguardas[a]) salvaguardas[a] = { ...salvaguardas[a], proficiente: true }
    })
    combate = { ...combate, salvaguardas }
  }

  ATRIBUTOS.forEach(attr => {
    const mod = ficha.atributos[attr]._modificador ?? 0
    const sv = combate.salvaguardas[attr]
    combate = {
      ...combate,
      salvaguardas: {
        ...combate.salvaguardas,
        [attr]: { ...sv, _valor: calcSalvaguarda(mod, sv.proficiente, bonusProf) },
      },
    }
  })

  const classeIds = [
    ...(ficha.identidade.classe_id ? [ficha.identidade.classe_id] : []),
    ...multiclasses.map(m => m.classe_id),
  ]

  const armaduraId = combate.classe_de_armadura.armadura_equipada_id
  const armadura = armaduraId
    ? (dados.armaduras?.find((a: Armadura) => a.id === armaduraId) ?? null)
    : null

  combate = {
    ...combate,
    classe_de_armadura: {
      ...combate.classe_de_armadura,
      valor: calcCA({
        armadura,
        modDES,
        modCON,
        modSAB,
        classeIds,
        escudo: combate.classe_de_armadura.escudo_equipado,
      }),
    },
  }

  return { ...ficha, combate }
}

function recalcularPericias(ficha: Ficha, bonusProf: number): Ficha {
  const pericias = { ...ficha.pericias }

  Object.keys(pericias).forEach(pid => {
    const p = pericias[pid]
    const mod = ficha.atributos[p.atributo]._modificador ?? 0
    pericias[pid] = { ...p, _valor: calcPericia(mod, p.proficiente, p.expertise, bonusProf) }
  })

  return { ...ficha, pericias }
}

function recalcularMagia(ficha: Ficha, bonusProf: number): Ficha {
  const multiclasses = ficha.identidade.multiclasses ?? []

  // Determina se alguma classe é conjuradora
  const classesPrimaria = ficha.identidade.classe_id ? [ficha.identidade.classe_id] : []
  const todasClasseIds = [...classesPrimaria, ...multiclasses.map(m => m.classe_id)]
  const ehConjuradorMulti = todasClasseIds.some(id => TIPO_CONJURADOR[id] != null)

  if (!ehConjuradorMulti && !ficha.magia.conjurador) return ficha

  // Determina o atributo de conjuração: usa a classe primária se conjuradora, senão a primeira secundária
  let atributoConj = ficha.magia.atributo_conjuracao
  if (!atributoConj) {
    const primeiraConj = multiclasses.find(m => TIPO_CONJURADOR[m.classe_id] != null)
    if (primeiraConj) {
      const c = dados.classes.find(c => c.id === primeiraConj.classe_id)
      atributoConj = ((c as { atributo_conjuracao?: string })?.atributo_conjuracao ?? null) as typeof atributoConj
    }
  }
  if (!atributoConj) return ficha

  const modConj = ficha.atributos[atributoConj]._modificador ?? 0
  let magia = {
    ...ficha.magia,
    _cd_magia: calcCDMagia(bonusProf, modConj),
    _bonus_ataque_magia: calcBonusAtaqueMagico(bonusProf, modConj),
  }

  // Slots multiclasse: só aplica se há multiclasse e alguma classe conjuradora
  if (multiclasses.length > 0 && ehConjuradorMulti) {
    const nivel = ficha.identidade.nivel
    const nivelPrimario = nivel - multiclasses.reduce((s, m) => s + m.nivel, 0)
    const todasParaSlots = [
      { classeId: ficha.identidade.classe_id ?? '', subclasseId: ficha.identidade.subclasse_id, nivel: Math.max(1, nivelPrimario) },
      ...multiclasses.map(m => ({ classeId: m.classe_id, subclasseId: m.subclasse_id, nivel: m.nivel })),
    ]
    const nivelConj = calcNivelConjuradorMulticlasse(todasParaSlots)
    if (nivelConj > 0) {
      const slots = calcSlotsMulticlasse(nivelConj)
      const CIRCULOS = ['c1','c2','c3','c4','c5','c6','c7','c8','c9'] as const
      const espacos = { ...magia.espacos_de_magia }
      CIRCULOS.forEach(k => {
        const novo = slots[k] ?? 0
        espacos[k] = { maximo: novo, gastos: Math.min(espacos[k].gastos, novo) }
      })
      magia = { ...magia, espacos_de_magia: espacos }
    }
  }

  return { ...ficha, magia }
}

export function recalcular(ficha: Ficha): Ficha {
  const bonusProf = calcBonusProf(ficha.identidade.nivel)

  const comModificadores = recalcularModificadores(ficha)
  const comCombate = recalcularCombate(comModificadores, bonusProf)
  const comPericias = recalcularPericias(comCombate, bonusProf)
  const comMagia = recalcularMagia(comPericias, bonusProf)

  return comMagia
}
