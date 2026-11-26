import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSheetStore } from '../../store/sheetStore'
import { loadSheet as validateSheet } from '../../services/sheetStorage'
import type { TableCombatant } from '../../lib/room/protocol'
import { CombatPanel } from '../sheet/CombatPanel'
import { AbilitiesPanel } from '../sheet/AbilitiesPanel'
import { SkillsPanel } from '../sheet/SkillsPanel'
import { ResourcesPanel } from '../sheet/ResourcesPanel'
import { SpellsPanel } from '../sheet/SpellsPanel'
import { InventoryPanel } from '../sheet/InventoryPanel'
import { gmSecondaryButton } from '../gm/GmHeader'

type SheetSection = 'combat' | 'abilities' | 'skills' | 'spells' | 'items'

/**
 * A ficha do player dentro da sala, sem sair da mesa: os mesmos painéis da
 * ficha (as edições valem e vão para o mestre), um assunto por sub-aba para
 * caber na tela sem rolar a página. O PV do combate é do mestre e não é o da
 * ficha — aparece à parte, com o nome certo, para não confundir.
 */
export default function RoomSheetTab({ sheetId, inCombat }: { sheetId: string | null; inCombat: TableCombatant | null }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { sheetId: loadedId, sheet, loadSheet } = useSheetStore()
  const exists = sheetId != null && validateSheet(sheetId) != null
  const [section, setSection] = useState<SheetSection>('combat')

  useEffect(() => {
    if (sheetId && exists && loadedId !== sheetId) loadSheet(sheetId)
  }, [sheetId, exists, loadedId, loadSheet])

  if (!sheetId || !exists) return <p className="text-[14px] text-[#A8A09B]">{t('room.sheetMissing')}</p>
  if (loadedId !== sheetId) return <p className="text-center text-[#A8A09B] py-8 animate-pulse">{t('loading.loading')}</p>

  const casts = sheet.spellcasting.spellcaster || sheet.spellcasting.free_casts.length > 0
  const sections: Array<{ id: SheetSection; label: string }> = [
    { id: 'combat', label: t('sheet.sectionCombat') },
    { id: 'abilities', label: t('sheet.sectionAttrs') },
    { id: 'skills', label: t('sheet.sectionSkills') },
    ...(casts ? [{ id: 'spells' as const, label: t('sheet.sectionMagic') }] : []),
    { id: 'items', label: t('sheet.sectionInventory') },
  ]
  const current = sections.some(s => s.id === section) ? section : 'combat'

  return (
    // Celular: sub-abas em linha no topo. Desktop: em coluna à esquerda, devolvendo a altura da linha.
    <div className="h-full min-h-0 flex flex-col gap-3 lg:grid lg:grid-cols-[176px_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)] lg:gap-4">
      <div className="flex flex-shrink-0 flex-wrap items-center gap-2 lg:flex-col lg:flex-nowrap lg:items-stretch lg:min-h-0">
        <div role="tablist" aria-label={t('room.mySheet')} className="flex w-full gap-1 overflow-x-auto no-scrollbar rounded-[10px] border border-white/[0.08] bg-[#131110] p-1 lg:flex-col">
          {sections.map(s => (
            <button
              key={s.id}
              role="tab"
              aria-selected={current === s.id}
              onClick={() => setSection(s.id)}
              className={`flex-shrink-0 min-h-[36px] px-3 rounded-[8px] text-[14px] font-semibold text-left cursor-pointer transition-colors ${
                current === s.id ? 'bg-[#D4A017] text-[#131110]' : 'text-[#E8DFD0] hover:bg-white/10'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        {inCombat?.hp && (
          <span title={t('room.sheetTab.sheetHpHint')} className="flex-1 min-w-0 truncate rounded-[10px] border border-white/[0.08] px-3 py-1.5 text-[13px] text-[#A8A09B] lg:flex-none lg:whitespace-normal lg:text-center">
            {t('room.sheetTab.combatHp')}{' '}
            <b className="text-[16px] tabular-nums text-[#F5F0E8]">
              {inCombat.hp.current}/{inCombat.hp.max}{inCombat.hp.temp > 0 ? ` +${inCombat.hp.temp}` : ''}
            </b>
          </span>
        )}
        <button onClick={() => navigate(`/ficha/${sheetId}`)} className={`${gmSecondaryButton} flex-shrink-0`}>{t('room.openMySheet')}</button>
      </div>

      {/* Só o assunto aberto rola por dentro, e só quando não cabe (perícias e itens num celular). */}
      <div role="tabpanel" data-testid="sala-ficha-secao" className="flex-1 min-h-0 overflow-y-auto">
        {current === 'combat' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
            <div className="vg-card p-4" data-testid="sala-ficha-combate">
              <CombatPanel />
            </div>
            <ResourcesPanel />
          </div>
        )}
        {current === 'abilities' && <div className="vg-card p-4"><AbilitiesPanel /></div>}
        {current === 'skills' && <div className="vg-card p-4"><SkillsPanel /></div>}
        {current === 'spells' && <div className="vg-card p-4"><SpellsPanel /></div>}
        {current === 'items' && <div className="vg-card p-4"><InventoryPanel /></div>}
      </div>
    </div>
  )
}
