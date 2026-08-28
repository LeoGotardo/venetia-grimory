import type { CharacterSheet } from '../types'
import type { SheetListItem } from '../store/sheetStore'
import type { Config } from '../store/configStore'

/**
 * Fichas, listas e preferências salvas antes da renomeação dos identificadores
 * de PT para EN guardam as chaves antigas no localStorage. As chaves de storage
 * (`dnd_ficha_*`, `dnd_fichas_lista`, `venetia-config`) não mudaram, então o dado
 * antigo continua sendo lido — só a forma dele precisa ser traduzida antes de
 * chegar em `migrateSheet`/`useConfigStore`.
 *
 * A tradução é feita campo a campo, e não por renomeação recursiva de chaves:
 * `pericias` e `escolhas_feitas` são Records com chaves de domínio (`historia`,
 * `natureza`) que colidiriam com nomes de campo.
 */

type Dict = Record<string, unknown>

function isDict(value: unknown): value is Dict {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Renomeia as chaves listadas em `map`; as demais passam intactas. */
function rename(source: unknown, map: Record<string, string>): Dict | undefined {
  if (!isDict(source)) return undefined
  const out: Dict = {}
  for (const [key, value] of Object.entries(source)) out[map[key] ?? key] = value
  return out
}

/** Aplica `rename` a cada item de um array. */
function renameEach(source: unknown, map: Record<string, string>): Dict[] | undefined {
  if (!Array.isArray(source)) return undefined
  return source.map(item => rename(item, map) ?? {})
}

/** Aplica `rename` a cada valor de um Record, preservando as chaves. */
function renameValues(source: unknown, map: Record<string, string>): Dict | undefined {
  if (!isDict(source)) return undefined
  const out: Dict = {}
  for (const [key, value] of Object.entries(source)) out[key] = rename(value, map) ?? value
  return out
}

/** Descarta as chaves cujo valor é `undefined`, para não sobrescrever os padrões. */
function defined(obj: Dict): Dict {
  const out: Dict = {}
  for (const [key, value] of Object.entries(obj)) if (value !== undefined) out[key] = value
  return out
}

const ABILITY_MAP = { valor: 'value', _modificador: '_modifier' }
const RESOURCE_MAP = {
  maximo: 'max',
  atual: 'current',
  dado: 'die',
  usos: 'uses',
  pool_pv: 'hp_pool',
  circulos_recuperaveis: 'recoverable_slot_levels',
}
const RESOURCE_NAMES: Record<string, string> = {
  furias: 'rages',
  inspiracao_de_bardo: 'bardic_inspiration',
  canalizar_divindade: 'channel_divinity',
  formas_selvagens: 'wild_shapes',
  pontos_de_feiticaria: 'sorcery_points',
  imposicao_de_maos: 'lay_on_hands',
  pontos_de_foco: 'focus_points',
  surto_de_acao: 'action_surge',
  recuperar_folego: 'second_wind',
  ataque_furtivo: 'sneak_attack',
  recuperacao_arcana: 'arcane_recovery',
}
const GENERATION_METHODS: Record<string, string> = {
  padrao: 'standard',
  aleatorio: 'random',
  compra: 'pointBuy',
}

/** Reconhece o formato antigo pela raiz — `identidade` nunca coexiste com `identity`. */
export function isLegacyPtSheet(raw: unknown): boolean {
  return isDict(raw) && 'identidade' in raw
}

function translateIdentity(source: unknown): Dict | undefined {
  const identity = rename(source, {
    nome_personagem: 'character_name',
    nome_jogador: 'player_name',
    campanha: 'campaign',
    classe_id: 'class_id',
    subclasse_id: 'subclass_id',
    nivel: 'level',
    especie_id: 'species_id',
    linhagem_id: 'lineage_id',
    antecedente_id: 'background_id',
    distribuicao_antecedente: 'background_distribution',
    alinhamento: 'alignment',
    idade: 'age',
    altura: 'height',
    peso: 'weight',
    olhos: 'eyes',
    pele: 'skin',
    cabelo: 'hair',
  })
  if (!identity) return undefined

  return defined({
    ...identity,
    alignment: rename(identity.alignment, { etico: 'ethical' }),
    multiclasses: renameEach(identity.multiclasses, {
      classe_id: 'class_id',
      subclasse_id: 'subclass_id',
      nivel: 'level',
    }),
  })
}

function translateAbilities(source: unknown): Dict | undefined {
  if (!isDict(source)) return undefined
  const { metodo_geracao, ...abilities } = source
  const method = typeof metodo_geracao === 'string' ? (GENERATION_METHODS[metodo_geracao] ?? metodo_geracao) : metodo_geracao

  return defined({
    ...(renameValues(abilities, ABILITY_MAP) ?? {}),
    generation_method: method,
  })
}

function translateCombat(source: unknown): Dict | undefined {
  const combat = rename(source, {
    _bonus_proficiencia: '_proficiency_bonus',
    pontos_de_vida: 'hit_points',
    dados_de_vida: 'hit_dice',
    classe_de_armadura: 'armor_class',
    iniciativa: 'initiative',
    deslocamento: 'speed',
    ataques: 'attacks',
    salvaguardas: 'saves',
  })
  if (!combat) return undefined

  return defined({
    ...combat,
    hit_points: rename(combat.hit_points, { maximo: 'max', atual: 'current', temporario: 'temporary' }),
    hit_dice: rename(combat.hit_dice, { tipo: 'type', gastos: 'spent' }),
    armor_class: rename(combat.armor_class, {
      valor: 'value',
      origem: 'source',
      escudo_equipado: 'shield_equipped',
      armadura_equipada_id: 'equipped_armor_id',
    }),
    initiative: rename(combat.initiative, { _valor: '_value' }),
    speed: rename(combat.speed, {
      base_metros: 'base_meters',
      bonus_metros: 'bonus_meters',
      _total_metros: '_total_meters',
    }),
    attacks: renameEach(combat.attacks, {
      nome: 'name',
      arma_id: 'weapon_id',
      tipo: 'type',
      atributo_usado: 'ability_used',
      _bonus_ataque: '_attack_bonus',
      _dano: '_damage',
      tipo_dano: 'damage_type',
      propriedades: 'properties',
      notas: 'notes',
    }),
    saves: renameValues(combat.saves, { proficiente: 'proficient', _valor: '_value' }),
  })
}

function translateClassFeatures(source: unknown): Dict | undefined {
  const features = rename(source, {
    ativas: 'active',
    escolhas_feitas: 'choices_made',
    recursos_de_classe: 'class_resources',
    ordem_divina: 'divine_order',
    ordem_primal: 'primal_order',
    estilo_de_luta: 'fighting_style',
    inimigo_favorito: 'favored_enemy',
    juramento: 'oath',
  })
  if (!features) return undefined

  const resources = rename(features.class_resources, RESOURCE_NAMES)

  return defined({
    ...features,
    active: renameEach(features.active, {
      nome: 'name',
      descricao: 'description',
      nivel_obtido: 'level_gained',
      nivel_adquirido: 'level_gained',
    }),
    class_resources: renameValues(resources, RESOURCE_MAP),
  })
}

function translateSpellcasting(source: unknown): Dict | undefined {
  const spellcasting = rename(source, {
    conjurador: 'spellcaster',
    atributo_conjuracao: 'spellcasting_ability',
    _cd_magia: '_spell_dc',
    _bonus_ataque_magia: '_spell_attack_bonus',
    truques_por_classe: 'cantrips_by_class',
    magias_por_classe: 'spells_by_class',
    livro_de_magias: 'spellbook',
    espacos_de_magia: 'spell_slots',
    espacos_pacto_bruxo: 'pact_slots',
    // Formato anterior à separação por classe — `migrateSheet` reagrupa depois.
    truques_conhecidos: 'known_cantrips',
    magias_preparadas: 'prepared_spells',
  })
  if (!spellcasting) return undefined

  return defined({
    ...spellcasting,
    spell_slots: renameValues(spellcasting.spell_slots, { maximo: 'max', gastos: 'spent' }),
    pact_slots: rename(spellcasting.pact_slots, { circulo: 'level', maximo: 'max', gastos: 'spent' }),
  })
}

function translateInventory(source: unknown): Dict | undefined {
  const inventory = rename(source, { moedas: 'coins', itens: 'items' })
  if (!inventory) return undefined

  return defined({
    ...inventory,
    items: renameEach(inventory.items, {
      id_item: 'item_id',
      nome: 'name',
      categoria: 'category',
      quantidade: 'quantity',
      equipado: 'equipped',
      custo_po: 'cost_gp',
      peso_kg: 'weight_kg',
      notas: 'notes',
    }),
  })
}

/**
 * Traduz uma ficha no formato PT antigo para a forma atual. Campos ausentes ficam
 * de fora do objeto (e não como `undefined`), para `migrateSheet` completar com os
 * padrões de `createInitialSheet`.
 */
export function translateLegacyPtSheet(raw: unknown): CharacterSheet {
  if (!isDict(raw)) return raw as CharacterSheet

  const sheet = rename(raw, {
    identidade: 'identity',
    atributos: 'abilities',
    combate: 'combat',
    pericias: 'skills',
    proficiencias: 'proficiencies',
    tracos_de_especie: 'species_traits',
    caracteristicas_de_classe: 'class_features',
    magia: 'spellcasting',
    inventario: 'inventory',
    talentos: 'feats',
    personalidade: 'personality',
    condicoes_ativas: 'active_conditions',
    niveis_de_exaustao: 'exhaustion_levels',
    notas: 'notes',
  })!

  const feats = rename(sheet.feats, { lista: 'list' })

  return defined({
    ...sheet,
    identity: translateIdentity(sheet.identity),
    abilities: translateAbilities(sheet.abilities),
    combat: translateCombat(sheet.combat),
    skills: renameValues(sheet.skills, {
      atributo: 'ability',
      proficiente: 'proficient',
      _valor: '_value',
    }),
    proficiencies: rename(sheet.proficiencies, {
      armaduras: 'armors',
      armas: 'weapons',
      ferramentas: 'tools',
      idiomas: 'languages',
    }),
    species_traits: defined({
      ...(rename(sheet.species_traits, {
        visao_no_escuro_metros: 'darkvision_meters',
        tracos_ativos: 'active_traits',
        escolhas_feitas: 'choices_made',
      }) ?? {}),
      active_traits: renameEach(isDict(sheet.species_traits) ? sheet.species_traits.tracos_ativos : undefined, {
        nome: 'name',
        descricao: 'description',
        usos_maximos: 'max_uses',
        usos_atuais: 'current_uses',
      }),
    }),
    class_features: translateClassFeatures(sheet.class_features),
    spellcasting: translateSpellcasting(sheet.spellcasting),
    inventory: translateInventory(sheet.inventory),
    feats: feats && defined({
      ...feats,
      list: renameEach(feats.list, {
        talento_id: 'feat_id',
        nome: 'name',
        categoria: 'category',
        origem: 'source',
        escolhas: 'choices',
      }),
    }),
    personality: rename(sheet.personality, {
      tracos: 'traits',
      ideais: 'ideals',
      vinculos: 'bonds',
      fraquezas: 'flaws',
      historia: 'backstory',
      aparencia_descricao: 'appearance_description',
      aliados_e_organizacoes: 'allies_and_organizations',
      simbolo_ou_tesouro: 'symbol_or_treasure',
    }),
  }) as unknown as CharacterSheet
}

/** Item da lista salva (`dnd_fichas_lista`) no formato PT antigo. */
export function translateLegacyPtListItem(raw: unknown): SheetListItem {
  if (!isDict(raw) || !('nome' in raw)) return raw as SheetListItem
  return rename(raw, {
    nome: 'name',
    classe: 'charClass',
    especie: 'species',
    nivel: 'level',
    completa: 'complete',
  }) as unknown as SheetListItem
}

/** Preferências (`venetia-config`) no formato PT antigo. */
export function translateLegacyPtConfig(raw: unknown): Partial<Config> {
  if (!isDict(raw)) return {}
  return rename(raw, {
    rastrear_peso: 'track_weight',
    gerenciar_ouro: 'manage_gold',
    reembolso_venda: 'sale_refund',
    moedas_simples: 'simple_coins',
    lingua: 'language',
  }) as Partial<Config>
}
