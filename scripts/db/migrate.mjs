// Aplica as migrações de db/migrations em ordem, cada uma numa transação, e
// anota em `schema_migrations` o que já entrou. Uso: `npm run db:migrate`
// (o dotenv-cli carrega o .env.local — as variáveis da integração são "Sensitive"
// e não vêm no `vercel env pull`: copie DATABASE_URL_UNPOOLED do painel da Neon).
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { Pool, neonConfig } from '@neondatabase/serverless'
import ws from 'ws'

const MIGRATIONS_DIR = join(import.meta.dirname, '..', '..', 'db', 'migrations')

// O Pool fala com a Neon por WebSocket; o Node 20 não tem WebSocket global.
neonConfig.webSocketConstructor = ws

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL
if (!url) {
  console.error('Defina DATABASE_URL_UNPOOLED (ou DATABASE_URL) no .env.local.')
  process.exit(1)
}

const pool = new Pool({ connectionString: url })
const client = await pool.connect()

try {
  await client.query(`create table if not exists schema_migrations (
    name text primary key,
    applied_at timestamptz not null default now()
  )`)
  const { rows } = await client.query('select name from schema_migrations')
  const applied = new Set(rows.map(r => r.name))
  const files = (await readdir(MIGRATIONS_DIR)).filter(f => f.endsWith('.sql')).sort()

  for (const file of files) {
    if (applied.has(file)) continue
    const sql = await readFile(join(MIGRATIONS_DIR, file), 'utf-8')
    await client.query('begin')
    try {
      await client.query(sql)
      await client.query('insert into schema_migrations (name) values ($1)', [file])
      await client.query('commit')
      console.log(`aplicada: ${file}`)
    } catch (err) {
      await client.query('rollback')
      throw new Error(`falhou em ${file}: ${err.message}`, { cause: err })
    }
  }
  console.log('migrações em dia')
} catch (err) {
  console.error(err)
  process.exitCode = 1
} finally {
  client.release()
  await pool.end()
}
