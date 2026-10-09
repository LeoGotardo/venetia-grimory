import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type {
  Campaign, CampaignListItem, CampaignNote, CharacterSheet, Combatant, Encounter, EncounterLogEntry, GridMap,
  Monster, Npc, PartyMember, StatBlock,
} from '../types'
import { recalculate } from '../lib/recalculate'
import { migrateSheet } from '../lib/migrateSheet'
import { parseSheetImport } from '../lib/sheetExport'
import {
  buildCampaignExport, mergeRoomPlayers, parseCampaignAreaMaps, parseCampaignImport, type RoomSheetEntry,
} from '../lib/gm/party'
import { buildMonsterPack, parseMonsterPack } from '../lib/gm/statblock'
import { normalizeAreaMap, normalizeCampaign } from '../lib/gm/normalize'
import { loadSrdMonsters } from '../data/monsters'
import { blankCells, clampMapSize, resizeCells } from '../lib/gm/terrain'
import {
  advanceTurn,
  applyDamage,
  applyHealing,
  applyTempHp,
  combatantFromPlayer,
  combatantFromStatBlock,
  numberedNames,
  repairTurn,
  rollAttack,
  rollDamage,
  rollInitiative,
  sortByInitiative,
  startEncounter as startEncounterRules,
} from '../lib/gm/encounter'
import { loadSheet as loadSheetFromStorage } from '../services/sheetStorage'
import {
  listCampaigns,
  saveCampaign,
  loadCampaign,
  deleteCampaign as deleteCampaignFromStorage,
  loadBestiary,
  saveBestiary,
} from '../services/gmStorage'
import { deleteCampaignAreaMaps, loadCampaignAreaMaps, saveAreaMaps } from '../services/areaMapStorage'
import { flushPendingAreaMapSave } from './areaMapStore'
import { DEBOUNCE_SAVE_MS, MAX_ENCOUNTER_LOG } from '../constants'

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
  /** Nota vazia nova; devolve o id. */
  createNote: () => string
  updateNote: (noteId: string, change: Partial<Pick<CampaignNote, 'title' | 'body' | 'shared'>>) => void
  deleteNote: (noteId: string) => void
  deleteCampaign: (id: string) => void

  /** Adiciona uma ficha deste aparelho; recusa se ela não existir ou já estiver na mesa. */
  addLocalPlayer: (sheetId: string) => boolean
  /** Lança se o JSON for inválido. */
  importPlayerJson: (json: string) => void
  /** Troca o snapshot de um player importado por um JSON novo. Lança se o JSON for inválido. */
  reimportPlayerJson: (memberId: string, json: string) => void
  removePlayer: (memberId: string) => void
  /** Fichas que chegaram da sala online (ver `mergeRoomPlayers`). Sem mudança, não regrava. */
  syncRoomPlayers: (entries: RoomSheetEntry[]) => void
  /** A sala foi fechada: os players dela ficam como importados, com a última ficha. */
  detachRoomPlayers: () => void

  addNpc: (
    statblock: StatBlock,
    baseMonsterId?: string | null,
    extra?: Partial<Pick<Npc, 'notes' | 'profile'>>,
  ) => string
  updateNpc: (npcId: string, change: Partial<Pick<Npc, 'statblock' | 'notes' | 'profile'>>) => void
  duplicateNpc: (npcId: string) => string | null
  removeNpc: (npcId: string) => void

  /** Bestiário do mestre (todas as campanhas). Grava na hora — muda pouco e por botão. */
  bestiary: Monster[]
  loadBestiary: () => void
  saveMonster: (statblock: StatBlock, id?: string) => string
  deleteMonster: (id: string) => void
  /** Mesmo id substitui (reimportar um pacote editado atualiza). Devolve quantos entraram. Lança se não for pacote. */
  importMonsterPack: (json: string) => number
  exportMonsterPack: (ids?: string[]) => string

  createEncounter: (name: string) => string
  renameEncounter: (encounterId: string, name: string) => void
  deleteEncounter: (encounterId: string) => void
  /** Players da mesa; quem já está no encontro é ignorado. */
  addPlayersToEncounter: (encounterId: string, memberIds: string[]) => void
  addNpcToEncounter: (encounterId: string, npcId: string, count?: number) => void
  addMonsterToEncounter: (encounterId: string, monsterId: string, count?: number) => void
  removeCombatant: (encounterId: string, combatantId: string) => void
  /** Campos editáveis à mão. Mudar a iniciativa reordena a lista. */
  updateCombatant: (
    encounterId: string,
    combatantId: string,
    change: Partial<Pick<Combatant, 'name' | 'initiative' | 'ac' | 'notes' | 'hidden' | 'speed_m' | 'fly_m' | 'swim_m' | 'move_mode' | 'side'>> & { hp_max?: number },
  ) => void
  /** `npcs` rola só monstros e NPCs; `missing` só quem ainda não tem iniciativa. */
  rollInitiatives: (encounterId: string, scope: 'all' | 'npcs' | 'missing', random?: () => number) => void
  startEncounter: (encounterId: string) => void
  nextTurn: (encounterId: string) => void
  previousTurn: (encounterId: string) => void
  endEncounter: (encounterId: string) => void
  /** Devolve a CD de concentração, se o alvo concentrava. */
  damageCombatant: (encounterId: string, combatantId: string, amount: number) => number | null
  healCombatant: (encounterId: string, combatantId: string, amount: number) => void
  setTempHp: (encounterId: string, combatantId: string, amount: number) => void
  toggleCombatantCondition: (encounterId: string, combatantId: string, condition: string) => void
  toggleConcentration: (encounterId: string, combatantId: string) => void
  setDefeated: (encounterId: string, combatantId: string, defeated: boolean) => void
  /** Rola ataque e dano de uma ação do bloco e registra no log. */
  rollFeature: (encounterId: string, combatantId: string, featureId: string, random?: () => number) => void

  createMap: (name: string, width: number, height: number) => string
  renameMap: (mapId: string, name: string) => void
  deleteMap: (mapId: string) => void
  duplicateMap: (mapId: string, name: string) => string | null
  /** Grava a grade inteira — o editor pinta num rascunho e manda no fim do traço. */
  setMapCells: (mapId: string, cells: string) => void
  /** Mantém o canto superior esquerdo; rótulos fora do novo tamanho somem. */
  resizeMap: (mapId: string, width: number, height: number) => void
  addMapLabel: (mapId: string, x: number, y: number, text: string) => void
  updateMapLabel: (mapId: string, labelId: string, text: string) => void
  removeMapLabel: (mapId: string, labelId: string) => void

  /** Troca o mapa do encontro: posições e névoa recomeçam. */
  setEncounterMap: (encounterId: string, mapId: string | null) => void
  /** Põe ou tira do mapa sem gastar movimento (posicionamento do mestre). */
  placeCombatant: (encounterId: string, combatantId: string, cell: { x: number; y: number } | null) => void
  /** Movimento no turno: soma `meters` ao que já andou. */
  moveCombatant: (encounterId: string, combatantId: string, cell: { x: number; y: number }, meters: number) => void
  toggleDash: (encounterId: string, combatantId: string) => void
  /** `null` desliga a névoa. */
  setFog: (encounterId: string, fog: string | null) => void
  setStrictMovement: (encounterId: string, on: boolean) => void

  /** Catálogo do SRD 5.2.1 no idioma em que foi carregado. Só leitura. */
  srd: { language: string; monsters: Monster[] } | null
  /** Carrega (ou recarrega, se o idioma mudou) o catálogo do SRD. */
  loadSrd: (language: string) => Promise<void>
  /** Cópia editável de um monstro do SRD no bestiário. Devolve o id novo. */
  copySrdToBestiary: (srdId: string) => string | null

  /** Inclui os mapas de área, que moram no IndexedDB — por isso é assíncrono. */
  exportCampaignJson: () => Promise<string | null>
  /** Importa como campanha nova (mapas de área inclusos) e devolve o id. Rejeita se o JSON não for uma campanha. */
  importCampaignJson: (json: string) => Promise<string>
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

