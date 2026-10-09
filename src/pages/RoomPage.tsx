import { lazy, Suspense, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useRoomStore } from '../store/roomStore'
import { useSheetStore } from '../store/sheetStore'
import { useRoomConnection } from '../hooks/useRoomConnection'
import { GmHeader, gmContainer, gmPrimaryButton, gmSecondaryButton } from '../components/gm/GmHeader'
import { rowDangerButton } from '../components/gm/MonsterRow'
import { AppFooter } from '../components/ui/AppFooter'
import { RoomMemberList } from '../components/room/RoomMemberList'
import { RoomStatusBadge } from '../components/room/RoomStatusBadge'
import { JoinRoomModal } from '../components/room/JoinRoomModal'
import { roomErrorMessage } from '../components/room/roomErrors'
import { EmptyState, MapIcon, SectionTitle } from '../components/gm/ornaments'
import { TableView } from '../components/room/TableView'
import { RoomLog } from '../components/room/RoomLog'
import { useMediaQuery } from '../hooks/useMediaQuery'

// O markdown das notas só carrega quando a aba Notas abre.
const SharedNotes = lazy(() => import('../components/room/SharedNotes').then(m => ({ default: m.SharedNotes })))
import { docKey } from '../lib/room/docs'
import { ROOM_TABLE_DOC_ID } from '../constants'

type RoomTab = 'table' | 'log' | 'notes' | 'room'

/**
 * Sala vista pelo player: estado da conexão, quem está na mesa, a própria ficha
 * a mesa que o mestre transmite e as rolagens e o chat.
 */
