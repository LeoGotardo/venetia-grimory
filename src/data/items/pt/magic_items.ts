import type { MagicItem } from '../types'

export const MAGIC_ITEMS: MagicItem[] = [
  // ─── PERGAMINHOS MÁGICOS ──────────────────────────────────────────────────
  {
    item_type: 'item_magico',
    id: 'pergaminho_truque',
    name: 'Pergaminho de Truque',
    category: 'Pergaminho',
    rarity: 'Comum',
    price: '10 po',
    level: 0,
    spell_id: '',
    description: 'Conjurar do pergaminho requer o tempo normal da magia e consome o item. Qualquer conjurador pode ler truques da sua lista de classe.'
  },
  {
    item_type: 'item_magico',
    id: 'pergaminho_circulo_1',
    name: 'Pergaminho de 1º Círculo',
    category: 'Pergaminho',
    rarity: 'Comum',
    price: '10 po',
    level: 1,
    spell_id: '',
    description: 'Se a magia estiver na lista da sua classe, pode ser lida e conjurada sem gastar componentes ou espaços de magia.'
  },
  {
    item_type: 'item_magico',
    id: 'pergaminho_circulo_2',
    name: 'Pergaminho de 2º Círculo',
    category: 'Pergaminho',
    rarity: 'Incomum',
    price: '30 po',
    level: 2,
    spell_id: '',
    description: 'Se a magia for de círculo superior ao que você conjura normalmente, é necessário um teste de atributo mágico para lê-la com êxito.'
  },
  {
    item_type: 'item_magico',
    id: 'pergaminho_circulo_3',
    name: 'Pergaminho de 3º Círculo',
    category: 'Pergaminho',
    rarity: 'Incomum',
    price: '90 po',
    level: 3,
    spell_id: '',
    description: 'Após a leitura das runas místicas, o pergaminho desfaz-se em poeira e o efeito da magia é ativado imediatamente.'
  },
  {
    item_type: 'item_magico',
    id: 'pergaminho_circulo_4',
    name: 'Pergaminho de 4º Círculo',
    category: 'Pergaminho',
    rarity: 'Raro',
    price: '270 po',
    level: 4,
    spell_id: '',
    description: 'Item valioso que permite a conjuradores expandirem o seu repertório tático com magias de alto impacto em momentos críticos.'
  },
  {
    item_type: 'item_magico',
    id: 'pergaminho_circulo_5',
    name: 'Pergaminho de 5º Círculo',
    category: 'Pergaminho',
    rarity: 'Raro',
    price: '810 po',
    level: 5,
    spell_id: '',
    description: 'Armazena energias arcanas ou divinas complexas, prontas para serem disparadas por conjuradores experientes.'
  },
  {
    item_type: 'item_magico',
    id: 'pergaminho_circulo_6',
    name: 'Pergaminho de 6º Círculo',
    category: 'Pergaminho',
    rarity: 'Muito Raro',
    price: '2430 po',
    level: 6,
    spell_id: '',
    description: 'Raríssimo, encontrado apenas em tesouros guardados por grandes ameaças ou em ruínas de civilizações extintas.'
  },
  {
    item_type: 'item_magico',
    id: 'pergaminho_circulo_7',
    name: 'Pergaminho de 7º Círculo',
    category: 'Pergaminho',
    rarity: 'Muito Raro',
    price: '7290 po',
    level: 7,
    spell_id: '',
    description: 'Concentra um poder devastador ou magias de alteração da realidade que poucos mortais conseguem dominar sem treinamento extenso.'
  },
  {
    item_type: 'item_magico',
    id: 'pergaminho_circulo_8',
    name: 'Pergaminho de 8º Círculo',
    category: 'Pergaminho',
    rarity: 'Lendário',
    price: '21870 po',
    level: 8,
    spell_id: '',
    description: 'Relíquia lendária capaz de conjurar rituais de controle climático total ou destruição em massa com uma única leitura.'
  },
  {
    item_type: 'item_magico',
    id: 'pergaminho_circulo_9',
    name: 'Pergaminho de 9º Círculo',
    category: 'Pergaminho',
    rarity: 'Lendário',
    price: '65610 po',
    level: 9,
    spell_id: '',
    description: 'O ápice do poder em forma de pergaminho. Permite disparar magias como Parar o Tempo ou Desejo uma única vez antes de se desfazer.'
  },

  // ─── POÇÕES E CONSUMÍVEIS ─────────────────────────────────────────────────
  {
    item_type: 'item_magico',
    id: 'pocao_de_cura',
    name: 'Poção de Cura',
    category: 'Poção',
    rarity: 'Comum',
    price: '50 po',
    effect: '2d4 + 2 PV',
    description: 'Líquido vermelho cintilante que borbulha levemente. Beber ou administrar restaura pontos de vida imediatamente ao alvo.'
  },
  {
    item_type: 'item_magico',
    id: 'pocao_de_cura_maior',
    name: 'Poção de Cura Maior',
    category: 'Poção',
    rarity: 'Incomum',
    price: '150 po',
    effect: '4d4 + 4 PV',
    description: 'Versão mais concentrada e espessa do elixir de cura, destinada a tratar ferimentos graves sofridos em combate intenso.'
  },
  {
    item_type: 'item_magico',
    id: 'pocao_de_cura_superior',
    name: 'Poção de Cura Superior',
    category: 'Poção',
    rarity: 'Raro',
    price: '270 po',
    effect: '8d4 + 8 PV',
    description: 'Elixir de alto poder curativo de cor vermelho-escuro quase opaco. Restaura ferimentos que poções comuns não conseguem tratar por completo.'
  },
  {
    item_type: 'item_magico',
    id: 'pocao_de_cura_suprema',
    name: 'Poção de Cura Suprema',
    category: 'Poção',
    rarity: 'Muito Raro',
    price: '1350 po',
    effect: '10d4 + 20 PV',
    description: 'O mais poderoso elixir curativo mundano existente, de cor carmesim intensa e brilhante. Capaz de salvar heróis à beira da morte.'
  },

  // ─── ITENS DE SINTONIA ────────────────────────────────────────────────────
  {
    item_type: 'item_magico',
    id: 'anel_de_protecao',
    name: 'Anel de Proteção',
    category: 'Anel',
    rarity: 'Incomum',
    price: '2000 po',
    attunement: true,
    description: 'Anel de ouro gravado com runas protetoras. Enquanto vestido, concede +1 na Classe de Armadura e em todas as salvaguardas.'
  },
  {
    item_type: 'item_magico',
    id: 'capa_de_protecao',
    name: 'Capa de Proteção',
    category: 'Vestuário',
    rarity: 'Incomum',
    price: '1500 po',
    attunement: true,
    description: 'Capa com bordados arcanos que se movem levemente mesmo sem vento. Concede +1 na Classe de Armadura e em todas as salvaguardas.'
  },
  {
    item_type: 'item_magico',
    id: 'botas_aladas',
    name: 'Botas Aladas',
    category: 'Calçado',
    rarity: 'Incomum',
    price: '4000 po',
    attunement: true,
    description: 'Botas com asas decorativas nos calcanhares que ganham vida ao ser ativadas. Concedem voo igual ao deslocamento terrestre por até 4 horas por dia.'
  },
  {
    item_type: 'item_magico',
    id: 'pedra_da_sorte',
    name: 'Pedra da Sorte',
    category: 'Maravilha',
    rarity: 'Incomum',
    price: '4500 po',
    attunement: true,
    description: 'Seixo polido que vibra suavemente ao toque. Enquanto carregada, concede +1 em todos os testes de atributo e salvaguardas.'
  },
  {
    item_type: 'item_magico',
    id: 'botas_de_velocidade',
    name: 'Botas de Velocidade',
    category: 'Calçado',
    rarity: 'Raro',
    price: '4000 po',
    attunement: true,
    description: 'Botas com solas de metal gravadas com runas de celeridade. Ativadas com ação bônus, dobram o deslocamento e permitem ação de Disparada gratuita por 1 minuto.'
  },
  {
    item_type: 'item_magico',
    id: 'colar_de_bolas_de_fogo',
    name: 'Colar de Bolas de Fogo',
    category: 'Colar',
    rarity: 'Raro',
    price: '3000 po',
    description: 'Colar com esferas de âmbar alaranjado. Cada esfera pode ser removida e arremessada até 27 m, explodindo como Bola de Fogo (CD 15) ao impacto. Possui 3d6 esferas.'
  },
  {
    item_type: 'item_magico',
    id: 'manto_da_invisibilidade',
    name: 'Manto da Invisibilidade',
    category: 'Vestuário',
    rarity: 'Lendário',
    price: '75000 po',
    attunement: true,
    description: 'Tecido costurado com fios de névoa e luz distorcida. Puxar o capuz concede invisibilidade completa por até 2 horas por dia (em parcelas de 1 minuto).'
  }
]
