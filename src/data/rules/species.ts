export default [
  {
    "id": "aasimar",
    "name": "Aasimar",
    "size": [
      "Médio",
      "Pequeno"
    ],
    "speed": 9,
    "darkvision": 18,
    "traits": [
      {
        "name": "Resistência Celestial",
        "description": "Resistência a dano Necrótico e Radiante."
      },
      {
        "name": "Visão no Escuro",
        "description": "Enxerga no escuro até 18 metros."
      },
      {
        "name": "Mãos Curativas",
        "description": "Ação Usar Magia; cura Bônus de Proficiência × d4 PV em uma criatura tocada. 1×/Descanso Longo."
      },
      {
        "name": "Portador da Luz",
        "description": "Conhece o truque Luz. Carisma é o atributo de conjuração."
      },
      {
        "name": "Revelação Celestial",
        "nivel_personagem": 3,
        "description": "Ação Bônus: transforma-se por 1 min, 1×/Descanso Longo. Causa dano adicional = Bônus de Prof. (Necrótico ou Radiante). Opções:",
        "options": [
          {
            "name": "Asas Celestiais",
            "effect": "Deslocamento de Voo igual ao Deslocamento."
          },
          {
            "name": "Manto Necrótico",
            "effect": "Criaturas não aliadas a 3m: sal. CAR (CD = 8 + mod CAR + Prof.) ou ficam Amedrontadas até fim do próximo turno."
          },
          {
            "name": "Transfiguração Radiante",
            "effect": "Emite Luz Plena 3m, Meia-luz +3m. No fim de cada turno: criaturas a 3m sofrem dano Radiante = Bônus de Prof."
          }
        ]
      }
    ]
  },
  {
    "id": "anao",
    "name": "Anão",
    "size": [
      "Médio"
    ],
    "speed": 9,
    "darkvision": 36,
    "traits": [
      {
        "name": "Visão no Escuro",
        "description": "Enxerga no escuro até 36 metros."
      },
      {
        "name": "Resistência a Toxinas",
        "description": "Resistência a Dano Venenoso. Vantagem em salvaguardas contra Envenenado."
      },
      {
        "name": "Tenacidade Anã",
        "description": "PV máximos +1 agora e +1 a cada nível de personagem."
      },
      {
        "name": "Conhecimento de Pedras",
        "description": "Ação Bônus: Sismiconsciência 18m por 10 min (apenas em superfície de pedra). Usos = Bônus de Prof.; restaura em Descanso Longo."
      }
    ]
  },
  {
    "id": "draconato",
    "name": "Draconato",
    "size": [
      "Médio"
    ],
    "speed": 9,
    "darkvision": 18,
    "traits": [
      {
        "name": "Herança Dracônica",
        "description": "Escolha um tipo de dragão. Define o tipo de dano do Ataque de Sopro e Resistência a Dano.",
        "options": [
          {
            "dragao": "Azul",
            "damage_type": "Elétrico"
          },
          {
            "dragao": "Branco",
            "damage_type": "Gélido"
          },
          {
            "dragao": "Bronze",
            "damage_type": "Elétrico"
          },
          {
            "dragao": "Cobre",
            "damage_type": "Ácido"
          },
          {
            "dragao": "Latão",
            "damage_type": "Ígneo"
          },
          {
            "dragao": "Negro",
            "damage_type": "Ácido"
          },
          {
            "dragao": "Ouro",
            "damage_type": "Ígneo"
          },
          {
            "dragao": "Prata",
            "damage_type": "Gélido"
          },
          {
            "dragao": "Verde",
            "damage_type": "Venenoso"
          },
          {
            "dragao": "Vermelho",
            "damage_type": "Ígneo"
          }
        ]
      },
      {
        "name": "Ataque de Sopro",
        "description": "Substitui um ataque: Cone 4,5m ou Linha 9m. Sal. DES (CD = 8 + mod CON + Prof.). Falha: dano pelo tipo da Herança. Sucesso: metade. Dano: 1d10 (nível 1), 2d10 (nível 5), 3d10 (nível 11), 4d10 (nível 17). Usos = Bônus de Prof.; restaura em Descanso Longo."
      },
      {
        "name": "Resistência a Dano",
        "description": "Resistência ao tipo de dano da Herança Dracônica."
      },
      {
        "name": "Visão no Escuro",
        "description": "Enxerga no escuro até 18 metros."
      },
      {
        "name": "Voo Dracônico",
        "nivel_personagem": 5,
        "description": "Ação Bônus: asas espectrais por 10 min, Deslocamento de Voo = Deslocamento. 1×/Descanso Longo."
      }
    ]
  },
  {
    "id": "elfo",
    "name": "Elfo",
    "size": [
      "Médio"
    ],
    "speed": 9,
    "darkvision": 18,
    "nota": "Drow tem Visão no Escuro de 36m",
    "traits": [
      {
        "name": "Visão no Escuro",
        "description": "18m (Drow: 36m)."
      },
      {
        "name": "Linhagem Élfica",
        "description": "Escolha uma linhagem. Concede truques e magias por nível.",
        "lineages": [
          {
            "id": "alto_elfo",
            "name": "Alto Elfo",
            "nivel1": "Truque Prestidigitação Arcana (pode trocar após Descanso Longo por truque da lista de Mago)",
            "nivel3": "Detectar Magia",
            "nivel5": "Passo Nebuloso"
          },
          {
            "id": "drow",
            "name": "Drow",
            "nivel1": "Visão no Escuro aumenta para 36m + truque Luzes Dançantes",
            "nivel3": "Fogo das Fadas",
            "nivel5": "Escuridão"
          },
          {
            "id": "elfo_silvestre",
            "name": "Elfo Silvestre",
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
        "name": "Ancestralidade Feérica",
        "description": "Vantagem em salvaguardas para evitar/encerrar a condição Enfeitiçado."
      },
      {
        "name": "Sentidos Aguçados",
        "description": "Proficiência em Intuição, Percepção ou Sobrevivência (à escolha)."
      },
      {
        "name": "Transe",
        "description": "Completa Descanso Longo em 4h de meditação. Não precisa dormir. Imune a magias que forçam sono."
      }
    ]
  },
  {
    "id": "gnomo",
    "name": "Gnomo",
    "size": [
      "Pequeno"
    ],
    "speed": 9,
    "darkvision": 18,
    "traits": [
      {
        "name": "Visão no Escuro",
        "description": "Enxerga no escuro até 18 metros."
      },
      {
        "name": "Astúcia de Gnomo",
        "description": "Vantagem em salvaguardas de Inteligência, Sabedoria e Carisma."
      },
      {
        "name": "Linhagem Gnômica",
        "description": "Escolha uma linhagem.",
        "lineages": [
          {
            "id": "gnomo_das_rochas",
            "name": "Gnomo das Rochas",
            "description": "Truques Prestidigitação Arcana e Reparar. Pode gastar 10 min conjurando Prestidigitação Arcana para fabricar um dispositivo mecânico minúsculo (CA 5, 1 PV). Até 3 dispositivos simultâneos; cada um se desfaz em 8h."
          },
          {
            "id": "gnomo_do_bosque",
            "name": "Gnomo do Bosque",
            "description": "Truque Ilusão Menor. Falar com Animais sempre preparada; pode conjurá-la sem espaço de magia (usos = Bônus de Prof.; restaura em Descanso Longo)."
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
    "name": "Golias",
    "size": [
      "Médio"
    ],
    "speed": 10.5,
    "darkvision": null,
    "traits": [
      {
        "name": "Ancestralidade Gigante",
        "description": "Escolha 1 benefício sobrenatural. Usos = Bônus de Prof.; restaura em Descanso Longo.",
        "options": [
          {
            "name": "Arrepio do Gelo (Gigante do Gelo)",
            "effect": "+1d6 Gélido ao alvo + reduz Deslocamento 3m até início do próximo turno."
          },
          {
            "name": "Queimadura de Fogo (Gigante do Fogo)",
            "effect": "+1d10 Ígneo ao alvo."
          },
          {
            "name": "Resistência da Pedra (Gigante da Pedra)",
            "effect": "Reação ao sofrer dano: joga 1d12 + mod CON, reduz dano."
          },
          {
            "name": "Salto da Nuvem (Gigante das Nuvens)",
            "effect": "Ação Bônus: teleporta-se até 9m para espaço desocupado à vista."
          },
          {
            "name": "Tombo da Colina (Gigante da Colina)",
            "effect": "Ao acertar criatura Grande ou menor: impõe condição Caído."
          },
          {
            "name": "Trovão da Tempestade (Gigante da Tempestade)",
            "effect": "Reação ao sofrer dano de criatura a 18m: causa 1d8 Trovejante nela."
          }
        ]
      },
      {
        "name": "Forma Grande",
        "nivel_personagem": 5,
        "description": "Ação Bônus: torna-se Grande por 10 min (se houver espaço). Vantagem em testes de Força, Deslocamento +3m. 1×/Descanso Longo."
      },
      {
        "name": "Porte Poderoso",
        "description": "Vantagem em testes para encerrar condição Imobilizado. Conta como tamanho maior para capacidade de carga."
      }
    ]
  },
  {
    "id": "humano",
    "name": "Humano",
    "size": [
      "Médio",
      "Pequeno"
    ],
    "speed": 9,
    "darkvision": null,
    "traits": [
      {
        "name": "Eficiente",
        "description": "Adquire Inspiração Heroica ao completar cada Descanso Longo."
      },
      {
        "name": "Hábil",
        "description": "Proficiência em uma perícia à escolha."
      },
      {
        "name": "Versátil",
        "description": "Adquire um Talento de Origem à escolha (recomendado: Habilidoso)."
      }
    ]
  },
  {
    "id": "orc",
    "name": "Orc",
    "size": [
      "Médio"
    ],
    "speed": 9,
    "darkvision": 36,
    "traits": [
      {
        "name": "Pico de Adrenalina",
        "description": "Ação Bônus: executa ação Correr + ganha PV Temporários = Bônus de Prof. Usos = Bônus de Prof.; restaura em Descanso Curto ou Longo."
      },
      {
        "name": "Visão no Escuro",
        "description": "Enxerga no escuro até 36 metros."
      },
      {
        "name": "Vigor Implacável",
        "description": "Ao ser reduzido a 0 PV (sem morrer imediatamente), fica com 1 PV. 1×/Descanso Longo."
      }
    ]
  },
  {
    "id": "pequenino",
    "name": "Pequenino",
    "size": [
      "Pequeno"
    ],
    "speed": 9,
    "darkvision": null,
    "traits": [
      {
        "name": "Corajoso",
        "description": "Vantagem em salvaguardas para evitar/encerrar a condição Amedrontado."
      },
      {
        "name": "Agilidade Pequenina",
        "description": "Pode mover pelo espaço de qualquer criatura um tamanho maior, mas não pode parar no mesmo espaço."
      },
      {
        "name": "Sorte",
        "description": "Ao tirar 1 no D20 de um Teste de D20, pode re-rolar e usar o novo resultado."
      },
      {
        "name": "Furtividade Natural",
        "description": "Pode executar a ação Esconder mesmo encoberto apenas por criatura pelo menos um tamanho maior."
      }
    ]
  },
  {
    "id": "tiferino",
    "name": "Tiferino",
    "size": [
      "Médio",
      "Pequeno"
    ],
    "speed": 9,
    "darkvision": 18,
    "traits": [
      {
        "name": "Visão no Escuro",
        "description": "Enxerga no escuro até 18 metros."
      },
      {
        "name": "Legado Ínfero",
        "description": "Escolha um legado. Concede Resistência, truque e magias por nível.",
        "legados": [
          {
            "id": "abissal",
            "name": "Abissal",
            "nivel1": "Resistência a Venenoso + truque Rajada de Veneno",
            "nivel3": "Raio Nauseante",
            "nivel5": "Paralisar Pessoa"
          },
          {
            "id": "ctonico",
            "name": "Ctônico",
            "nivel1": "Resistência a Necrótico + truque Toque Necrótico",
            "nivel3": "Vitalidade Vazia",
            "nivel5": "Raio do Enfraquecimento"
          },
          {
            "id": "infernal",
            "name": "Infernal",
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
        "name": "Presença Sobrenatural",
        "description": "Conhece o truque Taumaturgia (usa o mesmo atributo de conjuração do Legado Ínfero)."
      }
    ]
  }
]
