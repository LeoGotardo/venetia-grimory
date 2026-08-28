import type { MagicItem } from '../types'

export const MAGIC_ITEMS: MagicItem[] = [
  // ─── SPELL SCROLLS ────────────────────────────────────────────────────────
  {
    item_type: 'item_magico',
    id: 'pergaminho_truque',
    name: 'Cantrip Scroll',
    category: 'Scroll',
    rarity: 'Common',
    price: '10 po',
    level: 0,
    spell_id: '',
    description: 'Casting from the scroll requires the spell\'s normal casting time and consumes the item. Any spellcaster can read cantrips from their class list.'
  },
  {
    item_type: 'item_magico',
    id: 'pergaminho_circulo_1',
    name: '1st-Level Scroll',
    category: 'Scroll',
    rarity: 'Common',
    price: '10 po',
    level: 1,
    spell_id: '',
    description: "If the spell is on your class list, it can be read and cast without expending spell components or spell slots."
  },
  {
    item_type: 'item_magico',
    id: 'pergaminho_circulo_2',
    name: '2nd-Level Scroll',
    category: 'Scroll',
    rarity: 'Uncommon',
    price: '30 po',
    level: 2,
    spell_id: '',
    description: 'If the spell is of a higher level than you can normally cast, you must make a spellcasting ability check to read it successfully.'
  },
  {
    item_type: 'item_magico',
    id: 'pergaminho_circulo_3',
    name: '3rd-Level Scroll',
    category: 'Scroll',
    rarity: 'Uncommon',
    price: '90 po',
    level: 3,
    spell_id: '',
    description: 'After reading the mystical runes, the scroll crumbles to dust and the magical effect is triggered immediately.'
  },
  {
    item_type: 'item_magico',
    id: 'pergaminho_circulo_4',
    name: '4th-Level Scroll',
    category: 'Scroll',
    rarity: 'Rare',
    price: '270 po',
    level: 4,
    spell_id: '',
    description: 'A valuable item that allows spellcasters to expand their tactical repertoire with high-impact spells at critical moments.'
  },
  {
    item_type: 'item_magico',
    id: 'pergaminho_circulo_5',
    name: '5th-Level Scroll',
    category: 'Scroll',
    rarity: 'Rare',
    price: '810 po',
    level: 5,
    spell_id: '',
    description: 'Stores complex arcane or divine energies, ready to be unleashed by experienced spellcasters.'
  },
  {
    item_type: 'item_magico',
    id: 'pergaminho_circulo_6',
    name: '6th-Level Scroll',
    category: 'Scroll',
    rarity: 'Very Rare',
    price: '2430 po',
    level: 6,
    spell_id: '',
    description: 'Extremely rare, found only in treasures guarded by great threats or in ruins of extinct civilizations.'
  },
  {
    item_type: 'item_magico',
    id: 'pergaminho_circulo_7',
    name: '7th-Level Scroll',
    category: 'Scroll',
    rarity: 'Very Rare',
    price: '7290 po',
    level: 7,
    spell_id: '',
    description: 'Concentrates devastating power or reality-altering spells that few mortals can master without extensive training.'
  },
  {
    item_type: 'item_magico',
    id: 'pergaminho_circulo_8',
    name: '8th-Level Scroll',
    category: 'Scroll',
    rarity: 'Legendary',
    price: '21870 po',
    level: 8,
    spell_id: '',
    description: 'A legendary relic capable of casting rituals of total weather control or mass destruction with a single reading.'
  },
  {
    item_type: 'item_magico',
    id: 'pergaminho_circulo_9',
    name: '9th-Level Scroll',
    category: 'Scroll',
    rarity: 'Legendary',
    price: '65610 po',
    level: 9,
    spell_id: '',
    description: 'The pinnacle of power in scroll form. Allows casting spells like Time Stop or Wish a single time before crumbling to dust.'
  },

  // ─── POTIONS AND CONSUMABLES ──────────────────────────────────────────────
  {
    item_type: 'item_magico',
    id: 'pocao_de_cura',
    name: 'Potion of Healing',
    category: 'Potion',
    rarity: 'Common',
    price: '50 po',
    effect: '2d4 + 2 HP',
    description: 'A glimmering red liquid that bubbles slightly. Drinking or administering it restores hit points to the target immediately.'
  },
  {
    item_type: 'item_magico',
    id: 'pocao_de_cura_maior',
    name: 'Potion of Greater Healing',
    category: 'Potion',
    rarity: 'Uncommon',
    price: '150 po',
    effect: '4d4 + 4 HP',
    description: 'A more concentrated and thicker version of the healing elixir, intended to treat serious wounds suffered in intense combat.'
  },
  {
    item_type: 'item_magico',
    id: 'pocao_de_cura_superior',
    name: 'Potion of Superior Healing',
    category: 'Potion',
    rarity: 'Rare',
    price: '270 po',
    effect: '8d4 + 8 HP',
    description: 'A deep, near-opaque dark-red healing elixir of high potency. Restores wounds that ordinary potions cannot fully treat.'
  },
  {
    item_type: 'item_magico',
    id: 'pocao_de_cura_suprema',
    name: 'Potion of Supreme Healing',
    category: 'Potion',
    rarity: 'Very Rare',
    price: '1350 po',
    effect: '10d4 + 20 HP',
    description: 'The most powerful mundane healing elixir in existence, of an intense and brilliant crimson color. Capable of saving heroes on the brink of death.'
  },

  // ─── ATTUNED ITEMS ────────────────────────────────────────────────────────
  {
    item_type: 'item_magico',
    id: 'anel_de_protecao',
    name: 'Ring of Protection',
    category: 'Ring',
    rarity: 'Uncommon',
    price: '2000 po',
    attunement: true,
    description: 'A gold ring engraved with protective runes. While worn, grants +1 to Armor Class and all saving throws.'
  },
  {
    item_type: 'item_magico',
    id: 'capa_de_protecao',
    name: 'Cloak of Protection',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '1500 po',
    attunement: true,
    description: 'A cloak with arcane embroidery that moves slightly even without wind. Grants +1 to Armor Class and all saving throws.'
  },
  {
    item_type: 'item_magico',
    id: 'botas_aladas',
    name: 'Winged Boots',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '4000 po',
    attunement: true,
    description: 'Boots with decorative wings at the heels that come to life when activated. Grant a flying speed equal to your walking speed for up to 4 hours per day.'
  },
  {
    item_type: 'item_magico',
    id: 'pedra_da_sorte',
    name: 'Stone of Good Luck',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '4500 po',
    attunement: true,
    description: 'A polished pebble that vibrates gently to the touch. While carried, grants +1 to all ability checks and saving throws.'
  },
  {
    item_type: 'item_magico',
    id: 'botas_de_velocidade',
    name: 'Boots of Speed',
    category: 'Wondrous Item',
    rarity: 'Rare',
    price: '4000 po',
    attunement: true,
    description: 'Boots with metal soles engraved with swiftness runes. Activated with a bonus action, they double your speed and allow a free Dash action for 1 minute.'
  },
  {
    item_type: 'item_magico',
    id: 'colar_de_bolas_de_fogo',
    name: 'Necklace of Fireballs',
    category: 'Wondrous Item',
    rarity: 'Rare',
    price: '3000 po',
    description: 'A necklace with orange amber beads. Each bead can be removed and thrown up to 27 m, exploding as Fireball (DC 15) on impact. Has 3d6 beads.'
  },
  {
    item_type: 'item_magico',
    id: 'manto_da_invisibilidade',
    name: 'Cloak of Invisibility',
    category: 'Wondrous Item',
    rarity: 'Legendary',
    price: '75000 po',
    attunement: true,
    description: 'Fabric sewn with threads of mist and distorted light. Pulling up the hood grants complete invisibility for up to 2 hours per day (in 1-minute increments).'
  }
]
