import type { EquipmentPack } from '../types'

export const EQUIPMENT_PACKS: EquipmentPack[] = [
  {
    item_type: 'kit',
    id: 'pacote_de_explorador',
    name: "Explorer's Pack",
    category: 'Equipment Pack',
    price: '10 po',
    weight: '29.5 kg',
    included_items: [
      'Backpack',
      'Bedroll',
      'Mess kit',
      'Tinderbox',
      '10 Torches',
      '10 days of Rations',
      'Waterskin',
      "Hemp Rope (50 ft)"
    ],
    description: 'The most versatile pack for long journeys through roads or forests. Provides basic survival in the wild for up to ten days.'
  },
  {
    item_type: 'kit',
    id: 'pacote_de_masmorrista',
    name: "Dungeoneer's Pack",
    category: 'Equipment Pack',
    price: '12 po',
    weight: '30.5 kg',
    included_items: [
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
    description: 'Ideal for exploring underground ruins. Contains tools to force doors, climb walls, and secure traps.'
  },
  {
    item_type: 'kit',
    id: 'pacote_de_artista',
    name: "Entertainer's Pack",
    category: 'Equipment Pack',
    price: '40 po',
    weight: '17.0 kg',
    included_items: [
      'Backpack',
      'Bedroll',
      '2 Costumes',
      '5 Candles',
      '5 days of Rations',
      'Waterskin',
      'Disguise Kit'
    ],
    description: 'Excellent for bards and performers. Includes costumes for court or tavern performances and resources to maintain appearance while traveling.'
  },
  {
    item_type: 'kit',
    id: 'pacote_de_assaltante',
    name: "Burglar's Pack",
    category: 'Equipment Pack',
    price: '16 po',
    weight: '22.0 kg',
    included_items: [
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
    description: 'The ultimate kit for rogues and silent infiltrations. Focused on creating distractions, breaking barriers, and detecting traps.'
  },
  {
    item_type: 'kit',
    id: 'pacote_de_erudito',
    name: "Scholar's Pack",
    category: 'Equipment Pack',
    price: '40 po',
    weight: '5.0 kg',
    included_items: [
      'Backpack',
      'Book of lore',
      'Ink (1 oz bottle)',
      'Ink pen',
      '10 sheets of Parchment',
      'Little bag of sand',
      'Small knife'
    ],
    description: 'Perfect for wizards and clerics focused on recording knowledge, deciphering runes, and copying spell scrolls.'
  },
  {
    item_type: 'kit',
    id: 'pacote_de_sacerdote',
    name: "Priest's Pack",
    category: 'Equipment Pack',
    price: '19 po',
    weight: '12.0 kg',
    included_items: [
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
    description: 'For clerics and paladins to conduct sacred rites, bless locations, and hold ceremonies during campaigns.'
  },
  {
    item_type: 'kit',
    id: 'pacote_de_diplomata',
    name: "Diplomat's Pack",
    category: 'Equipment Pack',
    price: '39 po',
    weight: '16.5 kg',
    included_items: [
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
    description: 'For high-society interactions, political negotiations, and official records of bureaucratic treaties.'
  }
]
