import type { AbilityId, Campaign, CharacterSheet } from '../../types'
import { ABILITIES, calcPassivePerception } from '../calculations'
import { CAMPAIGN_EXPORT_FORMAT, CAMPAIGN_EXPORT_VERSION } from '../../constants'

/** O que o mestre precisa ver de um player sem abrir a ficha. */
export interface PlayerSummary {
  name: string | null
  player: string | null
  classId: string | null
  subclassId: string | null
  level: number
  multiclasses: CharacterSheet['identity']['multiclasses']
  speciesId: string | null
  ac: number | null
  hpMax: number | null
  initiative: number | null
  speedMeters: number | null
  passivePerception: number
  spellDc: number | null
  darkvisionMeters: number | null
  saves: Record<AbilityId, number | null>
  languages: string[]
}

/** Lê só campos `_` já calculados — quem recalcula é quem grava o snapshot. */
export function summarizePlayer(sheet: CharacterSheet): PlayerSummary {
  const saves = Object.fromEntries(
    ABILITIES.map(ability => [ability, sheet.combat.saves[ability]?._value ?? null]),
  ) as Record<AbilityId, number | null>

  return {
    name: sheet.identity.character_name,
    player: sheet.identity.player_name,
    classId: sheet.identity.class_id,
    subclassId: sheet.identity.subclass_id,
    level: sheet.identity.level,
    multiclasses: sheet.identity.multiclasses,
    speciesId: sheet.identity.species_id,
    ac: sheet.combat.armor_class.value,
    hpMax: sheet.combat.hit_points.max,
    initiative: sheet.combat.initiative._value,
    speedMeters: sheet.combat.speed._total_meters,
    passivePerception: calcPassivePerception(sheet.skills.percepcao?._value ?? 0),
    spellDc: sheet.spellcasting.spellcaster ? sheet.spellcasting._spell_dc : null,
    darkvisionMeters: sheet.species_traits.darkvision_meters,
    saves,
    languages: sheet.proficiencies.languages,
  }
}

export interface CampaignExport {
  format: typeof CAMPAIGN_EXPORT_FORMAT
  version: number
  campaign: Campaign
}

export function buildCampaignExport(campaign: Campaign): string {
  const payload: CampaignExport = {
    format: CAMPAIGN_EXPORT_FORMAT,
    version: CAMPAIGN_EXPORT_VERSION,
    campaign,
  }
  return JSON.stringify(payload, null, 2)
}

/** Lança se não for JSON ou não for uma campanha exportada pelo app. */
export function parseCampaignImport(json: string): Campaign {
  const data = JSON.parse(json) as Partial<CampaignExport> | null
  if (data?.format !== CAMPAIGN_EXPORT_FORMAT || !data.campaign) {
    throw new Error('not a campaign export')
  }
  return data.campaign
}
