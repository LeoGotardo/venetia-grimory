import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TableCombatant, TableState } from '../../lib/room/protocol'
import { d20Roll, parseRoomRoll } from '../../lib/room/rolls'
import { formatModifier } from '../../lib/calculations'
import { translateTerm } from '../../data/rules/translation'
import { useRoomStore } from '../../store/roomStore'
import { readRoomSheet } from '../../hooks/useRoomSync'
import { Modal } from '../ui/Modal'
import { gmPrimaryButton } from '../gm/GmHeader'

interface AttackModalProps {
  open: boolean
  onClose: () => void
  table: TableState
  mine: TableCombatant
  sheetId: string | null
}

const choice = (selected: boolean) =>
  `w-full text-left rounded-[9px] px-3 py-2.5 border cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-default ${
    selected ? 'border-[#D4A017] bg-[rgba(212,160,23,0.12)]' : 'border-[#B8860B]/20 bg-[#2D2520] hover:bg-[#4D4037]'
  }`

/**
 * Atacar na vez: um ataque da ficha e um alvo da mesa. O servidor rola acerto e
 * dano; o mestre, que sabe a CA, decide se acertou e aplica.
 */
export function AttackModal({ open, onClose, table, mine, sheetId }: AttackModalProps) {
  const { t, i18n } = useTranslation()
  const attack = useRoomStore(s => s.attack)
  const [attackIdx, setAttackIdx] = useState<number | null>(null)
  const [targetId, setTargetId] = useState<string | null>(null)

  const attacks = (readRoomSheet(sheetId)?.combat.attacks ?? []).filter(a => a._attack_bonus != null)
  // Inimigos primeiro; quem já caiu não é alvo.
  const targets = table.combatants
    .filter(c => c.id !== mine.id && !c.defeated)
    .sort((a, b) => (a.side === b.side ? 0 : a.side === 'enemy' ? -1 : 1))
  const chosen = attackIdx != null ? attacks[attackIdx] : null
  const target = targets.find(c => c.id === targetId) ?? null

  function submit() {
    if (!chosen || !target || chosen._attack_bonus == null || !chosen._damage) return
    const sent = attack({
      combatantId: mine.id, targetId: target.id, label: chosen.name,
      attack: d20Roll(chosen._attack_bonus), damage: chosen._damage, damageType: chosen.damage_type ?? '',
    })
    if (!sent) return
    setAttackIdx(null)
    setTargetId(null)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={t('room.turn.attack')}>
      <div className="flex flex-col gap-4">
        <fieldset className="flex flex-col gap-1.5">
          <legend className="text-[13px] font-semibold text-[#E8DFD0] mb-1">{t('room.attackModal.pickAttack')}</legend>
          {attacks.length === 0 && <p className="text-[14px] text-[#A8A09B]">{t('room.attackModal.noAttacks')}</p>}
          {attacks.map((a, i) => {
            // Dano em texto livre ("veja a magia") não rola no servidor.
            const rollable = a._damage != null && parseRoomRoll(a._damage) != null
            return (
              <button key={`${a.name}-${i}`} type="button" disabled={!rollable} aria-pressed={attackIdx === i} onClick={() => setAttackIdx(i)} className={choice(attackIdx === i)}>
                <span className="block font-semibold text-[#F5F0E8]">{a.name}</span>
                <span className="block text-[12px] text-[#A8A09B] tabular-nums">
                  {formatModifier(a._attack_bonus)} · {a._damage ?? '—'} {a.damage_type ? translateTerm(a.damage_type, i18n.language) : ''}
                  {!rollable && ` · ${t('room.attackModal.damageNotRollable')}`}
                </span>
              </button>
            )
          })}
        </fieldset>

        <fieldset className="flex flex-col gap-1.5">
          <legend className="text-[13px] font-semibold text-[#E8DFD0] mb-1">{t('room.attackModal.pickTarget')}</legend>
          {targets.map(c => (
            <button key={c.id} type="button" aria-pressed={targetId === c.id} onClick={() => setTargetId(c.id)} className={choice(targetId === c.id)}>
              <span className="block font-semibold text-[#F5F0E8]">{c.name}</span>
              <span className="block text-[12px] text-[#A8A09B]">{t(`room.health.${c.health}`)}</span>
            </button>
          ))}
        </fieldset>

        <button disabled={!chosen || !target} onClick={submit} className={`${gmPrimaryButton} self-start`}>
          {chosen && target ? t('room.attackModal.confirm', { attack: chosen.name, target: target.name }) : t('room.turn.attack')}
        </button>
      </div>
    </Modal>
  )
}
