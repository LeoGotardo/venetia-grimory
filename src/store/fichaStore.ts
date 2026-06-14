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
import {
  DEBOUNCE_SAVE_MS,
  MAXIMO_EXAUSTAO,
  IDIOMAS_FIXOS_POR_CLASSE,
} from '../constants'
import dadosJson from '../data/dnd_dados.json'
import type { DadosJogo } from '../types'

const dados = dadosJson as unknown as DadosJogo

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
  atualizarMagia: (parcial: Partial<Pick<Ficha['magia'], 'truques_conhecidos' | 'magias_preparadas'>>) => void
  addXP: (amount: number) => void
  levelUp: (novoNivel: number, asi?: Partial<Record<AtributoId, number>>) => void

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

      const ficha: Ficha = {
        ...s.ficha,
        identidade: { ...s.ficha.identidade, classe_id: classeId, subclasse_id: null },
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

      const pericias = { ...s.ficha.pericias }
      ante.pericias.forEach(pid => {
        if (pericias[pid]) pericias[pid] = { ...pericias[pid], proficiente: true }
      })

      const talentoData = dados.talentos_de_origem?.find(
        t => t.id === ante.talento || t.nome === ante.talento,
      )
      const talentoJaAdicionado = s.ficha.talentos.lista.some(t => t.talento_id === ante.talento)
      const talentos = talentoData && !talentoJaAdicionado
        ? [
            ...s.ficha.talentos.lista,
            { talento_id: ante.talento, nome: talentoData.nome, categoria: 'Origem', origem: 'Antecedente', escolhas: {} },
          ]
        : s.ficha.talentos.lista

      const atributos = { ...s.ficha.atributos }
      Object.entries(distribuicao).forEach(([attr, bonus]) => {
        const a = attr as AtributoId
        const valAtual = atributos[a].valor ?? 8
        atributos[a] = { ...atributos[a], valor: valAtual + bonus }
      })

      return {
        ficha: recalcular({
          ...s.ficha,
          identidade: { ...s.ficha.identidade, antecedente_id: antecedenteId },
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

  levelUp: (novoNivel, asi) =>
    set(s => {
      const classe = dados.classes.find(c => c.id === s.ficha.identidade.classe_id)
      const progEntry = classe?.progressao.find((p: { nivel: number }) => p.nivel === novoNivel) as
        | (Record<string, unknown> & { nivel: number })
        | undefined

      let atributos = s.ficha.atributos
      if (asi) {
        Object.entries(asi).forEach(([attr, bonus]) => {
          const a = attr as AtributoId
          const atual = atributos[a].valor ?? 10
          atributos = { ...atributos, [a]: { ...atributos[a], valor: Math.min(20, atual + (bonus ?? 0)) } }
        })
      }

      let ficha = recalcular({
        ...s.ficha,
        identidade: { ...s.ficha.identidade, nivel: novoNivel },
        atributos,
      })

      if (ficha.magia.conjurador && progEntry?.espacos) {
        const espacosData = progEntry.espacos as Record<string, number>
        const CIRCULOS = ['c1','c2','c3','c4','c5','c6','c7','c8','c9'] as const
        const espacos = { ...ficha.magia.espacos_de_magia }
        CIRCULOS.forEach(k => {
          if (espacosData[k] !== undefined) {
            espacos[k] = { maximo: espacosData[k], gastos: Math.min(espacos[k].gastos, espacosData[k]) }
          }
        })
        ficha = recalcular({ ...ficha, magia: { ...ficha.magia, espacos_de_magia: espacos } })
      }

      return { ficha }
    }),

  calcularTudo: () => set(s => ({ ficha: recalcular(s.ficha) })),

  salvarLocal: () => {
    const { ficha, fichaId } = get()
    const id = fichaId ?? uuidv4()
    salvarFicha(id, ficha, true)
    set({ fichaId: id, fichaCompleta: true })
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
