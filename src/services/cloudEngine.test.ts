import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { countUnsynced, createCloudEngine, type CloudLocal, type CloudRemote } from './cloudEngine'
import {
  getCloudSnapshot,
  getCursor,
  getRecord,
  linkProfile,
  recordLocalDelete,
  recordLocalWrite,
  reloadCloudStateForTests,
} from './cloudState'
import { CLOUD_DOC_MAX_BYTES, CLOUD_PUSH_BATCH_MAX, STORAGE_KEY_CLOUD } from '../constants'
import { cloudKey, type CloudKind, type RemoteDoc } from '../lib/cloud/sync'

/** Nuvem em memória com a mesma regra do servidor: só substitui se não houver versão mais nova. */
function fakeCloud() {
  const docs = new Map<string, RemoteDoc>()
  let seq = 0
  const remote: CloudRemote = {
    async pull(since) {
      return [...docs.values()].filter(d => d.seq > since).sort((a, b) => a.seq - b.seq)
    },
    async push(items) {
      const written: Array<{ kind: CloudKind; id: string }> = []
      const conflicts: RemoteDoc[] = []
      for (const { kind, id, data, updated_at } of items) {
        const current = docs.get(cloudKey(kind, id))
        if (current && current.updated_at > updated_at) {
          conflicts.push(current)
          continue
        }
        docs.set(cloudKey(kind, id), { kind, id, data, updated_at, seq: ++seq })
        written.push({ kind, id })
      }
      return { written, conflicts }
    },
  }
  /** Escrita de outro aparelho. */
  const write = (kind: CloudKind, id: string, data: string | null, updatedAt: string) =>
    docs.set(cloudKey(kind, id), { kind, id, data, updated_at: updatedAt, seq: ++seq })
  return { docs, remote, write }
}

/** Aparelho em memória. `edit`/`remove` imitam os storages, que registram cada gravação. */
function fakeDevice() {
  const data = new Map<string, string>()
  const busy = new Set<string>()
  const refreshed: CloudKind[] = []
  const local: CloudLocal = {
    flush: async () => {},
    read: async (kind, ids) => ids.map(id => data.get(cloudKey(kind, id)) ?? null),
    apply: async (kind, changes) => {
      for (const { id, data: value } of changes) {
        if (value === null) data.delete(cloudKey(kind, id))
        else data.set(cloudKey(kind, id), value)
      }
    },
    isBusy: (kind, id) => busy.has(cloudKey(kind, id)),
    refresh: kinds => { refreshed.push(...kinds) },
    scan: async () => [...data.entries()].map(([key, value]) => {
      const [kind, id] = key.split(':') as [CloudKind, string]
      return { kind, id, data: value, updatedAt: '2026-01-01T00:00:00.000Z' }
    }),
  }
  const edit = (kind: CloudKind, id: string, value: string) => {
    data.set(cloudKey(kind, id), value)
    recordLocalWrite(kind, id, value)
  }
  const remove = (kind: CloudKind, id: string) => {
    data.delete(cloudKey(kind, id))
    recordLocalDelete(kind, id)
  }
  return { data, busy, refreshed, local, edit, remove }
}

const at = (day: number) => `2026-03-${String(day).padStart(2, '0')}T00:00:00.000Z`

