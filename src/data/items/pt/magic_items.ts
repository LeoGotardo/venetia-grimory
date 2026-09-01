import type { MagicItem } from '../types'

/**
 * Catálogo de itens mágicos do Livro do Mestre 2024.
 *
 * `price` usa a tabela oficial de Valor de Item Mágico por Raridade
 * (Comum 100 po, Incomum 400, Raro 4.000, Muito Raro 40.000, Lendário 200.000),
 * pela metade para consumíveis. Artefatos e itens de raridade variável não têm
 * valor definido e ficam com "—".
 *
 * Os ids das entradas antigas (pergaminhos, poções de cura e os seis itens
 * originais) foram mantidos em português para não invalidar fichas salvas; as
 * demais usam o identificador em inglês do próprio item.
 */
export const MAGIC_ITEMS: MagicItem[] = [
  // ─── PERGAMINHOS ───────────────────────────────────────────────────────────
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
    rarity: 'Muito Raro',
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
  {
    item_type: 'item_magico',
    id: 'scroll_of_protection',
    name: 'Pergaminho da Proteção',
    category: 'Pergaminho',
    rarity: 'Raro',
    price: '2000 po',
    description: 'Barra um tipo de criatura de entrar num círculo de 1,5 m por 5 minutos.'
  },
  {
    item_type: 'item_magico',
    id: 'scroll_of_titan_summoning',
    name: 'Pergaminho de Invocação de Titã',
    category: 'Pergaminho',
    rarity: 'Lendário',
    price: '100000 po',
    description: 'Invoca um titã — que não obedece você e age por conta própria.'
  },

  // ─── POÇÕES E CONSUMÍVEIS ──────────────────────────────────────────────────
  {
    item_type: 'item_magico',
    id: 'elixir_of_health',
    name: 'Elixir da Saúde',
    category: 'Poção',
    rarity: 'Raro',
    price: '2000 po',
    description: 'Cura Doente, Cego, Surdo, Paralisado e Envenenado, e remove doenças.'
  },
  {
    item_type: 'item_magico',
    id: 'philter_of_love',
    name: 'Filtro do Amor',
    category: 'Poção',
    rarity: 'Incomum',
    price: '200 po',
    description: 'Por 1 hora, você fica Enfeitiçado pela primeira criatura que vir.'
  },
  {
    item_type: 'item_magico',
    id: 'potion_of_animal_friendship',
    name: 'Poção da Amizade Animal',
    category: 'Poção',
    rarity: 'Incomum',
    price: '200 po',
    description: 'Conjura Amizade Animal (CD 13) à vontade por 1 hora.'
  },
  {
    item_type: 'item_magico',
    id: 'potion_of_clairvoyance',
    name: 'Poção da Clarividência',
    category: 'Poção',
    rarity: 'Raro',
    price: '2000 po',
    description: 'Efeito de Clarividência.'
  },
  {
    item_type: 'item_magico',
    id: 'potion_of_comprehension',
    name: 'Poção da Compreensão',
    category: 'Poção',
    rarity: 'Comum',
    price: '50 po',
    description: 'Efeito de Compreender Idiomas por 1 hora.'
  },
  {
    item_type: 'item_magico',
    id: 'potion_of_diminution',
    name: 'Poção da Diminuição',
    category: 'Poção',
    rarity: 'Raro',
    price: '2000 po',
    description: 'Efeito de redução de Reduzir/Ampliar por 1d4 horas.'
  },
  {
    item_type: 'item_magico',
    id: 'potion_of_climbing',
    name: 'Poção da Escalada',
    category: 'Poção',
    rarity: 'Comum',
    price: '50 po',
    description: 'Deslocamento de escalada e vantagem em Atletismo para escalar, por 1 hora.'
  },
  {
    item_type: 'item_magico',
    id: 'potion_of_gaseous_form',
    name: 'Poção da Forma Gasosa',
    category: 'Poção',
    rarity: 'Raro',
    price: '2000 po',
    description: 'Efeito de Forma Gasosa por 1 hora, sem concentração.'
  },
  {
    item_type: 'item_magico',
    id: 'potion_of_giant_strength',
    name: 'Poção da Força de Gigante',
    category: 'Poção',
    rarity: 'Varia',
    price: '—',
    description: 'Força fixa por 1 hora conforme o gigante. Raridade varia da colina à tempestade.'
  },
  {
    item_type: 'item_magico',
    id: 'potion_of_invisibility',
    name: 'Poção da Invisibilidade',
    category: 'Poção',
    rarity: 'Raro',
    price: '2000 po',
    description: 'Invisível por 1 hora; o efeito acaba se você atacar ou conjurar.'
  },
  {
    item_type: 'item_magico',
    id: 'potion_of_greater_invisibility',
    name: 'Poção da Invisibilidade Maior',
    category: 'Poção',
    rarity: 'Muito Raro',
    price: '20000 po',
    description: 'Invisível por 1 minuto, mesmo atacando ou conjurando.'
  },
  {
    item_type: 'item_magico',
    id: 'potion_of_invulnerability',
    name: 'Poção da Invulnerabilidade',
    category: 'Poção',
    rarity: 'Raro',
    price: '2000 po',
    description: 'Resistência a todo tipo de dano por 1 minuto.'
  },
  {
    item_type: 'item_magico',
    id: 'potion_of_mind_reading',
    name: 'Poção da Leitura Mental',
    category: 'Poção',
    rarity: 'Raro',
    price: '2000 po',
    description: 'Efeito de Detectar Pensamentos (CD 13).'
  },
  {
    item_type: 'item_magico',
    id: 'potion_of_longevity',
    name: 'Poção da Longevidade',
    category: 'Poção',
    rarity: 'Muito Raro',
    price: '20000 po',
    description: 'Reduz sua idade em 1d6+6 anos — mas cada dose pode envelhecê-lo de vez.'
  },
  {
    item_type: 'item_magico',
    id: 'potion_of_resistance',
    name: 'Poção da Resistência',
    category: 'Poção',
    rarity: 'Incomum',
    price: '200 po',
    description: 'Resistência a um tipo de dano por 1 hora.'
  },
  {
    item_type: 'item_magico',
    id: 'potion_of_water_breathing',
    name: 'Poção da Respiração Aquática',
    category: 'Poção',
    rarity: 'Incomum',
    price: '200 po',
    description: 'Respira debaixo d’água por 1 hora.'
  },
  {
    item_type: 'item_magico',
    id: 'potion_of_speed',
    name: 'Poção da Velocidade',
    category: 'Poção',
    rarity: 'Muito Raro',
    price: '20000 po',
    description: 'Efeito de Acelerar por 1 minuto, sem concentração.'
  },
  {
    item_type: 'item_magico',
    id: 'potion_of_vitality',
    name: 'Poção da Vitalidade',
    category: 'Poção',
    rarity: 'Muito Raro',
    price: '20000 po',
    description: 'Remove exaustão e doenças e maximiza a cura dos Dados de Vida por 24 horas.'
  },
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
  {
    item_type: 'item_magico',
    id: 'potion_of_growth',
    name: 'Poção do Crescimento',
    category: 'Poção',
    rarity: 'Incomum',
    price: '200 po',
    description: 'Efeito de ampliação de Reduzir/Ampliar por 1d4 horas.'
  },
  {
    item_type: 'item_magico',
    id: 'potion_of_heroism',
    name: 'Poção do Heroísmo',
    category: 'Poção',
    rarity: 'Raro',
    price: '2000 po',
    description: '10 PV temporários e efeito de Bênção por 1 hora.'
  },
  {
    item_type: 'item_magico',
    id: 'potion_of_pugilism',
    name: 'Poção do Pugilismo',
    category: 'Poção',
    rarity: 'Incomum',
    price: '200 po',
    description: 'Por 1 minuto, seus ataques desarmados causam dano extra.'
  },
  {
    item_type: 'item_magico',
    id: 'potion_of_fire_breath',
    name: 'Poção do Sopro de Fogo',
    category: 'Poção',
    rarity: 'Incomum',
    price: '200 po',
    description: 'Três baforadas de fogo em cone de 9 m: 4d6 (CD 13 para metade).'
  },
  {
    item_type: 'item_magico',
    id: 'potion_of_poison',
    name: 'Poção do Veneno',
    category: 'Poção',
    rarity: 'Incomum',
    price: '200 po',
    description: 'Disfarçada de poção comum: 3d6 de veneno e Envenenado por 1 hora (CD 13).'
  },
  {
    item_type: 'item_magico',
    id: 'potion_of_flying',
    name: 'Poção do Voo',
    category: 'Poção',
    rarity: 'Muito Raro',
    price: '20000 po',
    description: 'Deslocamento de voo igual ao seu por 1 hora, com pairar.'
  },
  {
    item_type: 'item_magico',
    id: 'oil_of_etherealness',
    name: 'Óleo da Eterealidade',
    category: 'Poção',
    rarity: 'Raro',
    price: '2000 po',
    description: 'Leva você ao Plano Etéreo por 1 hora.'
  },
  {
    item_type: 'item_magico',
    id: 'oil_of_sharpness',
    name: 'Óleo do Afiamento',
    category: 'Poção',
    rarity: 'Muito Raro',
    price: '20000 po',
    description: 'A arma untada ganha +3 de ataque e dano por 1 hora.'
  },
  {
    item_type: 'item_magico',
    id: 'oil_of_slipperiness',
    name: 'Óleo do Escorregamento',
    category: 'Poção',
    rarity: 'Incomum',
    price: '200 po',
    description: 'Efeito de Liberdade de Movimento por 8 horas, ou uma poça de Graxa no chão.'
  },

  // ─── ANÉIS ─────────────────────────────────────────────────────────────────
  {
    item_type: 'item_magico',
    id: 'ring_of_evasion',
    name: 'Anel da Evasão',
    category: 'Anel',
    rarity: 'Raro',
    price: '4000 po',
    attunement: true,
    uses: { max: 3, recharge: 'dawn' },
    description: 'Transforma uma salvaguarda de Destreza falhada em sucesso. 3 cargas diárias.'
  },
  {
    item_type: 'item_magico',
    id: 'ring_of_animal_influence',
    name: 'Anel da Influência Animal',
    category: 'Anel',
    rarity: 'Raro',
    price: '4000 po',
    uses: { max: 3, recharge: 'dawn' },
    description: 'Amizade Animal, Medo ou Falar com Animais. 3 cargas diárias.'
  },
  {
    item_type: 'item_magico',
    id: 'ring_of_invisibility',
    name: 'Anel da Invisibilidade',
    category: 'Anel',
    rarity: 'Lendário',
    price: '200000 po',
    attunement: true,
    description: 'Fica Invisível à vontade, com uma ação bônus.'
  },
  {
    item_type: 'item_magico',
    id: 'ring_of_free_action',
    name: 'Anel da Liberdade de Ação',
    category: 'Anel',
    rarity: 'Raro',
    price: '4000 po',
    attunement: true,
    description: 'Terreno difícil não atrasa e nada pode deixá-lo Paralisado ou Contido magicamente.'
  },
  {
    item_type: 'item_magico',
    id: 'ring_of_swimming',
    name: 'Anel da Natação',
    category: 'Anel',
    rarity: 'Incomum',
    price: '400 po',
    description: 'Deslocamento de natação de 12 m.'
  },
  {
    item_type: 'item_magico',
    id: 'ring_of_feather_falling',
    name: 'Anel da Queda Suave',
    category: 'Anel',
    rarity: 'Raro',
    price: '4000 po',
    attunement: true,
    description: 'Você desce a 18 m por rodada e nunca sofre dano de queda.'
  },
  {
    item_type: 'item_magico',
    id: 'ring_of_regeneration',
    name: 'Anel da Regeneração',
    category: 'Anel',
    rarity: 'Muito Raro',
    price: '40000 po',
    attunement: true,
    description: 'Regenera 1d6 PV a cada 10 minutos e refaz membros perdidos em 1d6+1 dias.'
  },
  {
    item_type: 'item_magico',
    id: 'ring_of_resistance',
    name: 'Anel da Resistência',
    category: 'Anel',
    rarity: 'Raro',
    price: '4000 po',
    description: 'Resistência a um tipo de dano determinado pela gema do anel.'
  },
  {
    item_type: 'item_magico',
    id: 'ring_of_telekinesis',
    name: 'Anel da Telecinesia',
    category: 'Anel',
    rarity: 'Muito Raro',
    price: '40000 po',
    attunement: true,
    description: 'Conjura Telecinesia à vontade, sem componentes.'
  },
  {
    item_type: 'item_magico',
    id: 'ring_of_x_ray_vision',
    name: 'Anel da Visão de Raio X',
    category: 'Anel',
    rarity: 'Raro',
    price: '4000 po',
    attunement: true,
    description: 'Enxerga através de matéria sólida por 1 minuto — ao custo de um nível de exaustão.'
  },
  {
    item_type: 'item_magico',
    id: 'ring_of_shooting_stars',
    name: 'Anel das Estrelas Cadentes',
    category: 'Anel',
    rarity: 'Muito Raro',
    price: '40000 po',
    attunement: true,
    uses: { max: 6, recharge: 'dawn' },
    description: 'Luz do Dia, faíscas elétricas e meteoros de fogo. 6 cargas diárias.'
  },
  {
    item_type: 'item_magico',
    id: 'ring_of_water_walking',
    name: 'Anel de Andar sobre a Água',
    category: 'Anel',
    rarity: 'Incomum',
    price: '400 po',
    description: 'Você anda sobre qualquer superfície líquida como se fosse chão firme.'
  },
  {
    item_type: 'item_magico',
    id: 'ring_of_spell_storing',
    name: 'Anel de Armazenar Magias',
    category: 'Anel',
    rarity: 'Raro',
    price: '4000 po',
    attunement: true,
    description: 'Guarda até 5 círculos de magias conjuradas nele, para uso posterior.'
  },
  {
    item_type: 'item_magico',
    id: 'ring_of_elemental_command',
    name: 'Anel de Comando Elemental',
    category: 'Anel',
    rarity: 'Lendário',
    price: '200000 po',
    attunement: true,
    description: 'Domina elementais do seu plano e ganha poderes crescentes conforme você o usa.'
  },
  {
    item_type: 'item_magico',
    id: 'ring_of_djinni_summoning',
    name: 'Anel de Invocação de Djim',
    category: 'Anel',
    rarity: 'Lendário',
    price: '200000 po',
    attunement: true,
    description: 'Invoca um djim que serve você por até 1 hora, uma vez a cada 5 dias.'
  },
  {
    item_type: 'item_magico',
    id: 'anel_de_protecao',
    name: 'Anel de Proteção',
    category: 'Anel',
    rarity: 'Raro',
    price: '2000 po',
    attunement: true,
    description: 'Anel de ouro gravado com runas protetoras. Enquanto vestido, concede +1 na Classe de Armadura e em todas as salvaguardas.'
  },
  {
    item_type: 'item_magico',
    id: 'ring_of_spell_turning',
    name: 'Anel de Reflexão de Magias',
    category: 'Anel',
    rarity: 'Lendário',
    price: '200000 po',
    attunement: true,
    description: 'Vantagem contra magias de alvo único e pode refletir a magia no conjurador.'
  },
  {
    item_type: 'item_magico',
    id: 'ring_of_the_ram',
    name: 'Anel do Aríete',
    category: 'Anel',
    rarity: 'Raro',
    price: '4000 po',
    attunement: true,
    uses: { max: 3, recharge: 'dawn' },
    description: 'Dispara um carneiro de força: 2d10 e empurra 4,5 m. 3 cargas diárias.'
  },
  {
    item_type: 'item_magico',
    id: 'ring_of_warmth',
    name: 'Anel do Calor',
    category: 'Anel',
    rarity: 'Incomum',
    price: '400 po',
    attunement: true,
    description: 'Resistência a frio e conforto em temperaturas de até −45 °C.'
  },
  {
    item_type: 'item_magico',
    id: 'ring_of_mind_shielding',
    name: 'Anel do Escudo Mental',
    category: 'Anel',
    rarity: 'Incomum',
    price: '400 po',
    attunement: true,
    description: 'Imune a leitura mental e detecção de alinhamento; guarda sua alma se você morrer.'
  },
  {
    item_type: 'item_magico',
    id: 'ring_of_jumping',
    name: 'Anel do Salto',
    category: 'Anel',
    rarity: 'Incomum',
    price: '400 po',
    attunement: true,
    description: 'Conjura Pular sobre você mesmo, à vontade.'
  },
  {
    item_type: 'item_magico',
    id: 'ring_of_three_wishes',
    name: 'Anel dos Três Desejos',
    category: 'Anel',
    rarity: 'Lendário',
    price: '200000 po',
    description: 'Guarda três conjurações de Desejo; depois vira um anel comum.'
  },

  // ─── BASTÕES ───────────────────────────────────────────────────────────────
  {
    item_type: 'item_magico',
    id: 'immovable_rod',
    name: 'Bastão Imóvel',
    category: 'Bastão',
    rarity: 'Incomum',
    price: '400 po',
    description: 'Trava no ar sustentando até 4.000 kg até alguém vencer CD 30 de Força.'
  },
  {
    item_type: 'item_magico',
    id: 'rod_of_absorption',
    name: 'Bastão da Absorção',
    category: 'Bastão',
    rarity: 'Muito Raro',
    price: '40000 po',
    attunement: true,
    description: 'Absorve magias de alvo único e converte seus círculos em espaços para você.'
  },
  {
    item_type: 'item_magico',
    id: 'rod_of_resurrection',
    name: 'Bastão da Ressurreição',
    category: 'Bastão',
    rarity: 'Lendário',
    price: '200000 po',
    attunement: true,
    uses: { max: 5, recharge: 'manual' },
    description: 'Conjura Curar ou Ressurreição. 5 cargas, recuperadas lentamente.'
  },
  {
    item_type: 'item_magico',
    id: 'rod_of_security',
    name: 'Bastão da Segurança',
    category: 'Bastão',
    rarity: 'Muito Raro',
    price: '40000 po',
    description: 'Leva até 199 criaturas a um paraíso extraplanar para descansar em segurança.'
  },
  {
    item_type: 'item_magico',
    id: 'rod_of_alertness',
    name: 'Bastão do Alerta',
    category: 'Bastão',
    rarity: 'Muito Raro',
    price: '40000 po',
    attunement: true,
    description: 'Vantagem em Percepção e iniciativa, magias de detecção e uma aura defensiva.'
  },
  {
    item_type: 'item_magico',
    id: 'rod_of_rulership',
    name: 'Bastão do Governo',
    category: 'Bastão',
    rarity: 'Raro',
    price: '4000 po',
    attunement: true,
    uses: { max: 1, recharge: 'dawn' },
    description: 'Enfeitiça criaturas em 36 m (CD 15) por 8 minutos, uma vez ao dia.'
  },
  {
    item_type: 'item_magico',
    id: 'rod_of_the_pact_keeper',
    name: 'Bastão do Guardião do Pacto',
    category: 'Bastão',
    rarity: 'Varia',
    price: '—',
    attunement: true,
    uses: { max: 1, recharge: 'dawn' },
    description: 'Bônus na CD e no ataque das magias de bruxo, e recupera um espaço de pacto por dia.'
  },
  {
    item_type: 'item_magico',
    id: 'rod_of_lordly_might',
    name: 'Bastão do Poder Senhorial',
    category: 'Bastão',
    rarity: 'Lendário',
    price: '200000 po',
    attunement: true,
    description: 'Maça +3 que vira espada, machado, lança, aríete ou escada ao comando.'
  },
  {
    item_type: 'item_magico',
    id: 'tentacle_rod',
    name: 'Bastão dos Tentáculos',
    category: 'Bastão',
    rarity: 'Raro',
    price: '4000 po',
    attunement: true,
    description: 'Três tentáculos atacam a 4,5 m; três acertos reduzem o deslocamento e impõem desvantagem.'
  },

  // ─── CAJADOS ───────────────────────────────────────────────────────────────
  {
    item_type: 'item_magico',
    id: 'staff_of_healing',
    name: 'Cajado da Cura',
    category: 'Cajado',
    rarity: 'Raro',
    price: '4000 po',
    attunement: true,
    description: 'Conjura Curar Ferimentos, Restauração Menor e Palavra de Cura em Massa.'
  },
  {
    item_type: 'item_magico',
    id: 'staff_of_the_adder',
    name: 'Cajado da Naja',
    category: 'Cajado',
    rarity: 'Incomum',
    price: '400 po',
    attunement: true,
    description: 'A ponta vira cabeça de serpente viva: ataque +5 com 1d6 e 3d6 de veneno.'
  },
  {
    item_type: 'item_magico',
    id: 'staff_of_the_python',
    name: 'Cajado da Píton',
    category: 'Cajado',
    rarity: 'Incomum',
    price: '400 po',
    attunement: true,
    description: 'Arremessado, vira uma serpente constritora gigante que luta ao seu comando.'
  },
  {
    item_type: 'item_magico',
    id: 'staff_of_flowers',
    name: 'Cajado das Flores',
    category: 'Cajado',
    rarity: 'Comum',
    price: '100 po',
    uses: { max: 10, recharge: 'dawn' },
    description: 'Faz brotar uma flor natural na ponta, dez vezes por dia.'
  },
  {
    item_type: 'item_magico',
    id: 'staff_of_the_woodlands',
    name: 'Cajado das Matas',
    category: 'Cajado',
    rarity: 'Raro',
    price: '4000 po',
    attunement: true,
    description: 'Bordão +2 com magias druídicas e o poder de transformar-se numa árvore.'
  },
  {
    item_type: 'item_magico',
    id: 'staff_of_adornment',
    name: 'Cajado do Adorno',
    category: 'Cajado',
    rarity: 'Comum',
    price: '100 po',
    description: 'Faz um objeto pequeno flutuar sobre o topo e brilhar suavemente.'
  },
  {
    item_type: 'item_magico',
    id: 'staff_of_withering',
    name: 'Cajado do Definhamento',
    category: 'Cajado',
    rarity: 'Raro',
    price: '4000 po',
    attunement: true,
    description: 'Acertos podem causar 2d10 necrótico e desvantagem em testes por 1 hora.'
  },
  {
    item_type: 'item_magico',
    id: 'staff_of_charming',
    name: 'Cajado do Encanto',
    category: 'Cajado',
    rarity: 'Raro',
    price: '4000 po',
    attunement: true,
    description: 'Enfeitiçar Pessoa, Comando ou Compreender Idiomas, e absorve magias de encantamento.'
  },
  {
    item_type: 'item_magico',
    id: 'staff_of_swarming_insects',
    name: 'Cajado do Enxame de Insetos',
    category: 'Cajado',
    rarity: 'Raro',
    price: '4000 po',
    attunement: true,
    description: 'Cria um enxame que obscurece e causa 5d4 de dano perfurante por turno.'
  },
  {
    item_type: 'item_magico',
    id: 'staff_of_fire',
    name: 'Cajado do Fogo',
    category: 'Cajado',
    rarity: 'Muito Raro',
    price: '40000 po',
    attunement: true,
    description: 'Resistência a fogo e conjura Mãos Flamejantes, Esfera Flamejante e Muralha de Fogo.'
  },
  {
    item_type: 'item_magico',
    id: 'staff_of_frost',
    name: 'Cajado do Gelo',
    category: 'Cajado',
    rarity: 'Muito Raro',
    price: '40000 po',
    attunement: true,
    description: 'Resistência a frio e conjura Névoa, Muralha de Gelo, Tempestade de Granizo e Cone de Frio.'
  },
  {
    item_type: 'item_magico',
    id: 'staff_of_striking',
    name: 'Cajado do Golpe',
    category: 'Cajado',
    rarity: 'Muito Raro',
    price: '40000 po',
    attunement: true,
    description: 'Bordão +3 que pode gastar até 3 cargas por golpe, somando 1d6 de força cada.'
  },
  {
    item_type: 'item_magico',
    id: 'staff_of_the_magi',
    name: 'Cajado do Mago',
    category: 'Cajado',
    rarity: 'Lendário',
    price: '200000 po',
    attunement: true,
    uses: { max: 50, recharge: 'manual' },
    description: 'Absorve magias e conjura dezenas delas, com 50 cargas. O ápice do poder arcano.'
  },
  {
    item_type: 'item_magico',
    id: 'staff_of_power',
    name: 'Cajado do Poder',
    category: 'Cajado',
    rarity: 'Muito Raro',
    price: '40000 po',
    attunement: true,
    description: '+2 de ataque, CA e salvaguardas, várias magias e uma quebra explosiva devastadora.'
  },
  {
    item_type: 'item_magico',
    id: 'staff_of_thunder_and_lightning',
    name: 'Cajado do Trovão e Relâmpago',
    category: 'Cajado',
    rarity: 'Muito Raro',
    price: '40000 po',
    attunement: true,
    description: 'Bordão +2 com cinco propriedades: relâmpago, trovão, raio, estrondo e a combinação delas.'
  },
  {
    item_type: 'item_magico',
    id: 'staff_of_birdcalls',
    name: 'Cajado dos Cantos de Ave',
    category: 'Cajado',
    rarity: 'Comum',
    price: '100 po',
    description: 'Reproduz cantos de pássaros; um estalo pode assustar quem estiver perto.'
  },

  // ─── VARINHAS ──────────────────────────────────────────────────────────────
  {
    item_type: 'item_magico',
    id: 'wand_of_paralysis',
    name: 'Varinha da Paralisia',
    category: 'Varinha',
    rarity: 'Raro',
    price: '4000 po',
    attunement: true,
    uses: { max: 7, recharge: 'manual' },
    description: 'Raio que paralisa o alvo (CD 15) por 1 minuto. 7 cargas.'
  },
  {
    item_type: 'item_magico',
    id: 'wand_of_conducting',
    name: 'Varinha da Regência',
    category: 'Varinha',
    rarity: 'Comum',
    price: '100 po',
    description: 'Rege música mágica invisível; falhar no uso pode gerar um estrondo constrangedor.'
  },
  {
    item_type: 'item_magico',
    id: 'wand_of_web',
    name: 'Varinha da Teia',
    category: 'Varinha',
    rarity: 'Incomum',
    price: '400 po',
    attunement: true,
    uses: { max: 7, recharge: 'manual' },
    description: 'Conjura Teia (CD 15). 7 cargas.'
  },
  {
    item_type: 'item_magico',
    id: 'wand_of_wonder',
    name: 'Varinha das Maravilhas',
    category: 'Varinha',
    rarity: 'Raro',
    price: '4000 po',
    attunement: true,
    description: 'Efeito aleatório numa tabela caótica: de chuva de borboletas a Bola de Fogo.'
  },
  {
    item_type: 'item_magico',
    id: 'wand_of_fireballs',
    name: 'Varinha de Bolas de Fogo',
    category: 'Varinha',
    rarity: 'Raro',
    price: '4000 po',
    attunement: true,
    uses: { max: 7, recharge: 'manual' },
    description: 'Conjura Bola de Fogo (CD 15) em até 7º círculo. 7 cargas.'
  },
  {
    item_type: 'item_magico',
    id: 'wand_of_enemy_detection',
    name: 'Varinha de Detecção de Inimigos',
    category: 'Varinha',
    rarity: 'Raro',
    price: '4000 po',
    attunement: true,
    description: 'Aponta criaturas hostis a até 18 m, mesmo invisíveis ou disfarçadas.'
  },
  {
    item_type: 'item_magico',
    id: 'wand_of_magic_detection',
    name: 'Varinha de Detecção de Magia',
    category: 'Varinha',
    rarity: 'Incomum',
    price: '400 po',
    uses: { max: 3, recharge: 'dawn' },
    description: 'Conjura Detectar Magia. 3 cargas diárias.'
  },
  {
    item_type: 'item_magico',
    id: 'wand_of_magic_missiles',
    name: 'Varinha de Mísseis Mágicos',
    category: 'Varinha',
    rarity: 'Incomum',
    price: '400 po',
    uses: { max: 7, recharge: 'manual' },
    description: 'Conjura Mísseis Mágicos em até 7º círculo. 7 cargas.'
  },
  {
    item_type: 'item_magico',
    id: 'wand_of_pyrotechnics',
    name: 'Varinha de Pirotecnia',
    category: 'Varinha',
    rarity: 'Comum',
    price: '100 po',
    uses: { max: 7, recharge: 'manual' },
    description: 'Cria fogos de artifício inofensivos e coloridos. 7 cargas.'
  },
  {
    item_type: 'item_magico',
    id: 'wand_of_lightning_bolts',
    name: 'Varinha de Relâmpagos',
    category: 'Varinha',
    rarity: 'Raro',
    price: '4000 po',
    attunement: true,
    uses: { max: 7, recharge: 'manual' },
    description: 'Conjura Relâmpago (CD 15) em até 7º círculo. 7 cargas.'
  },
  {
    item_type: 'item_magico',
    id: 'wand_of_binding',
    name: 'Varinha do Aprisionamento',
    category: 'Varinha',
    rarity: 'Raro',
    price: '4000 po',
    attunement: true,
    description: 'Conjura Prender Pessoa ou Paralisia e dá vantagem contra ser paralisado.'
  },
  {
    item_type: 'item_magico',
    id: 'wand_of_the_war_mage_1_2_or_3',
    name: 'Varinha do Mago de Guerra +1, +2 ou +3',
    category: 'Varinha',
    rarity: 'Varia',
    price: '—',
    attunement: true,
    description: 'Bônus nos ataques mágicos e ignora meia cobertura. Incomum (+1) a Muito Raro (+3).'
  },
  {
    item_type: 'item_magico',
    id: 'wand_of_fear',
    name: 'Varinha do Medo',
    category: 'Varinha',
    rarity: 'Raro',
    price: '4000 po',
    attunement: true,
    uses: { max: 7, recharge: 'manual' },
    description: 'Comando de fuga ou cone de 18 m que amedronta (CD 15). 7 cargas.'
  },
  {
    item_type: 'item_magico',
    id: 'wand_of_polymorph',
    name: 'Varinha do Metamorfosear',
    category: 'Varinha',
    rarity: 'Muito Raro',
    price: '40000 po',
    attunement: true,
    uses: { max: 7, recharge: 'manual' },
    description: 'Conjura Metamorfose (CD 15). 7 cargas.'
  },
  {
    item_type: 'item_magico',
    id: 'wand_of_secrets',
    name: 'Varinha dos Segredos',
    category: 'Varinha',
    rarity: 'Incomum',
    price: '400 po',
    uses: { max: 3, recharge: 'manual' },
    description: 'Aponta portas e armadilhas secretas a até 9 m. 3 cargas.'
  },

  // ─── ARMAS MÁGICAS ─────────────────────────────────────────────────────────
  {
    item_type: 'item_magico',
    id: 'dagger_of_venom',
    name: 'Adaga do Veneno',
    category: 'Arma',
    rarity: 'Raro',
    price: '4000 po',
    uses: { max: 1, recharge: 'dawn' },
    description: '+1 e, uma vez ao dia, recobre a lâmina de veneno: CD 15 ou 2d10 e Envenenado.'
  },
  {
    item_type: 'item_magico',
    id: 'lute_of_thunderous_thumping',
    name: 'Alaúde do Trovão Retumbante',
    category: 'Arma',
    rarity: 'Muito Raro',
    price: '40000 po',
    description: 'Alaúde que também é arma: o acorde certo dispara uma onda trovejante.'
  },
  {
    item_type: 'item_magico',
    id: 'energy_bow',
    name: 'Arco de Energia',
    category: 'Arma',
    rarity: 'Muito Raro',
    price: '40000 po',
    attunement: true,
    description: 'Arco +2 que cria as próprias flechas de força, causando 1d6 extra de dano de força.'
  },
  {
    item_type: 'item_magico',
    id: 'oathbow',
    name: 'Arco do Juramento',
    category: 'Arma',
    rarity: 'Muito Raro',
    price: '40000 po',
    attunement: true,
    description: 'Ao jurar contra um inimigo, ganha +3d6 de dano perfurante contra ele.'
  },
  {
    item_type: 'item_magico',
    id: 'weapon_1_2_or_3',
    name: 'Arma +1, +2 ou +3',
    category: 'Arma',
    rarity: 'Varia',
    price: '—',
    description: 'Bônus de ataque e dano igual ao encantamento. Incomum (+1), Raro (+2), Muito Raro (+3).'
  },
  {
    item_type: 'item_magico',
    id: 'silvered_weapon',
    name: 'Arma Prateada',
    category: 'Arma',
    rarity: 'Comum',
    price: '100 po',
    description: 'Supera a resistência a dano não mágico de licantropos e criaturas afins.'
  },
  {
    item_type: 'item_magico',
    id: 'vicious_weapon',
    name: 'Arma Viciosa',
    category: 'Arma',
    rarity: 'Raro',
    price: '4000 po',
    description: 'Ao rolar 20 no ataque, causa 2d6 de dano extra do tipo da arma.'
  },
  {
    item_type: 'item_magico',
    id: 'adamantine_weapon',
    name: 'Arma de Adamante',
    category: 'Arma',
    rarity: 'Incomum',
    price: '400 po',
    description: 'Acertos contra objetos são sempre críticos.'
  },
  {
    item_type: 'item_magico',
    id: 'weapon_of_warning',
    name: 'Arma do Alerta',
    category: 'Arma',
    rarity: 'Incomum',
    price: '400 po',
    attunement: true,
    description: 'Você nunca é surpreendido e tem vantagem em iniciativa.'
  },
  {
    item_type: 'item_magico',
    id: 'dwarven_thrower',
    name: 'Arremessador Anão',
    category: 'Arma',
    rarity: 'Muito Raro',
    price: '40000 po',
    attunement: true,
    description: 'Martelo +3 que volta à mão quando arremessado, com dano extra contra gigantes.'
  },
  {
    item_type: 'item_magico',
    id: 'javelin_of_lightning',
    name: 'Azagaia do Relâmpago',
    category: 'Arma',
    rarity: 'Incomum',
    price: '400 po',
    description: 'Arremessada, vira um raio de 30 m: 4d6 elétrico (CD 13 para metade).'
  },
  {
    item_type: 'item_magico',
    id: 'quarterstaff_of_the_acrobat',
    name: 'Bordão do Acrobata',
    category: 'Arma',
    rarity: 'Muito Raro',
    price: '40000 po',
    attunement: true,
    description: 'Bordão +2 com acuidade, dado de dano maior e mobilidade acrobática extra.'
  },
  {
    item_type: 'item_magico',
    id: 'thunderous_greatclub',
    name: 'Cajado Trovejante',
    category: 'Arma',
    rarity: 'Muito Raro',
    price: '40000 po',
    attunement: true,
    description: 'Cada golpe estronda: dano trovejante extra e possibilidade de empurrar o alvo.'
  },
  {
    item_type: 'item_magico',
    id: 'scimitar_of_speed',
    name: 'Cimitarra da Velocidade',
    category: 'Arma',
    rarity: 'Muito Raro',
    price: '40000 po',
    attunement: true,
    description: '+2 e um ataque extra com ela como ação bônus em cada turno.'
  },
  {
    item_type: 'item_magico',
    id: 'defender',
    name: 'Defensora',
    category: 'Arma',
    rarity: 'Lendário',
    price: '200000 po',
    attunement: true,
    description: 'Espada +3 cujo bônus pode ser transferido do ataque para a CA a cada turno.'
  },
  {
    item_type: 'item_magico',
    id: 'whelm',
    name: 'Esmaga',
    category: 'Arma',
    rarity: 'Artefato',
    price: '—',
    attunement: true,
    description: 'Martelo anão artefato: volta à mão, detecta criaturas e desfere ondas de choque.'
  },
  {
    item_type: 'item_magico',
    id: 'dancing_sword',
    name: 'Espada Dançante',
    category: 'Arma',
    rarity: 'Muito Raro',
    price: '40000 po',
    attunement: true,
    description: 'Como ação bônus, a espada voa e ataca sozinha por até 4 turnos.'
  },
  {
    item_type: 'item_magico',
    id: 'sword_of_life_stealing',
    name: 'Espada Roubadora de Vida',
    category: 'Arma',
    rarity: 'Raro',
    price: '4000 po',
    attunement: true,
    description: 'Num acerto crítico, causa 3d6 necrótico extra e cura você no mesmo valor.'
  },
  {
    item_type: 'item_magico',
    id: 'moon_touched_sword',
    name: 'Espada Tocada pela Lua',
    category: 'Arma',
    rarity: 'Comum',
    price: '100 po',
    description: 'A lâmina brilha no escuro, iluminando 4,5 m de luz plena.'
  },
  {
    item_type: 'item_magico',
    id: 'vorpal_sword',
    name: 'Espada Vorpal',
    category: 'Arma',
    rarity: 'Lendário',
    price: '200000 po',
    attunement: true,
    description: '+3, ignora resistência a corte e decepa a cabeça do alvo num acerto de 20.'
  },
  {
    item_type: 'item_magico',
    id: 'sword_of_answering',
    name: 'Espada da Resposta',
    category: 'Arma',
    rarity: 'Lendário',
    price: '200000 po',
    attunement: true,
    description: '+3 e uma reação para revidar quem o acerta com o mesmo tipo de ataque.'
  },
  {
    item_type: 'item_magico',
    id: 'sword_of_vengeance',
    name: 'Espada da Vingança',
    category: 'Arma',
    rarity: 'Incomum',
    price: '400 po',
    attunement: true,
    description: '+1, mas amaldiçoada: você pode ser compelido a atacar quem o feriu.'
  },
  {
    item_type: 'item_magico',
    id: 'sword_of_kas',
    name: 'Espada de Kas',
    category: 'Arma',
    rarity: 'Artefato',
    price: '—',
    attunement: true,
    description: 'Artefato senciente e maligno, forjado para o servo mais fiel de Vecna.'
  },
  {
    item_type: 'item_magico',
    id: 'sword_of_sharpness',
    name: 'Espada do Afiamento',
    category: 'Arma',
    rarity: 'Muito Raro',
    price: '40000 po',
    attunement: true,
    description: 'Num acerto máximo, decepa membros; corta objetos e madeira como manteiga.'
  },
  {
    item_type: 'item_magico',
    id: 'sword_of_wounding',
    name: 'Espada do Ferimento',
    category: 'Arma',
    rarity: 'Raro',
    price: '4000 po',
    attunement: true,
    description: 'Feridas não se fecham: 1d4 de dano por turno até uma cura mágica ou CD 15.'
  },
  {
    item_type: 'item_magico',
    id: 'sylvan_talon',
    name: 'Garra Silvana',
    category: 'Arma',
    rarity: 'Comum',
    price: '100 po',
    attunement: true,
    description: 'Arma feérica leve que se dobra em galho e volta silenciosamente à sua mão.'
  },
  {
    item_type: 'item_magico',
    id: 'nine_lives_stealer',
    name: 'Ladra de Nove Vidas',
    category: 'Arma',
    rarity: 'Muito Raro',
    price: '40000 po',
    attunement: true,
    description: '+2 e, num crítico contra alvo com menos de 100 PV, CD 15 ou morte. 1d8+1 cargas.'
  },
  {
    item_type: 'item_magico',
    id: 'moonblade',
    name: 'Lâmina Lunar',
    category: 'Arma',
    rarity: 'Lendário',
    price: '200000 po',
    attunement: true,
    description: 'Espada élfica hereditária que ganha novos poderes conforme aceita cada portador.'
  },
  {
    item_type: 'item_magico',
    id: 'sun_blade',
    name: 'Lâmina Solar',
    category: 'Arma',
    rarity: 'Raro',
    price: '4000 po',
    attunement: true,
    description: 'Espada curta +2 de luz solar: 1d8 radiante extra contra mortos-vivos.'
  },
  {
    item_type: 'item_magico',
    id: 'luck_blade',
    name: 'Lâmina da Sorte',
    category: 'Arma',
    rarity: 'Lendário',
    price: '200000 po',
    attunement: true,
    description: 'Espada +1 que permite repetir rolagens e guarda de 1 a 3 Desejos.'
  },
  {
    item_type: 'item_magico',
    id: 'flame_tongue',
    name: 'Língua de Fogo',
    category: 'Arma',
    rarity: 'Raro',
    price: '4000 po',
    attunement: true,
    description: 'A lâmina se incendeia com uma ação bônus, somando 2d6 de dano de fogo.'
  },
  {
    item_type: 'item_magico',
    id: 'berserker_axe',
    name: 'Machado Furioso',
    category: 'Arma',
    rarity: 'Raro',
    price: '4000 po',
    attunement: true,
    description: '+1 e PV máximos aumentados, mas amaldiçoado: pode forçá-lo a atacar quem estiver por perto.'
  },
  {
    item_type: 'item_magico',
    id: 'executioner_s_axe',
    name: 'Machado do Carrasco',
    category: 'Arma',
    rarity: 'Muito Raro',
    price: '40000 po',
    description: 'Machado enorme que decapita alvos reduzidos a poucos pontos de vida.'
  },
  {
    item_type: 'item_magico',
    id: 'axe_of_the_dwarvish_lords',
    name: 'Machado dos Senhores Anões',
    category: 'Arma',
    rarity: 'Artefato',
    price: '—',
    attunement: true,
    description: 'Artefato anão: +3, visão no escuro, línguas anãs e propriedades lendárias variadas.'
  },
  {
    item_type: 'item_magico',
    id: 'frost_brand',
    name: 'Marca do Gelo',
    category: 'Arma',
    rarity: 'Muito Raro',
    price: '40000 po',
    attunement: true,
    description: '+1d6 de frio, resistência a fogo e extingue chamas próximas.'
  },
  {
    item_type: 'item_magico',
    id: 'hammer_of_thunderbolts',
    name: 'Martelo dos Trovões',
    category: 'Arma',
    rarity: 'Lendário',
    price: '200000 po',
    attunement: true,
    description: 'Marreta +1 que mata gigantes com CD 17 e, com cinto e luvas, fica ainda mais letal.'
  },
  {
    item_type: 'item_magico',
    id: 'dragon_slayer',
    name: 'Matadora de Dragões',
    category: 'Arma',
    rarity: 'Raro',
    price: '4000 po',
    description: '+1 e mais 3d6 de dano contra dragões.'
  },
  {
    item_type: 'item_magico',
    id: 'giant_slayer',
    name: 'Matadora de Gigantes',
    category: 'Arma',
    rarity: 'Raro',
    price: '4000 po',
    description: '+1 e 2d6 extra contra gigantes, que ainda podem cair Caídos.'
  },
  {
    item_type: 'item_magico',
    id: 'mace_of_disruption',
    name: 'Maça da Perturbação',
    category: 'Arma',
    rarity: 'Raro',
    price: '4000 po',
    attunement: true,
    description: '+2d6 radiante a mortos-vivos e corruptores; os mais fracos podem ser destruídos na hora.'
  },
  {
    item_type: 'item_magico',
    id: 'mace_of_smiting',
    name: 'Maça do Esmagamento',
    category: 'Arma',
    rarity: 'Raro',
    price: '4000 po',
    description: '+1 (+3 contra construtos) e dano extra devastador em acertos críticos.'
  },
  {
    item_type: 'item_magico',
    id: 'mace_of_terror',
    name: 'Maça do Terror',
    category: 'Arma',
    rarity: 'Raro',
    price: '4000 po',
    attunement: true,
    uses: { max: 3, recharge: 'dawn' },
    description: 'Aterroriza criaturas em 9 m (CD 15) por 1 minuto. 3 cargas diárias.'
  },
  {
    item_type: 'item_magico',
    id: 'ammunition_1_2_or_3',
    name: 'Munição +1, +2 ou +3',
    category: 'Arma',
    rarity: 'Varia',
    price: '—',
    description: 'Bônus de ataque e dano igual ao encantamento. Incomum (+1), Raro (+2), Muito Raro (+3).'
  },
  {
    item_type: 'item_magico',
    id: 'ammunition_of_slaying',
    name: 'Munição Assassina',
    category: 'Arma',
    rarity: 'Muito Raro',
    price: '20000 po',
    description: 'Contra o tipo de criatura escolhido: CD 17 de Constituição ou morte instantânea.'
  },
  {
    item_type: 'item_magico',
    id: 'walloping_ammunition',
    name: 'Munição Contundente',
    category: 'Arma',
    rarity: 'Comum',
    price: '50 po',
    description: 'No acerto, o alvo faz CD 10 de Força ou cai Caído.'
  },
  {
    item_type: 'item_magico',
    id: 'blackrazor',
    name: 'Navalha Negra',
    category: 'Arma',
    rarity: 'Lendário',
    price: '200000 po',
    attunement: true,
    description: 'Espada senciente devoradora de almas: +3 e absorve os PV de quem ela mata.'
  },
  {
    item_type: 'item_magico',
    id: 'wave',
    name: 'Onda',
    category: 'Arma',
    rarity: 'Artefato',
    price: '—',
    attunement: true,
    description: 'Tridente artefato dos mares: dano extra, respiração aquática e invocação de elementais.'
  },
  {
    item_type: 'item_magico',
    id: 'trident_of_fish_command',
    name: 'Tridente do Comando de Peixes',
    category: 'Arma',
    rarity: 'Incomum',
    price: '400 po',
    attunement: true,
    uses: { max: 3, recharge: 'dawn' },
    description: 'Conjura Dominar Animal (CD 15) contra bestas aquáticas. 3 cargas diárias.'
  },
  {
    item_type: 'item_magico',
    id: 'holy_avenger',
    name: 'Vingadora Sagrada',
    category: 'Arma',
    rarity: 'Lendário',
    price: '200000 po',
    attunement: true,
    description: 'Espada +3 nas mãos de um paladino: 2d10 radiante contra malignos e aura antimagia.'
  },

  // ─── ARMADURAS E ESCUDOS MÁGICOS ───────────────────────────────────────────
  {
    item_type: 'item_magico',
    id: 'armor_1_2_or_3',
    name: 'Armadura +1, +2 ou +3',
    category: 'Armadura',
    rarity: 'Varia',
    price: '—',
    description: 'Bônus de CA igual ao encantamento. Raro (+1), Muito Raro (+2), Lendário (+3).'
  },
  {
    item_type: 'item_magico',
    id: 'demon_armor',
    name: 'Armadura Demoníaca',
    category: 'Armadura',
    rarity: 'Muito Raro',
    price: '40000 po',
    attunement: true,
    description: '+1 de CA, garras que causam 1d8 e falam abissal — mas o item é amaldiçoado.'
  },
  {
    item_type: 'item_magico',
    id: 'smoldering_armor',
    name: 'Armadura Fumegante',
    category: 'Armadura',
    rarity: 'Comum',
    price: '100 po',
    description: 'Solta fumaça constante e inofensiva, sem calor nem dano.'
  },
  {
    item_type: 'item_magico',
    id: 'armor_of_gleaming',
    name: 'Armadura Reluzente',
    category: 'Armadura',
    rarity: 'Comum',
    price: '100 po',
    description: 'Nunca se suja nem enferruja. Sem outro efeito mágico.'
  },
  {
    item_type: 'item_magico',
    id: 'armor_of_invulnerability',
    name: 'Armadura da Invulnerabilidade',
    category: 'Armadura',
    rarity: 'Lendário',
    price: '200000 po',
    attunement: true,
    description: 'Resistência a dano físico; por 10 minutos ao dia, imunidade total a dano físico.'
  },
  {
    item_type: 'item_magico',
    id: 'armor_of_vulnerability',
    name: 'Armadura da Vulnerabilidade',
    category: 'Armadura',
    rarity: 'Raro',
    price: '4000 po',
    attunement: true,
    description: 'Resistência a um tipo de dano físico, mas vulnerabilidade amaldiçoada aos outros dois.'
  },
  {
    item_type: 'item_magico',
    id: 'adamantine_armor',
    name: 'Armadura de Adamante',
    category: 'Armadura',
    rarity: 'Incomum',
    price: '400 po',
    description: 'Acertos críticos contra quem a veste viram acertos normais.'
  },
  {
    item_type: 'item_magico',
    id: 'cast_off_armor',
    name: 'Armadura de Desprender',
    category: 'Armadura',
    rarity: 'Comum',
    price: '100 po',
    description: 'Pode ser tirada com uma ação, por mais pesada que seja.'
  },
  {
    item_type: 'item_magico',
    id: 'mithral_armor',
    name: 'Armadura de Mithral',
    category: 'Armadura',
    rarity: 'Incomum',
    price: '400 po',
    description: 'Não impõe desvantagem em Furtividade nem exige Força mínima.'
  },
  {
    item_type: 'item_magico',
    id: 'armor_of_resistance',
    name: 'Armadura de Resistência',
    category: 'Armadura',
    rarity: 'Raro',
    price: '4000 po',
    attunement: true,
    description: 'Resistência a um tipo de dano determinado quando a armadura é criada.'
  },
  {
    item_type: 'item_magico',
    id: 'mariner_s_armor',
    name: 'Armadura do Marujo',
    category: 'Armadura',
    rarity: 'Incomum',
    price: '400 po',
    description: 'Concede deslocamento de natação e impede que você se afogue afundando.'
  },
  {
    item_type: 'item_magico',
    id: 'dragon_scale_mail',
    name: 'Cota de Escamas de Dragão',
    category: 'Armadura',
    rarity: 'Muito Raro',
    price: '40000 po',
    attunement: true,
    description: '+1 de CA, resistência ao dano do dragão correspondente e sentido de dragões próximos.'
  },
  {
    item_type: 'item_magico',
    id: 'efreeti_chain',
    name: 'Cota do Efrit',
    category: 'Armadura',
    rarity: 'Lendário',
    price: '200000 po',
    attunement: true,
    description: '+3 de CA, imunidade a fogo e capacidade de andar sobre lava e ar.'
  },
  {
    item_type: 'item_magico',
    id: 'elven_chain',
    name: 'Cota Élfica',
    category: 'Armadura',
    rarity: 'Raro',
    price: '4000 po',
    description: '+1 de CA e você é proficiente nela mesmo sem treino em armadura média.'
  },
  {
    item_type: 'item_magico',
    id: 'glamoured_studded_leather',
    name: 'Couro Batido Glamurizado',
    category: 'Armadura',
    rarity: 'Raro',
    price: '4000 po',
    description: '+1 de CA e muda de aparência para qualquer traje que você imaginar.'
  },
  {
    item_type: 'item_magico',
    id: 'shield_1_2_or_3',
    name: 'Escudo +1, +2 ou +3',
    category: 'Armadura',
    rarity: 'Varia',
    price: '—',
    description: 'CA adicional além do +2 normal. Incomum (+1), Raro (+2), Muito Raro (+3).'
  },
  {
    item_type: 'item_magico',
    id: 'animated_shield',
    name: 'Escudo Animado',
    category: 'Armadura',
    rarity: 'Muito Raro',
    price: '40000 po',
    attunement: true,
    description: 'Como ação bônus, flutua sozinho e concede o bônus de CA com as mãos livres por 1 minuto.'
  },
  {
    item_type: 'item_magico',
    id: 'arrow_catching_shield',
    name: 'Escudo Apanha-Flechas',
    category: 'Armadura',
    rarity: 'Raro',
    price: '4000 po',
    attunement: true,
    description: '+2 de CA contra ataques à distância e permite atrair para si tiros feitos contra aliados próximos.'
  },
  {
    item_type: 'item_magico',
    id: 'shield_of_expression',
    name: 'Escudo Expressivo',
    category: 'Armadura',
    rarity: 'Comum',
    price: '100 po',
    description: 'O rosto gravado no escudo muda de expressão conforme você quiser.'
  },
  {
    item_type: 'item_magico',
    id: 'spellguard_shield',
    name: 'Escudo Guarda-Magias',
    category: 'Armadura',
    rarity: 'Muito Raro',
    price: '40000 po',
    attunement: true,
    description: 'Vantagem em salvaguardas contra magias e desvantagem nos ataques mágicos contra você.'
  },
  {
    item_type: 'item_magico',
    id: 'sentinel_shield',
    name: 'Escudo Sentinela',
    category: 'Armadura',
    rarity: 'Incomum',
    price: '400 po',
    description: 'Vantagem em iniciativa e em testes de Percepção.'
  },
  {
    item_type: 'item_magico',
    id: 'shield_of_missile_attraction',
    name: 'Escudo de Atração de Projéteis',
    category: 'Armadura',
    rarity: 'Raro',
    price: '4000 po',
    attunement: true,
    description: 'Resistência a projéteis, mas amaldiçoado: atrai para você os tiros feitos em aliados.'
  },
  {
    item_type: 'item_magico',
    id: 'shield_of_the_cavalier',
    name: 'Escudo do Cavaleiro',
    category: 'Armadura',
    rarity: 'Muito Raro',
    price: '40000 po',
    attunement: true,
    description: 'Escudo de guerra que protege também os aliados adjacentes e repele investidas.'
  },
  {
    item_type: 'item_magico',
    id: 'dwarven_plate',
    name: 'Placas Anãs',
    category: 'Armadura',
    rarity: 'Muito Raro',
    price: '40000 po',
    description: '+2 de CA e resistência a ser empurrado ou derrubado à força.'
  },
  {
    item_type: 'item_magico',
    id: 'plate_armor_of_etherealness',
    name: 'Placas da Eterealidade',
    category: 'Armadura',
    rarity: 'Lendário',
    price: '200000 po',
    attunement: true,
    uses: { max: 1, recharge: 'dawn' },
    description: 'Leva você e o que carrega ao Plano Etéreo por 10 minutos, uma vez ao dia.'
  },

  // ─── ITENS MARAVILHOSOS ────────────────────────────────────────────────────
  {
    item_type: 'item_magico',
    id: 'dimensional_shackles',
    name: 'Algemas Dimensionais',
    category: 'Item Maravilhoso',
    rarity: 'Raro',
    price: '4000 po',
    description: 'Impedem o prisioneiro de usar qualquer forma de teleporte ou viagem planar.'
  },
  {
    item_type: 'item_magico',
    id: 'quiver_of_ehlonna',
    name: 'Aljava de Ehlonna',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '400 po',
    description: 'Três compartimentos que guardam flechas, arcos e lanças sem somar peso.'
  },
  {
    item_type: 'item_magico',
    id: 'amulet_of_health',
    name: 'Amuleto da Saúde',
    category: 'Item Maravilhoso',
    rarity: 'Raro',
    price: '4000 po',
    attunement: true,
    description: 'Constituição passa a 19 se já não for maior.'
  },
  {
    item_type: 'item_magico',
    id: 'clockwork_amulet',
    name: 'Amuleto de Engrenagens',
    category: 'Item Maravilhoso',
    rarity: 'Comum',
    price: '100 po',
    uses: { max: 1, recharge: 'dawn' },
    description: 'Uma vez ao dia, substitui a rolagem de um ataque por um 10 fixo.'
  },
  {
    item_type: 'item_magico',
    id: 'dark_shard_amulet',
    name: 'Amuleto de Fragmento Negro',
    category: 'Item Maravilhoso',
    rarity: 'Comum',
    price: '100 po',
    attunement: true,
    description: 'Foco mágico de bruxo; pode permitir conjurar um truque da lista do Bruxo.'
  },
  {
    item_type: 'item_magico',
    id: 'amulet_of_the_planes',
    name: 'Amuleto dos Planos',
    category: 'Item Maravilhoso',
    rarity: 'Muito Raro',
    price: '40000 po',
    attunement: true,
    description: 'Conjura Deslocamento Planar para um plano conhecido; CD 15 de Inteligência ou destino aleatório.'
  },
  {
    item_type: 'item_magico',
    id: 'amulet_of_proof_against_detection_and_location',
    name: 'Amuleto à Prova de Detecção e Localização',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '400 po',
    attunement: true,
    description: 'Você fica oculto de adivinhação e não pode ser alvo nem percebido por sensores mágicos.'
  },
  {
    item_type: 'item_magico',
    id: 'apparatus_of_kwalish',
    name: 'Aparato de Kwalish',
    category: 'Item Maravilhoso',
    rarity: 'Lendário',
    price: '200000 po',
    description: 'Barril de ferro que se abre num submersível em forma de lagosta, com 10 alavancas de controle.'
  },
  {
    item_type: 'item_magico',
    id: 'wings_of_flying',
    name: 'Asas Voadoras',
    category: 'Item Maravilhoso',
    rarity: 'Raro',
    price: '4000 po',
    attunement: true,
    description: 'O manto vira asas: deslocamento de voo igual ao seu por até 1 hora.'
  },
  {
    item_type: 'item_magico',
    id: 'headband_of_intellect',
    name: 'Bandana do Intelecto',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '400 po',
    attunement: true,
    description: 'Inteligência passa a 19 se já não for maior.'
  },
  {
    item_type: 'item_magico',
    id: 'iron_bands_of_bilarro',
    name: 'Bandas de Ferro de Bilarro',
    category: 'Item Maravilhoso',
    rarity: 'Raro',
    price: '4000 po',
    description: 'Esfera arremessada que envolve o alvo (CD 20) deixando-o Contido.'
  },
  {
    item_type: 'item_magico',
    id: 'deck_of_many_things',
    name: 'Baralho Multiforme',
    category: 'Item Maravilhoso',
    rarity: 'Lendário',
    price: '200000 po',
    description: 'Cada carta desencadeia um efeito poderoso e irreversível, de riquezas à perda da alma.'
  },
  {
    item_type: 'item_magico',
    id: 'deck_of_illusions',
    name: 'Baralho de Ilusões',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '400 po',
    description: 'Cartas jogadas ao chão criam ilusões convincentes de criaturas por 1 hora.'
  },
  {
    item_type: 'item_magico',
    id: 'folding_boat',
    name: 'Barco Dobrável',
    category: 'Item Maravilhoso',
    rarity: 'Raro',
    price: '4000 po',
    description: 'Caixa de madeira que vira um bote de 3 m ou um navio de 7,5 m ao comando.'
  },
  {
    item_type: 'item_magico',
    id: 'veteran_s_cane',
    name: 'Bengala do Veterano',
    category: 'Item Maravilhoso',
    rarity: 'Comum',
    price: '100 po',
    description: 'Bengala que vira uma espada longa comum quando você a saca.'
  },
  {
    item_type: 'item_magico',
    id: 'crystal_ball',
    name: 'Bola de Cristal',
    category: 'Item Maravilhoso',
    rarity: 'Muito Raro',
    price: '40000 po',
    attunement: true,
    description: 'Conjura Vidência (CD 17) enquanto você a toca.'
  },
  {
    item_type: 'item_magico',
    id: 'crystal_ball_of_mind_reading',
    name: 'Bola de Cristal da Leitura Mental',
    category: 'Item Maravilhoso',
    rarity: 'Lendário',
    price: '200000 po',
    attunement: true,
    description: 'Como a Bola de Cristal, e ainda conjura Detectar Pensamentos sobre alvos observados.'
  },
  {
    item_type: 'item_magico',
    id: 'crystal_ball_of_telepathy',
    name: 'Bola de Cristal da Telepatia',
    category: 'Item Maravilhoso',
    rarity: 'Lendário',
    price: '200000 po',
    attunement: true,
    description: 'Como a Bola de Cristal, e permite comunicação telepática com quem você observa.'
  },
  {
    item_type: 'item_magico',
    id: 'crystal_ball_of_true_seeing',
    name: 'Bola de Cristal da Visão Verdadeira',
    category: 'Item Maravilhoso',
    rarity: 'Lendário',
    price: '200000 po',
    attunement: true,
    description: 'Como a Bola de Cristal, e concede Visão Verdadeira em 36 m ao redor do sensor.'
  },
  {
    item_type: 'item_magico',
    id: 'bag_of_holding',
    name: 'Bolsa de Armazenamento',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '400 po',
    description: 'Espaço extradimensional de até 250 kg; a bolsa em si pesa sempre 7,5 kg.'
  },
  {
    item_type: 'item_magico',
    id: 'heward_s_handy_spice_pouch',
    name: 'Bolsa de Temperos de Heward',
    category: 'Item Maravilhoso',
    rarity: 'Comum',
    price: '100 po',
    description: 'Produz qualquer tempero comum e melhora rações a ponto de valer como refeição.'
  },
  {
    item_type: 'item_magico',
    id: 'talking_doll',
    name: 'Boneca Falante',
    category: 'Item Maravilhoso',
    rarity: 'Comum',
    price: '100 po',
    attunement: true,
    description: 'Guarda até seis frases de até seis palavras e as diz quando acionada.'
  },
  {
    item_type: 'item_magico',
    id: 'botas_aladas',
    name: 'Botas Aladas',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '4000 po',
    attunement: true,
    description: 'Botas com asas decorativas nos calcanhares que ganham vida ao ser ativadas. Concedem voo igual ao deslocamento terrestre por até 4 horas por dia.'
  },
  {
    item_type: 'item_magico',
    id: 'boots_of_the_winterlands',
    name: 'Botas das Terras Invernais',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '400 po',
    attunement: true,
    description: 'Resistência a frio, terreno gelado não atrasa e tolerância a até −45 °C.'
  },
  {
    item_type: 'item_magico',
    id: 'boots_of_levitation',
    name: 'Botas de Levitação',
    category: 'Item Maravilhoso',
    rarity: 'Raro',
    price: '4000 po',
    attunement: true,
    description: 'Conjuram Levitação sobre você mesmo, à vontade.'
  },
  {
    item_type: 'item_magico',
    id: 'boots_of_striding_and_springing',
    name: 'Botas de Passos Largos e Saltos',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '400 po',
    attunement: true,
    description: 'Deslocamento 9 m independentemente da armadura e saltos triplicados.'
  },
  {
    item_type: 'item_magico',
    id: 'boots_of_false_tracks',
    name: 'Botas de Rastros Falsos',
    category: 'Item Maravilhoso',
    rarity: 'Comum',
    price: '100 po',
    attunement: true,
    description: 'As pegadas deixadas são de outra espécie humanoide à sua escolha.'
  },
  {
    item_type: 'item_magico',
    id: 'botas_de_velocidade',
    name: 'Botas de Velocidade',
    category: 'Item Maravilhoso',
    rarity: 'Raro',
    price: '4000 po',
    attunement: true,
    description: 'Botas com solas de metal gravadas com runas de celeridade. Ativadas com ação bônus, dobram o deslocamento e permitem ação de Disparada gratuita por 1 minuto.'
  },
  {
    item_type: 'item_magico',
    id: 'boots_of_elvenkind',
    name: 'Botas Élficas',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '400 po',
    description: 'Seus passos ficam silenciosos: vantagem em Furtividade para se mover sem ruído.'
  },
  {
    item_type: 'item_magico',
    id: 'bracers_of_archery',
    name: 'Braceletes de Arquearia',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '400 po',
    attunement: true,
    description: 'Proficiência com arcos longos e curtos e +2 de dano com eles.'
  },
  {
    item_type: 'item_magico',
    id: 'bracers_of_defense',
    name: 'Braceletes de Defesa',
    category: 'Item Maravilhoso',
    rarity: 'Raro',
    price: '4000 po',
    attunement: true,
    description: '+2 de CA quando você não usa armadura nem escudo.'
  },
  {
    item_type: 'item_magico',
    id: 'brazier_of_commanding_fire_elementals',
    name: 'Braseiro de Comando de Elementais do Fogo',
    category: 'Item Maravilhoso',
    rarity: 'Raro',
    price: '4000 po',
    description: 'Invoca um elemental do fogo que obedece você por 1 hora.'
  },
  {
    item_type: 'item_magico',
    id: 'brooch_of_shielding',
    name: 'Broche de Escudo',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '400 po',
    attunement: true,
    description: 'Resistência a dano de força e imunidade a Mísseis Mágicos.'
  },
  {
    item_type: 'item_magico',
    id: 'portable_hole',
    name: 'Buraco Portátil',
    category: 'Item Maravilhoso',
    rarity: 'Raro',
    price: '4000 po',
    description: 'Pano que abre um poço extradimensional de 1,8 m de diâmetro por 3 m de fundo.'
  },
  {
    item_type: 'item_magico',
    id: 'pipe_of_smoke_monsters',
    name: 'Cachimbo dos Monstros de Fumaça',
    category: 'Item Maravilhoso',
    rarity: 'Comum',
    price: '100 po',
    description: 'A fumaça exalada toma a forma de monstros inofensivos.'
  },
  {
    item_type: 'item_magico',
    id: 'lock_of_trickery',
    name: 'Cadeado Enganoso',
    category: 'Item Maravilhoso',
    rarity: 'Comum',
    price: '100 po',
    description: 'Parece um cadeado comum, mas exige CD 15 para ser arrombado.'
  },
  {
    item_type: 'item_magico',
    id: 'cauldron_of_rebirth',
    name: 'Caldeirão do Renascimento',
    category: 'Item Maravilhoso',
    rarity: 'Muito Raro',
    price: '40000 po',
    attunement: true,
    description: 'Caldeirão de bruxa que conjura Reviver os Mortos sobre corpos mergulhados nele.'
  },
  {
    item_type: 'item_magico',
    id: 'tankard_of_sobriety',
    name: 'Caneca da Sobriedade',
    category: 'Item Maravilhoso',
    rarity: 'Comum',
    price: '100 po',
    description: 'Você nunca fica bêbado com o que beber nela.'
  },
  {
    item_type: 'item_magico',
    id: 'capa_de_protecao',
    name: 'Capa de Proteção',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '1500 po',
    attunement: true,
    description: 'Capa com bordados arcanos que se movem levemente mesmo sem vento. Concede +1 na Classe de Armadura e em todas as salvaguardas.'
  },
  {
    item_type: 'item_magico',
    id: 'cape_of_the_mountebank',
    name: 'Capa do Charlatão',
    category: 'Item Maravilhoso',
    rarity: 'Raro',
    price: '4000 po',
    uses: { max: 1, recharge: 'dawn' },
    description: 'Conjura Porta Dimensional uma vez ao dia, deixando fumaça na saída e na chegada.'
  },
  {
    item_type: 'item_magico',
    id: 'hat_of_wizardry',
    name: 'Chapéu da Magia',
    category: 'Item Maravilhoso',
    rarity: 'Comum',
    price: '100 po',
    attunement: true,
    description: 'Foco arcano que pode conceder um truque de mago e um truque extra diário.'
  },
  {
    item_type: 'item_magico',
    id: 'hat_of_many_spells',
    name: 'Chapéu de Muitas Magias',
    category: 'Item Maravilhoso',
    rarity: 'Muito Raro',
    price: '40000 po',
    attunement: true,
    description: 'Chapéu de mago que conjura uma magia aleatória de círculo elevado a cada dia.'
  },
  {
    item_type: 'item_magico',
    id: 'hat_of_disguise',
    name: 'Chapéu do Disfarce',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '400 po',
    attunement: true,
    description: 'Conjura Disfarçar-se à vontade.'
  },
  {
    item_type: 'item_magico',
    id: 'hat_of_vermin',
    name: 'Chapéu dos Vermes',
    category: 'Item Maravilhoso',
    rarity: 'Comum',
    price: '100 po',
    description: 'Produz três animais miúdos e inofensivos que somem em 1 hora.'
  },
  {
    item_type: 'item_magico',
    id: 'mystery_key',
    name: 'Chave do Mistério',
    category: 'Item Maravilhoso',
    rarity: 'Comum',
    price: '100 po',
    description: 'Abre uma fechadura qualquer, uma única vez.'
  },
  {
    item_type: 'item_magico',
    id: 'belt_of_dwarvenkind',
    name: 'Cinto Anão',
    category: 'Item Maravilhoso',
    rarity: 'Raro',
    price: '4000 po',
    attunement: true,
    description: 'Constituição 19, vantagem em testes sociais com anões, visão no escuro e resistência a veneno.'
  },
  {
    item_type: 'item_magico',
    id: 'belt_of_giant_strength',
    name: 'Cinto de Força de Gigante',
    category: 'Item Maravilhoso',
    rarity: 'Varia',
    price: '—',
    attunement: true,
    description: 'Força fixa conforme o gigante: colina 21, pedra/gelo 23, fogo 25, nuvem 27, tempestade 29.'
  },
  {
    item_type: 'item_magico',
    id: 'sovereign_glue',
    name: 'Cola Soberana',
    category: 'Item Maravilhoso',
    rarity: 'Lendário',
    price: '100000 po',
    description: 'Adesivo que gruda dois objetos de forma permanente; só o Solvente Universal separa.'
  },
  {
    item_type: 'item_magico',
    id: 'necklace_of_adaptation',
    name: 'Colar da Adaptação',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '400 po',
    attunement: true,
    description: 'Você respira normalmente em qualquer ambiente e é imune a gases nocivos.'
  },
  {
    item_type: 'item_magico',
    id: 'colar_de_bolas_de_fogo',
    name: 'Colar de Bolas de Fogo',
    category: 'Item Maravilhoso',
    rarity: 'Raro',
    price: '3000 po',
    description: 'Colar com 1d6 + 3 esferas de âmbar alaranjado. Uma ação remove e arremessa uma esfera até 18 m, que detona como Bola de Fogo de 3º círculo (CD 15). Esferas adicionais somam 1d6 de dano cada, até 12d6.'
  },
  {
    item_type: 'item_magico',
    id: 'necklace_of_prayer_beads',
    name: 'Colar de Contas de Oração',
    category: 'Item Maravilhoso',
    rarity: 'Raro',
    price: '4000 po',
    attunement: true,
    description: 'Cada conta mágica guarda uma magia divina, recarregada no descanso longo.'
  },
  {
    item_type: 'item_magico',
    id: 'rope_of_mending',
    name: 'Corda Autorremendável',
    category: 'Item Maravilhoso',
    rarity: 'Comum',
    price: '100 po',
    description: 'Pode ser cortada em pedaços e volta a ser uma corda inteira ao comando.'
  },
  {
    item_type: 'item_magico',
    id: 'rope_of_climbing',
    name: 'Corda de Escalada',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '400 po',
    description: '18 m de corda que se movem, amarram e desamarram ao seu comando.'
  },
  {
    item_type: 'item_magico',
    id: 'rope_of_entanglement',
    name: 'Corda do Enredamento',
    category: 'Item Maravilhoso',
    rarity: 'Raro',
    price: '4000 po',
    description: 'Enlaça uma criatura a até 6 m (CD 15), deixando-a Contida.'
  },
  {
    item_type: 'item_magico',
    id: 'ear_horn_of_hearing',
    name: 'Corneta Auditiva',
    category: 'Item Maravilhoso',
    rarity: 'Comum',
    price: '100 po',
    description: 'Anula a condição Surdo enquanto usada no ouvido.'
  },
  {
    item_type: 'item_magico',
    id: 'cube_of_force',
    name: 'Cubo de Força',
    category: 'Item Maravilhoso',
    rarity: 'Raro',
    price: '4000 po',
    attunement: true,
    description: 'Ergue uma barreira de força de 4,5 m em seis modos, bloqueando matéria, magia ou ambos.'
  },
  {
    item_type: 'item_magico',
    id: 'cube_of_summoning',
    name: 'Cubo de Invocação',
    category: 'Item Maravilhoso',
    rarity: 'Raro',
    price: '4000 po',
    description: 'Cubo elemental que invoca um servo do plano correspondente à face pressionada.'
  },
  {
    item_type: 'item_magico',
    id: 'charlatan_s_die',
    name: 'Dado do Charlatão',
    category: 'Item Maravilhoso',
    rarity: 'Comum',
    price: '100 po',
    attunement: true,
    description: 'Você escolhe o resultado do dado antes de rolá-lo.'
  },
  {
    item_type: 'item_magico',
    id: 'helm_of_comprehending_languages',
    name: 'Elmo da Compreensão de Idiomas',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '400 po',
    description: 'Conjura Compreender Idiomas como ritual, à vontade.'
  },
  {
    item_type: 'item_magico',
    id: 'helm_of_telepathy',
    name: 'Elmo da Telepatia',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '400 po',
    attunement: true,
    uses: { max: 1, recharge: 'dawn' },
    description: 'Detectar Pensamentos à vontade, mais Sugestão uma vez ao dia.'
  },
  {
    item_type: 'item_magico',
    id: 'helm_of_brilliance',
    name: 'Elmo do Esplendor',
    category: 'Item Maravilhoso',
    rarity: 'Muito Raro',
    price: '40000 po',
    attunement: true,
    description: 'Cravejado de gemas que conjuram magias de fogo, luz e dano radiante a mortos-vivos.'
  },
  {
    item_type: 'item_magico',
    id: 'helm_of_teleportation',
    name: 'Elmo do Teletransporte',
    category: 'Item Maravilhoso',
    rarity: 'Raro',
    price: '4000 po',
    attunement: true,
    uses: { max: 3, recharge: 'dawn' },
    description: 'Conjura Teletransporte com 3 cargas diárias.'
  },
  {
    item_type: 'item_magico',
    id: 'dread_helm',
    name: 'Elmo do Terror',
    category: 'Item Maravilhoso',
    rarity: 'Comum',
    price: '100 po',
    description: 'Faz seus olhos brilharem em vermelho e esconde o resto do rosto na sombra.'
  },
  {
    item_type: 'item_magico',
    id: 'scarab_of_protection',
    name: 'Escaravelho da Proteção',
    category: 'Item Maravilhoso',
    rarity: 'Lendário',
    price: '200000 po',
    attunement: true,
    description: 'Vantagem contra magias e anula ataques de mortos-vivos que drenam a vida.'
  },
  {
    item_type: 'item_magico',
    id: 'sphere_of_annihilation',
    name: 'Esfera da Aniquilação',
    category: 'Item Maravilhoso',
    rarity: 'Lendário',
    price: '200000 po',
    description: 'Buraco de 60 cm que destrói tudo que toca: 4d10 de força por turno de contato.'
  },
  {
    item_type: 'item_magico',
    id: 'bead_of_force',
    name: 'Esfera de Força',
    category: 'Item Maravilhoso',
    rarity: 'Raro',
    price: '2000 po',
    description: 'Arremessada, causa 5d4 de força e aprisiona os alvos numa esfera de força por 1 minuto.'
  },
  {
    item_type: 'item_magico',
    id: 'bead_of_nourishment',
    name: 'Esfera de Nutrição',
    category: 'Item Maravilhoso',
    rarity: 'Comum',
    price: '50 po',
    description: 'Uma conta engolida alimenta como um dia inteiro de comida.'
  },
  {
    item_type: 'item_magico',
    id: 'bead_of_refreshment',
    name: 'Esfera de Refresco',
    category: 'Item Maravilhoso',
    rarity: 'Comum',
    price: '50 po',
    description: 'Dissolvida em líquido, torna-o água limpa e saborosa suficiente para um dia.'
  },
  {
    item_type: 'item_magico',
    id: 'mirror_of_life_trapping',
    name: 'Espelho da Prisão da Vida',
    category: 'Item Maravilhoso',
    rarity: 'Muito Raro',
    price: '40000 po',
    description: 'Aprisiona quem olha para ele (CD 15) em uma de suas doze celas extradimensionais.'
  },
  {
    item_type: 'item_magico',
    id: 'figurine_of_wondrous_power',
    name: 'Estatueta de Poder Maravilhoso',
    category: 'Item Maravilhoso',
    rarity: 'Varia',
    price: '—',
    description: 'Estatueta que vira um animal aliado real. Raridade varia conforme a criatura.'
  },
  {
    item_type: 'item_magico',
    id: 'wraps_of_unarmed_power',
    name: 'Faixas de Poder Desarmado',
    category: 'Item Maravilhoso',
    rarity: 'Varia',
    price: '—',
    description: 'Bônus mágico nos ataques desarmados. Incomum (+1), Raro (+2), Muito Raro (+3).'
  },
  {
    item_type: 'item_magico',
    id: 'horseshoes_of_speed',
    name: 'Ferraduras da Velocidade',
    category: 'Item Maravilhoso',
    rarity: 'Raro',
    price: '4000 po',
    description: 'A montaria calçada ganha +9 m de deslocamento.'
  },
  {
    item_type: 'item_magico',
    id: 'horseshoes_of_a_zephyr',
    name: 'Ferraduras do Zéfiro',
    category: 'Item Maravilhoso',
    rarity: 'Muito Raro',
    price: '40000 po',
    description: 'A montaria trota no ar, ignora terreno difícil e não deixa rastros.'
  },
  {
    item_type: 'item_magico',
    id: 'quaal_s_feather_token',
    name: 'Ficha de Pena de Quaal',
    category: 'Item Maravilhoso',
    rarity: 'Varia',
    price: '—',
    description: 'Pena de uso único: âncora, ave, leque, barco, chicote, árvore ou pássaro-correio.'
  },
  {
    item_type: 'item_magico',
    id: 'pipes_of_haunting',
    name: 'Flautas Assombrosas',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '400 po',
    uses: { max: 3, recharge: 'manual' },
    description: 'A melodia amedronta quem ouve em 9 m (CD 15) por 1 minuto. 3 cargas.'
  },
  {
    item_type: 'item_magico',
    id: 'pipes_of_the_sewers',
    name: 'Flautas dos Esgotos',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '400 po',
    attunement: true,
    description: 'Atraem e comandam ratos e outros roedores em 150 m.'
  },
  {
    item_type: 'item_magico',
    id: 'daern_s_instant_fortress',
    name: 'Fortaleza Instantânea de Daern',
    category: 'Item Maravilhoso',
    rarity: 'Raro',
    price: '4000 po',
    attunement: true,
    description: 'Cubo de adamante que vira uma torre de 6 m com CA 20 e 100 PV.'
  },
  {
    item_type: 'item_magico',
    id: 'iron_flask',
    name: 'Frasco de Ferro',
    category: 'Item Maravilhoso',
    rarity: 'Lendário',
    price: '200000 po',
    description: 'Aprisiona um extraplanar (CD 17) e depois o liberta como servo por 1 hora.'
  },
  {
    item_type: 'item_magico',
    id: 'eversmoking_bottle',
    name: 'Garrafa de Fumaça Eterna',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '400 po',
    description: 'Solta fumaça densa que se expande e obscurece uma área crescente até ser tampada.'
  },
  {
    item_type: 'item_magico',
    id: 'decanter_of_endless_water',
    name: 'Garrafa de Água Infinita',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '400 po',
    description: 'Jorra água limpa em três intensidades: gotas, jato ou uma torrente de 115 litros.'
  },
  {
    item_type: 'item_magico',
    id: 'efreeti_bottle',
    name: 'Garrafa do Efrit',
    category: 'Item Maravilhoso',
    rarity: 'Muito Raro',
    price: '40000 po',
    description: 'Um efrit sai da garrafa: pode atacar, servir por 1 hora ou atender três desejos.'
  },
  {
    item_type: 'item_magico',
    id: 'elemental_gem',
    name: 'Gema Elemental',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '200 po',
    description: 'Quebrada, invoca um elemental do plano correspondente à sua cor.'
  },
  {
    item_type: 'item_magico',
    id: 'gem_of_seeing',
    name: 'Gema da Visão',
    category: 'Item Maravilhoso',
    rarity: 'Raro',
    price: '4000 po',
    attunement: true,
    uses: { max: 3, recharge: 'dawn' },
    description: 'Concede Visão Verdadeira em 36 m por 10 minutos. 3 cargas diárias.'
  },
  {
    item_type: 'item_magico',
    id: 'gem_of_brightness',
    name: 'Gema do Brilho',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '400 po',
    uses: { max: 50, recharge: 'manual' },
    description: 'Emite luz, um facho ofuscante ou um clarão que cega (CD 15). 50 cargas.'
  },
  {
    item_type: 'item_magico',
    id: 'driftglobe',
    name: 'Globo Flutuante',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '400 po',
    description: 'Esfera que conjura Luz ou Luz do Dia e flutua acompanhando você.'
  },
  {
    item_type: 'item_magico',
    id: 'cap_of_water_breathing',
    name: 'Gorro de Respiração Aquática',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '400 po',
    description: 'Debaixo d’água, permite respirar normalmente.'
  },
  {
    item_type: 'item_magico',
    id: 'enduring_spellbook',
    name: 'Grimório Perene',
    category: 'Item Maravilhoso',
    rarity: 'Comum',
    price: '100 po',
    description: 'Imune a fogo, água e ao tempo: nunca se deteriora nem perde páginas.'
  },
  {
    item_type: 'item_magico',
    id: 'instrument_of_scribing',
    name: 'Instrumento de Escrita',
    category: 'Item Maravilhoso',
    rarity: 'Comum',
    price: '100 po',
    description: 'Escreve mensagens mágicas invisíveis a quem você não escolher.'
  },
  {
    item_type: 'item_magico',
    id: 'instrument_of_illusions',
    name: 'Instrumento de Ilusões',
    category: 'Item Maravilhoso',
    rarity: 'Comum',
    price: '100 po',
    description: 'A música cria imagens ilusórias e inofensivas enquanto você toca.'
  },
  {
    item_type: 'item_magico',
    id: 'instrument_of_the_bards',
    name: 'Instrumento dos Bardos',
    category: 'Item Maravilhoso',
    rarity: 'Varia',
    price: '—',
    attunement: true,
    description: 'Sete versões, cada uma com sua lista de magias. Raridade varia pelo instrumento.'
  },
  {
    item_type: 'item_magico',
    id: 'alchemy_jug',
    name: 'Jarro de Alquimia',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '400 po',
    description: 'Produz diariamente um líquido escolhido: água, vinho, mel, ácido, veneno ou cerveja.'
  },
  {
    item_type: 'item_magico',
    id: 'lantern_of_revealing',
    name: 'Lanterna Reveladora',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '400 po',
    description: 'Revela criaturas e objetos invisíveis dentro da luz plena.'
  },
  {
    item_type: 'item_magico',
    id: 'wind_fan',
    name: 'Leque do Vento',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '400 po',
    description: 'Conjura Rajada de Vento; usar repetidamente arrisca destruir o leque.'
  },
  {
    item_type: 'item_magico',
    id: 'book_of_vile_darkness',
    name: 'Livro das Trevas Vis',
    category: 'Item Maravilhoso',
    rarity: 'Artefato',
    price: '—',
    attunement: true,
    description: 'Artefato profano: concede poder atroz ao custo da corrupção permanente do leitor.'
  },
  {
    item_type: 'item_magico',
    id: 'book_of_exalted_deeds',
    name: 'Livro dos Feitos Exaltados',
    category: 'Item Maravilhoso',
    rarity: 'Artefato',
    price: '—',
    attunement: true,
    description: 'Artefato sagrado: 6 dias de estudo aumentam Sabedoria e concedem bênçãos celestiais.'
  },
  {
    item_type: 'item_magico',
    id: 'gloves_of_missile_snaring',
    name: 'Luvas de Captura de Projéteis',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '400 po',
    attunement: true,
    description: 'Reduzem o dano de projéteis; se zerar, você pega o projétil no ar.'
  },
  {
    item_type: 'item_magico',
    id: 'gloves_of_thievery',
    name: 'Luvas de Ladroagem',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '400 po',
    description: '+5 em Prestidigitação e em testes para arrombar fechaduras.'
  },
  {
    item_type: 'item_magico',
    id: 'gloves_of_swimming_and_climbing',
    name: 'Luvas de Natação e Escalada',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '400 po',
    attunement: true,
    description: 'Escalar e nadar não custam movimento extra e dão vantagem em Atletismo para isso.'
  },
  {
    item_type: 'item_magico',
    id: 'gauntlets_of_ogre_power',
    name: 'Manoplas da Força do Ogro',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '400 po',
    attunement: true,
    description: 'Força passa a 19 se já não for maior.'
  },
  {
    item_type: 'item_magico',
    id: 'cloak_of_billowing',
    name: 'Manto Ondulante',
    category: 'Item Maravilhoso',
    rarity: 'Comum',
    price: '100 po',
    description: 'Ondula dramaticamente ao seu comando. Puramente estético.'
  },
  {
    item_type: 'item_magico',
    id: 'cloak_of_arachnida',
    name: 'Manto da Aracnídea',
    category: 'Item Maravilhoso',
    rarity: 'Muito Raro',
    price: '40000 po',
    attunement: true,
    description: 'Resistência a veneno, escalada em teias, Teia diária e imunidade a ficar preso em teias.'
  },
  {
    item_type: 'item_magico',
    id: 'cloak_of_the_manta_ray',
    name: 'Manto da Arraia-Manta',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '400 po',
    attunement: true,
    description: 'Com o capuz erguido, respira debaixo d’água e nada a 18 m.'
  },
  {
    item_type: 'item_magico',
    id: 'manto_da_invisibilidade',
    name: 'Manto da Invisibilidade',
    category: 'Item Maravilhoso',
    rarity: 'Lendário',
    price: '75000 po',
    attunement: true,
    description: 'Tecido costurado com fios de névoa e luz distorcida. Puxar o capuz concede invisibilidade completa por até 2 horas por dia (em parcelas de 1 minuto).'
  },
  {
    item_type: 'item_magico',
    id: 'nature_s_mantle',
    name: 'Manto da Natureza',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '400 po',
    attunement: true,
    description: 'Permite se esconder em terreno natural mesmo à vista e conjura Passos sem Pegadas.'
  },
  {
    item_type: 'item_magico',
    id: 'mantle_of_spell_resistance',
    name: 'Manto da Resistência a Magia',
    category: 'Item Maravilhoso',
    rarity: 'Raro',
    price: '4000 po',
    attunement: true,
    description: 'Vantagem em salvaguardas contra magias.'
  },
  {
    item_type: 'item_magico',
    id: 'robe_of_scintillating_colors',
    name: 'Manto das Cores Cintilantes',
    category: 'Item Maravilhoso',
    rarity: 'Muito Raro',
    price: '40000 po',
    attunement: true,
    description: 'Luzes hipnóticas dão vantagem contra você aos aliados e cegam inimigos (CD 15).'
  },
  {
    item_type: 'item_magico',
    id: 'robe_of_stars',
    name: 'Manto das Estrelas',
    category: 'Item Maravilhoso',
    rarity: 'Muito Raro',
    price: '40000 po',
    attunement: true,
    description: '+1 em salvaguardas, viaja ao Plano Astral e arremessa até seis estrelas de 5d4.'
  },
  {
    item_type: 'item_magico',
    id: 'cloak_of_many_fashions',
    name: 'Manto das Mil Modas',
    category: 'Item Maravilhoso',
    rarity: 'Comum',
    price: '100 po',
    description: 'Muda de cor, corte e estilo com uma ação bônus.'
  },
  {
    item_type: 'item_magico',
    id: 'robe_of_useful_items',
    name: 'Manto de Itens Úteis',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '400 po',
    description: 'Remendos que viram objetos reais: cordas, portas, baús, até um barco.'
  },
  {
    item_type: 'item_magico',
    id: 'robe_of_the_archmagi',
    name: 'Manto do Arquimago',
    category: 'Item Maravilhoso',
    rarity: 'Lendário',
    price: '200000 po',
    attunement: true,
    description: 'CA 15 sem armadura, vantagem contra magias e +2 na CD das suas magias.'
  },
  {
    item_type: 'item_magico',
    id: 'cloak_of_displacement',
    name: 'Manto do Deslocamento',
    category: 'Item Maravilhoso',
    rarity: 'Raro',
    price: '4000 po',
    attunement: true,
    description: 'Ilusão desloca sua imagem: ataques contra você têm desvantagem até você sofrer dano.'
  },
  {
    item_type: 'item_magico',
    id: 'cloak_of_the_bat',
    name: 'Manto do Morcego',
    category: 'Item Maravilhoso',
    rarity: 'Raro',
    price: '4000 po',
    attunement: true,
    description: 'Vantagem em Furtividade, escalada como aranha e, no escuro, voo e forma de morcego.'
  },
  {
    item_type: 'item_magico',
    id: 'robe_of_eyes',
    name: 'Manto dos Olhos',
    category: 'Item Maravilhoso',
    rarity: 'Raro',
    price: '4000 po',
    attunement: true,
    description: 'Visão em 360°, no escuro e do invisível — mas Luz do Dia cega você.'
  },
  {
    item_type: 'item_magico',
    id: 'cloak_of_elvenkind',
    name: 'Manto Élfico',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '400 po',
    attunement: true,
    description: 'Vantagem em Furtividade e desvantagem nos testes de Percepção para enxergá-lo.'
  },
  {
    item_type: 'item_magico',
    id: 'manual_of_quickness_of_action',
    name: 'Manual da Agilidade',
    category: 'Item Maravilhoso',
    rarity: 'Muito Raro',
    price: '20000 po',
    description: '48 horas de estudo aumentam Destreza em 2, junto com seu máximo.'
  },
  {
    item_type: 'item_magico',
    id: 'manual_of_bodily_health',
    name: 'Manual da Saúde Corporal',
    category: 'Item Maravilhoso',
    rarity: 'Muito Raro',
    price: '20000 po',
    description: '48 horas de estudo aumentam Constituição em 2, junto com seu máximo.'
  },
  {
    item_type: 'item_magico',
    id: 'manual_of_golems',
    name: 'Manual de Golens',
    category: 'Item Maravilhoso',
    rarity: 'Muito Raro',
    price: '20000 po',
    description: 'Contém o ritual para criar um golem de um tipo específico.'
  },
  {
    item_type: 'item_magico',
    id: 'manual_of_gainful_exercise',
    name: 'Manual do Exercício Proveitoso',
    category: 'Item Maravilhoso',
    rarity: 'Muito Raro',
    price: '20000 po',
    description: '48 horas de estudo aumentam Força em 2, junto com seu máximo.'
  },
  {
    item_type: 'item_magico',
    id: 'medallion_of_thoughts',
    name: 'Medalhão dos Pensamentos',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '400 po',
    attunement: true,
    uses: { max: 3, recharge: 'dawn' },
    description: 'Conjura Detectar Pensamentos (CD 13). 3 cargas diárias.'
  },
  {
    item_type: 'item_magico',
    id: 'prosthetic_limb',
    name: 'Membro Protético',
    category: 'Item Maravilhoso',
    rarity: 'Comum',
    price: '100 po',
    description: 'Substitui um membro perdido, funciona como o original e não pode ser removido por outros.'
  },
  {
    item_type: 'item_magico',
    id: 'heward_s_handy_haversack',
    name: 'Mochila Prática de Heward',
    category: 'Item Maravilhoso',
    rarity: 'Raro',
    price: '4000 po',
    description: 'Três compartimentos extradimensionais; o item desejado sobe sempre ao topo.'
  },
  {
    item_type: 'item_magico',
    id: 'rival_coin',
    name: 'Moeda Rival',
    category: 'Item Maravilhoso',
    rarity: 'Comum',
    price: '100 po',
    description: 'Moeda encantada que sempre cai do lado oposto ao que você pediu.'
  },
  {
    item_type: 'item_magico',
    id: 'ersatz_eye',
    name: 'Olho Postiço',
    category: 'Item Maravilhoso',
    rarity: 'Comum',
    price: '100 po',
    description: 'Substitui um olho perdido, enxerga normalmente e não pode ser removido por outros.'
  },
  {
    item_type: 'item_magico',
    id: 'hag_eye',
    name: 'Olho de Bruxa',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '400 po',
    description: 'Olho de conclave de bruxas: elas enxergam tudo o que ele vê.'
  },
  {
    item_type: 'item_magico',
    id: 'eyes_of_minute_seeing',
    name: 'Olhos da Visão Minuciosa',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '400 po',
    description: 'Enxergam detalhes minúsculos a 30 cm como se estivessem a 3 m.'
  },
  {
    item_type: 'item_magico',
    id: 'eyes_of_the_eagle',
    name: 'Olhos da Águia',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '400 po',
    description: 'Vantagem em Percepção baseada em visão e nitidez a longa distância.'
  },
  {
    item_type: 'item_magico',
    id: 'eyes_of_charming',
    name: 'Olhos do Encanto',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '400 po',
    attunement: true,
    uses: { max: 3, recharge: 'dawn' },
    description: 'Lentes que conjuram Enfeitiçar Pessoa (CD 13) três vezes ao dia.'
  },
  {
    item_type: 'item_magico',
    id: 'orb_of_direction',
    name: 'Orbe da Direção',
    category: 'Item Maravilhoso',
    rarity: 'Comum',
    price: '100 po',
    description: 'Aponta o norte verdadeiro; inútil no Subterrâneo e fora do plano material.'
  },
  {
    item_type: 'item_magico',
    id: 'orb_of_dragonkind',
    name: 'Orbe da Dragonagem',
    category: 'Item Maravilhoso',
    rarity: 'Artefato',
    price: '—',
    attunement: true,
    description: 'Artefato que domina dragões e concede magias poderosas — a um preço sombrio.'
  },
  {
    item_type: 'item_magico',
    id: 'orb_of_time',
    name: 'Orbe do Tempo',
    category: 'Item Maravilhoso',
    rarity: 'Comum',
    price: '100 po',
    description: 'Informa a hora do dia e há quanto tempo dura a estação atual.'
  },
  {
    item_type: 'item_magico',
    id: 'ioun_stone',
    name: 'Pedra Ioun',
    category: 'Item Maravilhoso',
    rarity: 'Varia',
    price: '—',
    attunement: true,
    description: 'Orbita sua cabeça concedendo um benefício conforme o tipo. Raridade varia.'
  },
  {
    item_type: 'item_magico',
    id: 'pedra_da_sorte',
    name: 'Pedra da Sorte',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '4500 po',
    attunement: true,
    description: 'Seixo polido que vibra suavemente ao toque. Enquanto carregada, concede +1 em todos os testes de atributo e salvaguardas.'
  },
  {
    item_type: 'item_magico',
    id: 'stone_of_controlling_earth_elementals',
    name: 'Pedra de Controle de Elementais da Terra',
    category: 'Item Maravilhoso',
    rarity: 'Raro',
    price: '4000 po',
    description: 'Sobre terra ou pedra, invoca um elemental da terra que obedece por 1 hora.'
  },
  {
    item_type: 'item_magico',
    id: 'sending_stones',
    name: 'Pedras de Mensagem',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '400 po',
    uses: { max: 1, recharge: 'dawn' },
    description: 'Par de pedras que conjuram Mandar Mensagem entre si, uma vez ao dia.'
  },
  {
    item_type: 'item_magico',
    id: 'perfume_of_bewitching',
    name: 'Perfume do Enfeitiçamento',
    category: 'Item Maravilhoso',
    rarity: 'Comum',
    price: '50 po',
    description: 'Por 1 hora, vantagem em testes de Carisma contra humanoides.'
  },
  {
    item_type: 'item_magico',
    id: 'periapt_of_health',
    name: 'Periapto da Saúde',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '400 po',
    attunement: true,
    description: 'Você é imune a contrair doenças.'
  },
  {
    item_type: 'item_magico',
    id: 'periapt_of_wound_closure',
    name: 'Periapto do Fechamento de Feridas',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '400 po',
    attunement: true,
    description: 'Estabiliza você automaticamente e dobra a cura dos Dados de Vida.'
  },
  {
    item_type: 'item_magico',
    id: 'periapt_of_proof_against_poison',
    name: 'Periapto à Prova de Veneno',
    category: 'Item Maravilhoso',
    rarity: 'Raro',
    price: '4000 po',
    attunement: true,
    description: 'Neutraliza venenos e concede imunidade a dano de veneno e à condição Envenenado.'
  },
  {
    item_type: 'item_magico',
    id: 'nolzur_s_marvelous_pigments',
    name: 'Pigmentos Maravilhosos de Nolzur',
    category: 'Item Maravilhoso',
    rarity: 'Muito Raro',
    price: '20000 po',
    description: 'O que você pinta vira real: portas, buracos, tesouros — mas nada vivo.'
  },
  {
    item_type: 'item_magico',
    id: 'cubic_gate',
    name: 'Portal Cúbico',
    category: 'Item Maravilhoso',
    rarity: 'Lendário',
    price: '200000 po',
    uses: { max: 3, recharge: 'dawn' },
    description: 'Seis faces, seis planos: abre portais ou conjura Deslocamento Planar. 3 cargas diárias.'
  },
  {
    item_type: 'item_magico',
    id: 'well_of_many_worlds',
    name: 'Poço dos Muitos Mundos',
    category: 'Item Maravilhoso',
    rarity: 'Lendário',
    price: '200000 po',
    description: 'Pano que abre um portal bidirecional para um plano aleatório.'
  },
  {
    item_type: 'item_magico',
    id: 'pearl_of_power',
    name: 'Pérola do Poder',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '400 po',
    attunement: true,
    uses: { max: 1, recharge: 'dawn' },
    description: 'Uma vez ao dia, recupera um espaço de magia de até 3º círculo.'
  },
  {
    item_type: 'item_magico',
    id: 'dust_of_dryness',
    name: 'Pó da Secura',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '200 po',
    description: 'Cada pitada absorve 4,5 m³ de água numa pelota que pode ser quebrada depois.'
  },
  {
    item_type: 'item_magico',
    id: 'dust_of_disappearance',
    name: 'Pó do Desaparecimento',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '200 po',
    description: 'Torna invisível todo mundo em 3 m por 2d4 minutos.'
  },
  {
    item_type: 'item_magico',
    id: 'dust_of_sneezing_and_choking',
    name: 'Pó do Espirro e Sufocamento',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '200 po',
    description: 'Armadilha: CD 15 de Constituição ou Incapacitado e sufocando em 9 m.'
  },
  {
    item_type: 'item_magico',
    id: 'clothes_of_mending',
    name: 'Roupas Autorremendáveis',
    category: 'Item Maravilhoso',
    rarity: 'Comum',
    price: '100 po',
    description: 'Consertam-se e limpam-se sozinhas, permanecendo sempre intactas.'
  },
  {
    item_type: 'item_magico',
    id: 'ruby_of_the_war_mage',
    name: 'Rubi do Mago de Guerra',
    category: 'Item Maravilhoso',
    rarity: 'Comum',
    price: '100 po',
    attunement: true,
    description: 'Fixado a uma arma, transforma-a em foco de conjuração.'
  },
  {
    item_type: 'item_magico',
    id: 'bag_of_devouring',
    name: 'Saco Devorador',
    category: 'Item Maravilhoso',
    rarity: 'Muito Raro',
    price: '40000 po',
    description: 'Boca de criatura extraplanar disfarçada de bolsa: engole e destrói o que for colocado dentro.'
  },
  {
    item_type: 'item_magico',
    id: 'bag_of_beans',
    name: 'Saco de Feijões',
    category: 'Item Maravilhoso',
    rarity: 'Raro',
    price: '2000 po',
    description: 'Feijões plantados produzem efeitos mágicos aleatórios, de árvores frutíferas a criaturas hostis.'
  },
  {
    item_type: 'item_magico',
    id: 'bag_of_tricks',
    name: 'Saco de Truques',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '400 po',
    description: 'Bolinhas felpudas viram animais que obedecem você por até 1 hora. 3 usos diários.'
  },
  {
    item_type: 'item_magico',
    id: 'slippers_of_spider_climbing',
    name: 'Sapatilhas de Escalada Aracnídea',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '400 po',
    attunement: true,
    description: 'Você escala paredes e tetos com as mãos livres, mas não superfícies escorregadias.'
  },
  {
    item_type: 'item_magico',
    id: 'saddle_of_the_cavalier',
    name: 'Sela do Cavaleiro',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '400 po',
    description: 'Vantagem contra ser derrubado da montaria e você nunca cai dela sem querer.'
  },
  {
    item_type: 'item_magico',
    id: 'chime_of_opening',
    name: 'Sino de Abertura',
    category: 'Item Maravilhoso',
    rarity: 'Raro',
    price: '2000 po',
    description: 'Abre uma tranca, ferrolho ou fechadura a até 36 m. Dez usos.'
  },
  {
    item_type: 'item_magico',
    id: 'universal_solvent',
    name: 'Solvente Universal',
    category: 'Item Maravilhoso',
    rarity: 'Lendário',
    price: '100000 po',
    description: 'Dissolve qualquer adesivo que toque, inclusive a Cola Soberana.'
  },
  {
    item_type: 'item_magico',
    id: 'talisman_of_the_sphere',
    name: 'Talismã da Esfera',
    category: 'Item Maravilhoso',
    rarity: 'Lendário',
    price: '200000 po',
    attunement: true,
    description: 'Dobra sua chance de controlar uma Esfera da Aniquilação.'
  },
  {
    item_type: 'item_magico',
    id: 'talisman_of_pure_good',
    name: 'Talismã do Bem Puro',
    category: 'Item Maravilhoso',
    rarity: 'Lendário',
    price: '200000 po',
    attunement: true,
    description: '+2 na CD das suas magias e pode aniquilar criaturas malignas num abismo de luz.'
  },
  {
    item_type: 'item_magico',
    id: 'talisman_of_ultimate_evil',
    name: 'Talismã do Mal Supremo',
    category: 'Item Maravilhoso',
    rarity: 'Lendário',
    price: '200000 po',
    attunement: true,
    description: '+2 na CD das suas magias e pode aniquilar criaturas bondosas numa fenda ardente.'
  },
  {
    item_type: 'item_magico',
    id: 'carpet_of_flying',
    name: 'Tapete Voador',
    category: 'Item Maravilhoso',
    rarity: 'Muito Raro',
    price: '40000 po',
    description: 'Voa e paira carregando o dobro de sua capacidade; velocidade e carga variam pelo tamanho.'
  },
  {
    item_type: 'item_magico',
    id: 'circlet_of_blasting',
    name: 'Tiara Explosiva',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '400 po',
    uses: { max: 1, recharge: 'dawn' },
    description: 'Conjura Raio Ardente (+5 de ataque, 2d6 radiante) uma vez ao dia.'
  },
  {
    item_type: 'item_magico',
    id: 'bowl_of_commanding_water_elementals',
    name: 'Tigela de Comando de Elementais da Água',
    category: 'Item Maravilhoso',
    rarity: 'Raro',
    price: '4000 po',
    description: 'Cheia de água, invoca um elemental da água que obedece você por 1 hora.'
  },
  {
    item_type: 'item_magico',
    id: 'tome_of_leadership_and_influence',
    name: 'Tomo da Liderança e Influência',
    category: 'Item Maravilhoso',
    rarity: 'Muito Raro',
    price: '20000 po',
    description: '48 horas de estudo aumentam Carisma em 2, junto com seu máximo.'
  },
  {
    item_type: 'item_magico',
    id: 'tome_of_the_stilled_tongue',
    name: 'Tomo da Língua Silenciada',
    category: 'Item Maravilhoso',
    rarity: 'Lendário',
    price: '200000 po',
    attunement: true,
    description: 'Grimório de Vecna com língua ressecada na lombada: guarda e devora magias.'
  },
  {
    item_type: 'item_magico',
    id: 'tome_of_understanding',
    name: 'Tomo do Entendimento',
    category: 'Item Maravilhoso',
    rarity: 'Muito Raro',
    price: '20000 po',
    description: '48 horas de estudo aumentam Sabedoria em 2, junto com seu máximo.'
  },
  {
    item_type: 'item_magico',
    id: 'tome_of_clear_thought',
    name: 'Tomo do Pensamento Claro',
    category: 'Item Maravilhoso',
    rarity: 'Muito Raro',
    price: '20000 po',
    description: '48 horas de estudo aumentam Inteligência em 2, junto com seu máximo.'
  },
  {
    item_type: 'item_magico',
    id: 'horn_of_blasting',
    name: 'Trompa Explosiva',
    category: 'Item Maravilhoso',
    rarity: 'Raro',
    price: '4000 po',
    description: 'Cone de 9 m: 5d6 de trovejante e Surdo por 1 minuto (CD 15).'
  },
  {
    item_type: 'item_magico',
    id: 'horn_of_silent_alarm',
    name: 'Trompa de Alarme Silencioso',
    category: 'Item Maravilhoso',
    rarity: 'Comum',
    price: '100 po',
    uses: { max: 4, recharge: 'dawn' },
    description: 'Só quem você escolhe, a até 180 m, ouve o toque. 4 cargas diárias.'
  },
  {
    item_type: 'item_magico',
    id: 'horn_of_valhalla',
    name: 'Trompa de Valhalla',
    category: 'Item Maravilhoso',
    rarity: 'Varia',
    price: '—',
    description: 'Invoca guerreiros espectrais que lutam por você. Poder e raridade variam pelo metal.'
  },
  {
    item_type: 'item_magico',
    id: 'censer_of_controlling_air_elementals',
    name: 'Turíbulo de Controle de Elementais do Ar',
    category: 'Item Maravilhoso',
    rarity: 'Raro',
    price: '4000 po',
    description: 'Com incenso aceso, invoca um elemental do ar que obedece você por 1 hora.'
  },
  {
    item_type: 'item_magico',
    id: 'spirit_board',
    name: 'Tábua dos Espíritos',
    category: 'Item Maravilhoso',
    rarity: 'Muito Raro',
    price: '40000 po',
    description: 'Permite fazer perguntas a espíritos dos mortos, com respostas curtas e ambíguas.'
  },
  {
    item_type: 'item_magico',
    id: 'keoghtom_s_ointment',
    name: 'Unguento de Keoghtom',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '200 po',
    description: 'Cada dose cura 2d8+2 PV e encerra veneno e doenças. Até 5 doses.'
  },
  {
    item_type: 'item_magico',
    id: 'pole_of_collapsing',
    name: 'Vara Retrátil',
    category: 'Item Maravilhoso',
    rarity: 'Comum',
    price: '100 po',
    description: 'Encolhe de 3 m para 30 cm e volta ao normal com uma ação.'
  },
  {
    item_type: 'item_magico',
    id: 'pole_of_angling',
    name: 'Vara de Pesca',
    category: 'Item Maravilhoso',
    rarity: 'Comum',
    price: '100 po',
    description: 'A vara de 3 m vira caniço completo, com linha, anzol e molinete.'
  },
  {
    item_type: 'item_magico',
    id: 'pot_of_awakening',
    name: 'Vaso do Despertar',
    category: 'Item Maravilhoso',
    rarity: 'Comum',
    price: '100 po',
    description: 'Após 30 dias, a planta plantada nele desperta como um arbusto desperto.'
  },
  {
    item_type: 'item_magico',
    id: 'baba_yaga_s_dancing_broom',
    name: 'Vassoura Dançante de Baba Yaga',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '400 po',
    attunement: true,
    description: 'Vassoura que se anima e varre sozinha, e pode lutar como um servo temporário.'
  },
  {
    item_type: 'item_magico',
    id: 'broom_of_flying',
    name: 'Vassoura Voadora',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '400 po',
    attunement: true,
    description: 'Voa a 15 m carregando até 90 kg, e vem sozinha quando chamada a até 9 m.'
  },
  {
    item_type: 'item_magico',
    id: 'candle_of_the_deep',
    name: 'Vela das Profundezas',
    category: 'Item Maravilhoso',
    rarity: 'Comum',
    price: '100 po',
    description: 'A chama não se apaga com o vento e queima até debaixo d’água.'
  },
  {
    item_type: 'item_magico',
    id: 'candle_of_invocation',
    name: 'Vela de Invocação',
    category: 'Item Maravilhoso',
    rarity: 'Muito Raro',
    price: '20000 po',
    attunement: true,
    description: 'Acesa, concede vantagem em jogadas de ataque e salvaguardas a quem partilha seu alinhamento.'
  },
  {
    item_type: 'item_magico',
    id: 'goggles_of_night',
    name: 'Óculos Noturnos',
    category: 'Item Maravilhoso',
    rarity: 'Incomum',
    price: '400 po',
    description: 'Concedem visão no escuro de 18 m, ou +18 m se você já tiver.'
  }
]
