import type { Transport } from '../types'

export const MOUNTS_AND_VEHICLES: Transport[] = [
  // ─── MONTARIAS E ANIMAIS DE CARGA ─────────────────────────────────────────
  {
    item_type: 'transporte',
    id: 'cavalo_de_montaria',
    name: 'Cavalo de Montaria',
    category: 'Montaria Terrestre',
    price: '75 po',
    speed: '18 m',
    carry_capacity: '240 kg',
    description: 'Cavalo padrão treinado para transporte de viajantes. Não é ideal para combate direto e pode assustar-se com o caos da batalha.'
  },
  {
    item_type: 'transporte',
    id: 'cavalo_de_guerra',
    name: 'Cavalo de Guerra',
    category: 'Montaria Terrestre',
    price: '400 po',
    speed: '18 m',
    carry_capacity: '270 kg',
    description: 'Montaria imponente treinada para o combate. Não se assusta com espadas e pode desferir ataques com os cascos durante batalhas.'
  },
  {
    item_type: 'transporte',
    id: 'ponei',
    name: 'Pônei',
    category: 'Montaria Terrestre',
    price: '30 po',
    speed: '12 m',
    carry_capacity: '112.5 kg',
    description: 'Montaria menor, ideal para raças de tamanho Pequeno como Halflings e Gnomos. Também usado como animal de carga em minas.'
  },
  {
    item_type: 'transporte',
    id: 'camelo',
    name: 'Camelo',
    category: 'Montaria Terrestre',
    price: '50 po',
    speed: '15 m',
    carry_capacity: '225 kg',
    description: 'Montaria resistente para climas áridos e desertos. Pode passar vários dias sem água e carrega carga pesada por longas distâncias.'
  },
  {
    item_type: 'transporte',
    id: 'elefante',
    name: 'Elefante',
    category: 'Montaria Terrestre',
    price: '200 po',
    speed: '12 m',
    carry_capacity: '660 kg',
    description: 'Montaria colossal capaz de carregar enormes quantidades de carga ou múltiplos passageiros. Raro fora de regiões tropicais e selváticas.'
  },
  {
    item_type: 'transporte',
    id: 'burro_ou_mula',
    name: 'Burro ou Mula',
    category: 'Animal de Carga',
    price: '8 po',
    speed: '12 m',
    carry_capacity: '210 kg',
    description: 'Animais firmes e obstinados com excelente capacidade de carga. Lentos mas resistentes em trilhas íngremes e terrenos difíceis.'
  },

  {
    item_type: 'transporte',
    id: 'cavalo_de_carga',
    name: 'Cavalo de Carga',
    category: 'Animal de Carga',
    price: '50 po',
    speed: '18 m',
    carry_capacity: '270 kg',
    description: 'Cavalo pesado criado para puxar arados e carroças. Lento em combate, mas move cargas que nenhuma montaria comum aguenta.'
  },
  {
    item_type: 'transporte',
    id: 'mastim',
    name: 'Mastim',
    category: 'Montaria Terrestre',
    price: '25 po',
    speed: '12 m',
    carry_capacity: '97.5 kg',
    description: 'Cão de guerra grande o bastante para servir de montaria a Pequenos. Também usado como farejador e guarda de acampamento.'
  },
  // ─── ARREIOS E ACESSÓRIOS ─────────────────────────────────────────────────
  {
    item_type: 'transporte',
    id: 'sela_de_viagem',
    name: 'Sela de Viagem',
    category: 'Arreio',
    price: '10 po',
    weight: '5.0 kg',
    description: 'Sela acolchoada projetada para garantir conforto ao cavaleiro e à montaria durante longas jornadas de dias seguidos.'
  },
  {
    item_type: 'transporte',
    id: 'sela_de_guerra',
    name: 'Sela de Guerra',
    category: 'Arreio',
    price: '20 po',
    weight: '15.0 kg',
    description: 'Sela pesada com suportes altos na frente e atrás. Concede vantagem em testes para evitar cair da montaria durante combate montado.'
  },
  {
    item_type: 'transporte',
    id: 'alforjes',
    name: 'Alforjes',
    category: 'Acessório',
    price: '4 po',
    weight: '4.0 kg',
    description: 'Duas bolsas de couro interligadas pelas costas da montaria. Permite que o animal carregue até 30 kg de equipamento extra.'
  },

  {
    item_type: 'transporte',
    id: 'sela_exotica',
    name: 'Sela Exótica',
    category: 'Arreio',
    price: '60 po',
    weight: '20.0 kg',
    description: 'Sela sob medida para montarias aquáticas ou voadoras. Obrigatória para cavalgar criaturas fora do padrão terrestre.'
  },
  // ─── VEÍCULOS TERRESTRES ──────────────────────────────────────────────────
  {
    item_type: 'transporte',
    id: 'carroca',
    name: 'Carroça',
    category: 'Veículo Terrestre',
    price: '15 po',
    weight: '100.0 kg',
    description: 'Veículo simples de duas rodas puxado por uma única montaria. Muito utilizado por mercadores para transportar caixas e provisões.'
  },
  {
    item_type: 'transporte',
    id: 'carruagem',
    name: 'Carruagem',
    category: 'Veículo Terrestre',
    price: '100 po',
    weight: '300.0 kg',
    description: 'Veículo fechado de quatro rodas luxuoso e confortável, para transporte de passageiros nobres. Geralmente puxada por dois ou quatro cavalos.'
  },

  {
    item_type: 'transporte',
    id: 'biga',
    name: 'Biga',
    category: 'Veículo Terrestre',
    price: '250 po',
    weight: '50.0 kg',
    description: 'Carro de guerra leve de duas rodas, puxado por um ou dois cavalos. Rápido, mas instável fora de terreno plano.'
  },
  {
    item_type: 'transporte',
    id: 'vagao',
    name: 'Vagão',
    category: 'Veículo Terrestre',
    price: '35 po',
    weight: '200.0 kg',
    description: 'Carroça grande de quatro rodas, coberta ou aberta. O padrão de caravanas mercantes e mudanças longas.'
  },
  // ─── VEÍCULOS AQUÁTICOS ───────────────────────────────────────────────────
  {
    item_type: 'transporte',
    id: 'bote_a_remos',
    name: 'Bote a Remos',
    category: 'Veículo Aquático',
    price: '50 po',
    speed: '2 km/h',
    description: 'Pequena embarcação de madeira para até 4 passageiros, movida a força braçal. Ideal para travessias de rios ou lagos calmos.'
  },
  {
    item_type: 'transporte',
    id: 'gale',
    name: 'Galé',
    category: 'Veículo Aquático',
    price: '30000 po',
    speed: '6 km/h',
    description: 'Grande embarcação de guerra movida a remos e velas. Requer tripulação de até 80 remadores e pode comportar contingente militar completo.'
  },
  {
    item_type: 'transporte',
    id: 'navio_veleiro',
    name: 'Navio Veleiro',
    category: 'Veículo Aquático',
    price: '10000 po',
    speed: '3.5 km/h',
    description: 'Embarcação grande movida a velas com tripulação completa. Capaz de cruzar oceanos carregando toneladas de carga e dezenas de passageiros.'
  },
  {
    item_type: 'transporte',
    id: 'navio_de_guerra',
    name: 'Navio de Guerra',
    category: 'Veículo Aquático',
    price: '25000 po',
    speed: '4 km/h',
    description: 'Fortaleza flutuante reforçada para combate naval. Possui espaço para balistas, catapultas e contingentes militares inteiros.'
  }
]
