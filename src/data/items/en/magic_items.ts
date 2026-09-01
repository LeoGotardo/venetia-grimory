import type { MagicItem } from '../types'

/**
 * Catálogo de itens mágicos do Livro do Mestre 2024.
 *
 * `price` usa a tabela oficial de Valor de Item Mágico por Raridade
 * (Comum 100 po, Incomum 400, Raro 4.000, Muito Raro 40.000, Lendário 200.000),
 * pela metade para consumíveis. Artefatos e itens de raridade variável não têm
 * valor definido e ficam com "—".
 *
 * Os ids das entradas antigas (pergaminhos, poções de cura e os seis itens
 * originais) foram mantidos em português para não invalidar fichas salvas; as
 * demais usam o identificador em inglês do próprio item.
 */
export const MAGIC_ITEMS: MagicItem[] = [
  {
    item_type: 'item_magico',
    id: 'pergaminho_truque',
    name: 'Cantrip Scroll',
    category: 'Scroll',
    rarity: 'Common',
    price: '10 po',
    level: 0,
    spell_id: '',
    description: "Casting from the scroll requires the spell's normal casting time and consumes the item. Any spellcaster can read cantrips from their class list."
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
    description: 'If the spell is on your class list, it can be read and cast without expending spell components or spell slots.'
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
    rarity: 'Very Rare',
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
  {
    item_type: 'item_magico',
    id: 'scroll_of_protection',
    name: 'Scroll of Protection',
    category: 'Scroll',
    rarity: 'Rare',
    price: '2000 po',
    description: 'Bars one creature type from a 5-foot circle for 5 minutes.'
  },
  {
    item_type: 'item_magico',
    id: 'scroll_of_titan_summoning',
    name: 'Scroll of Titan Summoning',
    category: 'Scroll',
    rarity: 'Legendary',
    price: '100000 po',
    description: 'Summons a titan — which does not obey you and acts on its own.'
  },
  {
    item_type: 'item_magico',
    id: 'elixir_of_health',
    name: 'Elixir of Health',
    category: 'Potion',
    rarity: 'Rare',
    price: '2000 po',
    description: 'Ends the Blinded, Deafened, Paralyzed, and Poisoned conditions, and cures diseases.'
  },
  {
    item_type: 'item_magico',
    id: 'philter_of_love',
    name: 'Philter of Love',
    category: 'Potion',
    rarity: 'Uncommon',
    price: '200 po',
    description: 'For 1 hour, you are Charmed by the first creature you see.'
  },
  {
    item_type: 'item_magico',
    id: 'potion_of_animal_friendship',
    name: 'Potion of Animal Friendship',
    category: 'Potion',
    rarity: 'Uncommon',
    price: '200 po',
    description: 'Casts Animal Friendship (DC 13) at will for 1 hour.'
  },
  {
    item_type: 'item_magico',
    id: 'potion_of_clairvoyance',
    name: 'Potion of Clairvoyance',
    category: 'Potion',
    rarity: 'Rare',
    price: '2000 po',
    description: 'The effect of the Clairvoyance spell.'
  },
  {
    item_type: 'item_magico',
    id: 'potion_of_comprehension',
    name: 'Potion of Comprehension',
    category: 'Potion',
    rarity: 'Common',
    price: '50 po',
    description: 'The effect of Comprehend Languages for 1 hour.'
  },
  {
    item_type: 'item_magico',
    id: 'potion_of_diminution',
    name: 'Potion of Diminution',
    category: 'Potion',
    rarity: 'Rare',
    price: '2000 po',
    description: 'The reduce effect of Enlarge/Reduce for 1d4 hours.'
  },
  {
    item_type: 'item_magico',
    id: 'potion_of_climbing',
    name: 'Potion of Climbing',
    category: 'Potion',
    rarity: 'Common',
    price: '50 po',
    description: 'A Climb Speed and Advantage on Athletics checks to climb, for 1 hour.'
  },
  {
    item_type: 'item_magico',
    id: 'potion_of_gaseous_form',
    name: 'Potion of Gaseous Form',
    category: 'Potion',
    rarity: 'Rare',
    price: '2000 po',
    description: 'The Gaseous Form effect for 1 hour, no concentration required.'
  },
  {
    item_type: 'item_magico',
    id: 'potion_of_giant_strength',
    name: 'Potion of Giant Strength',
    category: 'Potion',
    rarity: 'Varies',
    price: '—',
    description: 'Sets Strength for 1 hour by giant type. Rarity varies from hill to storm.'
  },
  {
    item_type: 'item_magico',
    id: 'potion_of_invisibility',
    name: 'Potion of Invisibility',
    category: 'Potion',
    rarity: 'Rare',
    price: '2000 po',
    description: 'Invisible for 1 hour; the effect ends if you attack or cast a spell.'
  },
  {
    item_type: 'item_magico',
    id: 'potion_of_greater_invisibility',
    name: 'Potion of Greater Invisibility',
    category: 'Potion',
    rarity: 'Very Rare',
    price: '20000 po',
    description: 'Invisible for 1 minute, even when you attack or cast.'
  },
  {
    item_type: 'item_magico',
    id: 'potion_of_invulnerability',
    name: 'Potion of Invulnerability',
    category: 'Potion',
    rarity: 'Rare',
    price: '2000 po',
    description: 'Resistance to all damage for 1 minute.'
  },
  {
    item_type: 'item_magico',
    id: 'potion_of_mind_reading',
    name: 'Potion of Mind Reading',
    category: 'Potion',
    rarity: 'Rare',
    price: '2000 po',
    description: 'The Detect Thoughts effect (DC 13).'
  },
  {
    item_type: 'item_magico',
    id: 'potion_of_longevity',
    name: 'Potion of Longevity',
    category: 'Potion',
    rarity: 'Very Rare',
    price: '20000 po',
    description: 'Reduces your age by 1d6+6 years — but each dose risks aging you instead.'
  },
  {
    item_type: 'item_magico',
    id: 'potion_of_resistance',
    name: 'Potion of Resistance',
    category: 'Potion',
    rarity: 'Uncommon',
    price: '200 po',
    description: 'Resistance to one damage type for 1 hour.'
  },
  {
    item_type: 'item_magico',
    id: 'potion_of_water_breathing',
    name: 'Potion of Water Breathing',
    category: 'Potion',
    rarity: 'Uncommon',
    price: '200 po',
    description: 'You can breathe underwater for 1 hour.'
  },
  {
    item_type: 'item_magico',
    id: 'potion_of_speed',
    name: 'Potion of Speed',
    category: 'Potion',
    rarity: 'Very Rare',
    price: '20000 po',
    description: 'The Haste effect for 1 minute, no concentration required.'
  },
  {
    item_type: 'item_magico',
    id: 'potion_of_vitality',
    name: 'Potion of Vitality',
    category: 'Potion',
    rarity: 'Very Rare',
    price: '20000 po',
    description: 'Removes Exhaustion and disease and maximizes Hit Dice healing for 24 hours.'
  },
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
  {
    item_type: 'item_magico',
    id: 'potion_of_growth',
    name: 'Potion of Growth',
    category: 'Potion',
    rarity: 'Uncommon',
    price: '200 po',
    description: 'The enlarge effect of Enlarge/Reduce for 1d4 hours.'
  },
  {
    item_type: 'item_magico',
    id: 'potion_of_heroism',
    name: 'Potion of Heroism',
    category: 'Potion',
    rarity: 'Rare',
    price: '2000 po',
    description: '10 temporary Hit Points and the Bless effect for 1 hour.'
  },
  {
    item_type: 'item_magico',
    id: 'potion_of_pugilism',
    name: 'Potion of Pugilism',
    category: 'Potion',
    rarity: 'Uncommon',
    price: '200 po',
    description: 'For 1 minute, your Unarmed Strikes deal extra damage.'
  },
  {
    item_type: 'item_magico',
    id: 'potion_of_fire_breath',
    name: 'Potion of Fire Breath',
    category: 'Potion',
    rarity: 'Uncommon',
    price: '200 po',
    description: 'Three gouts of fire in a 30-foot cone: 4d6 damage (DC 13 for half).'
  },
  {
    item_type: 'item_magico',
    id: 'potion_of_poison',
    name: 'Potion of Poison',
    category: 'Potion',
    rarity: 'Uncommon',
    price: '200 po',
    description: 'Disguised as a normal potion: 3d6 Poison damage and Poisoned for 1 hour (DC 13).'
  },
  {
    item_type: 'item_magico',
    id: 'potion_of_flying',
    name: 'Potion of Flying',
    category: 'Potion',
    rarity: 'Very Rare',
    price: '20000 po',
    description: 'A Fly Speed equal to your Speed for 1 hour, with hovering.'
  },
  {
    item_type: 'item_magico',
    id: 'oil_of_etherealness',
    name: 'Oil of Etherealness',
    category: 'Potion',
    rarity: 'Rare',
    price: '2000 po',
    description: 'Sends you to the Ethereal Plane for 1 hour.'
  },
  {
    item_type: 'item_magico',
    id: 'oil_of_sharpness',
    name: 'Oil of Sharpness',
    category: 'Potion',
    rarity: 'Very Rare',
    price: '20000 po',
    description: 'The coated weapon gains +3 to attack and damage for 1 hour.'
  },
  {
    item_type: 'item_magico',
    id: 'oil_of_slipperiness',
    name: 'Oil of Slipperiness',
    category: 'Potion',
    rarity: 'Uncommon',
    price: '200 po',
    description: 'Freedom of Movement for 8 hours, or a patch of Grease on the ground.'
  },
  {
    item_type: 'item_magico',
    id: 'ring_of_evasion',
    name: 'Ring of Evasion',
    category: 'Ring',
    rarity: 'Rare',
    price: '4000 po',
    attunement: true,
    uses: { max: 3, recharge: 'dawn' },
    description: 'Turns a failed Dexterity saving throw into a success. Three charges per day.'
  },
  {
    item_type: 'item_magico',
    id: 'ring_of_animal_influence',
    name: 'Ring of Animal Influence',
    category: 'Ring',
    rarity: 'Rare',
    price: '4000 po',
    uses: { max: 3, recharge: 'dawn' },
    description: 'Animal Friendship, Fear, or Speak with Animals. Three charges per day.'
  },
  {
    item_type: 'item_magico',
    id: 'ring_of_invisibility',
    name: 'Ring of Invisibility',
    category: 'Ring',
    rarity: 'Legendary',
    price: '200000 po',
    attunement: true,
    description: 'Turn Invisible at will as a Bonus Action.'
  },
  {
    item_type: 'item_magico',
    id: 'ring_of_free_action',
    name: 'Ring of Free Action',
    category: 'Ring',
    rarity: 'Rare',
    price: '4000 po',
    attunement: true,
    description: 'Difficult Terrain does not slow you, and magic cannot leave you Paralyzed or Restrained.'
  },
  {
    item_type: 'item_magico',
    id: 'ring_of_swimming',
    name: 'Ring of Swimming',
    category: 'Ring',
    rarity: 'Uncommon',
    price: '400 po',
    description: 'You have a Swim Speed of 40 feet.'
  },
  {
    item_type: 'item_magico',
    id: 'ring_of_feather_falling',
    name: 'Ring of Feather Falling',
    category: 'Ring',
    rarity: 'Rare',
    price: '4000 po',
    attunement: true,
    description: 'You descend 60 feet per round and never take falling damage.'
  },
  {
    item_type: 'item_magico',
    id: 'ring_of_regeneration',
    name: 'Ring of Regeneration',
    category: 'Ring',
    rarity: 'Very Rare',
    price: '40000 po',
    attunement: true,
    description: 'Regenerates 1d6 HP every 10 minutes and regrows lost limbs in 1d6+1 days.'
  },
  {
    item_type: 'item_magico',
    id: 'ring_of_resistance',
    name: 'Ring of Resistance',
    category: 'Ring',
    rarity: 'Rare',
    price: '4000 po',
    description: 'Resistance to one damage type set by the ring’s gem.'
  },
  {
    item_type: 'item_magico',
    id: 'ring_of_telekinesis',
    name: 'Ring of Telekinesis',
    category: 'Ring',
    rarity: 'Very Rare',
    price: '40000 po',
    attunement: true,
    description: 'Casts Telekinesis at will, without components.'
  },
  {
    item_type: 'item_magico',
    id: 'ring_of_x_ray_vision',
    name: 'Ring of X-ray Vision',
    category: 'Ring',
    rarity: 'Rare',
    price: '4000 po',
    attunement: true,
    description: 'See through solid matter for 1 minute — at the cost of a level of Exhaustion.'
  },
  {
    item_type: 'item_magico',
    id: 'ring_of_shooting_stars',
    name: 'Ring of Shooting Stars',
    category: 'Ring',
    rarity: 'Very Rare',
    price: '40000 po',
    attunement: true,
    uses: { max: 6, recharge: 'dawn' },
    description: 'Daylight, lightning sparks, and fiery meteors. Six charges per day.'
  },
  {
    item_type: 'item_magico',
    id: 'ring_of_water_walking',
    name: 'Ring of Water Walking',
    category: 'Ring',
    rarity: 'Uncommon',
    price: '400 po',
    description: 'You can walk on any liquid surface as if it were solid ground.'
  },
  {
    item_type: 'item_magico',
    id: 'ring_of_spell_storing',
    name: 'Ring of Spell Storing',
    category: 'Ring',
    rarity: 'Rare',
    price: '4000 po',
    attunement: true,
    description: 'Stores up to 5 levels of spells cast into it, for later use.'
  },
  {
    item_type: 'item_magico',
    id: 'ring_of_elemental_command',
    name: 'Ring of Elemental Command',
    category: 'Ring',
    rarity: 'Legendary',
    price: '200000 po',
    attunement: true,
    description: 'Dominates elementals of its plane and gains growing powers as you use it.'
  },
  {
    item_type: 'item_magico',
    id: 'ring_of_djinni_summoning',
    name: 'Ring of Djinni Summoning',
    category: 'Ring',
    rarity: 'Legendary',
    price: '200000 po',
    attunement: true,
    description: 'Summons a djinni that serves you for up to 1 hour, once every 5 days.'
  },
  {
    item_type: 'item_magico',
    id: 'anel_de_protecao',
    name: 'Ring of Protection',
    category: 'Ring',
    rarity: 'Rare',
    price: '2000 po',
    attunement: true,
    description: 'A gold ring engraved with protective runes. While worn, grants +1 to Armor Class and all saving throws.'
  },
  {
    item_type: 'item_magico',
    id: 'ring_of_spell_turning',
    name: 'Ring of Spell Turning',
    category: 'Ring',
    rarity: 'Legendary',
    price: '200000 po',
    attunement: true,
    description: 'Advantage against single-target spells, and it can reflect the spell back.'
  },
  {
    item_type: 'item_magico',
    id: 'ring_of_the_ram',
    name: 'Ring of the Ram',
    category: 'Ring',
    rarity: 'Rare',
    price: '4000 po',
    attunement: true,
    uses: { max: 3, recharge: 'dawn' },
    description: 'Fires a ram of force: 2d10 damage and a 15-foot push. Three charges per day.'
  },
  {
    item_type: 'item_magico',
    id: 'ring_of_warmth',
    name: 'Ring of Warmth',
    category: 'Ring',
    rarity: 'Uncommon',
    price: '400 po',
    attunement: true,
    description: 'Cold resistance, and comfort in temperatures as low as −50 °F.'
  },
  {
    item_type: 'item_magico',
    id: 'ring_of_mind_shielding',
    name: 'Ring of Mind Shielding',
    category: 'Ring',
    rarity: 'Uncommon',
    price: '400 po',
    attunement: true,
    description: 'Immune to mind reading and alignment detection; it holds your soul if you die.'
  },
  {
    item_type: 'item_magico',
    id: 'ring_of_jumping',
    name: 'Ring of Jumping',
    category: 'Ring',
    rarity: 'Uncommon',
    price: '400 po',
    attunement: true,
    description: 'Casts Jump on yourself at will.'
  },
  {
    item_type: 'item_magico',
    id: 'ring_of_three_wishes',
    name: 'Ring of Three Wishes',
    category: 'Ring',
    rarity: 'Legendary',
    price: '200000 po',
    description: 'Holds three castings of Wish; afterward it becomes a nonmagical ring.'
  },
  {
    item_type: 'item_magico',
    id: 'immovable_rod',
    name: 'Immovable Rod',
    category: 'Rod',
    rarity: 'Uncommon',
    price: '400 po',
    description: 'Locks in place holding up to 8,000 lb. until someone beats a DC 30 Strength check.'
  },
  {
    item_type: 'item_magico',
    id: 'rod_of_absorption',
    name: 'Rod of Absorption',
    category: 'Rod',
    rarity: 'Very Rare',
    price: '40000 po',
    attunement: true,
    description: 'Absorbs single-target spells and converts their levels into slots for you.'
  },
  {
    item_type: 'item_magico',
    id: 'rod_of_resurrection',
    name: 'Rod of Resurrection',
    category: 'Rod',
    rarity: 'Legendary',
    price: '200000 po',
    attunement: true,
    uses: { max: 5, recharge: 'manual' },
    description: 'Casts Heal or Resurrection. Five charges, slowly regained.'
  },
  {
    item_type: 'item_magico',
    id: 'rod_of_security',
    name: 'Rod of Security',
    category: 'Rod',
    rarity: 'Very Rare',
    price: '40000 po',
    description: 'Takes up to 199 creatures to an extraplanar paradise to rest in safety.'
  },
  {
    item_type: 'item_magico',
    id: 'rod_of_alertness',
    name: 'Rod of Alertness',
    category: 'Rod',
    rarity: 'Very Rare',
    price: '40000 po',
    attunement: true,
    description: 'Advantage on Perception and initiative, detection spells, and a defensive aura.'
  },
  {
    item_type: 'item_magico',
    id: 'rod_of_rulership',
    name: 'Rod of Rulership',
    category: 'Rod',
    rarity: 'Rare',
    price: '4000 po',
    attunement: true,
    uses: { max: 1, recharge: 'dawn' },
    description: 'Charms creatures within 120 feet (DC 15) for 8 minutes, once per day.'
  },
  {
    item_type: 'item_magico',
    id: 'rod_of_the_pact_keeper',
    name: 'Rod of the Pact Keeper',
    category: 'Rod',
    rarity: 'Varies',
    price: '—',
    attunement: true,
    uses: { max: 1, recharge: 'dawn' },
    description: 'A bonus to warlock spell DC and attacks, and recovers one Pact slot per day.'
  },
  {
    item_type: 'item_magico',
    id: 'rod_of_lordly_might',
    name: 'Rod of Lordly Might',
    category: 'Rod',
    rarity: 'Legendary',
    price: '200000 po',
    attunement: true,
    description: 'A +3 mace that becomes a sword, axe, spear, battering ram, or ladder on command.'
  },
  {
    item_type: 'item_magico',
    id: 'tentacle_rod',
    name: 'Tentacle Rod',
    category: 'Rod',
    rarity: 'Rare',
    price: '4000 po',
    attunement: true,
    description: 'Three tentacles attack at 15 feet; three hits halve Speed and impose Disadvantage.'
  },
  {
    item_type: 'item_magico',
    id: 'staff_of_healing',
    name: 'Staff of Healing',
    category: 'Staff',
    rarity: 'Rare',
    price: '4000 po',
    attunement: true,
    description: 'Casts Cure Wounds, Lesser Restoration, and Mass Healing Word.'
  },
  {
    item_type: 'item_magico',
    id: 'staff_of_the_adder',
    name: 'Staff of the Adder',
    category: 'Staff',
    rarity: 'Uncommon',
    price: '400 po',
    attunement: true,
    description: 'The tip becomes a living serpent head: +5 to hit for 1d6 plus 3d6 Poison.'
  },
  {
    item_type: 'item_magico',
    id: 'staff_of_the_python',
    name: 'Staff of the Python',
    category: 'Staff',
    rarity: 'Uncommon',
    price: '400 po',
    attunement: true,
    description: 'Thrown, it becomes a giant constrictor snake that fights on your command.'
  },
  {
    item_type: 'item_magico',
    id: 'staff_of_flowers',
    name: 'Staff of Flowers',
    category: 'Staff',
    rarity: 'Common',
    price: '100 po',
    uses: { max: 10, recharge: 'dawn' },
    description: 'Sprouts a natural flower at its tip, ten times per day.'
  },
  {
    item_type: 'item_magico',
    id: 'staff_of_the_woodlands',
    name: 'Staff of the Woodlands',
    category: 'Staff',
    rarity: 'Rare',
    price: '4000 po',
    attunement: true,
    description: 'A +2 quarterstaff with druidic spells and the power to become a tree.'
  },
  {
    item_type: 'item_magico',
    id: 'staff_of_adornment',
    name: 'Staff of Adornment',
    category: 'Staff',
    rarity: 'Common',
    price: '100 po',
    description: 'Makes a small object float above its tip and glow softly.'
  },
  {
    item_type: 'item_magico',
    id: 'staff_of_withering',
    name: 'Staff of Withering',
    category: 'Staff',
    rarity: 'Rare',
    price: '4000 po',
    attunement: true,
    description: 'Hits can deal 2d10 Necrotic damage and impose Disadvantage on checks for 1 hour.'
  },
  {
    item_type: 'item_magico',
    id: 'staff_of_charming',
    name: 'Staff of Charming',
    category: 'Staff',
    rarity: 'Rare',
    price: '4000 po',
    attunement: true,
    description: 'Charm Person, Command, or Comprehend Languages, and it absorbs enchantment spells.'
  },
  {
    item_type: 'item_magico',
    id: 'staff_of_swarming_insects',
    name: 'Staff of Swarming Insects',
    category: 'Staff',
    rarity: 'Rare',
    price: '4000 po',
    attunement: true,
    description: 'Creates a swarm that obscures and deals 5d4 Piercing damage per turn.'
  },
  {
    item_type: 'item_magico',
    id: 'staff_of_fire',
    name: 'Staff of Fire',
    category: 'Staff',
    rarity: 'Very Rare',
    price: '40000 po',
    attunement: true,
    description: 'Fire resistance, and it casts Burning Hands, Flaming Sphere, and Wall of Fire.'
  },
  {
    item_type: 'item_magico',
    id: 'staff_of_frost',
    name: 'Staff of Frost',
    category: 'Staff',
    rarity: 'Very Rare',
    price: '40000 po',
    attunement: true,
    description: 'Cold resistance, and it casts Fog Cloud, Wall of Ice, Sleet Storm, and Cone of Cold.'
  },
  {
    item_type: 'item_magico',
    id: 'staff_of_striking',
    name: 'Staff of Striking',
    category: 'Staff',
    rarity: 'Very Rare',
    price: '40000 po',
    attunement: true,
    description: 'A +3 quarterstaff that can spend up to 3 charges per hit, each adding 1d6 Force.'
  },
  {
    item_type: 'item_magico',
    id: 'staff_of_the_magi',
    name: 'Staff of the Magi',
    category: 'Staff',
    rarity: 'Legendary',
    price: '200000 po',
    attunement: true,
    uses: { max: 50, recharge: 'manual' },
    description: 'Absorbs spells and casts dozens of them, with 50 charges. The pinnacle of arcane power.'
  },
  {
    item_type: 'item_magico',
    id: 'staff_of_power',
    name: 'Staff of Power',
    category: 'Staff',
    rarity: 'Very Rare',
    price: '40000 po',
    attunement: true,
    description: '+2 to attack, AC, and saves, several spells, and a devastating retributive strike.'
  },
  {
    item_type: 'item_magico',
    id: 'staff_of_thunder_and_lightning',
    name: 'Staff of Thunder and Lightning',
    category: 'Staff',
    rarity: 'Very Rare',
    price: '40000 po',
    attunement: true,
    description: 'A +2 quarterstaff with five properties: lightning, thunder, bolt, blast, and their combination.'
  },
  {
    item_type: 'item_magico',
    id: 'staff_of_birdcalls',
    name: 'Staff of Birdcalls',
    category: 'Staff',
    rarity: 'Common',
    price: '100 po',
    description: 'Reproduces birdsong; a loud burst can startle those nearby.'
  },
  {
    item_type: 'item_magico',
    id: 'wand_of_paralysis',
    name: 'Wand of Paralysis',
    category: 'Wand',
    rarity: 'Rare',
    price: '4000 po',
    attunement: true,
    uses: { max: 7, recharge: 'manual' },
    description: 'A ray that Paralyzes the target (DC 15) for 1 minute. Seven charges.'
  },
  {
    item_type: 'item_magico',
    id: 'wand_of_conducting',
    name: 'Wand of Conducting',
    category: 'Wand',
    rarity: 'Common',
    price: '100 po',
    description: 'Conducts invisible magical music; a fumbled use can cause an embarrassing blare.'
  },
  {
    item_type: 'item_magico',
    id: 'wand_of_web',
    name: 'Wand of Web',
    category: 'Wand',
    rarity: 'Uncommon',
    price: '400 po',
    attunement: true,
    uses: { max: 7, recharge: 'manual' },
    description: 'Casts Web (DC 15). Seven charges.'
  },
  {
    item_type: 'item_magico',
    id: 'wand_of_wonder',
    name: 'Wand of Wonder',
    category: 'Wand',
    rarity: 'Rare',
    price: '4000 po',
    attunement: true,
    description: 'A random effect from a chaotic table: from a shower of butterflies to a Fireball.'
  },
  {
    item_type: 'item_magico',
    id: 'wand_of_fireballs',
    name: 'Wand of Fireballs',
    category: 'Wand',
    rarity: 'Rare',
    price: '4000 po',
    attunement: true,
    uses: { max: 7, recharge: 'manual' },
    description: 'Casts Fireball (DC 15) at up to 7th level. Seven charges.'
  },
  {
    item_type: 'item_magico',
    id: 'wand_of_enemy_detection',
    name: 'Wand of Enemy Detection',
    category: 'Wand',
    rarity: 'Rare',
    price: '4000 po',
    attunement: true,
    description: 'Points to hostile creatures within 60 feet, even Invisible or disguised ones.'
  },
  {
    item_type: 'item_magico',
    id: 'wand_of_magic_detection',
    name: 'Wand of Magic Detection',
    category: 'Wand',
    rarity: 'Uncommon',
    price: '400 po',
    uses: { max: 3, recharge: 'dawn' },
    description: 'Casts Detect Magic. Three charges per day.'
  },
  {
    item_type: 'item_magico',
    id: 'wand_of_magic_missiles',
    name: 'Wand of Magic Missiles',
    category: 'Wand',
    rarity: 'Uncommon',
    price: '400 po',
    uses: { max: 7, recharge: 'manual' },
    description: 'Casts Magic Missile at up to 7th level. Seven charges.'
  },
  {
    item_type: 'item_magico',
    id: 'wand_of_pyrotechnics',
    name: 'Wand of Pyrotechnics',
    category: 'Wand',
    rarity: 'Common',
    price: '100 po',
    uses: { max: 7, recharge: 'manual' },
    description: 'Creates harmless, colorful fireworks. Seven charges.'
  },
  {
    item_type: 'item_magico',
    id: 'wand_of_lightning_bolts',
    name: 'Wand of Lightning Bolts',
    category: 'Wand',
    rarity: 'Rare',
    price: '4000 po',
    attunement: true,
    uses: { max: 7, recharge: 'manual' },
    description: 'Casts Lightning Bolt (DC 15) at up to 7th level. Seven charges.'
  },
  {
    item_type: 'item_magico',
    id: 'wand_of_binding',
    name: 'Wand of Binding',
    category: 'Wand',
    rarity: 'Rare',
    price: '4000 po',
    attunement: true,
    description: 'Casts Hold Person or Hold Monster and grants Advantage against being paralyzed.'
  },
  {
    item_type: 'item_magico',
    id: 'wand_of_the_war_mage_1_2_or_3',
    name: 'Wand of the War Mage, +1, +2, or +3',
    category: 'Wand',
    rarity: 'Varies',
    price: '—',
    attunement: true,
    description: 'A bonus to spell attacks and it ignores half cover. Uncommon (+1) to Very Rare (+3).'
  },
  {
    item_type: 'item_magico',
    id: 'wand_of_fear',
    name: 'Wand of Fear',
    category: 'Wand',
    rarity: 'Rare',
    price: '4000 po',
    attunement: true,
    uses: { max: 7, recharge: 'manual' },
    description: 'A command to flee or a 60-foot cone that Frightens (DC 15). Seven charges.'
  },
  {
    item_type: 'item_magico',
    id: 'wand_of_polymorph',
    name: 'Wand of Polymorph',
    category: 'Wand',
    rarity: 'Very Rare',
    price: '40000 po',
    attunement: true,
    uses: { max: 7, recharge: 'manual' },
    description: 'Casts Polymorph (DC 15). Seven charges.'
  },
  {
    item_type: 'item_magico',
    id: 'wand_of_secrets',
    name: 'Wand of Secrets',
    category: 'Wand',
    rarity: 'Uncommon',
    price: '400 po',
    uses: { max: 3, recharge: 'manual' },
    description: 'Points to secret doors and traps within 30 feet. Three charges.'
  },
  {
    item_type: 'item_magico',
    id: 'dagger_of_venom',
    name: 'Dagger of Venom',
    category: 'Weapon',
    rarity: 'Rare',
    price: '4000 po',
    uses: { max: 1, recharge: 'dawn' },
    description: '+1, and once per day it coats the blade in poison: DC 15 or 2d10 damage and Poisoned.'
  },
  {
    item_type: 'item_magico',
    id: 'lute_of_thunderous_thumping',
    name: 'Lute of Thunderous Thumping',
    category: 'Weapon',
    rarity: 'Very Rare',
    price: '40000 po',
    description: 'A lute that is also a weapon: the right chord fires a thunderous wave.'
  },
  {
    item_type: 'item_magico',
    id: 'energy_bow',
    name: 'Energy Bow',
    category: 'Weapon',
    rarity: 'Very Rare',
    price: '40000 po',
    attunement: true,
    description: 'A +2 bow that conjures its own force arrows, dealing an extra 1d6 Force damage.'
  },
  {
    item_type: 'item_magico',
    id: 'oathbow',
    name: 'Oathbow',
    category: 'Weapon',
    rarity: 'Very Rare',
    price: '40000 po',
    attunement: true,
    description: 'On swearing against a foe, it deals an extra 3d6 Piercing damage to that target.'
  },
  {
    item_type: 'item_magico',
    id: 'weapon_1_2_or_3',
    name: 'Weapon, +1, +2, or +3',
    category: 'Weapon',
    rarity: 'Varies',
    price: '—',
    description: 'A bonus to attack and damage equal to its enchantment. Uncommon (+1), Rare (+2), Very Rare (+3).'
  },
  {
    item_type: 'item_magico',
    id: 'silvered_weapon',
    name: 'Silvered Weapon',
    category: 'Weapon',
    rarity: 'Common',
    price: '100 po',
    description: 'Overcomes the nonmagical damage resistance of lycanthropes and similar creatures.'
  },
  {
    item_type: 'item_magico',
    id: 'vicious_weapon',
    name: 'Vicious Weapon',
    category: 'Weapon',
    rarity: 'Rare',
    price: '4000 po',
    description: 'On a roll of 20 to hit, it deals an extra 2d6 damage of the weapon’s type.'
  },
  {
    item_type: 'item_magico',
    id: 'adamantine_weapon',
    name: 'Adamantine Weapon',
    category: 'Weapon',
    rarity: 'Uncommon',
    price: '400 po',
    description: 'Any hit the weapon scores against an object is a Critical Hit.'
  },
  {
    item_type: 'item_magico',
    id: 'weapon_of_warning',
    name: 'Weapon of Warning',
    category: 'Weapon',
    rarity: 'Uncommon',
    price: '400 po',
    attunement: true,
    description: 'You are never surprised and have Advantage on initiative.'
  },
  {
    item_type: 'item_magico',
    id: 'dwarven_thrower',
    name: 'Dwarven Thrower',
    category: 'Weapon',
    rarity: 'Very Rare',
    price: '40000 po',
    attunement: true,
    description: 'A +3 warhammer that returns to your hand when thrown, with extra damage against giants.'
  },
  {
    item_type: 'item_magico',
    id: 'javelin_of_lightning',
    name: 'Javelin of Lightning',
    category: 'Weapon',
    rarity: 'Uncommon',
    price: '400 po',
    description: 'Thrown, it becomes a 100-foot bolt: 4d6 Lightning damage (DC 13 for half).'
  },
  {
    item_type: 'item_magico',
    id: 'quarterstaff_of_the_acrobat',
    name: 'Quarterstaff of the Acrobat',
    category: 'Weapon',
    rarity: 'Very Rare',
    price: '40000 po',
    attunement: true,
    description: 'A +2 quarterstaff with Finesse, a larger damage die, and extra acrobatic mobility.'
  },
  {
    item_type: 'item_magico',
    id: 'thunderous_greatclub',
    name: 'Thunderous Greatclub',
    category: 'Weapon',
    rarity: 'Very Rare',
    price: '40000 po',
    attunement: true,
    description: 'Each blow booms: extra Thunder damage and a chance to push the target.'
  },
  {
    item_type: 'item_magico',
    id: 'scimitar_of_speed',
    name: 'Scimitar of Speed',
    category: 'Weapon',
    rarity: 'Very Rare',
    price: '40000 po',
    attunement: true,
    description: '+2, and one extra attack with it as a Bonus Action each turn.'
  },
  {
    item_type: 'item_magico',
    id: 'defender',
    name: 'Defender',
    category: 'Weapon',
    rarity: 'Legendary',
    price: '200000 po',
    attunement: true,
    description: 'A +3 sword whose bonus can be shifted from attack to AC each turn.'
  },
  {
    item_type: 'item_magico',
    id: 'whelm',
    name: 'Whelm',
    category: 'Weapon',
    rarity: 'Artifact',
    price: '—',
    attunement: true,
    description: 'A dwarven artifact hammer: it returns to hand, detects creatures, and unleashes shockwaves.'
  },
  {
    item_type: 'item_magico',
    id: 'dancing_sword',
    name: 'Dancing Sword',
    category: 'Weapon',
    rarity: 'Very Rare',
    price: '40000 po',
    attunement: true,
    description: 'As a Bonus Action the sword flies and attacks on its own for up to 4 turns.'
  },
  {
    item_type: 'item_magico',
    id: 'sword_of_life_stealing',
    name: 'Sword of Life Stealing',
    category: 'Weapon',
    rarity: 'Rare',
    price: '4000 po',
    attunement: true,
    description: 'On a Critical Hit, deals an extra 3d6 Necrotic damage and heals you as much.'
  },
  {
    item_type: 'item_magico',
    id: 'moon_touched_sword',
    name: 'Moon-Touched Sword',
    category: 'Weapon',
    rarity: 'Common',
    price: '100 po',
    description: 'The blade glows in darkness, shedding Bright Light in a 15-foot radius.'
  },
  {
    item_type: 'item_magico',
    id: 'vorpal_sword',
    name: 'Vorpal Sword',
    category: 'Weapon',
    rarity: 'Legendary',
    price: '200000 po',
    attunement: true,
    description: '+3, ignores Slashing resistance, and severs the target’s head on a roll of 20.'
  },
  {
    item_type: 'item_magico',
    id: 'sword_of_answering',
    name: 'Sword of Answering',
    category: 'Weapon',
    rarity: 'Legendary',
    price: '200000 po',
    attunement: true,
    description: '+3, and a Reaction to strike back at whoever hits you.'
  },
  {
    item_type: 'item_magico',
    id: 'sword_of_vengeance',
    name: 'Sword of Vengeance',
    category: 'Weapon',
    rarity: 'Uncommon',
    price: '400 po',
    attunement: true,
    description: '+1, but cursed: you can be compelled to attack whoever harmed you.'
  },
  {
    item_type: 'item_magico',
    id: 'sword_of_kas',
    name: 'Sword of Kas',
    category: 'Weapon',
    rarity: 'Artifact',
    price: '—',
    attunement: true,
    description: 'A sentient, evil artifact forged for Vecna’s most loyal servant.'
  },
  {
    item_type: 'item_magico',
    id: 'sword_of_sharpness',
    name: 'Sword of Sharpness',
    category: 'Weapon',
    rarity: 'Very Rare',
    price: '40000 po',
    attunement: true,
    description: 'On a maximum roll it severs limbs, and it slices objects and wood like butter.'
  },
  {
    item_type: 'item_magico',
    id: 'sword_of_wounding',
    name: 'Sword of Wounding',
    category: 'Weapon',
    rarity: 'Rare',
    price: '4000 po',
    attunement: true,
    description: 'Wounds do not close: 1d4 damage per turn until magical healing or a DC 15 save.'
  },
  {
    item_type: 'item_magico',
    id: 'sylvan_talon',
    name: 'Sylvan Talon',
    category: 'Weapon',
    rarity: 'Common',
    price: '100 po',
    attunement: true,
    description: 'A light fey weapon that folds into a branch and returns silently to your hand.'
  },
  {
    item_type: 'item_magico',
    id: 'nine_lives_stealer',
    name: 'Nine Lives Stealer',
    category: 'Weapon',
    rarity: 'Very Rare',
    price: '40000 po',
    attunement: true,
    description: '+2, and on a crit against a target under 100 HP, DC 15 or die. 1d8+1 charges.'
  },
  {
    item_type: 'item_magico',
    id: 'moonblade',
    name: 'Moonblade',
    category: 'Weapon',
    rarity: 'Legendary',
    price: '200000 po',
    attunement: true,
    description: 'An heirloom elven sword that gains new powers as it accepts each wielder.'
  },
  {
    item_type: 'item_magico',
    id: 'sun_blade',
    name: 'Sun Blade',
    category: 'Weapon',
    rarity: 'Rare',
    price: '4000 po',
    attunement: true,
    description: 'A +2 shortsword of sunlight: an extra 1d8 Radiant damage against undead.'
  },
  {
    item_type: 'item_magico',
    id: 'luck_blade',
    name: 'Luck Blade',
    category: 'Weapon',
    rarity: 'Legendary',
    price: '200000 po',
    attunement: true,
    description: 'A +1 sword that lets you reroll and holds 1–3 castings of Wish.'
  },
  {
    item_type: 'item_magico',
    id: 'flame_tongue',
    name: 'Flame Tongue',
    category: 'Weapon',
    rarity: 'Rare',
    price: '4000 po',
    attunement: true,
    description: 'The blade ignites as a Bonus Action, adding 2d6 Fire damage.'
  },
  {
    item_type: 'item_magico',
    id: 'berserker_axe',
    name: 'Berserker Axe',
    category: 'Weapon',
    rarity: 'Rare',
    price: '4000 po',
    attunement: true,
    description: '+1 and increased maximum HP, but cursed: it can force you to attack whoever is nearby.'
  },
  {
    item_type: 'item_magico',
    id: 'executioner_s_axe',
    name: "Executioner's Axe",
    category: 'Weapon',
    rarity: 'Very Rare',
    price: '40000 po',
    description: 'An oversized axe that beheads targets reduced to few hit points.'
  },
  {
    item_type: 'item_magico',
    id: 'axe_of_the_dwarvish_lords',
    name: 'Axe of the Dwarvish Lords',
    category: 'Weapon',
    rarity: 'Artifact',
    price: '—',
    attunement: true,
    description: 'A dwarven artifact: +3, Darkvision, dwarvish tongues, and assorted legendary properties.'
  },
  {
    item_type: 'item_magico',
    id: 'frost_brand',
    name: 'Frost Brand',
    category: 'Weapon',
    rarity: 'Very Rare',
    price: '40000 po',
    attunement: true,
    description: 'Extra 1d6 Cold damage, Fire resistance, and it snuffs out nearby flames.'
  },
  {
    item_type: 'item_magico',
    id: 'hammer_of_thunderbolts',
    name: 'Hammer of Thunderbolts',
    category: 'Weapon',
    rarity: 'Legendary',
    price: '200000 po',
    attunement: true,
    description: 'A +1 maul that slays giants on a DC 17 save, and grows deadlier with belt and gauntlets.'
  },
  {
    item_type: 'item_magico',
    id: 'dragon_slayer',
    name: 'Dragon Slayer',
    category: 'Weapon',
    rarity: 'Rare',
    price: '4000 po',
    description: '+1, and an extra 3d6 damage against dragons.'
  },
  {
    item_type: 'item_magico',
    id: 'giant_slayer',
    name: 'Giant Slayer',
    category: 'Weapon',
    rarity: 'Rare',
    price: '4000 po',
    description: '+1 and an extra 2d6 against giants, who may also be knocked Prone.'
  },
  {
    item_type: 'item_magico',
    id: 'mace_of_disruption',
    name: 'Mace of Disruption',
    category: 'Weapon',
    rarity: 'Rare',
    price: '4000 po',
    attunement: true,
    description: 'Extra 2d6 Radiant against undead and fiends; weaker ones may be destroyed outright.'
  },
  {
    item_type: 'item_magico',
    id: 'mace_of_smiting',
    name: 'Mace of Smiting',
    category: 'Weapon',
    rarity: 'Rare',
    price: '4000 po',
    description: '+1 (+3 against constructs), with devastating extra damage on a Critical Hit.'
  },
  {
    item_type: 'item_magico',
    id: 'mace_of_terror',
    name: 'Mace of Terror',
    category: 'Weapon',
    rarity: 'Rare',
    price: '4000 po',
    attunement: true,
    uses: { max: 3, recharge: 'dawn' },
    description: 'Frightens creatures within 30 feet (DC 15) for 1 minute. Three charges per day.'
  },
  {
    item_type: 'item_magico',
    id: 'ammunition_1_2_or_3',
    name: 'Ammunition, +1, +2, or +3',
    category: 'Weapon',
    rarity: 'Varies',
    price: '—',
    description: 'Bonus to attack and damage equal to its enchantment. Uncommon (+1), Rare (+2), Very Rare (+3).'
  },
  {
    item_type: 'item_magico',
    id: 'ammunition_of_slaying',
    name: 'Ammunition of Slaying',
    category: 'Weapon',
    rarity: 'Very Rare',
    price: '20000 po',
    description: 'Against its chosen creature type: DC 17 Constitution save or die instantly.'
  },
  {
    item_type: 'item_magico',
    id: 'walloping_ammunition',
    name: 'Walloping Ammunition',
    category: 'Weapon',
    rarity: 'Common',
    price: '50 po',
    description: 'On a hit, the target makes a DC 10 Strength save or falls Prone.'
  },
  {
    item_type: 'item_magico',
    id: 'blackrazor',
    name: 'Blackrazor',
    category: 'Weapon',
    rarity: 'Legendary',
    price: '200000 po',
    attunement: true,
    description: 'A sentient soul-devouring greatsword: +3, and it absorbs the hit points of those it slays.'
  },
  {
    item_type: 'item_magico',
    id: 'wave',
    name: 'Wave',
    category: 'Weapon',
    rarity: 'Artifact',
    price: '—',
    attunement: true,
    description: 'An artifact trident of the seas: extra damage, water breathing, and elemental summoning.'
  },
  {
    item_type: 'item_magico',
    id: 'trident_of_fish_command',
    name: 'Trident of Fish Command',
    category: 'Weapon',
    rarity: 'Uncommon',
    price: '400 po',
    attunement: true,
    uses: { max: 3, recharge: 'dawn' },
    description: 'Casts Dominate Beast (DC 15) against aquatic beasts. Three charges per day.'
  },
  {
    item_type: 'item_magico',
    id: 'holy_avenger',
    name: 'Holy Avenger',
    category: 'Weapon',
    rarity: 'Legendary',
    price: '200000 po',
    attunement: true,
    description: 'A +3 sword in a paladin’s hands: 2d10 Radiant against fiends and an antimagic aura.'
  },
  {
    item_type: 'item_magico',
    id: 'armor_1_2_or_3',
    name: 'Armor, +1, +2, or +3',
    category: 'Armor',
    rarity: 'Varies',
    price: '—',
    description: 'Bonus to AC equal to its enchantment. Rare (+1), Very Rare (+2), Legendary (+3).'
  },
  {
    item_type: 'item_magico',
    id: 'demon_armor',
    name: 'Demon Armor',
    category: 'Armor',
    rarity: 'Very Rare',
    price: '40000 po',
    attunement: true,
    description: '+1 AC, claws dealing 1d8, and Abyssal speech — but the armor is cursed.'
  },
  {
    item_type: 'item_magico',
    id: 'smoldering_armor',
    name: 'Smoldering Armor',
    category: 'Armor',
    rarity: 'Common',
    price: '100 po',
    description: 'Gives off constant harmless smoke, with no heat and no damage.'
  },
  {
    item_type: 'item_magico',
    id: 'armor_of_gleaming',
    name: 'Armor of Gleaming',
    category: 'Armor',
    rarity: 'Common',
    price: '100 po',
    description: 'Never gets dirty or rusts. No other magical effect.'
  },
  {
    item_type: 'item_magico',
    id: 'armor_of_invulnerability',
    name: 'Armor of Invulnerability',
    category: 'Armor',
    rarity: 'Legendary',
    price: '200000 po',
    attunement: true,
    description: 'Resistance to physical damage; for 10 minutes a day, full immunity to physical damage.'
  },
  {
    item_type: 'item_magico',
    id: 'armor_of_vulnerability',
    name: 'Armor of Vulnerability',
    category: 'Armor',
    rarity: 'Rare',
    price: '4000 po',
    attunement: true,
    description: 'Resistance to one physical damage type, but a cursed vulnerability to the other two.'
  },
  {
    item_type: 'item_magico',
    id: 'adamantine_armor',
    name: 'Adamantine Armor',
    category: 'Armor',
    rarity: 'Uncommon',
    price: '400 po',
    description: 'Critical hits against the wearer become normal hits.'
  },
  {
    item_type: 'item_magico',
    id: 'cast_off_armor',
    name: 'Cast-Off Armor',
    category: 'Armor',
    rarity: 'Common',
    price: '100 po',
    description: 'You can doff it with a single action, however heavy it is.'
  },
  {
    item_type: 'item_magico',
    id: 'mithral_armor',
    name: 'Mithral Armor',
    category: 'Armor',
    rarity: 'Uncommon',
    price: '400 po',
    description: 'Imposes no Stealth Disadvantage and has no Strength requirement.'
  },
  {
    item_type: 'item_magico',
    id: 'armor_of_resistance',
    name: 'Armor of Resistance',
    category: 'Armor',
    rarity: 'Rare',
    price: '4000 po',
    attunement: true,
    description: 'Resistance to one damage type, determined when the armor is created.'
  },
  {
    item_type: 'item_magico',
    id: 'mariner_s_armor',
    name: "Mariner's Armor",
    category: 'Armor',
    rarity: 'Uncommon',
    price: '400 po',
    description: 'Grants a Swim Speed and keeps you from sinking and drowning.'
  },
  {
    item_type: 'item_magico',
    id: 'dragon_scale_mail',
    name: 'Dragon Scale Mail',
    category: 'Armor',
    rarity: 'Very Rare',
    price: '40000 po',
    attunement: true,
    description: '+1 AC, resistance to the matching dragon’s damage, and a sense for nearby dragons.'
  },
  {
    item_type: 'item_magico',
    id: 'efreeti_chain',
    name: 'Efreeti Chain',
    category: 'Armor',
    rarity: 'Legendary',
    price: '200000 po',
    attunement: true,
    description: '+3 AC, immunity to Fire damage, and the ability to walk on lava and air.'
  },
  {
    item_type: 'item_magico',
    id: 'elven_chain',
    name: 'Elven Chain',
    category: 'Armor',
    rarity: 'Rare',
    price: '4000 po',
    description: '+1 AC, and you are proficient with it even without medium armor training.'
  },
  {
    item_type: 'item_magico',
    id: 'glamoured_studded_leather',
    name: 'Glamoured Studded Leather',
    category: 'Armor',
    rarity: 'Rare',
    price: '4000 po',
    description: '+1 AC, and it changes appearance into any outfit you imagine.'
  },
  {
    item_type: 'item_magico',
    id: 'shield_1_2_or_3',
    name: 'Shield, +1, +2, or +3',
    category: 'Armor',
    rarity: 'Varies',
    price: '—',
    description: 'AC beyond the normal +2. Uncommon (+1), Rare (+2), Very Rare (+3).'
  },
  {
    item_type: 'item_magico',
    id: 'animated_shield',
    name: 'Animated Shield',
    category: 'Armor',
    rarity: 'Very Rare',
    price: '40000 po',
    attunement: true,
    description: 'As a Bonus Action it floats free, granting its AC bonus with both hands free for 1 minute.'
  },
  {
    item_type: 'item_magico',
    id: 'arrow_catching_shield',
    name: 'Arrow-Catching Shield',
    category: 'Armor',
    rarity: 'Rare',
    price: '4000 po',
    attunement: true,
    description: '+2 AC against ranged attacks, and you can redirect shots aimed at nearby allies to yourself.'
  },
  {
    item_type: 'item_magico',
    id: 'shield_of_expression',
    name: 'Shield of Expression',
    category: 'Armor',
    rarity: 'Common',
    price: '100 po',
    description: 'The face carved on the shield changes expression as you wish.'
  },
  {
    item_type: 'item_magico',
    id: 'spellguard_shield',
    name: 'Spellguard Shield',
    category: 'Armor',
    rarity: 'Very Rare',
    price: '40000 po',
    attunement: true,
    description: 'Advantage on saving throws against spells, and Disadvantage on spell attacks against you.'
  },
  {
    item_type: 'item_magico',
    id: 'sentinel_shield',
    name: 'Sentinel Shield',
    category: 'Armor',
    rarity: 'Uncommon',
    price: '400 po',
    description: 'Advantage on initiative and on Perception checks.'
  },
  {
    item_type: 'item_magico',
    id: 'shield_of_missile_attraction',
    name: 'Shield of Missile Attraction',
    category: 'Armor',
    rarity: 'Rare',
    price: '4000 po',
    attunement: true,
    description: 'Resistance to ranged attacks, but cursed: it draws shots aimed at allies to you.'
  },
  {
    item_type: 'item_magico',
    id: 'shield_of_the_cavalier',
    name: 'Shield of the Cavalier',
    category: 'Armor',
    rarity: 'Very Rare',
    price: '40000 po',
    attunement: true,
    description: 'A war shield that also protects adjacent allies and repels charges.'
  },
  {
    item_type: 'item_magico',
    id: 'dwarven_plate',
    name: 'Dwarven Plate',
    category: 'Armor',
    rarity: 'Very Rare',
    price: '40000 po',
    description: '+2 AC, and resistance to being moved or knocked Prone against your will.'
  },
  {
    item_type: 'item_magico',
    id: 'plate_armor_of_etherealness',
    name: 'Plate Armor of Etherealness',
    category: 'Armor',
    rarity: 'Legendary',
    price: '200000 po',
    attunement: true,
    uses: { max: 1, recharge: 'dawn' },
    description: 'Sends you and your gear to the Ethereal Plane for 10 minutes, once per day.'
  },
  {
    item_type: 'item_magico',
    id: 'dimensional_shackles',
    name: 'Dimensional Shackles',
    category: 'Wondrous Item',
    rarity: 'Rare',
    price: '4000 po',
    description: 'They prevent the prisoner from using any form of teleportation or planar travel.'
  },
  {
    item_type: 'item_magico',
    id: 'quiver_of_ehlonna',
    name: 'Quiver of Ehlonna',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '400 po',
    description: 'Three compartments hold arrows, bows, and spears without adding weight.'
  },
  {
    item_type: 'item_magico',
    id: 'amulet_of_health',
    name: 'Amulet of Health',
    category: 'Wondrous Item',
    rarity: 'Rare',
    price: '4000 po',
    attunement: true,
    description: 'Your Constitution becomes 19 unless it is already higher.'
  },
  {
    item_type: 'item_magico',
    id: 'clockwork_amulet',
    name: 'Clockwork Amulet',
    category: 'Wondrous Item',
    rarity: 'Common',
    price: '100 po',
    uses: { max: 1, recharge: 'dawn' },
    description: 'Once per day, replace an attack roll with a flat 10.'
  },
  {
    item_type: 'item_magico',
    id: 'dark_shard_amulet',
    name: 'Dark Shard Amulet',
    category: 'Wondrous Item',
    rarity: 'Common',
    price: '100 po',
    attunement: true,
    description: 'A warlock spellcasting focus; it may let you cast one cantrip from the Warlock list.'
  },
  {
    item_type: 'item_magico',
    id: 'amulet_of_the_planes',
    name: 'Amulet of the Planes',
    category: 'Wondrous Item',
    rarity: 'Very Rare',
    price: '40000 po',
    attunement: true,
    description: 'Casts Plane Shift to a plane you know; DC 15 Intelligence or you arrive somewhere random.'
  },
  {
    item_type: 'item_magico',
    id: 'amulet_of_proof_against_detection_and_location',
    name: 'Amulet of Proof against Detection and Location',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '400 po',
    attunement: true,
    description: 'You are hidden from divination and cannot be targeted or perceived by magical scrying.'
  },
  {
    item_type: 'item_magico',
    id: 'apparatus_of_kwalish',
    name: 'Apparatus of Kwalish',
    category: 'Wondrous Item',
    rarity: 'Legendary',
    price: '200000 po',
    description: 'An iron barrel that unfolds into a lobster-shaped submersible with ten control levers.'
  },
  {
    item_type: 'item_magico',
    id: 'wings_of_flying',
    name: 'Wings of Flying',
    category: 'Wondrous Item',
    rarity: 'Rare',
    price: '4000 po',
    attunement: true,
    description: 'The cloak becomes wings: a Fly Speed equal to your Speed for up to 1 hour.'
  },
  {
    item_type: 'item_magico',
    id: 'headband_of_intellect',
    name: 'Headband of Intellect',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '400 po',
    attunement: true,
    description: 'Your Intelligence becomes 19 unless it is already higher.'
  },
  {
    item_type: 'item_magico',
    id: 'iron_bands_of_bilarro',
    name: 'Iron Bands of Bilarro',
    category: 'Wondrous Item',
    rarity: 'Rare',
    price: '4000 po',
    description: 'A thrown sphere that wraps the target (DC 20), leaving it Restrained.'
  },
  {
    item_type: 'item_magico',
    id: 'deck_of_many_things',
    name: 'Deck of Many Things',
    category: 'Wondrous Item',
    rarity: 'Legendary',
    price: '200000 po',
    description: 'Each card triggers a powerful, irreversible effect, from riches to the loss of your soul.'
  },
  {
    item_type: 'item_magico',
    id: 'deck_of_illusions',
    name: 'Deck of Illusions',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '400 po',
    description: 'Cards thrown to the ground create convincing illusions of creatures for 1 hour.'
  },
  {
    item_type: 'item_magico',
    id: 'folding_boat',
    name: 'Folding Boat',
    category: 'Wondrous Item',
    rarity: 'Rare',
    price: '4000 po',
    description: 'A wooden box that becomes a 10-foot boat or a 24-foot ship on command.'
  },
  {
    item_type: 'item_magico',
    id: 'veteran_s_cane',
    name: "Veteran's Cane",
    category: 'Wondrous Item',
    rarity: 'Common',
    price: '100 po',
    description: 'A cane that becomes an ordinary longsword when you draw it.'
  },
  {
    item_type: 'item_magico',
    id: 'crystal_ball',
    name: 'Crystal Ball',
    category: 'Wondrous Item',
    rarity: 'Very Rare',
    price: '40000 po',
    attunement: true,
    description: 'Casts Scrying (DC 17) while you touch it.'
  },
  {
    item_type: 'item_magico',
    id: 'crystal_ball_of_mind_reading',
    name: 'Crystal Ball of Mind Reading',
    category: 'Wondrous Item',
    rarity: 'Legendary',
    price: '200000 po',
    attunement: true,
    description: 'Like the Crystal Ball, and it also casts Detect Thoughts on creatures you observe.'
  },
  {
    item_type: 'item_magico',
    id: 'crystal_ball_of_telepathy',
    name: 'Crystal Ball of Telepathy',
    category: 'Wondrous Item',
    rarity: 'Legendary',
    price: '200000 po',
    attunement: true,
    description: 'Like the Crystal Ball, and it lets you communicate telepathically with those you observe.'
  },
  {
    item_type: 'item_magico',
    id: 'crystal_ball_of_true_seeing',
    name: 'Crystal Ball of True Seeing',
    category: 'Wondrous Item',
    rarity: 'Legendary',
    price: '200000 po',
    attunement: true,
    description: 'Like the Crystal Ball, and it grants Truesight out to 120 feet around the sensor.'
  },
  {
    item_type: 'item_magico',
    id: 'bag_of_holding',
    name: 'Bag of Holding',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '400 po',
    description: 'An extradimensional space holding up to 500 lb.; the bag itself always weighs 15 lb.'
  },
  {
    item_type: 'item_magico',
    id: 'heward_s_handy_spice_pouch',
    name: "Heward's Handy Spice Pouch",
    category: 'Wondrous Item',
    rarity: 'Common',
    price: '100 po',
    description: 'Produces any common spice and improves rations enough to count as a meal.'
  },
  {
    item_type: 'item_magico',
    id: 'talking_doll',
    name: 'Talking Doll',
    category: 'Wondrous Item',
    rarity: 'Common',
    price: '100 po',
    attunement: true,
    description: 'Holds up to six phrases of six words each and speaks them on cue.'
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
    id: 'boots_of_the_winterlands',
    name: 'Boots of the Winterlands',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '400 po',
    attunement: true,
    description: 'Cold resistance, icy terrain does not slow you, and you tolerate down to −50 °F.'
  },
  {
    item_type: 'item_magico',
    id: 'boots_of_levitation',
    name: 'Boots of Levitation',
    category: 'Wondrous Item',
    rarity: 'Rare',
    price: '4000 po',
    attunement: true,
    description: 'Cast Levitate on yourself at will.'
  },
  {
    item_type: 'item_magico',
    id: 'boots_of_striding_and_springing',
    name: 'Boots of Striding and Springing',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '400 po',
    attunement: true,
    description: 'Your Speed becomes 30 feet regardless of armor, and your jump distance triples.'
  },
  {
    item_type: 'item_magico',
    id: 'boots_of_false_tracks',
    name: 'Boots of False Tracks',
    category: 'Wondrous Item',
    rarity: 'Common',
    price: '100 po',
    attunement: true,
    description: 'The tracks you leave are those of another humanoid species of your choice.'
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
    id: 'boots_of_elvenkind',
    name: 'Boots of Elvenkind',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '400 po',
    description: 'Your steps make no sound: Advantage on Stealth checks to move silently.'
  },
  {
    item_type: 'item_magico',
    id: 'bracers_of_archery',
    name: 'Bracers of Archery',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '400 po',
    attunement: true,
    description: 'Proficiency with longbows and shortbows, and +2 damage with them.'
  },
  {
    item_type: 'item_magico',
    id: 'bracers_of_defense',
    name: 'Bracers of Defense',
    category: 'Wondrous Item',
    rarity: 'Rare',
    price: '4000 po',
    attunement: true,
    description: '+2 AC while you wear no armor and carry no shield.'
  },
  {
    item_type: 'item_magico',
    id: 'brazier_of_commanding_fire_elementals',
    name: 'Brazier of Commanding Fire Elementals',
    category: 'Wondrous Item',
    rarity: 'Rare',
    price: '4000 po',
    description: 'Summons a fire elemental that obeys you for 1 hour.'
  },
  {
    item_type: 'item_magico',
    id: 'brooch_of_shielding',
    name: 'Brooch of Shielding',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '400 po',
    attunement: true,
    description: 'Resistance to Force damage and immunity to Magic Missile.'
  },
  {
    item_type: 'item_magico',
    id: 'portable_hole',
    name: 'Portable Hole',
    category: 'Wondrous Item',
    rarity: 'Rare',
    price: '4000 po',
    description: 'A cloth that opens a 6-foot-wide, 10-foot-deep extradimensional pit.'
  },
  {
    item_type: 'item_magico',
    id: 'pipe_of_smoke_monsters',
    name: 'Pipe of Smoke Monsters',
    category: 'Wondrous Item',
    rarity: 'Common',
    price: '100 po',
    description: 'The smoke you exhale takes the shape of harmless monsters.'
  },
  {
    item_type: 'item_magico',
    id: 'lock_of_trickery',
    name: 'Lock of Trickery',
    category: 'Wondrous Item',
    rarity: 'Common',
    price: '100 po',
    description: 'Looks ordinary but requires a DC 15 check to pick.'
  },
  {
    item_type: 'item_magico',
    id: 'cauldron_of_rebirth',
    name: 'Cauldron of Rebirth',
    category: 'Wondrous Item',
    rarity: 'Very Rare',
    price: '40000 po',
    attunement: true,
    description: 'A hag’s cauldron that casts Raise Dead on a corpse immersed in it.'
  },
  {
    item_type: 'item_magico',
    id: 'tankard_of_sobriety',
    name: 'Tankard of Sobriety',
    category: 'Wondrous Item',
    rarity: 'Common',
    price: '100 po',
    description: 'You never become drunk from what you drink in it.'
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
    id: 'cape_of_the_mountebank',
    name: 'Cape of the Mountebank',
    category: 'Wondrous Item',
    rarity: 'Rare',
    price: '4000 po',
    uses: { max: 1, recharge: 'dawn' },
    description: 'Casts Dimension Door once per day, leaving smoke at both departure and arrival.'
  },
  {
    item_type: 'item_magico',
    id: 'hat_of_wizardry',
    name: 'Hat of Wizardry',
    category: 'Wondrous Item',
    rarity: 'Common',
    price: '100 po',
    attunement: true,
    description: 'An arcane focus that can grant a wizard cantrip plus one extra daily casting.'
  },
  {
    item_type: 'item_magico',
    id: 'hat_of_many_spells',
    name: 'Hat of Many Spells',
    category: 'Wondrous Item',
    rarity: 'Very Rare',
    price: '40000 po',
    attunement: true,
    description: 'A wizard’s hat that casts one random higher-level spell each day.'
  },
  {
    item_type: 'item_magico',
    id: 'hat_of_disguise',
    name: 'Hat of Disguise',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '400 po',
    attunement: true,
    description: 'Casts Disguise Self at will.'
  },
  {
    item_type: 'item_magico',
    id: 'hat_of_vermin',
    name: 'Hat of Vermin',
    category: 'Wondrous Item',
    rarity: 'Common',
    price: '100 po',
    description: 'Produces three harmless tiny animals that vanish after 1 hour.'
  },
  {
    item_type: 'item_magico',
    id: 'mystery_key',
    name: 'Mystery Key',
    category: 'Wondrous Item',
    rarity: 'Common',
    price: '100 po',
    description: 'Opens one lock of any kind, a single time.'
  },
  {
    item_type: 'item_magico',
    id: 'belt_of_dwarvenkind',
    name: 'Belt of Dwarvenkind',
    category: 'Wondrous Item',
    rarity: 'Rare',
    price: '4000 po',
    attunement: true,
    description: 'Constitution 19, Advantage on social checks with dwarves, Darkvision, and poison resistance.'
  },
  {
    item_type: 'item_magico',
    id: 'belt_of_giant_strength',
    name: 'Belt of Giant Strength',
    category: 'Wondrous Item',
    rarity: 'Varies',
    price: '—',
    attunement: true,
    description: 'Sets Strength by giant type: hill 21, stone/frost 23, fire 25, cloud 27, storm 29.'
  },
  {
    item_type: 'item_magico',
    id: 'sovereign_glue',
    name: 'Sovereign Glue',
    category: 'Wondrous Item',
    rarity: 'Legendary',
    price: '100000 po',
    description: 'An adhesive that bonds two objects permanently; only Universal Solvent parts them.'
  },
  {
    item_type: 'item_magico',
    id: 'necklace_of_adaptation',
    name: 'Necklace of Adaptation',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '400 po',
    attunement: true,
    description: 'You breathe normally in any environment and are immune to harmful gases.'
  },
  {
    item_type: 'item_magico',
    id: 'colar_de_bolas_de_fogo',
    name: 'Necklace of Fireballs',
    category: 'Wondrous Item',
    rarity: 'Rare',
    price: '3000 po',
    description: 'A necklace of 1d6 + 3 orange amber beads. An action detaches and hurls one bead up to 18 m, where it detonates as a level 3 Fireball (DC 15). Extra beads add 1d6 damage each, up to 12d6.'
  },
  {
    item_type: 'item_magico',
    id: 'necklace_of_prayer_beads',
    name: 'Necklace of Prayer Beads',
    category: 'Wondrous Item',
    rarity: 'Rare',
    price: '4000 po',
    attunement: true,
    description: 'Each magic bead holds one divine spell, recharged on a Long Rest.'
  },
  {
    item_type: 'item_magico',
    id: 'rope_of_mending',
    name: 'Rope of Mending',
    category: 'Wondrous Item',
    rarity: 'Common',
    price: '100 po',
    description: 'It can be cut into pieces and rejoins into one whole rope on command.'
  },
  {
    item_type: 'item_magico',
    id: 'rope_of_climbing',
    name: 'Rope of Climbing',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '400 po',
    description: 'Sixty feet of rope that moves, knots, and unknots at your command.'
  },
  {
    item_type: 'item_magico',
    id: 'rope_of_entanglement',
    name: 'Rope of Entanglement',
    category: 'Wondrous Item',
    rarity: 'Rare',
    price: '4000 po',
    description: 'Entangles a creature within 20 feet (DC 15), leaving it Restrained.'
  },
  {
    item_type: 'item_magico',
    id: 'ear_horn_of_hearing',
    name: 'Ear Horn of Hearing',
    category: 'Wondrous Item',
    rarity: 'Common',
    price: '100 po',
    description: 'Ends the Deafened condition while held to your ear.'
  },
  {
    item_type: 'item_magico',
    id: 'cube_of_force',
    name: 'Cube of Force',
    category: 'Wondrous Item',
    rarity: 'Rare',
    price: '4000 po',
    attunement: true,
    description: 'Raises a 15-foot force barrier in six modes, blocking matter, magic, or both.'
  },
  {
    item_type: 'item_magico',
    id: 'cube_of_summoning',
    name: 'Cube of Summoning',
    category: 'Wondrous Item',
    rarity: 'Rare',
    price: '4000 po',
    description: 'An elemental cube that summons a servant from the plane matching the face you press.'
  },
  {
    item_type: 'item_magico',
    id: 'charlatan_s_die',
    name: "Charlatan's Die",
    category: 'Wondrous Item',
    rarity: 'Common',
    price: '100 po',
    attunement: true,
    description: 'You choose the number the die rolls before it lands.'
  },
  {
    item_type: 'item_magico',
    id: 'helm_of_comprehending_languages',
    name: 'Helm of Comprehending Languages',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '400 po',
    description: 'Casts Comprehend Languages as a ritual, at will.'
  },
  {
    item_type: 'item_magico',
    id: 'helm_of_telepathy',
    name: 'Helm of Telepathy',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '400 po',
    attunement: true,
    uses: { max: 1, recharge: 'dawn' },
    description: 'Detect Thoughts at will, plus Suggestion once per day.'
  },
  {
    item_type: 'item_magico',
    id: 'helm_of_brilliance',
    name: 'Helm of Brilliance',
    category: 'Wondrous Item',
    rarity: 'Very Rare',
    price: '40000 po',
    attunement: true,
    description: 'Studded with gems that cast fire and light spells and sear undead with Radiant damage.'
  },
  {
    item_type: 'item_magico',
    id: 'helm_of_teleportation',
    name: 'Helm of Teleportation',
    category: 'Wondrous Item',
    rarity: 'Rare',
    price: '4000 po',
    attunement: true,
    uses: { max: 3, recharge: 'dawn' },
    description: 'Casts Teleport, with three charges per day.'
  },
  {
    item_type: 'item_magico',
    id: 'dread_helm',
    name: 'Dread Helm',
    category: 'Wondrous Item',
    rarity: 'Common',
    price: '100 po',
    description: 'Makes your eyes glow red and hides the rest of your face in shadow.'
  },
  {
    item_type: 'item_magico',
    id: 'scarab_of_protection',
    name: 'Scarab of Protection',
    category: 'Wondrous Item',
    rarity: 'Legendary',
    price: '200000 po',
    attunement: true,
    description: 'Advantage against spells, and it cancels life-draining attacks from undead.'
  },
  {
    item_type: 'item_magico',
    id: 'sphere_of_annihilation',
    name: 'Sphere of Annihilation',
    category: 'Wondrous Item',
    rarity: 'Legendary',
    price: '200000 po',
    description: 'A 2-foot hole that destroys all it touches: 4d10 Force damage per turn of contact.'
  },
  {
    item_type: 'item_magico',
    id: 'bead_of_force',
    name: 'Bead of Force',
    category: 'Wondrous Item',
    rarity: 'Rare',
    price: '2000 po',
    description: 'Thrown, it deals 5d4 Force damage and traps targets in a sphere of force for 1 minute.'
  },
  {
    item_type: 'item_magico',
    id: 'bead_of_nourishment',
    name: 'Bead of Nourishment',
    category: 'Wondrous Item',
    rarity: 'Common',
    price: '50 po',
    description: 'Swallowing the bead nourishes you as a full day of food.'
  },
  {
    item_type: 'item_magico',
    id: 'bead_of_refreshment',
    name: 'Bead of Refreshment',
    category: 'Wondrous Item',
    rarity: 'Common',
    price: '50 po',
    description: 'Dissolved in liquid, it becomes a day of clean, flavorful water.'
  },
  {
    item_type: 'item_magico',
    id: 'mirror_of_life_trapping',
    name: 'Mirror of Life Trapping',
    category: 'Wondrous Item',
    rarity: 'Very Rare',
    price: '40000 po',
    description: 'Traps those who look into it (DC 15) in one of its twelve extradimensional cells.'
  },
  {
    item_type: 'item_magico',
    id: 'figurine_of_wondrous_power',
    name: 'Figurine of Wondrous Power',
    category: 'Wondrous Item',
    rarity: 'Varies',
    price: '—',
    description: 'A statuette that becomes a real allied beast. Rarity varies by creature.'
  },
  {
    item_type: 'item_magico',
    id: 'wraps_of_unarmed_power',
    name: 'Wraps of Unarmed Power',
    category: 'Wondrous Item',
    rarity: 'Varies',
    price: '—',
    description: 'A magic bonus to Unarmed Strikes. Uncommon (+1), Rare (+2), Very Rare (+3).'
  },
  {
    item_type: 'item_magico',
    id: 'horseshoes_of_speed',
    name: 'Horseshoes of Speed',
    category: 'Wondrous Item',
    rarity: 'Rare',
    price: '4000 po',
    description: 'The shod mount gains +30 feet of Speed.'
  },
  {
    item_type: 'item_magico',
    id: 'horseshoes_of_a_zephyr',
    name: 'Horseshoes of a Zephyr',
    category: 'Wondrous Item',
    rarity: 'Very Rare',
    price: '40000 po',
    description: 'The mount runs on air, ignores Difficult Terrain, and leaves no tracks.'
  },
  {
    item_type: 'item_magico',
    id: 'quaal_s_feather_token',
    name: "Quaal's Feather Token",
    category: 'Wondrous Item',
    rarity: 'Varies',
    price: '—',
    description: 'A single-use feather: anchor, bird, fan, boat, whip, tree, or swan boat.'
  },
  {
    item_type: 'item_magico',
    id: 'pipes_of_haunting',
    name: 'Pipes of Haunting',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '400 po',
    uses: { max: 3, recharge: 'manual' },
    description: 'The tune Frightens listeners within 30 feet (DC 15) for 1 minute. Three charges.'
  },
  {
    item_type: 'item_magico',
    id: 'pipes_of_the_sewers',
    name: 'Pipes of the Sewers',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '400 po',
    attunement: true,
    description: 'Attract and command rats and other vermin within 500 feet.'
  },
  {
    item_type: 'item_magico',
    id: 'daern_s_instant_fortress',
    name: "Daern's Instant Fortress",
    category: 'Wondrous Item',
    rarity: 'Rare',
    price: '4000 po',
    attunement: true,
    description: 'An adamantine cube that becomes a 20-foot tower with AC 20 and 100 Hit Points.'
  },
  {
    item_type: 'item_magico',
    id: 'iron_flask',
    name: 'Iron Flask',
    category: 'Wondrous Item',
    rarity: 'Legendary',
    price: '200000 po',
    description: 'Traps an extraplanar creature (DC 17), then releases it as a servant for 1 hour.'
  },
  {
    item_type: 'item_magico',
    id: 'eversmoking_bottle',
    name: 'Eversmoking Bottle',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '400 po',
    description: 'Belches thick smoke that spreads and heavily obscures a growing area until stoppered.'
  },
  {
    item_type: 'item_magico',
    id: 'decanter_of_endless_water',
    name: 'Decanter of Endless Water',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '400 po',
    description: 'Pours clean water in three settings: a stream, a fountain, or a 30-gallon geyser.'
  },
  {
    item_type: 'item_magico',
    id: 'efreeti_bottle',
    name: 'Efreeti Bottle',
    category: 'Wondrous Item',
    rarity: 'Very Rare',
    price: '40000 po',
    description: 'An efreeti emerges: it may attack, serve for 1 hour, or grant three wishes.'
  },
  {
    item_type: 'item_magico',
    id: 'elemental_gem',
    name: 'Elemental Gem',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '200 po',
    description: 'Broken, it summons an elemental from the plane matching its color.'
  },
  {
    item_type: 'item_magico',
    id: 'gem_of_seeing',
    name: 'Gem of Seeing',
    category: 'Wondrous Item',
    rarity: 'Rare',
    price: '4000 po',
    attunement: true,
    uses: { max: 3, recharge: 'dawn' },
    description: 'Grants Truesight out to 120 feet for 10 minutes. Three charges per day.'
  },
  {
    item_type: 'item_magico',
    id: 'gem_of_brightness',
    name: 'Gem of Brightness',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '400 po',
    uses: { max: 50, recharge: 'manual' },
    description: 'Sheds light, a blinding beam, or a flash that Blinds (DC 15). Fifty charges.'
  },
  {
    item_type: 'item_magico',
    id: 'driftglobe',
    name: 'Driftglobe',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '400 po',
    description: 'A sphere that casts Light or Daylight and floats along beside you.'
  },
  {
    item_type: 'item_magico',
    id: 'cap_of_water_breathing',
    name: 'Cap of Water Breathing',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '400 po',
    description: 'Underwater, it lets you breathe normally.'
  },
  {
    item_type: 'item_magico',
    id: 'enduring_spellbook',
    name: 'Enduring Spellbook',
    category: 'Wondrous Item',
    rarity: 'Common',
    price: '100 po',
    description: 'Immune to fire, water, and age: it never decays or loses pages.'
  },
  {
    item_type: 'item_magico',
    id: 'instrument_of_scribing',
    name: 'Instrument of Scribing',
    category: 'Wondrous Item',
    rarity: 'Common',
    price: '100 po',
    description: 'Writes magical messages invisible to anyone you do not choose.'
  },
  {
    item_type: 'item_magico',
    id: 'instrument_of_illusions',
    name: 'Instrument of Illusions',
    category: 'Wondrous Item',
    rarity: 'Common',
    price: '100 po',
    description: 'Your music creates harmless illusory images while you play.'
  },
  {
    item_type: 'item_magico',
    id: 'instrument_of_the_bards',
    name: 'Instrument of the Bards',
    category: 'Wondrous Item',
    rarity: 'Varies',
    price: '—',
    attunement: true,
    description: 'Seven versions, each with its own spell list. Rarity varies by instrument.'
  },
  {
    item_type: 'item_magico',
    id: 'alchemy_jug',
    name: 'Alchemy Jug',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '400 po',
    description: 'Produces a chosen liquid each day: water, wine, honey, acid, poison, or beer.'
  },
  {
    item_type: 'item_magico',
    id: 'lantern_of_revealing',
    name: 'Lantern of Revealing',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '400 po',
    description: 'Reveals Invisible creatures and objects within its bright light.'
  },
  {
    item_type: 'item_magico',
    id: 'wind_fan',
    name: 'Wind Fan',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '400 po',
    description: 'Casts Gust of Wind; repeated use risks destroying the fan.'
  },
  {
    item_type: 'item_magico',
    id: 'book_of_vile_darkness',
    name: 'Book of Vile Darkness',
    category: 'Wondrous Item',
    rarity: 'Artifact',
    price: '—',
    attunement: true,
    description: 'A profane artifact: it grants atrocious power at the cost of the reader’s permanent corruption.'
  },
  {
    item_type: 'item_magico',
    id: 'book_of_exalted_deeds',
    name: 'Book of Exalted Deeds',
    category: 'Wondrous Item',
    rarity: 'Artifact',
    price: '—',
    attunement: true,
    description: 'A sacred artifact: six days of study raise Wisdom and grant celestial blessings.'
  },
  {
    item_type: 'item_magico',
    id: 'gloves_of_missile_snaring',
    name: 'Gloves of Missile Snaring',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '400 po',
    attunement: true,
    description: 'Reduce ranged weapon damage; if it drops to 0, you catch the missile.'
  },
  {
    item_type: 'item_magico',
    id: 'gloves_of_thievery',
    name: 'Gloves of Thievery',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '400 po',
    description: '+5 to Sleight of Hand and to checks made to pick locks.'
  },
  {
    item_type: 'item_magico',
    id: 'gloves_of_swimming_and_climbing',
    name: 'Gloves of Swimming and Climbing',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '400 po',
    attunement: true,
    description: 'Climbing and swimming cost no extra movement, with Advantage on Athletics for both.'
  },
  {
    item_type: 'item_magico',
    id: 'gauntlets_of_ogre_power',
    name: 'Gauntlets of Ogre Power',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '400 po',
    attunement: true,
    description: 'Your Strength becomes 19 unless it is already higher.'
  },
  {
    item_type: 'item_magico',
    id: 'cloak_of_billowing',
    name: 'Cloak of Billowing',
    category: 'Wondrous Item',
    rarity: 'Common',
    price: '100 po',
    description: 'Billows dramatically on command. Purely cosmetic.'
  },
  {
    item_type: 'item_magico',
    id: 'cloak_of_arachnida',
    name: 'Cloak of Arachnida',
    category: 'Wondrous Item',
    rarity: 'Very Rare',
    price: '40000 po',
    attunement: true,
    description: 'Poison resistance, web walking, a daily Web spell, and immunity to being stuck in webs.'
  },
  {
    item_type: 'item_magico',
    id: 'cloak_of_the_manta_ray',
    name: 'Cloak of the Manta Ray',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '400 po',
    attunement: true,
    description: 'With the hood up, you breathe underwater and gain a 60-foot Swim Speed.'
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
  },
  {
    item_type: 'item_magico',
    id: 'nature_s_mantle',
    name: "Nature's Mantle",
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '400 po',
    attunement: true,
    description: 'Lets you Hide in natural terrain even when observed, and casts Pass without Trace.'
  },
  {
    item_type: 'item_magico',
    id: 'mantle_of_spell_resistance',
    name: 'Mantle of Spell Resistance',
    category: 'Wondrous Item',
    rarity: 'Rare',
    price: '4000 po',
    attunement: true,
    description: 'Advantage on saving throws against spells.'
  },
  {
    item_type: 'item_magico',
    id: 'robe_of_scintillating_colors',
    name: 'Robe of Scintillating Colors',
    category: 'Wondrous Item',
    rarity: 'Very Rare',
    price: '40000 po',
    attunement: true,
    description: 'Hypnotic lights grant allies Advantage and Blind foes (DC 15).'
  },
  {
    item_type: 'item_magico',
    id: 'robe_of_stars',
    name: 'Robe of Stars',
    category: 'Wondrous Item',
    rarity: 'Very Rare',
    price: '40000 po',
    attunement: true,
    description: '+1 to saving throws, travel to the Astral Plane, and hurl up to six 5d4 stars.'
  },
  {
    item_type: 'item_magico',
    id: 'cloak_of_many_fashions',
    name: 'Cloak of Many Fashions',
    category: 'Wondrous Item',
    rarity: 'Common',
    price: '100 po',
    description: 'Changes color, cut, and style as a Bonus Action.'
  },
  {
    item_type: 'item_magico',
    id: 'robe_of_useful_items',
    name: 'Robe of Useful Items',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '400 po',
    description: 'Patches that become real objects: ropes, doors, chests, even a boat.'
  },
  {
    item_type: 'item_magico',
    id: 'robe_of_the_archmagi',
    name: 'Robe of the Archmagi',
    category: 'Wondrous Item',
    rarity: 'Legendary',
    price: '200000 po',
    attunement: true,
    description: 'AC 15 unarmored, Advantage against spells, and +2 to your spell save DC.'
  },
  {
    item_type: 'item_magico',
    id: 'cloak_of_displacement',
    name: 'Cloak of Displacement',
    category: 'Wondrous Item',
    rarity: 'Rare',
    price: '4000 po',
    attunement: true,
    description: 'An illusion displaces your image: attacks against you have Disadvantage until you take damage.'
  },
  {
    item_type: 'item_magico',
    id: 'cloak_of_the_bat',
    name: 'Cloak of the Bat',
    category: 'Wondrous Item',
    rarity: 'Rare',
    price: '4000 po',
    attunement: true,
    description: 'Advantage on Stealth, spider climbing, and in darkness flight and a bat form.'
  },
  {
    item_type: 'item_magico',
    id: 'robe_of_eyes',
    name: 'Robe of Eyes',
    category: 'Wondrous Item',
    rarity: 'Rare',
    price: '4000 po',
    attunement: true,
    description: 'All-around sight, Darkvision, and see Invisible — but Daylight blinds you.'
  },
  {
    item_type: 'item_magico',
    id: 'cloak_of_elvenkind',
    name: 'Cloak of Elvenkind',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '400 po',
    attunement: true,
    description: 'Advantage on Stealth, and Disadvantage on Perception checks to see you.'
  },
  {
    item_type: 'item_magico',
    id: 'manual_of_quickness_of_action',
    name: 'Manual of Quickness of Action',
    category: 'Wondrous Item',
    rarity: 'Very Rare',
    price: '20000 po',
    description: 'Forty-eight hours of study raise Dexterity by 2, along with its maximum.'
  },
  {
    item_type: 'item_magico',
    id: 'manual_of_bodily_health',
    name: 'Manual of Bodily Health',
    category: 'Wondrous Item',
    rarity: 'Very Rare',
    price: '20000 po',
    description: 'Forty-eight hours of study raise Constitution by 2, along with its maximum.'
  },
  {
    item_type: 'item_magico',
    id: 'manual_of_golems',
    name: 'Manual of Golems',
    category: 'Wondrous Item',
    rarity: 'Very Rare',
    price: '20000 po',
    description: 'Contains the ritual to create a golem of one specific type.'
  },
  {
    item_type: 'item_magico',
    id: 'manual_of_gainful_exercise',
    name: 'Manual of Gainful Exercise',
    category: 'Wondrous Item',
    rarity: 'Very Rare',
    price: '20000 po',
    description: 'Forty-eight hours of study raise Strength by 2, along with its maximum.'
  },
  {
    item_type: 'item_magico',
    id: 'medallion_of_thoughts',
    name: 'Medallion of Thoughts',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '400 po',
    attunement: true,
    uses: { max: 3, recharge: 'dawn' },
    description: 'Casts Detect Thoughts (DC 13). Three charges per day.'
  },
  {
    item_type: 'item_magico',
    id: 'prosthetic_limb',
    name: 'Prosthetic Limb',
    category: 'Wondrous Item',
    rarity: 'Common',
    price: '100 po',
    description: 'Replaces a lost limb, functions as the original, and cannot be removed by others.'
  },
  {
    item_type: 'item_magico',
    id: 'heward_s_handy_haversack',
    name: "Heward's Handy Haversack",
    category: 'Wondrous Item',
    rarity: 'Rare',
    price: '4000 po',
    description: 'Three extradimensional compartments; whatever you want rises to the top.'
  },
  {
    item_type: 'item_magico',
    id: 'rival_coin',
    name: 'Rival Coin',
    category: 'Wondrous Item',
    rarity: 'Common',
    price: '100 po',
    description: 'An enchanted coin that always lands opposite the side you called.'
  },
  {
    item_type: 'item_magico',
    id: 'ersatz_eye',
    name: 'Ersatz Eye',
    category: 'Wondrous Item',
    rarity: 'Common',
    price: '100 po',
    description: 'Replaces a lost eye, sees normally, and cannot be removed by anyone else.'
  },
  {
    item_type: 'item_magico',
    id: 'hag_eye',
    name: 'Hag Eye',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '400 po',
    description: 'A hag coven’s eye: they see everything it sees.'
  },
  {
    item_type: 'item_magico',
    id: 'eyes_of_minute_seeing',
    name: 'Eyes of Minute Seeing',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '400 po',
    description: 'You see fine detail at 1 foot as if it were 6 inches away.'
  },
  {
    item_type: 'item_magico',
    id: 'eyes_of_the_eagle',
    name: 'Eyes of the Eagle',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '400 po',
    description: 'Advantage on sight-based Perception checks and sharp vision at long range.'
  },
  {
    item_type: 'item_magico',
    id: 'eyes_of_charming',
    name: 'Eyes of Charming',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '400 po',
    attunement: true,
    uses: { max: 3, recharge: 'dawn' },
    description: 'Lenses that cast Charm Person (DC 13) three times per day.'
  },
  {
    item_type: 'item_magico',
    id: 'orb_of_direction',
    name: 'Orb of Direction',
    category: 'Wondrous Item',
    rarity: 'Common',
    price: '100 po',
    description: 'Points to true north; useless in the Underdark and off the Material Plane.'
  },
  {
    item_type: 'item_magico',
    id: 'orb_of_dragonkind',
    name: 'Orb of Dragonkind',
    category: 'Wondrous Item',
    rarity: 'Artifact',
    price: '—',
    attunement: true,
    description: 'An artifact that dominates dragons and grants potent spells — at a dark price.'
  },
  {
    item_type: 'item_magico',
    id: 'orb_of_time',
    name: 'Orb of Time',
    category: 'Wondrous Item',
    rarity: 'Common',
    price: '100 po',
    description: 'Tells you the time of day and how long the current season has run.'
  },
  {
    item_type: 'item_magico',
    id: 'ioun_stone',
    name: 'Ioun Stone',
    category: 'Wondrous Item',
    rarity: 'Varies',
    price: '—',
    attunement: true,
    description: 'Orbits your head granting a benefit by type. Rarity varies.'
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
    id: 'stone_of_controlling_earth_elementals',
    name: 'Stone of Controlling Earth Elementals',
    category: 'Wondrous Item',
    rarity: 'Rare',
    price: '4000 po',
    description: 'On earth or stone, it summons an earth elemental that obeys for 1 hour.'
  },
  {
    item_type: 'item_magico',
    id: 'sending_stones',
    name: 'Sending Stones',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '400 po',
    uses: { max: 1, recharge: 'dawn' },
    description: 'A pair of stones that cast Sending to each other, once per day.'
  },
  {
    item_type: 'item_magico',
    id: 'perfume_of_bewitching',
    name: 'Perfume of Bewitching',
    category: 'Wondrous Item',
    rarity: 'Common',
    price: '50 po',
    description: 'For 1 hour, Advantage on Charisma checks against humanoids.'
  },
  {
    item_type: 'item_magico',
    id: 'periapt_of_health',
    name: 'Periapt of Health',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '400 po',
    attunement: true,
    description: 'You are immune to contracting disease.'
  },
  {
    item_type: 'item_magico',
    id: 'periapt_of_wound_closure',
    name: 'Periapt of Wound Closure',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '400 po',
    attunement: true,
    description: 'You stabilize automatically, and Hit Dice restore double the hit points.'
  },
  {
    item_type: 'item_magico',
    id: 'periapt_of_proof_against_poison',
    name: 'Periapt of Proof against Poison',
    category: 'Wondrous Item',
    rarity: 'Rare',
    price: '4000 po',
    attunement: true,
    description: 'Neutralizes poison and grants immunity to Poison damage and the Poisoned condition.'
  },
  {
    item_type: 'item_magico',
    id: 'nolzur_s_marvelous_pigments',
    name: "Nolzur's Marvelous Pigments",
    category: 'Wondrous Item',
    rarity: 'Very Rare',
    price: '20000 po',
    description: 'What you paint becomes real: doors, pits, treasure — but nothing living.'
  },
  {
    item_type: 'item_magico',
    id: 'cubic_gate',
    name: 'Cubic Gate',
    category: 'Wondrous Item',
    rarity: 'Legendary',
    price: '200000 po',
    uses: { max: 3, recharge: 'dawn' },
    description: 'Six faces, six planes: opens gates or casts Plane Shift. Three charges per day.'
  },
  {
    item_type: 'item_magico',
    id: 'well_of_many_worlds',
    name: 'Well of Many Worlds',
    category: 'Wondrous Item',
    rarity: 'Legendary',
    price: '200000 po',
    description: 'A cloth that opens a two-way portal to a random plane.'
  },
  {
    item_type: 'item_magico',
    id: 'pearl_of_power',
    name: 'Pearl of Power',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '400 po',
    attunement: true,
    uses: { max: 1, recharge: 'dawn' },
    description: 'Once per day, recovers one expended spell slot of level 3 or lower.'
  },
  {
    item_type: 'item_magico',
    id: 'dust_of_dryness',
    name: 'Dust of Dryness',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '200 po',
    description: 'Each pinch absorbs a 15-foot cube of water into a pellet you can break later.'
  },
  {
    item_type: 'item_magico',
    id: 'dust_of_disappearance',
    name: 'Dust of Disappearance',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '200 po',
    description: 'Turns everyone within 10 feet Invisible for 2d4 minutes.'
  },
  {
    item_type: 'item_magico',
    id: 'dust_of_sneezing_and_choking',
    name: 'Dust of Sneezing and Choking',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '200 po',
    description: 'A trap: DC 15 Constitution or be Incapacitated and suffocating within 30 feet.'
  },
  {
    item_type: 'item_magico',
    id: 'clothes_of_mending',
    name: 'Clothes of Mending',
    category: 'Wondrous Item',
    rarity: 'Common',
    price: '100 po',
    description: 'They repair and clean themselves, staying pristine.'
  },
  {
    item_type: 'item_magico',
    id: 'ruby_of_the_war_mage',
    name: 'Ruby of the War Mage',
    category: 'Wondrous Item',
    rarity: 'Common',
    price: '100 po',
    attunement: true,
    description: 'Affixed to a weapon, it turns the weapon into a spellcasting focus.'
  },
  {
    item_type: 'item_magico',
    id: 'bag_of_devouring',
    name: 'Bag of Devouring',
    category: 'Wondrous Item',
    rarity: 'Very Rare',
    price: '40000 po',
    description: 'The maw of an extraplanar creature disguised as a bag: it swallows and destroys what goes in.'
  },
  {
    item_type: 'item_magico',
    id: 'bag_of_beans',
    name: 'Bag of Beans',
    category: 'Wondrous Item',
    rarity: 'Rare',
    price: '2000 po',
    description: 'Planted beans produce random magical effects, from fruit trees to hostile creatures.'
  },
  {
    item_type: 'item_magico',
    id: 'bag_of_tricks',
    name: 'Bag of Tricks',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '400 po',
    description: 'Fuzzy balls become animals that obey you for up to 1 hour. Three uses per day.'
  },
  {
    item_type: 'item_magico',
    id: 'slippers_of_spider_climbing',
    name: 'Slippers of Spider Climbing',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '400 po',
    attunement: true,
    description: 'You climb walls and ceilings with hands free, though not slick surfaces.'
  },
  {
    item_type: 'item_magico',
    id: 'saddle_of_the_cavalier',
    name: 'Saddle of the Cavalier',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '400 po',
    description: 'Advantage against being dismounted, and you never fall off unwillingly.'
  },
  {
    item_type: 'item_magico',
    id: 'chime_of_opening',
    name: 'Chime of Opening',
    category: 'Wondrous Item',
    rarity: 'Rare',
    price: '2000 po',
    description: 'Opens one lock, latch, or bar within 120 feet. Ten uses.'
  },
  {
    item_type: 'item_magico',
    id: 'universal_solvent',
    name: 'Universal Solvent',
    category: 'Wondrous Item',
    rarity: 'Legendary',
    price: '100000 po',
    description: 'Dissolves any adhesive it touches, including Sovereign Glue.'
  },
  {
    item_type: 'item_magico',
    id: 'talisman_of_the_sphere',
    name: 'Talisman of the Sphere',
    category: 'Wondrous Item',
    rarity: 'Legendary',
    price: '200000 po',
    attunement: true,
    description: 'Doubles your chance of controlling a Sphere of Annihilation.'
  },
  {
    item_type: 'item_magico',
    id: 'talisman_of_pure_good',
    name: 'Talisman of Pure Good',
    category: 'Wondrous Item',
    rarity: 'Legendary',
    price: '200000 po',
    attunement: true,
    description: '+2 to your spell save DC, and it can annihilate evil creatures in a chasm of light.'
  },
  {
    item_type: 'item_magico',
    id: 'talisman_of_ultimate_evil',
    name: 'Talisman of Ultimate Evil',
    category: 'Wondrous Item',
    rarity: 'Legendary',
    price: '200000 po',
    attunement: true,
    description: '+2 to your spell save DC, and it can annihilate good creatures in a fiery rift.'
  },
  {
    item_type: 'item_magico',
    id: 'carpet_of_flying',
    name: 'Carpet of Flying',
    category: 'Wondrous Item',
    rarity: 'Very Rare',
    price: '40000 po',
    description: 'Flies and hovers carrying double its capacity; speed and load vary by its size.'
  },
  {
    item_type: 'item_magico',
    id: 'circlet_of_blasting',
    name: 'Circlet of Blasting',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '400 po',
    uses: { max: 1, recharge: 'dawn' },
    description: 'Casts Scorching Ray (+5 to hit, 2d6 Radiant) once per day.'
  },
  {
    item_type: 'item_magico',
    id: 'bowl_of_commanding_water_elementals',
    name: 'Bowl of Commanding Water Elementals',
    category: 'Wondrous Item',
    rarity: 'Rare',
    price: '4000 po',
    description: 'Filled with water, it summons a water elemental that obeys you for 1 hour.'
  },
  {
    item_type: 'item_magico',
    id: 'tome_of_leadership_and_influence',
    name: 'Tome of Leadership and Influence',
    category: 'Wondrous Item',
    rarity: 'Very Rare',
    price: '20000 po',
    description: 'Forty-eight hours of study raise Charisma by 2, along with its maximum.'
  },
  {
    item_type: 'item_magico',
    id: 'tome_of_the_stilled_tongue',
    name: 'Tome of the Stilled Tongue',
    category: 'Wondrous Item',
    rarity: 'Legendary',
    price: '200000 po',
    attunement: true,
    description: 'Vecna’s spellbook with a withered tongue in its spine: it stores and devours spells.'
  },
  {
    item_type: 'item_magico',
    id: 'tome_of_understanding',
    name: 'Tome of Understanding',
    category: 'Wondrous Item',
    rarity: 'Very Rare',
    price: '20000 po',
    description: 'Forty-eight hours of study raise Wisdom by 2, along with its maximum.'
  },
  {
    item_type: 'item_magico',
    id: 'tome_of_clear_thought',
    name: 'Tome of Clear Thought',
    category: 'Wondrous Item',
    rarity: 'Very Rare',
    price: '20000 po',
    description: 'Forty-eight hours of study raise Intelligence by 2, along with its maximum.'
  },
  {
    item_type: 'item_magico',
    id: 'horn_of_blasting',
    name: 'Horn of Blasting',
    category: 'Wondrous Item',
    rarity: 'Rare',
    price: '4000 po',
    description: 'A 30-foot cone: 5d6 Thunder damage and Deafened for 1 minute (DC 15).'
  },
  {
    item_type: 'item_magico',
    id: 'horn_of_silent_alarm',
    name: 'Horn of Silent Alarm',
    category: 'Wondrous Item',
    rarity: 'Common',
    price: '100 po',
    uses: { max: 4, recharge: 'dawn' },
    description: 'Only creatures you choose, up to 600 feet away, hear it. Four charges per day.'
  },
  {
    item_type: 'item_magico',
    id: 'horn_of_valhalla',
    name: 'Horn of Valhalla',
    category: 'Wondrous Item',
    rarity: 'Varies',
    price: '—',
    description: 'Summons spectral warriors to fight for you. Power and rarity vary by its metal.'
  },
  {
    item_type: 'item_magico',
    id: 'censer_of_controlling_air_elementals',
    name: 'Censer of Controlling Air Elementals',
    category: 'Wondrous Item',
    rarity: 'Rare',
    price: '4000 po',
    description: 'With incense lit, it summons an air elemental that obeys you for 1 hour.'
  },
  {
    item_type: 'item_magico',
    id: 'spirit_board',
    name: 'Spirit Board',
    category: 'Wondrous Item',
    rarity: 'Very Rare',
    price: '40000 po',
    description: 'Lets you question the spirits of the dead, with short and ambiguous answers.'
  },
  {
    item_type: 'item_magico',
    id: 'keoghtom_s_ointment',
    name: "Keoghtom's Ointment",
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '200 po',
    description: 'Each dose heals 2d8+2 HP and ends poison and disease. Up to five doses.'
  },
  {
    item_type: 'item_magico',
    id: 'pole_of_collapsing',
    name: 'Pole of Collapsing',
    category: 'Wondrous Item',
    rarity: 'Common',
    price: '100 po',
    description: 'Shrinks from 10 feet to 1 foot and back with an action.'
  },
  {
    item_type: 'item_magico',
    id: 'pole_of_angling',
    name: 'Pole of Angling',
    category: 'Wondrous Item',
    rarity: 'Common',
    price: '100 po',
    description: 'The 10-foot pole becomes a full fishing rod with line, hook, and reel.'
  },
  {
    item_type: 'item_magico',
    id: 'pot_of_awakening',
    name: 'Pot of Awakening',
    category: 'Wondrous Item',
    rarity: 'Common',
    price: '100 po',
    description: 'After 30 days, the plant grown in it awakens as an awakened shrub.'
  },
  {
    item_type: 'item_magico',
    id: 'baba_yaga_s_dancing_broom',
    name: "Baba Yaga's Dancing Broom",
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '400 po',
    attunement: true,
    description: 'A broom that animates to sweep on its own and can fight as a temporary servant.'
  },
  {
    item_type: 'item_magico',
    id: 'broom_of_flying',
    name: 'Broom of Flying',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '400 po',
    attunement: true,
    description: 'Flies at 50 feet carrying up to 200 lb., and comes to you when called within 30 feet.'
  },
  {
    item_type: 'item_magico',
    id: 'candle_of_the_deep',
    name: 'Candle of the Deep',
    category: 'Wondrous Item',
    rarity: 'Common',
    price: '100 po',
    description: 'Its flame is not extinguished by wind and burns even underwater.'
  },
  {
    item_type: 'item_magico',
    id: 'candle_of_invocation',
    name: 'Candle of Invocation',
    category: 'Wondrous Item',
    rarity: 'Very Rare',
    price: '20000 po',
    attunement: true,
    description: 'When lit, it grants Advantage on attack rolls and saving throws to those of its alignment.'
  },
  {
    item_type: 'item_magico',
    id: 'goggles_of_night',
    name: 'Goggles of Night',
    category: 'Wondrous Item',
    rarity: 'Uncommon',
    price: '400 po',
    description: 'Grant Darkvision out to 60 feet, or +60 feet if you already have it.'
  }
]
