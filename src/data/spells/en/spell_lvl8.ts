import type { Magia } from '../types'

export const MAGIAS8: Magia[] = [
  // ─── CIRCLE 8 ────────────────────────────────────────────────────────────
  {
    id: 'explosao_solar',
    nome: 'Sunburst',
    circulo: 8,
    escola: 'Evocation',
    classes: ['clerigo', 'druida', 'feiticeiro', 'mago'],
    descricao: 'Brilliant sunlight flashes in an 18-meter radius centered on a point you choose within range. Each creature in the area must make a saving throw; on a failed save, it takes massive radiant damage and is blinded for 1 minute. Undead and oozes have disadvantage on this saving throw.',
    componentes: ['V', 'S', 'M'],
    material: 'a magnifying glass and an opal gem worth at least 100 gp',
    tempo_conjuracao: '1 action',
    alcance: '45 meters',
    duracao: 'Instantaneous',
    dano: '12d6',
    tipo_dano: 'Radiant',
    salvaguarda: 'Constitution'
  },
  {
    id: 'palavra_de_poder_atordoar',
    nome: 'Power Word: Stun',
    circulo: 8,
    escola: 'Enchantment',
    classes: ['bardo', 'bruxo', 'feiticeiro', 'mago'],
    descricao: 'You utter a word of power capable of overwhelming the mind of one creature you can see within range. If the target has 150 hit points or fewer, it is stunned. The target can make a saving throw at the end of each of its turns to end the effect.',
    componentes: ['V'],
    tempo_conjuracao: '1 action',
    alcance: '18 meters',
    duracao: 'Instantaneous',
    salvaguarda: 'Constitution'
  },
  {
    id: 'terremoto',
    nome: 'Earthquake',
    circulo: 8,
    escola: 'Evocation',
    classes: ['clerigo', 'druida'],
    concentracao: true,
    descricao: 'You create a devastating tremor in the ground in a 30-meter radius centered on a point within range. The tremor knocks creatures down, opens deep fissures in the ground, and deals massive damage to structures or buildings in the area.',
    componentes: ['V', 'S', 'M'],
    material: 'a pinch of dirt and a few rock pebbles',
    tempo_conjuracao: '1 action',
    alcance: '150 meters',
    duracao: 'Concentration, up to 1 minute',
    salvaguarda: 'Dexterity'
  },
  {
    id: 'mente_em_branco',
    nome: 'Mind Blank',
    circulo: 8,
    escola: 'Abjuration',
    classes: ['bardo', 'mago'],
    descricao: 'You grant total immunity to a willing creature against psychic effects and divinations. Until the spell ends, the target is immune to psychic damage, the charmed condition, and any effect that attempts to read its thoughts or emotions.',
    componentes: ['V', 'S'],
    tempo_conjuracao: '1 action',
    alcance: 'Touch',
    duracao: '24 hours'
  },
  {
    id: 'semiplano',
    nome: 'Demiplane',
    circulo: 8,
    escola: 'Conjuration',
    classes: ['bruxo', 'mago'],
    descricao: 'You create a dimensional door on a flat surface that opens into an empty demiplane of your choice (a stone room 9 meters in each dimension). The door lasts for 1 hour and any creature can enter or look into the demiplane.',
    componentes: ['S'],
    tempo_conjuracao: '1 action',
    alcance: '1.5 meters',
    duracao: '1 hour'
  },
  {
    id: 'controlar_o_clima',
    nome: 'Control Weather',
    circulo: 8,
    escola: 'Transmutation',
    classes: ['clerigo', 'druida', 'mago'],
    concentracao: true,
    descricao: 'You drastically alter the weather conditions within an 8-kilometer radius around you. You can gradually change precipitation, temperature, and wind force over time according to the weather tables.',
    componentes: ['V', 'S', 'M'],
    material: 'burning incense and a bit of clear water',
    tempo_conjuracao: '10 minutes',
    alcance: 'Self (8 km radius)',
    duracao: 'Concentration, up to 8 hours'
  }
]