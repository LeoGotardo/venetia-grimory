import { describe, it, expect } from 'vitest'
import { generateNpc, genderize, resolveArchetype, rerollField, varyStatBlock } from './npcGenerator'
import { NPC_ARCHETYPES, NPC_NAMES, NPC_PHRASES, NPC_SPECIES } from '../../data/npcTables'
import { loadSrdMonsters } from '../../data/monsters'
import { calcModifier } from '../calculations'
import { gameDataPt } from '../../data/rules'

const en = await loadSrdMonsters('en')
const guard = en.find(m => m.id === 'srd-guard')!.statblock

/** RNG determinístico (LCG) — o mesmo seed gera o mesmo NPC. */
function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

describe('tabelas de NPC', () => {
  it('todo arquétipo aponta para um bloco que existe no SRD', () => {
    const ids = new Set(en.map(m => m.id))
    expect(NPC_ARCHETYPES.filter(a => !ids.has(a.srd)).map(a => a.id)).toEqual([])
  })

  it('toda espécie do gerador existe nos dados de regras', () => {
    const ids = new Set(gameDataPt.species.map(s => s.id))
    expect(NPC_SPECIES.filter(s => !ids.has(s))).toEqual([])
  })

  it('PT e EN têm as mesmas listas com o mesmo tamanho', () => {
    const shape = (lang: 'pt' | 'en') => Object.fromEntries(Object.entries(NPC_PHRASES[lang]).map(([k, v]) => [
      k, Array.isArray(v) ? v.length : Object.fromEntries(Object.entries(v).map(([g, list]) => [g, (list as string[]).length])),
    ]))
    expect(shape('pt')).toEqual(shape('en'))
  })

  it('nenhuma frase vazia ou repetida, e toda espécie tem nomes', () => {
    for (const lang of ['pt', 'en'] as const) {
      for (const [key, value] of Object.entries(NPC_PHRASES[lang])) {
        const lists = Array.isArray(value) ? [value] : Object.values(value)
        for (const list of lists as string[][]) {
          expect(list.every(s => s.trim() !== ''), `${lang}.${key}`).toBe(true)
          expect(new Set(list).size, `${lang}.${key}`).toBe(list.length)
        }
      }
    }
    for (const sp of NPC_SPECIES) {
      expect(NPC_NAMES[sp].f.length).toBeGreaterThan(0)
      expect(NPC_NAMES[sp].m.length).toBeGreaterThan(0)
      expect(NPC_NAMES[sp].family.length).toBeGreaterThan(0)
    }
  })
})

describe('generateNpc', () => {
  it('mantém o que o mestre preencheu e sorteia o resto', () => {
    const { statblock, profile } = generateNpc(
      { name: 'Berta Fole', species: 'anao', occupation: 'Ferreira da vila', secret: '' },
      'guard', guard, 'pt', seeded(1),
    )
    expect(statblock.name).toBe('Berta Fole')
    expect(profile.species).toBe('anao')
    expect(profile.occupation).toBe('Ferreira da vila')
    expect(profile.archetype).toBe('guard')
    expect(NPC_PHRASES.pt.secret.map(x => genderize(x, profile.gender))).toContain(profile.secret)
    expect(NPC_PHRASES.pt.appearance.map(x => genderize(x, profile.gender))).toContain(profile.appearance)
  })

  it('sorteia no idioma pedido', () => {
    const { profile } = generateNpc({}, 'guard', guard, 'en', seeded(2))
    expect(NPC_PHRASES.en.personality).toContain(profile.personality)
    expect(NPC_PHRASES.en.occupations.martial).toContain(profile.occupation)
  })

  it('mesmo seed, mesmo NPC', () => {
    expect(generateNpc({}, 'guard', guard, 'pt', seeded(7))).toEqual(generateNpc({}, 'guard', guard, 'pt', seeded(7)))
  })

  it('nome sorteado vem da tabela da espécie e do gênero', () => {
    const { statblock, profile } = generateNpc({ species: 'elfo', gender: 'f' }, 'guard', guard, 'pt', seeded(3))
    expect(profile.gender).toBe('f')
    const [first] = statblock.name.split(' ')
    expect(NPC_NAMES.elfo.f).toContain(first)
  })

  it('espécie desconhecida é sorteada em vez de aceita', () => {
    const { profile } = generateNpc({ species: 'xyz' }, 'guard', guard, 'pt', seeded(4))
    expect(NPC_SPECIES).toContain(profile.species)
  })
})

