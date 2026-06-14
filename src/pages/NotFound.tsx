import { useNavigate } from 'react-router-dom'

export function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#131110] font-[Manrope,system-ui] flex flex-col items-center justify-center px-8">
      <div className="text-center max-w-md">
        <svg
          width="72" height="72" viewBox="0 0 24 24" fill="none"
          className="mx-auto mb-6 text-[#D4A017] opacity-80"
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
          <path d="M8 11h6M11 8v6" strokeOpacity="0.4"/>
        </svg>

        <p className="text-[#D4A017] text-sm font-bold tracking-[0.12em] uppercase mb-3">Erro 404</p>
        <h1 className="text-[#F5F0E8] text-[36px] font-extrabold tracking-tight leading-tight mb-4">
          Página não encontrada
        </h1>
        <p className="text-[#6B6560] text-[15px] leading-relaxed mb-8">
          O pergaminho que procuras não existe neste grimório. Talvez o feitiço de localização tenha falhado.
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#E8DFD0] bg-white/5 hover:bg-white/10 border border-white/[0.09] rounded-[11px] px-5 py-[12px] cursor-pointer transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Voltar
          </button>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-[14px] font-bold text-[#131110] bg-[#D4A017] hover:bg-[#E8C25A] rounded-[11px] px-5 py-[12px] cursor-pointer transition-colors"
          >
            Ir ao Grimório
          </button>
        </div>
      </div>
    </div>
  )
}
