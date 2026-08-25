/**
 * Camada de tradução dos dados de jogo.
 *
 * Os dados canônicos (`dadosPT`) ficam em português e são a fonte usada pelas
 * regras — `recalcular`, o store e os cálculos comparam strings como 'Leve' ou
 * 'Escudo'. A UI consome `dados`, que devolve a versão traduzida para o idioma
 * atual. Traduzir é sempre por string inteira: o que não estiver no dicionário
 * simplesmente permanece em português.
 */

/** Campos que carregam texto de exibição. Os demais são ids ou mecânica. */
const CHAVES_TRADUZIVEIS = new Set([
  'nome', 'descricao', 'interesse', 'complexidade', 'destaques', 'talento',
  'ferramenta', 'ferramentas', 'origem', 'tamanho', 'nota', 'efeito',
  'armas', 'armaduras', 'categoria', 'A', 'B', 'C', 'fonte', 'traducao',
])

export const DICIONARIO_EN: Record<string, string> = {
  // ─── Meta ────────────────────────────────────────────────────────────────
  'Livro do Jogador D&D 5.5 (2024)': "D&D 5.5 (2024) Player's Handbook",
  'Heróis Anônimos — Erratas Abril 2025': 'Heróis Anônimos — April 2025 Errata',

  // ─── Classes ─────────────────────────────────────────────────────────────
  'Bárbaro': 'Barbarian',
  'Bardo': 'Bard',
  'Bruxo': 'Warlock',
  'Clérigo': 'Cleric',
  'Druida': 'Druid',
  'Feiticeiro': 'Sorcerer',
  'Guardião': 'Ranger',
  'Guerreiro': 'Fighter',
  'Ladino': 'Rogue',
  'Mago': 'Wizard',
  'Monge': 'Monk',
  'Paladino': 'Paladin',

  'Um Combatente Feroz da Fúria Primitiva': 'A Fierce Warrior of Primal Rage',
  'Um Mago da Palavra e da Música': 'A Magician of Word and Music',
  'Um Magista do Conhecimento Oculto': 'A Magician of Occult Knowledge',
  'Um Sacerdote do Poder Divino': 'A Priest of Divine Power',
  'Um Sacerdote da Natureza de Poder Primal': 'A Priest of Nature Wielding Primal Power',
  'Um Magista Deslumbrante Repleto de Magia Inata': 'A Dazzling Magician Brimming with Innate Magic',
  'Um Combatente Errante Imbuído de Magia Primitiva': 'A Wandering Warrior Imbued with Primal Magic',
  'Um Mestre de Todas as Armas e Armaduras': 'A Master of All Weapons and Armor',
  'Um Especialista em Furtividade e Subterfúgio': 'A Specialist in Stealth and Subterfuge',
  'Um Estudioso Usuário de Magia Arcana': 'A Scholarly User of Arcane Magic',
  'Um Artista Marcial com um Foco Sobrenatural': 'A Martial Artist with a Supernatural Focus',
  'Um Combatente Devotado com Juramentos Sagrados': 'A Devoted Warrior Bound by Sacred Oaths',

  // Interesse / complexidade
  'Batalha': 'Battle',
  'Atuação': 'Performance',
  'Conhecimento Obscuro': 'Occult Lore',
  'Deuses': 'Gods',
  'Natureza': 'Nature',
  'Poder': 'Power',
  'Sobrevivência': 'Survival',
  'Armas': 'Weapons',
  'Furtividade': 'Stealth',
  'Livros de Magia': 'Spellbooks',
  'Combate Desarmado': 'Unarmed Combat',
  'Proteção': 'Protection',
  'Baixa': 'Low',
  'Média': 'Medium',
  'Alta': 'High',

  // ─── Subclasses ──────────────────────────────────────────────────────────
  'Trilha da Árvore do Mundo': 'Path of the World Tree',
  'Trilha do Berserker': 'Path of the Berserker',
  'Trilha do Coração Selvagem': 'Path of the Wild Heart',
  'Trilha do Fanático': 'Path of the Zealot',
  'Colégio da Bravura': 'College of Valor',
  'Colégio do Conhecimento': 'College of Lore',
  'Colégio da Dança': 'College of Dance',
  'Colégio do Glamour': 'College of Glamour',
  'Patrono Arquifada': 'Archfey Patron',
  'Patrono Celestial': 'Celestial Patron',
  'Patrono O Grande Antigo': 'Great Old One Patron',
  'Patrono Ínfero': 'Fiend Patron',
  'Domínio da Guerra': 'War Domain',
  'Domínio da Luz': 'Light Domain',
  'Domínio da Trapaça': 'Trickery Domain',
  'Domínio da Vida': 'Life Domain',
  'Círculo da Lua': 'Circle of the Moon',
  'Círculo da Terra': 'Circle of the Land',
  'Círculo das Estrelas': 'Circle of the Stars',
  'Círculo do Mar': 'Circle of the Sea',
  'Feitiçaria Aberrante': 'Aberrant Sorcery',
  'Feitiçaria Dracônica': 'Draconic Sorcery',
  'Feitiçaria Mecânica': 'Clockwork Sorcery',
  'Feitiçaria Selvagem': 'Wild Magic Sorcery',
  'Andarilho Feérico': 'Fey Wanderer',
  'Caçador': 'Hunter',
  'Senhor das Feras': 'Beast Master',
  'Vigilante das Sombras': 'Gloom Stalker',
  'Campeão': 'Champion',
  'Cavaleiro Místico': 'Eldritch Knight',
  'Combatente Psíquico': 'Psi Warrior',
  'Mestre da Batalha': 'Battle Master',
  'Adaga Espiritual': 'Soulknife',
  'Assassino': 'Assassin',
  'Ladrão': 'Thief',
  'Trapaceiro Arcano': 'Arcane Trickster',
  'Abjurador': 'Abjurer',
  'Adivinhador': 'Diviner',
  'Evocador': 'Evoker',
  'Ilusionista': 'Illusionist',
  'Combatente dos Elementos': 'Warrior of the Elements',
  'Combatente da Mão Espalmada': 'Warrior of the Open Hand',
  'Combatente da Misericórdia': 'Warrior of Mercy',
  'Combatente das Sombras': 'Warrior of Shadow',
  'Juramento dos Anciões': 'Oath of the Ancients',
  'Juramento da Devoção': 'Oath of Devotion',
  'Juramento da Glória': 'Oath of Glory',
  'Juramento da Vingança': 'Oath of Vengeance',

  // ─── Descrições de subclasse ─────────────────────────────────────────────
  'Canaliza a Árvore do Mundo: ganha PV temporários ao entrar em Fúria e prende inimigos com raízes espectrais.':
    'Channels the World Tree: gain Temporary HP when you Rage and bind enemies with spectral roots.',
  'Fúria brutal e implacável: ataques frenéticos, presença aterrorizante e retaliação a quem o fere.':
    'Brutal, unrelenting rage: frenzied attacks, a terrifying presence, and retaliation against those who wound you.',
  'Comunhão com espíritos animais, ganhando sentidos aguçados, rastreamento e talentos bestiais na Fúria.':
    'Communion with animal spirits, granting keen senses, tracking, and bestial gifts while raging.',
  'Fúria abençoada por um deus: dano necrótico ou radiante extra e resistência sobrenatural à morte.':
    'Rage blessed by a god: extra Necrotic or Radiant damage and supernatural resistance to death.',
  'Bardo de batalha: proficiência marcial, armadura média e Inspiração que reforça ataques dos aliados.':
    "A battle bard: martial proficiency, Medium armor, and Inspiration that bolsters allies' attacks.",
  'Erudito e crítico: Palavras Cortantes atrapalham inimigos e Segredos Mágicos abrem listas de outras classes.':
    "Scholar and critic: Cutting Words hampers foes, and Magical Secrets opens other classes' spell lists.",
  'Dança de batalha: movimento ágil, defesa sem armadura e ataques desarmados guiados pela Inspiração.':
    'Battle dance: agile movement, unarmored defense, and Unarmed Strikes guided by Inspiration.',
  'Magia feérica de encanto: cativa plateias, protege aliados com esplendor e impõe respeito sobrenatural.':
    'Fey magic of enchantment: captivate audiences, shield allies with splendor, and command supernatural awe.',
  'Pacto com um senhor feérico: teleporte curto, encantamentos e passos entre a Faéria.':
    'A pact with a fey lord: short teleports, enchantments, and steps through the Feywild.',
  'Pacto com um ser celestial: luz radiante, Dados de Cura para aliados e resistência à morte.':
    'A pact with a celestial being: radiant light, Healing Light for allies, and resistance to death.',
  'Pacto com uma entidade alienígena: telepatia, dano psíquico e visões que enlouquecem os inimigos.':
    'A pact with an alien entity: telepathy, psychic damage, and visions that unhinge your foes.',
  'Pacto infernal: PV temporários a cada abate, resistência a dano e sorte sombria nas rolagens.':
    'An infernal pact: Temporary HP with each kill, damage resistance, and dark luck on your rolls.',
  'Sacerdote guerreiro: proficiência marcial, ataque divino como Ação Bônus e bênçãos em combate.':
    'A warrior priest: martial proficiency, a divine attack as a Bonus Action, and blessings in battle.',
  'Fogo e luz radiante: Chama Protetora atrapalha atacantes e a explosão de luz cega inimigos.':
    'Fire and radiant light: Warding Flame hinders attackers, and a burst of light blinds foes.',
  'Ilusão e furtividade abençoadas: duplicatas ilusórias e bênçãos que escondem o grupo.':
    'Blessed illusion and stealth: illusory duplicates and blessings that hide your party.',
  'Cura superior: toda magia de cura rende PV extras e a Canalizar Divindade restaura o grupo.':
    'Superior healing: every healing spell restores extra HP, and Channel Divinity mends the whole party.',
  'Forma Selvagem de combate: assume feras poderosas e conjura magias na forma animal.':
    'Combat Wild Shape: take the form of powerful beasts and cast spells while transformed.',
  'Magia ligada ao terreno: magias adicionais por bioma e recuperação de espaços de magia.':
    'Magic tied to the land: extra spells per terrain and recovery of spell slots.',
  'Forma Estelar: assume constelações que curam, atacam à distância ou reforçam a concentração.':
    'Starry Form: take on constellations that heal, strike at range, or bolster your concentration.',
  'Fúria do mar: uma aura de tempestade e gelo que fere e empurra quem se aproxima.':
    "The sea's fury: an aura of storm and ice that wounds and pushes those who come close.",
  'Magia psiônica de origem alienígena: telepatia, magias psíquicas e transformação do próprio corpo.':
    'Psionic magic of alien origin: telepathy, psychic spells, and reshaping of your own body.',
  'Sangue de dragão: PV extras, escamas que servem de armadura, resistência elemental e asas.':
    'Dragon blood: extra HP, scales that serve as armor, elemental resistance, and wings.',
  'Ordem de Mecanus: anula vantagem e desvantagem, restaura o equilíbrio e protege contra o caos.':
    'The order of Mechanus: negate Advantage and Disadvantage, restore balance, and ward against chaos.',
  'Magia instável: surtos aleatórios, Marés do Caos e capacidade de dobrar a sorte do grupo.':
    "Unstable magic: random surges, Tides of Chaos, and the power to bend the party's luck.",
  'Toque da Faéria: dano psíquico nos ataques, encantos, e resistência a medo e enfeitiçamento.':
    "The Feywild's touch: psychic damage on attacks, charms, and resistance to fear and charm.",
  'Técnicas de caça sob medida: escolhe golpes contra hordas ou contra ameaças únicas e poderosas.':
    'Tailored hunting techniques: pick strikes against hordes or against single, powerful threats.',
  'Um companheiro primal luta ao seu lado, agindo em conjunto com seus próprios ataques.':
    'A primal companion fights at your side, acting in concert with your own attacks.',
  'Emboscada na escuridão: iniciativa e ataque extra no primeiro turno, visão às cegas e invisibilidade.':
    'Ambusher in the dark: bonus Initiative and an extra first-turn attack, Darkvision, and invisibility.',
  'Perfeição marcial simples e direta: crítico ampliado, atletismo aprimorado e recuperação constante.':
    'Simple, direct martial perfection: improved critical range, better athletics, and steady recovery.',
  'Guerreiro-mago: magias de Abjuração e Evocação, vínculo com a arma e golpe mágico combinado.':
    'Warrior-mage: Abjuration and Evocation spells, a bond with your weapon, and a combined magic strike.',
  'Energia psiônica canalizada para proteger aliados, empurrar inimigos e potencializar ataques.':
    'Psionic energy channeled to shield allies, push foes, and empower your attacks.',
  'Manobras táticas com Dados de Superioridade: desarmar, derrubar, provocar e comandar o campo.':
    'Tactical maneuvers with Superiority Dice: disarm, trip, goad, and command the battlefield.',
  'Lâminas psiônicas manifestas: ataca com a mente, comunica-se em segredo e teleporta-se em silêncio.':
    'Manifest psionic blades: strike with your mind, speak in secret, and teleport in silence.',
  'Especialista em emboscada: vantagem no primeiro turno, dano brutal contra surpreendidos e disfarces.':
    'Ambush specialist: Advantage on the first turn, brutal damage against the surprised, and disguises.',
  'Ofício clássico: mãos rápidas como Ação Bônus, escalada veloz e uso de itens mágicos alheios.':
    "The classic trade: Fast Hands as a Bonus Action, quick climbing, and the use of others' magic items.",
  'Magia de Ilusão e Encantamento a serviço do furto, com Mão Mágica aprimorada e truques à distância.':
    'Illusion and Enchantment magic in service of theft, with an enhanced Mage Hand and tricks at range.',
  'Proteção Arcana absorve dano por você e pelos aliados, e a defesa contra magia melhora com o nível.':
    'Arcane Ward absorbs damage for you and your allies, and your defense against magic grows with level.',
  'Presságio: rolagens guardadas de antemão substituem resultados seus ou dos inimigos.':
    'Portent: rolls saved in advance replace your own results or those of your enemies.',
  'Molda a explosão para poupar aliados e, no auge, garante dano máximo nas magias de dano.':
    'Sculpt Spells to spare allies and, at its peak, guarantee maximum damage on damaging spells.',
  'Ilusões maleáveis que mudam de forma em tempo real e, no fim, tornam-se parcialmente reais.':
    'Malleable illusions that reshape in real time and, ultimately, become partly real.',
  'Golpes elementais: alcance ampliado, empurrões e dano de fogo, gelo, relâmpago ou trovão.':
    'Elemental strikes: extended reach, pushes, and Fire, Cold, Lightning, or Thunder damage.',
  'Técnica clássica: empurra, derruba ou atordoa com ataques desarmados, e cura a si mesmo.':
    'The classic technique: push, topple, or stun with Unarmed Strikes, and heal yourself.',
  'Mãos que curam e matam: transfere vida ou inflige dano necrótico com um toque.':
    'Hands that heal and kill: transfer life or inflict Necrotic damage with a touch.',
  'Discípulo das trevas: cria escuridão, enxerga através dela e teleporta-se entre sombras.':
    'A disciple of darkness: create shadow, see through it, and teleport between shadows.',
  'Defensor da luz e da vida: aura que reduz dano mágico, encantos feéricos e longevidade.':
    'Defender of light and life: an aura that blunts magical damage, fey charms, and long life.',
  'Cavaleiro exemplar: arma sagrada, proteção contra medo e enfeitiçamento para todo o grupo.':
    'The exemplary knight: a sacred weapon and protection from fear and charm for the whole party.',
  'Herói lendário: atletismo sobrenatural, velocidade extra para aliados e inspiração em combate.':
    'A legendary hero: supernatural athletics, extra speed for allies, and inspiration in battle.',
  'Caçador implacável: marca um inimigo jurado, persegue-o e ataca com vantagem até o fim.':
    'A relentless hunter: mark a sworn enemy, pursue them, and strike with Advantage until the end.',

  // ─── Características de classe (destaques da progressão) ─────────────────
  'Defesa sem Armadura': 'Unarmored Defense',
  'Fúria': 'Rage',
  'Maestria em Arma': 'Weapon Mastery',
  'Ataque Imprudente': 'Reckless Attack',
  'Sentido de Perigo': 'Danger Sense',
  'Conhecimento Primordial': 'Primal Knowledge',
  'Subclasse': 'Subclass',
  'Aumento no Valor de Atributo': 'Ability Score Improvement',
  'Ataque Extra': 'Extra Attack',
  'Movimento Rápido': 'Fast Movement',
  'Característica de Subclasse': 'Subclass Feature',
  'Bote Instintivo': 'Instinctive Pounce',
  'Instintos Primitivos': 'Feral Instinct',
  'Golpe Brutal': 'Brutal Strike',
  'Fúria Implacável': 'Relentless Rage',
  'Golpe Brutal Fortalecido': 'Improved Brutal Strike',
  'Fúria Persistente': 'Persistent Rage',
  'Força Indomável': 'Indomitable Might',
  'Dádiva Épica': 'Epic Boon',
  'Campeão Primitivo (FOR/CON +4, máx 25)': 'Primal Champion (STR/CON +4, max 25)',
  'Inspiração de Bardo': 'Bardic Inspiration',
  'Conjuração': 'Spellcasting',
  'Especialista': 'Expertise',
  'Pau pra Toda Obra': 'Jack of All Trades',
  'AVA': 'ASI',
  'Fonte de Inspiração': 'Font of Inspiration',
  'Contra-Encantamento': 'Countercharm',
  'Especialização': 'Expertise',
  'Segredos Mágicos': 'Magical Secrets',
  'Inspiração Superior': 'Superior Inspiration',
  'Palavras de Criação': 'Words of Creation',
  'Invocações Místicas': 'Eldritch Invocations',
  'Magia de Pacto': 'Pact Magic',
  'Astúcia Mágica': 'Magical Cunning',
  'Contatar Patrono': 'Contact Patron',
  'Arcana Mística (6º)': 'Mystic Arcanum (level 6)',
  'Arcana Mística (7º)': 'Mystic Arcanum (level 7)',
  'Arcana Mística (8º)': 'Mystic Arcanum (level 8)',
  'Arcana Mística (9º)': 'Mystic Arcanum (level 9)',
  'Mestre Místico': 'Eldritch Master',
  'Ordem Divina': 'Divine Order',
  'Canalizar Divindade': 'Channel Divinity',
  'Fulminar Mortos-Vivos': 'Turn Undead',
  'Golpes Abençoados': 'Blessed Strikes',
  'Intervenção Divina': 'Divine Intervention',
  'Golpes Abençoados Aprimorado': 'Improved Blessed Strikes',
  'Intervenção Divina Maior': 'Greater Divine Intervention',
  'Idioma Druídico': 'Druidic',
  'Ordem Primal': 'Primal Order',
  'Companheiro Selvagem': 'Wild Companion',
  'Forma Selvagem': 'Wild Shape',
  'Ressurgimento Selvagem': 'Wild Resurgence',
  'Fúria Elemental': 'Elemental Fury',
  'Fúria Elemental Aprimorada': 'Improved Elemental Fury',
  'Magias Bestiais': 'Beast Spells',
  'Arquidruida': 'Archdruid',
  'Feitiçaria Inata': 'Innate Sorcery',
  'Fonte de Magia': 'Font of Magic',
  'Metamagia': 'Metamagic',
  'Restauração Feiticeira': 'Sorcerous Restoration',
  'Feitiçaria Encarnada': 'Sorcery Incarnate',
  'Apoteose Arcana': 'Arcane Apotheosis',
  'Inimigo Favorito': 'Favored Enemy',
  'Estilo de Luta': 'Fighting Style',
  'Explorador Hábil': 'Deft Explorer',
  'Errante': 'Roving',
  'Incansável': 'Tireless',
  'Predador Implacável': 'Relentless Hunter',
  'Véu da Natureza': "Nature's Veil",
  'Caçador Preciso': 'Precise Hunter',
  'Sentidos Selvagens': 'Feral Senses',
  'Matador de Inimigos Favoritos': 'Foe Slayer',
  'Recuperar Fôlego': 'Second Wind',
  'Mente Tática': 'Tactical Mind',
  'Surto de Ação': 'Action Surge',
  'Ajuste Tático': 'Tactical Shift',
  'Indomável': 'Indomitable',
  'Mestre Tático': 'Tactical Master',
  'Dois Ataques Extras': 'Extra Attack (two)',
  'Ataques Estudados': 'Studied Attacks',
  'Três Ataques Extras': 'Extra Attack (three)',
  'Ataque Furtivo': 'Sneak Attack',
  'Gíria dos Ladrões': "Thieves' Cant",
  'Ação Ardilosa': 'Cunning Action',
  'Mira Firme': 'Steady Aim',
  'Esquiva Sobrenatural': 'Uncanny Dodge',
  'Golpe Astuto': 'Cunning Strike',
  'Evasão': 'Evasion',
  'Talento Confiável': 'Reliable Talent',
  'Golpe Astuto Aprimorado': 'Improved Cunning Strike',
  'Golpes Sujos': 'Devious Strikes',
  'Mente Escorregadia': 'Slippery Mind',
  'Elusivo': 'Elusive',
  'Golpe de Sorte': 'Stroke of Luck',
  'Adepto de Ritual': 'Ritual Adept',
  'Recuperação Arcana': 'Arcane Recovery',
  'Acadêmico': 'Scholar',
  'Memorizar Magia': 'Memorize Spell',
  'Maestria de Magias': 'Spell Mastery',
  'Assinatura Mágica': 'Signature Spells',
  'Artes Marciais': 'Martial Arts',
  'Foco do Monge': "Monk's Focus",
  'Movimento sem Armadura': 'Unarmored Movement',
  'Metabolismo Incomum': 'Uncanny Metabolism',
  'Defletir Ataques': 'Deflect Attacks',
  'Queda Lenta': 'Slow Fall',
  'Golpe Atordoante': 'Stunning Strike',
  'Ataques Potencializados': 'Empowered Strikes',
  'Movimento Acrobático': 'Acrobatic Movement',
  'Autocura': 'Self-Restoration',
  'Foco Aprimorado': 'Heightened Focus',
  'Defletir Energia': 'Deflect Energy',
  'Sobrevivente Disciplinado': 'Disciplined Survivor',
  'Foco Perfeito': 'Perfect Focus',
  'Defesa Superior': 'Superior Defense',
  'Corpo e Mente': 'Body and Mind',
  'Mãos Consagradas': 'Lay On Hands',
  'Destruição do Paladino': 'Divine Smite',
  'Montaria Fiel': 'Faithful Steed',
  'Aura de Proteção': 'Aura of Protection',
  'Repudiar Inimigos': 'Abjure Foes',
  'Aura de Coragem': 'Aura of Courage',
  'Golpes Radiantes': 'Radiant Strikes',
  'Toque Restaurador': 'Restoring Touch',
  'Aura Expandida': 'Aura Expansion',

  // ─── Categorias de arma e armadura ───────────────────────────────────────
  'Simples': 'Simple',
  'Marciais': 'Martial',
  'Leve': 'Light',
  'Pesada': 'Heavy',
  'Marciais com Acuidade ou Leve': 'Martial with Finesse or Light',
  'Marciais com propriedade Leve': 'Martial with the Light property',

  // ─── Armaduras (nomes usados na tabela de dados) ──────────────────────────
  'Acolchoada': 'Padded',
  'Couro': 'Leather',
  'Couro Batido': 'Studded Leather',
  'Gibão de Peles': 'Hide',
  'Cota de Malha Parcial': 'Chain Shirt',
  'Loriga de Escamas': 'Scale Mail',
  'Couraça Peitoral': 'Breastplate',
  'Placas Parcial': 'Half Plate',
  'Cota de Anéis': 'Ring Mail',
  'Cota de Malha': 'Chain Mail',
  'Armadura de Tala': 'Splint',
  'Placas': 'Plate',
  'Escudo': 'Shield',

  // ─── Ferramentas citadas nas classes ─────────────────────────────────────
  '3 Instrumentos Musicais à escolha': '3 Musical Instruments of your choice',
  'Kit de Herbalismo': 'Herbalism Kit',
  'Ferramentas de Ladrão': "Thieves' Tools",
  '1 Ferramenta de Artesão ou Instrumento Musical à escolha':
    "1 Artisan's Tool or Musical Instrument of your choice",

  // ─── Equipamento inicial das classes ─────────────────────────────────────
  '4 Machadinhas, Machado Grande, Kit de Aventureiro, 15 PO':
    "4 Handaxes, Greataxe, Explorer's Pack, 15 GP",
  'Armadura de Couro, 2 Adagas, Instrumento Musical à escolha, Kit de Artista, 19 PO':
    "Leather Armor, 2 Daggers, Musical Instrument of your choice, Entertainer's Pack, 19 GP",
  'Armadura de Couro, Foice, 2 Adagas, Foco Arcano (orbe), Livro (conhecimento oculto), Kit de Erudito, 15 PO':
    "Leather Armor, Sickle, 2 Daggers, Arcane Focus (orb), Book (occult lore), Scholar's Pack, 15 GP",
  'Cota de Malha Parcial, Escudo, Maça, Símbolo Sagrado, Kit de Sacerdote, 7 PO':
    "Chain Shirt, Shield, Mace, Holy Symbol, Priest's Pack, 7 GP",
  'Armadura de Couro, Escudo, Foice, Foco Druídico (Cajado), Kit de Explorador, Kit de Herbalismo, 9 PO':
    "Leather Armor, Shield, Sickle, Druidic Focus (Quarterstaff), Explorer's Pack, Herbalism Kit, 9 GP",
  'Lança, 2 Adagas, Foco Arcano (cristal), Kit de Explorador de Masmorras, 28 PO':
    "Spear, 2 Daggers, Arcane Focus (crystal), Dungeoneer's Pack, 28 GP",
  'Armadura de Couro Batido, Cimitarra, Espada Curta, Arco Longo, 20 Flechas, Aljava, Foco Druídico (ramo de visco), Kit de Aventureiro, 7 PO':
    "Studded Leather Armor, Scimitar, Shortsword, Longbow, 20 Arrows, Quiver, Druidic Focus (sprig of mistletoe), Explorer's Pack, 7 GP",
  'Cota de Malha, Espada Grande, Mangual, 8 Azagaias, Kit de Explorador de Masmorras, 4 PO':
    "Chain Mail, Greatsword, Flail, 8 Javelins, Dungeoneer's Pack, 4 GP",
  'Armadura de Couro Batido, Cimitarra, Espada Curta, Arco Longo, 20 Flechas, Aljava, Kit de Explorador de Masmorras':
    "Studded Leather Armor, Scimitar, Shortsword, Longbow, 20 Arrows, Quiver, Dungeoneer's Pack",
  'Armadura de Couro, 2 Adagas, Espada Curta, Arco Curto, 20 Flechas, Aljava, Ferramentas de Ladrão, Kit de Assaltante, 8 PO':
    "Leather Armor, 2 Daggers, Shortsword, Shortbow, 20 Arrows, Quiver, Thieves' Tools, Burglar's Pack, 8 GP",
  '2 Adagas, Foco Arcano (Cajado), Kit de Erudito, Livro de Magias, Túnica, 5 PO':
    "2 Daggers, Arcane Focus (Quarterstaff), Scholar's Pack, Spellbook, Robe, 5 GP",
  'Lança, 5 Adagas, Ferramentas de Artesão ou Instrumento Musical (escolhido para proficiência), Kit de Aventureiro, 11 PO':
    "Spear, 5 Daggers, Artisan's Tools or Musical Instrument (the one chosen for proficiency), Explorer's Pack, 11 GP",
  'Cota de Malha, Escudo, Espada Longa, 6 Azagaias, Símbolo Sagrado, Kit de Sacerdote, 9 PO':
    "Chain Mail, Shield, Longsword, 6 Javelins, Holy Symbol, Priest's Pack, 9 GP",
  '75 PO': '75 GP',
  '90 PO': '90 GP',
  '100 PO': '100 GP',
  '110 PO': '110 GP',
  '150 PO': '150 GP',
  '155 PO': '155 GP',
  '55 PO': '55 GP',
  '50 PO': '50 GP',
  'ver livro': 'see the rulebook',

  // ─── Notas ───────────────────────────────────────────────────────────────
  'Idioma secreto dos círculos druídicos. Concedido automaticamente no nível 1.':
    'Secret language of druidic circles. Granted automatically at level 1.',
  'Idioma secreto das guildas criminosas. Concedido automaticamente no nível 1.':
    'Secret language of criminal guilds. Granted automatically at level 1.',

  // ─── Perícias ────────────────────────────────────────────────────────────
  'Acrobacia': 'Acrobatics',
  'Arcanismo': 'Arcana',
  'Atletismo': 'Athletics',
  'Enganação': 'Deception',
  'História': 'History',
  'Intimidação': 'Intimidation',
  'Intuição': 'Insight',
  'Investigação': 'Investigation',
  'Lidar com Animais': 'Animal Handling',
  'Medicina': 'Medicine',
  'Percepção': 'Perception',
  'Persuasão': 'Persuasion',
  'Prestidigitação': 'Sleight of Hand',
  'Religião': 'Religion',

  // ─── Idiomas ─────────────────────────────────────────────────────────────
  'Comum': 'Common',
  'Linguagem de Sinais Comum': 'Common Sign Language',
  'Dracônico': 'Draconic',
  'Anão': 'Dwarvish',
  'Élfico': 'Elvish',
  'Gigante': 'Giant',
  'Gnômico': 'Gnomish',
  'Goblin': 'Goblin',
  'Pequenino': 'Halfling',
  'Orc': 'Orc',
  'Abissal': 'Abyssal',
  'Celestial': 'Celestial',
  'Dialeto Obscuro': 'Deep Speech',
  'Druídico': 'Druidic',
  'Infernal': 'Infernal',
  'Primordial': 'Primordial',
  'Silvestre': 'Sylvan',
  'Subcomum': 'Undercommon',
  'Sigil': 'Sigil',
  'Dragões': 'Dragons',
  'Anões': 'Dwarves',
  'Elfos': 'Elves',
  'Gigantes': 'Giants',
  'Gnomos': 'Gnomes',
  'Goblinoides': 'Goblinoids',
  'Pequeninos': 'Halflings',
  'Orcs': 'Orcs',
  'Demônios do Abismo': 'Demons of the Abyss',
  'Celestiais': 'Celestials',
  'Aberrações': 'Aberrations',
  'Círculos druídicos': 'Druidic circles',
  'Várias guildas criminosas': 'Various criminal guilds',
  'Diabos dos Nove Infernos': 'Devils of the Nine Hells',
  'Elementais': 'Elementals',
  'Inclui dialetos Aquan, Auran, Ignan e Terran':
    'Includes the Aquan, Auran, Ignan, and Terran dialects',
  'A Faéria': 'The Feywild',
  'A Umbraeterna': 'The Shadowfell',

  // ─── Espécies ────────────────────────────────────────────────────────────
  'Aasimar': 'Aasimar',
  'Draconato': 'Dragonborn',
  'Elfo': 'Elf',
  'Gnomo': 'Gnome',
  'Golias': 'Goliath',
  'Humano': 'Human',
  'Tiferino': 'Tiefling',
  'Médio': 'Medium',
  'Pequeno': 'Small',

  'Resistência Celestial': 'Celestial Resistance',
  'Resistência a dano Necrótico e Radiante.': 'Resistance to Necrotic and Radiant damage.',
  'Visão no Escuro': 'Darkvision',
  'Enxerga no escuro até 18 metros.': 'You can see in the dark up to 60 feet.',
  'Enxerga no escuro até 36 metros.': 'You can see in the dark up to 120 feet.',
  'Mãos Curativas': 'Healing Hands',
  'Ação Usar Magia; cura Bônus de Proficiência × d4 PV em uma criatura tocada. 1×/Descanso Longo.':
    'Magic action; heal a creature you touch for Proficiency Bonus × d4 HP. Once per Long Rest.',
  'Portador da Luz': 'Light Bearer',
  'Conhece o truque Luz. Carisma é o atributo de conjuração.':
    'You know the Light cantrip. Charisma is your spellcasting ability for it.',
  'Revelação Celestial': 'Celestial Revelation',
  'Ação Bônus: transforma-se por 1 min, 1×/Descanso Longo. Causa dano adicional = Bônus de Prof. (Necrótico ou Radiante). Opções:':
    'Bonus Action: transform for 1 minute, once per Long Rest. Deal extra damage equal to your Proficiency Bonus (Necrotic or Radiant). Options:',
  'Asas Celestiais': 'Heavenly Wings',
  'Deslocamento de Voo igual ao Deslocamento.': 'Fly Speed equal to your Speed.',
  'Manto Necrótico': 'Necrotic Shroud',
  'Criaturas não aliadas a 3m: sal. CAR (CD = 8 + mod CAR + Prof.) ou ficam Amedrontadas até fim do próximo turno.':
    'Creatures other than allies within 10 feet must succeed on a CHA save (DC = 8 + CHA mod + Proficiency Bonus) or be Frightened until the end of your next turn.',
  'Transfiguração Radiante': 'Radiant Consumption',
  'Emite Luz Plena 3m, Meia-luz +3m. No fim de cada turno: criaturas a 3m sofrem dano Radiante = Bônus de Prof.':
    'You shed Bright Light in a 10-foot radius and Dim Light for another 10 feet. At the end of each of your turns, creatures within 10 feet take Radiant damage equal to your Proficiency Bonus.',
  'Resistência a Toxinas': 'Dwarven Resilience',
  'Resistência a Dano Venenoso. Vantagem em salvaguardas contra Envenenado.':
    'Resistance to Poison damage. Advantage on saves against the Poisoned condition.',
  'Tenacidade Anã': 'Dwarven Toughness',
  'PV máximos +1 agora e +1 a cada nível de personagem.':
    'Your HP maximum increases by 1, and by 1 again at every character level.',
  'Conhecimento de Pedras': 'Stonecunning',
  'Ação Bônus: Sismiconsciência 18m por 10 min (apenas em superfície de pedra). Usos = Bônus de Prof.; restaura em Descanso Longo.':
    'Bonus Action: gain Tremorsense out to 60 feet for 10 minutes (only while on a stone surface). Uses equal your Proficiency Bonus, regained on a Long Rest.',
  'Herança Dracônica': 'Draconic Ancestry',
  'Escolha um tipo de dragão. Define o tipo de dano do Ataque de Sopro e Resistência a Dano.':
    'Choose a kind of dragon. It sets the damage type of your Breath Weapon and Damage Resistance.',
  'Ataque de Sopro': 'Breath Weapon',
  'Substitui um ataque: Cone 4,5m ou Linha 9m. Sal. DES (CD = 8 + mod CON + Prof.). Falha: dano pelo tipo da Herança. Sucesso: metade. Dano: 1d10 (nível 1), 2d10 (nível 5), 3d10 (nível 11), 4d10 (nível 17). Usos = Bônus de Prof.; restaura em Descanso Longo.':
    'Replace one attack: 15-foot Cone or 30-foot Line. DEX save (DC = 8 + CON mod + Proficiency Bonus). Failure: damage of your Ancestry type; success: half. Damage: 1d10 (level 1), 2d10 (level 5), 3d10 (level 11), 4d10 (level 17). Uses equal your Proficiency Bonus, regained on a Long Rest.',
  'Resistência a Dano': 'Damage Resistance',
  'Resistência ao tipo de dano da Herança Dracônica.':
    'Resistance to the damage type of your Draconic Ancestry.',
  'Voo Dracônico': 'Draconic Flight',
  'Ação Bônus: asas espectrais por 10 min, Deslocamento de Voo = Deslocamento. 1×/Descanso Longo.':
    'Bonus Action: sprout spectral wings for 10 minutes, gaining a Fly Speed equal to your Speed. Once per Long Rest.',
  'Drow tem Visão no Escuro de 36m': 'Drow have 120 feet of Darkvision',
  '18m (Drow: 36m).': '60 feet (Drow: 120 feet).',
  'Linhagem Élfica': 'Elven Lineage',
  'Escolha uma linhagem. Concede truques e magias por nível.':
    'Choose a lineage. It grants cantrips and spells as you level up.',
  'Alto Elfo': 'High Elf',
  'Drow': 'Drow',
  'Elfo Silvestre': 'Wood Elf',
  'Ancestralidade Feérica': 'Fey Ancestry',
  'Vantagem em salvaguardas para evitar/encerrar a condição Enfeitiçado.':
    'Advantage on saves to avoid or end the Charmed condition.',
  'Sentidos Aguçados': 'Keen Senses',
  'Proficiência em Intuição, Percepção ou Sobrevivência (à escolha).':
    'Proficiency in Insight, Perception, or Survival (your choice).',
  'Transe': 'Trance',
  'Completa Descanso Longo em 4h de meditação. Não precisa dormir. Imune a magias que forçam sono.':
    'You finish a Long Rest in 4 hours of meditation. You need not sleep and are immune to magic that forces sleep.',
  'Astúcia de Gnomo': 'Gnomish Cunning',
  'Vantagem em salvaguardas de Inteligência, Sabedoria e Carisma.':
    'Advantage on Intelligence, Wisdom, and Charisma saving throws.',
  'Linhagem Gnômica': 'Gnomish Lineage',
  'Escolha uma linhagem.': 'Choose a lineage.',
  'Gnomo das Rochas': 'Rock Gnome',
  'Truques Prestidigitação Arcana e Reparar. Pode gastar 10 min conjurando Prestidigitação Arcana para fabricar um dispositivo mecânico minúsculo (CA 5, 1 PV). Até 3 dispositivos simultâneos; cada um se desfaz em 8h.':
    'You know the Prestidigitation and Mending cantrips. You can spend 10 minutes casting Prestidigitation to build a Tiny clockwork device (AC 5, 1 HP). Up to 3 devices at once; each falls apart after 8 hours.',
  'Gnomo do Bosque': 'Forest Gnome',
  'Truque Ilusão Menor. Falar com Animais sempre preparada; pode conjurá-la sem espaço de magia (usos = Bônus de Prof.; restaura em Descanso Longo).':
    'You know the Minor Illusion cantrip. Speak with Animals is always prepared and can be cast without a spell slot (uses equal your Proficiency Bonus, regained on a Long Rest).',
  'Ancestralidade Gigante': 'Giant Ancestry',
  'Escolha 1 benefício sobrenatural. Usos = Bônus de Prof.; restaura em Descanso Longo.':
    'Choose 1 supernatural boon. Uses equal your Proficiency Bonus, regained on a Long Rest.',
  'Arrepio do Gelo (Gigante do Gelo)': "Frost's Chill (Frost Giant)",
  '+1d6 Gélido ao alvo + reduz Deslocamento 3m até início do próximo turno.':
    '+1d6 Cold damage and reduce the target Speed by 10 feet until the start of your next turn.',
  'Queimadura de Fogo (Gigante do Fogo)': "Fire's Burn (Fire Giant)",
  '+1d10 Ígneo ao alvo.': '+1d10 Fire damage to the target.',
  'Resistência da Pedra (Gigante da Pedra)': "Stone's Endurance (Stone Giant)",
  'Reação ao sofrer dano: joga 1d12 + mod CON, reduz dano.':
    'Reaction when you take damage: roll 1d12 + CON mod and reduce the damage by that total.',
  'Salto da Nuvem (Gigante das Nuvens)': "Cloud's Jaunt (Cloud Giant)",
  'Ação Bônus: teleporta-se até 9m para espaço desocupado à vista.':
    'Bonus Action: teleport up to 30 feet to an unoccupied space you can see.',
  'Tombo da Colina (Gigante da Colina)': "Hill's Tumble (Hill Giant)",
  'Ao acertar criatura Grande ou menor: impõe condição Caído.':
    'When you hit a Large or smaller creature, you can give it the Prone condition.',
  'Trovão da Tempestade (Gigante da Tempestade)': "Storm's Thunder (Storm Giant)",
  'Reação ao sofrer dano de criatura a 18m: causa 1d8 Trovejante nela.':
    'Reaction when you take damage from a creature within 60 feet: deal 1d8 Thunder damage to it.',
  'Forma Grande': 'Large Form',
  'Ação Bônus: torna-se Grande por 10 min (se houver espaço). Vantagem em testes de Força, Deslocamento +3m. 1×/Descanso Longo.':
    'Bonus Action: become Large for 10 minutes (if there is room). Advantage on Strength checks and +10 feet Speed. Once per Long Rest.',
  'Porte Poderoso': 'Powerful Build',
  'Vantagem em testes para encerrar condição Imobilizado. Conta como tamanho maior para capacidade de carga.':
    'Advantage on checks to end the Grappled condition. You count as one size larger for carrying capacity.',
  'Eficiente': 'Resourceful',
  'Adquire Inspiração Heroica ao completar cada Descanso Longo.':
    'You gain Heroic Inspiration whenever you finish a Long Rest.',
  'Hábil': 'Skillful',
  'Proficiência em uma perícia à escolha.': 'Proficiency in one skill of your choice.',
  'Versátil': 'Versatile',
  'Adquire um Talento de Origem à escolha (recomendado: Habilidoso).':
    'You gain an Origin Feat of your choice (Skilled recommended).',
  'Pico de Adrenalina': 'Adrenaline Rush',
  'Ação Bônus: executa ação Correr + ganha PV Temporários = Bônus de Prof. Usos = Bônus de Prof.; restaura em Descanso Curto ou Longo.':
    'Bonus Action: take the Dash action and gain Temporary HP equal to your Proficiency Bonus. Uses equal your Proficiency Bonus, regained on a Short or Long Rest.',
  'Vigor Implacável': 'Relentless Endurance',
  'Ao ser reduzido a 0 PV (sem morrer imediatamente), fica com 1 PV. 1×/Descanso Longo.':
    'When reduced to 0 HP without being killed outright, you drop to 1 HP instead. Once per Long Rest.',
  'Corajoso': 'Brave',
  'Vantagem em salvaguardas para evitar/encerrar a condição Amedrontado.':
    'Advantage on saves to avoid or end the Frightened condition.',
  'Agilidade Pequenina': 'Halfling Nimbleness',
  'Pode mover pelo espaço de qualquer criatura um tamanho maior, mas não pode parar no mesmo espaço.':
    'You can move through the space of any creature one size larger than you, but you cannot stop there.',
  'Sorte': 'Luck',
  'Ao tirar 1 no D20 de um Teste de D20, pode re-rolar e usar o novo resultado.':
    'When you roll a 1 on the d20 of a D20 Test, you can reroll and must use the new roll.',
  'Furtividade Natural': 'Naturally Stealthy',
  'Pode executar a ação Esconder mesmo encoberto apenas por criatura pelo menos um tamanho maior.':
    'You can take the Hide action even when obscured only by a creature at least one size larger than you.',
  'Legado Ínfero': 'Fiendish Legacy',
  'Escolha um legado. Concede Resistência, truque e magias por nível.':
    'Choose a legacy. It grants a Resistance, a cantrip, and spells as you level up.',
  'Ctônico': 'Chthonic',
  'Presença Sobrenatural': 'Otherworldly Presence',
  'Conhece o truque Taumaturgia (usa o mesmo atributo de conjuração do Legado Ínfero).':
    'You know the Thaumaturgy cantrip, cast with the same ability as your Fiendish Legacy.',

  // ─── Estilos de luta ─────────────────────────────────────────────────────
  'Arqueiro': 'Archery',
  '+2 de bônus nas jogadas de ataque com armas à distância.':
    '+2 bonus to attack rolls made with Ranged weapons.',
  'Combate Cego': 'Blind Fighting',
  'Você tem visão às cegas de 3 metros. Dentro desse alcance enxerga qualquer coisa que não esteja atrás de cobertura total, mesmo que esteja Invisível ou no escuro.':
    'You have Blindsight out to 10 feet. Within that range you can see anything that is not behind Total Cover, even if Invisible or in the dark.',
  'Defesa': 'Defense',
  '+1 de bônus na CA enquanto estiver usando armadura.':
    '+1 bonus to AC while you are wearing armor.',
  'Duelo': 'Dueling',
  '+2 de bônus nas jogadas de ataque ao empunhar uma arma corpo a corpo em uma mão sem outras armas.':
    '+2 bonus to damage rolls when wielding a Melee weapon in one hand and no other weapons.',
  'Combate com Arma Grande': 'Great Weapon Fighting',
  'Ao rolar 1 ou 2 em um dado de dano com arma de duas mãos ou versátil (com duas mãos), role novamente e use o novo resultado.':
    'When you roll a 1 or 2 on a damage die of a Two-Handed or Versatile weapon (used with two hands), reroll it and use the new roll.',
  'Intercepcão': 'Interception',
  'Como reação, quando uma criatura visível acerta um alvo próximo, você reduz o dano desse alvo em 1d10 + bônus de proficiência (requer escudo ou arma).':
    'Reaction, when a creature you can see hits a target near you: reduce that damage by 1d10 + your Proficiency Bonus (requires a Shield or weapon).',
  'Como reação, você impõe desvantagem em um ataque contra um aliado a 1,5 m de você. Requer escudo.':
    'Reaction: impose Disadvantage on an attack against an ally within 5 feet of you. Requires a Shield.',
  'Arma de Arremesso': 'Thrown Weapon Fighting',
  '+2 de bônus nas jogadas de ataque com armas de arremesso. Ao acertar um ataque corpo a corpo com uma delas, pode sacar outra do mesmo tipo como parte do mesmo ataque.':
    '+2 bonus to damage rolls with Thrown weapons. When you hit with one, you can draw another of the same kind as part of the attack.',
  'Combate com Duas Armas': 'Two-Weapon Fighting',
  'Você pode adicionar seu modificador de atributo ao dano do segundo ataque no combate com duas armas.':
    'You can add your ability modifier to the damage of the second attack when fighting with two weapons.',
  'Desarmado ou só com armas corpo a corpo e sem armadura pesada: ataques desarmados usam d6 de dano (ou d8 com as duas mãos livres, sem escudo).':
    'While unarmed or wielding only Melee weapons and not wearing Heavy armor, your Unarmed Strikes deal d6 damage (d8 with both hands free and no Shield).',

  // ─── Ordens divinas / primais ────────────────────────────────────────────
  'Treinado para o combate, você ganha proficiência com armas marciais e armaduras pesadas.':
    'Trained for battle, you gain proficiency with Martial weapons and Heavy armor.',
  'Taumaturgo': 'Thaumaturge',
  'Você estudou os milagres divinos. Aprende um truque adicional de Clérigo e ganha proficiência em Arcanismo (ou especialização, se já for proficiente).':
    'You studied divine miracles. You learn one extra Cleric cantrip and gain proficiency in Arcana (or Expertise if already proficient).',
  'Mágico': 'Magician',
  'Você estudou a magia antiga com olhar acadêmico. Aprende um truque adicional de Mago e ganha proficiência em Arcanismo (ou especialização, se já for proficiente).':
    'You studied ancient magic as a scholar. You learn one extra Wizard cantrip and gain proficiency in Arcana (or Expertise if already proficient).',
  'Você se dedicou a defender a natureza. Ganha proficiência com armas marciais e armaduras médias (apenas peças não metálicas, conforme o código druídico).':
    'You devoted yourself to defending nature. You gain proficiency with Martial weapons and Medium armor (nonmetal only, per the druidic code).',

  // ─── Inimigos favoritos ──────────────────────────────────────────────────
  'Aberração': 'Aberration',
  'Besta': 'Beast',
  'Construto': 'Construct',
  'Dragão': 'Dragon',
  'Elemental': 'Elemental',
  'Fada': 'Fey',
  'Demônio': 'Fiend',
  'Humanoide': 'Humanoid',
  'Monstruosidade': 'Monstrosity',
  'Gosma': 'Ooze',
  'Planta': 'Plant',
  'Morto-Vivo': 'Undead',

  // ─── Talentos de origem ──────────────────────────────────────────────────
  'Origem': 'Origin',
  'Geral': 'General',
  'Alerta': 'Alert',
  'Proficiência em Iniciativa (adiciona Bônus de Proficiência à jogada de Iniciativa). Pode trocar sua Iniciativa com a de um aliado voluntário imediatamente após rolar (nenhum dos dois pode estar Incapacitado).':
    'Initiative Proficiency (add your Proficiency Bonus to Initiative). You can swap your Initiative with a willing ally immediately after rolling (neither may be Incapacitated).',
  'Artifista': 'Crafter',
  'Proficiência com 3 Ferramentas de Artesão à escolha da tabela Fabricação Rápida. Desconto de 20% em itens não-mágicos. Ao completar um Descanso Longo, pode fabricar 1 item da tabela (se tiver a ferramenta associada); o item se desfaz no próximo Descanso Longo.':
    "Proficiency with 3 Artisan's Tools of your choice from the Fast Crafting table. 20% discount on nonmagical items. When you finish a Long Rest, you can craft 1 item from the table (if you have the matching tool); it falls apart at your next Long Rest.",
  'Atacante Selvagem': 'Savage Attacker',
  'Uma vez por turno, ao atingir um alvo com uma arma, pode jogar os dados de dano duas vezes e usar qualquer uma das jogadas.':
    'Once per turn, when you hit with a weapon, you can roll its damage dice twice and use either roll.',
  'Curandeiro': 'Healer',
  'Médico de Combate: com Kit de Curandeiro, gasta 1 uso como ação Usar Objeto para que uma criatura a 1,5m gaste 1 Dado de PV; você joga o dado e ela recupera PV = resultado + Bônus de Prof. Cura Garantida: ao jogar 1 em qualquer dado de cura (magia ou talento), pode re-rolar (usa o novo resultado).':
    'Battle Medic: with a Healer\'s Kit, spend 1 use as a Utilize action so a creature within 5 feet can spend 1 Hit Die; roll it and they regain HP equal to the roll + your Proficiency Bonus. Healing Rerolls: when you roll a 1 on any healing die (spell or feat), you can reroll and use the new result.',
  'Habilidoso': 'Skilled',
  'Adquire proficiência em qualquer combinação de 3 perícias ou ferramentas à escolha. Pode ser adquirido mais de uma vez.':
    'You gain proficiency in any combination of 3 skills or tools of your choice. Repeatable.',
  'Iniciado em Magia': 'Magic Initiate',
  'Escolha uma lista de magias (Clérigo, Druida ou Mago). Aprende 2 truques dessa lista. Aprende 1 magia de 1º círculo da mesma lista (sempre preparada; conjura 1×/Descanso Longo sem espaço de magia, ou com qualquer espaço que tiver). INT, SAB ou CAR é seu atributo de conjuração (escolha ao adquirir). Pode substituir uma magia ao subir de nível. Pode ser adquirido mais de uma vez (lista diferente a cada vez).':
    'Choose a spell list (Cleric, Druid, or Wizard). You learn 2 cantrips from it and 1 level 1 spell from the same list (always prepared; cast once per Long Rest without a slot, or with any slot you have). INT, WIS, or CHA is your spellcasting ability (chosen when you take the feat). You can replace the spell when you level up. Repeatable (a different list each time).',
  'Músico': 'Musician',
  'Proficiência com 3 Instrumentos Musicais à escolha. Canção Encorajadora: ao completar um Descanso Curto ou Longo, toca música com instrumento em que tem proficiência e concede Inspiração Heroica a um número de aliados que ouvem igual ao Bônus de Prof.':
    'Proficiency with 3 Musical Instruments of your choice. Encouraging Song: when you finish a Short or Long Rest, play an instrument you are proficient with and grant Heroic Inspiration to a number of allies who hear it equal to your Proficiency Bonus.',
  'Sortudo': 'Lucky',
  'Pontos de Sorte = Bônus de Prof. (restaura em Descanso Longo). Gaste 1 ponto para: Vantagem em um Teste de D20 seu, ou impor Desvantagem em uma jogada de ataque contra você.':
    'Luck Points equal to your Proficiency Bonus (regained on a Long Rest). Spend 1 point to gain Advantage on a D20 Test of yours, or to impose Disadvantage on an attack roll against you.',
  'Valentão de Taverna': 'Tavern Brawler',
  'Ataque Desarmado Aprimorado: causa 1d4 + mod FOR Contundente (em vez do normal). Dano Garantido: re-rola 1 em dado de Ataque Desarmado. Armamento Improvisado: proficiência com armas improvisadas. Empurrar: ao acertar Ataque Desarmado na ação Atacar, pode causar dano e empurrar 1,5m (1×/turno).':
    'Enhanced Unarmed Strike: deal 1d4 + STR mod Bludgeoning damage instead of the normal damage. Damage Rerolls: reroll a 1 on an Unarmed Strike die. Improvised Weaponry: proficiency with improvised weapons. Push: when you hit with an Unarmed Strike as part of the Attack action, you can deal damage and push the target 5 feet (once per turn).',
  'Vigoroso': 'Tough',
  'PV máximos aumentam em 2 × nível de personagem ao adquirir este talento. Em cada nível posterior, PV máximos aumentam em 2 adicionais.':
    'Your HP maximum increases by twice your character level when you take this feat, and by 2 more at each level thereafter.',

  // ─── Talentos gerais ─────────────────────────────────────────────────────
  'Ator': 'Actor',
  'Você tem vantagem em testes de Enganação e Atuação ao se passar por outra pessoa. Pode imitar sons de criaturas que ouviu por pelo menos 1 minuto, enganando observadores com Intuição passiva abaixo de 16.':
    'Advantage on Deception and Performance checks when impersonating someone. You can mimic sounds of creatures you have heard for at least 1 minute, fooling listeners with a Passive Insight below 16.',
  'Atleta': 'Athlete',
  '+1 em FOR ou DES. Levantar do chão custa apenas 1,5 m de movimento. Escalar não custa movimento extra. Pode fazer salto com corrida após mover apenas 1,5 m.':
    '+1 STR or DEX. Standing up costs only 5 feet of movement. Climbing costs no extra movement. You can make a running jump after moving only 5 feet.',
  'Carregador': 'Charger',
  '+1 em FOR ou CON. Ao usar a ação Traço em seu turno, você pode mover até 4,5 m e atacar uma criatura com arma corpo a corpo ou desarmado no fim desse movimento.':
    '+1 STR or CON. When you take the Dash action on your turn, you can move up to 15 feet and attack a creature with a Melee weapon or an Unarmed Strike at the end of that movement.',
  'Especialista em Besta': 'Crossbow Expert',
  'Ignorar o requisito de recarga em bestas de mão. Quando usar o Ataque Bônus com besta de mão, pode sacar uma besta de mão como parte do ataque. Não tem desvantagem ao atacar a 1,5 m com uma besta.':
    'Ignore the Loading property of Hand Crossbows. When you make a Bonus Action attack with a Hand Crossbow, you can draw one as part of the attack. No Disadvantage when attacking within 5 feet with a crossbow.',
  'Esmagador': 'Crusher',
  '+1 em FOR ou CON. Uma vez por turno, ao acertar com um ataque usando dano de contusão, pode empurrar o alvo 1,5 m se for Grande ou menor. Críticos com dano de contusão impõem desvantagem na próxima jogada de ataque do alvo.':
    '+1 STR or CON. Once per turn, when you hit with an attack dealing Bludgeoning damage, you can push the target 5 feet if it is Large or smaller. A Critical Hit with Bludgeoning damage imposes Disadvantage on the target next attack roll.',
  'Duelista Defensivo': 'Defensive Duelist',
  'Ao ser acertado por um ataque enquanto segura uma arma com a propriedade fineza, pode usar Reação para adicionar seu Bônus de Proficiência à CA contra aquele ataque, podendo evitá-lo.':
    'When hit by an attack while holding a Finesse weapon, you can use your Reaction to add your Proficiency Bonus to your AC against that attack, possibly causing it to miss.',
  'Combatente com Duas Armas': 'Dual Wielder',
  '+1 em FOR ou DES. Você pode usar armas de uma mão com a propriedade Leve no combate com duas armas, mesmo que não sejam Leves. Você pode usar um escudo e ainda fazer ataques com duas armas.':
    '+1 STR or DEX. You can use one-handed weapons for two-weapon fighting even if they lack the Light property. You can use a Shield and still make two-weapon attacks.',
  'Fey Tocado': 'Fey-Touched',
  '+1 em INT, SAB ou CAR. Aprende Toque das Névoas e uma magia de 1º nível de Adivinhaçâo ou Encantamento. Pode conjurar cada uma dessas magias uma vez sem espaço de magia por Descanso Longo.':
    '+1 INT, WIS, or CHA. You learn Misty Step and one level 1 Divination or Enchantment spell. You can cast each of them once per Long Rest without a spell slot.',
  'Lutador de Chão': 'Grappler',
  '+1 em FOR ou DES. Tem vantagem em ataques contra criaturas que você está agarrando. Pode usar Ação Bônus para tentar agarrar uma criatura após acertá-la com ataque desarmado.':
    '+1 STR or DEX. Advantage on attacks against creatures you are grappling. You can use a Bonus Action to try to grapple a creature after hitting it with an Unarmed Strike.',
  'Mestre de Armas Pesadas': 'Great Weapon Master',
  'Antes de atacar com arma pesada que você tem proficiência, pode aceitar -5 na jogada de ataque para +10 no dano se acertar. Ao reduzir uma criatura a 0 PV com arma corpo a corpo, pode mover-se até 1,5 m e atacar outra como Ação Bônus.':
    'Before attacking with a Heavy weapon you are proficient with, you can take -5 on the attack roll for +10 damage on a hit. When you drop a creature to 0 HP with a Melee weapon, you can move up to 5 feet and attack another as a Bonus Action.',
  'Mestre de Armadura Pesada': 'Heavily Armored',
  '+1 em FOR. Enquanto usar armadura pesada, dano de perfuração, corte e contusão não mágico é reduzido em 3.':
    '+1 STR. While wearing Heavy armor, nonmagical Bludgeoning, Piercing, and Slashing damage you take is reduced by 3.',
  'Líder Inspirador': 'Inspiring Leader',
  'Após um descanso curto ou longo, pode gastar 10 min para inspirar aliados. Até 6 criaturas de sua escolha (incluindo você) que possam vê-lo e ouvi-lo ganham PV temporários iguais ao seu nível + mod de CAR.':
    'After a Short or Long Rest, you can spend 10 minutes inspiring allies. Up to 6 creatures of your choice (including you) that can see and hear you gain Temporary HP equal to your level + your CHA modifier.',
  'Mente Afiada': 'Keen Mind',
  '+1 em INT. Você sempre sabe qual é a direção norte. Você tem memória perfeita de locais que visitou e coisas que ouviu ou leu nos últimos 30 dias.':
    '+1 INT. You always know which way is north, and you recall perfectly anything you have seen, heard, or read in the past 30 days.',
  'Caçador de Magos': 'Mage Slayer',
  'Você tem vantagem em salvaguardas contra magias. Quando uma criatura a até 1,5 m de você conjura uma magia, pode usar Reação para realizar um ataque corpo a corpo contra ela.':
    'Advantage on saving throws against spells. When a creature within 5 feet of you casts a spell, you can use your Reaction to make a Melee attack against it.',
  'Treinamento em Armas Marciais': 'Martial Weapon Training',
  '+1 em FOR ou DES. Você ganha proficiência com todas as armas marciais.':
    '+1 STR or DEX. You gain proficiency with all Martial weapons.',
  'Combatente Montado': 'Mounted Combatant',
  'Vantagem em ataques corpo a corpo contra criaturas desmontadas menores que sua montaria. Pode forçar um ataque destinado à montaria a mirar em você. Se a montaria for alvo de um efeito que pede salvaguarda para metade do dano, ela não sofre dano numa salvaguarda bem-sucedida.':
    'Advantage on Melee attacks against unmounted creatures smaller than your mount. You can force an attack aimed at your mount to target you instead. If your mount is subject to an effect allowing a save for half damage, it takes no damage on a success.',
  'Observador': 'Observant',
  '+1 em INT ou SAB. Você pode ler os lábios de qualquer criatura que fale um idioma que você entenda. Sua Percepção Passiva e Investigação Passiva aumentam em 5.':
    '+1 INT or WIS. You can read the lips of any creature speaking a language you understand. Your Passive Perception and Passive Investigation increase by 5.',
  'Mestre de Armas de Haste': 'Polearm Master',
  'Quando usar ação de Ataque com uma arma de alcance corpo a corpo versatível ou que tenha a propriedade Alcance, pode usar Ação Bônus para atacar com a extremidade oposta (d4 de contusão). Criaturas que entrem em seu alcance provocam ataque de oportunidade.':
    'When you take the Attack action with a Versatile Melee weapon or one with the Reach property, you can use a Bonus Action to attack with the opposite end (d4 Bludgeoning). Creatures entering your reach provoke an Opportunity Attack.',
  'Resiliente': 'Resilient',
  '+1 em um atributo à sua escolha. Você ganha proficiência em salvaguardas do atributo escolhido.':
    '+1 to an ability score of your choice. You gain saving throw proficiency with that ability.',
  'Conjurador Ritualista': 'Ritual Caster',
  'Aprende dois rituais de 1º nível de qualquer classe conjuradora. Pode conjurá-los como rituais. Pode aprender magias de ritual adicionais ao encontrá-las em grimórios ou pergaminhos (INT 13+ para arcanos, SAB 13+ para divinos).':
    'You learn two level 1 rituals from any spellcasting class and can cast them as rituals. You can learn more ritual spells by finding them in spellbooks or scrolls (INT 13+ for arcane, WIS 13+ for divine).',
  'Sentinela': 'Sentinel',
  'Quando você acerta um ataque de oportunidade, a velocidade do alvo cai a 0. Criaturas provocam ataques de oportunidade mesmo ao usar a ação Desengajar. Quando uma criatura a até 1,5 m ataca alguém que não seja você, pode usar Reação para atacá-la.':
    'When you hit with an Opportunity Attack, the target Speed drops to 0. Creatures provoke Opportunity Attacks even when they Disengage. When a creature within 5 feet attacks someone other than you, you can use your Reaction to attack it.',
  'Tocado pelas Sombras': 'Shadow-Touched',
  '+1 em INT, SAB ou CAR. Aprende Causar Medo e uma magia de 1º nível de Ilusão ou Necromancia. Pode conjurar cada uma dessas magias uma vez sem espaço de magia por Descanso Longo.':
    '+1 INT, WIS, or CHA. You learn Cause Fear and one level 1 Illusion or Necromancy spell. You can cast each of them once per Long Rest without a spell slot.',
  'Mestre de Escudo': 'Shield Master',
  'Se realizar a ação de Ataque em seu turno, pode usar Ação Bônus para empurrar uma criatura a 1,5 m com seu escudo. Pode usar Reação para interpor o escudo e não sofrer dano em uma salvaguarda bem-sucedida de DES que normalmente causaria metade do dano.':
    'If you take the Attack action on your turn, you can use a Bonus Action to shove a creature within 5 feet with your Shield. You can use your Reaction to interpose your Shield and take no damage on a successful DEX save that would normally deal half damage.',
  'Especialista em Perícia': 'Skill Expert',
  '+1 em um atributo à sua escolha. Você ganha proficiência em uma perícia de sua escolha. Escolha uma perícia em que você já tenha proficiência — você ganha especialização nela, dobrando seu Bônus de Proficiência.':
    '+1 to an ability score of your choice. You gain proficiency in one skill of your choice, and Expertise in one skill you are already proficient with, doubling your Proficiency Bonus for it.',
  'Furtivo': 'Skulker',
  'Você pode se esconder quando levemente obscurecido por névoa, chuva forte, folhagem e condições similares. Penumbra não impede que você fique Oculto. Permanecer oculto enquanto usa Furtividade não revela sua posição se você errar.':
    'You can Hide when Lightly Obscured by fog, heavy rain, foliage, and similar conditions. Dim Light does not prevent you from being Hidden. Missing with an attack while Hidden does not reveal your position.',
  'Veloz': 'Mobile',
  '+1 em DES. Sua velocidade aumenta em 3 m. Quando você usa a ação de Ataque, pode usar Ação Bônus para Correr ou Desengajar.':
    '+1 DEX. Your Speed increases by 10 feet. When you take the Attack action, you can use a Bonus Action to Dash or Disengage.',
  'Atirador de Feitiços': 'Spell Sniper',
  'Ao conjurar magias que exigem jogada de ataque, o alcance dobra. Suas magias de ataque ignoram meia cobertura e três quartos de cobertura. Aprende um truque que exige jogada de ataque, de qualquer lista de classes.':
    'When you cast a spell that requires an attack roll, its range doubles. Your attack spells ignore Half Cover and Three-Quarters Cover. You learn one cantrip that requires an attack roll, from any class list.',
  'Telequinético': 'Telekinetic',
  '+1 em INT, SAB ou CAR. Aprende o truque Mão Mágica, conjurando-o sem componentes verbais ou somáticos. Pode usar Ação Bônus para mover telecineticamente uma criatura a até 9 m (salvaguarda de FOR ou DES contra CD 8 + proficiência + modificador do atributo escolhido).':
    '+1 INT, WIS, or CHA. You learn the Mage Hand cantrip and can cast it without Verbal or Somatic components. You can use a Bonus Action to telekinetically move a creature within 30 feet (STR or DEX save against DC 8 + Proficiency Bonus + the chosen ability modifier).',
  'Telepático': 'Telepathic',
  '+1 em INT, SAB ou CAR. Aprende Detectar Pensamentos, podendo conjurá-lo uma vez por Descanso Longo sem espaço. Pode se comunicar telepaticamente com qualquer criatura inteligente a até 18 m que você possa ver.':
    '+1 INT, WIS, or CHA. You learn Detect Thoughts and can cast it once per Long Rest without a spell slot. You can speak telepathically to any intelligent creature you can see within 60 feet.',
  'Guerreiro Arcano': 'War Caster',
  'Vantagem em testes de Concentração causados por dano. Pode conjurar magias com componentes somáticos segurando uma arma ou escudo. Ao concentrar em uma magia e sofrer dano, pode usar Reação para conjurar outro truque.':
    'Advantage on Constitution saves to maintain Concentration when you take damage. You can cast spells with Somatic components while holding a weapon or Shield. When you are concentrating and take damage, you can use your Reaction to cast a cantrip.',
  'Mestre de Armas': 'Weapon Master',
  '+1 em FOR ou DES. Você ganha proficiência com quatro armas marciais à sua escolha.':
    '+1 STR or DEX. You gain proficiency with four Martial weapons of your choice.',

  // ─── Condições e exaustão ────────────────────────────────────────────────
  'Amedrontado': 'Frightened',
  'Cego': 'Blinded',
  'Caído': 'Prone',
  'Contido': 'Restrained',
  'Enfeitiçado': 'Charmed',
  'Ensurdecido': 'Deafened',
  'Envenenado': 'Poisoned',
  'Exausto': 'Exhaustion',
  'Imobilizado': 'Grappled',
  'Incapacitado': 'Incapacitated',
  'Inconsciente': 'Unconscious',
  'Invisível': 'Invisible',
  'Paralisado': 'Paralyzed',
  'Petrificado': 'Petrified',
  'Surpreendido': 'Surprised',
  'Nenhum': 'None',
  'Desvantagem em testes de atributo': 'Disadvantage on ability checks',
  'Velocidade reduzida à metade': 'Speed halved',
  'Desvantagem em ataques e salvaguardas': 'Disadvantage on attack rolls and saving throws',
  'Máximo de PV reduzido à metade': 'HP maximum halved',
  'Velocidade = 0': 'Speed = 0',
  'Morte': 'Death',

  // ─── Antecedentes (nomes, talentos, ferramentas e equipamento) ───────────
  'Acólito': 'Acolyte',
  'Andarilho': 'Wayfarer',
  'Artesão': 'Artisan',
  'Artista': 'Entertainer',
  'Charlatão': 'Charlatan',
  'Criminoso': 'Criminal',
  'Eremita': 'Hermit',
  'Escriba': 'Scribe',
  'Fazendeiro': 'Farmer',
  'Guarda': 'Guard',
  'Guia': 'Guide',
  'Marinheiro': 'Sailor',
  'Mercador': 'Merchant',
  'Nobre': 'Noble',
  'Sábio': 'Sage',
  'Soldado': 'Soldier',
  'Iniciado em Magia (Clérigo)': 'Magic Initiate (Cleric)',
  'Iniciado em Magia (Druida)': 'Magic Initiate (Druid)',
  'Iniciado em Magia (Mago)': 'Magic Initiate (Wizard)',
  'Suprimentos de Calígrafo': "Calligrapher's Supplies",
  'Ferramentas de Artesão (à escolha)': "Artisan's Tools (your choice)",
  'Instrumento Musical (à escolha)': 'Musical Instrument (your choice)',
  'Kit de Falsificação': 'Forgery Kit',
  'Ferramentas de Carpinteiro': "Carpenter's Tools",
  'Kit de Jogos (à escolha)': 'Gaming Set (your choice)',
  'Ferramentas de Cartógrafo': "Cartographer's Tools",
  'Ferramentas de Navegador': "Navigator's Tools",
  'Suprimentos de Calígrafo, Livro (orações), Símbolo Sagrado, Pergaminho (10 folhas), Túnica, 8 PO':
    "Calligrapher's Supplies, Book (prayers), Holy Symbol, Parchment (10 sheets), Robe, 8 GP",
  '2 Adagas, Ferramentas de Ladrão, Kit de Jogos (qualquer), 2 Algibeiras, Roupas de Viagem, Saco de Dormir, 16 PO':
    "2 Daggers, Thieves' Tools, Gaming Set (any), 2 Pouches, Traveler's Clothes, Bedroll, 16 GP",
  'Ferramentas de Artesão (a mesma escolhida), 2 Algibeiras, Roupas de Viagem, 32 PO':
    "Artisan's Tools (the same one chosen), 2 Pouches, Traveler's Clothes, 32 GP",
  'Instrumento Musical (o mesmo escolhido), Espelho, 2 Fantasias, Perfume, Roupas de Viagem, 11 PO':
    "Musical Instrument (the same one chosen), Mirror, 2 Costumes, Perfume, Traveler's Clothes, 11 GP",
  'Kit de Falsificação, Fantasia, Roupas Finas, 15 PO': 'Forgery Kit, Costume, Fine Clothes, 15 GP',
  '2 Adagas, Ferramentas de Ladrão, 2 Algibeiras, Pé de Cabra, Roupas de Viagem, 16 PO':
    "2 Daggers, Thieves' Tools, 2 Pouches, Crowbar, Traveler's Clothes, 16 GP",
  'Cajado, Kit de Herbalismo, Lâmpada, Livro (filosofia), Óleo (3 frascos), Roupas de Viagem, Saco de Dormir, 16 PO':
    "Quarterstaff, Herbalism Kit, Lamp, Book (philosophy), Oil (3 flasks), Traveler's Clothes, Bedroll, 16 GP",
  'Suprimentos de Calígrafo, Lâmpada, Óleo (3 frascos), Pergaminho (12 folhas), Roupas Finas, 23 PO':
    "Calligrapher's Supplies, Lamp, Oil (3 flasks), Parchment (12 sheets), Fine Clothes, 23 GP",
  'Foice, Ferramentas de Carpinteiro, Kit de Curandeiro, Balde de Ferro, Pá, 30 PO':
    "Sickle, Carpenter's Tools, Healer's Kit, Iron Pot, Shovel, 30 GP",
  'Lança, Besta Leve, 20 Virotes, Kit de Jogo (o mesmo), Aljava, Grilhões, Lanterna Coberta, Roupas de Viagem, 12 PO':
    "Spear, Light Crossbow, 20 Bolts, Gaming Set (the same one), Quiver, Manacles, Hooded Lantern, Traveler's Clothes, 12 GP",
  'Arco Curto, 20 Flechas, Ferramentas de Cartógrafo, Aljava, Roupas de Viagem, Saco de Dormir, Tenda, 3 PO':
    "Shortbow, 20 Arrows, Cartographer's Tools, Quiver, Traveler's Clothes, Bedroll, Tent, 3 GP",
  'Adaga, Ferramentas de Navegador, Corda, Roupas de Viagem, 20 PO':
    "Dagger, Navigator's Tools, Rope, Traveler's Clothes, 20 GP",
  'Ferramentas de Navegador, 2 Algibeiras, Roupas de Viagem, 22 PO':
    "Navigator's Tools, 2 Pouches, Traveler's Clothes, 22 GP",
  'Kit de Jogos (o mesmo), Perfume, Roupas Finas, 29 PO':
    'Gaming Set (the same one), Perfume, Fine Clothes, 29 GP',
  'Cajado, Suprimentos de Calígrafo, Livro (história), Pergaminho (8 folhas), Túnica, 8 PO':
    "Quarterstaff, Calligrapher's Supplies, Book (history), Parchment (8 sheets), Robe, 8 GP",
  'Lança, Arco Curto, 20 Flechas, Kit de Curandeiro, Kit de Jogo (o mesmo), Aljava, Roupas de Viagem, 14 PO':
    "Spear, Shortbow, 20 Arrows, Healer's Kit, Gaming Set (the same one), Quiver, Traveler's Clothes, 14 GP",
}

/** Traduz um termo isolado (nome de proficiência, categoria, condição...). */
export function traduzirTermo(termo: string, lingua: string): string {
  if (lingua === 'pt') return termo
  return DICIONARIO_EN[termo] ?? termo
}

const cache = new Map<string, unknown>()

function traduzirValor(valor: unknown, chave: string | undefined, lingua: string): unknown {
  if (typeof valor === 'string') {
    return chave && CHAVES_TRADUZIVEIS.has(chave) ? traduzirTermo(valor, lingua) : valor
  }
  if (Array.isArray(valor)) return valor.map(v => traduzirValor(v, chave, lingua))
  if (valor && typeof valor === 'object') {
    return Object.fromEntries(
      Object.entries(valor).map(([k, v]) => [k, traduzirValor(v, k, lingua)]),
    )
  }
  return valor
}

/** Versão traduzida (e memoizada) dos dados de jogo para o idioma pedido. */
export function traduzirDados<T>(dados: T, lingua: string): T {
  if (lingua === 'pt') return dados
  const emCache = cache.get(lingua)
  if (emCache) return emCache as T
  const traduzido = traduzirValor(dados, undefined, lingua) as T
  cache.set(lingua, traduzido)
  return traduzido
}
