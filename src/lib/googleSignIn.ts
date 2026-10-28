import { registerPlugin } from '@capacitor/core'

/**
 * Login com Google nativo do app Android — o lado nativo é
 * android/.../GoogleSignInPlugin.java (Credential Manager). Devolve o ID token
 * do Google, que o Firebase JS troca pela sessão com `signInWithCredential`.
 * Erros chegam com `code`: `cancelled`, `no_credential` (nenhuma conta Google
 * no aparelho), `invalid` ou `failed`.
 */
interface GoogleSignInPlugin {
  signIn(options: { serverClientId: string }): Promise<{ idToken: string }>
  signOut(): Promise<void>
}

export const GoogleSignIn = registerPlugin<GoogleSignInPlugin>('GoogleSignIn')
