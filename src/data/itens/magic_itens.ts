import type { ItemMagico } from './types'

export const ITENS_MAGICOS: ItemMagico[] = [
  // ─── PERGAMINHOS MÁGICOS ──────────────────────────────────────────────────
  {
    tipo_item: 'item_magico',
    id: 'pergaminho_truque',
    nome: 'Pergaminho de Truque',
    categoria: 'Pergaminho',
    raridade: 'Comum',
    preco: '10 po',
    circulo: 0,
    id_magia: '',
    descricao: 'Conjurar do pergaminho requer o tempo normal da magia e consome o item. Qualquer conjurador pode ler truques da sua lista de classe.'
  },
  {
    tipo_item: 'item_magico',
    id: 'pergaminho_circulo_1',
    nome: 'Pergaminho de 1º Círculo',
    categoria: 'Pergaminho',
    raridade: 'Comum',
    preco: '10 po',
    circulo: 1,
    id_magia: '',
    descricao: 'Se a magia estiver na lista da sua classe, pode ser lida e conjurada sem gastar componentes ou espaços de magia.'
  },
  {
    tipo_item: 'item_magico',
    id: 'pergaminho_circulo_2',
    nome: 'Pergaminho de 2º Círculo',
    categoria: 'Pergaminho',
    raridade: 'Incomum',
    preco: '30 po',
    circulo: 2,
    id_magia: '',
    descricao: 'Se a magia for de círculo superior ao que você conjura normalmente, é necessário um teste de atributo mágico para lê-la com êxito.'
  },
  {
    tipo_item: 'item_magico',
    id: 'pergaminho_circulo_3',
    nome: 'Pergaminho de 3º Círculo',
    categoria: 'Pergaminho',
    raridade: 'Incomum',
    preco: '90 po',
    circulo: 3,
    id_magia: '',
    descricao: 'Após a leitura das runas místicas, o pergaminho desfaz-se em poeira e o efeito da magia é ativado imediatamente.'
  },
  {
    tipo_item: 'item_magico',
    id: 'pergaminho_circulo_4',
    nome: 'Pergaminho de 4º Círculo',
    categoria: 'Pergaminho',
    raridade: 'Raro',
    preco: '270 po',
    circulo: 4,
    id_magia: '',
    descricao: 'Item valioso que permite a conjuradores expandirem o seu repertório tático com magias de alto impacto em momentos críticos.'
  },
  {
    tipo_item: 'item_magico',
    id: 'pergaminho_circulo_5',
    nome: 'Pergaminho de 5º Círculo',
    categoria: 'Pergaminho',
    raridade: 'Raro',
    preco: '810 po',
    circulo: 5,
    id_magia: '',
    descricao: 'Armazena energias arcanas ou divinas complexas, prontas para serem disparadas por conjuradores experientes.'
  },
  {
    tipo_item: 'item_magico',
    id: 'pergaminho_circulo_6',
    nome: 'Pergaminho de 6º Círculo',
    categoria: 'Pergaminho',
    raridade: 'Muito Raro',
    preco: '2430 po',
    circulo: 6,
    id_magia: '',
    descricao: 'Raríssimo, encontrado apenas em tesouros guardados por grandes ameaças ou em ruínas de civilizações extintas.'
  },
  {
    tipo_item: 'item_magico',
    id: 'pergaminho_circulo_7',
    nome: 'Pergaminho de 7º Círculo',
    categoria: 'Pergaminho',
    raridade: 'Muito Raro',
    preco: '7290 po',
    circulo: 7,
    id_magia: '',
    descricao: 'Concentra um poder devastador ou magias de alteração da realidade que poucos mortais conseguem dominar sem treinamento extenso.'
  },
  {
    tipo_item: 'item_magico',
    id: 'pergaminho_circulo_8',
    nome: 'Pergaminho de 8º Círculo',
    categoria: 'Pergaminho',
    raridade: 'Lendário',
    preco: '21870 po',
    circulo: 8,
    id_magia: '',
    descricao: 'Relíquia lendária capaz de conjurar rituais de controle climático total ou destruição em massa com uma única leitura.'
  },
  {
    tipo_item: 'item_magico',
    id: 'pergaminho_circulo_9',
    nome: 'Pergaminho de 9º Círculo',
    categoria: 'Pergaminho',
    raridade: 'Lendário',
    preco: '65610 po',
    circulo: 9,
    id_magia: '',
    descricao: 'O ápice do poder em forma de pergaminho. Permite disparar magias como Parar o Tempo ou Desejo uma única vez antes de se desfazer.'
  },

  // ─── POÇÕES E CONSUMÍVEIS ─────────────────────────────────────────────────
  {
    tipo_item: 'item_magico',
    id: 'pocao_de_cura',
    nome: 'Poção de Cura',
    categoria: 'Poção',
    raridade: 'Comum',
    preco: '50 po',
    efeito: '2d4 + 2 PV',
    descricao: 'Líquido vermelho cintilante que borbulha levemente. Beber ou administrar restaura pontos de vida imediatamente ao alvo.'
  },
  {
    tipo_item: 'item_magico',
    id: 'pocao_de_cura_maior',
    nome: 'Poção de Cura Maior',
    categoria: 'Poção',
    raridade: 'Incomum',
    preco: '150 po',
    efeito: '4d4 + 4 PV',
    descricao: 'Versão mais concentrada e espessa do elixir de cura, destinada a tratar ferimentos graves sofridos em combate intenso.'
  },
  {
    tipo_item: 'item_magico',
    id: 'pocao_de_cura_superior',
    nome: 'Poção de Cura Superior',
    categoria: 'Poção',
    raridade: 'Raro',
    preco: '270 po',
    efeito: '8d4 + 8 PV',
    descricao: 'Elixir de alto poder curativo de cor vermelho-escuro quase opaco. Restaura ferimentos que poções comuns não conseguem tratar por completo.'
  },
  {
    tipo_item: 'item_magico',
    id: 'pocao_de_cura_suprema',
    nome: 'Poção de Cura Suprema',
    categoria: 'Poção',
    raridade: 'Muito Raro',
    preco: '1350 po',
    efeito: '10d4 + 20 PV',
    descricao: 'O mais poderoso elixir curativo mundano existente, de cor carmesim intensa e brilhante. Capaz de salvar heróis à beira da morte.'
  },

  // ─── ITENS DE SINTONIA ────────────────────────────────────────────────────
  {
    tipo_item: 'item_magico',
    id: 'anel_de_protecao',
    nome: 'Anel de Proteção',
    categoria: 'Anel',
    raridade: 'Incomum',
    preco: '2000 po',
    sintonia: true,
    descricao: 'Anel de ouro gravado com runas protetoras. Enquanto vestido, concede +1 na Classe de Armadura e em todas as salvaguardas.'
  },
  {
    tipo_item: 'item_magico',
    id: 'capa_de_protecao',
    nome: 'Capa de Proteção',
    categoria: 'Vestuário',
    raridade: 'Incomum',
    preco: '1500 po',
    sintonia: true,
    descricao: 'Capa com bordados arcanos que se movem levemente mesmo sem vento. Concede +1 na Classe de Armadura e em todas as salvaguardas.'
  },
  {
    tipo_item: 'item_magico',
    id: 'botas_aladas',
    nome: 'Botas Aladas',
    categoria: 'Calçado',
    raridade: 'Incomum',
    preco: '4000 po',
    sintonia: true,
    descricao: 'Botas com asas decorativas nos calcanhares que ganham vida ao ser ativadas. Concedem voo igual ao deslocamento terrestre por até 4 horas por dia.'
  },
  {
    tipo_item: 'item_magico',
    id: 'pedra_da_sorte',
    nome: 'Pedra da Sorte',
    categoria: 'Maravilha',
    raridade: 'Incomum',
    preco: '4500 po',
    sintonia: true,
    descricao: 'Seixo polido que vibra suavemente ao toque. Enquanto carregada, concede +1 em todos os testes de atributo e salvaguardas.'
  },
  {
    tipo_item: 'item_magico',
    id: 'botas_de_velocidade',
    nome: 'Botas de Velocidade',
    categoria: 'Calçado',
    raridade: 'Raro',
    preco: '4000 po',
    sintonia: true,
    descricao: 'Botas com solas de metal gravadas com runas de celeridade. Ativadas com ação bônus, dobram o deslocamento e permitem ação de Disparada gratuita por 1 minuto.'
  },
  {
    tipo_item: 'item_magico',
    id: 'colar_de_bolas_de_fogo',
    nome: 'Colar de Bolas de Fogo',
    categoria: 'Colar',
    raridade: 'Raro',
    preco: '3000 po',
    descricao: 'Colar com esferas de âmbar alaranjado. Cada esfera pode ser removida e arremessada até 27 m, explodindo como Bola de Fogo (CD 15) ao impacto. Possui 3d6 esferas.'
  },
  {
    tipo_item: 'item_magico',
    id: 'manto_da_invisibilidade',
    nome: 'Manto da Invisibilidade',
    categoria: 'Vestuário',
    raridade: 'Lendário',
    preco: '75000 po',
    sintonia: true,
    descricao: 'Tecido costurado com fios de névoa e luz distorcida. Puxar o capuz concede invisibilidade completa por até 2 horas por dia (em parcelas de 1 minuto).'
  }
]
