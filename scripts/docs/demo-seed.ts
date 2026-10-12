/**
 * Cenário de demonstração para as capturas da documentação (`docs/images/`).
 * Não entra no app: o `npm run dev` serve este arquivo, e a página o importa
 * pelo console ou pelo DevTools (`await import('/scripts/docs/demo-seed.ts')`).
 * Usa as próprias funções do app — personagens montados pelas regras, NPCs do
 * gerador, monstros do SRD — para as telas mostrarem dados reais.
 * Roteiro completo em `scripts/README.md` (seção "Capturas da documentação").
 */
import { v4 as uuidv4 } from 'uuid'
import type { AreaElement, CharacterSheet } from '../../src/types'
import { useConfigStore } from '../../src/store/configStore'
import { useGmStore } from '../../src/store/gmStore'
import { useAreaMapStore } from '../../src/store/areaMapStore'
import { useRoomStore } from '../../src/store/roomStore'
import { saveSheet } from '../../src/services/sheetStorage'
import { buildPcSheet, resolvePcBuild } from '../../src/lib/gm/pcNpc'
import { archetypeById, generateNpc } from '../../src/lib/gm/npcGenerator'
import { STAMPS } from '../../src/data/areaMap/stamps'
import { AREA_PATH_STYLES } from '../../src/constants'

type Lang = 'pt' | 'en'

