import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Campaign } from '../../types'
import { useGmStore } from '../../store/gmStore'
import { campaignRoom, useRoomStore } from '../../store/roomStore'
import { useRoomConnection } from '../../hooks/useRoomConnection'
import { GmHeader, gmContainer, gmSecondaryButton } from '../../components/gm/GmHeader'
import { AppFooter } from '../../components/ui/AppFooter'
import { SectionTitle } from '../../components/gm/ornaments'
import { RoomStatusBadge } from '../../components/room/RoomStatusBadge'
import { CreateRoom, OpenRoom } from '../../components/room/RoomControls'
import { RoomLog } from '../../components/room/RoomLog'
import { RollRequestForm } from '../../components/room/RollRequestForm'
import { RoomSessions } from '../../components/room/RoomSessions'
import { encounterStatusLabel } from '../../lib/gm/encounterStatus'
import { NotFound } from '../NotFound'

/**
 * `/mestre/campanha/:id/sala` — a sessão inteira pela sala, não só o combate:
 * o chat e as rolagens, pedir testes aos players, qual encontro está na mesa,
 * as sessões marcadas e quem está conectado.
 */
export function GmRoomPage() {
  const { id } = useParams<{ id: string }>()
  const { campaign, openedId, openCampaign } = useGmStore()

  useEffect(() => {
    if (id) openCampaign(id)
  }, [id, openCampaign])

  if (openedId === id && !campaign) return <NotFound />
  if (!campaign || campaign.id !== id) return null
  return <GmRoomView campaign={campaign} />
}

function GmRoomView({ campaign }: { campaign: Campaign }) {
  const { t } = useTranslation()
  const membership = useRoomStore(s => campaignRoom(s.memberships, campaign.id))
  const { status, activeRoomId, room, setBroadcast } = useRoomStore()
  useRoomConnection(membership?.room_id ?? null)
  const connected = membership != null && activeRoomId === membership.room_id
  const onTable = membership?.broadcast_encounter_id ? campaign.encounters.find(e => e.id === membership.broadcast_encounter_id) ?? null : null
  const roomName = (connected ? room?.name : null) || membership?.name || t('room.untitled')

  return (
    <div className="min-h-screen flex flex-col gm-page font-[Manrope,system-ui]">
      <GmHeader
        backTo={`/mestre/campanha/${campaign.id}`}
        title={membership ? roomName : t('room.title')}
        actions={membership ? <RoomStatusBadge status={connected ? status : 'idle'} /> : undefined}
      />

      <div className={`${gmContainer} py-6 pb-20 flex-1`}>
        {!membership ? (
          <div className="max-w-[560px] vg-card p-5">
            <CreateRoom campaign={campaign} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_400px] gap-6 items-start">
            <div className="flex flex-col gap-5 min-w-0">
              <p className="text-[14px] text-[#E8DFD0]">{t('room.gmRunning', { room: roomName, name: membership.display_name })}</p>

              <section className="vg-card p-4 flex flex-col gap-3">
                <SectionTitle align="start">{t('room.table')}</SectionTitle>
                <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#E8DFD0]">
                  {t('room.onTable')}
                  <select
                    value={membership.broadcast_encounter_id ?? ''}
                    onChange={e => setBroadcast(membership.room_id, e.target.value || null)}
                    className="min-h-[42px] bg-[#131110] border border-white/[0.1] rounded-[10px] px-3 text-[14px] text-[#F5F0E8]"
                  >
                    <option value="">{t('room.onTableNone')}</option>
                    {campaign.encounters.map(e => <option key={e.id} value={e.id}>{e.name || t('gm.untitledEncounter')}</option>)}
                  </select>
                </label>
                {onTable ? (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-[15px] font-bold text-[#D4A017]">{encounterStatusLabel(onTable, t)}</span>
                    <Link to={`/mestre/campanha/${campaign.id}/encontro/${onTable.id}`} className={gmSecondaryButton}>{t('room.openEncounter')}</Link>
                  </div>
                ) : (
                  <p className="text-[13px] text-[#A8A09B]">{t('room.onTableHint')}</p>
                )}
              </section>

              <RollRequestForm />

              <section className="vg-card p-4">
                <SectionTitle align="start">{t('room.log.title')}</SectionTitle>
                <div className="h-[min(60dvh,560px)] min-h-[360px]">
                  <RoomLog />
                </div>
              </section>
            </div>

            <aside className="flex flex-col gap-5 lg:sticky lg:top-[88px]">
              <div className="vg-card p-4"><OpenRoom membership={membership} /></div>
              <div className="vg-card p-4"><RoomSessions roomId={membership.room_id} editable /></div>
            </aside>
          </div>
        )}
      </div>

      <AppFooter containerClassName={gmContainer} />
    </div>
  )
}
