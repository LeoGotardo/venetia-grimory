import { z } from 'zod'
import {
  ROOM_CHAT_MAX, ROOM_CODE_ALPHABET, ROOM_CODE_LENGTH, ROOM_DISPLAY_NAME_MAX, ROOM_NAME_MAX,
  ROOM_ROLL_EXPRESSION_MAX, ROOM_ROLL_LABEL_MAX, ROOM_TOKEN_MAX_LENGTH,
} from './constants.js'

/** Lado do maior mapa de grade (`MAP_MAX_SIZE` do app) — repetido aqui porque o servidor não lê `src/constants`. */
const TABLE_MAP_MAX_SIDE = 100

/**
 * Contrato entre o app e as funções da sala. Os dois lados validam com estes
 * schemas: o servidor tudo o que recebe, o cliente o que chega pelo socket.
 */

export const roomCodeSchema = z.string().regex(new RegExp(`^[${ROOM_CODE_ALPHABET}]{${ROOM_CODE_LENGTH}}$`))
const displayNameSchema = z.string().trim().min(1).max(ROOM_DISPLAY_NAME_MAX)
const tokenSchema = z.string().min(20).max(ROOM_TOKEN_MAX_LENGTH)

export const ROOM_ROLES = ['gm', 'player'] as const
export type RoomRole = typeof ROOM_ROLES[number]

/** Erros que a API devolve em `{ error }`; a interface traduz por `room.errors.<código>`. */
export const ROOM_ERRORS = [
  'invalid_request', 'unauthorized', 'forbidden', 'room_not_found', 'room_closed', 'room_full',
  'kicked', 'rate_limited', 'server_error',
] as const
export type RoomError = typeof ROOM_ERRORS[number]

// ── HTTP ────────────────────────────────────────────────────────────────

export const createRoomRequest = z.object({
  name: z.string().trim().max(ROOM_NAME_MAX),
  campaign_id: z.uuid(),
  display_name: displayNameSchema,
})

export const joinRoomRequest = z.object({
  code: roomCodeSchema,
  display_name: displayNameSchema,
})

export const kickRequest = z.object({ member_id: z.uuid() })

export const roomMemberSchema = z.object({
  id: z.uuid(),
  role: z.enum(ROOM_ROLES),
  display_name: z.string(),
  joined_at: z.string(),
})
export type RoomMember = z.infer<typeof roomMemberSchema>

export const roomInfoSchema = z.object({
  id: z.uuid(),
  code: roomCodeSchema,
  name: z.string(),
  created_at: z.string(),
})
export type RoomInfo = z.infer<typeof roomInfoSchema>

/** Resposta de criar e de entrar: o token só aparece aqui, uma vez. */
export const roomJoinedResponse = z.object({
  room: roomInfoSchema,
  member: roomMemberSchema,
  token: tokenSchema,
})
export type RoomJoined = z.infer<typeof roomJoinedResponse>

/**
 * Documento da sala: substituído inteiro a cada escrita. `version` é a versão
 * da sala em que mudou; `deleted` é a lápide (o player saiu ou foi removido).
 */
export const ROOM_DOC_KINDS = ['sheet', 'table', 'note'] as const
export const roomDocSchema = z.object({
  kind: z.enum(ROOM_DOC_KINDS),
  id: z.string().min(1).max(100),
  owner_member_id: z.uuid().nullable(),
  version: z.number().int().nonnegative(),
  deleted: z.boolean(),
  data: z.unknown(),
})
export type RoomDoc = z.infer<typeof roomDocSchema>

/**
 * A mesa que o player vê: já filtrada no aparelho do mestre (`buildTableState`).
 * Nada aqui é escondido do player — o que ele não pode ver simplesmente não vem.
 */
export const TABLE_HEALTH = ['unhurt', 'wounded', 'bloodied', 'down'] as const
/** Limites da mesa — `buildTableState` corta o texto livre (nomes, rótulos) neles antes de mandar. */
export const TABLE_LIMITS = { title: 120, name: 80, label: 80, condition: 40, conditions: 24, combatants: 200, labels: 500 } as const
const tableIdSchema = z.string().min(1).max(64)
const tableCombatantSchema = z.object({
  id: tableIdSchema,
  name: z.string().max(TABLE_LIMITS.name),
  kind: z.enum(['player', 'npc', 'monster']),
  side: z.enum(['party', 'enemy']),
  /** Faixa de vida: o PV exato dos inimigos não sai do aparelho do mestre. */
  health: z.enum(TABLE_HEALTH),
  /** PV exato só de quem é da mesa (`kind: 'player'`). */
  hp: z.object({ current: z.number(), max: z.number(), temp: z.number() }).nullable(),
  defeated: z.boolean(),
  initiative: z.number().nullable(),
  conditions: z.array(z.string().max(TABLE_LIMITS.condition)).max(TABLE_LIMITS.conditions),
  size: z.string().max(16),
  /** Casa do canto superior esquerdo no mapa; `null` = fora do mapa. */
  position: z.object({ x: z.number().int().nonnegative(), y: z.number().int().nonnegative() }).nullable(),
})
export const tableStateSchema = z.object({
  encounter_id: tableIdSchema,
  name: z.string().max(TABLE_LIMITS.title),
  status: z.enum(['preparing', 'active', 'finished']),
  round: z.number().int().nonnegative(),
  /** De quem é a vez — só se ele está visível. */
  turn_id: tableIdSchema.nullable(),
  /** Visíveis, na ordem de iniciativa. */
  combatants: z.array(tableCombatantSchema).max(TABLE_LIMITS.combatants),
  map: z.object({
    width: z.number().int().min(1).max(TABLE_MAP_MAX_SIDE),
    height: z.number().int().min(1).max(TABLE_MAP_MAX_SIDE),
    /** Terreno sob a névoa já vem apagado (vazio). */
    cells: z.string().max(TABLE_MAP_MAX_SIDE * TABLE_MAP_MAX_SIDE),
    labels: z.array(z.object({ x: z.number().int(), y: z.number().int(), text: z.string().max(TABLE_LIMITS.label) })).max(TABLE_LIMITS.labels),
    fog: z.string().max(TABLE_MAP_MAX_SIDE * TABLE_MAP_MAX_SIDE).nullable(),
  }).nullable(),
})
export type TableState = z.infer<typeof tableStateSchema>
export type TableCombatant = z.infer<typeof tableCombatantSchema>
export type TableHealth = typeof TABLE_HEALTH[number]

