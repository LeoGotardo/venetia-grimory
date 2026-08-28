import { expect, type Locator, type Page } from '@playwright/test'

/**
 * Page object do assistente de criação (13 passos).
 * Classes, espécies e antecedentes seguem o idioma da interface — os testes
 * rodam no padrão (inglês).
 */
export class WizardPage {
  constructor(readonly page: Page) {}

  get nextButton(): Locator {
    return this.page.getByRole('button', { name: 'Next', exact: true })
  }

  get backButton(): Locator {
    return this.page.getByRole('button', { name: 'Back', exact: true })
  }

  get createButton(): Locator {
    return this.page.getByRole('button', { name: 'Create Character', exact: true })
  }

  get stepIndicator(): Locator {
    return this.page.getByText(/^Step \d+ of 13$/)
  }

  get sidebar(): Locator {
    return this.page.getByRole('navigation', { name: 'Wizard steps' })
  }

  async open(): Promise<void> {
    await this.page.goto('/novo')
    await expect(this.page.getByRole('heading', { name: 'Starting Level' })).toBeVisible()
  }

  async next(): Promise<void> {
    await this.nextButton.click()
  }

  /** Passo 1 — nível inicial. */
  async setLevel(level: number): Promise<void> {
    const current = Number(await this.page.getByTestId('level-value').innerText())
    const button = level > current
      ? this.page.getByRole('button', { name: 'Increase level' })
      : this.page.getByRole('button', { name: 'Decrease level' })
    for (let i = 0; i < Math.abs(level - current); i++) await button.click()
    await expect(this.page.getByTestId('level-value')).toHaveText(String(level))
  }

  /** Clica num card selecionável (classe, subclasse, espécie, antecedente). */
  async chooseCard(name: string): Promise<void> {
    await this.page.getByRole('heading', { name, exact: true }).first().click()
  }

  /** Escolhas de característica de classe (estilo de luta, ordem divina...). */
  async chooseOption(name: string): Promise<void> {
    await this.page.getByText(name, { exact: true }).first().click()
  }

  /** Passo 5 — conjunto padrão: distribui 15/14/13/12/10/8. */
  async assignStandardArray(
    values: Record<string, number> = { FOR: 15, DES: 14, CON: 13, INT: 12, SAB: 10, CAR: 8 },
  ): Promise<void> {
    for (const [attr, value] of Object.entries(values)) {
      await this.page.locator(`#standard-${attr}`).selectOption(String(value))
    }
  }

  /** Passo 6 — distribui os +3 do antecedente (modo 2+1 é o padrão). */
  async assignBackgroundBonus(distribution: Record<string, number>): Promise<void> {
    for (const [attr, points] of Object.entries(distribution)) {
      const control = this.page.getByTestId(`bonus-${attr}`)
      for (let i = 0; i < points; i++) await control.getByRole('button', { name: '+' }).click()
    }
  }

  /** Passo 8 — perícias de classe. */
  async chooseSkills(names: string[]): Promise<void> {
    for (const name of names) {
      await this.page.getByRole('button', { name: new RegExp(`^${name}\\b`) }).first().click()
    }
  }

  /** Passo 10 — idiomas livres. */
  async chooseLanguages(names: string[]): Promise<void> {
    for (const name of names) {
      await this.page.getByRole('button', { name: new RegExp(`^${name}\\b`) }).first().click()
    }
  }

  /**
   * Cria um Guerreiro Campeão nível 3 percorrendo os 13 passos.
   * Retorna o id da ficha criada (extraído da URL final).
   */
  async createLevel3Fighter(name = 'Aria Sombravéu'): Promise<string> {
    await this.open()

    // 1 — Nível
    await this.setLevel(3)
    await this.next()

    // 2 — Classe
    await expect(this.page.getByRole('heading', { name: 'Class', exact: true })).toBeVisible()
    await this.chooseCard('Fighter')
    await this.next()

    // 3 — Subclasse + estilo de luta
    await expect(this.page.getByRole('heading', { name: 'Subclass', exact: true })).toBeVisible()
    await this.chooseCard('Champion')
    await this.chooseOption('Defense')
    await this.next()

    // 4 — Espécie
    await expect(this.page.getByRole('heading', { name: 'Species', exact: true })).toBeVisible()
    await this.chooseCard('Human')
    await this.next()

    // 5 — Atributos
    await expect(this.page.getByRole('heading', { name: 'Attributes', exact: true })).toBeVisible()
    await this.assignStandardArray()
    await this.next()

    // 6 — Antecedente (os antecedentes são traduzidos: Soldado / Soldier)
    await expect(this.page.getByRole('heading', { name: 'Background', exact: true })).toBeVisible()
    await this.chooseCard('Soldier')
    await this.assignBackgroundBonus({ FOR: 2, CON: 1 })
    await this.next()

    // 7 — Multiclasse (opcional, segue sem adicionar)
    await expect(this.stepIndicator).toHaveText('Step 7 of 13')
    await this.next()

    // 8 — Perícias (Athletics e Intimidation vêm do antecedente)
    await expect(this.page.getByRole('heading', { name: 'Skills', exact: true })).toBeVisible()
    await this.chooseSkills(['Acrobatics', 'History'])
    await this.next()

    // 9 — Magias: guerreiro não conjura
    await expect(this.page.getByText('Fighter is not a spellcasting class.')).toBeVisible()
    await this.next()

    // 10 — Idiomas
    await expect(this.page.getByRole('heading', { name: 'Languages', exact: true })).toBeVisible()
    await this.chooseLanguages(['Draconic', 'Elvish'])
    await this.next()

    // 11 — Equipamento (opção A é a padrão)
    await expect(this.page.getByRole('heading', { name: 'Equipment', exact: true })).toBeVisible()
    await this.next()

    // 12 — Personalidade
    await expect(this.page.getByRole('heading', { name: 'Personality', exact: true })).toBeVisible()
    await this.page.getByLabel('Character Name').fill(name)
    await this.next()

    // 13 — Revisão
    await expect(this.page.getByRole('heading', { name: 'Review and Finish' })).toBeVisible()
    await this.createButton.click()

    await this.page.waitForURL(/\/ficha\/[0-9a-f-]{36}$/)
    return this.page.url().split('/ficha/')[1]
  }
}
