import type { Armadura } from '../types'

export const ARMADURAS: Armadura[] = [
  // ─── ARMADURAS LEVES ──────────────────────────────────────────────────────
  {
    tipo_item: 'armadura',
    id: 'acolchoada',
    nome: 'Acolchoada',
    categoria: 'Leve',
    preco: '5 po',
    ca: '11 + Des',
    forca_minima: null,
    desvantagem_furtividade: true,
    peso: '4.0 kg',
    descricao: 'Camadas acolchoadas de tecido e panos costurados. Leve e barata, mas o volume do tecido restringe movimentos silenciosos.'
  },
  {
    tipo_item: 'armadura',
    id: 'couro',
    nome: 'Couro',
    categoria: 'Leve',
    preco: '10 po',
    ca: '11 + Des',
    forca_minima: null,
    desvantagem_furtividade: false,
    peso: '5.0 kg',
    descricao: 'Peitoral e ombreiras de couro fervido em óleo, com partes mais macias e flexíveis. Boa proteção sem comprometer a furtividade.'
  },
  {
    tipo_item: 'armadura',
    id: 'couro_batido',
    nome: 'Couro Batido',
    categoria: 'Leve',
    preco: '45 po',
    ca: '12 + Des',
    forca_minima: null,
    desvantagem_furtividade: false,
    peso: '6.5 kg',
    descricao: 'Couro resistente e flexível reforçado com rebites de metal. Maior proteção que o couro comum sem perder a mobilidade do usuário.'
  },

  // ─── ARMADURAS MÉDIAS ─────────────────────────────────────────────────────
  {
    tipo_item: 'armadura',
    id: 'gibelao_de_couro',
    nome: 'Gibelão de Couro',
    categoria: 'Média',
    preco: '10 po',
    ca: '12 + Des (máx. +2)',
    forca_minima: null,
    desvantagem_furtividade: false,
    peso: '6.0 kg',
    descricao: 'Jaqueta de couro grosso reforçada por dentro com tiras de metal verticais. Bom equilíbrio de defesa para aventureiros ágeis.'
  },
  {
    tipo_item: 'armadura',
    id: 'camisao_de_malha',
    nome: 'Camisão de Malha',
    categoria: 'Média',
    preco: '50 po',
    ca: '13 + Des (máx. +2)',
    forca_minima: null,
    desvantagem_furtividade: false,
    peso: '10.0 kg',
    descricao: 'Anéis de metal interligados vestidos entre camadas de couro para evitar atrito. Ótima proteção sem ruído excessivo ao mover.'
  },
  {
    tipo_item: 'armadura',
    id: 'brunea',
    nome: 'Brunéia',
    categoria: 'Média',
    preco: '50 po',
    ca: '14 + Des (máx. +2)',
    forca_minima: null,
    desvantagem_furtividade: true,
    peso: '22.5 kg',
    descricao: 'Casaco de couro coberto com escamas de metal sobrepostas, como a pele de um crocodilo. As escamas estalam com o movimento.'
  },
  {
    tipo_item: 'armadura',
    id: 'courace',
    nome: 'Couraça',
    categoria: 'Média',
    preco: '400 po',
    ca: '14 + Des (máx. +2)',
    forca_minima: null,
    desvantagem_furtividade: false,
    peso: '10.0 kg',
    descricao: 'Peitoral de metal moldado com couro flexível nos membros. Protege órgãos vitais sem sacrificar agilidade ou furtividade.'
  },
  {
    tipo_item: 'armadura',
    id: 'meia_armadura',
    nome: 'Meia-Armadura',
    categoria: 'Média',
    preco: '750 po',
    ca: '15 + Des (máx. +2)',
    forca_minima: null,
    desvantagem_furtividade: true,
    peso: '20.0 kg',
    descricao: 'Placas de metal moldadas cobrindo a maior parte do corpo. Excelente proteção mas o metal pesado compromete completamente a furtividade.'
  },

  // ─── ARMADURAS PESADAS ────────────────────────────────────────────────────
  {
    tipo_item: 'armadura',
    id: 'cota_de_aneis',
    nome: 'Cota de Anéis',
    categoria: 'Pesada',
    preco: '30 po',
    ca: '14',
    forca_minima: null,
    desvantagem_furtividade: true,
    peso: '20.0 kg',
    descricao: 'Couro grosso com pesados anéis de metal costurados no exterior. Proteção pesada de baixo custo, mas barulhenta e desconfortável.'
  },
  {
    tipo_item: 'armadura',
    id: 'cota_de_malha',
    nome: 'Cota de Malha',
    categoria: 'Pesada',
    preco: '75 po',
    ca: '16',
    forca_minima: 13,
    desvantagem_furtividade: true,
    peso: '27.5 kg',
    descricao: 'Anéis de metal interligados cobrindo o corpo inteiro. O peso exige estrutura física robusta e torna qualquer movimento furtivo impossível.'
  },
  {
    tipo_item: 'armadura',
    id: 'cota_de_talas',
    nome: 'Cota de Talas',
    categoria: 'Pesada',
    preco: '200 po',
    ca: '17',
    forca_minima: 15,
    desvantagem_furtividade: true,
    peso: '30.0 kg',
    descricao: 'Tiras verticais de metal rebitadas a couro sobre acolchoamento de tecido. Proteção formidável a passos inegavelmente pesados.'
  },
  {
    tipo_item: 'armadura',
    id: 'armadura_completa',
    nome: 'Armadura Completa',
    categoria: 'Pesada',
    preco: '1500 po',
    ca: '18',
    forca_minima: 15,
    desvantagem_furtividade: true,
    peso: '32.5 kg',
    descricao: 'O ápice da proteção física. Placas de metal moldadas cobrem o corpo inteiro, incluindo luvas, botas de montaria e elmo com viseira.'
  },

  // ─── ESCUDOS ──────────────────────────────────────────────────────────────
  {
    tipo_item: 'armadura',
    id: 'escudo',
    nome: 'Escudo',
    categoria: 'Escudo',
    preco: '10 po',
    ca: '+2',
    forca_minima: null,
    desvantagem_furtividade: false,
    peso: '3.0 kg',
    descricao: 'Escudo clássico de madeira pesada ou metal. Ocupa uma mão mas concede bônus fixo de +2 na Classe de Armadura.'
  }
]
