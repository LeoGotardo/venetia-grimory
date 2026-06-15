import type { Magia } from '../types'

export const MAGIAS7: Magia[] = [
  // ─── CÍRCULO 7 ────────────────────────────────────────────────────────────
  {
    id: 'bola_de_fogo_controlavel',
    nome: 'Bola de Fogo Controlável',
    circulo: 7,
    escola: 'Evocação',
    classes: ['feiticeiro', 'mago'],
    concentracao: true,
    descricao: 'Uma conta de luz brilhante surge num ponto à sua escolha dentro do alcance. Pode conter a explosão por até 1 minuto, acumulando energia. Quando a magia termina ou a sua concentração quebra, a conta explode em chamas, causando dano massivo que aumenta a cada turno que foi mantida.',
    componentes: ['V', 'S', 'M'],
    material: 'uma pequena bola de guano de morcego e enxofre',
    tempo_conjuracao: '1 ação',
    alcance: '45 metros',
    duracao: 'Concentração, até 1 minuto',
    dano: '12d6 (base) + 1d6 por turno de concentração',
    tipo_dano: 'Fogo',
    salvaguarda: 'Destreza'
  },
  {
    id: 'palavra_de_poder_dor',
    nome: 'Palavra de Poder: Dor',
    circulo: 7,
    escola: 'Encantamento',
    classes: ['bruxo', 'feiticeiro', 'mago'],
    descricao: 'Você profere uma palavra de poder capaz de sobrecarregar a mente de uma criatura visível dentro do alcance com uma dor excruciante. Se o alvo tiver 100 pontos de vida ou menos, o seu deslocamento é reduzido e ele tem desvantagem em jogadas de ataque, testes e salvaguardas.',
    componentes: ['V'],
    tempo_conjuracao: '1 ação',
    alcance: '18 metros',
    duracao: '1 minuto',
    salvaguarda: 'Constituição'
  },
  {
    id: 'resurreicao',
    nome: 'Ressurreição',
    circulo: 7,
    escola: 'Necromancia',
    classes: ['clerigo', 'bardo'],
    descricao: 'Você toca uma criatura que tenha morrido há não mais de um século. Desde que a alma esteja livre e disposta, o alvo retorna à vida com todos os seus pontos de vida. Esta magia cura feridas profundas e regenera membros perdidos.',
    componentes: ['V', 'S', 'M'],
    material: 'um diamante valendo pelo menos 1.000 po, consumido pela magia',
    tempo_conjuracao: '1 hora',
    alcance: 'Toque',
    duracao: 'Instantânea'
  },
  {
    id: 'inverter_a_gravidade',
    nome: 'Inverter a Gravidade',
    circulo: 7,
    escola: 'Transmutação',
    classes: ['druida', 'feiticeiro', 'mago'],
    concentracao: true,
    descricao: 'Você inverte a gravidade numa coluna de 15 metros de raio por 30 metros de altura centradada num ponto. Todas as criaturas e objetos que não estejam fixos ao chão caem para cima até o topo da área da magia.',
    componentes: ['V', 'S', 'M'],
    material: 'uma pitada de ferro imantado e algumas limalhas de ferro',
    tempo_conjuracao: '1 ação',
    alcance: '30 metros',
    duracao: 'Concentração, até 1 minuto',
    salvaguarda: 'Destreza (para se agarrar a algo fixo)'
  },
  {
    id: 'projetar_imagem',
    nome: 'Projetar Imagem',
    circulo: 7,
    escola: 'Ilusão',
    classes: ['bardo', 'mago'],
    concentracao: true,
    descricao: 'Você cria uma cópia ilusória de si mesmo que dura pela duração da magia. Pode ver através dos olhos da cópia, ouvir através dos seus ouvidos e falar através dela a partir de qualquer distância dentro do mesmo plano.',
    componentes: ['V', 'S', 'M'],
    material: 'uma pequena réplica de si mesmo feita de materiais nobres valendo 5 po',
    tempo_conjuracao: '1 ação',
    alcance: 'Interplanetário',
    duracao: 'Concentração, até 1 dia'
  },
  {
    id: 'muralha_prismatica',
    nome: 'Prisma de Força',
    circulo: 7,
    escola: 'Abjuração',
    classes: ['mago'],
    descricao: 'Você cria uma muralha cintilante composta por sete camadas verticais multicoloridas. Cada camada tem uma cor do arco-íris, bloqueia ataques e magias, e causa um efeito ou tipo de dano destrutivo diferente a quem tentar passar por ela.',
    componentes: ['V', 'S'],
    tempo_conjuracao: '1 ação',
    alcance: '18 metros',
    duracao: '10 minutos'
  },
]