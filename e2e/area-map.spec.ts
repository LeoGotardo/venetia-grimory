import { expect, test } from '@playwright/test'

test.describe('Mapa de área', () => {
  test('cria um mapa de área, coloca um stamp e ele sobrevive ao reload', async ({ page }, testInfo) => {
    // Fluxo longo, e o Pixel 5 emulado (DPR 2,75) renderiza WebGL bem mais devagar — pior ainda
    // com a suíte inteira rodando em paralelo.
    test.setTimeout(120_000)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/mestre')
    await page.getByRole('textbox', { name: 'Campaign name' }).fill('Mesa')
    await page.getByRole('button', { name: 'New campaign' }).click()
    await page.getByRole('tab', { name: /Maps/ }).click()

    await page.getByTestId('mapa-tipo-area').click()
    await expect(page.getByTestId('aviso-beta')).toContainText('In beta')
    await page.getByTestId('mapa-nome').fill('Vale')
    await page.getByTestId('mapa-criar').click()
    await expect(page).toHaveURL(/\/area\//)

    const canvas = page.getByTestId('area-canvas')
    // O Pixi inicializa o WebGL de forma assíncrona; com a suíte em paralelo isso passa dos 5 s padrão.
    await expect(canvas).toBeVisible({ timeout: 20_000 })
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
    await expect(page.getByText('Oak', { exact: true }).last()).toBeVisible({ timeout: 15_000 })

    // Caminho e pincelada: arrastar desenha, soltar grava um elemento cada.
    const drag = async (from: [number, number], to: [number, number]) => {
      await page.mouse.move(box.x + box.width * from[0], box.y + box.height * from[1])
      await page.mouse.down()
      await page.mouse.move(box.x + box.width * to[0], box.y + box.height * to[1], { steps: 12 })
      await page.mouse.up()
    }
    await page.getByTestId('area-tool-path').click()
    await drag([0.3, 0.3], [0.7, 0.35])
    await page.getByTestId('area-tool-brush').click()
    await expect(status).toContainText('Drag to paint')
    await drag([0.3, 0.7], [0.6, 0.75])
    await page.keyboard.press('Escape')
    await expect(status).toContainText('3 elements')

    // Ícone do game-icons.
    await page.getByTestId('assets-icon').click()
    await page.getByTestId('icone-city').click()
    await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.3)
    await page.keyboard.press('Escape')
    await expect(status).toContainText('4 elements')

    await page.reload()
    await expect(page.locator('[aria-live=polite]')).toContainText('4 elements', { timeout: 20_000 })

    // Exportar baixa um PNG no desktop (no celular a imagem vai pela folha de compartilhamento).
    if (testInfo.project.name === 'desktop') {
      await page.getByTestId('area-exportar-abrir').click()
      const download = page.waitForEvent('download')
      await page.getByTestId('area-exportar').click()
      expect((await download).suggestedFilename()).toBe('Vale.png')
    }
  })
})
