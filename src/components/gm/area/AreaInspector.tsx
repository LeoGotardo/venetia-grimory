import { useEffect, useRef, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { AreaEffect, AreaElement, AreaLabelStyle, AreaLayerId, AreaPathStyle } from '../../../types'
import { stampDef, stampUrl } from '../../../data/areaMap/stamps'
import { iconDef, iconUrl } from '../../../data/areaMap/icons'
import type { ZMove } from '../../../lib/gm/areaMap/scene'
import {
  AREA_ICON_COLORS, AREA_ICON_MAX_SIZE, AREA_ICON_MIN_SIZE, AREA_LABEL_COLORS, AREA_LABEL_MAX_SIZE, AREA_LABEL_MIN_SIZE, AREA_LABEL_STYLES, AREA_LAYERS,
  AREA_PATH_MAX_WIDTH, AREA_PATH_MIN_WIDTH, AREA_PATH_STYLES, AREA_REGION_COLORS, AREA_STAMP_MIN_SCALE,
} from '../../../constants'
import { ColorSwatches, PanelLabel, Segmented, Slider, TexturePicker } from './pickers'

/** Campos editáveis de qualquer tipo; cada inspector só manda os do seu. */
export interface ElementPatch {
  scale?: number
  rotation?: number
  opacity?: number
  flip?: boolean
  text?: string
  size?: number
  color?: string
  style?: AreaLabelStyle | AreaPathStyle
  width?: number
  texture?: string | null
  border?: boolean
  /** `undefined` tira o efeito. */
  effect?: AreaEffect
}

interface AreaInspectorProps {
  element: AreaElement
  /** Pede foco no campo de texto (texto recém-criado). */
  focusText?: boolean
  /** Mudança ao vivo (controle deslizante, digitação); `onCommit` fecha o gesto no desfazer. */
  onLive: (patch: ElementPatch) => void
  onCommit: () => void
  /** Mudança discreta (estilo, cor, espelhar): já entra no desfazer. */
  onChange: (patch: ElementPatch) => void
  onLayer: (layer: AreaLayerId) => void
  onOrder: (move: ZMove) => void
  onDuplicate: () => void
  onDelete: () => void
}

/** O controle de tamanho do stamp para em 4× (as alças vão até 10×). */
const SLIDER_MAX_SCALE = 4

const smallButton =
  'inline-flex items-center justify-center gap-1.5 min-h-[38px] rounded-[9px] px-2.5 text-[12px] font-semibold text-[#E8DFD0] bg-white/5 hover:bg-white/10 border border-white/[0.1] cursor-pointer transition-colors'

function Row({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-1.5">{children}</div>
}

const pct = (n: number) => `${Math.round(n * 100)}%`

/** Propriedades do elemento selecionado — o que muda depende do tipo. */
export function AreaInspector({
  element: el, focusText, onLive, onCommit, onChange, onLayer, onOrder, onDuplicate, onDelete,
}: AreaInspectorProps) {
  const { t } = useTranslation()
  const textRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (focusText && el.kind === 'label') {
      textRef.current?.focus()
      textRef.current?.select()
    }
  }, [focusText, el.id, el.kind])

  const def = el.kind === 'stamp' ? stampDef(el.asset) : undefined
  const icon = el.kind === 'icon' ? iconDef(el.icon) : undefined
  const title =
    el.kind === 'stamp' ? (def ? t(`gm.areaMap.stamps.${def.id}`) : t('gm.areaMap.missingAsset'))
    : el.kind === 'icon' ? (icon ? t(`gm.areaMap.icons.${icon.id}`) : t('gm.areaMap.missingAsset'))
    : el.kind === 'path' ? t(`gm.areaMap.pathStyles.${el.style}`)
    : el.kind === 'label' ? (el.text || t('gm.areaMap.kinds.label'))
    : t(`gm.areaMap.kinds.${el.kind}`)
  const rotation = (value: number) => (
    <Slider label={t('gm.areaMap.rotation')} value={value} display={`${Math.round(value)}°`} min={0} max={359} step={1}
      onChange={v => onLive({ rotation: v })} onCommit={onCommit} />
  )

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center gap-3">
        {(el.kind === 'stamp' || el.kind === 'icon') && (
          <div className="w-14 h-14 rounded-[10px] bg-white/[0.04] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
            {def && <img src={stampUrl(def)} alt="" className="max-w-[44px] max-h-[44px]" />}
            {icon && el.kind === 'icon' && <img src={iconUrl(icon, el.color)} alt="" className="w-[34px] h-[34px]" />}
          </div>
        )}
        <div className="min-w-0">
          <div className="font-semibold text-[15px] text-[#F5F0E8] truncate">{title}</div>
          <div className="text-[12px] text-[#A8A09B]">{t(`gm.areaMap.kinds.${el.kind}`)} · {t(`gm.areaMap.layers.${el.layer}`)}</div>
        </div>
      </div>

      {el.kind === 'stamp' && (
        <>
          <Slider label={t('gm.areaMap.scale')} value={Math.min(el.scale, SLIDER_MAX_SCALE)} display={pct(el.scale)}
            min={AREA_STAMP_MIN_SCALE} max={SLIDER_MAX_SCALE} step={0.05} buttons={0.1} onChange={v => onLive({ scale: v })} onCommit={onCommit} />
          {rotation(el.rotation)}
          <Slider label={t('gm.areaMap.opacity')} value={el.opacity} display={pct(el.opacity)}
            min={0.1} max={1} step={0.05} onChange={v => onLive({ opacity: v })} onCommit={onCommit} />
          <button type="button" onClick={() => onChange({ flip: !el.flip })} aria-pressed={el.flip} className={smallButton}>
            ⇋ {t('gm.areaMap.flip')}
          </button>
          <Segmented<'none' | AreaEffect>
            label={t('gm.areaMap.effect')}
            value={el.effect ?? 'none'}
            options={(['none', 'shadow', 'glow'] as const).map(v => ({ value: v, label: t(`gm.areaMap.effects.${v}`) }))}
            onPick={v => onChange({ effect: v === 'none' ? undefined : v })}
          />
        </>
      )}

      {el.kind === 'icon' && (
        <>
          <Slider label={t('gm.areaMap.scale')} value={el.size} display={String(Math.round(el.size))}
            min={AREA_ICON_MIN_SIZE} max={AREA_ICON_MAX_SIZE} step={1} buttons={8} onChange={v => onLive({ size: v })} onCommit={onCommit} />
          <ColorSwatches label={t('gm.areaMap.color')} colors={AREA_ICON_COLORS} value={el.color} onPick={color => onChange({ color })} />
        </>
      )}

      {el.kind === 'label' && (
        <>
          <label className="flex flex-col gap-1">
            <PanelLabel>{t('gm.areaMap.labelText')}</PanelLabel>
            <textarea
              ref={textRef}
              value={el.text}
              rows={2}
              onChange={e => onLive({ text: e.target.value })}
              onBlur={onCommit}
              data-testid="texto-mapa"
              className="w-full resize-y bg-[#131110] border border-white/[0.1] rounded-[8px] px-2.5 py-2 text-[15px] text-[#F5F0E8] focus:outline-none focus:border-[#D4A017]"
            />
          </label>
          <Segmented<AreaLabelStyle>
            label={t('gm.areaMap.labelStyle')}
            value={el.style}
            options={(Object.keys(AREA_LABEL_STYLES) as AreaLabelStyle[]).map(s => ({ value: s, label: t(`gm.areaMap.labelStyles.${s}`) }))}
            onPick={style => onChange({ style })}
          />
          <Slider label={t('gm.areaMap.labelSize')} value={el.size} display={String(Math.round(el.size))}
            min={AREA_LABEL_MIN_SIZE} max={Math.min(AREA_LABEL_MAX_SIZE, 200)} step={1} buttons={4} onChange={v => onLive({ size: v })} onCommit={onCommit} />
          {rotation(el.rotation)}
          <ColorSwatches label={t('gm.areaMap.color')} colors={AREA_LABEL_COLORS} value={el.color} onPick={color => onChange({ color })} />
        </>
      )}

      {el.kind === 'path' && (
        <>
          <Segmented<AreaPathStyle>
            label={t('gm.areaMap.pathStyle')}
            value={el.style}
            options={(Object.keys(AREA_PATH_STYLES) as AreaPathStyle[]).map(s => ({ value: s, label: t(`gm.areaMap.pathStyles.${s}`) }))}
            onPick={style => onChange({ style })}
          />
          <Slider label={t('gm.areaMap.width')} value={el.width} display={String(Math.round(el.width))}
            min={AREA_PATH_MIN_WIDTH} max={AREA_PATH_MAX_WIDTH} step={1} onChange={v => onLive({ width: v })} onCommit={onCommit} />
        </>
      )}

      {el.kind === 'region' && (
        <>
          <Segmented<'textured' | 'territory'>
            label={t('gm.areaMap.regionMode')}
            value={el.texture ? 'textured' : 'territory'}
            options={[
              { value: 'textured', label: t('gm.areaMap.regionTextured') },
              { value: 'territory', label: t('gm.areaMap.regionTerritory') },
            ]}
            onPick={mode => onChange(mode === 'textured' ? { texture: 'forest', opacity: 1 } : { texture: null, opacity: 0.25, border: true })}
          />
          {el.texture
            ? <TexturePicker label={t('gm.areaMap.texture')} value={el.texture} onPick={texture => onChange({ texture })} />
            : <ColorSwatches label={t('gm.areaMap.color')} colors={AREA_REGION_COLORS} value={el.color} onPick={color => onChange({ color })} />}
          <Slider label={t('gm.areaMap.opacity')} value={el.opacity} display={pct(el.opacity)}
            min={0.05} max={1} step={0.05} onChange={v => onLive({ opacity: v })} onCommit={onCommit} />
          <button type="button" onClick={() => onChange({ border: !el.border })} aria-pressed={el.border} className={smallButton}>
            {t(el.border ? 'gm.areaMap.borderOn' : 'gm.areaMap.borderOff')}
          </button>
        </>
      )}

      <label className="flex flex-col gap-1">
        <PanelLabel>{t('gm.areaMap.layer')}</PanelLabel>
        <select
          value={el.layer}
          onChange={e => onLayer(e.target.value as AreaLayerId)}
          className="w-full bg-[#131110] border border-white/[0.1] rounded-[8px] px-2.5 py-2 text-[14px] text-[#F5F0E8] focus:outline-none focus:border-[#D4A017]"
        >
          {AREA_LAYERS.map(id => <option key={id} value={id}>{t(`gm.areaMap.layers.${id}`)}</option>)}
        </select>
      </label>

      <Row>
        <button type="button" onClick={() => onOrder('top')} className={smallButton}>{t('gm.areaMap.bringFront')}</button>
        <button type="button" onClick={() => onOrder('bottom')} className={smallButton}>{t('gm.areaMap.sendBack')}</button>
        <button type="button" onClick={() => onOrder('up')} className={smallButton}>{t('gm.areaMap.forward')}</button>
        <button type="button" onClick={() => onOrder('down')} className={smallButton}>{t('gm.areaMap.backward')}</button>
      </Row>
      <Row>
        <button type="button" onClick={onDuplicate} className={smallButton}>{t('gm.duplicate')}</button>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center justify-center min-h-[38px] rounded-[9px] text-[12px] font-semibold text-[#e7a29a] bg-[rgba(181,57,47,0.1)] border border-[rgba(181,57,47,0.3)] hover:bg-[rgba(181,57,47,0.2)] cursor-pointer transition-colors"
        >
          {t('gm.remove')}
        </button>
      </Row>
    </div>
  )
}
