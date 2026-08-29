import type { Armor } from '../types'

export const ARMORS: Armor[] = [
  // ─── LIGHT ARMOR ──────────────────────────────────────────────────────────
  {
    item_type: 'armadura',
    id: 'acolchoada',
    name: 'Padded',
    category: 'Light',
    price: '5 po',
    ac: '11 + Dex',
    min_strength: null,
    stealth_disadvantage: true,
    weight: '4.0 kg',
    description: 'Quilted layers of cloth and batting stitched together. Light and cheap, but the bulky fabric restricts silent movement.'
  },
  {
    item_type: 'armadura',
    id: 'couro',
    name: 'Leather',
    category: 'Light',
    price: '10 po',
    ac: '11 + Dex',
    min_strength: null,
    stealth_disadvantage: false,
    weight: '5.0 kg',
    description: 'A breastplate and shoulder guards of leather boiled in oil, with softer and more flexible parts. Good protection without compromising stealth.'
  },
  {
    item_type: 'armadura',
    id: 'couro_batido',
    name: 'Studded Leather',
    category: 'Light',
    price: '45 po',
    ac: '12 + Dex',
    min_strength: null,
    stealth_disadvantage: false,
    weight: '6.5 kg',
    description: 'Tough, flexible leather reinforced with metal rivets. Greater protection than plain leather without sacrificing mobility.'
  },

  // ─── MEDIUM ARMOR ─────────────────────────────────────────────────────────
  {
    item_type: 'armadura',
    id: 'gibao_de_peles',
    name: 'Hide',
    category: 'Medium',
    price: '10 po',
    ac: '12 + Dex (max +2)',
    min_strength: null,
    stealth_disadvantage: false,
    weight: '6.0 kg',
    description: 'A thick leather jacket reinforced on the inside with vertical metal strips. A good defensive balance for agile adventurers.'
  },
  {
    item_type: 'armadura',
    id: 'cota_malha_parcial',
    name: 'Chain Shirt',
    category: 'Medium',
    price: '50 po',
    ac: '13 + Dex (max +2)',
    min_strength: null,
    stealth_disadvantage: false,
    weight: '10.0 kg',
    description: 'Interlocking metal rings worn between leather layers to prevent chafing. Excellent protection without excessive noise when moving.'
  },
  {
    item_type: 'armadura',
    id: 'loriga_de_escamas',
    name: 'Scale Mail',
    category: 'Medium',
    price: '50 po',
    ac: '14 + Dex (max +2)',
    min_strength: null,
    stealth_disadvantage: true,
    weight: '22.5 kg',
    description: 'A leather coat covered with overlapping metal scales, like the skin of a crocodile. The scales clink with movement.'
  },
  {
    item_type: 'armadura',
    id: 'couraca_peitoral',
    name: 'Breastplate',
    category: 'Medium',
    price: '400 po',
    ac: '14 + Dex (max +2)',
    min_strength: null,
    stealth_disadvantage: false,
    weight: '10.0 kg',
    description: 'A fitted metal chest piece with flexible leather on the limbs. Protects vital organs without sacrificing agility or stealth.'
  },
  {
    item_type: 'armadura',
    id: 'placas_parcial',
    name: 'Half Plate',
    category: 'Medium',
    price: '750 po',
    ac: '15 + Dex (max +2)',
    min_strength: null,
    stealth_disadvantage: true,
    weight: '20.0 kg',
    description: 'Shaped metal plates covering most of the body. Excellent protection but the heavy metal completely compromises stealth.'
  },

  // ─── HEAVY ARMOR ──────────────────────────────────────────────────────────
  {
    item_type: 'armadura',
    id: 'cota_de_aneis',
    name: 'Ring Mail',
    category: 'Heavy',
    price: '30 po',
    ac: '14',
    min_strength: null,
    stealth_disadvantage: true,
    weight: '20.0 kg',
    description: 'Thick leather with heavy metal rings sewn on the outside. Low-cost heavy protection, but loud and uncomfortable.'
  },
  {
    item_type: 'armadura',
    id: 'cota_de_malha',
    name: 'Chain Mail',
    category: 'Heavy',
    price: '75 po',
    ac: '16',
    min_strength: 13,
    stealth_disadvantage: true,
    weight: '27.5 kg',
    description: 'Interlocking metal rings covering the entire body. The weight demands a robust physique and makes any stealthy movement impossible.'
  },
  {
    item_type: 'armadura',
    id: 'armadura_de_tala',
    name: 'Splint',
    category: 'Heavy',
    price: '200 po',
    ac: '17',
    min_strength: 15,
    stealth_disadvantage: true,
    weight: '30.0 kg',
    description: 'Vertical metal strips riveted to leather over fabric padding. Formidable protection at an undeniably heavy pace.'
  },
  {
    item_type: 'armadura',
    id: 'placas',
    name: 'Plate',
    category: 'Heavy',
    price: '1500 po',
    ac: '18',
    min_strength: 15,
    stealth_disadvantage: true,
    weight: '32.5 kg',
    description: 'The pinnacle of physical protection. Shaped metal plates cover the entire body, including gauntlets, sabatons, and a visored helm.'
  },

  // ─── SHIELDS ──────────────────────────────────────────────────────────────
  {
    item_type: 'armadura',
    id: 'escudo',
    name: 'Shield',
    category: 'Shield',
    price: '10 po',
    ac: '+2',
    min_strength: null,
    stealth_disadvantage: false,
    weight: '3.0 kg',
    description: 'A classic shield of heavy wood or metal. Occupies one hand but grants a fixed +2 bonus to Armor Class.'
  }
]
