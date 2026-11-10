import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import i18n from '../../i18n'
import { makeSheet } from '../../test/fixtures'
import { recalculate } from '../recalculate'
import { buildSheetValues } from './sheetValues'
import { KEYS, coinKey, pactSpentKey, skillKey, slotSpentKey, slotTotalKey, spellKey } from './sheetKeys'

function wizard() {
  const sheet = makeSheet({ classId: 'mago', level: 5 })
  sheet.identity.character_name = 'Isolde Varenne'
  sheet.identity.xp = 6500
  sheet.inventory.coins.PO = 37
  sheet.skills.historia.proficient = true
  sheet.skills.arcanismo.expertise = true
  sheet.spellcasting.cantrips_by_class = { mago: ['Raio Gélido'] }
  sheet.spellcasting.spells_by_class = { mago: ['Mísseis Mágicos', 'Bola de Fogo'] }
  const out = recalculate(sheet)
  out.combat.hit_points.current = 21
  out.spellcasting.spell_slots.c1.spent = 2
  return out
}

describe('buildSheetValues', () => {
  // Os nomes vêm do idioma da interface; as asserções usam os do português.
  const previous = i18n.language
  beforeAll(() => i18n.changeLanguage('pt'))
  afterAll(() => i18n.changeLanguage(previous))

  it('preenche identidade, espaços e magias em ordem de círculo', () => {
    const { texts } = buildSheetValues(wizard(), 'export')
    expect(texts.get(KEYS.name)).toBe('Isolde Varenne')
    expect(texts.get(KEYS.charClass)).toBe('Mago')
    expect([1, 2, 3].map(level => texts.get(slotTotalKey(level)))).toEqual(['4', '3', '2'])
    expect([0, 1, 2].map(row => texts.get(spellKey(row, 'level')))).toEqual(['0', '1', '3'])
    expect(texts.get(spellKey(0, 'name'))).toBe('Raio Gélido')
  })

  it('preenche a perícia História (o mapa do modelo antigo a perdia)', () => {
    const { texts, marks } = buildSheetValues(wizard(), 'export')
    expect(texts.get(skillKey('historia', 'val'))).toBeDefined()
    expect(marks.has(skillKey('historia', 'prof'))).toBe(true)
  })

  it('marca a especialização junto com a proficiência', () => {
    const { marks } = buildSheetValues(wizard(), 'export')
    expect(marks.has(skillKey('arcanismo', 'prof'))).toBe(true)
    expect(marks.has(skillKey('arcanismo', 'exp'))).toBe(true)
    expect(marks.has(skillKey('historia', 'exp'))).toBe(false)
  })

  it('no modo print deixa em branco o que muda em jogo', () => {
    const exported = buildSheetValues(wizard(), 'export')
    const printed = buildSheetValues(wizard(), 'print')
    for (const key of [KEYS.xp, KEYS.hpCurrent, coinKey('PO')]) {
      expect(exported.texts.has(key), key).toBe(true)
      expect(printed.texts.has(key), key).toBe(false)
    }
    expect(exported.marks.has(slotSpentKey(1, 1))).toBe(true)
    expect(printed.marks.has(slotSpentKey(1, 0))).toBe(false)
    // O que é fixo continua nos dois.
    expect(printed.texts.get(KEYS.hpMax)).toBe(exported.texts.get(KEYS.hpMax))
  })

  it('põe a Magia de Pacto na linha própria, sem somar aos círculos', () => {
    const sheet = makeSheet({ classId: 'bruxo', level: 5 })
    sheet.spellcasting.pact_slots.spent = 1
    const { texts, marks } = buildSheetValues(sheet, 'export')
    const pact = sheet.spellcasting.pact_slots
    expect(pact.max).toBeGreaterThan(0)
    expect(texts.get(KEYS.pactTotal)).toBe(String(pact.max))
    expect(texts.get(KEYS.pactLevel)).toBe(String(pact.level))
    expect(texts.has(slotTotalKey(pact.level ?? 0))).toBe(false)
    expect(marks.has(pactSpentKey(0))).toBe(true)
  })

  it('lista as conjurações sem espaço do Iniciado em Magia', () => {
    const sheet = makeSheet({ classId: 'barbaro', level: 3, feats: [{ feat_id: 'iniciado_em_magia', name: 'Iniciado em Magia' }] })
    sheet.spellcasting.free_casts[0].spell = 'Sono'
    const { texts } = buildSheetValues(sheet, 'export')
    expect(texts.get(KEYS.freeCasts)).toBe('Sono (1×)')
    expect(texts.get(spellKey(0, 'name'))).toBe('Sono')
  })
})
