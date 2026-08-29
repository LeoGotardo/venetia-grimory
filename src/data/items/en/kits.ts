import type { EquipmentPack } from '../types'

export const EQUIPMENT_PACKS: EquipmentPack[] = [
  {
    item_type: 'kit',
    id: 'pacote_de_assaltante',
    name: "Burglar's Pack",
    category: 'Equipment Pack',
    price: '16 po',
    weight: '22.0 kg',
    included_items: [
      'Backpack',
      'Ball Bearings',
      'Bell',
      '10 Candles',
      'Crowbar',
      'Hooded Lantern',
      '7 flasks of Oil',
      '5 days of Rations',
      'Rope',
      'Tinderbox',
      'Waterskin'
    ],
    description: 'The ultimate kit for rogues and silent infiltrations. Focused on creating distractions, breaking barriers, and detecting traps.'
  },
  {
    item_type: 'kit',
    id: 'pacote_de_diplomata',
    name: "Diplomat's Pack",
    category: 'Equipment Pack',
    price: '39 po',
    weight: '21.0 kg',
    included_items: [
      'Chest',
      'Fine Clothes',
      'Ink',
      '5 Ink Pens',
      'Lamp',
      '2 Map or Scroll Cases',
      '4 flasks of Oil',
      '5 sheets of Paper',
      '5 sheets of Parchment',
      'Perfume',
      'Tinderbox'
    ],
    description: 'For high-society interactions, political negotiations, and official records of bureaucratic treaties.'
  },
  {
    item_type: 'kit',
    id: 'pacote_de_masmorrista',
    name: "Dungeoneer's Pack",
    category: 'Equipment Pack',
    price: '12 po',
    weight: '27.5 kg',
    included_items: [
      'Backpack',
      'Caltrops',
      'Crowbar',
      '2 flasks of Oil',
      '10 days of Rations',
      'Rope',
      'Tinderbox',
      '10 Torches',
      'Waterskin'
    ],
    description: 'Ideal for exploring underground ruins. Carries tools to force doors, deny ground, and light up corridors.'
  },
  {
    item_type: 'kit',
    id: 'pacote_de_artista',
    name: "Entertainer's Pack",
    category: 'Equipment Pack',
    price: '40 po',
    weight: '25.5 kg',
    included_items: [
      'Backpack',
      'Bedroll',
      'Bell',
      'Bullseye Lantern',
      '3 Costumes',
      'Mirror',
      '8 flasks of Oil',
      '9 days of Rations',
      'Tinderbox',
      'Waterskin'
    ],
    description: 'Excellent for bards and performers. Includes costumes for performances and resources to keep up appearances while traveling.'
  },
  {
    item_type: 'kit',
    id: 'pacote_de_explorador',
    name: "Explorer's Pack",
    category: 'Equipment Pack',
    price: '10 po',
    weight: '25.0 kg',
    included_items: [
      'Backpack',
      'Bedroll',
      '2 flasks of Oil',
      '10 days of Rations',
      'Rope',
      'Tinderbox',
      '10 Torches',
      'Waterskin'
    ],
    description: 'The most versatile pack for long journeys through roads or forests. Provides basic wilderness survival for up to ten days.'
  },
  {
    item_type: 'kit',
    id: 'pacote_de_sacerdote',
    name: "Priest's Pack",
    category: 'Equipment Pack',
    price: '33 po',
    weight: '13.0 kg',
    included_items: [
      'Backpack',
      'Blanket',
      'Holy Water',
      'Lamp',
      '7 days of Rations',
      'Robe',
      'Tinderbox'
    ],
    description: 'For clerics and paladins to conduct sacred rites, bless locations, and hold ceremonies during campaigns.'
  },
  {
    item_type: 'kit',
    id: 'pacote_de_erudito',
    name: "Scholar's Pack",
    category: 'Equipment Pack',
    price: '40 po',
    weight: '13.0 kg',
    included_items: [
      'Backpack',
      'Book',
      'Ink',
      'Ink Pen',
      'Lamp',
      '10 flasks of Oil',
      '10 sheets of Parchment',
      'Tinderbox'
    ],
    description: 'Perfect for wizards and clerics focused on recording knowledge, deciphering runes, and copying scrolls.'
  }
]
