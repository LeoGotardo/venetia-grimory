import { expect, test } from '@playwright/test'
import { WizardPage } from './helpers/wizard'
import { lerLista } from './helpers/storage'

test.describe('Criação completa de personagem', () => {
  test.slow()

  test('percorre os 13 passos e abre a ficha criada', async ({ page }) => {
    const wizard = new WizardPage(page)
    const id = await wizard.criarGuerreiroNivel3('Aria Sombravéu')

    expect(id).toMatch(/^[0-9a-f-]{36}$/)

    await expect(page.getByRole('heading', { name: 'Aria Sombravéu' })).toBeVisible()
    await expect(page.getByText('Fighter 3 — Champion')).toBeVisible()
    await expect(page.getByText('Human', { exact: true })).toBeVisible()
    await expect(page.getByText('Soldier', { exact: true })).toBeVisible()
  })

  test('valores derivados batem com as escolhas do assistente', async ({ page }) => {
    const wizard = new WizardPage(page)
    await wizard.criarGuerreiroNivel3()

    // FOR 15 +2 (antecedente) = 17 · CON 13 +1 = 14 (mod +2)
    // PV guerreiro nível 3 = (10 + 2) + 2 × (6 + 2) = 28
    await expect(page.getByTestId('pv-atual')).toHaveText('28')
    await expect(page.getByTestId('pv-maximo')).toHaveText('/ 28')

    // CA sem armadura = 10 + mod DES (14 → +2) = 12
    await expect(page.getByTestId('ca-valor')).toHaveText('12')

    // Bônus de proficiência do nível 3
    await expect(page.getByTestId('stat-Proficiency')).toContainText('+2')
  })

  test('a ficha criada fica salva e aparece na home', async ({ page }) => {
    const wizard = new WizardPage(page)
    const id = await wizard.criarGuerreiroNivel3('Thorin Pedra-Firme')

    await page.getByRole('button', { name: 'Sheets', exact: true }).click()
    await expect(page).toHaveURL(/\/$/)

    await expect(page.getByTestId('ficha-card-nome')).toHaveText('Thorin Pedra-Firme')
    await expect(page.getByTestId('ficha-card')).not.toContainText('In creation')

    const lista = await lerLista(page)
    expect(lista).toHaveLength(1)
    expect(lista[0]).toMatchObject({
      id,
      nome: 'Thorin Pedra-Firme',
      classe: 'guerreiro',
      especie: 'humano',
      nivel: 3,
      completa: true,
    })
  })

  test('a ficha sobrevive a um recarregamento da página', async ({ page }) => {
    const wizard = new WizardPage(page)
    const id = await wizard.criarGuerreiroNivel3()

    await page.reload()

    await expect(page).toHaveURL(new RegExp(`/ficha/${id}$`))
    await expect(page.getByRole('heading', { name: 'Aria Sombravéu' })).toBeVisible()
    await expect(page.getByTestId('pv-atual')).toHaveText('28')
  })
})
