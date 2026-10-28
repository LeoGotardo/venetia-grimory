import type { Campaign, CampaignListItem, Monster } from '../types'
import { STORAGE_KEY_BESTIARY, STORAGE_KEY_CAMPAIGN_LIST, STORAGE_KEY_CAMPAIGN_PREFIX } from '../constants'
import { normalizeCampaign, normalizeMonster } from '../lib/gm/normalize'
import { isCloudLinked, recordLocalCollection, recordLocalDelete, recordLocalWrite } from './cloudState'

function toListItem(campaign: Campaign): CampaignListItem {
  return {
    id: campaign.id,
    name: campaign.name,
    players: campaign.party.length,
    npcs: campaign.npcs.length,
    encounters: campaign.encounters.length,
    maps: campaign.maps.length,
    active_encounter: campaign.encounters.find(e => e.status === 'active')?.name ?? null,
    updated_at: campaign.updated_at,
  }
}

export function listCampaigns(): CampaignListItem[] {
  const raw = localStorage.getItem(STORAGE_KEY_CAMPAIGN_LIST)
  if (!raw) return []

  try {
    const list = JSON.parse(raw) as CampaignListItem[]
    // Índices gravados antes das contagens: completa uma vez a partir das campanhas.
    if (list.some(item => item.npcs === undefined)) {
      const upgraded = list.map(item => {
        if (item.npcs !== undefined) return item
        const campaign = loadCampaign(item.id)
        return campaign ? toListItem(campaign) : item
      })
      saveList(upgraded)
      return upgraded
    }
    return list
  } catch {
    console.error('[gmStorage] Lista de campanhas corrompida, reiniciando.')
    return []
  }
}

function saveList(list: CampaignListItem[]): void {
  localStorage.setItem(STORAGE_KEY_CAMPAIGN_LIST, JSON.stringify(list))
}

export function saveCampaign(campaign: Campaign): void {
  const json = JSON.stringify(campaign)
  localStorage.setItem(`${STORAGE_KEY_CAMPAIGN_PREFIX}${campaign.id}`, json)

  const list = listCampaigns()
  const idx = list.findIndex(item => item.id === campaign.id)
  if (idx >= 0) list[idx] = toListItem(campaign)
  else list.push(toListItem(campaign))
  saveList(list)
  recordLocalWrite('campaign', campaign.id, json)
}

/** JSON da campanha como está gravado — é o que sobe para a nuvem. */
export function readCampaignJson(id: string): string | null {
  return localStorage.getItem(`${STORAGE_KEY_CAMPAIGN_PREFIX}${id}`)
}

export function loadCampaign(id: string): Campaign | null {
  const raw = localStorage.getItem(`${STORAGE_KEY_CAMPAIGN_PREFIX}${id}`)
  if (!raw) return null

  try {
    return normalizeCampaign(JSON.parse(raw))
  } catch {
    console.error(`[gmStorage] Campanha ${id} corrompida.`)
    return null
  }
}

export function deleteCampaign(id: string): void {
  localStorage.removeItem(`${STORAGE_KEY_CAMPAIGN_PREFIX}${id}`)
  saveList(listCampaigns().filter(item => item.id !== id))
  recordLocalDelete('campaign', id)
}

/** Bestiário do mestre: um array só, compartilhado entre as campanhas. */
export function loadBestiary(): Monster[] {
  const raw = localStorage.getItem(STORAGE_KEY_BESTIARY)
  if (!raw) return []

  try {
    return (JSON.parse(raw) as unknown[]).map(normalizeMonster)
  } catch {
    console.error('[gmStorage] Bestiário corrompido, reiniciando.')
    return []
  }
}

export function saveBestiary(monsters: Monster[]): void {
  localStorage.setItem(STORAGE_KEY_BESTIARY, JSON.stringify(monsters))
  // Na nuvem cada monstro é um documento; os que saíram do array viram lápide.
  if (isCloudLinked()) recordLocalCollection('monster', monsters.map(m => [m.id, JSON.stringify(m)]))
}

/** Bestiário cru, sem normalizar — o JSON de cada item é o que sobe para a nuvem. */
export function readBestiaryRaw(): Monster[] {
  const raw = localStorage.getItem(STORAGE_KEY_BESTIARY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as Monster[]
  } catch {
    return []
  }
}

/** Some com o bestiário sem registrar nada — só o logout chama, já desvinculado. */
export function clearBestiary(): void {
  localStorage.removeItem(STORAGE_KEY_BESTIARY)
}
