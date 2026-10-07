/**
 * Tabelas do gerador de NPC. Nomes valem para os dois idiomas; as frases têm
 * versão PT e EN **na mesma ordem** (npcTables.test.ts confere) — o gerador
 * sorteia um índice e o idioma só escolhe o texto. No PT, `{o|a}` marca a flexão
 * de gênero (masculino|feminino), resolvida por `genderize` ao gerar.
 */

export type NpcGender = 'f' | 'm' | 'x'

/** Espécies jogáveis de 2024 (ids de `gameDataPt.species`). */
export const NPC_SPECIES = [
  'humano', 'anao', 'elfo', 'pequenino', 'gnomo', 'orc', 'draconato', 'tiferino', 'aasimar', 'golias',
] as const
export type NpcSpecies = typeof NPC_SPECIES[number]

interface NameTable {
  f: string[]
  m: string[]
  family: string[]
}

export const NPC_NAMES: Record<NpcSpecies, NameTable> = {
  humano: {
    f: ['Alessa', 'Brígida', 'Catarina', 'Doroteia', 'Elara', 'Inês', 'Isolda', 'Leonor', 'Marta', 'Rosalind', 'Selene', 'Teodora'],
    m: ['Aldo', 'Bartolomeu', 'Cássio', 'Duarte', 'Edmundo', 'Gaspar', 'Henrique', 'Joaquim', 'Lázaro', 'Rodrigo', 'Tomé', 'Vicente'],
    family: ['Albuquerque', 'Brandão', 'Corvo', 'da Ponte', 'Ferreira', 'Galvão', 'Lobato', 'Moura', 'Pedregal', 'Salgueiro', 'Valente', 'Vasconcelos'],
  },
  anao: {
    f: ['Artin', 'Bardryn', 'Dagnal', 'Eldeth', 'Gunnloda', 'Hlin', 'Kathra', 'Mardred', 'Riswynn', 'Torbera', 'Vistra', 'Ilde'],
    m: ['Adrik', 'Baern', 'Brottor', 'Dain', 'Eberk', 'Harbek', 'Kildrak', 'Orsik', 'Rurik', 'Thorin', 'Tordek', 'Vondal'],
    family: ['Barbapétrea', 'Bigorna-Rubra', 'Cinzafunda', 'Forjamartelo', 'Gemaclara', 'Machadoferro', 'Mãodepedra', 'Rocha-Antiga', 'Veiodouro', 'Escudalto'],
  },
  elfo: {
    f: ['Adrie', 'Birel', 'Caelynn', 'Enna', 'Ielenia', 'Keyleth', 'Leshanna', 'Naivara', 'Sariel', 'Shava', 'Thia', 'Valanthe'],
    m: ['Adran', 'Aelar', 'Beiro', 'Carric', 'Erevan', 'Galinndan', 'Ivellios', 'Laucian', 'Peren', 'Quarion', 'Soveliss', 'Varis'],
    family: ['Amakiir', 'Galanodel', 'Holimion', 'Ilphelkiir', 'Liadon', 'Meliamne', 'Naïlo', 'Siannodel', 'Xiloscient', 'Folhalua'],
  },
  pequenino: {
    f: ['Andry', 'Bree', 'Callie', 'Cora', 'Euphemia', 'Jillian', 'Kithri', 'Lavinia', 'Merla', 'Nedda', 'Seraphina', 'Verna'],
    m: ['Alton', 'Ander', 'Cade', 'Corrin', 'Eldon', 'Errich', 'Finnan', 'Garret', 'Lindal', 'Milo', 'Osborn', 'Roscoe'],
    family: ['Arbusto-Alto', 'Bomvinho', 'Folhaverde', 'Pé-Leve', 'Pedracolina', 'Saco-Cheio', 'Ventofresco', 'Topo-da-Colina', 'Maçãdoce', 'Tocafunda'],
  },
  gnomo: {
    f: ['Bimpnottin', 'Breena', 'Caramip', 'Carlin', 'Donella', 'Ellyjobell', 'Lilli', 'Loopmottin', 'Nissa', 'Orla', 'Roywyn', 'Zanna'],
    m: ['Alston', 'Boddynock', 'Brocc', 'Burgell', 'Dimble', 'Eldon', 'Fonkin', 'Frug', 'Glim', 'Orryn', 'Wrenn', 'Zook'],
    family: ['Beren', 'Daergel', 'Folkor', 'Garrick', 'Murnig', 'Nackle', 'Ningel', 'Raulnor', 'Scheppen', 'Timbers'],
  },
  orc: {
    f: ['Baggi', 'Emen', 'Engong', 'Kansif', 'Myev', 'Neega', 'Ovak', 'Ownka', 'Shautha', 'Sutha', 'Vola', 'Yevelda'],
    m: ['Dench', 'Feng', 'Gell', 'Henk', 'Holg', 'Imsh', 'Keth', 'Krusk', 'Mhurren', 'Ront', 'Shump', 'Thokk'],
    family: ['do Clã Presa-Rubra', 'do Clã Olho-Cinza', 'do Clã Punho-de-Ferro', 'do Clã Lua-Partida', 'do Clã Uivo-Longo', 'do Clã Machado-Negro', 'do Clã Cinzas', 'do Clã Pedra-Viva'],
  },
  draconato: {
    f: ['Akra', 'Biri', 'Daar', 'Farideh', 'Harann', 'Havilar', 'Jheri', 'Kava', 'Korinn', 'Mishann', 'Sora', 'Thava'],
    m: ['Arjhan', 'Balasar', 'Bharash', 'Donaar', 'Ghesh', 'Heskan', 'Kriv', 'Medrash', 'Nadarr', 'Pandjed', 'Rhogar', 'Torinn'],
    family: ['Clethtinthiallor', 'Daardendrian', 'Delmirev', 'Drachedandion', 'Fenkenkabradon', 'Kepeshkmolik', 'Kerrhylon', 'Kimbatuul', 'Myastan', 'Yarjerit'],
  },
  tiferino: {
    f: ['Akta', 'Anakis', 'Bryseis', 'Criella', 'Damaia', 'Ea', 'Kallista', 'Lerissa', 'Makaria', 'Nemeia', 'Orianna', 'Rieta'],
    m: ['Akmenos', 'Amnon', 'Barakas', 'Damakos', 'Ekemon', 'Iados', 'Kairon', 'Leucis', 'Melech', 'Mordai', 'Pelaios', 'Skamos'],
    family: ['Esperança', 'Melancolia', 'Busca', 'Devoção', 'Glória', 'Temor', 'Canção', 'Ruína', 'Vigília', 'Promessa'],
  },
  aasimar: {
    f: ['Aelia', 'Arwyn', 'Celestine', 'Elysia', 'Ilaria', 'Lumen', 'Mireille', 'Seraphiel', 'Solenne', 'Valeria', 'Vespera', 'Zariel'],
    m: ['Aldric', 'Auriel', 'Castiel', 'Cyprian', 'Elion', 'Gabriel', 'Lucan', 'Orien', 'Raziel', 'Solon', 'Tamiel', 'Uriel'],
    family: ['Albaluz', 'Céu-Claro', 'da Aurora', 'Estrelalta', 'Luz-Serena', 'Manhãdourada', 'Sol-Brando', 'Véu-de-Prata'],
  },
  golias: {
    f: ['Gae-Al', 'Kuori', 'Lo-Kag', 'Maveith', 'Nalla', 'Orilo', 'Paavu', 'Pethani', 'Thalai', 'Uthal', 'Vaunea', 'Ilikan'],
    m: ['Aukan', 'Eglath', 'Gauthak', 'Ilikan', 'Keothi', 'Kuori', 'Lo-Kag', 'Manneo', 'Maveith', 'Nalla', 'Orilo', 'Thotham'],
    family: ['Anakalathai', 'Elanithino', 'Gathakanathi', 'Kalagiano', 'Katho-Olavi', 'Kolae-Gileana', 'Ogolakanu', 'Thuliaga', 'Thunukalathi', 'Vaimei-Laga'],
  },
}

