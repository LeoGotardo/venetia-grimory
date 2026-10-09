import { ROOM_ROLL_LABEL_MAX } from './constants.js'

export type ComposerIntent =
  | { kind: 'roll'; expression: string; label: string }
  | { kind: 'chat'; text: string }

const ROLL_COMMAND = /^\/r(?:oll)?\s+(\S+)(?:\s+(.*))?$/i

/**
 * O que a pessoa digitou no campo da sala: `/r 1d20+5 Ataque` (ou `/roll`)
 * vira rolagem com rótulo; o resto é mensagem. Vazio = nada a mandar.
 */
export function parseComposer(text: string): ComposerIntent | null {
  const clean = text.trim()
  if (!clean) return null
  const roll = ROLL_COMMAND.exec(clean)
  if (roll) return { kind: 'roll', expression: roll[1], label: (roll[2] ?? '').trim().slice(0, ROOM_ROLL_LABEL_MAX) }
  return { kind: 'chat', text: clean }
}
