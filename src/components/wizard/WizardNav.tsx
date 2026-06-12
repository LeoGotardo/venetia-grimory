interface Props {
  onBack?: () => void
  onNext: () => void
  onSkip?: () => void
  nextLabel?: string
  backDisabled?: boolean
  nextDisabled?: boolean
  isLast?: boolean
}

export function WizardNav({ onBack, onNext, onSkip, nextLabel, backDisabled, nextDisabled, isLast }: Props) {
  return (
    <div className="flex items-center justify-between mt-7 pt-[22px] border-t border-[rgba(212,160,23,0.16)]">
      <button
        type="button"
        onClick={onBack}
        disabled={!onBack || backDisabled}
        className={[
          'inline-flex items-center gap-2 text-sm font-semibold rounded-[10px] px-[18px] py-[11px] transition-colors',
          'bg-white/[0.04] border border-white/[0.09]',
          !onBack || backDisabled
            ? 'text-[#6B6560] cursor-default opacity-40'
            : 'text-[#A8A09B] hover:text-[#E8DFD0] cursor-pointer',
        ].join(' ')}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>
        Voltar
      </button>

      <div className="flex gap-2">
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="inline-flex items-center text-sm font-semibold text-[#8a8278] hover:text-[#A8A09B] px-4 py-[11px] cursor-pointer transition-colors"
          >
            Pular
          </button>
        )}
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          className={[
            'inline-flex items-center gap-2 text-sm font-bold text-[#131110] bg-[#D4A017] hover:bg-[#E8C25A] border-0 rounded-[10px] px-[22px] py-[11px] transition-colors',
            nextDisabled ? 'opacity-40 cursor-default' : 'cursor-pointer',
          ].join(' ')}
        >
          {nextLabel ?? (isLast ? 'Criar Personagem' : 'Próximo')}
          {!isLast && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          )}
        </button>
      </div>
    </div>
  )
}
