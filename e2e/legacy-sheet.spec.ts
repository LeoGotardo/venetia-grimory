import { expect, test } from '@playwright/test'
import { criarFichaLegadaConjuradora, semearFicha } from './helpers/storage'

const ID_FICHA = '33333333-3333-4333-8333-333333333333'

/**
 * Fichas salvas antes da separação de magias por classe não têm
 * `truques_por_classe` / `magias_por_classe`. Sem migração, a aba Magic
 * derrubava a página inteira com `Object.values(undefined)`.
 */
test.describe('Ficha em formato antigo', () => {
  test.beforeEach(async ({ page }) => {
    await semearFicha(page, { id: ID_FICHA, ficha: criarFichaLegadaConjuradora() })
    await page.goto(`/ficha/${ID_FICHA}`)
    await expect(page.getByRole('heading', { name: 'Elowen Vento-Claro' })).toBeVisible()
  })

  test('a aba de magia abre sem quebrar a página', async ({ page }) => {
    const erros: string[] = []
    page.on('pageerror', erro => erros.push(erro.message))

    await page.getByRole('tab', { name: 'Magic' }).click()

    const painel = page.locator('#tabpanel-magia')
    await expect(painel).toBeVisible()
    await expect(painel).toContainText('Spell DC')
    await expect(painel).toContainText('Spell Slots')
    expect(erros).toEqual([])
  })

  test('truques e magias antigos continuam visíveis', async ({ page }) => {
    await page.getByRole('tab', { name: 'Magic' }).click()

    const painel = page.locator('#tabpanel-magia')
    await expect(painel).toContainText('Ray of Frost')
    await expect(painel).toContainText('Magic Missile')
  })

  test('espaços de magia continuam clicáveis', async ({ page }) => {
    await page.getByRole('tab', { name: 'Magic' }).click()

    const primeiroCirculo = page.getByRole('group', { name: /Circle 1/i })
    await expect(primeiroCirculo).toBeVisible()
    await primeiroCirculo.getByRole('button').first().click()

    await expect(page.locator('#tabpanel-magia')).toBeVisible()
  })

  test('a aba de edição também abre', async ({ page }) => {
    const erros: string[] = []
    page.on('pageerror', erro => erros.push(erro.message))

    await page.getByRole('tab', { name: '✎ Edit' }).click()

    // PainelEditar tem abas próprias, então escopa no painel principal
    await expect(page.locator('#tabpanel-editar')).toBeVisible()
    expect(erros).toEqual([])
  })
})
