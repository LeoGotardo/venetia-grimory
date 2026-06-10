import type { Ficha, Armadura } from '../types'
import {
  calcModificador,
  calcBonusProf,
  calcPVTotal,
  calcCA,
  calcSalvaguarda,
  calcPericia,
  calcCDMagia,
  calcBonusAtaqueMagico,
  ATRIBUTOS,
} from './calculos'
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

  let combate = {
    ...ficha.combate,
    _bonus_proficiencia: bonusProf,
    iniciativa: { _valor: modDES },
    deslocamento: { ...ficha.combate.deslocamento, _total_metros: deslocamentoTotal },
  }

  if (classe) {
    const pvMax = calcPVTotal(nivel, classe.dado_vida, modCON)
    combate = {
      ...combate,
      pontos_de_vida: {
        ...combate.pontos_de_vida,
        maximo: pvMax,
        atual: combate.pontos_de_vida.atual === 0 && pvMax > 0 ? pvMax : combate.pontos_de_vida.atual,
      },
      dados_de_vida: { ...combate.dados_de_vida, tipo: `d${classe.dado_vida}`, total: nivel },
    }

    const salvaguardas = { ...combate.salvaguardas }
    ATRIBUTOS.forEach(a => {
      salvaguardas[a] = { ...salvaguardas[a], proficiente: false }
    })
    classe.salvaguardas.forEach(s => {
      salvaguardas[s] = { ...salvaguardas[s], proficiente: true }
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
        classeId: ficha.identidade.classe_id,
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
  if (!ficha.magia.conjurador || !ficha.magia.atributo_conjuracao) return ficha

  const modConj = ficha.atributos[ficha.magia.atributo_conjuracao]._modificador ?? 0

  return {
    ...ficha,
    magia: {
      ...ficha.magia,
      _cd_magia: calcCDMagia(bonusProf, modConj),
      _bonus_ataque_magia: calcBonusAtaqueMagico(bonusProf, modConj),
    },
  }
}

export function recalcular(ficha: Ficha): Ficha {
  const bonusProf = calcBonusProf(ficha.identidade.nivel)

  const comModificadores = recalcularModificadores(ficha)
  const comCombate = recalcularCombate(comModificadores, bonusProf)
  const comPericias = recalcularPericias(comCombate, bonusProf)
  const comMagia = recalcularMagia(comPericias, bonusProf)

  return comMagia
}
