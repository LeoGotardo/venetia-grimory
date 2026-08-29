import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSheetStore } from '../../store/sheetStore'
import { WizardNav } from './WizardNav'
import { calcModifier, formatModifier, ABILITIES, abilityName } from '../../lib/calculations'
import { useWizardAbilities } from '../../hooks/useWizardAbilities'
import { POINT_BUY_COSTS } from '../../constants'
import type { AbilityId, CharClass } from '../../types'
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
  const charClass = gameData.classes.find(c => c.id === classId)
  // Atributos primários da classe: é neles que o jogador deve concentrar os
  // valores mais altos, então são destacados em todos os métodos de escolha.
  const primary: AbilityId[] = charClass?.primary_abilities ?? []

  const numASIs = useMemo(() => {
    if (!charClass) return 0
    return charClass.progression
      .filter(p => p.level <= level)
      .reduce((acc, p) => acc + p.highlights.filter(
        d => d === 'AVA' || d === 'Aumento no Valor de Atributo'
      ).length, 0)
  }, [charClass, level])

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

      {charClass && <PrimaryAbilitiesBanner charClass={charClass} primary={primary} />}

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
        <StandardArrayPanel wizard={wizard} primary={primary} />
      )}

      {wizard.method === 'random' && (
        <RandomPanel wizard={wizard} primary={primary} />
      )}

      {wizard.method === 'pointBuy' && (
        <PointBuyPanel wizard={wizard} primary={primary} />
      )}

      {numASIs > 0 && wizard.isComplete && (
        <AsiPanel
          numASIs={numASIs}
          totalPool={totalAsiPool}
          totalUsado={totalAsiUsed}
          baseAbilities={wizard.currentAbilities}
          asiDistribution={asiDistribution}
          onSetBonus={setAsiBonus}
          primary={primary}
        />
      )}

      <ResumoAtributos currentAbilities={abilitiesWithAsi} primary={primary} />

      <WizardNav onBack={() => setStep(4)} onNext={handleNext} nextDisabled={!wizard.isComplete || !asiComplete} />
    </div>
  )
}

type WizardHook = ReturnType<typeof useWizardAbilities>

/** Estrela que marca um atributo primário da classe. */
function PrimaryStar() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="#D4A017" className="inline ml-1 mb-0.5" aria-hidden="true">
      <path d="M12 2l2.2 5.6L20 8.2l-4.4 3.9L17 18l-5-3.2L7 18l1.4-5.9L4 8.2l5.8-.6z" />
    </svg>
  )
}

/** Rótulo de atributo com o destaque de primário aplicado. */
function AbilityLabel({ attr, primary, htmlFor }: { attr: AbilityId; primary: AbilityId[]; htmlFor?: string }) {
  const { t } = useTranslation()
  const isPrimary = primary.includes(attr)
  return (
    <label
      htmlFor={htmlFor}
      title={isPrimary ? t('step06.primaryTitle') : undefined}
      className={`text-sm font-semibold ${isPrimary ? 'text-[#D4A017]' : 'text-[#B8860B]'}`}
    >
      {abilityName(attr, t)}
      {isPrimary && <PrimaryStar />}
    </label>
  )
}

/**
 * Banner do topo: diz de cara em quais atributos a classe escolhida se apoia,
 * para o jogador distribuir os valores mais altos sem consultar a classe.
 */
function PrimaryAbilitiesBanner({ charClass, primary }: { charClass: CharClass; primary: AbilityId[] }) {
  const { t } = useTranslation()
  if (primary.length === 0) return null

  return (
    <div className="bg-[#B8860B]/10 border border-[#B8860B]/40 rounded-lg p-4 space-y-3">
      <div className="flex items-baseline gap-2 flex-wrap">
        <PrimaryStar />
        <h3 className="font-cinzel font-semibold text-[#D4A017]">
          {t('step06.primaryHeading', { charClass: charClass.name })}
        </h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {primary.map((attr, i) => (
          <span
            key={attr}
            className="inline-flex items-baseline gap-1.5 px-2.5 py-1 rounded border border-[#B8860B]/50 bg-[#2D2520] text-sm"
          >
            <span className="font-cinzel font-bold text-[#D4A017]">{attr}</span>
            <span className="text-[#F5F0E8]">{abilityName(attr, t)}</span>
            {i === 0 && primary.length > 1 && (
              <span className="text-[10px] text-[#A8A09B]">{t('step06.primaryHighest')}</span>
            )}
          </span>
        ))}
      </div>

      <p className="text-xs text-[#A8A09B]">
        {t('step06.primaryHint', { charClass: charClass.name, saves: charClass.saves.join(', ') })}
      </p>
    </div>
  )
}

function StandardArrayPanel({ wizard, primary }: { wizard: WizardHook; primary: AbilityId[] }) {
  const { t } = useTranslation()
  const classId = useSheetStore(s => s.sheet.identity.class_id)
  const charClass = gameData.classes.find(c => c.id === classId)

  return (
    <div className="space-y-3">
      {charClass && primary.length > 0 && (
        <p className="text-xs text-[#A8A09B]">
          {t('step06.suggestion', { charClass: charClass.name, attrs: primary.join(' → ') })}
        </p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ABILITIES.map(attr => (
          <div key={attr} className="flex flex-col gap-1">
            <AbilityLabel attr={attr} primary={primary} htmlFor={`standard-${attr}`} />
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

function RandomPanel({ wizard, primary }: { wizard: WizardHook; primary: AbilityId[] }) {
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
                  <AbilityLabel attr={attr} primary={primary} htmlFor={`random-${attr}`} />
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

function PointBuyPanel({ wizard, primary }: { wizard: WizardHook; primary: AbilityId[] }) {
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
              <AbilityLabel attr={attr} primary={primary} />
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
  primary: AbilityId[]
}

function AsiPanel({ numASIs, totalPool, totalUsado, baseAbilities, asiDistribution, onSetBonus, primary }: PainelASIProps) {
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
            <div
              key={attr}
              className={`flex flex-col items-center gap-1 p-2 rounded border ${
                primary.includes(attr) ? 'border-[#D4A017]/50 bg-[#B8860B]/10' : 'border-[#2D2520]'
              }`}
            >
              <span className={`text-xs font-bold ${primary.includes(attr) ? 'text-[#D4A017]' : 'text-[#B8860B]'}`}>
                {attr}{primary.includes(attr) && <PrimaryStar />}
              </span>
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
  primary,
}: {
  currentAbilities: Record<AbilityId, number | null>
  primary: AbilityId[]
}) {
  const { t } = useTranslation()
  return (
    <div className="bg-[#3D332D] border border-[#B8860B]/30 rounded-lg p-4">
      <h3 className="font-cinzel font-semibold text-[#B8860B] mb-3">{t('step06.attrSummary')}</h3>
      <div className="grid grid-cols-3 gap-2">
        {ABILITIES.map(attr => {
          const val = currentAbilities[attr]
          const mod = val !== null ? calcModifier(val) : null
          const isPrimary = primary.includes(attr)

          return (
            <div
              key={attr}
              className={`flex flex-col items-center p-2 rounded border ${
                isPrimary ? 'border-[#D4A017]/50 bg-[#B8860B]/10' : 'border-[#2D2520]'
              }`}
              aria-live="polite"
            >
              <span className={`text-xs ${isPrimary ? 'text-[#D4A017]' : 'text-[#A8A09B]'}`}>
                {attr}{isPrimary && <PrimaryStar />}
              </span>
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
