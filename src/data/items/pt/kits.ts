import type { EquipmentPack } from '../types'

export const EQUIPMENT_PACKS: EquipmentPack[] = [
  {
    item_type: 'kit',
    id: 'pacote_de_assaltante',
    name: 'Pacote de Assaltante',
    category: 'Pacote de Equipamento',
    price: '16 po',
    weight: '22.0 kg',
    included_items: [
      'Mochila',
      'Rolamentos',
      'Sino',
      '10 Velas',
      'Pé de Cabra',
      'Lanterna Coberta',
      '7 frascos de Óleo',
      '5 dias de Rações',
      'Corda',
      'Isqueiro',
      'Odre'
    ],
    description: 'O kit definitivo para ladinos e infiltrações silenciosas. Focado em criar distrações, arrombar barreiras e detectar armadilhas.'
  },
  {
    item_type: 'kit',
    id: 'pacote_de_diplomata',
    name: 'Pacote de Diplomata',
    category: 'Pacote de Equipamento',
    price: '39 po',
    weight: '21.0 kg',
    included_items: [
      'Baú',
      'Roupas Finas',
      'Tinta',
      '5 Penas de Escrever',
      'Lamparina',
      '2 Estojos de Mapas ou Pergaminhos',
      '4 frascos de Óleo',
      '5 folhas de Papel',
      '5 folhas de Pergaminho',
      'Perfume',
      'Isqueiro'
    ],
    description: 'Para interações na alta sociedade, negociações políticas e o registro oficial de tratados burocráticos.'
  },
  {
    item_type: 'kit',
    id: 'pacote_de_masmorrista',
    name: 'Pacote de Masmorrista',
    category: 'Pacote de Equipamento',
    price: '12 po',
    weight: '27.5 kg',
    included_items: [
      'Mochila',
      'Estrepes',
      'Pé de Cabra',
      '2 frascos de Óleo',
      '10 dias de Rações',
      'Corda',
      'Isqueiro',
      '10 Tochas',
      'Odre'
    ],
    description: 'Ideal para explorar ruínas subterrâneas. Traz ferramentas para forçar portas, negar terreno e iluminar corredores.'
  },
  {
    item_type: 'kit',
    id: 'pacote_de_artista',
    name: 'Pacote de Artista',
    category: 'Pacote de Equipamento',
    price: '40 po',
    weight: '25.5 kg',
    included_items: [
      'Mochila',
      'Saco de Dormir',
      'Sino',
      'Lanterna de Foco',
      '3 Fantasias',
      'Espelho',
      '8 frascos de Óleo',
      '9 dias de Rações',
      'Isqueiro',
      'Odre'
    ],
    description: 'Excelente para bardos e artistas. Inclui fantasias para apresentações e recursos para manter a aparência em viagem.'
  },
  {
    item_type: 'kit',
    id: 'pacote_de_explorador',
    name: 'Pacote de Explorador',
    category: 'Pacote de Equipamento',
    price: '10 po',
    weight: '25.0 kg',
    included_items: [
      'Mochila',
      'Saco de Dormir',
      '2 frascos de Óleo',
      '10 dias de Rações',
      'Corda',
      'Isqueiro',
      '10 Tochas',
      'Odre'
    ],
    description: 'O pacote mais versátil para jornadas longas por estradas ou florestas. Garante sobrevivência básica no ermo por até dez dias.'
  },
  {
    item_type: 'kit',
    id: 'pacote_de_sacerdote',
    name: 'Pacote de Sacerdote',
    category: 'Pacote de Equipamento',
    price: '33 po',
    weight: '13.0 kg',
    included_items: [
      'Mochila',
      'Cobertor',
      'Água Benta',
      'Lamparina',
      '7 dias de Rações',
      'Manto',
      'Isqueiro'
    ],
    description: 'Para clérigos e paladinos conduzirem ritos sagrados, abençoarem locais e realizarem cerimônias em campanha.'
  },
  {
    item_type: 'kit',
    id: 'pacote_de_erudito',
    name: 'Pacote de Erudito',
    category: 'Pacote de Equipamento',
    price: '40 po',
    weight: '13.0 kg',
    included_items: [
      'Mochila',
      'Livro',
      'Tinta',
      'Pena de Escrever',
      'Lamparina',
      '10 frascos de Óleo',
      '10 folhas de Pergaminho',
      'Isqueiro'
    ],
    description: 'Perfeito para magos e clérigos focados em registrar conhecimento, decifrar runas e copiar pergaminhos.'
  }
]
