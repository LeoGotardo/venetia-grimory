export default [
  {
    "id": "alerta",
    "nome": "Alerta",
    "categoria": "Origem",
    "descricao": "Proficiência em Iniciativa (adiciona Bônus de Proficiência à jogada de Iniciativa). Pode trocar sua Iniciativa com a de um aliado voluntário imediatamente após rolar (nenhum dos dois pode estar Incapacitado)."
  },
  {
    "id": "artifista",
    "nome": "Artifista",
    "categoria": "Origem",
    "descricao": "Proficiência com 3 Ferramentas de Artesão à escolha da tabela Fabricação Rápida. Desconto de 20% em itens não-mágicos. Ao completar um Descanso Longo, pode fabricar 1 item da tabela (se tiver a ferramenta associada); o item se desfaz no próximo Descanso Longo.",
    "fabricacao_rapida": {
      "Ferramentas de Carpinteiro": [
        "Escada",
        "Tocha"
      ],
      "Ferramentas de Coureiro": [
        "Algibeira",
        "Estojo"
      ],
      "Ferramentas de Entalhador": [
        "Cajado",
        "Clava",
        "Clava Grande"
      ],
      "Ferramentas de Ferreiro": [
        "Arpéu",
        "Balde",
        "Esferas de Metal",
        "Estrepes",
        "Panela de Ferro"
      ],
      "Ferramentas de Funileiro": [
        "Pederneira",
        "Pá",
        "Sino"
      ],
      "Ferramentas de Oleiro": [
        "Jarro",
        "Lâmpada"
      ],
      "Ferramentas de Pedreiro": [
        "Roldana e Polias"
      ],
      "Ferramentas de Tecelão": [
        "Cesta",
        "Corda",
        "Rede",
        "Tenda"
      ]
    }
  },
  {
    "id": "atacante_selvagem",
    "nome": "Atacante Selvagem",
    "categoria": "Origem",
    "descricao": "Uma vez por turno, ao atingir um alvo com uma arma, pode jogar os dados de dano duas vezes e usar qualquer uma das jogadas."
  },
  {
    "id": "curandeiro",
    "nome": "Curandeiro",
    "categoria": "Origem",
    "descricao": "Médico de Combate: com Kit de Curandeiro, gasta 1 uso como ação Usar Objeto para que uma criatura a 1,5m gaste 1 Dado de PV; você joga o dado e ela recupera PV = resultado + Bônus de Prof. Cura Garantida: ao jogar 1 em qualquer dado de cura (magia ou talento), pode re-rolar (usa o novo resultado)."
  },
  {
    "id": "habilidoso",
    "nome": "Habilidoso",
    "categoria": "Origem",
    "repetivel": true,
    "descricao": "Adquire proficiência em qualquer combinação de 3 perícias ou ferramentas à escolha. Pode ser adquirido mais de uma vez."
  },
  {
    "id": "iniciado_em_magia",
    "nome": "Iniciado em Magia",
    "categoria": "Origem",
    "repetivel": true,
    "descricao": "Escolha uma lista de magias (Clérigo, Druida ou Mago). Aprende 2 truques dessa lista. Aprende 1 magia de 1º círculo da mesma lista (sempre preparada; conjura 1×/Descanso Longo sem espaço de magia, ou com qualquer espaço que tiver). INT, SAB ou CAR é seu atributo de conjuração (escolha ao adquirir). Pode substituir uma magia ao subir de nível. Pode ser adquirido mais de uma vez (lista diferente a cada vez).",
    "listas_disponiveis": [
      "Clérigo",
      "Druida",
      "Mago"
    ]
  },
  {
    "id": "musico",
    "nome": "Músico",
    "categoria": "Origem",
    "descricao": "Proficiência com 3 Instrumentos Musicais à escolha. Canção Encorajadora: ao completar um Descanso Curto ou Longo, toca música com instrumento em que tem proficiência e concede Inspiração Heroica a um número de aliados que ouvem igual ao Bônus de Prof."
  },
  {
    "id": "sortudo",
    "nome": "Sortudo",
    "categoria": "Origem",
    "descricao": "Pontos de Sorte = Bônus de Prof. (restaura em Descanso Longo). Gaste 1 ponto para: Vantagem em um Teste de D20 seu, ou impor Desvantagem em uma jogada de ataque contra você."
  },
  {
    "id": "valentao_de_taverna",
    "nome": "Valentão de Taverna",
    "categoria": "Origem",
    "descricao": "Ataque Desarmado Aprimorado: causa 1d4 + mod FOR Contundente (em vez do normal). Dano Garantido: re-rola 1 em dado de Ataque Desarmado. Armamento Improvisado: proficiência com armas improvisadas. Empurrar: ao acertar Ataque Desarmado na ação Atacar, pode causar dano e empurrar 1,5m (1×/turno)."
  },
  {
    "id": "vigoroso",
    "nome": "Vigoroso",
    "categoria": "Origem",
    "descricao": "PV máximos aumentam em 2 × nível de personagem ao adquirir este talento. Em cada nível posterior, PV máximos aumentam em 2 adicionais."
  }
]
