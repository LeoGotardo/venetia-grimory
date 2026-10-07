import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Campaign, Encounter } from '../../types'
import { useGmStore } from '../../store/gmStore'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { GmHeader, gmPrimaryButton, gmSecondaryButton } from '../../components/gm/GmHeader'
import { CombatantRow } from '../../components/gm/CombatantRow'
import { CombatantPanel } from '../../components/gm/CombatantPanel'
import { AddCombatantsModal } from '../../components/gm/AddCombatantsModal'
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
  const [addOpen, setAddOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [viewingBlock, setViewingBlock] = useState(false)
  const [view, setView] = useState<'list' | 'map'>('map')
  // No celular o painel é um modal: tocar num token para arrastar não deve abri-lo.
  const [panelOpen, setPanelOpen] = useState(false)
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

  return (
    <div className="min-h-screen bg-[#131110] font-[Manrope,system-ui]">
      <GmHeader
        backTo={`/mestre/campanha/${campaign.id}?aba=encontros`}
        title={
          <input
            value={encounter.name}
            onChange={e => renameEncounter(encounter.id, e.target.value)}
            aria-label={t('gm.encounterName')}
            placeholder={t('gm.untitledEncounter')}
            className="w-full bg-transparent border-0 border-b border-transparent focus:border-[#D4A017] text-[15px] font-extrabold text-[#E8DFD0] placeholder:text-[#A8A09B] focus:outline-none"
          />
        }
        actions={
          <button data-testid="adicionar-combatentes" onClick={() => setAddOpen(true)} className={gmSecondaryButton}>
            + {t('gm.addCombatants')}
          </button>
        }
      />

      <div className="max-w-[1180px] mx-auto px-4 sm:px-8 py-5 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5 items-start">
          <div className="flex flex-col gap-3 min-w-0">
            <div className="rounded-[11px] border border-white/[0.07] bg-[#1A1714] px-3 py-3 flex flex-col gap-3">
              <div className="flex items-baseline justify-between gap-2">
                <span className={`text-[15px] font-extrabold ${active ? 'text-[#D4A017]' : 'text-[#E8DFD0]'}`}>
                  {encounterStatusLabel(encounter, t)}
                </span>
                {active && current && (
                  <span className="text-[13px] text-[#E8DFD0] truncate">{t('gm.turnOf', { name: current.name })}</span>
                )}
              </div>

              {encounter.status === 'preparing' && (
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => rollInitiatives(encounter.id, 'all')} disabled={encounter.combatants.length === 0} className={gmSecondaryButton}>
                    🎲 {t('gm.rollAll')}
                  </button>
                  <button onClick={() => rollInitiatives(encounter.id, 'npcs')} disabled={!encounter.combatants.some(c => c.kind !== 'player')} className={gmSecondaryButton}>
                    🎲 {t('gm.rollNpcs')}
                  </button>
                  <button
                    data-testid="iniciar-combate"
                    onClick={() => {
                      rollInitiatives(encounter.id, 'missing')
                      startEncounter(encounter.id)
                    }}
                    disabled={encounter.combatants.length === 0}
                    className={`${gmPrimaryButton} ml-auto`}
                  >
                    {t('gm.start')}
                  </button>
                </div>
              )}

              {active && (
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => previousTurn(encounter.id)} aria-label={t('gm.previous')} className={gmSecondaryButton}>◀</button>
                  <button data-testid="proximo-turno" onClick={() => nextTurn(encounter.id)} className={`${gmPrimaryButton} flex-1 py-2.5 text-[15px]`}>
                    {t('gm.next')} ▶
                  </button>
                  <button
                    onClick={() => confirm(t('gm.endConfirm')) && endEncounter(encounter.id)}
                    className="text-[13px] font-semibold text-[#b56a6a] bg-[rgba(181,57,47,0.1)] border border-[rgba(181,57,47,0.28)] hover:bg-[rgba(181,57,47,0.2)] rounded-[9px] px-3 py-2 cursor-pointer"
                  >
                    {t('gm.end')}
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 text-[12px] font-semibold text-[#A8A09B]">
                {t('gm.encounterMap')}
                <select
                  value={encounter.map_id ?? ''}
                  onChange={e => changeMap(e.target.value)}
                  className="bg-[#131110] border border-white/[0.1] rounded-[8px] px-2 py-1.5 text-[13px] text-[#F5F0E8]"
                >
                  <option value="">{t('gm.mapNone')}</option>
                  {campaign.maps.map(m => <option key={m.id} value={m.id}>{m.name || t('gm.untitledMap')}</option>)}
                </select>
              </label>
              {map && (
                <div role="tablist" className="ml-auto inline-flex rounded-[9px] border border-white/[0.1] overflow-hidden">
                  {(['map', 'list'] as const).map(v => (
                    <button
                      key={v}
                      role="tab"
                      aria-selected={view === v}
                      onClick={() => setView(v)}
                      className={`px-3 py-1.5 text-[12px] font-semibold cursor-pointer ${view === v ? 'bg-[#D4A017] text-[#131110]' : 'text-[#E8DFD0] bg-white/5'}`}
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
              />
            )}
            {showMap && !isDesktop && selected && (
              <div className="flex items-center gap-2 rounded-[11px] border border-white/[0.1] bg-[#1A1714] px-3 py-2">
                <span className="flex-1 font-semibold text-[#F5F0E8] truncate">{selected.name}</span>
                <span className="text-[12px] text-[#E8DFD0] tabular-nums">{selected.hp.current}/{selected.hp.max} {t('gm.hp')}</span>
                <button onClick={() => setPanelOpen(true)} className={gmSecondaryButton}>{t('gm.details')}</button>
              </div>
            )}

            {!showMap && <DifficultyMeter budget={budget} />}

            {showMap ? null : encounter.combatants.length === 0 ? (
              <div className="text-center py-12 px-6 border border-dashed border-[rgba(212,160,23,0.25)] rounded-2xl">
                <p className="text-[#A8A09B] font-semibold">{t('gm.emptyCombatants')}</p>
              </div>
            ) : (
              <>
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
                <p className="text-[12px] text-[#A8A09B]">{t('gm.selectHint')}</p>
              </>
            )}
          </div>

          <aside className="flex flex-col gap-3 lg:sticky lg:top-[76px]">
            {isDesktop && panel && <div className="vg-card p-4">{panel}</div>}
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
      <AddCombatantsModal open={addOpen} onClose={() => setAddOpen(false)} campaign={campaign} encounter={encounter} />
      <StatBlockModal block={viewingBlock ? selected?.statblock ?? null : null} onClose={() => setViewingBlock(false)} />
    </div>
  )
}
