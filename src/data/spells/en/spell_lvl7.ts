import type { Magia } from '../types'

export const MAGIAS7: Magia[] = [
  // ─── CIRCLE 7 ────────────────────────────────────────────────────────────
  {
    id: 'bola_de_fogo_controlavel',
    nome: 'Delayed Blast Fireball',
    circulo: 7,
    escola: 'Evocation',
    classes: ['sorcerer', 'wizard'],
    concentracao: true,
    descricao: 'A gleaming bead of light appears at a point of your choice within range. You can hold the explosion for up to 1 minute, building up energy. When the spell ends or your concentration breaks, the bead explodes into flames, dealing massive damage that increases each turn it was held.',
    componentes: ['V', 'S', 'M'],
    material: 'a small ball of bat guano and sulfur',
    tempo_conjuracao: '1 action',
    alcance: '45 meters',
    duracao: 'Concentration, up to 1 minute',
    dano: '12d6 (base) + 1d6 per turn of concentration',
    tipo_dano: 'Fire',
    salvaguarda: 'Dexterity'
  },
  {
    id: 'palavra_de_poder_dor',
    nome: 'Power Word: Pain',
    circulo: 7,
    escola: 'Enchantment',
    classes: ['warlock', 'sorcerer', 'wizard'],
    descricao: 'You utter a word of power capable of overwhelming the mind of a visible creature within range with excruciating pain. If the target has 100 hit points or fewer, its speed is reduced and it has disadvantage on attack rolls, ability checks, and saving throws.',
    componentes: ['V'],
    tempo_conjuracao: '1 action',
    alcance: '18 meters',
    duracao: '1 minute',
    salvaguarda: 'Constitution'
  },
  {
    id: 'resurreicao',
    nome: 'Resurrection',
    circulo: 7,
    escola: 'Necromancy',
    classes: ['cleric', 'bard'],
    descricao: 'You touch a creature that has been dead for no more than a century. Provided the soul is free and willing, the target returns to life with all its hit points. This spell heals deep wounds and regenerates lost limbs.',
    componentes: ['V', 'S', 'M'],
    material: 'a diamond worth at least 1,000 gp, consumed by the spell',
    tempo_conjuracao: '1 hour',
    alcance: 'Touch',
    duracao: 'Instantaneous'
  },
  {
    id: 'inverter_a_gravidade',
    nome: 'Reverse Gravity',
    circulo: 7,
    escola: 'Transmutation',
    classes: ['druid', 'sorcerer', 'wizard'],
    concentracao: true,
    descricao: 'You reverse gravity in a 15-meter-radius, 30-meter-high cylinder centered on a point. All creatures and objects that are not anchored to the ground fall upward to the top of the spell\'s area.',
    componentes: ['V', 'S', 'M'],
    material: 'a pinch of magnetized iron and some iron filings',
    tempo_conjuracao: '1 action',
    alcance: '30 meters',
    duracao: 'Concentration, up to 1 minute',
    salvaguarda: 'Dexterity (to grab onto something fixed)'
  },
  {
    id: 'projetar_imagem',
    nome: 'Project Image',
    circulo: 7,
    escola: 'Illusion',
    classes: ['bard', 'wizard'],
    concentracao: true,
    descricao: 'You create an illusory copy of yourself that lasts for the duration of the spell. You can see through the copy\'s eyes, hear through its ears, and speak through it from any distance within the same plane.',
    componentes: ['V', 'S', 'M'],
    material: 'a small replica of yourself made of noble materials worth 5 gp',
    tempo_conjuracao: '1 action',
    alcance: 'Interplanetary',
    duracao: 'Concentration, up to 1 day'
  },
  {
    id: 'muralha_prismatica',
    nome: 'Prismatic Wall',
    circulo: 7,
    escola: 'Abjuration',
    classes: ['wizard'],
    descricao: 'You create a shimmering wall composed of seven vertical multicolored layers. Each layer has a color of the rainbow, blocks attacks and spells, and causes a different destructive effect or damage type to anyone attempting to pass through it.',
    componentes: ['V', 'S'],
    tempo_conjuracao: '1 action',
    alcance: '18 meters',
    duracao: '10 minutes'
  }
]