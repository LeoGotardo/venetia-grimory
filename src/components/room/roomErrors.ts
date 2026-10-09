import type { TFunction } from 'i18next'
import { RoomApiError } from '../../services/roomApi'

/** Mensagem para a pessoa; o detalhe técnico já foi para o console em `roomApi`. */
export function roomErrorMessage(t: TFunction, err: unknown): string {
  if (!(err instanceof RoomApiError)) console.error('[salas] Falha inesperada.', err)
  const code = err instanceof RoomApiError ? err.code : 'server_error'
  return t(`room.errors.${code}`)
}
