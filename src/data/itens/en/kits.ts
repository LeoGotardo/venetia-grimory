import type { PacoteEquipamento } from '../types'

export const PACOTES_DE_EQUIPAMENTO: PacoteEquipamento[] = [
  {
    tipo_item: 'kit',
    id: 'pacote_de_explorador',
    nome: "Explorer's Pack",
    categoria: 'Equipment Pack',
    preco: '10 po',
    peso: '29.5 kg',
    itens_incluidos: [
      'Backpack',
      'Bedroll',
      'Mess kit',
      'Tinderbox',
      '10 Torches',
      '10 days of Rations',
      'Waterskin',
      "Hemp Rope (50 ft)"
    ],
    descricao: 'The most versatile pack for long journeys through roads or forests. Provides basic survival in the wild for up to ten days.'
  },
  {
    tipo_item: 'kit',
    id: 'pacote_de_masmorrista',
    nome: "Dungeoneer's Pack",
    categoria: 'Equipment Pack',
    preco: '12 po',
    peso: '30.5 kg',
    itens_incluidos: [
      'Backpack',
      'Crowbar',
      'Hammer',
      '10 Pitons',
      '10 Torches',
      'Tinderbox',
      '10 days of Rations',
      'Waterskin',
      "Hemp Rope (50 ft)"
    ],
    descricao: 'Ideal for exploring underground ruins. Contains tools to force doors, climb walls, and secure traps.'
  },
  {
    tipo_item: 'kit',
    id: 'pacote_de_artista',
    nome: "Entertainer's Pack",
    categoria: 'Equipment Pack',
    preco: '40 po',
    peso: '17.0 kg',
    itens_incluidos: [
      'Backpack',
      'Bedroll',
      '2 Costumes',
      '5 Candles',
      '5 days of Rations',
      'Waterskin',
      'Disguise Kit'
    ],
    descricao: 'Excellent for bards and performers. Includes costumes for court or tavern performances and resources to maintain appearance while traveling.'
  },
  {
    tipo_item: 'kit',
    id: 'pacote_de_assaltante',
    nome: "Burglar's Pack",
    categoria: 'Equipment Pack',
    preco: '16 po',
    peso: '22.0 kg',
    itens_incluidos: [
      'Backpack',
      'Bag of 1,000 ball bearings',
      '10 ft of string',
      'Bell',
      '5 Candles',
      'Crowbar',
      'Hooded lantern',
      '2 flasks of Oil',
      '5 days of Rations',
      'Waterskin',
      "Hemp Rope (50 ft)"
    ],
    descricao: 'The ultimate kit for rogues and silent infiltrations. Focused on creating distractions, breaking barriers, and detecting traps.'
  },
  {
    tipo_item: 'kit',
    id: 'pacote_de_erudito',
    nome: "Scholar's Pack",
    categoria: 'Equipment Pack',
    preco: '40 po',
    peso: '5.0 kg',
    itens_incluidos: [
      'Backpack',
      'Book of lore',
      'Ink (1 oz bottle)',
      'Ink pen',
      '10 sheets of Parchment',
      'Little bag of sand',
      'Small knife'
    ],
    descricao: 'Perfect for wizards and clerics focused on recording knowledge, deciphering runes, and copying spell scrolls.'
  },
  {
    tipo_item: 'kit',
    id: 'pacote_de_sacerdote',
    nome: "Priest's Pack",
    categoria: 'Equipment Pack',
    preco: '19 po',
    peso: '12.0 kg',
    itens_incluidos: [
      'Backpack',
      'Blanket',
      '10 Candles',
      'Tinderbox',
      'Alms box',
      '2 blocks of Incense',
      'Censer',
      'Vestments',
      '2 days of Rations',
      'Waterskin'
    ],
    descricao: 'For clerics and paladins to conduct sacred rites, bless locations, and hold ceremonies during campaigns.'
  },
  {
    tipo_item: 'kit',
    id: 'pacote_de_diplomata',
    nome: "Diplomat's Pack",
    categoria: 'Equipment Pack',
    preco: '39 po',
    peso: '16.5 kg',
    itens_incluidos: [
      'Chest',
      '2 cases for maps and scrolls',
      'Fine clothes',
      'Ink',
      'Ink pen',
      'Sealing wax',
      'Signet ring',
      '5 Candles',
      'Oil lamp',
      '2 flasks of Oil',
      'Perfume'
    ],
    descricao: 'For high-society interactions, political negotiations, and official records of bureaucratic treaties.'
  }
]
