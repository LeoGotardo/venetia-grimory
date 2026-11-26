import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useRoomStore } from '../../store/roomStore'
import { gameData } from '../../data/rules'
import { checkLabel } from '../../lib/rollChecks'
import type { RollCheck } from '../../lib/room/protocol'
import { ROOM_ROLL_LABEL_MAX } from '../../constants'
import { gmPrimaryButton } from '../gm/GmHeader'
import { LockIcon } from '../gm/ornaments'

const ABILITIES = ['FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR'] as const

const field =
  'w-full min-h-[42px] bg-[#2D2520] border border-[#B8860B]/30 rounded-[9px] px-3 text-[15px] text-[#F5F0E8] placeholder:text-[#A8A09B] focus:outline-none focus:border-[#D4A017]'

/** Opções do seletor: "skill:percepcao", "save:DES", "ability:FOR", "initiative:". */
const encode = (check: RollCheck) => `${check.kind}:${check.id ?? ''}`
function decode(value: string): RollCheck {
  const [kind, id] = value.split(':') as [RollCheck['kind'], string]
  return { kind, id: id || null }
}

/**
 * Mestre pede um teste à mesa (todos ou alguns players). Cada player rola com o
 * próprio modificador; "secreto" deixa as respostas só para o mestre.
 */
export function RollRequestForm() {
  const { t } = useTranslation()
  const { members, requestRoll, status } = useRoomStore()
  const players = members.filter(m => m.role === 'player')
  const [check, setCheck] = useState('skill:percepcao')
  const [label, setLabel] = useState('')
  const [targets, setTargets] = useState<string[]>([])
  const [secret, setSecret] = useState(false)
  const [sent, setSent] = useState(false)

  function submit(event: FormEvent) {
    event.preventDefault()
    const memberIds = targets.filter(id => players.some(p => p.id === id))
    if (!requestRoll(decode(check), label.trim(), memberIds.length > 0 ? memberIds : null, secret)) return
    setLabel('')
    setSent(true)
    setTimeout(() => setSent(false), 1500)
  }

  const toggle = (id: string) => setTargets(list => (list.includes(id) ? list.filter(x => x !== id) : [...list, id]))
  const chip = (on: boolean) =>
    `min-h-[36px] rounded-full border px-3 text-[13px] font-semibold cursor-pointer transition-colors ${
      on ? 'border-[#D4A017] bg-[rgba(212,160,23,0.16)] text-[#F5F0E8]' : 'border-white/[0.12] text-[#A8A09B] hover:text-[#E8DFD0]'
    }`

  return (
    <form onSubmit={submit} className="vg-card p-4 flex flex-col gap-3">
      <h3 className="font-cinzel text-[15px] font-semibold text-[#EAD9B0]">{t('room.requestForm.title')}</h3>
      <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#E8DFD0]">
        {t('room.requestForm.check')}
        <select value={check} onChange={e => setCheck(e.target.value)} className={field}>
          <optgroup label={t('sheet.sectionSkills')}>
            {gameData.skills.map(s => <option key={s.id} value={encode({ kind: 'skill', id: s.id })}>{s.name}</option>)}
          </optgroup>
          <optgroup label={t('attrs.saves')}>
            {ABILITIES.map(a => <option key={a} value={encode({ kind: 'save', id: a })}>{checkLabel({ kind: 'save', id: a }, t)}</option>)}
          </optgroup>
          <optgroup label={t('sheet.sectionAttrs')}>
            {ABILITIES.map(a => <option key={a} value={encode({ kind: 'ability', id: a })}>{checkLabel({ kind: 'ability', id: a }, t)}</option>)}
          </optgroup>
          <option value={encode({ kind: 'initiative', id: null })}>{t('combat.initiative')}</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#E8DFD0]">
        {t('room.requestForm.label')}
        <input value={label} onChange={e => setLabel(e.target.value)} maxLength={ROOM_ROLL_LABEL_MAX} placeholder={t('room.requestForm.labelPlaceholder')} className={field} />
      </label>
      <div className="flex flex-col gap-1.5">
        <span className="text-[13px] font-semibold text-[#E8DFD0]">{t('room.requestForm.who')}</span>
        <div className="flex flex-wrap gap-1.5">
          <button type="button" aria-pressed={targets.length === 0} onClick={() => setTargets([])} className={chip(targets.length === 0)}>
            {t('room.requestForm.everyone')}
          </button>
          {players.map(p => (
            <button key={p.id} type="button" aria-pressed={targets.includes(p.id)} onClick={() => toggle(p.id)} className={chip(targets.includes(p.id))}>
              {p.display_name}
            </button>
          ))}
        </div>
      </div>
      <label className="flex items-center gap-2 text-[14px] text-[#E8DFD0] cursor-pointer">
        <input type="checkbox" checked={secret} onChange={e => setSecret(e.target.checked)} className="w-4 h-4 accent-[#D4A017]" />
        <LockIcon size={14} /> {t('room.requestForm.secret')}
      </label>
      <button type="submit" disabled={status !== 'online' || players.length === 0} className={`${gmPrimaryButton} self-start`}>
        {sent ? t('room.requestForm.sent') : t('room.requestForm.send')}
      </button>
    </form>
  )
}
