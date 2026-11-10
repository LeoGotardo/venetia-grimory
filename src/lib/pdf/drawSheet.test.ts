// O teste lê a fonte do disco; o tsconfig.app.json não traz os tipos do Node.
/// <reference types="node" />
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { PDFDocument } from 'pdf-lib'
import { makeSheet } from '../../test/fixtures'
import { drawSheetPdf } from './drawSheet'
import { KEYS, attackKey } from './sheetKeys'

const titleFont = readFileSync(join(import.meta.dirname, '../../assets/fonts/Cinzel-Bold.ttf'))

function sheet() {
  const s = makeSheet({ classId: 'mago', level: 5 })
  s.identity.character_name = 'Grukk 🐉 Pedra-Cinza'
  s.combat.attacks = [{ name: 'Machado −1', weapon_id: null, type: 'Corpo a Corpo', ability_used: 'FOR', _attack_bonus: 4, _damage: '1d8+2', damage_type: null, properties: [], notes: 'Pesado 🪓' }]
  s.identity.xp = 900
  s.combat.hit_points.current = 12
  return s
}

describe('drawSheetPdf', () => {
  it('export: duas páginas A4, sem formulário, mesmo com emoji no nome', async () => {
    const pdf = await PDFDocument.load(await drawSheetPdf(sheet(), 'export', titleFont))
    expect(pdf.getPageCount()).toBe(2)
    const { width, height } = pdf.getPage(0).getSize()
    expect(Math.round(width)).toBe(595)
    expect(Math.round(height)).toBe(842)
    expect(pdf.getForm().getFields()).toHaveLength(0)
  })

  it('print: formulário com o que é fixo preenchido e o que muda em jogo em branco', async () => {
    const pdf = await PDFDocument.load(await drawSheetPdf(sheet(), 'print', titleFont))
    const form = pdf.getForm()
    expect(form.getTextField(KEYS.name).getText()).toBe('Grukk ? Pedra-Cinza')
    // O nome se repete na página 2 com outro nome de campo.
    expect(form.getTextField(`${KEYS.name}_p2`).getText()).toBe('Grukk ? Pedra-Cinza')
    // Helvetica (WinAnsi) não tem o sinal de menos nem emoji.
    expect(form.getTextField(attackKey(0, 'name')).getText()).toBe('Machado -1')
    expect(form.getTextField(attackKey(0, 'notes')).getText()).toBe('Pesado ?')
    expect(form.getTextField(KEYS.hpMax).getText()).toBeTruthy()
    expect(form.getTextField(KEYS.hpCurrent).getText()).toBeUndefined()
    expect(form.getTextField(KEYS.xp).getText()).toBeUndefined()
  })
})
