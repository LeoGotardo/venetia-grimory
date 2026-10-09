import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { Readable } from 'node:stream'
import fs from 'node:fs'
import type { IncomingMessage, Server } from 'node:http'

/**
 * Só no `npm run dev`: serve as funções de `api/` dentro do Vite, como a Vercel
 * faz no deploy — HTTP e o WebSocket da sala, que o `vercel dev` não repassa.
 * Carrega o `.env.local` (DATABASE_URL, REDIS_URL) no processo do servidor;
 * nada disso chega ao bundle do navegador.
 */
function apiDevServer(): Plugin {
  return {
    name: 'venetia-api-dev',
    apply: 'serve',
    configureServer(server) {
      Object.assign(process.env, loadEnv('development', process.cwd(), ''))

      server.middlewares.use('/api', async (req, res, next) => {
        const file = resolveApiFile(new URL(req.originalUrl ?? '/', 'http://localhost').pathname)
        if (!file) return next()
        try {
          const mod = await server.ssrLoadModule(file)
          const handler = mod[req.method ?? 'GET'] as ((r: Request) => Promise<Response> | Response) | undefined
          const response = handler ? await handler(toWebRequest(req)) : new Response(null, { status: 405 })
          res.statusCode = response.status
          response.headers.forEach((value, key) => res.setHeader(key, value))
          res.end(Buffer.from(await response.arrayBuffer()))
        } catch (err) {
          server.ssrFixStacktrace(err as Error)
          console.error('[api dev] Falha na função.', err)
          res.statusCode = 500
          res.end()
        }
      })

      server.httpServer?.on('upgrade', (req, socket, head) => {
        const file = req.url?.startsWith('/api/') ? resolveApiFile(new URL(req.url, 'http://localhost').pathname) : null
        if (!file) return
        server.ssrLoadModule(file)
          .then(mod => (mod.default as Server).emit('upgrade', req, socket, head))
          .catch(err => {
            console.error('[api dev] Falha no WebSocket.', err)
            socket.destroy()
          })
      })
    },
  }
}

/**
 * Arquivo da função para o caminho, com a resolução da Vercel: `/api/a/b` é
 * `api/a/b.ts` ou, se não existir, o `[param].ts` da pasta (`api/rooms/[action].ts`).
 */
function resolveApiFile(pathname: string): string | null {
  const parts = pathname.split('/').filter(Boolean)
  let dir = path.resolve(__dirname)
  for (const [i, part] of parts.entries()) {
    if (part.startsWith('_') || part.startsWith('.')) return null
    if (i < parts.length - 1) {
      dir = path.join(dir, part)
      if (!fs.existsSync(dir)) return null
      continue
    }
    const direct = path.join(dir, `${part}.ts`)
    if (fs.existsSync(direct)) return direct
    const dynamic = fs.readdirSync(dir).find(name => /^\[[^\]]+\]\.ts$/.test(name))
    return dynamic ? path.join(dir, dynamic) : null
  }
  return null
}

/** O `use('/api', …)` do connect corta o prefixo de `url`; o caminho inteiro fica em `originalUrl`. */
function toWebRequest(req: IncomingMessage & { originalUrl?: string }): Request {
  const url = `http://${req.headers.host ?? 'localhost'}${req.originalUrl ?? req.url ?? '/'}`
  const hasBody = req.method !== 'GET' && req.method !== 'HEAD'
  return new Request(url, {
    method: req.method,
    headers: req.headers as Record<string, string>,
    body: hasBody ? (Readable.toWeb(req) as ReadableStream) : undefined,
    // Exigido pelo Node para corpo em stream.
    duplex: 'half',
  })
}

export default defineConfig({
  plugins: [react(), tailwindcss(), apiDevServer()],
  server: { host: true },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
