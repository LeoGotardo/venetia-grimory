import type { Armadura } from '../types'

export const ARMADURAS: Armadura[] = [
  // ─── LIGHT ARMOR ──────────────────────────────────────────────────────────
  {
    tipo_item: 'armadura',
    id: 'acolchoada',
    nome: 'Padded',
    categoria: 'Light',
    preco: '5 po',
    ca: '11 + Dex',
    forca_minima: null,
    desvantagem_furtividade: true,
    peso: '4.0 kg',
    descricao: 'Quilted layers of cloth and batting stitched together. Light and cheap, but the bulky fabric restricts silent movement.'
  },
  {
    tipo_item: 'armadura',
    id: 'couro',
    nome: 'Leather',
    categoria: 'Light',
    preco: '10 po',
    ca: '11 + Dex',
    forca_minima: null,
    desvantagem_furtividade: false,
    peso: '5.0 kg',
    descricao: 'A breastplate and shoulder guards of leather boiled in oil, with softer and more flexible parts. Good protection without compromising stealth.'
  },
  {
    tipo_item: 'armadura',
    id: 'couro_batido',
    nome: 'Studded Leather',
    categoria: 'Light',
    preco: '45 po',
    ca: '12 + Dex',
    forca_minima: null,
    desvantagem_furtividade: false,
    peso: '6.5 kg',
    descricao: 'Tough, flexible leather reinforced with metal rivets. Greater protection than plain leather without sacrificing mobility.'
  },

  // ─── MEDIUM ARMOR ─────────────────────────────────────────────────────────
  {
    tipo_item: 'armadura',
    id: 'gibelao_de_couro',
    nome: 'Hide',
    categoria: 'Medium',
    preco: '10 po',
    ca: '12 + Dex (max +2)',
    forca_minima: null,
    desvantagem_furtividade: false,
    peso: '6.0 kg',
    descricao: 'A thick leather jacket reinforced on the inside with vertical metal strips. A good defensive balance for agile adventurers.'
  },
  {
    tipo_item: 'armadura',
    id: 'camisao_de_malha',
    nome: 'Chain Shirt',
    categoria: 'Medium',
    preco: '50 po',
    ca: '13 + Dex (max +2)',
    forca_minima: null,
    desvantagem_furtividade: false,
    peso: '10.0 kg',
    descricao: 'Interlocking metal rings worn between leather layers to prevent chafing. Excellent protection without excessive noise when moving.'
  },
  {
    tipo_item: 'armadura',
    id: 'brunea',
    nome: 'Scale Mail',
    categoria: 'Medium',
    preco: '50 po',
    ca: '14 + Dex (max +2)',
    forca_minima: null,
    desvantagem_furtividade: true,
    peso: '22.5 kg',
    descricao: 'A leather coat covered with overlapping metal scales, like the skin of a crocodile. The scales clink with movement.'
  },
  {
    tipo_item: 'armadura',
    id: 'courace',
    nome: 'Breastplate',
    categoria: 'Medium',
    preco: '400 po',
    ca: '14 + Dex (max +2)',
    forca_minima: null,
    desvantagem_furtividade: false,
    peso: '10.0 kg',
    descricao: 'A fitted metal chest piece with flexible leather on the limbs. Protects vital organs without sacrificing agility or stealth.'
  },
  {
    tipo_item: 'armadura',
    id: 'meia_armadura',
    nome: 'Half Plate',
    categoria: 'Medium',
    preco: '750 po',
    ca: '15 + Dex (max +2)',
    forca_minima: null,
    desvantagem_furtividade: true,
    peso: '20.0 kg',
    descricao: 'Shaped metal plates covering most of the body. Excellent protection but the heavy metal completely compromises stealth.'
  },

  // ─── HEAVY ARMOR ──────────────────────────────────────────────────────────
  {
    tipo_item: 'armadura',
    id: 'cota_de_aneis',
    nome: 'Ring Mail',
    categoria: 'Heavy',
    preco: '30 po',
    ca: '14',
    forca_minima: null,
    desvantagem_furtividade: true,
    peso: '20.0 kg',
    descricao: 'Thick leather with heavy metal rings sewn on the outside. Low-cost heavy protection, but loud and uncomfortable.'
  },
  {
    tipo_item: 'armadura',
    id: 'cota_de_malha',
    nome: 'Chain Mail',
    categoria: 'Heavy',
    preco: '75 po',
    ca: '16',
    forca_minima: 13,
    desvantagem_furtividade: true,
    peso: '27.5 kg',
    descricao: 'Interlocking metal rings covering the entire body. The weight demands a robust physique and makes any stealthy movement impossible.'
  },
  {
    tipo_item: 'armadura',
    id: 'cota_de_talas',
    nome: 'Splint',
    categoria: 'Heavy',
    preco: '200 po',
    ca: '17',
    forca_minima: 15,
    desvantagem_furtividade: true,
    peso: '30.0 kg',
    descricao: 'Vertical metal strips riveted to leather over fabric padding. Formidable protection at an undeniably heavy pace.'
  },
  {
    tipo_item: 'armadura',
    id: 'armadura_completa',
    nome: 'Plate',
    categoria: 'Heavy',
    preco: '1500 po',
    ca: '18',
    forca_minima: 15,
    desvantagem_furtividade: true,
    peso: '32.5 kg',
    descricao: 'The pinnacle of physical protection. Shaped metal plates cover the entire body, including gauntlets, sabatons, and a visored helm.'
  },

  // ─── SHIELDS ──────────────────────────────────────────────────────────────
  {
    tipo_item: 'armadura',
    id: 'escudo',
    nome: 'Shield',
    categoria: 'Shield',
    preco: '10 po',
    ca: '+2',
    forca_minima: null,
    desvantagem_furtividade: false,
    peso: '3.0 kg',
    descricao: 'A classic shield of heavy wood or metal. Occupies one hand but grants a fixed +2 bonus to Armor Class.'
  }
]
