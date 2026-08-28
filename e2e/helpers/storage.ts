import type { Page } from '@playwright/test'
import { createInitialSheet } from '../../src/lib/initialSheet'
import type { CharacterSheet } from '../../src/types'

export const STORAGE_KEY_LIST = 'dnd_fichas_lista'
export const STORAGE_KEY_SHEET_PREFIX = 'dnd_ficha_'
export const STORAGE_KEY_CONFIG = 'venetia-config'

export interface SheetListItem {
  id: string
  name: string
  charClass: string
  species: string
  level: number
  updatedAt: string
  complete?: boolean
}

/**
 * Guerreiro Campeão nível 3, humano, soldado.
 * Valores derivados calculados à mão para manter a fixture independente
 * de `recalculate()` (que importa os módulos de dados do app).
 *
 * FOR 16 (+3) · DES 14 (+2) · CON 14 (+2) · INT 10 (0) · SAB 12 (+1) · CAR 8 (-1)
 * Bônus de proficiência nível 3 = +2
 * PV = (10 + 2) + 2 × (6 + 2) = 28 · CA sem armadura = 10 + 2 = 12
 */
export function createCompleteSheet(overrides: Partial<CharacterSheet['identity']> = {}): CharacterSheet {
  const s = createInitialSheet()

  s.identity = {
    ...s.identity,
    character_name: 'Aria Sombravéu',
    player_name: 'Jogador E2E',
    class_id: 'guerreiro',
    subclass_id: 'campeao',
    species_id: 'humano',
    background_id: 'soldado',
    level: 3,
    xp: 900,
    alignment: { ethical: 'Leal', moral: 'Bom' },
    ...overrides,
  }

  const values: Record<string, number> = { FOR: 16, DES: 14, CON: 14, INT: 10, SAB: 12, CAR: 8 }
  for (const [attr, value] of Object.entries(values)) {
    s.abilities[attr as 'FOR'] = { value, _modifier: Math.floor((value - 10) / 2) }
  }
  s.abilities.generation_method = 'standard'

  s.combat._proficiency_bonus = 2
  s.combat.hit_points = { max: 28, current: 28, temporary: 0 }
  s.combat.hit_dice = { type: 'd10', total: 3, spent: 0 }
  s.combat.armor_class = { value: 12, source: null, shield_equipped: false, equipped_armor_id: null }
  s.combat.initiative = { _value: 2 }
  s.combat.speed = { base_meters: 9, bonus_meters: 0, _total_meters: 9 }
  s.combat.saves.FOR = { proficient: true, _value: 5 }
  s.combat.saves.CON = { proficient: true, _value: 4 }
  s.combat.saves.DES = { proficient: false, _value: 2 }
  s.combat.saves.INT = { proficient: false, _value: 0 }
  s.combat.saves.SAB = { proficient: false, _value: 1 }
  s.combat.saves.CAR = { proficient: false, _value: -1 }

  // Perícias do antecedente Soldado + duas de classe
  for (const skillId of ['atletismo', 'intimidacao', 'acrobacia', 'historia']) {
    s.skills[skillId] = { ...s.skills[skillId], proficient: true }
  }
  const modByAbility: Record<string, number> = { FOR: 3, DES: 2, CON: 2, INT: 0, SAB: 1, CAR: -1 }
  for (const skillId of Object.keys(s.skills)) {
    const skill = s.skills[skillId]
    skill._value = modByAbility[skill.ability] + (skill.proficient ? 2 : 0)
  }

  s.proficiencies.languages = ['comum', 'draconico', 'elfico']
  s.inventory.coins = { PC: 0, PP: 0, PE: 0, PO: 25, PL: 0 }
  s.inventory.items = [
    {
      item_id: 'kit_opcao_a',
      name: 'Cota de Malha, Espada Grande, Mangual',
      category: 'kit',
      quantity: 1,
      equipped: false,
      cost_gp: null,
      weight_kg: null,
      notes: null,
    },
  ]

  return s
}

