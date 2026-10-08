import { useTranslation } from 'react-i18next'
import type { AreaBrushEdge, AreaLabelStyle, AreaPathStyle } from '../../../types'
import {
  AREA_BRUSH_MAX, AREA_BRUSH_MIN, AREA_BRUSH_OPACITY_MIN, AREA_ICON_MAX_SIZE, AREA_ICON_MIN_SIZE, AREA_LABEL_STYLES,
  AREA_PATH_MAX_WIDTH, AREA_PATH_MIN_WIDTH, AREA_PATH_STYLES, AREA_REGION_COLORS, AREA_STAMP_MIN_SCALE,
} from '../../../constants'
import { ColorSwatches, PanelLabel, Segmented, Slider, TexturePicker } from './pickers'
import { brushTipSwatch } from './brushTips'

export type AreaTool = 'select' | 'pan' | 'place' | 'brush' | 'erase' | 'region' | 'path' | 'label'

/** Escolhas das ferramentas de desenho — valem para o próximo traço, não para o que já está no mapa. */
export interface ToolSettings {
  brushTexture: string
  brushSize: number
  eraseLayer: 'terrain' | 'water'
  regionMode: 'textured' | 'territory'
  regionTexture: string
  regionColor: string
  pathStyle: AreaPathStyle
  pathWidth: number
  labelStyle: AreaLabelStyle
  /** Cada toque soma à seleção (o Shift do teclado, para telas de toque). */
  multiSelect: boolean
  brushEdge: AreaBrushEdge
  /** Força do pincel (0–1). */
  brushOpacity: number
  /** Tamanho com que objetos e ícones entram no mapa. */
  stampScale: number
  iconSize: number
}

interface AreaToolOptionsProps {
  tool: AreaTool
  settings: ToolSettings
  /** O que a ferramenta de colocar vai pôr (decide qual tamanho mostrar). */
  placeKind: 'stamp' | 'icon' | null
  onChange: (patch: Partial<ToolSettings>) => void
}

const EDGES: readonly AreaBrushEdge[] = ['rough', 'soft', 'hard']

