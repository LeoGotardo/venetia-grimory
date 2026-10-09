import type { CharacterSheet } from './sheet'
import type { AbilityId } from './gameData'
import type { CREATURE_SIZES, CREATURE_TYPES } from '../constants'

/**
 * Área do mestre. Toda entidade tem id uuid e `updated_at`: é o que vai permitir
 * sincronizar com uma mesa online depois ("vale a última edição") sem mudar o
 * formato do que já está salvo.
 */

/**
 * Player da mesa. `local` aponta para uma ficha deste aparelho (`sheet_id`) e o
 * snapshot é renovado sempre que a campanha abre; `imported` veio de um JSON e
 * só muda quando o mestre reimporta.
 */
export interface PartyMember {
  id: string
  /** `room`: ficha ao vivo de um player na sala online; vira `imported` quando ele sai. */
  source: 'local' | 'imported' | 'room'
  sheet_id: string | null
  snapshot: CharacterSheet
  imported_at: string
  updated_at: string
  /** Membro da sala de onde a ficha chega (só `source: 'room'`). */
  room_member_id?: string | null
  /** Versão do documento da sala já aplicada — a mesma versão não regrava a campanha. */
  room_version?: number | null
}

export type CreatureSize = typeof CREATURE_SIZES[number]
export type CreatureType = typeof CREATURE_TYPES[number]

/**
 * Traço, ação, ação bônus, reação ou ação lendária. `attack_bonus` e `damage`
 * (expressão de dados, ex.: `2d6+3`) são opcionais: é o que o rastreador de
 * combate sabe rolar; o resto fica no texto.
 */
export interface StatBlockFeature {
  id: string
  name: string
  /** "Recarga 5–6", "3/Dia", "Custa 2 ações"… */
  usage: string
  description: string
  attack_bonus: number | null
  damage: string | null
  damage_type: string
  save_dc: number | null
  save_ability: AbilityId | null
}

/** Distâncias em metros, como o resto do app. */
export interface StatBlock {
  name: string
  size: CreatureSize
  creature_type: CreatureType
  /** Etiquetas do tipo: "goblinoide", "mago"… */
  tags: string
  alignment: string
  ac: number
  ac_note: string
  hp: { average: number; formula: string }
  speed: { walk: number; fly: number | null; swim: number | null; climb: number | null; burrow: number | null; hover: boolean }
  abilities: Record<AbilityId, number>
  save_proficiencies: AbilityId[]
  /** Bônus final por perícia (id do domínio, ex.: `percepcao`) — o bloco mostra o número pronto. */
  skills: Record<string, number>
  vulnerabilities: string
  resistances: string
  immunities: string
  /** Nomes canônicos em português (`AVAILABLE_CONDITIONS`), traduzidos na exibição. */
  condition_immunities: string[]
  senses: { darkvision: number | null; blindsight: number | null; tremorsense: number | null; truesight: number | null }
  languages: string
  /** `'0'`, `'1/8'`, `'1/4'`, `'1/2'`, `'1'`…`'30'`. */
  cr: string
  /**
   * Bônus de proficiência fixo. Ausente = vem do ND (regra dos blocos de 2024).
   * NPCs montados como personagem usam o do nível — senão salvaguardas e o
   * número da linha do ND sairiam de outra tabela.
   */
  proficiency_bonus?: number
  /** `null` usa o modificador de Destreza. */
  initiative_bonus: number | null
  traits: StatBlockFeature[]
  actions: StatBlockFeature[]
  bonus_actions: StatBlockFeature[]
  reactions: StatBlockFeature[]
  legendary_actions: StatBlockFeature[]
  legendary_uses: number | null
  description: string
}

/** Monstro do bestiário do mestre — vale para todas as campanhas. */
export interface Monster {
  id: string
  source: 'custom' | 'srd'
  statblock: StatBlock
  updated_at: string
}

/**
 * Quem o NPC é, fora dos números: o que o gerador sorteia e o mestre edita.
 * Campos vazios simplesmente não aparecem.
 */
export interface NpcProfile {
  gender: 'f' | 'm' | 'x' | ''
  species: string
  archetype: string
  age: string
  occupation: string
  appearance: string
  mannerism: string
  personality: string
  ideal: string
  bond: string
  flaw: string
  motivation: string
  secret: string
}

/** NPC de uma campanha: cópia própria do bloco, editável sem mexer no bestiário. */
export interface Npc {
  id: string
  statblock: StatBlock
  /** Monstro do bestiário de onde a cópia saiu, se saiu de um. */
  base_monster_id: string | null
  notes: string
  profile: NpcProfile | null
  updated_at: string
}

export type MoveMode = 'walk' | 'fly' | 'swim'
export type CombatSide = 'party' | 'enemy'

/**
 * Participante de um encontro. Os números de combate são do encontro: dano no
 * player aqui não escreve na ficha dele. NPCs e monstros levam uma cópia do
 * bloco (`statblock`) para rolar as ações sem depender do original.
 */
