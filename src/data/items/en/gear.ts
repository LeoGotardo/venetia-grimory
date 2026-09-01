import type { AdventuringGear } from '../types'

export const ADVENTURING_GEAR: AdventuringGear[] = [
  {
    item_type: 'equipamento',
    id: 'acido',
    name: 'Acid',
    category: 'Gear',
    price: '25 po',
    weight: '0.5 kg',
    description: 'A flask you can throw up to 20 feet; on a hit it deals 2d6 Acid damage.'
  },
  {
    item_type: 'equipamento',
    id: 'fogo_alquimico',
    name: "Alchemist's Fire",
    category: 'Gear',
    price: '50 po',
    weight: '0.5 kg',
    description: 'A sticky fluid that ignites on contact with air. 1d4 Fire damage per turn until doused with an action.'
  },
  {
    item_type: 'equipamento',
    id: 'antitoxina',
    name: 'Antitoxin',
    category: 'Gear',
    price: '50 po',
    weight: '0.0 kg',
    description: 'Drinking it grants Advantage on saving throws against poison for 1 hour.'
  },
  {
    item_type: 'equipamento',
    id: 'flechas',
    name: 'Arrows (20)',
    category: 'Ammunition',
    price: '1 po',
    weight: '0.5 kg',
    description: 'Ammunition for bows. Half the arrows fired can be recovered after a fight.'
  },
  {
    item_type: 'equipamento',
    id: 'virotes',
    name: 'Bolts (20)',
    category: 'Ammunition',
    price: '1 po',
    weight: '0.75 kg',
    description: 'Ammunition for crossbows, shorter and heavier than an arrow.'
  },
  {
    item_type: 'equipamento',
    id: 'balas_arma_fogo',
    name: 'Firearm Bullets (10)',
    category: 'Ammunition',
    price: '3 po',
    weight: '1.0 kg',
    description: 'Ammunition for muskets and pistols, spent along with the powder.'
  },
  {
    item_type: 'equipamento',
    id: 'balas_funda',
    name: 'Sling Bullets (20)',
    category: 'Ammunition',
    price: '4 pc',
    weight: '0.75 kg',
    description: 'Cast lead shot, more accurate than loose stones.'
  },
  {
    item_type: 'equipamento',
    id: 'agulhas',
    name: 'Needles (50)',
    category: 'Ammunition',
    price: '1 po',
    weight: '0.5 kg',
    description: 'Ammunition for a blowgun, commonly coated with poison.'
  },
  {
    item_type: 'equipamento',
    id: 'cristal',
    name: 'Crystal',
    category: 'Arcane Focus',
    price: '10 po',
    weight: '0.5 kg',
    description: 'An Arcane Focus: replaces material components that have no gold cost.'
  },
  {
    item_type: 'equipamento',
    id: 'orbe',
    name: 'Orb',
    category: 'Arcane Focus',
    price: '20 po',
    weight: '1.5 kg',
    description: 'A polished sphere of glass or crystal used as an Arcane Focus.'
  },
  {
    item_type: 'equipamento',
    id: 'bastao_foco',
    name: 'Rod',
    category: 'Arcane Focus',
    price: '10 po',
    weight: '1.0 kg',
    description: 'A short rune-carved scepter used as an Arcane Focus.'
  },
  {
    item_type: 'equipamento',
    id: 'cajado_foco',
    name: 'Staff',
    category: 'Arcane Focus',
    price: '5 po',
    weight: '2.0 kg',
    description: 'A ritual staff. It also works as a quarterstaff in a fight.'
  },
  {
    item_type: 'equipamento',
    id: 'varinha',
    name: 'Wand',
    category: 'Arcane Focus',
    price: '10 po',
    weight: '0.5 kg',
    description: 'A slender rod of wood or bone, the most discreet Arcane Focus.'
  },
  {
    item_type: 'equipamento',
    id: 'mochila',
    name: 'Backpack',
    category: 'Container',
    price: '2 po',
    weight: '2.5 kg',
    description: 'Holds 30 lb. of gear. Additional items can be lashed to the outside.'
  },
  {
    item_type: 'equipamento',
    id: 'rolamentos',
    name: 'Ball Bearings',
    category: 'Gear',
    price: '1 po',
    weight: '1.0 kg',
    description: 'Spread over a 10-foot square as an action: DC 10 Acrobatics or the creature falls Prone.'
  },
  {
    item_type: 'equipamento',
    id: 'barril',
    name: 'Barrel',
    category: 'Container',
    price: '2 po',
    weight: '35.0 kg',
    description: 'Holds 40 gallons of liquid or 4 cubic feet of solids.'
  },
  {
    item_type: 'equipamento',
    id: 'cesto',
    name: 'Basket',
    category: 'Container',
    price: '4 pp',
    weight: '1.0 kg',
    description: 'Holds 40 lb. of light, bulky cargo.'
  },
  {
    item_type: 'equipamento',
    id: 'saco_de_dormir',
    name: 'Bedroll',
    category: 'Gear',
    price: '1 po',
    weight: '3.5 kg',
    description: 'A rolled padded blanket, needed to sleep comfortably outdoors.'
  },
  {
    item_type: 'equipamento',
    id: 'sino',
    name: 'Bell',
    category: 'Gear',
    price: '1 po',
    weight: '0.0 kg',
    description: 'Audible up to 60 feet away. Used as an improvised camp alarm.'
  },
  {
    item_type: 'equipamento',
    id: 'cobertor',
    name: 'Blanket',
    category: 'Gear',
    price: '5 pp',
    weight: '1.5 kg',
    description: 'Thick wool that wards off the cold during a Long Rest.'
  },
  {
    item_type: 'equipamento',
    id: 'talha',
    name: 'Block and Tackle',
    category: 'Gear',
    price: '1 po',
    weight: '2.5 kg',
    description: 'A pulley system that lets you hoist four times the weight you could lift.'
  },
  {
    item_type: 'equipamento',
    id: 'livro',
    name: 'Book',
    category: 'Gear',
    price: '25 po',
    weight: '2.5 kg',
    description: 'A handwritten volume on one topic. Can grant Advantage on lore checks.'
  },
  {
    item_type: 'equipamento',
    id: 'garrafa_vidro',
    name: 'Glass Bottle',
    category: 'Container',
    price: '2 po',
    weight: '1.0 kg',
    description: 'Holds 1.5 pints of liquid. Fragile, but transparent.'
  },
  {
    item_type: 'equipamento',
    id: 'balde',
    name: 'Bucket',
    category: 'Container',
    price: '5 pc',
    weight: '1.0 kg',
    description: 'Holds 3 quarts. Essential for dousing fires and hauling water.'
  },
  {
    item_type: 'equipamento',
    id: 'estrepes',
    name: 'Caltrops',
    category: 'Gear',
    price: '1 po',
    weight: '1.0 kg',
    description: 'Spread over a 5-foot square as an action: DC 15 Dexterity or take 1 Piercing damage and lose speed.'
  },
  {
    item_type: 'equipamento',
    id: 'vela',
    name: 'Candle',
    category: 'Gear',
    price: '1 pc',
    weight: '0.0 kg',
    description: 'Burns for 1 hour, shedding Bright Light in a 5-foot radius and Dim Light for 5 more.'
  },
  {
    item_type: 'equipamento',
    id: 'estojo_virotes',
    name: 'Crossbow Bolt Case',
    category: 'Container',
    price: '1 po',
    weight: '0.5 kg',
    description: 'Holds up to 20 crossbow bolts within easy reach.'
  },
  {
    item_type: 'equipamento',
    id: 'estojo_mapas',
    name: 'Map or Scroll Case',
    category: 'Container',
    price: '1 po',
    weight: '0.5 kg',
    description: 'A rigid tube holding up to 10 sheets of paper or 5 sheets of parchment.'
  },
  {
    item_type: 'equipamento',
    id: 'corrente',
    name: 'Chain',
    category: 'Gear',
    price: '5 po',
    weight: '5.0 kg',
    description: '10 feet of iron links. AC 19 and 10 Hit Points to break.'
  },
  {
    item_type: 'equipamento',
    id: 'bau',
    name: 'Chest',
    category: 'Container',
    price: '5 po',
    weight: '12.5 kg',
    description: 'Holds 12 cubic feet of gear. Can be fitted with a lock.'
  },
  {
    item_type: 'equipamento',
    id: 'kit_escalada',
    name: "Climber's Kit",
    category: 'Gear',
    price: '25 po',
    weight: '6.0 kg',
    description: 'Pitons, boots, gloves, and a harness. Anchored, you fall no more than 25 feet.'
  },
  {
    item_type: 'equipamento',
    id: 'roupas_finas',
    name: 'Fine Clothes',
    category: 'Clothing',
    price: '15 po',
    weight: '3.0 kg',
    description: 'Silk and embroidery, required at courts and high-society events.'
  },
  {
    item_type: 'equipamento',
    id: 'roupas_viajante',
    name: "Traveler's Clothes",
    category: 'Clothing',
    price: '2 po',
    weight: '2.0 kg',
    description: 'Sturdy boots, trousers, a shirt, and a cloak for the road.'
  },
  {
    item_type: 'equipamento',
    id: 'bolsa_componentes',
    name: 'Component Pouch',
    category: 'Gear',
    price: '25 po',
    weight: '1.0 kg',
    description: 'Compartments holding material components that have no gold cost.'
  },
  {
    item_type: 'equipamento',
    id: 'fantasia',
    name: 'Costume',
    category: 'Clothing',
    price: '5 po',
    weight: '2.0 kg',
    description: 'A theatrical outfit for disguises and performances.'
  },
  {
    item_type: 'equipamento',
    id: 'pe_de_cabra',
    name: 'Crowbar',
    category: 'Gear',
    price: '2 po',
    weight: '2.5 kg',
    description: 'Grants Advantage on Strength checks where leverage applies.'
  },
  {
    item_type: 'equipamento',
    id: 'ramo_visco',
    name: 'Sprig of Mistletoe',
    category: 'Druidic Focus',
    price: '1 po',
    weight: '0.0 kg',
    description: 'A Druidic Focus: replaces material components that have no gold cost.'
  },
  {
    item_type: 'equipamento',
    id: 'cajado_madeira',
    name: 'Wooden Staff',
    category: 'Druidic Focus',
    price: '5 po',
    weight: '2.0 kg',
    description: 'A carved Druidic Focus. It also works as a quarterstaff.'
  },
  {
    item_type: 'equipamento',
    id: 'varinha_teixo',
    name: 'Yew Wand',
    category: 'Druidic Focus',
    price: '10 po',
    weight: '0.5 kg',
    description: 'A yew rod, the most discreet Druidic Focus.'
  },
  {
    item_type: 'equipamento',
    id: 'frasco',
    name: 'Flask',
    category: 'Container',
    price: '2 pc',
    weight: '0.5 kg',
    description: 'Holds 1 pint of liquid.'
  },
  {
    item_type: 'equipamento',
    id: 'gancho_escalada',
    name: 'Grappling Hook',
    category: 'Gear',
    price: '2 po',
    weight: '2.0 kg',
    description: 'Tied to a rope, it catches on a ledge up to 50 feet away.'
  },
  {
    item_type: 'equipamento',
    id: 'kit_curandeiro',
    name: "Healer's Kit",
    category: 'Gear',
    price: '5 po',
    weight: '1.5 kg',
    description: 'Ten uses. One use stabilizes a creature at 0 HP without a Medicine check.'
  },
  {
    item_type: 'equipamento',
    id: 'amuleto',
    name: 'Amulet',
    category: 'Holy Symbol',
    price: '5 po',
    weight: '0.5 kg',
    description: 'A Holy Symbol worn around the neck or held in hand.'
  },
  {
    item_type: 'equipamento',
    id: 'emblema',
    name: 'Emblem',
    category: 'Holy Symbol',
    price: '5 po',
    weight: '0.0 kg',
    description: 'A Holy Symbol affixed to a shield or armor.'
  },
  {
    item_type: 'equipamento',
    id: 'relicario',
    name: 'Reliquary',
    category: 'Holy Symbol',
    price: '5 po',
    weight: '1.0 kg',
    description: 'A sacred case holding a relic, used as a Holy Symbol.'
  },
  {
    item_type: 'equipamento',
    id: 'agua_benta',
    name: 'Holy Water',
    category: 'Gear',
    price: '25 po',
    weight: '0.5 kg',
    description: 'Thrown up to 20 feet: 2d8 Radiant damage to Fiends and Undead.'
  },
  {
    item_type: 'equipamento',
    id: 'armadilha_caca',
    name: 'Hunting Trap',
    category: 'Gear',
    price: '5 po',
    weight: '12.5 kg',
    description: 'DC 13 Dexterity or take 1d4 Piercing damage and have speed 0 until freed.'
  },
  {
    item_type: 'equipamento',
    id: 'tinta',
    name: 'Ink',
    category: 'Gear',
    price: '10 po',
    weight: '0.0 kg',
    description: 'A 1-ounce bottle of black ink, enough for hundreds of pages.'
  },
  {
    item_type: 'equipamento',
    id: 'pena_escrever',
    name: 'Ink Pen',
    category: 'Gear',
    price: '2 pc',
    weight: '0.0 kg',
    description: 'A trimmed quill for writing. Consumable over time.'
  },
  {
    item_type: 'equipamento',
    id: 'jarro',
    name: 'Jug',
    category: 'Container',
    price: '2 pc',
    weight: '2.0 kg',
    description: 'Holds 1 gallon of liquid.'
  },
  {
    item_type: 'equipamento',
    id: 'escada',
    name: 'Ladder',
    category: 'Gear',
    price: '1 pp',
    weight: '12.5 kg',
    description: 'A 10-foot ladder, too bulky for cramped dungeon corridors.'
  },
  {
    item_type: 'equipamento',
    id: 'lamparina',
    name: 'Lamp',
    category: 'Gear',
    price: '5 pp',
    weight: '0.5 kg',
    description: 'Bright Light in a 15-foot radius, Dim Light for 30 more. Burns one flask of oil for 6 hours.'
  },
  {
    item_type: 'equipamento',
    id: 'lanterna_foco',
    name: 'Bullseye Lantern',
    category: 'Gear',
    price: '10 po',
    weight: '1.0 kg',
    description: 'A 60-foot cone of Bright Light plus 60 feet of Dim Light. Six hours per flask of oil.'
  },
  {
    item_type: 'equipamento',
    id: 'lanterna_coberta',
    name: 'Hooded Lantern',
    category: 'Gear',
    price: '5 po',
    weight: '1.0 kg',
    description: 'Bright Light in a 30-foot radius, Dim Light for 30 more. Hooding it drops output to 5 feet of Dim Light.'
  },
  {
    item_type: 'equipamento',
    id: 'cadeado',
    name: 'Lock',
    category: 'Gear',
    price: '10 po',
    weight: '0.5 kg',
    description: "Opens with its key, or with a DC 15 check using Thieves' Tools."
  },
  {
    item_type: 'equipamento',
    id: 'lupa',
    name: 'Magnifying Glass',
    category: 'Gear',
    price: '100 po',
    weight: '0.0 kg',
    description: 'Advantage on checks to appraise or inspect tiny details.'
  },
  {
    item_type: 'equipamento',
    id: 'algemas',
    name: 'Manacles',
    category: 'Gear',
    price: '2 po',
    weight: '3.0 kg',
    description: 'Bind Small or Medium creatures. DC 20 to escape or break.'
  },
  {
    item_type: 'equipamento',
    id: 'mapa',
    name: 'Map',
    category: 'Gear',
    price: '1 po',
    weight: '0.0 kg',
    description: 'A chart of one region. Advantage on checks to navigate it.'
  },
  {
    item_type: 'equipamento',
    id: 'espelho',
    name: 'Mirror',
    category: 'Gear',
    price: '5 po',
    weight: '0.25 kg',
    description: 'A polished steel hand mirror, useful for peeking around corners safely.'
  },
  {
    item_type: 'equipamento',
    id: 'rede',
    name: 'Net',
    category: 'Gear',
    price: '1 po',
    weight: '1.5 kg',
    description: 'Thrown up to 15 feet as an action: DC 15 Dexterity or be Restrained (no longer a weapon in the 2024 PHB).'
  },
  {
    item_type: 'equipamento',
    id: 'oleo',
    name: 'Oil',
    category: 'Gear',
    price: '1 pp',
    weight: '0.5 kg',
    description: 'A flask of lamp oil. Thrown, it leaves the target vulnerable to fire (5 damage).'
  },
  {
    item_type: 'equipamento',
    id: 'papel',
    name: 'Paper',
    category: 'Gear',
    price: '2 pp',
    weight: '0.0 kg',
    description: 'One sheet of paper, thinner and pricier than parchment.'
  },
  {
    item_type: 'equipamento',
    id: 'pergaminho_branco',
    name: 'Parchment',
    category: 'Gear',
    price: '1 pp',
    weight: '0.0 kg',
    description: 'One sheet of parchment, the base for maps, contracts, and spell scrolls.'
  },
  {
    item_type: 'equipamento',
    id: 'perfume',
    name: 'Perfume',
    category: 'Gear',
    price: '5 po',
    weight: '0.0 kg',
    description: 'A vial of scent. Can grant Advantage on social checks in high society.'
  },
  {
    item_type: 'equipamento',
    id: 'vara',
    name: 'Pole',
    category: 'Gear',
    price: '5 pc',
    weight: '3.5 kg',
    description: 'A 10-foot pole for prodding traps and testing the ground ahead.'
  },
  {
    item_type: 'equipamento',
    id: 'panela_ferro',
    name: 'Iron Pot',
    category: 'Container',
    price: '2 po',
    weight: '5.0 kg',
    description: 'Holds 1 gallon. Used to cook or boil water.'
  },
  {
    item_type: 'equipamento',
    id: 'bolsa',
    name: 'Pouch',
    category: 'Container',
    price: '5 pp',
    weight: '0.5 kg',
    description: 'Holds 6 lb. or up to 20 coins on your belt.'
  },
  {
    item_type: 'equipamento',
    id: 'aljava',
    name: 'Quiver',
    category: 'Container',
    price: '1 po',
    weight: '0.5 kg',
    description: 'Holds up to 20 arrows within easy reach.'
  },
  {
    item_type: 'equipamento',
    id: 'ariete_portatil',
    name: 'Portable Ram',
    category: 'Gear',
    price: '4 po',
    weight: '17.5 kg',
    description: '+4 on Strength checks to break down doors; +2 for a creature helping you.'
  },
  {
    item_type: 'equipamento',
    id: 'racoes',
    name: 'Rations',
    category: 'Gear',
    price: '5 pp',
    weight: '1.0 kg',
    description: 'Dry food for one day of travel.'
  },
  {
    item_type: 'equipamento',
    id: 'manto',
    name: 'Robe',
    category: 'Clothing',
    price: '1 po',
    weight: '2.0 kg',
    description: 'A long ritual or resting garment.'
  },
  {
    item_type: 'equipamento',
    id: 'corda',
    name: 'Rope (50 ft.)',
    category: 'Gear',
    price: '1 po',
    weight: '2.5 kg',
    description: 'Braided hemp. AC 10 and 5 Hit Points to sever.'
  },
  {
    item_type: 'equipamento',
    id: 'saco',
    name: 'Sack',
    category: 'Container',
    price: '1 pc',
    weight: '0.25 kg',
    description: 'Holds 30 lb. of loose cargo.'
  },
  {
    item_type: 'equipamento',
    id: 'pa',
    name: 'Shovel',
    category: 'Gear',
    price: '2 po',
    weight: '2.5 kg',
    description: 'Digs roughly 1 cubic yard of loose earth per hour.'
  },
  {
    item_type: 'equipamento',
    id: 'apito_sinalizacao',
    name: 'Signal Whistle',
    category: 'Gear',
    price: '5 pc',
    weight: '0.0 kg',
    description: 'Carries far, used to alert the party.'
  },
  {
    item_type: 'equipamento',
    id: 'pitons',
    name: 'Iron Spikes (10)',
    category: 'Gear',
    price: '1 po',
    weight: '2.5 kg',
    description: 'Driven in to jam doors, anchor ropes, or mark a path.'
  },
  {
    item_type: 'equipamento',
    id: 'luneta',
    name: 'Spyglass',
    category: 'Gear',
    price: '1000 po',
    weight: '0.5 kg',
    description: 'Magnifies distant objects 2×. Rare and very costly.'
  },
  {
    item_type: 'equipamento',
    id: 'barbante',
    name: 'String (10 ft.)',
    category: 'Gear',
    price: '1 pp',
    weight: '0.0 kg',
    description: 'Thin cord for rigging alarms, tying objects, and marking routes.'
  },
  {
    item_type: 'equipamento',
    id: 'tenda',
    name: 'Tent',
    category: 'Gear',
    price: '2 po',
    weight: '10.0 kg',
    description: 'Portable shelter for two Small or Medium creatures.'
  },
  {
    item_type: 'equipamento',
    id: 'isqueiro',
    name: 'Tinderbox',
    category: 'Gear',
    price: '5 pp',
    weight: '0.5 kg',
    description: 'Flint, steel, and tinder. Lights a torch with an action; any other fire takes 1 minute.'
  },
  {
    item_type: 'equipamento',
    id: 'tocha',
    name: 'Torch',
    category: 'Gear',
    price: '1 pc',
    weight: '0.5 kg',
    description: 'Burns for 1 hour, Bright Light in a 20-foot radius and Dim Light for 20 more. Deals 1 Fire damage as an improvised weapon.'
  },
  {
    item_type: 'equipamento',
    id: 'ampola',
    name: 'Vial',
    category: 'Container',
    price: '1 po',
    weight: '0.0 kg',
    description: 'Holds 4 ounces. The standard container for potions and poisons.'
  },
  {
    item_type: 'equipamento',
    id: 'odre',
    name: 'Waterskin',
    category: 'Container',
    price: '2 pp',
    weight: '2.5 kg',
    description: 'Holds 4 pints of liquid; the listed weight is for a full skin.'
  },
  {
    item_type: 'equipamento',
    id: 'caixa_de_esmolas',
    name: 'Alms Box',
    category: 'Container',
    price: '0 po',
    weight: '0.0 kg',
    description: 'A box for collecting donations. Holds up to 25 GP in coins.'
  },
  {
    item_type: 'equipamento',
    id: 'pedra_de_amolar',
    name: 'Whetstone',
    category: 'Gear',
    price: '1 pc',
    weight: '0.5 kg',
    description: 'A stone for sharpening blades. Honing a Slashing or Piercing weapon takes 1 hour.'
  }
]
