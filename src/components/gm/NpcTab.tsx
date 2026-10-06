import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Campaign, Npc } from '../../types'
import { useGmStore } from '../../store/gmStore'
import { gmSecondaryButton } from './GmHeader'
import { MonsterRow, rowButton, rowDangerButton } from './MonsterRow'
import { MonsterPickerModal } from './MonsterPickerModal'
import { StatBlockModal } from './StatBlockModal'

/** Aba NPCs da campanha: cada NPC é uma cópia própria do bloco. */
export function NpcTab({ campaign }: { campaign: Campaign }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { bestiary, addNpc, duplicateNpc, removeNpc } = useGmStore()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [viewing, setViewing] = useState<Npc | null>(null)
  const base = `/mestre/campanha/${campaign.id}/npc`

  return (
    <section>
      <div className="flex flex-wrap gap-2 mb-4">
        <button data-testid="npc-novo" onClick={() => navigate(`${base}/novo`)} className={gmSecondaryButton}>
          {t('gm.newNpc')}
        </button>
        <button onClick={() => setPickerOpen(true)} className={gmSecondaryButton}>
          {t('gm.fromBestiary')}
        </button>
      </div>

      {campaign.npcs.length === 0 ? (
        <div className="text-center py-14 px-6 border border-dashed border-[rgba(212,160,23,0.25)] rounded-2xl">
          <p className="text-[#A8A09B] font-semibold">{t('gm.noNpcs')}</p>
          <p className="text-[#A8A09B] text-sm mt-1">{t('gm.noNpcsHint')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {campaign.npcs.map(npc => (
            <MonsterRow
              key={npc.id}
              block={npc.statblock}
              onClick={() => setViewing(npc)}
              actions={
                <>
                  <button onClick={() => navigate(`${base}/${npc.id}`)} className={rowButton}>{t('gm.edit')}</button>
                  <button onClick={() => duplicateNpc(npc.id)} className={rowButton}>{t('gm.duplicate')}</button>
                  <button
                    onClick={() => confirm(t('gm.npcDeleteConfirm', { name: npc.statblock.name })) && removeNpc(npc.id)}
                    className={rowDangerButton}
                  >
                    {t('gm.remove')}
                  </button>
                </>
              }
            />
          ))}
        </div>
      )}

      <MonsterPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        monsters={bestiary}
        onPick={monster => {
          addNpc(structuredClone(monster.statblock), monster.id)
          setPickerOpen(false)
        }}
      />
      <StatBlockModal block={viewing?.statblock ?? null} notes={viewing?.notes} onClose={() => setViewing(null)} />
    </section>
  )
}
