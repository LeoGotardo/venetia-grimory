import type { Spell } from '../types'

export const SPELLS8: Spell[] = [
  // ─── CIRCLE 8 ────────────────────────────────────────────────────────────
  {
    id: 'explosao_solar',
    name: 'Sunburst',
    level: 8,
    school: 'Evocation',
    classes: ['clerigo', 'druida', 'feiticeiro', 'mago'],
    description: 'Brilliant sunlight flashes in an 18-meter radius centered on a point you choose within range. Each creature in the area must make a saving throw; on a failed save, it takes massive radiant damage and is blinded for 1 minute. Undead and oozes have disadvantage on this saving throw.',
    componentes: ['V', 'S', 'M'],
    material: 'a magnifying glass and an opal gem worth at least 100 gp',
    casting_time: '1 action',
    range: '45 meters',
    duration: 'Instantaneous',
    damage: '12d6',
    damage_type: 'Radiant',
    save: 'Constitution'
  },
  {
    id: 'palavra_de_poder_atordoar',
    name: 'Power Word: Stun',
    level: 8,
    school: 'Enchantment',
    classes: ['bardo', 'bruxo', 'feiticeiro', 'mago'],
    description: 'You utter a word of power capable of overwhelming the mind of one creature you can see within range. If the target has 150 hit points or fewer, it is stunned. The target can make a saving throw at the end of each of its turns to end the effect.',
    componentes: ['V'],
    casting_time: '1 action',
    range: '18 meters',
    duration: 'Instantaneous',
    save: 'Constitution'
  },
  {
    id: 'terremoto',
    name: 'Earthquake',
    level: 8,
    school: 'Evocation',
    classes: ['clerigo', 'druida'],
    concentration: true,
    description: 'You create a devastating tremor in the ground in a 30-meter radius centered on a point within range. The tremor knocks creatures down, opens deep fissures in the ground, and deals massive damage to structures or buildings in the area.',
    componentes: ['V', 'S', 'M'],
    material: 'a pinch of dirt and a few rock pebbles',
    casting_time: '1 action',
    range: '150 meters',
    duration: 'Concentration, up to 1 minute',
    save: 'Dexterity'
  },
  {
    id: 'mente_em_branco',
    name: 'Mind Blank',
    level: 8,
    school: 'Abjuration',
    classes: ['bardo', 'mago'],
    description: 'You grant total immunity to a willing creature against psychic effects and divinations. Until the spell ends, the target is immune to psychic damage, the charmed condition, and any effect that attempts to read its thoughts or emotions.',
    componentes: ['V', 'S'],
    casting_time: '1 action',
    range: 'Touch',
    duration: '24 hours'
  },
  {
    id: 'semiplano',
    name: 'Demiplane',
    level: 8,
    school: 'Conjuration',
    classes: ['bruxo', 'mago'],
    description: 'You create a dimensional door on a flat surface that opens into an empty demiplane of your choice (a stone room 9 meters in each dimension). The door lasts for 1 hour and any creature can enter or look into the demiplane.',
    componentes: ['S'],
    casting_time: '1 action',
    range: '1.5 meters',
    duration: '1 hour'
  },
  {
    id: 'controlar_o_clima',
    name: 'Control Weather',
    level: 8,
    school: 'Transmutation',
    classes: ['clerigo', 'druida', 'mago'],
    concentration: true,
    description: 'You drastically alter the weather conditions within an 8-kilometer radius around you. You can gradually change precipitation, temperature, and wind force over time according to the weather tables.',
    componentes: ['V', 'S', 'M'],
    material: 'burning incense and a bit of clear water',
    casting_time: '10 minutes',
    range: 'Self (8 km radius)',
    duration: 'Concentration, up to 8 hours'
  }
]