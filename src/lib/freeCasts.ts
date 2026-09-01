import type { FreeCast } from '../types'
import { gameData } from '../data/rules'

type Translate = (key: string, options?: Record<string, unknown>) => string

/**
 * Nome legível de uma conjuração sem espaço, no idioma da interface. O rótulo é
 * montado aqui, e não gravado na ficha, porque a ficha guarda só o id da lista —
 * assim o texto acompanha a troca de idioma.
 */
export function freeCastLabel(cast: FreeCast, t: Translate): string {
  if (cast.kind === 'mystic_arcanum') return t('magic.mysticArcanum', { n: cast.level })
  const list = cast.spell_list
    ? gameData.classes.find(c => c.id === cast.spell_list)?.name
    : null
  return list ? t('magic.magicInitiateOf', { list }) : t('magic.magicInitiate')
}

/** Quantos truques a conjuração concede — 2 no Iniciado em Magia, nenhum na Arcana Mística. */
export function freeCastCantripCount(cast: FreeCast): number {
  return cast.kind === 'magic_initiate' ? 2 : 0
}

/** Falta escolher alguma coisa? Usado para sinalizar pendência no wizard e na aba Editar. */
export function isFreeCastIncomplete(cast: FreeCast): boolean {
  if (!cast.spell_list || !cast.spell) return true
  if (cast.kind === 'magic_initiate' && (!cast.ability || cast.cantrips.length < 2)) return true
  return false
}
