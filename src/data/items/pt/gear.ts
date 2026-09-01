import type { AdventuringGear } from '../types'

export const ADVENTURING_GEAR: AdventuringGear[] = [
  {
    item_type: 'equipamento',
    id: 'acido',
    name: 'Ácido',
    category: 'Equipamento',
    price: '25 po',
    weight: '0.5 kg',
    description: 'Frasco arremessável a até 6 m: acerto causa 2d6 de dano de ácido.'
  },
  {
    item_type: 'equipamento',
    id: 'fogo_alquimico',
    name: 'Fogo Alquímico',
    category: 'Equipamento',
    price: '50 po',
    weight: '0.5 kg',
    description: 'Líquido que inflama ao contato com o ar. 1d4 de fogo por turno até ser apagado com uma ação.'
  },
  {
    item_type: 'equipamento',
    id: 'antitoxina',
    name: 'Antitoxina',
    category: 'Equipamento',
    price: '50 po',
    weight: '0.0 kg',
    description: 'Beber concede vantagem em salvaguardas contra veneno por 1 hora.'
  },
  {
    item_type: 'equipamento',
    id: 'flechas',
    name: 'Flechas (20)',
    category: 'Munição',
    price: '1 po',
    weight: '0.5 kg',
    description: 'Munição de arcos. Metade das flechas disparadas pode ser recuperada após o combate.'
  },
  {
    item_type: 'equipamento',
    id: 'virotes',
    name: 'Virotes (20)',
    category: 'Munição',
    price: '1 po',
    weight: '0.75 kg',
    description: 'Munição de bestas, mais curta e pesada que a flecha.'
  },
  {
    item_type: 'equipamento',
    id: 'balas_arma_fogo',
    name: 'Balas de Arma de Fogo (10)',
    category: 'Munição',
    price: '3 po',
    weight: '1.0 kg',
    description: 'Munição de mosquetes e pistolas, consumida junto com a pólvora.'
  },
  {
    item_type: 'equipamento',
    id: 'balas_funda',
    name: 'Balas de Funda (20)',
    category: 'Munição',
    price: '4 pc',
    weight: '0.75 kg',
    description: 'Projéteis de chumbo fundido, mais certeiros que pedras soltas.'
  },
  {
    item_type: 'equipamento',
    id: 'agulhas',
    name: 'Agulhas (50)',
    category: 'Munição',
    price: '1 po',
    weight: '0.5 kg',
    description: 'Munição de zarabatana, comumente untada com veneno.'
  },
  {
    item_type: 'equipamento',
    id: 'cristal',
    name: 'Cristal',
    category: 'Foco Arcano',
    price: '10 po',
    weight: '0.5 kg',
    description: 'Foco arcano: substitui componentes materiais sem custo em ouro.'
  },
  {
    item_type: 'equipamento',
    id: 'orbe',
    name: 'Orbe',
    category: 'Foco Arcano',
    price: '20 po',
    weight: '1.5 kg',
    description: 'Esfera polida de vidro ou cristal usada como foco arcano.'
  },
  {
    item_type: 'equipamento',
    id: 'bastao_foco',
    name: 'Bastão',
    category: 'Foco Arcano',
    price: '10 po',
    weight: '1.0 kg',
    description: 'Cetro curto entalhado com runas, usado como foco arcano.'
  },
  {
    item_type: 'equipamento',
    id: 'cajado_foco',
    name: 'Cajado',
    category: 'Foco Arcano',
    price: '5 po',
    weight: '2.0 kg',
    description: 'Cajado ritual. Também funciona como bordão em combate.'
  },
  {
    item_type: 'equipamento',
    id: 'varinha',
    name: 'Varinha',
    category: 'Foco Arcano',
    price: '10 po',
    weight: '0.5 kg',
    description: 'Vareta fina de madeira ou osso, o foco arcano mais discreto.'
  },
  {
    item_type: 'equipamento',
    id: 'mochila',
    name: 'Mochila',
    category: 'Recipiente',
    price: '2 po',
    weight: '2.5 kg',
    description: 'Comporta 15 kg de equipamento. Itens podem ser pendurados por fora.'
  },
  {
    item_type: 'equipamento',
    id: 'rolamentos',
    name: 'Rolamentos',
    category: 'Equipamento',
    price: '1 po',
    weight: '1.0 kg',
    description: 'Espalhe 3 m² como ação: CD 10 de Acrobacia ou a criatura cai Caída.'
  },
  {
    item_type: 'equipamento',
    id: 'barril',
    name: 'Barril',
    category: 'Recipiente',
    price: '2 po',
    weight: '35.0 kg',
    description: 'Comporta 150 litros de líquido ou 120 litros de sólidos.'
  },
  {
    item_type: 'equipamento',
    id: 'cesto',
    name: 'Cesto',
    category: 'Recipiente',
    price: '4 pp',
    weight: '1.0 kg',
    description: 'Comporta 20 kg de carga leve e volumosa.'
  },
  {
    item_type: 'equipamento',
    id: 'saco_de_dormir',
    name: 'Saco de Dormir',
    category: 'Equipamento',
    price: '1 po',
    weight: '3.5 kg',
    description: 'Manta acolchoada enrolável, necessária para dormir confortavelmente ao relento.'
  },
  {
    item_type: 'equipamento',
    id: 'sino',
    name: 'Sino',
    category: 'Equipamento',
    price: '1 po',
    weight: '0.0 kg',
    description: 'Ouvido a até 18 m. Usado como alarme improvisado em acampamentos.'
  },
  {
    item_type: 'equipamento',
    id: 'cobertor',
    name: 'Cobertor',
    category: 'Equipamento',
    price: '5 pp',
    weight: '1.5 kg',
    description: 'Lã grossa que protege do frio durante um descanso longo.'
  },
  {
    item_type: 'equipamento',
    id: 'talha',
    name: 'Talha',
    category: 'Equipamento',
    price: '1 po',
    weight: '2.5 kg',
    description: 'Sistema de roldanas que quadruplica o peso que se consegue içar.'
  },
  {
    item_type: 'equipamento',
    id: 'livro',
    name: 'Livro',
    category: 'Equipamento',
    price: '25 po',
    weight: '2.5 kg',
    description: 'Volume manuscrito sobre um tema. Pode conceder vantagem em testes de conhecimento.'
  },
  {
    item_type: 'equipamento',
    id: 'garrafa_vidro',
    name: 'Garrafa de Vidro',
    category: 'Recipiente',
    price: '2 po',
    weight: '1.0 kg',
    description: 'Comporta 1,5 litro de líquido. Frágil, mas transparente.'
  },
  {
    item_type: 'equipamento',
    id: 'balde',
    name: 'Balde',
    category: 'Recipiente',
    price: '5 pc',
    weight: '1.0 kg',
    description: 'Comporta 3 litros. Essencial para apagar incêndios e carregar água.'
  },
  {
    item_type: 'equipamento',
    id: 'estrepes',
    name: 'Estrepes',
    category: 'Equipamento',
    price: '1 po',
    weight: '1.0 kg',
    description: 'Espalhe 1,5 m² como ação: CD 15 de Destreza ou 1 de dano perfurante e velocidade reduzida.'
  },
  {
    item_type: 'equipamento',
    id: 'vela',
    name: 'Vela',
    category: 'Equipamento',
    price: '1 pc',
    weight: '0.0 kg',
    description: 'Queima por 1 hora, iluminando 1,5 m e penumbra por mais 1,5 m.'
  },
  {
    item_type: 'equipamento',
    id: 'estojo_virotes',
    name: 'Estojo de Virotes',
    category: 'Recipiente',
    price: '1 po',
    weight: '0.5 kg',
    description: 'Comporta até 20 virotes com acesso rápido.'
  },
  {
    item_type: 'equipamento',
    id: 'estojo_mapas',
    name: 'Estojo de Mapas ou Pergaminhos',
    category: 'Recipiente',
    price: '1 po',
    weight: '0.5 kg',
    description: 'Tubo rígido para até 10 folhas de papel ou 5 pergaminhos.'
  },
  {
    item_type: 'equipamento',
    id: 'corrente',
    name: 'Corrente',
    category: 'Equipamento',
    price: '5 po',
    weight: '5.0 kg',
    description: 'Três metros de elos de ferro. CA 19 e 10 pontos de vida para arrebentar.'
  },
  {
    item_type: 'equipamento',
    id: 'bau',
    name: 'Baú',
    category: 'Recipiente',
    price: '5 po',
    weight: '12.5 kg',
    description: 'Comporta 60 kg. Pode receber um cadeado.'
  },
  {
    item_type: 'equipamento',
    id: 'kit_escalada',
    name: 'Kit de Escalada',
    category: 'Equipamento',
    price: '25 po',
    weight: '6.0 kg',
    description: 'Pitons, botas, luvas e arnês. Ancorado, você não cai mais que 8 m.'
  },
  {
    item_type: 'equipamento',
    id: 'roupas_finas',
    name: 'Roupas Finas',
    category: 'Vestuário',
    price: '15 po',
    weight: '3.0 kg',
    description: 'Traje de seda e bordados, exigido em cortes e eventos da alta sociedade.'
  },
  {
    item_type: 'equipamento',
    id: 'roupas_viajante',
    name: 'Roupas de Viajante',
    category: 'Vestuário',
    price: '2 po',
    weight: '2.0 kg',
    description: 'Botas resistentes, calça, camisa e capa para a estrada.'
  },
  {
    item_type: 'equipamento',
    id: 'bolsa_componentes',
    name: 'Bolsa de Componentes',
    category: 'Equipamento',
    price: '25 po',
    weight: '1.0 kg',
    description: 'Compartimentos com componentes materiais sem custo em ouro.'
  },
  {
    item_type: 'equipamento',
    id: 'fantasia',
    name: 'Fantasia',
    category: 'Vestuário',
    price: '5 po',
    weight: '2.0 kg',
    description: 'Traje cênico para disfarces e apresentações.'
  },
  {
    item_type: 'equipamento',
    id: 'pe_de_cabra',
    name: 'Pé de Cabra',
    category: 'Equipamento',
    price: '2 po',
    weight: '2.5 kg',
    description: 'Concede vantagem em testes de Força quando a alavanca puder ser usada.'
  },
  {
    item_type: 'equipamento',
    id: 'ramo_visco',
    name: 'Ramo de Visco',
    category: 'Foco Druídico',
    price: '1 po',
    weight: '0.0 kg',
    description: 'Foco druídico: substitui componentes materiais sem custo em ouro.'
  },
  {
    item_type: 'equipamento',
    id: 'cajado_madeira',
    name: 'Cajado de Madeira',
    category: 'Foco Druídico',
    price: '5 po',
    weight: '2.0 kg',
    description: 'Foco druídico entalhado. Também funciona como bordão.'
  },
  {
    item_type: 'equipamento',
    id: 'varinha_teixo',
    name: 'Varinha de Teixo',
    category: 'Foco Druídico',
    price: '10 po',
    weight: '0.5 kg',
    description: 'Vareta de teixo, o foco druídico mais discreto.'
  },
  {
    item_type: 'equipamento',
    id: 'frasco',
    name: 'Frasco',
    category: 'Recipiente',
    price: '2 pc',
    weight: '0.5 kg',
    description: 'Comporta meio litro de líquido.'
  },
  {
    item_type: 'equipamento',
    id: 'gancho_escalada',
    name: 'Gancho de Escalada',
    category: 'Equipamento',
    price: '2 po',
    weight: '2.0 kg',
    description: 'Amarrado a uma corda, prende-se a saliências a até 15 m.'
  },
  {
    item_type: 'equipamento',
    id: 'kit_curandeiro',
    name: 'Kit de Curandeiro',
    category: 'Equipamento',
    price: '5 po',
    weight: '1.5 kg',
    description: '10 usos. Um uso estabiliza uma criatura a 0 PV sem teste de Medicina.'
  },
  {
    item_type: 'equipamento',
    id: 'amuleto',
    name: 'Amuleto',
    category: 'Símbolo Sagrado',
    price: '5 po',
    weight: '0.5 kg',
    description: 'Símbolo sagrado usado no pescoço ou empunhado.'
  },
  {
    item_type: 'equipamento',
    id: 'emblema',
    name: 'Emblema',
    category: 'Símbolo Sagrado',
    price: '5 po',
    weight: '0.0 kg',
    description: 'Símbolo sagrado fixado no escudo ou na armadura.'
  },
  {
    item_type: 'equipamento',
    id: 'relicario',
    name: 'Relicário',
    category: 'Símbolo Sagrado',
    price: '5 po',
    weight: '1.0 kg',
    description: 'Estojo sagrado com uma relíquia dentro, usado como símbolo sagrado.'
  },
  {
    item_type: 'equipamento',
    id: 'agua_benta',
    name: 'Água Benta',
    category: 'Equipamento',
    price: '25 po',
    weight: '0.5 kg',
    description: 'Arremessável a 6 m: 2d8 de dano radiante em Corruptores e Mortos-Vivos.'
  },
  {
    item_type: 'equipamento',
    id: 'armadilha_caca',
    name: 'Armadilha de Caça',
    category: 'Equipamento',
    price: '5 po',
    weight: '12.5 kg',
    description: 'CD 13 de Destreza ou 1d4 de dano perfurante e velocidade 0 até se soltar.'
  },
  {
    item_type: 'equipamento',
    id: 'tinta',
    name: 'Tinta',
    category: 'Equipamento',
    price: '10 po',
    weight: '0.0 kg',
    description: 'Vidro de 30 ml de tinta preta, suficiente para centenas de páginas.'
  },
  {
    item_type: 'equipamento',
    id: 'pena_escrever',
    name: 'Pena de Escrever',
    category: 'Equipamento',
    price: '2 pc',
    weight: '0.0 kg',
    description: 'Pena aparada para escrita. Consumível a longo prazo.'
  },
  {
    item_type: 'equipamento',
    id: 'jarro',
    name: 'Jarro',
    category: 'Recipiente',
    price: '2 pc',
    weight: '2.0 kg',
    description: 'Comporta 4 litros de líquido.'
  },
  {
    item_type: 'equipamento',
    id: 'escada',
    name: 'Escada',
    category: 'Equipamento',
    price: '1 pp',
    weight: '12.5 kg',
    description: 'Escada de mão de 3 m, volumosa demais para carregar em masmorras estreitas.'
  },
  {
    item_type: 'equipamento',
    id: 'lamparina',
    name: 'Lamparina',
    category: 'Equipamento',
    price: '5 pp',
    weight: '0.5 kg',
    description: 'Ilumina 4,5 m e penumbra por mais 9 m. Queima 1 frasco de óleo por 6 horas.'
  },
  {
    item_type: 'equipamento',
    id: 'lanterna_foco',
    name: 'Lanterna de Foco',
    category: 'Equipamento',
    price: '10 po',
    weight: '1.0 kg',
    description: 'Cone de 18 m de luz plena e mais 18 m de penumbra. 6 horas por frasco de óleo.'
  },
  {
    item_type: 'equipamento',
    id: 'lanterna_coberta',
    name: 'Lanterna Coberta',
    category: 'Equipamento',
    price: '5 po',
    weight: '1.0 kg',
    description: 'Ilumina 9 m e penumbra por mais 9 m. A tampa reduz a luz a penumbra de 1,5 m.'
  },
  {
    item_type: 'equipamento',
    id: 'cadeado',
    name: 'Cadeado',
    category: 'Equipamento',
    price: '10 po',
    weight: '0.5 kg',
    description: 'Abre com a chave ou com CD 15 de ferramentas de ladrão.'
  },
  {
    item_type: 'equipamento',
    id: 'lupa',
    name: 'Lupa',
    category: 'Equipamento',
    price: '100 po',
    weight: '0.0 kg',
    description: 'Vantagem em testes para avaliar ou inspecionar detalhes minúsculos.'
  },
  {
    item_type: 'equipamento',
    id: 'algemas',
    name: 'Algemas',
    category: 'Equipamento',
    price: '2 po',
    weight: '3.0 kg',
    description: 'Prendem criaturas Pequenas ou Médias. CD 20 para escapar ou arrebentar.'
  },
  {
    item_type: 'equipamento',
    id: 'mapa',
    name: 'Mapa',
    category: 'Equipamento',
    price: '1 po',
    weight: '0.0 kg',
    description: 'Carta de uma região. Vantagem em testes para navegar por ela.'
  },
  {
    item_type: 'equipamento',
    id: 'espelho',
    name: 'Espelho',
    category: 'Equipamento',
    price: '5 po',
    weight: '0.25 kg',
    description: 'Espelho de mão de aço polido, útil para olhar esquinas com segurança.'
  },
  {
    item_type: 'equipamento',
    id: 'rede',
    name: 'Rede',
    category: 'Equipamento',
    price: '1 po',
    weight: '1.5 kg',
    description: 'Arremessável a 4,5 m como ação: CD 15 de Destreza ou fica Contida (não é mais uma arma no PHB 2024).'
  },
  {
    item_type: 'equipamento',
    id: 'oleo',
    name: 'Óleo',
    category: 'Equipamento',
    price: '1 pp',
    weight: '0.5 kg',
    description: 'Frasco de óleo de lamparina. Arremessado, deixa o alvo vulnerável a fogo (5 de dano).'
  },
  {
    item_type: 'equipamento',
    id: 'papel',
    name: 'Papel',
    category: 'Equipamento',
    price: '2 pp',
    weight: '0.0 kg',
    description: 'Uma folha de papel, mais fina e cara que o pergaminho.'
  },
  {
    item_type: 'equipamento',
    id: 'pergaminho_branco',
    name: 'Pergaminho',
    category: 'Equipamento',
    price: '1 pp',
    weight: '0.0 kg',
    description: 'Uma folha de pergaminho, base de mapas, contratos e pergaminhos mágicos.'
  },
  {
    item_type: 'equipamento',
    id: 'perfume',
    name: 'Perfume',
    category: 'Equipamento',
    price: '5 po',
    weight: '0.0 kg',
    description: 'Vidro de essência. Pode conceder vantagem em testes sociais na alta sociedade.'
  },
  {
    item_type: 'equipamento',
    id: 'vara',
    name: 'Vara',
    category: 'Equipamento',
    price: '5 pc',
    weight: '3.5 kg',
    description: 'Vara de 3 m usada para cutucar armadilhas e testar o chão à frente.'
  },
  {
    item_type: 'equipamento',
    id: 'panela_ferro',
    name: 'Panela de Ferro',
    category: 'Recipiente',
    price: '2 po',
    weight: '5.0 kg',
    description: 'Comporta 4 litros. Serve para cozinhar ou ferver água.'
  },
  {
    item_type: 'equipamento',
    id: 'bolsa',
    name: 'Bolsa',
    category: 'Recipiente',
    price: '5 pp',
    weight: '0.5 kg',
    description: 'Comporta 3 kg ou até 20 moedas presa ao cinto.'
  },
  {
    item_type: 'equipamento',
    id: 'aljava',
    name: 'Aljava',
    category: 'Recipiente',
    price: '1 po',
    weight: '0.5 kg',
    description: 'Comporta até 20 flechas com acesso rápido.'
  },
  {
    item_type: 'equipamento',
    id: 'ariete_portatil',
    name: 'Aríete Portátil',
    category: 'Equipamento',
    price: '4 po',
    weight: '17.5 kg',
    description: '+4 em testes de Força para arrombar portas; +2 para quem ajudar.'
  },
  {
    item_type: 'equipamento',
    id: 'racoes',
    name: 'Rações',
    category: 'Equipamento',
    price: '5 pp',
    weight: '1.0 kg',
    description: 'Comida seca para um dia de viagem.'
  },
  {
    item_type: 'equipamento',
    id: 'manto',
    name: 'Manto',
    category: 'Vestuário',
    price: '1 po',
    weight: '2.0 kg',
    description: 'Túnica longa de ritual ou de descanso.'
  },
  {
    item_type: 'equipamento',
    id: 'corda',
    name: 'Corda (15 m)',
    category: 'Equipamento',
    price: '1 po',
    weight: '2.5 kg',
    description: 'Cânhamo trançado. CA 10 e 5 pontos de vida para romper.'
  },
  {
    item_type: 'equipamento',
    id: 'saco',
    name: 'Saco',
    category: 'Recipiente',
    price: '1 pc',
    weight: '0.25 kg',
    description: 'Comporta 15 kg de carga solta.'
  },
  {
    item_type: 'equipamento',
    id: 'pa',
    name: 'Pá',
    category: 'Equipamento',
    price: '2 po',
    weight: '2.5 kg',
    description: 'Cava aproximadamente 1,5 m³ de terra solta por hora.'
  },
  {
    item_type: 'equipamento',
    id: 'apito_sinalizacao',
    name: 'Apito de Sinalização',
    category: 'Equipamento',
    price: '5 pc',
    weight: '0.0 kg',
    description: 'Som audível a longa distância, usado para alertar o grupo.'
  },
  {
    item_type: 'equipamento',
    id: 'pitons',
    name: 'Pitons de Ferro (10)',
    category: 'Equipamento',
    price: '1 po',
    weight: '2.5 kg',
    description: 'Cravados para travar portas, fixar cordas ou marcar caminho.'
  },
  {
    item_type: 'equipamento',
    id: 'luneta',
    name: 'Luneta',
    category: 'Equipamento',
    price: '1000 po',
    weight: '0.5 kg',
    description: 'Amplia o que está distante em 2×. Rara e caríssima.'
  },
  {
    item_type: 'equipamento',
    id: 'barbante',
    name: 'Barbante (3 m)',
    category: 'Equipamento',
    price: '1 pp',
    weight: '0.0 kg',
    description: 'Fio fino para armar alarmes, amarrar objetos e marcar rotas.'
  },
  {
    item_type: 'equipamento',
    id: 'tenda',
    name: 'Tenda',
    category: 'Equipamento',
    price: '2 po',
    weight: '10.0 kg',
    description: 'Abrigo portátil para duas criaturas Pequenas ou Médias.'
  },
  {
    item_type: 'equipamento',
    id: 'isqueiro',
    name: 'Isqueiro',
    category: 'Equipamento',
    price: '5 pp',
    weight: '0.5 kg',
    description: 'Pederneira, aço e isca. Acende uma tocha na ação; qualquer outro fogo leva 1 minuto.'
  },
  {
    item_type: 'equipamento',
    id: 'tocha',
    name: 'Tocha',
    category: 'Equipamento',
    price: '1 pc',
    weight: '0.5 kg',
    description: 'Queima 1 hora, ilumina 6 m e penumbra por mais 6 m. Causa 1 de fogo como arma improvisada.'
  },
  {
    item_type: 'equipamento',
    id: 'ampola',
    name: 'Ampola',
    category: 'Recipiente',
    price: '1 po',
    weight: '0.0 kg',
    description: 'Comporta 120 ml. Recipiente padrão de poções e venenos.'
  },
  {
    item_type: 'equipamento',
    id: 'odre',
    name: 'Odre',
    category: 'Recipiente',
    price: '2 pp',
    weight: '2.5 kg',
    description: 'Comporta 4 litros de líquido; o peso indicado é com o odre cheio.'
  },
  {
    item_type: 'equipamento',
    id: 'caixa_de_esmolas',
    name: 'Caixa de Esmolas',
    category: 'Recipiente',
    price: '0 po',
    weight: '0.0 kg',
    description: 'Caixa para receber doações. Comporta até 25 po em moedas.'
  },
  {
    item_type: 'equipamento',
    id: 'pedra_de_amolar',
    name: 'Pedra de Amolar',
    category: 'Equipamento',
    price: '1 pc',
    weight: '0.5 kg',
    description: 'Pedra para afiar lâminas. Amolar uma arma cortante ou perfurante leva 1 hora.'
  }
]
