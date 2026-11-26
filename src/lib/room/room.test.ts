import { describe, it, expect } from 'vitest'
import { generateRoomCode, isRoomCode, normalizeRoomCode } from './code'
import { ROOM_CODE_ALPHABET, ROOM_CODE_LENGTH } from './constants'
import { clientMessageSchema, createRoomRequest, joinRoomRequest, roomEventSchema, serverMessageSchema, type RoomMember } from './protocol'
import { EMPTY_ROOM_VIEW, applyServerMessage } from './session'
import { docForProtocol, docVisibleTo, eventForProtocol, messageForProtocol } from './docs'
import { attackHits, pendingRequests, repliesTo } from './requests'
import type { RoomDoc, RoomEvent } from './protocol'
import { eventVisibleTo } from './docs'
import { parseComposer } from './composer'
import { critExpression, manualRoll, parseRoomDamage, parseRoomRoll } from './rolls'
import { planReminders, reminderId, upcomingSessions } from './reminders'

const uuid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`
const member = (n: number, role: RoomMember['role'] = 'player'): RoomMember => ({
  id: uuid(n), role, display_name: `M${n}`, joined_at: '2026-10-09T12:00:00.000Z',
})

describe('código da sala', () => {
  it('sai do alfabeto sem ambíguos, no tamanho certo', () => {
    let i = 0
    const code = generateRoomCode(max => i++ % max)
    expect(code).toHaveLength(ROOM_CODE_LENGTH)
    expect(code).toBe('ABCDEF')
    expect(isRoomCode(code)).toBe(true)
    expect(ROOM_CODE_ALPHABET).not.toMatch(/[IO01]/)
  })

  it('normaliza o que a pessoa digita', () => {
    expect(normalizeRoomCode(' ab-c2 34 ')).toBe('ABC234')
    expect(normalizeRoomCode('abc234xyz')).toBe('ABC234')
  })

  it('recusa letras fora do alfabeto', () => {
    expect(isRoomCode('ABCDE0')).toBe(false)
    expect(isRoomCode('ABCDEI')).toBe(false)
    expect(isRoomCode('ABC23')).toBe(false)
  })
})

describe('protocolo', () => {
  it('valida criar e entrar, aparando o nome', () => {
    expect(createRoomRequest.parse({ name: ' Mina ', campaign_id: uuid(1), display_name: ' Mestre ' }))
      .toEqual({ name: 'Mina', campaign_id: uuid(1), display_name: 'Mestre' })
    expect(joinRoomRequest.safeParse({ code: 'ABC234', display_name: '   ' }).success).toBe(false)
    expect(joinRoomRequest.safeParse({ code: 'abc234', display_name: 'Aria' }).success).toBe(false)
    expect(joinRoomRequest.safeParse({ code: 'ABC234', display_name: 'x'.repeat(61) }).success).toBe(false)
  })

  it('o socket só aceita mensagens conhecidas', () => {
    expect(clientMessageSchema.safeParse({ t: 'auth', token: 'x'.repeat(43), since: 0 }).success).toBe(true)
    expect(clientMessageSchema.safeParse({ t: 'auth', token: 'curto', since: 0 }).success).toBe(false)
    expect(clientMessageSchema.safeParse({ t: 'auth', token: 'x'.repeat(43), since: -1 }).success).toBe(false)
    expect(clientMessageSchema.safeParse({ t: 'drop_table' }).success).toBe(false)
    expect(serverMessageSchema.safeParse({ t: 'presence', member_id: uuid(2), online: true }).success).toBe(true)
  })
})

describe('estado da sala a partir das mensagens', () => {
  const ready = applyServerMessage(EMPTY_ROOM_VIEW, {
    t: 'ready',
    room: { id: uuid(9), code: 'ABC234', name: 'Mina', created_at: '2026-10-09T12:00:00.000Z' },
    member: member(1, 'gm'),
    members: [member(1, 'gm'), member(2)],
    online: [uuid(1)],
    version: 4,
    docs: [],
    full: true,
    events: [],
  })

  it('ready substitui tudo', () => {
    expect(ready).toMatchObject({ version: 4, online: [uuid(1)], closed: false })
    expect(ready.members.map(m => m.id)).toEqual([uuid(1), uuid(2)])
  })

  it('membro novo entra uma vez; atualizado é trocado', () => {
    const joined = applyServerMessage(ready, { t: 'member', member: member(3) })
    const again = applyServerMessage(joined, { t: 'member', member: { ...member(3), display_name: 'Novo' } })
    expect(again.members.map(m => m.display_name)).toEqual(['M1', 'M2', 'Novo'])
  })

  it('presença liga e desliga sem duplicar', () => {
    const on = applyServerMessage(applyServerMessage(ready, { t: 'presence', member_id: uuid(2), online: true }), { t: 'presence', member_id: uuid(2), online: true })
    expect(on.online).toEqual([uuid(1), uuid(2)])
    expect(applyServerMessage(on, { t: 'presence', member_id: uuid(1), online: false }).online).toEqual([uuid(2)])
  })

  it('quem sai some da lista e da presença; sala fechada zera a presença', () => {
    const left = applyServerMessage(ready, { t: 'member_left', member_id: uuid(1), reason: 'kicked' })
    expect(left.members.map(m => m.id)).toEqual([uuid(2)])
    expect(left.online).toEqual([])
    expect(applyServerMessage(ready, { t: 'closed' })).toMatchObject({ closed: true, online: [] })
  })
})

const sheetDoc = (owner: number, version: number, deleted = false): RoomDoc => ({
  kind: 'sheet', id: uuid(owner), owner_member_id: uuid(owner), version, deleted, data: deleted ? null : { v: version },
})

describe('documentos da sala', () => {
  const base = applyServerMessage(EMPTY_ROOM_VIEW, {
    t: 'ready',
    room: { id: uuid(9), code: 'ABC234', name: 'Mina', created_at: '2026-10-09T12:00:00.000Z' },
    member: member(1, 'gm'), members: [], online: [], version: 5, docs: [sheetDoc(2, 3), sheetDoc(3, 5)], full: true, events: [],
  })

  it('doc novo substitui e sobe a versão; lápide apaga', () => {
    const updated = applyServerMessage(base, { t: 'doc', doc: sheetDoc(2, 6) })
    expect(updated.docs[`sheet:${uuid(2)}`].data).toEqual({ v: 6 })
    expect(updated.version).toBe(6)
    const buried = applyServerMessage(updated, { t: 'doc', doc: sheetDoc(3, 7, true) })
    expect(Object.keys(buried.docs)).toEqual([`sheet:${uuid(2)}`])
  })

  it('doc mais velho que o que já há é ignorado', () => {
    const fresh = applyServerMessage(base, { t: 'doc', doc: sheetDoc(2, 8) })
    expect(applyServerMessage(fresh, { t: 'doc', doc: sheetDoc(2, 4) }).docs[`sheet:${uuid(2)}`].version).toBe(8)
  })

  it('reconexão parcial mescla; completa substitui', () => {
    const ready = (docs: RoomDoc[], full: boolean) => applyServerMessage(base, {
      t: 'ready', room: base.room!, member: member(1, 'gm'), members: [], online: [], version: 9, docs, full, events: [],
    })
    expect(Object.keys(ready([sheetDoc(4, 9)], false).docs)).toHaveLength(3)
    expect(Object.keys(ready([sheetDoc(4, 9)], true).docs)).toEqual([`sheet:${uuid(4)}`])
  })

  it('a ficha só chega ao mestre e ao dono', () => {
    const doc = sheetDoc(2, 1)
    expect(docVisibleTo(doc, member(1, 'gm'))).toBe(true)
    expect(docVisibleTo(doc, member(2))).toBe(true)
    expect(docVisibleTo(doc, member(3))).toBe(false)
    expect(docVisibleTo({ kind: 'table', owner_member_id: uuid(1) }, member(3))).toBe(true)
  })
})

const chat = (version: number, extra: Partial<RoomEvent> = {}): RoomEvent => ({
  kind: 'chat', version, actor_member_id: uuid(2), actor_name: 'Aria', private: false, created_at: '', payload: { text: `m${version}` },
  ...extra,
} as RoomEvent)

describe('rolagens e chat', () => {
  it('evento entra uma vez, em ordem, e sobe a versão', () => {
    let view = applyServerMessage(EMPTY_ROOM_VIEW, { t: 'event', event: chat(3) })
    view = applyServerMessage(view, { t: 'event', event: chat(2) })
    view = applyServerMessage(view, { t: 'event', event: chat(3) })
    expect(view.events.map(e => e.version)).toEqual([2, 3])
    expect(view.version).toBe(3)
  })

  it('privado chega ao mestre e ao autor, e a mais ninguém', () => {
    const secret = chat(1, { private: true })
    expect(eventVisibleTo(secret, member(1, 'gm'))).toBe(true)
    expect(eventVisibleTo(secret, member(2))).toBe(true)
    expect(eventVisibleTo(secret, member(3))).toBe(false)
    expect(eventVisibleTo(chat(1), member(3))).toBe(true)
  })

  it('/r vira rolagem com rótulo; o resto é mensagem', () => {
    expect(parseComposer('/r 1d20+5 Ataque com espada')).toEqual({ kind: 'roll', expression: '1d20+5', label: 'Ataque com espada' })
    expect(parseComposer('/ROLL 2d6')).toEqual({ kind: 'roll', expression: '2d6', label: '' })
    expect(parseComposer(' olá mesa ')).toEqual({ kind: 'chat', text: 'olá mesa' })
    expect(parseComposer('   ')).toBeNull()
  })

  it('a sala recusa rolagem absurda', () => {
    expect(parseRoomRoll('2d6+3')).not.toBeNull()
    expect(parseRoomRoll('100d6')).not.toBeNull()
    expect(parseRoomRoll('60d6+60d6')).toBeNull()
    expect(parseRoomRoll('1d100000')).toBeNull()
    expect(parseRoomRoll('1d1')).toBeNull()
    expect(parseRoomRoll('1d6+99999')).toBeNull()
    expect(parseRoomRoll('5')).toBeNull()
    expect(parseRoomRoll('ataque')).toBeNull()
  })

  it('dados físicos: um subtotal por termo, dentro do possível', () => {
    expect(manualRoll(parseRoomRoll('8d6+3')!, [27])).toEqual({ rolls: [27], bonus: 3, total: 30 })
    expect(manualRoll(parseRoomRoll('1d8+2d6-1')!, [5, 9])).toEqual({ rolls: [5, 9], bonus: -1, total: 13 })
    expect(manualRoll(parseRoomRoll('1d20-2d4')!, [15, 3])?.total).toBe(12)
    expect(manualRoll(parseRoomRoll('8d6')!, [7])).toBeNull()
    expect(manualRoll(parseRoomRoll('8d6')!, [49])).toBeNull()
    expect(manualRoll(parseRoomRoll('1d20')!, [12.5])).toBeNull()
    expect(manualRoll(parseRoomRoll('1d8+2d6')!, [5])).toBeNull()
    expect(manualRoll(parseRoomDamage('1+3')!, [])).toEqual({ rolls: [], bonus: 4, total: 4 })
    // Crítico: o dano físico vale para o dobro de dados.
    expect(manualRoll(critExpression(parseRoomRoll('1d8+3')!), [14])?.total).toBe(17)
  })

  it('dano aceita valor fixo (Ataque Desarmado), com o mesmo teto', () => {
    expect(parseRoomDamage('1+3')).toEqual({ terms: [], bonus: 4 })
    expect(parseRoomDamage('1d6+2')).not.toBeNull()
    expect(parseRoomDamage('99999')).toBeNull()
    expect(parseRoomDamage('60d6+60d6')).toBeNull()
    expect(parseRoomDamage('ataque')).toBeNull()
  })
})

describe('pedidos de teste e ataques', () => {
  const base = { actor_name: 'M', private: false, created_at: '' }
  const request = (version: number, member_ids: string[] | null): RoomEvent => ({
    ...base, kind: 'request', version, actor_member_id: uuid(1),
    payload: { check: { kind: 'skill', id: 'percepcao' }, label: '', member_ids, secret: false },
  })
  const reply = (version: number, actor: number, reply_to: number): RoomEvent => ({
    ...base, kind: 'roll', version, actor_member_id: uuid(actor),
    payload: { expression: '1d20+2', label: '', rolls: [10], bonus: 2, total: 12, reply_to },
  })

  it('pendente é o pedido para mim que eu ainda não rolei', () => {
    const events = [request(1, null), request(2, [uuid(3)]), reply(3, 2, 1)]
    expect(pendingRequests(events, uuid(2)).map(e => e.version)).toEqual([])
    expect(pendingRequests(events, uuid(3)).map(e => e.version)).toEqual([1, 2])
    expect(repliesTo(events, 1).map(e => e.actor_member_id)).toEqual([uuid(2)])
  })

  it('1 natural erra e 20 natural acerta, qualquer que seja a CA', () => {
    const attack = (natural: number, total: number) => ({
      ...base, kind: 'attack' as const, version: 1, actor_member_id: uuid(2),
      payload: {
        label: 'Espada', combatant_id: 'a', target_id: 'b', target_name: 'Goblin',
        attack: { expression: '1d20+5', rolls: [natural], bonus: 5, total }, damage: null, damage_type: '', natural,
      },
    })
    expect(attackHits(attack(1, 30), 10)).toBe(false)
    expect(attackHits(attack(20, 25), 30)).toBe(true)
    expect(attackHits(attack(10, 15), 15)).toBe(true)
    expect(attackHits(attack(9, 14), 15)).toBe(false)
  })

  it('crítico dobra os dados, não o bônus', () => {
    expect(critExpression(parseRoomRoll('1d8+2d6+3')!)).toEqual({
      terms: [{ count: 2, sides: 8, sign: 1 }, { count: 4, sides: 6, sign: 1 }], bonus: 3,
    })
  })
})

describe('salvaguarda do player', () => {
  const message = {
    t: 'save', combatant_id: 'eu', target_ids: ['g1', 'g2'], label: 'Bola de Fogo (3º círculo)', dc: 15,
    abilities: ['DES'], damage: '8d6', damage_type: 'Fogo', half_on_success: true, effect: 'none',
  }

  it('aceita o pedido e recusa o que passa dos limites', () => {
    expect(clientMessageSchema.safeParse(message).success).toBe(true)
    expect(clientMessageSchema.safeParse({ ...message, target_ids: [] }).success).toBe(false)
    expect(clientMessageSchema.safeParse({ ...message, target_ids: Array.from({ length: 13 }, (_, i) => `g${i}`) }).success).toBe(false)
    expect(clientMessageSchema.safeParse({ ...message, dc: 41 }).success).toBe(false)
    expect(clientMessageSchema.safeParse({ ...message, abilities: ['SOR'] }).success).toBe(false)
    expect(clientMessageSchema.safeParse({ ...message, abilities: ['FOR', 'DES', 'CON'] }).success).toBe(false)
    expect(clientMessageSchema.safeParse({ ...message, effect: 'stunned' }).success).toBe(false)
  })

  it('cura: pedido e evento passam pelo schema', () => {
    expect(clientMessageSchema.safeParse({ t: 'heal', combatant_id: 'eu', target_id: 'eu', label: 'Poção de Cura', heal: '2d4+2' }).success).toBe(true)
    expect(clientMessageSchema.safeParse({ t: 'heal', combatant_id: 'eu', target_id: 'eu', label: 'x', heal: '' }).success).toBe(false)
    const event = {
      version: 8, actor_member_id: uuid(2), actor_name: 'Mira', private: false, created_at: '2026-11-26T15:00:00.000Z',
      kind: 'heal',
      payload: { label: 'Poção de Cura', combatant_id: 'eu', target_id: 'eu', target_name: 'Mira', heal: { expression: '2d4+2', rolls: [3, 1], bonus: 2, total: 6 } },
    }
    expect(roomEventSchema.parse(event)).toEqual(event)
  })

  it('o evento passa pelo schema do log', () => {
    const event = {
      version: 7, actor_member_id: uuid(2), actor_name: 'Mira', private: false, created_at: '2026-11-26T15:00:00.000Z',
      kind: 'save',
      payload: {
        label: 'Agarrar', combatant_id: 'eu', targets: [{ id: 'g1', name: 'Goblin' }], dc: 13, abilities: ['FOR', 'DES'],
        damage: null, damage_type: '', half_on_success: false, effect: 'grappled',
      },
    }
    expect(roomEventSchema.parse(event)).toEqual(event)
  })
})

describe('compatibilidade com o protocolo 1', () => {
  it('app antigo não recebe tipos novos; o novo recebe tudo', () => {
    expect(docForProtocol({ kind: 'schedule' }, 1)).toBe(false)
    expect(docForProtocol({ kind: 'sheet' }, 1)).toBe(true)
    expect(eventForProtocol({ kind: 'attack' }, 1)).toBe(false)
    expect(eventForProtocol({ kind: 'roll' }, 1)).toBe(true)
    expect(eventForProtocol({ kind: 'request' }, 2)).toBe(true)
    expect(eventForProtocol({ kind: 'save' }, 2)).toBe(false)
    expect(eventForProtocol({ kind: 'save' }, 3)).toBe(true)
    expect(eventForProtocol({ kind: 'heal' }, 2)).toBe(false)
    expect(messageForProtocol({ t: 'intent', member_id: uuid(2), intent: { kind: 'move', combatant_id: 'a', to: { x: 1, y: 1 } } }, 1)).toBe(false)
    expect(messageForProtocol({ t: 'pong' }, 1)).toBe(true)
  })

  it('ready com um item de tipo desconhecido descarta só o item', () => {
    const parsed = serverMessageSchema.parse({
      t: 'ready', room: { id: uuid(9), code: 'ABC234', name: '', created_at: '' }, member: member(1), members: [], online: [],
      version: 3, full: true,
      docs: [{ kind: 'futuro', id: 'x', owner_member_id: null, version: 1, deleted: false, data: 1 }, sheetDoc(2, 2)],
      events: [{ kind: 'futuro', version: 1 }, chat(2)],
    })
    expect(parsed.t === 'ready' && parsed.docs.map(d => d.kind)).toEqual(['sheet'])
    expect(parsed.t === 'ready' && parsed.events.map(e => e.version)).toEqual([2])
  })
})

describe('agenda e lembretes', () => {
  const session = (n: number, starts_at: string) => ({ id: uuid(n), starts_at, title: '' })
  const now = Date.parse('2026-11-24T12:00:00.000Z')

  it('agenda só o lembrete que ainda cabe antes da sessão', () => {
    const plan = planReminders([session(1, '2026-11-24T20:00:00.000Z'), session(2, '2026-11-24T12:10:00.000Z')], 30 * 60_000, now)
    expect(plan.map(p => p.session.id)).toEqual([uuid(1)])
    expect(plan[0].at.toISOString()).toBe('2026-11-24T19:30:00.000Z')
  })

  it('id da notificação é inteiro positivo e estável', () => {
    expect(reminderId(uuid(1))).toBe(reminderId(uuid(1)))
    expect(reminderId(uuid(1))).not.toBe(reminderId(uuid(2)))
    expect(reminderId(uuid(1))).toBeGreaterThanOrEqual(0)
    expect(reminderId(uuid(1))).toBeLessThanOrEqual(0x7fffffff)
  })

  it('próximas sessões em ordem, sem as que já passaram', () => {
    const list = upcomingSessions([session(1, '2026-11-25T20:00:00.000Z'), session(2, '2026-11-24T11:00:00.000Z'), session(3, '2026-11-24T20:00:00.000Z')], now)
    expect(list.map(s => s.id)).toEqual([uuid(3), uuid(1)])
  })
})
