import { useTranslation } from 'react-i18next'

interface Props {
  current: number
  onJump?: (step: number) => void
}

export function WizardProgressBar({ current, onJump }: Props) {
  const { t } = useTranslation()

  const STEPS = [
    { id: 1,  title: t('wizard.steps.level') },
    { id: 2,  title: t('wizard.steps.charClass') },
    { id: 3,  title: t('wizard.steps.subclass') },
    { id: 4,  title: t('wizard.steps.species') },
    { id: 5,  title: t('wizard.steps.background') },
    { id: 6,  title: t('wizard.steps.abilities') },
    { id: 7,  title: t('wizard.steps.skills') },
    { id: 8,  title: t('wizard.steps.spells') },
    { id: 9,  title: t('wizard.steps.languages') },
    { id: 10, title: t('wizard.steps.equipment') },
    { id: 11, title: t('wizard.steps.personality') },
    { id: 12, title: t('wizard.steps.review') },
  ]

  const progress = Math.round(((current - 1) / (STEPS.length - 1)) * 100)

  return (
    <nav
      className="w-full bg-[#2D2520] border-b border-[#B8860B]/20 px-4 py-3 no-print"
      aria-label={t('wizard.stepsAriaLabel')}
    >
      <div className="max-w-5xl mx-auto">
        {/* Barra de progresso contínua — visible em todos viewports */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-[#A8A09B] flex-shrink-0">
            {t('wizard.step', { n: current })}
          </span>
          <div className="flex-1 h-1 bg-[#3D332D] rounded-full overflow-hidden" role="progressbar" aria-valuenow={current} aria-valuemin={1} aria-valuemax={STEPS.length} aria-label={t('wizard.step', { n: current })}>
            <div
              className="h-full bg-[#B8860B] rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-[#B8860B] flex-shrink-0 font-medium">
            {STEPS[current - 1]?.title}
          </span>
        </div>

        {/* Step dots — só em sm+ */}
        <div className="hidden sm:flex gap-1 items-center overflow-x-auto pb-1">
          {STEPS.map((p, idx) => {
            const concluido = p.id < current
            const ativo = p.id === current
            const futuro = p.id > current

            return (
              <div key={p.id} className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => onJump?.(p.id)}
                  disabled={futuro}
                  title={p.title}
                  aria-label={p.title}
                  aria-current={ativo ? 'step' : undefined}
                  className={[
                    'flex flex-col items-center gap-0.5 px-2 py-1.5 rounded transition-all',
                    'min-w-[44px] min-h-[44px] justify-center',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]',
                    ativo    ? 'bg-[#7B1D1D] cursor-pointer' : '',
                    concluido ? 'cursor-pointer hover:bg-[#3D332D]' : '',
                    futuro   ? 'opacity-40 cursor-default' : '',
                  ].join(' ')}
                >
                  <span className={[
                    'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold',
                    ativo     ? 'bg-[#F5F0E8] text-[#7B1D1D]' : '',
                    concluido ? 'bg-[#B8860B] text-[#1A1612]' : '',
                    futuro    ? 'bg-[#3D332D] text-[#A8A09B]' : '',
                  ].join(' ')}>
                    {concluido ? '✓' : p.id}
                  </span>
                  <span className={[
                    'text-[10px] font-medium',
                    ativo     ? 'text-[#F5F0E8]' : '',
                    concluido ? 'text-[#B8860B]' : '',
                    futuro    ? 'text-[#A8A09B]' : '',
                  ].join(' ')}>
                    {p.title}
                  </span>
                </button>

                {idx < STEPS.length - 1 && (
                  <div className={`w-3 h-0.5 flex-shrink-0 ${idx < current - 1 ? 'bg-[#B8860B]' : 'bg-[#3D332D]'}`} aria-hidden="true" />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