/** Dado fixo: o mesmo cenário a cada execução. */
function seeded(seed: number) {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

const TEXT = {
  pt: {
    campaign: 'A Coroa de Vel’Kar',
    heroes: [
      { name: 'Aria Sombravéu', player: 'Bia', classId: 'guerreiro', speciesId: 'humano' },
      { name: 'Tibério Lúmen', player: 'Caio', classId: 'mago', speciesId: 'elfo' },
      { name: 'Dorna Pedrafunda', player: 'Lia', classId: 'clerigo', speciesId: 'anao' },
    ],
    npcs: [
      { name: 'Capitã Isolde Varn', archetype: 'guard', gender: 'f', occupation: 'Capitã da guarda' },
      { name: 'Orrin, o Mercador', archetype: 'commoner', gender: 'm', occupation: 'Mercador de especiarias' },
      { name: 'Irmã Sibila', archetype: 'acolyte', gender: 'f', occupation: 'Sacerdotisa do templo' },
    ],
    map: 'Ponte Velha',
    encounter: 'Emboscada na Ponte Velha',
    labelTower: 'Torre caída',
    labelCamp: 'Acampamento goblin',
    area: 'Vale de Vel’Kar',
    areaLabels: ['Vel’Kar', 'Floresta Cinzenta', 'Rio Prata'],
    notes: (npc: string, boss: string, hero: string) => [
      {
        title: 'Sessão 3 — A Ponte Velha',
        body: `## O que aconteceu\nO grupo seguiu a trilha dos goblins até a **Ponte Velha**. A [${npc.split(' ').slice(-1)[0]}](npc:NPC) avisou que o [${boss}](monster:BOSS) cobra pedágio de quem atravessa.\n\n## Para a próxima sessão\n- [x] Preparar o mapa da ponte\n- [ ] Decidir se o chefe foge com 10 PV\n- [ ] Dar à [${hero}](player:HERO) a pista do brasão\n\n> "Quem atravessa a ponte paga em prata ou em sangue."`,
        shared: false,
      },
      {
        title: 'Rumores da taverna',
        body: `- Caravanas somem perto da **Floresta Cinzenta**.\n- A [${npc.split(' ').slice(-1)[0]}](npc:NPC) procura voluntários.\n- Ninguém volta da torre caída depois do pôr do sol.`,
        shared: true,
      },
      { title: 'Segredos da coroa', body: 'A coroa de Vel’Kar está **dentro** da torre caída. O mercador sabe e mente.', shared: false },
    ],
    chat: ['Vou na frente, cubram a ponte!', 'Cuidado com o arqueiro na torre.'],
  },
  en: {
    campaign: 'The Crown of Vel’Kar',
    heroes: [
      { name: 'Aria Shadowveil', player: 'Bea', classId: 'guerreiro', speciesId: 'humano' },
      { name: 'Tiberius Lumen', player: 'Kai', classId: 'mago', speciesId: 'elfo' },
      { name: 'Dorna Deepstone', player: 'Lia', classId: 'clerigo', speciesId: 'anao' },
    ],
    npcs: [
      { name: 'Captain Isolde Varn', archetype: 'guard', gender: 'f', occupation: 'Captain of the guard' },
      { name: 'Orrin the Merchant', archetype: 'commoner', gender: 'm', occupation: 'Spice merchant' },
      { name: 'Sister Sibyl', archetype: 'acolyte', gender: 'f', occupation: 'Temple priestess' },
    ],
    map: 'Old Bridge',
    encounter: 'Ambush at the Old Bridge',
    labelTower: 'Fallen tower',
    labelCamp: 'Goblin camp',
    area: 'Vale of Vel’Kar',
    areaLabels: ['Vel’Kar', 'Ashen Forest', 'Silver River'],
    notes: (npc: string, boss: string, hero: string) => [
      {
        title: 'Session 3 — The Old Bridge',
        body: `## What happened\nThe party followed the goblin tracks to the **Old Bridge**. [${npc.split(' ').slice(-1)[0]}](npc:NPC) warned that the [${boss}](monster:BOSS) charges a toll to anyone crossing.\n\n## Next session\n- [x] Prepare the bridge map\n- [ ] Decide whether the boss flees at 10 HP\n- [ ] Give [${hero}](player:HERO) the clue about the crest\n\n> "Who crosses the bridge pays in silver or in blood."`,
        shared: false,
      },
      {
        title: 'Tavern rumors',
        body: `- Caravans vanish near the **Ashen Forest**.\n- [${npc.split(' ').slice(-1)[0]}](npc:NPC) is looking for volunteers.\n- Nobody comes back from the fallen tower after sunset.`,
        shared: true,
      },
      { title: 'Secrets of the crown', body: 'The crown of Vel’Kar is **inside** the fallen tower. The merchant knows and lies.', shared: false },
    ],
    chat: ['I’ll go first, cover the bridge!', 'Watch the archer in the tower.'],
  },
} as const

/** Ponte Velha, 18×11: rio no meio com ponte, torre em ruínas, árvores e entulho. */
const BRIDGE_MAP = [
  'gggggggwwwwgggg###',
  'ggtgggggwwwwggg#.#',
  'gggggggggwwwwgg#.#',
  'gtggrgggggwwwwg+.#',
  'ggggggg.bbbbbb...g',
  'gggggg..bbbbbb..gg',
  'gtgggggggwwwwggggg',
  'ggggggggwwwwgggtgg',
  'ggrgggggwwwwgggggg',
  'gggtgggwwwwgggtggg',
  'ggggggwwwwgggggggg',
]

export async function seedGm(lang: Lang) {
  useConfigStore.getState().setConfig({ language: lang })
  const text = TEXT[lang]
  const random = seeded(7)
  const gm = () => useGmStore.getState()

  // Personagens dos players, montados pelas regras de 2024 (nível 5).
  const sheetIds: string[] = []
  for (const hero of text.heroes) {
    const sheet: CharacterSheet = buildPcSheet(resolvePcBuild({ classId: hero.classId, speciesId: hero.speciesId, level: 5 }, random), random)
    sheet.identity.character_name = hero.name
    sheet.identity.player_name = hero.player
    const id = uuidv4()
    saveSheet(id, sheet, true)
    sheetIds.push(id)
  }

  const campaignId = gm().createCampaign(text.campaign)
  gm().openCampaign(campaignId)
  for (const id of sheetIds) gm().addLocalPlayer(id)

  // NPCs do gerador, com o bloco do SRD do arquétipo.
  await gm().loadSrd(lang)
  const srd = gm().srd!.monsters
  const npcIds: string[] = []
  for (const npc of text.npcs) {
    const base = srd.find(m => m.id === archetypeById(npc.archetype)!.srd)!.statblock
    const generated = generateNpc({ name: npc.name, gender: npc.gender, occupation: npc.occupation }, npc.archetype as never, base, lang, random)
    npcIds.push(gm().addNpc(generated.statblock, null, { profile: generated.profile }))
  }

  // Bestiário: cópias do SRD.
  const [bossId, warriorId] = ['srd-goblin-boss', 'srd-goblin-warrior', 'srd-owlbear', 'srd-young-green-dragon']
    .map(id => gm().copySrdToBestiary(id)!)
  const boss = gm().bestiary.find(m => m.id === bossId)!

  // Mapa de grade e encontro com o grupo de um lado e os goblins do outro.
  const mapId = gm().createMap(text.map, BRIDGE_MAP[0].length, BRIDGE_MAP.length)
  gm().setMapCells(mapId, BRIDGE_MAP.join(''))
  gm().addMapLabel(mapId, 16, 0, text.labelTower)
  gm().addMapLabel(mapId, 15, 7, text.labelCamp)
  const encounterId = gm().createEncounter(text.encounter)
  gm().setEncounterMap(encounterId, mapId)
  gm().addPlayersToEncounter(encounterId, gm().campaign!.party.map(m => m.id))
  gm().addMonsterToEncounter(encounterId, boss.id, 1)
  gm().addMonsterToEncounter(encounterId, warriorId, 3)
  const spots = [[3, 4], [2, 5], [4, 6], [16, 4], [14, 3], [15, 6], [13, 7]]
  gm().campaign!.encounters.find(e => e.id === encounterId)!.combatants.forEach((c, i) => {
    gm().placeCombatant(encounterId, c.id, { x: spots[i][0], y: spots[i][1] })
  })
  gm().rollInitiatives(encounterId, 'all', random)
  gm().startEncounter(encounterId)
  const enemy = gm().campaign!.encounters.find(e => e.id === encounterId)!.combatants.find(c => c.kind === 'monster')!
  gm().damageCombatant(encounterId, enemy.id, 7)

  // Notas com markdown e citações.
  const firstHero = gm().campaign!.party[0]
  const notes = text.notes(text.npcs[0].name, boss.statblock.name, text.heroes[0].name)
  for (const note of notes) {
    const id = gm().createNote()
    const body = note.body.replaceAll('npc:NPC', `npc:${npcIds[0]}`).replaceAll('monster:BOSS', `monster:${boss.id}`)
      .replaceAll('player:HERO', `player:${firstHero.id}`)
    gm().updateNote(id, { title: note.title, body, shared: note.shared })
  }

  const areaId = await seedAreaMap(campaignId, text.area, text.areaLabels)
  return { campaignId, encounterId, mapId, areaId, sheetIds, npcIds }
}

/** Mapa de área com rio, estradas, floresta, vila e castelo. */
async function seedAreaMap(campaignId: string, name: string, labels: readonly string[]) {
  const store = useAreaMapStore.getState()
  const id = await store.createAreaMap(campaignId, name, 1600, 1000)
  await useAreaMapStore.getState().openAreaMap(id)
  const map = useAreaMapStore.getState().map!
  const stamp = (asset: string, x: number, y: number, scale = 1): AreaElement => {
    const def = STAMPS.find(s => s.id === asset)!
    return { kind: 'stamp', id: uuidv4(), layer: def.layer, asset, x, y, scale, rotation: 0, flip: false, opacity: 1 }
  }
  const path = (style: keyof typeof AREA_PATH_STYLES, points: number[]): AreaElement => ({
    kind: 'path', id: uuidv4(), layer: AREA_PATH_STYLES[style].layer, style, width: AREA_PATH_STYLES[style].width, points,
  })
  const label = (text: string, x: number, y: number, style: 'city' | 'region', size: number): AreaElement => ({
    kind: 'label', id: uuidv4(), layer: 'labels', text, x, y, size, rotation: 0, style, color: '#2a1d10',
  })
  const trees = STAMPS.filter(s => s.category === 'nature').map(s => s.id)
  const buildings = STAMPS.filter(s => s.category === 'buildings').map(s => s.id)
  const castle = STAMPS.find(s => s.category === 'castles')!.id
  const random = seeded(11)
  const forest: AreaElement[] = []
  for (let i = 0; i < 70; i++) forest.push(stamp(trees[i % 3], 120 + random() * 420, 120 + random() * 520, 0.8 + random() * 0.5))
  const village = [[1080, 560], [1150, 600], [1110, 650], [1200, 540], [1240, 640]].map(([x, y], i) => stamp(buildings[i % buildings.length], x, y))
  useAreaMapStore.getState().commitAreaMap({
    ...map,
    elements: [
      path('river', [700, 0, 740, 200, 690, 420, 760, 640, 720, 1000]),
      path('dirtRoad', [0, 760, 400, 720, 720, 700, 1100, 620, 1600, 600]),
      path('trail', [1160, 600, 1300, 380, 1380, 260]),
      ...forest,
      ...village,
      stamp(castle, 1400, 230, 1.4),
      label(labels[0], 1160, 470, 'city', 34),
      label(labels[1], 330, 90, 'region', 40),
      label(labels[2], 790, 860, 'region', 28),
    ],
  })
  return id
}

/** Aparelho do player: a ficha de Aria e a entrada na sala pelo código. */
export async function seedPlayer(lang: Lang, code: string) {
  useConfigStore.getState().setConfig({ language: lang })
  const text = TEXT[lang]
  const random = seeded(7)
  const hero = text.heroes[0]
  const sheet = buildPcSheet(resolvePcBuild({ classId: hero.classId, speciesId: hero.speciesId, level: 5 }, random), random)
  sheet.identity.character_name = hero.name
  sheet.identity.player_name = hero.player
  const id = uuidv4()
  saveSheet(id, sheet, true)
  const membership = await useRoomStore.getState().joinRoom(code, hero.name, id)
  return { sheetId: id, code: membership.code }
}

/** Mensagens e rolagens de exemplo no log da sala (o player precisa estar conectado). */
export function seedChat(lang: Lang) {
  const text = TEXT[lang]
  const room = useRoomStore.getState()
  room.say(text.chat[0], false)
  room.roll('1d20+5', lang === 'pt' ? 'Ataque com espada longa' : 'Longsword attack', false)
  room.roll('1d8+3', lang === 'pt' ? 'Dano' : 'Damage', false)
  room.say(text.chat[1], false)
}
