import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSheetStore } from '../../store/sheetStore'
import { useRoomStore } from '../../store/roomStore'
import { gameData } from '../../data/rules'
import { isRoomCode, normalizeRoomCode } from '../../lib/room/code'
import { Modal } from '../ui/Modal'
import { gmPrimaryButton } from '../gm/GmHeader'
import { roomErrorMessage } from './roomErrors'

interface JoinRoomModalProps {
  open: boolean
  onClose: () => void
  /** Código já conhecido (ex.: link da sala). */
  initialCode?: string
}

const field =
  'w-full bg-[#2D2520] border border-[#B8860B]/30 rounded-[9px] px-3 py-2.5 text-[15px] text-[#F5F0E8] placeholder:text-[#A8A09B] focus:outline-none focus:border-[#D4A017]'

/** Player entra com o código, o nome na mesa e a ficha que vai levar. */
export function JoinRoomModal({ open, onClose, initialCode = '' }: JoinRoomModalProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { savedSheets, loadSavedList } = useSheetStore()
  const joinRoom = useRoomStore(s => s.joinRoom)
  const [code, setCode] = useState(initialCode)
  const [sheetId, setSheetId] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) loadSavedList()
  }, [open, loadSavedList])

  // Rascunhos ficam de fora: a ficha precisa dos números que o mestre consulta.
  const sheets = savedSheets.filter(s => s.complete !== false)
  const chosen = sheets.find(s => s.id === sheetId) ?? sheets[0] ?? null

  function pickSheet(id: string, name: string) {
    setSheetId(id)
    setDisplayName(name)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!chosen) return
    setBusy(true)
    setError(null)
    try {
      const membership = await joinRoom(code, (displayName || chosen.name || t('gm.noName')).trim(), chosen.id)
      onClose()
      navigate(`/sala/${membership.code}`)
    } catch (err) {
      setError(roomErrorMessage(t, err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={t('room.join')}>
      {sheets.length === 0 ? (
        <p className="text-sm text-[#A8A09B] py-4 text-center">{t('room.noSheets')}</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#E8DFD0]">
            {t('room.codeLabel')}
            <input
              data-testid="sala-entrar-codigo"
              value={code}
              onChange={e => setCode(normalizeRoomCode(e.target.value))}
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              inputMode="text"
              placeholder="ABC234"
              className={`${field} text-center text-[26px] font-extrabold tracking-[0.25em] uppercase`}
            />
          </label>

          <fieldset className="flex flex-col gap-1.5">
            <legend className="text-[13px] font-semibold text-[#E8DFD0] mb-1">{t('room.pickSheet')}</legend>
            {sheets.map(s => {
              const charClass = gameData.classes.find(c => c.id === s.charClass)?.name ?? s.charClass
              const selected = s.id === chosen?.id
              return (
                <button
                  type="button"
                  key={s.id}
                  aria-pressed={selected}
                  onClick={() => pickSheet(s.id, s.name)}
                  className={`w-full text-left rounded-[9px] px-3 py-2.5 border cursor-pointer transition-colors ${
                    selected ? 'border-[#D4A017] bg-[rgba(212,160,23,0.12)]' : 'border-[#B8860B]/20 bg-[#2D2520] hover:bg-[#4D4037]'
                  }`}
                >
                  <span className="block font-semibold text-[#F5F0E8]">{s.name || t('gm.noName')}</span>
                  <span className="block text-[12px] text-[#A8A09B]">{t('gm.level', { n: s.level })} · {charClass}</span>
                </button>
              )
            })}
          </fieldset>

          <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#E8DFD0]">
            {t('room.yourName')}
            <input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder={chosen?.name || t('gm.noName')}
              maxLength={60}
              className={field}
            />
          </label>

          {error && <p role="alert" className="text-[13px] text-[#d4564a]">{error}</p>}
          <button type="submit" disabled={busy || !isRoomCode(code)} className={`${gmPrimaryButton} self-start`}>
            {t('room.joinAction')}
          </button>
        </form>
      )}
    </Modal>
  )
}