/**
 * Evento do log da sala (rolagem ou mensagem). `private` = só o mestre e o
 * autor recebem. A rolagem é feita no servidor: `rolls` e `total` não vêm do cliente.
 */
const eventBase = {
  version: z.number().int().nonnegative(),
  actor_member_id: z.uuid().nullable(),
  actor_name: z.string(),
  private: z.boolean(),
  created_at: z.string(),
}
export const roomEventSchema = z.discriminatedUnion('kind', [
  z.object({
    ...eventBase,
    kind: z.literal('roll'),
    payload: z.object({
      expression: z.string(),
      label: z.string(),
      rolls: z.array(z.number().int()),
      bonus: z.number().int(),
      total: z.number().int(),
    }),
  }),
  z.object({ ...eventBase, kind: z.literal('chat'), payload: z.object({ text: z.string() }) }),
])
export type RoomEvent = z.infer<typeof roomEventSchema>

export const roomErrorResponse = z.object({ error: z.enum(ROOM_ERRORS) })

/** Resposta das ações sem dado de volta (fechar, remover, sair). */
export const roomOkResponse = z.object({ ok: z.literal(true) })

// ── WebSocket ───────────────────────────────────────────────────────────

export const clientMessageSchema = z.discriminatedUnion('t', [
  /** Primeiro frame: o token nunca vai na URL (URLs acabam em logs). */
  z.object({ t: z.literal('auth'), token: tokenSchema, since: z.number().int().nonnegative() }),
  z.object({ t: z.literal('ping') }),
  /** Player: a própria ficha inteira (o servidor confere o tamanho). */
  z.object({ t: z.literal('sheet_put'), sheet: z.record(z.string(), z.unknown()) }),
  /** Mestre: a mesa filtrada do encontro transmitido. */
  z.object({ t: z.literal('table_put'), table: tableStateSchema }),
  /** Mestre: parou de transmitir. */
  z.object({ t: z.literal('table_clear') }),
  z.object({
    t: z.literal('roll'),
    expression: z.string().trim().min(1).max(ROOM_ROLL_EXPRESSION_MAX),
    label: z.string().trim().max(ROOM_ROLL_LABEL_MAX),
    private: z.boolean(),
  }),
  z.object({ t: z.literal('chat'), text: z.string().trim().min(1).max(ROOM_CHAT_MAX), private: z.boolean() }),
])
export type ClientMessage = z.infer<typeof clientMessageSchema>

export const serverMessageSchema = z.discriminatedUnion('t', [
  z.object({
    t: z.literal('ready'),
    room: roomInfoSchema,
    member: roomMemberSchema,
    members: z.array(roomMemberSchema),
    online: z.array(z.uuid()),
    version: z.number().int().nonnegative(),
    /** Documentos visíveis a este membro que mudaram depois de `since`. */
    docs: z.array(roomDocSchema),
    /** `since` era 0: `docs` é a sala inteira e substitui o que o cliente tinha. */
    full: z.boolean(),
    /** Eventos visíveis depois de `since` (com `full`, só os últimos `ROOM_LOG_ON_READY`). */
    events: z.array(roomEventSchema),
  }),
  z.object({ t: z.literal('event'), event: roomEventSchema }),
  z.object({ t: z.literal('doc'), doc: roomDocSchema }),
  z.object({ t: z.literal('member'), member: roomMemberSchema }),
  z.object({ t: z.literal('member_left'), member_id: z.uuid(), reason: z.enum(['left', 'kicked']) }),
  z.object({ t: z.literal('presence'), member_id: z.uuid(), online: z.boolean() }),
  z.object({ t: z.literal('closed') }),
  z.object({ t: z.literal('pong') }),
])
export type ServerMessage = z.infer<typeof serverMessageSchema>