describe('resolveArchetype', () => {
  it('respeita o arquétipo pedido', () => {
    expect(resolveArchetype({ archetype: 'mage' }, seeded(1))).toBe('mage')
  })
  it('sorteia um arquétipo válido quando vazio ou inválido', () => {
    const ids = NPC_ARCHETYPES.map(a => a.id) as string[]
    expect(ids).toContain(resolveArchetype({}, seeded(5)))
    expect(ids).toContain(resolveArchetype({ archetype: 'dragão' }, seeded(5)))
  })
})

describe('varyStatBlock', () => {
  it('atributos variam no máximo 2 e PV/iniciativa/perícias acompanham', () => {
    for (let seed = 1; seed < 40; seed++) {
      const v = varyStatBlock(guard, seeded(seed))
      for (const a of Object.keys(guard.abilities) as (keyof typeof guard.abilities)[]) {
        expect(Math.abs(v.abilities[a] - guard.abilities[a])).toBeLessThanOrEqual(2)
      }
      const dexDelta = calcModifier(v.abilities.DES) - calcModifier(guard.abilities.DES)
      expect(v.initiative_bonus).toBe(guard.initiative_bonus == null ? null : guard.initiative_bonus + dexDelta)
      const wisDelta = calcModifier(v.abilities.SAB) - calcModifier(guard.abilities.SAB)
      expect(v.skills.percepcao).toBe(guard.skills.percepcao + wisDelta)
      expect(v.hp.average).toBeGreaterThan(0)
      expect(v.hp.formula).toMatch(/^\d+d\d+([+-]\d+)?$/)
      expect(v.ac).toBe(guard.ac)
    }
  })

  it('sem variação, o bloco de PV continua coerente com o original', () => {
    const v = varyStatBlock(guard, () => 0.5) // índice 3 → delta 0
    expect(v.abilities).toEqual(guard.abilities)
    expect(v.hp).toEqual(guard.hp)
  })
})

describe('gênero nas frases PT', () => {
  it('resolve {masc|fem} pelo gênero, masculino genérico sem gênero', () => {
    expect(genderize('Ferreir{o|a}', 'f')).toBe('Ferreira')
    expect(genderize('Pescador{|a}', 'm')).toBe('Pescador')
    expect(genderize('{Ladrão|Ladra} de túmulos', 'x')).toBe('Ladrão de túmulos')
  })

  it('nenhuma marca sobra nem fica malformada', () => {
    const all = Object.values(NPC_PHRASES.pt).flatMap(v => (Array.isArray(v) ? v : Object.values(v).flat()))
    for (const g of ['f', 'm', 'x'] as const) {
      expect(all.map(x => genderize(x, g)).filter(x => /[{}|]/.test(x))).toEqual([])
    }
    // O EN não usa marcas.
    const en = Object.values(NPC_PHRASES.en).flatMap(v => (Array.isArray(v) ? v : Object.values(v).flat()))
    expect(en.filter(x => /[{}|]/.test(x))).toEqual([])
  })

  it('o NPC gerado concorda com o próprio gênero', () => {
    const { profile } = generateNpc({ gender: 'f', occupation: '', archetype: 'guard' }, 'guard', guard, 'pt', seeded(11))
    expect(profile.occupation).not.toMatch(/[{}|]/)
    expect(NPC_PHRASES.pt.occupations.martial.map(x => genderize(x, 'f'))).toContain(profile.occupation)
  })
})

describe('rerollField', () => {
  it('ocupação respeita o grupo do arquétipo', () => {
    expect(NPC_PHRASES.pt.occupations.arcane.map(x => genderize(x, 'm'))).toContain(genderize(rerollField('occupation', 'mage', 'pt', 'm', seeded(9)), 'm'))
  })
})
