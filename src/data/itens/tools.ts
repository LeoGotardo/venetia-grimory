import type { Ferramenta } from './types'

export const FERRAMENTAS: Ferramenta[] = [
  // ─── FERRAMENTAS DE ARTESÃO ───────────────────────────────────────────────
  {
    tipo_item: 'ferramenta',
    id: 'ferramentas_de_alquimista',
    nome: 'Ferramentas de Alquimista',
    categoria: 'Ferramentas de Artesão',
    preco: '50 po',
    peso: '4.0 kg',
    descricao: 'Béqueres de vidro, almofariz, pilão e reagentes químicos. Usadas para criar poções, fogo alquímico e antitoxinas.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'ferramentas_de_ferreiro',
    nome: 'Ferramentas de Ferreiro',
    categoria: 'Ferramentas de Artesão',
    preco: '20 po',
    peso: '4.0 kg',
    descricao: 'Martelos, tenaças, bigorna portátil, carvão e limas. Essencial para reparar armaduras, afiar espadas e forjar metais.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'ferramentas_de_carpinteiro',
    nome: 'Ferramentas de Carpinteiro',
    categoria: 'Ferramentas de Artesão',
    preco: '8 po',
    peso: '3.0 kg',
    descricao: 'Serra, formões, martelo, pregos, enxó e plaina. Útil para reforçar portas, construir barricadas e reparar veículos.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'ferramentas_de_cartografo',
    nome: 'Ferramentas de Cartógrafo',
    categoria: 'Ferramentas de Artesão',
    preco: '15 po',
    peso: '3.0 kg',
    descricao: 'Tinta, penas, pergaminhos, compassos, réguas e tubo de armazenamento. Permite mapear masmorras e territórios selvagens com precisão.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'ferramentas_de_coureiro',
    nome: 'Ferramentas de Coureiro',
    categoria: 'Ferramentas de Artesão',
    preco: '5 po',
    peso: '2.5 kg',
    descricao: 'Facas para raspar couro, agulhas grossas, fios reforçados e furadores. Para costurar e consertar armaduras e equipamentos de couro.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'utensilios_de_cozinha',
    nome: 'Utensílios de Cozinha',
    categoria: 'Ferramentas de Artesão',
    preco: '1 po',
    peso: '4.0 kg',
    descricao: 'Panela de ferro, facas de corte, colheres de madeira, temperos e peneira. Permite preparar refeições nutritivas em descansos longos.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'ferramentas_de_caligrafo',
    nome: 'Ferramentas de Calígrafo',
    categoria: 'Ferramentas de Artesão',
    preco: '10 po',
    peso: '2.5 kg',
    descricao: 'Penas finas, tintas coloridas, pergaminhos e réguas. Usadas para copiar documentos, criar pergaminhos mágicos e falsificar escritos com precisão artística.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'ferramentas_de_cervejeiro',
    nome: 'Ferramentas de Cervejeiro',
    categoria: 'Ferramentas de Artesão',
    preco: '20 po',
    peso: '4.5 kg',
    descricao: 'Barril pequeno, funil, termômetro rudimentar e ingredientes base. Permite fermentar cervejas, hidroméis e licores durante descansos prolongados.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'ferramentas_de_joalheiro',
    nome: 'Ferramentas de Joalheiro',
    categoria: 'Ferramentas de Artesão',
    preco: '25 po',
    peso: '2.0 kg',
    descricao: 'Lupa, pinças de precisão, limas finas e moldes de cera. Para avaliar, lapidار e engastar gemas preciosas em joias e amuletos.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'ferramentas_de_oleiro',
    nome: 'Ferramentas de Oleiro',
    categoria: 'Ferramentas de Artesão',
    preco: '10 po',
    peso: '2.5 kg',
    descricao: 'Roda de mão portátil, ferramentas de modelagem e pigmentos. Usadas para criar recipientes de cerâmica, vasos e urnas funcionais.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'ferramentas_de_pedreiro',
    nome: 'Ferramentas de Pedreiro',
    categoria: 'Ferramentas de Artesão',
    preco: '10 po',
    peso: '4.0 kg',
    descricao: 'Cinzel, maço, nível e trolha. Permite identificar fraquezas em estruturas de pedra, construir muros e trabalhar com alvenaria.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'ferramentas_de_pintor',
    nome: 'Ferramentas de Pintor',
    categoria: 'Ferramentas de Artesão',
    preco: '10 po',
    peso: '2.5 kg',
    descricao: 'Pincéis de diversos tamanhos, pigmentos e óleos fixadores. Para criar pinturas, disfarçar objetos e reproduzir imagens com fidelidade.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'ferramentas_de_sapateiro',
    nome: 'Ferramentas de Sapateiro',
    categoria: 'Ferramentas de Artesão',
    preco: '5 po',
    peso: '2.5 kg',
    descricao: 'Forma de madeira, agulhas, fios de couro e pregos de metal. Permite fabricar e reparar botas, sandálias e outros calçados.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'ferramentas_de_tecedor',
    nome: 'Ferramentas de Tecedor',
    categoria: 'Ferramentas de Artesão',
    preco: '1 po',
    peso: '2.5 kg',
    descricao: 'Tear portátil, agulhas de tricô e bobinas de fio. Permite produzir roupas simples, redes e tecidos funcionais durante viagens.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'ferramentas_de_vidraceiro',
    nome: 'Ferramentas de Vidraceiro',
    categoria: 'Ferramentas de Artesão',
    preco: '30 po',
    peso: '2.5 kg',
    descricao: 'Cortadores de vidro, moldes e pinças refratárias. Para trabalhar com vidro soprado, identificar cristais mágicos e criar recipientes especiais.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'ferramentas_de_escultor',
    nome: 'Ferramentas de Escultor em Madeira',
    categoria: 'Ferramentas de Artesão',
    preco: '1 po',
    peso: '2.5 kg',
    descricao: 'Formões de precisão, lixas e cera de acabamento. Permite entalhar madeira em itens funcionais, peças decorativas e cabos de armas.'
  },

  // ─── UTILITÁRIO ────────────────────────────────────────────────────────────
  {
    tipo_item: 'ferramenta',
    id: 'ferramentas_de_ladrao',
    nome: 'Ferramentas de Ladrão',
    categoria: 'Utilitário',
    preco: '25 po',
    peso: '0.5 kg',
    descricao: 'Lima, jogo de gazuas, espelhos em hastes, pinças e tesouras estreitas. Usada para arrombar fechaduras e desarmar armadilhas.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'kit_de_disfarce',
    nome: 'Kit de Disfarce',
    categoria: 'Utilitário',
    preco: '25 po',
    preco_venda: '12.5 po',
    peso: '1.5 kg',
    descricao: 'Cosméticos, tinturas de cabelo, próteses de cera e peças de vestuário variadas. Permite alterar completamente a aparência física.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'kit_de_falsificacao',
    nome: 'Kit de Falsificação',
    categoria: 'Utilitário',
    preco: '15 po',
    peso: '2.5 kg',
    descricao: 'Papéis, tintas raras, lacres de cera e sinetes em branco. Para forjar documentos, cartas oficiais e selos de autoridade.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'kit_de_herbalismo',
    nome: 'Kit de Herbalismo',
    categoria: 'Utilitário',
    preco: '5 po',
    peso: '1.5 kg',
    descricao: 'Bolsas para ervas, tesouras de colheita, luvas e frascos vazios. Requisitado para criar poções de cura e antídotos naturais.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'kit_de_envenenador',
    nome: 'Kit de Envenenador',
    categoria: 'Utilitário',
    preco: '50 po',
    peso: '1.0 kg',
    descricao: 'Frascos selados, pipetas, luvas de couro grosso e reagentes químicos. Permite coletar, purificar e aplicar venenos em armas sem risco de auto-intoxicação.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'ferramentas_de_navegador',
    nome: 'Ferramentas de Navegador',
    categoria: 'Utilitário',
    preco: '25 po',
    peso: '2.0 kg',
    descricao: 'Sextante, bússola, tabelas de estrelas e cartas náuticas. Permite navegar por oceanos e terrenos desconhecidos sem perder a orientação.'
  },

  // ─── JOGOS ─────────────────────────────────────────────────────────────────
  {
    tipo_item: 'ferramenta',
    id: 'jogo_de_dados',
    nome: 'Conjunto de Dados',
    categoria: 'Jogos',
    preco: '1 pp',
    peso: '0.0 kg',
    descricao: 'Dados de osso ou madeira. Pode incluir dados viciados para trapacear em apostas de taverna (exige testes de Prestidigitação).'
  },
  {
    tipo_item: 'ferramenta',
    id: 'jogo_de_cartas',
    nome: 'Baralho de Cartas',
    categoria: 'Jogos',
    preco: '5 pp',
    peso: '0.0 kg',
    descricao: 'Baralho completo com ilustrações rústicas. Usado para passar o tempo durante vigílias longas ou para apostas em estalagens.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'xadrez_do_dragao',
    nome: 'Xadrez do Dragão',
    categoria: 'Jogos',
    preco: '1 po',
    peso: '0.5 kg',
    descricao: 'Jogo de estratégia com peças entalhadas representando criaturas fantásticas. Popular entre nobres, táticos e aventureiros intelectuais.'
  },

  // ─── INSTRUMENTOS MUSICAIS ────────────────────────────────────────────────
  {
    tipo_item: 'ferramenta',
    id: 'alaude',
    nome: 'Alaúde',
    categoria: 'Instrumento Musical',
    preco: '35 po',
    peso: '1.0 kg',
    descricao: 'Instrumento de cordas dedilhadas com caixa de ressonância em forma de pera. O favorito dos bardos para acompanhar baladas épicas.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'flauta',
    nome: 'Flauta',
    categoria: 'Instrumento Musical',
    preco: '2 po',
    peso: '0.5 kg',
    descricao: 'Instrumento de sopro simples de madeira ou bambu. Produz melodias suaves e melancólicas, ideal para músicos iniciantes.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'tambor',
    nome: 'Tambor',
    categoria: 'Instrumento Musical',
    preco: '6 po',
    peso: '1.5 kg',
    descricao: 'Instrumento de percussão de madeira e couro esticado. Perfeito para ditar o ritmo de marchas militares ou rituais tribais.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'lira',
    nome: 'Lira',
    categoria: 'Instrumento Musical',
    preco: '30 po',
    peso: '1.0 kg',
    descricao: 'Pequeno instrumento de harpa portátil com som celestial. Muito associado a ambientes aristocráticos, divinos e músicos de corte.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'gaita_de_foles',
    nome: 'Gaita de Foles',
    categoria: 'Instrumento Musical',
    preco: '30 po',
    peso: '3.5 kg',
    descricao: 'Instrumento de vento com fole de couro e tubos de madeira. Som inconfundível e penetrante, associado a culturas montanhesas e guerreiras.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'harpa',
    nome: 'Harpa',
    categoria: 'Instrumento Musical',
    preco: '25 po',
    peso: '2.5 kg',
    descricao: 'Instrumento de cordas com moldura em arco e som etéreo. Associado a fadas, elfos e músicos de habilidade excepcional.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'trompete',
    nome: 'Trompete',
    categoria: 'Instrumento Musical',
    preco: '3 po',
    peso: '1.0 kg',
    descricao: 'Instrumento de sopro de metal com som potente e penetrante. Usado em sinais militares, fanfarras e anúncios de alta autoridade.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'flauta_de_pa',
    nome: 'Flauta de Pã',
    categoria: 'Instrumento Musical',
    preco: '12 po',
    peso: '1.0 kg',
    descricao: 'Conjunto de tubos de bambu de tamanhos variados. Instrumento de sopro rústico com som pastoral, favorito de druidas e músicos da natureza.'
  },
  {
    tipo_item: 'ferramenta',
    id: 'viola',
    nome: 'Viola',
    categoria: 'Instrumento Musical',
    preco: '30 po',
    peso: '1.5 kg',
    descricao: 'Instrumento de cordas friccionadas com arco, de som rico e ressonante. Preferido por bardos clássicos em apresentações formais e banquetes nobres.'
  }
]
