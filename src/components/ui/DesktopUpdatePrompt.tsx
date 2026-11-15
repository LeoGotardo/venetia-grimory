import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from './Modal'
import Button from './Button'
import type { DesktopBridge, DesktopUpdate } from '../../lib/desktopBridge'

type Stage =
  | { kind: 'offer' }
  | { kind: 'downloading'; percent: number | null }
  | { kind: 'ready' }
  | { kind: 'error' }

/**
 * Oferece a versão nova do app desktop ao abrir. O download e a instalação são
 * do electron-updater, no processo principal (`electron/updater.ts`); aqui é só
 * a conversa com a pessoa. "Agora não" depois de baixar instala ao fechar o app.
 */
export function DesktopUpdatePrompt({ desktop }: { desktop: DesktopBridge }) {
  const { t } = useTranslation()
  const [update, setUpdate] = useState<DesktopUpdate | null>(null)
  const [stage, setStage] = useState<Stage>({ kind: 'offer' })

  useEffect(() => {
    let cancelled = false
    desktop.checkForUpdate().then(found => {
      if (!cancelled) setUpdate(found)
    }).catch(() => undefined)
    return () => { cancelled = true }
  }, [desktop])

  if (!update) return null

  const busy = stage.kind === 'downloading'
  const close = () => { if (!busy) setUpdate(null) }

  async function start() {
    setStage({ kind: 'downloading', percent: null })
    const stop = desktop.onUpdateProgress(percent => setStage({ kind: 'downloading', percent }))
    try {
      await desktop.downloadUpdate()
      setStage({ kind: 'ready' })
    } catch {
      setStage({ kind: 'error' })
    } finally {
      stop()
    }
  }

  return (
    <Modal open onClose={close} title={t('update.title')}>
      <div className="space-y-4 text-sm text-[#F5F0E8]">
        {stage.kind === 'offer' && (
          <>
            <p>{t('update.available', { version: update.version })}</p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={close}>{t('update.later')}</Button>
              <Button onClick={start}>{t('update.update')}</Button>
            </div>
          </>
        )}

        {stage.kind === 'downloading' && (
          <>
            <p>{stage.percent === null ? t('update.downloading') : t('update.downloadingPercent', { percent: stage.percent })}</p>
            <div className="h-2 rounded bg-[#2D2520] overflow-hidden" role="progressbar" aria-valuenow={stage.percent ?? undefined} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full bg-[#D4A017] transition-all" style={{ width: `${stage.percent ?? 5}%` }} />
            </div>
          </>
        )}

        {stage.kind === 'ready' && (
          <>
            <p>{t('update.desktopReady')}</p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={close}>{t('update.later')}</Button>
              <Button onClick={() => void desktop.installUpdate()}>{t('update.restart')}</Button>
            </div>
          </>
        )}

        {stage.kind === 'error' && (
          <>
            <p>{t('update.error')}</p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={close}>{t('update.later')}</Button>
              <Button onClick={start}>{t('update.retry')}</Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
