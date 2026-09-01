import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSheetStore } from '../../store/sheetStore'
import { getSpells, type Spell } from '../../data/spells'
import { gameData } from '../../data/rules'
import { SpellCard } from './SpellCard'
import { formatModifier } from '../../lib/calculations'
import { freeCastLabel, freeCastCantripCount } from '../../lib/freeCasts'
import { MAGIC_INITIATE_ABILITIES, MAGIC_INITIATE_LISTS } from '../../constants'
import type { AbilityId, FreeCast } from '../../types'

/**
 * Escolha das magias que não gastam espaço: os 2 truques e a magia de 1º círculo do
 * talento Iniciado em Magia, e a magia de 6º a 9º da Arcana Mística do bruxo. Fica
 * fora da lista normal de magias porque não vem de nenhuma classe do personagem —
 * a lista de origem é do próprio talento.
 */
export function FreeCastPicker() {
  const { sheet } = useSheetStore()
  const { t } = useTranslation()
  const [spellInfo, setSpellInfo] = useState<Spell | null>(null)
  const casts = sheet.spellcasting.free_casts ?? []

  if (casts.length === 0) return null

  return (
    <div className="space-y-3">
      <div>
        <h4 className="font-cinzel font-semibold text-[#B8860B]">{t('magic.freeCasts')}</h4>
        <p className="text-[11px] text-[#A8A09B]">{t('magic.freeCastsHint')}</p>
      </div>

      {casts.map(cast => (
        <FreeCastCard key={cast.id} cast={cast} onInfo={setSpellInfo} />
      ))}

      <SpellCard spellcasting={spellInfo} onClose={() => setSpellInfo(null)} />
    </div>
  )
}

const PILL_BASE =
  'inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]'
const PILL_ON = 'bg-[#B8860B]/20 border-[#B8860B] text-[#D4A017]'
const PILL_OFF = 'border-[#B8860B]/30 text-[#A8A09B] hover:border-[#B8860B]/60 hover:text-[#F5F0E8]'
const PILL_DISABLED = 'border-[#B8860B]/10 text-[#A8A09B]/40 cursor-not-allowed'

function FreeCastCard({ cast, onInfo }: { cast: FreeCast; onInfo: (m: Spell) => void }) {
  const { setFreeCastChoices } = useSheetStore()
  const { t, i18n } = useTranslation()

  const maxCantrips = freeCastCantripCount(cast)

  // getSpells() lê o idioma no momento da chamada, então a dependência é real
  // mesmo o lint não enxergando o uso.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const catalog = useMemo(() => getSpells(), [i18n.language])
  const cantripOptions = useMemo(
    () =>
      cast.spell_list && maxCantrips > 0
        ? catalog.filter(m => m.level === 0 && m.classes.includes(cast.spell_list!))
        : [],
    [catalog, cast.spell_list, maxCantrips],
  )
  const spellOptions = useMemo(
    () =>
      cast.spell_list
        ? catalog.filter(m => m.level === cast.level && m.classes.includes(cast.spell_list!))
        : [],
    [catalog, cast.spell_list, cast.level],
  )

  function toggleCantrip(name: string) {
    const chosen = cast.cantrips.includes(name)
      ? cast.cantrips.filter(c => c !== name)
      : [...cast.cantrips, name]
    if (chosen.length > maxCantrips) return
    setFreeCastChoices(cast.id, { cantrips: chosen })
  }

  return (
    <div className="bg-[#2D2520] border border-[#B8860B]/20 rounded-lg p-3 space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-cinzel text-[#F5F0E8]">{freeCastLabel(cast, t)}</span>
        {cast._spell_dc !== null && (
          <span className="text-[11px] text-[#A8A09B]">
            {t('magic.spellDC')} {cast._spell_dc} · {t('magic.spellAttackBonus')}{' '}
            {formatModifier(cast._spell_attack_bonus)}
          </span>
        )}
      </div>

      {cast.kind === 'magic_initiate' && !cast.list_locked && (
        <Field label={t('magic.freeCastList')}>
          {MAGIC_INITIATE_LISTS.map(listId => (
            <button
              key={listId}
              type="button"
              aria-pressed={cast.spell_list === listId}
              onClick={() => setFreeCastChoices(cast.id, { spell_list: listId })}
              className={`${PILL_BASE} ${cast.spell_list === listId ? PILL_ON : PILL_OFF}`}
            >
              {gameData.classes.find(c => c.id === listId)?.name ?? listId}
            </button>
          ))}
        </Field>
      )}

      {cast.kind === 'magic_initiate' && (
        <Field label={t('magic.freeCastAbility')}>
          {MAGIC_INITIATE_ABILITIES.map(ability => (
            <button
              key={ability}
              type="button"
              aria-pressed={cast.ability === ability}
              onClick={() => setFreeCastChoices(cast.id, { ability: ability as AbilityId })}
              className={`${PILL_BASE} ${cast.ability === ability ? PILL_ON : PILL_OFF}`}
            >
              {t(`attrs.${ability}`)}
            </button>
          ))}
        </Field>
      )}

      {!cast.spell_list ? (
        <p className="text-xs text-[#A8A09B]">{t('magic.freeCastPickListFirst')}</p>
      ) : (
        <>
          {maxCantrips > 0 && (
            <Field label={t('magic.freeCastCantrips', { n: cast.cantrips.length, max: maxCantrips })}>
              {cantripOptions.map(m => (
                <SpellChoice
                  key={m.id}
                  spell={m}
                  selected={cast.cantrips.includes(m.name)}
                  disabled={!cast.cantrips.includes(m.name) && cast.cantrips.length >= maxCantrips}
                  onToggle={() => toggleCantrip(m.name)}
                  onInfo={() => onInfo(m)}
                />
              ))}
            </Field>
          )}

          <Field label={t('magic.freeCastSpell', { n: cast.level })}>
            {spellOptions.map(m => (
              <SpellChoice
                key={m.id}
                spell={m}
                selected={cast.spell === m.name}
                disabled={false}
                onToggle={() =>
                  setFreeCastChoices(cast.id, { spell: cast.spell === m.name ? null : m.name })
                }
                onInfo={() => onInfo(m)}
              />
            ))}
          </Field>
        </>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-[#A8A09B] mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-1.5 max-h-52 overflow-y-auto">{children}</div>
    </div>
  )
}

function SpellChoice({
  spell,
  selected,
  disabled,
  onToggle,
  onInfo,
}: {
  spell: Spell
  selected: boolean
  disabled: boolean
  onToggle: () => void
  onInfo: () => void
}) {
  const { t } = useTranslation()
  return (
    <span className="inline-flex items-center">
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        aria-pressed={selected}
        className={[
          PILL_BASE,
          'rounded-r-none pr-2',
          selected ? PILL_ON : disabled ? PILL_DISABLED : PILL_OFF,
        ].join(' ')}
      >
        {spell.name}
        {spell.concentration && <span className="text-[10px] opacity-60">C</span>}
        {spell.ritual && <span className="text-[10px] opacity-60">R</span>}
      </button>
      <button
        type="button"
        onClick={onInfo}
        aria-label={t('magic.viewDetails', { name: spell.name })}
        className={[
          PILL_BASE,
          'rounded-l-none border-l-0 px-2 text-[10px]',
          selected ? PILL_ON : PILL_OFF,
        ].join(' ')}
      >
        ℹ
      </button>
    </span>
  )
}
