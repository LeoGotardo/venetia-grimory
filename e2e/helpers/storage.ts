import type { Page } from '@playwright/test'
import { criarFichaInicial } from '../../src/lib/fichaInicial'
import type { Ficha } from '../../src/types'

export const STORAGE_KEY_LISTA = 'dnd_fichas_lista'
export const STORAGE_KEY_FICHA_PREFIX = 'dnd_ficha_'
export const STORAGE_KEY_CONFIG = 'venetia-config'

export interface FichaListItem {
  id: string
  nome: string
  classe: string
  especie: string
  nivel: number
  updatedAt: string
  completa?: boolean
}

/**
 * Guerreiro Campeão nível 3, humano, soldado.
 * Valores derivados calculados à mão para manter a fixture independente
 * de `recalcular()` (que importa os módulos de dados do app).
 *
 * FOR 16 (+3) · DES 14 (+2) · CON 14 (+2) · INT 10 (0) · SAB 12 (+1) · CAR 8 (-1)
 * Bônus de proficiência nível 3 = +2
 * PV = (10 + 2) + 2 × (6 + 2) = 28 · CA sem armadura = 10 + 2 = 12
 */
export function criarFichaCompleta(overrides: Partial<Ficha['identidade']> = {}): Ficha {
  const f = criarFichaInicial()

  f.identidade = {
    ...f.identidade,
    nome_personagem: 'Aria Sombravéu',
    nome_jogador: 'Jogador E2E',
    classe_id: 'guerreiro',
    subclasse_id: 'campeao',
    especie_id: 'humano',
    antecedente_id: 'soldado',
    nivel: 3,
    xp: 900,
    alinhamento: { etico: 'Leal', moral: 'Bom' },
    ...overrides,
  }

  const valores: Record<string, number> = { FOR: 16, DES: 14, CON: 14, INT: 10, SAB: 12, CAR: 8 }
  for (const [attr, valor] of Object.entries(valores)) {
    f.atributos[attr as 'FOR'] = { valor, _modificador: Math.floor((valor - 10) / 2) }
  }
  f.atributos.metodo_geracao = 'padrao'

  f.combate._bonus_proficiencia = 2
  f.combate.pontos_de_vida = { maximo: 28, atual: 28, temporario: 0 }
  f.combate.dados_de_vida = { tipo: 'd10', total: 3, gastos: 0 }
  f.combate.classe_de_armadura = { valor: 12, origem: null, escudo_equipado: false, armadura_equipada_id: null }
  f.combate.iniciativa = { _valor: 2 }
  f.combate.deslocamento = { base_metros: 9, bonus_metros: 0, _total_metros: 9 }
  f.combate.salvaguardas.FOR = { proficiente: true, _valor: 5 }
  f.combate.salvaguardas.CON = { proficiente: true, _valor: 4 }
  f.combate.salvaguardas.DES = { proficiente: false, _valor: 2 }
  f.combate.salvaguardas.INT = { proficiente: false, _valor: 0 }
  f.combate.salvaguardas.SAB = { proficiente: false, _valor: 1 }
  f.combate.salvaguardas.CAR = { proficiente: false, _valor: -1 }

  // Perícias do antecedente Soldado + duas de classe
  for (const pid of ['atletismo', 'intimidacao', 'acrobacia', 'historia']) {
    f.pericias[pid] = { ...f.pericias[pid], proficiente: true }
  }
  const modPorAtributo: Record<string, number> = { FOR: 3, DES: 2, CON: 2, INT: 0, SAB: 1, CAR: -1 }
  for (const pid of Object.keys(f.pericias)) {
    const p = f.pericias[pid]
    p._valor = modPorAtributo[p.atributo] + (p.proficiente ? 2 : 0)
  }

  f.proficiencias.idiomas = ['comum', 'draconico', 'elfico']
  f.inventario.moedas = { PC: 0, PP: 0, PE: 0, PO: 25, PL: 0 }
  f.inventario.itens = [
    {
      id_item: 'kit_opcao_a',
      nome: 'Cota de Malha, Espada Grande, Mangual',
      categoria: 'kit',
      quantidade: 1,
      equipado: false,
      custo_po: null,
      peso_kg: null,
      notas: null,
    },
  ]

  return f
}

