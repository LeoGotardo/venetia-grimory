import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useGmStore } from '../../store/gmStore'
import { StatBlockEditLayout } from '../../components/gm/StatBlockEditLayout'
import { EditorSection, TextField } from '../../components/gm/fields'
import { NpcProfileFields, type ProfileField } from '../../components/gm/NpcProfileFields'
import { gmSecondaryButton } from '../../components/gm/GmHeader'
import { DiceIcon } from '../../components/gm/ornaments'
import { createBlankStatBlock } from '../../lib/gm/statblock'
import { generateNpc, rerollField } from '../../lib/gm/npcGenerator'
import { NPC_SPECIES, type NpcArchetypeId } from '../../data/npcTables'
import type { Npc, NpcProfile } from '../../types'
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

const pick = <T,>(list: readonly T[]): T => list[Math.floor(Math.random() * list.length)]

function NpcEditor({ campaignId, npc }: { campaignId: string; npc: Npc | null }) {
  const { t, i18n } = useTranslation()
  const { addNpc, updateNpc } = useGmStore()
  const [notes, setNotes] = useState(npc?.notes ?? '')
  const [profile, setProfile] = useState<NpcProfile | null>(npc?.profile ?? null)
  const language = i18n.language === 'en' ? 'en' : 'pt'
  // NPCs sem arquétipo (feitos do zero) sorteiam a ocupação entre a gente comum.
  const archetype = (profile?.archetype || 'commoner') as NpcArchetypeId

  return (
    <StatBlockEditLayout
      title={npc ? t('gm.editNpc') : t('gm.newNpc')}
      backTo={`/mestre/campanha/${campaignId}?aba=npcs`}
      initial={npc ? structuredClone(npc.statblock) : createBlankStatBlock()}
      extra={markDirty => (
        <>
          <EditorSection title={t('gm.npcGen.profile')}>
            {profile ? (
              <NpcProfileFields
                profile={profile}
                onChange={(field, value) => {
                  setProfile(p => p && { ...p, [field]: value })
                  markDirty()
                }}
                onReroll={(field: ProfileField) => {
                  setProfile(p => {
                    if (!p || field === 'name') return p
                    if (field === 'species') return { ...p, species: pick(NPC_SPECIES) }
                    if (field === 'gender') return { ...p, gender: pick(['f', 'm', 'x'] as const) }
                    return { ...p, [field]: rerollField(field, archetype, language, p.gender) }
                  })
                  markDirty()
                }}
              />
            ) : (
              <div className="flex flex-col items-start gap-2">
                <p className="text-[13px] text-[#A8A09B]">{t('gm.npcProfileEmpty')}</p>
                <button
                  type="button"
                  onClick={() => {
                    // Só o perfil: o bloco que o mestre está editando não é tocado.
                    setProfile({ ...generateNpc({}, archetype, createBlankStatBlock(), language).profile, archetype: npc?.profile?.archetype ?? '' })
                    markDirty()
                  }}
                  className={gmSecondaryButton}
                >
                  <DiceIcon size={16} /> {t('gm.npcProfileGenerate')}
                </button>
              </div>
            )}
          </EditorSection>
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
        </>
      )}
      onSave={statblock => {
        if (npc) updateNpc(npc.id, { statblock, notes, profile })
        else addNpc(statblock, null, { notes, profile })
      }}
    />
  )
}
