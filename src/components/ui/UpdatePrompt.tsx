import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from './Modal'
import Button from './Button'
import { AppUpdater, checkForUpdate, type AvailableUpdate } from '../../lib/appUpdate'

type Stage =
  | { kind: 'offer' }
  | { kind: 'downloading'; percent: number | null }
  | { kind: 'permission'; path: string; denied: boolean }
  | { kind: 'installing'; path: string }
  | { kind: 'error' }

/**
 * Oferece a versão nova do APK ao abrir o app. Só aparece no Android, com
 * internet e quando a última release do GitHub é mais nova que a instalada.
 */
export function UpdatePrompt() {
  const { t } = useTranslation()
  const [update, setUpdate] = useState<AvailableUpdate | null>(null)
  const [stage, setStage] = useState<Stage>({ kind: 'offer' })

  useEffect(() => {
    let cancelled = false
    checkForUpdate().then(found => {
      if (!cancelled) setUpdate(found)
    })
    return () => { cancelled = true }
  }, [])

  if (!update) return null

  const busy = stage.kind === 'downloading'
  const close = () => { if (!busy) setUpdate(null) }

  async function install(path: string) {
    const { granted } = await AppUpdater.canInstall()
    if (!granted) {
      setStage({ kind: 'permission', path, denied: false })
      return
    }
    setStage({ kind: 'installing', path })
    try {
      await AppUpdater.install({ path })
    } catch {
      setStage({ kind: 'error' })
    }
  }

  async function start() {
    if (!update) return
    setStage({ kind: 'downloading', percent: null })
    const listener = await AppUpdater.addListener('downloadProgress', ({ loaded, total }) => {
      setStage({ kind: 'downloading', percent: total > 0 ? Math.round((loaded / total) * 100) : null })
    })
    try {
      const { path } = await AppUpdater.download({ url: update.apkUrl, fileName: update.apkName })
      await install(path)
    } catch {
      setStage({ kind: 'error' })
    } finally {
      await listener.remove()
    }
  }

  async function allowSource(path: string) {
    const { granted } = await AppUpdater.openInstallSettings()
    if (granted) await install(path)
    else setStage({ kind: 'permission', path, denied: true })
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

        {stage.kind === 'permission' && (
          <>
            <p>{t('update.permission')}</p>
            {stage.denied && <p className="text-[#E8C25A]">{t('update.permissionDenied')}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={close}>{t('update.later')}</Button>
              <Button onClick={() => allowSource(stage.path)}>{t('update.allow')}</Button>
            </div>
          </>
        )}

        {stage.kind === 'installing' && (
          <>
            <p>{t('update.installing')}</p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={close}>{t('update.later')}</Button>
              <Button onClick={() => install(stage.path)}>{t('update.installAgain')}</Button>
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
