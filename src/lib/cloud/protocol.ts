import { z } from 'zod'
import { CLOUD_DOC_MAX_BYTES, CLOUD_PUSH_BATCH_MAX } from './constants.js'
import { CLOUD_KINDS, ISO_TIMESTAMP } from './sync.js'

/**
 * Contrato entre o app e `api/sync/<ação>`. O servidor valida tudo o que
 * recebe; o cliente valida a resposta. Autenticação: ID token do Firebase no
 * `Authorization: Bearer` — o uid sai do token validado, nunca do corpo.
 */

const kindSchema = z.enum(CLOUD_KINDS)
/** Ids do app são uuids; a folga aceita qualquer id sem `:` nem `/`. */
const idSchema = z.string().regex(/^[A-Za-z0-9_-]{1,80}$/)
const timestampSchema = z.string().regex(ISO_TIMESTAMP)

export const remoteDocSchema = z.object({
  kind: kindSchema,
  id: idSchema,
  data: z.string().nullable(),
  updated_at: timestampSchema,
  seq: z.number().int().nonnegative(),
})

export const pullRequest = z.object({ since: z.number().int().nonnegative() })
export const pullResponse = z.object({ docs: z.array(remoteDocSchema), more: z.boolean() })

export const pushItemSchema = z.object({
  kind: kindSchema,
  id: idSchema,
  data: z.string().max(CLOUD_DOC_MAX_BYTES).nullable(),
  updated_at: timestampSchema,
})
export type PushItem = z.infer<typeof pushItemSchema>

export const pushRequest = z.object({
  items: z.array(pushItemSchema).min(1).max(CLOUD_PUSH_BATCH_MAX)
    // O mesmo registro duas vezes num lote quebraria o upsert do Postgres.
    .refine(items => new Set(items.map(i => `${i.kind}:${i.id}`)).size === items.length),
})

/** `written`: gravados. `conflicts`: a nuvem tinha versão mais nova — vai a de lá. */
export const pushResponse = z.object({
  written: z.array(z.object({ kind: kindSchema, id: idSchema })),
  conflicts: z.array(remoteDocSchema),
})
export type PushResponse = z.infer<typeof pushResponse>

/** Erros que a API devolve em `{ error }`. */
export const CLOUD_ERRORS = ['invalid_request', 'unauthorized', 'rate_limited', 'quota_exceeded', 'server_error'] as const
export type CloudErrorCode = typeof CLOUD_ERRORS[number]
export const cloudErrorResponse = z.object({ error: z.enum(CLOUD_ERRORS) })
