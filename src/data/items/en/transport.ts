import type { Transport } from '../types'

export const MOUNTS_AND_VEHICLES: Transport[] = [
  // ─── MOUNTS AND PACK ANIMALS ──────────────────────────────────────────────
  {
    item_type: 'transporte',
    id: 'cavalo_de_montaria',
    name: 'Riding Horse',
    category: 'Land Mount',
    price: '75 po',
    speed: '60 ft',
    carry_capacity: '240 kg',
    description: 'A standard horse trained to carry travelers. Not ideal for direct combat and may spook amid the chaos of battle.'
  },
  {
    item_type: 'transporte',
    id: 'cavalo_de_guerra',
    name: 'Warhorse',
    category: 'Land Mount',
    price: '400 po',
    speed: '60 ft',
    carry_capacity: '270 kg',
    description: 'An imposing mount trained for combat. It does not spook from swords and can make hoof attacks during battles.'
  },
  {
    item_type: 'transporte',
    id: 'ponei',
    name: 'Pony',
    category: 'Land Mount',
    price: '30 po',
    speed: '40 ft',
    carry_capacity: '112.5 kg',
    description: 'A smaller mount, ideal for Small-sized races like Halflings and Gnomes. Also used as a pack animal in mines.'
  },
  {
    item_type: 'transporte',
    id: 'camelo',
    name: 'Camel',
    category: 'Land Mount',
    price: '50 po',
    speed: '50 ft',
    carry_capacity: '240 kg',
    description: 'A resilient mount for arid climates and deserts. Can go several days without water and carries heavy loads over long distances.'
  },
  {
    item_type: 'transporte',
    id: 'elefante',
    name: 'Elephant',
    category: 'Land Mount',
    price: '200 po',
    speed: '40 ft',
    carry_capacity: '660 kg',
    description: 'A colossal mount capable of carrying enormous amounts of cargo or multiple passengers. Rare outside tropical and jungle regions.'
  },
  {
    item_type: 'transporte',
    id: 'burro_ou_mula',
    name: 'Donkey or Mule',
    category: 'Pack Animal',
    price: '8 po',
    speed: '40 ft',
    carry_capacity: '210 kg',
    description: 'Sturdy, stubborn animals with excellent carrying capacity. Slow but resilient on steep paths and difficult terrain.'
  },

  // ─── TACK AND ACCESSORIES ─────────────────────────────────────────────────
  {
    item_type: 'transporte',
    id: 'sela_de_viagem',
    name: 'Riding Saddle',
    category: 'Tack',
    price: '10 po',
    weight: '5.0 kg',
    description: 'A padded saddle designed to ensure comfort for rider and mount during long journeys of consecutive days.'
  },
  {
    item_type: 'transporte',
    id: 'sela_de_guerra',
    name: 'Military Saddle',
    category: 'Tack',
    price: '20 po',
    weight: '15.0 kg',
    description: 'A heavy saddle with tall supports in front and back. Grants advantage on checks to avoid falling from a mount during mounted combat.'
  },
  {
    item_type: 'transporte',
    id: 'alforjes',
    name: 'Saddlebags',
    category: 'Accessory',
    price: '4 po',
    weight: '4.0 kg',
    description: "Two leather pouches connected across the mount's back. Allows the animal to carry up to 30 kg of extra equipment."
  },

  // ─── LAND VEHICLES ────────────────────────────────────────────────────────
  {
    item_type: 'transporte',
    id: 'carroca',
    name: 'Cart',
    category: 'Land Vehicle',
    price: '15 po',
    weight: '100.0 kg',
    description: 'A simple two-wheeled vehicle pulled by a single mount. Widely used by merchants to transport crates and provisions.'
  },
  {
    item_type: 'transporte',
    id: 'carruagem',
    name: 'Carriage',
    category: 'Land Vehicle',
    price: '250 po',
    weight: '300.0 kg',
    description: 'A luxurious, comfortable closed four-wheeled vehicle for transporting noble passengers. Usually pulled by two or four horses.'
  },

  // ─── WATER VEHICLES ───────────────────────────────────────────────────────
  {
    item_type: 'transporte',
    id: 'bote_a_remos',
    name: 'Rowboat',
    category: 'Water Vehicle',
    price: '50 po',
    speed: '2 km/h',
    description: 'A small wooden vessel for up to 4 passengers, propelled by arm strength. Ideal for crossing rivers or calm lakes.'
  },
  {
    item_type: 'transporte',
    id: 'gale',
    name: 'Galley',
    category: 'Water Vehicle',
    price: '30000 po',
    speed: '6 km/h',
    description: 'A large war vessel propelled by oars and sails. Requires a crew of up to 80 rowers and can accommodate a full military contingent.'
  },
  {
    item_type: 'transporte',
    id: 'navio_veleiro',
    name: 'Sailing Ship',
    category: 'Water Vehicle',
    price: '10000 po',
    speed: '3.5 km/h',
    description: 'A large sail-powered vessel with a full crew. Capable of crossing oceans carrying tons of cargo and dozens of passengers.'
  },
  {
    item_type: 'transporte',
    id: 'navio_de_guerra',
    name: 'Warship',
    category: 'Water Vehicle',
    price: '25000 po',
    speed: '4 km/h',
    description: 'A floating fortress reinforced for naval combat. Has space for ballistae, catapults, and entire military contingents.'
  }
]
