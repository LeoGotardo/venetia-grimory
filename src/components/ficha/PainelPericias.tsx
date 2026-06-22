import { useTranslation } from 'react-i18next'
import { useFichaStore } from '../../store/fichaStore'
import { formatModificador } from '../../lib/calculos'
import { dados } from '../../data/dados'

export function PainelPericias() {
  const { ficha } = useFichaStore()
  const { t } = useTranslation()
  const percepcaoPassiva = 10 + (ficha.pericias.percepcao._valor ?? 0)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-cinzel font-semibold text-[#B8860B]">{t('skills.heading')}</h3>
        <span className="text-xs text-[#A8A09B]">{t('skills.passivePerception', { n: percepcaoPassiva })}</span>
      </div>
      <div className="space-y-0.5">
        {dados.pericias.map(p => {
          const fichaP = ficha.pericias[p.id]
          if (!fichaP) return null
          const val = fichaP._valor
          const isHigh = (val ?? 0) >= 3
          return (
            <div key={p.id} className={`flex items-center gap-2 px-2 py-1.5 rounded transition-colors
              ${fichaP.proficiente ? 'bg-[#2D2520]' : 'hover:bg-[#3D332D]/50'}`}>
              <span className={`w-3 h-3 rounded-full flex-shrink-0 ${fichaP.expertise ? 'border-2 border-[#B8860B] bg-[#B8860B]' : fichaP.proficiente ? 'bg-[#B8860B]' : 'border border-[#6B6560]'}`} />
              <span className={`text-xs flex-1 ${isHigh ? 'text-[#F5F0E8] font-medium' : 'text-[#B8860B]'}`}>{p.nome}</span>
              <span className="text-[10px] text-[#A8A09B]">{p.atributo}</span>
              <span className={`text-sm font-bold min-w-[2.5rem] text-right ${isHigh ? 'text-green-400' : (val ?? 0) > 0 ? 'text-[#F5F0E8]' : 'text-[#A8A09B]'}`} aria-live="polite">
                {val !== null && val !== undefined ? formatModificador(val) : '—'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
