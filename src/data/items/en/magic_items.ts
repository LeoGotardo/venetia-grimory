import type { ItemMagico } from '../types'

export const ITENS_MAGICOS: ItemMagico[] = [
  // ─── SPELL SCROLLS ────────────────────────────────────────────────────────
  {
    tipo_item: 'item_magico',
    id: 'pergaminho_truque',
    nome: 'Cantrip Scroll',
    categoria: 'Scroll',
    raridade: 'Common',
    preco: '10 po',
    circulo: 0,
    id_magia: '',
    descricao: 'Casting from the scroll requires the spell\'s normal casting time and consumes the item. Any spellcaster can read cantrips from their class list.'
  },
  {
    tipo_item: 'item_magico',
    id: 'pergaminho_circulo_1',
    nome: '1st-Level Scroll',
    categoria: 'Scroll',
    raridade: 'Common',
    preco: '10 po',
    circulo: 1,
    id_magia: '',
    descricao: "If the spell is on your class list, it can be read and cast without expending spell components or spell slots."
  },
  {
    tipo_item: 'item_magico',
    id: 'pergaminho_circulo_2',
    nome: '2nd-Level Scroll',
    categoria: 'Scroll',
    raridade: 'Uncommon',
    preco: '30 po',
    circulo: 2,
    id_magia: '',
    descricao: 'If the spell is of a higher level than you can normally cast, you must make a spellcasting ability check to read it successfully.'
  },
  {
    tipo_item: 'item_magico',
    id: 'pergaminho_circulo_3',
    nome: '3rd-Level Scroll',
    categoria: 'Scroll',
    raridade: 'Uncommon',
    preco: '90 po',
    circulo: 3,
    id_magia: '',
    descricao: 'After reading the mystical runes, the scroll crumbles to dust and the magical effect is triggered immediately.'
  },
  {
    tipo_item: 'item_magico',
    id: 'pergaminho_circulo_4',
    nome: '4th-Level Scroll',
    categoria: 'Scroll',
    raridade: 'Rare',
    preco: '270 po',
    circulo: 4,
    id_magia: '',
    descricao: 'A valuable item that allows spellcasters to expand their tactical repertoire with high-impact spells at critical moments.'
  },
  {
    tipo_item: 'item_magico',
    id: 'pergaminho_circulo_5',
    nome: '5th-Level Scroll',
    categoria: 'Scroll',
    raridade: 'Rare',
    preco: '810 po',
    circulo: 5,
    id_magia: '',
    descricao: 'Stores complex arcane or divine energies, ready to be unleashed by experienced spellcasters.'
  },
  {
    tipo_item: 'item_magico',
    id: 'pergaminho_circulo_6',
    nome: '6th-Level Scroll',
    categoria: 'Scroll',
    raridade: 'Very Rare',
    preco: '2430 po',
    circulo: 6,
    id_magia: '',
    descricao: 'Extremely rare, found only in treasures guarded by great threats or in ruins of extinct civilizations.'
  },
  {
    tipo_item: 'item_magico',
    id: 'pergaminho_circulo_7',
    nome: '7th-Level Scroll',
    categoria: 'Scroll',
    raridade: 'Very Rare',
    preco: '7290 po',
    circulo: 7,
    id_magia: '',
    descricao: 'Concentrates devastating power or reality-altering spells that few mortals can master without extensive training.'
  },
  {
    tipo_item: 'item_magico',
    id: 'pergaminho_circulo_8',
    nome: '8th-Level Scroll',
    categoria: 'Scroll',
    raridade: 'Legendary',
    preco: '21870 po',
    circulo: 8,
    id_magia: '',
    descricao: 'A legendary relic capable of casting rituals of total weather control or mass destruction with a single reading.'
  },
  {
    tipo_item: 'item_magico',
    id: 'pergaminho_circulo_9',
    nome: '9th-Level Scroll',
    categoria: 'Scroll',
    raridade: 'Legendary',
    preco: '65610 po',
    circulo: 9,
    id_magia: '',
    descricao: 'The pinnacle of power in scroll form. Allows casting spells like Time Stop or Wish a single time before crumbling to dust.'
  },

  // ─── POTIONS AND CONSUMABLES ──────────────────────────────────────────────
  {
    tipo_item: 'item_magico',
    id: 'pocao_de_cura',
    nome: 'Potion of Healing',
    categoria: 'Potion',
    raridade: 'Common',
    preco: '50 po',
    efeito: '2d4 + 2 HP',
    descricao: 'A glimmering red liquid that bubbles slightly. Drinking or administering it restores hit points to the target immediately.'
  },
  {
    tipo_item: 'item_magico',
    id: 'pocao_de_cura_maior',
    nome: 'Potion of Greater Healing',
    categoria: 'Potion',
    raridade: 'Uncommon',
    preco: '150 po',
    efeito: '4d4 + 4 HP',
    descricao: 'A more concentrated and thicker version of the healing elixir, intended to treat serious wounds suffered in intense combat.'
  },
  {
    tipo_item: 'item_magico',
    id: 'pocao_de_cura_superior',
    nome: 'Potion of Superior Healing',
    categoria: 'Potion',
    raridade: 'Rare',
    preco: '270 po',
    efeito: '8d4 + 8 HP',
    descricao: 'A deep, near-opaque dark-red healing elixir of high potency. Restores wounds that ordinary potions cannot fully treat.'
  },
  {
    tipo_item: 'item_magico',
    id: 'pocao_de_cura_suprema',
    nome: 'Potion of Supreme Healing',
    categoria: 'Potion',
    raridade: 'Very Rare',
    preco: '1350 po',
    efeito: '10d4 + 20 HP',
    descricao: 'The most powerful mundane healing elixir in existence, of an intense and brilliant crimson color. Capable of saving heroes on the brink of death.'
  },

  // ─── ATTUNED ITEMS ────────────────────────────────────────────────────────
  {
    tipo_item: 'item_magico',
    id: 'anel_de_protecao',
    nome: 'Ring of Protection',
    categoria: 'Ring',
    raridade: 'Uncommon',
    preco: '2000 po',
    sintonia: true,
    descricao: 'A gold ring engraved with protective runes. While worn, grants +1 to Armor Class and all saving throws.'
  },
  {
    tipo_item: 'item_magico',
    id: 'capa_de_protecao',
    nome: 'Cloak of Protection',
    categoria: 'Wondrous Item',
    raridade: 'Uncommon',
    preco: '1500 po',
    sintonia: true,
    descricao: 'A cloak with arcane embroidery that moves slightly even without wind. Grants +1 to Armor Class and all saving throws.'
  },
  {
    tipo_item: 'item_magico',
    id: 'botas_aladas',
    nome: 'Winged Boots',
    categoria: 'Wondrous Item',
    raridade: 'Uncommon',
    preco: '4000 po',
    sintonia: true,
    descricao: 'Boots with decorative wings at the heels that come to life when activated. Grant a flying speed equal to your walking speed for up to 4 hours per day.'
  },
  {
    tipo_item: 'item_magico',
    id: 'pedra_da_sorte',
    nome: 'Stone of Good Luck',
    categoria: 'Wondrous Item',
    raridade: 'Uncommon',
    preco: '4500 po',
    sintonia: true,
    descricao: 'A polished pebble that vibrates gently to the touch. While carried, grants +1 to all ability checks and saving throws.'
  },
  {
    tipo_item: 'item_magico',
    id: 'botas_de_velocidade',
    nome: 'Boots of Speed',
    categoria: 'Wondrous Item',
    raridade: 'Rare',
    preco: '4000 po',
    sintonia: true,
    descricao: 'Boots with metal soles engraved with swiftness runes. Activated with a bonus action, they double your speed and allow a free Dash action for 1 minute.'
  },
  {
    tipo_item: 'item_magico',
    id: 'colar_de_bolas_de_fogo',
    nome: 'Necklace of Fireballs',
    categoria: 'Wondrous Item',
    raridade: 'Rare',
    preco: '3000 po',
    descricao: 'A necklace with orange amber beads. Each bead can be removed and thrown up to 27 m, exploding as Fireball (DC 15) on impact. Has 3d6 beads.'
  },
  {
    tipo_item: 'item_magico',
    id: 'manto_da_invisibilidade',
    nome: 'Cloak of Invisibility',
    categoria: 'Wondrous Item',
    raridade: 'Legendary',
    preco: '75000 po',
    sintonia: true,
    descricao: 'Fabric sewn with threads of mist and distorted light. Pulling up the hood grants complete invisibility for up to 2 hours per day (in 1-minute increments).'
  }
]
