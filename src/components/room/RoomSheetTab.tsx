import { useEffect } from 'react'
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
import { SectionTitle } from '../gm/ornaments'
import { gmSecondaryButton } from '../gm/GmHeader'

/**
 * A ficha do player dentro da sala, sem sair da mesa: os mesmos painéis da
 * ficha (as edições valem e vão para o mestre). O PV do combate é do mestre e
 * não é o da ficha — aparece à parte, com o nome certo, para não confundir.
 */
export default function RoomSheetTab({ sheetId, inCombat }: { sheetId: string | null; inCombat: TableCombatant | null }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { sheetId: loadedId, sheet, loadSheet } = useSheetStore()
  const exists = sheetId != null && validateSheet(sheetId) != null

  useEffect(() => {
    if (sheetId && exists && loadedId !== sheetId) loadSheet(sheetId)
  }, [sheetId, exists, loadedId, loadSheet])

  if (!sheetId || !exists) return <p className="text-[14px] text-[#A8A09B]">{t('room.sheetMissing')}</p>
  if (loadedId !== sheetId) return <p className="text-center text-[#A8A09B] py-8 animate-pulse">{t('loading.loading')}</p>

  const casts = sheet.spellcasting.spellcaster || sheet.spellcasting.free_casts.length > 0
  return (
    <div className="flex flex-col gap-5">
      {inCombat?.hp && (
        <div className="vg-card px-4 py-3 flex items-center justify-between gap-3">
          <span className="text-[13px] text-[#A8A09B]">{t('room.sheetTab.combatHp')}</span>
          <span className="text-[18px] font-extrabold tabular-nums text-[#F5F0E8]">
            {inCombat.hp.current}/{inCombat.hp.max}{inCombat.hp.temp > 0 ? ` +${inCombat.hp.temp}` : ''}
          </span>
        </div>
      )}
      <div className="vg-card p-4">
        <SectionTitle align="start">{t('sheet.sectionCombat')}</SectionTitle>
        {inCombat?.hp && <p className="text-[12px] text-[#A8A09B] mb-3">{t('room.sheetTab.sheetHpHint')}</p>}
        <CombatPanel />
      </div>
      <ResourcesPanel />
      <div className="vg-card p-4">
        <SectionTitle align="start">{t('sheet.sectionAttrs')}</SectionTitle>
        <AbilitiesPanel />
      </div>
      <div className="vg-card p-4">
        <SectionTitle align="start">{t('sheet.sectionSkills')}</SectionTitle>
        <SkillsPanel />
      </div>
      {casts && (
        <div className="vg-card p-4">
          <SectionTitle align="start">{t('sheet.sectionMagic')}</SectionTitle>
          <SpellsPanel />
        </div>
      )}
      <button onClick={() => navigate(`/ficha/${sheetId}`)} className={`${gmSecondaryButton} self-start`}>{t('room.openMySheet')}</button>
    </div>
  )
}
