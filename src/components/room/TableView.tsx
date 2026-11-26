import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import type { RoomDoc, TableCombatant, TableHealth, TableState } from '../../lib/room/protocol'
import { tableStateSchema } from '../../lib/room/protocol'
import type { Cell } from '../../lib/gm/terrain'
import { encounterStatusLabel } from '../../lib/gm/encounterStatus'
import { occupancyFor, occupiedCells, reachableCells, speedSquares } from '../../lib/gm/movement'
import { translateTerm } from '../../data/rules/translation'
import { GRID_CELL_METERS, ROOM_MOVE_WAIT_MS } from '../../constants'
import { useRoomStore } from '../../store/roomStore'
import { TOKEN_FILL } from '../gm/tokenStyle'
import { ChevronIcon, EmptyState, MapIcon, PlusIcon, ScrollIcon, SwordsIcon } from '../gm/ornaments'
import { gmPrimaryButton, gmSecondaryButton } from '../gm/GmHeader'
import { TableMap } from './TableMap'
import { asCreatureSize } from '../../lib/gm/tableView'
import { AttackModal } from './AttackModal'
import { SpellModal } from './SpellModal'
import { ItemModal } from './ItemModal'
import { usableItems } from '../../lib/turnActions'
import { AttackCard, HealCard, SaveCard } from './RoomEventCards'
import { readRoomSheet } from '../../hooks/useRoomSync'
import { DiceModeToggle } from './DiceModeToggle'

const HEALTH_STYLE: Record<TableHealth, string> = {
  unhurt: 'text-[#9fcf8f] border-[#6f9f5f]/50',
  wounded: 'text-[#E8C25A] border-[#D4A017]/50',
  bloodied: 'text-[#f0a090] border-[#c0473b]/60',
  down: 'text-[#A8A09B] border-white/20',
}

interface TableViewProps {
  doc: RoomDoc | undefined
  /** Membro deste aparelho: na vez do combatente dele, a mesa deixa mover e atacar. */
  memberId?: string | null
  /** Ficha com que o player entrou — de onde saem os ataques. */
  sheetId?: string | null
}

/** Casas que o combatente alcança neste turno, sem contar onde está nem as ocupadas (ninguém para no espaço de outro). */
function reachFor(table: TableState, mine: TableCombatant): Map<number, number> | null {
  const map = table.map
  if (!map || !mine.position || !mine.move) return null
  const occupants = table.combatants.map(c => ({ ...c, size: asCreatureSize(c.size) }))
  const mover = occupants.find(c => c.id === mine.id)!
  const reach = reachableCells(map, mine.position, speedSquares(mine.move.left_m), {
    mode: mine.move.mode,
    occupancy: occupancyFor(mover, occupants, map.width),
  })
  for (const c of occupants) for (const cell of occupiedCells(c)) reach.delete(cell.y * map.width + cell.x)
  return reach
}

/**
 * A mesa que o mestre transmite: estado do combate, de quem é a vez, o mapa (se
 * o encontro tem um) e a ordem de iniciativa. Tudo já vem filtrado do mestre.
 * Na vez do player: casas alcançáveis no mapa (toque escolhe, botão confirma) e
 * o botão de atacar.
 */
