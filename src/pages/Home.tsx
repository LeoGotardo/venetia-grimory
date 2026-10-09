import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSheetStore } from '../store/sheetStore'
import { useSheetExport } from '../hooks/useSheetExport'
import type { SheetListItem } from '../store/sheetStore'

import { SettingsButton } from '../components/ui/SettingsButton'
import { AppFooter } from '../components/ui/AppFooter'
import { CharacterAvatar } from '../components/ui/CharacterAvatar'
import { VenetiaLogo } from '../components/ui/VenetiaLogo'
import { gameData } from '../data/rules'
import { useRoomSyncEnabled } from '../hooks/useRoomSyncEnabled'

// Salas online sob demanda: zod e o store da sala ficam fora da tela inicial de quem não usa.
const JoinRoomModal = lazy(() => import('../components/room/JoinRoomModal').then(m => ({ default: m.JoinRoomModal })))
const HomeRoomList = lazy(() => import('../components/room/HomeRoomList').then(m => ({ default: m.HomeRoomList })))

export function Home() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { savedSheets, newSheet, loadSheet, deleteSheet, loadSavedList } = useSheetStore()
  const { exportById, importSheet } = useSheetExport()
  const hasRooms = useRoomSyncEnabled()
  const [joinOpen, setJoinOpen] = useState(false)

  useEffect(() => { loadSavedList() }, [loadSavedList])

  const sortedSheets = useMemo(
    () => [...savedSheets].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [savedSheets],
  )

  function handleNew() { newSheet(); navigate('/novo') }
  function handleLoad(f: SheetListItem) {
    loadSheet(f.id)
    if (f.complete === false) {
      navigate('/novo')
    } else {
      navigate(`/ficha/${f.id}`)
    }
  }
  function handleDeletar(f: SheetListItem) {
    if (!confirm(t('home.deleteConfirm', { name: f.name }))) return
    deleteSheet(f.id)
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#131110] font-[Manrope,system-ui]">
      {/* Sticky navbar */}
      <header className="sticky top-0 z-10 flex items-center justify-between h-[60px] px-7 bg-[#161311] border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <VenetiaLogo />
          <span className="font-extrabold tracking-[0.04em] text-sm text-[#E8DFD0]">Venetia</span>
        </div>
        <div className="flex items-center gap-2">
        <button
          data-testid="entrar-sala"
          onClick={() => setJoinOpen(true)}
          aria-label={t('room.join')}
          className="inline-flex items-center gap-[7px] h-[34px] text-[13px] font-semibold text-[#E8DFD0] bg-white/5 hover:bg-white/10 border border-[rgba(212,160,23,0.25)] hover:border-[rgba(212,160,23,0.5)] rounded-[9px] px-3 cursor-pointer transition-colors"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4"/><path d="M10 16l4-4-4-4M14 12H4"/></svg>
          <span aria-hidden="true" className="hidden sm:inline">{t('room.join')}</span>
          <span aria-hidden="true" className="sm:hidden">{t('room.button')}</span>
        </button>
        <button
          data-testid="area-mestre"
          onClick={() => navigate('/mestre')}
          className="inline-flex items-center gap-[7px] h-[34px] text-[13px] font-semibold text-[#E8DFD0] bg-white/5 hover:bg-white/10 border border-[rgba(212,160,23,0.25)] hover:border-[rgba(212,160,23,0.5)] rounded-[9px] px-3 cursor-pointer transition-colors"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/></svg>
          {t('gm.area')}
        </button>
        <SettingsButton />
        </div>
      </header>

      {/* Main content */}
      <div className="w-full flex-1 max-w-[920px] mx-auto px-4 sm:px-8 py-10 sm:py-16 pb-6">
        {/* Hero */}
        <div className="text-center mb-10">
          <SwordsIcon />
          <h1 className="font-extrabold text-[28px] sm:text-[40px] tracking-tight leading-tight mt-5 mb-2 text-[#F5F0E8]">
            {t('home.title')}
          </h1>
          <p className="text-[16px] font-semibold text-[#D4A017]">{t('home.subtitle')}</p>
          <p className="text-[13px] text-[#6B6560] mt-1.5">
            {gameData.meta.font} · {gameData.meta.translation}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 justify-center mb-[52px]">
          <button
            onClick={handleNew}
            className="inline-flex items-center gap-[9px] text-[15px] font-bold text-[#131110] bg-[#D4A017] hover:bg-[#E8C25A] border-0 rounded-[11px] px-6 py-[14px] cursor-pointer transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            {t('home.createChar')}
          </button>
          <button
            onClick={importSheet}
            className="inline-flex items-center gap-[9px] text-[15px] font-semibold text-[#E8DFD0] bg-white/5 hover:bg-white/10 border border-[rgba(212,160,23,0.25)] hover:border-[rgba(212,160,23,0.5)] rounded-[11px] px-6 py-[14px] cursor-pointer transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
            {t('home.importJson')}
          </button>
        </div>

        {hasRooms && (
          <Suspense fallback={null}>
            <HomeRoomList />
          </Suspense>
        )}

        {/* Section header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-[11px]">
            <span className="w-1 h-[19px] rounded-sm bg-gradient-to-b from-[#E8C25A] to-[#B8860B]" />
            <h2 className="font-extrabold text-[17px] text-[#EAD9B0]">{t('home.savedChars')}</h2>
          </div>
          <span className="text-xs text-[#6B6560]">{sortedSheets.length}</span>
        </div>

        {sortedSheets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
            {sortedSheets.map(f => (
              <SheetCard
                key={f.id}
                sheet={f}
                onLoad={() => handleLoad(f)}
                onExport={() => exportById(f.id, f.name)}
                onDelete={() => handleDeletar(f)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-14 border border-dashed border-[rgba(212,160,23,0.25)] rounded-2xl">
            <p className="text-[#A8A09B] font-semibold">{t('home.noChars')}</p>
            <p className="text-[#6B6560] text-sm mt-1">{t('home.noCharsHint')}</p>
          </div>
        )}
      </div>

      {joinOpen && (
        <Suspense fallback={null}>
          <JoinRoomModal open onClose={() => setJoinOpen(false)} />
        </Suspense>
      )}
      <AppFooter />
    </div>
  )
}

interface SheetCardProps {
  sheet: SheetListItem
  onLoad: () => void
  onExport: () => void
  onDelete: () => void
}

function SheetCard({ sheet, onLoad, onExport, onDelete }: SheetCardProps) {
  const { t } = useTranslation()
  const charClass = gameData.classes.find(c => c.id === sheet.charClass)
  const species = gameData.species?.find(e => e.id === sheet.species)
  const formattedDate = new Date(sheet.updatedAt).toLocaleDateString()
  const incomplete = sheet.complete === false

  return (
    <div data-testid="sheet-card" className={`vg-card p-[18px_20px] ${incomplete ? 'border-[rgba(212,160,23,0.15)]' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-[14px]">
          <div className="w-12 h-12 rounded-[13px] flex-shrink-0 bg-[#221d18] border border-[rgba(212,160,23,0.3)] overflow-hidden">
            <CharacterAvatar name={sheet.name || null} id={sheet.id} size={48} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span data-testid="sheet-card-name" className="font-bold text-[17px] text-[#F5F0E8]">{sheet.name || t('home.noName')}</span>
              {incomplete && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#B8860B]/20 text-[#D4A017] border border-[#B8860B]/30">
                  {t('home.inCreation')}
                </span>
              )}
            </div>
            <div className="text-[13px] text-[#8a8278] mt-[3px]">
              {t('sheet.level')} {sheet.level} {charClass?.name ?? sheet.charClass} · {species?.name ?? sheet.species}
            </div>
          </div>
        </div>
        <span className="text-xs text-[#6B6560] whitespace-nowrap">{formattedDate}</span>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={onLoad}
          className="flex-1 inline-flex items-center justify-center gap-[7px] text-[13px] font-bold text-[#131110] bg-[#D4A017] hover:bg-[#E8C25A] border-0 rounded-[9px] py-[9px] cursor-pointer transition-colors"
        >
          {incomplete ? (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/><circle cx="12" cy="12" r="10"/></svg>
              {t('home.continueCreation')}
            </>
          ) : (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              {t('home.openSheet')}
            </>
          )}
        </button>
        <button
          onClick={onExport}
          className="inline-flex items-center gap-[6px] text-[13px] font-semibold text-[#A8A09B] hover:text-[#E8DFD0] bg-white/[0.04] border border-white/[0.08] rounded-[9px] px-[13px] py-[9px] cursor-pointer transition-colors"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 15v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4"/><path d="M7 9l5-5 5 5"/><path d="M12 4v12"/></svg>
          {t('home.export')}
        </button>
        <button
          onClick={onDelete}
          aria-label={t('home.deleteAriaLabel', { name: sheet.name })}
          className="inline-flex items-center justify-center text-[#b56a6a] bg-[rgba(181,57,47,0.1)] border border-[rgba(181,57,47,0.28)] hover:bg-[rgba(181,57,47,0.2)] rounded-[9px] px-[11px] py-[9px] cursor-pointer transition-colors"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
        </button>
      </div>
    </div>
  )
}

function SwordsIcon() {
  return (
    <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="#D4A017" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
      <path d="M14.5 17.5L3 6V3h3l11.5 11.5"/>
      <path d="M13 19l6-6"/>
      <path d="M16 16l4 4"/>
      <path d="M9.5 17.5L21 6V3h-3L6.5 14.5"/>
      <path d="M11 19l-6-6"/>
      <path d="M8 16l-4 4"/>
    </svg>
  )
}
