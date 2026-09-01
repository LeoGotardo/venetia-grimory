import { describe, it, expect } from 'vitest'
import { makeSheet, slotSummary } from '../test/fixtures'
import { recalculate } from './recalculate'
import {
  calcMulticlassCasterLevel,
  calcMulticlassSlots,
  calcPactCasterLevel,
  calcThirdCasterSlots,
  isCasterClass,
  spellListForClass,
} from './calculations'

/**
 * As três reservas do PHB 2024 são independentes: Conjuração (`spell_slots`),
 * Magia de Pacto (`pact_slots`) e conjurações sem espaço (`free_casts`). Os
 * números conferidos aqui vêm das tabelas do livro.
 */
describe('nível de conjurador para multiclasse', () => {
  const entry = (classId: string, level: number, subclassId: string | null = null) => ({
    classId,
    subclassId,
    level,
  })

  it('conta o nível inteiro dos conjuradores completos', () => {
    expect(calcMulticlassCasterLevel([entry('mago', 5), entry('bardo', 3)])).toBe(8)
  })

  it('arredonda meio-conjuradores para CIMA (paladino/guardião conjuram no nível 1 em 2024)', () => {
    expect(calcMulticlassCasterLevel([entry('paladino', 3)])).toBe(2)
    expect(calcMulticlassCasterLevel([entry('guardiao', 1)])).toBe(1)
    expect(calcMulticlassCasterLevel([entry('guardiao', 4), entry('feiticeiro', 3)])).toBe(5)
  })

  it('arredonda subclasses de 1/3 conjurador para BAIXO', () => {
    expect(calcMulticlassCasterLevel([entry('ladino', 3, 'trapaceiro_arcano')])).toBe(1)
    expect(calcMulticlassCasterLevel([entry('guerreiro', 8, 'cavaleiro_mistico')])).toBe(2)
  })

  it('deixa o bruxo de fora — Magia de Pacto não entra na tabela', () => {
    expect(calcMulticlassCasterLevel([entry('bruxo', 12)])).toBe(0)
    expect(calcMulticlassCasterLevel([entry('bruxo', 12), entry('mago', 5)])).toBe(5)
    expect(calcPactCasterLevel([{ classId: 'bruxo', level: 12 }])).toBe(12)
  })

  it('ignora classes que não conjuram', () => {
    expect(calcMulticlassCasterLevel([entry('barbaro', 10), entry('guerreiro', 6)])).toBe(0)
  })
})

describe('tabela própria do 1/3 conjurador', () => {
  it('não é a tabela de multiclasse — no nível 4 dá 3 espaços, não 2', () => {
    expect(calcThirdCasterSlots(4)).toEqual({ c1: 3 })
    expect(calcMulticlassSlots(1)).toEqual({ c1: 2 })
  })

  it('segue a tabela do PHB 2024 até o nível 20', () => {
    expect(calcThirdCasterSlots(2)).toEqual({})
    expect(calcThirdCasterSlots(3)).toEqual({ c1: 2 })
    expect(calcThirdCasterSlots(7)).toEqual({ c1: 4, c2: 2 })
    expect(calcThirdCasterSlots(13)).toEqual({ c1: 4, c2: 3, c3: 2 })
    expect(calcThirdCasterSlots(20)).toEqual({ c1: 4, c2: 3, c3: 3, c4: 1 })
  })
})

describe('quem conjura e de qual lista', () => {
  it('reconhece as subclasses de 1/3, cuja classe é `null` em CASTER_TYPE', () => {
    expect(isCasterClass('guerreiro', null)).toBe(false)
    expect(isCasterClass('guerreiro', 'cavaleiro_mistico')).toBe(true)
    expect(isCasterClass('ladino', 'trapaceiro_arcano')).toBe(true)
    expect(isCasterClass('bruxo', null)).toBe(true)
  })

  it('manda o 1/3 conjurador para a lista de mago, não para uma de guerreiro', () => {
    expect(spellListForClass('guerreiro', 'cavaleiro_mistico')).toBe('mago')
    expect(spellListForClass('ladino', 'trapaceiro_arcano')).toBe('mago')
    expect(spellListForClass('clerigo', null)).toBe('clerigo')
  })
})

