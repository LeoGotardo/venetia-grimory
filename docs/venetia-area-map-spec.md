# Venetia Grimory — Especificação do Area Map Editor

## 1. Objetivo

O **Area Map Editor** é uma ferramenta visual para representar áreas, regiões e locais do universo de uma campanha de RPG. É IMPORTANTE RESSALTAR QUE A FERRAMENTA AINDA NÃO TEM NOME, esse documento é apenas uma referencia, tecnicas e objetos definidos aqui não devem ser levados como regra, apenas como guia ou exemplo.

Seu propósito é permitir que o mestre crie mapas ilustrativos e editáveis para representar:

- florestas
- montanhas
- rios
- estradas
- vilas
- cidades
- castelos
- ruínas
- templos
- pontos de interesse
- regiões mágicas
- paisagens e decoração

O sistema **não representa regras de combate**.

Não devem ser responsabilidade do Area Map:

- movimentação de personagens
- custo de movimento
- colisão
- alcance
- linha de visão para combate
- posicionamento tático
- fog of war de combate
- regras de terreno
- turnos ou iniciativa

O Area Map deve responder apenas à pergunta:

> **Como representar visualmente este lugar no mundo do RPG?**

---

# 2. Separação entre tipos de mapa

O Venetia deve tratar os mapas como sistemas independentes.

```text
Venetia Map System
│
├── Combat Map
│   ├── Grid
│   ├── Cells
│   ├── Tokens
│   ├── Fog of War
│   └── Regras de combate
│
├── Area Map
│   ├── Textures
│   ├── Assets
│   ├── Icons
│   ├── Paths
│   ├── Shapes
│   ├── Labels
│   └── Effects
│
└── World / City Generators
    ├── Procedural Generation
    ├── Biomes
    ├── Settlements
    ├── Roads
    ├── Rivers
    └── World Structure
```

O **Combat Map** continua utilizando o modelo de grade existente.

O **Area Map** possui um modelo visual próprio.

Os futuros geradores de mundo e cidade devem gerar dados compatíveis com o `AreaMap`, mas não precisam compartilhar as mesmas regras do Combat Map.

---

# 3. Conceito principal

O Area Map deve ser tratado como uma **cena 2D composta por camadas**.

A estrutura conceitual é:

```text
AreaMap
│
├── Background
├── Terrain
├── Water
├── Landforms
├── Roads
├── Structures
├── Vegetation
├── Decorations
├── Labels
└── Effects
```

Cada camada pode conter elementos independentes.

O mapa não deve ser armazenado apenas como uma imagem.

O mapa deve ser armazenado como uma composição editável.

---

# 4. Componentes principais

## 4.1 MapScene

Representa o mapa completo.

Responsabilidades:

- tamanho do mapa
- configurações visuais
- camadas
- objetos
- caminhos
- textos
- metadados
- versão do formato

Exemplo conceitual:

```ts
interface AreaMap {
    id: string
    name: string

    width: number
    height: number

    layers: AreaMapLayer[]

    labels: MapLabel[]

    created_at: string
    updated_at: string
}
```

---

## 4.2 Layers

As camadas organizam visualmente o mapa.

Cada camada deve permitir:

- mostrar/ocultar
- bloquear/desbloquear
- alterar opacidade
- alterar ordem
- agrupamento
- eventualmente blend mode
- eventualmente máscara

Exemplo:

```text
Effects
Labels
Decorations
Vegetation
Structures
Roads
Water
Terrain
Background
```

---

## 4.3 Textures

Textures são materiais usados para preencher regiões.

Exemplos:

### Terrain

- grass
- dark grass
- dry grass
- dirt
- mud
- sand
- desert
- rock
- gravel
- stone
- snow
- ice
- swamp
- marsh
- ash
- volcanic rock

### Vegetation

- forest floor
- jungle
- meadow
- moss
- dead forest
- wetland

### Water

- ocean
- sea
- lake
- river
- stream
- swamp water

### Fantasy

- corrupted ground
- magic ground
- arcane ground
- cursed ground
- crystal ground
- shadow ground

### Cartography

- parchment
- old paper
- map paper
- paper grain

### Técnicas

As texturas devem suportar:

- tiling
- repetição sem emenda
- escala
- rotação
- opacidade
- tint/color adjustment
- máscara
- blend mode
- variação procedural
- transições entre terrenos

---

# 5. Assets / Stamps

Assets são objetos independentes colocados no mapa.

Cada asset deve possuir pelo menos:

