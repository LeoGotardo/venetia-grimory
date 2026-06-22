import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type { Ficha, AtributoId, ItemInventario } from '../types'
import { criarFichaInicial } from '../lib/fichaInicial'
import { recalcular } from '../lib/recalcular'
import { ATRIBUTOS } from '../lib/calculos'
import {
  salvarFicha,
  carregarFicha as carregarFichaStorage,
  deletarFicha as deletarFichaStorage,
  listarFichas,
} from '../services/fichaStorage'
import { dados } from '../data/dados'
import {
  DEBOUNCE_SAVE_MS,
  MAXIMO_EXAUSTAO,
  IDIOMAS_FIXOS_POR_CLASSE,
  PROFICIENCIAS_MULTICLASSE,
  TIPO_CONJURADOR,
} from '../constants'

export interface FichaListItem {
  id: string
  nome: string
  classe: string
  especie: string
  nivel: number
  updatedAt: string
  completa?: boolean
}

interface FichaStore {
  ficha: Ficha
  fichaId: string | null
  passoAtual: number
  fichasSalvas: FichaListItem[]
  fichaCompleta: boolean
  rolagemAtributos: number[]
  setRolagemAtributos: (vals: number[]) => void

  // Wizard
  setNivel: (nivel: number) => void
  setClasse: (classeId: string) => void
  setSubclasse: (subclasseId: string | null) => void
  setEspecie: (especieId: string, linhagemId?: string) => void
  setAntecedenteId: (antecedenteId: string) => void
  setAntecedente: (antecedenteId: string, distribuicao: Partial<Record<AtributoId, number>>) => void
  setAtributos: (valores: Partial<Record<AtributoId, number>>, metodo?: string) => void
  setPericias: (periciaIds: string[]) => void
  setEscolhasDeClasse: (escolhas: {
    estilo_de_luta?: string | null
    ordem_divina?: string | null
    ordem_primal?: string | null
    inimigo_favorito?: string | null
  }) => void
  setEspecializacao: (periciaIds: string[]) => void
  setIdiomas: (idiomas: string[]) => void
  setEquipamento: (opcao: 'A' | 'B', itens: ItemInventario[]) => void
  setPersonalidade: (p: Partial<Ficha['personalidade']>) => void
  setIdentidade: (id: Partial<Ficha['identidade']>) => void
  setPasso: (passo: number) => void

  // Ficha em jogo
  atualizarPV: (delta: number) => void
  atualizarPVTemp: (val: number) => void
  gastarDadoVida: () => void
  gastarEspaco: (circulo: keyof Ficha['magia']['espacos_de_magia']) => void
  restaurarEspaco: (circulo: keyof Ficha['magia']['espacos_de_magia']) => void
  descansoCurto: () => void
  descansoLongo: () => void
  atualizarRecurso: (recurso: string, delta: number) => void
  toggleCondicao: (condicao: string) => void
  setExaustao: (n: number) => void
  setNotas: (notas: string) => void
  addAtaque: (ataque: Ficha['combate']['ataques'][0]) => void
  removeAtaque: (idx: number) => void
  addItem: (item: ItemInventario) => void
  removeItem: (idx: number) => void
  updateItem: (idx: number, item: Partial<ItemInventario>) => void
  updateMoedas: (moedas: Partial<Ficha['inventario']['moedas']>) => void
  toggleEscudo: () => void
  setArmadura: (armaduraId: string | null) => void
  atualizarMagia: (parcial: Partial<Pick<Ficha['magia'], 'truques_por_classe' | 'magias_por_classe'>>) => void
  addXP: (amount: number) => void
  levelUp: (novoNivel: number, asi?: Partial<Record<AtributoId, number>>, classeIdAlvo?: string, talentoId?: string, especializacoes?: string[]) => void
  addMulticlasse: (classeId: string) => void
  removeMulticlasse: (classeId: string) => void
  setMulticlasseNivel: (classeId: string, nivel: number) => void
  setSubclasseMulticlasse: (classeId: string, subclasseId: string | null) => void

  // Persistência
  calcularTudo: () => void
  salvarLocal: () => void
  exportarJSON: () => string
  importarJSON: (json: string) => void
  carregarFicha: (id: string) => void
  novaFicha: () => void
  deletarFicha: (id: string) => void
  resetar: () => void
  carregarListaSalvas: () => void
}

function atualizarCombate(ficha: Ficha, parcial: Partial<Ficha['combate']>): Ficha {
  return { ...ficha, combate: { ...ficha.combate, ...parcial } }
}

