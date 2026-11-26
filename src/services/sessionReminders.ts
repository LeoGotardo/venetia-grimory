import type { RoomSession } from '../lib/room/protocol'
import { planReminders } from '../lib/room/reminders'
import { SESSION_REMINDER_LEAD_MS } from '../constants'
import { isApp } from '../lib/platform'
import { useConfigStore } from '../store/configStore'
import i18n from '../i18n'

/**
 * Lembretes de sessão como notificações locais do Android: cada aparelho agenda
 * os próprios a partir da agenda da sala que recebeu (não há push do servidor —
 * aparelho que não abriu o app depois de a sessão ser marcada não sabe dela).
 * Desligados por padrão; ligar pede a permissão de notificação. Na web não há.
 */

const plugin = () => import('@capacitor/local-notifications').then(m => m.LocalNotifications)

export const remindersSupported = () => isApp()

/** Ligado na preferência e permitido pelo sistema — só então agenda (o `schedule` do plugin pediria a permissão sozinho). */
async function allowed(): Promise<boolean> {
  if (!isApp() || !useConfigStore.getState().config.session_reminders) return false
  const { display } = await (await plugin()).checkPermissions()
  return display === 'granted'
}

/** Troca os lembretes de uma sala pelos da agenda atual. `path` é para onde o toque na notificação leva. */
export async function syncRoomReminders(room: { id: string; name: string; path: string | null }, sessions: RoomSession[]): Promise<void> {
  try {
    if (!(await allowed())) return
    const notifications = await plugin()
    const pending = await notifications.getPending()
    const stale = pending.notifications.filter(n => n.extra?.room_id === room.id)
    if (stale.length > 0) await notifications.cancel({ notifications: stale.map(n => ({ id: n.id })) })
    const plan = planReminders(sessions, SESSION_REMINDER_LEAD_MS, Date.now())
    if (plan.length === 0) return
    const minutes = Math.round(SESSION_REMINDER_LEAD_MS / 60_000)
    await notifications.schedule({
      notifications: plan.map(p => ({
        id: p.id,
        title: i18n.t('room.sessions.reminderTitle', { minutes }),
        body: p.session.title ? `${p.session.title} · ${room.name}` : room.name,
        schedule: { at: p.at, allowWhileIdle: true },
        extra: { room_id: room.id, path: room.path },
      })),
    })
  } catch (err) {
    console.error('[sessões] Falha ao agendar os lembretes.', err)
  }
}

/** Cancela os lembretes de salas que saíram deste aparelho (saiu, foi removido, esqueceu). */
export async function cancelRemindersExcept(roomIds: string[]): Promise<void> {
  try {
    if (!(await allowed())) return
    const notifications = await plugin()
    const pending = await notifications.getPending()
    const orphans = pending.notifications.filter(n => n.extra?.room_id && !roomIds.includes(n.extra.room_id))
    if (orphans.length > 0) await notifications.cancel({ notifications: orphans.map(n => ({ id: n.id })) })
  } catch (err) {
    console.error('[sessões] Falha ao cancelar lembretes de salas antigas.', err)
  }
}

/** Liga os lembretes: pede a permissão e só liga se o sistema deixar. Devolve se ficou ligado. */
export async function enableReminders(): Promise<boolean> {
  if (!isApp()) return false
  try {
    const { display } = await (await plugin()).requestPermissions()
    const granted = display === 'granted'
    useConfigStore.getState().setConfig({ session_reminders: granted })
    return granted
  } catch (err) {
    console.error('[sessões] Falha ao pedir a permissão de notificação.', err)
    return false
  }
}

/** Desliga e cancela tudo o que já estava agendado. */
export async function disableReminders(): Promise<void> {
  useConfigStore.getState().setConfig({ session_reminders: false })
  if (!isApp()) return
  try {
    const notifications = await plugin()
    const pending = await notifications.getPending()
    const ours = pending.notifications.filter(n => n.extra?.room_id)
    if (ours.length > 0) await notifications.cancel({ notifications: ours.map(n => ({ id: n.id })) })
  } catch (err) {
    console.error('[sessões] Falha ao cancelar os lembretes.', err)
  }
}

/** Toque na notificação abre a sala. Devolve o "desligar". */
export function onReminderTap(open: (path: string) => void): () => void {
  if (!isApp()) return () => {}
  const handle = plugin().then(n => n.addListener('localNotificationActionPerformed', action => {
    const path = action.notification.extra?.path
    if (typeof path === 'string') open(path)
  }))
  return () => {
    handle.then(h => h.remove()).catch(err => console.error('[sessões] Falha ao soltar o ouvinte.', err))
  }
}
