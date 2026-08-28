import { expect, test } from '@playwright/test'
import { createCompleteSheet, createLegacySpellcasterSheet, setLanguage, seedSheet } from './helpers/storage'
import { WizardPage } from './helpers/wizard'

const SHEET_ID = '44444444-4444-4444-8444-444444444444'

test.describe('Tradução dos dados de jogo', () => {
  test('classes e complexidade aparecem em inglês', async ({ page }) => {
    const wizard = new WizardPage(page)
    await wizard.open()
    await wizard.next()

    await expect(page.getByRole('heading', { name: 'Fighter', exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Wizard', exact: true })).toBeVisible()
    await expect(page.getByText('A Master of All Weapons and Armor')).toBeVisible()
  })

  test('classes aparecem em português quando a língua é PT', async ({ page }) => {
    await setLanguage(page, 'pt')
    const wizard = new WizardPage(page)
    await page.goto('/novo')
    await page.getByRole('button', { name: 'Próximo' }).click()

    await expect(page.getByRole('heading', { name: 'Guerreiro', exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Mago', exact: true })).toBeVisible()
    expect(wizard).toBeTruthy()
  })

  test('subclasses, perícias e idiomas seguem o idioma', async ({ page }) => {
    const wizard = new WizardPage(page)
    await wizard.open()
    await wizard.setLevel(3)
    await wizard.next()
    await wizard.chooseCard('Fighter')
    await wizard.next()

    // subclasses e estilos de luta
    await expect(page.getByRole('heading', { name: 'Champion', exact: true })).toBeVisible()
    await expect(page.getByText('Defense', { exact: true })).toBeVisible()
    await wizard.chooseCard('Champion')
    await wizard.chooseOption('Defense')
    await wizard.next()

    // espécies
    await expect(page.getByRole('heading', { name: 'Human', exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Dragonborn', exact: true })).toBeVisible()
    await wizard.chooseCard('Human')
    await wizard.next()

    // atributos
    await expect(page.getByText('Strength', { exact: true })).toBeVisible()
    await expect(page.getByText('Charisma', { exact: true })).toBeVisible()
    await wizard.assignStandardArray()
    await wizard.next()

    await wizard.chooseCard('Soldier')
    await wizard.assignBackgroundBonus({ FOR: 2, CON: 1 })
    await wizard.next()
    await wizard.next() // multiclasse

    // perícias
    await expect(page.getByRole('button', { name: /^Acrobatics/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /^History/ })).toBeVisible()
    await wizard.chooseSkills(['Acrobatics', 'History'])
    await wizard.next()
    await wizard.next() // magias — guerreiro não conjura

    // idiomas
    await expect(page.getByRole('button', { name: /^Draconic/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /^Elvish/ })).toBeVisible()
  })

  test('a ficha traduz classe, espécie e antecedente', async ({ page }) => {
    await seedSheet(page, { id: SHEET_ID, sheet: createCompleteSheet() })
    await page.goto(`/ficha/${SHEET_ID}`)

    await expect(page.getByText('Fighter 3 — Champion')).toBeVisible()
    await expect(page.getByText('Human', { exact: true })).toBeVisible()
    await expect(page.getByText('Soldier', { exact: true })).toBeVisible()
  })

  test('trocar o idioma na ficha re-traduz os dados', async ({ page }) => {
    await seedSheet(page, { id: SHEET_ID, sheet: createCompleteSheet() })
    await page.goto(`/ficha/${SHEET_ID}`)
    await expect(page.getByText('Fighter 3 — Champion')).toBeVisible()

    await page.getByRole('button', { name: 'Settings' }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'PT' }).click()
    await page.getByRole('button', { name: 'Fechar modal' }).click()

    await expect(page.getByText('Guerreiro 3 — Campeão')).toBeVisible()
  })

  test('condições da aba de anotações são traduzidas', async ({ page }) => {
    await seedSheet(page, { id: SHEET_ID, sheet: createCompleteSheet() })
    await page.goto(`/ficha/${SHEET_ID}`)
    await page.getByRole('tab', { name: 'Notes' }).click()

    await expect(page.getByRole('button', { name: /Frightened/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /Poisoned/ })).toBeVisible()
  })
})

test.describe('Informativo das magias selecionadas', () => {
  test.beforeEach(async ({ page }) => {
    await seedSheet(page, { id: SHEET_ID, sheet: createLegacySpellcasterSheet() })
    await page.goto(`/ficha/${SHEET_ID}`)
    await page.getByRole('tab', { name: 'Magic' }).click()
  })

  test('mostra círculo, escola e demais dados de cada magia', async ({ page }) => {
    const panel = page.locator('#tabpanel-spells')

    const cantrip = panel.getByRole('button', { name: /Ray of Frost/ })
    await expect(cantrip).toBeVisible()
    await expect(cantrip).toContainText('Cantrip')
    await expect(cantrip).toContainText('Evocation')

    const spell = panel.getByRole('button', { name: /Magic Missile/ })
    await expect(spell).toBeVisible()
    await expect(spell).toContainText('1º Circle')
  })

  test('clicar abre a ficha completa da magia', async ({ page }) => {
    await page.locator('#tabpanel-spells').getByRole('button', { name: /Magic Missile/ }).click()

    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()
    await expect(modal.getByRole('heading', { name: 'Magic Missile' })).toBeVisible()
    await expect(modal).toContainText('Casting Time')
    await expect(modal).toContainText('Range')
  })

  test('os nomes salvos em PT continuam resolvendo depois da troca de idioma', async ({ page }) => {
    // a ficha foi semeada com nomes em português
    await expect(page.locator('#tabpanel-spells').getByRole('button', { name: /Magic Missile/ })).toBeVisible()

    await page.getByRole('button', { name: 'Settings' }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'PT' }).click()
    await page.getByRole('button', { name: 'Fechar modal' }).click()

    await expect(page.locator('#tabpanel-spells').getByRole('button', { name: /Mísseis Mágicos/ })).toBeVisible()
  })
})
