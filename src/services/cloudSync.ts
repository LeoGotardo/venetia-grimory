import type { User } from 'firebase/auth'
import { CLOUD_PULL_MIN_INTERVAL_MS, CLOUD_PUSH_DELAY_MS, CLOUD_SIGN_OUT_TIMEOUT_MS } from '../constants'
import { useCloudStore } from '../store/cloudStore'
import { countUnsynced, createCloudEngine, type CloudEngine } from './cloudEngine'
import { cloudLocal, flushLocal, wipeLocalData } from './cloudLocal'
import {
  getCloudSnapshot,
  isCloudLinked,
  linkProfile,
  subscribeLocalChanges,
  unlinkProfile,
  updateProfile,
} from './cloudState'
import {
  currentIdToken,
  signInWithGoogle as firebaseSignIn,
  signOutFirebase,
  toProfile,
  watchAuth,
} from './firebaseAuth'
import { CloudApiError, cloudApiRemote } from './cloudApi'

/**
 * Orquestra o sync com a conta: login/logout, quando buscar e quando subir.
 * Login pelo Firebase, dados no Neon (`api/sync`). Carregado sob demanda
 * (`CloudSyncBridge`, `AccountModal`) — o Firebase fica fora do bundle de quem nunca entrou.
 *
 * Busca ao entrar, ao abrir o app, ao voltar para ele e quando a rede volta;
 * sobe `CLOUD_PUSH_DELAY_MS` depois da última gravação local. Uma operação por
 * vez: `exclusive` enfileira, e o motor nunca compara com um estado pela metade.
 */

let started = false
let user: User | null = null
let engine: CloudEngine | null = null
let chain: Promise<unknown> = Promise.resolve()
let queuedSync: Promise<void> | null = null
let pushTimer: ReturnType<typeof setTimeout> | null = null
let lastSyncAt = 0

function exclusive<T>(task: () => Promise<T>): Promise<T> {
  const next = chain.then(task, task)
  chain = next.catch(() => undefined)
  return next
}

async function guarded(task: () => Promise<unknown>): Promise<void> {
  useCloudStore.setState({ phase: 'syncing' })
  try {
    await task()
    useCloudStore.setState({ phase: 'idle', error: null, lastSyncAt: new Date().toISOString() })
  } catch (err) {
    const code = err instanceof CloudApiError ? err.code : null
    const offline = code === 'network' || (typeof navigator !== 'undefined' && !navigator.onLine)
    console.error('[nuvem] Falha no sync.', err)
    useCloudStore.setState(
      offline
        ? { phase: 'offline', error: null }
        : {
            phase: 'error',
            error: code === 'unauthorized' ? 'permission' : code === 'quota_exceeded' ? 'quota' : 'generic',
          },
    )
  }
}

const canSync = () => user !== null && engine !== null && isCloudLinked()

/** Busca e sobe agora. Chamadas seguidas antes de começar viram uma só. */
export function syncNow(): Promise<void> {
  if (!canSync()) return Promise.resolve()
  queuedSync ??= exclusive(async () => {
    queuedSync = null
    if (!canSync()) return
    lastSyncAt = Date.now()
    await guarded(() => engine!.sync())
  })
  return queuedSync
}

function pushNow(): Promise<void> {
  if (!canSync()) return Promise.resolve()
  return exclusive(async () => {
    if (canSync()) await guarded(() => engine!.push())
  })
}

function schedulePush() {
  if (pushTimer) clearTimeout(pushTimer)
  pushTimer = setTimeout(() => {
    pushTimer = null
    void pushNow()
  }, CLOUD_PUSH_DELAY_MS)
}

async function handleAuth(next: User | null) {
  const linked = getCloudSnapshot().profile
  if (!next) {
    user = null
    engine = null
    // Vinculado sem sessão não é logout: os dados ficam e as mudanças esperam o próximo login.
    useCloudStore.setState({ sessionExpired: linked !== null, phase: 'idle' })
    return
  }

  await exclusive(async () => {
    if (linked && linked.uid !== next.uid) {
      // Outra conta neste aparelho: os dados da anterior nunca entram nela.
      console.warn('[nuvem] Outra conta entrou; os dados da anterior saem do aparelho.')
      unlinkProfile()
      await wipeLocalData()
    }
    user = next
    engine = createCloudEngine(cloudApiRemote(currentIdToken), cloudLocal)
    useCloudStore.setState({ sessionExpired: false })
    if (getCloudSnapshot().profile) {
      updateProfile(toProfile(next))
      return
    }
    // Primeiro login: o que o aparelho já tinha passa a ser da conta.
    linkProfile(toProfile(next))
    try {
      await engine.scanLocal()
    } catch (err) {
      // Vinculado sem ter escaneado, o que já existia nunca subiria — e o logout apagaria.
      unlinkProfile()
      user = null
      engine = null
      throw err
    }
  })
  await syncNow()
}

function onAuthFailure(err: unknown) {
  console.error('[nuvem] Falha ao vincular a conta.', err)
  useCloudStore.setState({ phase: 'error', error: 'generic' })
}

/** Liga o sync (idempotente): ouve a sessão, as gravações locais e a volta ao app. */
export function startCloudSync(): void {
  if (started) return
  started = true
  watchAuth(next => { handleAuth(next).catch(onAuthFailure) })
  subscribeLocalChanges(schedulePush)
  window.addEventListener('online', () => void syncNow())
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && Date.now() - lastSyncAt > CLOUD_PULL_MIN_INTERVAL_MS) {
      void syncNow()
    }
  })
}

/** Abre o popup do Google. O vínculo e o primeiro sync seguem pelo `watchAuth`. */
export async function signIn(): Promise<void> {
  startCloudSync()
  await firebaseSignIn()
}

/**
 * Primeira metade do logout: grava o que esperava debounce e tenta subir tudo.
 * Devolve quantos itens a nuvem não tem como estão aqui (offline, grandes demais, sem registro).
 */
export async function prepareSignOut(): Promise<number> {
  await flushLocal()
  if (pushTimer) clearTimeout(pushTimer)
  pushTimer = null
  await Promise.race([
    pushNow(),
    new Promise(resolve => setTimeout(resolve, CLOUD_SIGN_OUT_TIMEOUT_MS)),
  ])
  return countUnsynced(cloudLocal)
}

/** Sai da conta e tira os dados dela do aparelho — desvincula **antes** de apagar. */
export async function signOutAndWipe(): Promise<void> {
  await exclusive(async () => {
    unlinkProfile()
    await wipeLocalData()
    user = null
    engine = null
    await signOutFirebase()
  })
  useCloudStore.setState({ phase: 'idle', error: null, sessionExpired: false, lastSyncAt: null })
}