export function RoomPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { code = '' } = useParams<{ code: string }>()
  const { memberships, status, members, online, room, activeRoomId, docs, leaveRoom, forgetRoom } = useRoomStore()
  const { savedSheets, loadSavedList } = useSheetStore()
  const membership = memberships.find(m => m.code === code && m.role === 'player') ?? null
  const [joinOpen, setJoinOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Celular: uma aba por vez. Desktop: a mesa fica à esquerda e as abas trocam só o painel da direita.
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [tab, setTab] = useState<RoomTab>('table')

  useRoomConnection(membership?.room_id ?? null)
  useEffect(() => { loadSavedList() }, [loadSavedList])

  if (!membership) {
    return (
      <div className="min-h-screen flex flex-col gm-page font-[Manrope,system-ui]">
        <GmHeader title={t('room.title')} backTo="/" />
        <div className={`${gmContainer} py-10 flex-1`}>
          <EmptyState icon={<MapIcon size={34} />} title={t('room.notMember')}>
            <button onClick={() => setJoinOpen(true)} className={gmPrimaryButton}>{t('room.join')}</button>
          </EmptyState>
        </div>
        <JoinRoomModal open={joinOpen} onClose={() => setJoinOpen(false)} initialCode={code} />
        <AppFooter containerClassName={gmContainer} />
      </div>
    )
  }

  const connected = activeRoomId === membership.room_id
  const ended = connected && (status === 'closed' || status === 'kicked' || status === 'unauthorized' || status === 'invalid')
  const sheet = savedSheets.find(s => s.id === membership.sheet_id) ?? null
  const roomName = (connected ? room?.name : null) || membership.name || t('room.untitled')

  async function handleLeave() {
    if (!membership || !confirm(t('room.leaveConfirm', { name: roomName }))) return
    setError(null)
    try {
      await leaveRoom(membership.room_id)
      navigate('/')
    } catch (err) {
      setError(roomErrorMessage(t, err))
    }
  }

  const panel: RoomTab = isDesktop && tab === 'table' ? 'log' : tab
  const noteDocs = connected ? Object.values(docs).filter(doc => doc.kind === 'note') : []
  const tabs: Array<{ id: RoomTab; label: string }> = [
    ...(isDesktop ? [] : [{ id: 'table' as const, label: t('room.table') }]),
    { id: 'log', label: t('room.log.title') },
    { id: 'notes', label: noteDocs.length > 0 ? `${t('gm.tabNotes')} ${noteDocs.length}` : t('gm.tabNotes') },
    { id: 'room', label: t('room.title') },
  ]
  const table = <TableView doc={connected ? docs[docKey({ kind: 'table', id: ROOM_TABLE_DOC_ID })] : undefined} />

  return (
    <div className="min-h-screen flex flex-col gm-page font-[Manrope,system-ui]">
      <GmHeader title={roomName} backTo="/" actions={<RoomStatusBadge status={connected ? status : 'idle'} />} />

      <div className={`${gmContainer} py-6 pb-20 flex-1`}>
        {ended && (
          <div role="alert" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-[rgba(181,57,47,0.35)] bg-[rgba(181,57,47,0.1)] px-4 py-3">
            <p className="text-[15px] text-[#E8DFD0]">{t(`room.ended.${status}`)}</p>
            <button
              onClick={() => {
                forgetRoom(membership.room_id)
                navigate('/')
              }}
              className={gmSecondaryButton}
            >
              {t('room.forget')}
            </button>
          </div>
        )}

        {!ended && (
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_400px] gap-6 items-start">
            {isDesktop && <section>{table}</section>}
            <div className="flex flex-col gap-4 lg:sticky lg:top-[88px]">
              <div role="tablist" className="flex gap-1 border-b border-white/[0.06] overflow-x-auto no-scrollbar">
                {tabs.map(tb => (
                  <button
                    key={tb.id}
                    role="tab"
                    aria-selected={panel === tb.id}
                    onClick={() => setTab(tb.id)}
                    className={`flex-shrink-0 whitespace-nowrap px-4 min-h-[46px] text-[15px] font-semibold border-b-2 -mb-px cursor-pointer transition-colors ${
                      panel === tb.id ? 'border-[#D4A017] text-[#F5F0E8]' : 'border-transparent text-[#A8A09B] hover:text-[#E8DFD0]'
                    }`}
                  >
                    {tb.label}
                  </button>
                ))}
              </div>
              {panel === 'table' && table}
              {panel === 'log' && (
                <div className="h-[calc(100dvh-260px)] min-h-[360px]">
                  <RoomLog />
                </div>
              )}
                {panel === 'notes' && (
                  <Suspense fallback={<p className="text-center text-[#A8A09B] py-8 animate-pulse">{t('loading.loading')}</p>}>
                    <SharedNotes docs={noteDocs} />
                  </Suspense>
                )}
                {panel === 'room' && (
                  <div className="flex flex-col gap-6">
                    <section>
                      <SectionTitle align="start">{t('room.mySheet')}</SectionTitle>
                      {sheet ? (
                        <div className="vg-card p-4 flex items-center justify-between gap-3">
                          <span className="min-w-0">
                            <span className="block font-bold text-[16px] text-[#F5F0E8] truncate">{sheet.name || t('gm.noName')}</span>
                            <span className="block text-[13px] text-[#A8A09B]">{t('gm.level', { n: sheet.level })}</span>
                          </span>
                          <button onClick={() => navigate(`/ficha/${sheet.id}`)} className={gmSecondaryButton}>{t('room.openMySheet')}</button>
                        </div>
                      ) : (
                        <p className="text-[14px] text-[#A8A09B]">{t('room.sheetMissing')}</p>
                      )}
                    </section>
                    <section>
                      <SectionTitle align="start" count={connected ? members.length : undefined}>{t('room.members')}</SectionTitle>
                      <RoomMemberList members={connected ? members : []} online={connected ? online : []} selfId={membership.member_id} />
                    </section>
                    {error && <p role="alert" className="text-[13px] text-[#d4564a]">{error}</p>}
                    <button onClick={() => void handleLeave()} className={`${rowDangerButton} self-start`}>{t('room.leave')}</button>
                  </div>
                )}
              </div>
            </div>
        )}
      </div>

      <AppFooter containerClassName={gmContainer} />
    </div>
  )
}
