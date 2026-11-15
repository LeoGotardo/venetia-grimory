// Empacota o processo principal e o preload do app desktop em `dist-electron/`
// (CommonJS, com o electron-updater dentro), mais o ícone da janela.
//
//   node scripts/desktop/build-electron.mjs [production|development]
//
// São dois builds porque o preload em sandbox não pode dar `require` num chunk
// compartilhado com o main: cada um sai num arquivo só. Tudo o que o main usa
// vai embutido, então o pacote não leva `node_modules` (ver electron-builder.yml).
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const mode = process.argv[2] ?? 'production'
const outDir = path.join(root, 'dist-electron')

async function bundle(entry, emptyOutDir) {
  await build({
    configFile: false,
    root,
    mode,
    publicDir: false,
    logLevel: 'warn',
    // Embute as dependências (electron-updater e as dele); só o Electron fica de fora.
    ssr: { noExternal: true, target: 'node' },
    build: {
      ssr: path.join(root, 'electron', `${entry}.ts`),
      outDir,
      emptyOutDir,
      target: 'node22',
      minify: false,
      sourcemap: false,
      rolldownOptions: {
        external: ['electron'],
        output: { format: 'cjs', entryFileNames: `${entry}.cjs` },
      },
    },
  })
}

await bundle('main', true)
await bundle('preload', false)
fs.copyFileSync(path.join(root, 'assets', 'icon-only.png'), path.join(outDir, 'icon.png'))

console.log(`desktop: dist-electron pronto (${mode})`)
