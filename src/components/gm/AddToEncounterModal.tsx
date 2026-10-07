import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Campaign, Npc } from '../../types'
import { useGmStore } from '../../store/gmStore'
import { encounterStatusLabel } from '../../lib/gm/encounterStatus'
import { Modal } from '../ui/Modal'
import { gmSecondaryButton } from './GmHeader'
import { QuantityAdd } from './QuantityAdd'

interface AddToEncounterModalProps {
  npc: Npc | null
  campaign: Campaign
  onClose: () => void
}

/** Pôr um NPC num encontro da campanha, ou abrir um encontro novo já com ele. */
export function AddToEncounterModal({ npc, campaign, onClose }: AddToEncounterModalProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { addNpcToEncounter, createEncounter } = useGmStore()
  const [name, setName] = useState('')
  const encounters = [...campaign.encounters].sort((a, b) => b.updated_at.localeCompare(a.updated_at))

  function createWith(e: FormEvent) {
    e.preventDefault()
    if (!npc) return
    const id = createEncounter(name.trim() || t('gm.untitledEncounter'))
    addNpcToEncounter(id, npc.id, 1)
    navigate(`/mestre/campanha/${campaign.id}/encontro/${id}`)
  }

  return (
    <Modal open={npc != null} onClose={onClose} title={npc ? t('gm.addToEncounterTitle', { name: npc.statblock.name }) : undefined}>
      {npc && (
        <div className="flex flex-col gap-3">
          {encounters.length === 0 && <p className="text-sm text-[#A8A09B]">{t('gm.noEncountersYet')}</p>}
          {encounters.map(e => (
            <div key={e.id} className="flex items-center gap-2 rounded-[11px] border border-white/[0.07] bg-[#1A1714] px-3 py-2">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[14px] text-[#F5F0E8] truncate">{e.name || t('gm.untitledEncounter')}</div>
                <div className="text-[12px] text-[#A8A09B]">{encounterStatusLabel(e, t)} · {t('gm.combatantsCount', { n: e.combatants.length })}</div>
              </div>
              <QuantityAdd label={e.name} onAdd={count => addNpcToEncounter(e.id, npc.id, count)} />
            </div>
          ))}
          <form onSubmit={createWith} className="flex gap-2 pt-2 border-t border-white/[0.06]">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={t('gm.encounterName')}
              aria-label={t('gm.encounterName')}
              className="flex-1 min-w-0 bg-[#131110] border border-white/[0.1] rounded-[8px] px-2.5 py-2 text-[14px] text-[#F5F0E8] placeholder:text-[#A8A09B] focus:outline-none focus:border-[#D4A017]"
            />
            <button type="submit" className={gmSecondaryButton}>{t('gm.newEncounterWith')}</button>
          </form>
        </div>
      )}
    </Modal>
  )
}
