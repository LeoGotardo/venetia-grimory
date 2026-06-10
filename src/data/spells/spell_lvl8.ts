import type { Magia } from './types'

export const MAGIAS8: Magia[] = [
  // ─── CÍRCULO 8 ────────────────────────────────────────────────────────────
  {
    id: 'explosao_solar',
    nome: 'Explosão Solar',
    circulo: 8,
    escola: 'Evocação',
    classes: ['clerigo', 'druida', 'feiticeiro', 'mago'],
    descricao: 'Luz solar brilhante irrompe num raio de 18 metros centrado num ponto à sua escolha dentro do alcance. Cada criatura na área deve fazer uma salvaguarda; se falhar, sofre dano radiante massivo e fica cega por 1 minuto. Mortos-vivos e limos têm desvantagem nesta salvaguarda.',
    componentes: ['V', 'S', 'M'],
    material: 'uma lupa e uma gema de opala valendo pelo menos 100 po',
    tempo_conjuracao: '1 ação',
    alcance: '45 metros',
    duracao: 'Instantânea',
    dano: '12d6',
    tipo_dano: 'Radiante',
    salvaguarda: 'Constituição'
  },
  {
    id: 'palavra_de_poder_atordoar',
    nome: 'Palavra de Poder: Atordoar',
    circulo: 8,
    escola: 'Encantamento',
    classes: ['bardo', 'bruxo', 'feiticeiro', 'mago'],
    descricao: 'Você profere uma palavra de poder capaz de sobrecarregar a mente de uma criatura que possa ver dentro do alcance. Se o alvo tiver 150 pontos de vida ou menos, fica atordoado. O alvo pode fazer uma salvaguarda no final de cada um dos seus turnos para encerrar o efeito.',
    componentes: ['V'],
    tempo_conjuracao: '1 ação',
    alcance: '18 metros',
    duracao: 'Instantânea',
    salvaguarda: 'Constituição'
  },
  {
    id: 'terremoto',
    nome: 'Terremoto',
    circulo: 8,
    escola: 'Evocação',
    classes: ['clerigo', 'druida'],
    concentracao: true,
    descricao: 'Você cria um tremor devastador no solo num raio de 30 metros centrado num ponto dentro do alcance. O tremor derruba criaturas, abre fendas profundas no chão e causa dano massivo a estruturas ou edifícios na área.',
    componentes: ['V', 'S', 'M'],
    material: 'um pouco de terra e alguns seixos de rocha',
    tempo_conjuracao: '1 ação',
    alcance: '150 metros',
    duracao: 'Concentração, até 1 minuto',
    salvaguarda: 'Destreza'
  },
  {
    id: 'mente_em_branco',
    nome: 'Mente em Branco',
    circulo: 8,
    escola: 'Abjuração',
    classes: ['bardo', 'mago'],
    descricao: 'Você confere imunidade total a uma criatura voluntária contra efeitos psíquicos e adivinhações. Até a magia acabar, o alvo fica imune a dano psíquico, à condição de encantado e a qualquer efeito que tente ler os seus pensamentos ou emoções.',
    componentes: ['V', 'S'],
    tempo_conjuracao: '1 ação',
    alcance: 'Toque',
    duracao: '24 horas'
  },
  {
    id: 'semiplano',
    nome: 'Semiplano',
    circulo: 8,
    escola: 'Conjuração',
    classes: ['bruxo', 'mago'],
    descricao: 'Você cria uma porta dimensional em uma superfície plana que se abre para um semiplano vazio à sua escolha (uma sala de pedra com 9 metros em cada dimensão). A porta dura por 1 hora e qualquer criatura pode entrar ou olhar para o semiplano.',
    componentes: ['S'],
    tempo_conjuracao: '1 ação',
    alcance: '1,5 metro',
    duracao: '1 hora'
  },
  {
    id: 'controlar_o_clima',
    nome: 'Controlar o Clima',
    circulo: 8,
    escola: 'Transmutação',
    classes: ['clerigo', 'druida', 'mago'],
    concentracao: true,
    descricao: 'Você altera drasticamente as condições climáticas num raio de 8 quilómetros ao seu redor. Pode mudar gradualmente a precipitação, a temperatura e a força do vento ao longo do tempo conforme as tabelas de clima.',
    componentes: ['V', 'S', 'M'],
    material: 'uma queima de incenso e um pouco de água límpida',
    tempo_conjuracao: '10 minutos',
    alcance: 'Pessoal (raio de 8 km)',
    duracao: 'Concentração, até 8 horas'
  },
]