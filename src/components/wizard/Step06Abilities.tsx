import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSheetStore } from '../../store/sheetStore'
import { WizardNav } from './WizardNav'
import { calcModifier, formatModifier, ABILITIES, abilityName } from '../../lib/calculations'
import { useWizardAbilities } from '../../hooks/useWizardAbilities'
import { POINT_BUY_COSTS } from '../../constants'
import type { AbilityId } from '../../types'
import type { AbilityMethod } from '../../hooks/useWizardAbilities'
import { gameData } from '../../data/rules'

export function Step06Abilities() {
  const { sheet, setAbilities, setStep, abilityRolls, setAbilityRolls } = useSheetStore()
  const { t } = useTranslation()
  const wizard = useWizardAbilities({ initialRoll: abilityRolls, onRoll: setAbilityRolls })

  const METHOD_LABEL: Record<AbilityMethod, string> = {
    standard: t('step06.tabStandard'),
    random: t('step06.tabRandom'),
    pointBuy: t('step06.tabPointBuy'),
  }

  const classId = sheet.identity.class_id
  const level = sheet.identity.level ?? 1
  const suggested = gameData.suggested_abilities_by_class?.[classId ?? ''] ?? []
  const firstSuggestedName = suggested[0]

  const numASIs = useMemo(() => {
    if (!classId) return 0
    const charClass = gameData.classes.find(c => c.id === classId)
    if (!charClass) return 0
    return charClass.progression
      .filter(p => p.level <= level)
      .reduce((acc, p) => acc + p.highlights.filter(
        d => d === 'AVA' || d === 'Aumento no Valor de Atributo'
      ).length, 0)
  }, [classId, level])

  const totalAsiPool = numASIs * 2
  const [asiDistribution, setAsiDistribution] = useState<Partial<Record<AbilityId, number>>>({})
  const totalAsiUsed = Object.values(asiDistribution).reduce((a, b) => a + b, 0)

  function setAsiBonus(attr: AbilityId, val: number) {
    setAsiDistribution(prev => {
      const next = { ...prev, [attr]: val }
      if (val === 0) delete next[attr]
      return next
    })
  }

  const abilitiesWithAsi: Record<AbilityId, number | null> = ABILITIES.reduce((acc, a) => {
    const base = wizard.currentAbilities[a]
    const asi = asiDistribution[a] ?? 0
    return { ...acc, [a]: base !== null ? Math.min(20, base + asi) : null }
  }, {} as Record<AbilityId, number | null>)

  const asiComplete = numASIs === 0 || totalAsiUsed === totalAsiPool

  function handleNext() {
    if (!wizard.isComplete || !asiComplete) return
    setAbilities(abilitiesWithAsi as Record<AbilityId, number>, wizard.method)
    setStep(6)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cinzel text-2xl font-bold text-[#F5F0E8] mb-1">{t('step06.heading')}</h2>
        <p className="text-[#A8A09B] text-sm">{t('step06.subtitle')}</p>
      </div>

      <div className="flex gap-2 border-b border-[#B8860B]/20 pb-2 overflow-x-auto">
        {(Object.keys(METHOD_LABEL) as AbilityMethod[]).map(tab => (
          <button
            key={tab}
            onClick={() => wizard.switchMethod(tab)}
            className={`px-3 sm:px-4 py-2 rounded-t text-sm font-medium transition-colors cursor-pointer whitespace-nowrap
              ${wizard.method === tab ? 'bg-[#7B1D1D] text-white' : 'text-[#A8A09B] hover:text-[#F5F0E8] hover:bg-[#3D332D]'}`}
          >
            {METHOD_LABEL[tab]}
          </button>
        ))}
      </div>

      {wizard.method === 'standard' && (
        <StandardArrayPanel
          wizard={wizard}
          suggested={suggested}
          firstSuggestedName={firstSuggestedName}
        />
      )}

      {wizard.method === 'random' && (
        <RandomPanel wizard={wizard} />
      )}

      {wizard.method === 'pointBuy' && (
        <PointBuyPanel wizard={wizard} />
      )}

      {numASIs > 0 && wizard.isComplete && (
        <AsiPanel
          numASIs={numASIs}
          totalPool={totalAsiPool}
          totalUsado={totalAsiUsed}
          baseAbilities={wizard.currentAbilities}
          asiDistribution={asiDistribution}
          onSetBonus={setAsiBonus}
        />
      )}

      <ResumoAtributos
        currentAbilities={abilitiesWithAsi}
        firstSuggestedName={firstSuggestedName}
      />

      <WizardNav onBack={() => setStep(4)} onNext={handleNext} nextDisabled={!wizard.isComplete || !asiComplete} />
    </div>
  )
}

type WizardHook = ReturnType<typeof useWizardAbilities>

function StandardArrayPanel({
  wizard,
  suggested,
  firstSuggestedName,
}: {
  wizard: WizardHook
  suggested: AbilityId[]
  firstSuggestedName: AbilityId | undefined
}) {
  const { t } = useTranslation()
  const classId = useSheetStore(s => s.sheet.identity.class_id)
  const charClass = gameData.classes.find(c => c.id === classId)

  return (
    <div className="space-y-3">
      {charClass && suggested.length > 0 && (
        <p className="text-xs text-[#A8A09B]">
          {t('step06.suggestion', { charClass: charClass.name, attrs: suggested.join(' → ') })}
        </p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ABILITIES.map(attr => (
          <div key={attr} className="flex flex-col gap-1">
            <label
              htmlFor={`standard-${attr}`}
              className={`text-sm font-semibold ${firstSuggestedName === attr ? 'text-[#D4A017]' : 'text-[#B8860B]'}`}
            >
              {abilityName(attr, t)}{firstSuggestedName === attr && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#D4A017" className="inline ml-1 mb-0.5"><path d="M12 2l2.2 5.6L20 8.2l-4.4 3.9L17 18l-5-3.2L7 18l1.4-5.9L4 8.2l5.8-.6z"/></svg>
          )}
            </label>
            <select
              id={`standard-${attr}`}
              value={wizard.standard[attr] ?? ''}
              onChange={e => wizard.setStandardAttr(attr, e.target.value ? Number(e.target.value) : null)}
              className="bg-[#2D2520] border border-[#B8860B]/30 rounded px-2 py-1.5 text-[#F5F0E8] text-sm focus:outline-none focus:ring-1 focus:ring-[#B8860B]"
            >
              <option value="">—</option>
              {wizard.standardArray.map(v => (
                <option
                  key={v}
                  value={v}
                  disabled={!wizard.isValueAvailableInStandardArray(v, attr)}
                >
                  {v} {!wizard.isValueAvailableInStandardArray(v, attr) ? t('step06.used') : ''}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}

function RandomPanel({ wizard }: { wizard: WizardHook }) {
  const { t } = useTranslation()
  return (
    <div className="space-y-4">
      <button
        onClick={wizard.rollRandom}
        className="px-6 py-3 bg-[#7B1D1D] hover:bg-[#9B2C2C] border border-[#B8860B]/30 rounded-lg text-[#F5F0E8] font-cinzel font-semibold text-lg transition-colors cursor-pointer"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none"/><circle cx="16" cy="8" r="1.5" fill="currentColor" stroke="none"/><circle cx="8" cy="16" r="1.5" fill="currentColor" stroke="none"/><circle cx="16" cy="16" r="1.5" fill="currentColor" stroke="none"/></svg>
        {t('step06.tabRandom')} (4d6 drop lowest)
      </button>

      {wizard.rollValues.length > 0 && (
        <div className="space-y-3">
          {/* Dados rolados — mostra quais já foram atribuídos */}
          <div className="flex flex-wrap gap-2">
            {wizard.rollValues.map((v, i) => {
              const assignedTo = ABILITIES.find(a => wizard.randomIndices[a] === i)
              return (
                <span
                  key={i}
                  className={`w-12 h-12 flex flex-col items-center justify-center rounded-lg font-cinzel font-bold text-xl border transition-colors
                    ${assignedTo
                      ? 'bg-[#B8860B]/20 border-[#B8860B] text-[#D4A017]'
                      : 'bg-[#3D332D] border-[#B8860B]/30 text-[#F5F0E8]'}`}
                >
                  {v}
                  {assignedTo && <span className="text-[8px] font-sans font-semibold leading-none">{assignedTo}</span>}
                </span>
              )
            })}
          </div>

          {/* Seleção por atributo */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {ABILITIES.map(attr => {
              const currentIdx = wizard.randomIndices[attr]
              return (
                <div key={attr} className="flex flex-col gap-1">
                  <label htmlFor={`random-${attr}`} className="text-sm font-semibold text-[#B8860B]">
                    {abilityName(attr, t)}
                  </label>
                  <div className="flex gap-1">
                    <select
                      id={`random-${attr}`}
                      value={currentIdx ?? ''}
                      onChange={e => wizard.setRandomAttr(attr, e.target.value === '' ? null : Number(e.target.value))}
                      className={`flex-1 bg-[#2D2520] border rounded px-2 py-1.5 text-[#F5F0E8] text-sm focus:outline-none focus:ring-1 focus:ring-[#B8860B]
                        ${currentIdx !== null ? 'border-[#B8860B]' : 'border-[#B8860B]/30'}`}
                    >
                      <option value="">{t('step06.choosePlaceholder')}</option>
                      {wizard.rollValues.map((v, j) => {
                        const emUso = !wizard.isDieAvailable(j, attr)
                        return (
                          <option key={j} value={j} disabled={emUso}>
                            {v}{emUso ? ` ${t('step06.inUse')}` : ''}
                          </option>
                        )
                      })}
                    </select>
                    {currentIdx !== null && (
                      <button
                        type="button"
                        onClick={() => wizard.setRandomAttr(attr, null)}
                        title={t('step06.removeDie')}
                        className="w-7 h-[34px] flex items-center justify-center rounded bg-[#2D2520] border border-[#B8860B]/30 text-[#A8A09B] hover:text-[#F5F0E8] hover:border-[#B8860B]/60 cursor-pointer text-sm"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Progresso */}
          <p className="text-xs text-right">
            <span className={ABILITIES.every(a => wizard.randomIndices[a] !== null) ? 'text-green-400' : 'text-[#A8A09B]'}>
              {t('step06.assigned', { n: ABILITIES.filter(a => wizard.randomIndices[a] !== null).length })}
            </span>
          </p>
        </div>
      )}
    </div>
  )
}

function PointBuyPanel({ wizard }: { wizard: WizardHook }) {
  const { t } = useTranslation()
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-[#A8A09B] text-sm">{t('step06.poolRemaining')}</span>
        <span
          className={`font-cinzel font-bold text-xl ${
            wizard.remainingPool === 0 ? 'text-green-400' : wizard.remainingPool < 0 ? 'text-red-400' : 'text-[#F5F0E8]'
          }`}
        >
          {wizard.remainingPool}
        </span>
        <span className="text-[#A8A09B] text-xs">{t('step06.of27')}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ABILITIES.map(attr => (
          <div key={attr} className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-[#B8860B]">{abilityName(attr, t)}</label>
              <span className="text-xs text-[#A8A09B]">c:{POINT_BUY_COSTS[wizard.pointBuy[attr]] ?? 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => wizard.setPointBuyAttr(attr, wizard.pointBuy[attr] - 1)}
                disabled={wizard.pointBuy[attr] <= 8}
                className="w-7 h-7 rounded bg-[#3D332D] border border-[#B8860B]/20 text-[#F5F0E8] font-bold hover:bg-[#4D4037] disabled:opacity-30 cursor-pointer disabled:cursor-default"
              >
                −
              </button>
              <span className="flex-1 text-center font-cinzel font-bold text-lg text-[#F5F0E8]">
                {wizard.pointBuy[attr]}
              </span>
              <button
                onClick={() => wizard.setPointBuyAttr(attr, wizard.pointBuy[attr] + 1)}
                disabled={wizard.pointBuy[attr] >= 15 || wizard.remainingPool <= 0}
                className="w-7 h-7 rounded bg-[#3D332D] border border-[#B8860B]/20 text-[#F5F0E8] font-bold hover:bg-[#4D4037] disabled:opacity-30 cursor-pointer disabled:cursor-default"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface PainelASIProps {
  numASIs: number
  totalPool: number
  totalUsado: number
  baseAbilities: Record<AbilityId, number | null>
  asiDistribution: Partial<Record<AbilityId, number>>
  onSetBonus: (attr: AbilityId, val: number) => void
}

function AsiPanel({ numASIs, totalPool, totalUsado, baseAbilities, asiDistribution, onSetBonus }: PainelASIProps) {
  const { t } = useTranslation()
  return (
    <div className="bg-[#3D332D] border border-[#B8860B]/30 rounded-lg p-4 space-y-4">
      <div>
        <h3 className="font-cinzel font-semibold text-[#B8860B]">
          {numASIs > 1 ? t('step06.avaHeadingMultiple', { n: numASIs }) : t('step06.avaHeading')}
        </h3>
        <p className="text-xs text-[#A8A09B] mt-1">
          {t('step06.avaHint', { n: numASIs, s: numASIs > 1 ? 's' : '', pts: totalPool })}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ABILITIES.map(attr => {
          const base = baseAbilities[attr] ?? 0
          const bonus = asiDistribution[attr] ?? 0
          const final = Math.min(20, base + bonus)
          const noTeto = base >= 20
          const canIncrement = !noTeto && final < 20 && totalUsado < totalPool
          const podeDecrementar = bonus > 0

          return (
            <div key={attr} className="flex flex-col items-center gap-1 p-2 rounded border border-[#2D2520]">
              <span className="text-xs font-bold text-[#B8860B]">{attr}</span>
              <span className="text-[10px] text-[#A8A09B]">
                {base}
                {bonus > 0 && <span className="text-green-400"> +{bonus} = {final}</span>}
                {noTeto && <span className="text-[#B8860B]"> {t('step06.maxLabel')}</span>}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onSetBonus(attr, Math.max(0, bonus - 1))}
                  disabled={!podeDecrementar}
                  className="w-6 h-6 rounded bg-[#2D2520] border border-[#B8860B]/20 text-[#F5F0E8] text-xs hover:bg-[#4D4037] disabled:opacity-30 cursor-pointer disabled:cursor-default"
                >
                  −
                </button>
                <span className={`w-8 text-center font-bold text-lg ${bonus > 0 ? 'text-green-400' : 'text-[#A8A09B]'}`}>
                  {bonus > 0 ? `+${bonus}` : '0'}
                </span>
                <button
                  onClick={() => onSetBonus(attr, bonus + 1)}
                  disabled={!canIncrement}
                  className="w-6 h-6 rounded bg-[#2D2520] border border-[#B8860B]/20 text-[#F5F0E8] text-xs hover:bg-[#4D4037] disabled:opacity-30 cursor-pointer disabled:cursor-default"
                >
                  +
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-xs text-right">
        <span className={totalUsado === totalPool ? 'text-green-400' : 'text-[#A8A09B]'}>
          {t('step06.avaDistributed', { current: totalUsado, total: totalPool })}
        </span>
      </p>
    </div>
  )
}

function ResumoAtributos({
  currentAbilities,
  firstSuggestedName,
}: {
  currentAbilities: Record<AbilityId, number | null>
  firstSuggestedName: AbilityId | undefined
}) {
  const { t } = useTranslation()
  return (
    <div className="bg-[#3D332D] border border-[#B8860B]/30 rounded-lg p-4">
      <h3 className="font-cinzel font-semibold text-[#B8860B] mb-3">{t('step06.attrSummary')}</h3>
      <div className="grid grid-cols-3 gap-2">
        {ABILITIES.map(attr => {
          const val = currentAbilities[attr]
          const mod = val !== null ? calcModifier(val) : null
          const isPrimary = firstSuggestedName === attr

          return (
            <div
              key={attr}
              className={`flex flex-col items-center p-2 rounded border ${
                isPrimary ? 'border-[#D4A017]/50 bg-[#B8860B]/10' : 'border-[#2D2520]'
              }`}
              aria-live="polite"
            >
              <span className="text-xs text-[#A8A09B]">{attr}</span>
              <span className="font-cinzel font-bold text-2xl text-[#F5F0E8]">{val ?? '—'}</span>
              <span
                className={`text-sm font-semibold ${
                  !mod ? 'text-[#A8A09B]' : mod > 0 ? 'text-green-400' : mod < 0 ? 'text-red-400' : 'text-[#A8A09B]'
                }`}
              >
                {mod !== null ? formatModifier(mod) : ''}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
