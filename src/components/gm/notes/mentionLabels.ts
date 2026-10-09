import type { TFunction } from 'i18next'
import type { MentionTarget } from '../../../lib/gm/notes'

export function mentionKindLabel(t: TFunction, target: MentionTarget): string {
  if (target.kind === 'player') return t('gm.note.kindPlayer')
  if (target.kind === 'npc') return t('gm.note.kindNpc')
  return target.source === 'srd' ? `${t('gm.note.kindMonster')} · ${t('gm.note.srd')}` : t('gm.note.kindMonster')
}

/** Nome mostrado e gravado na menção: player sem nome e bloco sem nome têm textos diferentes. */
export function mentionName(t: TFunction, target: MentionTarget): string {
  if (target.name.trim()) return target.name
  return target.kind === 'player' ? t('gm.noName') : t('gm.unnamed')
}
