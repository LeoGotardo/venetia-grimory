import i18n from '../../i18n'
import { gameData } from '../../data/rules'
import { ABILITIES } from '../calculations'
import type { SheetLabels } from './sheetLayout'

/**
 * Rótulos da ficha no idioma atual da interface. Cada chave `sheetPdf.*` é
 * passada a `t` como texto literal de propósito: é assim que `keys.test.ts`
 * confere que ela existe nos dois catálogos. Atributos vêm de `attrs.*` e perícias do `gameData` (já
 * traduzido), agrupadas por atributo e em ordem alfabética do idioma.
 */
export function sheetLabels(): SheetLabels {
  const t = i18n.t.bind(i18n)
  const collator = new Intl.Collator(i18n.language)
  return {
    brand: t('sheetPdf.brand'),
    characterName: t('sheetPdf.characterName'),
    charClass: t('sheetPdf.charClass'),
    subclass: t('sheetPdf.subclass'),
    level: t('sheetPdf.level'),
    species: t('sheetPdf.species'),
    background: t('sheetPdf.background'),
    xp: t('sheetPdf.xp'),
    armorClass: t('sheetPdf.armorClass'),
    shield: t('sheetPdf.shield'),
    initiative: t('sheetPdf.initiative'),
    speed: t('sheetPdf.speed'),
    size: t('sheetPdf.size'),
    proficiency: t('sheetPdf.proficiency'),
    passivePerception: t('sheetPdf.passivePerception'),
    heroicInspiration: t('sheetPdf.heroicInspiration'),
    hitPoints: t('sheetPdf.hitPoints'),
    hpMax: t('sheetPdf.hpMax'),
    hpCurrent: t('sheetPdf.hpCurrent'),
    hpTemp: t('sheetPdf.hpTemp'),
    hitDice: t('sheetPdf.hitDice'),
    hitDiceTotal: t('sheetPdf.hitDiceTotal'),
    hitDiceSpent: t('sheetPdf.hitDiceSpent'),
    deathSaves: t('sheetPdf.deathSaves'),
    successes: t('sheetPdf.successes'),
    failures: t('sheetPdf.failures'),
    abilitiesTitle: t('sheetPdf.abilitiesTitle'),
    proficient: t('sheetPdf.proficient'),
    expertise: t('sheetPdf.expertise'),
    modifier: t('sheetPdf.modifier'),
    savingThrow: t('sheetPdf.savingThrow'),
    noSkills: t('sheetPdf.noSkills'),
    attacksTitle: t('sheetPdf.attacksTitle'),
    attackName: t('sheetPdf.attackName'),
    attackBonus: t('sheetPdf.attackBonus'),
    attackDamage: t('sheetPdf.attackDamage'),
    attackNotes: t('sheetPdf.attackNotes'),
    classFeatures: t('sheetPdf.classFeatures'),
    speciesTraits: t('sheetPdf.speciesTraits'),
    feats: t('sheetPdf.feats'),
    training: t('sheetPdf.training'),
    armor: t('sheetPdf.armor'),
    armorTraining: {
      light: t('sheetPdf.armorLight'),
      medium: t('sheetPdf.armorMedium'),
      heavy: t('sheetPdf.armorHeavy'),
      shields: t('sheetPdf.armorShields'),
    },
    weapons: t('sheetPdf.weapons'),
    tools: t('sheetPdf.tools'),
    footer: t('sheetPdf.footer'),
    page: (n, total) => t('sheetPdf.page', { n, total }),
    spellcasting: t('sheetPdf.spellcasting'),
    castAbility: t('sheetPdf.castAbility'),
    castModifier: t('sheetPdf.castModifier'),
    castDc: t('sheetPdf.castDc'),
    castAttack: t('sheetPdf.castAttack'),
    slots: t('sheetPdf.slots'),
    slotsHint: t('sheetPdf.slotsHint'),
    slotLevel: n => t('sheetPdf.slotLevel', { n }),
    pactMagic: t('sheetPdf.pactMagic'),
    pactLevel: t('sheetPdf.pactLevel'),
    pactSlots: t('sheetPdf.pactSlots'),
    freeCasts: t('sheetPdf.freeCasts'),
    spellsTitle: t('sheetPdf.spellsTitle'),
    spellsLegend: t('sheetPdf.spellsLegend'),
    spellLevel: t('sheetPdf.spellLevel'),
    spellName: t('sheetPdf.spellName'),
    spellTime: t('sheetPdf.spellTime'),
    spellRange: t('sheetPdf.spellRange'),
    concentrationShort: t('sheetPdf.concentrationShort'),
    ritualShort: t('sheetPdf.ritualShort'),
    materialShort: t('sheetPdf.materialShort'),
    spellNotes: t('sheetPdf.spellNotes'),
    appearance: t('sheetPdf.appearance'),
    languages: t('sheetPdf.languages'),
    alignment: t('sheetPdf.alignment'),
    personality: t('sheetPdf.personality'),
    equipment: t('sheetPdf.equipment'),
    attunement: t('sheetPdf.attunement'),
    coins: t('sheetPdf.coins'),
    coinCodes: {
      PC: t('sheetPdf.coinPC'),
      PP: t('sheetPdf.coinPP'),
      PE: t('sheetPdf.coinPE'),
      PO: t('sheetPdf.coinPO'),
      PL: t('sheetPdf.coinPL'),
    },
    abilities: ABILITIES.map(id => ({
      id,
      name: t(`attrs.${id}`),
      skills: gameData.skills
        .filter(skill => skill.ability === id)
        .map(skill => ({ id: skill.id, name: skill.name }))
        .sort((a, b) => collator.compare(a.name, b.name)),
    })),
  }
}
