export interface Arma {
  tipo_item: 'arma'
  id: string
  nome: string
  categoria: 'Simples' | 'Marcial'
  tipo: 'Corpo a Corpo' | 'À Distância'
  preco: string
  dano: string
  tipo_dano: string
  peso: string
  propriedades: string[]
  descricao: string
}

export interface Armadura {
  tipo_item: 'armadura'
  id: string
  nome: string
  categoria: 'Leve' | 'Média' | 'Pesada' | 'Escudo'
  preco: string
  ca: string
  forca_minima: number | null
  desvantagem_furtividade: boolean
  peso: string
  descricao: string
}

export interface Ferramenta {
  tipo_item: 'ferramenta'
  id: string
  nome: string
  categoria: 'Ferramentas de Artesão' | 'Utilitário' | 'Jogos' | 'Instrumento Musical'
  preco: string
  peso: string
  descricao: string
  preco_venda?: string
}

export interface PacoteEquipamento {
  tipo_item: 'kit'
  id: string
  nome: string
  categoria: 'Pacote de Equipamento'
  preco: string
  peso: string
  itens_incluidos: string[]
  descricao: string
}

export interface Transporte {
  tipo_item: 'transporte'
  id: string
  nome: string
  categoria: 'Montaria Terrestre' | 'Animal de Carga' | 'Arreio' | 'Acessório' | 'Veículo Terrestre' | 'Veículo Aquático'
  preco: string
  peso?: string
  deslocamento?: string
  capacidade_carga?: string
  descricao: string
}

export interface ItemMagico {
  tipo_item: 'item_magico'
  id: string
  nome: string
  categoria: string
  raridade: 'Comum' | 'Incomum' | 'Raro' | 'Muito Raro' | 'Lendário'
  preco: string
  sintonia?: boolean
  circulo?: number
  id_magia?: string
  efeito?: string
  descricao: string
}

export type Item = Arma | Armadura | Ferramenta | PacoteEquipamento | Transporte | ItemMagico