/**
 * Ficha de conjurador no formato anterior ao split de magias por classe
 * (`known_cantrips` / `prepared_spells`, sem os campos `*_by_class`).
 * Serve para cobrir a migração de fichas antigas do localStorage.
 */
export function createLegacySpellcasterSheet(): CharacterSheet {
  const s = createCompleteSheet({
    character_name: 'Elowen Vento-Claro',
    class_id: 'mago',
    subclass_id: 'abjurador',
  })

  const legacySpellcasting = {
    spellcaster: true,
    spellcasting_ability: 'INT',
    _spell_dc: 13,
    _spell_attack_bonus: 5,
    known_cantrips: ['Raio Gélido', 'Luz'],
    prepared_spells: ['Mísseis Mágicos', 'Escudo'],
    spellbook: [],
    spell_slots: {
      c1: { max: 4, spent: 1 }, c2: { max: 2, spent: 0 }, c3: { max: 0, spent: 0 },
      c4: { max: 0, spent: 0 }, c5: { max: 0, spent: 0 }, c6: { max: 0, spent: 0 },
      c7: { max: 0, spent: 0 }, c8: { max: 0, spent: 0 }, c9: { max: 0, spent: 0 },
    },
    pact_slots: { level: null, max: 0, spent: 0 },
  }

  const legacy = s as unknown as Record<string, unknown>
  legacy.spellcasting = legacySpellcasting
  delete (legacy.identity as Record<string, unknown>).multiclasses
  delete (legacy.identity as Record<string, unknown>).background_distribution

  return s
}

/**
 * A mesma ficha, mas no formato salvo antes da renomeação dos campos de PT para
 * EN — as chaves do localStorage não mudaram, então fichas assim ainda chegam ao
 * app e passam por `translateLegacyPtSheet`.
 */
export function createLegacyPtSheet(): Record<string, unknown> {
  return {
    identidade: {
      nome_personagem: 'Bruenor Battlehammer',
      nome_jogador: 'Jogador E2E',
      classe_id: 'guerreiro',
      subclasse_id: 'campeao',
      especie_id: 'humano',
      antecedente_id: 'soldado',
      nivel: 3,
      xp: 900,
      alinhamento: { etico: 'Leal', moral: 'Bom' },
    },
    atributos: {
      FOR: { valor: 16, _modificador: 3 },
      DES: { valor: 14, _modificador: 2 },
      CON: { valor: 14, _modificador: 2 },
      INT: { valor: 10, _modificador: 0 },
      SAB: { valor: 12, _modificador: 1 },
      CAR: { valor: 8, _modificador: -1 },
      metodo_geracao: 'padrao',
    },
    combate: {
      _bonus_proficiencia: 2,
      pontos_de_vida: { maximo: 28, atual: 21, temporario: 0 },
      dados_de_vida: { tipo: 'd10', total: 3, gastos: 0 },
      classe_de_armadura: { valor: 12, origem: null, escudo_equipado: false, armadura_equipada_id: null },
      iniciativa: { _valor: 2 },
      deslocamento: { base_metros: 9, bonus_metros: 0, _total_metros: 9 },
      ataques: [],
      salvaguardas: {
        FOR: { proficiente: true, _valor: 5 },
        DES: { proficiente: false, _valor: 2 },
        CON: { proficiente: true, _valor: 4 },
        INT: { proficiente: false, _valor: 0 },
        SAB: { proficiente: false, _valor: 1 },
        CAR: { proficiente: false, _valor: -1 },
      },
    },
    pericias: {
      atletismo: { atributo: 'FOR', proficiente: true, expertise: false, _valor: 5 },
      historia: { atributo: 'INT', proficiente: true, expertise: false, _valor: 2 },
    },
    proficiencias: { armaduras: [], armas: [], ferramentas: [], idiomas: ['comum', 'draconico'] },
    inventario: {
      moedas: { PC: 0, PP: 0, PE: 0, PO: 25, PL: 0 },
      itens: [
        {
          id_item: 'espada_longa',
          nome: 'Espada Longa',
          categoria: 'arma',
          quantidade: 1,
          equipado: true,
          custo_po: 15,
          peso_kg: 1.5,
          notas: null,
        },
      ],
    },
    personalidade: {
      tracos: ['Encaro os problemas de frente.'],
      ideais: ['Liberdade.'],
      vinculos: [],
      fraquezas: [],
      historia: 'Veterano de mil batalhas.',
      aparencia_descricao: null,
      aliados_e_organizacoes: null,
      simbolo_ou_tesouro: null,
    },
    condicoes_ativas: [],
    niveis_de_exaustao: 0,
    notas: null,
  }
}

