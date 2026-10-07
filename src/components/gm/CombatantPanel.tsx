import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Combatant } from '../../types'
import { useGmStore } from '../../store/gmStore'
import { translateTerm } from '../../data/rules/translation'
import { FEATURE_LISTS } from '../../lib/gm/statblock'
import { formatModifier } from '../../lib/calculations'
import { AVAILABLE_CONDITIONS } from '../../constants'
import { modeSpeed, remainingMovement } from '../../lib/gm/movement'
import type { MoveMode } from '../../types'
import { NumberField } from './fields'
import { rowButton, rowDangerButton } from './MonsterRow'

const MOVE_MODES: Array<{ id: MoveMode; key: string }> = [
  { id: 'walk', key: 'gm.moveWalk' },
  { id: 'fly', key: 'gm.moveFly' },
  { id: 'swim', key: 'gm.moveSwim' },
]

interface CombatantPanelProps {
  encounterId: string
  combatant: Combatant
  onViewBlock: () => void
  onRemoved: () => void
  /** No modal do celular o nome já está no título. */
  showName?: boolean
  /** O encontro tem mapa: mostra movimento, Disparada e "tirar do mapa". */
  onMap?: boolean
}

/** Ações sobre um combatente: PV, condições, estados e as ações do bloco. */
export function CombatantPanel({ encounterId, combatant: c, onViewBlock, onRemoved, showName = true, onMap = false }: CombatantPanelProps) {
  const { t, i18n } = useTranslation()
  const {
    damageCombatant, healCombatant, setTempHp, toggleCombatantCondition, toggleConcentration,
    setDefeated, updateCombatant, removeCombatant, rollFeature, toggleDash, placeCombatant,
  } = useGmStore()
  const [amount, setAmount] = useState('')
  const [concentrationDc, setConcentrationDc] = useState<number | null>(null)
  const value = Math.floor(Number(amount))
  const valid = amount !== '' && Number.isFinite(value) && value > 0

  function act(apply: (n: number) => void) {
    if (!valid) return
    apply(value)
    setAmount('')
  }

  const features = c.statblock
    ? FEATURE_LISTS.flatMap(list => c.statblock![list]).filter(f => f.attack_bonus != null || f.damage)
    : []

  return (
    <div data-testid="painel-combatente" className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-2">
        {showName ? <h2 className="font-extrabold text-[18px] text-[#F5F0E8] truncate">{c.name}</h2> : <span />}
        <span className="text-[15px] font-bold text-[#E8DFD0] tabular-nums flex-shrink-0">
          {c.hp.current}/{c.hp.max}{c.hp.temp > 0 ? ` +${c.hp.temp}` : ''} {t('gm.hp')}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <input
          type="number"
          inputMode="numeric"
          min={1}
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder={t('gm.amount')}
          aria-label={t('gm.amount')}
          className="w-full bg-[#131110] border border-white/[0.1] rounded-[9px] px-3 py-2.5 text-[18px] font-bold text-[#F5F0E8] placeholder:text-[#6f6a64] placeholder:font-normal focus:outline-none focus:border-[#D4A017]"
        />
        <div className="grid grid-cols-3 gap-2">
          <button
            data-testid="aplicar-dano"
            disabled={!valid}
            onClick={() => act(n => setConcentrationDc(damageCombatant(encounterId, c.id, n)))}
            className="rounded-[9px] py-2.5 text-[14px] font-bold text-white bg-[#8f2d24] hover:bg-[#a8362b] cursor-pointer disabled:opacity-40 disabled:cursor-default"
          >
            {t('gm.damageAction')}
          </button>
          <button
            disabled={!valid}
            onClick={() => act(n => healCombatant(encounterId, c.id, n))}
            className="rounded-[9px] py-2.5 text-[14px] font-bold text-white bg-[#3f6b34] hover:bg-[#4b7f3e] cursor-pointer disabled:opacity-40 disabled:cursor-default"
          >
            {t('gm.healAction')}
          </button>
          <button
            disabled={!valid}
            onClick={() => act(n => setTempHp(encounterId, c.id, n))}
            className="rounded-[9px] py-2.5 text-[14px] font-bold text-white bg-[#3a4f6e] hover:bg-[#45608a] cursor-pointer disabled:opacity-40 disabled:cursor-default"
          >
            {t('gm.tempAction')}
          </button>
        </div>
        {concentrationDc != null && (
          <p role="alert" className="text-[13px] font-semibold text-[#e08a4a]">
            {t('gm.concentrationCheck', { dc: concentrationDc })}
          </p>
        )}
      </div>

      {onMap && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-[#E8DFD0]">
          <span className="tabular-nums">
            {t('gm.movementLeft', {
              left: remainingMovement(c).toLocaleString(i18n.language),
              total: (modeSpeed(c) * (c.dash ? 2 : 1)).toLocaleString(i18n.language),
            })}
          </span>
          <div role="radiogroup" aria-label={t('gm.moveMode')} className="inline-flex rounded-[8px] border border-white/[0.1] overflow-hidden">
            {MOVE_MODES.map(m => {
              const available = m.id === 'walk' || (m.id === 'fly' ? c.fly_m : c.swim_m) != null
              return (
                <button
                  key={m.id}
                  role="radio"
                  aria-checked={c.move_mode === m.id}
                  disabled={!available}
                  onClick={() => updateCombatant(encounterId, c.id, { move_mode: m.id })}
                  className={`px-2.5 py-1 text-[12px] font-semibold cursor-pointer disabled:opacity-30 disabled:cursor-default ${
                    c.move_mode === m.id ? 'bg-[#D4A017] text-[#131110]' : 'bg-white/5 text-[#E8DFD0]'
                  }`}
                >
                  {t(m.key)}
                </button>
              )
            })}
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={c.dash} onChange={() => toggleDash(encounterId, c.id)} />
            {t('gm.dash')}
          </label>
          {c.position && (
            <button onClick={() => placeCombatant(encounterId, c.id, null)} className={rowButton}>{t('gm.removeFromMap')}</button>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-x-4 gap-y-2 text-[13px] text-[#E8DFD0]">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={c.concentration} onChange={() => toggleConcentration(encounterId, c.id)} />
          {t('gm.concentrating')}
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={c.defeated} onChange={e => setDefeated(encounterId, c.id, e.target.checked)} />
          {t('gm.defeated')}
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={c.hidden} onChange={e => updateCombatant(encounterId, c.id, { hidden: e.target.checked })} />
          {t('gm.hiddenLabel')}
        </label>
      </div>

      {onMap && (
        <div className="grid grid-cols-3 gap-3">
          <NumberField
            label={`${t('gm.moveWalk')} (${t('gm.metersUnit')})`}
            value={c.speed_m}
            min={0}
            onChange={v => updateCombatant(encounterId, c.id, { speed_m: v ?? 0 })}
          />
          <NumberField
            label={`${t('gm.moveFly')} (${t('gm.metersUnit')})`}
            value={c.fly_m}
            nullable
            min={0}
            onChange={v => updateCombatant(encounterId, c.id, { fly_m: v, ...(v == null && c.move_mode === 'fly' ? { move_mode: 'walk' as const } : {}) })}
          />
          <NumberField
            label={`${t('gm.moveSwim')} (${t('gm.metersUnit')})`}
            value={c.swim_m}
            nullable
            min={0}
            onChange={v => updateCombatant(encounterId, c.id, { swim_m: v, ...(v == null && c.move_mode === 'swim' ? { move_mode: 'walk' as const } : {}) })}
          />
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A8A09B]">{t('gm.side')}</span>
          <select
            value={c.side}
            onChange={e => updateCombatant(encounterId, c.id, { side: e.target.value as Combatant['side'] })}
            className="w-full bg-[#131110] border border-white/[0.1] rounded-[8px] px-2.5 py-2 text-[14px] text-[#F5F0E8]"
          >
            <option value="party">{t('gm.sideParty')}</option>
            <option value="enemy">{t('gm.sideEnemy')}</option>
          </select>
        </label>
        <NumberField label={t('gm.ac')} value={c.ac} min={0} onChange={v => updateCombatant(encounterId, c.id, { ac: v ?? c.ac })} />
        <NumberField label={t('gm.hpMax')} value={c.hp.max} min={1} onChange={v => v != null && updateCombatant(encounterId, c.id, { hp_max: v })} />
      </div>

      <div>
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#A8A09B] mb-1.5">{t('gm.conditions')}</h3>
        <div className="flex flex-wrap gap-1.5">
          {AVAILABLE_CONDITIONS.map(cond => {
            const on = c.conditions.includes(cond)
            return (
              <button
                key={cond}
                aria-pressed={on}
                onClick={() => toggleCombatantCondition(encounterId, c.id, cond)}
                className={`text-[12px] font-semibold rounded-full px-2.5 py-1 border cursor-pointer transition-colors ${
                  on ? 'bg-[#6b2b2b]/60 border-[#c0473b] text-[#f6d6d1]' : 'border-white/[0.12] text-[#A8A09B] hover:text-[#E8DFD0]'
                }`}
              >
                {translateTerm(cond, i18n.language)}
              </button>
            )
          })}
        </div>
      </div>

      {features.length > 0 && (
        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#A8A09B] mb-1.5">{t('gm.lists.actions')}</h3>
          <ul className="flex flex-col gap-1.5">
            {features.map(f => (
              <li key={f.id} className="flex items-center gap-2 rounded-[9px] border border-white/[0.07] bg-white/[0.02] px-2.5 py-1.5">
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-[#F5F0E8] truncate">{f.name}</div>
                  <div className="text-[11px] text-[#A8A09B]">
                    {[f.attack_bonus != null ? formatModifier(f.attack_bonus) : null, f.damage ? `${f.damage} ${f.damage_type}`.trim() : null]
                      .filter(Boolean).join(' · ')}
                  </div>
                </div>
                <button onClick={() => rollFeature(encounterId, c.id, f.id)} className={rowButton}>🎲 {t('gm.roll')}</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {c.statblock && <button onClick={onViewBlock} className={rowButton}>{t('gm.viewBlock')}</button>}
        <button
          onClick={() => {
            removeCombatant(encounterId, c.id)
            onRemoved()
          }}
          className={rowDangerButton}
        >
          {t('gm.removeCombatant')}
        </button>
      </div>
    </div>
  )
}
