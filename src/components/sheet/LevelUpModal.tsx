import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '../ui/Modal'
import { useSheetStore } from '../../store/sheetStore'
import { calcTotalHp, calcProfBonus, calcModifier, ABILITIES, abilityName } from '../../lib/calculations'
import type { AbilityId } from '../../types'
import { gameData } from '../../data/rules'

type AsiMode = '+2' | '+1+1'
type RefundMode = 'asi' | 'talento'

interface LevelUpModalProps {
  open: boolean
  onClose: () => void
  newLevel: number
}

export function LevelUpModal({ open, onClose, newLevel }: LevelUpModalProps) {
  const { sheet, levelUp } = useSheetStore()
  const { t } = useTranslation()
  const [refundMode, setRefundMode] = useState<RefundMode>('asi')
  const [asiMode, setAsiMode] = useState<AsiMode>('+2')
  const [asiFirst, setAsiFirst] = useState<AbilityId | null>(null)
  const [asiSecond, setAsiSecond] = useState<AbilityId | null>(null)
  const [selectedFeat, setSelectedFeat] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([])

  const multiclasses = sheet.identity.multiclasses ?? []
  const classId = sheet.identity.class_id

  // Nível na classe primária atual
  const primaryLevel = newLevel - multiclasses.reduce((s, m) => s + m.level, 0)

  // Opções de classe para level-up: primária + secundárias
  const classOptions = [
    { id: classId ?? '', label: gameData.classes.find(c => c.id === classId)?.name ?? classId ?? '', currentLevel: primaryLevel - 1, isPrimary: true },
    ...multiclasses.map(m => ({
      id: m.class_id,
      label: gameData.classes.find(c => c.id === m.class_id)?.name ?? m.class_id,
      currentLevel: m.level,
      isPrimary: false,
    })),
  ].filter(o => o.id)

  const [targetClass, setTargetClass] = useState<string>(classId ?? '')

  const targetClassObj = gameData.classes.find(c => c.id === targetClass)
  const levelInTargetClass = targetClass === classId
    ? primaryLevel
    : (multiclasses.find(m => m.class_id === targetClass)?.level ?? 0) + 1

  const progEntry = targetClassObj?.progression.find(
    (p: { level: number }) => p.level === levelInTargetClass
  ) as (Record<string, unknown> & { level: number; highlights?: string[]; slots?: Record<string, number>; prepared_spells?: number; cantrips?: number }) | undefined

  const hasAsi = progEntry?.highlights?.includes('AVA') ?? false
  const hasExpertise = progEntry?.highlights?.some(d => d === 'Especialista' || d === 'Especialização') ?? false
  const modalExpertiseCount = 2
  const isCaster = sheet.spellcasting.spellcaster

  const conMod = calcModifier(sheet.abilities.CON.value ?? 10)
  const newHp = targetClassObj ? calcTotalHp(newLevel, targetClassObj.hit_die, conMod) : null
  const newProf = calcProfBonus(newLevel)
  const highlights = (progEntry?.highlights ?? []).filter(d => d !== 'AVA')

  const newSlots = useMemo(() => {
    if (!isCaster || !progEntry?.slots) return null
    return progEntry.slots as Record<string, number>
  }, [isCaster, progEntry])

  // Perícias proficientes sem expertise ainda
  const proficientSkills = useMemo(() =>
    Object.entries(sheet.skills)
      .filter(([, p]) => p.proficient && !p.expertise)
      .map(([id]) => id),
  [sheet.skills])

  const filteredFeats = useMemo(() => {
    const all = gameData.general_feats ?? []
    if (!search.trim()) return all
    const q = search.toLowerCase()
    return all.filter(t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
  }, [search])

  function calcAsi(): Partial<Record<AbilityId, number>> | undefined {
    if (!hasAsi) return undefined
    if (asiMode === '+2' && asiFirst) return { [asiFirst]: 2 } as Partial<Record<AbilityId, number>>
    if (asiMode === '+1+1' && asiFirst && asiSecond && asiFirst !== asiSecond) {
      return { [asiFirst]: 1, [asiSecond]: 1 } as Partial<Record<AbilityId, number>>
    }
    return undefined
  }

  function canFinish() {
    if (hasExpertise && selectedExpertise.length < modalExpertiseCount) return false
    if (!hasAsi) return true
    if (refundMode === 'talento') return selectedFeat !== null
    if (asiMode === '+2') return asiFirst !== null
    return asiFirst !== null && asiSecond !== null && asiFirst !== asiSecond
  }

  function confirm() {
    const targetClassArg = targetClass !== classId ? targetClass : undefined
    const speciesArg = hasExpertise ? selectedExpertise : undefined
    if (hasAsi && refundMode === 'talento') {
      levelUp(newLevel, undefined, targetClassArg, selectedFeat ?? undefined, speciesArg)
    } else {
      levelUp(newLevel, calcAsi(), targetClassArg, undefined, speciesArg)
    }
    onClose()
  }

  function toggleExpertise(skillId: string) {
    if (selectedExpertise.includes(skillId)) {
      setSelectedExpertise(selectedExpertise.filter(p => p !== skillId))
    } else if (selectedExpertise.length < modalExpertiseCount) {
      setSelectedExpertise([...selectedExpertise, skillId])
    }
  }

  function abilityValue(attr: AbilityId) {
    return sheet.abilities[attr].value ?? 10
  }

  function canSelect(attr: AbilityId, slot: 1 | 2) {
    const val = abilityValue(attr)
    if (val >= 20) return false
    if (asiMode === '+2' && val + 2 > 20) return false
    if (asiMode === '+1+1') {
      if (slot === 2 && attr === asiFirst) return false
      if (slot === 1 && attr === asiSecond) return false
    }
    return true
  }

  const AbilityBtn = ({ attr, slot }: { attr: AbilityId; slot: 1 | 2 }) => {
    const selected = slot === 1 ? asiFirst === attr : asiSecond === attr
    const locked = !canSelect(attr, slot)
    const val = abilityValue(attr)
    const bonus = asiMode === '+2' ? 2 : 1
    return (
      <button
        type="button"
        disabled={locked && !selected}
        onClick={() => {
          if (slot === 1) setAsiFirst(selected ? null : attr)
          else setAsiSecond(selected ? null : attr)
        }}
        className={[
          'flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]',
          selected
            ? 'border-[#B8860B] bg-[#B8860B]/15 text-[#F5F0E8]'
            : locked
            ? 'border-[#B8860B]/10 bg-[#2D2520] text-[#A8A09B]/40 cursor-not-allowed'
            : 'border-[#B8860B]/20 bg-[#2D2520] text-[#A8A09B] hover:border-[#B8860B]/50 hover:text-[#F5F0E8]',
        ].join(' ')}
      >
        <span className="font-medium">{abilityName(attr, t)}</span>
        <span className="tabular-nums text-xs">
          {val}
          {selected && <span className="text-[#B8860B] font-bold"> +{bonus} → {Math.min(20, val + bonus)}</span>}
          {val >= 20 && <span className="text-[#A8A09B]/50"> {t('levelup.maxLabel')}</span>}
        </span>
      </button>
    )
  }

  return (
    <Modal open={open} onClose={onClose} title={t('levelup.title', { n: newLevel })}>
      <div className="space-y-5">

        {/* Seletor de classe — só quando há multiclasse */}
        {classOptions.length > 1 && (
          <div>
            <p className="text-xs font-semibold text-[#B8860B] uppercase tracking-wide mb-2">
              {t('multiclass.chooseClassLevel')}
            </p>
            <div className="flex flex-wrap gap-2">
              {classOptions.map(op => (
                <button
                  key={op.id}
                  type="button"
                  onClick={() => setTargetClass(op.id)}
                  className={[
                    'px-3 py-1.5 rounded-lg border text-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]',
                    targetClass === op.id
                      ? 'border-[#B8860B] bg-[#B8860B]/15 text-[#F5F0E8]'
                      : 'border-[#B8860B]/20 bg-[#2D2520] text-[#A8A09B] hover:border-[#B8860B]/50 hover:text-[#F5F0E8]',
                  ].join(' ')}
                >
                  {op.label} <span className="opacity-60 text-xs">Nv {op.currentLevel + 1}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Resumo */}
        <div className="grid grid-cols-2 gap-3">
          {newHp !== null && (
            <div className="bg-[#2D2520] rounded-lg p-3 text-center">
              <p className="text-xs text-[#A8A09B] mb-1">{t('levelup.hp')}</p>
              <p className="text-2xl font-cinzel font-bold text-green-400">{newHp}</p>
              <p className="text-xs text-[#A8A09B] mt-0.5">{targetClassObj?.hit_die && `d${targetClassObj.hit_die} + CON`}</p>
            </div>
          )}
          <div className="bg-[#2D2520] rounded-lg p-3 text-center">
            <p className="text-xs text-[#A8A09B] mb-1">{t('levelup.profBonus')}</p>
            <p className="text-2xl font-cinzel font-bold text-[#B8860B]">+{newProf}</p>
          </div>
        </div>

        {/* Destaques do nível */}
        {highlights.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-[#B8860B] uppercase tracking-wide mb-2">{t('levelup.newHighlights')}</p>
            <div className="flex flex-wrap gap-1.5">
              {highlights.map(d => (
                <span key={d} className="px-2 py-1 bg-[#2D2520] border border-[#B8860B]/20 rounded text-xs text-[#F5F0E8]">
                  {d}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Novos slots de magia */}
        {newSlots && (
          <div>
            <p className="text-xs font-semibold text-[#B8860B] uppercase tracking-wide mb-2">{t('levelup.spellSlots')}</p>
            <div className="grid grid-cols-5 sm:grid-cols-9 gap-1">
              {(['c1','c2','c3','c4','c5','c6','c7','c8','c9'] as const).map((c, i) => {
                const qty = newSlots[c] ?? 0
                return (
                  <div key={c} className={`text-center rounded p-1.5 ${qty > 0 ? 'bg-[#2D2520] border border-[#B8860B]/20' : 'opacity-30'}`}>
                    <p className="text-[9px] text-[#A8A09B]">{t('magic.level_n', { n: i + 1 })}</p>
                    <p className={`text-sm font-bold ${qty > 0 ? 'text-[#F5F0E8]' : 'text-[#A8A09B]'}`}>{qty}</p>
                  </div>
                )
              })}
            </div>
            {progEntry?.prepared_spells !== undefined && (
              <p className="text-xs text-[#A8A09B] mt-2">
                {t('levelup.preparedSpells', { n: progEntry.prepared_spells })}
              </p>
            )}
          </div>
        )}

        {/* AVA / Talento */}
        {hasAsi && (
          <div>
            <p className="text-xs font-semibold text-[#B8860B] uppercase tracking-wide mb-2">
              {t('levelup.chooseReward')}
            </p>

            {/* Toggle ASI vs Talento */}
            <div className="flex rounded overflow-hidden border border-[#B8860B]/20 mb-4 w-fit">
              {(['asi', 'talento'] as RefundMode[]).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setRefundMode(m); setAsiFirst(null); setAsiSecond(null); setSelectedFeat(null); setSearch('') }}
                  className={[
                    'px-4 py-1.5 text-xs font-medium transition-colors cursor-pointer focus-visible:outline-none',
                    refundMode === m ? 'bg-[#B8860B] text-[#1A1612]' : 'bg-[#2D2520] text-[#A8A09B] hover:text-[#F5F0E8]',
                  ].join(' ')}
                >
                  {m === 'asi' ? t('levelup.optionASI') : t('levelup.optionFeat')}
                </button>
              ))}
            </div>

            {/* ASI */}
            {refundMode === 'asi' && (
              <div>
                <p className="text-xs text-[#A8A09B] mb-2">{t('levelup.ava')}</p>
                {/* Modo +2 / +1+1 */}
                <div className="flex rounded overflow-hidden border border-[#B8860B]/20 mb-3 w-fit">
                  {(['+2', '+1+1'] as AsiMode[]).map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => { setAsiMode(m); setAsiFirst(null); setAsiSecond(null) }}
                      className={[
                        'px-4 py-1.5 text-xs font-medium transition-colors cursor-pointer focus-visible:outline-none',
                        asiMode === m ? 'bg-[#B8860B] text-[#1A1612]' : 'bg-[#2D2520] text-[#A8A09B] hover:text-[#F5F0E8]',
                      ].join(' ')}
                    >
                      {m === '+2' ? t('levelup.plus2') : t('levelup.plus1x2')}
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs text-[#A8A09B] mb-1">
                    {asiMode === '+2' ? t('levelup.chooseAttr') : t('levelup.chooseFirstAttr')}
                  </p>
                  {ABILITIES.map(attr => <AbilityBtn key={attr} attr={attr} slot={1} />)}
                </div>

                {asiMode === '+1+1' && (
                  <div className="space-y-1.5 mt-3">
                    <p className="text-xs text-[#A8A09B] mb-1">{t('levelup.chooseSecondAttr')}</p>
                    {ABILITIES.map(attr => <AbilityBtn key={attr} attr={attr} slot={2} />)}
                  </div>
                )}
              </div>
            )}

            {/* Talento */}
            {refundMode === 'talento' && (
              <div className="space-y-3">
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={t('levelup.featSearch')}
                  className="w-full px-3 py-2 rounded-lg bg-[#2D2520] border border-[#B8860B]/20 text-sm text-[#F5F0E8] placeholder-[#A8A09B] focus:outline-none focus:border-[#B8860B]/60"
                />
                <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
                  {filteredFeats.length === 0 ? (
                    <p className="text-xs text-[#A8A09B] text-center py-4">{t('levelup.featNone')}</p>
                  ) : filteredFeats.map(feat => {
                    const selected = selectedFeat === feat.id
                    return (
                      <button
                        key={feat.id}
                        type="button"
                        onClick={() => setSelectedFeat(selected ? null : feat.id)}
                        className={[
                          'w-full text-left px-3 py-2.5 rounded-lg border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]',
                          selected
                            ? 'border-[#B8860B] bg-[#B8860B]/15'
                            : 'border-[#B8860B]/20 bg-[#2D2520] hover:border-[#B8860B]/50',
                        ].join(' ')}
                      >
                        <p className={`text-sm font-semibold mb-0.5 ${selected ? 'text-[#F5F0E8]' : 'text-[#B8860B]'}`}>
                          {feat.name}
                        </p>
                        {feat.prereq && (
                          <p className="text-[10px] text-[#A8A09B] mb-1">
                            {t('levelup.featPrereq', { prereq: feat.prereq })}
                          </p>
                        )}
                        <p className="text-xs text-[#A8A09B] leading-relaxed">{feat.description}</p>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Especialização */}
        {hasExpertise && (
          <div>
            <p className="text-xs font-semibold text-[#B8860B] uppercase tracking-wide mb-1">{t('levelup.especHeading')}</p>
            <p className="text-xs text-[#A8A09B] mb-1">{t('levelup.especHint', { n: modalExpertiseCount })}</p>
            <p className="text-xs text-green-400 mb-3">{t('levelup.expertiseSelected', { n: selectedExpertise.length, max: modalExpertiseCount })}</p>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {proficientSkills.length === 0 ? (
                <p className="text-xs text-[#A8A09B]">Nenhuma perícia disponível para especialização.</p>
              ) : proficientSkills.map(skillId => {
                const isExpertise = selectedExpertise.includes(skillId)
                const locked = !isExpertise && selectedExpertise.length >= modalExpertiseCount
                const skillLabel = skillId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                return (
                  <button
                    key={skillId}
                    type="button"
                    onClick={() => toggleExpertise(skillId)}
                    disabled={locked}
                    className={[
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg border text-sm transition-colors cursor-pointer focus-visible:outline-none disabled:cursor-not-allowed',
                      isExpertise
                        ? 'border-green-700 bg-green-900/30 text-green-300'
                        : locked
                        ? 'border-[#B8860B]/10 bg-[#2D2520] text-[#A8A09B]/40'
                        : 'border-[#B8860B]/20 bg-[#2D2520] text-[#A8A09B] hover:border-[#B8860B]/50 hover:text-[#F5F0E8]',
                    ].join(' ')}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 ${isExpertise ? 'bg-green-600 border-green-600' : 'border-[#6B6560]'}`} />
                    <span className="font-medium capitalize">{skillLabel}</span>
                    {isExpertise && <span className="ml-auto text-xs text-green-400">Especialização</span>}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Confirmar */}
        <button
          type="button"
          disabled={!canFinish()}
          onClick={confirm}
          className="w-full py-2.5 rounded-lg font-cinzel font-semibold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B] disabled:opacity-40 disabled:cursor-not-allowed bg-[#7B1D1D] hover:bg-[#9B2D2D] text-[#F5F0E8] cursor-pointer"
        >
          {t('levelup.confirm', { n: newLevel })}
        </button>
      </div>
    </Modal>
  )
}
