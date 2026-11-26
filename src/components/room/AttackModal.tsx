import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { SaveEffect, TableCombatant, TableState } from '../../lib/room/protocol'
import { d20Roll, parseRoomDamage } from '../../lib/room/rolls'
import { formatModifier } from '../../lib/calculations'
import { tableTargets, unarmedStrike } from '../../lib/turnActions'
import { choiceButton } from './turnStyles'
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

/** Ataque com rolagem (arma da ficha ou soco) ou manobra com salvaguarda (Agarrar, Empurrar). */
type AttackOption =
  | { kind: 'attack'; key: string; name: string; bonus: number; damage: string | null; damageType: string }
  | { kind: 'save'; key: string; name: string; dc: number; effect: SaveEffect }

/**
 * Atacar na vez: um ataque da ficha, o Ataque Desarmado (que sempre existe) ou
 * as manobras dele, e um alvo da mesa. O servidor rola acerto e dano; o mestre,
 * que sabe a CA e as salvaguardas, decide e aplica.
 */
export function AttackModal({ open, onClose, table, mine, sheetId }: AttackModalProps) {
  const { t, i18n } = useTranslation()
  const attack = useRoomStore(s => s.attack)
  const save = useRoomStore(s => s.save)
  const [optionKey, setOptionKey] = useState<string | null>(null)
  const [targetId, setTargetId] = useState<string | null>(null)

  const sheet = readRoomSheet(sheetId)
  const options: AttackOption[] = (sheet?.combat.attacks ?? []).flatMap((a, i) =>
    a._attack_bonus == null ? [] : [{
      kind: 'attack' as const, key: `sheet-${i}`, name: a.name, bonus: a._attack_bonus, damage: a._damage ?? null, damageType: a.damage_type ?? '',
    }])
  if (sheet) {
    const unarmed = unarmedStrike(sheet)
    options.push(
      { kind: 'attack', key: 'unarmed', name: t('room.unarmed.strike'), bonus: unarmed.attackBonus, damage: unarmed.damage, damageType: t('room.unarmed.damageType') },
      { kind: 'save', key: 'grapple', name: t('room.unarmed.grapple'), dc: unarmed.dc, effect: 'grappled' },
      { kind: 'save', key: 'shove', name: t('room.unarmed.shove'), dc: unarmed.dc, effect: 'shoved' },
    )
  }
  const targets = tableTargets(table, mine)
  const chosen = options.find(o => o.key === optionKey) ?? null
  const target = targets.find(c => c.id === targetId) ?? null

  async function submit() {
    if (!chosen || !target) return
    const sent = chosen.kind === 'attack'
      ? chosen.damage != null && await attack({
        combatantId: mine.id, targetId: target.id, label: chosen.name,
        attack: d20Roll(chosen.bonus), damage: chosen.damage, damageType: chosen.damageType,
      })
      // Agarrar e Empurrar: o alvo escolhe FOR ou DES (2024).
      : await save({
        combatantId: mine.id, targetIds: [target.id], label: chosen.name, dc: chosen.dc,
        abilities: ['FOR', 'DES'], damage: null, damageType: '', halfOnSuccess: false, effect: chosen.effect,
      })
    if (!sent) return
    setOptionKey(null)
    setTargetId(null)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={t('room.turn.attack')}>
      <div className="flex flex-col gap-4">
        <fieldset className="flex flex-col gap-1.5">
          <legend className="text-[13px] font-semibold text-[#E8DFD0] mb-1">{t('room.attackModal.pickAttack')}</legend>
          {options.map(o => {
            // Dano em texto livre ("veja a magia") não rola no servidor.
            const rollable = o.kind === 'save' || (o.damage != null && parseRoomDamage(o.damage) != null)
            return (
              <button key={o.key} type="button" disabled={!rollable} aria-pressed={optionKey === o.key} onClick={() => setOptionKey(o.key)} className={choiceButton(optionKey === o.key)}>
                <span className="block font-semibold text-[#F5F0E8]">{o.name}</span>
                <span className="block text-[12px] text-[#A8A09B] tabular-nums">
                  {o.kind === 'save'
                    ? t('room.unarmed.saveHint', { dc: o.dc, effect: t(`room.save.effect.${o.effect}`) })
                    : <>
                      {formatModifier(o.bonus)} · {o.damage ?? '—'} {o.damageType ? translateTerm(o.damageType, i18n.language) : ''}
                      {!rollable && ` · ${t('room.attackModal.damageNotRollable')}`}
                    </>}
                </span>
              </button>
            )
          })}
        </fieldset>

        <fieldset className="flex flex-col gap-1.5">
          <legend className="text-[13px] font-semibold text-[#E8DFD0] mb-1">{t('room.attackModal.pickTarget')}</legend>
          {targets.map(c => (
            <button key={c.id} type="button" aria-pressed={targetId === c.id} onClick={() => setTargetId(c.id)} className={choiceButton(targetId === c.id)}>
              <span className="block font-semibold text-[#F5F0E8]">{c.name}</span>
              <span className="block text-[12px] text-[#A8A09B]">{t(`room.health.${c.health}`)}</span>
            </button>
          ))}
        </fieldset>

        <button disabled={!chosen || !target} onClick={() => void submit()} className={`${gmPrimaryButton} self-start`}>
          {chosen && target ? t('room.attackModal.confirm', { attack: chosen.name, target: target.name }) : t('room.turn.attack')}
        </button>
      </div>
    </Modal>
  )
}
