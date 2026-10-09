import { ROOM_CODE_ALPHABET, ROOM_CODE_LENGTH } from './constants.js'

const CODE_PATTERN = new RegExp(`^[${ROOM_CODE_ALPHABET}]{${ROOM_CODE_LENGTH}}$`)

/** Código novo. `randomInt(n)` devolve um inteiro em [0, n) — no servidor, `crypto.randomInt`. */
export function generateRoomCode(randomInt: (max: number) => number): string {
  return Array.from({ length: ROOM_CODE_LENGTH }, () => ROOM_CODE_ALPHABET[randomInt(ROOM_CODE_ALPHABET.length)]).join('')
}

/** O que a pessoa digitou, do jeito que o código é gravado: maiúsculo, sem espaço nem traço. */
export function normalizeRoomCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, ROOM_CODE_LENGTH)
}

export function isRoomCode(code: string): boolean {
  return CODE_PATTERN.test(code)
}
