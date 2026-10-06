import { useTranslation } from 'react-i18next'
import type { AbilityId, StatBlock, StatBlockFeature } from '../../types'
import { gameData } from '../../data/rules'
import { translateTerm } from '../../data/rules/translation'
import { ABILITIES, formatModifier } from '../../lib/calculations'
import {
  FEATURE_LISTS,
  type FeatureList,
  abilityModifier,
  createBlankFeature,
  crToXp,
  proficientSkillBonus,
} from '../../lib/gm/statblock'
import { averageDice, parseDice } from '../../lib/gm/dice'
import { AVAILABLE_CONDITIONS, CHALLENGE_RATINGS, CREATURE_SIZES, CREATURE_TYPES } from '../../constants'
import { EditorSection, Field, NumberField, SelectField, TextField } from './fields'

interface StatBlockEditorProps {
  value: StatBlock
  onChange: (value: StatBlock) => void
}

type SenseKey = keyof StatBlock['senses']
type ExtraSpeed = 'fly' | 'swim' | 'climb' | 'burrow'

/** Formulário do bloco de estatísticas. Controlado: quem usa guarda o rascunho. */
export function StatBlockEditor({ value: b, onChange }: StatBlockEditorProps) {
  const { t, i18n } = useTranslation()
  const set = (change: Partial<StatBlock>) => onChange({ ...b, ...change })

  const hpAverageFromFormula = (() => {
    const parsed = parseDice(b.hp.formula)
    return parsed && parsed.terms.length > 0 ? averageDice(parsed) : null
  })()

  const freeSkills = gameData.skills.filter(s => !(s.id in b.skills))

  return (
    <div className="flex flex-col gap-4">
      <EditorSection title={t('gm.sectionIdentity')}>
        <TextField label={t('gm.name')} value={b.name} onChange={name => set({ name })} />
        <div className="grid grid-cols-2 gap-3">
          <SelectField
            label={t('gm.size')}
            value={b.size}
            options={CREATURE_SIZES.map(s => ({ value: s, label: t(`gm.sizes.${s}`) }))}
            onChange={size => set({ size })}
          />
          <SelectField
            label={t('gm.type')}
            value={b.creature_type}
            options={CREATURE_TYPES.map(c => ({ value: c, label: t(`gm.creatureTypes.${c}`) }))}
            onChange={creature_type => set({ creature_type })}
          />
          <TextField label={t('gm.tags')} value={b.tags} placeholder={t('gm.tagsPlaceholder')} onChange={tags => set({ tags })} />
          <TextField label={t('gm.alignment')} value={b.alignment} onChange={alignment => set({ alignment })} />
          <SelectField
            label={t('gm.cr')}
            value={b.cr}
            options={CHALLENGE_RATINGS.map(cr => ({ value: cr, label: `${cr} (${crToXp(cr).toLocaleString()} XP)` }))}
            onChange={cr => set({ cr })}
          />
        </div>
        <TextField label={t('gm.description')} value={b.description} multiline onChange={description => set({ description })} />
      </EditorSection>

      <EditorSection title={t('gm.sectionDefense')}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <NumberField label={t('gm.ac')} value={b.ac} min={0} onChange={ac => set({ ac: ac ?? 10 })} />
          <TextField className="sm:col-span-3" label={t('gm.acNote')} value={b.ac_note} placeholder={t('gm.acNotePlaceholder')} onChange={ac_note => set({ ac_note })} />
          <NumberField label={t('gm.hpAverage')} value={b.hp.average} min={1} onChange={average => set({ hp: { ...b.hp, average: average ?? 1 } })} />
          <TextField label={t('gm.hpFormula')} value={b.hp.formula} placeholder="2d8+2" onChange={formula => set({ hp: { ...b.hp, formula } })} />
          <div className="flex items-end">
            <button
              type="button"
              disabled={hpAverageFromFormula == null || hpAverageFromFormula === b.hp.average}
              onClick={() => hpAverageFromFormula != null && set({ hp: { ...b.hp, average: Math.max(1, hpAverageFromFormula) } })}
              className="w-full text-[12px] font-semibold text-[#E8DFD0] bg-white/5 hover:bg-white/10 border border-white/[0.1] rounded-[8px] px-2 py-2 cursor-pointer disabled:opacity-40 disabled:cursor-default"
            >
              {t('gm.hpUseAverage')}{hpAverageFromFormula != null ? ` (${hpAverageFromFormula})` : ''}
            </button>
          </div>
          <NumberField
            label={t('gm.initiativeOverride')}
            hint={t('gm.initiativeOverrideHint')}
            value={b.initiative_bonus}
            nullable
            onChange={initiative_bonus => set({ initiative_bonus })}
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <NumberField label={`${t('gm.speedWalk')} (${t('gm.metersUnit')})`} value={b.speed.walk} min={0} onChange={walk => set({ speed: { ...b.speed, walk: walk ?? 0 } })} />
          {(['fly', 'swim', 'climb', 'burrow'] as ExtraSpeed[]).map(key => (
            <NumberField
              key={key}
              label={`${t(`gm.speed${key[0].toUpperCase()}${key.slice(1)}`)} (${t('gm.metersUnit')})`}
              value={b.speed[key]}
              nullable
              min={0}
              onChange={v => set({ speed: { ...b.speed, [key]: v } })}
            />
          ))}
        </div>
        {b.speed.fly != null && (
          <label className="flex items-center gap-2 text-[13px] text-[#E8DFD0]">
            <input type="checkbox" checked={b.speed.hover} onChange={e => set({ speed: { ...b.speed, hover: e.target.checked } })} />
            {t('gm.hover')}
          </label>
        )}
      </EditorSection>

      <EditorSection title={t('gm.sectionAbilities')}>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {ABILITIES.map(a => (
            <div key={a} className="flex flex-col gap-1">
              <NumberField
                label={`${t(`gm.abbr.${a}`)} ${formatModifier(abilityModifier(b, a))}`}
                value={b.abilities[a]}
                min={1}
                max={30}
                fallback={10}
                onChange={v => set({ abilities: { ...b.abilities, [a]: v ?? 10 } })}
              />
              <label className="flex items-center gap-1.5 text-[11px] text-[#A8A09B]" title={t('gm.saveProficient')}>
                <input
                  type="checkbox"
                  checked={b.save_proficiencies.includes(a)}
                  onChange={e => set({
                    save_proficiencies: e.target.checked
                      ? ABILITIES.filter(x => x === a || b.save_proficiencies.includes(x))
                      : b.save_proficiencies.filter(x => x !== a),
                  })}
                />
                {t('gm.saveShort')}
              </label>
            </div>
          ))}
        </div>
      </EditorSection>

      <EditorSection title={t('gm.sectionDetails')}>
        <Field label={t('gm.skillsLabel')}>
          <div className="flex flex-col gap-2">
            {Object.entries(b.skills).map(([id, bonus]) => (
              <div key={id} className="flex items-center gap-2">
                <span className="flex-1 text-[14px] text-[#E8DFD0]">{gameData.skills.find(s => s.id === id)?.name ?? id}</span>
                <input
                  type="number"
                  aria-label={gameData.skills.find(s => s.id === id)?.name ?? id}
                  value={bonus}
                  onChange={e => Number.isFinite(Number(e.target.value)) && set({ skills: { ...b.skills, [id]: Number(e.target.value) } })}
                  className="w-20 bg-[#131110] border border-white/[0.1] rounded-[8px] px-2 py-1.5 text-[14px] text-[#F5F0E8]"
                />
                <RemoveButton
                  label={t('gm.removeFeature')}
                  onClick={() => set({ skills: Object.fromEntries(Object.entries(b.skills).filter(([k]) => k !== id)) })}
                />
              </div>
            ))}
            {freeSkills.length > 0 && (
              <select
                value=""
                aria-label={t('gm.addSkill')}
                onChange={e => e.target.value && set({ skills: { ...b.skills, [e.target.value]: proficientSkillBonus(b, e.target.value) } })}
                className="bg-[#131110] border border-dashed border-white/[0.15] rounded-[8px] px-2.5 py-2 text-[14px] text-[#A8A09B]"
              >
                <option value="">{t('gm.addSkill')}</option>
                {freeSkills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            )}
          </div>
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <TextField label={t('gm.vulnerabilities')} value={b.vulnerabilities} onChange={vulnerabilities => set({ vulnerabilities })} />
          <TextField label={t('gm.resistances')} value={b.resistances} onChange={resistances => set({ resistances })} />
          <TextField label={t('gm.immunities')} value={b.immunities} onChange={immunities => set({ immunities })} />
        </div>

        <Field label={t('gm.conditionImmunities')}>
          <div className="flex flex-wrap gap-1.5">
            {AVAILABLE_CONDITIONS.map(c => {
              const on = b.condition_immunities.includes(c)
              return (
                <button
                  key={c}
                  type="button"
                  aria-pressed={on}
                  onClick={() => set({
                    condition_immunities: on
                      ? b.condition_immunities.filter(x => x !== c)
                      : AVAILABLE_CONDITIONS.filter(x => x === c || b.condition_immunities.includes(x)),
                  })}
                  className={`text-[12px] font-semibold rounded-full px-2.5 py-1 border cursor-pointer transition-colors ${
                    on ? 'bg-[#D4A017]/20 border-[#D4A017] text-[#F5F0E8]' : 'bg-transparent border-white/[0.12] text-[#A8A09B] hover:text-[#E8DFD0]'
                  }`}
                >
                  {translateTerm(c, i18n.language)}
                </button>
              )
            })}
          </div>
        </Field>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {([
            ['darkvision', t('gm.darkvision')],
            ['blindsight', t('gm.blindsight')],
            ['tremorsense', t('gm.tremorsense')],
            ['truesight', t('gm.truesight')],
          ] as Array<[SenseKey, string]>).map(([key, label]) => (
            <NumberField
              key={key}
              label={`${label} (${t('gm.metersUnit')})`}
              value={b.senses[key]}
              nullable
              min={0}
              onChange={v => set({ senses: { ...b.senses, [key]: v } })}
            />
          ))}
        </div>
        <TextField label={t('gm.languages')} value={b.languages} onChange={languages => set({ languages })} />
      </EditorSection>

      {FEATURE_LISTS.map(list => (
        <FeatureListEditor
          key={list}
          list={list}
          features={b[list]}
          onChange={features => set({ [list]: features } as Partial<StatBlock>)}
          legendaryUses={list === 'legendary_actions' ? b.legendary_uses : undefined}
          onLegendaryUses={legendary_uses => set({ legendary_uses })}
        />
      ))}
    </div>
  )
}

function RemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-[8px] text-[#b56a6a] bg-[rgba(181,57,47,0.1)] border border-[rgba(181,57,47,0.28)] hover:bg-[rgba(181,57,47,0.2)] cursor-pointer"
    >
      ×
    </button>
  )
}

