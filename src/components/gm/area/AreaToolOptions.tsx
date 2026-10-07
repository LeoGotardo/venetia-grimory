import { useTranslation } from 'react-i18next'
import type { AreaLabelStyle, AreaPathStyle } from '../../../types'
import {
  AREA_BRUSH_MAX, AREA_BRUSH_MIN, AREA_LABEL_STYLES, AREA_PATH_MAX_WIDTH, AREA_PATH_MIN_WIDTH, AREA_PATH_STYLES,
  AREA_REGION_COLORS,
} from '../../../constants'
import { ColorSwatches, Segmented, Slider, TexturePicker } from './pickers'

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
}

interface AreaToolOptionsProps {
  tool: AreaTool
  settings: ToolSettings
  onChange: (patch: Partial<ToolSettings>) => void
}

/** Opções da ferramenta ativa (só as de desenho têm). */
export function AreaToolOptions({ tool, settings: s, onChange }: AreaToolOptionsProps) {
  const { t } = useTranslation()

  const size = (
    <Slider label={t('gm.areaMap.brushSize')} value={s.brushSize} display={String(s.brushSize)}
      min={AREA_BRUSH_MIN} max={AREA_BRUSH_MAX} step={2} onChange={v => onChange({ brushSize: v })} />
  )

  switch (tool) {
    case 'brush':
      return (
        <div className="flex flex-col gap-3">
          <TexturePicker label={t('gm.areaMap.texture')} value={s.brushTexture} onPick={brushTexture => onChange({ brushTexture })} />
          {size}
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
          {size}
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
