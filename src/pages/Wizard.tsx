import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { useSheetStore } from '../store/sheetStore'
import { ConfigModal } from '../components/ui/ConfigModal'
import { VenetiaLogo } from '../components/ui/VenetiaLogo'
import { Step01Level } from '../components/wizard/Step01Level'
import { Step02Class } from '../components/wizard/Step02Class'
import { Step03Subclass } from '../components/wizard/Step03Subclass'
import { Step04Species } from '../components/wizard/Step04Species'
import { Step05Background } from '../components/wizard/Step05Background'
import { Step06Abilities } from '../components/wizard/Step06Abilities'
import { Step07Skills } from '../components/wizard/Step07Skills'
import { StepMulticlass } from '../components/wizard/StepMulticlass'
import { Step08Spells } from '../components/wizard/Step08Spells'
import { Step09Languages } from '../components/wizard/Step09Languages'
import { Step10Equipment } from '../components/wizard/Step10Equipment'
import { Step11Personality } from '../components/wizard/Step11Personality'
import { Step12Review } from '../components/wizard/Step12Review'

const STEP_COMPONENTS = [
  { id:  1, stepKey: 'level', Comp: Step01Level },
  { id:  2, stepKey: 'charClass', Comp: Step02Class },
  { id:  3, stepKey: 'subclass', Comp: Step03Subclass },
  { id:  4, stepKey: 'species', Comp: Step04Species },
  { id:  5, stepKey: 'abilities', Comp: Step06Abilities },
  { id:  6, stepKey: 'background', Comp: Step05Background },
  { id:  7, stepKey: 'multiclass', Comp: StepMulticlass },
  { id:  8, stepKey: 'skills', Comp: Step07Skills },
  { id:  9, stepKey: 'spells', Comp: Step08Spells },
  { id: 10, stepKey: 'languages', Comp: Step09Languages },
  { id: 11, stepKey: 'equipment', Comp: Step10Equipment },
  { id: 12, stepKey: 'personality', Comp: Step11Personality },
  { id: 13, stepKey: 'review', Comp: Step12Review },
]

export function Wizard() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { currentStep, setStep, newSheet, sheetId } = useSheetStore()
  const [maxStep, setMaxStep] = useState(currentStep)
  const [configOpen, setConfigOpen] = useState(false)

  useEffect(() => {
    if (!sheetId) newSheet()
  }, [])

  useEffect(() => {
    setMaxStep(prev => Math.max(prev, currentStep))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentStep])

  const STEPS = STEP_COMPONENTS.map(p => ({
    ...p,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    title: t(`wizard.steps.${p.stepKey}` as any),
  }))

  const { Comp: StepComponent } = STEPS[currentStep - 1]

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
            {t('wizard.step', { n: currentStep })}
          </span>
          <button
            onClick={() => setConfigOpen(true)}
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

      <ConfigModal open={configOpen} onClose={() => setConfigOpen(false)} />

      {/* Mobile step progress — sticky below header */}
      <div className="md:hidden sticky top-[60px] z-10 bg-[#17130f] border-b border-white/[0.06] px-4 py-2">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-[#D4A017] rounded-full transition-all duration-300" style={{ width: `${(currentStep / 13) * 100}%` }} />
          </div>
          <span className="text-xs font-semibold text-[#D4A017] whitespace-nowrap">{STEPS[currentStep - 1].title}</span>
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
            {STEPS.map(p => {
              const isDone    = p.id < currentStep
              const isActive  = p.id === currentStep
              const isLocked  = p.id > maxStep

              return (
                <button
                  key={p.id}
                  onClick={() => !isLocked && setStep(p.id)}
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
                    {p.title}
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
              key={currentStep}
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
