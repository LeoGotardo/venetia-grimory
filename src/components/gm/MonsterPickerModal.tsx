import { useTranslation } from 'react-i18next'
import type { Monster } from '../../types'
import { Modal } from '../ui/Modal'
import { MonsterBrowser } from './MonsterBrowser'

interface MonsterPickerModalProps {
  open: boolean
  onClose: () => void
  onPick: (monster: Monster) => void
}

const MODAL_FIELD =
  'bg-[#2D2520] border border-[#B8860B]/30 rounded px-3 py-2 text-[#F5F0E8] text-sm placeholder:text-[#A8A09B] focus:outline-none focus:border-[#B8860B]'

/** Escolhe um monstro do bestiário ou do SRD para virar NPC. */
export function MonsterPickerModal({ open, onClose, onPick }: MonsterPickerModalProps) {
  const { t } = useTranslation()
  return (
    <Modal open={open} onClose={onClose} title={t('gm.pickMonster')} wide>
      {open && <MonsterBrowser onPick={onPick} inputClassName={MODAL_FIELD} />}
    </Modal>
  )
}