export interface Combatant {
  id: string
  kind: 'player' | 'npc' | 'monster'
  /** Id do PartyMember, Npc ou Monster de origem. */
  ref_id: string | null
  name: string
  initiative: number | null
  init_bonus: number
  ac: number
  hp: { current: number; max: number; temp: number }
  /** Nomes canônicos de `AVAILABLE_CONDITIONS`. */
  conditions: string[]
  concentration: boolean
  /** Escondido dos players (para quando houver tela da mesa). */
  hidden: boolean
  /** Fora da ordem de turnos; continua na lista. */
  defeated: boolean
  statblock: StatBlock | null
  /** Para o cálculo de dificuldade: nível do player. */
  level: number | null
  notes: string
  /** Casa do canto superior esquerdo no mapa do encontro; `null` = fora do mapa. */
  position: { x: number; y: number } | null
  size: CreatureSize
  /** Deslocamento a pé, em metros. */
  speed_m: number
  /** Voo e natação (metros); `null` = a criatura não tem esse deslocamento. */
  fly_m: number | null
  swim_m: number | null
  /** Modo do movimento no mapa: muda o deslocamento usado e o custo do terreno. */
  move_mode: MoveMode
  /**
   * Lado no combate. Aliados atravessam o espaço uns dos outros (como terreno
   * difícil); inimigos bloqueiam — regra "Moving Around Other Creatures" de 2024.
   */
  side: CombatSide
  /** Metros andados no turno atual — zera quando o turno dele começa. */
  movement_used_m: number
  /** Disparada neste turno: dobra o deslocamento disponível. */
  dash: boolean
}

/**
 * Registro do combate. Estruturado, não texto pronto: a interface monta a frase
 * no idioma atual, então trocar de idioma não deixa o log pela metade.
 */
export type EncounterLogEntry = { id: string; round: number } & (
  | { kind: 'start' }
  | { kind: 'end' }
  | { kind: 'round' }
  | { kind: 'turn'; actor: string }
  | { kind: 'damage'; actor: string; amount: number; hp: number }
  | { kind: 'heal'; actor: string; amount: number; hp: number }
  | { kind: 'temp'; actor: string; amount: number }
  | { kind: 'condition'; actor: string; condition: string; on: boolean }
  | { kind: 'defeated'; actor: string; on: boolean }
  | { kind: 'concentration'; actor: string; dc: number }
  | { kind: 'initiative'; actor: string; roll: number; total: number }
  | { kind: 'attack'; actor: string; feature: string; roll: number; total: number; crit: boolean; fumble: boolean }
  | { kind: 'damage_roll'; actor: string; feature: string; rolls: number[]; total: number; crit: boolean; damage_type: string }
)

export type EncounterStatus = 'preparing' | 'active' | 'finished'

export interface Encounter {
  id: string
  name: string
  status: EncounterStatus
  /** Mapa da campanha onde a luta acontece. */
  map_id: string | null
  /**
   * Névoa de guerra: um caractere por casa do mapa, `1` = revelada. `null` =
   * sem névoa. Trocar o tamanho do mapa invalida (volta a `null`).
   */
  fog: string | null
  combatants: Combatant[]
  round: number
  /** Combatente da vez, por id — reordenar a lista não muda de quem é o turno. */
  turn_id: string | null
  /**
   * Respeitar terreno e deslocamento no mapa durante o combate: quem tem a vez só
   * para dentro do alcance que resta e ninguém atravessa parede. Desligado, o
   * mestre move livre (o comportamento de antes).
   */
  strict_movement: boolean
  log: EncounterLogEntry[]
  created_at: string
  updated_at: string
}

export interface MapLabel {
  id: string
  x: number
  y: number
  text: string
}

/**
 * Mapa em grade. `cells` tem um caractere por casa (`TERRAINS[].code`), linha a
 * linha: um mapa 60×40 cabe em 2,4 KB e vai inteiro no export da campanha.
 */
export interface GridMap {
  id: string
  name: string
  width: number
  height: number
  cells: string
  labels: MapLabel[]
  created_at: string
  updated_at: string
}

/**
 * Camadas do mapa de área, de baixo para cima. O mapa guarda o estado de cada
 * uma (visível, bloqueada, opacidade); a ordem do array é a ordem de desenho.
 */
export type AreaLayerId =
  | 'background' | 'terrain' | 'water' | 'roads' | 'structures' | 'vegetation' | 'decor' | 'effects' | 'labels'

export interface AreaLayerState {
  id: AreaLayerId
  visible: boolean
  locked: boolean
  /** 0–1. */
  opacity: number
}

/** Objeto do catálogo posto no mapa (árvore, casa, ponte…). `x`/`y` é o centro, em unidades de mundo. */
export interface AreaStamp {
  kind: 'stamp'
  id: string
  layer: AreaLayerId
  asset: string
  x: number
  y: number
  /** Multiplicador do tamanho padrão do asset. */
  scale: number
  /** Graus, sentido horário. */
  rotation: number
  flip: boolean
  opacity: number
  /** Sombra projetada ou brilho mágico; sem campo = nenhum. */
  effect?: AreaEffect
}