/** Grupo de ocupações por arquétipo — o que o NPC faz quando não está lutando. */
export type OccupationGroup = 'common' | 'martial' | 'criminal' | 'religious' | 'arcane' | 'noble' | 'wild'

/**
 * Arquétipos de NPC: um bloco humanoide do SRD 5.2.1 de base. `common` aparece
 * primeiro no gerador; os demais são para quando o NPC precisa de mais peso.
 */
export const NPC_ARCHETYPES = [
  { id: 'commoner', srd: 'srd-commoner', group: 'common', tier: 'common' },
  { id: 'guard', srd: 'srd-guard', group: 'martial', tier: 'common' },
  { id: 'bandit', srd: 'srd-bandit', group: 'criminal', tier: 'common' },
  { id: 'noble', srd: 'srd-noble', group: 'noble', tier: 'common' },
  { id: 'acolyte', srd: 'srd-priest-acolyte', group: 'religious', tier: 'common' },
  { id: 'scout', srd: 'srd-scout', group: 'wild', tier: 'common' },
  { id: 'tough', srd: 'srd-tough', group: 'criminal', tier: 'common' },
  { id: 'infantry', srd: 'srd-warrior-infantry', group: 'martial', tier: 'common' },
  { id: 'cultist', srd: 'srd-cultist', group: 'religious', tier: 'common' },
  { id: 'spy', srd: 'srd-spy', group: 'criminal', tier: 'common' },
  { id: 'pirate', srd: 'srd-pirate', group: 'criminal', tier: 'common' },
  { id: 'priest', srd: 'srd-priest', group: 'religious', tier: 'veteran' },
  { id: 'druid', srd: 'srd-druid', group: 'wild', tier: 'veteran' },
  { id: 'banditCaptain', srd: 'srd-bandit-captain', group: 'criminal', tier: 'veteran' },
  { id: 'berserker', srd: 'srd-berserker', group: 'wild', tier: 'veteran' },
  { id: 'cultistFanatic', srd: 'srd-cultist-fanatic', group: 'religious', tier: 'veteran' },
  { id: 'knight', srd: 'srd-knight', group: 'noble', tier: 'veteran' },
  { id: 'veteran', srd: 'srd-warrior-veteran', group: 'martial', tier: 'veteran' },
  { id: 'guardCaptain', srd: 'srd-guard-captain', group: 'martial', tier: 'veteran' },
  { id: 'toughBoss', srd: 'srd-tough-boss', group: 'criminal', tier: 'veteran' },
  { id: 'gladiator', srd: 'srd-gladiator', group: 'martial', tier: 'elite' },
  { id: 'mage', srd: 'srd-mage', group: 'arcane', tier: 'elite' },
  { id: 'pirateCaptain', srd: 'srd-pirate-captain', group: 'criminal', tier: 'elite' },
  { id: 'assassin', srd: 'srd-assassin', group: 'criminal', tier: 'elite' },
  { id: 'archmage', srd: 'srd-archmage', group: 'arcane', tier: 'elite' },
] as const satisfies ReadonlyArray<{ id: string; srd: string; group: OccupationGroup; tier: 'common' | 'veteran' | 'elite' }>

