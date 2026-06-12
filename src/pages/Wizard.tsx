import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useFichaStore } from '../store/fichaStore'
import { Step01Nivel } from '../components/wizard/Step01Nivel'
import { Step02Classe } from '../components/wizard/Step02Classe'
import { Step03Subclasse } from '../components/wizard/Step03Subclasse'
import { Step04Especie } from '../components/wizard/Step04Especie'
import { Step05Antecedente } from '../components/wizard/Step05Antecedente'
import { Step06Atributos } from '../components/wizard/Step06Atributos'
import { Step07Pericias } from '../components/wizard/Step07Pericias'
import { Step08Spells } from '../components/wizard/Step08Spells'
import { Step09Idiomas } from '../components/wizard/Step09Idiomas'
import { Step10Equipamento } from '../components/wizard/Step10Equipamento'
import { Step11Personalidade } from '../components/wizard/Step11Personalidade'
import { Step12Revisar } from '../components/wizard/Step12Revisar'

const PASSOS = [
  { id: 1,  titulo: 'Nível',         Comp: Step01Nivel },
  { id: 2,  titulo: 'Classe',        Comp: Step02Classe },
  { id: 3,  titulo: 'Subclasse',     Comp: Step03Subclasse },
  { id: 4,  titulo: 'Espécie',       Comp: Step04Especie },
  { id: 5,  titulo: 'Antecedente',   Comp: Step05Antecedente },
  { id: 6,  titulo: 'Atributos',     Comp: Step06Atributos },
  { id: 7,  titulo: 'Perícias',      Comp: Step07Pericias },
  { id: 8,  titulo: 'Magias',        Comp: Step08Spells },
  { id: 9,  titulo: 'Idiomas',       Comp: Step09Idiomas },
  { id: 10, titulo: 'Equipamento',   Comp: Step10Equipamento },
  { id: 11, titulo: 'Personalidade', Comp: Step11Personalidade },
  { id: 12, titulo: 'Revisar',       Comp: Step12Revisar },
]

export function Wizard() {
  const navigate = useNavigate()
  const { passoAtual, setPasso, novaFicha, fichaId } = useFichaStore()
  const [maxPasso, setMaxPasso] = useState(passoAtual)

  useEffect(() => {
    if (!fichaId) novaFicha()
  }, [])

  useEffect(() => {
    setMaxPasso(prev => Math.max(prev, passoAtual))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [passoAtual])

  const { Comp: StepComponent } = PASSOS[passoAtual - 1]

  return (
    <div className="h-screen bg-[#131110] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between h-[60px] px-7 bg-[#161311] border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#B8860B">
            <path d="M12 2l2.2 5.6L20 8.2l-4.4 3.9L17 18l-5-3.2L7 18l1.4-5.9L4 8.2l5.8-.6z"/>
          </svg>
          <span className="font-extrabold tracking-[0.04em] text-sm text-[#E8DFD0]">Venetia</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[13px] font-semibold text-[#8a8278]">
            Passo <span className="text-[#D4A017]">{passoAtual}</span> de 12
          </span>
          <button
            onClick={() => navigate('/')}
            aria-label="Fechar wizard"
            className="w-[34px] h-[34px] rounded-[9px] bg-white/5 border border-white/[0.09] text-[#A8A09B] hover:text-[#E8DFD0] flex items-center justify-center cursor-pointer transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
      </header>

      {/* Two-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-[296px] shrink-0 bg-[#17130f] border-r border-white/[0.06] px-5 py-7 overflow-y-auto">
          <h3 className="font-bold text-[13px] tracking-[0.12em] uppercase text-[#8a8278] mb-[18px] pl-1">
            Criação de personagem
          </h3>
          <nav className="flex flex-col gap-0.5" aria-label="Passos do wizard">
            {PASSOS.map(p => {
              const isDone    = p.id < passoAtual
              const isActive  = p.id === passoAtual
              const isLocked  = p.id > maxPasso

              return (
                <button
                  key={p.id}
                  onClick={() => !isLocked && setPasso(p.id)}
                  disabled={isLocked}
                  aria-current={isActive ? 'step' : undefined}
                  className={[
                    'flex items-center gap-[13px] px-3 py-[9px] rounded-[10px] text-left transition-colors w-full cursor-pointer',
                    isActive  ? 'bg-white/[0.07]' : '',
                    !isActive && !isLocked ? 'hover:bg-white/[0.04]' : '',
                    isLocked  ? 'opacity-40 cursor-default' : '',
                  ].join(' ')}
                >
                  {/* Number circle */}
                  <span className={[
                    'w-[26px] h-[26px] rounded-full flex-shrink-0 inline-flex items-center justify-center text-xs font-bold',
                    isDone   ? 'bg-[#D4A017] text-[#131110]' : '',
                    isActive ? 'bg-transparent border-2 border-[#D4A017] text-[#D4A017]' : '',
                    isLocked ? 'bg-white/5 border border-white/20 text-[#6B6560]' : '',
                    !isDone && !isActive && !isLocked ? 'bg-white/[0.06] border border-white/[0.15] text-[#8a8278]' : '',
                  ].join(' ')}>
                    {isDone
                      ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#131110" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                      : p.id
                    }
                  </span>
                  <span className={[
                    'text-sm font-semibold',
                    isActive  ? 'text-[#F5F0E8]' : '',
                    isDone    ? 'text-[#D4A017]' : '',
                    !isDone && !isActive ? 'text-[#8a8278]' : '',
                  ].join(' ')}>
                    {p.titulo}
                  </span>
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Content area */}
        <div className="flex-1 px-10 py-8 min-w-0 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={passoAtual}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
            >
              <StepComponent />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
