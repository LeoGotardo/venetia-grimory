import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSheetStore } from '../store/sheetStore'
import { loadSheet as validateSheet } from '../services/sheetStorage'
import { useSheetExport } from '../hooks/useSheetExport'
import { VenetiaLogo } from '../components/ui/VenetiaLogo'
import { CombatPanel } from '../components/sheet/CombatPanel'
import { AbilitiesPanel } from '../components/sheet/AbilitiesPanel'
import { SkillsPanel } from '../components/sheet/SkillsPanel'
import { ResourcesPanel } from '../components/sheet/ResourcesPanel'
import { SpellsPanel } from '../components/sheet/SpellsPanel'
import { InventoryPanel } from '../components/sheet/InventoryPanel'
import { NotesPanel } from '../components/sheet/NotesPanel'
import { EditPanel } from '../components/sheet/EditPanel'
import { ExportMenu } from '../components/sheet/ExportMenu'
import { ConfigModal } from '../components/ui/ConfigModal'
import { LevelUpModal } from '../components/sheet/LevelUpModal'

import { XP_PER_LEVEL, formatModifier } from '../lib/calculations'
import { getBackgrounds } from '../data/backgrounds'
import { CharacterAvatar } from '../components/ui/CharacterAvatar'
import { gameData } from '../data/rules'

type Tab = 'sheet' | 'spells' | 'inventory' | 'notes' | 'edit'

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-[11px] mb-4">
      <span className="w-1 h-[19px] rounded-sm flex-shrink-0 bg-gradient-to-b from-[#E8C25A] to-[#B8860B]" />
      <h3 className="font-extrabold text-[17px] text-[#EAD9B0]">{children}</h3>
    </div>
  )
}

