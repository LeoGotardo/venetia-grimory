import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })))
const Wizard = lazy(() => import('./pages/Wizard').then(m => ({ default: m.Wizard })))
const Ficha = lazy(() => import('./pages/Ficha').then(m => ({ default: m.Ficha })))

function PageLoader() {
  return (
    <div className="min-h-screen bg-[#2D2520] flex items-center justify-center">
      <span className="font-cinzel text-[#B8860B] animate-pulse">Carregando...</span>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/novo" element={<Wizard />} />
          <Route path="/ficha/:id" element={<Ficha />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