```ts
interface AreaMapObject {
    id: string
    assetId: string

    x: number
    y: number

    scaleX: number
    scaleY: number

    rotation: number
    opacity: number

    flipX: boolean
    flipY: boolean

    zIndex: number
}
```

## 5.1 Natureza

- tree
- pine tree
- oak tree
- birch tree
- willow
- dead tree
- giant tree
- bush
- hedge
- fern
- flowers
- mushroom
- grass clump
- vines
- rock
- boulder
- stone pile
- crystal

## 5.2 Montanhas e relevo

- mountain
- mountain peak
- hill
- cliff
- rock formation
- canyon
- ravine
- crag

## 5.3 Água

- waterfall
- waterfall foam
- river mouth
- river source
- water splash

## 5.4 Estradas e transporte

- bridge
- signpost
- milestone
- wagon
- cart
- boat
- ship
- dock
- pier

## 5.5 Construções

- house
- cottage
- cabin
- farmhouse
- barn
- stable
- tavern
- inn
- shop
- blacksmith
- bakery
- warehouse
- mill
- workshop

## 5.6 Castelos e fortificações

- castle
- tower
- keep
- fort
- fortress
- gatehouse
- castle gate
- wall
- watchtower
- drawbridge

## 5.7 Ruínas

- ruined house
- ruined tower
- ruined castle
- broken wall
- broken pillar
- broken statue
- ancient ruin

## 5.8 Religião

- temple
- church
- chapel
- shrine
- altar
- monastery
- statue
- obelisk

## 5.9 Decoração

- campfire
- tent
- lantern
- torch
- barrel
- crate
- hay bale
- wood pile
- grave
- tomb
- fountain
- well
- fence
- gate

## 5.10 Fantasia

- magic crystal
- magic tree
- portal
- rune stone
- magic circle
- arcane statue
- ancient artifact
- totem
- magical plant

## 5.11 Animais

- deer
- wolf
- bear
- horse
- cow
- sheep
- goat
- chicken
- bird
- rabbit
- fox

---

# 6. Icons

Icons representam informação ou pontos de interesse.

Eles não devem ser tratados como objetos de cenário grandes.

Categorias:

## Assentamentos

- capital
- city
- town
- village
- hamlet
- camp
- outpost

## Locais

- castle
- fort
- tower
- temple
- shrine
- dungeon
- cave
- mine
- ruins
- tomb
- graveyard
- library
- tavern

## Recursos

- forest
- farm
- mine
- quarry
- fishing
- gold
- iron
- silver
- crystal
- herbs

## Transporte

- port
- harbor
- lighthouse
- shipyard
- bridge
- road

## Perigo

- danger
- monster
- dragon
- bandit
- enemy camp
- cursed area
- haunted area
- war zone

## RPG

- quest
- objective
- boss
- treasure
- secret
- important location
- npc
- player

## Magia

- magic
- arcane
- portal
- rune
- enchanted area
- corrupted area

## Cartografia

- compass
- north arrow
- map marker
- pin
- waypoint
- scale
- legend

---

# 7. Paths

Paths representam elementos lineares ou orgânicos.

Exemplos:

- estradas
- rios
- trilhas
- muralhas
- fronteiras
- caminhos
- canais

Modelo conceitual:

```ts
interface AreaMapPath {
    id: string

    points: Array<{
        x: number
        y: number
    }>

    width: number

    style: string

    opacity: number

    closed: boolean
}
```

O usuário deve poder desenhar caminhos livremente.

Tipos iniciais:

```text
Dirt Road
Stone Road
Trail
River
Stream
Wall
Border
```

---

# 8. Shapes / Regions

Shapes representam regiões preenchidas.

Aplicações:

- floresta
- deserto
- pântano
- região mágica
- lago
- território
- área de influência
- fronteira

Uma shape deve suportar:

- polígonos
- curvas
- preenchimento por cor
- preenchimento por textura
- borda
- opacidade
- máscara

Exemplo:

```text
Shape
  ↓
Texture
  ↓
Mask
  ↓
Region
```

---

# 9. Labels / Text

O editor deve permitir:

- nome de cidades
- nome de regiões
- nome de rios
- nome de montanhas
- descrições
- pontos de interesse

Propriedades:

- texto
- fonte
- tamanho
- escala
- rotação
- alinhamento
- cor
- sombra
- contorno
- curvatura opcional

---

# 10. Cartographic Elements

O editor deve possuir elementos específicos para mapas:

- compass
- north arrow
- scale
- legend
- decorative borders
- map frame
- markers
- waypoints

