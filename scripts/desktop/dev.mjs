// App desktop em desenvolvimento: o Vite (com a api/ local, como no npm run dev)
// e o Electron apontando para ele. Fechar a janela encerra os dois.
//
//   npm run desktop:dev            # servidor do Vite, com hot reload
//   npm run desktop:dev -- --dist  # o dist/ já gerado, pelo protocolo app:// do pacote
//
// Mudanças em electron/ pedem reiniciar este comando.
import { spawn, spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import electronPath from 'electron'
import { createServer } from 'vite'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const useDist = process.argv.includes('--dist')

const built = spawnSync(process.execPath, ['scripts/desktop/build-electron.mjs', 'development'], { cwd: root, stdio: 'inherit' })
if (built.status !== 0) process.exit(built.status ?? 1)

let server = null
const env = { ...process.env }
if (!useDist) {
  server = await createServer({ root, server: { strictPort: false } })
  await server.listen()
  env.VITE_DEV_SERVER_URL = server.resolvedUrls?.local[0] ?? `http://localhost:${server.config.server.port}/`
  console.log(`desktop: Vite em ${env.VITE_DEV_SERVER_URL}`)
}

const child = spawn(electronPath, [path.join(root, 'dist-electron/main.cjs')], { cwd: root, env, stdio: 'inherit' })
child.on('exit', async code => {
  await server?.close()
  process.exit(code ?? 0)
})
