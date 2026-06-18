import type { Transporte } from '../types'

export const MONTARIAS_E_VEICULOS: Transporte[] = [
  // ─── MOUNTS AND PACK ANIMALS ──────────────────────────────────────────────
  {
    tipo_item: 'transporte',
    id: 'cavalo_de_montaria',
    nome: 'Riding Horse',
    categoria: 'Land Mount',
    preco: '75 po',
    deslocamento: '60 ft',
    capacidade_carga: '240 kg',
    descricao: 'A standard horse trained to carry travelers. Not ideal for direct combat and may spook amid the chaos of battle.'
  },
  {
    tipo_item: 'transporte',
    id: 'cavalo_de_guerra',
    nome: 'Warhorse',
    categoria: 'Land Mount',
    preco: '400 po',
    deslocamento: '60 ft',
    capacidade_carga: '270 kg',
    descricao: 'An imposing mount trained for combat. It does not spook from swords and can make hoof attacks during battles.'
  },
  {
    tipo_item: 'transporte',
    id: 'ponei',
    nome: 'Pony',
    categoria: 'Land Mount',
    preco: '30 po',
    deslocamento: '40 ft',
    capacidade_carga: '112.5 kg',
    descricao: 'A smaller mount, ideal for Small-sized races like Halflings and Gnomes. Also used as a pack animal in mines.'
  },
  {
    tipo_item: 'transporte',
    id: 'camelo',
    nome: 'Camel',
    categoria: 'Land Mount',
    preco: '50 po',
    deslocamento: '50 ft',
    capacidade_carga: '240 kg',
    descricao: 'A resilient mount for arid climates and deserts. Can go several days without water and carries heavy loads over long distances.'
  },
  {
    tipo_item: 'transporte',
    id: 'elefante',
    nome: 'Elephant',
    categoria: 'Land Mount',
    preco: '200 po',
    deslocamento: '40 ft',
    capacidade_carga: '660 kg',
    descricao: 'A colossal mount capable of carrying enormous amounts of cargo or multiple passengers. Rare outside tropical and jungle regions.'
  },
  {
    tipo_item: 'transporte',
    id: 'burro_ou_mula',
    nome: 'Donkey or Mule',
    categoria: 'Pack Animal',
    preco: '8 po',
    deslocamento: '40 ft',
    capacidade_carga: '210 kg',
    descricao: 'Sturdy, stubborn animals with excellent carrying capacity. Slow but resilient on steep paths and difficult terrain.'
  },

  // ─── TACK AND ACCESSORIES ─────────────────────────────────────────────────
  {
    tipo_item: 'transporte',
    id: 'sela_de_viagem',
    nome: 'Riding Saddle',
    categoria: 'Tack',
    preco: '10 po',
    peso: '5.0 kg',
    descricao: 'A padded saddle designed to ensure comfort for rider and mount during long journeys of consecutive days.'
  },
  {
    tipo_item: 'transporte',
    id: 'sela_de_guerra',
    nome: 'Military Saddle',
    categoria: 'Tack',
    preco: '20 po',
    peso: '15.0 kg',
    descricao: 'A heavy saddle with tall supports in front and back. Grants advantage on checks to avoid falling from a mount during mounted combat.'
  },
  {
    tipo_item: 'transporte',
    id: 'alforjes',
    nome: 'Saddlebags',
    categoria: 'Accessory',
    preco: '4 po',
    peso: '4.0 kg',
    descricao: "Two leather pouches connected across the mount's back. Allows the animal to carry up to 30 kg of extra equipment."
  },

  // ─── LAND VEHICLES ────────────────────────────────────────────────────────
  {
    tipo_item: 'transporte',
    id: 'carroca',
    nome: 'Cart',
    categoria: 'Land Vehicle',
    preco: '15 po',
    peso: '100.0 kg',
    descricao: 'A simple two-wheeled vehicle pulled by a single mount. Widely used by merchants to transport crates and provisions.'
  },
  {
    tipo_item: 'transporte',
    id: 'carruagem',
    nome: 'Carriage',
    categoria: 'Land Vehicle',
    preco: '250 po',
    peso: '300.0 kg',
    descricao: 'A luxurious, comfortable closed four-wheeled vehicle for transporting noble passengers. Usually pulled by two or four horses.'
  },

  // ─── WATER VEHICLES ───────────────────────────────────────────────────────
  {
    tipo_item: 'transporte',
    id: 'bote_a_remos',
    nome: 'Rowboat',
    categoria: 'Water Vehicle',
    preco: '50 po',
    deslocamento: '2 km/h',
    descricao: 'A small wooden vessel for up to 4 passengers, propelled by arm strength. Ideal for crossing rivers or calm lakes.'
  },
  {
    tipo_item: 'transporte',
    id: 'gale',
    nome: 'Galley',
    categoria: 'Water Vehicle',
    preco: '30000 po',
    deslocamento: '6 km/h',
    descricao: 'A large war vessel propelled by oars and sails. Requires a crew of up to 80 rowers and can accommodate a full military contingent.'
  },
  {
    tipo_item: 'transporte',
    id: 'navio_veleiro',
    nome: 'Sailing Ship',
    categoria: 'Water Vehicle',
    preco: '10000 po',
    deslocamento: '3.5 km/h',
    descricao: 'A large sail-powered vessel with a full crew. Capable of crossing oceans carrying tons of cargo and dozens of passengers.'
  },
  {
    tipo_item: 'transporte',
    id: 'navio_de_guerra',
    nome: 'Warship',
    categoria: 'Water Vehicle',
    preco: '25000 po',
    deslocamento: '4 km/h',
    descricao: 'A floating fortress reinforced for naval combat. Has space for ballistae, catapults, and entire military contingents.'
  }
]
