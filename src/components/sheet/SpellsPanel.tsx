import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSheetStore } from '../../store/sheetStore'
import { formatModifier } from '../../lib/calculations'
import { resolveSpell, type Spell } from '../../data/spells'
import { gameData } from '../../data/rules'
import { SpellCard } from '../ui/SpellCard'
import { freeCastLabel } from '../../lib/freeCasts'
import type { CharacterSheet } from '../../types'

const SPELL_LEVELS: Array<keyof CharacterSheet['spellcasting']['spell_slots']> = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9']

// On-theme: sem Tailwind genérico (gray/blue sem contexto)
const SPELL_LEVEL_COLORS = [
  '',
  'bg-amber-500',
  'bg-yellow-400',
  'bg-green-500',
  'bg-teal-500',
  'bg-blue-500',
  'bg-violet-500',
  'bg-purple-600',
  'bg-pink-500',
  'bg-rose-600',
]

export function SpellsPanel() {
  const {
    sheet,
    spendSlot,
    restoreSlot,
    spendPactSlot,
    restorePactSlot,
    spendFreeCast,
    restoreFreeCast,
  } = useSheetStore()
  const { t } = useTranslation()
  const [openSpell, setOpenSpell] = useState<Spell | null>(null)
  const { spellcasting } = sheet

  const totalSelected =
    Object.values(spellcasting.cantrips_by_class).flat().length +
    Object.values(spellcasting.spells_by_class).flat().length

  // As três reservas são independentes: Conjuração, Magia de Pacto e conjurações
  // grátis (Iniciado em Magia). Qualquer uma delas já faz a aba valer a pena.
  const pact = spellcasting.pact_slots
  const freeCasts = spellcasting.free_casts ?? []
  const hasStandardSlots = SPELL_LEVELS.some(c => spellcasting.spell_slots[c].max > 0)
  const castingClasses = Object.keys(spellcasting._spell_dc_by_class ?? {})
  const hasMagic = spellcasting.spellcaster || pact.max > 0 || freeCasts.length > 0

  if (!hasMagic) {
    return (
      <div className="text-center py-10 text-[#A8A09B]">
        <div className="mb-3 flex justify-center opacity-40">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="#B8860B"><path d="M12 2l2.4 7.6H22l-6.2 4.5 2.4 7.6L12 17.2l-6.2 4.5 2.4-7.6L2 9.6h7.6z"/></svg>
        </div>
        <p className="font-cinzel text-[#B8860B] mb-1">{t('magic.notCaster')}</p>
        <p className="text-sm">{t('magic.notCasterDesc')}</p>
      </div>
    )
  }

  return (
    <>
      {/* No desktop as reservas viram uma coluna à esquerda e as listas de magias
          ocupam o resto da largura, em vez de tudo empilhar. */}
      <div className="space-y-5 lg:grid lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:gap-6 lg:items-start lg:space-y-0">
        <div className="space-y-5">
          {castingClasses.length > 1 ? (
            // Multiclasse: cada classe conjura com o próprio atributo, então a CD é uma por classe.
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              {castingClasses.map(classId => (
                <div key={classId} className="bg-[#2D2520] border border-[#B8860B]/20 rounded-lg p-3">
                  <div className="text-[11px] uppercase tracking-wide text-[#A8A09B] mb-1">
                    {gameData.classes.find(c => c.id === classId)?.name ?? classId}
                  </div>
                  <div className="flex items-baseline gap-4">
                    <span className="text-xs text-[#A8A09B]">
                      {t('magic.spellDC')}{' '}
                      <b className="font-cinzel text-xl text-[#F5F0E8]">
                        {spellcasting._spell_dc_by_class[classId]}
                      </b>
                    </span>
                    <span className="text-xs text-[#A8A09B]">
                      {t('magic.spellAttackBonus')}{' '}
                      <b className="font-cinzel text-xl text-[#F5F0E8]">
                        {formatModifier(spellcasting._spell_attack_by_class[classId])}
                      </b>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-[#2D2520] border border-[#B8860B]/20 rounded-lg p-3 text-center">
                <div className="text-xs text-[#A8A09B] mb-1">{t('magic.spellDC')}</div>
                <div className="font-cinzel font-bold text-3xl text-[#F5F0E8]">{spellcasting._spell_dc ?? '—'}</div>
              </div>
              <div className="bg-[#2D2520] border border-[#B8860B]/20 rounded-lg p-3 text-center">
                <div className="text-xs text-[#A8A09B] mb-1">{t('magic.spellAttackBonus')}</div>
                <div className="font-cinzel font-bold text-3xl text-[#F5F0E8]">
                  {spellcasting._spell_attack_bonus !== null ? formatModifier(spellcasting._spell_attack_bonus) : '—'}
                </div>
              </div>
            </div>
          )}

          {hasStandardSlots && (
            <section aria-label={t('magic.spellSlots')}>
              <h4 className="font-cinzel font-semibold text-[#B8860B] mb-3">{t('magic.spellSlots')}</h4>
              <div className="space-y-2">
                {SPELL_LEVELS.map((c, i) => {
                  const slot = spellcasting.spell_slots[c]
                  if (slot.max === 0) return null
                  const level = i + 1
                  return (
                    <SlotTrack
                      key={c}
                      label={t('magic.level_n', { n: level })}
                      level={level}
                      max={slot.max}
                      spent={slot.spent}
                      groupLabel={t('magic.circleAriaLabel', { n: level })}
                      spendLabel={j => t('magic.spendSlot', { slot: j, n: level })}
                      restoreLabel={j => t('magic.restoreSlot', { slot: j, n: level })}
                      onSpend={() => spendSlot(c)}
                      onRestore={() => restoreSlot(c)}
                    />
                  )
                })}
              </div>
            </section>
          )}

          {pact.max > 0 && (
            <section aria-label={t('magic.pactSlots')}>
              <h4 className="font-cinzel font-semibold text-[#B8860B] mb-1">{t('magic.pactSlots')}</h4>
              <p className="text-[11px] text-[#A8A09B] mb-3">{t('magic.pactSlotsHint')}</p>
              <SlotTrack
                label={t('magic.level_n', { n: pact.level ?? 1 })}
                level={pact.level ?? 1}
                max={pact.max}
                spent={pact.spent}
                groupLabel={t('magic.pactAriaLabel', { n: pact.level ?? 1 })}
                spendLabel={j => t('magic.spendPactSlot', { slot: j })}
                restoreLabel={j => t('magic.restorePactSlot', { slot: j })}
                onSpend={spendPactSlot}
                onRestore={restorePactSlot}
              />
            </section>
          )}

          {freeCasts.length > 0 && (
            <section aria-label={t('magic.freeCasts')}>
              <h4 className="font-cinzel font-semibold text-[#B8860B] mb-1">{t('magic.freeCasts')}</h4>
              <p className="text-[11px] text-[#A8A09B] mb-3">{t('magic.freeCastsHint')}</p>
              <div className="space-y-2">
                {freeCasts.map(cast => {
                  const label = freeCastLabel(cast, t)
                  return (
                    <div key={cast.id} className="space-y-0.5">
                      <SlotTrack
                        label={label}
                        level={cast.level}
                        max={cast.max}
                        spent={cast.spent}
                        groupLabel={label}
                        spendLabel={() => t('magic.spendFreeCast', { source: label })}
                        restoreLabel={() => t('magic.restoreFreeCast', { source: label })}
                        onSpend={() => spendFreeCast(cast.id)}
                        onRestore={() => restoreFreeCast(cast.id)}
                        wideLabel
                      />
                      <p className="text-[11px] text-[#A8A09B] pl-[8.75rem]">
                        {cast.spell ? (
                          <button
                            type="button"
                            onClick={() => {
                              const m = resolveSpell(cast.spell!)
                              if (m) setOpenSpell(m)
                            }}
                            className="text-[#D4A017] hover:underline cursor-pointer"
                          >
                            {cast.spell}
                          </button>
                        ) : (
                          <span className="italic">{t('magic.freeCastNoSpell')}</span>
                        )}
                        {cast.cantrips.length > 0 && <> · {cast.cantrips.join(', ')}</>}
                      </p>
                    </div>
                  )
                })}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-5">
          <ListaDeMagias
            title={t('magic.cantrips')}
            porClasse={spellcasting.cantrips_by_class}
            onAbrir={setOpenSpell}
          />

          <ListaDeMagias
            title={t('magic.preparedSpells')}
            porClasse={spellcasting.spells_by_class}
            onAbrir={setOpenSpell}
          />

          {totalSelected === 0 && (
            <p className="text-sm text-[#A8A09B] text-center py-6">{t('magic.noSpellsSelected')}</p>
          )}
        </div>
      </div>

      <SpellCard spellcasting={openSpell} onClose={() => setOpenSpell(null)} />
    </>
  )
}

interface SlotTrackProps {
  label: string
  level: number
  max: number
  spent: number
  groupLabel: string
  spendLabel: (slot: number) => string
  restoreLabel: (slot: number) => string
  onSpend: () => void
  onRestore: () => void
  wideLabel?: boolean
}

/** Uma fileira de bolinhas gastáveis — serve para espaço de magia, de pacto ou conjuração grátis. */
function SlotTrack({
  label, level, max, spent, groupLabel, spendLabel, restoreLabel, onSpend, onRestore, wideLabel,
}: SlotTrackProps) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`text-xs text-[#A8A09B] text-right flex-shrink-0 ${wideLabel ? 'w-32 truncate' : 'w-8'}`}
        title={wideLabel ? label : undefined}
      >
        {label}
      </span>
      <div className="flex gap-1 flex-wrap" role="group" aria-label={groupLabel}>
        {Array.from({ length: max }, (_, j) => {
          const available = j < max - spent
          return (
            <button
              key={j}
              onClick={() => (available ? onSpend() : onRestore())}
              className={[
                'w-5 h-5 rounded-full border-2 transition-all cursor-pointer',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B] focus-visible:ring-offset-1 focus-visible:ring-offset-[#3D332D]',
                available
                  ? `${SPELL_LEVEL_COLORS[level] ?? SPELL_LEVEL_COLORS[1]} border-transparent opacity-90 hover:opacity-100`
                  : 'border-[#A8A09B]/40 bg-transparent hover:border-[#B8860B]',
              ].join(' ')}
              aria-label={available ? spendLabel(j + 1) : restoreLabel(j + 1)}
              aria-pressed={!available}
            />
          )
        })}
      </div>
      <span className="text-xs text-[#A8A09B]">
        {max - spent}/{max}
      </span>
    </div>
  )
}

interface ListaDeMagiasProps {
  title: string
  porClasse: Record<string, string[]>
  onAbrir: (spellcasting: Spell) => void
}

/**
 * Lista informativa das magias escolhidas: resolve o nome salvo para o catálogo
 * do idioma atual e mostra círculo, escola e marcadores. Clicar abre a ficha da magia.
 */
function ListaDeMagias({ title, porClasse, onAbrir }: ListaDeMagiasProps) {
  const { t } = useTranslation()
  const entradas = Object.entries(porClasse).filter(([, nomes]) => nomes.length > 0)
  if (entradas.length === 0) return null

  const total = entradas.reduce((sum, [, nomes]) => sum + nomes.length, 0)
  const multiclass = entradas.length > 1

  return (
    <section aria-label={title}>
      <div className="flex items-baseline justify-between mb-2">
        <h4 className="font-cinzel font-semibold text-[#B8860B]">{title}</h4>
        <span className="text-xs text-[#A8A09B]">{t('magic.selectedCount', { n: total })}</span>
      </div>

      <div className="space-y-3">
        {entradas.map(([classId, nomes]) => (
          <div key={classId} className="space-y-1.5">
            {multiclass && (
              <p className="text-[11px] uppercase tracking-wide text-[#A8A09B]">
                {gameData.classes.find(c => c.id === classId)?.name ?? classId}
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-1.5">
              {nomes.map(name => (
                <ItemDeMagia key={`${classId}-${name}`} name={name} onAbrir={onAbrir} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function ItemDeMagia({ name, onAbrir }: { name: string; onAbrir: (spellcasting: Spell) => void }) {
  const { t } = useTranslation()
  const spellcasting = resolveSpell(name)

  if (!spellcasting) {
    return (
      <div
        className="flex items-center gap-2 bg-[#2D2520] border border-[#B8860B]/10 rounded-lg px-3 py-2 text-sm text-[#A8A09B]"
        title={t('magic.spellNotFound')}
      >
        <span className="truncate">{name}</span>
        <span className="ml-auto text-xs shrink-0">?</span>
      </div>
    )
  }

  const level = spellcasting.level === 0 ? t('magic.level_0') : t('magic.level_n', { n: spellcasting.level })

  return (
    <button
      type="button"
      onClick={() => onAbrir(spellcasting)}
      aria-label={t('magic.viewDetails', { name: spellcasting.name })}
      className="w-full text-left bg-[#2D2520] border border-[#B8860B]/20 rounded-lg px-3 py-2 cursor-pointer transition-colors
        hover:border-[#B8860B]/60 hover:bg-[#3D332D]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]"
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-[#F5F0E8] truncate">{spellcasting.name}</span>
        {spellcasting.concentration && (
          <span title={t('magic.concentration')} className="text-[10px] font-bold text-[#D4A017] shrink-0">C</span>
        )}
        {spellcasting.ritual && (
          <span title={t('magic.ritual')} className="text-[10px] font-bold text-[#B8860B] shrink-0">R</span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-[#A8A09B] mt-0.5">
        <span className="text-[#D4A017]">{level}</span>
        <span>·</span>
        <span>{spellcasting.school}</span>
        {spellcasting.casting_time && (
          <>
            <span>·</span>
            <span>{spellcasting.casting_time}</span>
          </>
        )}
        {spellcasting.range && (
          <>
            <span>·</span>
            <span>{spellcasting.range}</span>
          </>
        )}
        {spellcasting.damage && (
          <>
            <span>·</span>
            <span className="text-[#e0a3a3]">{spellcasting.damage}{spellcasting.damage_type ? ` ${spellcasting.damage_type}` : ''}</span>
          </>
        )}
      </div>
    </button>
  )
}
