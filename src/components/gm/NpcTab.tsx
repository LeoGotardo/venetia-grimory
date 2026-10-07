import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Campaign, Npc } from '../../types'
import { gameData } from '../../data/rules'
import { useGmStore } from '../../store/gmStore'
import { gmPrimaryButton, gmSecondaryButton } from './GmHeader'
import { rowButton, rowDangerButton } from './MonsterRow'
import { MonsterPickerModal } from './MonsterPickerModal'
import { StatBlockModal } from './StatBlockModal'
import { AddToEncounterModal } from './AddToEncounterModal'
import { DiceIcon, EmptyState, QuillIcon, SectionTitle, SwordsIcon } from './ornaments'
import { NpcPortrait } from './NpcPortrait'
import { StatBlockCard } from './StatBlockCard'
import { useMediaQuery } from '../../hooks/useMediaQuery'

/** Aba NPCs da campanha: cada NPC é uma cópia própria do bloco, com perfil opcional. */
export function NpcTab({ campaign }: { campaign: Campaign }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { addNpc, duplicateNpc, removeNpc } = useGmStore()
  const [pickerOpen, setPickerOpen] = useState(false)
  // Desktop: lista + ficha ao lado. Celular: a ficha abre num modal.
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [viewing, setViewing] = useState<Npc | null>(null)
  const [toEncounter, setToEncounter] = useState<Npc | null>(null)
  const base = `/mestre/campanha/${campaign.id}/npc`

  const actions = (
    <>
      <button data-testid="npc-gerar" onClick={() => navigate(`${base}/gerar`)} className={gmPrimaryButton}>
        <DiceIcon size={16} /> {t('gm.npcGen.openGenerator')}
      </button>
      <button data-testid="npc-novo" onClick={() => navigate(`${base}/novo`)} className={gmSecondaryButton}>
        <QuillIcon size={15} /> {t('gm.fromScratch')}
      </button>
      <button onClick={() => setPickerOpen(true)} className={gmSecondaryButton}>
        {t('gm.fromBestiary')}
      </button>
    </>
  )

  const sorted = [...campaign.npcs].sort((a, b) => a.statblock.name.localeCompare(b.statblock.name))
  const selected = sorted.find(n => n.id === selectedId) ?? sorted[0] ?? null

  const rowActions = (npc: Npc) => (
    <>
      <button onClick={() => setToEncounter(npc)} className={rowButton} title={t('gm.addToEncounter')}>
        <span className="inline-flex items-center gap-1.5"><SwordsIcon size={15} />{t('gm.addToEncounter')}</span>
      </button>
      <button onClick={() => navigate(`${base}/${npc.id}`)} className={rowButton}>{t('gm.edit')}</button>
      <button onClick={() => duplicateNpc(npc.id)} className={rowButton}>{t('gm.duplicate')}</button>
      <button
        onClick={() => confirm(t('gm.npcDeleteConfirm', { name: npc.statblock.name })) && removeNpc(npc.id)}
        className={rowDangerButton}
      >
        {t('gm.remove')}
      </button>
    </>
  )

  return (
    <section>
      {campaign.npcs.length === 0 ? (
        <EmptyState icon={<QuillIcon size={34} />} title={t('gm.noNpcs')} hint={t('gm.noNpcsHint')}>
          {actions}
        </EmptyState>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-6">{actions}</div>
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(400px,520px)] gap-6 items-start">
            <div className="min-w-0">
              <SectionTitle align="start" count={campaign.npcs.length}>{t('gm.tabNpcs')}</SectionTitle>
              <ul className="grid grid-cols-1 2xl:grid-cols-2 gap-2.5">
                {sorted.map(npc => (
                  <li key={npc.id}>
                    <NpcRow
                      npc={npc}
                      selected={isDesktop && npc.id === selected?.id}
                      onOpen={() => (isDesktop ? setSelectedId(npc.id) : setViewing(npc))}
                      actions={isDesktop ? null : rowActions(npc)}
                    />
                  </li>
                ))}
              </ul>
            </div>

            {isDesktop && selected && (
              <aside className="sticky top-[88px] max-h-[calc(100dvh-108px)] overflow-y-auto flex flex-col gap-3 pr-1">
                <div className="flex flex-wrap gap-1.5">{rowActions(selected)}</div>
                {selected.profile && <NpcPortrait name={selected.statblock.name} profile={selected.profile} />}
                <StatBlockCard block={selected.statblock} />
                {selected.notes && (
                  <p className="vg-card p-5 text-[14px] leading-relaxed text-[#E8DFD0] whitespace-pre-line">{selected.notes}</p>
                )}
              </aside>
            )}
          </div>
        </>
      )}

      <MonsterPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={monster => {
          addNpc(structuredClone(monster.statblock), monster.source === 'custom' ? monster.id : null)
          setPickerOpen(false)
        }}
      />
      <StatBlockModal
        block={viewing?.statblock ?? null}
        notes={viewing?.notes}
        profile={viewing?.profile ?? null}
        onClose={() => setViewing(null)}
      />
      <AddToEncounterModal npc={toEncounter} campaign={campaign} onClose={() => setToEncounter(null)} />
    </section>
  )
}

/** Linha do NPC: monograma, nome, quem é (ocupação, espécie) e os números de combate. */
function NpcRow({ npc, onOpen, actions, selected }: { npc: Npc; onOpen: () => void; actions: ReactNode; selected: boolean }) {
  const { t } = useTranslation()
  const b = npc.statblock
  const p = npc.profile
  const species = p ? gameData.species.find(s => s.id === p.species)?.name ?? '' : ''
  const who = p ? [p.occupation, species].filter(Boolean).join(' · ') : t('gm.sizeType', { size: t(`gm.sizes.${b.size}`), type: t(`gm.creatureTypes.${b.creature_type}`) })

  return (
    <div className={`h-full flex flex-col gap-2.5 rounded-[12px] border px-4 py-3.5 transition-colors ${
      selected ? 'border-[#D4A017] bg-[rgba(212,160,23,0.08)]' : 'border-white/[0.07] bg-[#1A1714] hover:border-[rgba(212,160,23,0.3)]'
    }`}>
      <button onClick={onOpen} aria-pressed={selected} className="flex items-center gap-3.5 min-w-0 text-left cursor-pointer">
        <span aria-hidden="true" className="w-12 h-12 flex-shrink-0 rounded-full border border-[rgba(212,160,23,0.45)] bg-[#131110] flex items-center justify-center font-cinzel text-[20px] font-semibold text-[#D4A017]">
          {(b.name.trim()[0] ?? '?').toUpperCase()}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-bold text-[17px] text-[#F5F0E8] truncate">{b.name || t('gm.unnamed')}</span>
          <span className="block text-[13px] text-[#E8DFD0] truncate">{who}</span>
          {p?.motivation && <span className="block text-[13px] text-[#A8A09B] truncate">{p.motivation}</span>}
        </span>
        <span className="flex-shrink-0 text-right text-[13px] text-[#A8A09B] tabular-nums leading-snug">
          <span className="block">{t('gm.cr')} <b className="text-[#E8DFD0]">{b.cr}</b></span>
          <span className="block">{t('gm.ac')} <b className="text-[#E8DFD0]">{b.ac}</b> · {t('gm.hp')} <b className="text-[#E8DFD0]">{b.hp.average}</b></span>
        </span>
      </button>
      {actions && <div className="flex flex-wrap gap-1.5 pl-[62px]">{actions}</div>}
    </div>
  )
}
