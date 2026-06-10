import Button from '../ui/Button'

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
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#B8860B]/20">
      <div>
        {onBack && (
          <Button variant="ghost" onClick={onBack} disabled={backDisabled}>
            ← Voltar
          </Button>
        )}
      </div>
      <div className="flex gap-2">
        {onSkip && (
          <Button variant="ghost" onClick={onSkip}>
            Pular
          </Button>
        )}
        <Button onClick={onNext} disabled={nextDisabled} size="lg">
          {nextLabel ?? (isLast ? 'Criar Personagem ✦' : 'Próximo →')}
        </Button>
      </div>
    </div>
  )
}
