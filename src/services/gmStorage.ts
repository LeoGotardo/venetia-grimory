import type { Campaign, CampaignListItem, Monster } from '../types'
import { STORAGE_KEY_BESTIARY, STORAGE_KEY_CAMPAIGN_LIST, STORAGE_KEY_CAMPAIGN_PREFIX } from '../constants'
import { normalizeCampaign, normalizeMonster } from '../lib/gm/normalize'

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
  localStorage.setItem(`${STORAGE_KEY_CAMPAIGN_PREFIX}${campaign.id}`, JSON.stringify(campaign))

  const list = listCampaigns()
  const idx = list.findIndex(item => item.id === campaign.id)
  if (idx >= 0) list[idx] = toListItem(campaign)
  else list.push(toListItem(campaign))
  saveList(list)
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
}
