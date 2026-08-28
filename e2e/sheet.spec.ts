import { expect, test } from '@playwright/test'
import { createCompleteSheet, seedSheet } from './helpers/storage'

const SHEET_ID = '22222222-2222-4222-8222-222222222222'

test.describe('Ficha do personagem', () => {
  test.beforeEach(async ({ page }) => {
    await seedSheet(page, { id: SHEET_ID, sheet: createCompleteSheet() })
    await page.goto(`/ficha/${SHEET_ID}`)
    await expect(page.getByRole('heading', { name: 'Aria Sombravéu' })).toBeVisible()
  })

  test('mostra identidade e indicadores principais', async ({ page }) => {
    await expect(page.getByText('Fighter 3 — Champion')).toBeVisible()
    await expect(page.getByTestId('hp-current')).toHaveText('28')
    await expect(page.getByTestId('hp-max')).toHaveText('/ 28')
    await expect(page.getByText('900 / 2,700 XP')).toBeVisible()
  })

  test('aplica dano e cura nos pontos de vida', async ({ page }) => {
    const deltaField = page.getByLabel('HP delta')

    await deltaField.fill('10')
    await page.getByRole('button', { name: 'Apply damage' }).click()
    await expect(page.getByTestId('hp-current')).toHaveText('18')

    await deltaField.fill('5')
    await page.getByRole('button', { name: 'Apply healing' }).click()
    await expect(page.getByTestId('hp-current')).toHaveText('23')
  })

  test('PV não passa do máximo nem fica negativo', async ({ page }) => {
    const deltaField = page.getByLabel('HP delta')

    await deltaField.fill('999')
    await page.getByRole('button', { name: 'Apply damage' }).click()
    await expect(page.getByTestId('hp-current')).toHaveText('0')
    await expect(page.getByText('Unconscious')).toBeVisible()

    await deltaField.fill('999')
    await page.getByRole('button', { name: 'Apply healing' }).click()
    await expect(page.getByTestId('hp-current')).toHaveText('28')
  })

  test('ganhar XP libera o botão de subir de nível', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Level Up/ })).toBeHidden()

    await page.getByLabel('XP to gain').fill('1800')
    await page.getByRole('button', { name: '+ XP' }).click()

    await expect(page.getByText('2,700 / 2,700 XP')).toBeVisible()
    await expect(page.getByRole('button', { name: /Level Up/ })).toBeVisible()
  })

  test('alterna entre as abas da ficha', async ({ page }) => {
    await page.getByRole('tab', { name: 'Inventory' }).click()
    await expect(page.getByRole('tab', { name: 'Inventory' })).toHaveAttribute('aria-selected', 'true')
    await expect(page.getByRole('tabpanel')).toContainText('Inventory')

    await page.getByRole('tab', { name: 'Notes' }).click()
    await expect(page.getByRole('tab', { name: 'Notes' })).toHaveAttribute('aria-selected', 'true')

    await page.getByRole('tab', { name: '✎ Edit' }).click()
    await expect(page.getByRole('tab', { name: '✎ Edit' })).toHaveAttribute('aria-selected', 'true')
  })

  test('guerreiro não tem aba de magia', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Magic' })).toHaveCount(0)
  })

  test('alterações de PV persistem no localStorage', async ({ page }) => {
    await page.getByLabel('HP delta').fill('7')
    await page.getByRole('button', { name: 'Apply damage' }).click()
    await expect(page.getByTestId('hp-current')).toHaveText('21')

    // aguarda o debounce de salvamento (500ms) antes de recarregar
    await page.waitForTimeout(900)
    await page.reload()

    await expect(page.getByTestId('hp-current')).toHaveText('21')
  })

  test('id inexistente redireciona para a página 404', async ({ page }) => {
    await page.goto('/ficha/00000000-0000-4000-8000-000000000000')

    await expect(page.getByText('Error 404')).toBeVisible()
  })

  test('voltar leva para a lista de fichas', async ({ page }) => {
    await page.getByRole('button', { name: 'Sheets', exact: true }).click()

    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole('heading', { name: "Venetia's Grimoire" })).toBeVisible()
  })
})
