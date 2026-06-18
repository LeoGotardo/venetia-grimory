import type { AtributoId } from './dados'

export interface AtributoFicha {
  valor: number | null
  _modificador: number | null
}

export interface ItemInventario {
  id_item: string | null
  nome: string
  categoria: string
  quantidade: number
  equipado: boolean
  custo_po: number | null
  peso_kg: number | null
  notas: string | null
}

export interface Ataque {
  nome: string
  arma_id: string | null
  tipo: 'Corpo a Corpo' | 'À Distância' | 'Magia'
  atributo_usado: AtributoId | null
  _bonus_ataque: number | null
  _dano: string | null
  tipo_dano: string | null
  propriedades: string[]
  notas: string | null
}

export interface TalentoAdquirido {
  talento_id: string
  nome: string
  categoria: string
  origem: string
  escolhas: Record<string, unknown>
}

export interface EspacoMagia {
  maximo: number
  gastos: number
}

export interface Ficha {
  identidade: {
    nome_personagem: string | null
    nome_jogador: string | null
    campanha: string | null
    classe_id: string | null
    subclasse_id: string | null
    nivel: number
    multiclasses: Array<{ classe_id: string; subclasse_id: string | null; nivel: number }>
    especie_id: string | null
    linhagem_id: string | null
    antecedente_id: string | null
    alinhamento: { etico: string | null; moral: string | null }
    idade: string | null
    altura: string | null
    peso: string | null
    olhos: string | null
    pele: string | null
    cabelo: string | null
    xp: number
  }
  atributos: {
    FOR: AtributoFicha
    DES: AtributoFicha
    CON: AtributoFicha
    INT: AtributoFicha
    SAB: AtributoFicha
    CAR: AtributoFicha
    metodo_geracao: string | null
  }
  combate: {
    _bonus_proficiencia: number | null
    pontos_de_vida: { maximo: number | null; atual: number; temporario: number }
    dados_de_vida: { tipo: string | null; total: number | null; gastos: number }
    classe_de_armadura: {
      valor: number | null
      origem: string | null
      escudo_equipado: boolean
      armadura_equipada_id: string | null
    }
    iniciativa: { _valor: number | null }
    deslocamento: { base_metros: number | null; bonus_metros: number; _total_metros: number | null }
    ataques: Ataque[]
    salvaguardas: Record<AtributoId, { proficiente: boolean; _valor: number | null }>
  }
  pericias: Record<string, { atributo: AtributoId; proficiente: boolean; expertise: boolean; _valor: number | null }>
  proficiencias: { armaduras: string[]; armas: string[]; ferramentas: string[]; idiomas: string[] }
  tracos_de_especie: {
    visao_no_escuro_metros: number | null
    tracos_ativos: Array<{ nome: string; descricao: string; usos_maximos?: number | string; usos_atuais?: number }>
    escolhas_feitas: Record<string, unknown>
  }
  caracteristicas_de_classe: {
    ativas: Array<{ nome: string; descricao?: string; nivel_obtido?: number }>
    escolhas_feitas: Record<string, unknown>
    recursos_de_classe: {
      furias: { maximo: number | null; atual: number | null }
      inspiracao_de_bardo: { dado: string | null; maximo: number | null; atual: number | null }
      canalizar_divindade: { maximo: number | null; atual: number | null }
      formas_selvagens: { maximo: number | null; atual: number | null }
      pontos_de_feiticaria: { maximo: number | null; atual: number | null }
      imposicao_de_maos: { pool_pv: number | null; atual: number | null }
      pontos_de_foco: { maximo: number | null; atual: number | null }
      surto_de_acao: { usos: number | null; atual: number | null }
      recuperar_folego: { maximo: number | null; atual: number | null }
      ataque_furtivo: { dado: string | null }
      recuperacao_arcana: { circulos_recuperaveis: number | null }
    }
    ordem_divina: string | null
    estilo_de_luta: string | null
    juramento: string | null
  }
  magia: {
    conjurador: boolean
    atributo_conjuracao: AtributoId | null
    _cd_magia: number | null
    _bonus_ataque_magia: number | null
    truques_conhecidos: string[]
    magias_preparadas: string[]
    livro_de_magias: string[]
    espacos_de_magia: Record<'c1' | 'c2' | 'c3' | 'c4' | 'c5' | 'c6' | 'c7' | 'c8' | 'c9', EspacoMagia>
    espacos_pacto_bruxo: { circulo: number | null; maximo: number; gastos: number }
  }
  inventario: {
    moedas: { PC: number; PP: number; PE: number; PO: number; PL: number }
    itens: ItemInventario[]
  }
  talentos: { lista: TalentoAdquirido[] }
  personalidade: {
    tracos: string[]
    ideais: string[]
    vinculos: string[]
    fraquezas: string[]
    historia: string | null
    aparencia_descricao: string | null
    aliados_e_organizacoes: string | null
    simbolo_ou_tesouro: string | null
  }
  condicoes_ativas: string[]
  niveis_de_exaustao: number
  notas: string | null
}

export type FichaPartial = Partial<Ficha>
