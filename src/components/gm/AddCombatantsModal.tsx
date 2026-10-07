import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Campaign, Encounter, StatBlock } from '../../types'
import { useGmStore } from '../../store/gmStore'
import { Modal } from '../ui/Modal'
import { MonsterRow, rowButton } from './MonsterRow'
import { MonsterBrowser } from './MonsterBrowser'
import { QuantityAdd } from './QuantityAdd'

export type CombatantSource = 'players' | 'npcs' | 'bestiary'
type Source = CombatantSource

interface AddCombatantsModalProps {
  open: boolean
  onClose: () => void
  campaign: Campaign
  encounter: Encounter
  /** Aba inicial; o pai remonta o modal (via `key`) para trocar. */
  initialSource?: Source
}

/** Players, NPCs da campanha e monstros do bestiário — com quantidade. */
export function AddCombatantsModal({ open, onClose, campaign, encounter, initialSource = 'players' }: AddCombatantsModalProps) {
  const { t } = useTranslation()
  const { addPlayersToEncounter, addNpcToEncounter, addMonsterToEncounter, bestiary } = useGmStore()
  const [source, setSource] = useState<Source>(initialSource)

  const present = new Set(encounter.combatants.map(c => c.ref_id))
  const missingPlayers = campaign.party.filter(m => !present.has(m.id))
  const tabs: Array<{ id: Source; label: string }> = [
    { id: 'players', label: t('gm.sourcePlayers') },
    { id: 'npcs', label: t('gm.sourceNpcs') },
    { id: 'bestiary', label: t('gm.sourceBestiary') },
  ]

  return (
    <Modal open={open} onClose={onClose} title={t('gm.addCombatantsTitle')} wide>
      <div role="tablist" className="flex gap-1 mb-3 border-b border-white/[0.08]">
        {tabs.map(tb => (
          <button
            key={tb.id}
            role="tab"
            aria-selected={source === tb.id}
            onClick={() => setSource(tb.id)}
            className={`px-3 py-2 text-[13px] font-semibold border-b-2 -mb-px cursor-pointer ${
              source === tb.id ? 'border-[#D4A017] text-[#F5F0E8]' : 'border-transparent text-[#A8A09B]'
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {source === 'players' && (
        <div className="flex flex-col gap-2">
          {campaign.party.length === 0 && <p className="text-sm text-[#A8A09B] py-4 text-center">{t('gm.noPlayers')}</p>}
          {missingPlayers.length > 1 && (
            <button
              onClick={() => addPlayersToEncounter(encounter.id, missingPlayers.map(m => m.id))}
              className={`${rowButton} self-start`}
            >
              + {t('gm.addAllPlayers')}
            </button>
          )}
          {campaign.party.map(m => {
            const inside = present.has(m.id)
            return (
              <div key={m.id} className="flex items-center gap-2 rounded-[11px] border border-white/[0.07] bg-[#1A1714] px-3 py-2.5">
                <span className="flex-1 font-semibold text-[#F5F0E8] truncate">{m.snapshot.identity.character_name || t('gm.noName')}</span>
                {inside ? (
                  <span className="text-[12px] text-[#A8A09B]">{t('gm.inEncounter')}</span>
                ) : (
                  <button onClick={() => addPlayersToEncounter(encounter.id, [m.id])} className={rowButton}>+ {t('gm.add')}</button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {source === 'npcs' && (
        <div className="flex flex-col gap-2">
          {campaign.npcs.length === 0 && <p className="text-sm text-[#A8A09B] py-4 text-center">{t('gm.noNpcs')}</p>}
          {campaign.npcs.map(n => (
            <AddRow key={n.id} block={n.statblock} onAdd={count => addNpcToEncounter(encounter.id, n.id, count)} />
          ))}
        </div>
      )}

      {source === 'bestiary' && (
        <MonsterBrowser
          initialSource={bestiary.length > 0 ? 'custom' : 'srd'}
          inputClassName={MODAL_FIELD}
          actions={m => <QuantityAdd label={m.statblock.name} onAdd={count => addMonsterToEncounter(encounter.id, m.id, count)} />}
        />
      )}
    </Modal>
  )
}

function AddRow({ block, onAdd }: { block: StatBlock; onAdd: (count: number) => void }) {
  return <MonsterRow block={block} actions={<QuantityAdd label={block.name} onAdd={onAdd} />} />
}

const MODAL_FIELD =
  'bg-[#2D2520] border border-[#B8860B]/30 rounded px-3 py-2 text-[#F5F0E8] text-sm placeholder:text-[#A8A09B] focus:outline-none focus:border-[#B8860B]'
