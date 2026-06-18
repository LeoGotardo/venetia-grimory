import { useTranslation } from 'react-i18next'
import { useFichaStore } from '../../store/fichaStore'
import { formatModificador } from '../../lib/calculos'
import type { Ficha } from '../../types'

const CIRCULOS: Array<keyof Ficha['magia']['espacos_de_magia']> = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9']

// On-theme: sem Tailwind genérico (gray/blue sem contexto)
const CIRCULO_CORES = [
  '',
  'bg-amber-500',
  'bg-yellow-400',
  'bg-green-500',
  'bg-teal-500',
  'bg-blue-500',
  'bg-violet-500',
  'bg-purple-600',
  'bg-pink-500',
  'bg-rose-600',
]

export function PainelMagia() {
  const { ficha, gastarEspaco, restaurarEspaco } = useFichaStore()
  const { t } = useTranslation()
  const { magia } = ficha

  if (!magia.conjurador) {
    return (
      <div className="text-center py-10 text-[#A8A09B]">
        <div className="mb-3 flex justify-center opacity-40">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="#B8860B"><path d="M12 2l2.4 7.6H22l-6.2 4.5 2.4 7.6L12 17.2l-6.2 4.5 2.4-7.6L2 9.6h7.6z"/></svg>
        </div>
        <p className="font-cinzel text-[#B8860B] mb-1">{t('magic.notCaster')}</p>
        <p className="text-sm">{t('magic.notCasterDesc')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-[#2D2520] border border-[#B8860B]/20 rounded-lg p-3 text-center">
          <div className="text-xs text-[#A8A09B] mb-1">{t('magic.spellDC')}</div>
          <div className="font-cinzel font-bold text-3xl text-[#F5F0E8]">{magia._cd_magia ?? '—'}</div>
        </div>
        <div className="bg-[#2D2520] border border-[#B8860B]/20 rounded-lg p-3 text-center">
          <div className="text-xs text-[#A8A09B] mb-1">{t('magic.spellAttackBonus')}</div>
          <div className="font-cinzel font-bold text-3xl text-[#F5F0E8]">
            {magia._bonus_ataque_magia !== null ? formatModificador(magia._bonus_ataque_magia) : '—'}
          </div>
        </div>
      </div>

      <section aria-label={t('magic.spellSlots')}>
        <h4 className="font-cinzel font-semibold text-[#B8860B] mb-3">{t('magic.spellSlots')}</h4>
        <div className="space-y-2">
          {CIRCULOS.map((c, i) => {
            const espaco = magia.espacos_de_magia[c]
            if (espaco.maximo === 0) return null
            const circulo = i + 1
            return (
              <div key={c} className="flex items-center gap-3">
                <span className="text-xs text-[#A8A09B] w-8 text-right flex-shrink-0">{t('magic.level_n', { n: circulo })}</span>
                <div className="flex gap-1 flex-wrap" role="group" aria-label={t('magic.circleAriaLabel', { n: circulo })}>
                  {Array.from({ length: espaco.maximo }, (_, j) => {
                    const disponivel = j < espaco.maximo - espaco.gastos
                    return (
                      <button
                        key={j}
                        onClick={() => disponivel ? gastarEspaco(c) : restaurarEspaco(c)}
                        className={[
                          'w-5 h-5 rounded-full border-2 transition-all cursor-pointer',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B] focus-visible:ring-offset-1 focus-visible:ring-offset-[#3D332D]',
                          disponivel
                            ? `${CIRCULO_CORES[circulo]} border-transparent opacity-90 hover:opacity-100`
                            : 'border-[#A8A09B]/40 bg-transparent hover:border-[#B8860B]',
                        ].join(' ')}
                        aria-label={disponivel
                          ? t('magic.spendSlot', { slot: j + 1, n: circulo })
                          : t('magic.restoreSlot', { slot: j + 1, n: circulo })}
                        aria-pressed={!disponivel}
                      />
                    )
                  })}
                </div>
                <span className="text-xs text-[#A8A09B]">
                  {espaco.maximo - espaco.gastos}/{espaco.maximo}
                </span>
              </div>
            )
          })}
        </div>
      </section>

      {Object.values(magia.truques_por_classe).flat().length > 0 && (
        <section aria-label={t('magic.cantrips')}>
          <h4 className="font-cinzel font-semibold text-[#B8860B] mb-2">{t('magic.cantrips')}</h4>
          <div className="flex flex-wrap gap-1">
            {Object.values(magia.truques_por_classe).flat().map(tr => (
              <span key={tr} className="text-xs bg-[#2D2520] border border-[#B8860B]/20 rounded px-2 py-0.5 text-[#F5F0E8]">{tr}</span>
            ))}
          </div>
        </section>
      )}

      {Object.values(magia.magias_por_classe).flat().length > 0 && (
        <section aria-label={t('magic.preparedSpells')}>
          <h4 className="font-cinzel font-semibold text-[#B8860B] mb-2">{t('magic.preparedSpells')}</h4>
          <div className="flex flex-wrap gap-1">
            {Object.values(magia.magias_por_classe).flat().map(m => (
              <span key={m} className="text-xs bg-[#2D2520] border border-[#7B1D1D]/20 rounded px-2 py-0.5 text-[#F5F0E8]">{m}</span>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
