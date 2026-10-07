import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useGmStore } from '../../store/gmStore'
import { GmHeader, gmPrimaryButton, gmSecondaryButton, gmContainer } from '../../components/gm/GmHeader'
import { AppFooter } from '../../components/ui/AppFooter'
import { pickTextFile } from '../../lib/pickTextFile'
import { EmptyState, MapIcon, PeopleIcon, PlusIcon, QuillIcon, SectionTitle, SkullIcon, SwordsIcon } from '../../components/gm/ornaments'

export function GmHome() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { campaigns, loadCampaignList, createCampaign, deleteCampaign, importCampaignJson, bestiary, loadBestiary } = useGmStore()
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadCampaignList()
    loadBestiary()
  }, [loadCampaignList, loadBestiary])

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
    <div className="min-h-screen flex flex-col gm-page font-[Manrope,system-ui]">
      <GmHeader
        title={t('gm.area')}
        backTo="/"
        actions={
          <button data-testid="bestiario" onClick={() => navigate('/mestre/bestiario')} className={gmSecondaryButton}>
            <SkullIcon size={16} /> {t('gm.bestiary')}
          </button>
        }
      />

      <div className={`${gmContainer} py-8 sm:py-10 pb-20`}>
        <header className="mb-8">
          <h1 className="font-cinzel text-[30px] sm:text-[38px] font-semibold tracking-[0.03em] text-[#EAD9B0] leading-tight">{t('gm.area')}</h1>
          <p className="text-[16px] text-[#A8A09B] mt-1.5">{t('gm.areaTagline')}</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
          <section className="min-w-0 order-2 lg:order-1">
            <SectionTitle align="start" count={sorted.length}>{t('gm.campaigns')}</SectionTitle>
            {sorted.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
                {sorted.map(c => (
                  <article key={c.id} data-testid="campanha-card" className="vg-card p-6 flex flex-col gap-4">
                    <button onClick={() => navigate(`/mestre/campanha/${c.id}`)} className="text-left cursor-pointer group">
                      <h2 className="font-cinzel font-semibold text-[22px] leading-tight text-[#F5F0E8] group-hover:text-[#EAD9B0] truncate">
                        {c.name || t('gm.untitled')}
                      </h2>
                      <p className="text-[13px] text-[#A8A09B] mt-1">{t('gm.updatedAt', { date: new Date(c.updated_at).toLocaleDateString() })}</p>
                    </button>

                    <dl className="grid grid-cols-4 gap-2">
                      {([
                        ['tabPlayers', c.players, <PeopleIcon size={16} key="p" />],
                        ['tabNpcs', c.npcs, <QuillIcon size={16} key="n" />],
                        ['tabEncounters', c.encounters, <SwordsIcon size={16} key="e" />],
                        ['tabMaps', c.maps, <MapIcon size={16} key="m" />],
                      ] as const).map(([key, n, icon]) => (
                        <div key={key} className="flex flex-col items-center gap-1 rounded-[10px] bg-[#131110] border border-white/[0.06] py-2.5">
                          <span className="text-[#D4A017] opacity-80">{icon}</span>
                          <dt className="order-last text-[11px] font-semibold text-[#A8A09B]">{t(`gm.${key}`)}</dt>
                          <dd className="text-[18px] font-bold text-[#F5F0E8] tabular-nums leading-none">{n ?? '–'}</dd>
                        </div>
                      ))}
                    </dl>

                    {c.active_encounter && (
                      <p className="text-[13px] font-semibold text-[#D4A017] flex items-center gap-1.5">
                        <SwordsIcon size={15} /> {t('gm.inCombat', { name: c.active_encounter })}
                      </p>
                    )}

                    <div className="flex gap-2 mt-auto">
                      <button onClick={() => navigate(`/mestre/campanha/${c.id}`)} className={`${gmPrimaryButton} flex-1`}>
                        {t('gm.open')}
                      </button>
                      <button
                        onClick={() => handleDelete(c.id, c.name)}
                        aria-label={t('gm.deleteAriaLabel', { name: c.name })}
                        className="inline-flex items-center justify-center min-w-[42px] text-[#b56a6a] bg-[rgba(181,57,47,0.1)] border border-[rgba(181,57,47,0.28)] hover:bg-[rgba(181,57,47,0.2)] rounded-[10px] px-3 cursor-pointer transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState icon={<QuillIcon size={34} />} title={t('gm.noCampaigns')} hint={t('gm.noCampaignsHint')} />
            )}
          </section>

          <aside className="order-1 lg:order-2 lg:sticky lg:top-[88px] flex flex-col gap-4">
            <form onSubmit={handleCreate} className="vg-card p-6 flex flex-col gap-3">
              <h2 className="font-cinzel text-[17px] font-semibold text-[#EAD9B0]">{t('gm.newCampaign')}</h2>
              <input
                data-testid="campanha-nome"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={t('gm.campaignName')}
                aria-label={t('gm.campaignName')}
                className="bg-[#131110] border border-[rgba(212,160,23,0.25)] rounded-[10px] px-4 py-3 text-[16px] text-[#F5F0E8] placeholder:text-[#A8A09B] focus:outline-none focus:border-[#D4A017]"
              />
              <button type="submit" data-testid="campanha-criar" className={`${gmPrimaryButton} text-[15px] min-h-[46px]`}>
                <PlusIcon size={16} /> {t('gm.newCampaign')}
              </button>
              <button type="button" onClick={handleImport} className={gmSecondaryButton}>
                {t('gm.importCampaign')}
              </button>
              {error && <p role="alert" className="text-[13px] text-[#d4564a]">{error}</p>}
            </form>

            <button
              onClick={() => navigate('/mestre/bestiario')}
              className="vg-card p-6 flex items-center gap-4 text-left cursor-pointer hover:border-[rgba(212,160,23,0.45)] transition-colors"
            >
              <span className="w-12 h-12 flex-shrink-0 rounded-full border border-[rgba(212,160,23,0.4)] flex items-center justify-center text-[#D4A017]">
                <SkullIcon size={24} />
              </span>
              <span className="min-w-0">
                <span className="block font-cinzel text-[17px] font-semibold text-[#EAD9B0]">{t('gm.bestiary')}</span>
                <span className="block text-[13px] text-[#A8A09B] mt-0.5">{t('gm.bestiaryHint')}</span>
                <span className="block text-[12px] text-[#E8DFD0] mt-1 tabular-nums">{t('gm.bestiaryCount', { n: bestiary.length })}</span>
              </span>
            </button>
          </aside>
        </div>
      </div>
      <AppFooter containerClassName={gmContainer} />
    </div>
  )
}
