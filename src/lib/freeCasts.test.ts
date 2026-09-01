import { describe, it, expect, beforeEach } from 'vitest'
import { makeSheet } from '../test/fixtures'
import { useSheetStore } from '../store/sheetStore'
import { createInitialSheet } from './initialSheet'
import { recalculate } from './recalculate'
import { freeCastLabel, isFreeCastIncomplete } from './freeCasts'
import { gameData } from '../data/rules'

const MAGIC_INITIATE_PT = { feat_id: 'Iniciado em Magia (Clérigo)', name: 'Iniciado em Magia (Clérigo)' }
const MAGIC_INITIATE_EN = { feat_id: 'Magic Initiate (Wizard)', name: 'Magic Initiate (Wizard)' }
const MAGIC_INITIATE_FREE = { feat_id: 'iniciado_em_magia', name: 'Iniciado em Magia' }

describe('Iniciado em Magia', () => {
  it('vira uma conjuração sem espaço, e não um espaço de magia', () => {
    const sheet = makeSheet({ classId: 'barbaro', level: 5, feats: [MAGIC_INITIATE_PT] })
    expect(sheet.spellcasting.free_casts).toHaveLength(1)
    expect(sheet.spellcasting.free_casts[0]).toMatchObject({ kind: 'magic_initiate', level: 1, max: 1 })
    expect(Object.values(sheet.spellcasting.spell_slots).every(s => s.max === 0)).toBe(true)
  })

  it('lê a lista fixada pelo antecedente nos dois idiomas e a tranca', () => {
    const pt = makeSheet({ classId: 'barbaro', level: 3, feats: [MAGIC_INITIATE_PT] })
    expect(pt.spellcasting.free_casts[0]).toMatchObject({ spell_list: 'clerigo', list_locked: true })

    const en = makeSheet({ classId: 'ladino', level: 3, feats: [MAGIC_INITIATE_EN] })
    expect(en.spellcasting.free_casts[0]).toMatchObject({ spell_list: 'mago', list_locked: true })
  })

  it('deixa a lista em aberto quando o talento não a fixa', () => {
    const sheet = makeSheet({ classId: 'mago', level: 4, feats: [MAGIC_INITIATE_FREE] })
    expect(sheet.spellcasting.free_casts[0]).toMatchObject({ spell_list: null, list_locked: false })
  })

  it('é repetível: um registro por talento adquirido', () => {
    const sheet = makeSheet({
      classId: 'mago',
      level: 4,
      feats: [MAGIC_INITIATE_PT, MAGIC_INITIATE_EN],
    })
    expect(sheet.spellcasting.free_casts.map(c => c.spell_list)).toEqual(['clerigo', 'mago'])
  })

  it('só tem CD depois que o atributo é escolhido', () => {
    const sheet = makeSheet({ classId: 'barbaro', level: 5, feats: [MAGIC_INITIATE_PT] })
    expect(sheet.spellcasting.free_casts[0]._spell_dc).toBeNull()

    const withAbility = recalculate({
      ...sheet,
      spellcasting: {
        ...sheet.spellcasting,
        free_casts: sheet.spellcasting.free_casts.map(c => ({ ...c, ability: 'SAB' as const })),
      },
    })
    // BP 3 no nível 5, SAB 14 → 8 + 3 + 2
    expect(withAbility.spellcasting.free_casts[0]._spell_dc).toBe(13)
    expect(withAbility.spellcasting.free_casts[0]._spell_attack_bonus).toBe(5)
  })

  it('some junto com o talento', () => {
    const sheet = makeSheet({ classId: 'barbaro', level: 5, feats: [MAGIC_INITIATE_PT] })
    const semTalento = recalculate({ ...sheet, feats: { list: [] } })
    expect(semTalento.spellcasting.free_casts).toHaveLength(0)
  })
})

describe('Arcana Mística', () => {
  it('não existe antes do nível 11 de bruxo', () => {
    const sheet = makeSheet({ classId: 'bruxo', level: 10 })
    expect(sheet.spellcasting.free_casts).toHaveLength(0)
  })

  it('entra nos níveis 11/13/15/17, um círculo por vez', () => {
    expect(makeSheet({ classId: 'bruxo', level: 11 }).spellcasting.free_casts.map(c => c.level)).toEqual([6])
    expect(makeSheet({ classId: 'bruxo', level: 14 }).spellcasting.free_casts.map(c => c.level)).toEqual([6, 7])
    expect(makeSheet({ classId: 'bruxo', level: 20 }).spellcasting.free_casts.map(c => c.level)).toEqual([6, 7, 8, 9])
  })

  it('conjura da lista de bruxo, com o atributo do bruxo', () => {
    const cast = makeSheet({ classId: 'bruxo', level: 11 }).spellcasting.free_casts[0]
    expect(cast).toMatchObject({ kind: 'mystic_arcanum', spell_list: 'bruxo', ability: 'CAR', list_locked: true })
  })

  it('conta o nível de bruxo, não o total do personagem', () => {
    const sheet = makeSheet({
      classId: 'bruxo',
      level: 14,
      multiclasses: [{ class_id: 'guerreiro', level: 4 }],
    })
    // bruxo 10 → nenhuma Arcana Mística, mesmo com personagem de nível 14
    expect(sheet.spellcasting.free_casts).toHaveLength(0)
  })
})

