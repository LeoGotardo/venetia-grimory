import type { Spell } from '../types'

export const SPELLS8: Spell[] = [
  // ─── CÍRCULO 8 ────────────────────────────────────────────────────────────
  {
    id: 'explosao_solar',
    name: 'Explosão Solar',
    level: 8,
    school: 'Evocação',
    classes: ['clerigo', 'druida', 'feiticeiro', 'mago'],
    description: 'Luz solar brilhante irrompe num raio de 18 metros centrado num ponto à sua escolha dentro do alcance. Cada criatura na área deve fazer uma salvaguarda; se falhar, sofre dano radiante massivo e fica cega por 1 minuto. Mortos-vivos e limos têm desvantagem nesta salvaguarda.',
    componentes: ['V', 'S', 'M'],
    material: 'uma lupa e uma gema de opala valendo pelo menos 100 po',
    casting_time: '1 ação',
    range: '45 metros',
    duration: 'Instantânea',
    damage: '12d6',
    damage_type: 'Radiante',
    save: 'Constituição'
  },
  {
    id: 'palavra_de_poder_atordoar',
    name: 'Palavra de Poder: Atordoar',
    level: 8,
    school: 'Encantamento',
    classes: ['bardo', 'bruxo', 'feiticeiro', 'mago'],
    description: 'Você profere uma palavra de poder capaz de sobrecarregar a mente de uma criatura que possa ver dentro do alcance. Se o alvo tiver 150 pontos de vida ou menos, fica atordoado. O alvo pode fazer uma salvaguarda no final de cada um dos seus turnos para encerrar o efeito.',
    componentes: ['V'],
    casting_time: '1 ação',
    range: '18 metros',
    duration: 'Instantânea',
    save: 'Constituição'
  },
  {
    id: 'terremoto',
    name: 'Terremoto',
    level: 8,
    school: 'Evocação',
    classes: ['clerigo', 'druida'],
    concentration: true,
    description: 'Você cria um tremor devastador no solo num raio de 30 metros centrado num ponto dentro do alcance. O tremor derruba criaturas, abre fendas profundas no chão e causa dano massivo a estruturas ou edifícios na área.',
    componentes: ['V', 'S', 'M'],
    material: 'um pouco de terra e alguns seixos de rocha',
    casting_time: '1 ação',
    range: '150 metros',
    duration: 'Concentração, até 1 minuto',
    save: 'Destreza'
  },
  {
    id: 'mente_em_branco',
    name: 'Mente em Branco',
    level: 8,
    school: 'Abjuração',
    classes: ['bardo', 'mago'],
    description: 'Você confere imunidade total a uma criatura voluntária contra efeitos psíquicos e adivinhações. Até a magia acabar, o alvo fica imune a dano psíquico, à condição de encantado e a qualquer efeito que tente ler os seus pensamentos ou emoções.',
    componentes: ['V', 'S'],
    casting_time: '1 ação',
    range: 'Toque',
    duration: '24 horas'
  },
  {
    id: 'semiplano',
    name: 'Semiplano',
    level: 8,
    school: 'Conjuração',
    classes: ['bruxo', 'mago'],
    description: 'Você cria uma porta dimensional em uma superfície plana que se abre para um semiplano vazio à sua escolha (uma sala de pedra com 9 metros em cada dimensão). A porta dura por 1 hora e qualquer criatura pode entrar ou olhar para o semiplano.',
    componentes: ['S'],
    casting_time: '1 ação',
    range: '1,5 metro',
    duration: '1 hora'
  },
  {
    id: 'controlar_o_clima',
    name: 'Controlar o Clima',
    level: 8,
    school: 'Transmutação',
    classes: ['clerigo', 'druida', 'mago'],
    concentration: true,
    description: 'Você altera drasticamente as condições climáticas num raio de 8 quilómetros ao seu redor. Pode mudar gradualmente a precipitação, a temperatura e a força do vento ao longo do tempo conforme as tabelas de clima.',
    componentes: ['V', 'S', 'M'],
    material: 'uma queima de incenso e um pouco de água límpida',
    casting_time: '10 minutos',
    range: 'Pessoal (raio de 8 km)',
    duration: 'Concentração, até 8 horas'
  },
]