import type { AbilityId, CharacterSheet } from '../types'
import { recalculate } from './recalculate'
import { gameDataPt as gameData } from '../data/rules'
import { FEAT_SOURCE_SPECIES, FIXED_LANGUAGES_BY_CLASS } from '../constants'

/**
 * Passos de montagem de personagem como funções puras: o store do jogador
 * (`setCharClass`, `setSpecies`, `setBackground`) e o gerador de NPC do mestre
 * usam as mesmas regras. Id desconhecido devolve a ficha intacta (mesma
 * referência), para o chamador saber que nada mudou.
 */

/** Classe primária: proficiências, idiomas fixos e conjuração; zera subclasse, multiclasse e perícias de classe. */
export function applyClass(sheet: CharacterSheet, classId: string): CharacterSheet {
  const charClass = gameData.classes.find(c => c.id === classId)
  if (!charClass) return sheet

  const existingLanguages = sheet.proficiencies.languages
  const classLanguages = FIXED_LANGUAGES_BY_CLASS[classId] ?? []
  const languages = [
    ...existingLanguages.filter(i => !Object.values(FIXED_LANGUAGES_BY_CLASS).flat().includes(i)),
    ...classLanguages,
  ]

  const background = gameData.backgrounds?.find(a => a.id === sheet.identity.background_id)
  const backgroundSkills = background?.skills ?? []
  const skills = { ...sheet.skills }
  Object.keys(skills).forEach(skillId => {
    if (backgroundSkills.includes(skillId)) return
    skills[skillId] = { ...skills[skillId], proficient: false }
  })

  return recalculate({
    ...sheet,
    identity: { ...sheet.identity, class_id: classId, subclass_id: null, multiclasses: [] },
    skills,
    proficiencies: {
      ...sheet.proficiencies,
      armors: charClass.armors,
      weapons: charClass.weapons,
      tools: charClass.tools,
      languages,
    },
    spellcasting: {
      ...sheet.spellcasting,
      spellcaster: charClass.spellcaster,
      spellcasting_ability: charClass.spellcasting_ability ?? null,
      cantrips_by_class: {},
      spells_by_class: {},
    },
  })
}

/** Espécie (e linhagem): traços, visão no escuro e deslocamento. */
export function applySpecies(sheet: CharacterSheet, speciesId: string, lineageId?: string): CharacterSheet {
  const species = gameData.species?.find(e => e.id === speciesId)
  if (!species) return sheet

  const speciesTraits = species.traits.map(t => ({
    name: t.name,
    description: t.description,
    max_uses: t.max_uses,
    current_uses: typeof t.max_uses === 'number' ? t.max_uses : undefined,
  }))

  const lineage = lineageId
    ? species.lineages?.find(l => l.id === lineageId)
    : undefined

  const lineageTraits = lineage?.traits?.map(t => ({
    name: t.name,
    description: t.description,
    max_uses: t.max_uses,
    current_uses: typeof t.max_uses === 'number' ? t.max_uses : undefined,
  })) ?? []

  return recalculate({
    ...sheet,
    identity: { ...sheet.identity, species_id: speciesId, lineage_id: lineageId ?? null },
    // Trocar de espécie descarta o Talento de Origem concedido pela anterior.
    feats: { list: sheet.feats.list.filter(f => f.source !== FEAT_SOURCE_SPECIES) },
    species_traits: {
      darkvision_meters: species.darkvision ?? null,
      active_traits: [...speciesTraits, ...lineageTraits],
      choices_made: {},
    },
    combat: {
      ...sheet.combat,
      speed: { ...sheet.combat.speed, base_meters: species.speed },
    },
  })
}

/** Antecedente: perícias, talento de origem e a distribuição de +3 nos atributos (desfaz a anterior). */
export function applyBackground(
  sheet: CharacterSheet,
  backgroundId: string,
  distribution: Partial<Record<AbilityId, number>>,
): CharacterSheet {
  const background = gameData.backgrounds?.find(a => a.id === backgroundId)
  if (!background) return sheet

  // Tira as perícias do antecedente anterior e aplica as do novo
  const previousBackground = gameData.backgrounds?.find(a => a.id === sheet.identity.background_id)
  const previousBackgroundSkills = previousBackground?.skills ?? []
  const skills = { ...sheet.skills }
  Object.keys(skills).forEach(skillId => {
    if (previousBackgroundSkills.includes(skillId)) skills[skillId] = { ...skills[skillId], proficient: false }
  })
  background.skills.forEach(skillId => {
    if (skills[skillId]) skills[skillId] = { ...skills[skillId], proficient: true }
  })

  // Troca o talento do antecedente anterior pelo do novo
  const previousFeatId = previousBackground?.feat
  const baseList = sheet.feats.list.filter(t => t.feat_id !== previousFeatId)
  // "Iniciado em Magia (Clérigo)" traz a lista entre parênteses, e o catálogo
  // de talentos guarda só "Iniciado em Magia" — sem tirar o sufixo, esses três
  // antecedentes não concediam talento nenhum. O rótulo completo continua sendo
  // o id gravado, porque é dele que `recalculateFreeCasts` tira a lista.
  const featLabel = background.feat
  const featBase = featLabel?.replace(/\s*\([^)]*\)\s*$/, '').trim()
  const featData = gameData.origin_feats?.find(
    t => t.id === featLabel || t.name === featLabel || t.name === featBase,
  )
  const featAlreadyAdded = baseList.some(t => t.feat_id === featLabel)
  const feats = featData && !featAlreadyAdded
    ? [...baseList, { feat_id: featLabel, name: featLabel, category: 'Origem', source: 'Antecedente', choices: {} }]
    : baseList

  // Desfaz a distribuição anterior e aplica a nova
  const abilities = { ...sheet.abilities }
  const previousDistribution = sheet.identity.background_distribution ?? {}
  Object.entries(previousDistribution).forEach(([attr, bonus]) => {
    const a = attr as AbilityId
    abilities[a] = { ...abilities[a], value: (abilities[a].value ?? 0) - (bonus ?? 0) }
  })
  Object.entries(distribution).forEach(([attr, bonus]) => {
    const a = attr as AbilityId
    abilities[a] = { ...abilities[a], value: (abilities[a].value ?? 0) + (bonus ?? 0) }
  })

  return recalculate({
    ...sheet,
    identity: {
      ...sheet.identity,
      background_id: backgroundId,
      background_distribution: distribution,
    },
    skills,
    feats: { list: feats },
    abilities,
  })
}
