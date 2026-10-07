import { useTranslation } from 'react-i18next'
import type { AreaLayerId, AreaLayerState, AreaMap } from '../../../types'

interface LayersPanelProps {
  map: AreaMap
  onToggle: (id: AreaLayerId, patch: Partial<Omit<AreaLayerState, 'id'>>) => void
  /** Opacidade ao vivo (arrastando o controle); `onCommit` fecha o gesto no desfazer. */
  onOpacity: (id: AreaLayerId, opacity: number) => void
  onCommit: () => void
  onMove: (id: AreaLayerId, direction: 1 | -1) => void
}

const iconButton = (active: boolean) =>
  `w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-[8px] border cursor-pointer transition-colors ${
    active ? 'bg-white/[0.06] border-white/[0.12] text-[#E8DFD0]' : 'bg-transparent border-white/[0.06] text-[#A8A09B]'
  }`

/** Camadas de cima para baixo (como nos editores de imagem): ver, travar, opacidade e ordem. */
export function LayersPanel({ map, onToggle, onOpacity, onCommit, onMove }: LayersPanelProps) {
  const { t } = useTranslation()
  const counts = new Map<AreaLayerId, number>()
  for (const el of map.elements) counts.set(el.layer, (counts.get(el.layer) ?? 0) + 1)
  const top = map.layers.length - 1

  return (
    <ul className="flex flex-col gap-1">
      {[...map.layers].reverse().map(layer => {
        const idx = map.layers.indexOf(layer)
        const name = t(`gm.areaMap.layers.${layer.id}`)
        return (
          <li key={layer.id} className={`rounded-[10px] border border-white/[0.07] bg-white/[0.03] px-2 py-1.5 ${layer.visible ? '' : 'opacity-60'}`}>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onToggle(layer.id, { visible: !layer.visible })}
                aria-pressed={layer.visible}
                aria-label={t(layer.visible ? 'gm.areaMap.hideLayer' : 'gm.areaMap.showLayer', { name })}
                className={iconButton(layer.visible)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {layer.visible
                    ? <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>
                    : <><path d="M3 3l18 18" /><path d="M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6" /></>}
                </svg>
              </button>
              <button
                type="button"
                onClick={() => onToggle(layer.id, { locked: !layer.locked })}
                aria-pressed={layer.locked}
                aria-label={t(layer.locked ? 'gm.areaMap.unlockLayer' : 'gm.areaMap.lockLayer', { name })}
                className={iconButton(layer.locked)}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="5" y="11" width="14" height="10" rx="2" />
                  <path d={layer.locked ? 'M8 11V7a4 4 0 0 1 8 0v4' : 'M8 11V7a4 4 0 0 1 7.5-2'} />
                </svg>
              </button>
              <span className="flex-1 min-w-0 truncate text-[13px] font-semibold text-[#E8DFD0]">{name}</span>
              <span className="text-[11px] tabular-nums text-[#A8A09B]">{counts.get(layer.id) ?? 0}</span>
              <button type="button" disabled={idx === top} onClick={() => onMove(layer.id, 1)} aria-label={t('gm.areaMap.layerUp', { name })} className={`${iconButton(false)} disabled:opacity-30 disabled:cursor-default`}>↑</button>
              <button type="button" disabled={idx === 0} onClick={() => onMove(layer.id, -1)} aria-label={t('gm.areaMap.layerDown', { name })} className={`${iconButton(false)} disabled:opacity-30 disabled:cursor-default`}>↓</button>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={layer.opacity}
              onChange={e => onOpacity(layer.id, Number(e.target.value))}
              onPointerUp={onCommit}
              onKeyUp={onCommit}
              aria-label={t('gm.areaMap.layerOpacity', { name })}
              className="w-full h-4 mt-1 accent-[#D4A017]"
            />
          </li>
        )
      })}
    </ul>
  )
}
