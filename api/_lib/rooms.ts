import { createHash, randomBytes, randomInt } from 'node:crypto'
import { generateRoomCode } from '../../src/lib/room/code.js'
import {
  ROOM_CLOSED_RETENTION_DAYS, ROOM_IDLE_DAYS, ROOM_LOG_MAX, ROOM_MAX_MEMBERS, ROOM_SCHEDULE_DOC_ID, ROOM_SHEET_MAX_BYTES,
  ROOM_TABLE_DOC_ID, ROOM_TABLE_MAX_BYTES, ROOM_TOKEN_BYTES,
} from '../../src/lib/room/constants.js'
import { critExpression, parseRoomRoll } from '../../src/lib/room/rolls.js'
import { rollDice } from '../../src/lib/gm/dice.js'
import {
  roomScheduleSchema, tableStateSchema,
  type DiceResult, type RollCheck, type RoomDoc, type RoomError, type RoomEvent, type RoomInfo, type RoomJoined, type RoomMember,
  type RoomRole, type RoomSchedule, type SharedNote, type TableState,
} from '../../src/lib/room/protocol.js'
import { db, isUniqueViolation, toIso } from './db.js'
import { RoomFailure } from './http.js'
import { publish } from './redis.js'

/** Tentativas de sortear um código livre antes de desistir. */
const CODE_ATTEMPTS = 5

/** Membro autenticado pelo token, com a sala dele. */
export interface AuthedMember extends RoomMember {
  room: RoomInfo
  version: number
}

type Row = Record<string, unknown>

function newToken(): string {
  return randomBytes(ROOM_TOKEN_BYTES).toString('base64url')
}

/** No banco vai só o hash: um vazamento da tabela não entrega a sala a ninguém. */
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

function toMember(row: Row): RoomMember {
  return {
    id: String(row.member_id),
    role: row.role as RoomRole,
    display_name: String(row.display_name),
    joined_at: toIso(row.joined_at),
  }
}

function toRoom(row: Row): RoomInfo {
  return { id: String(row.room_id), code: String(row.code), name: String(row.name), created_at: toIso(row.room_created_at) }
}

export async function createRoom(input: { name: string; campaign_id: string; display_name: string }): Promise<RoomJoined> {
  const token = newToken()
  for (let attempt = 0; attempt < CODE_ATTEMPTS; attempt++) {
    const code = generateRoomCode(randomInt)
    try {
      const rows = await db()`
        with r as (
          insert into rooms (code, name, campaign_id) values (${code}, ${input.name}, ${input.campaign_id})
          returning id, code, name, created_at
        ), m as (
          insert into room_members (room_id, role, display_name, token_hash)
          select id, 'gm', ${input.display_name}, decode(${hashToken(token)}, 'hex') from r
          returning id, role, display_name, joined_at
        )
        select r.id as room_id, r.code, r.name, r.created_at as room_created_at,
               m.id as member_id, m.role, m.display_name, m.joined_at
        from r, m`
      return { room: toRoom(rows[0]), member: toMember(rows[0]), token }
    } catch (err) {
      if (!isUniqueViolation(err)) throw err
    }
  }
  throw new Error('Não achou código de sala livre.')
}

export async function joinRoom(input: { code: string; display_name: string }): Promise<RoomJoined> {
  const rooms = await db()`
    select r.id as room_id, r.code, r.name, r.created_at as room_created_at, r.closed_at,
           (select count(*)::int from room_members m where m.room_id = r.id and m.kicked_at is null) as members
    from rooms r where r.code = ${input.code}`
  const room = rooms[0]
  if (!room) throw new RoomFailure('room_not_found')
  if (room.closed_at) throw new RoomFailure('room_closed')
  if (Number(room.members) >= ROOM_MAX_MEMBERS) throw new RoomFailure('room_full')

  const token = newToken()
  const rows = await db()`
    insert into room_members (room_id, role, display_name, token_hash)
    values (${room.room_id}, 'player', ${input.display_name}, decode(${hashToken(token)}, 'hex'))
    returning id as member_id, role, display_name, joined_at`
  const member = toMember(rows[0])
  await publish(String(room.room_id), { t: 'member', member })
  return { room: toRoom(room), member, token }
}