Esses elementos podem ser assets ou elementos vetoriais.

---

# 11. Renderer

## Tecnologia recomendada

**PixiJS 8**

PixiJS deve ser utilizado como renderer do Area Map porque já fornece:

- WebGL/WebGPU
- sprites
- texturas
- scene graph
- containers
- máscaras
- filtros
- blend modes
- graphics
- carregamento e cache de assets
- transformação de objetos
- renderização eficiente de muitos elementos

O React continua responsável pela interface do editor.

Arquitetura:

```text
React
│
├── Toolbar
├── Asset Browser
├── Layers Panel
├── Inspector
├── Generator UI
│
└── MapStage
      │
      └── PixiJS
```

---

# 12. Asset Management

Os assets devem ser organizados em catálogo.

Modelo sugerido:

```ts
interface MapAsset {
    id: string
    name: string

    type: 'texture' | 'asset' | 'icon'

    category: string

    src: string

    tags: string[]

    license?: {
        type: string
        author?: string
        source?: string
        attribution?: string
    }
}
```

O catálogo deve permitir:

- busca
- categorias
- tags
- favoritos
- pré-visualização
- licença
- agrupamento
- carregamento sob demanda

---

# 13. Sprite Sheets / Texture Atlases

Assets pequenos e repetidos devem ser agrupados em atlases.

Exemplo:

```text
nature.png
nature.json

buildings.png
buildings.json

decorations.png
decorations.json
```

Isso reduz a quantidade de texturas independentes e melhora o desempenho do renderer.

Categorias recomendadas:

```text
nature
buildings
roads
water
decorations
icons
fantasy
```

---

# 14. Técnicas para geração e composição do mapa

## 14.1 Tiling

Usar texturas repetíveis para grandes áreas.

Ideal para:

- grama
- areia
- terra
- pedra
- água
- neve

Evitar simplesmente esticar uma textura pequena para preencher todo o mapa.

---

## 14.2 Masking

Usar máscaras para limitar uma textura a uma determinada região.

Pipeline:

```text
Shape
 ↓
Mask
 ↓
Texture
```

Aplicações:

- florestas
- lagos
- pântanos
- regiões mágicas
- desertos
- territórios

---

## 14.3 Scatter

Distribuição automática de assets dentro de uma área.

Exemplo:

```text
Forest Region
     ↓
Scatter Trees
     ↓
Random Rotation
     ↓
Random Scale
     ↓
Random Asset Variant
```

Aplicações:

- árvores
- pedras
- flores
- cogumelos
- arbustos
- ruínas

---

## 14.4 Poisson Disk Sampling

Usar Poisson Disk Sampling para distribuir objetos sem aglomerações artificiais.

Aplicações:

- árvores
- pedras
- vegetação
- decoração

Objetivo:

```text
evitar

X X X X X
X X X X X

e produzir algo semelhante a:

X      X
   X
       X    X
X
```

---

## 14.5 Noise / Procedural Noise

Usar Simplex Noise ou outro algoritmo de noise para variação natural.

Aplicações:

- variação de terreno
- densidade de floresta
- distribuição de vegetação
- variação de textura
- regiões naturais

Para geração determinística, sempre utilizar `seed`.

---

## 14.6 Multi-Octave Noise

Combinar várias escalas de noise.

Exemplo:

```text
Noise grande
     +
Noise médio
     +
Noise pequeno
     ↓
Landscape Variation
```

Isso produz padrões menos artificiais.

---

## 14.7 Randomização controlada

Objetos devem aceitar pequenas variações:

```text
rotation ± 20°
scale 0.8–1.2
opacity 0.9–1.0
asset variant random
```

A randomização deve utilizar uma seed quando fizer parte de geração procedural.

---

## 14.8 Paths / Curves

Utilizar curvas e caminhos para:

- rios
- estradas
- trilhas
- fronteiras

Para brushes livres, utilizar uma técnica de suavização de traçado como `perfect-freehand`.

---

## 14.9 Polygon Triangulation

Para regiões complexas, utilizar triangulação de polígonos.

Biblioteca recomendada:

```text
earcut
```

Fluxo:

```text
Polygon
 ↓
Triangulation
 ↓
GPU Geometry
```

---

# 15. Técnicas de renderização

## 15.1 Sprite Rendering

Para:

- árvores
- casas
- pedras
- objetos
- símbolos

---

## 15.2 Graphics / Vector Rendering

Para:

- linhas
- polígonos
- regiões
- bordas
- formas
- caminhos

---