beforeEach(() => {
  localStorage.removeItem(STORAGE_KEY_CLOUD)
  reloadCloudStateForTests()
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(at(10)))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('motor de sync com a conta', () => {
  it('primeiro vínculo sobe o que o aparelho já tinha', async () => {
    const cloud = fakeCloud()
    const device = fakeDevice()
    device.data.set('sheet:s1', '{"n":1}')
    device.data.set('campaign:c1', '{"c":1}')
    linkProfile({ uid: 'u1', email: null, name: null, photo: null })
    const engine = createCloudEngine(cloud.remote, device.local)

    await engine.scanLocal()
    expect(getCloudSnapshot().pending).toBe(2)
    await engine.sync()

    expect(cloud.docs.get('sheet:s1')?.data).toBe('{"n":1}')
    expect(cloud.docs.get('campaign:c1')?.data).toBe('{"c":1}')
    expect(getCloudSnapshot().pending).toBe(0)
  })

  it('traz o que outro aparelho mudou e só pede o que é novo depois', async () => {
    const cloud = fakeCloud()
    const device = fakeDevice()
    linkProfile({ uid: 'u1', email: null, name: null, photo: null })
    const engine = createCloudEngine(cloud.remote, device.local)
    cloud.write('sheet', 's1', '{"n":1}', at(1))

    await engine.sync()
    expect(device.data.get('sheet:s1')).toBe('{"n":1}')
    expect(device.refreshed).toContain('sheet')
    expect(getCursor()).toBeGreaterThan(0)
    expect(getCloudSnapshot().pending).toBe(0)

    // A próxima busca parte do cursor e não traz de novo o que já desceu.
    expect(await cloud.remote.pull(getCursor())).toEqual([])
  })

  it('regravar o mesmo conteúdo não vira mudança', async () => {
    const cloud = fakeCloud()
    const device = fakeDevice()
    linkProfile({ uid: 'u1', email: null, name: null, photo: null })
    const engine = createCloudEngine(cloud.remote, device.local)
    device.edit('sheet', 's1', '{"n":1}')
    await engine.sync()
    const { at: before } = getRecord('sheet:s1')!

    vi.setSystemTime(new Date(at(20)))
    device.edit('sheet', 's1', '{"n":1}')
    expect(getRecord('sheet:s1')!.at).toBe(before)
    expect(getCloudSnapshot().pending).toBe(0)
  })

  it('conflito: a edição local mais nova fica e sobe', async () => {
    const cloud = fakeCloud()
    const device = fakeDevice()
    linkProfile({ uid: 'u1', email: null, name: null, photo: null })
    const engine = createCloudEngine(cloud.remote, device.local)
    cloud.write('sheet', 's1', '{"v":"nuvem"}', at(5))
    device.edit('sheet', 's1', '{"v":"local"}') // às 10

    await engine.sync()
    expect(device.data.get('sheet:s1')).toBe('{"v":"local"}')
    expect(cloud.docs.get('sheet:s1')?.data).toBe('{"v":"local"}')
  })

  it('conflito: a versão da nuvem mais nova ganha da edição local', async () => {
    const cloud = fakeCloud()
    const device = fakeDevice()
    linkProfile({ uid: 'u1', email: null, name: null, photo: null })
    const engine = createCloudEngine(cloud.remote, device.local)
    device.edit('sheet', 's1', '{"v":"local"}') // às 10
    cloud.write('sheet', 's1', '{"v":"nuvem"}', at(15))

    await engine.sync()
    expect(device.data.get('sheet:s1')).toBe('{"v":"nuvem"}')
    expect(cloud.docs.get('sheet:s1')?.data).toBe('{"v":"nuvem"}')
    expect(getCloudSnapshot().pending).toBe(0)
  })

  it('apagar aqui vira lápide; lápide da nuvem apaga aqui', async () => {
    const cloud = fakeCloud()
    const device = fakeDevice()
    linkProfile({ uid: 'u1', email: null, name: null, photo: null })
    const engine = createCloudEngine(cloud.remote, device.local)
    device.edit('monster', 'm1', '{"m":1}')
    device.edit('monster', 'm2', '{"m":2}')
    await engine.sync()

    vi.setSystemTime(new Date(at(11)))
    device.remove('monster', 'm1')
    await engine.sync()
    expect(cloud.docs.get('monster:m1')?.data).toBeNull()

    cloud.write('monster', 'm2', null, at(12))
    await engine.sync()
    expect(device.data.has('monster:m2')).toBe(false)
    expect(getRecord('monster:m2')).toBeUndefined()
  })

  it('apagar o que nunca subiu não deixa lápide', async () => {
    linkProfile({ uid: 'u1', email: null, name: null, photo: null })
    const device = fakeDevice()
    device.edit('sheet', 's1', '{}')
    device.remove('sheet', 's1')
    expect(getRecord('sheet:s1')).toBeUndefined()
    expect(getCloudSnapshot().pending).toBe(0)
  })

  it('aberto num editor: espera, e não perde a mudança da nuvem', async () => {
    const cloud = fakeCloud()
    const device = fakeDevice()
    linkProfile({ uid: 'u1', email: null, name: null, photo: null })
    const engine = createCloudEngine(cloud.remote, device.local)
    device.edit('area_map', 'a1', '{"v":1}')
    await engine.sync()

    cloud.write('area_map', 'a1', '{"v":2}', at(12))
    cloud.write('area_map', 'a2', '{"v":1}', at(12))
    device.busy.add('area_map:a1')
    await engine.sync()
    expect(device.data.get('area_map:a1')).toBe('{"v":1}')
    expect(device.data.get('area_map:a2')).toBe('{"v":1}')

    device.busy.clear()
    await engine.sync()
    expect(device.data.get('area_map:a1')).toBe('{"v":2}')
  })

  it('push que perde para uma escrita mais nova aplica a da nuvem', async () => {
    const cloud = fakeCloud()
    const device = fakeDevice()
    linkProfile({ uid: 'u1', email: null, name: null, photo: null })
    const engine = createCloudEngine(cloud.remote, device.local)
    device.edit('campaign', 'c1', '{"v":"local"}') // às 10
    // Outro aparelho grava entre a busca e o push deste.
    cloud.write('campaign', 'c1', '{"v":"nuvem"}', at(15))

    await engine.push()
    expect(device.data.get('campaign:c1')).toBe('{"v":"nuvem"}')
    expect(getCloudSnapshot().pending).toBe(0)
  })

  it('grande demais para um documento fica só no aparelho', async () => {
    const cloud = fakeCloud()
    const device = fakeDevice()
    linkProfile({ uid: 'u1', email: null, name: null, photo: null })
    const engine = createCloudEngine(cloud.remote, device.local)
    device.edit('area_map', 'big', JSON.stringify({ x: 'a'.repeat(CLOUD_DOC_MAX_BYTES) }))

    await engine.sync()
    expect(cloud.docs.has('area_map:big')).toBe(false)
    expect(getRecord('area_map:big')?.too_large).toBe(true)
    expect(getCloudSnapshot()).toMatchObject({ pending: 1, localOnly: 1 })
  })

  it('logout conta o que a nuvem não tem olhando o aparelho, não só os registros', async () => {
    const cloud = fakeCloud()
    const device = fakeDevice()
    linkProfile({ uid: 'u1', email: null, name: null, photo: null })
    const engine = createCloudEngine(cloud.remote, device.local)
    device.edit('sheet', 's1', '{"n":1}')
    device.edit('monster', 'm1', '{"m":1}')
    await engine.sync()
    expect(await countUnsynced(device.local)).toBe(0)

    // Item sem registro (vínculo que falhou no meio) e apagado que não subiu.
    device.data.set('campaign:c1', '{"c":1}')
    device.remove('monster', 'm1')
    expect(await countUnsynced(device.local)).toBe(2)
  })

  it('push em lotes que cabem numa requisição', async () => {
    const cloud = fakeCloud()
    const device = fakeDevice()
    linkProfile({ uid: 'u1', email: null, name: null, photo: null })
    const engine = createCloudEngine(cloud.remote, device.local)
    for (let i = 0; i < CLOUD_PUSH_BATCH_MAX + 50; i++) device.edit('monster', `m${i}`, `{"m":${i}}`)
    const push = vi.spyOn(cloud.remote, 'push')

    await engine.push()
    expect(push).toHaveBeenCalledTimes(2)
    expect(push.mock.calls.every(([items]) => items.length <= CLOUD_PUSH_BATCH_MAX)).toBe(true)
    expect(cloud.docs.size).toBe(CLOUD_PUSH_BATCH_MAX + 50)
    expect(getCloudSnapshot().pending).toBe(0)
  })

  it('item fora do contrato fica no aparelho e não trava o resto do lote', async () => {
    const cloud = fakeCloud()
    const device = fakeDevice()
    linkProfile({ uid: 'u1', email: null, name: null, photo: null })
    const engine = createCloudEngine(cloud.remote, device.local)
    // Pacote de monstros importado com id que a API não aceita.
    device.edit('monster', 'Goblin Rei!', '{"m":1}')
    device.edit('monster', 'm2', '{"m":2}')

    await engine.push()
    expect(cloud.docs.has('monster:m2')).toBe(true)
    expect(cloud.docs.has('monster:Goblin Rei!')).toBe(false)
    expect(getRecord('monster:Goblin Rei!')?.invalid).toBe(true)
    expect(getCloudSnapshot()).toMatchObject({ pending: 1, localOnly: 1 })
  })
})
