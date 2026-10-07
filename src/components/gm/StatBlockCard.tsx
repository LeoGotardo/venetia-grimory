import { useTranslation } from 'react-i18next'
import type { StatBlock, StatBlockFeature } from '../../types'
import { gameData } from '../../data/rules'
import { translateTerm } from '../../data/rules/translation'
import { ABILITIES, formatModifier } from '../../lib/calculations'
import {
  FEATURE_LISTS,
  abilityModifier,
  crProficiencyBonus,
  crToXp,
  initiativeBonus,
  passivePerception,
  saveBonus,
} from '../../lib/gm/statblock'

interface StatBlockCardProps {
  block: StatBlock
}

function Line({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <p className="text-[13px] leading-relaxed text-[#E8DFD0]">
      <span className="font-bold text-[#EAD9B0]">{label} </span>
      {children}
    </p>
  )
}

/** Bloco de estatísticas no formato de 2024, só leitura. */
export function StatBlockCard({ block }: StatBlockCardProps) {
  const { t, i18n } = useTranslation()
  const m = (n: number | null) => (n == null ? null : t('gm.meters', { n }))

  const subtitle = [
    `${t('gm.sizeType', { size: t(`gm.sizes.${block.size}`), type: t(`gm.creatureTypes.${block.creature_type}`) })}${block.tags ? ` (${block.tags})` : ''}`,
    block.alignment,
  ].filter(Boolean).join(', ')

  const speeds = [
    m(block.speed.walk),
    block.speed.fly != null ? `${t('gm.speedFly').toLowerCase()} ${m(block.speed.fly)}${block.speed.hover ? ` (${t('gm.hover').toLowerCase()})` : ''}` : null,
    block.speed.swim != null ? `${t('gm.speedSwim').toLowerCase()} ${m(block.speed.swim)}` : null,
    block.speed.climb != null ? `${t('gm.speedClimb').toLowerCase()} ${m(block.speed.climb)}` : null,
    block.speed.burrow != null ? `${t('gm.speedBurrow').toLowerCase()} ${m(block.speed.burrow)}` : null,
  ].filter(Boolean).join(', ')

  const skills = Object.entries(block.skills)
    .map(([id, bonus]) => `${gameData.skills.find(s => s.id === id)?.name ?? id} ${formatModifier(bonus)}`)
    .join(', ')

  const senses = [
    block.senses.blindsight != null ? `${t('gm.blindsight').toLowerCase()} ${m(block.senses.blindsight)}` : null,
    block.senses.darkvision != null ? `${t('gm.darkvision').toLowerCase()} ${m(block.senses.darkvision)}` : null,
    block.senses.tremorsense != null ? `${t('gm.tremorsense').toLowerCase()} ${m(block.senses.tremorsense)}` : null,
    block.senses.truesight != null ? `${t('gm.truesight').toLowerCase()} ${m(block.senses.truesight)}` : null,
    `${t('gm.passivePerception')} ${passivePerception(block)}`,
  ].filter(Boolean).join(', ')

  const init = initiativeBonus(block)
  const immunities = [
    block.immunities,
    block.condition_immunities.map(c => translateTerm(c, i18n.language)).join(', '),
  ].filter(Boolean).join('; ')

  return (
    <article data-testid="statblock" className="rounded-[14px] bg-[#1A1714] border border-[rgba(212,160,23,0.25)] p-4 sm:p-5 flex flex-col gap-3">
      <header>
        <h3 className="font-extrabold text-[20px] text-[#F5F0E8] leading-tight">{block.name || t('gm.unnamed')}</h3>
        <p className="text-[13px] italic text-[#A8A09B]">{subtitle}</p>
      </header>

      <div className="border-t border-[rgba(212,160,23,0.25)] pt-3 flex flex-col gap-0.5">
        <Line label={t('gm.ac')}>
          {block.ac}{block.ac_note ? ` (${block.ac_note})` : ''}
          <span className="font-bold text-[#EAD9B0] ml-4">{t('gm.initiative')} </span>
          {formatModifier(init)} ({10 + init})
        </Line>
        <Line label={t('gm.hp')}>{block.hp.average}{block.hp.formula ? ` (${block.hp.formula})` : ''}</Line>
        <Line label={t('gm.speed')}>{speeds}</Line>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 border-t border-[rgba(212,160,23,0.25)] pt-3">
        {ABILITIES.map(a => (
          <div key={a} className="rounded-[8px] bg-white/[0.03] border border-white/[0.06] px-1 py-1.5 text-center">
            <div className="text-[11px] font-bold text-[#D4A017]">{t(`gm.abbr.${a}`)}</div>
            <div className="text-[15px] font-bold text-[#F5F0E8]">{block.abilities[a]}</div>
            <div className="text-[11px] text-[#A8A09B]">
              {formatModifier(abilityModifier(block, a))} · {t('gm.saveShort')} {formatModifier(saveBonus(block, a))}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-[rgba(212,160,23,0.25)] pt-3 flex flex-col gap-0.5">
        {skills && <Line label={t('gm.skillsLabel')}>{skills}</Line>}
        {block.vulnerabilities && <Line label={t('gm.vulnerabilities')}>{block.vulnerabilities}</Line>}
        {block.resistances && <Line label={t('gm.resistances')}>{block.resistances}</Line>}
        {immunities && <Line label={t('gm.immunities')}>{immunities}</Line>}
        <Line label={t('gm.sensesLabel')}>{senses}</Line>
        <Line label={t('gm.languages')}>{block.languages || '—'}</Line>
        <Line label={t('gm.cr')}>
          {t('gm.crLine', { cr: block.cr, xp: crToXp(block.cr).toLocaleString(i18n.language), pb: crProficiencyBonus(block.cr) })}
        </Line>
      </div>

      {FEATURE_LISTS.map(list => {
        const features = block[list]
        if (features.length === 0) return null
        return (
          <section key={list} className="border-t border-[rgba(212,160,23,0.25)] pt-3 flex flex-col gap-2">
            <h4 className="font-extrabold text-[14px] uppercase tracking-wider text-[#D4A017]">{t(`gm.lists.${list}`)}</h4>
            {list === 'legendary_actions' && block.legendary_uses != null && (
              <p className="text-[13px] text-[#A8A09B]">{t('gm.legendaryIntro', { n: block.legendary_uses })}</p>
            )}
            {features.map(f => <FeatureText key={f.id} feature={f} />)}
          </section>
        )
      })}

      {block.description && (
        <p className="border-t border-[rgba(212,160,23,0.25)] pt-3 text-[13px] leading-relaxed text-[#A8A09B] whitespace-pre-line">
          {block.description}
        </p>
      )}
    </article>
  )
}

function FeatureText({ feature: f }: { feature: StatBlockFeature }) {
  const { t } = useTranslation()
  // Texto do SRD já descreve ataque, dano e CD; repetir em linha separada só polui.
  const compact = f.description.replace(/\s+/g, '')
  const textCoversMechanics = f.damage
    ? compact.includes(f.damage)
    : f.save_dc != null && compact.includes(String(f.save_dc))
  const mechanics = textCoversMechanics ? '' : [
    f.attack_bonus != null ? t('gm.toHit', { bonus: formatModifier(f.attack_bonus) }) : null,
    f.damage ? t('gm.damageLine', { dice: f.damage, type: f.damage_type }).replace(' .', '.') : null,
    f.save_dc != null && f.save_ability
      ? t('gm.saveLine', { ability: t(`attrs.${f.save_ability}`), dc: f.save_dc })
      : null,
  ].filter(Boolean).join(' ')

  return (
    <p className="text-[13px] leading-relaxed text-[#E8DFD0] whitespace-pre-line">
      <span className="font-bold italic text-[#F5F0E8]">
        {f.name || t('gm.unnamed')}{f.usage ? ` (${f.usage})` : ''}.
      </span>{' '}
      {mechanics && <span className="text-[#EAD9B0]">{mechanics} </span>}
      {f.description}
    </p>
  )
}
