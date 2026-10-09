import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { Campaign } from '../../types'
import { campaignRoom, useRoomStore } from '../../store/roomStore'
import { useGmStore } from '../../store/gmStore'
import type { RoomMembership } from '../../services/roomStorage'
import { Modal } from '../ui/Modal'
import { gmPrimaryButton, gmSecondaryButton } from '../gm/GmHeader'
import { rowDangerButton } from '../gm/MonsterRow'
import { RoomMemberList } from './RoomMemberList'
import { RoomStatusBadge } from './RoomStatusBadge'
import { roomErrorMessage } from './roomErrors'

interface RoomPanelProps {
  open: boolean
  onClose: () => void
  campaign: Campaign
}

const field =
  'w-full bg-[#2D2520] border border-[#B8860B]/30 rounded-[9px] px-3 py-2.5 text-[15px] text-[#F5F0E8] placeholder:text-[#A8A09B] focus:outline-none focus:border-[#D4A017]'

/** Sala da campanha para o mestre: abrir, passar o código, ver quem entrou, remover e fechar. */
export function RoomPanel({ open, onClose, campaign }: RoomPanelProps) {
  const { t } = useTranslation()
  const memberships = useRoomStore(s => s.memberships)
  const membership = campaignRoom(memberships, campaign.id)

  return (
    <Modal open={open} onClose={onClose} title={t('room.title')}>
      {membership ? <OpenRoom membership={membership} /> : <CreateRoom campaign={campaign} />}
    </Modal>
  )
}

function CreateRoom({ campaign }: { campaign: Campaign }) {
  const { t } = useTranslation()
  const createRoom = useRoomStore(s => s.createRoom)
  const [name, setName] = useState(campaign.name)
  const [displayName, setDisplayName] = useState(t('room.gmDefaultName'))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await createRoom({ id: campaign.id, name: name.trim() }, displayName.trim())
    } catch (err) {
      setError(roomErrorMessage(t, err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#E8DFD0]">
        {t('room.roomName')}
        <input value={name} onChange={e => setName(e.target.value)} maxLength={120} placeholder={t('room.untitled')} className={field} />
      </label>
      <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#E8DFD0]">
        {t('room.yourName')}
        <input value={displayName} onChange={e => setDisplayName(e.target.value)} maxLength={60} required className={field} />
      </label>
      <p className="text-[13px] text-[#A8A09B]">{t('room.createHint')}</p>
      {error && <p role="alert" className="text-[13px] text-[#d4564a]">{error}</p>}
      <button type="submit" disabled={busy || !displayName.trim()} className={`${gmPrimaryButton} self-start`}>
        {t('room.openRoom')}
      </button>
    </form>
  )
}

function OpenRoom({ membership }: { membership: RoomMembership }) {
  const { t } = useTranslation()
  const { status, members, online, activeRoomId, closeRoom, kick, forgetRoom } = useRoomStore()
  const detachRoomPlayers = useGmStore(s => s.detachRoomPlayers)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const connected = activeRoomId === membership.room_id
  const ended = status === 'closed' || status === 'unauthorized' || status === 'kicked' || status === 'invalid'
  const canShare = typeof navigator.share === 'function'

  async function run(action: () => Promise<void>) {
    setError(null)
    try {
      await action()
    } catch (err) {
      setError(roomErrorMessage(t, err))
    }
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(membership.code)
      setCopied(true)
    } catch (err) {
      console.error('[salas] Falha ao copiar o código.', err)
    }
  }

  function shareCode() {
    navigator.share({ title: membership.name || t('room.untitled'), text: t('room.shareText', { code: membership.code }) })
      .catch(err => {
        if ((err as DOMException).name !== 'AbortError') console.error('[salas] Falha ao compartilhar.', err)
      })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <span className="font-semibold text-[#F5F0E8] truncate">{membership.name || t('room.untitled')}</span>
        <RoomStatusBadge status={connected ? status : 'idle'} />
      </div>

      <div className="rounded-[12px] bg-[#131110] border border-[rgba(212,160,23,0.3)] px-4 py-4 text-center">
        <p className="text-[12px] uppercase tracking-wider text-[#A8A09B]">{t('room.code')}</p>
        <p data-testid="sala-codigo" className="mt-1 text-[38px] font-extrabold tracking-[0.25em] text-[#E8C25A] tabular-nums select-all">
          {membership.code}
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <button onClick={() => void copyCode()} className={gmSecondaryButton}>{copied ? t('room.copied') : t('room.copy')}</button>
          {canShare && <button onClick={shareCode} className={gmSecondaryButton}>{t('room.share')}</button>}
        </div>
      </div>

      {ended && connected ? (
        <div role="alert" className="flex flex-col gap-2 rounded-[10px] border border-[rgba(181,57,47,0.35)] bg-[rgba(181,57,47,0.1)] px-3 py-3">
          <p className="text-[14px] text-[#E8DFD0]">{t(`room.ended.${status}`)}</p>
          <button
            onClick={() => {
              forgetRoom(membership.room_id)
              detachRoomPlayers()
            }}
            className={`${gmSecondaryButton} self-start`}
          >
            {t('room.forget')}
          </button>
        </div>
      ) : (
        <section className="flex flex-col gap-2">
          <h3 className="text-[13px] font-semibold uppercase tracking-wider text-[#A8A09B]">{t('room.members')}</h3>
          <RoomMemberList
            members={connected ? members : []}
            online={connected ? online : []}
            selfId={membership.member_id}
            onKick={member => {
              if (confirm(t('room.kickConfirm', { name: member.display_name }))) void run(() => kick(member.id))
            }}
          />
        </section>
      )}

      {error && <p role="alert" className="text-[13px] text-[#d4564a]">{error}</p>}

      {!ended && (
        <button
          onClick={() => {
            if (!confirm(t('room.closeConfirm'))) return
            void run(async () => {
              await closeRoom(membership.room_id)
              detachRoomPlayers()
            })
          }}
          className={`${rowDangerButton} self-start`}
        >
          {t('room.close')}
        </button>
      )}
    </div>
  )
}
