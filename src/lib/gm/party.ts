import { v4 as uuidv4 } from 'uuid'
import type { AbilityId, AreaMap, Campaign, CharacterSheet, PartyMember } from '../../types'
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
  /** Mapas de área (moram no IndexedDB, fora da campanha). Exports antigos não têm. */
  area_maps?: AreaMap[]
}

export function buildCampaignExport(campaign: Campaign, areaMaps: AreaMap[] = []): string {
  const payload: CampaignExport = {
    format: CAMPAIGN_EXPORT_FORMAT,
    version: CAMPAIGN_EXPORT_VERSION,
    campaign,
    area_maps: areaMaps,
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

/** Mapas de área de um export (crus — passam por `normalizeAreaMap`). Lança como `parseCampaignImport`. */
export function parseCampaignAreaMaps(json: string): unknown[] {
  const data = JSON.parse(json) as Partial<CampaignExport> | null
  return Array.isArray(data?.area_maps) ? data.area_maps : []
}

/** Ficha de um player na sala online, já lida do documento. */
export interface RoomSheetEntry {
  memberId: string
  version: number
  sheet: unknown
}

/**
 * Leva as fichas da sala para a mesa do mestre. Player novo entra como
 * `room`; ficha com versão nova troca o snapshot; quem não tem mais ficha na
 * sala (saiu, foi removido) vira `imported` com a última cópia, como a ficha
 * local apagada. `toSheet` normaliza o dado cru e devolve `null` se não for
 * ficha. Devolve o mesmo array quando nada muda, para não regravar a campanha.
 */
export function mergeRoomPlayers(
  party: PartyMember[],
  entries: RoomSheetEntry[],
  toSheet: (raw: unknown) => CharacterSheet | null,
  at: string,
): PartyMember[] {
  const byMember = new Map(entries.map(entry => [entry.memberId, entry]))
  let changed = false

  const next = party.map((member): PartyMember => {
    if (member.source !== 'room' || !member.room_member_id) return member
    const entry = byMember.get(member.room_member_id)
    if (!entry) {
      changed = true
      return { ...member, source: 'imported', room_member_id: null, room_version: null, imported_at: at, updated_at: at }
    }
    if (entry.version === member.room_version) return member
    const sheet = toSheet(entry.sheet)
    if (!sheet) return member
    changed = true
    return { ...member, snapshot: sheet, room_version: entry.version, updated_at: at }
  })

  const linked = new Set(next.flatMap(member => (member.room_member_id ? [member.room_member_id] : [])))
  for (const entry of entries) {
    if (linked.has(entry.memberId)) continue
    const sheet = toSheet(entry.sheet)
    if (!sheet) continue
    changed = true
    next.push({
      id: uuidv4(), source: 'room', sheet_id: null, snapshot: sheet, imported_at: at, updated_at: at,
      room_member_id: entry.memberId, room_version: entry.version,
    })
  }
  return changed ? next : party
}