## 15.3 Filters

Usar filtros prontos quando possível.

Exemplos:

- blur
- drop shadow
- glow
- color adjustment
- noise
- outline
- displacement

Biblioteca opcional:

```text
pixi-filters
```

---

# 16. Shaders

Shaders devem ser utilizados apenas onde houver benefício real.

Aplicações:

- água animada
- névoa
- brilho mágico
- distorção
- areia
- efeitos atmosféricos
- variações de textura

Não usar shaders para toda a lógica do editor.

O editor deve continuar sendo baseado em objetos e camadas.

---

# 17. Efeitos visuais

Efeitos recomendados:

## Sombras

Utilizar filtros de sombra em assets quando possível.

## Glow

Usar para:

- magia
- cristais
- portais
- locais especiais

## Fog / Mist

Preferencialmente usando:

- transparência
- noise
- displacement
- shaders

## Atmosfera

Podem existir camadas com:

- névoa
- partículas
- chuva
- neve
- poeira
- cinzas
- luz

---

# 18. Scene Stamps

O editor deve permitir selecionar vários elementos e transformá-los em um grupo reutilizável.

Exemplo:

```text
Tree
House
Fence
Well
Road
```

Selecionar tudo:

```text
Create Scene Stamp
```

Resultado:

```text
Village_House_01
```

Depois o conjunto pode ser reutilizado em outros mapas.

Isso permite ao mestre criar seus próprios prefabs.

---

# 19. Zoom e navegação

O canvas deve permitir:

- pan
- zoom
- seleção
- drag
- zoom por mouse
- pinch zoom
- navegação por touch

A unidade de trabalho deve ser coordenada de mundo:

```text
worldX
worldY
```

e não célula de grid.

Grid/snap, quando existir, é apenas uma ferramenta de alinhamento.

---

# 20. Grid opcional

O Area Map pode ter grid opcional para ajudar no alinhamento.

Tipos:

```text
Off
Square
Hex
Custom
```

O grid não possui significado de gameplay.

Ele é apenas uma ferramenta visual.

---

# 21. Undo / Redo

O sistema deve utilizar comandos.

Exemplos:

```text
ADD_OBJECT
REMOVE_OBJECT
MOVE_OBJECT
ROTATE_OBJECT
SCALE_OBJECT
ADD_PATH
REMOVE_PATH
PAINT_TEXTURE
ADD_LAYER
REMOVE_LAYER
CHANGE_PROPERTY
```

Estrutura conceitual:

```ts
interface MapCommand {
    execute(): void
    undo(): void
}
```

Isso é preferível a salvar uma cópia completa do mapa a cada pequena alteração.

---

# 22. Persistência

O Area Map deve ser salvo como dados estruturados e não como PNG.

Estrutura:

```text
AreaMap JSON
│
├── metadata
├── layers
├── objects
├── paths
├── shapes
├── labels
└── settings
```

Imagens e assets devem permanecer referenciados por `assetId`/caminho.

Para armazenamento local, preferir:

- `IndexedDB` para dados estruturados e mapas maiores
- `localStorage` apenas para configurações pequenas
- armazenamento de arquivos/cache quando necessário

---

# 23. Exportação

O usuário deve conseguir exportar o resultado final para:

```text
PNG
JPEG
```

Opcionalmente:

```text
PNG com grid
PNG sem grid
PNG com labels
PNG sem labels
```

A exportação deve renderizar a cena final em uma resolução configurável.

---

# 24. Geração procedural futura

A geração procedural não deve substituir o editor.

Ela deve gerar um `AreaMap` inicial.

Fluxo:

```text
Generator
   ↓
AreaMap
   ↓
Editor
   ↓
Manual adjustments
```

Tipos possíveis:

```text
Forest
Swamp
Desert
Mountain Region
Village
Ruins
Coastal Area
Fantasy Region
```

A geração deve utilizar:

- seed
- noise
- regras de distribuição
- scatter
- paths
- shapes
- asset placement

---

# 25. Geração por IA — possibilidade futura

Uma IA pode ser utilizada para gerar um **blueprint**, e não uma imagem final.

Exemplo:

```text
Prompt
 ↓
LLM
 ↓
Map Blueprint JSON
 ↓
Procedural Generator
 ↓
AreaMap
 ↓
Editor
```

Exemplo de blueprint:

```json
{
  "biome": "forest",
  "landmark": "ruined_tower",
  "road": {
    "from": "south",
    "to": "tower"
  },
  "river": {
    "from": "northwest",
    "to": "southeast"
  }
}
```