/** Ficha crua da sala: passa pelo mesmo caminho de uma importada; `null` se não for ficha. */
function sheetFromRoom(raw: unknown): CharacterSheet | null {
  if (!raw || typeof raw !== 'object' || !('identity' in raw)) return null
  try {
    return recalculate(migrateSheet(raw as CharacterSheet))
  } catch (err) {
    console.error('[gmStore] Ficha da sala ilegível.', err)
    return null
  }
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

type LogPayload = EncounterLogEntry extends infer E ? E extends EncounterLogEntry ? Omit<E, 'id' | 'round'> : never : never

function entry(encounter: Encounter, payload: LogPayload): EncounterLogEntry {
  return { id: uuidv4(), round: encounter.round, ...payload } as EncounterLogEntry
}

/** Acrescenta ao log mantendo só os últimos `MAX_ENCOUNTER_LOG` registros. */
function withLog(encounter: Encounter, ...entries: EncounterLogEntry[]): Encounter {
  if (entries.length === 0) return encounter
  return { ...encounter, log: [...encounter.log, ...entries].slice(-MAX_ENCOUNTER_LOG) }
}

/** Quem ganha a vez começa o turno com o movimento cheio e sem Disparada. */
function freshTurn(encounter: Encounter): Encounter {
  return {
    ...encounter,
    combatants: encounter.combatants.map(c => (c.id === encounter.turn_id ? { ...c, movement_used_m: 0, dash: false } : c)),
  }
}

function moveTurn(encounter: Encounter, direction: 1 | -1): Encounter {
  if (encounter.status !== 'active') return encounter
  const advanced = advanceTurn(encounter, direction)
  if (advanced === encounter || advanced.turn_id === encounter.turn_id) return advanced
  const next = freshTurn(advanced)
  const actor = next.combatants.find(x => x.id === next.turn_id)
  const entries = [
    ...(next.round > encounter.round ? [entry(next, { kind: 'round' })] : []),
    ...(actor ? [entry(next, { kind: 'turn', actor: actor.name })] : []),
  ]
  return withLog(next, ...entries)
}

export const useGmStore = create<GmState>((set, get) => {
  /** Toda edição da campanha aberta passa aqui, que carimba o `updated_at`. */
  function updateCampaign(change: (campaign: Campaign) => Partial<Campaign>) {
    const { campaign } = get()
    if (!campaign) return
    set({ campaign: { ...campaign, ...change(campaign), updated_at: now() } })
  }

  function updateEncounter(encounterId: string, change: (encounter: Encounter) => Encounter) {
    updateCampaign(c => ({
      encounters: c.encounters.map(e => {
        if (e.id !== encounterId) return e
        const next = change(e)
        return next === e ? e : { ...next, updated_at: now() }
      }),
    }))
  }

  function updateMap(mapId: string, change: (map: GridMap) => GridMap) {
    updateCampaign(c => ({
      maps: c.maps.map(m => {
        if (m.id !== mapId) return m
        const next = change(m)
        return next === m ? m : { ...next, updated_at: now() }
      }),
    }))
  }

  function addFromStatBlock(
    encounterId: string, kind: 'npc' | 'monster', refId: string, block: StatBlock, count: number,
  ) {
    updateEncounter(encounterId, e => {
      const names = numberedNames(block.name, e.combatants.map(x => x.name), Math.max(1, Math.floor(count)))
      const added = names.map(name => combatantFromStatBlock(kind, refId, block, name))
      return { ...e, combatants: [...e.combatants, ...added] }
    })
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
        npcs: [],
        encounters: [],
        maps: [],
        notes: [],
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

    createNote: () => {
      const at = now()
      const note: CampaignNote = { id: uuidv4(), title: '', body: '', shared: false, created_at: at, updated_at: at }
      updateCampaign(c => ({ notes: [...c.notes, note] }))
      return note.id
    },

    updateNote: (noteId, change) =>
      updateCampaign(c => ({
        notes: c.notes.map(n => (n.id === noteId ? { ...n, ...change, updated_at: now() } : n)),
      })),

    deleteNote: noteId => updateCampaign(c => ({ notes: c.notes.filter(n => n.id !== noteId) })),

    deleteCampaign: id => {
      cancelPendingSave(id)
      deleteCampaignFromStorage(id)
      deleteCampaignAreaMaps(id).catch(err => console.error('[gmStore] Falha ao apagar os mapas de área.', err))
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

    syncRoomPlayers: entries => {
      const { campaign } = get()
      if (!campaign) return
      const party = mergeRoomPlayers(campaign.party, entries, sheetFromRoom, now())
      if (party !== campaign.party) updateCampaign(() => ({ party }))
    },

    detachRoomPlayers: () => get().syncRoomPlayers([]),

    addNpc: (statblock, baseMonsterId = null, extra = {}) => {
      const npc: Npc = {
        id: uuidv4(), statblock, base_monster_id: baseMonsterId,
        notes: extra.notes ?? '', profile: extra.profile ?? null, updated_at: now(),
      }
      updateCampaign(c => ({ npcs: [...c.npcs, npc] }))
      return npc.id
    },

    updateNpc: (npcId, change) =>
      updateCampaign(c => ({
        npcs: c.npcs.map(n => (n.id === npcId ? { ...n, ...change, updated_at: now() } : n)),
      })),

    duplicateNpc: npcId => {
      const source = get().campaign?.npcs.find(n => n.id === npcId)
      if (!source) return null
      const copy: Npc = { ...structuredClone(source), id: uuidv4(), updated_at: now() }
      updateCampaign(c => {
        const idx = c.npcs.findIndex(n => n.id === npcId)
        return { npcs: [...c.npcs.slice(0, idx + 1), copy, ...c.npcs.slice(idx + 1)] }
      })
      return copy.id
    },

    removeNpc: npcId => updateCampaign(c => ({ npcs: c.npcs.filter(n => n.id !== npcId) })),

    // Lido já na criação do store: as telas do bestiário não piscam "vazio".
    bestiary: loadBestiary(),

    loadBestiary: () => set({ bestiary: loadBestiary() }),

    saveMonster: (statblock, id) => {
      const bestiary = loadBestiary()
      const monster: Monster = { id: id ?? uuidv4(), source: 'custom', statblock, updated_at: now() }
      const idx = bestiary.findIndex(m => m.id === monster.id)
      const next = idx >= 0 ? bestiary.map((m, i) => (i === idx ? monster : m)) : [...bestiary, monster]
      saveBestiary(next)
      set({ bestiary: next })
      return monster.id
    },

    deleteMonster: id => {
      const next = loadBestiary().filter(m => m.id !== id)
      saveBestiary(next)
      set({ bestiary: next })
    },

    importMonsterPack: json => {
      const incoming = parseMonsterPack(json)
      const at = now()
      const byId = new Map(loadBestiary().map(m => [m.id, m]))
      for (const { id, statblock } of incoming) {
        byId.set(id, { id, source: 'custom', statblock, updated_at: at })
      }
      const next = [...byId.values()]
      saveBestiary(next)
      set({ bestiary: next })
      return incoming.length
    },

    srd: null,

    loadSrd: async language => {
      if (get().srd?.language === language) return
      const monsters = (await loadSrdMonsters(language)).map(
        (m): Monster => ({ id: m.id, source: 'srd', statblock: m.statblock, updated_at: '' }),
      )
      set({ srd: { language, monsters } })
    },

    copySrdToBestiary: srdId => {
      const monster = get().srd?.monsters.find(m => m.id === srdId)
      return monster ? get().saveMonster(structuredClone(monster.statblock)) : null
    },

    exportMonsterPack: ids => {
      const all = loadBestiary()
      return buildMonsterPack(ids ? all.filter(m => ids.includes(m.id)) : all)
    },

    createEncounter: name => {
      const at = now()
      const encounter: Encounter = {
        id: uuidv4(), name: name.trim(), status: 'preparing', map_id: null, fog: null, combatants: [], round: 0,
        turn_id: null, strict_movement: false, log: [], created_at: at, updated_at: at,
      }
      updateCampaign(c => ({ encounters: [...c.encounters, encounter] }))
      return encounter.id
    },

    renameEncounter: (encounterId, name) => updateEncounter(encounterId, e => ({ ...e, name })),

    deleteEncounter: encounterId =>
      updateCampaign(c => ({ encounters: c.encounters.filter(e => e.id !== encounterId) })),

    addPlayersToEncounter: (encounterId, memberIds) => {
      const party = get().campaign?.party ?? []
      updateEncounter(encounterId, e => {
        const present = new Set(e.combatants.map(x => x.ref_id))
        const added = party
          .filter(m => memberIds.includes(m.id) && !present.has(m.id))
          .map(combatantFromPlayer)
        return { ...e, combatants: [...e.combatants, ...added] }
      })
    },

    addNpcToEncounter: (encounterId, npcId, count = 1) => {
      const npc = get().campaign?.npcs.find(n => n.id === npcId)
      if (npc) addFromStatBlock(encounterId, 'npc', npc.id, npc.statblock, count)
    },

    addMonsterToEncounter: (encounterId, monsterId, count = 1) => {
      const monster = get().bestiary.find(m => m.id === monsterId)
        ?? get().srd?.monsters.find(m => m.id === monsterId)
      if (monster) addFromStatBlock(encounterId, 'monster', monster.id, monster.statblock, count)
    },

    removeCombatant: (encounterId, combatantId) =>
      updateEncounter(encounterId, e =>
        repairTurn({ ...e, combatants: e.combatants.filter(x => x.id !== combatantId) }, e.combatants)),

    updateCombatant: (encounterId, combatantId, change) =>
      updateEncounter(encounterId, e => {
        const { hp_max, ...fields } = change
        const combatants = e.combatants.map(x => {
          if (x.id !== combatantId) return x
          const hp = hp_max != null
            ? { ...x.hp, max: Math.max(1, hp_max), current: Math.min(x.hp.current, Math.max(1, hp_max)) }
            : x.hp
          return { ...x, ...fields, hp }
        })
        return { ...e, combatants: 'initiative' in change ? sortByInitiative(combatants) : combatants }
      }),

    rollInitiatives: (encounterId, scope, random = Math.random) =>
      updateEncounter(encounterId, e => {
        const entries: EncounterLogEntry[] = []
        const combatants = e.combatants.map(x => {
          const wanted = scope === 'all'
            || (scope === 'npcs' && x.kind !== 'player')
            || (scope === 'missing' && x.initiative == null)
          if (!wanted) return x
          const { roll, total } = rollInitiative(x, random)
          entries.push(entry(e, { kind: 'initiative', actor: x.name, roll, total }))
          return { ...x, initiative: total }
        })
        return withLog({ ...e, combatants: sortByInitiative(combatants) }, ...entries)
      }),

    startEncounter: encounterId =>
      updateEncounter(encounterId, e => {
        const started = freshTurn(startEncounterRules(e))
        const first = started.combatants.find(x => x.id === started.turn_id)
        return withLog(
          started,
          entry(started, { kind: 'start' }),
          ...(first ? [entry(started, { kind: 'turn', actor: first.name })] : []),
        )
      }),

    nextTurn: encounterId => updateEncounter(encounterId, e => moveTurn(e, 1)),

    previousTurn: encounterId => updateEncounter(encounterId, e => moveTurn(e, -1)),

    endEncounter: encounterId =>
      updateEncounter(encounterId, e =>
        withLog({ ...e, status: 'finished', turn_id: null }, entry(e, { kind: 'end' }))),

    damageCombatant: (encounterId, combatantId, amount) => {
      let dc: number | null = null
      updateEncounter(encounterId, e => {
        const target = e.combatants.find(x => x.id === combatantId)
        if (!target || amount <= 0) return e
        const result = applyDamage(target, amount)
        dc = result.concentrationDc
        const hit = result.combatant
        const entries = [entry(e, { kind: 'damage', actor: hit.name, amount: Math.floor(amount), hp: hit.hp.current })]
        if (dc != null) entries.push(entry(e, { kind: 'concentration', actor: hit.name, dc }))
        if (hit.defeated && !target.defeated) entries.push(entry(e, { kind: 'defeated', actor: hit.name, on: true }))
        const combatants = e.combatants.map(x => (x.id === combatantId ? hit : x))
        return withLog(repairTurn({ ...e, combatants }, e.combatants), ...entries)
      })
      return dc
    },

    healCombatant: (encounterId, combatantId, amount) =>
      updateEncounter(encounterId, e => {
        const target = e.combatants.find(x => x.id === combatantId)
        if (!target || amount <= 0) return e
        const healed = applyHealing(target, amount)
        const entries = [entry(e, { kind: 'heal', actor: healed.name, amount: Math.floor(amount), hp: healed.hp.current })]
        if (target.defeated && !healed.defeated) entries.push(entry(e, { kind: 'defeated', actor: healed.name, on: false }))
        return withLog({ ...e, combatants: e.combatants.map(x => (x.id === combatantId ? healed : x)) }, ...entries)
      }),

    setTempHp: (encounterId, combatantId, amount) =>
      updateEncounter(encounterId, e => {
        const target = e.combatants.find(x => x.id === combatantId)
        if (!target) return e
        const next = applyTempHp(target, amount)
        if (next.hp.temp === target.hp.temp) return e
        return withLog(
          { ...e, combatants: e.combatants.map(x => (x.id === combatantId ? next : x)) },
          entry(e, { kind: 'temp', actor: next.name, amount: next.hp.temp }),
        )
      }),

    toggleCombatantCondition: (encounterId, combatantId, condition) =>
      updateEncounter(encounterId, e => {
        const target = e.combatants.find(x => x.id === combatantId)
        if (!target) return e
        const on = !target.conditions.includes(condition)
        const conditions = on ? [...target.conditions, condition] : target.conditions.filter(c => c !== condition)
        return withLog(
          { ...e, combatants: e.combatants.map(x => (x.id === combatantId ? { ...x, conditions } : x)) },
          entry(e, { kind: 'condition', actor: target.name, condition, on }),
        )
      }),

    toggleConcentration: (encounterId, combatantId) =>
      updateEncounter(encounterId, e => ({
        ...e,
        combatants: e.combatants.map(x => (x.id === combatantId ? { ...x, concentration: !x.concentration } : x)),
      })),

    setDefeated: (encounterId, combatantId, defeated) =>
      updateEncounter(encounterId, e => {
        const target = e.combatants.find(x => x.id === combatantId)
        if (!target || target.defeated === defeated) return e
        const combatants = e.combatants.map(x => (x.id === combatantId ? { ...x, defeated } : x))
        const next = defeated
          ? repairTurn({ ...e, combatants }, e.combatants)
          : { ...e, combatants }
        return withLog(next, entry(e, { kind: 'defeated', actor: target.name, on: defeated }))
      }),

    rollFeature: (encounterId, combatantId, featureId, random = Math.random) =>
      updateEncounter(encounterId, e => {
        const actor = e.combatants.find(x => x.id === combatantId)
        const block = actor?.statblock
        const feature = block && [
          ...block.traits, ...block.actions, ...block.bonus_actions, ...block.reactions, ...block.legendary_actions,
        ].find(f => f.id === featureId)
        if (!actor || !feature) return e

        const entries: EncounterLogEntry[] = []
        let crit = false
        if (feature.attack_bonus != null) {
          const attack = rollAttack(feature.attack_bonus, random)
          crit = attack.crit
          entries.push(entry(e, { kind: 'attack', actor: actor.name, feature: feature.name, ...attack }))
        }
        const damage = feature.damage ? rollDamage(feature.damage, crit, random) : null
        if (damage) {
          entries.push(entry(e, {
            kind: 'damage_roll', actor: actor.name, feature: feature.name,
            rolls: damage.rolls, total: damage.total, crit, damage_type: feature.damage_type,
          }))
        }
        return entries.length > 0 ? withLog(e, ...entries) : e
      }),

    setEncounterMap: (encounterId, mapId) =>
      updateEncounter(encounterId, e => (e.map_id === mapId ? e : {
        ...e,
        map_id: mapId,
        fog: null,
        combatants: e.combatants.map(c => ({ ...c, position: null })),
      })),

    placeCombatant: (encounterId, combatantId, cell) =>
      updateEncounter(encounterId, e => ({
        ...e,
        combatants: e.combatants.map(c => (c.id === combatantId ? { ...c, position: cell ? { ...cell } : null } : c)),
      })),

    moveCombatant: (encounterId, combatantId, cell, meters) =>
      updateEncounter(encounterId, e => ({
        ...e,
        combatants: e.combatants.map(c => (c.id === combatantId
          ? { ...c, position: { ...cell }, movement_used_m: c.movement_used_m + Math.max(0, meters) }
          : c)),
      })),

    toggleDash: (encounterId, combatantId) =>
      updateEncounter(encounterId, e => ({
        ...e,
        combatants: e.combatants.map(c => (c.id === combatantId ? { ...c, dash: !c.dash } : c)),
      })),

    setFog: (encounterId, fog) => updateEncounter(encounterId, e => (e.fog === fog ? e : { ...e, fog })),

    setStrictMovement: (encounterId, on) =>
      updateEncounter(encounterId, e => (e.strict_movement === on ? e : { ...e, strict_movement: on })),

    createMap: (name, width, height) => {
      const at = now()
      const w = clampMapSize(width)
      const h = clampMapSize(height)
      const map: GridMap = {
        id: uuidv4(), name: name.trim(), width: w, height: h, cells: blankCells(w, h),
        labels: [], created_at: at, updated_at: at,
      }
      updateCampaign(c => ({ maps: [...c.maps, map] }))
      return map.id
    },

    renameMap: (mapId, name) => updateMap(mapId, m => ({ ...m, name })),

    deleteMap: mapId => updateCampaign(c => ({ maps: c.maps.filter(m => m.id !== mapId) })),

    duplicateMap: (mapId, name) => {
      const source = get().campaign?.maps.find(m => m.id === mapId)
      if (!source) return null
      const at = now()
      const copy: GridMap = {
        ...structuredClone(source), id: uuidv4(), name,
        labels: source.labels.map(l => ({ ...l, id: uuidv4() })), created_at: at, updated_at: at,
      }
      updateCampaign(c => ({ maps: [...c.maps, copy] }))
      return copy.id
    },

    setMapCells: (mapId, cells) =>
      updateMap(mapId, m => (cells.length === m.width * m.height && cells !== m.cells ? { ...m, cells } : m)),

    resizeMap: (mapId, width, height) =>
      updateMap(mapId, m => {
        const w = clampMapSize(width)
        const h = clampMapSize(height)
        if (w === m.width && h === m.height) return m
        return {
          ...m, width: w, height: h, cells: resizeCells(m, w, h),
          labels: m.labels.filter(l => l.x < w && l.y < h),
        }
      }),

    addMapLabel: (mapId, x, y, text) =>
      updateMap(mapId, m => (text.trim() ? { ...m, labels: [...m.labels, { id: uuidv4(), x, y, text: text.trim() }] } : m)),

    updateMapLabel: (mapId, labelId, text) =>
      updateMap(mapId, m => ({ ...m, labels: m.labels.map(l => (l.id === labelId ? { ...l, text } : l)) })),

    removeMapLabel: (mapId, labelId) =>
      updateMap(mapId, m => ({ ...m, labels: m.labels.filter(l => l.id !== labelId) })),

    exportCampaignJson: async () => {
      const { campaign } = get()
      if (!campaign) return null
      await flushPendingAreaMapSave()
      return buildCampaignExport(campaign, await loadCampaignAreaMaps(campaign.id))
    },

    importCampaignJson: async json => {
      const imported = normalizeCampaign(parseCampaignImport(json))
      const campaign: Campaign = {
        ...imported,
        id: uuidv4(),
        // As fichas locais (e as da sala) de outro aparelho não existem aqui: viram snapshot.
        party: imported.party.map(m => ({ ...m, source: 'imported', sheet_id: null, room_member_id: null, room_version: null })),
        updated_at: now(),
      }
      // Ids novos: importar duas vezes a mesma campanha não pode sobrescrever os mapas da primeira.
      const areaMaps = parseCampaignAreaMaps(json)
        .map(normalizeAreaMap)
        .map(m => ({ ...m, id: uuidv4(), campaign_id: campaign.id }))
      await saveAreaMaps(areaMaps)
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
