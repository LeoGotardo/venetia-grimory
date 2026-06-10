import { useFichaStore } from '../../store/fichaStore'
import { Textarea } from '../ui/Input'
import { Badge } from '../ui/Badge'
import { CONDICOES_DISPONIVEIS, EXAUSTAO_EFEITOS, MAXIMO_EXAUSTAO } from '../../constants'

export function PainelAnotacoes() {
  const { ficha, toggleCondicao, setExaustao, setNotas } = useFichaStore()
  const p = ficha.personalidade

  return (
    <div className="space-y-5">
      {/* Personalidade */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { label: 'Traços', items: p.tracos },
          { label: 'Ideais', items: p.ideais },
          { label: 'Vínculos', items: p.vinculos },
          { label: 'Fraquezas', items: p.fraquezas },
        ].map(({ label, items }) => (
          <div key={label} className="bg-[#2D2520] border border-[#B8860B]/20 rounded-lg p-3">
            <div className="text-xs text-[#B8860B] font-semibold mb-1">{label}</div>
            {items.length > 0
              ? items.map((t, i) => <p key={i} className="text-sm text-[#F5F0E8]">{t}</p>)
              : <p className="text-xs text-[#A8A09B]">—</p>}
          </div>
        ))}
      </div>

      {p.historia && (
        <div className="bg-[#2D2520] border border-[#B8860B]/20 rounded-lg p-3">
          <div className="text-xs text-[#B8860B] font-semibold mb-1">História</div>
          <p className="text-sm text-[#F5F0E8] whitespace-pre-wrap">{p.historia}</p>
        </div>
      )}

      {/* Condições */}
      <section aria-label="Condições ativas">
        <h4 className="font-cinzel font-semibold text-[#B8860B] mb-2">Condições Ativas</h4>
        <div className="flex flex-wrap gap-2 mb-2" role="group" aria-label="Remover condição ativa">
          {ficha.condicoes_ativas.map(c => (
            <button
              key={c}
              onClick={() => toggleCondicao(c)}
              aria-label={`Remover condição: ${c}`}
              className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B] rounded"
            >
              <Badge variant="red">{c} ×</Badge>
            </button>
          ))}
          {ficha.condicoes_ativas.length === 0 && (
            <span className="text-xs text-[#A8A09B]">Nenhuma condição ativa.</span>
          )}
        </div>
        <div className="flex flex-wrap gap-1" role="group" aria-label="Adicionar condição">
          {(CONDICOES_DISPONIVEIS as readonly string[]).filter(c => !ficha.condicoes_ativas.includes(c)).map(c => (
            <button
              key={c}
              onClick={() => toggleCondicao(c)}
              aria-label={`Aplicar condição: ${c}`}
              className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B] rounded"
            >
              <Badge variant="default" className="hover:border-[#7B1D1D]/60">{c}</Badge>
            </button>
          ))}
        </div>
      </section>

      {/* Exaustão */}
      <section aria-label="Nível de exaustão">
        <h4 className="font-cinzel font-semibold text-[#B8860B] mb-2">
          Exaustão: <span className="text-[#F5F0E8]">{ficha.niveis_de_exaustao}/{MAXIMO_EXAUSTAO}</span>
        </h4>
        <div className="flex gap-1 mb-1" role="group" aria-label="Selecionar nível de exaustão">
          {Array.from({ length: MAXIMO_EXAUSTAO }, (_, i) => (
            <button
              key={i}
              onClick={() => setExaustao(i + 1 === ficha.niveis_de_exaustao ? i : i + 1)}
              aria-pressed={i < ficha.niveis_de_exaustao}
              aria-label={`Nível de exaustão ${i + 1}`}
              className={`w-8 h-8 rounded border text-sm font-bold cursor-pointer transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]
                ${i < ficha.niveis_de_exaustao
                  ? 'bg-red-800 border-red-600 text-white'
                  : 'border-[#A8A09B]/40 text-[#A8A09B] hover:border-red-600 hover:text-red-400'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <p className="text-xs text-[#A8A09B]">
          {(EXAUSTAO_EFEITOS as readonly string[])[ficha.niveis_de_exaustao]}
        </p>
      </section>

      <Textarea
        label="Notas Livres"
        value={ficha.notas ?? ''}
        onChange={e => setNotas(e.target.value)}
        placeholder="Anotações, detalhes de missão, contatos..."
        className="min-h-[150px]"
      />
    </div>
  )
}
