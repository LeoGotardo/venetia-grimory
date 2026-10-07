import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ErrorBoundary } from './pages/ServerError'
import { NotFound } from './pages/NotFound'
import { UpdatePrompt } from './components/ui/UpdatePrompt'
import { useTranslation } from 'react-i18next'

const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })))
const Wizard = lazy(() => import('./pages/Wizard').then(m => ({ default: m.Wizard })))
const CharacterSheet = lazy(() => import('./pages/Sheet').then(m => ({ default: m.CharacterSheet })))
const GmHome = lazy(() => import('./pages/gm/GmHome').then(m => ({ default: m.GmHome })))
const BestiaryPage = lazy(() => import('./pages/gm/BestiaryPage').then(m => ({ default: m.BestiaryPage })))
const MonsterEditPage = lazy(() => import('./pages/gm/MonsterEditPage').then(m => ({ default: m.MonsterEditPage })))
const NpcGeneratorPage = lazy(() => import('./pages/gm/NpcGeneratorPage').then(m => ({ default: m.NpcGeneratorPage })))
const NpcEditPage = lazy(() => import('./pages/gm/NpcEditPage').then(m => ({ default: m.NpcEditPage })))
const EncounterPage = lazy(() => import('./pages/gm/EncounterPage').then(m => ({ default: m.EncounterPage })))
const MapEditorPage = lazy(() => import('./pages/gm/MapEditorPage').then(m => ({ default: m.MapEditorPage })))
const CampaignPage = lazy(() => import('./pages/gm/CampaignPage').then(m => ({ default: m.CampaignPage })))

function PageLoader() {
  const { t } = useTranslation()
  return (
    <div className="min-h-screen bg-[#131110] flex items-center justify-center">
      <span className="font-[Manrope,system-ui] text-[#D4A017] animate-pulse">{t('loading.loading')}</span>
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/novo" element={<Wizard />} />
            <Route path="/ficha/:id" element={<CharacterSheet />} />
            <Route path="/mestre" element={<GmHome />} />
            <Route path="/mestre/campanha/:id" element={<CampaignPage />} />
            <Route path="/mestre/campanha/:id/npc/gerar" element={<NpcGeneratorPage />} />
            <Route path="/mestre/campanha/:id/npc/:npcId" element={<NpcEditPage />} />
            <Route path="/mestre/campanha/:id/encontro/:encounterId" element={<EncounterPage />} />
            <Route path="/mestre/campanha/:id/mapa/:mapId" element={<MapEditorPage />} />
            <Route path="/mestre/bestiario" element={<BestiaryPage />} />
            <Route path="/mestre/bestiario/:monsterId" element={<MonsterEditPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <UpdatePrompt />
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
