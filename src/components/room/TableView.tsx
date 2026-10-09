import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { RoomDoc, TableCombatant, TableHealth } from '../../lib/room/protocol'
import { tableStateSchema } from '../../lib/room/protocol'
import { encounterStatusLabel } from '../../lib/gm/encounterStatus'
import { translateTerm } from '../../data/rules/translation'
import { TOKEN_FILL } from '../gm/tokenStyle'
import { EmptyState, MapIcon } from '../gm/ornaments'
import { TableMap } from './TableMap'

const HEALTH_STYLE: Record<TableHealth, string> = {
  unhurt: 'text-[#9fcf8f] border-[#6f9f5f]/50',
  wounded: 'text-[#E8C25A] border-[#D4A017]/50',
  bloodied: 'text-[#f0a090] border-[#c0473b]/60',
  down: 'text-[#A8A09B] border-white/20',
}

/**
 * A mesa que o mestre transmite: estado do combate, de quem é a vez, o mapa (se
 * o encontro tem um) e a ordem de iniciativa. Tudo já vem filtrado do mestre.
 */
export function TableView({ doc }: { doc: RoomDoc | undefined }) {
  const { t } = useTranslation()
  const table = useMemo(() => {
    if (!doc) return null
    const parsed = tableStateSchema.safeParse(doc.data)
    if (!parsed.success) console.error('[salas] Mesa fora do contrato.', parsed.error)
    return parsed.success ? parsed.data : null
  }, [doc])

  if (!table) return <EmptyState icon={<MapIcon size={34} />} title={t('room.tablePending')} />

  const turn = table.combatants.find(c => c.id === table.turn_id) ?? null
  return (
    <div className="flex flex-col gap-3">
      <div className="vg-card px-5 py-3.5" aria-live="polite">
        <div className="text-[13px] text-[#A8A09B] truncate">{table.name || t('gm.untitledEncounter')}</div>
        <div className={`text-[21px] font-extrabold leading-tight ${table.status === 'active' ? 'text-[#D4A017]' : 'text-[#EAD9B0]'}`}>
          {encounterStatusLabel(table, t)}
        </div>
        {turn && <div className="text-[15px] text-[#E8DFD0] truncate">{t('gm.turnOf', { name: turn.name })}</div>}
      </div>

      {table.map && <TableMap map={table.map} table={table} />}

      <ol className="flex flex-col gap-1.5">
        {table.combatants.map(c => <CombatantLine key={c.id} combatant={c} isTurn={c.id === table.turn_id} />)}
      </ol>
    </div>
  )
}

function CombatantLine({ combatant: c, isTurn }: { combatant: TableCombatant; isTurn: boolean }) {
  const { t, i18n } = useTranslation()
  return (
    <li
      aria-current={isTurn ? 'step' : undefined}
      className={`flex items-center gap-3 rounded-[10px] border px-3 py-2 ${
        isTurn ? 'border-[#D4A017] bg-[rgba(212,160,23,0.1)]' : 'border-white/[0.06] bg-[#131110]'
      } ${c.defeated ? 'opacity-60' : ''}`}
    >
      <span aria-hidden="true" className="w-3 h-3 flex-shrink-0 rounded-full" style={{ background: TOKEN_FILL[c.kind] }} />
      <span className="w-8 flex-shrink-0 text-right text-[13px] font-bold tabular-nums text-[#A8A09B]">{c.initiative ?? '—'}</span>
      <span className="min-w-0 flex-1">
        <span className={`block font-semibold text-[15px] text-[#F5F0E8] truncate ${c.defeated ? 'line-through' : ''}`}>{c.name}</span>
        {c.conditions.length > 0 && (
          <span className="block text-[12px] text-[#f6d6d1] truncate">
            {c.conditions.map(cond => translateTerm(cond, i18n.language)).join(' · ')}
          </span>
        )}
      </span>
      {c.hp ? (
        <span className="flex-shrink-0 text-[13px] font-bold tabular-nums text-[#E8DFD0]">
          {t('gm.hp')} {c.hp.current}/{c.hp.max}{c.hp.temp > 0 ? ` +${c.hp.temp}` : ''}
        </span>
      ) : (
        <span className={`flex-shrink-0 text-[12px] font-semibold rounded-full border px-2 py-0.5 ${HEALTH_STYLE[c.health]}`}>
          {t(`room.health.${c.health}`)}
        </span>
      )}
    </li>
  )
}
