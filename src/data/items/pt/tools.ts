import type { Tool } from '../types'

export const TOOLS: Tool[] = [
  // ─── FERRAMENTAS DE ARTESÃO ───────────────────────────────────────────────
  {
    item_type: 'ferramenta',
    id: 'ferramentas_de_alquimista',
    name: 'Ferramentas de Alquimista',
    category: 'Ferramentas de Artesão',
    price: '50 po',
    weight: '4.0 kg',
    description: 'Béqueres de vidro, almofariz, pilão e reagentes químicos. Usadas para criar poções, fogo alquímico e antitoxinas.'
  },
  {
    item_type: 'ferramenta',
    id: 'ferramentas_de_ferreiro',
    name: 'Ferramentas de Ferreiro',
    category: 'Ferramentas de Artesão',
    price: '20 po',
    weight: '4.0 kg',
    description: 'Martelos, tenaças, bigorna portátil, carvão e limas. Essencial para reparar armaduras, afiar espadas e forjar metais.'
  },
  {
    item_type: 'ferramenta',
    id: 'ferramentas_de_carpinteiro',
    name: 'Ferramentas de Carpinteiro',
    category: 'Ferramentas de Artesão',
    price: '8 po',
    weight: '3.0 kg',
    description: 'Serra, formões, martelo, pregos, enxó e plaina. Útil para reforçar portas, construir barricadas e reparar veículos.'
  },
  {
    item_type: 'ferramenta',
    id: 'ferramentas_de_cartografo',
    name: 'Ferramentas de Cartógrafo',
    category: 'Ferramentas de Artesão',
    price: '15 po',
    weight: '3.0 kg',
    description: 'Tinta, penas, pergaminhos, compassos, réguas e tubo de armazenamento. Permite mapear masmorras e territórios selvagens com precisão.'
  },
  {
    item_type: 'ferramenta',
    id: 'ferramentas_de_coureiro',
    name: 'Ferramentas de Coureiro',
    category: 'Ferramentas de Artesão',
    price: '5 po',
    weight: '2.5 kg',
    description: 'Facas para raspar couro, agulhas grossas, fios reforçados e furadores. Para costurar e consertar armaduras e equipamentos de couro.'
  },
  {
    item_type: 'ferramenta',
    id: 'utensilios_de_cozinha',
    name: 'Utensílios de Cozinha',
    category: 'Ferramentas de Artesão',
    price: '1 po',
    weight: '4.0 kg',
    description: 'Panela de ferro, facas de corte, colheres de madeira, temperos e peneira. Permite preparar refeições nutritivas em descansos longos.'
  },
  {
    item_type: 'ferramenta',
    id: 'ferramentas_de_caligrafo',
    name: 'Ferramentas de Calígrafo',
    category: 'Ferramentas de Artesão',
    price: '10 po',
    weight: '2.5 kg',
    description: 'Penas finas, tintas coloridas, pergaminhos e réguas. Usadas para copiar documentos, criar pergaminhos mágicos e falsificar escritos com precisão artística.'
  },
  {
    item_type: 'ferramenta',
    id: 'ferramentas_de_cervejeiro',
    name: 'Ferramentas de Cervejeiro',
    category: 'Ferramentas de Artesão',
    price: '20 po',
    weight: '4.5 kg',
    description: 'Barril pequeno, funil, termômetro rudimentar e ingredientes base. Permite fermentar cervejas, hidroméis e licores durante descansos prolongados.'
  },
  {
    item_type: 'ferramenta',
    id: 'ferramentas_de_joalheiro',
    name: 'Ferramentas de Joalheiro',
    category: 'Ferramentas de Artesão',
    price: '25 po',
    weight: '1.0 kg',
    description: 'Lupa, pinças de precisão, limas finas e moldes de cera. Para avaliar, lapidار e engastar gemas preciosas em joias e amuletos.'
  },
  {
    item_type: 'ferramenta',
    id: 'ferramentas_de_oleiro',
    name: 'Ferramentas de Oleiro',
    category: 'Ferramentas de Artesão',
    price: '10 po',
    weight: '1.5 kg',
    description: 'Roda de mão portátil, ferramentas de modelagem e pigmentos. Usadas para criar recipientes de cerâmica, vasos e urnas funcionais.'
  },
  {
    item_type: 'ferramenta',
    id: 'ferramentas_de_pedreiro',
    name: 'Ferramentas de Pedreiro',
    category: 'Ferramentas de Artesão',
    price: '10 po',
    weight: '4.0 kg',
    description: 'Cinzel, maço, nível e trolha. Permite identificar fraquezas em estruturas de pedra, construir muros e trabalhar com alvenaria.'
  },
  {
    item_type: 'ferramenta',
    id: 'ferramentas_de_pintor',
    name: 'Ferramentas de Pintor',
    category: 'Ferramentas de Artesão',
    price: '10 po',
    weight: '2.5 kg',
    description: 'Pincéis de diversos tamanhos, pigmentos e óleos fixadores. Para criar pinturas, disfarçar objetos e reproduzir imagens com fidelidade.'
  },
  {
    item_type: 'ferramenta',
    id: 'ferramentas_de_sapateiro',
    name: 'Ferramentas de Sapateiro',
    category: 'Ferramentas de Artesão',
    price: '5 po',
    weight: '2.5 kg',
    description: 'Forma de madeira, agulhas, fios de couro e pregos de metal. Permite fabricar e reparar botas, sandálias e outros calçados.'
  },
  {
    item_type: 'ferramenta',
    id: 'ferramentas_de_tecedor',
    name: 'Ferramentas de Tecedor',
    category: 'Ferramentas de Artesão',
    price: '1 po',
    weight: '2.5 kg',
    description: 'Tear portátil, agulhas de tricô e bobinas de fio. Permite produzir roupas simples, redes e tecidos funcionais durante viagens.'
  },
  {
    item_type: 'ferramenta',
    id: 'ferramentas_de_vidraceiro',
    name: 'Ferramentas de Vidraceiro',
    category: 'Ferramentas de Artesão',
    price: '30 po',
    weight: '2.5 kg',
    description: 'Cortadores de vidro, moldes e pinças refratárias. Para trabalhar com vidro soprado, identificar cristais mágicos e criar recipientes especiais.'
  },
  {
    item_type: 'ferramenta',
    id: 'ferramentas_de_escultor',
    name: 'Ferramentas de Escultor em Madeira',
    category: 'Ferramentas de Artesão',
    price: '1 po',
    weight: '2.5 kg',
    description: 'Formões de precisão, lixas e cera de acabamento. Permite entalhar madeira em itens funcionais, peças decorativas e cabos de armas.'
  },
  {
    item_type: 'ferramenta',
    id: 'ferramentas_de_funileiro',
    name: 'Ferramentas de Funileiro',
    category: 'Ferramentas de Artesão',
    price: '50 po',
    weight: '5.0 kg',
    description: 'Rebites, latão, ferro em barra e ferramentas de precisão. Permitem consertar objetos mecânicos e montar dispositivos improvisados.'
  },
  // ─── UTILITÁRIO ────────────────────────────────────────────────────────────
  {
    item_type: 'ferramenta',
    id: 'ferramentas_de_ladrao',
    name: 'Ferramentas de Ladrão',
    category: 'Utilitário',
    price: '25 po',
    weight: '0.5 kg',
    description: 'Lima, jogo de gazuas, espelhos em hastes, pinças e tesouras estreitas. Usada para arrombar fechaduras e desarmar armadilhas.'
  },
  {
    item_type: 'ferramenta',
    id: 'kit_de_disfarce',
    name: 'Kit de Disfarce',
    category: 'Utilitário',
    price: '25 po',
    sale_price: '12.5 po',
    weight: '1.5 kg',
    description: 'Cosméticos, tinturas de cabelo, próteses de cera e peças de vestuário variadas. Permite alterar completamente a aparência física.'
  },
  {
    item_type: 'ferramenta',
    id: 'kit_de_falsificacao',
    name: 'Kit de Falsificação',
    category: 'Utilitário',
    price: '15 po',
    weight: '2.5 kg',
    description: 'Papéis, tintas raras, lacres de cera e sinetes em branco. Para forjar documentos, cartas oficiais e selos de autoridade.'
  },
  {
    item_type: 'ferramenta',
    id: 'kit_de_herbalismo',
    name: 'Kit de Herbalismo',
    category: 'Utilitário',
    price: '5 po',
    weight: '1.5 kg',
    description: 'Bolsas para ervas, tesouras de colheita, luvas e frascos vazios. Requisitado para criar poções de cura e antídotos naturais.'
  },
  {
    item_type: 'ferramenta',
    id: 'kit_de_envenenador',
    name: 'Kit de Envenenador',
    category: 'Utilitário',
    price: '50 po',
    weight: '1.0 kg',
    description: 'Frascos selados, pipetas, luvas de couro grosso e reagentes químicos. Permite coletar, purificar e aplicar venenos em armas sem risco de auto-intoxicação.'
  },
  {
    item_type: 'ferramenta',
    id: 'ferramentas_de_navegador',
    name: 'Ferramentas de Navegador',
    category: 'Utilitário',
    price: '25 po',
    weight: '1.0 kg',
    description: 'Sextante, bússola, tabelas de estrelas e cartas náuticas. Permite navegar por oceanos e terrenos desconhecidos sem perder a orientação.'
  },

  // ─── JOGOS ─────────────────────────────────────────────────────────────────
  {
    item_type: 'ferramenta',
    id: 'jogo_de_dados',
    name: 'Conjunto de Dados',
    category: 'Jogos',
    price: '1 pp',
    weight: '0.0 kg',
    description: 'Dados de osso ou madeira. Pode incluir dados viciados para trapacear em apostas de taverna (exige testes de Prestidigitação).'
  },
  {
    item_type: 'ferramenta',
    id: 'jogo_de_cartas',
    name: 'Baralho de Cartas',
    category: 'Jogos',
    price: '5 pp',
    weight: '0.0 kg',
    description: 'Baralho completo com ilustrações rústicas. Usado para passar o tempo durante vigílias longas ou para apostas em estalagens.'
  },
  {
    item_type: 'ferramenta',
    id: 'xadrez_do_dragao',
    name: 'Xadrez do Dragão',
    category: 'Jogos',
    price: '1 po',
    weight: '0.5 kg',
    description: 'Jogo de estratégia com peças entalhadas representando criaturas fantásticas. Popular entre nobres, táticos e aventureiros intelectuais.'
  },
  {
    item_type: 'ferramenta',
    id: 'aposta_dos_tres_dragoes',
    name: 'Aposta dos Três Dragões',
    category: 'Jogos',
    price: '1 po',
    weight: '0.0 kg',
    description: 'Jogo de cartas de apostas popular em tavernas e salões nobres. Recompensa blefe tanto quanto cálculo.'
  },
  // ─── INSTRUMENTOS MUSICAIS ────────────────────────────────────────────────
  {
    item_type: 'ferramenta',
    id: 'alaude',
    name: 'Alaúde',
    category: 'Instrumento Musical',
    price: '35 po',
    weight: '1.0 kg',
    description: 'Instrumento de cordas dedilhadas com caixa de ressonância em forma de pera. O favorito dos bardos para acompanhar baladas épicas.'
  },
  {
    item_type: 'ferramenta',
    id: 'flauta',
    name: 'Flauta',
    category: 'Instrumento Musical',
    price: '2 po',
    weight: '0.5 kg',
    description: 'Instrumento de sopro simples de madeira ou bambu. Produz melodias suaves e melancólicas, ideal para músicos iniciantes.'
  },
  {
    item_type: 'ferramenta',
    id: 'tambor',
    name: 'Tambor',
    category: 'Instrumento Musical',
    price: '6 po',
    weight: '1.5 kg',
    description: 'Instrumento de percussão de madeira e couro esticado. Perfeito para ditar o ritmo de marchas militares ou rituais tribais.'
  },
  {
    item_type: 'ferramenta',
    id: 'lira',
    name: 'Lira',
    category: 'Instrumento Musical',
    price: '30 po',
    weight: '1.0 kg',
    description: 'Pequeno instrumento de harpa portátil com som celestial. Muito associado a ambientes aristocráticos, divinos e músicos de corte.'
  },
  {
    item_type: 'ferramenta',
    id: 'gaita_de_foles',
    name: 'Gaita de Foles',
    category: 'Instrumento Musical',
    price: '30 po',
    weight: '3.5 kg',
    description: 'Instrumento de vento com fole de couro e tubos de madeira. Som inconfundível e penetrante, associado a culturas montanhesas e guerreiras.'
  },
  {
    item_type: 'ferramenta',
    id: 'salterio',
    name: 'Saltério',
    category: 'Instrumento Musical',
    price: '25 po',
    weight: '5.0 kg',
    description: 'Instrumento de cordas com moldura em arco e som etéreo. Associado a fadas, elfos e músicos de habilidade excepcional.'
  },
  {
    item_type: 'ferramenta',
    id: 'trompete',
    name: 'Trompete',
    category: 'Instrumento Musical',
    price: '3 po',
    weight: '1.0 kg',
    description: 'Instrumento de sopro de metal com som potente e penetrante. Usado em sinais militares, fanfarras e anúncios de alta autoridade.'
  },
  {
    item_type: 'ferramenta',
    id: 'flauta_de_pa',
    name: 'Flauta de Pã',
    category: 'Instrumento Musical',
    price: '12 po',
    weight: '1.0 kg',
    description: 'Conjunto de tubos de bambu de tamanhos variados. Instrumento de sopro rústico com som pastoral, favorito de druidas e músicos da natureza.'
  },
  {
    item_type: 'ferramenta',
    id: 'viola',
    name: 'Viola',
    category: 'Instrumento Musical',
    price: '30 po',
    weight: '0.5 kg',
    description: 'Instrumento de cordas friccionadas com arco, de som rico e ressonante. Preferido por bardos clássicos em apresentações formais e banquetes nobres.'
  },
  {
    item_type: 'ferramenta',
    id: 'charamela',
    name: 'Charamela',
    category: 'Instrumento Musical',
    price: '2 po',
    weight: '0.5 kg',
    description: 'Instrumento de sopro de palheta dupla, de som estridente. Comum em festas populares e cortejos militares.'
  }
]
