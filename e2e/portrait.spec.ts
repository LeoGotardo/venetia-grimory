import { expect, test } from '@playwright/test'
import { createCompleteSheet, seedSheet, setLanguage } from './helpers/storage'

const SHEET_ID = 'e2e-retrato'

test.describe('Retrato do personagem', () => {
  test.beforeEach(async ({ page }) => {
    await seedSheet(page, { id: SHEET_ID, sheet: createCompleteSheet() })
    await setLanguage(page, 'pt')
  })

  test('desenhado no aparelho, editado e salvo na ficha', async ({ page }, info) => {
    // Nada de imagem de terceiros: o rosto é desenhado aqui.
    const external: string[] = []
    page.on('request', req => { if (new URL(req.url()).hostname.endsWith('dicebear.com')) external.push(req.url()) })
    await page.goto(`/ficha/${SHEET_ID}`)

    // O desenho carrega sob demanda: até lá o avatar é só a cor de fundo.
    const avatar = page.getByTestId('ficha-retrato').locator('img')
    await expect(avatar).toHaveAttribute('src', /^data:image\/svg\+xml/)
    const before = await avatar.getAttribute('src')

    await page.getByTestId('ficha-retrato').click()
    const editor = page.getByRole('dialog', { name: 'Retrato' })
    await editor.getByRole('tab', { name: 'Fantasia' }).click()
    await editor.getByRole('group', { name: 'Chifres' }).getByRole('button', { name: 'Curvos' }).click()
    await expect(editor.getByRole('button', { name: 'Curvos' })).toHaveAttribute('aria-pressed', 'true')

    // Vários acessórios, um por lugar: o segundo óculos troca o primeiro; a auréola fica junto.
    await editor.getByRole('tab', { name: 'Extras' }).click()
    const accessories = editor.getByRole('group', { name: 'Acessórios' })
    await accessories.getByRole('button', { name: 'Óculos 1' }).click()
    await accessories.getByRole('button', { name: 'Óculos 2' }).click()
    await accessories.getByRole('button', { name: 'Auréola' }).click()
    await expect(accessories.getByRole('button', { name: 'Óculos 1' })).toHaveAttribute('aria-pressed', 'false')
    await expect(accessories.getByRole('button', { name: 'Óculos 2' })).toHaveAttribute('aria-pressed', 'true')
    await expect(accessories.getByRole('button', { name: 'Auréola' })).toHaveAttribute('aria-pressed', 'true')
    if (process.env.ROOM_SHOTS) {
      await page.waitForTimeout(300)
      await page.screenshot({ path: `${process.env.ROOM_SHOTS}/portrait-editor-${info.project.name}.png` })
      await editor.getByRole('tab', { name: 'Cabelo e barba' }).click()
      await page.waitForTimeout(300)
      await page.screenshot({ path: `${process.env.ROOM_SHOTS}/portrait-hair-${info.project.name}.png` })
    }
    await editor.getByRole('button', { name: 'Salvar retrato' }).click()

    await expect(editor).toBeHidden()
    const after = await avatar.getAttribute('src')
    expect(after).not.toBe(before)
    // Salvo na ficha: recarregar mostra o mesmo rosto.
    await page.reload()
    await expect(page.getByTestId('ficha-retrato').locator('img')).toHaveAttribute('src', after!)
    expect(external).toEqual([])
  })
})
