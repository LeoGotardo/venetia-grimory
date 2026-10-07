import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Campaign, Encounter } from '../../types'
import { useGmStore } from '../../store/gmStore'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { GmHeader, gmPrimaryButton, gmSecondaryButton, gmContainer } from '../../components/gm/GmHeader'
import { CombatantRow } from '../../components/gm/CombatantRow'
import { CombatantPanel } from '../../components/gm/CombatantPanel'
import { AddCombatantsModal, type CombatantSource } from '../../components/gm/AddCombatantsModal'
import { DiceIcon, EmptyState, PeopleIcon, PlusIcon, QuillIcon, SectionTitle, SkullIcon, SwordsIcon } from '../../components/gm/ornaments'
import { DifficultyMeter } from '../../components/gm/DifficultyMeter'
import { EncounterLog } from '../../components/gm/EncounterLog'
import { EncounterMap } from '../../components/gm/EncounterMap'
import { StatBlockModal } from '../../components/gm/StatBlockModal'
import { encounterStatusLabel } from '../../lib/gm/encounterStatus'
import { Modal } from '../../components/ui/Modal'
import { encounterBudget, encounterXp } from '../../lib/gm/difficulty'
import { NotFound } from '../NotFound'

/** `/mestre/campanha/:id/encontro/:encounterId` — o rastreador de combate. */
export function EncounterPage() {
  const { id, encounterId } = useParams<{ id: string; encounterId: string }>()
  const { campaign, openedId, openCampaign } = useGmStore()

  useEffect(() => {
    if (id) openCampaign(id)
  }, [id, openCampaign])

  if (openedId === id && !campaign) return <NotFound />
  if (!campaign || campaign.id !== id) return null

  const encounter = campaign.encounters.find(e => e.id === encounterId)
  if (!encounter) return <NotFound />

  return <EncounterView campaign={campaign} encounter={encounter} />
}

