import { describe, it, expect } from 'vitest'
import { generateRoomCode, isRoomCode, normalizeRoomCode } from './code'
import { ROOM_CODE_ALPHABET, ROOM_CODE_LENGTH } from './constants'
import { clientMessageSchema, createRoomRequest, joinRoomRequest, serverMessageSchema, type RoomMember } from './protocol'
import { EMPTY_ROOM_VIEW, applyServerMessage } from './session'
import { docVisibleTo } from './docs'
import type { RoomDoc, RoomEvent } from './protocol'
import { eventVisibleTo } from './docs'
import { parseComposer } from './composer'
import { parseRoomRoll } from './rolls'

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
})
