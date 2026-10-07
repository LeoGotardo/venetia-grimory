import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { NpcProfile } from '../../types'
import { gameData } from '../../data/rules'
import { NPC_AGES, NPC_SPECIES } from '../../data/npcTables'
import { DiceIcon, LockIcon, SectionTitle } from './ornaments'

interface FieldRowProps {
  label: string
  locked: boolean
  onToggleLock?: () => void
  onReroll: () => void
  children: ReactNode
}

/** Rótulo + cadeado + dado. Fica fora do componente para o campo não remontar a cada tecla. */
function FieldRow({ label, locked, onToggleLock, onReroll, children }: FieldRowProps) {
  const { t } = useTranslation()
  const lockText = t(locked ? 'gm.npcGen.unlock' : 'gm.npcGen.lock', { field: label })
  const rerollText = t('gm.npcGen.reroll', { field: label })
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <div className="flex items-center gap-1">
        <span className="flex-1 text-[11px] font-semibold uppercase tracking-wider text-[#A8A09B]">{label}</span>
        {onToggleLock && (
          <button
            type="button"
            onClick={onToggleLock}
            aria-pressed={locked}
            aria-label={lockText}
            title={lockText}
            className={`w-8 h-8 flex items-center justify-center rounded-[7px] cursor-pointer transition-colors ${locked ? 'text-[#D4A017] bg-[rgba(212,160,23,0.12)]' : 'text-[#A8A09B] hover:text-[#E8DFD0]'}`}
          >
            <LockIcon size={15} open={!locked} />
          </button>
        )}
        <button
          type="button"
          onClick={onReroll}
          aria-label={rerollText}
          title={rerollText}
          className="w-8 h-8 flex items-center justify-center rounded-[7px] text-[#A8A09B] hover:text-[#D4A017] cursor-pointer transition-colors"
        >
          <DiceIcon size={16} />
        </button>
      </div>
      {children}
    </div>
  )
}

/** Campos do perfil que o dado sabe sortear um a um (mais o nome, que mora no bloco). */
export type ProfileField = Exclude<keyof NpcProfile, 'archetype'> | 'name'

const PORTRAIT = ['appearance', 'mannerism', 'personality'] as const
const HOOKS = ['motivation', 'secret', 'ideal', 'bond', 'flaw'] as const

const inputClass =
  'w-full bg-[#131110] border border-white/[0.1] rounded-[8px] px-2.5 py-2 text-[14px] text-[#F5F0E8] placeholder:text-[#6f6a64] focus:outline-none focus:border-[#D4A017]'

interface NpcProfileFieldsProps {
  profile: NpcProfile
  onChange: (field: ProfileField, value: string) => void
  onReroll: (field: ProfileField) => void
  /** Nome do NPC; sem ele o campo não aparece (o editor mostra o nome no bloco). */
  name?: string
  /** Campos travados não mudam no "Sortear de novo". Sem `onToggleLock`, não há cadeado. */
  locked?: ReadonlySet<ProfileField>
  onToggleLock?: (field: ProfileField) => void
}

/**
 * Perfil do NPC em três blocos (quem é, retrato, ganchos). Cada campo tem o dado
 * ao lado; no gerador, também o cadeado. Usado pelo gerador e pelo editor de NPC.
 */
export function NpcProfileFields({ profile, onChange, onReroll, name, locked, onToggleLock }: NpcProfileFieldsProps) {
  const { t } = useTranslation()
  const label = (f: ProfileField) => t(`gm.npcGen.fields.${f}`)

  const row = (field: ProfileField, children: ReactNode) => (
    <FieldRow
      key={field}
      label={label(field)}
      locked={locked?.has(field) ?? false}
      onToggleLock={onToggleLock && (() => onToggleLock(field))}
      onReroll={() => onReroll(field)}
    >
      {children}
    </FieldRow>
  )

  const text = (field: typeof PORTRAIT[number] | typeof HOOKS[number] | 'occupation', rows = 2) => (
    row(field, (
      <textarea
        value={profile[field]}
        rows={rows}
        onChange={e => onChange(field, e.target.value)}
        aria-label={label(field)}
        className={`${inputClass} resize-y leading-snug`}
      />
    ))
  )

  return (
    <div className="flex flex-col gap-6">
      <section>
        <SectionTitle align="start">{t('gm.npcGen.sectionIdentity')}</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {name != null && (
            row('name', (
              <input data-testid="npc-gerar-nome" value={name} onChange={e => onChange('name', e.target.value)} aria-label={label('name')} className={inputClass} />
            ))
          )}
          {row('species', (
            <select value={profile.species} onChange={e => onChange('species', e.target.value)} aria-label={label('species')} className={inputClass}>
              {!profile.species && <option value="">—</option>}
              {NPC_SPECIES.map(id => <option key={id} value={id}>{gameData.species.find(s => s.id === id)?.name ?? id}</option>)}
            </select>
          ))}
          {row('gender', (
            <select value={profile.gender} onChange={e => onChange('gender', e.target.value)} aria-label={label('gender')} className={inputClass}>
              {!profile.gender && <option value="">—</option>}
              {(['f', 'm', 'x'] as const).map(g => <option key={g} value={g}>{t(`gm.npcGen.genders.${g}`)}</option>)}
            </select>
          ))}
          {row('age', (
            <select value={profile.age} onChange={e => onChange('age', e.target.value)} aria-label={label('age')} className={inputClass}>
              {!(NPC_AGES as readonly string[]).includes(profile.age) && <option value={profile.age}>{profile.age || '—'}</option>}
              {NPC_AGES.map(a => <option key={a} value={a}>{t(`gm.npcGen.ages.${a}`)}</option>)}
            </select>
          ))}
          <div className="sm:col-span-2">{text('occupation', 1)}</div>
        </div>
      </section>

      <section>
        <SectionTitle align="start">{t('gm.npcGen.sectionPortrait')}</SectionTitle>
        <div className="flex flex-col gap-3">{PORTRAIT.map(f => text(f))}</div>
      </section>

      <section>
        <SectionTitle align="start">{t('gm.npcGen.sectionHooks')}</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {HOOKS.map(f => (
            <div key={f} className={f === 'motivation' || f === 'secret' ? 'sm:col-span-2' : ''}>{text(f)}</div>
          ))}
        </div>
      </section>
    </div>
  )
}
