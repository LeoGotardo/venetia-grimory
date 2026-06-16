import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ErrorBoundary } from './pages/ServerError'
import { NotFound } from './pages/NotFound'
import { useTranslation } from 'react-i18next'

const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })))
const Wizard = lazy(() => import('./pages/Wizard').then(m => ({ default: m.Wizard })))
const Ficha = lazy(() => import('./pages/Ficha').then(m => ({ default: m.Ficha })))

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
            <Route path="/ficha/:id" element={<Ficha />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
