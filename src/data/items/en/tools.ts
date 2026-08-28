import type { Tool } from '../types'

export const TOOLS: Tool[] = [
  // ─── ARTISAN'S TOOLS ──────────────────────────────────────────────────────
  {
    item_type: 'ferramenta',
    id: 'ferramentas_de_alquimista',
    name: "Alchemist's Supplies",
    category: "Artisan's Tools",
    price: '50 po',
    weight: '4.0 kg',
    description: 'Glass beakers, a mortar and pestle, and chemical reagents. Used to create potions, alchemist\'s fire, and antitoxins.'
  },
  {
    item_type: 'ferramenta',
    id: 'ferramentas_de_ferreiro',
    name: "Smith's Tools",
    category: "Artisan's Tools",
    price: '20 po',
    weight: '4.0 kg',
    description: 'Hammers, tongs, a portable anvil, charcoal, and files. Essential for repairing armor, sharpening swords, and forging metal.'
  },
  {
    item_type: 'ferramenta',
    id: 'ferramentas_de_carpinteiro',
    name: "Carpenter's Tools",
    category: "Artisan's Tools",
    price: '8 po',
    weight: '3.0 kg',
    description: 'A saw, chisels, a hammer, nails, an adze, and a plane. Useful for reinforcing doors, building barricades, and repairing vehicles.'
  },
  {
    item_type: 'ferramenta',
    id: 'ferramentas_de_cartografo',
    name: "Cartographer's Tools",
    category: "Artisan's Tools",
    price: '15 po',
    weight: '3.0 kg',
    description: 'Ink, quills, parchment, compasses, rulers, and a storage tube. Allows precise mapping of dungeons and wilderness territories.'
  },
  {
    item_type: 'ferramenta',
    id: 'ferramentas_de_coureiro',
    name: "Leatherworker's Tools",
    category: "Artisan's Tools",
    price: '5 po',
    weight: '2.5 kg',
    description: 'Leather scrapers, heavy needles, reinforced thread, and awls. For stitching and repairing leather armor and equipment.'
  },
  {
    item_type: 'ferramenta',
    id: 'utensilios_de_cozinha',
    name: "Cook's Utensils",
    category: "Artisan's Tools",
    price: '1 po',
    weight: '4.0 kg',
    description: 'An iron pot, cutting knives, wooden spoons, spices, and a sieve. Allows preparation of nutritious meals during long rests.'
  },
  {
    item_type: 'ferramenta',
    id: 'ferramentas_de_caligrafo',
    name: "Calligrapher's Supplies",
    category: "Artisan's Tools",
    price: '10 po',
    weight: '2.5 kg',
    description: 'Fine quills, colored inks, parchment, and rulers. Used to copy documents, create spell scrolls, and forge writings with artistic precision.'
  },
  {
    item_type: 'ferramenta',
    id: 'ferramentas_de_cervejeiro',
    name: "Brewer's Supplies",
    category: "Artisan's Tools",
    price: '20 po',
    weight: '4.5 kg',
    description: 'A small barrel, a funnel, a rudimentary thermometer, and base ingredients. Allows fermenting ales, meads, and spirits during extended rests.'
  },
  {
    item_type: 'ferramenta',
    id: 'ferramentas_de_joalheiro',
    name: "Jeweler's Tools",
    category: "Artisan's Tools",
    price: '25 po',
    weight: '2.0 kg',
    description: 'A magnifying glass, precision tweezers, fine files, and wax molds. For evaluating, cutting, and setting precious gems into jewelry and amulets.'
  },
  {
    item_type: 'ferramenta',
    id: 'ferramentas_de_oleiro',
    name: "Potter's Tools",
    category: "Artisan's Tools",
    price: '10 po',
    weight: '2.5 kg',
    description: 'A portable hand wheel, shaping tools, and pigments. Used to create ceramic containers, vases, and functional urns.'
  },
  {
    item_type: 'ferramenta',
    id: 'ferramentas_de_pedreiro',
    name: "Mason's Tools",
    category: "Artisan's Tools",
    price: '10 po',
    weight: '4.0 kg',
    description: 'A chisel, a mallet, a level, and a trowel. Allows identifying weaknesses in stone structures, building walls, and working with masonry.'
  },
  {
    item_type: 'ferramenta',
    id: 'ferramentas_de_pintor',
    name: "Painter's Supplies",
    category: "Artisan's Tools",
    price: '10 po',
    weight: '2.5 kg',
    description: 'Brushes of various sizes, pigments, and fixing oils. For creating paintings, disguising objects, and reproducing images faithfully.'
  },
  {
    item_type: 'ferramenta',
    id: 'ferramentas_de_sapateiro',
    name: "Cobbler's Tools",
    category: "Artisan's Tools",
    price: '5 po',
    weight: '2.5 kg',
    description: 'A wooden last, needles, leather thread, and metal tacks. Allows crafting and repairing boots, sandals, and other footwear.'
  },
  {
    item_type: 'ferramenta',
    id: 'ferramentas_de_tecedor',
    name: "Weaver's Tools",
    category: "Artisan's Tools",
    price: '1 po',
    weight: '2.5 kg',
    description: 'A portable loom, knitting needles, and yarn spools. Allows producing simple clothing, nets, and functional fabrics during travel.'
  },
  {
    item_type: 'ferramenta',
    id: 'ferramentas_de_vidraceiro',
    name: "Glassblower's Tools",
    category: "Artisan's Tools",
    price: '30 po',
    weight: '2.5 kg',
    description: 'Glass cutters, molds, and heat-resistant tongs. For working with blown glass, identifying magical crystals, and creating special containers.'
  },
  {
    item_type: 'ferramenta',
    id: 'ferramentas_de_escultor',
    name: "Woodcarver's Tools",
    category: "Artisan's Tools",
    price: '1 po',
    weight: '2.5 kg',
    description: 'Precision chisels, sandpaper, and finishing wax. Allows carving wood into functional items, decorative pieces, and weapon handles.'
  },

  // ─── UTILITY ──────────────────────────────────────────────────────────────
  {
    item_type: 'ferramenta',
    id: 'ferramentas_de_ladrao',
    name: "Thieves' Tools",
    category: 'Utility',
    price: '25 po',
    weight: '0.5 kg',
    description: 'A file, a set of lockpicks, mirror on a handle, tweezers, and narrow scissors. Used to pick locks and disarm traps.'
  },
  {
    item_type: 'ferramenta',
    id: 'kit_de_disfarce',
    name: 'Disguise Kit',
    category: 'Utility',
    price: '25 po',
    sale_price: '12.5 po',
    weight: '1.5 kg',
    description: 'Cosmetics, hair dyes, wax prosthetics, and various clothing pieces. Allows completely altering physical appearance.'
  },
  {
    item_type: 'ferramenta',
    id: 'kit_de_falsificacao',
    name: 'Forgery Kit',
    category: 'Utility',
    price: '15 po',
    weight: '2.5 kg',
    description: 'Papers, rare inks, wax seals, and blank signet rings. For forging documents, official letters, and seals of authority.'
  },
  {
    item_type: 'ferramenta',
    id: 'kit_de_herbalismo',
    name: 'Herbalism Kit',
    category: 'Utility',
    price: '5 po',
    weight: '1.5 kg',
    description: 'Pouches for herbs, harvesting scissors, gloves, and empty vials. Required to craft healing potions and natural antidotes.'
  },
  {
    item_type: 'ferramenta',
    id: 'kit_de_envenenador',
    name: "Poisoner's Kit",
    category: 'Utility',
    price: '50 po',
    weight: '1.0 kg',
    description: 'Sealed vials, pipettes, thick leather gloves, and chemical reagents. Allows collecting, refining, and applying poisons to weapons without risk of self-poisoning.'
  },
  {
    item_type: 'ferramenta',
    id: 'ferramentas_de_navegador',
    name: "Navigator's Tools",
    category: 'Utility',
    price: '25 po',
    weight: '2.0 kg',
    description: 'A sextant, a compass, star charts, and nautical maps. Allows navigating oceans and unknown terrain without losing direction.'
  },

  // ─── GAMING SETS ──────────────────────────────────────────────────────────
  {
    item_type: 'ferramenta',
    id: 'jogo_de_dados',
    name: 'Dice Set',
    category: 'Gaming Sets',
    price: '1 pp',
    weight: '0.0 kg',
    description: 'Bone or wooden dice. May include loaded dice for cheating at tavern gambling (requires Sleight of Hand checks).'
  },
  {
    item_type: 'ferramenta',
    id: 'jogo_de_cartas',
    name: 'Playing Card Set',
    category: 'Gaming Sets',
    price: '5 pp',
    weight: '0.0 kg',
    description: 'A full deck with rustic illustrations. Used to pass time during long watches or for gambling at inns.'
  },
  {
    item_type: 'ferramenta',
    id: 'xadrez_do_dragao',
    name: 'Dragonchess Set',
    category: 'Gaming Sets',
    price: '1 po',
    weight: '0.5 kg',
    description: 'A strategy game with carved pieces representing fantastic creatures. Popular among nobles, tacticians, and intellectual adventurers.'
  },

  // ─── MUSICAL INSTRUMENTS ──────────────────────────────────────────────────
  {
    item_type: 'ferramenta',
    id: 'alaude',
    name: 'Lute',
    category: 'Musical Instrument',
    price: '35 po',
    weight: '1.0 kg',
    description: 'A plucked string instrument with a pear-shaped resonating body. The bard\'s favorite for accompanying epic ballads.'
  },
  {
    item_type: 'ferramenta',
    id: 'flauta',
    name: 'Flute',
    category: 'Musical Instrument',
    price: '2 po',
    weight: '0.5 kg',
    description: 'A simple wind instrument of wood or bamboo. Produces soft, melancholic melodies, ideal for beginner musicians.'
  },
  {
    item_type: 'ferramenta',
    id: 'tambor',
    name: 'Drum',
    category: 'Musical Instrument',
    price: '6 po',
    weight: '1.5 kg',
    description: 'A percussion instrument of wood and stretched leather. Perfect for setting the rhythm of military marches or tribal rituals.'
  },
  {
    item_type: 'ferramenta',
    id: 'lira',
    name: 'Lyre',
    category: 'Musical Instrument',
    price: '30 po',
    weight: '1.0 kg',
    description: 'A small portable harp-like instrument with a celestial sound. Closely associated with aristocratic, divine settings, and court musicians.'
  },
  {
    item_type: 'ferramenta',
    id: 'gaita_de_foles',
    name: 'Bagpipes',
    category: 'Musical Instrument',
    price: '30 po',
    weight: '3.5 kg',
    description: 'A wind instrument with a leather bellows and wooden pipes. Unmistakable and penetrating sound, associated with mountain and warrior cultures.'
  },
  {
    item_type: 'ferramenta',
    id: 'harpa',
    name: 'Harp',
    category: 'Musical Instrument',
    price: '25 po',
    weight: '2.5 kg',
    description: 'A string instrument with an arched frame and ethereal sound. Associated with fey, elves, and musicians of exceptional skill.'
  },
  {
    item_type: 'ferramenta',
    id: 'trompete',
    name: 'Horn',
    category: 'Musical Instrument',
    price: '3 po',
    weight: '1.0 kg',
    description: 'A metal wind instrument with a powerful, penetrating sound. Used in military signals, fanfares, and announcements of high authority.'
  },
  {
    item_type: 'ferramenta',
    id: 'flauta_de_pa',
    name: 'Pan Flute',
    category: 'Musical Instrument',
    price: '12 po',
    weight: '1.0 kg',
    description: 'A set of bamboo tubes of varying sizes. A rustic wind instrument with a pastoral sound, favored by druids and nature musicians.'
  },
  {
    item_type: 'ferramenta',
    id: 'viola',
    name: 'Viol',
    category: 'Musical Instrument',
    price: '30 po',
    weight: '1.5 kg',
    description: 'A bowed string instrument with a rich, resonant sound. Preferred by classical bards for formal performances and noble banquets.'
  }
]