export function CharacterSheet() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { sheet, sheetId, loadSheet, addXP, updateHp } = useSheetStore()
  const { exportar } = useSheetExport()
  const [tab, setTab] = useState<Tab>('sheet')
  const [configOpen, setConfigOpen] = useState(false)
  const [levelUpOpen, setLevelUpOpen] = useState(false)
  const [xpInput, setXpInput] = useState('')
  const [hpDelta, setHpDelta] = useState('')

  useEffect(() => {
    if (!id) return
    if (id !== sheetId) {
      if (!validateSheet(id)) {
        navigate('/404', { replace: true })
      } else {
        loadSheet(id)
      }
    }
  }, [id])

  const identity = sheet.identity
  const charClass = gameData.classes.find(c => c.id === identity.class_id)
  const species = gameData.species?.find(e => e.id === identity.species_id)
  const background = getBackgrounds().find(a => a.id === identity.background_id)
  const subclass = charClass?.subclasses.find(s => s.id === identity.subclass_id)
  const multiclasses = identity.multiclasses ?? []
  const primaryLevel = identity.level - multiclasses.reduce((s, m) => s + m.level, 0)

  const currentXp = identity.xp
  const nextLevelXp = XP_PER_LEVEL[identity.level + 1]
  const xpPct = nextLevelXp ? Math.min(100, (currentXp / nextLevelXp) * 100) : 100
  const canLevelUp = nextLevelXp !== undefined && currentXp >= nextLevelXp && identity.level < 20

  const combat = sheet.combat
  const currentHp = combat.hit_points.current
  const maxHp = combat.hit_points.max ?? 0
  const hpPct = maxHp > 0 ? Math.min(100, (currentHp / maxHp) * 100) : 0
  const hpState = hpPct > 66 ? t('sheet.pvStates.healthy') : hpPct > 33 ? t('sheet.pvStates.wounded') : hpPct > 0 ? t('sheet.pvStates.critical') : t('sheet.pvStates.unconscious')
  const pvBarColor = hpPct > 50 ? '#5a9e52' : hpPct > 25 ? '#c9a32b' : '#d4564a'

  const darkvision = species?.traits?.find(t => t.name?.toLowerCase().includes('escuro'))
    ? '18 m'
    : '—'

  const passivePerception = 10 + (sheet.skills.percepcao._value ?? 0)

  const tabs = useMemo<Array<{ id: Tab; label: string }>>(
    () => [
      { id: 'sheet', label: t('sheet.tabOverview') },
      ...(sheet.spellcasting.spellcaster ? [{ id: 'spells' as Tab, label: t('sheet.tabMagic') }] : []),
      { id: 'inventory', label: t('sheet.tabInventory') },
      { id: 'notes', label: t('sheet.tabNotes') },
      { id: 'edit', label: t('sheet.tabEdit') },
    ],
    [sheet.spellcasting.spellcaster, t],
  )

  function handleGainXp() {
    const v = parseInt(xpInput)
    if (!isNaN(v) && v > 0) { addXP(v); setXpInput('') }
  }

  function handleAdjustHp(delta: number) {
    updateHp(delta)
    setHpDelta('')
  }

  const classLevel = (() => {
    if (multiclasses.length === 0) {
      return charClass ? `${charClass.name} ${identity.level}` : `Nível ${identity.level}`
    }
    const parts = [
      charClass ? `${charClass.name} ${primaryLevel}` : `? ${primaryLevel}`,
      ...multiclasses.map(m => {
        const mc = gameData.classes.find(c => c.id === m.class_id)
        return `${mc?.name ?? m.class_id} ${m.level}`
      }),
    ]
    return parts.join(' / ')
  })()

  const subclassLabel = (() => {
    if (multiclasses.length === 0) return subclass?.name ?? null
    const labels: string[] = []
    if (subclass) labels.push(subclass.name)
    for (const m of multiclasses) {
      if (m.subclass_id) {
        const mc = gameData.classes.find(c => c.id === m.class_id)
        const sub = mc?.subclasses.find(s => s.id === m.subclass_id)
        if (sub) labels.push(sub.name)
      }
    }
    return labels.length > 0 ? labels.join(' · ') : null
  })()

  const especieNome = species?.name ?? null
  const backgroundName = background?.name ?? null

  return (
    <div className="min-h-screen bg-[#131110]">
      {/* Topbar */}
      <header className="no-print sticky top-0 z-40 flex items-center justify-between h-[60px] px-4 sm:px-7 bg-[#161311] border-b border-white/[0.06]">
        <div className="flex items-center gap-[10px] sm:gap-[18px]">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-[#A8A09B] hover:text-[#E8DFD0] text-sm font-medium bg-transparent border-0 cursor-pointer transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            {t('sheet.back')}
          </button>
          <div className="hidden sm:block w-px h-[22px] bg-white/10" />
          <div className="hidden sm:flex items-center gap-2">
            <VenetiaLogo />
            <span className="font-extrabold tracking-[0.04em] text-sm text-[#E8DFD0]">Venetia</span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-[14px]">
          {/* XP input + button */}
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={1}
              value={xpInput}
              onChange={e => setXpInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGainXp()}
              placeholder="XP"
              aria-label={t('sheet.xpAriaLabel')}
              className="w-14 sm:w-16 bg-white/5 border border-white/10 rounded-[7px] px-2 py-1.5 text-[#F5F0E8] text-xs placeholder:text-[#6B6560] focus:outline-none focus:border-[rgba(212,160,23,0.5)]"
            />
            <button
              onClick={handleGainXp}
              disabled={!xpInput || parseInt(xpInput) <= 0}
              className="text-[13px] font-bold text-[#131110] bg-[#D4A017] hover:bg-[#E8C25A] border-0 rounded-[9px] px-[10px] sm:px-[14px] py-[9px] cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-default"
            >
              {t('sheet.addXp')}
            </button>
          </div>
          <button
            onClick={() => setConfigOpen(true)}
            aria-label={t('sheet.settings')}
            className="w-[34px] h-[34px] rounded-[9px] bg-white/5 border border-white/[0.09] text-[#A8A09B] hover:text-[#E8DFD0] flex items-center justify-center cursor-pointer transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </button>
          <ExportMenu onExportJson={() => exportar(identity.character_name)} />
          <span className="hidden sm:inline-flex items-center gap-[7px] text-[#7c9b6e] text-[13px] font-medium">
            <span className="w-[7px] h-[7px] rounded-full bg-[#7c9b6e]" />
            {t('sheet.saved')}
          </span>
        </div>
      </header>

      <ConfigModal open={configOpen} onClose={() => setConfigOpen(false)} />
      <LevelUpModal open={levelUpOpen} onClose={() => setLevelUpOpen(false)} newLevel={identity.level + 1} />

      {/* Main content */}
      <div className="max-w-[1180px] mx-auto px-4 sm:px-8 py-6 sm:py-8 pb-14">

        {/* Character header */}
        <div className="flex items-start justify-between gap-5 mb-7 flex-wrap">
          {/* Name + badges */}
          <div className="flex items-center gap-[14px]">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex-shrink-0 bg-[#221d18] border border-[rgba(212,160,23,0.35)] overflow-hidden">
              <CharacterAvatar name={identity.character_name} id={sheetId ?? id} size={64} />
            </div>
            <div className="min-w-0">
              <h2 className="font-extrabold text-[20px] sm:text-[26px] leading-tight tracking-tight text-[#F5F0E8] mb-2 truncate max-w-[200px] sm:max-w-none">
                {identity.character_name || t('sheet.noName')}
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[13px] font-bold text-[#131110] bg-[#D4A017] px-[10px] py-[3px] rounded-[7px]">
                  {classLevel}
                  {subclassLabel ? ` — ${subclassLabel}` : ''}
                </span>
                {especieNome && (
                  <span className="text-[13px] font-medium text-[#A8A09B] bg-white/5 border border-white/[0.08] px-[10px] py-[3px] rounded-[7px]">
                    {especieNome}
                  </span>
                )}
                {backgroundName && (
                  <span className="text-[13px] font-medium text-[#A8A09B] bg-white/5 border border-white/[0.08] px-[10px] py-[3px] rounded-[7px]">
                    {backgroundName}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* XP bar */}
          <div className="w-full sm:min-w-[300px] flex-1 sm:max-w-[360px]">
            <div className="flex items-center justify-between mb-[10px]">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-semibold tracking-[0.1em] uppercase text-[#6B6560]">{t('sheet.level')}</span>
                <span className="font-extrabold text-[22px] text-[#D4A017] leading-none">{identity.level}</span>
              </div>
              <span className="text-[13px] font-semibold text-[#A8A09B] whitespace-nowrap">
                {currentXp.toLocaleString()} / {nextLevelXp !== undefined ? nextLevelXp.toLocaleString() : '—'} XP
              </span>
            </div>
            {/* XP bar with shimmer */}
            <div className="h-2 rounded-[5px] bg-[#221d18] overflow-hidden relative">
              <div
                className="h-full rounded-[5px] transition-all duration-700"
                style={{ width: `${xpPct}%`, background: 'linear-gradient(90deg, #B8860B, #D4A017)' }}
              />
              <div
                className="absolute inset-0 rounded-[5px] pointer-events-none"
                style={{
                  width: `${xpPct}%`,
                  backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                  backgroundSize: '200% 100%',
                  animation: 'vg-shimmer 2.6s linear infinite',
                }}
              />
            </div>
            <div className="mt-2 flex items-center justify-end gap-[10px] min-h-[22px]">
              {canLevelUp ? (
                <button
                  onClick={() => setLevelUpOpen(true)}
                  className="text-xs font-bold text-[#131110] border-0 rounded-[7px] px-3 py-[5px] cursor-pointer"
                  style={{ background: 'linear-gradient(180deg,#E8C25A,#D4A017)' }}
                >
                  {t('sheet.levelUp')}
                </button>
              ) : (
                <span className="text-xs text-[#6B6560]">
                  {nextLevelXp !== undefined ? t('sheet.xpToNext', { n: (nextLevelXp - currentXp).toLocaleString() }) : t('sheet.maxLevel')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* KPI row: HP + CA + Iniciativa + Deslocamento */}
        <div className="grid grid-cols-2 md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-4 mb-[14px]">
          {/* HP card */}
          <div
            className="rounded-2xl p-3 sm:p-[18px_20px]"
            style={{
              background: 'rgba(181,57,47,0.08)',
              border: '1px solid rgba(181,57,47,0.42)',
              boxShadow: 'inset 0 0 0 5px #1c1512, inset 0 0 0 6px rgba(212,160,23,0.18)',
            }}
          >
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.08em] uppercase text-[#e0a3a3] mb-2">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#d4564a"><path d="M12 21s-7-4.35-9.5-8.5C.5 9 2 5 5.5 5 7.5 5 9 6.2 12 9c3-2.8 4.5-4 6.5-4C22 5 23.5 9 21.5 12.5 19 16.65 12 21 12 21z"/></svg>
              {t('sheet.hp')}
            </span>
            <div className="flex items-baseline gap-[5px] whitespace-nowrap mb-2">
              <span data-testid="hp-current" className="font-extrabold text-[34px] sm:text-[42px] leading-none text-[#F5F0E8] tracking-tight">{currentHp}</span>
              <span data-testid="hp-max" className="text-[16px] sm:text-[19px] font-semibold text-[#c98c8c]">/ {maxHp}</span>
            </div>
            {/* Quick HP adjust — linha própria, sem concorrer com o label */}
            <div className="flex items-center gap-1 mb-2">
              <input
                type="number"
                value={hpDelta}
                onChange={e => setHpDelta(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') { const n = parseInt(hpDelta); if (!isNaN(n)) handleAdjustHp(n) }
                }}
                placeholder="±"
                aria-label={t('sheet.pvDeltaAriaLabel')}
                className="w-14 text-center bg-black/20 border border-[rgba(181,57,47,0.4)] rounded-[6px] px-1 py-1 text-[#F5F0E8] text-xs focus:outline-none"
              />
              <button
                onClick={() => { const n = parseInt(hpDelta); if (!isNaN(n)) handleAdjustHp(-Math.abs(n)) }}
                aria-label={t('sheet.applyDamage')}
                className="w-7 h-7 rounded-[6px] bg-[rgba(181,57,47,0.18)] border border-[rgba(181,57,47,0.5)] text-[#e0a3a3] text-base font-bold cursor-pointer flex items-center justify-center hover:bg-[rgba(181,57,47,0.3)] transition-colors"
              >−</button>
              <button
                onClick={() => { const n = parseInt(hpDelta); if (!isNaN(n)) handleAdjustHp(Math.abs(n)) }}
                aria-label={t('sheet.applyHeal')}
                className="w-7 h-7 rounded-[6px] bg-[rgba(124,155,110,0.18)] border border-[rgba(124,155,110,0.5)] text-[#9cc090] text-base font-bold cursor-pointer flex items-center justify-center hover:bg-[rgba(124,155,110,0.3)] transition-colors"
              >+</button>
            </div>
            <div className="h-[7px] rounded bg-black/35 mt-[14px] overflow-hidden">
              <div
                className="h-full rounded transition-all duration-350"
                style={{ width: `${hpPct}%`, background: pvBarColor }}
              />
            </div>
            <div className="flex justify-between mt-[11px] text-xs text-[#c98c8c] font-medium">
              <span>{t('combat.hitDice')} {combat.hit_dice.type ?? '—'}</span>
              <span>{hpState}</span>
            </div>
          </div>

          {/* CA */}
          <div className="vg-card p-3 sm:p-[18px_20px] flex flex-col justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.08em] uppercase text-[#8a8278]">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#B8860B" strokeWidth="1.5"><path d="M12 2l7 3v6c0 4.5-3 8.5-7 9.5C8 19.5 5 15.5 5 11V5z"/></svg>
              {t('sheet.ac')}
            </span>
            <div data-testid="ac-value" className="font-extrabold text-[30px] sm:text-[38px] leading-none tracking-tight text-[#F5F0E8] mt-2 sm:mt-4">
              {combat.armor_class.value ?? '—'}
            </div>
          </div>

          {/* Iniciativa */}
          <div className="vg-card p-3 sm:p-[18px_20px] flex flex-col justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.08em] uppercase text-[#8a8278]">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#B8860B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h7l-1 8 10-12h-7z"/></svg>
              {t('sheet.init')}
            </span>
            <div className="font-extrabold text-[30px] sm:text-[38px] leading-none tracking-tight text-[#F5F0E8] mt-2 sm:mt-4">
              {combat.initiative._value !== null ? formatModifier(combat.initiative._value) : '—'}
            </div>
          </div>

          {/* Deslocamento */}
          <div className="vg-card p-3 sm:p-[18px_20px] flex flex-col justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.08em] uppercase text-[#8a8278]">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#B8860B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 4v7l5 3M4 7l3 2-2 4 4 1 1 5"/></svg>
              {t('sheet.speed')}
            </span>
            <div className="font-extrabold text-[30px] sm:text-[38px] leading-none tracking-tight text-[#F5F0E8] mt-2 sm:mt-4">
              {combat.speed._total_meters !== null ? (
                <>{combat.speed._total_meters}<span className="text-[14px] sm:text-[17px] text-[#6B6560] font-semibold"> {t('sheet.mUnit')}</span></>
              ) : '—'}
            </div>
          </div>
        </div>

        {/* Secondary stats row */}
        <div className="flex flex-wrap gap-[10px] mb-[30px]">
          {[
            { label: t('sheet.profBonus'), value: combat._proficiency_bonus !== null ? `+${combat._proficiency_bonus}` : '—', gold: true },
            { label: t('sheet.passivePerception'), value: String(passivePerception) },
            { label: t('sheet.darkvision'), value: darkvision },
          ].map(({ label, value, gold }) => (
            <div key={label} data-testid={`stat-${label}`} className="flex-1 min-w-[100px] flex flex-col sm:flex-row items-center justify-center gap-[4px] sm:gap-[9px] py-3 rounded-[12px] bg-[#1A1714] border border-[rgba(212,160,23,0.18)]">
              <span className="text-[11px] sm:text-[13px] text-[#8a8278] font-medium text-center">{label}</span>
              <span className={`font-extrabold text-[16px] ${gold ? 'text-[#D4A017]' : 'text-[#F5F0E8]'}`}>{value}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-[rgba(212,160,23,0.22)] mb-7 overflow-x-auto no-print" role="tablist" aria-label={t('wizard.stepsAriaLabel')}>
          {tabs.map(a => (
            <button
              key={a.id}
              role="tab"
              onClick={() => setTab(a.id)}
              aria-selected={tab === a.id}
              aria-controls={`tabpanel-${a.id}`}
              className={[
                'text-sm pb-[13px] border-b-2 mr-[22px] cursor-pointer whitespace-nowrap transition-colors focus-visible:outline-none',
                tab === a.id
                  ? 'font-bold text-[#F5F0E8] border-[#D4A017]'
                  : 'font-medium text-[#8a8278] border-transparent hover:text-[#A8A09B]',
              ].join(' ')}
            >
              {a.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div role="tabpanel" id={`tabpanel-${tab}`}>
          {tab === 'sheet' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
              <div className="space-y-7">
                <div className="vg-card p-5">
                  <SectionTitle>{t('sheet.sectionCombat')}</SectionTitle>
                  <CombatPanel />
                </div>
              </div>
              <div className="space-y-7">
                <div className="vg-card p-5">
                  <SectionTitle>{t('sheet.sectionAttrs')}</SectionTitle>
                  <AbilitiesPanel />
                </div>
                <div className="vg-card p-5">
                  <SectionTitle>{t('sheet.sectionSkills')}</SectionTitle>
                  <SkillsPanel />
                </div>
                <ResourcesPanel />
              </div>
            </div>
          )}

          {tab === 'spells' && (
            <div className="max-w-2xl">
              <div className="vg-card p-5">
                <SectionTitle>{t('sheet.sectionMagic')}</SectionTitle>
                <SpellsPanel />
              </div>
            </div>
          )}

          {tab === 'inventory' && (
            <div className="max-w-2xl">
              <div className="vg-card p-5">
                <SectionTitle>{t('sheet.sectionInventory')}</SectionTitle>
                <InventoryPanel />
              </div>
            </div>
          )}

          {tab === 'notes' && (
            <div className="max-w-2xl">
              <div className="vg-card p-5">
                <SectionTitle>{t('sheet.sectionNotes')}</SectionTitle>
                <NotesPanel />
              </div>
            </div>
          )}

          {tab === 'edit' && <EditPanel />}
        </div>
      </div>
    </div>
  )
}
