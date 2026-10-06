import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useGmStore } from '../../store/gmStore'
import { GmHeader, gmSecondaryButton } from '../../components/gm/GmHeader'
import { PlayerCard } from '../../components/gm/PlayerCard'
import { AddLocalPlayerModal } from '../../components/gm/AddLocalPlayerModal'
import { pickTextFile } from '../../lib/pickTextFile'
import { deliverJson } from '../../lib/deliverJson'

type Tab = 'players' | 'notes'

export function CampaignPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const {
    campaign, openedId, openCampaign, renameCampaign, setCampaignNotes,
    addLocalPlayer, importPlayerJson, reimportPlayerJson, removePlayer, exportCampaignJson,
  } = useGmStore()
  const [tab, setTab] = useState<Tab>('players')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) openCampaign(id)
  }, [id, openCampaign])

  if (openedId === id && !campaign) {
    return (
      <div className="min-h-screen bg-[#131110] font-[Manrope,system-ui]">
        <GmHeader title={t('gm.area')} backTo="/mestre" />
        <p className="text-center text-[#A8A09B] py-16">{t('gm.notFound')}</p>
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

  function handleExport() {
    const json = exportCampaignJson()
    if (!json || !campaign) return
    const name = (campaign.name || t('gm.untitled')).replace(/\s+/g, '_')
    void deliverJson(json, `${name}.json`)
  }

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: 'players', label: t('gm.tabPlayers') },
    { id: 'notes', label: t('gm.tabNotes') },
  ]

  return (
    <div className="min-h-screen bg-[#131110] font-[Manrope,system-ui]">
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
          <button onClick={handleExport} className={gmSecondaryButton}>
            {t('gm.exportCampaign')}
          </button>
        }
      />

      <div className="max-w-[1180px] mx-auto px-4 sm:px-8 py-6 pb-20">
        <div role="tablist" className="flex gap-1 mb-6 border-b border-white/[0.06]">
          {tabs.map(tb => (
            <button
              key={tb.id}
              role="tab"
              aria-selected={tab === tb.id}
              onClick={() => setTab(tb.id)}
              className={`px-4 py-2.5 text-[14px] font-semibold border-b-2 -mb-px cursor-pointer transition-colors ${
                tab === tb.id ? 'border-[#D4A017] text-[#F5F0E8]' : 'border-transparent text-[#A8A09B] hover:text-[#E8DFD0]'
              }`}
            >
              {tb.label}
            </button>
          ))}
        </div>

        {tab === 'players' && (
          <section>
            <div className="flex flex-wrap gap-2 mb-4">
              <button data-testid="adicionar-local" onClick={() => setPickerOpen(true)} className={gmSecondaryButton}>
                {t('gm.addFromDevice')}
              </button>
              <button onClick={() => readPlayerJson(importPlayerJson)} className={gmSecondaryButton}>
                {t('gm.importPlayer')}
              </button>
            </div>
            {error && <p role="alert" className="text-[13px] text-[#d4564a] mb-4">{error}</p>}

            {campaign.party.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[14px]">
                {campaign.party.map(member => (
                  <PlayerCard
                    key={member.id}
                    member={member}
                    onReimport={() => readPlayerJson(json => reimportPlayerJson(member.id, json))}
                    onRemove={() => removePlayer(member.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-14 px-6 border border-dashed border-[rgba(212,160,23,0.25)] rounded-2xl">
                <p className="text-[#A8A09B] font-semibold">{t('gm.noPlayers')}</p>
                <p className="text-[#A8A09B] text-sm mt-1">{t('gm.noPlayersHint')}</p>
              </div>
            )}
          </section>
        )}

        {tab === 'notes' && (
          <textarea
            value={campaign.notes}
            onChange={e => setCampaignNotes(e.target.value)}
            placeholder={t('gm.notesPlaceholder')}
            aria-label={t('gm.tabNotes')}
            className="w-full min-h-[50vh] bg-[#1A1714] border border-[rgba(212,160,23,0.2)] rounded-[14px] p-4 text-[15px] leading-relaxed text-[#F5F0E8] placeholder:text-[#A8A09B] focus:outline-none focus:border-[#D4A017] resize-y"
          />
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
    </div>
  )
}
