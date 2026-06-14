import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (!this.state.error) return this.props.children
    return <ServerError onReset={() => this.setState({ error: null })} />
  }
}

function ServerError({ onReset }: { onReset?: () => void }) {
  return (
    <div className="min-h-screen bg-[#131110] font-[Manrope,system-ui] flex flex-col items-center justify-center px-8">
      <div className="text-center max-w-md">
        <svg
          width="72" height="72" viewBox="0 0 24 24" fill="none"
          className="mx-auto mb-6 text-[#D4A017] opacity-80"
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M12 9v4M12 17h.01"/>
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        </svg>

        <p className="text-[#D4A017] text-sm font-bold tracking-[0.12em] uppercase mb-3">Erro 500</p>
        <h1 className="text-[#F5F0E8] text-[36px] font-extrabold tracking-tight leading-tight mb-4">
          Algo deu errado
        </h1>
        <p className="text-[#6B6560] text-[15px] leading-relaxed mb-8">
          Um feitiço imprevisível interrompeu o grimório. Tenta recarregar — a magia pode se restabelecer.
        </p>

        <div className="flex gap-3 justify-center">
          {onReset && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#E8DFD0] bg-white/5 hover:bg-white/10 border border-white/[0.09] rounded-[11px] px-5 py-[12px] cursor-pointer transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
              Tentar novamente
            </button>
          )}
          <button
            onClick={() => window.location.replace('/')}
            className="inline-flex items-center gap-2 text-[14px] font-bold text-[#131110] bg-[#D4A017] hover:bg-[#E8C25A] rounded-[11px] px-5 py-[12px] cursor-pointer transition-colors"
          >
            Ir ao Grimório
          </button>
        </div>
      </div>
    </div>
  )
}
