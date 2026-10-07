import { useTranslation } from 'react-i18next'
import type { NpcProfile } from '../../types'
import { gameData } from '../../data/rules'
import { NPC_AGES } from '../../data/npcTables'

/**
 * Ficha de interpretação do NPC: o que o mestre lê em voz alta (aparência,
 * trejeito) e o que guarda para si (o que quer, segredo). Só leitura.
 */
export function NpcPortrait({ name, profile }: { name: string; profile: NpcProfile }) {
  const { t } = useTranslation()
  const species = gameData.species.find(s => s.id === profile.species)?.name ?? profile.species
  const age = (NPC_AGES as readonly string[]).includes(profile.age) ? t(`gm.npcGen.ages.${profile.age}`) : profile.age
  const archetype = profile.archetype ? t(`gm.npcGen.archetypes.${profile.archetype}`, { defaultValue: '' }) : ''
  const line = [species, age, archetype].filter(Boolean).join(' · ')

  const rows: Array<[string, string]> = ([
    ['personality', profile.personality],
    ['mannerism', profile.mannerism],
    ['motivation', profile.motivation],
    ['ideal', profile.ideal],
    ['bond', profile.bond],
    ['flaw', profile.flaw],
  ] as Array<[string, string]>).filter(([, v]) => v.trim() !== '')

  return (
    <article className="vg-card p-5 flex flex-col gap-3">
      <header>
        <h3 className="font-cinzel text-[19px] font-semibold text-[#EAD9B0] leading-tight">{name || t('gm.unnamed')}</h3>
        {line && <p className="text-[12px] text-[#A8A09B] mt-0.5">{line}</p>}
        {profile.occupation && <p className="text-[14px] text-[#E8DFD0] mt-1">{profile.occupation}</p>}
      </header>

      {profile.appearance && (
        <p className="text-[14px] leading-relaxed text-[#E8DFD0] italic border-t border-[rgba(212,160,23,0.15)] pt-3">{profile.appearance}</p>
      )}

      {rows.length > 0 && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-[13px] leading-snug">
          {rows.map(([field, value]) => (
            <div key={field} className="contents">
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#A8A09B] pt-[2px]">{t(`gm.npcGen.fields.${field}`)}</dt>
              <dd className="text-[#E8DFD0]">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      {profile.secret && (
        <div className="rounded-[10px] bg-[rgba(212,160,23,0.07)] border border-[rgba(212,160,23,0.2)] px-3 py-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#D4A017]">{t('gm.npcGen.fields.secret')}</div>
          <p className="text-[13px] leading-snug text-[#E8DFD0] mt-0.5">{profile.secret}</p>
        </div>
      )}
    </article>
  )
}
