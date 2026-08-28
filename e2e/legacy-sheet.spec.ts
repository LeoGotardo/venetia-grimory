import { expect, test } from '@playwright/test'
import {
  createLegacyPtListItem,
  createLegacyPtSheet,
  createLegacySpellcasterSheet,
  seedRaw,
  seedSheet,
  setLegacyPtLanguage,
} from './helpers/storage'

const SHEET_ID = '33333333-3333-4333-8333-333333333333'
const PT_SHEET_ID = '55555555-5555-4555-8555-555555555555'

/**
 * Fichas salvas antes da separação de magias por classe não têm
 * `truques_por_classe` / `magias_por_classe`. Sem migração, a aba Magic
 * derrubava a página inteira com `Object.values(undefined)`.
 */
test.describe('Ficha em formato antigo', () => {
  test.beforeEach(async ({ page }) => {
    await seedSheet(page, { id: SHEET_ID, sheet: createLegacySpellcasterSheet() })
    await page.goto(`/ficha/${SHEET_ID}`)
    await expect(page.getByRole('heading', { name: 'Elowen Vento-Claro' })).toBeVisible()
  })

  test('a aba de magia abre sem quebrar a página', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))

    await page.getByRole('tab', { name: 'Magic' }).click()

    const panel = page.locator('#tabpanel-spells')
    await expect(panel).toBeVisible()
    await expect(panel).toContainText('Spell DC')
    await expect(panel).toContainText('Spell Slots')
    expect(errors).toEqual([])
  })

  test('truques e magias antigos continuam visíveis', async ({ page }) => {
    await page.getByRole('tab', { name: 'Magic' }).click()

    const panel = page.locator('#tabpanel-spells')
    await expect(panel).toContainText('Ray of Frost')
    await expect(panel).toContainText('Magic Missile')
  })

  test('espaços de magia continuam clicáveis', async ({ page }) => {
    await page.getByRole('tab', { name: 'Magic' }).click()

    const firstCircle = page.getByRole('group', { name: /Circle 1/i })
    await expect(firstCircle).toBeVisible()
    await firstCircle.getByRole('button').first().click()

    await expect(page.locator('#tabpanel-spells')).toBeVisible()
  })

  test('a aba de edição também abre', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))

    await page.getByRole('tab', { name: '✎ Edit' }).click()

    // EditPanel tem abas próprias, então escopa no painel principal
    await expect(page.locator('#tabpanel-edit')).toBeVisible()
    expect(errors).toEqual([])
  })
})

/**
 * Fichas salvas antes da renomeação dos campos de PT para EN. As chaves do
 * localStorage não mudaram, então elas continuam chegando ao app e precisam
 * passar por `translateLegacyPtSheet` antes de qualquer painel ler os campos.
 */
test.describe('Ficha em português (anterior à renomeação)', () => {
  test.beforeEach(async ({ page }) => {
    await seedRaw(page, {
      id: PT_SHEET_ID,
      sheetJson: JSON.stringify(createLegacyPtSheet()),
      itemJson: JSON.stringify(createLegacyPtListItem(PT_SHEET_ID, 'Bruenor Battlehammer')),
    })
  })

  test('a lista da home mostra nome, nível e classe da ficha antiga', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByTestId('sheet-card-name')).toHaveText('Bruenor Battlehammer')
    await expect(page.getByTestId('sheet-card')).toContainText('Level 3 Fighter · Human')
  })

  test('a ficha abre com identidade, PV e CA migrados', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))

    await page.goto(`/ficha/${PT_SHEET_ID}`)

    await expect(page.getByRole('heading', { name: 'Bruenor Battlehammer' })).toBeVisible()
    await expect(page.getByText('Fighter 3 — Champion')).toBeVisible()
    await expect(page.getByTestId('hp-current')).toHaveText('21')
    await expect(page.getByTestId('hp-max')).toHaveText('/ 28')
    await expect(page.getByTestId('ac-value')).toHaveText('12')
    expect(errors).toEqual([])
  })

  test('inventário e anotações migrados continuam legíveis', async ({ page }) => {
    await page.goto(`/ficha/${PT_SHEET_ID}`)

    await page.getByRole('tab', { name: 'Inventory' }).click()
    // O item migrado guarda `item_id: 'espada_longa'`; o nome exibido vem do
    // catálogo no idioma da UI (EN por padrão nos testes).
    await expect(page.locator('#tabpanel-inventory')).toContainText('Longsword')

    await page.getByRole('tab', { name: '✎ Edit' }).click()
    await expect(page.locator('#tabpanel-edit')).toBeVisible()
  })

  test('as preferências antigas (v0) mantêm o idioma escolhido', async ({ page }) => {
    await setLegacyPtLanguage(page, 'pt')
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Grimório de Venetia' })).toBeVisible()
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Grimório de Venetia' })).toBeVisible()
  })
})
