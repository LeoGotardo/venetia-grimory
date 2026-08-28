import { useTranslation } from 'react-i18next'
import { useSheetStore } from '../../store/sheetStore'
import Button from '../ui/Button'

const DOTS_MAX = 20

export function ResourcesPanel() {
  const { sheet, updateResource } = useSheetStore()
  const { t } = useTranslation()
  const classId = sheet.identity.class_id
  const r = sheet.class_features.class_resources

  if (!classId) return null

  const resources = [
    { key: 'furias',               label: t('resources.rages'),               classes: ['barbaro'],              value: r.rages },
    { key: 'inspiracao_de_bardo',  label: t('resources.bardicInspiration'),      classes: ['bardo'],                value: r.bardic_inspiration },
    { key: 'canalizar_divindade',  label: t('resources.channelDivinity'),   classes: ['clerigo', 'paladino'],   value: r.channel_divinity },
    { key: 'formas_selvagens',     label: t('resources.wildShapes'),      classes: ['druida'],               value: r.wild_shapes },
    { key: 'pontos_de_feiticaria', label: t('resources.sorceryPoints'),     classes: ['feiticeiro'],           value: r.sorcery_points },
    { key: 'pontos_de_foco',       label: t('resources.focusPoints'),           classes: ['monge'],                value: r.focus_points },
    { key: 'surto_de_acao',        label: t('resources.actionSurge'),            classes: ['guerreiro'],            value: { max: r.action_surge.uses, current: r.action_surge.current } },
    { key: 'recuperar_folego',     label: t('resources.secondWind'),      classes: ['guerreiro'],            value: r.second_wind },
    { key: 'imposicao_de_maos',    label: t('resources.layOnHands'),        classes: ['paladino'],             value: { max: r.lay_on_hands.hp_pool, current: r.lay_on_hands.current } },
  ]

  const relevantes = resources.filter(res => res.classes.includes(classId) && res.value.max !== null)
  if (relevantes.length === 0) return null

  return (
    <div className="space-y-3">
      <h3 className="font-cinzel font-semibold text-[#B8860B]">{t('resources.heading')}</h3>
      {relevantes.map(res => {
        const max = res.value.max ?? 0
        const current = res.value.current ?? 0
        const pct = max > 0 ? (current / max) * 100 : 0
        const useDots = max <= DOTS_MAX

        return (
          <div key={res.key} className="bg-[#2D2520] border border-[#B8860B]/20 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#F5F0E8]">{res.label}</span>
              <span className="text-sm font-bold text-[#F5F0E8]">{current}/{max}</span>
            </div>

            {/* Dots para recursos pequenos; barra para pools grandes (>20) */}
            {useDots ? (
              <div className="flex gap-1 flex-wrap mb-2" role="group" aria-label={`${res.label}: ${current} de ${max}`}>
                {Array.from({ length: max }, (_, i) => (
                  <span
                    key={i}
                    className={`w-5 h-5 rounded-full border ${i < current ? 'bg-[#B8860B] border-[#B8860B]' : 'border-[#A8A09B]/40'}`}
                    aria-hidden="true"
                  />
                ))}
              </div>
            ) : (
              <div className="mb-2">
                <div
                  className="h-2.5 bg-[#3D332D] rounded-full overflow-hidden"
                  role="progressbar"
                  aria-valuenow={current}
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
                onClick={() => updateResource(res.key, -1)}
                disabled={current <= 0}
              >
                {t('resources.use')}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => updateResource(res.key, max - current)}
              >
                {t('resources.restore')}
              </Button>
            </div>
          </div>
        )
      })}

      {classId === 'ladino' && r.sneak_attack.die && (
        <div className="bg-[#2D2520] border border-[#B8860B]/20 rounded-lg p-3 flex items-center gap-2">
          <span className="text-sm text-[#F5F0E8]">{t('resources.sneakAttack')}</span>
          <span className="font-bold text-[#B8860B]">{r.sneak_attack.die}</span>
        </div>
      )}
    </div>
  )
}
