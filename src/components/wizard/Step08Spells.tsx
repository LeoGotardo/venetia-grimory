import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSheetStore } from '../../store/sheetStore'
import { WizardNav } from './WizardNav'
import { getCantripsByClass, getSpellsByClassAndLevel } from '../../data/spells'
import type { Spell } from '../../data/spells'
import { SpellCard } from '../ui/SpellCard'
import { FreeCastPicker } from '../ui/FreeCastPicker'

import {
  calcThirdCasterCantrips,
  calcThirdCasterPreparedSpells,
  calcThirdCasterSlots,
  isCasterClass,
  isThirdCaster,
  spellListForClass,
} from '../../lib/calculations'
import { gameData } from '../../data/rules'

function highestCircle(slots: Partial<Record<string, number>>): number {
  return Object.entries(slots)
    .filter(([, v]) => (v ?? 0) > 0)
    .reduce((acc, [k]) => Math.max(acc, parseInt(k.replace('c', ''))), 0)
}

function getMaxSpellLevel(
  cd: { progression: unknown[] } | undefined,
  level: number,
  subclassId: string | null,
): number {
  // Subclasses de 1/3 conjurador têm tabela própria — a progressão da classe
  // (guerreiro/ladino) não traz espaço nenhum.
  if (isThirdCaster(subclassId)) return highestCircle(calcThirdCasterSlots(level))
  if (!cd?.progression) return 0
  const idx = Math.max(0, Math.min(level - 1, cd.progression.length - 1))
  const p = cd.progression[idx] as Record<string, unknown>
  // Conjuradores padrão: `slots` traz a contagem por círculo
  const slots = p?.slots as Record<string, number> | undefined
  if (slots) {
    const mc = highestCircle(slots)
    if (mc > 0) return mc
  }
  // Bruxo (Magia de Pacto): `max_spell_level` no lugar de `slots` por círculo
  const maxSpellLevel = p?.max_spell_level as number | undefined
  if (maxSpellLevel && maxSpellLevel > 0) return maxSpellLevel
  return 0
}

function SpellPill({
  spellcasting,
  selected,
  disabled,
  onToggle,
  onInfo,
}: {
  spellcasting: Spell
  selected: boolean
  disabled: boolean
  onToggle: () => void
  onInfo: () => void
}) {
  const { t } = useTranslation()
  return (
    <div className="inline-flex items-center">
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled && !selected}
        aria-pressed={selected}
        className={[
          'inline-flex items-center gap-1 pl-3 pr-2 py-1.5 rounded-l-full border-y border-l text-sm font-medium transition-colors cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]',
          selected
            ? 'bg-[#B8860B]/20 border-[#B8860B] text-[#D4A017]'
            : disabled
            ? 'border-[#B8860B]/10 text-[#A8A09B]/40 cursor-not-allowed'
            : 'border-[#B8860B]/30 text-[#A8A09B] hover:border-[#B8860B]/60 hover:text-[#F5F0E8]',
        ].join(' ')}
      >
        {spellcasting.name}
        {spellcasting.concentration && <span className="text-[10px] opacity-60">C</span>}
        {spellcasting.ritual && <span className="text-[10px] opacity-60">R</span>}
      </button>
      <button
        type="button"
        onClick={onInfo}
        aria-label={t('step08.viewDetails', { name: spellcasting.name })}
        className={[
          'inline-flex items-center justify-center w-6 h-full px-1 py-1.5 rounded-r-full border-y border-r text-[10px] transition-colors cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]',
          selected
            ? 'bg-[#B8860B]/20 border-[#B8860B] text-[#D4A017] hover:bg-[#B8860B]/30'
            : disabled
            ? 'border-[#B8860B]/10 text-[#A8A09B]/40'
            : 'border-[#B8860B]/30 text-[#A8A09B] hover:border-[#B8860B]/60 hover:text-[#F5F0E8]',
        ].join(' ')}
      >
        ℹ
      </button>
    </div>
  )
}