/** Membro dono do token, ou o motivo de não valer mais (removido, sala fechada, desconhecido). */
export async function memberByToken(token: string): Promise<AuthedMember | RoomError> {
  const rows = await db()`
    select m.id as member_id, m.role, m.display_name, m.joined_at, m.kicked_at,
           r.id as room_id, r.code, r.name, r.created_at as room_created_at, r.closed_at, r.version
    from room_members m join rooms r on r.id = m.room_id
    where m.token_hash = decode(${hashToken(token)}, 'hex')`
  const row = rows[0]
  if (!row) return 'unauthorized'
  if (row.kicked_at) return 'kicked'
  if (row.closed_at) return 'room_closed'
  return { ...toMember(row), room: toRoom(row), version: Number(row.version) }
}

/** `memberByToken` que lança — para os endpoints HTTP. */
export async function requireMember(token: string | null): Promise<AuthedMember> {
  if (!token) throw new RoomFailure('unauthorized')
  const result = await memberByToken(token)
  if (typeof result === 'string') throw new RoomFailure(result)
  return result
}

export async function listMembers(roomId: string): Promise<RoomMember[]> {
  const rows = await db()`
    select id as member_id, role, display_name, joined_at from room_members
    where room_id = ${roomId} and kicked_at is null order by joined_at`
  return rows.map(toMember)
}

/** Conectar conta como uso: a sala de uma mesa que só joga (sem escrever nada) não cai na limpeza. */
export async function touchMember(member: AuthedMember): Promise<void> {
  await db()`update room_members set last_seen_at = now() where id = ${member.id}`
  await db()`update rooms set updated_at = now() where id = ${member.room.id}`
}

/**
 * Limpeza do cron: salas fechadas há `ROOM_CLOSED_RETENTION_DAYS` e salas sem
 * uso há `ROOM_IDLE_DAYS` somem com membros, documentos e eventos (cascata).
 */
export async function deleteStaleRooms(): Promise<number> {
  const rows = await db()`
    delete from rooms
    where (closed_at is not null and closed_at < now() - make_interval(days => ${ROOM_CLOSED_RETENTION_DAYS}))
       or updated_at < now() - make_interval(days => ${ROOM_IDLE_DAYS})
    returning id`
  return rows.length
}

export async function closeRoom(gm: AuthedMember): Promise<void> {
  if (gm.role !== 'gm') throw new RoomFailure('forbidden')
  await db()`update rooms set closed_at = now(), updated_at = now() where id = ${gm.room.id} and closed_at is null`
  await publish(gm.room.id, { t: 'closed' })
}

export async function kickMember(gm: AuthedMember, memberId: string): Promise<void> {
  if (gm.role !== 'gm') throw new RoomFailure('forbidden')
  const rows = await db()`
    update room_members set kicked_at = now()
    where id = ${memberId} and room_id = ${gm.room.id} and role = 'player' and kicked_at is null
    returning id`
  if (rows.length === 0) throw new RoomFailure('invalid_request')
  await buryPlayerDocs(gm.room.id, memberId)
  await publish(gm.room.id, { t: 'member_left', member_id: memberId, reason: 'kicked' })
}

/** O player sai e o registro some; o mestre não sai — fecha a sala. */
export async function leaveRoom(member: AuthedMember): Promise<void> {
  if (member.role === 'gm') throw new RoomFailure('forbidden')
  await buryPlayerDocs(member.room.id, member.id)
  await db()`delete from room_members where id = ${member.id}`
  await publish(member.room.id, { t: 'member_left', member_id: member.id, reason: 'left' })
}

