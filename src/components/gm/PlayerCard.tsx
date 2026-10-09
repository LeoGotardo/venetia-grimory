import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { PartyMember } from '../../types'
import { gameData } from '../../data/rules'
import { summarizePlayer } from '../../lib/gm/party'
import { ABILITIES, calcPrimaryClassLevel, formatModifier } from '../../lib/calculations'
import { CharacterAvatar } from '../ui/CharacterAvatar'
import { classLabel, languageLabel } from './gameLabels'
import { gmSecondaryButton } from './GmHeader'

interface PlayerCardProps {
  member: PartyMember
  /** Sem `onReimport` e `onRemove` o cartão é só consulta (ex.: menção numa nota). */
  onReimport?: () => void
  onRemove?: () => void
}

/** Resumo de um player para o mestre: o que se consulta durante a sessão. */
export function PlayerCard({ member, onReimport, onRemove }: PlayerCardProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const p = summarizePlayer(member.snapshot)
  const name = p.name || t('gm.noName')
  const canOpenSheet = member.source === 'local' && member.sheet_id != null

  const primaryLevel = calcPrimaryClassLevel(p.level, p.multiclasses)
  const classes = [
    `${classLabel(p.classId)} ${primaryLevel}`,
    ...p.multiclasses.map(m => `${classLabel(m.class_id)} ${m.level}`),
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
    <div data-testid="player-card" className="vg-card p-6 flex flex-col gap-4 h-full">
      <div className="flex items-start gap-[14px]">
        <div className="w-14 h-14 rounded-[14px] flex-shrink-0 bg-[#221d18] border border-[rgba(212,160,23,0.3)] overflow-hidden">
          <CharacterAvatar name={p.name} id={member.id} size={56} />
        </div>
        <div className="min-w-0">
          <div className="font-cinzel font-semibold text-[20px] text-[#F5F0E8] truncate">{name}</div>
          <div className="text-[14px] text-[#E8DFD0] mt-[3px]">
            {classes}{species ? ` · ${species}` : ''}
          </div>
          <div className="text-[12px] text-[#A8A09B] mt-1">
            {p.player ? `${p.player} · ` : ''}
            {member.source === 'local'
              ? t('gm.sourceLocal')
              : t('gm.sourceImported', { date: new Date(member.imported_at).toLocaleDateString() })}
          </div>
        </div>
      </div>

      <dl className="grid grid-cols-3 gap-2">
        {stats.map(s => (
          <div key={s.label} className="rounded-[10px] bg-[#131110] border border-white/[0.06] px-2 py-2.5 text-center">
            <dt className="text-[11px] uppercase tracking-wider text-[#A8A09B]">{s.label}</dt>
            <dd className="text-[21px] font-bold text-[#F5F0E8] tabular-nums leading-tight mt-0.5">{s.value}</dd>
          </div>
        ))}
      </dl>

      <div className="text-[13px] text-[#A8A09B] leading-relaxed">
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
            {p.languages.map(languageLabel).join(', ')}
          </div>
        )}
      </div>

      {(canOpenSheet || onReimport || onRemove) && (
        <div className="flex gap-2 mt-auto">
          {canOpenSheet ? (
            <button onClick={() => navigate(`/ficha/${member.sheet_id}`)} className={`${gmSecondaryButton} flex-1 justify-center`}>
              {t('gm.openSheet')}
            </button>
          ) : onReimport && (
            <button onClick={onReimport} className={`${gmSecondaryButton} flex-1 justify-center`}>
              {t('gm.reimport')}
            </button>
          )}
          {onRemove && (
            <button
              onClick={() => {
                if (confirm(t('gm.removeConfirm', { name }))) onRemove()
              }}
              className="min-h-[42px] text-[14px] font-semibold text-[#b56a6a] bg-[rgba(181,57,47,0.1)] border border-[rgba(181,57,47,0.28)] hover:bg-[rgba(181,57,47,0.2)] rounded-[10px] px-3.5 py-2 cursor-pointer transition-colors"
            >
              {t('gm.remove')}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