export type NpcArchetypeId = typeof NPC_ARCHETYPES[number]['id']

export const NPC_AGES = ['young', 'adult', 'middle', 'old', 'venerable'] as const
export type NpcAge = typeof NPC_AGES[number]

interface PhraseTables {
  occupations: Record<OccupationGroup, string[]>
  appearance: string[]
  mannerism: string[]
  personality: string[]
  ideal: string[]
  bond: string[]
  flaw: string[]
  motivation: string[]
  secret: string[]
}

export const NPC_PHRASES: Record<'pt' | 'en', PhraseTables> = {
  pt: {
    occupations: {
      common: ['Ferreir{o|a}', 'Taverneir{o|a}', 'Moleir{o|a}', 'Pescador{|a}', 'Carpinteir{o|a}', 'Lavrador{|a}', 'Padeir{o|a}', 'Costureir{o|a}', 'Cocheir{o|a}', 'Pastor{|a}', 'Curtidor{|a}', '{Parteiro|Parteira}', 'Mascate', 'Coveir{o|a}', 'Barqueir{o|a}'],
      martial: ['Sentinela do portão', 'Sargento da milícia', 'Mercenári{o|a}', 'Instrutor{|a} de armas', 'Guarda de caravana', 'Carcereir{o|a}', 'Veteran{o|a} de guerra', 'Arqueir{o|a} da muralha'],
      criminal: ['Contrabandista', 'Receptador{|a}', 'Batedor{|a} de carteiras', 'Agiota', 'Falsificador{|a}', 'Informante', 'Cobrador{|a} de dívidas', '{Ladrão|Ladra} de túmulos'],
      religious: ['Acólit{o|a} do templo', 'Peregrin{o|a}', 'Coletor{|a} de dízimos', '{Guardião|Guardiã} de relicário', 'Pregador{|a} de rua', 'Enfermeir{o|a} do hospício', 'Copista do mosteiro'],
      arcane: ['Aprendiz de mago', 'Alquimista', 'Astrólog{o|a}', 'Bibliotecári{o|a}', 'Encantador{|a} de feira', 'Sábi{o|a} de taverna', 'Cartógraf{o|a}'],
      noble: ['Herdeir{o|a} de casa menor', 'Cobrador{|a} de impostos', 'Diplomata', 'Mecenas das artes', 'Magistrad{o|a}', 'Senhor{|a} de terras', 'Camareir{o|a} da corte'],
      wild: ['Caçador{|a}', 'Guia de montanha', 'Lenhador{|a}', 'Ervanári{o|a}', 'Armadilheir{o|a}', '{Guardião|Guardiã} do bosque', 'Domador{|a} de feras'],
    },
    appearance: [
      'Cicatriz que cruza a sobrancelha', 'Tatuagens que sobem pelo pescoço', 'Olhos de cores diferentes', 'Dentes de ouro',
      'Sardas por todo o rosto', 'Cabelo trançado com contas', 'Muito alt{o|a} e curvad{o|a}', 'Baix{o|a} e atarracad{o|a}',
      'Roupas finas, mas remendadas', 'Sempre com um chapéu enorme', 'Mãos manchadas de tinta', 'Nariz quebrado mais de uma vez',
      'Barba (ou cabelo) em tons de prata precoce', 'Anéis em todos os dedos', 'Manca de uma perna', 'Cheira a ervas e fumaça',
      'Voz rouca e grave', 'Pele marcada pelo sol', 'Usa um tapa-olho', 'Unhas pintadas de preto',
    ],
    mannerism: [
      'Fala sussurrando', 'Ri de tudo, até do que não tem graça', 'Tamborila os dedos sem parar', 'Cita provérbios a toda hora',
      'Morde o lábio antes de mentir', 'Nunca olha nos olhos', 'Gesticula demais', 'Repete a última palavra dos outros',
      'Assobia quando está nervos{o|a}', 'Fala de si na terceira pessoa', 'Coleciona pedrinhas e mostra para todos', 'Usa palavras difíceis do jeito errado',
      'Interrompe todo mundo', 'Mastiga um palito o tempo todo', 'Faz contas nos dedos', 'Conta histórias que nunca terminam',
    ],
    personality: [
      'Desconfiad{o|a} de qualquer estranho', 'Generos{o|a} até demais', 'Fala a verdade mesmo quando dói', 'Covarde, mas leal',
      'Orgulhos{o|a} da própria terra', 'Curios{o|a} sobre tudo e todos', 'Rabugent{o|a}, mas de bom coração', 'Ambicios{o|a} e calculista',
      'Supersticios{o|a} ao extremo', 'Otimista incorrigível', 'Fri{o|a} e profissional', 'Fofoqueir{o|a} incurável',
      'Piedos{o|a} e rígid{o|a}', '{Brincalhão|Brincalhona} e irreverente', 'Melancólic{o|a}, vive do passado', 'Nervos{o|a} diante de autoridade',
      'Teimos{o|a} como uma mula', 'Gentil com crianças e animais', 'Arrogante com quem considera inferior', 'Paciente e observador',
    ],
    ideal: [
      'Tradição: os costumes antigos mantêm o mundo de pé.', 'Liberdade: ninguém deve viver acorrentado.',
      'Ganância: tudo tem um preço, e eu quero o meu.', 'Comunidade: cuidamos uns dos outros.',
      'Poder: quem tem força faz as regras.', 'Redenção: todo mundo merece uma segunda chance.',
      'Conhecimento: a verdade vale mais que ouro.', 'Honra: a palavra dada é sagrada.',
      'Fé: os deuses têm um plano para cada um.', 'Sobrevivência: primeiro eu, depois o resto.',
      'Beleza: o mundo precisa de mais arte.', 'Justiça: ninguém está acima da lei.',
    ],
    bond: [
      'Faria tudo pela irmã mais nova.', 'Deve a vida a um aventureiro desaparecido.', 'Protege um segredo da família.',
      'Ama alguém que não pode ter.', 'Jurou vingança contra um nobre local.', 'Cuida de um templo esquecido.',
      'Guarda o diário de um mentor morto.', 'Sustenta uma família numerosa.', 'É leal à guilda acima de tudo.',
      'Procura o filho que fugiu de casa.', 'Ainda espera o retorno de um amor perdido no mar.', 'Considera a taverna local seu verdadeiro lar.',
    ],
    flaw: [
      'Não resiste a uma aposta.', 'Bebe mais do que deveria.', 'Mente por hábito, mesmo sem motivo.', 'Foge ao primeiro sinal de perigo.',
      'Inveja quem tem mais.', 'Guarda rancor para sempre.', 'Confia em qualquer um que faça um elogio.', 'Não sabe guardar segredo.',
      'Gasta tudo o que ganha no mesmo dia.', 'Despreza magia e quem a usa.', 'Acredita que é mais esperto que todos.', 'Tem medo paralisante de algo comum.',
    ],
    motivation: [
      'Pagar uma dívida antes que seja tarde.', 'Conquistar o respeito do pai.', 'Juntar dinheiro para sair da cidade.',
      'Descobrir quem matou um amigo.', 'Proteger o bairro de uma gangue.', 'Subir na hierarquia da guilda.',
      'Encontrar a cura para uma doença.', 'Limpar o próprio nome.', 'Recuperar uma herança roubada.',
      'Provar que uma lenda é verdadeira.', 'Viver em paz, sem complicações.', 'Ficar rico de qualquer jeito.',
    ],
    secret: [
      'É espi{ão|ã} de um reino vizinho.', 'Viu algo terrível na floresta e nunca contou.', 'Está sendo chantageado.',
      'Sabe onde está escondido um tesouro antigo.', 'É, na verdade, de uma família nobre deserdada.', 'Fez um pacto com uma entidade sombria.',
      'Roubou o próprio patrão por anos.', 'Esconde um fugitivo no porão.', 'Tem uma doença que não conta a ninguém.',
      'É devot{o|a} secret{o|a} de um culto proibido.', 'Matou alguém em legítima defesa e escondeu o corpo.', 'Conhece a passagem secreta do castelo.',
      'Está apaixonad{o|a} por um dos aventureiros.', 'Vende informações para os dois lados.', 'Perdeu a memória de um ano inteiro.',
      'É {o verdadeiro dono|a verdadeira dona} de uma fortuna escondida.', 'Ouviu uma conversa que pode derrubar o prefeito.', 'Carrega um item amaldiçoado sem saber.',
      'Já foi aventureir{o|a} e abandonou o grupo para morrer.', 'Está fingindo uma doença para fugir de um casamento.',
    ],
  },
  en: {
    occupations: {
      common: ['Blacksmith', 'Innkeeper', 'Miller', 'Fisher', 'Carpenter', 'Farmer', 'Baker', 'Seamstress', 'Coachman', 'Shepherd', 'Tanner', 'Midwife', 'Peddler', 'Gravedigger', 'Ferry pilot'],
      martial: ['Gate sentry', 'Militia sergeant', 'Mercenary', 'Weapons instructor', 'Caravan guard', 'Jailer', 'War veteran', 'Wall archer'],
      criminal: ['Smuggler', 'Fence', 'Pickpocket', 'Loan shark', 'Forger', 'Informant', 'Debt collector', 'Grave robber'],
      religious: ['Temple acolyte', 'Pilgrim', 'Tithe collector', 'Reliquary keeper', 'Street preacher', 'Hospice nurse', 'Monastery scribe'],
      arcane: ['Wizard\'s apprentice', 'Alchemist', 'Astrologer', 'Librarian', 'Fairground enchanter', 'Tavern sage', 'Cartographer'],
      noble: ['Heir of a minor house', 'Tax collector', 'Diplomat', 'Patron of the arts', 'Magistrate', 'Landlord', 'Court chamberlain'],
      wild: ['Hunter', 'Mountain guide', 'Woodcutter', 'Herbalist', 'Trapper', 'Grove warden', 'Beast tamer'],
    },
    appearance: [
      'A scar across one eyebrow', 'Tattoos climbing up the neck', 'Eyes of different colors', 'Gold teeth',
      'Freckles all over the face', 'Hair braided with beads', 'Very tall and stooped', 'Short and stocky',
      'Fine clothes, but patched', 'Always wears an enormous hat', 'Ink-stained hands', 'A nose broken more than once',
      'Beard (or hair) gone prematurely silver', 'Rings on every finger', 'Walks with a limp', 'Smells of herbs and smoke',
      'A deep, raspy voice', 'Sun-weathered skin', 'Wears an eyepatch', 'Black-painted nails',
    ],
    mannerism: [
      'Speaks in a whisper', 'Laughs at everything, even what isn\'t funny', 'Drums their fingers nonstop', 'Quotes proverbs constantly',
      'Bites their lip before lying', 'Never meets anyone\'s eyes', 'Gestures wildly', 'Repeats the last word others say',
      'Whistles when nervous', 'Refers to themself in the third person', 'Collects pebbles and shows them to everyone', 'Uses big words the wrong way',
      'Interrupts everyone', 'Chews a toothpick all the time', 'Counts on their fingers', 'Tells stories that never end',
    ],
    personality: [
      'Suspicious of any stranger', 'Generous to a fault', 'Tells the truth even when it hurts', 'Cowardly, but loyal',
      'Proud of their homeland', 'Curious about everything and everyone', 'Grumpy, but kind-hearted', 'Ambitious and calculating',
      'Superstitious to the extreme', 'An incurable optimist', 'Cold and professional', 'An incurable gossip',
      'Pious and strict', 'Playful and irreverent', 'Melancholic, lives in the past', 'Nervous around authority',
      'Stubborn as a mule', 'Gentle with children and animals', 'Arrogant toward anyone they see as lesser', 'Patient and observant',
    ],
    ideal: [
      'Tradition: the old ways keep the world standing.', 'Freedom: no one should live in chains.',
      'Greed: everything has a price, and I want mine.', 'Community: we look after one another.',
      'Power: the strong make the rules.', 'Redemption: everyone deserves a second chance.',
      'Knowledge: truth is worth more than gold.', 'Honor: a given word is sacred.',
      'Faith: the gods have a plan for everyone.', 'Survival: me first, everyone else after.',
      'Beauty: the world needs more art.', 'Justice: no one is above the law.',
    ],
    bond: [
      'Would do anything for their little sister.', 'Owes their life to a missing adventurer.', 'Guards a family secret.',
      'Loves someone they can never have.', 'Swore revenge on a local noble.', 'Tends a forgotten shrine.',
      'Keeps the journal of a dead mentor.', 'Supports a large family.', 'Is loyal to the guild above all.',
      'Searches for the child who ran away from home.', 'Still waits for a love lost at sea.', 'Considers the local tavern their true home.',
    ],
    flaw: [
      'Can\'t resist a bet.', 'Drinks more than they should.', 'Lies out of habit, even for no reason.', 'Flees at the first sign of danger.',
      'Envies anyone who has more.', 'Holds a grudge forever.', 'Trusts anyone who flatters them.', 'Can\'t keep a secret.',
      'Spends everything they earn the same day.', 'Despises magic and those who use it.', 'Believes they are smarter than everyone.', 'Has a paralyzing fear of something common.',
    ],
    motivation: [
      'Pay off a debt before it\'s too late.', 'Earn their father\'s respect.', 'Save enough money to leave town.',
      'Find out who killed a friend.', 'Protect the neighborhood from a gang.', 'Climb the guild\'s ranks.',
      'Find a cure for a disease.', 'Clear their own name.', 'Recover a stolen inheritance.',
      'Prove a legend is true.', 'Live in peace, without complications.', 'Get rich, whatever it takes.',
    ],
    secret: [
      'Is a spy for a neighboring kingdom.', 'Saw something terrible in the forest and never told anyone.', 'Is being blackmailed.',
      'Knows where an ancient treasure is hidden.', 'Is actually from a disinherited noble family.', 'Made a pact with a dark entity.',
      'Has been stealing from their employer for years.', 'Hides a fugitive in the cellar.', 'Has an illness they tell no one about.',
      'Is a secret devotee of a forbidden cult.', 'Killed someone in self-defense and hid the body.', 'Knows the castle\'s secret passage.',
      'Is in love with one of the adventurers.', 'Sells information to both sides.', 'Lost the memory of an entire year.',
      'Is the true owner of a hidden fortune.', 'Overheard a conversation that could topple the mayor.', 'Carries a cursed item without knowing it.',
      'Was once an adventurer and left their party to die.', 'Is faking an illness to escape a marriage.',
    ],
  },
}

