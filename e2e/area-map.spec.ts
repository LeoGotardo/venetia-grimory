import { expect, test } from '@playwright/test'

test.describe('Mapa de área', () => {
  test('cria um mapa de área, coloca um stamp e ele sobrevive ao reload', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/mestre')
    await page.getByRole('textbox', { name: 'Campaign name' }).fill('Mesa')
    await page.getByRole('button', { name: 'New campaign' }).click()
    await page.getByRole('tab', { name: /Maps/ }).click()

    await page.getByTestId('mapa-tipo-area').click()
    await page.getByTestId('mapa-nome').fill('Vale')
    await page.getByTestId('mapa-criar').click()
    await expect(page).toHaveURL(/\/area\//)

    const canvas = page.getByTestId('area-canvas')
    await expect(canvas).toBeVisible()
    const status = page.locator('[aria-live=polite]')
    await expect(status).toContainText('0 elements')

    await page.getByTestId('asset-oak').click()
    const box = (await canvas.boundingBox())!
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
    await expect(status).toContainText('Oak')
    // Esc sai da ferramenta de colocar; o status volta a contar os elementos.
    await page.keyboard.press('Escape')
    await expect(status).toContainText('1 element')

    // Selecionar o stamp mostra as propriedades dele.
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
    await expect(page.getByText('Oak', { exact: true }).last()).toBeVisible()

    await page.reload()
    await expect(page.locator('[aria-live=polite]')).toContainText('1 element')
  })
})
