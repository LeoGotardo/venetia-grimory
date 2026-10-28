import type { z } from 'zod'
import { CLOUD_HTTP_TIMEOUT_MS } from '../constants'
import {
  cloudErrorResponse,
  pullResponse,
  pushResponse,
  type CloudErrorCode,
} from '../lib/cloud/protocol'
import type { RemoteDoc } from '../lib/cloud/sync'
import type { CloudRemote } from './cloudEngine'
import { roomApiBase } from './roomApi'

/** Falha da API de sync; `network` = sem resposta do servidor. */
export class CloudApiError extends Error {
  readonly code: CloudErrorCode | 'network'

  constructor(code: CloudErrorCode | 'network') {
    super(code)
    this.code = code
  }
}

async function call<T>(action: 'pull' | 'push', body: unknown, schema: z.ZodType<T>, token: string): Promise<T> {
  let response: Response
  try {
    // Mesma API das salas: mesma origem na web, domínio de produção no app.
    response = await fetch(`${roomApiBase()}/api/sync/${action}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(CLOUD_HTTP_TIMEOUT_MS),
    })
  } catch (err) {
    console.error(`[nuvem] ${action}: sem resposta do servidor.`, err)
    throw new CloudApiError('network')
  }

  const data: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const failure = cloudErrorResponse.safeParse(data)
    if (!failure.success) console.error(`[nuvem] ${action}: HTTP ${response.status} sem código de erro.`)
    throw new CloudApiError(failure.success ? failure.data.error : 'server_error')
  }
  const parsed = schema.safeParse(data)
  if (!parsed.success) {
    console.error(`[nuvem] ${action}: resposta fora do contrato.`, parsed.error)
    throw new CloudApiError('server_error')
  }
  return parsed.data
}

/** A nuvem da conta logada, pela API de sync no Neon. `token` devolve o ID token atual. */
export function cloudApiRemote(token: () => Promise<string | null>): CloudRemote {
  async function requireToken(): Promise<string> {
    const value = await token()
    if (!value) throw new CloudApiError('unauthorized')
    return value
  }

  return {
    async pull(since) {
      // A resposta tem teto de tamanho: o servidor pagina, e aqui junta as páginas.
      const docs: RemoteDoc[] = []
      let cursor = since
      for (;;) {
        const page = await call('pull', { since: cursor }, pullResponse, await requireToken())
        docs.push(...page.docs)
        if (!page.more || page.docs.length === 0) return docs
        cursor = page.docs[page.docs.length - 1].seq
      }
    },

    async push(items) {
      return call('push', { items }, pushResponse, await requireToken())
    },
  }
}