// ── NPC montado como personagem ──────────────────────────────────────────────

/** Classes de 2024 com peso de sorteio: guerreiros e ladinos são mais comuns que bruxos. */
export const PC_CLASS_WEIGHTS: Record<string, number> = {
  guerreiro: 4, ladino: 4, clerigo: 3, mago: 2, guardiao: 2, paladino: 2,
  bardo: 2, barbaro: 2, druida: 1, feiticeiro: 1, bruxo: 1, monge: 1,
}

/** Ocupação sorteada para o NPC-personagem, pelo grupo que combina com a classe. */
export const PC_CLASS_OCCUPATION: Record<string, OccupationGroup> = {
  guerreiro: 'martial', paladino: 'religious', guardiao: 'wild', barbaro: 'wild', druida: 'wild',
  ladino: 'criminal', bruxo: 'arcane', mago: 'arcane', feiticeiro: 'arcane', bardo: 'common',
  clerigo: 'religious', monge: 'religious',
}

export type ArmorTier = 'light' | 'medium' | 'heavy' | null

/**
 * Equipamento típico por classe: categoria de armadura (a peça sobe de tier com
 * o nível, ver `PC_ARMOR_BY_TIER`), escudo e armas (ids do catálogo de itens,
 * a primeira é a principal).
 */
