import { expect, type Locator, type Page } from '@playwright/test'

/**
 * Page object do assistente de criação (13 passos).
 * Classes, espécies e antecedentes seguem o idioma da interface — os testes
 * rodam no padrão (inglês).
 */
export class WizardPage {
  constructor(readonly page: Page) {}

  get botaoProximo(): Locator {
    return this.page.getByRole('button', { name: 'Next', exact: true })
  }

  get botaoVoltar(): Locator {
    return this.page.getByRole('button', { name: 'Back', exact: true })
  }

  get botaoCriar(): Locator {
    return this.page.getByRole('button', { name: 'Create Character', exact: true })
  }

  get indicadorDePasso(): Locator {
    return this.page.getByText(/^Step \d+ of 13$/)
  }

  get barraLateral(): Locator {
    return this.page.getByRole('navigation', { name: 'Wizard steps' })
  }

  async abrir(): Promise<void> {
    await this.page.goto('/novo')
    await expect(this.page.getByRole('heading', { name: 'Starting Level' })).toBeVisible()
  }

  async proximo(): Promise<void> {
    await this.botaoProximo.click()
  }

  /** Passo 1 — nível inicial. */
  async definirNivel(nivel: number): Promise<void> {
    const atual = Number(await this.page.getByTestId('nivel-valor').innerText())
    const botao = nivel > atual
      ? this.page.getByRole('button', { name: 'Increase level' })
      : this.page.getByRole('button', { name: 'Decrease level' })
    for (let i = 0; i < Math.abs(nivel - atual); i++) await botao.click()
    await expect(this.page.getByTestId('nivel-valor')).toHaveText(String(nivel))
  }

  /** Clica num card selecionável (classe, subclasse, espécie, antecedente). */
  async escolherCard(nome: string): Promise<void> {
    await this.page.getByRole('heading', { name: nome, exact: true }).first().click()
  }

  /** Escolhas de característica de classe (estilo de luta, ordem divina...). */
  async escolherOpcao(nome: string): Promise<void> {
    await this.page.getByText(nome, { exact: true }).first().click()
  }

  /** Passo 5 — conjunto padrão: distribui 15/14/13/12/10/8. */
  async distribuirConjuntoPadrao(
    valores: Record<string, number> = { FOR: 15, DES: 14, CON: 13, INT: 12, SAB: 10, CAR: 8 },
  ): Promise<void> {
    for (const [attr, valor] of Object.entries(valores)) {
      await this.page.locator(`#padrao-${attr}`).selectOption(String(valor))
    }
  }

  /** Passo 6 — distribui os +3 do antecedente (modo 2+1 é o padrão). */
  async distribuirBonusAntecedente(distribuicao: Record<string, number>): Promise<void> {
    for (const [attr, pontos] of Object.entries(distribuicao)) {
      const controle = this.page.getByTestId(`bonus-${attr}`)
      for (let i = 0; i < pontos; i++) await controle.getByRole('button', { name: '+' }).click()
    }
  }

  /** Passo 8 — perícias de classe. */
  async escolherPericias(nomes: string[]): Promise<void> {
    for (const nome of nomes) {
      await this.page.getByRole('button', { name: new RegExp(`^${nome}\\b`) }).first().click()
    }
  }

  /** Passo 10 — idiomas livres. */
  async escolherIdiomas(nomes: string[]): Promise<void> {
    for (const nome of nomes) {
      await this.page.getByRole('button', { name: new RegExp(`^${nome}\\b`) }).first().click()
    }
  }

  /**
   * Cria um Guerreiro Campeão nível 3 percorrendo os 13 passos.
   * Retorna o id da ficha criada (extraído da URL final).
   */
  async criarGuerreiroNivel3(nome = 'Aria Sombravéu'): Promise<string> {
    await this.abrir()

    // 1 — Nível
    await this.definirNivel(3)
    await this.proximo()

    // 2 — Classe
    await expect(this.page.getByRole('heading', { name: 'Class', exact: true })).toBeVisible()
    await this.escolherCard('Fighter')
    await this.proximo()

    // 3 — Subclasse + estilo de luta
    await expect(this.page.getByRole('heading', { name: 'Subclass', exact: true })).toBeVisible()
    await this.escolherCard('Champion')
    await this.escolherOpcao('Defense')
    await this.proximo()

    // 4 — Espécie
    await expect(this.page.getByRole('heading', { name: 'Species', exact: true })).toBeVisible()
    await this.escolherCard('Human')
    await this.proximo()

    // 5 — Atributos
    await expect(this.page.getByRole('heading', { name: 'Attributes', exact: true })).toBeVisible()
    await this.distribuirConjuntoPadrao()
    await this.proximo()

    // 6 — Antecedente (os antecedentes são traduzidos: Soldado / Soldier)
    await expect(this.page.getByRole('heading', { name: 'Background', exact: true })).toBeVisible()
    await this.escolherCard('Soldier')
    await this.distribuirBonusAntecedente({ FOR: 2, CON: 1 })
    await this.proximo()

    // 7 — Multiclasse (opcional, segue sem adicionar)
    await expect(this.indicadorDePasso).toHaveText('Step 7 of 13')
    await this.proximo()

    // 8 — Perícias (Athletics e Intimidation vêm do antecedente)
    await expect(this.page.getByRole('heading', { name: 'Skills', exact: true })).toBeVisible()
    await this.escolherPericias(['Acrobatics', 'History'])
    await this.proximo()

    // 9 — Magias: guerreiro não conjura
    await expect(this.page.getByText('Fighter is not a spellcasting class.')).toBeVisible()
    await this.proximo()

    // 10 — Idiomas
    await expect(this.page.getByRole('heading', { name: 'Languages', exact: true })).toBeVisible()
    await this.escolherIdiomas(['Draconic', 'Elvish'])
    await this.proximo()

    // 11 — Equipamento (opção A é a padrão)
    await expect(this.page.getByRole('heading', { name: 'Equipment', exact: true })).toBeVisible()
    await this.proximo()

    // 12 — Personalidade
    await expect(this.page.getByRole('heading', { name: 'Personality', exact: true })).toBeVisible()
    await this.page.getByLabel('Character Name').fill(nome)
    await this.proximo()

    // 13 — Revisão
    await expect(this.page.getByRole('heading', { name: 'Review and Finish' })).toBeVisible()
    await this.botaoCriar.click()

    await this.page.waitForURL(/\/ficha\/[0-9a-f-]{36}$/)
    return this.page.url().split('/ficha/')[1]
  }
}
