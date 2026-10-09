import { lazy, Suspense, useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useGmStore } from '../../store/gmStore'
import { useAreaMapStore } from '../../store/areaMapStore'
import { GmHeader, gmPrimaryButton, gmSecondaryButton, gmContainer } from '../../components/gm/GmHeader'
import { AppFooter } from '../../components/ui/AppFooter'
import { PlayerCard } from '../../components/gm/PlayerCard'
import { PartySummary } from '../../components/gm/PartySummary'
import { AddLocalPlayerModal } from '../../components/gm/AddLocalPlayerModal'
import { NpcTab } from '../../components/gm/NpcTab'
import { EncounterTab } from '../../components/gm/EncounterTab'
import { MapTab } from '../../components/gm/MapTab'
import { pickTextFile } from '../../lib/pickTextFile'
import { deliverJson } from '../../lib/deliverJson'
import { EmptyState, PeopleIcon } from '../../components/gm/ornaments'

// O markdown (react-markdown + remark-gfm) só carrega quando a aba Notas abre.
const NotesTab = lazy(() => import('../../components/gm/notes/NotesTab').then(m => ({ default: m.NotesTab })))

const TABS = ['players', 'npcs', 'encontros', 'mapas', 'notes'] as const
type Tab = typeof TABS[number]

export function CampaignPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const {
    campaign, openedId, openCampaign, renameCampaign,
    addLocalPlayer, importPlayerJson, reimportPlayerJson, removePlayer, exportCampaignJson,
  } = useGmStore()
  // A aba fica na URL (`?aba=npcs`): voltar do editor de NPC cai na aba certa.
  const [searchParams, setSearchParams] = useSearchParams()
  const tab: Tab = TABS.find(x => x === searchParams.get('aba')) ?? 'players'
  const setTab = (next: Tab) => setSearchParams(next === 'players' ? {} : { aba: next }, { replace: true })
  const [pickerOpen, setPickerOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) openCampaign(id)
  }, [id, openCampaign])

  // Os mapas de área moram no IndexedDB: a contagem da aba chega um instante depois.
  const { list: areaMaps, listCampaignId: areaMapsOf, loadList: loadAreaMaps } = useAreaMapStore()
  useEffect(() => {
    if (id) void loadAreaMaps(id)
  }, [id, loadAreaMaps])

  if (openedId === id && !campaign) {
    return (
      <div className="min-h-screen flex flex-col gm-page font-[Manrope,system-ui]">
        <GmHeader title={t('gm.area')} backTo="/mestre" />
        <p className="text-center text-[#A8A09B] py-16">{t('gm.notFound')}</p>
        <AppFooter containerClassName={gmContainer} />
      </div>
    )
  }
  if (!campaign || campaign.id !== id) return null

  async function readPlayerJson(apply: (json: string) => void) {
    setError(null)
    const json = await pickTextFile()
    if (!json) return
    try {
      apply(json)
    } catch {
      setError(t('gm.invalidPlayer'))
    }
  }

  async function handleExport() {
    const json = await exportCampaignJson()
    if (!json || !campaign) return
    const name = (campaign.name || t('gm.untitled')).replace(/\s+/g, '_')
    void deliverJson(json, `${name}.json`)
  }

  const tabs: Array<{ id: Tab; label: string; count?: number }> = [
    { id: 'players', label: t('gm.tabPlayers'), count: campaign.party.length },
    { id: 'npcs', label: t('gm.tabNpcs'), count: campaign.npcs.length },
    { id: 'encontros', label: t('gm.tabEncounters'), count: campaign.encounters.length },
    { id: 'mapas', label: t('gm.tabMaps'), count: campaign.maps.length + (areaMapsOf === campaign.id ? areaMaps?.length ?? 0 : 0) },
    { id: 'notes', label: t('gm.tabNotes'), count: campaign.notes.length },
  ]

  return (
    <div className="min-h-screen flex flex-col gm-page font-[Manrope,system-ui]">
      <GmHeader
        backTo="/mestre"
        title={
          <input
            value={campaign.name}
            onChange={e => renameCampaign(e.target.value)}
            aria-label={t('gm.campaignName')}
            placeholder={t('gm.untitled')}
            className="w-full bg-transparent border-0 border-b border-transparent focus:border-[#D4A017] text-[15px] font-extrabold text-[#E8DFD0] placeholder:text-[#A8A09B] focus:outline-none"
          />
        }
        actions={
          <button onClick={() => void handleExport()} className={gmSecondaryButton}>
            {t('gm.exportCampaign')}
          </button>
        }
      />

      <div className={`${gmContainer} py-6 pb-20`}>
        <div role="tablist" className="flex gap-1 mb-6 border-b border-white/[0.06] overflow-x-auto overflow-y-hidden no-scrollbar">
          {tabs.map(tb => (
            <button
              key={tb.id}
              role="tab"
              aria-selected={tab === tb.id}
              onClick={() => setTab(tb.id)}
              className={`flex-shrink-0 whitespace-nowrap px-5 min-h-[50px] text-[16px] font-semibold border-b-2 -mb-px cursor-pointer transition-colors ${
                tab === tb.id ? 'border-[#D4A017] text-[#F5F0E8]' : 'border-transparent text-[#A8A09B] hover:text-[#E8DFD0]'
              }`}
            >
              {tb.label}
              {tb.count != null && tb.count > 0 && (
                <span className="ml-2 text-[12px] font-semibold tabular-nums text-[#A8A09B]">{tb.count}</span>
              )}
            </button>
          ))}
        </div>

        {tab === 'players' && (
          <section>
            <div className={`flex flex-wrap gap-2 mb-4 ${campaign.party.length === 0 ? 'hidden' : ''}`}>
              <button data-testid="adicionar-local" onClick={() => setPickerOpen(true)} className={gmSecondaryButton}>
                {t('gm.addFromDevice')}
              </button>
              <button onClick={() => readPlayerJson(importPlayerJson)} className={gmSecondaryButton}>
                {t('gm.importPlayer')}
              </button>
            </div>
            {error && <p role="alert" className="text-[13px] text-[#d4564a] mb-4">{error}</p>}

            {campaign.party.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
                  {campaign.party.map(member => (
                    <PlayerCard
                      key={member.id}
                      member={member}
                      onReimport={() => readPlayerJson(json => reimportPlayerJson(member.id, json))}
                      onRemove={() => removePlayer(member.id)}
                    />
                  ))}
                </div>
                <PartySummary party={campaign.party} />
              </div>
            ) : (
              <EmptyState icon={<PeopleIcon size={34} />} title={t('gm.noPlayers')} hint={t('gm.noPlayersHint')}>
                <button onClick={() => setPickerOpen(true)} className={gmPrimaryButton}>{t('gm.addFromDevice')}</button>
                <button onClick={() => readPlayerJson(importPlayerJson)} className={gmSecondaryButton}>{t('gm.importPlayer')}</button>
              </EmptyState>
            )}
          </section>
        )}

        {tab === 'npcs' && <NpcTab campaign={campaign} />}

        {tab === 'encontros' && <EncounterTab campaign={campaign} />}

        {tab === 'mapas' && <MapTab campaign={campaign} />}

        {tab === 'notes' && (
          <Suspense fallback={<p className="text-center text-[#A8A09B] py-16 animate-pulse">{t('loading.loading')}</p>}>
            <NotesTab campaign={campaign} />
          </Suspense>
        )}
      </div>

      <AddLocalPlayerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        inParty={campaign.party.flatMap(m => (m.sheet_id ? [m.sheet_id] : []))}
        onPick={sheetId => {
          addLocalPlayer(sheetId)
          setPickerOpen(false)
        }}
      />
      <AppFooter containerClassName={gmContainer} />
    </div>
  )
}
