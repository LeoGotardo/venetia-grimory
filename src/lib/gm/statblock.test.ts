import { describe, it, expect } from 'vitest'
import {
  buildMonsterPack,
  createBlankStatBlock,
  crProficiencyBonus,
  crToXp,
  crValue,
  initiativeBonus,
  normalizeStatBlock,
  parseMonsterPack,
  passivePerception,
  proficientSkillBonus,
  saveBonus,
} from './statblock'
import { normalizeCampaign } from './normalize'

describe('números do bloco', () => {
  it('ND → XP e bônus de proficiência', () => {
    expect(crToXp('1/4')).toBe(50)
    expect(crToXp('5')).toBe(1800)
    expect(crValue('1/2')).toBe(0.5)
    expect(['0', '1/2', '4', '5', '8', '9', '16', '17', '29', '30'].map(crProficiencyBonus))
      .toEqual([2, 2, 2, 3, 3, 4, 5, 6, 9, 9])
  })

  it('salvaguarda, iniciativa, perícia e percepção passiva', () => {
    const b = createBlankStatBlock('Ogro')
    b.cr = '5'
    b.abilities = { FOR: 19, DES: 8, CON: 16, INT: 5, SAB: 7, CAR: 7 }
    b.save_proficiencies = ['FOR']
    expect(saveBonus(b, 'FOR')).toBe(7)
    expect(saveBonus(b, 'CON')).toBe(3)
    expect(initiativeBonus(b)).toBe(-1)
    b.initiative_bonus = 2
    expect(initiativeBonus(b)).toBe(2)
    expect(passivePerception(b)).toBe(8)
    expect(proficientSkillBonus(b, 'percepcao')).toBe(1)
    b.skills.percepcao = 1
    expect(passivePerception(b)).toBe(11)
  })
})

describe('normalizeStatBlock', () => {
  it('completa campos ausentes e descarta valores inválidos', () => {
    const b = normalizeStatBlock({
      name: 'Goblin',
      size: 'colossal',
      cr: 0.25,
      abilities: { DES: 14 },
      skills: { furtividade: 6, inexistente: 3, atletismo: 'x' },
      condition_immunities: ['Cego', 'Bêbado'],
      actions: [{ name: 'Cimitarra', attack_bonus: 4, damage: '1d6+2' }],
    })
    expect(b.size).toBe('medium')
    expect(b.cr).toBe('0')
    expect(b.abilities).toEqual({ FOR: 10, DES: 14, CON: 10, INT: 10, SAB: 10, CAR: 10 })
    expect(b.skills).toEqual({ furtividade: 6 })
    expect(b.condition_immunities).toEqual(['Cego'])
    expect(b.actions[0]).toMatchObject({ name: 'Cimitarra', attack_bonus: 4, damage: '1d6+2', save_dc: null })
    expect(b.actions[0].id).toBeTruthy()
  })

  it('ND numérico inteiro é aceito', () => {
    expect(normalizeStatBlock({ cr: 3 }).cr).toBe('3')
  })
})

describe('pacote de monstros', () => {
  it('ida e volta mantém ids e descarta os sem nome', () => {
    const goblin = createBlankStatBlock('Goblin')
    const json = buildMonsterPack([
      { id: 'g1', source: 'custom', statblock: goblin, updated_at: '' },
      { id: 'x', source: 'custom', statblock: createBlankStatBlock(''), updated_at: '' },
    ])
    expect(parseMonsterPack(json)).toEqual([{ id: 'g1', statblock: goblin }])
  })

  it('recusa o que não é pacote', () => {
    expect(() => parseMonsterPack('{"format":"venetia-campaign"}')).toThrow()
    expect(() => parseMonsterPack('nada')).toThrow()
  })
})

describe('normalizeCampaign', () => {
  it('campanha da Fase 1 (sem npcs) ganha lista vazia', () => {
    const c = normalizeCampaign({ id: 'c', name: 'A', party: [], notes: '', created_at: 't', updated_at: 't' })
    expect(c.npcs).toEqual([])
    expect(c.notes).toEqual([])
  })

  it('o texto único de notas antigo vira a primeira nota', () => {
    const c = normalizeCampaign({ id: 'c', name: 'A', party: [], notes: 'ganchos\nsegredos', created_at: 't', updated_at: 'u' })
    expect(c.notes).toEqual([{ id: expect.any(String), title: '', body: 'ganchos\nsegredos', shared: false, created_at: 'u', updated_at: 'u' }])
  })

  it('notas novas passam e as quebradas são completadas', () => {
    const note = { id: 'n1', title: 'Sessão 1', body: '# oi', shared: true, created_at: 'a', updated_at: 'b' }
    const c = normalizeCampaign({ id: 'c', notes: [note, { title: 3 }] })
    expect(c.notes[0]).toEqual(note)
    expect(c.notes[1]).toMatchObject({ id: expect.any(String), title: '', body: '' })
  })
})
