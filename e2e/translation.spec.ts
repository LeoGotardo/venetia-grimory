import { expect, test } from '@playwright/test'
import { criarFichaCompleta, criarFichaLegadaConjuradora, definirIdioma, semearFicha } from './helpers/storage'
import { WizardPage } from './helpers/wizard'

const ID_FICHA = '44444444-4444-4444-8444-444444444444'

test.describe('Tradução dos dados de jogo', () => {
  test('classes e complexidade aparecem em inglês', async ({ page }) => {
    const wizard = new WizardPage(page)
    await wizard.abrir()
    await wizard.proximo()

    await expect(page.getByRole('heading', { name: 'Fighter', exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Wizard', exact: true })).toBeVisible()
    await expect(page.getByText('A Master of All Weapons and Armor')).toBeVisible()
  })

  test('classes aparecem em português quando a língua é PT', async ({ page }) => {
    await definirIdioma(page, 'pt')
    const wizard = new WizardPage(page)
    await page.goto('/novo')
    await page.getByRole('button', { name: 'Próximo' }).click()

    await expect(page.getByRole('heading', { name: 'Guerreiro', exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Mago', exact: true })).toBeVisible()
    expect(wizard).toBeTruthy()
  })

  test('subclasses, perícias e idiomas seguem o idioma', async ({ page }) => {
    const wizard = new WizardPage(page)
    await wizard.abrir()
    await wizard.definirNivel(3)
    await wizard.proximo()
    await wizard.escolherCard('Fighter')
    await wizard.proximo()

    // subclasses e estilos de luta
    await expect(page.getByRole('heading', { name: 'Champion', exact: true })).toBeVisible()
    await expect(page.getByText('Defense', { exact: true })).toBeVisible()
    await wizard.escolherCard('Champion')
    await wizard.escolherOpcao('Defense')
    await wizard.proximo()

    // espécies
    await expect(page.getByRole('heading', { name: 'Human', exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Dragonborn', exact: true })).toBeVisible()
    await wizard.escolherCard('Human')
    await wizard.proximo()

    // atributos
    await expect(page.getByText('Strength', { exact: true })).toBeVisible()
    await expect(page.getByText('Charisma', { exact: true })).toBeVisible()
    await wizard.distribuirConjuntoPadrao()
    await wizard.proximo()

    await wizard.escolherCard('Soldier')
    await wizard.distribuirBonusAntecedente({ FOR: 2, CON: 1 })
    await wizard.proximo()
    await wizard.proximo() // multiclasse

    // perícias
    await expect(page.getByRole('button', { name: /^Acrobatics/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /^History/ })).toBeVisible()
    await wizard.escolherPericias(['Acrobatics', 'History'])
    await wizard.proximo()
    await wizard.proximo() // magias — guerreiro não conjura

    // idiomas
    await expect(page.getByRole('button', { name: /^Draconic/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /^Elvish/ })).toBeVisible()
  })

  test('a ficha traduz classe, espécie e antecedente', async ({ page }) => {
    await semearFicha(page, { id: ID_FICHA, ficha: criarFichaCompleta() })
    await page.goto(`/ficha/${ID_FICHA}`)

    await expect(page.getByText('Fighter 3 — Champion')).toBeVisible()
    await expect(page.getByText('Human', { exact: true })).toBeVisible()
    await expect(page.getByText('Soldier', { exact: true })).toBeVisible()
  })

  test('trocar o idioma na ficha re-traduz os dados', async ({ page }) => {
    await semearFicha(page, { id: ID_FICHA, ficha: criarFichaCompleta() })
    await page.goto(`/ficha/${ID_FICHA}`)
    await expect(page.getByText('Fighter 3 — Champion')).toBeVisible()

    await page.getByRole('button', { name: 'Settings' }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'PT' }).click()
    await page.getByRole('button', { name: 'Fechar modal' }).click()

    await expect(page.getByText('Guerreiro 3 — Campeão')).toBeVisible()
  })

  test('condições da aba de anotações são traduzidas', async ({ page }) => {
    await semearFicha(page, { id: ID_FICHA, ficha: criarFichaCompleta() })
    await page.goto(`/ficha/${ID_FICHA}`)
    await page.getByRole('tab', { name: 'Notes' }).click()

    await expect(page.getByRole('button', { name: /Frightened/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /Poisoned/ })).toBeVisible()
  })
})

test.describe('Informativo das magias selecionadas', () => {
  test.beforeEach(async ({ page }) => {
    await semearFicha(page, { id: ID_FICHA, ficha: criarFichaLegadaConjuradora() })
    await page.goto(`/ficha/${ID_FICHA}`)
    await page.getByRole('tab', { name: 'Magic' }).click()
  })

  test('mostra círculo, escola e demais dados de cada magia', async ({ page }) => {
    const painel = page.locator('#tabpanel-magia')

    const truque = painel.getByRole('button', { name: /Ray of Frost/ })
    await expect(truque).toBeVisible()
    await expect(truque).toContainText('Cantrip')
    await expect(truque).toContainText('Evocation')

    const magia = painel.getByRole('button', { name: /Magic Missile/ })
    await expect(magia).toBeVisible()
    await expect(magia).toContainText('1º Circle')
  })

  test('clicar abre a ficha completa da magia', async ({ page }) => {
    await page.locator('#tabpanel-magia').getByRole('button', { name: /Magic Missile/ }).click()

    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()
    await expect(modal.getByRole('heading', { name: 'Magic Missile' })).toBeVisible()
    await expect(modal).toContainText('Casting Time')
    await expect(modal).toContainText('Range')
  })

  test('os nomes salvos em PT continuam resolvendo depois da troca de idioma', async ({ page }) => {
    // a ficha foi semeada com nomes em português
    await expect(page.locator('#tabpanel-magia').getByRole('button', { name: /Magic Missile/ })).toBeVisible()

    await page.getByRole('button', { name: 'Settings' }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'PT' }).click()
    await page.getByRole('button', { name: 'Fechar modal' }).click()

    await expect(page.locator('#tabpanel-magia').getByRole('button', { name: /Mísseis Mágicos/ })).toBeVisible()
  })
})
