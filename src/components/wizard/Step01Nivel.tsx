import { useFichaStore } from '../../store/fichaStore'
import { WizardNav } from './WizardNav'
import { XP_POR_NIVEL } from '../../lib/calculos'

export function Step01Nivel() {
  const { ficha, setNivel, setPasso } = useFichaStore()
  const nivel = ficha.identidade.nivel

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-extrabold text-2xl text-[#F5F0E8] mb-1">Nível Inicial</h2>
        <p className="text-[#8a8278] text-sm">Escolha o nível em que o personagem começa sua aventura.</p>
      </div>

      {/* Level picker card */}
      <div className="vg-card flex items-center gap-5 px-8 py-7">
        <button
          onClick={() => setNivel(Math.max(1, nivel - 1))}
          aria-label="Diminuir nível"
          className="w-11 h-11 rounded-[11px] bg-white/5 border border-[rgba(212,160,23,0.25)] text-[#D4A017] text-2xl font-bold cursor-pointer hover:bg-white/10 transition-colors flex items-center justify-center shrink-0"
        >−</button>

        <div className="text-center min-w-[90px]">
          <div className="font-extrabold text-[56px] leading-none text-[#F5F0E8]">{nivel}</div>
          <div className="text-xs tracking-[0.1em] uppercase text-[#6B6560] mt-1">Nível</div>
        </div>

        <button
          onClick={() => setNivel(Math.min(20, nivel + 1))}
          aria-label="Aumentar nível"
          className="w-11 h-11 rounded-[11px] bg-white/5 border border-[rgba(212,160,23,0.25)] text-[#D4A017] text-2xl font-bold cursor-pointer hover:bg-white/10 transition-colors flex items-center justify-center shrink-0"
        >+</button>

        <p className="flex-1 pl-2 text-sm text-[#8a8278] leading-relaxed">
          A maioria das campanhas começa no{' '}
          <strong className="text-[#E8DFD0]">nível 1</strong>. Níveis mais altos concedem mais
          pontos de vida, magias e habilidades de classe.
        </p>
      </div>

      {/* XP / Bônus de proficiência table */}
      <div className="vg-card overflow-hidden">
        <div className="overflow-y-auto max-h-[320px]">
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 bg-[#1A1714]">
              <tr className="border-b border-[rgba(212,160,23,0.2)]">
                <th className="py-2.5 px-4 text-left font-bold text-[#D4A017] text-xs tracking-wider uppercase">Nível</th>
                <th className="py-2.5 px-4 text-right font-bold text-[#D4A017] text-xs tracking-wider uppercase">XP necessário</th>
                <th className="py-2.5 px-4 text-right font-bold text-[#D4A017] text-xs tracking-wider uppercase">Prof.</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 20 }, (_, i) => i + 1).map(n => (
                <tr
                  key={n}
                  onClick={() => setNivel(n)}
                  className={[
                    'cursor-pointer border-b border-white/[0.04] transition-colors',
                    n === nivel
                      ? 'bg-[rgba(212,160,23,0.12)]'
                      : 'hover:bg-white/[0.03]',
                  ].join(' ')}
                >
                  <td className={`py-2 px-4 font-semibold ${n === nivel ? 'text-[#D4A017]' : 'text-[#F5F0E8]'}`}>{n}</td>
                  <td className="py-2 px-4 text-right text-[#8a8278]">
                    {n === 1 ? '—' : (XP_POR_NIVEL[n] ?? '—').toLocaleString('pt-BR')}
                  </td>
                  <td className={`py-2 px-4 text-right font-bold ${n === nivel ? 'text-[#D4A017]' : 'text-[#A8A09B]'}`}>
                    +{Math.ceil(n / 4) + 1}
                  </td>
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
