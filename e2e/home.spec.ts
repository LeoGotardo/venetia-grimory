import { expect, test } from '@playwright/test'
import { createCompleteSheet, setLanguage, readList, seedSheet } from './helpers/storage'

const SHEET_ID = '11111111-1111-4111-8111-111111111111'

test.describe('Home', () => {
  test('mostra o herói e o estado vazio sem fichas salvas', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: "Venetia's Grimoire" })).toBeVisible()
    await expect(page.getByText('Character Creator · compatible with fifth edition (2024)')).toBeVisible()
    await expect(page.getByText('No characters saved yet.')).toBeVisible()
    await expect(page.getByTestId('sheet-card')).toHaveCount(0)
  })

  test('botão de criar leva ao assistente', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Create Character' }).click()

    await expect(page).toHaveURL(/\/novo$/)
    await expect(page.getByRole('heading', { name: 'Starting Level' })).toBeVisible()
  })

  test('lista a ficha salva com nome, nível e classe', async ({ page }) => {
    const sheet = createCompleteSheet()
    await seedSheet(page, { id: SHEET_ID, sheet })
    await page.goto('/')

    const card = page.getByTestId('sheet-card')
    await expect(card).toHaveCount(1)
    await expect(page.getByTestId('sheet-card-name')).toHaveText('Aria Sombravéu')
    await expect(card).toContainText('Level 3 Fighter · Human')
    await expect(card.getByRole('button', { name: 'Open Sheet' })).toBeVisible()
  })

  test('abre a ficha salva ao clicar em Open Sheet', async ({ page }) => {
    const sheet = createCompleteSheet()
    await seedSheet(page, { id: SHEET_ID, sheet })
    await page.goto('/')

    await page.getByRole('button', { name: 'Open Sheet' }).click()

    await expect(page).toHaveURL(new RegExp(`/ficha/${SHEET_ID}$`))
    await expect(page.getByRole('heading', { name: 'Aria Sombravéu' })).toBeVisible()
  })

  test('ficha incompleta volta para o assistente', async ({ page }) => {
    const sheet = createCompleteSheet()
    await seedSheet(page, { id: SHEET_ID, sheet, complete: false })
    await page.goto('/')

    await expect(page.getByTestId('sheet-card')).toContainText('In creation')
    await page.getByRole('button', { name: 'Continue Creation' }).click()

    await expect(page).toHaveURL(/\/novo$/)
  })

  test('excluir remove a ficha do localStorage', async ({ page }) => {
    const sheet = createCompleteSheet()
    await seedSheet(page, { id: SHEET_ID, sheet })
    await page.goto('/')

    page.on('dialog', dialog => dialog.accept())
    await page.getByRole('button', { name: 'Delete Aria Sombravéu' }).click()

    await expect(page.getByTestId('sheet-card')).toHaveCount(0)
    await expect(page.getByText('No characters saved yet.')).toBeVisible()
    expect(await readList(page)).toHaveLength(0)
  })

  test('troca o idioma pelo modal de configurações', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Settings' }).click()

    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()
    await modal.getByRole('button', { name: 'PT' }).click()

    await expect(page.getByRole('heading', { name: 'Grimório de Venetia' })).toBeVisible()
    await expect(page.getByText('Criador de Personagens · compatível com a 5ª edição (2024)')).toBeVisible()
  })

  test('configurações em abas: preferências e sobre, com os links legais', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Settings' }).click()

    const modal = page.getByRole('dialog')
    await expect(modal.getByRole('tab', { name: 'Preferences' })).toHaveAttribute('aria-selected', 'true')
    // Sem Firebase configurado (CI, testes) não há aba de conta.
    await expect(modal.getByRole('tab', { name: 'Account' })).toHaveCount(0)

    await modal.getByRole('tab', { name: 'Preferences' }).press('ArrowRight')
    await expect(modal.getByRole('tab', { name: 'About' })).toHaveAttribute('aria-selected', 'true')
    await modal.getByRole('link', { name: 'Privacy policy' }).click()
    await expect(page).toHaveURL(/\/privacidade$/)
  })

  test('idioma persiste entre recarregamentos', async ({ page }) => {
    await setLanguage(page, 'pt')
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Grimório de Venetia' })).toBeVisible()
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Grimório de Venetia' })).toBeVisible()
  })

  test('rota inexistente mostra a página 404', async ({ page }) => {
    await page.goto('/rota-que-nao-existe')

    await expect(page.getByText('Error 404')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible()

    await page.getByRole('button', { name: 'Go to Grimoire' }).click()
    await expect(page).toHaveURL(/\/$/)
  })

  test('rodapé leva à tela de licenças com a atribuição do SRD', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('link-sobre').click()

    await expect(page).toHaveURL(/\/sobre$/)
    await expect(page.getByRole('heading', { name: 'About & licenses' })).toBeVisible()
    await expect(page.getByTestId('sobre-srd')).toContainText('System Reference Document 5.2.1')

    await page.getByRole('button', { name: 'Back' }).click()
    await expect(page).toHaveURL(/\/$/)
  })

  test('rodapé leva aos termos de uso, com os prazos das salas', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('link-termos').click()

    await expect(page).toHaveURL(/\/termos$/)
    await expect(page.getByRole('heading', { name: 'Terms of use', level: 1 })).toBeVisible()
    await expect(page.getByText(/Closed rooms are deleted after 7 days/)).toBeVisible()
  })

  test('rodapé leva à política de privacidade, com os prazos das salas', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('link-privacidade').click()

    await expect(page).toHaveURL(/\/privacidade$/)
    await expect(page.getByRole('heading', { name: 'Privacy policy', level: 1 })).toBeVisible()
    await expect(page.getByText(/Closed rooms are deleted after 7 days/)).toBeVisible()
    await expect(page.getByRole('link', { name: 'ANPD' })).toHaveAttribute('href', 'https://www.gov.br/anpd')
  })
})
