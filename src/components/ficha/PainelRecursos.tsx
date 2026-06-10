import { useFichaStore } from '../../store/fichaStore'
import Button from '../ui/Button'

const DOTS_MAX = 20

export function PainelRecursos() {
  const { ficha, atualizarRecurso } = useFichaStore()
  const classeId = ficha.identidade.classe_id
  const r = ficha.caracteristicas_de_classe.recursos_de_classe

  if (!classeId) return null

  const recursos = [
    { key: 'furias',               label: 'Fúrias',                  classes: ['barbaro'],              valor: r.furias },
    { key: 'inspiracao_de_bardo',  label: 'Inspiração de Bardo',     classes: ['bardo'],                valor: r.inspiracao_de_bardo },
    { key: 'canalizar_divindade',  label: 'Canalizar Divindade',     classes: ['clerigo', 'paladino'],   valor: r.canalizar_divindade },
    { key: 'formas_selvagens',     label: 'Formas Selvagens',        classes: ['druida'],               valor: r.formas_selvagens },
    { key: 'pontos_de_feiticaria', label: 'Pontos de Feitiçaria',    classes: ['feiticeiro'],           valor: r.pontos_de_feiticaria },
    { key: 'pontos_de_foco',       label: 'Pontos de Foco',          classes: ['monge'],                valor: r.pontos_de_foco },
    { key: 'surto_de_acao',        label: 'Surto de Ação',           classes: ['guerreiro'],            valor: { maximo: r.surto_de_acao.usos, atual: r.surto_de_acao.atual } },
    { key: 'recuperar_folego',     label: 'Recuperar Fôlego',        classes: ['guerreiro'],            valor: r.recuperar_folego },
    { key: 'imposicao_de_maos',    label: 'Imposição de Mãos (PV)', classes: ['paladino'],             valor: { maximo: r.imposicao_de_maos.pool_pv, atual: r.imposicao_de_maos.atual } },
  ]

  const relevantes = recursos.filter(res => res.classes.includes(classeId) && res.valor.maximo !== null)
  if (relevantes.length === 0) return null

  return (
    <div className="space-y-3">
      <h3 className="font-cinzel font-semibold text-[#B8860B]">Recursos de Classe</h3>
      {relevantes.map(res => {
        const max = res.valor.maximo ?? 0
        const atual = res.valor.atual ?? 0
        const pct = max > 0 ? (atual / max) * 100 : 0
        const useDots = max <= DOTS_MAX

        return (
          <div key={res.key} className="bg-[#2D2520] border border-[#B8860B]/20 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#F5F0E8]">{res.label}</span>
              <span className="text-sm font-bold text-[#F5F0E8]">{atual}/{max}</span>
            </div>

            {/* Dots para recursos pequenos; barra para pools grandes (>20) */}
            {useDots ? (
              <div className="flex gap-1 flex-wrap mb-2" role="group" aria-label={`${res.label}: ${atual} de ${max}`}>
                {Array.from({ length: max }, (_, i) => (
                  <span
                    key={i}
                    className={`w-5 h-5 rounded-full border ${i < atual ? 'bg-[#B8860B] border-[#B8860B]' : 'border-[#A8A09B]/40'}`}
                    aria-hidden="true"
                  />
                ))}
              </div>
            ) : (
              <div className="mb-2">
                <div
                  className="h-2.5 bg-[#3D332D] rounded-full overflow-hidden"
                  role="progressbar"
                  aria-valuenow={atual}
                  aria-valuemax={max}
                  aria-label={res.label}
                >
                  <div
                    className="h-full bg-[#B8860B] rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-1">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => atualizarRecurso(res.key, -1)}
                disabled={atual <= 0}
              >
                Usar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => atualizarRecurso(res.key, max - atual)}
              >
                Restaurar
              </Button>
            </div>
          </div>
        )
      })}

      {classeId === 'ladino' && r.ataque_furtivo.dado && (
        <div className="bg-[#2D2520] border border-[#B8860B]/20 rounded-lg p-3 flex items-center gap-2">
          <span className="text-sm text-[#F5F0E8]">Ataque Furtivo</span>
          <span className="font-bold text-[#B8860B]">{r.ataque_furtivo.dado}</span>
        </div>
      )}
    </div>
  )
}