/** Pontas do pincel com a prévia da própria ponta, como os pincéis do Inkarnate. */
function EdgePicker({ value, onPick }: { value: AreaBrushEdge; onPick: (edge: AreaBrushEdge) => void }) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col gap-2">
      <PanelLabel>{t('gm.areaMap.brushEdge')}</PanelLabel>
      <div role="radiogroup" aria-label={t('gm.areaMap.brushEdge')} className="grid grid-cols-3 gap-1.5">
        {EDGES.map(edge => (
          <button
            key={edge}
            type="button"
            role="radio"
            aria-checked={value === edge}
            data-testid={`ponta-${edge}`}
            onClick={() => onPick(edge)}
            className={`flex flex-col items-center gap-1 rounded-[10px] p-1.5 border cursor-pointer transition-colors ${
              value === edge ? 'bg-[rgba(212,160,23,0.16)] border-[#D4A017]' : 'bg-white/[0.03] border-white/[0.08] hover:border-[rgba(212,160,23,0.45)]'
            }`}
          >
            <img src={brushTipSwatch(edge)} alt="" className="w-10 h-10" draggable={false} />
            <span className="text-[11px] font-semibold text-[#E8DFD0]">{t(`gm.areaMap.brushEdges.${edge}`)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

/** Opções da ferramenta ativa (só as de desenho têm). */
export function AreaToolOptions({ tool, settings: s, placeKind, onChange }: AreaToolOptionsProps) {
  const { t } = useTranslation()

  const size = (
    <Slider label={t('gm.areaMap.brushSize')} value={s.brushSize} display={String(s.brushSize)}
      min={AREA_BRUSH_MIN} max={AREA_BRUSH_MAX} step={2} buttons={10} onChange={v => onChange({ brushSize: v })} />
  )
  const brush = (
    <>
      <EdgePicker value={s.brushEdge} onPick={brushEdge => onChange({ brushEdge })} />
      {size}
      <Slider label={t('gm.areaMap.brushOpacity')} value={s.brushOpacity} display={`${Math.round(s.brushOpacity * 100)}%`}
        min={AREA_BRUSH_OPACITY_MIN} max={1} step={0.05} buttons={0.1} onChange={v => onChange({ brushOpacity: v })} />
    </>
  )

  switch (tool) {
    case 'select':
      return (
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            aria-pressed={s.multiSelect}
            data-testid="area-multisel"
            onClick={() => onChange({ multiSelect: !s.multiSelect })}
            className={`flex items-center justify-between min-h-[40px] rounded-[9px] px-3 text-[13px] font-semibold border cursor-pointer transition-colors ${
              s.multiSelect ? 'bg-[rgba(212,160,23,0.16)] border-[#D4A017] text-[#F5F0E8]' : 'bg-white/5 border-white/[0.1] text-[#A8A09B] hover:text-[#E8DFD0]'
            }`}
          >
            {t('gm.areaMap.multiSelect')}<span aria-hidden="true">{s.multiSelect ? '✓' : ''}</span>
          </button>
          <p className="text-[11px] leading-snug text-[#A8A09B]">{t('gm.areaMap.multiHint')}</p>
        </div>
      )
    case 'brush':
      return (
        <div className="flex flex-col gap-3">
          <TexturePicker label={t('gm.areaMap.texture')} value={s.brushTexture} onPick={brushTexture => onChange({ brushTexture })} />
          {brush}
        </div>
      )
    case 'erase':
      return (
        <div className="flex flex-col gap-3">
          <Segmented<'terrain' | 'water'>
            label={t('gm.areaMap.eraseTarget')}
            value={s.eraseLayer}
            options={[
              { value: 'terrain', label: t('gm.areaMap.layers.terrain') },
              { value: 'water', label: t('gm.areaMap.layers.water') },
            ]}
            onPick={eraseLayer => onChange({ eraseLayer })}
          />
          {brush}
        </div>
      )
    case 'region':
      return (
        <div className="flex flex-col gap-3">
          <Segmented<'textured' | 'territory'>
            label={t('gm.areaMap.regionMode')}
            value={s.regionMode}
            options={[
              { value: 'textured', label: t('gm.areaMap.regionTextured') },
              { value: 'territory', label: t('gm.areaMap.regionTerritory') },
            ]}
            onPick={regionMode => onChange({ regionMode })}
          />
          {s.regionMode === 'textured'
            ? <TexturePicker label={t('gm.areaMap.texture')} value={s.regionTexture} onPick={regionTexture => onChange({ regionTexture })} />
            : <ColorSwatches label={t('gm.areaMap.color')} colors={AREA_REGION_COLORS} value={s.regionColor} onPick={regionColor => onChange({ regionColor })} />}
        </div>
      )
    case 'path':
      return (
        <div className="flex flex-col gap-3">
          <Segmented<AreaPathStyle>
            label={t('gm.areaMap.pathStyle')}
            value={s.pathStyle}
            options={(Object.keys(AREA_PATH_STYLES) as AreaPathStyle[]).map(v => ({ value: v, label: t(`gm.areaMap.pathStyles.${v}`) }))}
            // Trocar de estilo volta para a largura típica dele (um rio é bem mais largo que uma trilha).
            onPick={pathStyle => onChange({ pathStyle, pathWidth: AREA_PATH_STYLES[pathStyle].width })}
          />
          <Slider label={t('gm.areaMap.width')} value={s.pathWidth} display={String(s.pathWidth)}
            min={AREA_PATH_MIN_WIDTH} max={AREA_PATH_MAX_WIDTH} step={1} onChange={v => onChange({ pathWidth: v })} />
        </div>
      )
    case 'place':
      if (placeKind === 'icon') {
        return (
          <Slider label={t('gm.areaMap.placeSize')} value={s.iconSize} display={String(s.iconSize)}
            min={AREA_ICON_MIN_SIZE} max={Math.min(AREA_ICON_MAX_SIZE, 240)} step={2} buttons={8} onChange={v => onChange({ iconSize: v })} />
        )
      }
      return (
        <Slider label={t('gm.areaMap.placeSize')} value={s.stampScale} display={`${Math.round(s.stampScale * 100)}%`}
          min={AREA_STAMP_MIN_SCALE} max={4} step={0.05} buttons={0.1} onChange={v => onChange({ stampScale: v })} />
      )
    case 'label':
      return (
        <Segmented<AreaLabelStyle>
          label={t('gm.areaMap.labelStyle')}
          value={s.labelStyle}
          options={(Object.keys(AREA_LABEL_STYLES) as AreaLabelStyle[]).map(v => ({ value: v, label: t(`gm.areaMap.labelStyles.${v}`) }))}
          onPick={labelStyle => onChange({ labelStyle })}
        />
      )
    default:
      return null
  }
}
