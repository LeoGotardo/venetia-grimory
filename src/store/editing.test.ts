import { describe, it, expect, beforeEach } from 'vitest'
import { useSheetStore } from './sheetStore'
import { makeSheet } from '../test/fixtures'

const st = () => useSheetStore.getState()
const sheet = () => st().sheet
const featIds = () => sheet().feats.list.map(f => f.feat_id)

/**
 * A aba Editar é a única porta para vários campos depois que o wizard termina.
 * O que está coberto aqui são as ações que ela passou a usar.
 */
describe('talentos adicionados à mão', () => {
  beforeEach(() => {
    useSheetStore.setState({ sheet: makeSheet({ classId: 'guerreiro', level: 4 }) })
  })

  it('aceita talento de Origem e o marca como manual', () => {
    st().addFeat('iniciado_em_magia')
    expect(featIds()).toEqual(['iniciado_em_magia'])
    expect(sheet().feats.list[0]).toMatchObject({ category: 'Origem', source: 'manual' })
  })

  it('o talento adicionado passa pelo recálculo — Iniciado em Magia vira conjuração grátis', () => {
    st().addFeat('iniciado_em_magia')
    expect(sheet().spellcasting.free_casts).toHaveLength(1)
    st().removeFeat('iniciado_em_magia')
    expect(sheet().spellcasting.free_casts).toHaveLength(0)
  })

  it('não duplica nem aceita id desconhecido', () => {
    st().addFeat('iniciado_em_magia')
    st().addFeat('iniciado_em_magia')
    st().addFeat('talento_que_nao_existe')
    expect(featIds()).toEqual(['iniciado_em_magia'])
  })

  it('remove qualquer talento, inclusive o concedido pela espécie', () => {
    st().setSpecies('humano')
    st().setSpeciesOriginFeat('habilidoso')
    expect(featIds()).toEqual(['habilidoso'])
    st().removeFeat('habilidoso')
    expect(featIds()).toEqual([])
  })
})

describe('especialização em perícia', () => {
  beforeEach(() => {
    useSheetStore.setState({ sheet: makeSheet({ classId: 'ladino', level: 3 }) })
  })

  it('liga e desliga sem mexer nas outras', () => {
    st().setSkills(['atletismo', 'furtividade'])
    st().setExpertise(['furtividade'])
    expect(sheet().skills.furtividade.expertise).toBe(true)
    expect(sheet().skills.atletismo.expertise).toBe(false)

    st().setExpertise([])
    expect(sheet().skills.furtividade.expertise).toBe(false)
  })

  it('dobra o bônus de proficiência no valor da perícia', () => {
    st().setSkills(['furtividade'])
    const comProficiencia = sheet().skills.furtividade._value
    st().setExpertise(['furtividade'])
    // BP 2 no nível 3: especialização soma outro +2
    expect(sheet().skills.furtividade._value).toBe((comProficiencia ?? 0) + 2)
  })
})

describe('antecedente aplicado pela aba Editar', () => {
  beforeEach(() => {
    useSheetStore.setState({ sheet: makeSheet({ classId: 'guerreiro', level: 3 }) })
  })

  it('concede perícias e o talento do antecedente', () => {
    st().setBackground('acolito', { SAB: 2, CAR: 1 })
    expect(sheet().skills.religiao.proficient).toBe(true)
    expect(sheet().skills.intuicao.proficient).toBe(true)
    expect(featIds()).toEqual(['Iniciado em Magia (Clérigo)'])
    expect(sheet().spellcasting.free_casts[0]).toMatchObject({ spell_list: 'clerigo' })
  })

  it('aplica os +3 pontos nos atributos', () => {
    const antes = sheet().abilities.SAB.value ?? 0
    st().setBackground('acolito', { SAB: 2, CAR: 1 })
    expect(sheet().abilities.SAB.value).toBe(antes + 2)
    expect(sheet().abilities.CAR.value).toBe(antes + 1)
  })

  it('desfaz a distribuição anterior antes de aplicar a nova', () => {
    const antes = sheet().abilities.SAB.value ?? 0
    st().setBackground('acolito', { SAB: 2, CAR: 1 })
    st().setBackground('acolito', { FOR: 1, DES: 1, CON: 1 })
    expect(sheet().abilities.SAB.value).toBe(antes)
    expect(sheet().abilities.FOR.value).toBe((antes) + 1)
    expect(sheet().identity.background_distribution).toEqual({ FOR: 1, DES: 1, CON: 1 })
  })
})

describe('escolhas de classe', () => {
  it('gravam e sobrevivem ao recálculo', () => {
    useSheetStore.setState({ sheet: makeSheet({ classId: 'clerigo', level: 3 }) })
    st().setClassChoices({ divine_order: 'protetor' })
    expect(sheet().class_features.divine_order).toBe('protetor')

    st().setLevel(4)
    expect(sheet().class_features.divine_order).toBe('protetor')
  })

  it('mudar uma escolha não apaga as outras', () => {
    useSheetStore.setState({ sheet: makeSheet({ classId: 'guardiao', level: 4 }) })
    st().setClassChoices({ fighting_style: 'defesa' })
    st().setClassChoices({ favored_enemy: 'aberracoes' })
    expect(sheet().class_features.fighting_style).toBe('defesa')
    expect(sheet().class_features.favored_enemy).toBe('aberracoes')
  })
})

describe('ataques anotados', () => {
  beforeEach(() => {
    useSheetStore.setState({ sheet: makeSheet({ classId: 'guerreiro', level: 3 }) })
  })

  const attack = (name: string) => ({
    name,
    weapon_id: null,
    type: 'Corpo a Corpo' as const,
    ability_used: null,
    _attack_bonus: 5,
    _damage: '1d8+3',
    damage_type: 'Cortante',
    properties: [],
    notes: null,
  })

  it('adiciona e remove pelo índice', () => {
    st().addAttack(attack('Espada Longa'))
    st().addAttack(attack('Arco Curto'))
    expect(sheet().combat.attacks.map(a => a.name)).toEqual(['Espada Longa', 'Arco Curto'])

    st().removeAttack(0)
    expect(sheet().combat.attacks.map(a => a.name)).toEqual(['Arco Curto'])
  })
})
