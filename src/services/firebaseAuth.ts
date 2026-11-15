import { initializeApp, type FirebaseApp } from 'firebase/app'
import {
  GoogleAuthProvider,
  browserPopupRedirectResolver,
  deleteUser,
  getAuth,
  indexedDBLocalPersistence,
  inMemoryPersistence,
  initializeAuth,
  onAuthStateChanged,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  signInWithCredential,
  signInWithPopup,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth'
import i18n from '../i18n'
import { firebaseConfig, googleWebClientId } from '../lib/cloud/config'
import { GoogleSignIn } from '../lib/googleSignIn'
import { desktopBridge, isApp } from '../lib/platform'
import type { CloudProfile } from './cloudState'

/**
 * Único arquivo que fala com o Firebase, e só para o login: os dados ficam no
 * Neon, atrás de `api/sync`, que confere o ID token emitido aqui.
 *
 * No navegador o login é o popup do Google. No app o popup não funciona (o
 * Google bloqueia OAuth em WebView): a conta é escolhida no seletor nativo
 * (`GoogleSignIn`) e o ID token do Google entra por `signInWithCredential`. No
 * app desktop é igual, mas o token vem do navegador do sistema: a página
 * `/entrar-desktop` do site faz o popup (`googleIdTokenForDesktop`) e o devolve
 * ao processo principal do Electron (`electron/browserSignIn.ts`).
 */

let app: FirebaseApp | null = null
let auth: Auth | null = null

function firebaseAuth(): Auth {
  if (!auth) {
    const config = firebaseConfig()
    if (!config) throw new Error('[conta] Firebase sem configuração (VITE_FIREBASE_*).')
    app = initializeApp(config)
    // No app e no desktop, sem o resolver de popup/redirect: ele carrega um iframe
    // do authDomain que eles não usam (e que pode travar a inicialização).
    auth = usesTokenSignIn() ? initializeAuth(app, { persistence: indexedDBLocalPersistence }) : getAuth(app)
  }
  return auth
}

export function toProfile(user: User): CloudProfile {
  return { uid: user.uid, email: user.email, name: user.displayName, photo: user.photoURL }
}

export function watchAuth(listener: (user: User | null) => void): () => void {
  return onAuthStateChanged(firebaseAuth(), listener)
}

/** App ou desktop: o ID token do Google chega por fora do Firebase, sem popup. */
function usesTokenSignIn(): boolean {
  return isApp() || desktopBridge() !== null
}

/** Erro do login no desktop com o mesmo `code` que o plugin do Android devolve. */
class DesktopSignInError extends Error {
  readonly code: string

  constructor(code: string) {
    super(`[conta] Login no desktop: ${code}`)
    this.code = code
  }
}

/** No desktop: a página de login do site no navegador do sistema; o processo principal devolve o ID token. */
async function desktopGoogleCredential() {
  const desktop = desktopBridge()
  if (!desktop) throw new DesktopSignInError('failed')
  const result = await desktop.signInWithGoogle({
    lang: i18n.language,
    title: i18n.t('account.desktopBrowserTitle'),
    done: i18n.t('account.desktopBrowserDone'),
    failed: i18n.t('account.desktopBrowserFailed'),
  })
  if (!result.ok) throw new DesktopSignInError(result.code)
  return GoogleAuthProvider.credential(result.idToken)
}

/** No app: a conta escolhida no seletor nativo, como credencial do Firebase. No desktop, a do navegador. */
async function nativeGoogleCredential() {
  if (desktopBridge()) return desktopGoogleCredential()
  const serverClientId = googleWebClientId()
  if (!serverClientId) throw new Error('[conta] VITE_GOOGLE_WEB_CLIENT_ID ausente no build do app.')
  const { idToken } = await GoogleSignIn.signIn({ serverClientId })
  return GoogleAuthProvider.credential(idToken)
}

function googleProvider(): GoogleAuthProvider {
  const provider = new GoogleAuthProvider()
  // Deixa trocar de conta Google em vez de entrar direto na última usada.
  provider.setCustomParameters({ prompt: 'select_account' })
  return provider
}

export async function signInWithGoogle(): Promise<void> {
  if (usesTokenSignIn()) {
    await signInWithCredential(firebaseAuth(), await nativeGoogleCredential())
    return
  }
  await signInWithPopup(firebaseAuth(), googleProvider())
}

let handoffAuth: Auth | null = null

/**
 * Instância à parte, só na memória, para a página `/entrar-desktop`. A conta
 * escolhida ali pode não ser a que este navegador tem vinculada: entrar com ela
 * na instância padrão trocaria a sessão do site, e uma conta diferente apaga os
 * dados da anterior neste navegador (`handleAuth`).
 */
function desktopHandoffAuth(): Auth {
  if (!handoffAuth) {
    const config = firebaseConfig()
    if (!config) throw new Error('[conta] Firebase sem configuração (VITE_FIREBASE_*).')
    handoffAuth = initializeAuth(initializeApp(config, 'desktop-sign-in'), {
      persistence: inMemoryPersistence,
      popupRedirectResolver: browserPopupRedirectResolver,
    })
  }
  return handoffAuth
}

/** Prepara a instância antes do clique, para o popup abrir sem demora (e sem ser bloqueado). */
export function prepareDesktopHandoff(): void {
  desktopHandoffAuth()
}

/**
 * Página `/entrar-desktop`, no navegador: o popup do Google, como no site, e
 * devolve o ID token do Google (o mesmo tipo que o seletor do Android dá) para
 * o app desktop trocar pela sessão. A sessão desta instância acaba aqui.
 */
export async function googleIdTokenForDesktop(): Promise<string> {
  const handoff = desktopHandoffAuth()
  try {
    const result = await signInWithPopup(handoff, googleProvider())
    const idToken = GoogleAuthProvider.credentialFromResult(result)?.idToken
    if (!idToken) throw new Error('[conta] O Google não devolveu o ID token.')
    return idToken
  } finally {
    await signOut(handoff).catch(() => undefined)
  }
}

/** Há sessão do Firebase agora (vinculado com a sessão expirada não conta). */
export function hasFirebaseSession(): boolean {
  return firebaseAuth().currentUser !== null
}

/**
 * Pede a conta Google de novo antes de uma ação sensível: o Firebase só apaga
 * um usuário com login recente. Outra conta escolhida lança `auth/user-mismatch`.
 */
export async function reauthenticateWithGoogle(): Promise<void> {
  const current = firebaseAuth().currentUser
  if (!current) throw new Error('[conta] Sem sessão para confirmar a identidade.')
  if (usesTokenSignIn()) {
    await reauthenticateWithCredential(current, await nativeGoogleCredential())
    return
  }
  await reauthenticateWithPopup(current, googleProvider())
}

/** Apaga o usuário do Firebase (a sessão acaba junto) e, no app, a conta lembrada pelo seletor. */
export async function deleteFirebaseUser(): Promise<void> {
  const current = firebaseAuth().currentUser
  if (current) await deleteUser(current)
  if (!isApp()) return
  await GoogleSignIn.signOut().catch(err => console.error('[conta] Falha ao limpar a conta do Google.', err))
}

export async function signOutFirebase(): Promise<void> {
  await signOut(firebaseAuth())
  if (!isApp()) return
  // Sem isto o seletor nativo pularia direto para a última conta no próximo login.
  await GoogleSignIn.signOut().catch(err => console.error('[conta] Falha ao limpar a conta do Google.', err))
}

/** ID token da sessão atual — o Firebase renova sozinho quando está para expirar. */
export async function currentIdToken(): Promise<string | null> {
  return (await firebaseAuth().currentUser?.getIdToken()) ?? null
}

/** Fechou o popup ou o seletor, ou abriu outro por cima: não é erro para mostrar. */
const CANCELLED_CODES = new Set(['auth/popup-closed-by-user', 'auth/cancelled-popup-request', 'auth/user-cancelled', 'cancelled'])

export function isCancelledSignIn(code: string | null): boolean {
  return code !== null && CANCELLED_CODES.has(code)
}

/** Código do erro do Firebase (`auth/popup-closed-by-user`, …), se houver. */
export function firebaseErrorCode(err: unknown): string | null {
  return typeof err === 'object' && err !== null && 'code' in err && typeof err.code === 'string' ? err.code : null
}