/** Item da lista de fichas no formato antigo, em português. */
export function createLegacyPtListItem(id: string, name: string): Record<string, unknown> {
  return {
    id,
    nome: name,
    classe: 'guerreiro',
    especie: 'humano',
    nivel: 3,
    updatedAt: new Date().toISOString(),
    completa: true,
  }
}

export function createListItem(id: string, sheet: CharacterSheet, complete = true): SheetListItem {
  return {
    id,
    name: sheet.identity.character_name ?? '',
    charClass: sheet.identity.class_id ?? '—',
    species: sheet.identity.species_id ?? '—',
    level: sheet.identity.level,
    updatedAt: new Date().toISOString(),
    complete,
  }
}

/** Grava uma ficha no localStorage antes de qualquer script da página rodar. */
export async function seedSheet(
  page: Page,
  { id, sheet, complete = true }: { id: string; sheet: CharacterSheet; complete?: boolean },
): Promise<void> {
  await seedRaw(page, { id, sheetJson: JSON.stringify(sheet), itemJson: JSON.stringify(createListItem(id, sheet, complete)) })
}

/** Mesma semeadura, mas com JSON cru — usada pelas fichas em formato antigo. */
export async function seedRaw(
  page: Page,
  { id, sheetJson, itemJson }: { id: string; sheetJson: string; itemJson: string },
): Promise<void> {
  await page.addInitScript(
    ({ sheetKey, listKey, sheetValue, itemValue }) => {
      // roda a cada navegação: só semeia na primeira vez, senão desfaz
      // as alterações que o próprio app salvou.
      if (window.localStorage.getItem(sheetKey)) return
      window.localStorage.setItem(sheetKey, sheetValue)
      const rawList = window.localStorage.getItem(listKey)
      const list = rawList ? JSON.parse(rawList) : []
      list.push(JSON.parse(itemValue))
      window.localStorage.setItem(listKey, JSON.stringify(list))
    },
    {
      sheetKey: `${STORAGE_KEY_SHEET_PREFIX}${id}`,
      listKey: STORAGE_KEY_LIST,
      sheetValue: sheetJson,
      itemValue: itemJson,
    },
  )
}

/** Fixa o idioma da interface antes do carregamento (o i18n lê no boot). */
export async function setLanguage(page: Page, language: 'pt' | 'en'): Promise<void> {
  await page.addInitScript(
    ({ key, value }) => window.localStorage.setItem(key, value),
    {
      key: STORAGE_KEY_CONFIG,
      value: JSON.stringify({
        state: {
          config: {
            track_weight: true,
            manage_gold: true,
            sale_refund: true,
            simple_coins: false,
            language,
          },
        },
        version: 1,
      }),
    },
  )
}

/** Preferências no formato antigo (v0, campos em português). */
export async function setLegacyPtLanguage(page: Page, language: 'pt' | 'en'): Promise<void> {
  await page.addInitScript(
    ({ key, value }) => window.localStorage.setItem(key, value),
    {
      key: STORAGE_KEY_CONFIG,
      value: JSON.stringify({
        state: {
          config: {
            rastrear_peso: true,
            gerenciar_ouro: true,
            reembolso_venda: true,
            moedas_simples: false,
            lingua: language,
          },
        },
        version: 0,
      }),
    },
  )
}

export async function readList(page: Page): Promise<SheetListItem[]> {
  const raw = await page.evaluate(key => window.localStorage.getItem(key), STORAGE_KEY_LIST)
  return raw ? (JSON.parse(raw) as SheetListItem[]) : []
}
