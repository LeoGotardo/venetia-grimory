import { defineConfig } from 'vitest/config'
import path from 'path'

/**
 * Os testes cobrem a camada pura (regras, recálculo, catálogo) e as ações da
 * store — nada de DOM, por isso `environment: 'node'`. O único pedaço de browser
 * que a cadeia de imports toca é o `localStorage` lido pelo `configStore` na
 * inicialização do i18n, resolvido pelo setup.
 */
export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    setupFiles: ['./vitest.setup.ts'],
  },
})
