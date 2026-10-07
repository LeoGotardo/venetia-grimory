import type { Encounter } from '../../types'

/** "Preparando", "Rodada 3" ou "Encerrado" — recebe o `t` do react-i18next. */
export function encounterStatusLabel(e: Encounter, t: (key: string, opts?: Record<string, unknown>) => string): string {
  if (e.status === 'active') return t('gm.statusActive', { round: e.round })
  return e.status === 'finished' ? t('gm.statusFinished') : t('gm.statusPreparing')
}
