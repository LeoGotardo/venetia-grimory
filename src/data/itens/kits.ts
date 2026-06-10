import type { PacoteEquipamento } from './types'

export const PACOTES_DE_EQUIPAMENTO: PacoteEquipamento[] = [
  {
    tipo_item: 'kit',
    id: 'pacote_de_explorador',
    nome: 'Pacote de Explorador',
    categoria: 'Pacote de Equipamento',
    preco: '10 po',
    peso: '29.5 kg',
    itens_incluidos: [
      'Mochila',
      'Saco de dormir',
      'Kit de cozinha',
      'Caixa de fogo',
      '10 Tochas',
      '10 dias de Rações de viagem',
      'Cantil',
      'Corda de cânhamo (15 m)'
    ],
    descricao: 'O pacote mais versátil para viagens longas por estradas ou florestas. Garante sobrevivência básica na natureza por até dez dias.'
  },
  {
    tipo_item: 'kit',
    id: 'pacote_de_masmorrista',
    nome: 'Pacote de Masmorrista',
    categoria: 'Pacote de Equipamento',
    preco: '12 po',
    peso: '30.5 kg',
    itens_incluidos: [
      'Mochila',
      'Pé de cabra',
      'Martelo',
      '10 Pítons',
      '10 Tochas',
      'Caixa de fogo',
      '10 dias de Rações de viagem',
      'Cantil',
      'Corda de cânhamo (15 m)'
    ],
    descricao: 'Ideal para explorar ruínas subterrâneas. Contém ferramentas para forçar portas, escalar paredes e prender armadilhas.'
  },
  {
    tipo_item: 'kit',
    id: 'pacote_de_artista',
    nome: 'Pacote de Artista',
    categoria: 'Pacote de Equipamento',
    preco: '40 po',
    peso: '17.0 kg',
    itens_incluidos: [
      'Mochila',
      'Saco de dormir',
      '2 Trajes de artista',
      '5 Velas',
      '5 dias de Rações de viagem',
      'Cantil',
      'Kit de disfarce'
    ],
    descricao: 'Excelente para bardos e farsantes. Inclui trajes para apresentações em cortes ou tavernas e recursos para manter a aparência em viagens.'
  },
  {
    tipo_item: 'kit',
    id: 'pacote_de_assaltante',
    nome: 'Pacote de Assaltante',
    categoria: 'Pacote de Equipamento',
    preco: '16 po',
    peso: '22.0 kg',
    itens_incluidos: [
      'Mochila',
      'Saco de 1.000 esferas de rolamento',
      '10 m de linha de fio',
      'Sino',
      '5 Velas',
      'Pé de cabra',
      'Lanterna furta-fogo',
      '2 Frascos de óleo',
      '5 dias de Rações de viagem',
      'Cantil',
      'Corda de cânhamo (15 m)'
    ],
    descricao: 'O kit definitivo para ladinos e infiltrações silenciosas. Focado em criar distrações, arrombar barreiras e detectar armadilhas.'
  },
  {
    tipo_item: 'kit',
    id: 'pacote_de_erudito',
    nome: 'Pacote de Erudito',
    categoria: 'Pacote de Equipamento',
    preco: '40 po',
    peso: '5.0 kg',
    itens_incluidos: [
      'Mochila',
      'Livro de estudo',
      'Tinta (frasco de 30 ml)',
      'Pena de ganso',
      '10 folhas de Pergaminho',
      'Faca de cortar papel',
      'Vidro de pó de giz'
    ],
    descricao: 'Perfeito para magos e clérigos focados em registro de conhecimento, deciframento de runas e cópia de pergaminhos mágicos.'
  },
  {
    tipo_item: 'kit',
    id: 'pacote_de_sacerdote',
    nome: 'Pacote de Sacerdote',
    categoria: 'Pacote de Equipamento',
    preco: '19 po',
    peso: '12.0 kg',
    itens_incluidos: [
      'Mochila',
      'Manta acolchoada',
      '10 Velas',
      'Caixa de fogo',
      'Caixa de esmolas',
      '2 blocos de Incenso',
      'Incensário',
      'Vestes clericais',
      '2 dias de Rações de viagem',
      'Cantil'
    ],
    descricao: 'Para clérigos e paladinos realizarem ritos sagrados, abençoarem locais e conduzirem cerimônias durante as campanhas.'
  },
  {
    tipo_item: 'kit',
    id: 'pacote_de_diplomata',
    nome: 'Pacote de Diplomata',
    categoria: 'Pacote de Equipamento',
    preco: '39 po',
    peso: '16.5 kg',
    itens_incluidos: [
      'Cofre pequeno',
      '2 caixas de Pergaminhos',
      'Roupas finas',
      'Tinta',
      'Pena de ganso',
      'Lacre de cera',
      'Sinete personalizado',
      '5 Velas',
      'Lâmpada de óleo',
      '2 Frascos de óleo',
      'Frasco de perfume'
    ],
    descricao: 'Para interações de alta sociedade, negociações políticas e registros oficiais de tratados burocráticos.'
  }
]
