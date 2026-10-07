import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { AreaLayerId, AreaStamp } from '../../../types'
import { stampDef, stampUrl } from '../../../data/areaMap/stamps'
import type { ZMove } from '../../../lib/gm/areaMap/scene'
import { AREA_LAYERS, AREA_STAMP_MIN_SCALE } from '../../../constants'

interface AreaInspectorProps {
  stamp: AreaStamp
  /** Mudança ao vivo (controle deslizante); `onCommit` fecha o gesto no desfazer. */
  onLive: (patch: Partial<AreaStamp>) => void
  onCommit: () => void
  /** Mudança discreta (camada, espelhar): já entra no desfazer. */
  onChange: (patch: Partial<AreaStamp>) => void
  onOrder: (move: ZMove) => void
  onDuplicate: () => void
  onDelete: () => void
}

/** Escala do controle deslizante: o stamp pode ir até 10×, mas o controle para em 4× (digitar no mapa vai além). */
const SLIDER_MAX_SCALE = 4

const smallButton =
  'inline-flex items-center justify-center gap-1.5 min-h-[38px] rounded-[9px] px-2.5 text-[12px] font-semibold text-[#E8DFD0] bg-white/5 hover:bg-white/10 border border-white/[0.1] cursor-pointer transition-colors'

function Slider({ label, value, display, min, max, step, onChange, onCommit }: {
  label: string; value: number; display: string; min: number; max: number; step: number
  onChange: (v: number) => void; onCommit: () => void
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="flex justify-between text-[11px] font-semibold uppercase tracking-wider text-[#A8A09B]">
        {label}<span className="tabular-nums normal-case tracking-normal text-[#E8DFD0]">{display}</span>
      </span>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        onPointerUp={onCommit}
        onKeyUp={onCommit}
        className="w-full accent-[#D4A017]"
      />
    </label>
  )
}

function Row({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-1.5">{children}</div>
}

/** Propriedades do stamp selecionado. */
export function AreaInspector({ stamp, onLive, onCommit, onChange, onOrder, onDuplicate, onDelete }: AreaInspectorProps) {
  const { t } = useTranslation()
  const def = stampDef(stamp.asset)

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-[10px] bg-white/[0.04] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
          {def && <img src={stampUrl(def)} alt="" className="max-w-[44px] max-h-[44px]" />}
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-[15px] text-[#F5F0E8] truncate">
            {def ? t(`gm.areaMap.stamps.${def.id}`) : t('gm.areaMap.missingAsset')}
          </div>
          <div className="text-[12px] text-[#A8A09B]">{t(`gm.areaMap.layers.${stamp.layer}`)}</div>
        </div>
      </div>

      <Slider
        label={t('gm.areaMap.scale')}
        value={Math.min(stamp.scale, SLIDER_MAX_SCALE)}
        display={`${Math.round(stamp.scale * 100)}%`}
        min={AREA_STAMP_MIN_SCALE} max={SLIDER_MAX_SCALE} step={0.05}
        onChange={scale => onLive({ scale })}
        onCommit={onCommit}
      />
      <Slider
        label={t('gm.areaMap.rotation')}
        value={stamp.rotation}
        display={`${Math.round(stamp.rotation)}°`}
        min={0} max={359} step={1}
        onChange={rotation => onLive({ rotation })}
        onCommit={onCommit}
      />
      <Slider
        label={t('gm.areaMap.opacity')}
        value={stamp.opacity}
        display={`${Math.round(stamp.opacity * 100)}%`}
        min={0.1} max={1} step={0.05}
        onChange={opacity => onLive({ opacity })}
        onCommit={onCommit}
      />

      <label className="flex flex-col gap-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A8A09B]">{t('gm.areaMap.layer')}</span>
        <select
          value={stamp.layer}
          onChange={e => onChange({ layer: e.target.value as AreaLayerId })}
          className="w-full bg-[#131110] border border-white/[0.1] rounded-[8px] px-2.5 py-2 text-[14px] text-[#F5F0E8] focus:outline-none focus:border-[#D4A017]"
        >
          {AREA_LAYERS.map(id => <option key={id} value={id}>{t(`gm.areaMap.layers.${id}`)}</option>)}
        </select>
      </label>

      <Row>
        <button type="button" onClick={() => onChange({ flip: !stamp.flip })} aria-pressed={stamp.flip} className={smallButton}>
          ⇋ {t('gm.areaMap.flip')}
        </button>
        <button type="button" onClick={onDuplicate} className={smallButton}>{t('gm.duplicate')}</button>
      </Row>
      <Row>
        <button type="button" onClick={() => onOrder('top')} className={smallButton}>{t('gm.areaMap.bringFront')}</button>
        <button type="button" onClick={() => onOrder('bottom')} className={smallButton}>{t('gm.areaMap.sendBack')}</button>
        <button type="button" onClick={() => onOrder('up')} className={smallButton}>{t('gm.areaMap.forward')}</button>
        <button type="button" onClick={() => onOrder('down')} className={smallButton}>{t('gm.areaMap.backward')}</button>
      </Row>
      <button
        type="button"
        onClick={onDelete}
        className="inline-flex items-center justify-center min-h-[40px] rounded-[9px] text-[13px] font-semibold text-[#e7a29a] bg-[rgba(181,57,47,0.1)] border border-[rgba(181,57,47,0.3)] hover:bg-[rgba(181,57,47,0.2)] cursor-pointer transition-colors"
      >
        {t('gm.remove')}
      </button>
    </div>
  )
}
