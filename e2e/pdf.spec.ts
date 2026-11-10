import { readFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'
import { PDFDocument } from 'pdf-lib'
import { createCompleteSheet, seedSheet } from './helpers/storage'

const SHEET_ID = '33333333-3333-4333-8333-333333333333'

test.describe('Ficha em PDF', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    // No celular o PDF sai pela folha de compartilhamento, que o navegador de teste não tem.
    test.skip(testInfo.project.name === 'mobile', 'entrega por Web Share')
    await seedSheet(page, { id: SHEET_ID, sheet: createCompleteSheet() })
    await page.goto(`/ficha/${SHEET_ID}`)
    await expect(page.getByRole('heading', { name: 'Aria Sombravéu' })).toBeVisible()
  })

  for (const [option, fields] of [
    ['Filled PDF', 0],
    ['PDF to print', 1],
  ] as const) {
    test(`baixa a ficha própria em duas páginas A4 (${option})`, async ({ page }) => {
      await page.getByRole('button', { name: 'Export' }).click()
      const download = page.waitForEvent('download')
      await page.getByRole('menuitem', { name: new RegExp(option) }).click()

      const file = await (await download).path()
      const pdf = await PDFDocument.load(await readFile(file))
      expect(pdf.getPageCount()).toBe(2)
      expect(Math.round(pdf.getPage(0).getWidth())).toBe(595)
      // export sai sem formulário; print, com os campos editáveis.
      expect(pdf.getForm().getFields().length > 0).toBe(fields > 0)
      expect(pdf.getTitle()).toContain('Aria Sombravéu')
    })
  }
})