export function TableView({ doc, memberId = null, sheetId = null }: TableViewProps) {
  const { t } = useTranslation()
  const requestMove = useRoomStore(s => s.requestMove)
  const online = useRoomStore(s => s.status === 'online')
  const events = useRoomStore(s => s.events)
  const [target, setTarget] = useState<Cell | null>(null)
  const [pending, setPending] = useState<Cell | null>(null)
  const [refused, setRefused] = useState(false)
  const [attacking, setAttacking] = useState(false)
  const [casting, setCasting] = useState(false)
  const [usingItem, setUsingItem] = useState(false)
  const [orderOpen, setOrderOpen] = useState(false)

  const table = useMemo(() => {
    if (!doc) return null
    const parsed = tableStateSchema.safeParse(doc.data)
    if (!parsed.success) console.error('[salas] Mesa fora do contrato.', parsed.error)
    return parsed.success ? parsed.data : null
  }, [doc])

  const mine = (memberId && table?.combatants.find(c => c.member_id === memberId)) || null
  const myTurn = table != null && mine != null && table.status === 'active' && table.turn_id === mine.id
  const reach = useMemo(() => (table && mine && myTurn ? reachFor(table, mine) : null), [table, mine, myTurn])
  const position = mine?.position ? `${mine.position.x},${mine.position.y}` : null

  // O mestre aceitou (o token andou) ou não respondeu a tempo: sai do "aguardando".
  useEffect(() => {
    if (!pending) return
    if (position === `${pending.x},${pending.y}`) {
      const clear = setTimeout(() => setPending(null), 0)
      return () => clearTimeout(clear)
    }
    const timer = setTimeout(() => {
      setPending(null)
      setRefused(true)
    }, ROOM_MOVE_WAIT_MS)
    return () => clearTimeout(timer)
  }, [pending, position])

  if (!table) return <EmptyState icon={<MapIcon size={34} />} title={t('room.tablePending')} />

  const turn = table.combatants.find(c => c.id === table.turn_id) ?? null
  const targetCost = target && table.map ? reach?.get(target.y * table.map.width + target.x) ?? null : null
  // A última ação do player (ataque ou salvaguarda) fica à vista durante a vez dele.
  const lastAction = mine ? events.findLast(e => (e.kind === 'attack' || e.kind === 'save' || e.kind === 'heal') && e.payload.combatant_id === mine.id) ?? null : null
  const sheet = readRoomSheet(sheetId)
  const casts = sheet != null && (sheet.spellcasting.spellcaster || sheet.spellcasting.free_casts.length > 0)
  const hasItems = sheet != null && usableItems(sheet).length > 0

  function chooseCell(cell: Cell) {
    if (!table?.map || !reach) return
    setRefused(false)
    setTarget(reach.has(cell.y * table.map.width + cell.x) ? cell : null)
  }

  function confirmMove() {
    if (!mine || !target || !requestMove(mine.id, target)) return
    setPending(target)
    setTarget(null)
  }

  const hasMap = table.map != null
  const orderLines = table.combatants.map(c => <CombatantLine key={c.id} combatant={c} isTurn={c.id === table.turn_id} isMine={c.id === mine?.id} />)
  const actions = [
    { key: 'attack', show: true, icon: <SwordsIcon size={16} />, label: t('room.turn.attack'), open: () => setAttacking(true) },
    { key: 'cast', show: casts, icon: <ScrollIcon size={16} />, label: t('room.turn.cast'), open: () => setCasting(true) },
    { key: 'item', show: hasItems, icon: <PlusIcon size={16} />, label: t('room.turn.item'), open: () => setUsingItem(true) },
  ].filter(a => a.show)

  // Sem rolar a página: no celular, vez → mapa (na proporção dele, encolhe se faltar altura) →
  // ordem com o que sobra; no desktop, o mapa ocupa a altura e a coluna da vez fica ao lado.
  // `contents` deixa os filhos da coluna entrarem na ordem do celular.
  return (
    <div className={`h-full min-h-0 flex flex-col gap-3 ${hasMap ? 'lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:grid-rows-[minmax(0,1fr)] lg:gap-5' : 'w-full max-w-xl mx-auto'}`}>
      {table.map && (
        <div
          className="order-2 lg:order-none w-full min-h-[180px] flex-shrink aspect-[var(--map-ratio)] lg:aspect-auto lg:h-full lg:min-h-0"
          style={{ '--map-ratio': `${table.map.width} / ${table.map.height}` } as CSSProperties}
        >
          <TableMap
            map={table.map}
            table={table}
            reachable={reach}
            target={target}
            mineId={mine?.id ?? null}
            onCellTap={myTurn ? chooseCell : undefined}
          />
        </div>
      )}

      <aside className="contents lg:flex lg:flex-col lg:gap-3 lg:min-h-0">
        <section
          className={`order-1 lg:order-none flex-shrink-0 vg-card px-4 py-3 flex flex-col items-center gap-1 text-center ${myTurn ? '!border-[#D4A017]' : ''}`}
          aria-live="polite"
          data-testid="sala-vez"
        >
          <div className="flex w-full items-center justify-between gap-2">
            <span className="min-w-0 truncate text-left text-[12px] text-[#A8A09B]">{table.name || t('gm.untitledEncounter')}</span>
            {mine && <DiceModeToggle compact className="flex-shrink-0" />}
          </div>
          <div className={`text-[21px] font-extrabold leading-tight ${table.status === 'active' ? 'text-[#D4A017]' : 'text-[#EAD9B0]'}`}>
            {myTurn ? t('room.turn.yours') : encounterStatusLabel(table, t)}
          </div>
          {turn && !myTurn && <div className="max-w-full truncate text-[14px] text-[#E8DFD0]">{t('gm.turnOf', { name: turn.name })}</div>}
          {myTurn && mine?.move && (
            <div className="mt-1 flex w-full flex-col items-center gap-2">
              <p className="text-[14px] text-[#E8DFD0]">
                <b>{t('room.turn.movementLeft', { m: mine.move.left_m })}</b>
                {table.map && mine.position && reach && <span className="text-[#A8A09B]"> · {t('room.turn.tapHint')}</span>}
              </p>
              {target && targetCost != null && (
                <button disabled={!online} onClick={confirmMove} className={`${gmPrimaryButton} w-full`}>
                  {t('room.turn.moveHere', { m: targetCost * GRID_CELL_METERS })}
                </button>
              )}
              <div className="grid w-full gap-2" style={{ gridTemplateColumns: `repeat(${actions.length}, minmax(0, 1fr))` }}>
                {actions.map(a => (
                  <button key={a.key} disabled={!online} onClick={a.open} className={`${gmSecondaryButton} !px-2`}>
                    {a.icon} {a.label}
                  </button>
                ))}
              </div>
              {pending && <p role="status" className="text-[13px] text-[#E8C25A]">{t('room.turn.waitingGm')}</p>}
              {refused && <p role="status" className="text-[13px] text-[#f0a090]">{t('room.turn.moveRefused')}</p>}
            </div>
          )}
        </section>

        {myTurn && lastAction && (
          <ul className="order-1 lg:order-none flex-shrink-0">
            {lastAction.kind === 'attack' && <AttackCard event={lastAction} time="" mine />}
            {lastAction.kind === 'save' && <SaveCard event={lastAction} time="" mine />}
            {lastAction.kind === 'heal' && <HealCard event={lastAction} time="" mine />}
          </ul>
        )}

        {/* Desktop: a ordem inteira na coluna. Celular: um menu com a vez à mostra, aberto por cima do mapa. */}
        <ol aria-label={t('room.turn.order')} className="hidden lg:flex flex-1 min-h-0 overflow-y-auto flex-col gap-1.5">
          {orderLines}
        </ol>
      </aside>

      <div className="order-3 relative flex-shrink-0 lg:hidden">
        <button
          type="button"
          aria-expanded={orderOpen}
          onClick={() => setOrderOpen(o => !o)}
          className="w-full min-h-[44px] flex items-center justify-between gap-2 rounded-[10px] border border-white/[0.1] bg-[#131110] px-3 text-left text-[14px] font-semibold text-[#E8DFD0] cursor-pointer"
        >
          <span className="min-w-0 truncate">
            {t('room.turn.order')} ({table.combatants.length})
            {turn && <span className="font-normal text-[#A8A09B]"> · {t('gm.turnOf', { name: turn.name })}</span>}
          </span>
          <span className="flex-shrink-0"><ChevronIcon size={16} open={orderOpen} /></span>
        </button>
        {orderOpen && (
          <ol aria-label={t('room.turn.order')} className="absolute bottom-full inset-x-0 z-20 mb-2 max-h-[55dvh] overflow-y-auto flex flex-col gap-1.5 rounded-[12px] border border-white/[0.12] bg-[#1A1612] p-2 shadow-[0_-8px_30px_rgba(0,0,0,0.5)]">
            {orderLines}
          </ol>
        )}
      </div>

      {mine && (
        <>
          <AttackModal open={attacking} onClose={() => setAttacking(false)} table={table} mine={mine} sheetId={sheetId} />
          {casts && <SpellModal open={casting} onClose={() => setCasting(false)} table={table} mine={mine} sheetId={sheetId} />}
          {hasItems && <ItemModal open={usingItem} onClose={() => setUsingItem(false)} table={table} mine={mine} sheetId={sheetId} />}
        </>
      )}
    </div>
  )
}

function CombatantLine({ combatant: c, isTurn, isMine }: { combatant: TableCombatant; isTurn: boolean; isMine: boolean }) {
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
        <span className={`block font-semibold text-[15px] text-[#F5F0E8] truncate ${c.defeated ? 'line-through' : ''}`}>
          {c.name}
          {isMine && <span className="ml-1.5 text-[12px] font-normal text-[#E8C25A]">({t('room.you')})</span>}
        </span>
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