function toDoc(row: Row): RoomDoc {
  return {
    kind: row.kind as RoomDoc['kind'],
    id: String(row.id),
    owner_member_id: row.owner_member_id == null ? null : String(row.owner_member_id),
    version: Number(row.version),
    deleted: Boolean(row.deleted),
    data: row.deleted ? null : row.data,
  }
}

/**
 * Grava um documento (substitui inteiro) e devolve-o com a versão nova. A
 * versão da sala sobe na mesma instrução: quem reconecta pede `version > since`
 * e não pode perder uma escrita feita entre a leitura e a gravação.
 */
async function putDoc(member: AuthedMember, kind: RoomDoc['kind'], id: string, json: string): Promise<RoomDoc> {
  const rows = await db()`
    with v as (
      update rooms set version = version + 1, updated_at = now()
      where id = ${member.room.id} and closed_at is null
      returning version
    )
    insert into room_docs (room_id, kind, id, owner_member_id, data, version, deleted, updated_at)
    select ${member.room.id}, ${kind}, ${id}, ${member.id}, ${json}::jsonb, v.version, false, now() from v
    on conflict (room_id, kind, id) do update
      set data = excluded.data, version = excluded.version, deleted = false,
          owner_member_id = excluded.owner_member_id, updated_at = now()
    returning kind, id, owner_member_id, version, deleted, data`
  if (rows.length === 0) throw new RoomFailure('room_closed')
  return toDoc(rows[0])
}

/** Vira lápide (sem dado) e devolve-a, ou `null` se o documento não existia. */
async function buryDoc(roomId: string, kind: RoomDoc['kind'], id: string): Promise<RoomDoc | null> {
  const rows = await db()`
    with v as (update rooms set version = version + 1, updated_at = now() where id = ${roomId} returning version)
    update room_docs d set deleted = true, data = null, version = v.version, updated_at = now()
    from v where d.room_id = ${roomId} and d.kind = ${kind} and d.id = ${id} and not d.deleted
    returning d.kind, d.id, d.owner_member_id, d.version, d.deleted, d.data`
  return rows[0] ? toDoc(rows[0]) : null
}

/** Player: a própria ficha (um documento por membro). */
export async function putSheet(member: AuthedMember, sheet: Record<string, unknown>): Promise<RoomDoc> {
  if (member.role !== 'player') throw new RoomFailure('forbidden')
  const json = JSON.stringify(sheet)
  if (json.length > ROOM_SHEET_MAX_BYTES) throw new RoomFailure('invalid_request')
  return putDoc(member, 'sheet', member.id, json)
}

/** Mestre: a mesa já filtrada no aparelho dele. */
export async function putTable(member: AuthedMember, table: TableState): Promise<RoomDoc> {
  if (member.role !== 'gm') throw new RoomFailure('forbidden')
  const json = JSON.stringify(table)
  if (json.length > ROOM_TABLE_MAX_BYTES) throw new RoomFailure('invalid_request')
  return putDoc(member, 'table', ROOM_TABLE_DOC_ID, json)
}

export async function clearTable(member: AuthedMember): Promise<RoomDoc | null> {
  if (member.role !== 'gm') throw new RoomFailure('forbidden')
  return buryDoc(member.room.id, 'table', ROOM_TABLE_DOC_ID)
}

/** Documentos que mudaram depois de `since` (lápides inclusive, para o cliente apagar). */
export async function docsSince(roomId: string, since: number): Promise<RoomDoc[]> {
  const rows = await db()`
    select kind, id, owner_member_id, version, deleted, data from room_docs
    where room_id = ${roomId} and version > ${since}
    order by version`
  return rows.map(toDoc)
}

/** Mestre: publica uma nota compartilhada (o schema já limitou título e texto). */
export async function putNote(member: AuthedMember, id: string, note: SharedNote): Promise<RoomDoc> {
  if (member.role !== 'gm') throw new RoomFailure('forbidden')
  return putDoc(member, 'note', id, JSON.stringify(note))
}

