import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSheetStore } from '../../store/sheetStore'
import { formatModifier } from '../../lib/calculations'
import { DieBadge } from '../ui/Badge'
import Button from '../ui/Button'

const INPUT_BASE = 'bg-[#2D2520] border border-[#B8860B]/30 rounded px-2 py-1 text-[#F5F0E8] text-sm text-center focus:outline-none focus:ring-1 focus:ring-[#B8860B] focus:border-[#B8860B]'

export function CombatPanel() {
  const { sheet, updateHp, updateTempHp, spendHitDie, shortRest, longRest, toggleShield } = useSheetStore()
  const { t } = useTranslation()
  const { hit_points: hp, hit_dice: dv, armor_class: ac, initiative, speed, _proficiency_bonus } = sheet.combat
  const hasShieldInInventory = sheet.inventory.items.some(i => i.category === 'Escudo')
  const [hpDelta, setHpDelta] = useState('')
  const passivePerception = 10 + (sheet.skills.percepcao._value ?? 0)

  const maxHp = hp.max ?? 0
  const currentHp = hp.current
  const hpPct = maxHp > 0 ? (currentHp / maxHp) * 100 : 0

  type Stat = { label: string; value: string | number; sub?: string; hero?: boolean }
  const stats: Stat[] = [
    { label: t('combat.hp'), value: `${currentHp}/${maxHp}`, sub: hp.temporary > 0 ? `+${hp.temporary} temp` : undefined, hero: true },
    { label: t('combat.ac'), value: ac.value ?? '—', sub: ac.shield_equipped ? t('combat.shieldBonus') : undefined },
    { label: t('combat.initiative'), value: initiative._value !== null ? formatModifier(initiative._value) : '—' },
    { label: t('combat.speed'), value: speed._total_meters !== null ? `${speed._total_meters}${t('sheet.mUnit')}` : '—' },
    { label: t('combat.prof'), value: _proficiency_bonus !== null ? `+${_proficiency_bonus}` : '—' },
    { label: t('combat.passivePerception'), value: passivePerception },
  ]

  function handleAdjustHp() {
    const delta = parseInt(hpDelta)
    if (!isNaN(delta)) { updateHp(delta); setHpDelta('') }
  }

  return (
    <div className="space-y-4">
      {/* Stat grid — PV hero (text-3xl), demais text-2xl */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {stats.map(({ label, value, sub, hero }) => (
          <div
            key={label}
            className={`bg-[#2D2520] border rounded-lg p-3 flex flex-col items-center
              ${(hero as boolean | undefined) ? 'border-[#B8860B]/50' : 'border-[#B8860B]/20'}`}
          >
            <span className="text-[#A8A09B] text-xs mb-0.5">{label}</span>
            <span className={`font-cinzel font-bold text-[#F5F0E8] leading-none ${(hero as boolean | undefined) ? 'text-3xl' : 'text-2xl'}`}>
              {value}
            </span>
            {sub && <span className="text-xs text-[#B8860B] mt-0.5">{sub}</span>}
          </div>
        ))}
      </div>

      {/* PV bar */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-[#A8A09B]">{t('combat.hpLabel')}</span>
          <span className="text-xs text-[#A8A09B]">{currentHp}/{maxHp}</span>
        </div>
        <div
          className="h-3 bg-[#2D2520] rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={currentHp}
          aria-valuemin={0}
          aria-valuemax={maxHp}
          aria-label={t('combat.hpAriaLabel')}
        >
          <div
            className={`h-full rounded-full transition-all duration-500 ${hpPct > 50 ? 'bg-green-600' : hpPct > 20 ? 'bg-yellow-500' : 'bg-red-600'}`}
            style={{ width: `${hpPct}%` }}
          />
        </div>
      </div>

      {/* PV adjustment */}
      <div className="flex gap-2 items-center flex-wrap">
        <label htmlFor="pv-delta" className="text-xs text-[#A8A09B] flex-shrink-0">{t('combat.adjustHp')}</label>
        <input
          id="pv-delta"
          type="number"
          value={hpDelta}
          onChange={e => setHpDelta(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdjustHp()}
          placeholder="±"
          className={`w-16 ${INPUT_BASE}`}
          aria-label={t('combat.hpDeltaAriaLabel')}
        />
        <Button size="sm" variant="secondary" onClick={handleAdjustHp} disabled={!hpDelta}>
          {t('combat.apply')}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => updateHp(maxHp - currentHp)}>
          {t('combat.restore')}
        </Button>
      </div>

      {/* PV temporário */}
      <div className="flex items-center gap-2">
        <label htmlFor="pv-temp" className="text-xs text-[#A8A09B] flex-shrink-0">{t('combat.tempHp')}</label>
        <input
          id="pv-temp"
          type="number"
          value={hp.temporary}
          onChange={e => updateTempHp(parseInt(e.target.value) || 0)}
          className={`w-16 ${INPUT_BASE}`}
          min={0}
          aria-label={t('combat.tempHpAriaLabel')}
        />
      </div>

      {/* Dados de vida */}
      {dv.type && (
        <div className="bg-[#2D2520] border border-[#B8860B]/20 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#A8A09B]">{t('combat.hitDice')}</span>
              <DieBadge type={dv.type ?? 'd8'} />
            </div>
            <span className="text-sm text-[#F5F0E8]">
              {(dv.total ?? 0) - dv.spent}/{dv.total} {t('combat.available', { n: '' }).trim()}
            </span>
          </div>
          <div className="flex gap-1 flex-wrap mb-2" role="group" aria-label={t('combat.hitDiceAriaLabel')}>
            {Array.from({ length: dv.total ?? 0 }, (_, i) => {
              const available = i < (dv.total ?? 0) - dv.spent
              return (
                <span
                  key={i}
                  className={`w-5 h-5 rounded-full border ${available ? 'bg-[#B8860B] border-[#B8860B]' : 'border-[#A8A09B]/40'}`}
                  aria-hidden="true"
                />
              )
            })}
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="secondary" onClick={spendHitDie} disabled={(dv.total ?? 0) - dv.spent <= 0}>
              {t('combat.spendDie')}
            </Button>
            <Button size="sm" variant="ghost" onClick={shortRest}>{t('combat.shortRest')}</Button>
            <Button size="sm" variant="ghost" onClick={longRest}>{t('combat.longRest')}</Button>
          </div>
        </div>
      )}

      {/* Escudo toggle */}
      <button
        onClick={toggleShield}
        disabled={!ac.shield_equipped && !hasShieldInInventory}
        aria-pressed={ac.shield_equipped}
        title={!hasShieldInInventory && !ac.shield_equipped ? t('combat.addShieldFirst') : undefined}
        className={`px-3 py-1.5 rounded border text-sm font-medium transition-colors
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]
          ${ac.shield_equipped
            ? 'bg-[#7B1D1D] border-[#7B1D1D] text-white cursor-pointer'
            : !hasShieldInInventory
            ? 'border-[#B8860B]/10 text-[#A8A09B]/40 cursor-not-allowed'
            : 'border-[#B8860B]/30 text-[#A8A09B] hover:bg-[#3D332D] hover:text-[#F5F0E8] cursor-pointer'}`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill={ac.shield_equipped ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        {ac.shield_equipped ? t('combat.shieldEquipped') : hasShieldInInventory ? t('combat.equipShield') : t('combat.noShield')}
      </button>
    </div>
  )
}
