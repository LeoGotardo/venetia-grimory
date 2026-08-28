import type { Spell } from '../types'

export const SPELLS9: Spell[] = [
    // ─── CÍRCULO 9 ────────────────────────────────────────────────────────────
  {
    id: 'desejo',
    name: 'Desejo',
    level: 9,
    school: 'Conjuração',
    classes: ['feiticeiro', 'mago'],
    description: 'A magia mais poderosa que uma criatura mortal pode conjurar. Ao simplesmente falar em voz alta, você pode alterar a própria realidade. O uso básico desta magia é duplicar qualquer outra magia de 8º círculo ou menor sem precisar de componentes. Usá-la para outros desejos causa um estresse severo no conjurador.',
    componentes: ['V'],
    casting_time: '1 ação',
    range: 'Pessoal',
    duration: 'Instantânea'
  },
  {
    id: 'palavra_de_poder_matar',
    name: 'Palavra de Poder: Matar',
    level: 9,
    school: 'Encantamento',
    classes: ['bardo', 'bruxo', 'feiticeiro', 'mago'],
    description: 'Você profere uma palavra de poder que compele uma criatura que você possa ver dentro do alcance a morrer instantaneamente. Se o alvo tiver 100 pontos de vida ou menos, ele morre. Caso contrário, a magia não tem efeito.',
    componentes: ['V'],
    casting_time: '1 ação',
    range: '18 metros',
    duration: 'Instantânea'
  },
  {
    id: 'parar_o_tempo',
    name: 'Parar o Tempo',
    level: 9,
    school: 'Transmutação',
    classes: ['feiticeiro', 'mago'],
    description: 'Você para brevemente o fluxo do tempo para todos, exceto para si mesmo. O tempo não passa para o resto do mundo enquanto você ganha de 1d4+1 turnos consecutivos, nos quais pode se mover e agir normalmente (a magia encerra se você afetar outra criatura ou objeto carregado).',
    componentes: ['V'],
    casting_time: '1 ação',
    range: 'Pessoal',
    duration: 'Instantânea'
  },
  {
    id: 'metamorfose_verdadeira',
    name: 'Polimorfismo Verdadeiro',
    level: 9,
    school: 'Transmutação',
    classes: ['bardo', 'druida', 'feiticeiro', 'mago'],
    concentration: true,
    description: 'Você transforma uma criatura ou objeto não-mágico em outra criatura ou objeto. Se mantiver a concentração pela duração total de 1 hora, a transformação se torna permanente até ser dissipada. Alvos involuntários realizam uma salvaguarda.',
    componentes: ['V', 'S', 'M'],
    material: 'uma casca de ovo de lagarta e uma pitada de pó de mercúrio',
    casting_time: '1 ação',
    range: '18 metros',
    duration: 'Concentração, até 1 hora',
    save: 'Sabedoria'
  },
  {
    id: 'chuva_de_meteoros',
    name: 'Chuva de Meteoros',
    level: 9,
    school: 'Evocação',
    classes: ['feiticeiro', 'mago'],
    description: 'Esferas de fogo colossais despencam do céu em quatro pontos diferentes à sua escolha dentro do alcance. Cada criatura em uma esfera de 12 metros de raio de cada impacto deve fazer uma salvaguarda; se falhar, sofre dano massivo de fogo e de concussão misturados.',
    componentes: ['V', 'S'],
    casting_time: '1 ação',
    range: '1,5 quilômetro',
    duration: 'Instantânea',
    damage: '20d6 (fogo) + 20d6 (concussão)',
    damage_type: 'Fogo / Concussão',
    save: 'Destreza'
  },
  {
    id: 'ressurreicao_verdadeira',
    name: 'Ressurreição Verdadeira',
    level: 9,
    school: 'Necromancia',
    classes: ['clerigo', 'druida'],
    description: 'Você toca uma criatura que tenha morrido há não mais de 200 anos e cuja morte não tenha sido por velhice. Se a alma estiver disposta, ela retorna à vida com todos os pontos de vida. Esta magia pode até mesmo criar um corpo inteiramente novo se o original tiver sido destruído.',
    componentes: ['V', 'S', 'M'],
    material: 'diamantes valendo pelo menos 25.000 po, consumidos pela magia',
    casting_time: '1 hora',
    range: 'Toque',
    duration: 'Instantânea'
  },
  {
    id: 'aprisionamento',
    name: 'Aprisionamento',
    level: 9,
    school: 'Abjuração',
    classes: ['bruxo', 'mago'],
    description: 'Você cria uma amarra mágica para prender uma criatura que possa ver dentro do alcance. O alvo deve fazer uma salvaguarda; se falhar, fica preso em uma forma de confinamento à sua escolha (como sepultamento subterrâneo ou uma gema minúscula). A magia dura até ser dissipada.',
    componentes: ['V', 'S', 'M'],
    material: 'uma estatueta representando o alvo e um componente especial valendo 500 po por Dado de Vida do alvo',
    casting_time: '1 minuto',
    range: '9 metros',
    duration: 'Até ser dissipada',
    save: 'Sabedoria'
  }
]