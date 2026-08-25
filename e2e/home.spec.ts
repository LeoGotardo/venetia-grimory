import { expect, test } from '@playwright/test'
import { criarFichaCompleta, definirIdioma, lerLista, semearFicha } from './helpers/storage'

const ID_FICHA = '11111111-1111-4111-8111-111111111111'

test.describe('Home', () => {
  test('mostra o herói e o estado vazio sem fichas salvas', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: "Venetia's Grimoire" })).toBeVisible()
    await expect(page.getByText('D&D 5.5 (2024) Character Creator')).toBeVisible()
    await expect(page.getByText('No characters saved yet.')).toBeVisible()
    await expect(page.getByTestId('ficha-card')).toHaveCount(0)
  })

  test('botão de criar leva ao assistente', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Create Character' }).click()

    await expect(page).toHaveURL(/\/novo$/)
    await expect(page.getByRole('heading', { name: 'Starting Level' })).toBeVisible()
  })

  test('lista a ficha salva com nome, nível e classe', async ({ page }) => {
    const ficha = criarFichaCompleta()
    await semearFicha(page, { id: ID_FICHA, ficha })
    await page.goto('/')

    const card = page.getByTestId('ficha-card')
    await expect(card).toHaveCount(1)
    await expect(page.getByTestId('ficha-card-nome')).toHaveText('Aria Sombravéu')
    await expect(card).toContainText('Level 3 Fighter · Human')
    await expect(card.getByRole('button', { name: 'Open Sheet' })).toBeVisible()
  })

  test('abre a ficha salva ao clicar em Open Sheet', async ({ page }) => {
    const ficha = criarFichaCompleta()
    await semearFicha(page, { id: ID_FICHA, ficha })
    await page.goto('/')

    await page.getByRole('button', { name: 'Open Sheet' }).click()

    await expect(page).toHaveURL(new RegExp(`/ficha/${ID_FICHA}$`))
    await expect(page.getByRole('heading', { name: 'Aria Sombravéu' })).toBeVisible()
  })

  test('ficha incompleta volta para o assistente', async ({ page }) => {
    const ficha = criarFichaCompleta()
    await semearFicha(page, { id: ID_FICHA, ficha, completa: false })
    await page.goto('/')

    await expect(page.getByTestId('ficha-card')).toContainText('In creation')
    await page.getByRole('button', { name: 'Continue Creation' }).click()

    await expect(page).toHaveURL(/\/novo$/)
  })

  test('excluir remove a ficha do localStorage', async ({ page }) => {
    const ficha = criarFichaCompleta()
    await semearFicha(page, { id: ID_FICHA, ficha })
    await page.goto('/')

    page.on('dialog', dialog => dialog.accept())
    await page.getByRole('button', { name: 'Delete Aria Sombravéu' }).click()

    await expect(page.getByTestId('ficha-card')).toHaveCount(0)
    await expect(page.getByText('No characters saved yet.')).toBeVisible()
    expect(await lerLista(page)).toHaveLength(0)
  })

  test('troca o idioma pelo modal de configurações', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Settings' }).click()

    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()
    await modal.getByRole('button', { name: 'PT' }).click()

    await expect(page.getByRole('heading', { name: 'Grimório de Venetia' })).toBeVisible()
    await expect(page.getByText('Criador de Personagens D&D 5.5 (2024)')).toBeVisible()
  })

  test('idioma persiste entre recarregamentos', async ({ page }) => {
    await definirIdioma(page, 'pt')
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
})