describe('escolhas preservadas entre recálculos', () => {
  beforeEach(() => {
    useSheetStore.setState({ sheet: makeSheet({ classId: 'mago', level: 4, feats: [MAGIC_INITIATE_FREE] }) })
  })

  it('setFreeCastChoices guarda lista, atributo, truques e magia', () => {
    const { setFreeCastChoices } = useSheetStore.getState()
    setFreeCastChoices('iniciado_em_magia', { spell_list: 'druida', ability: 'SAB' })
    setFreeCastChoices('iniciado_em_magia', { cantrips: ['Orientação', 'Chama Sagrada'], spell: 'Curar Ferimentos' })

    const cast = useSheetStore.getState().sheet.spellcasting.free_casts[0]
    expect(cast).toMatchObject({
      spell_list: 'druida',
      ability: 'SAB',
      cantrips: ['Orientação', 'Chama Sagrada'],
      spell: 'Curar Ferimentos',
    })
  })

  it('trocar de lista descarta as magias escolhidas na anterior', () => {
    const { setFreeCastChoices } = useSheetStore.getState()
    setFreeCastChoices('iniciado_em_magia', { spell_list: 'druida' })
    setFreeCastChoices('iniciado_em_magia', { cantrips: ['Orientação'], spell: 'Curar Ferimentos' })
    setFreeCastChoices('iniciado_em_magia', { spell_list: 'mago' })

    const cast = useSheetStore.getState().sheet.spellcasting.free_casts[0]
    expect(cast).toMatchObject({ spell_list: 'mago', cantrips: [], spell: null })
  })

  it('subir de nível não apaga as escolhas', () => {
    useSheetStore.getState().setFreeCastChoices('iniciado_em_magia', { spell_list: 'mago', spell: 'Mísseis Mágicos' })
    const sheet = useSheetStore.getState().sheet
    const subiu = recalculate({ ...sheet, identity: { ...sheet.identity, level: 8 } })
    expect(subiu.spellcasting.free_casts[0].spell).toBe('Mísseis Mágicos')
  })
})

describe('gasto das conjurações sem espaço', () => {
  beforeEach(() => {
    useSheetStore.setState({ sheet: makeSheet({ classId: 'bruxo', level: 11 }) })
  })

  it('gasta e restaura um uso, sem passar do máximo', () => {
    const st = () => useSheetStore.getState()
    st().spendFreeCast('mystic_arcanum_6')
    expect(st().sheet.spellcasting.free_casts[0].spent).toBe(1)
    st().spendFreeCast('mystic_arcanum_6')
    expect(st().sheet.spellcasting.free_casts[0].spent).toBe(1)
    st().restoreFreeCast('mystic_arcanum_6')
    expect(st().sheet.spellcasting.free_casts[0].spent).toBe(0)
  })

  it('o Descanso Longo devolve; o Curto não', () => {
    const st = () => useSheetStore.getState()
    st().spendFreeCast('mystic_arcanum_6')
    st().shortRest()
    expect(st().sheet.spellcasting.free_casts[0].spent).toBe(1)
    st().longRest()
    expect(st().sheet.spellcasting.free_casts[0].spent).toBe(0)
  })
})

describe('rótulo e pendência', () => {
  const t = (key: string, opts?: Record<string, unknown>) =>
    key + (opts ? `(${Object.values(opts).join(',')})` : '')

  it('monta o rótulo a partir da lista, não de um texto gravado', () => {
    const initiate = makeSheet({ classId: 'barbaro', level: 3, feats: [MAGIC_INITIATE_PT] }).spellcasting.free_casts[0]
    // o nome da classe vem do catálogo traduzido, então acompanha o idioma da UI
    const clericName = gameData.classes.find(c => c.id === 'clerigo')?.name
    expect(freeCastLabel(initiate, t)).toBe(`magic.magicInitiateOf(${clericName})`)

    const arcanum = makeSheet({ classId: 'bruxo', level: 11 }).spellcasting.free_casts[0]
    expect(freeCastLabel(arcanum, t)).toBe('magic.mysticArcanum(6)')
  })

  it('aponta o que ainda falta escolher', () => {
    const sheet = createInitialSheet()
    const cast = makeSheet({ classId: 'barbaro', level: 3, feats: [MAGIC_INITIATE_PT] }).spellcasting.free_casts[0]
    expect(sheet.spellcasting.free_casts).toHaveLength(0)
    expect(isFreeCastIncomplete(cast)).toBe(true)
    expect(isFreeCastIncomplete({ ...cast, ability: 'SAB', cantrips: ['a', 'b'], spell: 'c' })).toBe(false)
  })
})
