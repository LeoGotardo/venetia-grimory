import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '../../ui/Modal'
import { gmPrimaryButton } from '../GmHeader'
import { Segmented } from './pickers'
import { AREA_EXPORT_MAX_PX } from '../../../constants'

export interface ExportOptions {
  format: 'png' | 'jpeg'
  scale: number
  labels: boolean
  grid: boolean
}

interface ExportDialogProps {
  open: boolean
  onClose: () => void
  width: number
  height: number
  hasGrid: boolean
  onExport: (options: ExportOptions) => Promise<void>
}

const SCALES = [1, 2, 4] as const

const toggle = (on: boolean) =>
  `flex items-center justify-between gap-3 min-h-[44px] rounded-[10px] px-3 text-[14px] border cursor-pointer transition-colors ${
    on ? 'bg-[rgba(212,160,23,0.12)] border-[rgba(212,160,23,0.5)] text-[#F5F0E8]' : 'bg-white/5 border-white/[0.1] text-[#A8A09B]'
  }`

/** Exportar o mapa como imagem: formato, resolução e o que entra. */
export function ExportDialog({ open, onClose, width, height, hasGrid, onExport }: ExportDialogProps) {
  const { t } = useTranslation()
  const [options, setOptions] = useState<ExportOptions>({ format: 'png', scale: 1, labels: true, grid: false })
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)

  const maxScale = AREA_EXPORT_MAX_PX / Math.max(width, height)
  const scale = Math.min(options.scale, maxScale)
  const px = `${Math.round(width * scale)} × ${Math.round(height * scale)} px`

  async function run() {
    setBusy(true)
    setFailed(false)
    try {
      await onExport({ ...options, scale })
      onClose()
    } catch (err) {
      console.error('[ExportDialog] Falha ao exportar o mapa.', err)
      setFailed(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={t('gm.areaMap.exportTitle')}>
      <div className="flex flex-col gap-4">
        <Segmented<'png' | 'jpeg'>
          label={t('gm.areaMap.exportFormat')}
          value={options.format}
          options={[{ value: 'png', label: 'PNG' }, { value: 'jpeg', label: 'JPEG' }]}
          onPick={format => setOptions(o => ({ ...o, format }))}
        />
        <Segmented<string>
          label={t('gm.areaMap.exportScale')}
          value={String(options.scale)}
          options={SCALES.filter(s => s === 1 || s <= maxScale * 1.01).map(s => ({ value: String(s), label: `${s}×` }))}
          onPick={v => setOptions(o => ({ ...o, scale: Number(v) }))}
        />
        <p className="text-[13px] text-[#A8A09B] -mt-2 tabular-nums">{px}</p>
        <button type="button" aria-pressed={options.labels} onClick={() => setOptions(o => ({ ...o, labels: !o.labels }))} className={toggle(options.labels)}>
          {t('gm.areaMap.exportLabels')}<span aria-hidden="true">{options.labels ? '✓' : '—'}</span>
        </button>
        {hasGrid && (
          <button type="button" aria-pressed={options.grid} onClick={() => setOptions(o => ({ ...o, grid: !o.grid }))} className={toggle(options.grid)}>
            {t('gm.areaMap.exportGrid')}<span aria-hidden="true">{options.grid ? '✓' : '—'}</span>
          </button>
        )}
        {failed && <p role="alert" className="text-[13px] text-[#f0c2bb]">{t('gm.areaMap.exportFailed')}</p>}
        <button type="button" data-testid="area-exportar" disabled={busy} onClick={() => void run()} className={`${gmPrimaryButton} min-h-[46px]`}>
          {busy ? t('gm.areaMap.exporting') : t('gm.areaMap.exportAction')}
        </button>
      </div>
    </Modal>
  )
}
