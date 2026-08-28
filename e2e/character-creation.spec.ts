import { expect, test } from '@playwright/test'
import { WizardPage } from './helpers/wizard'
import { readList } from './helpers/storage'

test.describe('Criação completa de personagem', () => {
  test.slow()

  test('percorre os 13 passos e abre a ficha criada', async ({ page }) => {
    const wizard = new WizardPage(page)
    const id = await wizard.createLevel3Fighter('Aria Sombravéu')

    expect(id).toMatch(/^[0-9a-f-]{36}$/)

    await expect(page.getByRole('heading', { name: 'Aria Sombravéu' })).toBeVisible()
    await expect(page.getByText('Fighter 3 — Champion')).toBeVisible()
    await expect(page.getByText('Human', { exact: true })).toBeVisible()
    await expect(page.getByText('Soldier', { exact: true })).toBeVisible()
  })

  test('valores derivados batem com as escolhas do assistente', async ({ page }) => {
    const wizard = new WizardPage(page)
    await wizard.createLevel3Fighter()

    // FOR 15 +2 (antecedente) = 17 · CON 13 +1 = 14 (mod +2)
    // PV guerreiro nível 3 = (10 + 2) + 2 × (6 + 2) = 28
    await expect(page.getByTestId('hp-current')).toHaveText('28')
    await expect(page.getByTestId('hp-max')).toHaveText('/ 28')

    // CA sem armadura = 10 + mod DES (14 → +2) = 12
    await expect(page.getByTestId('ac-value')).toHaveText('12')

    // Bônus de proficiência do nível 3
    await expect(page.getByTestId('stat-Proficiency')).toContainText('+2')
  })

  test('a ficha criada fica salva e aparece na home', async ({ page }) => {
    const wizard = new WizardPage(page)
    const id = await wizard.createLevel3Fighter('Thorin Pedra-Firme')

    await page.getByRole('button', { name: 'Sheets', exact: true }).click()
    await expect(page).toHaveURL(/\/$/)

    await expect(page.getByTestId('sheet-card-name')).toHaveText('Thorin Pedra-Firme')
    await expect(page.getByTestId('sheet-card')).not.toContainText('In creation')

    const list = await readList(page)
    expect(list).toHaveLength(1)
    expect(list[0]).toMatchObject({
      id,
      name: 'Thorin Pedra-Firme',
      charClass: 'guerreiro',
      species: 'humano',
      level: 3,
      complete: true,
    })
  })

  test('a ficha sobrevive a um recarregamento da página', async ({ page }) => {
    const wizard = new WizardPage(page)
    const id = await wizard.createLevel3Fighter()

    await page.reload()

    await expect(page).toHaveURL(new RegExp(`/ficha/${id}$`))
    await expect(page.getByRole('heading', { name: 'Aria Sombravéu' })).toBeVisible()
    await expect(page.getByTestId('hp-current')).toHaveText('28')
  })
})
