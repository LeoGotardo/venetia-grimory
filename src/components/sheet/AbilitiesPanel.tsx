import { useTranslation } from 'react-i18next'
import { useSheetStore } from '../../store/sheetStore'
import { formatModifier, ABILITIES, abilityName } from '../../lib/calculations'

export function AbilitiesPanel() {
  const { sheet } = useSheetStore()
  const { t } = useTranslation()

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {ABILITIES.map(attr => {
          const { value, _modifier } = sheet.abilities[attr]
          const modPos = (_modifier ?? 0) > 0
          const modNeg = (_modifier ?? 0) < 0

          return (
            <div
              key={attr}
              className="bg-[#2D2520] border border-[#B8860B]/20 rounded-lg p-3 flex flex-col items-center gap-0.5"
              aria-label={t('edit.attrValue', { attr: abilityName(attr, t) }) + ': ' + (value ?? '—') + ', ' + t('edit.modifier', { n: _modifier !== null ? formatModifier(_modifier) : '—' })}
            >
              <span className="text-[10px] font-bold text-[#A8A09B] tracking-widest uppercase">
                {abilityName(attr, t).slice(0, 3)}
              </span>
              <span className="font-cinzel font-bold text-3xl text-[#F5F0E8] leading-none">
                {value ?? '—'}
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
                {_modifier !== null ? formatModifier(_modifier) : '—'}
              </div>
              <span className="text-[10px] text-[#A8A09B] mt-0.5 text-center leading-tight">
                {abilityName(attr, t)}
              </span>
            </div>
          )
        })}
      </div>

      <section aria-label={t('attrs.saves')}>
        <h3 className="font-cinzel font-semibold text-[#B8860B] mb-2">{t('attrs.saves')}</h3>
        <div className="grid grid-cols-2 gap-1">
          {ABILITIES.map(attr => {
            const sv = sheet.combat.saves[attr]
            const valPos = (sv._value ?? 0) > 0
            const valNeg = (sv._value ?? 0) < 0

            return (
              <div key={attr} className={`flex items-center gap-2 px-2 py-1.5 rounded ${sv.proficient ? 'bg-[#3D2020]' : ''}`}>
                <span
                  className={`w-3 h-3 rounded-full flex-shrink-0 ${sv.proficient ? 'bg-[#B8860B]' : 'border border-[#A8A09B]/50'}`}
                  aria-label={sv.proficient ? t('attrs.proficient') : t('attrs.notProficient')}
                />
                <span className="text-xs text-[#F5F0E8]">{abilityName(attr, t).slice(0, 3)}</span>
                <span
                  className={`ml-auto text-sm font-bold ${valPos ? 'text-green-400' : valNeg ? 'text-red-400' : 'text-[#A8A09B]'}`}
                  aria-live="polite"
                >
                  {sv._value !== null ? formatModifier(sv._value) : '—'}
                </span>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