interface FeatureListEditorProps {
  list: FeatureList
  features: StatBlockFeature[]
  onChange: (features: StatBlockFeature[]) => void
  legendaryUses?: number | null
  onLegendaryUses: (uses: number | null) => void
}

function FeatureListEditor({ list, features, onChange, legendaryUses, onLegendaryUses }: FeatureListEditorProps) {
  const { t } = useTranslation()
  const update = (id: string, change: Partial<StatBlockFeature>) =>
    onChange(features.map(f => (f.id === id ? { ...f, ...change } : f)))
  const moveUp = (idx: number) =>
    onChange([...features.slice(0, idx - 1), features[idx], features[idx - 1], ...features.slice(idx + 1)])

  return (
    <EditorSection title={t(`gm.lists.${list}`)}>
      {list === 'legendary_actions' && (
        <NumberField
          className="max-w-[220px]"
          label={t('gm.legendaryUses')}
          value={legendaryUses ?? null}
          nullable
          min={0}
          onChange={onLegendaryUses}
        />
      )}
      {features.map((f, idx) => (
        <div key={f.id} className="rounded-[10px] border border-white/[0.08] bg-white/[0.02] p-3 flex flex-col gap-2">
          <div className="flex gap-2 items-end">
            <TextField className="flex-1" label={t('gm.featureName')} value={f.name} onChange={name => update(f.id, { name })} />
            <TextField className="flex-1" label={t('gm.usage')} value={f.usage} placeholder={t('gm.usagePlaceholder')} onChange={usage => update(f.id, { usage })} />
            {idx > 0 && (
              <button
                type="button"
                onClick={() => moveUp(idx)}
                aria-label={t('gm.moveUp')}
                className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-[8px] text-[#A8A09B] bg-white/5 border border-white/[0.1] hover:text-[#E8DFD0] cursor-pointer"
              >
                ↑
              </button>
            )}
            <RemoveButton label={t('gm.removeFeature')} onClick={() => onChange(features.filter(x => x.id !== f.id))} />
          </div>
          <TextField label={t('gm.featureText')} value={f.description} multiline onChange={description => update(f.id, { description })} />
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <NumberField label={t('gm.attackBonus')} value={f.attack_bonus} nullable onChange={attack_bonus => update(f.id, { attack_bonus })} />
            <TextField
              label={t('gm.damage')}
              value={f.damage ?? ''}
              placeholder={t('gm.damagePlaceholder')}
              onChange={damage => update(f.id, { damage: damage.trim() ? damage : null })}
            />
            <TextField label={t('gm.damageType')} value={f.damage_type} onChange={damage_type => update(f.id, { damage_type })} />
            <NumberField label={t('gm.saveDc')} value={f.save_dc} nullable onChange={save_dc => update(f.id, { save_dc })} />
            <SelectField
              label={t('gm.saveAbility')}
              value={(f.save_ability ?? '') as AbilityId | ''}
              options={[{ value: '' as const, label: t('gm.none') }, ...ABILITIES.map(a => ({ value: a, label: t(`gm.abbr.${a}`) }))]}
              onChange={v => update(f.id, { save_ability: v === '' ? null : v })}
            />
          </div>
          {f.damage && !parseDice(f.damage) && (
            <p className="text-[11px] text-[#d4a04a]">{t('gm.damageInvalid')}</p>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...features, createBlankFeature()])}
        className="self-start text-[13px] font-semibold text-[#D4A017] hover:text-[#E8C25A] cursor-pointer"
      >
        + {t('gm.addFeature')}
      </button>
    </EditorSection>
  )
}