export async function clearNote(member: AuthedMember, id: string): Promise<RoomDoc | null> {
  if (member.role !== 'gm') throw new RoomFailure('forbidden')
  return buryDoc(member.room.id, 'note', id)
}

/** O player saiu ou foi removido: a ficha dele vira lápide (o mestre fica com a última cópia). */
async function buryPlayerDocs(roomId: string, memberId: string): Promise<void> {
  const doc = await buryDoc(roomId, 'sheet', memberId)
  if (doc) await publish(roomId, { t: 'doc', doc })
}

/** Mestre: a agenda de sessões inteira (o schema já limitou o tamanho). */
export async function putSchedule(member: AuthedMember, schedule: RoomSchedule): Promise<RoomDoc> {
  if (member.role !== 'gm') throw new RoomFailure('forbidden')
  return putDoc(member, 'schedule', ROOM_SCHEDULE_DOC_ID, JSON.stringify(schedule))
}

/** Agenda da sala do token — o app busca a de cada sala ao abrir, para agendar os lembretes sem socket. */
export async function scheduleOf(member: AuthedMember): Promise<RoomSchedule> {
  const rows = await db()`
    select data from room_docs where room_id = ${member.room.id} and kind = 'schedule' and id = ${ROOM_SCHEDULE_DOC_ID} and not deleted`
  const parsed = roomScheduleSchema.safeParse(rows[0]?.data)
  return parsed.success ? parsed.data : { sessions: [] }
}

/** A mesa gravada, se houver — é ela que diz qual combatente é de quem e de quem é a vez. */
async function storedTable(roomId: string): Promise<TableState | null> {
  const rows = await db()`
    select data from room_docs where room_id = ${roomId} and kind = 'table' and id = ${ROOM_TABLE_DOC_ID} and not deleted`
  const parsed = tableStateSchema.safeParse(rows[0]?.data)
  return parsed.success ? parsed.data : null
}

/**
 * O combatente é deste player na mesa transmitida? `turn`: e tem a vez, com o
 * combate em andamento. O mestre confere de novo no aparelho dele (é ele quem
 * sabe o que a mesa não mostra); isto só barra quem nem está no combate.
 */
async function requireOwnCombatant(member: AuthedMember, combatantId: string, turn: boolean): Promise<TableState> {
  if (member.role !== 'player') throw new RoomFailure('forbidden')
  const table = await storedTable(member.room.id)
  const own = table?.combatants.find(c => c.id === combatantId)
  if (!table || !own || own.member_id !== member.id) throw new RoomFailure('forbidden')
  if (turn && (table.status !== 'active' || table.turn_id !== combatantId)) throw new RoomFailure('forbidden')
  return table
}

/** Player: confere o pedido de movimento antes de repassá-lo ao mestre. */
export async function checkMoveIntent(member: AuthedMember, combatantId: string): Promise<void> {
  await requireOwnCombatant(member, combatantId, true)
}

function toEvent(row: Row): RoomEvent {
  const base = {
    version: Number(row.version),
    actor_member_id: row.actor_member_id == null ? null : String(row.actor_member_id),
    actor_name: String(row.actor_name),
    private: Boolean(row.is_private),
    created_at: toIso(row.created_at),
  }
  // O banco só guarda o que o servidor validou; o tipo do payload segue o `kind`.
  return { ...base, kind: row.kind, payload: row.payload } as RoomEvent
}