interface ClassSpellSectionProps {
  /** Lista do catálogo: 1/3 conjuradores leem a de mago, não a da própria classe. */
  spellListId: string
  classLabel: string
  maxSpellLevel: number
  maxCantrips: number
  maxSpells: number
  search: string
  selectedCantrips: string[]
  selectedSpells: string[]
  onToggleCantrip: (name: string) => void
  onToggleSpell: (name: string) => void
  onInfo: (m: Spell) => void
  i18nLang: string
}

function ClassSpellSection({
  spellListId,
  classLabel,
  maxSpellLevel,
  maxCantrips,
  maxSpells,
  search,
  selectedCantrips,
  selectedSpells,
  onToggleCantrip,
  onToggleSpell,
  onInfo,
  i18nLang,
}: ClassSpellSectionProps) {
  const { t } = useTranslation()
  const [activeSpellLevel, setActiveSpellLevel] = useState(1)

  const availableCantrips = useMemo(
    () => getCantripsByClass(spellListId).filter(tr => !search || tr.name.toLowerCase().includes(search.toLowerCase())),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [spellListId, search, i18nLang],
  )

  const availableSpells = useMemo(
    () => getSpellsByClassAndLevel(spellListId, maxSpellLevel),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [spellListId, maxSpellLevel, i18nLang],
  )

  const availableSpellLevels = useMemo(() => {
    const levels = new Set(availableSpells.map(m => m.level))
    return Array.from(levels).sort((a, b) => a - b)
  }, [availableSpells])

  const spellsOfLevel = useMemo(
    () => availableSpells
      .filter(m => m.level === activeSpellLevel)
      .filter(m => !search || m.name.toLowerCase().includes(search.toLowerCase())),
    [availableSpells, activeSpellLevel, search],
  )

  return (
    <div className="bg-[#3D332D] border border-[#B8860B]/20 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-cinzel font-bold text-[#D4A017]">{classLabel}</h3>
        <span className="text-xs text-[#A8A09B] bg-[#2D2520] border border-[#B8860B]/20 rounded-full px-2 py-0.5">
          {t('step08.upToCircle', { n: maxSpellLevel })}
        </span>
      </div>

      {/* Truques */}
      {maxCantrips > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#B8860B]">{t('step08.cantrips')}</span>
            <span className={[
              'text-xs font-bold px-2 py-0.5 rounded-full',
              selectedCantrips.length >= maxCantrips ? 'bg-[#B8860B]/20 text-[#D4A017]' : 'bg-[#2D2520] text-[#A8A09B]',
            ].join(' ')}>
              {selectedCantrips.length}/{maxCantrips}
            </span>
          </div>
          {availableCantrips.length === 0 ? (
            <p className="text-xs text-[#A8A09B]">{t('step08.noCantrips')}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {availableCantrips.map(tr => (
                <SpellPill
                  key={tr.id}
                  spellcasting={tr}
                  selected={selectedCantrips.includes(tr.name)}
                  disabled={selectedCantrips.length >= maxCantrips}
                  onToggle={() => onToggleCantrip(tr.name)}
                  onInfo={() => onInfo(tr)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Magias preparadas */}
      {maxSpells > 0 && availableSpells.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#B8860B]">{t('step08.preparedSpells')}</span>
            <span className={[
              'text-xs font-bold px-2 py-0.5 rounded-full',
              selectedSpells.length >= maxSpells ? 'bg-[#B8860B]/20 text-[#D4A017]' : 'bg-[#2D2520] text-[#A8A09B]',
            ].join(' ')}>
              {selectedSpells.length}/{maxSpells}
            </span>
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1" role="tablist" aria-label={t('step08.circlesAriaLabel')}>
            {availableSpellLevels.map(c => (
              <button
                key={c}
                role="tab"
                aria-selected={activeSpellLevel === c}
                onClick={() => setActiveSpellLevel(c)}
                className={[
                  'px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]',
                  activeSpellLevel === c ? 'bg-[#B8860B] text-[#1A1612]' : 'bg-[#2D2520] text-[#A8A09B] hover:text-[#F5F0E8]',
                ].join(' ')}
              >
                {c}º
              </button>
            ))}
          </div>

          <div role="tabpanel" aria-label={t('step08.circleAriaLabel', { n: activeSpellLevel })}>
            {spellsOfLevel.length === 0 ? (
              <p className="text-xs text-[#A8A09B]">
                {search ? t('step08.noSpellsFound') : t('step08.noSpellsCircle')}
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {spellsOfLevel.map(m => (
                  <SpellPill
                    key={m.id}
                    spellcasting={m}
                    selected={selectedSpells.includes(m.name)}
                    disabled={maxSpells > 0 && selectedSpells.length >= maxSpells}
                    onToggle={() => onToggleSpell(m.name)}
                    onInfo={() => onInfo(m)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function Step08Spells() {
  const { sheet, updateSpellcasting, setStep } = useSheetStore()
  const { t, i18n } = useTranslation()
  const [search, setSearch] = useState('')
  const [spellInfo, setSpellInfo] = useState<Spell | null>(null)

  const classId = sheet.identity.class_id
  const level = sheet.identity.level
  const multiclasses = sheet.identity.multiclasses ?? []
  const primaryLevel = level - multiclasses.reduce((s, m) => s + m.level, 0)

  const subclassId = sheet.identity.subclass_id

  // True if any class in the build is a spellcaster
  const isCaster =
    sheet.spellcasting.spellcaster ||
    isCasterClass(classId ?? '', subclassId) ||
    multiclasses.some(m => isCasterClass(m.class_id, m.subclass_id))

  // Um bloco por classe conjuradora, com a lista do catálogo e os limites daquela
  // classe — 1/3 conjuradores têm tabela e lista próprias.
  const casterClasses = useMemo(() => {
    const result: Array<{
      classId: string
      spellListId: string
      level: number
      maxSpellLevel: number
      maxCantrips: number
      maxSpells: number
    }> = []

    const add = (id: string, sub: string | null, level: number) => {
      if (!isCasterClass(id, sub)) return
      const cd = gameData.classes.find(c => c.id === id)
      const maxSpellLevel = getMaxSpellLevel(cd, level, sub)
      if (maxSpellLevel <= 0) return
      const prog = cd?.progression?.[Math.max(0, Math.min(level - 1, cd.progression.length - 1))] as
        | Record<string, unknown>
        | undefined
      result.push({
        classId: id,
        spellListId: spellListForClass(id, sub),
        level,
        maxSpellLevel,
        maxCantrips: isThirdCaster(sub)
          ? calcThirdCasterCantrips(sub, level)
          : ((prog?.cantrips as number | undefined) ?? 0),
        maxSpells: isThirdCaster(sub)
          ? calcThirdCasterPreparedSpells(level)
          : ((prog?.prepared_spells as number | undefined) ?? 0),
      })
    }

    add(classId ?? '', subclassId, Math.max(1, primaryLevel))
    for (const m of multiclasses) add(m.class_id, m.subclass_id, m.level)
    return result
  }, [classId, subclassId, primaryLevel, multiclasses])

  const cantripsByClass = sheet.spellcasting.cantrips_by_class
  const spellsByClass = sheet.spellcasting.spells_by_class

  function toggleCantrip(classId: string, name: string) {
    const current = cantripsByClass[classId] ?? []
    updateSpellcasting({
      cantrips_by_class: {
        ...cantripsByClass,
        [classId]: current.includes(name) ? current.filter(t => t !== name) : [...current, name],
      },
    })
  }

  function toggleSpell(classId: string, name: string) {
    const current = spellsByClass[classId] ?? []
    updateSpellcasting({
      spells_by_class: {
        ...spellsByClass,
        [classId]: current.includes(name) ? current.filter(m => m !== name) : [...current, name],
      },
    })
  }

  const allCantrips = Object.values(cantripsByClass).flat()
  const allSpells = Object.values(spellsByClass).flat()

  // Iniciado em Magia (e Arcana Mística) conjuram sem ser da classe: mesmo sem
  // classe conjuradora ainda há escolhas a fazer aqui.
  const freeCasts = sheet.spellcasting.free_casts ?? []

  if (!isCaster && freeCasts.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-cinzel text-2xl font-bold text-[#F5F0E8] mb-1">{t('step08.heading')}</h2>
          <p className="text-[#A8A09B] text-sm">
            {classId ? t('step08.notCaster', { charClass: gameData.classes.find(c => c.id === classId)?.name }) : t('step08.chooseClassFirst')}
          </p>
        </div>
        <div className="bg-[#3D332D] border border-[#B8860B]/20 rounded-xl p-6 text-center">
          <div className="mb-3 flex justify-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#B8860B" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 17.5L3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/><path d="M9.5 17.5L21 6V3h-3L6.5 14.5"/><path d="M11 19l-6-6"/><path d="M8 16l-4 4"/></svg>
          </div>
          <p className="text-[#F5F0E8] font-medium">{t('step08.noMagic')}</p>
          <p className="text-[#A8A09B] text-sm mt-1">{t('step08.continueNext')}</p>
        </div>
        <WizardNav onBack={() => setStep(8)} onNext={() => setStep(10)} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cinzel text-2xl font-bold text-[#F5F0E8] mb-1">{t('step08.heading')}</h2>
        <p className="text-[#A8A09B] text-sm">{t('step08.subtitle')}</p>
      </div>

      <FreeCastPicker />

      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder={t('step08.searchPlaceholder')}
        className="w-full bg-[#2D2520] border border-[#B8860B]/30 rounded-lg px-3 py-2 text-[#F5F0E8] text-sm placeholder:text-[#A8A09B] focus:outline-none focus:ring-1 focus:ring-[#B8860B] focus:border-[#B8860B]"
        aria-label={t('step08.searchAriaLabel')}
      />

      {casterClasses.map(({ classId, spellListId, maxSpellLevel, maxCantrips, maxSpells }) => {
        const classData = gameData.classes.find(c => c.id === classId)
        return (
          <ClassSpellSection
            key={classId}
            spellListId={spellListId}
            classLabel={classData?.name ?? classId}
            maxSpellLevel={maxSpellLevel}
            maxCantrips={maxCantrips}
            maxSpells={maxSpells}
            search={search}
            selectedCantrips={cantripsByClass[classId] ?? []}
            selectedSpells={spellsByClass[classId] ?? []}
            onToggleCantrip={name => toggleCantrip(classId, name)}
            onToggleSpell={name => toggleSpell(classId, name)}
            onInfo={setSpellInfo}
            i18nLang={i18n.language}
          />
        )
      })}

      {/* Summary of all selections */}
      {(allCantrips.length > 0 || allSpells.length > 0) && (
        <div className="bg-[#2D2520] border border-[#B8860B]/10 rounded-xl p-4 space-y-2">
          <p className="text-xs text-[#A8A09B] font-medium uppercase tracking-wide">{t('step08.selectedLabel')}</p>
          {allCantrips.length > 0 && (
            <div>
              <span className="text-xs text-[#B8860B] font-medium">{t('step08.cantripsLabel')}</span>
              <span className="text-xs text-[#F5F0E8]">{allCantrips.join(', ')}</span>
            </div>
          )}
          {allSpells.length > 0 && (
            <div>
              <span className="text-xs text-[#B8860B] font-medium">{t('step08.spellsLabel')}</span>
              <span className="text-xs text-[#F5F0E8]">{allSpells.join(', ')}</span>
            </div>
          )}
        </div>
      )}

      <WizardNav onBack={() => setStep(8)} onNext={() => setStep(10)} />

      <SpellCard spellcasting={spellInfo} onClose={() => setSpellInfo(null)} />
    </div>
  )
}
