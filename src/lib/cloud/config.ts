import { isApp } from '../platform'

/**
 * Config web do Firebase, das variáveis `VITE_FIREBASE_*` (`.env`; na Vercel,
 * as do projeto). Não é segredo — vai no bundle por natureza; quem protege os
 * dados é `api/sync`, que só aceita o ID token da própria conta.
 */
export interface FirebaseWebConfig {
  apiKey: string
  authDomain: string
  projectId: string
  appId: string
  storageBucket?: string
  messagingSenderId?: string
}

export function firebaseConfig(): FirebaseWebConfig | null {
  const env = import.meta.env
  const apiKey = env.VITE_FIREBASE_API_KEY as string | undefined
  const authDomain = env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined
  const projectId = env.VITE_FIREBASE_PROJECT_ID as string | undefined
  const appId = env.VITE_FIREBASE_APP_ID as string | undefined
  // Build sem as variáveis (CI, testes, forks): a conta simplesmente não existe.
  if (!apiKey || !authDomain || !projectId || !appId) return null
  return {
    apiKey,
    authDomain,
    projectId,
    appId,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  }
}

/**
 * "Web client ID" do provedor Google no Firebase (`VITE_GOOGLE_WEB_CLIENT_ID`).
 * Só o app precisa: o login nativo pede o ID token para este cliente, que é o
 * que o Firebase aceita.
 */
export function googleWebClientId(): string | null {
  return (import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID as string | undefined) || null
}

/** No app, a conta também precisa do client ID do login nativo; sem ele o botão some. */
export function isCloudAvailable(): boolean {
  if (firebaseConfig() === null) return false
  return !isApp() || googleWebClientId() !== null
}