/** Grava o evento com a versão nova da sala e poda o log para os últimos `ROOM_LOG_MAX`. */
async function addEvent(member: AuthedMember, kind: RoomEvent['kind'], isPrivate: boolean, payload: unknown): Promise<RoomEvent> {
  const rows = await db()`
    with v as (
      update rooms set version = version + 1, updated_at = now()
      where id = ${member.room.id} and closed_at is null
      returning version
    )
    insert into room_events (room_id, version, kind, actor_member_id, actor_name, is_private, payload)
    select ${member.room.id}, v.version, ${kind}, ${member.id}, ${member.display_name}, ${isPrivate}, ${JSON.stringify(payload)}::jsonb from v
    returning version, kind, actor_member_id, actor_name, is_private, payload, created_at`
  if (rows.length === 0) throw new RoomFailure('room_closed')
  await db()`
    delete from room_events where room_id = ${member.room.id} and version <= (
      select version from room_events where room_id = ${member.room.id}
      order by version desc offset ${ROOM_LOG_MAX} limit 1
    )`
  return toEvent(rows[0])
}

/** Dado justo: `crypto.randomInt` no lugar de `Math.random`, e sempre no servidor. */
const cryptoRandom = () => randomInt(0, 2 ** 32) / 2 ** 32

/** Rola a expressão já aceita por `parseRoomRoll`; `crit` dobra os dados (o bônus fixo entra uma vez). */
function rollExpression(text: string, crit = false): DiceResult {
  const parsed = parseRoomRoll(text)
  if (!parsed) throw new RoomFailure('invalid_request')
  const { rolls, bonus, total } = rollDice(crit ? critExpression(parsed) : parsed, cryptoRandom)
  return { expression: text.replace(/\s+/g, ''), rolls, bonus, total }
}

export async function addRoll(
  member: AuthedMember,
  input: { expression: string; label: string; private: boolean; reply_to?: number | null },
): Promise<RoomEvent> {
  return addEvent(member, 'roll', input.private, { ...rollExpression(input.expression), label: input.label, reply_to: input.reply_to ?? null })
}

/** Mestre: pede um teste. O próprio pedido é público; `secret` faz as respostas saírem privadas. */
export async function addRequest(
  member: AuthedMember,
  input: { check: RollCheck; label: string; member_ids: string[] | null; secret: boolean },
): Promise<RoomEvent> {
  if (member.role !== 'gm') throw new RoomFailure('forbidden')
  return addEvent(member, 'request', false, { check: input.check, label: input.label, member_ids: input.member_ids, secret: input.secret })
}

/**
 * Player ataca na mesa: o servidor rola o d20 e o dano juntos (crítico no 20
 * natural dobra os dados) — o mestre, que vê a CA, decide se acerta e aplica.
 */
export async function addAttack(
  member: AuthedMember,
  input: { combatant_id: string; target_id: string; label: string; attack: string; damage: string | null; damage_type: string },
): Promise<RoomEvent> {
  const table = await requireOwnCombatant(member, input.combatant_id, false)
  const target = table.combatants.find(c => c.id === input.target_id)
  if (!target || target.id === input.combatant_id) throw new RoomFailure('invalid_request')
  const attack = rollExpression(input.attack)
  if (!/^1d20(?:[+-]\d+)?$/.test(attack.expression)) throw new RoomFailure('invalid_request')
  const natural = attack.rolls[0]
  const damage = input.damage ? rollExpression(input.damage, natural === 20) : null
  return addEvent(member, 'attack', false, {
    label: input.label, combatant_id: input.combatant_id, target_id: target.id, target_name: target.name,
    attack, damage, damage_type: input.damage_type, natural,
  })
}

export async function addChat(member: AuthedMember, input: { text: string; private: boolean }): Promise<RoomEvent> {
  return addEvent(member, 'chat', input.private, { text: input.text })
}

/** Eventos depois de `since`; do zero, só os últimos `limit` (o log antigo não volta inteiro). */
export async function eventsSince(roomId: string, since: number, limit: number): Promise<RoomEvent[]> {
  const rows = await db()`
    select version, kind, actor_member_id, actor_name, is_private, payload, created_at from room_events
    where room_id = ${roomId} and version > ${since}
    order by version desc limit ${limit}`
  return rows.reverse().map(toEvent)
}
