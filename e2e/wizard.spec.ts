import { expect, test } from '@playwright/test'
import { WizardPage } from './helpers/wizard'
import { lerLista } from './helpers/storage'

test.describe('Assistente de criação — navegação e validações', () => {
  test('abre no passo 1 de 13', async ({ page }) => {
    const wizard = new WizardPage(page)
    await wizard.abrir()

    await expect(wizard.indicadorDePasso).toHaveText('Step 1 of 13')
    await expect(wizard.botaoVoltar).toBeDisabled()
  })

  test('ajusta o nível pelos botões e pela tabela de XP', async ({ page }) => {
    const wizard = new WizardPage(page)
    await wizard.abrir()

    await wizard.definirNivel(5)
    await expect(page.getByTestId('nivel-valor')).toHaveText('5')

    await page.getByRole('row', { name: /^12\s/ }).click()
    await expect(page.getByTestId('nivel-valor')).toHaveText('12')

    // nível não passa de 20
    await wizard.definirNivel(20)
    await page.getByRole('button', { name: 'Increase level' }).click()
    await expect(page.getByTestId('nivel-valor')).toHaveText('20')
  })

  test('bloqueia o avanço enquanto a classe não for escolhida', async ({ page }) => {
    const wizard = new WizardPage(page)
    await wizard.abrir()
    await wizard.proximo()

    await expect(page.getByRole('heading', { name: 'Class', exact: true })).toBeVisible()
    await expect(wizard.botaoProximo).toBeDisabled()

    await wizard.escolherCard('Wizard')
    await expect(page.getByText('Hit die:')).toBeVisible()
    await expect(wizard.botaoProximo).toBeEnabled()
  })

  test('subclasse fica travada abaixo do nível 3', async ({ page }) => {
    const wizard = new WizardPage(page)
    await wizard.abrir()
    await wizard.proximo()
    await wizard.escolherCard('Wizard')
    await wizard.proximo()

    await expect(page.getByRole('heading', { name: 'Subclass unlocked at Level 3' })).toBeVisible()
    await expect(wizard.botaoProximo).toBeEnabled()
  })

  test('subclasse é obrigatória a partir do nível 3', async ({ page }) => {
    const wizard = new WizardPage(page)
    await wizard.abrir()
    await wizard.definirNivel(3)
    await wizard.proximo()
    await wizard.escolherCard('Wizard')
    await wizard.proximo()

    await expect(wizard.botaoProximo).toBeDisabled()
    await wizard.escolherCard('Abjurer')
    await expect(wizard.botaoProximo).toBeEnabled()
  })

  test('voltar preserva as escolhas anteriores', async ({ page }) => {
    const wizard = new WizardPage(page)
    await wizard.abrir()
    await wizard.definirNivel(4)
    await wizard.proximo()
    await wizard.escolherCard('Rogue')
    await wizard.proximo()

    await wizard.botaoVoltar.click()
    await expect(page.getByRole('heading', { name: 'Rogue', exact: true })).toBeVisible()
    await expect(page.getByText('Hit die:')).toBeVisible()

    await wizard.botaoVoltar.click()
    await expect(page.getByTestId('nivel-valor')).toHaveText('4')
  })

  test('barra lateral libera apenas os passos já visitados', async ({ page, isMobile }) => {
    test.skip(isMobile, 'a barra lateral só existe a partir do breakpoint md')

    const wizard = new WizardPage(page)
    await wizard.abrir()

    const passoClasse = wizard.barraLateral.getByRole('button', { name: /Class/ })
    const passoRevisar = wizard.barraLateral.getByRole('button', { name: /Review/ })
    await expect(passoRevisar).toBeDisabled()

    await wizard.proximo()
    await wizard.escolherCard('Barbarian')
    await wizard.proximo()

    await passoClasse.click()
    await expect(wizard.indicadorDePasso).toHaveText('Step 2 of 13')
    await expect(passoRevisar).toBeDisabled()
  })

  test('mobile mostra a barra de progresso no lugar da lateral', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'específico do layout mobile')

    const wizard = new WizardPage(page)
    await wizard.abrir()

    await expect(wizard.barraLateral).toBeHidden()
    await expect(page.getByText('Level', { exact: true }).first()).toBeVisible()
  })

  test('sair do assistente salva a ficha como "em criação"', async ({ page }) => {
    const wizard = new WizardPage(page)
    await wizard.abrir()
    await wizard.proximo()
    await wizard.escolherCard('Cleric')

    await page.getByRole('button', { name: 'Close wizard' }).click()
    await expect(page).toHaveURL(/\/$/)

    // o store salva com debounce de 500ms, depois da navegação
    await expect.poll(async () => (await lerLista(page))[0]?.classe).toBe('clerigo')
    const lista = await lerLista(page)
    expect(lista).toHaveLength(1)
    expect(lista[0]).toMatchObject({ classe: 'clerigo', completa: false })

    await page.reload()
    await expect(page.getByTestId('ficha-card')).toContainText('In creation')
    await expect(page.getByTestId('ficha-card')).toContainText('Cleric')
  })
})

