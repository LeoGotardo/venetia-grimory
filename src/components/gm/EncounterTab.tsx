import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Campaign } from '../../types'
import { encounterStatusLabel } from '../../lib/gm/encounterStatus'
import { useGmStore } from '../../store/gmStore'
import { gmSecondaryButton } from './GmHeader'
import { rowButton, rowDangerButton } from './MonsterRow'

/** Aba Encontros da campanha. */
export function EncounterTab({ campaign }: { campaign: Campaign }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { createEncounter, deleteEncounter } = useGmStore()
  const [name, setName] = useState('')
  const base = `/mestre/campanha/${campaign.id}/encontro`

  function handleCreate(e: FormEvent) {
    e.preventDefault()
    const id = createEncounter(name.trim() || t('gm.untitledEncounter'))
    setName('')
    navigate(`${base}/${id}`)
  }

  const sorted = [...campaign.encounters].sort((a, b) => b.updated_at.localeCompare(a.updated_at))

  return (
    <section>
      <form onSubmit={handleCreate} className="flex gap-2 mb-4">
        <input
          data-testid="encontro-nome"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={t('gm.encounterName')}
          aria-label={t('gm.encounterName')}
          className="flex-1 min-w-0 bg-[#1A1714] border border-[rgba(212,160,23,0.25)] rounded-[9px] px-3 py-2 text-[14px] text-[#F5F0E8] placeholder:text-[#A8A09B] focus:outline-none focus:border-[#D4A017]"
        />
        <button type="submit" data-testid="encontro-criar" className={gmSecondaryButton}>{t('gm.newEncounter')}</button>
      </form>

      {sorted.length === 0 ? (
        <div className="text-center py-14 px-6 border border-dashed border-[rgba(212,160,23,0.25)] rounded-2xl">
          <p className="text-[#A8A09B] font-semibold">{t('gm.noEncounters')}</p>
          <p className="text-[#A8A09B] text-sm mt-1">{t('gm.noEncountersHint')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {sorted.map(e => (
            <div key={e.id} className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-[11px] border border-white/[0.07] bg-[#1A1714] px-3 py-2.5">
              <button onClick={() => navigate(`${base}/${e.id}`)} className="flex-1 min-w-0 text-left cursor-pointer">
                <div className="font-bold text-[15px] text-[#F5F0E8] truncate">{e.name || t('gm.untitledEncounter')}</div>
                <div className="text-[12px] text-[#A8A09B]">
                  <span className={e.status === 'active' ? 'text-[#D4A017] font-semibold' : ''}>{encounterStatusLabel(e, t)}</span>
                  {' · '}{t('gm.combatantsCount', { n: e.combatants.length })}
                </div>
              </button>
              <div className="flex gap-1.5">
                <button onClick={() => navigate(`${base}/${e.id}`)} className={rowButton}>{t('gm.open')}</button>
                <button
                  onClick={() => confirm(t('gm.encounterDeleteConfirm', { name: e.name })) && deleteEncounter(e.id)}
                  className={rowDangerButton}
                >
                  {t('gm.remove')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
