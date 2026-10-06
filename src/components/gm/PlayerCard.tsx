import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { PartyMember } from '../../types'
import { gameData } from '../../data/rules'
import { summarizePlayer } from '../../lib/gm/party'
import { ABILITIES, calcPrimaryClassLevel, formatModifier } from '../../lib/calculations'
import { CharacterAvatar } from '../ui/CharacterAvatar'
import { gmSecondaryButton } from './GmHeader'

interface PlayerCardProps {
  member: PartyMember
  onReimport: () => void
  onRemove: () => void
}

function className(id: string | null): string {
  if (!id) return '—'
  return gameData.classes.find(c => c.id === id)?.name ?? id
}

function languageName(id: string): string {
  const all = [...gameData.languages.common, ...gameData.languages.rare]
  return all.find(l => l.id === id)?.name ?? id
}

/** Resumo de um player para o mestre: o que se consulta durante a sessão. */
export function PlayerCard({ member, onReimport, onRemove }: PlayerCardProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const p = summarizePlayer(member.snapshot)
  const name = p.name || t('gm.noName')

  const primaryLevel = calcPrimaryClassLevel(p.level, p.multiclasses)
  const classes = [
    `${className(p.classId)} ${primaryLevel}`,
    ...p.multiclasses.map(m => `${className(m.class_id)} ${m.level}`),
  ].join(' / ')
  const species = gameData.species?.find(s => s.id === p.speciesId)?.name

  const stats = [
    { label: t('gm.ac'), value: p.ac ?? '—' },
    { label: t('gm.hp'), value: p.hpMax ?? '—' },
    { label: t('gm.initiative'), value: formatModifier(p.initiative) },
    { label: t('gm.speed'), value: p.speedMeters != null ? t('gm.meters', { n: p.speedMeters }) : '—' },
    { label: t('gm.passivePerception'), value: p.passivePerception },
    ...(p.spellDc != null ? [{ label: t('gm.spellDc'), value: p.spellDc }] : []),
  ]

  return (
    <div data-testid="player-card" className="vg-card p-[18px_20px] flex flex-col gap-4">
      <div className="flex items-start gap-[14px]">
        <div className="w-12 h-12 rounded-[13px] flex-shrink-0 bg-[#221d18] border border-[rgba(212,160,23,0.3)] overflow-hidden">
          <CharacterAvatar name={p.name} id={member.id} size={48} />
        </div>
        <div className="min-w-0">
          <div className="font-bold text-[17px] text-[#F5F0E8] truncate">{name}</div>
          <div className="text-[13px] text-[#A8A09B] mt-[3px]">
            {classes}{species ? ` · ${species}` : ''}
          </div>
          <div className="text-[11px] text-[#A8A09B] mt-1">
            {p.player ? `${p.player} · ` : ''}
            {member.source === 'local'
              ? t('gm.sourceLocal')
              : t('gm.sourceImported', { date: new Date(member.imported_at).toLocaleDateString() })}
          </div>
        </div>
      </div>

      <dl className="grid grid-cols-3 gap-2">
        {stats.map(s => (
          <div key={s.label} className="rounded-[9px] bg-white/[0.03] border border-white/[0.06] px-2 py-1.5 text-center">
            <dt className="text-[10px] uppercase tracking-wider text-[#A8A09B]">{s.label}</dt>
            <dd className="text-[16px] font-bold text-[#F5F0E8]">{s.value}</dd>
          </div>
        ))}
      </dl>

      <div className="text-[12px] text-[#A8A09B] leading-relaxed">
        <div>
          <span className="font-semibold text-[#EAD9B0]">{t('gm.saves')}: </span>
          {ABILITIES.map(a => `${t(`gm.abbr.${a}`)} ${formatModifier(p.saves[a])}`).join(' · ')}
        </div>
        {p.darkvisionMeters ? (
          <div>
            <span className="font-semibold text-[#EAD9B0]">{t('gm.darkvision')}: </span>
            {t('gm.meters', { n: p.darkvisionMeters })}
          </div>
        ) : null}
        {p.languages.length > 0 && (
          <div>
            <span className="font-semibold text-[#EAD9B0]">{t('gm.languages')}: </span>
            {p.languages.map(languageName).join(', ')}
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-auto">
        {member.source === 'local' && member.sheet_id ? (
          <button onClick={() => navigate(`/ficha/${member.sheet_id}`)} className={`${gmSecondaryButton} flex-1 justify-center`}>
            {t('gm.openSheet')}
          </button>
        ) : (
          <button onClick={onReimport} className={`${gmSecondaryButton} flex-1 justify-center`}>
            {t('gm.reimport')}
          </button>
        )}
        <button
          onClick={() => {
            if (confirm(t('gm.removeConfirm', { name }))) onRemove()
          }}
          className="text-[13px] font-semibold text-[#b56a6a] bg-[rgba(181,57,47,0.1)] border border-[rgba(181,57,47,0.28)] hover:bg-[rgba(181,57,47,0.2)] rounded-[9px] px-3 py-2 cursor-pointer transition-colors"
        >
          {t('gm.remove')}
        </button>
      </div>
    </div>
  )
}
