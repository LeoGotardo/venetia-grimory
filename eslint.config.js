import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // android/: build do Capacitor copia o bundle e o native-bridge.js gerado;
  // dist-electron/ e dist-desktop/: saída do build do app desktop
  globalIgnores(['dist', 'android', 'dist-electron', 'dist-desktop']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    // Processo principal e preload do Electron, e os scripts que os empacotam: Node.
    files: ['electron/**/*.ts', 'scripts/desktop/**/*.mjs'],
    languageOptions: {
      globals: globals.node,
    },
  },
])
