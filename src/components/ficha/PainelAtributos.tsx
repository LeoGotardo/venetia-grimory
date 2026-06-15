import { useTranslation } from 'react-i18next'
import { useFichaStore } from '../../store/fichaStore'
import { formatModificador, ATRIBUTOS, ATRIBUTO_NOMES } from '../../lib/calculos'

export function PainelAtributos() {
  const { ficha } = useFichaStore()
  const { t } = useTranslation()

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {ATRIBUTOS.map(attr => {
          const { valor, _modificador } = ficha.atributos[attr]
          const modPos = (_modificador ?? 0) > 0
          const modNeg = (_modificador ?? 0) < 0

          return (
            <div
              key={attr}
              className="bg-[#2D2520] border border-[#B8860B]/20 rounded-lg p-3 flex flex-col items-center gap-0.5"
              aria-label={t('edit.attrValue', { attr: ATRIBUTO_NOMES[attr] }) + ': ' + (valor ?? '—') + ', ' + t('edit.modifier', { n: _modificador !== null ? formatModificador(_modificador) : '—' })}
            >
              <span className="text-[10px] font-bold text-[#A8A09B] tracking-widest uppercase">
                {ATRIBUTO_NOMES[attr].slice(0, 3)}
              </span>
              <span className="font-cinzel font-bold text-3xl text-[#F5F0E8] leading-none">
                {valor ?? '—'}
              </span>
              <div
                className={`w-full text-center font-cinzel font-semibold text-base rounded px-1 py-0.5 border mt-1
                  ${modPos
                    ? 'text-green-400 border-green-800/40 bg-green-900/20'
                    : modNeg
                    ? 'text-red-400 border-red-800/40 bg-red-900/20'
                    : 'text-[#A8A09B] border-transparent'}`}
                aria-live="polite"
              >
                {_modificador !== null ? formatModificador(_modificador) : '—'}
              </div>
              <span className="text-[10px] text-[#A8A09B] mt-0.5 text-center leading-tight">
                {ATRIBUTO_NOMES[attr]}
              </span>
            </div>
          )
        })}
      </div>

      <section aria-label={t('attrs.saves')}>
        <h3 className="font-cinzel font-semibold text-[#B8860B] mb-2">{t('attrs.saves')}</h3>
        <div className="grid grid-cols-2 gap-1">
          {ATRIBUTOS.map(attr => {
            const sv = ficha.combate.salvaguardas[attr]
            const valPos = (sv._valor ?? 0) > 0
            const valNeg = (sv._valor ?? 0) < 0

            return (
              <div key={attr} className={`flex items-center gap-2 px-2 py-1.5 rounded ${sv.proficiente ? 'bg-[#3D2020]' : ''}`}>
                <span
                  className={`w-3 h-3 rounded-full flex-shrink-0 ${sv.proficiente ? 'bg-[#B8860B]' : 'border border-[#A8A09B]/50'}`}
                  aria-label={sv.proficiente ? t('attrs.proficient') : t('attrs.notProficient')}
                />
                <span className="text-xs text-[#F5F0E8]">{ATRIBUTO_NOMES[attr].slice(0, 3)}</span>
                <span
                  className={`ml-auto text-sm font-bold ${valPos ? 'text-green-400' : valNeg ? 'text-red-400' : 'text-[#A8A09B]'}`}
                  aria-live="polite"
                >
                  {sv._valor !== null ? formatModificador(sv._valor) : '—'}
                </span>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
