import type { Magia } from '../types'

export const MAGIAS9: Magia[] = [
    // ─── CÍRCULO 9 ────────────────────────────────────────────────────────────
  {
    id: 'desejo',
    nome: 'Desejo',
    circulo: 9,
    escola: 'Conjuração',
    classes: ['feiticeiro', 'mago'],
    descricao: 'A magia mais poderosa que uma criatura mortal pode conjurar. Ao simplesmente falar em voz alta, você pode alterar a própria realidade. O uso básico desta magia é duplicar qualquer outra magia de 8º círculo ou menor sem precisar de componentes. Usá-la para outros desejos causa um estresse severo no conjurador.',
    componentes: ['V'],
    tempo_conjuracao: '1 ação',
    alcance: 'Pessoal',
    duracao: 'Instantânea'
  },
  {
    id: 'palavra_de_poder_matar',
    nome: 'Palavra de Poder: Matar',
    circulo: 9,
    escola: 'Encantamento',
    classes: ['bardo', 'bruxo', 'feiticeiro', 'mago'],
    descricao: 'Você profere uma palavra de poder que compele uma criatura que você possa ver dentro do alcance a morrer instantaneamente. Se o alvo tiver 100 pontos de vida ou menos, ele morre. Caso contrário, a magia não tem efeito.',
    componentes: ['V'],
    tempo_conjuracao: '1 ação',
    alcance: '18 metros',
    duracao: 'Instantânea'
  },
  {
    id: 'parar_o_tempo',
    nome: 'Parar o Tempo',
    circulo: 9,
    escola: 'Transmutação',
    classes: ['feiticeiro', 'mago'],
    descricao: 'Você para brevemente o fluxo do tempo para todos, exceto para si mesmo. O tempo não passa para o resto do mundo enquanto você ganha de 1d4+1 turnos consecutivos, nos quais pode se mover e agir normalmente (a magia encerra se você afetar outra criatura ou objeto carregado).',
    componentes: ['V'],
    tempo_conjuracao: '1 ação',
    alcance: 'Pessoal',
    duracao: 'Instantânea'
  },
  {
    id: 'metamorfose_verdadeira',
    nome: 'Polimorfismo Verdadeiro',
    circulo: 9,
    escola: 'Transmutação',
    classes: ['bardo', 'druida', 'feiticeiro', 'mago'],
    concentracao: true,
    descricao: 'Você transforma uma criatura ou objeto não-mágico em outra criatura ou objeto. Se mantiver a concentração pela duração total de 1 hora, a transformação se torna permanente até ser dissipada. Alvos involuntários realizam uma salvaguarda.',
    componentes: ['V', 'S', 'M'],
    material: 'uma casca de ovo de lagarta e uma pitada de pó de mercúrio',
    tempo_conjuracao: '1 ação',
    alcance: '18 metros',
    duracao: 'Concentração, até 1 hora',
    salvaguarda: 'Sabedoria'
  },
  {
    id: 'chuva_de_meteoros',
    nome: 'Chuva de Meteoros',
    circulo: 9,
    escola: 'Evocação',
    classes: ['feiticeiro', 'mago'],
    descricao: 'Esferas de fogo colossais despencam do céu em quatro pontos diferentes à sua escolha dentro do alcance. Cada criatura em uma esfera de 12 metros de raio de cada impacto deve fazer uma salvaguarda; se falhar, sofre dano massivo de fogo e de concussão misturados.',
    componentes: ['V', 'S'],
    tempo_conjuracao: '1 ação',
    alcance: '1,5 quilômetro',
    duracao: 'Instantânea',
    dano: '20d6 (fogo) + 20d6 (concussão)',
    tipo_dano: 'Fogo / Concussão',
    salvaguarda: 'Destreza'
  },
  {
    id: 'ressurreicao_verdadeira',
    nome: 'Ressurreição Verdadeira',
    circulo: 9,
    escola: 'Necromancia',
    classes: ['clerigo', 'druida'],
    descricao: 'Você toca uma criatura que tenha morrido há não mais de 200 anos e cuja morte não tenha sido por velhice. Se a alma estiver disposta, ela retorna à vida com todos os pontos de vida. Esta magia pode até mesmo criar um corpo inteiramente novo se o original tiver sido destruído.',
    componentes: ['V', 'S', 'M'],
    material: 'diamantes valendo pelo menos 25.000 po, consumidos pela magia',
    tempo_conjuracao: '1 hora',
    alcance: 'Toque',
    duracao: 'Instantânea'
  },
  {
    id: 'aprisionamento',
    nome: 'Aprisionamento',
    circulo: 9,
    escola: 'Abjuração',
    classes: ['bruxo', 'mago'],
    descricao: 'Você cria uma amarra mágica para prender uma criatura que possa ver dentro do alcance. O alvo deve fazer uma salvaguarda; se falhar, fica preso em uma forma de confinamento à sua escolha (como sepultamento subterrâneo ou uma gema minúscula). A magia dura até ser dissipada.',
    componentes: ['V', 'S', 'M'],
    material: 'uma estatueta representando o alvo e um componente especial valendo 500 po por Dado de Vida do alvo',
    tempo_conjuracao: '1 minuto',
    alcance: '9 metros',
    duracao: 'Até ser dissipada',
    salvaguarda: 'Sabedoria'
  }
]