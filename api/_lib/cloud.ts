import {
  CLOUD_PULL_PAGE_BYTES, CLOUD_PULL_PAGE_MAX, CLOUD_USER_MAX_BYTES, CLOUD_USER_MAX_RECORDS,
} from '../../src/lib/cloud/constants.js'
import type { CloudErrorCode, PushItem, PushResponse } from '../../src/lib/cloud/protocol.js'
import type { CloudKind, RemoteDoc } from '../../src/lib/cloud/sync.js'
import { toIso } from './db.js'

/**
 * Leitura e escrita dos registros da conta no Neon. Recebe o executor SQL
 * (o `db()` do app; outro nos testes) e o uid já validado pelo token.
 */

type Row = Record<string, unknown>
export type Sql = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<Row[]>

/** Falha esperada do sync: vira `{ error }` com o status certo. */
export class CloudFailure extends Error {
  readonly code: CloudErrorCode

  constructor(code: CloudErrorCode) {
    super(code)
    this.code = code
  }
}

function toDoc(row: Row): RemoteDoc {
  return {
    kind: row.kind as CloudKind,
    id: String(row.id),
    data: row.data == null ? null : String(row.data),
    updated_at: toIso(row.updated_at),
    // bigint chega como texto pelo driver.
    seq: Number(row.seq),
  }
}

/**
 * Uma página do que mudou depois de `since`, em ordem de `seq`. O teto é de
 * bytes e de linhas; a primeira linha vem sempre, por maior que seja.
 */
export async function pullRecords(sql: Sql, uid: string, since: number): Promise<{ docs: RemoteDoc[]; more: boolean }> {
  const rows = await sql`
    select kind, id, data, updated_at, seq, total from (
      select kind, id, data, updated_at, seq,
             row_number() over w as rn,
             sum(coalesce(octet_length(data), 0)) over w as running,
             count(*) over () as total
      from cloud_records
      where user_id = ${uid} and seq > ${since}::bigint
      window w as (order by seq rows between unbounded preceding and current row)
    ) page
    where rn = 1 or (running <= ${CLOUD_PULL_PAGE_BYTES} and rn <= ${CLOUD_PULL_PAGE_MAX})
    order by seq`
  const total = rows.length > 0 ? Number(rows[0].total) : 0
  return { docs: rows.map(toDoc), more: rows.length < total }
}

/** Recusa o lote se, depois dele, a conta passaria da cota (o que ele substitui não conta duas vezes). */
async function checkQuota(sql: Sql, uid: string, items: PushItem[]): Promise<void> {
  const kinds = items.map(i => i.kind)
  const ids = items.map(i => i.id)
  const rows = await sql`
    select coalesce(sum(octet_length(data)) filter (where not replaced), 0)::bigint as bytes,
           count(*) filter (where not replaced)::int as records
    from (
      select data, (kind, id) in (select k, i from unnest(${kinds}::text[], ${ids}::text[]) as u(k, i)) as replaced
      from cloud_records where user_id = ${uid}
    ) mine`
  const incoming = items.reduce((sum, i) => sum + (i.data === null ? 0 : Buffer.byteLength(i.data)), 0)
  if (Number(rows[0].bytes) + incoming > CLOUD_USER_MAX_BYTES) throw new CloudFailure('quota_exceeded')
  if (Number(rows[0].records) + items.length > CLOUD_USER_MAX_RECORDS) throw new CloudFailure('quota_exceeded')
}

/**
 * Grava o lote numa instrução só. A linha de `cloud_users` sobe `version` em
 * `n` e fica travada até o fim: os `seq` do lote são `version - n + 1 … version`,
 * únicos e em ordem de confirmação dentro da conta. Cada registro só é
 * substituído se o `updated_at` dele não for mais velho que o da nuvem; os que
 * perderam voltam em `conflicts` com a versão de lá.
 */
export async function pushRecords(sql: Sql, uid: string, items: PushItem[]): Promise<PushResponse> {
  await checkQuota(sql, uid, items)
  const n = items.length
  const written = await sql`
    with v as (
      insert into cloud_users (user_id, version) values (${uid}, ${n}::bigint)
      on conflict (user_id) do update set version = cloud_users.version + ${n}::bigint, updated_at = now()
      returning version
    ), input as (
      select * from unnest(
        ${items.map(i => i.kind)}::text[],
        ${items.map(i => i.id)}::text[],
        ${items.map(i => i.data)}::text[],
        ${items.map(i => i.updated_at)}::timestamptz[]
      ) with ordinality as t(kind, id, data, updated_at, n)
    )
    insert into cloud_records (user_id, kind, id, data, updated_at, seq)
    select ${uid}, input.kind, input.id, input.data, input.updated_at, v.version - ${n}::bigint + input.n
    from input cross join v
    on conflict (user_id, kind, id) do update
      set data = excluded.data, updated_at = excluded.updated_at, seq = excluded.seq
      where cloud_records.updated_at <= excluded.updated_at
    returning kind, id`

  const done = new Set(written.map(r => `${r.kind}:${r.id}`))
  const lost = items.filter(i => !done.has(`${i.kind}:${i.id}`))
  const conflicts = lost.length === 0 ? [] : await sql`
    select kind, id, data, updated_at, seq from cloud_records
    where user_id = ${uid}
      and (kind, id) in (select k, i from unnest(${lost.map(i => i.kind)}::text[], ${lost.map(i => i.id)}::text[]) as u(k, i))`

  return {
    written: written.map(r => ({ kind: r.kind as CloudKind, id: String(r.id) })),
    conflicts: conflicts.map(toDoc),
  }
}
