import type { Magia } from '../types'

export const MAGIAS9: Magia[] = [
  // ─── CIRCLE 9 ────────────────────────────────────────────────────────────
  {
    id: 'desejo',
    nome: 'Wish',
    circulo: 9,
    escola: 'Conjuration',
    classes: ['feiticeiro', 'mago'],
    descricao: 'The mightiest spell a mortal creature can cast. By simply speaking aloud, you can alter the very foundations of reality. The basic use of this spell is to duplicate any other spell of 8th circle or lower without needing components. Using it for any other desires causes severe stress on the caster.',
    componentes: ['V'],
    tempo_conjuracao: '1 action',
    alcance: 'Self',
    duracao: 'Instantaneous'
  },
  {
    id: 'palavra_de_poder_matar',
    nome: 'Power Word: Kill',
    circulo: 9,
    escola: 'Enchantment',
    classes: ['bardo', 'bruxo', 'feiticeiro', 'mago'],
    descricao: 'You utter a word of power that compels one creature you can see within range to die instantly. If the target has 100 hit points or fewer, it dies. Otherwise, the spell has no effect.',
    componentes: ['V'],
    tempo_conjuracao: '1 action',
    alcance: '18 meters',
    duracao: 'Instantaneous'
  },
  {
    id: 'parar_o_tempo',
    nome: 'Time Stop',
    circulo: 9,
    escola: 'Transmutation',
    classes: ['feiticeiro', 'mago'],
    descricao: 'You briefly stop the flow of time for everyone but yourself. No time passes for the rest of the world while you gain 1d4+1 consecutive turns, during which you can move and act normally (the spell ends if you affect another creature or a carried object).',
    componentes: ['V'],
    tempo_conjuracao: '1 action',
    alcance: 'Self',
    duracao: 'Instantaneous'
  },
  {
    id: 'metamorfose_verdadeira',
    nome: 'True Polymorph',
    circulo: 9,
    escola: 'Transmutation',
    classes: ['bardo', 'druida', 'feiticeiro', 'mago'],
    concentracao: true,
    descricao: 'You transform a creature or non-magical object into another creature or object. If you maintain concentration for the full 1-hour duration, the transformation becomes permanent until dispelled. Unwilling targets can make a saving throw.',
    componentes: ['V', 'S', 'M'],
    material: 'a caterpillar cocoon and a pinch of mercury dust',
    tempo_conjuracao: '1 action',
    alcance: '18 meters',
    duracao: 'Concentration, up to 1 hour',
    salvaguarda: 'Wisdom'
  },
  {
    id: 'chuva_de_meteoros',
    nome: 'Meteor Swarm',
    circulo: 9,
    escola: 'Evocation',
    classes: ['feiticeiro', 'mago'],
    descricao: 'Colossal orbs of fire plummet from the sky at four different points of your choice within range. Each creature in a 12-meter-radius sphere centered on each impact must make a saving throw; on a failed save, a creature takes massive fire and bludgeoning damage combined.',
    componentes: ['V', 'S'],
    tempo_conjuracao: '1 action',
    alcance: '1.5 kilometers',
    duracao: 'Instantaneous',
    dano: '20d6 (fire) + 20d6 (bludgeoning)',
    tipo_dano: 'Fire / Bludgeoning',
    salvaguarda: 'Dexterity'
  },
  {
    id: 'ressurreicao_verdadeira',
    nome: 'True Resurrection',
    circulo: 9,
    escola: 'Necromancy',
    classes: ['clerigo', 'druida'],
    descricao: 'You touch a creature that has been dead for no more than 200 years and whose death was not from old age. If the soul is willing, it returns to life with all its hit points. This spell can even create an entirely new body if the original one was destroyed.',
    componentes: ['V', 'S', 'M'],
    material: 'diamonds worth at least 25,000 gp, consumed by the spell',
    tempo_conjuracao: '1 hour',
    alcance: 'Touch',
    duracao: 'Instantaneous'
  },
  {
    id: 'aprisionamento',
    nome: 'Imprisonment',
    circulo: 9,
    escola: 'Abjuration',
    classes: ['bruxo', 'mago'],
    descricao: 'You create a magical binding to trap a creature you can see within range. The target must make a saving throw; on a failed save, it is bound in a form of confinement of your choice (such as underground burial or a tiny gem). The spell lasts until dispelled.',
    componentes: ['V', 'S', 'M'],
    material: 'a depiction of the target and a special component worth 500 gp per Hit Die of the target',
    tempo_conjuracao: '1 minute',
    alcance: '9 meters',
    duracao: 'Until dispelled',
    salvaguarda: 'Wisdom'
  }
]