export const useFichaStore = create<FichaStore>((set, get) => ({
  ficha: criarFichaInicial(),
  fichaId: null,
  passoAtual: 1,
  fichasSalvas: [],
  fichaCompleta: false,
  rolagemAtributos: [],
  setRolagemAtributos: vals => set({ rolagemAtributos: vals }),

  setNivel: nivel =>
    set(s => ({ ficha: recalcular({ ...s.ficha, identidade: { ...s.ficha.identidade, nivel } }) })),

  setClasse: classeId =>
    set(s => {
      const classe = dados.classes.find(c => c.id === classeId)
      if (!classe) return s

      const idiomasExistentes = s.ficha.proficiencias.idiomas
      const idiomasClasse = IDIOMAS_FIXOS_POR_CLASSE[classeId] ?? []
      const idiomas = [
        ...idiomasExistentes.filter(i => !Object.values(IDIOMAS_FIXOS_POR_CLASSE).flat().includes(i)),
        ...idiomasClasse,
      ]

      const ante = dados.antecedentes?.find(a => a.id === s.ficha.identidade.antecedente_id)
      const antePerics = ante?.pericias ?? []
      const pericias = { ...s.ficha.pericias }
      Object.keys(pericias).forEach(pid => {
        if (antePerics.includes(pid)) return
        pericias[pid] = { ...pericias[pid], proficiente: false }
      })

      const ficha: Ficha = {
        ...s.ficha,
        identidade: { ...s.ficha.identidade, classe_id: classeId, subclasse_id: null, multiclasses: [] },
        pericias,
        proficiencias: {
          ...s.ficha.proficiencias,
          armaduras: classe.armaduras,
          armas: classe.armas,
          ferramentas: classe.ferramentas,
          idiomas,
        },
        magia: {
          ...s.ficha.magia,
          conjurador: classe.conjurador,
          atributo_conjuracao: classe.atributo_conjuracao ?? null,
          truques_por_classe: {},
          magias_por_classe: {},
        },
      }

      return { ficha: recalcular(ficha) }
    }),

  setSubclasse: subclasseId =>
    set(s => ({
      ficha: { ...s.ficha, identidade: { ...s.ficha.identidade, subclasse_id: subclasseId } },
    })),

  setEspecie: (especieId, linhagemId) =>
    set(s => {
      const especie = dados.especies?.find(e => e.id === especieId)
      if (!especie) return s

      const tracosEspecie = especie.tracos.map(t => ({
        nome: t.nome,
        descricao: t.descricao,
        usos_maximos: t.usos_maximos,
        usos_atuais: typeof t.usos_maximos === 'number' ? t.usos_maximos : undefined,
      }))

      const linhagem = linhagemId
        ? especie.linhagens?.find(l => l.id === linhagemId)
        : undefined

      const tracosLinhagem = linhagem?.tracos?.map(t => ({
        nome: t.nome,
        descricao: t.descricao,
        usos_maximos: t.usos_maximos,
        usos_atuais: typeof t.usos_maximos === 'number' ? t.usos_maximos : undefined,
      })) ?? []

      const ficha: Ficha = {
        ...s.ficha,
        identidade: { ...s.ficha.identidade, especie_id: especieId, linhagem_id: linhagemId ?? null },
        tracos_de_especie: {
          visao_no_escuro_metros: especie.visao_no_escuro ?? null,
          tracos_ativos: [...tracosEspecie, ...tracosLinhagem],
          escolhas_feitas: {},
        },
        combate: {
          ...s.ficha.combate,
          deslocamento: { ...s.ficha.combate.deslocamento, base_metros: especie.deslocamento },
        },
      }

      return { ficha: recalcular(ficha) }
    }),

  setAntecedenteId: antecedenteId =>
    set(s => ({
      ficha: { ...s.ficha, identidade: { ...s.ficha.identidade, antecedente_id: antecedenteId } },
    })),

  setAntecedente: (antecedenteId, distribuicao) =>
    set(s => {
      const ante = dados.antecedentes?.find(a => a.id === antecedenteId)
      if (!ante) return s

      // Clear previous antecedente pericias, then apply new ones
      const anteAnterior = dados.antecedentes?.find(a => a.id === s.ficha.identidade.antecedente_id)
      const pericsAnteAnterior = anteAnterior?.pericias ?? []
      const pericias = { ...s.ficha.pericias }
      Object.keys(pericias).forEach(pid => {
        if (pericsAnteAnterior.includes(pid)) pericias[pid] = { ...pericias[pid], proficiente: false }
      })
      ante.pericias.forEach(pid => {
        if (pericias[pid]) pericias[pid] = { ...pericias[pid], proficiente: true }
      })

      // Remove old antecedente talent, add new one
      const talentoAnteriorId = anteAnterior?.talento
      const listaBase = s.ficha.talentos.lista.filter(t => t.talento_id !== talentoAnteriorId)
      const talentoData = dados.talentos_de_origem?.find(
        t => t.id === ante.talento || t.nome === ante.talento,
      )
      const talentoJaAdicionado = listaBase.some(t => t.talento_id === ante.talento)
      const talentos = talentoData && !talentoJaAdicionado
        ? [...listaBase, { talento_id: ante.talento, nome: talentoData.nome, categoria: 'Origem', origem: 'Antecedente', escolhas: {} }]
        : listaBase

      // Undo previous attribute distribution, then apply new one
      const atributos = { ...s.ficha.atributos }
      const distribAnterior = s.ficha.identidade.distribuicao_antecedente ?? {}
      Object.entries(distribAnterior).forEach(([attr, bonus]) => {
        const a = attr as AtributoId
        atributos[a] = { ...atributos[a], valor: (atributos[a].valor ?? 0) - (bonus ?? 0) }
      })
      Object.entries(distribuicao).forEach(([attr, bonus]) => {
        const a = attr as AtributoId
        atributos[a] = { ...atributos[a], valor: (atributos[a].valor ?? 0) + (bonus ?? 0) }
      })

      return {
        ficha: recalcular({
          ...s.ficha,
          identidade: {
            ...s.ficha.identidade,
            antecedente_id: antecedenteId,
            distribuicao_antecedente: distribuicao,
          },
          pericias,
          talentos: { lista: talentos },
          atributos,
        }),
      }
    }),

  setAtributos: (valores, metodo) =>
    set(s => {
      const atributos = { ...s.ficha.atributos }
      ATRIBUTOS.forEach(a => {
        if (valores[a] !== undefined) {
          atributos[a] = { ...atributos[a], valor: valores[a]! }
        }
      })
      if (metodo) atributos.metodo_geracao = metodo
      return { ficha: recalcular({ ...s.ficha, atributos }) }
    }),

  setEscolhasDeClasse: escolhas =>
    set(s => {
      const classeId = s.ficha.identidade.classe_id ?? ''
      const classe = dados.classes.find(c => c.id === classeId)
      if (!classe) return s

      const multiclasses = s.ficha.identidade.multiclasses ?? []

      // Rebuild proficiencias from class base + multiclasse + nova ordem
      const merge = (arr: string[], novos: string[]) => [...new Set([...arr, ...novos])]
      let armaduras = [...classe.armaduras]
      let armas = [...classe.armas]
      multiclasses.forEach(m => {
        const p = PROFICIENCIAS_MULTICLASSE[m.classe_id] ?? {}
        if (p.armaduras) armaduras = merge(armaduras, p.armaduras)
        if (p.armas) armas = merge(armas, p.armas)
      })

      const novaOrdemDivina = 'ordem_divina' in escolhas ? escolhas.ordem_divina : s.ficha.caracteristicas_de_classe.ordem_divina
      const novaOrdemPrimal = 'ordem_primal' in escolhas ? escolhas.ordem_primal : s.ficha.caracteristicas_de_classe.ordem_primal

      const ordemDiv = novaOrdemDivina ? dados.ordens_divinas?.find(o => o.id === novaOrdemDivina) : null
      const ordemPrim = novaOrdemPrimal ? dados.ordens_primais?.find(o => o.id === novaOrdemPrimal) : null

      if (ordemDiv?.prof_armaduras) armaduras = merge(armaduras, ordemDiv.prof_armaduras)
      if (ordemDiv?.prof_armas) armas = merge(armas, ordemDiv.prof_armas)
      if (ordemPrim?.prof_armaduras) armaduras = merge(armaduras, ordemPrim.prof_armaduras)
      if (ordemPrim?.prof_armas) armas = merge(armas, ordemPrim.prof_armas)

      // Expertise em perícia concedida pela ordem (Arcanismo para taumaturgo/mágico)
      const pericias = { ...s.ficha.pericias }
      const profPericiaOrdem = ordemDiv?.prof_pericia ?? ordemPrim?.prof_pericia ?? null
      if (profPericiaOrdem && pericias[profPericiaOrdem]) {
        const jaProf = pericias[profPericiaOrdem].proficiente
        pericias[profPericiaOrdem] = {
          ...pericias[profPericiaOrdem],
          proficiente: true,
          expertise: jaProf,
        }
      }

      return {
        ficha: recalcular({
          ...s.ficha,
          proficiencias: { ...s.ficha.proficiencias, armaduras, armas },
          pericias,
          caracteristicas_de_classe: {
            ...s.ficha.caracteristicas_de_classe,
            estilo_de_luta: 'estilo_de_luta' in escolhas ? escolhas.estilo_de_luta ?? null : s.ficha.caracteristicas_de_classe.estilo_de_luta,
            ordem_divina: novaOrdemDivina ?? null,
            ordem_primal: novaOrdemPrimal ?? null,
            inimigo_favorito: 'inimigo_favorito' in escolhas ? escolhas.inimigo_favorito ?? null : s.ficha.caracteristicas_de_classe.inimigo_favorito,
          },
        }),
      }
    }),

  setEspecializacao: periciaIds =>
    set(s => {
      const pericias = { ...s.ficha.pericias }
      Object.keys(pericias).forEach(pid => {
        pericias[pid] = { ...pericias[pid], expertise: periciaIds.includes(pid) }
      })
      return { ficha: recalcular({ ...s.ficha, pericias }) }
    }),

  setPericias: periciaIds =>
    set(s => {
      const ante = dados.antecedentes?.find(a => a.id === s.ficha.identidade.antecedente_id)
      const antePerics = ante?.pericias ?? []
      const pericias = { ...s.ficha.pericias }

      Object.keys(pericias).forEach(pid => {
        if (antePerics.includes(pid)) return
        pericias[pid] = { ...pericias[pid], proficiente: periciaIds.includes(pid) }
      })

      return { ficha: recalcular({ ...s.ficha, pericias }) }
    }),

  setIdiomas: idiomas =>
    set(s => ({
      ficha: { ...s.ficha, proficiencias: { ...s.ficha.proficiencias, idiomas } },
    })),

  setEquipamento: (_opcao, itens) =>
    set(s => ({
      ficha: { ...s.ficha, inventario: { ...s.ficha.inventario, itens } },
    })),

  setPersonalidade: p =>
    set(s => ({
      ficha: { ...s.ficha, personalidade: { ...s.ficha.personalidade, ...p } },
    })),

  setIdentidade: id =>
    set(s => ({
      ficha: recalcular({ ...s.ficha, identidade: { ...s.ficha.identidade, ...id } }),
    })),

  setPasso: passo => set({ passoAtual: passo }),

  atualizarPV: delta =>
    set(s => {
      const { maximo, temporario, atual } = s.ficha.combate.pontos_de_vida
      const novoAtual = Math.max(0, Math.min((maximo ?? 0) + temporario, atual + delta))
      return {
        ficha: atualizarCombate(s.ficha, {
          pontos_de_vida: { ...s.ficha.combate.pontos_de_vida, atual: novoAtual },
        }),
      }
    }),

  atualizarPVTemp: val =>
    set(s => ({
      ficha: atualizarCombate(s.ficha, {
        pontos_de_vida: { ...s.ficha.combate.pontos_de_vida, temporario: Math.max(0, val) },
      }),
    })),

  gastarDadoVida: () =>
    set(s => {
      const dv = s.ficha.combate.dados_de_vida
      if (!dv.total || dv.gastos >= dv.total) return s
      return {
        ficha: atualizarCombate(s.ficha, {
          dados_de_vida: { ...dv, gastos: dv.gastos + 1 },
        }),
      }
    }),

  gastarEspaco: circulo =>
    set(s => {
      const espaco = s.ficha.magia.espacos_de_magia[circulo]
      if (espaco.gastos >= espaco.maximo) return s
      return {
        ficha: {
          ...s.ficha,
          magia: {
            ...s.ficha.magia,
            espacos_de_magia: {
              ...s.ficha.magia.espacos_de_magia,
              [circulo]: { ...espaco, gastos: espaco.gastos + 1 },
            },
          },
        },
      }
    }),

  restaurarEspaco: circulo =>
    set(s => {
      const espaco = s.ficha.magia.espacos_de_magia[circulo]
      if (espaco.gastos <= 0) return s
      return {
        ficha: {
          ...s.ficha,
          magia: {
            ...s.ficha.magia,
            espacos_de_magia: {
              ...s.ficha.magia.espacos_de_magia,
              [circulo]: { ...espaco, gastos: espaco.gastos - 1 },
            },
          },
        },
      }
    }),

  descansoCurto: () =>
    set(s => ({
      ficha: atualizarCombate(s.ficha, {
        dados_de_vida: { ...s.ficha.combate.dados_de_vida, gastos: 0 },
      }),
    })),

  descansoLongo: () =>
    set(s => {
      const pvMax = s.ficha.combate.pontos_de_vida.maximo ?? 0

      const espacosRestaurados = Object.fromEntries(
        Object.entries(s.ficha.magia.espacos_de_magia).map(([k, v]) => [k, { ...v, gastos: 0 }]),
      ) as Ficha['magia']['espacos_de_magia']

      const r = { ...s.ficha.caracteristicas_de_classe.recursos_de_classe }
      if (r.furias.maximo) r.furias = { ...r.furias, atual: r.furias.maximo }
      if (r.formas_selvagens.maximo) r.formas_selvagens = { ...r.formas_selvagens, atual: r.formas_selvagens.maximo }
      if (r.canalizar_divindade.maximo) r.canalizar_divindade = { ...r.canalizar_divindade, atual: r.canalizar_divindade.maximo }
      if (r.imposicao_de_maos.pool_pv) r.imposicao_de_maos = { ...r.imposicao_de_maos, atual: r.imposicao_de_maos.pool_pv }
      if (r.pontos_de_feiticaria.maximo) r.pontos_de_feiticaria = { ...r.pontos_de_feiticaria, atual: r.pontos_de_feiticaria.maximo }
      if (r.pontos_de_foco.maximo) r.pontos_de_foco = { ...r.pontos_de_foco, atual: r.pontos_de_foco.maximo }
      if (r.inspiracao_de_bardo.maximo) r.inspiracao_de_bardo = { ...r.inspiracao_de_bardo, atual: r.inspiracao_de_bardo.maximo }

      return {
        ficha: {
          ...s.ficha,
          combate: {
            ...s.ficha.combate,
            pontos_de_vida: { ...s.ficha.combate.pontos_de_vida, atual: pvMax, temporario: 0 },
            dados_de_vida: { ...s.ficha.combate.dados_de_vida, gastos: 0 },
          },
          magia: { ...s.ficha.magia, espacos_de_magia: espacosRestaurados },
          caracteristicas_de_classe: { ...s.ficha.caracteristicas_de_classe, recursos_de_classe: r },
        },
      }
    }),

  atualizarRecurso: (recurso, delta) =>
    set(s => {
      const r = s.ficha.caracteristicas_de_classe.recursos_de_classe
      const res = r[recurso as keyof typeof r]

      if (!res || typeof res !== 'object' || !('atual' in res) || res.atual === null) return s

      const maxVal = 'maximo' in res ? (res.maximo as number | null) : null
      const novoAtual = Math.max(0, Math.min(maxVal ?? Infinity, (res.atual as number) + delta))

      return {
        ficha: {
          ...s.ficha,
          caracteristicas_de_classe: {
            ...s.ficha.caracteristicas_de_classe,
            recursos_de_classe: {
              ...r,
              [recurso]: { ...res, atual: novoAtual },
            } as typeof r,
          },
        },
      }
    }),

  toggleCondicao: condicao =>
    set(s => {
      const cs = s.ficha.condicoes_ativas
      const novasCondicoes = cs.includes(condicao)
        ? cs.filter(c => c !== condicao)
        : [...cs, condicao]
      return { ficha: { ...s.ficha, condicoes_ativas: novasCondicoes } }
    }),

  setExaustao: n =>
    set(s => ({ ficha: { ...s.ficha, niveis_de_exaustao: Math.max(0, Math.min(MAXIMO_EXAUSTAO, n)) } })),

  setNotas: notas =>
    set(s => ({ ficha: { ...s.ficha, notas } })),

  addAtaque: ataque =>
    set(s => ({
      ficha: atualizarCombate(s.ficha, {
        ataques: [...s.ficha.combate.ataques, ataque],
      }),
    })),

  removeAtaque: idx =>
    set(s => ({
      ficha: atualizarCombate(s.ficha, {
        ataques: s.ficha.combate.ataques.filter((_, i) => i !== idx),
      }),
    })),

  addItem: item =>
    set(s => ({
      ficha: { ...s.ficha, inventario: { ...s.ficha.inventario, itens: [...s.ficha.inventario.itens, item] } },
    })),

  removeItem: idx =>
    set(s => ({
      ficha: { ...s.ficha, inventario: { ...s.ficha.inventario, itens: s.ficha.inventario.itens.filter((_, i) => i !== idx) } },
    })),

  updateItem: (idx, item) =>
    set(s => ({
      ficha: {
        ...s.ficha,
        inventario: {
          ...s.ficha.inventario,
          itens: s.ficha.inventario.itens.map((it, i) => (i === idx ? { ...it, ...item } : it)),
        },
      },
    })),

  updateMoedas: moedas =>
    set(s => ({
      ficha: { ...s.ficha, inventario: { ...s.ficha.inventario, moedas: { ...s.ficha.inventario.moedas, ...moedas } } },
    })),

  toggleEscudo: () =>
    set(s => {
      const jaEquipado = s.ficha.combate.classe_de_armadura.escudo_equipado
      if (!jaEquipado) {
        const temEscudo = s.ficha.inventario.itens.some(i => i.categoria === 'Escudo')
        if (!temEscudo) return s
      }
      return {
        ficha: recalcular(atualizarCombate(s.ficha, {
          classe_de_armadura: {
            ...s.ficha.combate.classe_de_armadura,
            escudo_equipado: !jaEquipado,
          },
        })),
      }
    }),

  setArmadura: armaduraId =>
    set(s => ({
      ficha: recalcular(atualizarCombate(s.ficha, {
        classe_de_armadura: { ...s.ficha.combate.classe_de_armadura, armadura_equipada_id: armaduraId },
      })),
    })),

  atualizarMagia: parcial =>
    set(s => ({
      ficha: recalcular({ ...s.ficha, magia: { ...s.ficha.magia, ...parcial } }),
    })),

  addXP: amount =>
    set(s => ({
      ficha: { ...s.ficha, identidade: { ...s.ficha.identidade, xp: s.ficha.identidade.xp + amount } },
    })),

  levelUp: (novoNivel, asi, classeIdAlvo, talentoId, especializacoes) =>
    set(s => {
      const multiclasses = s.ficha.identidade.multiclasses ?? []
      const ehSecundaria = classeIdAlvo ? multiclasses.some(m => m.classe_id === classeIdAlvo) : false

      // Incrementa nível da classe alvo
      const novaMulticlasses = ehSecundaria
        ? multiclasses.map(m =>
            m.classe_id === classeIdAlvo ? { ...m, nivel: m.nivel + 1 } : m,
          )
        : multiclasses

      // Classe e nível relevantes para lookup de progressão
      const classeAlvoId = classeIdAlvo ?? s.ficha.identidade.classe_id
      const classeAlvo = dados.classes.find(c => c.id === classeAlvoId)
      const nivelNaClasse = ehSecundaria
        ? (novaMulticlasses.find(m => m.classe_id === classeIdAlvo)?.nivel ?? 1)
        : novoNivel - novaMulticlasses.reduce((sum, m) => sum + m.nivel, 0)

      const progEntry = classeAlvo?.progressao.find(
        (p: { nivel: number }) => p.nivel === nivelNaClasse,
      ) as (Record<string, unknown> & { nivel: number }) | undefined
      void progEntry

      let atributos = s.ficha.atributos
      if (asi) {
        Object.entries(asi).forEach(([attr, bonus]) => {
          const a = attr as AtributoId
          const atual = atributos[a].valor ?? 10
          atributos = { ...atributos, [a]: { ...atributos[a], valor: Math.min(20, atual + (bonus ?? 0)) } }
        })
      }

      let talentos = s.ficha.talentos
      if (talentoId) {
        const talento = dados.talentos_gerais?.find(t => t.id === talentoId)
        if (talento) {
          talentos = {
            lista: [
              ...s.ficha.talentos.lista,
              { talento_id: talentoId, nome: talento.nome, categoria: 'Geral', origem: `nivel_${novoNivel}`, escolhas: {} },
            ],
          }
        }
      }

      let pericias = s.ficha.pericias
      if (especializacoes && especializacoes.length > 0) {
        especializacoes.forEach(pid => {
          if (pericias[pid]?.proficiente) {
            pericias = { ...pericias, [pid]: { ...pericias[pid], expertise: true } }
          }
        })
      }

      // recalcular já aplica calcSlotsMulticlasse quando há multiclasses
      const ficha = recalcular({
        ...s.ficha,
        identidade: { ...s.ficha.identidade, nivel: novoNivel, multiclasses: novaMulticlasses },
        atributos,
        talentos,
        pericias,
      })

      return { ficha }
    }),

  addMulticlasse: classeId =>
    set(s => {
      const multi = s.ficha.identidade.multiclasses ?? []
      if (classeId === s.ficha.identidade.classe_id) return s
      if (multi.some(m => m.classe_id === classeId)) return s
      if (s.ficha.identidade.nivel < 2) return s

      const novaClasse = dados.classes.find(c => c.id === classeId)
      if (!novaClasse) return s

      const parcial = PROFICIENCIAS_MULTICLASSE[classeId] ?? {}
      const prof = s.ficha.proficiencias
      const merge = (arr: string[], novos?: string[]) =>
        novos ? [...new Set([...arr, ...novos])] : arr

      // Conjuração: se a nova classe for conjuradora e a primária não for, atualizar
      const conjuradorAtual = s.ficha.magia.conjurador
      const novaEhConjuradora = TIPO_CONJURADOR[classeId] != null
      const novoConjurador = conjuradorAtual || novaEhConjuradora
      const novoAtribConj = conjuradorAtual
        ? s.ficha.magia.atributo_conjuracao
        : novaEhConjuradora
          ? ((novaClasse as { atributo_conjuracao?: string })?.atributo_conjuracao as typeof s.ficha.magia.atributo_conjuracao ?? null)
          : s.ficha.magia.atributo_conjuracao

      const ficha: Ficha = {
        ...s.ficha,
        identidade: {
          ...s.ficha.identidade,
          multiclasses: [...multi, { classe_id: classeId, subclasse_id: null, nivel: 1 }],
        },
        proficiencias: {
          ...prof,
          armaduras: merge(prof.armaduras, parcial.armaduras),
          armas: merge(prof.armas, parcial.armas),
          ferramentas: merge(prof.ferramentas, parcial.ferramentas),
        },
        magia: {
          ...s.ficha.magia,
          conjurador: novoConjurador,
          atributo_conjuracao: novoAtribConj,
        },
      }
      return { ficha: recalcular(ficha) }
    }),

  removeMulticlasse: classeId =>
    set(s => {
      const multi = s.ficha.identidade.multiclasses ?? []
      const entrada = multi.find(m => m.classe_id === classeId)
      if (!entrada) return s

      const novaMulti = multi.filter(m => m.classe_id !== classeId)

      // Reverte proficiências parciais (apenas as que não existem em nenhuma outra classe)
      const parcial = PROFICIENCIAS_MULTICLASSE[classeId] ?? {}
      const prof = s.ficha.proficiencias
      const classePrimaria = dados.classes.find(c => c.id === s.ficha.identidade.classe_id)
      const outrasMulti = novaMulti.map(m => m.classe_id)
      const todasProfSobreviventes = [
        ...(classePrimaria?.armaduras ?? []),
        ...outrasMulti.flatMap(id => PROFICIENCIAS_MULTICLASSE[id]?.armaduras ?? []),
      ]
      const todasArmasSobreviventes = [
        ...(classePrimaria?.armas ?? []),
        ...outrasMulti.flatMap(id => PROFICIENCIAS_MULTICLASSE[id]?.armas ?? []),
      ]

      const remover = (arr: string[], rem?: string[], sobrev?: string[]) =>
        rem ? arr.filter(x => !rem.includes(x) || (sobrev ?? []).includes(x)) : arr

      // Recomputa conjurador após remoção
      const conjuradorPrimaria = TIPO_CONJURADOR[s.ficha.identidade.classe_id ?? ''] != null
      const conjuradorMulti = novaMulti.some(m => TIPO_CONJURADOR[m.classe_id] != null)
      const novoConjurador = conjuradorPrimaria || conjuradorMulti

      const classePrimObj = dados.classes.find(c => c.id === s.ficha.identidade.classe_id)
      const atribConjPrimaria = (classePrimObj as { atributo_conjuracao?: string } | undefined)?.atributo_conjuracao as typeof s.ficha.magia.atributo_conjuracao ?? null
      const novoAtribConj = conjuradorPrimaria
        ? atribConjPrimaria
        : novaMulti
            .map(m => {
              const c = dados.classes.find(cc => cc.id === m.classe_id)
              return TIPO_CONJURADOR[m.classe_id] != null
                ? ((c as { atributo_conjuracao?: string } | undefined)?.atributo_conjuracao as typeof s.ficha.magia.atributo_conjuracao ?? null)
                : null
            })
            .find(Boolean) ?? null

      const ficha: Ficha = {
        ...s.ficha,
        identidade: { ...s.ficha.identidade, multiclasses: novaMulti },
        proficiencias: {
          ...prof,
          armaduras: remover(prof.armaduras, parcial.armaduras, todasProfSobreviventes),
          armas: remover(prof.armas, parcial.armas, todasArmasSobreviventes),
          ferramentas: prof.ferramentas,
        },
        magia: {
          ...s.ficha.magia,
          conjurador: novoConjurador,
          atributo_conjuracao: novoAtribConj,
          truques_por_classe: Object.fromEntries(
            Object.entries(s.ficha.magia.truques_por_classe).filter(([k]) => k !== classeId),
          ),
          magias_por_classe: Object.fromEntries(
            Object.entries(s.ficha.magia.magias_por_classe).filter(([k]) => k !== classeId),
          ),
        },
      }
      return { ficha: recalcular(ficha) }
    }),

  setMulticlasseNivel: (classeId, nivel) =>
    set(s => {
      const multi = s.ficha.identidade.multiclasses ?? []
      const totalSecundario = multi.reduce((sum, m) => sum + (m.classe_id === classeId ? 0 : m.nivel), 0)
      const nivelTotal = s.ficha.identidade.nivel
      const nivelValidado = Math.max(1, Math.min(nivel, nivelTotal - totalSecundario - 1))
      const novaMulti = multi.map(m =>
        m.classe_id === classeId ? { ...m, nivel: nivelValidado } : m,
      )
      return { ficha: recalcular({ ...s.ficha, identidade: { ...s.ficha.identidade, multiclasses: novaMulti } }) }
    }),

  setSubclasseMulticlasse: (classeId, subclasseId) =>
    set(s => {
      const multi = s.ficha.identidade.multiclasses ?? []
      const novaMulti = multi.map(m =>
        m.classe_id === classeId ? { ...m, subclasse_id: subclasseId } : m,
      )
      return { ficha: recalcular({ ...s.ficha, identidade: { ...s.ficha.identidade, multiclasses: novaMulti } }) }
    }),

  calcularTudo: () => set(s => ({ ficha: recalcular(s.ficha) })),

  salvarLocal: () => {
    const { ficha, fichaId, fichaCompleta } = get()
    const id = fichaId ?? uuidv4()
    const fichaFinal = !fichaCompleta
      ? {
          ...ficha,
          combate: {
            ...ficha.combate,
            pontos_de_vida: {
              ...ficha.combate.pontos_de_vida,
              atual: ficha.combate.pontos_de_vida.maximo ?? 0,
            },
          },
        }
      : ficha
    salvarFicha(id, fichaFinal, true)
    set({ ficha: fichaFinal, fichaId: id, fichaCompleta: true })
  },

  exportarJSON: () => JSON.stringify(get().ficha, null, 2),

  importarJSON: json => {
    try {
      const ficha = JSON.parse(json) as Ficha
      const id = uuidv4()
      salvarFicha(id, ficha)
      set({ ficha: recalcular(ficha), fichaId: id })
      get().carregarListaSalvas()
    } catch (err) {
      console.error('[fichaStore] Falha ao importar JSON:', err)
    }
  },

  carregarFicha: id => {
    const ficha = carregarFichaStorage(id)
    if (!ficha) return
    const lista = listarFichas()
    const completa = lista.find(item => item.id === id)?.completa ?? true
    set({ ficha: recalcular(ficha), fichaId: id, passoAtual: 1, fichaCompleta: completa })
  },

  novaFicha: () => {
    const id = uuidv4()
    set({ ficha: criarFichaInicial(), fichaId: id, passoAtual: 1, fichaCompleta: false, rolagemAtributos: [] })
  },

  deletarFicha: id => {
    deletarFichaStorage(id)
    get().carregarListaSalvas()
  },

  resetar: () => set({ ficha: criarFichaInicial(), fichaId: null, passoAtual: 1 }),

  carregarListaSalvas: () => set({ fichasSalvas: listarFichas() }),
}))

let saveTimeout: ReturnType<typeof setTimeout> | null = null

useFichaStore.subscribe(state => {
  if (!state.fichaId) return

  if (saveTimeout) clearTimeout(saveTimeout)

  saveTimeout = setTimeout(() => {
    salvarFicha(state.fichaId!, state.ficha, state.fichaCompleta)
  }, DEBOUNCE_SAVE_MS)
})
