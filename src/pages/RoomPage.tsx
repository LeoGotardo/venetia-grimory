import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
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
import { RollRequestPrompt } from '../components/room/RollRequestPrompt'
import { RoomSessions } from '../components/room/RoomSessions'
import { isRoomCode, normalizeRoomCode } from '../lib/room/code'
import { docKey } from '../lib/room/docs'
import { tableStateSchema } from '../lib/room/protocol'
import { ROOM_TABLE_DOC_ID } from '../constants'

// O markdown das notas e os painéis da ficha só carregam quando a aba abre.
const SharedNotes = lazy(() => import('../components/room/SharedNotes').then(m => ({ default: m.SharedNotes })))
const RoomSheetTab = lazy(() => import('../components/room/RoomSheetTab'))

type RoomTab = 'table' | 'sheet' | 'log' | 'notes' | 'room'
/** A aba vai na URL (`?aba=mesa`) para o app poder abrir a sala direto na mesa quando o combate começa. */
const TAB_PARAM: Record<RoomTab, string> = { table: 'mesa', sheet: 'ficha', log: 'chat', notes: 'notas', room: 'sala' }
const tabFromParam = (value: string | null): RoomTab =>
  (Object.keys(TAB_PARAM) as RoomTab[]).find(k => TAB_PARAM[k] === value) ?? 'table'

/**
 * Sala vista pelo player: em que sala está e com que nome, a mesa que o mestre
 * transmite (onde ele age na vez dele), a própria ficha, as rolagens e o chat,
 * as notas compartilhadas e as sessões marcadas.
 */
export function RoomPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const code = normalizeRoomCode(useParams<{ code: string }>().code ?? '')
  const [params, setParams] = useSearchParams()
  const { memberships, status, members, online, room, activeRoomId, docs, leaveRoom, forgetRoom } = useRoomStore()
  const { savedSheets, loadSavedList } = useSheetStore()
  const membership = memberships.find(m => m.code === code && m.role === 'player') ?? null
  // Chegou pelo link de convite sem estar na sala: o formulário já abre com o código.
  const [joinOpen, setJoinOpen] = useState(() => membership == null && isRoomCode(code))
  const [error, setError] = useState<string | null>(null)
  const tab = tabFromParam(params.get('aba'))
  const setTab = (next: RoomTab) => setParams({ aba: TAB_PARAM[next] }, { replace: true })

  useRoomConnection(membership?.room_id ?? null)
  useEffect(() => { loadSavedList() }, [loadSavedList])

  const connected = membership != null && activeRoomId === membership.room_id
  const tableDoc = connected ? docs[docKey({ kind: 'table', id: ROOM_TABLE_DOC_ID })] : undefined
  const myCombatant = useMemo(() => {
    const parsed = tableDoc ? tableStateSchema.safeParse(tableDoc.data) : null
    return parsed?.success ? parsed.data.combatants.find(c => c.member_id === membership?.member_id) ?? null : null
  }, [tableDoc, membership?.member_id])

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

  const panel = tab
  const noteDocs = connected ? Object.values(docs).filter(doc => doc.kind === 'note') : []
  const tabs: Array<{ id: RoomTab; label: string }> = [
    { id: 'table', label: t('room.table') },
    { id: 'sheet', label: t('room.mySheet') },
    { id: 'log', label: t('room.log.tab') },
    { id: 'notes', label: noteDocs.length > 0 ? `${t('gm.tabNotes')} ${noteDocs.length}` : t('gm.tabNotes') },
    { id: 'room', label: t('room.title') },
  ]
  const table = <TableView doc={tableDoc} memberId={membership.member_id} sheetId={membership.sheet_id} />

  const loading = <p className="text-center text-[#A8A09B] py-8 animate-pulse">{t('loading.loading')}</p>
  const youAreIn = (
    <>
      {t('room.youAreIn', { room: roomName, name: membership.display_name })}
      <span className="ml-2 rounded-[6px] border border-white/[0.12] px-1.5 py-0.5 text-[12px] font-bold tracking-[0.15em] text-[#E8C25A]">{membership.code}</span>
    </>
  )

  // Tela de app, sem rolar a página: cabeçalho e abas fixos, cada aba ocupa o resto da altura e
  // rola por dentro só o que é longo de verdade. O piso de altura devolve a rolagem da página a
  // um celular deitado, em vez de esmagar o mapa. Sem rodapé aqui: os links legais ficam em
  // Configurações → Sobre.
  return (
    <div className="h-dvh min-h-[480px] flex flex-col gm-page font-[Manrope,system-ui]">
      <GmHeader title={roomName} backTo="/" actions={<RoomStatusBadge status={connected ? status : 'idle'} />} />

      <div className={`${gmContainer} flex-1 min-h-0 flex flex-col gap-3 py-3`}>

        {ended && (
          <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-[rgba(181,57,47,0.35)] bg-[rgba(181,57,47,0.1)] px-4 py-3">
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

        {!ended && <RollRequestPrompt inline />}

        {!ended && (
          <>
            <div className="flex flex-shrink-0 items-end gap-4 border-b border-white/[0.06]">
            <div role="tablist" className="flex min-w-0 gap-1 overflow-x-auto no-scrollbar">
              {tabs.map(tb => (
                <button
                  key={tb.id}
                  role="tab"
                  aria-selected={panel === tb.id}
                  onClick={() => setTab(tb.id)}
                  className={`flex-shrink-0 whitespace-nowrap px-4 min-h-[44px] text-[15px] font-semibold border-b-2 -mb-px cursor-pointer transition-colors ${
                    panel === tb.id ? 'border-[#D4A017] text-[#F5F0E8]' : 'border-transparent text-[#A8A09B] hover:text-[#E8DFD0]'
                  }`}
                >
                  {tb.label}
                </button>
              ))}
            </div>
            {/* Cada linha a menos é altura para a aba: no desktop vai no fim da linha das abas, no celular só na aba Sala. */}
            <p className="hidden lg:block ml-auto min-w-0 truncate pb-3 text-[13px] text-[#E8DFD0]">{youAreIn}</p>
            </div>
            <div role="tabpanel" className="flex-1 min-h-0">
              {panel === 'table' && table}
              {panel === 'sheet' && (
                <Suspense fallback={loading}>
                  <RoomSheetTab sheetId={membership.sheet_id} inCombat={myCombatant} />
                </Suspense>
              )}
              {panel === 'log' && (
                <div className="h-full w-full max-w-3xl mx-auto">
                  <RoomLog />
                </div>
              )}
              {panel === 'notes' && (
                <div className="h-full w-full max-w-3xl mx-auto overflow-y-auto">
                  <Suspense fallback={loading}>
                    <SharedNotes docs={noteDocs} />
                  </Suspense>
                </div>
              )}
              {panel === 'room' && (
                <div className="h-full overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-6 content-start">
                  <p data-testid="sala-voce-esta" className="text-[14px] text-[#E8DFD0] lg:col-span-2">{youAreIn}</p>
                  <RoomSessions roomId={membership.room_id} />
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
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
