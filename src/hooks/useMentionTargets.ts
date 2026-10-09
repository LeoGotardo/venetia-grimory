import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Campaign } from '../types'
import { useGmStore } from '../store/gmStore'
import { findMentionTarget, mentionTargets, mentionsIn, type MentionTarget } from '../lib/gm/notes'

export interface MentionTargets {
  targets: MentionTarget[]
  /** Com o SRD carregado, monstro citado que não aparece em `targets` sumiu de vez. */
  srdReady: boolean
  /** Pede o SRD — as sugestões do `@` chamam ao abrir. */
  requestSrd: () => void
}

/**
 * Quem pode ser citado nas notas: players e NPCs da campanha, o bestiário e o
 * SRD. O SRD (330 monstros) só carrega quando faz falta: ao abrir as sugestões
 * ou quando `shown` cita um monstro que não está no bestiário.
 */
export function useMentionTargets(campaign: Campaign, shown: string): MentionTargets {
  const { i18n } = useTranslation()
  const bestiary = useGmStore(s => s.bestiary)
  const srd = useGmStore(s => s.srd)
  const loadSrd = useGmStore(s => s.loadSrd)
  const [requested, setRequested] = useState(false)

  // Recalcula só quando as listas mudam, não a cada tecla da nota (que troca a campanha).
  const targets = useMemo(
    () => mentionTargets(campaign.party, campaign.npcs, bestiary, srd?.monsters ?? []),
    [campaign.party, campaign.npcs, bestiary, srd],
  )
  const citesUnknownMonster = mentionsIn(shown).some(m => m.kind === 'monster' && !findMentionTarget(targets, m))
  const wantSrd = requested || citesUnknownMonster

  useEffect(() => {
    if (!wantSrd) return
    loadSrd(i18n.language).catch(err => console.error('[notas] Falha ao carregar os monstros do SRD.', err))
  }, [wantSrd, i18n.language, loadSrd])

  const requestSrd = useCallback(() => setRequested(true), [])
  return { targets, srdReady: srd?.language === i18n.language, requestSrd }
}
