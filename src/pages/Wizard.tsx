import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { useFichaStore } from '../store/fichaStore'
import { ConfigModal } from '../components/ui/ConfigModal'
import { VenetiaLogo } from '../components/ui/VenetiaLogo'
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

const PASSOS_COMPS = [
  { id: 1,  stepKey: 'nivel',        Comp: Step01Nivel },
  { id: 2,  stepKey: 'classe',       Comp: Step02Classe },
  { id: 3,  stepKey: 'subclasse',    Comp: Step03Subclasse },
  { id: 4,  stepKey: 'especie',      Comp: Step04Especie },
  { id: 5,  stepKey: 'atributos',    Comp: Step06Atributos },
  { id: 6,  stepKey: 'antecedente',  Comp: Step05Antecedente },
  { id: 7,  stepKey: 'pericias',     Comp: Step07Pericias },
  { id: 8,  stepKey: 'magias',       Comp: Step08Spells },
  { id: 9,  stepKey: 'idiomas',      Comp: Step09Idiomas },
  { id: 10, stepKey: 'equipamento',  Comp: Step10Equipamento },
  { id: 11, stepKey: 'personalidade', Comp: Step11Personalidade },
  { id: 12, stepKey: 'revisar',      Comp: Step12Revisar },
]

export function Wizard() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { passoAtual, setPasso, novaFicha, fichaId } = useFichaStore()
  const [maxPasso, setMaxPasso] = useState(passoAtual)
  const [configAberta, setConfigAberta] = useState(false)

  useEffect(() => {
    if (!fichaId) novaFicha()
  }, [])

  useEffect(() => {
    setMaxPasso(prev => Math.max(prev, passoAtual))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [passoAtual])

  const PASSOS = PASSOS_COMPS.map(p => ({
    ...p,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    titulo: t(`wizard.steps.${p.stepKey}` as any),
  }))

  const { Comp: StepComponent } = PASSOS[passoAtual - 1]

  return (
    <div className="min-h-screen bg-[#131110]">
      {/* Header — sticky */}
      <header className="sticky top-0 z-20 flex items-center justify-between h-[60px] px-4 sm:px-7 bg-[#161311] border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <VenetiaLogo />
          <span className="font-extrabold tracking-[0.04em] text-sm text-[#E8DFD0]">Venetia</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-[13px] font-semibold text-[#8a8278]">
            {t('wizard.step', { n: passoAtual })}
          </span>
          <button
            onClick={() => setConfigAberta(true)}
            aria-label={t('wizard.settings')}
            className="w-[34px] h-[34px] rounded-[9px] bg-white/5 border border-white/[0.09] text-[#A8A09B] hover:text-[#E8DFD0] flex items-center justify-center cursor-pointer transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </button>
          <button
            onClick={() => navigate('/')}
            aria-label={t('wizard.closeWizard')}
            className="w-[34px] h-[34px] rounded-[9px] bg-white/5 border border-white/[0.09] text-[#A8A09B] hover:text-[#E8DFD0] flex items-center justify-center cursor-pointer transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
      </header>

      <ConfigModal open={configAberta} onClose={() => setConfigAberta(false)} />

      {/* Mobile step progress — sticky below header */}
      <div className="md:hidden sticky top-[60px] z-10 bg-[#17130f] border-b border-white/[0.06] px-4 py-2">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-[#D4A017] rounded-full transition-all duration-300" style={{ width: `${(passoAtual / 12) * 100}%` }} />
          </div>
          <span className="text-xs font-semibold text-[#D4A017] whitespace-nowrap">{PASSOS[passoAtual - 1].titulo}</span>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex">
        {/* Sidebar — sticky */}
        <aside className="hidden md:block w-[296px] shrink-0 bg-[#17130f] border-r border-white/[0.06] px-5 py-7 sticky top-[60px] max-h-[calc(100vh-60px)] overflow-y-auto self-start">
          <h3 className="font-bold text-[13px] tracking-[0.12em] uppercase text-[#8a8278] mb-[18px] pl-1">
            {t('wizard.creationHeading')}
          </h3>
          <nav className="flex flex-col gap-0.5" aria-label={t('wizard.stepsAriaLabel')}>
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
        <div className="flex-1 px-4 sm:px-8 md:px-10 py-6 md:py-8 min-w-0">
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
