import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Campaign } from '../../types'
import { encounterStatusLabel } from '../../lib/gm/encounterStatus'
import { useGmStore } from '../../store/gmStore'
import { gmPrimaryButton, gmSecondaryButton } from './GmHeader'
import { rowDangerButton } from './MonsterRow'
import { MapThumbnail } from './MapThumbnail'
import { TOKEN_FILL, tokenInitials } from './tokenStyle'
import { CreatePanel } from './CreatePanel'
import { EmptyState, SwordsIcon } from './ornaments'

/** Fichas mostradas no cartão; o resto vira "+N". */
const MAX_TOKENS = 12

/** Aba Encontros da campanha. */
export function EncounterTab({ campaign }: { campaign: Campaign }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { createEncounter, deleteEncounter } = useGmStore()
  const base = `/mestre/campanha/${campaign.id}/encontro`

  const sorted = [...campaign.encounters].sort((a, b) => b.updated_at.localeCompare(a.updated_at))

  return (
    <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
      <div className="min-w-0 order-2 lg:order-1">
        {sorted.length === 0 ? (
          <EmptyState icon={<SwordsIcon size={34} />} title={t('gm.noEncounters')} hint={t('gm.noEncountersHint')} />
        ) : (
          <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
            {sorted.map(e => {
              const map = campaign.maps.find(m => m.id === e.map_id) ?? null
              const active = e.status === 'active'
              const shown = e.combatants.slice(0, MAX_TOKENS)
              return (
                <article
                  key={e.id}
                  className={`vg-card p-5 flex gap-4 ${active ? 'border-[rgba(212,160,23,0.55)]' : ''}`}
                >
                  {map && (
                    <button onClick={() => navigate(`${base}/${e.id}`)} className="hidden sm:block w-[220px] flex-shrink-0 cursor-pointer" aria-hidden="true" tabIndex={-1}>
                      <MapThumbnail map={map} />
                    </button>
                  )}
                  <div className="flex-1 min-w-0 flex flex-col gap-3">
                    <button onClick={() => navigate(`${base}/${e.id}`)} className="text-left cursor-pointer group">
                      <h3 className="font-cinzel font-semibold text-[19px] leading-tight text-[#F5F0E8] group-hover:text-[#EAD9B0] truncate">
                        {e.name || t('gm.untitledEncounter')}
                      </h3>
                      <p className="text-[13px] text-[#A8A09B] mt-1">
                        <span className={active ? 'text-[#D4A017] font-semibold' : ''}>{encounterStatusLabel(e, t)}</span>
                        {' · '}{t('gm.combatantsCount', { n: e.combatants.length })}
                        {map ? ` · ${map.name || t('gm.untitledMap')}` : ''}
                      </p>
                    </button>
                    {shown.length > 0 && (
                      <ul className="flex flex-wrap gap-1.5" aria-label={t('gm.combatantsCount', { n: e.combatants.length })}>
                        {shown.map(c => (
                          <li
                            key={c.id}
                            title={c.name}
                            className={`w-8 h-8 rounded-full text-[11px] font-bold flex items-center justify-center text-white border border-black/30 ${c.defeated ? 'opacity-40' : ''}`}
                            style={{ background: TOKEN_FILL[c.kind] }}
                          >
                            {tokenInitials(c.name)}
                          </li>
                        ))}
                        {e.combatants.length > shown.length && (
                          <li className="h-8 px-2 rounded-full text-[12px] font-semibold flex items-center text-[#A8A09B] border border-white/[0.1]">
                            +{e.combatants.length - shown.length}
                          </li>
                        )}
                      </ul>
                    )}
                    <div className="flex gap-2 mt-auto">
                      <button onClick={() => navigate(`${base}/${e.id}`)} className={`${active ? gmPrimaryButton : gmSecondaryButton} flex-1`}>
                        {active ? t('gm.resume') : t('gm.open')}
                      </button>
                      <button
                        onClick={() => confirm(t('gm.encounterDeleteConfirm', { name: e.name })) && deleteEncounter(e.id)}
                        className={rowDangerButton}
                      >
                        {t('gm.remove')}
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
      <div className="order-1 lg:order-2">
        <CreatePanel
          title={t('gm.newEncounter')}
          hint={t('gm.noEncountersHint')}
          placeholder={t('gm.encounterName')}
          inputTestId="encontro-nome"
          buttonTestId="encontro-criar"
          onCreate={name => navigate(`${base}/${createEncounter(name || t('gm.untitledEncounter'))}`)}
        />
      </div>
    </section>
  )
}
