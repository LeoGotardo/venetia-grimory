import { lazy, Suspense, useCallback, useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { ErrorBoundary } from './pages/ServerError'
import { NotFound } from './pages/NotFound'
import { UpdatePrompt } from './components/ui/UpdatePrompt'
import { WhatsNewPrompt } from './components/ui/WhatsNewPrompt'
import { BackButtonBridge } from './components/ui/BackButtonBridge'
import { useRoomSyncEnabled } from './hooks/useRoomSyncEnabled'
import { useCloudAccount } from './hooks/useCloudAccount'
import { isCloudAvailable } from './lib/cloud/config'
import { DESKTOP_SIGN_IN_PATH } from './lib/desktopBridge'
import { useTranslation } from 'react-i18next'

const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })))
const Wizard = lazy(() => import('./pages/Wizard').then(m => ({ default: m.Wizard })))
const CharacterSheet = lazy(() => import('./pages/Sheet').then(m => ({ default: m.CharacterSheet })))
const About = lazy(() => import('./pages/About').then(m => ({ default: m.About })))
const Terms = lazy(() => import('./pages/Terms').then(m => ({ default: m.Terms })))
const Privacy = lazy(() => import('./pages/Privacy').then(m => ({ default: m.Privacy })))
const GmHome = lazy(() => import('./pages/gm/GmHome').then(m => ({ default: m.GmHome })))
const BestiaryPage = lazy(() => import('./pages/gm/BestiaryPage').then(m => ({ default: m.BestiaryPage })))
const MonsterEditPage = lazy(() => import('./pages/gm/MonsterEditPage').then(m => ({ default: m.MonsterEditPage })))
const NpcGeneratorPage = lazy(() => import('./pages/gm/NpcGeneratorPage').then(m => ({ default: m.NpcGeneratorPage })))
const NpcEditPage = lazy(() => import('./pages/gm/NpcEditPage').then(m => ({ default: m.NpcEditPage })))
const EncounterPage = lazy(() => import('./pages/gm/EncounterPage').then(m => ({ default: m.EncounterPage })))
const MapEditorPage = lazy(() => import('./pages/gm/MapEditorPage').then(m => ({ default: m.MapEditorPage })))
const AreaMapEditorPage = lazy(() => import('./pages/gm/AreaMapEditorPage').then(m => ({ default: m.AreaMapEditorPage })))
// Firebase só para quem tem conta vinculada neste aparelho.
const CloudSyncBridge = lazy(() => import('./components/ui/CloudSyncBridge').then(m => ({ default: m.CloudSyncBridge })))
const RoomSyncBridge = lazy(() => import('./components/room/RoomSyncBridge').then(m => ({ default: m.RoomSyncBridge })))
const RoomPage = lazy(() => import('./pages/RoomPage').then(m => ({ default: m.RoomPage })))
const GmRoomPage = lazy(() => import('./pages/gm/GmRoomPage').then(m => ({ default: m.GmRoomPage })))
const CampaignPage = lazy(() => import('./pages/gm/CampaignPage').then(m => ({ default: m.CampaignPage })))
// Aberta pelo app desktop no navegador do sistema; traz o Firebase, então só nela.
const DesktopSignIn = lazy(() => import('./pages/DesktopSignIn').then(m => ({ default: m.DesktopSignIn })))

function PageLoader() {
  const { t } = useTranslation()
  return (
    <div className="min-h-screen bg-[#131110] flex items-center justify-center">
      <span className="font-[Manrope,system-ui] text-[#D4A017] animate-pulse">{t('loading.loading')}</span>
    </div>
  )
}

/**
 * Novidades e atualização, um modal por vez: o aviso de atualização espera as
 * novidades fecharem. Fora da página de login do app desktop, que é só um passo
 * no navegador — um modal ali cobriria o botão.
 */
function AppPrompts() {
  const [notesDone, setNotesDone] = useState(false)
  const finishNotes = useCallback(() => setNotesDone(true), [])
  if (useLocation().pathname === DESKTOP_SIGN_IN_PATH) return null
  return (
    <>
      <WhatsNewPrompt onDone={finishNotes} />
      {notesDone && <UpdatePrompt />}
    </>
  )
}

function App() {
  const roomSync = useRoomSyncEnabled()
  const cloudLinked = useCloudAccount().profile !== null
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <BackButtonBridge />
        {cloudLinked && isCloudAvailable() && (
          <Suspense fallback={null}>
            <CloudSyncBridge />
          </Suspense>
        )}
        {roomSync && (
          <Suspense fallback={null}>
            <RoomSyncBridge />
          </Suspense>
        )}
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/novo" element={<Wizard />} />
            <Route path="/ficha/:id" element={<CharacterSheet />} />
            <Route path="/sobre" element={<About />} />
            <Route path="/termos" element={<Terms />} />
            <Route path="/privacidade" element={<Privacy />} />
            <Route path={DESKTOP_SIGN_IN_PATH} element={<DesktopSignIn />} />
            <Route path="/sala/:code" element={<RoomPage />} />
            <Route path="/mestre" element={<GmHome />} />
            <Route path="/mestre/campanha/:id" element={<CampaignPage />} />
            <Route path="/mestre/campanha/:id/sala" element={<GmRoomPage />} />
            <Route path="/mestre/campanha/:id/npc/gerar" element={<NpcGeneratorPage />} />
            <Route path="/mestre/campanha/:id/npc/:npcId" element={<NpcEditPage />} />
            <Route path="/mestre/campanha/:id/encontro/:encounterId" element={<EncounterPage />} />
            <Route path="/mestre/campanha/:id/mapa/:mapId" element={<MapEditorPage />} />
            <Route path="/mestre/campanha/:id/area/:mapId" element={<AreaMapEditorPage />} />
            <Route path="/mestre/bestiario" element={<BestiaryPage />} />
            <Route path="/mestre/bestiario/:monsterId" element={<MonsterEditPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <AppPrompts />
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