Isso mantém o mapa totalmente editável.

---

# 26. Bibliotecas recomendadas

## Core

```text
pixi.js
```

Função:

- renderer
- sprites
- textures
- masks
- graphics
- filters
- scene graph
- asset loading

## Efeitos

```text
pixi-filters
```

Função:

- glow
- shadow
- blur
- outline
- adjustment
- outros filtros

## Noise

```text
simplex-noise
```

Função:

- geração procedural
- variação de terreno
- densidade
- máscaras

## Seed

```text
alea
```

Função:

- randomização determinística

## Brush

```text
perfect-freehand
```

Função:

- traçado livre
- suavização
- brush orgânico

## Polygon

```text
earcut
```

Função:

- triangulação de polígonos

## Opcional

```text
roughjs
```

Função:

- aparência desenhada à mão
- estilos cartográficos

---

# 27. Arquitetura recomendada

```text
src/
│
├── components/
│   └── gm/
│       └── map/
│           └── area/
│               ├── AreaMapEditor.tsx
│               ├── AreaMapStage.tsx
│               ├── AreaMapToolbar.tsx
│               ├── AreaMapLayers.tsx
│               ├── AreaMapAssets.tsx
│               ├── AreaMapInspector.tsx
│               └── AreaMapGenerator.tsx
│
├── lib/
│   └── gm/
│       └── area-map/
│           ├── scene.ts
│           ├── objects.ts
│           ├── layers.ts
│           ├── paths.ts
│           ├── shapes.ts
│           ├── textures.ts
│           ├── masks.ts
│           ├── brush.ts
│           ├── scatter.ts
│           ├── commands.ts
│           ├── serialization.ts
│           │
│           └── generation/
│               ├── terrain.ts
│               ├── noise.ts
│               ├── biome.ts
│               └── scatter.ts
│
├── data/
│   └── mapAssets.ts
│
└── services/
    └── areaMapStorage.ts
```

---

# 28. MVP recomendado

A primeira versão não deve implementar tudo.

## MVP

```text
1. PixiJS renderer
2. Layers
3. Asset browser
4. Select tool
5. Move
6. Rotate
7. Scale
8. Delete
9. Duplicate
10. Texture painting
11. Paths
12. Text labels
13. Save/load
14. Undo/redo
15. Export PNG
```

Com aproximadamente:

```text
10 texturas
15 elementos de natureza
10 construções
5 ruínas
5 elementos de água
5 estradas/pontes
10 objetos
15 ícones
```

já será possível validar o editor.

---

# 29. O que não implementar inicialmente

Não adicionar ao Area Map no MVP:

- regras de combate
- grid obrigatório
- tokens
- iniciativa
- movimento
- pathfinding
- colisão
- fog of war de combate
- alcance de ataques
- custo de terreno
- geração completa de mundo
- geração completa de cidades
- editor 3D

Esses sistemas pertencem a outras partes do Venetia.

---

# 30. Resultado esperado

O produto final deve permitir um fluxo como:

```text
Criar mapa
   ↓
Escolher tamanho
   ↓
Escolher textura base
   ↓
Pintar regiões
   ↓
Adicionar árvores
   ↓
Adicionar montanhas
   ↓
Desenhar rios
   ↓
Desenhar estradas
   ↓
Adicionar construções
   ↓
Adicionar ícones
   ↓
Adicionar nomes
   ↓
Aplicar efeitos
   ↓
Salvar
   ↓
Exportar
```

O resultado deve ser uma ferramenta de criação visual de mapas para RPG inspirada em editores como Inkarnate, mas integrada ao universo e fluxo de campanhas do Venetia.

---

# 31. Princípios de implementação

1. **Area Map não conhece regras de combate.**
2. **O mapa é uma cena editável, não apenas uma imagem.**
3. **Texturas preenchem regiões; assets representam objetos; icons representam informação.**
4. **Tudo deve ser baseado em coordenadas de mundo, não células.**
5. **PixiJS deve cuidar da renderização sempre que possível.**
6. **Preferir bibliotecas existentes a implementar sistemas gráficos do zero.**
7. **Geração procedural deve produzir o mesmo formato usado pelo editor.**
8. **Seeds devem permitir geração determinística.**
9. **Assets devem ser independentes do mapa e referenciados por ID.**
10. **Licenciamento dos assets deve ser armazenado junto ao catálogo.**
11. **O editor deve continuar funcionando sem geração procedural.**
12. **O usuário deve poder editar manualmente qualquer resultado gerado.**
