import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { Readable } from 'node:stream'
import type { IncomingMessage, Server } from 'node:http'

/**
 * Só no `npm run dev`: serve as funções de `api/` dentro do Vite, como a Vercel
 * faz no deploy — HTTP (`/api/rooms/<ação>`) e o WebSocket da sala, que o
 * `vercel dev` não repassa. Carrega o `.env.local` (DATABASE_URL, REDIS_URL)
 * no processo do servidor; nada disso chega ao bundle do navegador.
 */
function apiDevServer(): Plugin {
  return {
    name: 'venetia-api-dev',
    apply: 'serve',
    configureServer(server) {
      Object.assign(process.env, loadEnv('development', process.cwd(), ''))

      server.middlewares.use('/api/rooms', async (req, res) => {
        const request = toWebRequest(req)
        try {
          const mod = await server.ssrLoadModule('/api/rooms/[action].ts')
          const handler = mod[req.method ?? 'GET'] as ((r: Request) => Promise<Response> | Response) | undefined
          const response = handler ? await handler(request) : new Response(null, { status: 405 })
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
        if (!req.url?.startsWith('/api/room-ws')) return
        server.ssrLoadModule('/api/room-ws.ts')
          .then(mod => (mod.default as Server).emit('upgrade', req, socket, head))
          .catch(err => {
            console.error('[api dev] Falha no WebSocket da sala.', err)
            socket.destroy()
          })
      })
    },
  }
}

/** O `use('/api/rooms', …)` do connect corta o prefixo de `url`; o caminho inteiro fica em `originalUrl`. */
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
