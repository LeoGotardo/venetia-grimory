import type { Spell } from '../types'

export const SPELLS7: Spell[] = [
  // ─── CIRCLE 7 ────────────────────────────────────────────────────────────
  {
    id: 'bola_de_fogo_controlavel',
    name: 'Delayed Blast Fireball',
    level: 7,
    school: 'Evocation',
    classes: ['feiticeiro', 'mago'],
    concentration: true,
    description: 'A gleaming bead of light appears at a point of your choice within range. You can hold the explosion for up to 1 minute, building up energy. When the spell ends or your concentration breaks, the bead explodes into flames, dealing massive damage that increases each turn it was held.',
    componentes: ['V', 'S', 'M'],
    material: 'a small ball of bat guano and sulfur',
    casting_time: '1 action',
    range: '45 meters',
    duration: 'Concentration, up to 1 minute',
    damage: '12d6 (base) + 1d6 per turn of concentration',
    damage_type: 'Fire',
    save: 'Dexterity'
  },
  {
    id: 'palavra_de_poder_dor',
    name: 'Power Word: Pain',
    level: 7,
    school: 'Enchantment',
    classes: ['bruxo', 'feiticeiro', 'mago'],
    description: 'You utter a word of power capable of overwhelming the mind of a visible creature within range with excruciating pain. If the target has 100 hit points or fewer, its speed is reduced and it has disadvantage on attack rolls, ability checks, and saving throws.',
    componentes: ['V'],
    casting_time: '1 action',
    range: '18 meters',
    duration: '1 minute',
    save: 'Constitution'
  },
  {
    id: 'resurreicao',
    name: 'Resurrection',
    level: 7,
    school: 'Necromancy',
    classes: ['clerigo', 'bardo'],
    description: 'You touch a creature that has been dead for no more than a century. Provided the soul is free and willing, the target returns to life with all its hit points. This spell heals deep wounds and regenerates lost limbs.',
    componentes: ['V', 'S', 'M'],
    material: 'a diamond worth at least 1,000 gp, consumed by the spell',
    casting_time: '1 hour',
    range: 'Touch',
    duration: 'Instantaneous'
  },
  {
    id: 'inverter_a_gravidade',
    name: 'Reverse Gravity',
    level: 7,
    school: 'Transmutation',
    classes: ['druida', 'feiticeiro', 'mago'],
    concentration: true,
    description: 'You reverse gravity in a 15-meter-radius, 30-meter-high cylinder centered on a point. All creatures and objects that are not anchored to the ground fall upward to the top of the spell\'s area.',
    componentes: ['V', 'S', 'M'],
    material: 'a pinch of magnetized iron and some iron filings',
    casting_time: '1 action',
    range: '30 meters',
    duration: 'Concentration, up to 1 minute',
    save: 'Dexterity (to grab onto something fixed)'
  },
  {
    id: 'projetar_imagem',
    name: 'Project Image',
    level: 7,
    school: 'Illusion',
    classes: ['bardo', 'mago'],
    concentration: true,
    description: 'You create an illusory copy of yourself that lasts for the duration of the spell. You can see through the copy\'s eyes, hear through its ears, and speak through it from any distance within the same plane.',
    componentes: ['V', 'S', 'M'],
    material: 'a small replica of yourself made of noble materials worth 5 gp',
    casting_time: '1 action',
    range: 'Interplanetary',
    duration: 'Concentration, up to 1 day'
  },
  {
    id: 'muralha_prismatica',
    name: 'Prismatic Wall',
    level: 7,
    school: 'Abjuration',
    classes: ['mago'],
    description: 'You create a shimmering wall composed of seven vertical multicolored layers. Each layer has a color of the rainbow, blocks attacks and spells, and causes a different destructive effect or damage type to anyone attempting to pass through it.',
    componentes: ['V', 'S'],
    casting_time: '1 action',
    range: '18 meters',
    duration: '10 minutes'
  }
]