function EncounterView({ campaign, encounter }: { campaign: Campaign; encounter: Encounter }) {
  const { t } = useTranslation()
  const {
    renameEncounter, updateCombatant, rollInitiatives, startEncounter, nextTurn, previousTurn, endEncounter,
    setEncounterMap,
  } = useGmStore()
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [addSource, setAddSource] = useState<CombatantSource | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [viewingBlock, setViewingBlock] = useState(false)
  const [view, setView] = useState<'list' | 'map'>('map')
  // No celular o painel é um modal: tocar num token para arrastar não deve abri-lo.
  const [panelOpen, setPanelOpen] = useState(false)
  const [tableView, setTableView] = useState(false)
  const map = campaign.maps.find(m => m.id === encounter.map_id) ?? null
  const showMap = map != null && view === 'map'

  function changeMap(mapId: string) {
    const placed = encounter.combatants.some(c => c.position)
    if (placed && !confirm(t('gm.changeMapConfirm'))) return
    setEncounterMap(encounter.id, mapId || null)
    setView('map')
  }

  const selected = encounter.combatants.find(c => c.id === selectedId) ?? null
  const current = encounter.combatants.find(c => c.id === encounter.turn_id) ?? null
  const active = encounter.status === 'active'

  const budget = useMemo(() => {
    const playerLevels = encounter.combatants.flatMap(c => (c.kind === 'player' && c.level ? [c.level] : []))
    const levels = playerLevels.length > 0 ? playerLevels : campaign.party.map(m => m.snapshot.identity.level)
    return encounterBudget(levels, encounterXp(encounter.combatants))
  }, [encounter.combatants, campaign.party])

  const sources: Array<{ id: CombatantSource; label: string; icon: ReactNode }> = [
    { id: 'players', label: t('gm.sourcePlayers'), icon: <PeopleIcon size={15} /> },
    { id: 'npcs', label: t('gm.sourceNpcs'), icon: <QuillIcon size={15} /> },
    { id: 'bestiary', label: t('gm.sourceBestiary'), icon: <SkullIcon size={15} /> },
  ]
  const addButtons = sources.map(src => (
    <button key={src.id} data-testid={`adicionar-${src.id}`} onClick={() => setAddSource(src.id)} className={`${gmSecondaryButton} min-h-[40px]`}>
      {src.icon} {src.label}
    </button>
  ))
  const selectedProfile = selected?.kind === 'npc' ? campaign.npcs.find(n => n.id === selected.ref_id)?.profile ?? null : null

  const initiativeList = (
    <ol className="flex flex-col gap-1.5">
      {encounter.combatants.map(c => (
        <CombatantRow
          key={c.id}
          combatant={c}
          active={c.id === encounter.turn_id}
          selected={c.id === selectedId}
          onSelect={() => {
            setSelectedId(c.id === selectedId && isDesktop ? null : c.id)
            setPanelOpen(true)
          }}
          onInitiative={value => updateCombatant(encounter.id, c.id, { initiative: value })}
        />
      ))}
    </ol>
  )

  const panel = selected && (
    <CombatantPanel
      key={selected.id}
      encounterId={encounter.id}
      combatant={selected}
      onViewBlock={() => setViewingBlock(true)}
      onRemoved={() => setSelectedId(null)}
      showName={isDesktop}
      onMap={map != null}
    />
  )

  // Visão da mesa: a tela vira só o mapa, para virar o tablet para os jogadores.
  if (tableView && map) {
    const visibleTurn = active && current && !current.hidden
    return (
      <div className="min-h-screen bg-black font-[Manrope,system-ui] px-3 sm:px-6 py-3 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[16px] font-extrabold text-[#D4A017] truncate">
            {encounterStatusLabel(encounter, t)}{visibleTurn ? ` · ${t('gm.turnOf', { name: current.name })}` : ''}
          </span>
          <button onClick={() => setTableView(false)} className={gmSecondaryButton}>{t('gm.exitPlayerView')}</button>
        </div>
        <EncounterMap
          encounter={encounter}
          map={map}
          selectedId={null}
          onSelect={() => {}}
          playerView
          onPlayerViewChange={setTableView}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen gm-page font-[Manrope,system-ui]">
      <GmHeader
        backTo={`/mestre/campanha/${campaign.id}?aba=encontros`}
        title={
          <input
            value={encounter.name}
            onChange={e => renameEncounter(encounter.id, e.target.value)}
            aria-label={t('gm.encounterName')}
            placeholder={t('gm.untitledEncounter')}
            className="w-full bg-transparent border-0 border-b border-transparent focus:border-[#D4A017] text-[17px] font-extrabold text-[#E8DFD0] placeholder:text-[#A8A09B] focus:outline-none"
          />
        }
        actions={
          <button data-testid="adicionar-combatentes" onClick={() => setAddSource('players')} className={gmSecondaryButton}>
            <PlusIcon size={15} /> <span className="hidden sm:inline">{t('gm.addCombatants')}</span>
          </button>
        }
      />

      <div className={`${gmContainer} py-5 pb-24`}>
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_400px] 2xl:grid-cols-[minmax(0,1fr)_460px] gap-6 items-start">
          <div className="flex flex-col gap-3 min-w-0">
            <div className="vg-card px-5 py-3.5 flex flex-wrap items-center gap-3">
              <div className="min-w-0 mr-auto">
                <div className={`text-[21px] font-extrabold leading-tight ${active ? 'text-[#D4A017]' : 'text-[#EAD9B0]'}`}>
                  {encounterStatusLabel(encounter, t)}
                </div>
                {active && current && (
                  <div className="text-[15px] text-[#E8DFD0] truncate">{t('gm.turnOf', { name: current.name })}</div>
                )}
              </div>

              {encounter.status === 'preparing' && (
                <>
                  <button onClick={() => rollInitiatives(encounter.id, 'all')} disabled={encounter.combatants.length === 0} className={gmSecondaryButton}>
                    <DiceIcon size={16} /> {t('gm.rollAll')}
                  </button>
                  <button onClick={() => rollInitiatives(encounter.id, 'npcs')} disabled={!encounter.combatants.some(c => c.kind !== 'player')} className={gmSecondaryButton}>
                    <DiceIcon size={16} /> {t('gm.rollNpcs')}
                  </button>
                  <button
                    data-testid="iniciar-combate"
                    onClick={() => {
                      rollInitiatives(encounter.id, 'missing')
                      startEncounter(encounter.id)
                    }}
                    disabled={encounter.combatants.length === 0}
                    className={`${gmPrimaryButton} min-h-[48px] px-6 text-[16px]`}
                  >
                    {t('gm.start')}
                  </button>
                </>
              )}

              {active && (
                <div className="flex gap-2 w-full sm:w-auto">
                  <button onClick={() => previousTurn(encounter.id)} aria-label={t('gm.previous')} className={`${gmSecondaryButton} min-h-[48px]`}>◀</button>
                  <button data-testid="proximo-turno" onClick={() => nextTurn(encounter.id)} className={`${gmPrimaryButton} flex-1 sm:min-w-[240px] min-h-[48px] text-[16px]`}>
                    {t('gm.next')} ▶
                  </button>
                  <button
                    onClick={() => confirm(t('gm.endConfirm')) && endEncounter(encounter.id)}
                    className="min-h-[48px] text-[14px] font-semibold text-[#b56a6a] bg-[rgba(181,57,47,0.1)] border border-[rgba(181,57,47,0.28)] hover:bg-[rgba(181,57,47,0.2)] rounded-[10px] px-4 cursor-pointer"
                  >
                    {t('gm.end')}
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 text-[13px] font-semibold text-[#A8A09B]">
                {t('gm.encounterMap')}
                <select
                  value={encounter.map_id ?? ''}
                  onChange={e => changeMap(e.target.value)}
                  className="min-h-[42px] bg-[#131110] border border-white/[0.1] rounded-[10px] px-3 text-[14px] text-[#F5F0E8]"
                >
                  <option value="">{t('gm.mapNone')}</option>
                  {campaign.maps.map(m => <option key={m.id} value={m.id}>{m.name || t('gm.untitledMap')}</option>)}
                </select>
              </label>
              {encounter.combatants.length > 0 && (
                <>
                  <span className="w-px h-6 bg-white/[0.1] mx-1 hidden sm:block" aria-hidden="true" />
                  <span className="text-[13px] font-semibold text-[#A8A09B]">{t('gm.addShort')}</span>
                  {addButtons}
                </>
              )}
              {map && (
                <div role="tablist" className="ml-auto inline-flex rounded-[10px] border border-white/[0.1] overflow-hidden">
                  {(['map', 'list'] as const).map(v => (
                    <button
                      key={v}
                      role="tab"
                      aria-selected={view === v}
                      onClick={() => setView(v)}
                      className={`px-4 min-h-[42px] text-[14px] font-semibold cursor-pointer ${view === v ? 'bg-[#D4A017] text-[#131110]' : 'text-[#E8DFD0] bg-white/5'}`}
                    >
                      {t(v === 'map' ? 'gm.viewMap' : 'gm.viewList')}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {showMap && (
              <EncounterMap
                encounter={encounter}
                map={map}
                selectedId={selectedId}
                onSelect={setSelectedId}
                playerView={false}
                onPlayerViewChange={setTableView}
              />
            )}
            {showMap && !isDesktop && selected && (
              <div className="flex items-center gap-2 rounded-[11px] border border-white/[0.1] bg-[#1A1714] px-3 py-2">
                <span className="flex-1 font-semibold text-[#F5F0E8] truncate">{selected.name}</span>
                <span className="text-[13px] text-[#E8DFD0] tabular-nums">{selected.hp.current}/{selected.hp.max} {t('gm.hp')}</span>
                <button onClick={() => setPanelOpen(true)} className={gmSecondaryButton}>{t('gm.details')}</button>
              </div>
            )}

            {!showMap && <DifficultyMeter budget={budget} />}

            {showMap ? null : encounter.combatants.length === 0 ? (
              <EmptyState icon={<SwordsIcon size={34} />} title={t('gm.emptyCombatants')} hint={t('gm.emptyCombatantsHint')}>
                {addButtons}
              </EmptyState>
            ) : (
              <>
                {initiativeList}
                <p className="text-[13px] text-[#A8A09B]">{t('gm.selectHint')}</p>
              </>
            )}
          </div>

          <aside className="flex flex-col gap-3 lg:sticky lg:top-[88px] lg:max-h-[calc(100dvh-108px)] lg:overflow-y-auto lg:pr-1">
            {isDesktop && showMap && encounter.combatants.length > 0 && (
              <section className="vg-card p-4">
                <SectionTitle align="start" count={encounter.combatants.length}>{t('gm.initiativeOrder')}</SectionTitle>
                {initiativeList}
              </section>
            )}
            {isDesktop && panel && <div className="vg-card p-4">{panel}</div>}
            {showMap && <DifficultyMeter budget={budget} />}
            <EncounterLog log={encounter.log} />
          </aside>
        </div>
      </div>

      {!isDesktop && (
        <Modal
          open={selected != null && panelOpen && !viewingBlock}
          onClose={() => {
            setPanelOpen(false)
            if (!showMap) setSelectedId(null)
          }}
          title={selected?.name}
        >
          {panel}
        </Modal>
      )}
      <AddCombatantsModal
        key={addSource ?? 'closed'}
        open={addSource != null}
        initialSource={addSource ?? 'players'}
        onClose={() => setAddSource(null)}
        campaign={campaign}
        encounter={encounter}
      />
      <StatBlockModal
        block={viewingBlock ? selected?.statblock ?? null : null}
        profile={selectedProfile}
        onClose={() => setViewingBlock(false)}
      />
    </div>
  )
}
