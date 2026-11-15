// Gera os instaladores do app desktop em dist-desktop/:
//
//   npm run desktop:dist                # o sistema atual (Linux: AppImage + deb)
//   npm run desktop:dist -- --win       # Windows (NSIS; no Linux precisa do wine)
//   npm run desktop:dist -- --dir       # só a pasta desempacotada, para testar rápido
//
// A versão é a da primeira entrada de src/data/releaseNotes.json — a mesma que
// o bundle mostra como "novidades" — ou DESKTOP_VERSION (o release.yml passa a
// da tag). O package.json fica em 0.0.0; sem isto o latest.yml sairia 0.0.0 e
// o electron-updater nunca acharia uma versão nova.
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const args = process.argv.slice(2)

const notes = JSON.parse(fs.readFileSync(path.join(root, 'src/data/releaseNotes.json'), 'utf8'))
const version = (process.env.DESKTOP_VERSION || notes[0]?.version || '').replace(/^v/, '')
if (!/^\d+\.\d+\.\d+$/.test(version)) {
  console.error(`desktop: versão inválida '${version}' — confira src/data/releaseNotes.json ou DESKTOP_VERSION`)
  process.exit(1)
}

function run(command, commandArgs) {
  console.log(`> ${command} ${commandArgs.join(' ')}`)
  const result = spawnSync(command, commandArgs, { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' })
  if (result.status !== 0) process.exit(result.status ?? 1)
}

run('npm', ['run', 'build'])
run('node', ['scripts/desktop/build-electron.mjs', 'production'])
run('npx', ['electron-builder', '--publish', 'never', `-c.extraMetadata.version=${version}`, ...args])
