import type { EquipmentPack } from '../types'

export const EQUIPMENT_PACKS: EquipmentPack[] = [
  {
    item_type: 'kit',
    id: 'pacote_de_explorador',
    name: 'Pacote de Explorador',
    category: 'Pacote de Equipamento',
    price: '10 po',
    weight: '29.5 kg',
    included_items: [
      'Mochila',
      'Saco de dormir',
      'Kit de cozinha',
      'Caixa de fogo',
      '10 Tochas',
      '10 dias de Rações de viagem',
      'Cantil',
      'Corda de cânhamo (15 m)'
    ],
    description: 'O pacote mais versátil para viagens longas por estradas ou florestas. Garante sobrevivência básica na natureza por até dez dias.'
  },
  {
    item_type: 'kit',
    id: 'pacote_de_masmorrista',
    name: 'Pacote de Masmorrista',
    category: 'Pacote de Equipamento',
    price: '12 po',
    weight: '30.5 kg',
    included_items: [
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
    description: 'Ideal para explorar ruínas subterrâneas. Contém ferramentas para forçar portas, escalar paredes e prender armadilhas.'
  },
  {
    item_type: 'kit',
    id: 'pacote_de_artista',
    name: 'Pacote de Artista',
    category: 'Pacote de Equipamento',
    price: '40 po',
    weight: '17.0 kg',
    included_items: [
      'Mochila',
      'Saco de dormir',
      '2 Trajes de artista',
      '5 Velas',
      '5 dias de Rações de viagem',
      'Cantil',
      'Kit de disfarce'
    ],
    description: 'Excelente para bardos e farsantes. Inclui trajes para apresentações em cortes ou tavernas e recursos para manter a aparência em viagens.'
  },
  {
    item_type: 'kit',
    id: 'pacote_de_assaltante',
    name: 'Pacote de Assaltante',
    category: 'Pacote de Equipamento',
    price: '16 po',
    weight: '22.0 kg',
    included_items: [
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
    description: 'O kit definitivo para ladinos e infiltrações silenciosas. Focado em criar distrações, arrombar barreiras e detectar armadilhas.'
  },
  {
    item_type: 'kit',
    id: 'pacote_de_erudito',
    name: 'Pacote de Erudito',
    category: 'Pacote de Equipamento',
    price: '40 po',
    weight: '5.0 kg',
    included_items: [
      'Mochila',
      'Livro de estudo',
      'Tinta (frasco de 30 ml)',
      'Pena de ganso',
      '10 folhas de Pergaminho',
      'Faca de cortar papel',
      'Vidro de pó de giz'
    ],
    description: 'Perfeito para magos e clérigos focados em registro de conhecimento, deciframento de runas e cópia de pergaminhos mágicos.'
  },
  {
    item_type: 'kit',
    id: 'pacote_de_sacerdote',
    name: 'Pacote de Sacerdote',
    category: 'Pacote de Equipamento',
    price: '19 po',
    weight: '12.0 kg',
    included_items: [
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
    description: 'Para clérigos e paladinos realizarem ritos sagrados, abençoarem locais e conduzirem cerimônias durante as campanhas.'
  },
  {
    item_type: 'kit',
    id: 'pacote_de_diplomata',
    name: 'Pacote de Diplomata',
    category: 'Pacote de Equipamento',
    price: '39 po',
    weight: '16.5 kg',
    included_items: [
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
    description: 'Para interações de alta sociedade, negociações políticas e registros oficiais de tratados burocráticos.'
  }
]
