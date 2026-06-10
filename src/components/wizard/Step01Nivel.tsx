import { useFichaStore } from '../../store/fichaStore'
import { WizardNav } from './WizardNav'
import { XP_POR_NIVEL } from '../../lib/calculos'

export function Step01Nivel() {
  const { ficha, setNivel, setPasso } = useFichaStore()
  const nivel = ficha.identidade.nivel

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cinzel text-2xl font-bold text-[#F5F0E8] mb-1">Nível Inicial</h2>
        <p className="text-[#A8A09B] text-sm">Escolha o nível em que o personagem começa sua aventura.</p>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center gap-3">
          <label htmlFor="nivel-input" className="text-[#B8860B] font-medium">Nível</label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setNivel(Math.max(1, nivel - 1))}
              className="w-10 h-10 rounded-full bg-[#3D332D] border border-[#B8860B]/30 text-[#F5F0E8] text-xl font-bold hover:bg-[#4D4037] transition-colors cursor-pointer"
              aria-label="Diminuir nível"
            >−</button>
            <input
              id="nivel-input"
              type="number" min={1} max={20} value={nivel}
              onChange={e => setNivel(Math.max(1, Math.min(20, Number(e.target.value))))}
              className="w-20 h-16 text-center font-cinzel text-4xl font-bold bg-[#2D2520] border border-[#B8860B]/50 rounded-lg text-[#F5F0E8] focus:outline-none focus:ring-1 focus:ring-[#B8860B]"
              aria-live="polite"
            />
            <button
              onClick={() => setNivel(Math.min(20, nivel + 1))}
              className="w-10 h-10 rounded-full bg-[#3D332D] border border-[#B8860B]/30 text-[#F5F0E8] text-xl font-bold hover:bg-[#4D4037] transition-colors cursor-pointer"
              aria-label="Aumentar nível"
            >+</button>
          </div>
          {nivel < 3 && (
            <p className="text-xs text-[#A8A09B] text-center max-w-xs">
              Subclasse desbloqueada no nível 3
            </p>
          )}
        </div>

        <div className="flex-1 max-h-80 overflow-y-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-[#B8860B]/30">
                <th className="py-1.5 px-3 text-left font-cinzel text-[#B8860B]">Nível</th>
                <th className="py-1.5 px-3 text-right font-cinzel text-[#B8860B]">XP necessário</th>
                <th className="py-1.5 px-3 text-right font-cinzel text-[#B8860B]">Bônus Prof.</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 20 }, (_, i) => i + 1).map(n => (
                <tr
                  key={n}
                  onClick={() => setNivel(n)}
                  className={`cursor-pointer border-b border-[#3D332D] hover:bg-[#3D332D] transition-colors
                    ${n === nivel ? 'bg-[#4D2020] border-[#7B1D1D]' : ''}`}
                >
                  <td className={`py-1.5 px-3 font-semibold ${n === nivel ? 'text-[#F5F0E8]' : 'text-[#B8860B]'}`}>{n}</td>
                  <td className="py-1.5 px-3 text-right text-[#A8A09B]">
                    {n === 1 ? '—' : (XP_POR_NIVEL[n] ?? '—').toLocaleString('pt-BR')}
                  </td>
                  <td className="py-1.5 px-3 text-right text-[#F5F0E8]">+{Math.ceil(n / 4) + 1}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <WizardNav onNext={() => setPasso(2)} />
    </div>
  )
}
