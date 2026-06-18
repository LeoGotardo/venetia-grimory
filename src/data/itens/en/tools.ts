import type { Ferramenta } from '../types'

export const FERRAMENTAS: Ferramenta[] = [
  // ─── ARTISAN'S TOOLS ──────────────────────────────────────────────────────
  {
    tipo_item: 'ferramenta',
    id: 'ferramentas_de_alquimista',
    nome: "Alchemist's Supplies",
    categoria: "Artisan's Tools",
    preco: '50 po',
    peso: '4.0 kg',
    descricao: 'Glass beakers, a mortar and pestle, and chemical reagents. Used to create potions, alchemist\'s fire, and antitoxins.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'ferramentas_de_ferreiro',
    nome: "Smith's Tools",
    categoria: "Artisan's Tools",
    preco: '20 po',
    peso: '4.0 kg',
    descricao: 'Hammers, tongs, a portable anvil, charcoal, and files. Essential for repairing armor, sharpening swords, and forging metal.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'ferramentas_de_carpinteiro',
    nome: "Carpenter's Tools",
    categoria: "Artisan's Tools",
    preco: '8 po',
    peso: '3.0 kg',
    descricao: 'A saw, chisels, a hammer, nails, an adze, and a plane. Useful for reinforcing doors, building barricades, and repairing vehicles.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'ferramentas_de_cartografo',
    nome: "Cartographer's Tools",
    categoria: "Artisan's Tools",
    preco: '15 po',
    peso: '3.0 kg',
    descricao: 'Ink, quills, parchment, compasses, rulers, and a storage tube. Allows precise mapping of dungeons and wilderness territories.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'ferramentas_de_coureiro',
    nome: "Leatherworker's Tools",
    categoria: "Artisan's Tools",
    preco: '5 po',
    peso: '2.5 kg',
    descricao: 'Leather scrapers, heavy needles, reinforced thread, and awls. For stitching and repairing leather armor and equipment.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'utensilios_de_cozinha',
    nome: "Cook's Utensils",
    categoria: "Artisan's Tools",
    preco: '1 po',
    peso: '4.0 kg',
    descricao: 'An iron pot, cutting knives, wooden spoons, spices, and a sieve. Allows preparation of nutritious meals during long rests.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'ferramentas_de_caligrafo',
    nome: "Calligrapher's Supplies",
    categoria: "Artisan's Tools",
    preco: '10 po',
    peso: '2.5 kg',
    descricao: 'Fine quills, colored inks, parchment, and rulers. Used to copy documents, create spell scrolls, and forge writings with artistic precision.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'ferramentas_de_cervejeiro',
    nome: "Brewer's Supplies",
    categoria: "Artisan's Tools",
    preco: '20 po',
    peso: '4.5 kg',
    descricao: 'A small barrel, a funnel, a rudimentary thermometer, and base ingredients. Allows fermenting ales, meads, and spirits during extended rests.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'ferramentas_de_joalheiro',
    nome: "Jeweler's Tools",
    categoria: "Artisan's Tools",
    preco: '25 po',
    peso: '2.0 kg',
    descricao: 'A magnifying glass, precision tweezers, fine files, and wax molds. For evaluating, cutting, and setting precious gems into jewelry and amulets.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'ferramentas_de_oleiro',
    nome: "Potter's Tools",
    categoria: "Artisan's Tools",
    preco: '10 po',
    peso: '2.5 kg',
    descricao: 'A portable hand wheel, shaping tools, and pigments. Used to create ceramic containers, vases, and functional urns.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'ferramentas_de_pedreiro',
    nome: "Mason's Tools",
    categoria: "Artisan's Tools",
    preco: '10 po',
    peso: '4.0 kg',
    descricao: 'A chisel, a mallet, a level, and a trowel. Allows identifying weaknesses in stone structures, building walls, and working with masonry.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'ferramentas_de_pintor',
    nome: "Painter's Supplies",
    categoria: "Artisan's Tools",
    preco: '10 po',
    peso: '2.5 kg',
    descricao: 'Brushes of various sizes, pigments, and fixing oils. For creating paintings, disguising objects, and reproducing images faithfully.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'ferramentas_de_sapateiro',
    nome: "Cobbler's Tools",
    categoria: "Artisan's Tools",
    preco: '5 po',
    peso: '2.5 kg',
    descricao: 'A wooden last, needles, leather thread, and metal tacks. Allows crafting and repairing boots, sandals, and other footwear.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'ferramentas_de_tecedor',
    nome: "Weaver's Tools",
    categoria: "Artisan's Tools",
    preco: '1 po',
    peso: '2.5 kg',
    descricao: 'A portable loom, knitting needles, and yarn spools. Allows producing simple clothing, nets, and functional fabrics during travel.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'ferramentas_de_vidraceiro',
    nome: "Glassblower's Tools",
    categoria: "Artisan's Tools",
    preco: '30 po',
    peso: '2.5 kg',
    descricao: 'Glass cutters, molds, and heat-resistant tongs. For working with blown glass, identifying magical crystals, and creating special containers.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'ferramentas_de_escultor',
    nome: "Woodcarver's Tools",
    categoria: "Artisan's Tools",
    preco: '1 po',
    peso: '2.5 kg',
    descricao: 'Precision chisels, sandpaper, and finishing wax. Allows carving wood into functional items, decorative pieces, and weapon handles.'
  },

  // ─── UTILITY ──────────────────────────────────────────────────────────────
  {
    tipo_item: 'ferramenta',
    id: 'ferramentas_de_ladrao',
    nome: "Thieves' Tools",
    categoria: 'Utility',
    preco: '25 po',
    peso: '0.5 kg',
    descricao: 'A file, a set of lockpicks, mirror on a handle, tweezers, and narrow scissors. Used to pick locks and disarm traps.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'kit_de_disfarce',
    nome: 'Disguise Kit',
    categoria: 'Utility',
    preco: '25 po',
    preco_venda: '12.5 po',
    peso: '1.5 kg',
    descricao: 'Cosmetics, hair dyes, wax prosthetics, and various clothing pieces. Allows completely altering physical appearance.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'kit_de_falsificacao',
    nome: 'Forgery Kit',
    categoria: 'Utility',
    preco: '15 po',
    peso: '2.5 kg',
    descricao: 'Papers, rare inks, wax seals, and blank signet rings. For forging documents, official letters, and seals of authority.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'kit_de_herbalismo',
    nome: 'Herbalism Kit',
    categoria: 'Utility',
    preco: '5 po',
    peso: '1.5 kg',
    descricao: 'Pouches for herbs, harvesting scissors, gloves, and empty vials. Required to craft healing potions and natural antidotes.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'kit_de_envenenador',
    nome: "Poisoner's Kit",
    categoria: 'Utility',
    preco: '50 po',
    peso: '1.0 kg',
    descricao: 'Sealed vials, pipettes, thick leather gloves, and chemical reagents. Allows collecting, refining, and applying poisons to weapons without risk of self-poisoning.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'ferramentas_de_navegador',
    nome: "Navigator's Tools",
    categoria: 'Utility',
    preco: '25 po',
    peso: '2.0 kg',
    descricao: 'A sextant, a compass, star charts, and nautical maps. Allows navigating oceans and unknown terrain without losing direction.'
  },

  // ─── GAMING SETS ──────────────────────────────────────────────────────────
  {
    tipo_item: 'ferramenta',
    id: 'jogo_de_dados',
    nome: 'Dice Set',
    categoria: 'Gaming Sets',
    preco: '1 pp',
    peso: '0.0 kg',
    descricao: 'Bone or wooden dice. May include loaded dice for cheating at tavern gambling (requires Sleight of Hand checks).'
  },
  {
    tipo_item: 'ferramenta',
    id: 'jogo_de_cartas',
    nome: 'Playing Card Set',
    categoria: 'Gaming Sets',
    preco: '5 pp',
    peso: '0.0 kg',
    descricao: 'A full deck with rustic illustrations. Used to pass time during long watches or for gambling at inns.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'xadrez_do_dragao',
    nome: 'Dragonchess Set',
    categoria: 'Gaming Sets',
    preco: '1 po',
    peso: '0.5 kg',
    descricao: 'A strategy game with carved pieces representing fantastic creatures. Popular among nobles, tacticians, and intellectual adventurers.'
  },

  // ─── MUSICAL INSTRUMENTS ──────────────────────────────────────────────────
  {
    tipo_item: 'ferramenta',
    id: 'alaude',
    nome: 'Lute',
    categoria: 'Musical Instrument',
    preco: '35 po',
    peso: '1.0 kg',
    descricao: 'A plucked string instrument with a pear-shaped resonating body. The bard\'s favorite for accompanying epic ballads.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'flauta',
    nome: 'Flute',
    categoria: 'Musical Instrument',
    preco: '2 po',
    peso: '0.5 kg',
    descricao: 'A simple wind instrument of wood or bamboo. Produces soft, melancholic melodies, ideal for beginner musicians.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'tambor',
    nome: 'Drum',
    categoria: 'Musical Instrument',
    preco: '6 po',
    peso: '1.5 kg',
    descricao: 'A percussion instrument of wood and stretched leather. Perfect for setting the rhythm of military marches or tribal rituals.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'lira',
    nome: 'Lyre',
    categoria: 'Musical Instrument',
    preco: '30 po',
    peso: '1.0 kg',
    descricao: 'A small portable harp-like instrument with a celestial sound. Closely associated with aristocratic, divine settings, and court musicians.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'gaita_de_foles',
    nome: 'Bagpipes',
    categoria: 'Musical Instrument',
    preco: '30 po',
    peso: '3.5 kg',
    descricao: 'A wind instrument with a leather bellows and wooden pipes. Unmistakable and penetrating sound, associated with mountain and warrior cultures.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'harpa',
    nome: 'Harp',
    categoria: 'Musical Instrument',
    preco: '25 po',
    peso: '2.5 kg',
    descricao: 'A string instrument with an arched frame and ethereal sound. Associated with fey, elves, and musicians of exceptional skill.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'trompete',
    nome: 'Horn',
    categoria: 'Musical Instrument',
    preco: '3 po',
    peso: '1.0 kg',
    descricao: 'A metal wind instrument with a powerful, penetrating sound. Used in military signals, fanfares, and announcements of high authority.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'flauta_de_pa',
    nome: 'Pan Flute',
    categoria: 'Musical Instrument',
    preco: '12 po',
    peso: '1.0 kg',
    descricao: 'A set of bamboo tubes of varying sizes. A rustic wind instrument with a pastoral sound, favored by druids and nature musicians.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'viola',
    nome: 'Viol',
    categoria: 'Musical Instrument',
    preco: '30 po',
    peso: '1.5 kg',
    descricao: 'A bowed string instrument with a rich, resonant sound. Preferred by classical bards for formal performances and noble banquets.'
  }
]