describe('espaços derivados na ficha', () => {
  it('bruxo puro só tem espaços de pacto', () => {
    const sheet = makeSheet({ classId: 'bruxo', level: 5 })
    expect(slotSummary(sheet)).toBe('')
    expect(sheet.spellcasting.pact_slots).toEqual({ level: 3, max: 2, spent: 0 })
  })

  it('bruxo em multiclasse mantém as duas reservas separadas', () => {
    const sheet = makeSheet({
      classId: 'bruxo',
      level: 5,
      multiclasses: [{ class_id: 'mago', level: 2 }],
    })
    // bruxo 3 → 2 espaços de 2º círculo; mago 2 → tabela de multiclasse no nível 2
    expect(sheet.spellcasting.pact_slots).toMatchObject({ level: 2, max: 2 })
    expect(slotSummary(sheet)).toBe('c1:3')
  })

  it('classe única lê a própria progressão', () => {
    expect(slotSummary(makeSheet({ classId: 'mago', level: 5 }))).toBe('c1:4 c2:3 c3:2')
    expect(slotSummary(makeSheet({ classId: 'paladino', level: 5 }))).toBe('c1:4 c2:2')
  })

  it('1/3 conjurador em classe única usa a tabela da subclasse', () => {
    const sheet = makeSheet({ classId: 'guerreiro', level: 4, subclassId: 'cavaleiro_mistico' })
    expect(slotSummary(sheet)).toBe('c1:3')
  })

  it('deriva conjurador e atributo para o 1/3, cuja classe não declara nenhum', () => {
    const sheet = makeSheet({ classId: 'guerreiro', level: 5, subclassId: 'cavaleiro_mistico' })
    expect(sheet.spellcasting.spellcaster).toBe(true)
    expect(sheet.spellcasting.spellcasting_ability).toBe('INT')
  })

  it('não transforma classe não-conjuradora em conjuradora', () => {
    const sheet = makeSheet({ classId: 'barbaro', level: 5 })
    expect(sheet.spellcasting.spellcaster).toBe(false)
    expect(slotSummary(sheet)).toBe('')
  })

  it('preserva o gasto ao recalcular, limitando ao novo máximo', () => {
    const sheet = makeSheet({ classId: 'mago', level: 5 })
    sheet.spellcasting.spell_slots.c3 = { max: 2, spent: 2 }
    const again = recalculate({ ...sheet, identity: { ...sheet.identity, level: 3 } })
    // nível 3 não tem 3º círculo: o gasto some junto com o espaço
    expect(again.spellcasting.spell_slots.c3).toEqual({ max: 0, spent: 0 })
    expect(again.spellcasting.spell_slots.c1.max).toBe(4)
  })
})

describe('CD e ataque por classe', () => {
  it('cada classe conjura com o próprio atributo', () => {
    const sheet = makeSheet({
      classId: 'clerigo',
      level: 6,
      multiclasses: [{ class_id: 'mago', level: 3 }],
      abilities: { SAB: 16, INT: 8 },
    })
    // BP 3 no nível 6 → clérigo 8+3+3=14, mago 8+3-1=10
    expect(sheet.spellcasting._spell_dc_by_class).toEqual({ clerigo: 14, mago: 10 })
    expect(sheet.spellcasting._spell_attack_by_class).toEqual({ clerigo: 6, mago: 2 })
  })

  it('o escalar continua sendo o da classe primária, que é o que vai para o PDF', () => {
    const sheet = makeSheet({
      classId: 'clerigo',
      level: 6,
      multiclasses: [{ class_id: 'mago', level: 3 }],
      abilities: { SAB: 16, INT: 8 },
    })
    expect(sheet.spellcasting._spell_dc).toBe(14)
  })
})