test.describe('Informações de classe, subclasse e antecedente', () => {
  test('lista características desbloqueadas e bloqueadas pelo nível', async ({ page }) => {
    const wizard = new WizardPage(page)
    await wizard.abrir()
    await wizard.proximo()
    await wizard.escolherCard('Barbarian')

    const resumo = page.getByText('Class Features').locator('..').locator('..')
    await expect(resumo).toBeVisible()

    // nível 1: Rage está disponível, Extra Attack (nível 5) ainda não
    const rage = resumo.getByText('Rage', { exact: true })
    const ataqueExtra = resumo.getByText('Extra Attack', { exact: true })
    await expect(rage).toBeVisible()
    await expect(ataqueExtra).toBeVisible()
    await expect(rage.locator('svg')).toHaveCount(0)
    await expect(ataqueExtra.locator('svg')).toHaveCount(1) // cadeado

    await expect(page.getByText('3 unlocked at level 1')).toBeVisible()
  })

  test('subir o nível desbloqueia mais características', async ({ page }) => {
    const wizard = new WizardPage(page)
    await wizard.abrir()
    await wizard.definirNivel(5)
    await wizard.proximo()
    await wizard.escolherCard('Barbarian')

    const resumo = page.getByText('Class Features').locator('..').locator('..')
    await expect(resumo.getByText('Extra Attack', { exact: true }).locator('svg')).toHaveCount(0)
    await expect(page.getByText(/unlocked at level 5/)).toBeVisible()
  })

  test('o modal da classe descreve cada subclasse', async ({ page }) => {
    const wizard = new WizardPage(page)
    await wizard.abrir()
    await wizard.proximo()
    // sobe do título até o card que contém o botão de detalhes
    await page
      .locator('xpath=//h3[normalize-space()="Rogue"]/ancestor::div[.//button[normalize-space()="Details"]][1]')
      .getByRole('button', { name: 'Details' })
      .click()

    const modal = page.getByRole('dialog')
    await expect(modal.getByText('Assassin', { exact: true })).toBeVisible()
    await expect(modal.getByText(/Ambush specialist/)).toBeVisible()
  })

  test('cards de subclasse mostram descrição', async ({ page }) => {
    const wizard = new WizardPage(page)
    await wizard.abrir()
    await wizard.definirNivel(3)
    await wizard.proximo()
    await wizard.escolherCard('Wizard')
    await wizard.proximo()

    await expect(page.getByText(/Arcane Ward absorbs damage/)).toBeVisible()
    await expect(page.getByText(/Portent: rolls saved in advance/)).toBeVisible()
  })

  test('cards de antecedente mostram descrição', async ({ page }) => {
    const wizard = new WizardPage(page)
    await wizard.abrir()
    await wizard.proximo()
    await wizard.escolherCard('Fighter')
    await wizard.proximo()
    await wizard.escolherOpcao('Defense')
    await wizard.proximo()
    await wizard.escolherCard('Human')
    await wizard.proximo()
    await wizard.distribuirConjuntoPadrao()
    await wizard.proximo()

    await expect(page.getByText(/You served in an army, learning hierarchy/)).toBeVisible()
    await expect(page.getByText(/You served in a temple/)).toBeVisible()
  })
})
