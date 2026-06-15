import type { Transporte } from './types'

export const MONTARIAS_E_VEICULOS: Transporte[] = [
  // ─── MONTARIAS E ANIMAIS DE CARGA ─────────────────────────────────────────
  {
    tipo_item: 'transporte',
    id: 'cavalo_de_montaria',
    nome: 'Cavalo de Montaria',
    categoria: 'Montaria Terrestre',
    preco: '75 po',
    deslocamento: '18 m',
    capacidade_carga: '240 kg',
    descricao: 'Cavalo padrão treinado para transporte de viajantes. Não é ideal para combate direto e pode assustar-se com o caos da batalha.'
  },
  {
    tipo_item: 'transporte',
    id: 'cavalo_de_guerra',
    nome: 'Cavalo de Guerra',
    categoria: 'Montaria Terrestre',
    preco: '400 po',
    deslocamento: '18 m',
    capacidade_carga: '270 kg',
    descricao: 'Montaria imponente treinada para o combate. Não se assusta com espadas e pode desferir ataques com os cascos durante batalhas.'
  },
  {
    tipo_item: 'transporte',
    id: 'ponei',
    nome: 'Pônei',
    categoria: 'Montaria Terrestre',
    preco: '30 po',
    deslocamento: '12 m',
    capacidade_carga: '112.5 kg',
    descricao: 'Montaria menor, ideal para raças de tamanho Pequeno como Halflings e Gnomos. Também usado como animal de carga em minas.'
  },
  {
    tipo_item: 'transporte',
    id: 'camelo',
    nome: 'Camelo',
    categoria: 'Montaria Terrestre',
    preco: '50 po',
    deslocamento: '15 m',
    capacidade_carga: '240 kg',
    descricao: 'Montaria resistente para climas áridos e desertos. Pode passar vários dias sem água e carrega carga pesada por longas distâncias.'
  },
  {
    tipo_item: 'transporte',
    id: 'elefante',
    nome: 'Elefante',
    categoria: 'Montaria Terrestre',
    preco: '200 po',
    deslocamento: '12 m',
    capacidade_carga: '660 kg',
    descricao: 'Montaria colossal capaz de carregar enormes quantidades de carga ou múltiplos passageiros. Raro fora de regiões tropicais e selváticas.'
  },
  {
    tipo_item: 'transporte',
    id: 'burro_ou_mula',
    nome: 'Burro ou Mula',
    categoria: 'Animal de Carga',
    preco: '8 po',
    deslocamento: '12 m',
    capacidade_carga: '210 kg',
    descricao: 'Animais firmes e obstinados com excelente capacidade de carga. Lentos mas resistentes em trilhas íngremes e terrenos difíceis.'
  },

  // ─── ARREIOS E ACESSÓRIOS ─────────────────────────────────────────────────
  {
    tipo_item: 'transporte',
    id: 'sela_de_viagem',
    nome: 'Sela de Viagem',
    categoria: 'Arreio',
    preco: '10 po',
    peso: '5.0 kg',
    descricao: 'Sela acolchoada projetada para garantir conforto ao cavaleiro e à montaria durante longas jornadas de dias seguidos.'
  },
  {
    tipo_item: 'transporte',
    id: 'sela_de_guerra',
    nome: 'Sela de Guerra',
    categoria: 'Arreio',
    preco: '20 po',
    peso: '15.0 kg',
    descricao: 'Sela pesada com suportes altos na frente e atrás. Concede vantagem em testes para evitar cair da montaria durante combate montado.'
  },
  {
    tipo_item: 'transporte',
    id: 'alforjes',
    nome: 'Alforjes',
    categoria: 'Acessório',
    preco: '4 po',
    peso: '4.0 kg',
    descricao: 'Duas bolsas de couro interligadas pelas costas da montaria. Permite que o animal carregue até 30 kg de equipamento extra.'
  },

  // ─── VEÍCULOS TERRESTRES ──────────────────────────────────────────────────
  {
    tipo_item: 'transporte',
    id: 'carroca',
    nome: 'Carroça',
    categoria: 'Veículo Terrestre',
    preco: '15 po',
    peso: '100.0 kg',
    descricao: 'Veículo simples de duas rodas puxado por uma única montaria. Muito utilizado por mercadores para transportar caixas e provisões.'
  },
  {
    tipo_item: 'transporte',
    id: 'carruagem',
    nome: 'Carruagem',
    categoria: 'Veículo Terrestre',
    preco: '250 po',
    peso: '300.0 kg',
    descricao: 'Veículo fechado de quatro rodas luxuoso e confortável, para transporte de passageiros nobres. Geralmente puxada por dois ou quatro cavalos.'
  },

  // ─── VEÍCULOS AQUÁTICOS ───────────────────────────────────────────────────
  {
    tipo_item: 'transporte',
    id: 'bote_a_remos',
    nome: 'Bote a Remos',
    categoria: 'Veículo Aquático',
    preco: '50 po',
    deslocamento: '2 km/h',
    descricao: 'Pequena embarcação de madeira para até 4 passageiros, movida a força braçal. Ideal para travessias de rios ou lagos calmos.'
  },
  {
    tipo_item: 'transporte',
    id: 'gale',
    nome: 'Galé',
    categoria: 'Veículo Aquático',
    preco: '30000 po',
    deslocamento: '6 km/h',
    descricao: 'Grande embarcação de guerra movida a remos e velas. Requer tripulação de até 80 remadores e pode comportar contingente militar completo.'
  },
  {
    tipo_item: 'transporte',
    id: 'navio_veleiro',
    nome: 'Navio Veleiro',
    categoria: 'Veículo Aquático',
    preco: '10000 po',
    deslocamento: '3.5 km/h',
    descricao: 'Embarcação grande movida a velas com tripulação completa. Capaz de cruzar oceanos carregando toneladas de carga e dezenas de passageiros.'
  },
  {
    tipo_item: 'transporte',
    id: 'navio_de_guerra',
    nome: 'Navio de Guerra',
    categoria: 'Veículo Aquático',
    preco: '25000 po',
    deslocamento: '4 km/h',
    descricao: 'Fortaleza flutuante reforçada para combate naval. Possui espaço para balistas, catapultas e contingentes militares inteiros.'
  }
]
