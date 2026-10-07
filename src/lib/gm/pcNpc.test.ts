import { describe, it, expect } from 'vitest'
import { buildPcSheet, resolvePcBuild, sheetToStatBlock } from './pcNpc'
import { normalizeStatBlock, saveBonus } from './statblock'
import { parseDice } from './dice'
import { gameDataPt } from '../../data/rules'
import { ABILITIES, calcProfBonus } from '../calculations'
import { PC_LEVEL_CR } from '../../constants'

function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

/** Tradutor de teste: a chave com os parâmetros, para conferir o que foi pedido. */
const t = (key: string, opts?: Record<string, unknown>) => (opts ? `${key} ${JSON.stringify(opts)}` : key)

const CLASSES = gameDataPt.classes.map(c => c.id)

describe('resolvePcBuild', () => {
  it('mantém o que o mestre escolheu', () => {
    const b = resolvePcBuild({ classId: 'mago', level: 7, subclassId: 'evocador', speciesId: 'gnomo', backgroundId: 'sabio' }, seeded(1))
    expect(b).toMatchObject({ classId: 'mago', level: 7, subclassId: 'evocador', speciesId: 'gnomo', backgroundId: 'sabio' })
  })

  it('sorteia o resto dentro do válido; sem subclasse antes do nível 3', () => {
    for (let seed = 1; seed < 60; seed++) {
      const b = resolvePcBuild({}, seeded(seed))
      expect(CLASSES).toContain(b.classId)
      expect(b.level).toBeGreaterThanOrEqual(1)
      expect(b.level).toBeLessThanOrEqual(6)
      if (b.level < 3) expect(b.subclassId).toBeNull()
      else expect(gameDataPt.classes.find(c => c.id === b.classId)!.subclasses.map(s => s.id)).toContain(b.subclassId)
    }
    expect(resolvePcBuild({ classId: 'guerreiro', level: 2, subclassId: 'campeao' }, seeded(2)).subclassId).toBeNull()
  })

  it('mesmo seed, mesmo personagem', () => {
    const a = buildPcSheet(resolvePcBuild({}, seeded(9)), seeded(9))
    const b = buildPcSheet(resolvePcBuild({}, seeded(9)), seeded(9))
    expect(a).toEqual(b)
  })
})

describe('buildPcSheet + sheetToStatBlock em todas as classes', () => {
  for (const classId of CLASSES) {
    for (const level of [1, 5, 11, 20]) {
      it(`${classId} ${level}`, () => {
        const build = resolvePcBuild({ classId, level }, seeded(level * 31 + classId.length))
        const sheet = buildPcSheet(build, seeded(level))
        const charClass = gameDataPt.classes.find(c => c.id === classId)!

        for (const a of ABILITIES) expect(sheet.abilities[a].value).toBeLessThanOrEqual(20)
        expect(sheet.combat.hit_points.max).toBeGreaterThan(0)
        const proficient = Object.values(sheet.skills).filter(s => s.proficient).length
        expect(proficient).toBeGreaterThanOrEqual(charClass.num_skills)

        const block = sheetToStatBlock(sheet, 'Teste', 'pt', t)
        expect(normalizeStatBlock(block)).toEqual(block)
        expect(block.proficiency_bonus).toBe(calcProfBonus(level))
        expect(block.cr).toBe(PC_LEVEL_CR[level])
        expect(block.hp.average).toBe(sheet.combat.hit_points.max)
        expect(block.ac).toBe(sheet.combat.armor_class.value)
        expect(block.save_proficiencies.sort()).toEqual([...charClass.saves].sort())
        // Salvaguarda do bloco = a da ficha: o bônus fixo vence o do ND.
        for (const a of ABILITIES) expect(saveBonus(block, a)).toBe(sheet.combat.saves[a]._value)
        expect(block.actions.length).toBeGreaterThan(0)
        for (const action of block.actions) if (action.damage) expect(parseDice(action.damage), action.damage).not.toBeNull()
        expect(block.languages).toBeTruthy()
      })
    }
  }
})

describe('detalhes de classe no bloco', () => {
  it('guerreiro: ataques extras por nível e armadura que melhora', () => {
    const at = (level: number) => sheetToStatBlock(buildPcSheet(resolvePcBuild({ classId: 'guerreiro', level }, seeded(3)), seeded(3)), 'G', 'pt', t)
    expect(at(1).actions.some(a => a.name === 'gm.pcNpc.multiattack')).toBe(false)
    expect(at(5).actions[0].description).toContain('"n":2')
    expect(at(11).actions[0].description).toContain('"n":3')
    expect(at(20).actions[0].description).toContain('"n":4')
    expect(at(9).ac).toBeGreaterThan(at(1).ac)
  })

  it('mago: traço de conjuração e truque de dano que escala no nível 5', () => {
    const sheet = buildPcSheet(resolvePcBuild({ classId: 'mago', level: 5 }, seeded(4)), seeded(4))
    const block = sheetToStatBlock(sheet, 'M', 'pt', t)
    expect(block.traits.some(tr => tr.name === 'gm.pcNpc.spellcasting')).toBe(true)
    const cantrip = block.actions.find(a => a.damage && (a.attack_bonus === sheet.spellcasting._spell_attack_bonus || a.save_dc != null))
    expect(cantrip).toBeTruthy()
    expect(cantrip!.damage).toMatch(/^2d\d+$/)
    expect(sheet.spellcasting.cantrips_by_class.mago).toHaveLength(4)
    expect(sheet.spellcasting.spells_by_class.mago).toHaveLength(9)
  })

  it('subclasse de 1/3 conjurador põe INT entre os três maiores', () => {
    const ek = buildPcSheet(resolvePcBuild({ classId: 'guerreiro', level: 5, subclassId: 'cavaleiro_mistico' }, seeded(7)), seeded(7))
    expect(ek.abilities.INT.value).toBeGreaterThanOrEqual(13)
  })

  it('ladino ganha especialização; humano é médio, pequenino é pequeno', () => {
    const rogue = buildPcSheet(resolvePcBuild({ classId: 'ladino', level: 6, speciesId: 'pequenino' }, seeded(5)), seeded(5))
    expect(Object.values(rogue.skills).filter(s => s.expertise)).toHaveLength(4)
    expect(sheetToStatBlock(rogue, 'L', 'pt', t).size).toBe('small')
    const human = buildPcSheet(resolvePcBuild({ classId: 'guerreiro', level: 1, speciesId: 'humano' }, seeded(6)), seeded(6))
    expect(sheetToStatBlock(human, 'H', 'pt', t).size).toBe('medium')
  })
})
