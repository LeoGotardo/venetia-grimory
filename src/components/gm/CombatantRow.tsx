import { useTranslation } from 'react-i18next'
import type { Combatant } from '../../types'
import { translateTerm } from '../../data/rules/translation'

interface CombatantRowProps {
  combatant: Combatant
  active: boolean
  selected: boolean
  onSelect: () => void
  onInitiative: (value: number | null) => void
}

const KIND_STYLE = {
  player: 'bg-[#2b4a6b]/40 text-[#9cc3ea] border-[#2b4a6b]',
  npc: 'bg-[#5a4a1e]/40 text-[#e8cf86] border-[#5a4a1e]',
  monster: 'bg-[#6b2b2b]/40 text-[#e8a39b] border-[#6b2b2b]',
} as const

const KIND_LABEL = { player: 'gm.kindPlayer', npc: 'gm.kindNpc', monster: 'gm.kindMonster' } as const

/** Linha da ordem de iniciativa. A iniciativa é editável direto na linha. */
export function CombatantRow({ combatant: c, active, selected, onSelect, onInitiative }: CombatantRowProps) {
  const { t, i18n } = useTranslation()
  const pct = c.hp.max > 0 ? (c.hp.current / c.hp.max) * 100 : 0
  const barColor = pct > 50 ? 'bg-[#6f9f5f]' : pct > 25 ? 'bg-[#D4A017]' : 'bg-[#c0473b]'

  return (
    <li
      data-testid="combatente"
      className={`flex items-stretch gap-2 rounded-[11px] border px-2 py-2 transition-colors ${
        active ? 'border-[#D4A017] bg-[#2a2216]' : selected ? 'border-white/[0.25] bg-[#211c18]' : 'border-white/[0.07] bg-[#1A1714]'
      } ${c.defeated ? 'opacity-50' : ''}`}
    >
      <input
        type="number"
        inputMode="numeric"
        value={c.initiative ?? ''}
        onChange={e => onInitiative(e.target.value === '' ? null : Number(e.target.value))}
        aria-label={`${t('gm.initiative')} — ${c.name}`}
        className="w-12 flex-shrink-0 text-center bg-[#131110] border border-white/[0.1] rounded-[8px] text-[16px] font-bold text-[#F5F0E8] focus:outline-none focus:border-[#D4A017]"
      />
      <button onClick={onSelect} aria-pressed={selected} className="flex-1 min-w-0 text-left cursor-pointer">
        <div className="flex items-center gap-1.5 min-w-0">
          {active && <span className="text-[#D4A017]" aria-hidden="true">▶</span>}
          <span className={`font-bold text-[15px] text-[#F5F0E8] truncate ${c.defeated ? 'line-through' : ''}`}>{c.name}</span>
          <span className={`flex-shrink-0 text-[10px] font-bold uppercase tracking-wider px-1.5 py-px rounded border ${KIND_STYLE[c.kind]}`}>
            {t(KIND_LABEL[c.kind])}
          </span>
          {c.concentration && (
            <span title={t('gm.concentrating')} className="flex-shrink-0 text-[10px] font-bold px-1.5 py-px rounded border border-[#7a5bb5] text-[#c7b1ef]">C</span>
          )}
          {c.hidden && <span className="flex-shrink-0 text-[10px] text-[#A8A09B]">({t('gm.hiddenLabel')})</span>}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[12px] text-[#A8A09B] flex-shrink-0">{t('gm.ac')} {c.ac}</span>
          <div className="flex-1 h-1.5 rounded-full bg-white/[0.08] overflow-hidden" aria-hidden="true">
            <div className={`h-full ${barColor}`} style={{ width: `${pct}%` }} />
          </div>
          <span className="text-[12px] font-semibold text-[#E8DFD0] flex-shrink-0 tabular-nums">
            {c.hp.current}/{c.hp.max}{c.hp.temp > 0 ? ` +${c.hp.temp}` : ''}
          </span>
        </div>
        {c.conditions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {c.conditions.map(cond => (
              <span key={cond} className="text-[10px] font-semibold px-1.5 py-px rounded bg-[#6b2b2b]/50 text-[#f0c4be]">
                {translateTerm(cond, i18n.language)}
              </span>
            ))}
          </div>
        )}
      </button>
    </li>
  )
}
