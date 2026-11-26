import { test, expect } from '@playwright/test'
import { createCompleteSheet, seedSheet, setLanguage } from './helpers/storage'
import { ROOM, combatTable, mockRoom, seedMembership } from './helpers/room'

const SHEET_ID = 'e2e-sala-ficha'

test.describe('Vez do player na mesa da sala', () => {
  test.beforeEach(async ({ page }) => {
    const sheet = createCompleteSheet()
    sheet.inventory.items = [{
      item_id: 'pocao_de_cura', name: null, category: null, quantity: 2, equipped: false,
      cost_gp: null, weight_kg: null, notes: null, uses_spent: null,
    }]
    await seedSheet(page, { id: SHEET_ID, sheet })
    await seedMembership(page, SHEET_ID)
    await setLanguage(page, 'pt')
  })

  test('mostra a vez com as ações e a ficha em aba própria', async ({ page }, info) => {
    await mockRoom(page, combatTable())
    await page.goto(`/sala/${ROOM.code}?aba=mesa`)
    await expect(page.getByText('Sua vez!')).toBeVisible()
    if (process.env.ROOM_SHOTS) await page.screenshot({ path: `${process.env.ROOM_SHOTS}/turn-${info.project.name}.png`, fullPage: true })
    await page.getByRole('tab', { name: 'Minha ficha' }).click()
    await expect(page.getByText('PV no combate (controlado pelo mestre)')).toBeVisible()
    // A ficha não volta para a coluna de 400 px ao lado da mesa (ali o cartão media ~390 px).
    const card = await page.getByTestId('sala-ficha-combate').boundingBox()
    if (info.project.name === 'desktop') expect(card!.width).toBeGreaterThan(450)
    if (process.env.ROOM_SHOTS) await page.screenshot({ path: `${process.env.ROOM_SHOTS}/sheet-${info.project.name}.png`, fullPage: true })
  })

  test('dados físicos: o d20 digitado vai ao servidor', async ({ page }) => {
    const room = await mockRoom(page, combatTable())
    await page.goto(`/sala/${ROOM.code}?aba=mesa`)
    await expect(page.getByText('Sua vez!')).toBeVisible()
    await page.getByTestId('sala-vez').getByRole('radio', { name: 'Na mesa' }).click()

    await page.getByRole('button', { name: 'Atacar' }).click()
    await page.getByRole('button', { name: /Ataque desarmado/ }).click()
    await page.getByRole('button', { name: /^Goblin\b/ }).first().click()
    await page.getByRole('button', { name: /Atacar Goblin com Ataque desarmado/ }).click()

    // O dano do soco é fixo (1 + FOR): só o d20 é perguntado.
    const dice = page.getByRole('dialog', { name: 'Quanto saiu nos dados?' })
    await dice.getByRole('spinbutton').fill('21')
    await expect(dice.getByRole('button', { name: 'Enviar' })).toBeDisabled()
    await dice.getByRole('spinbutton').fill('15')
    await dice.getByRole('button', { name: 'Enviar' }).click()

    await expect.poll(() => room.sent.find((m): m is { t: string; manual_attack?: number } => (m as { t: string }).t === 'attack'))
      .toMatchObject({ t: 'attack', label: 'Ataque desarmado', attack: '1d20+5', damage: '4', manual_attack: 15 })
  })

  test('dados físicos: desistir não usa a poção', async ({ page }) => {
    const room = await mockRoom(page, combatTable())
    await page.goto(`/sala/${ROOM.code}?aba=mesa`)
    await expect(page.getByText('Sua vez!')).toBeVisible()
    await page.getByTestId('sala-vez').getByRole('radio', { name: 'Na mesa' }).click()

    await page.getByRole('button', { name: 'Item' }).click()
    await page.getByRole('button', { name: /Poção de Cura/ }).click()
    await page.getByRole('button', { name: 'Usar Poção de Cura' }).click()
    await expect(page.getByRole('dialog', { name: 'Quanto saiu nos dados?' })).toBeVisible()
    await page.keyboard.press('Escape')

    await expect(page.getByRole('dialog', { name: 'Quanto saiu nos dados?' })).toBeHidden()
    expect(room.sent.some(m => (m as { t: string }).t === 'heal')).toBe(false)
    await expect(page.getByRole('button', { name: /Poção de Cura ×2/ })).toBeVisible()
  })

  test('cabe na tela: a página não rola na mesa nem nas sub-abas da ficha', async ({ page }, info) => {
    const pageOverflow = () => page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight)
    await mockRoom(page, combatTable())
    await page.goto(`/sala/${ROOM.code}?aba=mesa`)
    await expect(page.getByText('Sua vez!')).toBeVisible()
    expect(await pageOverflow()).toBeLessThanOrEqual(1)
    if (process.env.ROOM_SHOTS) await page.screenshot({ path: `${process.env.ROOM_SHOTS}/fit-mesa-${info.project.name}.png` })
    // Celular: a ordem de iniciativa é um menu; aberto, mostra todos sem rolar a página.
    if (info.project.name === 'mobile') {
      await page.getByRole('button', { name: /Ordem de iniciativa \(3\)/ }).click()
      await expect(page.getByRole('list', { name: 'Ordem de iniciativa' }).getByText('Goblin Arqueiro')).toBeVisible()
      expect(await pageOverflow()).toBeLessThanOrEqual(1)
      if (process.env.ROOM_SHOTS) await page.screenshot({ path: `${process.env.ROOM_SHOTS}/fit-ordem-mobile.png` })
    }

    await page.getByRole('tab', { name: 'Minha ficha' }).click()
    for (const name of ['Combate', 'Atributos', 'Perícias', 'Inventário']) {
      await page.getByRole('tab', { name, exact: true }).click()
      await expect(page.getByRole('tab', { name, exact: true })).toHaveAttribute('aria-selected', 'true')
      expect(await pageOverflow()).toBeLessThanOrEqual(1)
      if (process.env.ROOM_SHOTS) {
        await page.waitForTimeout(300) // a cor da sub-aba anima; a captura mostra o estado final
        await page.screenshot({ path: `${process.env.ROOM_SHOTS}/fit-${name}-${info.project.name}.png` })
      }
      // No desktop, combate e atributos cabem inteiros, sem rolagem nem por dentro.
      if (info.project.name === 'desktop' && (name === 'Combate' || name === 'Atributos')) {
        const inner = await page.getByTestId('sala-ficha-secao').evaluate(el => el.scrollHeight - el.clientHeight)
        expect(inner).toBeLessThanOrEqual(1)
      }
    }
  })
})

