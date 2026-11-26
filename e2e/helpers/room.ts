import type { Page } from '@playwright/test'

/**
 * Sala simulada para o e2e: o WebSocket da sala responde no próprio navegador
 * (`routeWebSocket`) e as chamadas HTTP de `/api` são recusadas — o dev server
 * fala com o banco de produção do `.env.local`, e o teste não pode escrever lá.
 */

export const ROOM = { id: '00000000-0000-4000-8000-000000000001', code: 'ABC234', name: 'Mesa de teste' }
export const GM_ID = '00000000-0000-4000-8000-0000000000a1'
export const PLAYER_ID = '00000000-0000-4000-8000-0000000000b2'

const W = 12
const H = 8

/** Mesa em combate, na vez do combatente do player (`pc`). */
export function combatTable(overrides: Record<string, unknown> = {}) {
  return {
    encounter_id: 'enc-1',
    name: 'Emboscada na estrada',
    status: 'active',
    round: 2,
    turn_id: 'pc',
    combatants: [
      {
        id: 'pc', name: 'Aria Sombravéu', kind: 'player', side: 'party', health: 'wounded',
        hp: { current: 19, max: 28, temp: 0 }, defeated: false, initiative: 17, conditions: [], size: 'Médio',
        position: { x: 2, y: 3 }, member_id: PLAYER_ID, move: { left_m: 9, mode: 'walk' },
      },
      {
        id: 'gob-1', name: 'Goblin', kind: 'monster', side: 'enemy', health: 'bloodied',
        hp: null, defeated: false, initiative: 12, conditions: ['Caído'], size: 'Pequeno',
        position: { x: 5, y: 3 }, member_id: null, move: null,
      },
      {
        id: 'gob-2', name: 'Goblin Arqueiro', kind: 'monster', side: 'enemy', health: 'unhurt',
        hp: null, defeated: false, initiative: 8, conditions: [], size: 'Pequeno',
        position: { x: 8, y: 1 }, member_id: null, move: null,
      },
    ],
    map: { width: W, height: H, cells: '.'.repeat(W * H), labels: [], fog: null, vis: null },
    ...overrides,
  }
}

/** Grava a participação do player na sala antes do boot (como se já tivesse entrado). */
export async function seedMembership(page: Page, sheetId: string): Promise<void> {
  await page.addInitScript(({ room, playerId, sheetId }) => {
    if (window.localStorage.getItem('dnd_salas')) return
    window.localStorage.setItem('dnd_salas', JSON.stringify([{
      room_id: room.id, code: room.code, name: room.name, role: 'player', member_id: playerId,
      display_name: 'Aria', token: 'e2e-token', campaign_id: null, sheet_id: sheetId,
      broadcast_encounter_id: null, joined_at: '2026-11-26T12:00:00.000Z',
    }]))
    window.localStorage.setItem('dnd_sala_ativa', room.id)
  }, { room: ROOM, playerId: PLAYER_ID, sheetId })
}

/** Responde ao `auth` com a sala pronta e a mesa; guarda o que o app mandou. */
export async function mockRoom(page: Page, table: unknown): Promise<{ sent: unknown[] }> {
  const sent: unknown[] = []
  if (process.env.ROOM_DEBUG) {
    page.on('pageerror', e => console.log('[pageerror]', e.message))
    page.on('console', m => { if (m.type() === 'error') console.log('[console]', m.text().slice(0, 400)) })
  }
  await page.route('**/api/**', route => route.fulfill({ status: 503, body: '{"error":"unavailable"}' }))
  await page.routeWebSocket(/\/api\/room-ws/, ws => {
    ws.onMessage(raw => {
      const message = JSON.parse(String(raw)) as { t: string }
      sent.push(message)
      if (message.t === 'ping') ws.send(JSON.stringify({ t: 'pong' }))
      if (message.t !== 'auth') return
      ws.send(JSON.stringify({
        t: 'ready',
        room: { id: ROOM.id, code: ROOM.code, name: ROOM.name, created_at: '2026-11-26T12:00:00.000Z' },
        member: { id: PLAYER_ID, role: 'player', display_name: 'Aria', joined_at: '2026-11-26T12:00:00.000Z' },
        members: [
          { id: GM_ID, role: 'gm', display_name: 'Mestre', joined_at: '2026-11-26T12:00:00.000Z' },
          { id: PLAYER_ID, role: 'player', display_name: 'Aria', joined_at: '2026-11-26T12:00:00.000Z' },
        ],
        online: [GM_ID, PLAYER_ID],
        version: 10,
        docs: [{ kind: 'table', id: 'main', owner_member_id: GM_ID, version: 9, deleted: false, data: table }],
        full: true,
        events: [],
      }))
    })
  })
  return { sent }
}
