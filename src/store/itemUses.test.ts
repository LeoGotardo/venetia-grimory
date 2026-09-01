import { describe, it, expect, beforeEach } from 'vitest'
import { useSheetStore } from './sheetStore'
import { makeSheet } from '../test/fixtures'

const st = () => useSheetStore.getState()
const item = () => st().sheet.inventory.items[0]
const pact = () => st().sheet.spellcasting.pact_slots
const slots = () => st().sheet.spellcasting.spell_slots

describe('Bastão do Guardião do Pacto', () => {
  beforeEach(() => {
    useSheetStore.setState({
      sheet: makeSheet({ classId: 'bruxo', level: 5, items: [{ item_id: 'rod_of_the_pact_keeper' }] }),
    })
  })

  it('devolve um espaço de pacto ao gastar o uso', () => {
    st().spendPactSlot()
    st().spendPactSlot()
    expect(pact().spent).toBe(2)

    st().spendItemUse(0)
    expect(pact().spent).toBe(1)
    expect(item().uses_spent).toBe(1)
  })

  it('é um uso por dia — o segundo não faz nada', () => {
    st().spendPactSlot()
    st().spendPactSlot()
    st().spendItemUse(0)
    st().spendItemUse(0)
    expect(item().uses_spent).toBe(1)
    expect(pact().spent).toBe(1)
  })

  it('o Descanso Curto devolve o espaço de pacto, mas não o uso do item', () => {
    st().spendPactSlot()
    st().spendItemUse(0)
    st().spendPactSlot()
    st().shortRest()
    expect(pact().spent).toBe(0)
    expect(item().uses_spent).toBe(1)
  })

  it('o Descanso Longo devolve o uso (recarga diária)', () => {
    st().spendItemUse(0)
    st().longRest()
    expect(item().uses_spent).toBe(0)
  })
})

describe('Pérola do Poder', () => {
  beforeEach(() => {
    useSheetStore.setState({
      sheet: makeSheet({ classId: 'mago', level: 5, items: [{ item_id: 'pearl_of_power' }] }),
    })
  })

  it('devolve um espaço do círculo escolhido', () => {
    st().spendSlot('c3')
    st().spendItemUse(0, 3)
    expect(slots().c3.spent).toBe(0)
    expect(item().uses_spent).toBe(1)
  })

  it('não queima a carga num círculo sem espaço gasto', () => {
    st().spendSlot('c1')
    st().spendItemUse(0, 2)
    expect(item().uses_spent).toBeNull()
    expect(slots().c1.spent).toBe(1)
  })

  it('não alcança círculo acima do limite do item', () => {
    // mago 9 já tem 4º círculo, que está fora do alcance da pérola (até o 3º)
    useSheetStore.setState({
      sheet: makeSheet({ classId: 'mago', level: 9, items: [{ item_id: 'pearl_of_power' }] }),
    })
    st().spendSlot('c4')
    st().spendItemUse(0, 4)
    expect(item().uses_spent).toBeNull()
    expect(slots().c4.spent).toBe(1)
  })

  it('exige a escolha do círculo — sem ela o uso é recusado', () => {
    st().spendSlot('c1')
    st().spendItemUse(0)
    expect(item().uses_spent).toBeNull()
    expect(slots().c1.spent).toBe(1)
  })
})

describe('itens de recarga lenta', () => {
  beforeEach(() => {
    // Varinha de Mísseis Mágicos: 7 cargas, recuperadas 1d6+1 por dia → `manual`
    useSheetStore.setState({
      sheet: makeSheet({ classId: 'mago', level: 5, items: [{ item_id: 'wand_of_magic_missiles' }] }),
    })
  })

  it('gasta até o máximo do catálogo e para', () => {
    for (let i = 0; i < 9; i++) st().spendItemUse(0)
    expect(item().uses_spent).toBe(7)
  })

  it('o Descanso Longo NÃO devolve as cargas', () => {
    st().spendItemUse(0)
    st().spendItemUse(0)
    st().longRest()
    expect(item().uses_spent).toBe(2)
  })

  it('a devolução manual é uma carga por vez e não passa de zero', () => {
    st().spendItemUse(0)
    st().restoreItemUse(0)
    expect(item().uses_spent).toBe(0)
    st().restoreItemUse(0)
    expect(item().uses_spent).toBe(0)
  })
})

describe('itens sem orçamento de usos', () => {
  it('ignoram o gasto', () => {
    useSheetStore.setState({
      sheet: makeSheet({ classId: 'mago', level: 5, items: [{ item_id: 'cota_de_malha' }] }),
    })
    st().spendItemUse(0)
    expect(item().uses_spent).toBeNull()
  })
})

describe('Talento de Origem da espécie', () => {
  beforeEach(() => {
    useSheetStore.setState({ sheet: makeSheet({ classId: 'barbaro', level: 3 }) })
  })

  it('o Humano concede um talento de Origem, que vira conjuração sem espaço', () => {
    st().setSpecies('humano')
    st().setSpeciesOriginFeat('iniciado_em_magia')

    const sheet = st().sheet
    expect(sheet.feats.list).toHaveLength(1)
    expect(sheet.feats.list[0]).toMatchObject({ feat_id: 'iniciado_em_magia', source: 'especie' })
    expect(sheet.spellcasting.free_casts).toHaveLength(1)
  })

  it('só cabe um: escolher outro substitui o anterior', () => {
    st().setSpecies('humano')
    st().setSpeciesOriginFeat('iniciado_em_magia')
    st().setSpeciesOriginFeat('habilidoso')
    expect(st().sheet.feats.list.map(f => f.feat_id)).toEqual(['habilidoso'])
    expect(st().sheet.spellcasting.free_casts).toHaveLength(0)
  })

  it('trocar de espécie descarta o talento concedido', () => {
    st().setSpecies('humano')
    st().setSpeciesOriginFeat('iniciado_em_magia')
    st().setSpecies('elfo')
    expect(st().sheet.feats.list).toHaveLength(0)
    expect(st().sheet.spellcasting.free_casts).toHaveLength(0)
  })
})
