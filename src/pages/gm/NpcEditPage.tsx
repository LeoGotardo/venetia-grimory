import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useGmStore } from '../../store/gmStore'
import { StatBlockEditLayout } from '../../components/gm/StatBlockEditLayout'
import { EditorSection, TextField } from '../../components/gm/fields'
import { createBlankStatBlock } from '../../lib/gm/statblock'
import type { Npc } from '../../types'
import { NotFound } from '../NotFound'

/** `/mestre/campanha/:id/npc/:npcId` — `novo` cria um NPC na campanha. */
export function NpcEditPage() {
  const { id, npcId } = useParams<{ id: string; npcId: string }>()
  const { campaign, openedId, openCampaign } = useGmStore()

  useEffect(() => {
    if (id) openCampaign(id)
  }, [id, openCampaign])

  if (openedId === id && !campaign) return <NotFound />
  if (!campaign || campaign.id !== id) return null

  const isNew = npcId === 'novo'
  const npc = campaign.npcs.find(n => n.id === npcId)
  if (!isNew && !npc) return <NotFound />

  return <NpcEditor key={npcId} campaignId={campaign.id} npc={npc ?? null} />
}

function NpcEditor({ campaignId, npc }: { campaignId: string; npc: Npc | null }) {
  const { t } = useTranslation()
  const { addNpc, updateNpc } = useGmStore()
  const [notes, setNotes] = useState(npc?.notes ?? '')

  return (
    <StatBlockEditLayout
      title={npc ? t('gm.editNpc') : t('gm.newNpc')}
      backTo={`/mestre/campanha/${campaignId}?aba=npcs`}
      initial={npc ? structuredClone(npc.statblock) : createBlankStatBlock()}
      extra={markDirty => (
        <EditorSection title={t('gm.npcNotes')}>
          <TextField
            label={t('gm.npcNotes')}
            value={notes}
            placeholder={t('gm.npcNotesPlaceholder')}
            multiline
            onChange={value => {
              setNotes(value)
              markDirty()
            }}
          />
        </EditorSection>
      )}
      onSave={statblock => {
        if (npc) updateNpc(npc.id, { statblock, notes })
        else updateNpc(addNpc(statblock), { notes })
      }}
    />
  )
}
