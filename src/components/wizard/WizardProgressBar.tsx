const PASSOS = [
  { id: 1, titulo: 'Nível' },
  { id: 2, titulo: 'Classe' },
  { id: 3, titulo: 'Subclasse' },
  { id: 4, titulo: 'Espécie' },
  { id: 5, titulo: 'Antecedente' },
  { id: 6, titulo: 'Atributos' },
  { id: 7, titulo: 'Perícias' },
  { id: 8, titulo: 'Magias' },
  { id: 9, titulo: 'Idiomas' },
  { id: 10, titulo: 'Equipamento' },
  { id: 11, titulo: 'Personalidade' },
  { id: 12, titulo: 'Revisar' },
]

interface Props {
  atual: number
  onJump?: (passo: number) => void
}

export function WizardProgressBar({ atual, onJump }: Props) {
  const progresso = Math.round(((atual - 1) / (PASSOS.length - 1)) * 100)

  return (
    <nav
      className="w-full bg-[#2D2520] border-b border-[#B8860B]/20 px-4 py-3 no-print"
      aria-label="Progresso do wizard"
    >
      <div className="max-w-5xl mx-auto">
        {/* Barra de progresso contínua — visible em todos viewports */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-[#A8A09B] flex-shrink-0">
            Passo {atual}/{PASSOS.length}
          </span>
          <div className="flex-1 h-1 bg-[#3D332D] rounded-full overflow-hidden" role="progressbar" aria-valuenow={atual} aria-valuemin={1} aria-valuemax={PASSOS.length} aria-label={`Passo ${atual} de ${PASSOS.length}`}>
            <div
              className="h-full bg-[#B8860B] rounded-full transition-all duration-300"
              style={{ width: `${progresso}%` }}
            />
          </div>
          <span className="text-xs text-[#B8860B] flex-shrink-0 font-medium">
            {PASSOS[atual - 1]?.titulo}
          </span>
        </div>

        {/* Step dots — só em sm+ */}
        <div className="hidden sm:flex gap-1 items-center overflow-x-auto pb-1">
          {PASSOS.map((p, idx) => {
            const concluido = p.id < atual
            const ativo = p.id === atual
            const futuro = p.id > atual

            return (
              <div key={p.id} className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => onJump?.(p.id)}
                  disabled={futuro}
                  title={p.titulo}
                  aria-label={`${p.titulo}${concluido ? ' (concluído)' : ativo ? ' (atual)' : ' (bloqueado)'}`}
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
                    {p.titulo}
                  </span>
                </button>

                {idx < PASSOS.length - 1 && (
                  <div className={`w-3 h-0.5 flex-shrink-0 ${idx < atual - 1 ? 'bg-[#B8860B]' : 'bg-[#3D332D]'}`} aria-hidden="true" />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
