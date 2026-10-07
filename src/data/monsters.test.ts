import { describe, it, expect } from 'vitest'
import { loadSrdMonsters } from './monsters'
import { normalizeStatBlock } from '../lib/gm/statblock'
import { parseDice } from '../lib/gm/dice'

const [pt, en] = await Promise.all([loadSrdMonsters('pt'), loadSrdMonsters('en')])

/**
 * O catálogo é gerado (scripts/srd/generate-monsters.mjs). Estas checagens pegam
 * um gerador que quebrou em silêncio — campo fora do formato, idioma divergente.
 */
describe('catálogo SRD 5.2.1', () => {
  it('tem os 330 monstros nos dois idiomas, mesmos ids na mesma ordem', () => {
    expect(en).toHaveLength(330)
    expect(pt.map(m => m.id)).toEqual(en.map(m => m.id))
    expect(new Set(en.map(m => m.id)).size).toBe(en.length)
  })

  it('cada bloco já está no formato que o app normaliza (nada é descartado ao carregar)', () => {
    const broken = [...pt, ...en].filter(m => JSON.stringify(normalizeStatBlock(m.statblock)) !== JSON.stringify(m.statblock))
    expect(broken.map(m => m.id)).toEqual([])
  })

  it('números da mecânica batem entre os idiomas', () => {
    const mechanics = (list: typeof en) => list.map(m => [
      m.statblock.cr, m.statblock.ac, m.statblock.hp, m.statblock.abilities, m.statblock.skills,
      m.statblock.actions.map(a => [a.attack_bonus, a.damage, a.save_dc]),
    ])
    expect(mechanics(pt)).toEqual(mechanics(en))
  })

  it('todo dano extraído é uma expressão de dados que o rastreador sabe rolar', () => {
    const bad = en.flatMap(m => [...m.statblock.actions, ...m.statblock.bonus_actions, ...m.statblock.reactions, ...m.statblock.legendary_actions, ...m.statblock.traits]
      .filter(f => f.damage && !parseDice(f.damage))
      .map(f => `${m.id}: ${f.damage}`))
    expect(bad).toEqual([])
  })

  it('amostra conferida à mão: Goblin Warrior', () => {
    const goblin = en.find(m => m.id === 'srd-goblin-warrior')!.statblock
    expect(goblin).toMatchObject({
      size: 'small', creature_type: 'fey', ac: 15, initiative_bonus: 2, cr: '1/4',
      hp: { average: 10, formula: '3d6' }, skills: { furtividade: 6 },
      senses: { darkvision: 18 },
    })
    expect(goblin.actions[0]).toMatchObject({ name: 'Scimitar', attack_bonus: 4, damage: '1d6+2', damage_type: 'Slashing' })
  })
})

/**
 * A fonte em markdown tinha criaturas coladas umas nas outras, rótulos perdidos
 * ("Hit:", "Failure:") e frases cortadas — os casos achados viraram overrides em
 * scripts/srd/overrides. Estas checagens impedem que um defeito igual volte.
 */
describe('catálogo SRD 5.2.1: texto', () => {
  const texts = (list: typeof en) => list.flatMap(m =>
    [...m.statblock.traits, ...m.statblock.actions, ...m.statblock.bonus_actions, ...m.statblock.reactions, ...m.statblock.legendary_actions]
      .map(f => ({ id: m.id, name: f.name, text: f.description })))

  it('nenhum resto de marcação, rótulo perdido ou distância em pés', () => {
    const bad = texts(en).filter(({ text }) =>
      /&\w+;|\*|Attack Roll: [+−-]\d+[^.]*? m \d+ \(|(effect|throw)\. DC \d+\. The target|\b(feet|ft\.)|MOD \| SAVE/.test(text))
    expect(bad.map(b => `${b.id}: ${b.name}`)).toEqual([])
  })

  it('o catálogo em português não tem trecho em inglês', () => {
    const english = /\b(the|damage|Attack Roll|Saving Throw|Hit:|Failure:|Success:)\b/
    const bad = texts(pt).filter(({ text, name }) => english.test(text) || english.test(name))
    expect(bad.map(b => `${b.id}: ${b.name}`)).toEqual([])
    expect(pt.filter(m => /\b(Dragon|Giant|Warrior)\b/.test(m.statblock.name)).map(m => m.id)).toEqual([])
  })
})
