export default [
  {
    "id": "aasimar",
    "nome": "Aasimar",
    "tamanho": [
      "Médio",
      "Pequeno"
    ],
    "deslocamento": 9,
    "visao_no_escuro": 18,
    "tracos": [
      {
        "nome": "Resistência Celestial",
        "descricao": "Resistência a dano Necrótico e Radiante."
      },
      {
        "nome": "Visão no Escuro",
        "descricao": "Enxerga no escuro até 18 metros."
      },
      {
        "nome": "Mãos Curativas",
        "descricao": "Ação Usar Magia; cura Bônus de Proficiência × d4 PV em uma criatura tocada. 1×/Descanso Longo."
      },
      {
        "nome": "Portador da Luz",
        "descricao": "Conhece o truque Luz. Carisma é o atributo de conjuração."
      },
      {
        "nome": "Revelação Celestial",
        "nivel_personagem": 3,
        "descricao": "Ação Bônus: transforma-se por 1 min, 1×/Descanso Longo. Causa dano adicional = Bônus de Prof. (Necrótico ou Radiante). Opções:",
        "opcoes": [
          {
            "nome": "Asas Celestiais",
            "efeito": "Deslocamento de Voo igual ao Deslocamento."
          },
          {
            "nome": "Manto Necrótico",
            "efeito": "Criaturas não aliadas a 3m: sal. CAR (CD = 8 + mod CAR + Prof.) ou ficam Amedrontadas até fim do próximo turno."
          },
          {
            "nome": "Transfiguração Radiante",
            "efeito": "Emite Luz Plena 3m, Meia-luz +3m. No fim de cada turno: criaturas a 3m sofrem dano Radiante = Bônus de Prof."
          }
        ]
      }
    ]
  },
  {
    "id": "anao",
    "nome": "Anão",
    "tamanho": [
      "Médio"
    ],
    "deslocamento": 9,
    "visao_no_escuro": 36,
    "tracos": [
      {
        "nome": "Visão no Escuro",
        "descricao": "Enxerga no escuro até 36 metros."
      },
      {
        "nome": "Resistência a Toxinas",
        "descricao": "Resistência a Dano Venenoso. Vantagem em salvaguardas contra Envenenado."
      },
      {
        "nome": "Tenacidade Anã",
        "descricao": "PV máximos +1 agora e +1 a cada nível de personagem."
      },
      {
        "nome": "Conhecimento de Pedras",
        "descricao": "Ação Bônus: Sismiconsciência 18m por 10 min (apenas em superfície de pedra). Usos = Bônus de Prof.; restaura em Descanso Longo."
      }
    ]
  },
  {
    "id": "draconato",
    "nome": "Draconato",
    "tamanho": [
      "Médio"
    ],
    "deslocamento": 9,
    "visao_no_escuro": 18,
    "tracos": [
      {
        "nome": "Herança Dracônica",
        "descricao": "Escolha um tipo de dragão. Define o tipo de dano do Ataque de Sopro e Resistência a Dano.",
        "opcoes": [
          {
            "dragao": "Azul",
            "tipo_dano": "Elétrico"
          },
          {
            "dragao": "Branco",
            "tipo_dano": "Gélido"
          },
          {
            "dragao": "Bronze",
            "tipo_dano": "Elétrico"
          },
          {
            "dragao": "Cobre",
            "tipo_dano": "Ácido"
          },
          {
            "dragao": "Latão",
            "tipo_dano": "Ígneo"
          },
          {
            "dragao": "Negro",
            "tipo_dano": "Ácido"
          },
          {
            "dragao": "Ouro",
            "tipo_dano": "Ígneo"
          },
          {
            "dragao": "Prata",
            "tipo_dano": "Gélido"
          },
          {
            "dragao": "Verde",
            "tipo_dano": "Venenoso"
          },
          {
            "dragao": "Vermelho",
            "tipo_dano": "Ígneo"
          }
        ]
      },
      {
        "nome": "Ataque de Sopro",
        "descricao": "Substitui um ataque: Cone 4,5m ou Linha 9m. Sal. DES (CD = 8 + mod CON + Prof.). Falha: dano pelo tipo da Herança. Sucesso: metade. Dano: 1d10 (nível 1), 2d10 (nível 5), 3d10 (nível 11), 4d10 (nível 17). Usos = Bônus de Prof.; restaura em Descanso Longo."
      },
      {
        "nome": "Resistência a Dano",
        "descricao": "Resistência ao tipo de dano da Herança Dracônica."
      },
      {
        "nome": "Visão no Escuro",
        "descricao": "Enxerga no escuro até 18 metros."
      },
      {
        "nome": "Voo Dracônico",
        "nivel_personagem": 5,
        "descricao": "Ação Bônus: asas espectrais por 10 min, Deslocamento de Voo = Deslocamento. 1×/Descanso Longo."
      }
    ]
  },
  {
    "id": "elfo",
    "nome": "Elfo",
    "tamanho": [
      "Médio"
    ],
    "deslocamento": 9,
    "visao_no_escuro": 18,
    "nota": "Drow tem Visão no Escuro de 36m",
    "tracos": [
      {
        "nome": "Visão no Escuro",
        "descricao": "18m (Drow: 36m)."
      },
      {
        "nome": "Linhagem Élfica",
        "descricao": "Escolha uma linhagem. Concede truques e magias por nível.",
        "linhagens": [
          {
            "id": "alto_elfo",
            "nome": "Alto Elfo",
            "nivel1": "Truque Prestidigitação Arcana (pode trocar após Descanso Longo por truque da lista de Mago)",
            "nivel3": "Detectar Magia",
            "nivel5": "Passo Nebuloso"
          },
          {
            "id": "drow",
            "nome": "Drow",
            "nivel1": "Visão no Escuro aumenta para 36m + truque Luzes Dançantes",
            "nivel3": "Fogo das Fadas",
            "nivel5": "Escuridão"
          },
          {
            "id": "elfo_silvestre",
            "nome": "Elfo Silvestre",
            "nivel1": "Deslocamento aumenta para 10,5m + truque Arte Druídica",
            "nivel3": "Passos Largos",
            "nivel5": "Passos Sem Rastro"
          }
        ],
        "atributo_conjuracao_opcoes": [
          "INT",
          "SAB",
          "CAR"
        ]
      },
      {
        "nome": "Ancestralidade Feérica",
        "descricao": "Vantagem em salvaguardas para evitar/encerrar a condição Enfeitiçado."
      },
      {
        "nome": "Sentidos Aguçados",
        "descricao": "Proficiência em Intuição, Percepção ou Sobrevivência (à escolha)."
      },
      {
        "nome": "Transe",
        "descricao": "Completa Descanso Longo em 4h de meditação. Não precisa dormir. Imune a magias que forçam sono."
      }
    ]
  },
  {
    "id": "gnomo",
    "nome": "Gnomo",
    "tamanho": [
      "Pequeno"
    ],
    "deslocamento": 9,
    "visao_no_escuro": 18,
    "tracos": [
      {
        "nome": "Visão no Escuro",
        "descricao": "Enxerga no escuro até 18 metros."
      },
      {
        "nome": "Astúcia de Gnomo",
        "descricao": "Vantagem em salvaguardas de Inteligência, Sabedoria e Carisma."
      },
      {
        "nome": "Linhagem Gnômica",
        "descricao": "Escolha uma linhagem.",
        "linhagens": [
          {
            "id": "gnomo_das_rochas",
            "nome": "Gnomo das Rochas",
            "descricao": "Truques Prestidigitação Arcana e Reparar. Pode gastar 10 min conjurando Prestidigitação Arcana para fabricar um dispositivo mecânico minúsculo (CA 5, 1 PV). Até 3 dispositivos simultâneos; cada um se desfaz em 8h."
          },
          {
            "id": "gnomo_do_bosque",
            "nome": "Gnomo do Bosque",
            "descricao": "Truque Ilusão Menor. Falar com Animais sempre preparada; pode conjurá-la sem espaço de magia (usos = Bônus de Prof.; restaura em Descanso Longo)."
          }
        ],
        "atributo_conjuracao_opcoes": [
          "INT",
          "SAB",
          "CAR"
        ]
      }
    ]
  },
  {
    "id": "golias",
    "nome": "Golias",
    "tamanho": [
      "Médio"
    ],
    "deslocamento": 10.5,
    "visao_no_escuro": null,
    "tracos": [
      {
        "nome": "Ancestralidade Gigante",
        "descricao": "Escolha 1 benefício sobrenatural. Usos = Bônus de Prof.; restaura em Descanso Longo.",
        "opcoes": [
          {
            "nome": "Arrepio do Gelo (Gigante do Gelo)",
            "efeito": "+1d6 Gélido ao alvo + reduz Deslocamento 3m até início do próximo turno."
          },
          {
            "nome": "Queimadura de Fogo (Gigante do Fogo)",
            "efeito": "+1d10 Ígneo ao alvo."
          },
          {
            "nome": "Resistência da Pedra (Gigante da Pedra)",
            "efeito": "Reação ao sofrer dano: joga 1d12 + mod CON, reduz dano."
          },
          {
            "nome": "Salto da Nuvem (Gigante das Nuvens)",
            "efeito": "Ação Bônus: teleporta-se até 9m para espaço desocupado à vista."
          },
          {
            "nome": "Tombo da Colina (Gigante da Colina)",
            "efeito": "Ao acertar criatura Grande ou menor: impõe condição Caído."
          },
          {
            "nome": "Trovão da Tempestade (Gigante da Tempestade)",
            "efeito": "Reação ao sofrer dano de criatura a 18m: causa 1d8 Trovejante nela."
          }
        ]
      },
      {
        "nome": "Forma Grande",
        "nivel_personagem": 5,
        "descricao": "Ação Bônus: torna-se Grande por 10 min (se houver espaço). Vantagem em testes de Força, Deslocamento +3m. 1×/Descanso Longo."
      },
      {
        "nome": "Porte Poderoso",
        "descricao": "Vantagem em testes para encerrar condição Imobilizado. Conta como tamanho maior para capacidade de carga."
      }
    ]
  },
  {
    "id": "humano",
    "nome": "Humano",
    "tamanho": [
      "Médio",
      "Pequeno"
    ],
    "deslocamento": 9,
    "visao_no_escuro": null,
    "tracos": [
      {
        "nome": "Eficiente",
        "descricao": "Adquire Inspiração Heroica ao completar cada Descanso Longo."
      },
      {
        "nome": "Hábil",
        "descricao": "Proficiência em uma perícia à escolha."
      },
      {
        "nome": "Versátil",
        "descricao": "Adquire um Talento de Origem à escolha (recomendado: Habilidoso)."
      }
    ]
  },
  {
    "id": "orc",
    "nome": "Orc",
    "tamanho": [
      "Médio"
    ],
    "deslocamento": 9,
    "visao_no_escuro": 36,
    "tracos": [
      {
        "nome": "Pico de Adrenalina",
        "descricao": "Ação Bônus: executa ação Correr + ganha PV Temporários = Bônus de Prof. Usos = Bônus de Prof.; restaura em Descanso Curto ou Longo."
      },
      {
        "nome": "Visão no Escuro",
        "descricao": "Enxerga no escuro até 36 metros."
      },
      {
        "nome": "Vigor Implacável",
        "descricao": "Ao ser reduzido a 0 PV (sem morrer imediatamente), fica com 1 PV. 1×/Descanso Longo."
      }
    ]
  },
  {
    "id": "pequenino",
    "nome": "Pequenino",
    "tamanho": [
      "Pequeno"
    ],
    "deslocamento": 9,
    "visao_no_escuro": null,
    "tracos": [
      {
        "nome": "Corajoso",
        "descricao": "Vantagem em salvaguardas para evitar/encerrar a condição Amedrontado."
      },
      {
        "nome": "Agilidade Pequenina",
        "descricao": "Pode mover pelo espaço de qualquer criatura um tamanho maior, mas não pode parar no mesmo espaço."
      },
      {
        "nome": "Sorte",
        "descricao": "Ao tirar 1 no D20 de um Teste de D20, pode re-rolar e usar o novo resultado."
      },
      {
        "nome": "Furtividade Natural",
        "descricao": "Pode executar a ação Esconder mesmo encoberto apenas por criatura pelo menos um tamanho maior."
      }
    ]
  },
  {
    "id": "tiferino",
    "nome": "Tiferino",
    "tamanho": [
      "Médio",
      "Pequeno"
    ],
    "deslocamento": 9,
    "visao_no_escuro": 18,
    "tracos": [
      {
        "nome": "Visão no Escuro",
        "descricao": "Enxerga no escuro até 18 metros."
      },
      {
        "nome": "Legado Ínfero",
        "descricao": "Escolha um legado. Concede Resistência, truque e magias por nível.",
        "legados": [
          {
            "id": "abissal",
            "nome": "Abissal",
            "nivel1": "Resistência a Venenoso + truque Rajada de Veneno",
            "nivel3": "Raio Nauseante",
            "nivel5": "Paralisar Pessoa"
          },
          {
            "id": "ctonico",
            "nome": "Ctônico",
            "nivel1": "Resistência a Necrótico + truque Toque Necrótico",
            "nivel3": "Vitalidade Vazia",
            "nivel5": "Raio do Enfraquecimento"
          },
          {
            "id": "infernal",
            "nome": "Infernal",
            "nivel1": "Resistência a Ígneo + truque Raio de Fogo",
            "nivel3": "Repreensão Diabólica",
            "nivel5": "Escuridão"
          }
        ],
        "atributo_conjuracao_opcoes": [
          "INT",
          "SAB",
          "CAR"
        ]
      },
      {
        "nome": "Presença Sobrenatural",
        "descricao": "Conhece o truque Taumaturgia (usa o mesmo atributo de conjuração do Legado Ínfero)."
      }
    ]
  }
]
