import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type { Campaign, CampaignListItem, CharacterSheet, PartyMember } from '../types'
import { recalculate } from '../lib/recalculate'
import { migrateSheet } from '../lib/migrateSheet'
import { parseSheetImport } from '../lib/sheetExport'
import { buildCampaignExport, parseCampaignImport } from '../lib/gm/party'
import { loadSheet as loadSheetFromStorage } from '../services/sheetStorage'
import {
  listCampaigns,
  saveCampaign,
  loadCampaign,
  deleteCampaign as deleteCampaignFromStorage,
} from '../services/gmStorage'
import { DEBOUNCE_SAVE_MS } from '../constants'

interface GmState {
  campaigns: CampaignListItem[]
  /** Campanha aberta. Só ela é editada e salva pelo auto-save. */
  campaign: Campaign | null
  /** Último id pedido a `openCampaign` — com `campaign` nulo, a campanha não existe. */
  openedId: string | null

  loadCampaignList: () => void
  createCampaign: (name: string) => string
  openCampaign: (id: string) => boolean
  closeCampaign: () => void
  renameCampaign: (name: string) => void
  setCampaignNotes: (notes: string) => void
  deleteCampaign: (id: string) => void

  /** Adiciona uma ficha deste aparelho; recusa se ela não existir ou já estiver na mesa. */
  addLocalPlayer: (sheetId: string) => boolean
  /** Lança se o JSON for inválido. */
  importPlayerJson: (json: string) => void
  /** Troca o snapshot de um player importado por um JSON novo. Lança se o JSON for inválido. */
  reimportPlayerJson: (memberId: string, json: string) => void
  removePlayer: (memberId: string) => void

  exportCampaignJson: () => string | null
  /** Importa como campanha nova e devolve o id. Lança se o JSON não for uma campanha. */
  importCampaignJson: (json: string) => string
}

const now = () => new Date().toISOString()

/** Save com debounce pendente — apagar a campanha precisa cancelá-lo. */
let pendingSave: { id: string; campaign: Campaign; timeout: ReturnType<typeof setTimeout> } | null = null

function flushPendingSave() {
  if (!pendingSave) return
  clearTimeout(pendingSave.timeout)
  saveCampaign(pendingSave.campaign)
  pendingSave = null
}

function cancelPendingSave(id: string) {
  if (pendingSave?.id !== id) return
  clearTimeout(pendingSave.timeout)
  pendingSave = null
}

function sheetFromJson(json: string): CharacterSheet {
  return recalculate(migrateSheet(parseSheetImport(json).sheet))
}

function newMember(source: PartyMember['source'], sheet: CharacterSheet, sheetId: string | null): PartyMember {
  const at = now()
  return { id: uuidv4(), source, sheet_id: sheetId, snapshot: sheet, imported_at: at, updated_at: at }
}

/**
 * Renova o snapshot dos players locais a partir das fichas do aparelho. A ficha
 * que sumiu daqui (apagada) vira importada: o snapshot é tudo o que sobrou dela.
 */
function refreshLocalPlayers(party: PartyMember[]): PartyMember[] {
  return party.map(member => {
    if (member.source !== 'local' || !member.sheet_id) return member
    const sheet = loadSheetFromStorage(member.sheet_id)
    if (!sheet) return { ...member, source: 'imported', sheet_id: null }
    return { ...member, snapshot: recalculate(sheet) }
  })
}

export const useGmStore = create<GmState>((set, get) => {
  /** Toda edição da campanha aberta passa aqui, que carimba o `updated_at`. */
  function updateCampaign(change: (campaign: Campaign) => Partial<Campaign>) {
    const { campaign } = get()
    if (!campaign) return
    set({ campaign: { ...campaign, ...change(campaign), updated_at: now() } })
  }

  return {
    campaigns: [],
    campaign: null,
    openedId: null,

    loadCampaignList: () => set({ campaigns: listCampaigns() }),

    createCampaign: name => {
      const at = now()
      const campaign: Campaign = {
        id: uuidv4(),
        name: name.trim(),
        party: [],
        notes: '',
        created_at: at,
        updated_at: at,
      }
      saveCampaign(campaign)
      set({ campaigns: listCampaigns() })
      return campaign.id
    },

    openCampaign: id => {
      // Sem isso, reabrir antes do debounce leria o storage sem a última edição.
      flushPendingSave()
      const campaign = loadCampaign(id)
      if (!campaign) {
        set({ campaign: null, openedId: id })
        return false
      }
      set({ campaign: { ...campaign, party: refreshLocalPlayers(campaign.party) }, openedId: id })
      return true
    },

    closeCampaign: () => set({ campaign: null, openedId: null }),

    renameCampaign: name => updateCampaign(() => ({ name })),

    setCampaignNotes: notes => updateCampaign(() => ({ notes })),

    deleteCampaign: id => {
      cancelPendingSave(id)
      deleteCampaignFromStorage(id)
      set(s => ({
        campaigns: listCampaigns(),
        campaign: s.campaign?.id === id ? null : s.campaign,
      }))
    },

    addLocalPlayer: sheetId => {
      const { campaign } = get()
      if (!campaign || campaign.party.some(m => m.sheet_id === sheetId)) return false
      const sheet = loadSheetFromStorage(sheetId)
      if (!sheet) return false
      updateCampaign(c => ({ party: [...c.party, newMember('local', recalculate(sheet), sheetId)] }))
      return true
    },

    importPlayerJson: json => {
      const sheet = sheetFromJson(json)
      updateCampaign(c => ({ party: [...c.party, newMember('imported', sheet, null)] }))
    },

    reimportPlayerJson: (memberId, json) => {
      const sheet = sheetFromJson(json)
      const at = now()
      updateCampaign(c => ({
        party: c.party.map(m => (m.id === memberId ? { ...m, snapshot: sheet, imported_at: at, updated_at: at } : m)),
      }))
    },

    removePlayer: memberId =>
      updateCampaign(c => ({ party: c.party.filter(m => m.id !== memberId) })),

    exportCampaignJson: () => {
      const { campaign } = get()
      return campaign ? buildCampaignExport(campaign) : null
    },

    importCampaignJson: json => {
      const imported = parseCampaignImport(json)
      const at = now()
      const campaign: Campaign = {
        ...imported,
        id: uuidv4(),
        // As fichas locais de outro aparelho não existem aqui: viram snapshot.
        party: (imported.party ?? []).map(m => ({ ...m, source: 'imported', sheet_id: null })),
        notes: imported.notes ?? '',
        created_at: imported.created_at ?? at,
        updated_at: at,
      }
      saveCampaign(campaign)
      set({ campaigns: listCampaigns() })
      return campaign.id
    },
  }
})

useGmStore.subscribe((state, prev) => {
  if (!state.campaign || state.campaign === prev.campaign) return
  // Abrir a campanha também troca a referência; gravar de novo é inofensivo.
  const campaign = state.campaign

  // Trocou de campanha com edição da anterior pendente: grava a anterior já.
  if (pendingSave && pendingSave.id !== campaign.id) flushPendingSave()
  if (pendingSave) clearTimeout(pendingSave.timeout)
  pendingSave = {
    id: campaign.id,
    campaign,
    timeout: setTimeout(() => {
      pendingSave = null
      saveCampaign(campaign)
      useGmStore.setState({ campaigns: listCampaigns() })
    }, DEBOUNCE_SAVE_MS),
  }
})

// Fechar a aba, recarregar ou mandar o app para segundo plano dentro do debounce
// perderia a última edição: grava na hora quando a página some.
if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', flushPendingSave)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushPendingSave()
  })
}
