import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SAVE_ABILITIES, type SaveAbility, type TableCombatant, type TableState } from '../../lib/room/protocol'
import { d20Roll, parseRoomDamage, parseRoomRoll } from '../../lib/room/rolls'
import { formatModifier } from '../../lib/calculations'
import {
  healTargets, spellSaveAbility, suggestedDamage, suggestedMode, tableTargets, type CastMode, type CastableSpell,
} from '../../lib/turnActions'
import { translateTerm } from '../../data/rules/translation'
import { useRoomStore } from '../../store/roomStore'
import { gmPrimaryButton } from '../gm/GmHeader'
import { choiceButton, turnField, turnLegend } from './turnStyles'

interface CastFormProps {
  castable: CastableSpell
  /** Rótulo do evento no log ("Bola de Fogo (3º círculo)", "… (pergaminho)"). */
  label: string
  table: TableState
  mine: TableCombatant
  characterLevel: number
  /** Já dá para pagar (espaço escolhido, pergaminho em mãos). */
  payable: boolean
  /** Enviado ao servidor: quem chamou paga (gasta o espaço, consome o pergaminho) e fecha. */
  onSent: () => void
}

const MODES: readonly CastMode[] = ['attack', 'save', 'heal', 'none']

/**
 * Como a magia se resolve: ataque mágico contra um alvo, salvaguarda de um ou
 * vários, cura num alvo (o próprio inclusive) ou sem rolagem. Modo e dano vêm do
 * catálogo como sugestão — ele não marca ataque, cura nem a escala por círculo.
 * Remonte por `key` ao trocar de magia: o estado inicial sai dela.
 */
export function CastForm({ castable, label, table, mine, characterLevel, payable, onSent }: CastFormProps) {
  const { t, i18n } = useTranslation()
  const { attack, save, heal, roll, say } = useRoomStore()
  const { spell, rules } = castable
  const [mode, setMode] = useState<CastMode>(() => suggestedMode(rules))
  const [ability, setAbility] = useState<SaveAbility>(() => spellSaveAbility(rules?.save) ?? 'DES')
  // A maioria das magias de área com salvaguarda causa metade ao passar; truques como Chama Sagrada, nada.
  const [half, setHalf] = useState(() => spell.level > 0 && !!rules?.damage)
  const [damage, setDamage] = useState(() => suggestedDamage(spell, characterLevel))
  const [targetIds, setTargetIds] = useState<string[]>([])

  const targets = mode === 'heal' ? healTargets(table, mine) : tableTargets(table, mine)
  const damageText = damage.trim()
  const damageOk = damageText === '' || parseRoomDamage(damageText) != null
  const ready = payable && damageOk
    && (mode !== 'attack' || (castable.attackBonus != null && targetIds.length === 1))
    && (mode !== 'save' || (castable.dc != null && targetIds.length > 0))
    && (mode !== 'heal' || (damageText !== '' && targetIds.length === 1))

  function changeMode(next: CastMode) {
    setMode(next)
    setTargetIds([])
  }

  function toggleTarget(id: string) {
    // Salvaguarda pode pegar vários (área); ataque e cura, um.
    setTargetIds(ids => mode !== 'save' ? [id] : ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id])
  }

  async function submit() {
    if (!ready) return
    const damageType = rules?.damage_type ?? ''
    const sent = mode === 'attack'
      ? await attack({ combatantId: mine.id, targetId: targetIds[0], label, attack: d20Roll(castable.attackBonus ?? 0), damage: damageText || null, damageType })
      : mode === 'save'
        ? await save({
          combatantId: mine.id, targetIds, label, dc: castable.dc ?? 10, abilities: [ability],
          damage: damageText || null, damageType, halfOnSuccess: half, effect: 'none',
        })
        : mode === 'heal'
          ? await heal({ combatantId: mine.id, targetId: targetIds[0], label, heal: damageText })
          // Sem alvo nem salvaguarda (utilidade): rola o que tiver dado, senão só avisa a mesa.
          : damageText && parseRoomRoll(damageText) ? await roll(damageText, label, false) : say(t('room.cast.announce', { spell: label }), false)
    if (sent) onSent()
  }

  const modeLabel = (m: CastMode) =>
    m === 'attack' ? t('room.cast.modeAttack', { bonus: formatModifier(castable.attackBonus ?? 0) })
      : m === 'save' ? t('room.cast.modeSave', { dc: castable.dc ?? '—' })
        : m === 'heal' ? t('room.cast.modeHeal')
          : t('room.cast.modeNone')

  return (
    <>
      <fieldset className="flex flex-col gap-1.5">
        <legend className={turnLegend}>{t('room.cast.howResolves')}</legend>
        <div className="flex flex-wrap gap-2">
          {MODES.map(m => (
            <button key={m} type="button" aria-pressed={mode === m} onClick={() => changeMode(m)} className={`${choiceButton(mode === m)} !w-auto`}>
              {modeLabel(m)}
            </button>
          ))}
        </div>
      </fieldset>

      {mode === 'save' && (
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#E8DFD0]">
            {t('room.cast.saveAbility')}
            <select value={ability} onChange={e => setAbility(e.target.value as SaveAbility)} className={turnField}>
              {SAVE_ABILITIES.map(a => <option key={a} value={a}>{t(`attrs.${a}`)}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-2 text-[14px] text-[#E8DFD0] pb-2">
            <input type="checkbox" checked={half} onChange={e => setHalf(e.target.checked)} />
            {t('room.cast.halfOnSuccess')}
          </label>
        </div>
      )}

      <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#E8DFD0]">
        {mode === 'heal' ? t('room.cast.healing') : mode === 'none' ? t('room.cast.rollOptional') : t('room.cast.damage')}
        <input value={damage} onChange={e => setDamage(e.target.value)} placeholder="2d8+3" maxLength={60} className={turnField} />
        <span className="text-[12px] font-normal text-[#A8A09B]">
          {!damageOk ? t('room.cast.damageInvalid') : rules?.damage
            ? t('room.cast.catalogDamage', { damage: spell.damage, type: translateTerm(rules.damage_type ?? '', i18n.language) })
            : t('room.cast.damageHint')}
        </span>
      </label>

      {mode !== 'none' && (
        <fieldset className="flex flex-col gap-1.5">
          <legend className={turnLegend}>{mode === 'save' ? t('room.cast.pickTargets') : t('room.attackModal.pickTarget')}</legend>
          {targets.map(c => (
            <button key={c.id} type="button" aria-pressed={targetIds.includes(c.id)} onClick={() => toggleTarget(c.id)} className={choiceButton(targetIds.includes(c.id))}>
              <span className="block font-semibold text-[#F5F0E8]">{c.id === mine.id ? t('room.heal.self', { name: c.name }) : c.name}</span>
              <span className="block text-[12px] text-[#A8A09B]">{t(`room.health.${c.health}`)}</span>
            </button>
          ))}
        </fieldset>
      )}

      <button disabled={!ready} onClick={() => void submit()} className={`${gmPrimaryButton} self-start`}>
        {t('room.cast.confirm', { spell: spell.name })}
      </button>
    </>
  )
}
