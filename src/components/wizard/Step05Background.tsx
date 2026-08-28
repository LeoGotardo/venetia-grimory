import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSheetStore } from '../../store/sheetStore'
import { WizardNav } from './WizardNav'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { BACKGROUND_ABILITY_POINTS_TOTAL } from '../../constants'
import type { AbilityId } from '../../types'
import { getBackgrounds } from '../../data/backgrounds'
import { gameData } from '../../data/rules'

type DistributionMode = '2+1' | '1+1+1'

export function Step05Background() {
  const { sheet, setBackgroundId, setBackground, setStep } = useSheetStore()
  const { t } = useTranslation()
  const backgroundId = sheet.identity.background_id

  const [distribution, setDistribution] = useState<Partial<Record<AbilityId, number>>>({})
  const [distributionMode, setDistributionMode] = useState<DistributionMode>('2+1')

  const background = getBackgrounds().find(a => a.id === backgroundId)
  const totalDistributed = Object.values(distribution).reduce((acc, b) => acc + b, 0)
  const distributionOk = totalDistributed === BACKGROUND_ABILITY_POINTS_TOTAL
  const distributionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!backgroundId) return
    const timer = setTimeout(() => {
      distributionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 150)
    return () => clearTimeout(timer)
  }, [backgroundId])

  function autoDistributeOneEach(suggested: AbilityId[]) {
    const auto: Partial<Record<AbilityId, number>> = {}
    suggested.slice(0, BACKGROUND_ABILITY_POINTS_TOTAL).forEach(attr => { auto[attr] = 1 })
    setDistribution(auto)
  }

  function selectBackground(id: string) {
    const newBackground = getBackgrounds().find(a => a.id === id)
    if (distributionMode === '1+1+1' && newBackground && newBackground.suggested_abilities.length >= BACKGROUND_ABILITY_POINTS_TOTAL) {
      autoDistributeOneEach(newBackground.suggested_abilities)
    } else {
      setDistribution({})
    }
    setBackgroundId(id)
  }

  function setBonus(attr: AbilityId, val: number) {
    setDistribution(prev => {
      const next = { ...prev, [attr]: val }
      if (val === 0) delete next[attr]
      return next
    })
  }

  function switchMode(mode: DistributionMode) {
    setDistributionMode(mode)
    if (mode === '1+1+1' && background && background.suggested_abilities.length >= BACKGROUND_ABILITY_POINTS_TOTAL) {
      autoDistributeOneEach(background.suggested_abilities)
    } else {
      setDistribution({})
    }
  }

  function handleConfirm() {
    if (!backgroundId || !distributionOk) return
    setBackground(backgroundId, distribution)
    setStep(7)
  }

  const rolledAbilities = (['FOR','DES','CON','INT','SAB','CAR'] as AbilityId[])
    .map(a => ({ attr: a, value: sheet.abilities[a].value }))
    .filter(x => x.value !== null) as { attr: AbilityId; value: number }[]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cinzel text-2xl font-bold text-[#F5F0E8] mb-1">{t('step05.heading')}</h2>
        <p className="text-[#A8A09B] text-sm">{t('step05.subtitle')}</p>
      </div>

      {/* Atributos definidos no passo anterior */}
      {rolledAbilities.length > 0 && (
        <div className="bg-[#2D2520] border border-[#B8860B]/20 rounded-lg px-4 py-3">
          <p className="text-xs font-semibold text-[#B8860B] mb-2">{t('step05.yourAttrs')}</p>
          <div className="flex flex-wrap gap-2">
            {rolledAbilities.map(({ attr, value }) => (
              <div key={attr} className="flex flex-col items-center min-w-[44px] bg-[#3D332D] border border-[#B8860B]/20 rounded-lg px-2 py-1.5">
                <span className="text-[10px] text-[#A8A09B] font-semibold">{attr}</span>
                <span className="font-cinzel font-bold text-lg text-[#F5F0E8] leading-none">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {getBackgrounds().map(a => (
          <Card
            key={a.id}
            selected={backgroundId === a.id}
            hoverable
            onClick={() => selectBackground(a.id)}
          >
            <h3 className="font-cinzel font-bold text-[#F5F0E8] mb-1">{a.name}</h3>
            {a.description && (
              <p className="text-[#A8A09B] text-xs leading-relaxed mb-2">{a.description}</p>
            )}
            <div className="flex flex-wrap gap-1 mb-2">
              {a.skills.map(p => (
                <Badge key={p} variant="blue">
                  {gameData.skills.find(x => x.id === p)?.name ?? p}
                </Badge>
              ))}
            </div>
            {a.tool && (
              <p className="flex items-center gap-1 text-xs text-[#A8A09B]">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                {a.tool}
              </p>
            )}
            <p className="flex items-center gap-1 text-xs text-[#B8860B] mt-1">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0"><path d="M12 2l2.4 7.6H22l-6.2 4.5 2.4 7.6L12 17.2l-6.2 4.5 2.4-7.6L2 9.6h7.6z"/></svg>
              {a.feat}
            </p>
          </Card>
        ))}
      </div>

      {background && (
        <div ref={distributionRef}>
          <AbilityDistribution
            background={background}
            distribution={distribution}
            distributionMode={distributionMode}
            totalDistributed={totalDistributed}
            baseAbilities={sheet.abilities}
            onSetBonus={setBonus}
            onSwitchMode={switchMode}
          />
        </div>
      )}

      <WizardNav
        onBack={() => setStep(5)}
        onNext={handleConfirm}
        nextDisabled={!backgroundId || !distributionOk}
      />
    </div>
  )
}

interface AbilityDistributionProps {
  background: { name: string; suggested_abilities: AbilityId[] }
  distribution: Partial<Record<AbilityId, number>>
  distributionMode: DistributionMode
  totalDistributed: number
  baseAbilities: Record<AbilityId, { value: number | null }>
  onSetBonus: (attr: AbilityId, val: number) => void
  onSwitchMode: (mode: DistributionMode) => void
}

function AbilityDistribution({
  background,
  distribution,
  distributionMode,
  totalDistributed,
  baseAbilities,
  onSetBonus,
  onSwitchMode,
}: AbilityDistributionProps) {
  const { t } = useTranslation()
  const maxPerAbility = distributionMode === '2+1' ? 2 : 1

  return (
    <div className="bg-[#3D332D] border border-[#B8860B]/30 rounded-lg p-4 space-y-4">
      <h3 className="font-cinzel font-semibold text-[#B8860B]">{t('step05.bonusHeading', { background: background.name })}</h3>
      <p className="text-[#A8A09B] text-xs">
        {t('step05.distributeHint', { n: BACKGROUND_ABILITY_POINTS_TOTAL })}
      </p>

      <div className="flex gap-3">
        {(['2+1', '1+1+1'] as DistributionMode[]).map(mode => (
          <button
            key={mode}
            onClick={() => onSwitchMode(mode)}
            className={`px-3 py-1 rounded text-sm border cursor-pointer transition-colors
              ${distributionMode === mode
                ? 'bg-[#7B1D1D] border-[#7B1D1D] text-white'
                : 'border-[#B8860B]/30 text-[#A8A09B] hover:bg-[#4D4037]'}`}
          >
            +{mode}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {background.suggested_abilities.map(attr => {
          const val = distribution[attr] ?? 0
          const baseRef = baseAbilities[attr]?.value ?? null
          return (
            <BonusAtributoControl
              key={attr}
              attr={attr}
              val={val}
              maxVal={maxPerAbility}
              totalDistributed={totalDistributed}
              baseRef={baseRef}
              onSetBonus={onSetBonus}
            />
          )
        })}
      </div>

      <p className="text-xs text-right">
        <span className={totalDistributed === BACKGROUND_ABILITY_POINTS_TOTAL ? 'text-green-400' : 'text-[#A8A09B]'}>
          {t('step05.distributed', { current: totalDistributed, total: BACKGROUND_ABILITY_POINTS_TOTAL })}
        </span>
      </p>
    </div>
  )
}

interface BonusAtributoControlProps {
  attr: AbilityId
  val: number
  maxVal: number
  totalDistributed: number
  baseRef: number | null
  onSetBonus: (attr: AbilityId, val: number) => void
}

function BonusAtributoControl({ attr, val, maxVal, totalDistributed, baseRef, onSetBonus }: BonusAtributoControlProps) {
  const { t } = useTranslation()
  const podeDecrementar = val > 0
  const canIncrement = val < maxVal && totalDistributed < BACKGROUND_ABILITY_POINTS_TOTAL

  return (
    <div data-testid={`bonus-${attr}`} className="flex flex-col items-center gap-1">
      <span className="text-[#B8860B] text-xs font-bold">{attr}</span>
      {baseRef !== null && (
        <span className="text-[10px] text-[#A8A09B]">
          {t('step05.base', { n: baseRef })}{val > 0 && <span className="text-green-400"> →{baseRef + val}</span>}
        </span>
      )}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onSetBonus(attr, Math.max(0, val - 1))}
          disabled={!podeDecrementar}
          className="w-6 h-6 rounded bg-[#2D2520] border border-[#B8860B]/20 text-[#F5F0E8] text-xs hover:bg-[#3D332D] disabled:opacity-30 cursor-pointer disabled:cursor-default"
        >
          −
        </button>
        <span className={`w-8 text-center font-bold text-lg ${val > 0 ? 'text-green-400' : 'text-[#A8A09B]'}`}>
          {val > 0 ? `+${val}` : '0'}
        </span>
        <button
          onClick={() => onSetBonus(attr, Math.min(maxVal, val + 1))}
          disabled={!canIncrement}
          className="w-6 h-6 rounded bg-[#2D2520] border border-[#B8860B]/20 text-[#F5F0E8] text-xs hover:bg-[#3D332D] disabled:opacity-30 cursor-pointer disabled:cursor-default"
        >
          +
        </button>
      </div>
    </div>
  )
}
