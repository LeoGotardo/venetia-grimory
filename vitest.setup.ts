// Os mapas de área moram no IndexedDB (`areaMapStorage`): node não tem, o fake em memória tem.
import 'fake-indexeddb/auto'

/**
 * `src/i18n/index.ts` lê o `localStorage` na inicialização para descobrir o idioma
 * salvo, e a store persiste a ficha por lá. Em ambiente node não existe nenhum dos
 * dois, então um stub em memória basta — nenhum teste depende de persistência.
 */
const store: Record<string, string> = {}

const memoryStorage: Storage = {
  get length() {
    return Object.keys(store).length
  },
  key: (i: number) => Object.keys(store)[i] ?? null,
  getItem: (k: string) => store[k] ?? null,
  setItem: (k: string, v: string) => {
    store[k] = String(v)
  },
  removeItem: (k: string) => {
    delete store[k]
  },
  clear: () => {
    Object.keys(store).forEach(k => delete store[k])
  },
}

Object.defineProperty(globalThis, 'localStorage', { value: memoryStorage, writable: true })