/**
 * Ficha de conjurador no formato anterior ao split de magias por classe
 * (`truques_conhecidos` / `magias_preparadas`, sem os campos `*_por_classe`).
 * Serve para cobrir a migração de fichas antigas do localStorage.
 */
export function criarFichaLegadaConjuradora(): Ficha {
  const f = criarFichaCompleta({
    nome_personagem: 'Elowen Vento-Claro',
    classe_id: 'mago',
    subclasse_id: 'abjurador',
  })

  const magiaLegada = {
    conjurador: true,
    atributo_conjuracao: 'INT',
    _cd_magia: 13,
    _bonus_ataque_magia: 5,
    truques_conhecidos: ['Raio Gélido', 'Luz'],
    magias_preparadas: ['Mísseis Mágicos', 'Escudo'],
    livro_de_magias: [],
    espacos_de_magia: {
      c1: { maximo: 4, gastos: 1 }, c2: { maximo: 2, gastos: 0 }, c3: { maximo: 0, gastos: 0 },
      c4: { maximo: 0, gastos: 0 }, c5: { maximo: 0, gastos: 0 }, c6: { maximo: 0, gastos: 0 },
      c7: { maximo: 0, gastos: 0 }, c8: { maximo: 0, gastos: 0 }, c9: { maximo: 0, gastos: 0 },
    },
    espacos_pacto_bruxo: { circulo: null, maximo: 0, gastos: 0 },
  }

  const legada = f as unknown as Record<string, unknown>
  legada.magia = magiaLegada
  delete (legada.identidade as Record<string, unknown>).multiclasses
  delete (legada.identidade as Record<string, unknown>).distribuicao_antecedente

  return f
}

export function criarItemDaLista(id: string, ficha: Ficha, completa = true): FichaListItem {
  return {
    id,
    nome: ficha.identidade.nome_personagem ?? '',
    classe: ficha.identidade.classe_id ?? '—',
    especie: ficha.identidade.especie_id ?? '—',
    nivel: ficha.identidade.nivel,
    updatedAt: new Date().toISOString(),
    completa,
  }
}

/** Grava uma ficha no localStorage antes de qualquer script da página rodar. */
export async function semearFicha(
  page: Page,
  { id, ficha, completa = true }: { id: string; ficha: Ficha; completa?: boolean },
): Promise<void> {
  const item = criarItemDaLista(id, ficha, completa)
  await page.addInitScript(
    ({ chaveFicha, chaveLista, fichaJson, itemJson }) => {
      // roda a cada navegação: só semeia na primeira vez, senão desfaz
      // as alterações que o próprio app salvou.
      if (window.localStorage.getItem(chaveFicha)) return
      window.localStorage.setItem(chaveFicha, fichaJson)
      const brutoLista = window.localStorage.getItem(chaveLista)
      const lista = brutoLista ? JSON.parse(brutoLista) : []
      lista.push(JSON.parse(itemJson))
      window.localStorage.setItem(chaveLista, JSON.stringify(lista))
    },
    {
      chaveFicha: `${STORAGE_KEY_FICHA_PREFIX}${id}`,
      chaveLista: STORAGE_KEY_LISTA,
      fichaJson: JSON.stringify(ficha),
      itemJson: JSON.stringify(item),
    },
  )
}

/** Fixa o idioma da interface antes do carregamento (o i18n lê no boot). */
export async function definirIdioma(page: Page, lingua: 'pt' | 'en'): Promise<void> {
  await page.addInitScript(
    ({ chave, valor }) => window.localStorage.setItem(chave, valor),
    {
      chave: STORAGE_KEY_CONFIG,
      valor: JSON.stringify({
        state: {
          config: {
            rastrear_peso: true,
            gerenciar_ouro: true,
            reembolso_venda: true,
            moedas_simples: false,
            lingua,
          },
        },
        version: 0,
      }),
    },
  )
}

export async function lerLista(page: Page): Promise<FichaListItem[]> {
  const bruto = await page.evaluate(chave => window.localStorage.getItem(chave), STORAGE_KEY_LISTA)
  return bruto ? (JSON.parse(bruto) as FichaListItem[]) : []
}
