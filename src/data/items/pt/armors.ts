import type { Armor } from '../types'

export const ARMORS: Armor[] = [
  // ─── ARMADURAS LEVES ──────────────────────────────────────────────────────
  {
    item_type: 'armadura',
    id: 'acolchoada',
    name: 'Acolchoada',
    category: 'Leve',
    price: '5 po',
    ac: '11 + Des',
    min_strength: null,
    stealth_disadvantage: true,
    weight: '4.0 kg',
    description: 'Camadas acolchoadas de tecido e panos costurados. Leve e barata, mas o volume do tecido restringe movimentos silenciosos.'
  },
  {
    item_type: 'armadura',
    id: 'couro',
    name: 'Couro',
    category: 'Leve',
    price: '10 po',
    ac: '11 + Des',
    min_strength: null,
    stealth_disadvantage: false,
    weight: '5.0 kg',
    description: 'Peitoral e ombreiras de couro fervido em óleo, com partes mais macias e flexíveis. Boa proteção sem comprometer a furtividade.'
  },
  {
    item_type: 'armadura',
    id: 'couro_batido',
    name: 'Couro Batido',
    category: 'Leve',
    price: '45 po',
    ac: '12 + Des',
    min_strength: null,
    stealth_disadvantage: false,
    weight: '6.5 kg',
    description: 'Couro resistente e flexível reforçado com rebites de metal. Maior proteção que o couro comum sem perder a mobilidade do usuário.'
  },

  // ─── ARMADURAS MÉDIAS ─────────────────────────────────────────────────────
  {
    item_type: 'armadura',
    id: 'gibelao_de_couro',
    name: 'Gibelão de Couro',
    category: 'Média',
    price: '10 po',
    ac: '12 + Des (máx. +2)',
    min_strength: null,
    stealth_disadvantage: false,
    weight: '6.0 kg',
    description: 'Jaqueta de couro grosso reforçada por dentro com tiras de metal verticais. Bom equilíbrio de defesa para aventureiros ágeis.'
  },
  {
    item_type: 'armadura',
    id: 'camisao_de_malha',
    name: 'Camisão de Malha',
    category: 'Média',
    price: '50 po',
    ac: '13 + Des (máx. +2)',
    min_strength: null,
    stealth_disadvantage: false,
    weight: '10.0 kg',
    description: 'Anéis de metal interligados vestidos entre camadas de couro para evitar atrito. Ótima proteção sem ruído excessivo ao mover.'
  },
  {
    item_type: 'armadura',
    id: 'brunea',
    name: 'Brunéia',
    category: 'Média',
    price: '50 po',
    ac: '14 + Des (máx. +2)',
    min_strength: null,
    stealth_disadvantage: true,
    weight: '22.5 kg',
    description: 'Casaco de couro coberto com escamas de metal sobrepostas, como a pele de um crocodilo. As escamas estalam com o movimento.'
  },
  {
    item_type: 'armadura',
    id: 'courace',
    name: 'Couraça',
    category: 'Média',
    price: '400 po',
    ac: '14 + Des (máx. +2)',
    min_strength: null,
    stealth_disadvantage: false,
    weight: '10.0 kg',
    description: 'Peitoral de metal moldado com couro flexível nos membros. Protege órgãos vitais sem sacrificar agilidade ou furtividade.'
  },
  {
    item_type: 'armadura',
    id: 'meia_armadura',
    name: 'Meia-Armadura',
    category: 'Média',
    price: '750 po',
    ac: '15 + Des (máx. +2)',
    min_strength: null,
    stealth_disadvantage: true,
    weight: '20.0 kg',
    description: 'Placas de metal moldadas cobrindo a maior parte do corpo. Excelente proteção mas o metal pesado compromete completamente a furtividade.'
  },

  // ─── ARMADURAS PESADAS ────────────────────────────────────────────────────
  {
    item_type: 'armadura',
    id: 'cota_de_aneis',
    name: 'Cota de Anéis',
    category: 'Pesada',
    price: '30 po',
    ac: '14',
    min_strength: null,
    stealth_disadvantage: true,
    weight: '20.0 kg',
    description: 'Couro grosso com pesados anéis de metal costurados no exterior. Proteção pesada de baixo custo, mas barulhenta e desconfortável.'
  },
  {
    item_type: 'armadura',
    id: 'cota_de_malha',
    name: 'Cota de Malha',
    category: 'Pesada',
    price: '75 po',
    ac: '16',
    min_strength: 13,
    stealth_disadvantage: true,
    weight: '27.5 kg',
    description: 'Anéis de metal interligados cobrindo o corpo inteiro. O peso exige estrutura física robusta e torna qualquer movimento furtivo impossível.'
  },
  {
    item_type: 'armadura',
    id: 'cota_de_talas',
    name: 'Cota de Talas',
    category: 'Pesada',
    price: '200 po',
    ac: '17',
    min_strength: 15,
    stealth_disadvantage: true,
    weight: '30.0 kg',
    description: 'Tiras verticais de metal rebitadas a couro sobre acolchoamento de tecido. Proteção formidável a passos inegavelmente pesados.'
  },
  {
    item_type: 'armadura',
    id: 'armadura_completa',
    name: 'Armadura Completa',
    category: 'Pesada',
    price: '1500 po',
    ac: '18',
    min_strength: 15,
    stealth_disadvantage: true,
    weight: '32.5 kg',
    description: 'O ápice da proteção física. Placas de metal moldadas cobrem o corpo inteiro, incluindo luvas, botas de montaria e elmo com viseira.'
  },

  // ─── ESCUDOS ──────────────────────────────────────────────────────────────
  {
    item_type: 'armadura',
    id: 'escudo',
    name: 'Escudo',
    category: 'Escudo',
    price: '10 po',
    ac: '+2',
    min_strength: null,
    stealth_disadvantage: false,
    weight: '3.0 kg',
    description: 'Escudo clássico de madeira pesada ou metal. Ocupa uma mão mas concede bônus fixo de +2 na Classe de Armadura.'
  }
]
