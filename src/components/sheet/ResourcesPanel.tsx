import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSheetStore } from '../../store/sheetStore'
import { getItems, type MagicItem } from '../../data/items'
import { ITEMS_RESTORING_PACT_SLOT, ITEMS_RESTORING_SPELL_SLOT } from '../../constants'
import Button from '../ui/Button'

const DOTS_MAX = 20

export function ResourcesPanel() {
  const { sheet, updateResource, spendItemUse, restoreItemUse } = useSheetStore()
  const { t, i18n } = useTranslation()
  const classId = sheet.identity.class_id
  const r = sheet.class_features.class_resources

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

  const relevantes = classId
    ? resources.filter(res => res.classes.includes(classId) && res.value.max !== null)
    : []

  // Itens mágicos com orçamento de usos declarado no catálogo. O máximo vem de lá;
  // a ficha guarda só o que foi gasto.
  const itemUses = useMemo(() => {
    const catalog = getItems()
    return sheet.inventory.items
      .map((it, idx) => {
        if (!it.item_id) return null
        const catalogItem = catalog.find(i => i.id === it.item_id) as MagicItem | undefined
        if (!catalogItem?.uses) return null
        // Itens que devolvem um espaço de Conjuração exigem escolher o círculo:
        // só os círculos com espaço gasto ficam clicáveis.
        const maxSlotLevel = ITEMS_RESTORING_SPELL_SLOT[it.item_id]
        const slotChoices =
          maxSlotLevel != null
            ? Array.from({ length: maxSlotLevel }, (_, i) => i + 1).map(level => ({
                level,
                available:
                  (sheet.spellcasting.spell_slots[
                    `c${level}` as keyof typeof sheet.spellcasting.spell_slots
                  ]?.spent ?? 0) > 0,
              }))
            : null

        return {
          idx,
          name: catalogItem.name,
          max: catalogItem.uses.max,
          recharge: catalogItem.uses.recharge,
          spent: it.uses_spent ?? 0,
          restoresPactSlot: ITEMS_RESTORING_PACT_SLOT.includes(it.item_id),
          slotChoices,
        }
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheet.inventory.items, sheet.spellcasting.spell_slots, i18n.language])

  if (relevantes.length === 0 && itemUses.length === 0) return null

  return (
    <div className="space-y-3">
      {relevantes.length > 0 && (
        <>
          <h3 className="font-cinzel font-semibold text-[#B8860B]">{t('resources.heading')}</h3>
          {relevantes.map(res => {
            const max = res.value.max ?? 0
            const current = res.value.current ?? 0
            return (
              <ResourceTracker
                key={res.key}
                label={res.label}
                max={max}
                current={current}
                onUse={() => updateResource(res.key, -1)}
                onRestore={() => updateResource(res.key, max - current)}
              />
            )
          })}
        </>
      )}

      {itemUses.length > 0 && (
        <>
          <h3 className="font-cinzel font-semibold text-[#B8860B] pt-1">{t('resources.magicItems')}</h3>
          {itemUses.map(item => (
            <ResourceTracker
              key={`${item.idx}-${item.name}`}
              label={item.name}
              hint={
                item.restoresPactSlot
                  ? t('resources.restoresPactSlot')
                  : item.slotChoices
                  ? t('resources.restoresSpellSlot')
                  : item.recharge === 'dawn'
                  ? t('resources.rechargeDawn')
                  : t('resources.rechargeManual')
              }
              max={item.max}
              current={item.max - item.spent}
              onUse={() => spendItemUse(item.idx)}
              onRestore={() => restoreItemUse(item.idx)}
              slotChoices={item.slotChoices}
              onUseSlot={level => spendItemUse(item.idx, level)}
              restoreOneByOne
            />
          ))}
        </>
      )}

      {classId === 'ladino' && r.sneak_attack.die && (
        <div className="bg-[#2D2520] border border-[#B8860B]/20 rounded-lg p-3 flex items-center gap-2">
          <span className="text-sm text-[#F5F0E8]">{t('resources.sneakAttack')}</span>
          <span className="font-bold text-[#B8860B]">{r.sneak_attack.die}</span>
        </div>
      )}
    </div>
  )
}

interface ResourceTrackerProps {
  label: string
  hint?: string
  max: number
  current: number
  onUse: () => void
  onRestore: () => void
  /** Itens devolvem um uso por clique; recursos de classe voltam ao máximo de uma vez. */
  restoreOneByOne?: boolean
  /** Quando presente, o uso é gasto escolhendo um círculo em vez de um botão único. */
  slotChoices?: Array<{ level: number; available: boolean }> | null
  onUseSlot?: (level: number) => void
}

function ResourceTracker({
  label, hint, max, current, onUse, onRestore, restoreOneByOne, slotChoices, onUseSlot,
}: ResourceTrackerProps) {
  const { t } = useTranslation()
  const pct = max > 0 ? (current / max) * 100 : 0
  const useDots = max <= DOTS_MAX

  return (
    <div className="bg-[#2D2520] border border-[#B8860B]/20 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-[#F5F0E8]">{label}</span>
        <span className="text-sm font-bold text-[#F5F0E8]">{current}/{max}</span>
      </div>

      {hint && <p className="text-[11px] text-[#A8A09B] -mt-1.5 mb-2">{hint}</p>}

      {/* Dots para recursos pequenos; barra para pools grandes (>20) */}
      {useDots ? (
        <div className="flex gap-1 flex-wrap mb-2" role="group" aria-label={`${label}: ${current} / ${max}`}>
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
            aria-label={label}
          >
            <div
              className="h-full bg-[#B8860B] rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-1">
        {slotChoices ? (
          slotChoices.map(({ level, available }) => (
            <Button
              key={level}
              size="sm"
              variant="secondary"
              onClick={() => onUseSlot?.(level)}
              disabled={current <= 0 || !available}
            >
              {t('resources.useOnCircle', { n: level })}
            </Button>
          ))
        ) : (
          <Button size="sm" variant="secondary" onClick={onUse} disabled={current <= 0}>
            {t('resources.use')}
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={onRestore}
          disabled={restoreOneByOne && current >= max}
        >
          {t('resources.restore')}
        </Button>
      </div>
    </div>
  )
}