export type AreaEffect = 'shadow' | 'glow'

/**
 * Ícone de informação (cidade, perigo, missão…) do game-icons.net: só o
 * símbolo, sempre de pé, com um contorno fino de contraste para ler sobre
 * qualquer chão. `size` é o lado em unidades de mundo.
 */
export interface AreaIcon {
  kind: 'icon'
  id: string
  layer: AreaLayerId
  icon: string
  x: number
  y: number
  size: number
  color: string
}

/** Ponta do pincel: orgânica (beira irregular), suave (degradê redondo) ou dura. */
export type AreaBrushEdge = 'rough' | 'soft' | 'hard'

/**
 * Pincelada de textura. Guarda só a linha central (`[x, y, x, y, …]`, já
 * simplificada), a espessura, a ponta e a força — os carimbos saem na hora de
 * desenhar. `erase` apaga a tinta da própria camada que estiver por baixo.
 */
export interface AreaPaint {
  kind: 'paint'
  id: string
  layer: AreaLayerId
  texture: string
  size: number
  points: number[]
  erase: boolean
  edge: AreaBrushEdge
  /** Força do pincel, 0–1: quanto a textura cobre o que está embaixo. */
  opacity: number
}

/** Região fechada: textura (`texture`) ou cor lisa translúcida, com borda tracejada opcional. */
export interface AreaRegion {
  kind: 'region'
  id: string
  layer: AreaLayerId
  /** `null` = preenche com `color`. */
  texture: string | null
  color: string
  border: boolean
  opacity: number
  points: number[]
}

export type AreaPathStyle = 'dirtRoad' | 'stoneRoad' | 'trail' | 'river' | 'stream' | 'wall' | 'border'

/** Linha aberta desenhada à mão (estrada, rio, muralha, fronteira), suavizada ao desenhar. */
export interface AreaPath {
  kind: 'path'
  id: string
  layer: AreaLayerId
  style: AreaPathStyle
  width: number
  points: number[]
}

export type AreaLabelStyle = 'region' | 'city' | 'note'

/** Texto no mapa. `x`/`y` é o centro; `size` é a altura da fonte em unidades de mundo. */
export interface AreaLabel {
  kind: 'label'
  id: string
  layer: AreaLayerId
  text: string
  x: number
  y: number
  size: number
  rotation: number
  style: AreaLabelStyle
  color: string
}

/**
 * Elemento da cena. A lista é plana, com a camada em cada elemento: a ordem no
 * array é o z dentro da camada — desfazer, duplicar e trocar de camada ficam triviais.
 */
export type AreaElement = AreaStamp | AreaPaint | AreaRegion | AreaPath | AreaLabel | AreaIcon

/**
 * Mapa ilustrativo, sem regra de combate: coordenadas de mundo (px a 1×), não
 * casas. Fica no IndexedDB (`areaMapStorage`), fora da campanha do localStorage.
 */
export interface AreaMap {
  id: string
  campaign_id: string
  name: string
  width: number
  height: number
  background: { texture: string }
  layers: AreaLayerState[]
  elements: AreaElement[]
  /** Grade só de alinhamento (sem regra de jogo). */
  grid: AreaGrid
  /** Miniatura JPEG (data URL) para a lista da aba Mapas; refeita pelo editor depois das edições. */
  thumbnail?: string
  version: 1
  created_at: string
  updated_at: string
}

export interface AreaGrid {
  kind: 'off' | 'square' | 'hex'
  /** Lado do quadrado ou distância entre centros de hexágonos, em unidades de mundo. */
  size: number
  opacity: number
}

/** Resumo para a lista da aba Mapas, sem carregar os elementos. */
export interface AreaMapListItem {
  id: string
  name: string
  width: number
  height: number
  background: string
  elements: number
  thumbnail?: string
  updated_at: string
}

/**
 * Nota do mestre, em markdown. Menções a players, NPCs e monstros são links
 * com esquema próprio — `[Grukk](npc:<id>)` — montados por `src/lib/gm/notes.ts`.
 */
export interface CampaignNote {
  id: string
  title: string
  body: string
  created_at: string
  updated_at: string
}

export interface Campaign {
  id: string
  name: string
  party: PartyMember[]
  npcs: Npc[]
  encounters: Encounter[]
  maps: GridMap[]
  /** Campanhas antigas guardavam um texto só; `normalizeCampaign` o transforma na primeira nota. */
  notes: CampaignNote[]
  created_at: string
  updated_at: string
}

/** Item do índice de campanhas — o bastante para a lista sem abrir cada uma. */
export interface CampaignListItem {
  id: string
  name: string
  players: number
  /** Contagens e combate em andamento para o cartão da campanha. Opcionais: índices antigos não têm. */
  npcs?: number
  encounters?: number
  maps?: number
  active_encounter?: string | null
  updated_at: string
}
