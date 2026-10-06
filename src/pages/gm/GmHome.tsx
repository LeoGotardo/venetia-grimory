import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useGmStore } from '../../store/gmStore'
import { GmHeader, gmPrimaryButton, gmSecondaryButton } from '../../components/gm/GmHeader'
import { pickTextFile } from '../../lib/pickTextFile'

export function GmHome() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { campaigns, loadCampaignList, createCampaign, deleteCampaign, importCampaignJson } = useGmStore()
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { loadCampaignList() }, [loadCampaignList])

  const sorted = useMemo(
    () => [...campaigns].sort((a, b) => b.updated_at.localeCompare(a.updated_at)),
    [campaigns],
  )

  function handleCreate(e: FormEvent) {
    e.preventDefault()
    const id = createCampaign(name.trim() || t('gm.untitled'))
    setName('')
    navigate(`/mestre/campanha/${id}`)
  }

  async function handleImport() {
    setError(null)
    const json = await pickTextFile()
    if (!json) return
    try {
      navigate(`/mestre/campanha/${importCampaignJson(json)}`)
    } catch {
      setError(t('gm.invalidCampaign'))
    }
  }

  function handleDelete(id: string, campaignName: string) {
    if (!confirm(t('gm.deleteConfirm', { name: campaignName }))) return
    deleteCampaign(id)
  }

  return (
    <div className="min-h-screen bg-[#131110] font-[Manrope,system-ui]">
      <GmHeader title={t('gm.area')} backTo="/" />

      <div className="max-w-[920px] mx-auto px-4 sm:px-8 py-8 sm:py-12 pb-20">
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3 mb-3">
          <input
            data-testid="campanha-nome"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={t('gm.campaignName')}
            aria-label={t('gm.campaignName')}
            className="flex-1 bg-[#1A1714] border border-[rgba(212,160,23,0.25)] rounded-[11px] px-4 py-3 text-[15px] text-[#F5F0E8] placeholder:text-[#A8A09B] focus:outline-none focus:border-[#D4A017]"
          />
          <div className="flex gap-3">
            <button type="submit" data-testid="campanha-criar" className={`${gmPrimaryButton} flex-1 sm:flex-none py-3 text-[15px]`}>
              {t('gm.newCampaign')}
            </button>
            <button type="button" onClick={handleImport} className={`${gmSecondaryButton} flex-1 sm:flex-none justify-center py-3 text-[15px]`}>
              {t('gm.importCampaign')}
            </button>
          </div>
        </form>
        {error && <p role="alert" className="text-[13px] text-[#d4564a] mb-3">{error}</p>}

        <div className="flex items-center justify-between mt-8 mb-4">
          <div className="flex items-center gap-[11px]">
            <span className="w-1 h-[19px] rounded-sm bg-gradient-to-b from-[#E8C25A] to-[#B8860B]" />
            <h1 className="font-extrabold text-[17px] text-[#EAD9B0]">{t('gm.campaigns')}</h1>
          </div>
          <span className="text-xs text-[#A8A09B]">{sorted.length}</span>
        </div>

        {sorted.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
            {sorted.map(c => (
              <div key={c.id} data-testid="campanha-card" className="vg-card p-[18px_20px]">
                <div className="font-bold text-[17px] text-[#F5F0E8] truncate">{c.name || t('gm.untitled')}</div>
                <div className="text-[13px] text-[#A8A09B] mt-1">
                  {t('gm.playersCount', { n: c.players })} · {t('gm.updatedAt', { date: new Date(c.updated_at).toLocaleDateString() })}
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => navigate(`/mestre/campanha/${c.id}`)} className={`${gmPrimaryButton} flex-1`}>
                    {t('gm.open')}
                  </button>
                  <button
                    onClick={() => handleDelete(c.id, c.name)}
                    aria-label={t('gm.deleteAriaLabel', { name: c.name })}
                    className="inline-flex items-center justify-center text-[#b56a6a] bg-[rgba(181,57,47,0.1)] border border-[rgba(181,57,47,0.28)] hover:bg-[rgba(181,57,47,0.2)] rounded-[9px] px-[11px] py-[9px] cursor-pointer transition-colors"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-14 px-6 border border-dashed border-[rgba(212,160,23,0.25)] rounded-2xl">
            <p className="text-[#A8A09B] font-semibold">{t('gm.noCampaigns')}</p>
            <p className="text-[#A8A09B] text-sm mt-1">{t('gm.noCampaignsHint')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
