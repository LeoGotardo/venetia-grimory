import { createRemoteJWKSet, errors, jwtVerify } from 'jose'

/**
 * Confere o ID token do Firebase sem SDK nem service account: é um JWT RS256
 * assinado pelas chaves públicas do Google, com `aud` = id do projeto e `sub` = uid.
 * As chaves ficam em cache na instância (`createRemoteJWKSet` respeita o Cache-Control).
 */

const GOOGLE_KEYS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'),
)

/** Folga para relógios desencontrados entre o Google e a função. */
const CLOCK_TOLERANCE_S = 60

function projectId(): string {
  // O mesmo valor que o app usa; o id do projeto não é segredo.
  const id = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID
  if (!id) throw new Error('FIREBASE_PROJECT_ID (ou VITE_FIREBASE_PROJECT_ID) não definida.')
  return id
}

/** uid de quem mandou o token, ou `null` se ele não vale. Falha ao buscar as chaves lança (vira 500, não 401). */
export async function verifyFirebaseToken(token: string | null): Promise<string | null> {
  const id = projectId()
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, GOOGLE_KEYS, {
      issuer: `https://securetoken.google.com/${id}`,
      audience: id,
      algorithms: ['RS256'],
      clockTolerance: CLOCK_TOLERANCE_S,
    })
    const uid = payload.sub
    const authTime = payload.auth_time
    if (typeof uid !== 'string' || uid.length === 0 || uid.length > 128) return null
    if (typeof authTime !== 'number' || authTime > Date.now() / 1000 + CLOCK_TOLERANCE_S) return null
    return uid
  } catch (err) {
    if (err instanceof errors.JWKSTimeout || !(err instanceof errors.JOSEError)) throw err
    return null
  }
}
