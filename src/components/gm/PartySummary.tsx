import { useTranslation } from 'react-i18next'
import type { PartyMember } from '../../types'
import { summarizePlayer } from '../../lib/gm/party'
import { encounterBudget } from '../../lib/gm/difficulty'
import { languageLabel } from './gameLabels'

/**
 * Coluna ao lado dos players: o grupo num relance (o que o mestre consulta para
 * montar encontros e responder "alguém percebe?") sem abrir cartão por cartão.
 */
export function PartySummary({ party }: { party: PartyMember[] }) {
  const { t } = useTranslation()
  const players = party.map(m => ({ id: m.id, ...summarizePlayer(m.snapshot) }))
  const levels = players.map(p => p.level)
  const avgLevel = levels.length ? Math.round((levels.reduce((a, b) => a + b, 0) / levels.length) * 10) / 10 : 0
  const hpTotal = players.reduce((sum, p) => sum + (p.hpMax ?? 0), 0)
  const budget = encounterBudget(levels, 0)
  const languages = [...new Set(players.flatMap(p => p.languages))].map(languageLabel).sort()
  const byPerception = [...players].sort((a, b) => b.passivePerception - a.passivePerception)

  return (
    <aside className="vg-card p-6 flex flex-col gap-5 lg:sticky lg:top-[88px]">
      <h2 className="font-cinzel text-[17px] font-semibold text-[#EAD9B0]">{t('gm.partySummary')}</h2>

      <dl className="grid grid-cols-3 gap-2 text-center">
        {([
          [t('gm.tabPlayers'), players.length],
          [t('gm.partyLevel'), avgLevel.toLocaleString()],
          [t('gm.partyHp'), hpTotal],
        ] as const).map(([label, value]) => (
          <div key={label} className="flex flex-col rounded-[10px] bg-[#131110] border border-white/[0.06] py-2.5">
            <dt className="order-last text-[11px] font-semibold text-[#A8A09B] mt-0.5">{label}</dt>
            <dd className="text-[22px] font-bold text-[#F5F0E8] tabular-nums leading-tight">{value}</dd>
          </div>
        ))}
      </dl>

      <section>
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#A8A09B] mb-2">{t('gm.atTheTable')}</h3>
        <table className="w-full text-[14px] tabular-nums">
          <thead>
            <tr className="text-[11px] text-[#A8A09B]">
              <th className="text-left font-semibold pb-1.5">{t('gm.name')}</th>
              <th className="text-right font-semibold pb-1.5">{t('gm.ac')}</th>
              <th className="text-right font-semibold pb-1.5">{t('gm.hp')}</th>
              <th className="text-right font-semibold pb-1.5" title={t('gm.passivePerception')}>{t('gm.passiveShort')}</th>
            </tr>
          </thead>
          <tbody>
            {byPerception.map(p => (
              <tr key={p.id} className="border-t border-white/[0.06]">
                <td className="py-2 pr-2 text-[#F5F0E8] font-semibold truncate max-w-[140px]">{p.name || t('gm.noName')}</td>
                <td className="py-2 text-right text-[#E8DFD0]">{p.ac ?? '—'}</td>
                <td className="py-2 text-right text-[#E8DFD0]">{p.hpMax ?? '—'}</td>
                <td className="py-2 text-right text-[#E8DFD0]">{p.passivePerception}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#A8A09B] mb-2">{t('gm.xpBudget')}</h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          {([['low', t('gm.difficultyLow')], ['moderate', t('gm.difficultyModerate')], ['high', t('gm.difficultyHigh')]] as const).map(([level, label]) => (
            <div key={level} className="rounded-[10px] border border-white/[0.06] py-2">
              <div className="text-[17px] font-bold text-[#F5F0E8] tabular-nums">{budget[level].toLocaleString()}</div>
              <div className="text-[11px] font-semibold text-[#A8A09B]">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {languages.length > 0 && (
        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#A8A09B] mb-1.5">{t('gm.partyLanguages')}</h3>
          <p className="text-[14px] text-[#E8DFD0] leading-relaxed">{languages.join(', ')}</p>
        </section>
      )}
    </aside>
  )
}
