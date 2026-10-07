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
  source: 'local' | 'imported'
  sheet_id: string | null
  snapshot: CharacterSheet
  imported_at: string
  updated_at: string
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

/** NPC de uma campanha: cópia própria do bloco, editável sem mexer no bestiário. */
export interface Npc {
  id: string
  statblock: StatBlock
  /** Monstro do bestiário de onde a cópia saiu, se saiu de um. */
  base_monster_id: string | null
  notes: string
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

export interface Campaign {
  id: string
  name: string
  party: PartyMember[]
  npcs: Npc[]
  encounters: Encounter[]
  maps: GridMap[]
  notes: string
  created_at: string
  updated_at: string
}

/** Item do índice de campanhas — o bastante para a lista sem abrir cada uma. */
export interface CampaignListItem {
  id: string
  name: string
  players: number
  updated_at: string
}
