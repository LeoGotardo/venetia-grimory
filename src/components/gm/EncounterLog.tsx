import { useTranslation } from 'react-i18next'
import type { EncounterLogEntry } from '../../types'
import { translateTerm } from '../../data/rules/translation'

const SHOWN = 60

/** Monta a frase no idioma atual — o log guarda só os dados. */
function useLogText() {
  const { t, i18n } = useTranslation()
  return (e: EncounterLogEntry): string => {
    switch (e.kind) {
      case 'start': return t('gm.logStart')
      case 'end': return t('gm.logEnd')
      case 'round': return t('gm.logRound', { n: e.round })
      case 'turn': return t('gm.logTurn', { actor: e.actor })
      case 'damage': return t('gm.logDamage', { actor: e.actor, amount: e.amount, hp: e.hp })
      case 'heal': return t('gm.logHeal', { actor: e.actor, amount: e.amount, hp: e.hp })
      case 'temp': return t('gm.logTemp', { actor: e.actor, amount: e.amount })
      case 'condition': {
        const condition = translateTerm(e.condition, i18n.language)
        return e.on ? t('gm.logConditionOn', { actor: e.actor, condition }) : t('gm.logConditionOff', { actor: e.actor, condition })
      }
      case 'defeated': return e.on ? t('gm.logDefeatedOn', { actor: e.actor }) : t('gm.logDefeatedOff', { actor: e.actor })
      case 'concentration': return t('gm.logConcentration', { actor: e.actor, dc: e.dc })
      case 'initiative': return t('gm.logInitiative', { actor: e.actor, roll: e.roll, total: e.total })
      case 'attack': {
        const base = t('gm.logAttack', { actor: e.actor, feature: e.feature, roll: e.roll, total: e.total })
        return e.crit ? `${base} ${t('gm.logCrit')}` : e.fumble ? `${base} ${t('gm.logFumble')}` : base
      }
      case 'damage_roll':
        return t('gm.logDamageRoll', {
          actor: e.actor, feature: e.feature, total: e.total, type: e.damage_type, rolls: e.rolls.join(', '),
        }).replace(/ \(\)/, '').replace(/ {2,}/g, ' ')
    }
  }
}

function tone(e: EncounterLogEntry): string {
  if (e.kind === 'round' || e.kind === 'start' || e.kind === 'end') return 'text-[#D4A017] font-semibold'
  if (e.kind === 'concentration' || (e.kind === 'attack' && e.crit)) return 'text-[#e08a4a] font-semibold'
  if (e.kind === 'damage' || (e.kind === 'defeated' && e.on)) return 'text-[#e8a39b]'
  if (e.kind === 'heal') return 'text-[#a9d39b]'
  return 'text-[#E8DFD0]'
}

export function EncounterLog({ log }: { log: EncounterLogEntry[] }) {
  const { t } = useTranslation()
  const text = useLogText()
  const recent = log.slice(-SHOWN).reverse()

  return (
    <section className="rounded-[11px] border border-white/[0.07] bg-[#1A1714] p-3" aria-label={t('gm.log')}>
      <h2 className="text-[11px] font-semibold uppercase tracking-wider text-[#A8A09B] mb-2">{t('gm.log')}</h2>
      {recent.length === 0 ? (
        <p className="text-[13px] text-[#A8A09B]">{t('gm.logEmpty')}</p>
      ) : (
        <ol className="flex flex-col gap-1 max-h-[320px] overflow-y-auto" aria-live="polite">
          {recent.map(e => (
            <li key={e.id} className={`text-[12px] leading-snug ${tone(e)}`}>{text(e)}</li>
          ))}
        </ol>
      )}
    </section>
  )
}
