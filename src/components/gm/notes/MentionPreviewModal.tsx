import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Campaign } from '../../../types'
import type { MentionTarget } from '../../../lib/gm/notes'
import { useGmStore } from '../../../store/gmStore'
import { Modal } from '../../ui/Modal'
import { StatBlockModal } from '../StatBlockModal'
import { PlayerCard } from '../PlayerCard'
import { rowButton } from '../MonsterRow'
import { mentionName } from './mentionLabels'

interface MentionPreviewModalProps {
  target: MentionTarget | null
  campaign: Campaign
  onClose: () => void
}

/**
 * Ficha de quem foi citado, sem sair da nota: o resumo do player (com "Abrir
 * ficha" se ela está neste aparelho) ou o bloco do NPC/monstro, com o atalho
 * para editar.
 */
export function MentionPreviewModal({ target, campaign, onClose }: MentionPreviewModalProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const bestiary = useGmStore(s => s.bestiary)
  const srd = useGmStore(s => s.srd)

  const member = target?.kind === 'player' ? campaign.party.find(m => m.id === target.id) ?? null : null
  const npc = target?.kind === 'npc' ? campaign.npcs.find(n => n.id === target.id) ?? null : null
  const monster = target?.kind === 'monster'
    ? (target.source === 'srd' ? srd?.monsters : bestiary)?.find(m => m.id === target.id) ?? null
    : null

  const editPath = npc
    ? `/mestre/campanha/${campaign.id}/npc/${npc.id}`
    : monster?.source === 'custom' ? `/mestre/bestiario/${monster.id}` : null

  return (
    <>
      <Modal open={member != null} onClose={onClose} title={target ? mentionName(t, target) : undefined}>
        {member && <PlayerCard member={member} />}
      </Modal>
      <StatBlockModal
        block={npc?.statblock ?? monster?.statblock ?? null}
        notes={npc?.notes}
        profile={npc?.profile ?? null}
        actions={editPath && (
          <button onClick={() => navigate(editPath)} className={rowButton}>
            {npc ? t('gm.editNpc') : t('gm.editMonster')}
          </button>
        )}
        onClose={onClose}
      />
    </>
  )
}