export const PC_LOADOUT: Record<string, { armor: ArmorTier; shield: boolean; weapons: string[] }> = {
  barbaro: { armor: null, shield: false, weapons: ['machado_grande', 'machadinha'] },
  bardo: { armor: 'light', shield: false, weapons: ['rapieira', 'adaga'] },
  bruxo: { armor: 'light', shield: false, weapons: ['adaga'] },
  clerigo: { armor: 'medium', shield: true, weapons: ['maca'] },
  druida: { armor: 'light', shield: true, weapons: ['quaterstaff'] },
  feiticeiro: { armor: null, shield: false, weapons: ['adaga'] },
  guardiao: { armor: 'medium', shield: false, weapons: ['espada_curta', 'arco_longo'] },
  guerreiro: { armor: 'heavy', shield: true, weapons: ['espada_longa', 'besta_leve'] },
  ladino: { armor: 'light', shield: false, weapons: ['rapieira', 'arco_curto'] },
  mago: { armor: null, shield: false, weapons: ['quaterstaff'] },
  monge: { armor: null, shield: false, weapons: ['espada_curta'] },
  paladino: { armor: 'heavy', shield: true, weapons: ['espada_longa', 'lanca'] },
}

/** Armadura por categoria e nível mínimo: um veterano de nível 9 já não usa a cota do nível 1. */
export const PC_ARMOR_BY_TIER: Record<Exclude<ArmorTier, null>, Array<{ minLevel: number; id: string }>> = {
  light: [{ minLevel: 1, id: 'couro' }, { minLevel: 3, id: 'couro_batido' }],
  medium: [{ minLevel: 1, id: 'cota_malha_parcial' }, { minLevel: 5, id: 'couraca_peitoral' }, { minLevel: 9, id: 'placas_parcial' }],
  heavy: [{ minLevel: 1, id: 'cota_de_malha' }, { minLevel: 5, id: 'armadura_de_tala' }, { minLevel: 9, id: 'placas' }],
}
