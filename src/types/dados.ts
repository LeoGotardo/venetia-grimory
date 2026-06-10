export type AtributoId = 'FOR' | 'DES' | 'CON' | 'INT' | 'SAB' | 'CAR'

export interface Pericia {
  id: string
  nome: string
  atributo: AtributoId
}

export interface Subclasse {
  id: string
  nome: string
  descricao?: string
}

export interface ProgressaoNivel {
  nivel: number
  bonus_prof: number
  destaques: string[]
  furias?: number
  dano_furia?: number
  espacos_de_magia?: Record<string, number>
  [key: string]: unknown
}

export interface Classe {
  id: string
  nome: string
  descricao: string
  interesse: string
  dado_vida: number
  atributos_primarios: AtributoId[]
  salvaguardas: AtributoId[]
  num_pericias: number
  pericias_disponiveis: string[] | 'qualquer'
  armas: string[]
  armaduras: string[]
  ferramentas: string[]
  equipamento_inicial: { A: string; B: string }
  conjurador: boolean
  atributo_conjuracao?: AtributoId
  complexidade: 'Baixa' | 'Média' | 'Alta'
  mecanica_exclusiva?: string[]
  caracteristicas_nivel1: string[]
  subclasses: Subclasse[]
  nivel_subclasse?: number
  progressao: ProgressaoNivel[]
  idiomas_concedidos?: string[]
}

export interface Traco {
  nome: string
  descricao: string
  usos_maximos?: number | string
}

export interface Linhagem {
  id: string
  nome: string
  descricao?: string
  tracos?: Traco[]
}

export interface Especie {
  id: string
  nome: string
  descricao?: string
  tamanho: string
  deslocamento: number
  visao_no_escuro?: number
  tracos: Traco[]
  linhagens?: Linhagem[]
}

export interface Antecedente {
  id: string
  nome: string
  descricao?: string
  atributos_sugeridos: AtributoId[]
  talento: string
  pericias: string[]
  ferramenta?: string
  equipamento_inicial: string
}

export interface Armadura {
  id: string
  nome: string
  categoria: 'Leve' | 'Média' | 'Pesada' | 'Escudo'
  ca: string | number
  requisito_for?: number
  penalidade_furtividade?: boolean
  custo_po?: number
  peso_kg?: number
}

export interface Arma {
  id: string
  nome: string
  categoria: string
  dano: string
  tipo_dano: string
  propriedades: string[]
  maestria?: string
  peso_kg?: number
  custo_po?: number
}

export interface EquipamentoAventura {
  id: string
  nome: string
  categoria: string
  custo_po?: number
  peso_kg?: number
  notas?: string
}

export interface Talento {
  id: string
  nome: string
  descricao: string
  prereq?: string
}

export interface DadosJogo {
  meta: { fonte: string; traducao: string; versao: string }
  atributos: Array<{ id: AtributoId; nome: string }>
  pericias: Pericia[]
  idiomas: { comuns: Array<{ id: string; nome: string; origem: string }>; raros: Array<{ id: string; nome: string; origem: string }> }
  bonus_proficiencia_por_nivel: Record<string, number>
  modificadores_valor?: Record<string, number>
  formulas: Record<string, string>
  classes: Classe[]
  especies: Especie[]
  antecedentes: Antecedente[]
  armaduras: Armadura[]
  armas: Arma[]
  talentos_de_origem?: Talento[]
  equipamentos_aventura?: EquipamentoAventura[]
  kits?: EquipamentoAventura[]
  ferramentas?: Record<string, unknown>
  atributos_sugeridos_por_classe?: Record<string, AtributoId[]>
  regra_atributos_antecedente?: string
  regra_idiomas_iniciais?: string
}
