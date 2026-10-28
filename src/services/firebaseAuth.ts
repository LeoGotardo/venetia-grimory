import { initializeApp, type FirebaseApp } from 'firebase/app'
import {
  GoogleAuthProvider,
  getAuth,
  indexedDBLocalPersistence,
  initializeAuth,
  onAuthStateChanged,
  signInWithCredential,
  signInWithPopup,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth'
import { firebaseConfig, googleWebClientId } from '../lib/cloud/config'
import { GoogleSignIn } from '../lib/googleSignIn'
import { isApp } from '../lib/platform'
import type { CloudProfile } from './cloudState'

/**
 * Único arquivo que fala com o Firebase, e só para o login: os dados ficam no
 * Neon, atrás de `api/sync`, que confere o ID token emitido aqui.
 *
 * No navegador o login é o popup do Google. No app o popup não funciona (o
 * Google bloqueia OAuth em WebView): a conta é escolhida no seletor nativo
 * (`GoogleSignIn`) e o ID token do Google entra por `signInWithCredential`.
 */

let app: FirebaseApp | null = null
let auth: Auth | null = null

function firebaseAuth(): Auth {
  if (!auth) {
    const config = firebaseConfig()
    if (!config) throw new Error('[conta] Firebase sem configuração (VITE_FIREBASE_*).')
    app = initializeApp(config)
    // No app, sem o resolver de popup/redirect: ele carrega um iframe do authDomain
    // que a WebView não precisa (e que pode travar a inicialização).
    auth = isApp() ? initializeAuth(app, { persistence: indexedDBLocalPersistence }) : getAuth(app)
  }
  return auth
}

export function toProfile(user: User): CloudProfile {
  return { uid: user.uid, email: user.email, name: user.displayName, photo: user.photoURL }
}

export function watchAuth(listener: (user: User | null) => void): () => void {
  return onAuthStateChanged(firebaseAuth(), listener)
}

export async function signInWithGoogle(): Promise<void> {
  if (isApp()) {
    const serverClientId = googleWebClientId()
    if (!serverClientId) throw new Error('[conta] VITE_GOOGLE_WEB_CLIENT_ID ausente no build do app.')
    const { idToken } = await GoogleSignIn.signIn({ serverClientId })
    await signInWithCredential(firebaseAuth(), GoogleAuthProvider.credential(idToken))
    return
  }
  const provider = new GoogleAuthProvider()
  // Deixa trocar de conta Google em vez de entrar direto na última usada.
  provider.setCustomParameters({ prompt: 'select_account' })
  await signInWithPopup(firebaseAuth(), provider)
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

/** Código do erro do Firebase (`auth/popup-closed-by-user`, …), se houver. */
export function firebaseErrorCode(err: unknown): string | null {
  return typeof err === 'object' && err !== null && 'code' in err && typeof err.code === 'string' ? err.code : null
}
