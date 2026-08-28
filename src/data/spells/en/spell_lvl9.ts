import type { Spell } from '../types'

export const SPELLS9: Spell[] = [
  // ─── CIRCLE 9 ────────────────────────────────────────────────────────────
  {
    id: 'desejo',
    name: 'Wish',
    level: 9,
    school: 'Conjuration',
    classes: ['feiticeiro', 'mago'],
    description: 'The mightiest spell a mortal creature can cast. By simply speaking aloud, you can alter the very foundations of reality. The basic use of this spell is to duplicate any other spell of 8th circle or lower without needing components. Using it for any other desires causes severe stress on the caster.',
    componentes: ['V'],
    casting_time: '1 action',
    range: 'Self',
    duration: 'Instantaneous'
  },
  {
    id: 'palavra_de_poder_matar',
    name: 'Power Word: Kill',
    level: 9,
    school: 'Enchantment',
    classes: ['bardo', 'bruxo', 'feiticeiro', 'mago'],
    description: 'You utter a word of power that compels one creature you can see within range to die instantly. If the target has 100 hit points or fewer, it dies. Otherwise, the spell has no effect.',
    componentes: ['V'],
    casting_time: '1 action',
    range: '18 meters',
    duration: 'Instantaneous'
  },
  {
    id: 'parar_o_tempo',
    name: 'Time Stop',
    level: 9,
    school: 'Transmutation',
    classes: ['feiticeiro', 'mago'],
    description: 'You briefly stop the flow of time for everyone but yourself. No time passes for the rest of the world while you gain 1d4+1 consecutive turns, during which you can move and act normally (the spell ends if you affect another creature or a carried object).',
    componentes: ['V'],
    casting_time: '1 action',
    range: 'Self',
    duration: 'Instantaneous'
  },
  {
    id: 'metamorfose_verdadeira',
    name: 'True Polymorph',
    level: 9,
    school: 'Transmutation',
    classes: ['bardo', 'druida', 'feiticeiro', 'mago'],
    concentration: true,
    description: 'You transform a creature or non-magical object into another creature or object. If you maintain concentration for the full 1-hour duration, the transformation becomes permanent until dispelled. Unwilling targets can make a saving throw.',
    componentes: ['V', 'S', 'M'],
    material: 'a caterpillar cocoon and a pinch of mercury dust',
    casting_time: '1 action',
    range: '18 meters',
    duration: 'Concentration, up to 1 hour',
    save: 'Wisdom'
  },
  {
    id: 'chuva_de_meteoros',
    name: 'Meteor Swarm',
    level: 9,
    school: 'Evocation',
    classes: ['feiticeiro', 'mago'],
    description: 'Colossal orbs of fire plummet from the sky at four different points of your choice within range. Each creature in a 12-meter-radius sphere centered on each impact must make a saving throw; on a failed save, a creature takes massive fire and bludgeoning damage combined.',
    componentes: ['V', 'S'],
    casting_time: '1 action',
    range: '1.5 kilometers',
    duration: 'Instantaneous',
    damage: '20d6 (fire) + 20d6 (bludgeoning)',
    damage_type: 'Fire / Bludgeoning',
    save: 'Dexterity'
  },
  {
    id: 'ressurreicao_verdadeira',
    name: 'True Resurrection',
    level: 9,
    school: 'Necromancy',
    classes: ['clerigo', 'druida'],
    description: 'You touch a creature that has been dead for no more than 200 years and whose death was not from old age. If the soul is willing, it returns to life with all its hit points. This spell can even create an entirely new body if the original one was destroyed.',
    componentes: ['V', 'S', 'M'],
    material: 'diamonds worth at least 25,000 gp, consumed by the spell',
    casting_time: '1 hour',
    range: 'Touch',
    duration: 'Instantaneous'
  },
  {
    id: 'aprisionamento',
    name: 'Imprisonment',
    level: 9,
    school: 'Abjuration',
    classes: ['bruxo', 'mago'],
    description: 'You create a magical binding to trap a creature you can see within range. The target must make a saving throw; on a failed save, it is bound in a form of confinement of your choice (such as underground burial or a tiny gem). The spell lasts until dispelled.',
    componentes: ['V', 'S', 'M'],
    material: 'a depiction of the target and a special component worth 500 gp per Hit Die of the target',
    casting_time: '1 minute',
    range: '9 meters',
    duration: 'Until dispelled',
    save: 'Wisdom'
  }
]