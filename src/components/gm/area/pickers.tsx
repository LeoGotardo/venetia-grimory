import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { AREA_TEXTURE_IDS, areaTextureSwatch } from './areaTextures'

/** Rótulo pequeno em caixa-alta dos painéis do editor. */
export function PanelLabel({ children }: { children: ReactNode }) {
  return <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A8A09B]">{children}</span>
}

/** Grade de materiais (fundo, pincel, região). */
export function TexturePicker({ value, onPick, label }: { value: string | null; onPick: (id: string) => void; label: string }) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col gap-2">
      <PanelLabel>{label}</PanelLabel>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(44px,1fr))] gap-1.5">
        {AREA_TEXTURE_IDS.map(tex => {
          const active = value === tex
          const name = t(`gm.areaMap.textures.${tex}`)
          return (
            <button
              key={tex}
              type="button"
              title={name}
              aria-label={name}
              aria-pressed={active}
              data-testid={`textura-${tex}`}
              onClick={() => onPick(tex)}
              className={`aspect-square rounded-[8px] border-2 bg-cover cursor-pointer ${active ? 'border-[#D4A017]' : 'border-transparent hover:border-white/30'}`}
              style={{ backgroundImage: `url(${areaTextureSwatch(tex)})` }}
            />
          )
        })}
      </div>
    </div>
  )
}

export function ColorSwatches({ colors, value, onPick, label }: {
  colors: readonly string[]; value: string; onPick: (color: string) => void; label: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <PanelLabel>{label}</PanelLabel>
      <div className="flex flex-wrap gap-1.5">
        {colors.map(c => (
          <button
            key={c}
            type="button"
            aria-label={c}
            aria-pressed={value === c}
            onClick={() => onPick(c)}
            className={`w-9 h-9 rounded-full border-2 cursor-pointer ${value === c ? 'border-[#D4A017] scale-110' : 'border-white/20'}`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * Controle deslizante com o valor à direita do rótulo; `onCommit` fecha o gesto
 * no desfazer. `step` liga botões −/+ (mais fáceis de acertar com o dedo).
 */
export function Slider({ label, value, display, min, max, step, onChange, onCommit, buttons }: {
  label: string; value: number; display: string; min: number; max: number; step: number
  onChange: (v: number) => void; onCommit?: () => void
  /** Passo dos botões −/+; sem ele, só o controle deslizante. */
  buttons?: number
}) {
  const { t } = useTranslation()
  const nudge = (dir: 1 | -1) => {
    const next = Math.min(max, Math.max(min, Math.round((value + dir * buttons!) * 1000) / 1000))
    if (next === value) return
    onChange(next)
    onCommit?.()
  }
  const stepClass =
    'w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-[8px] bg-white/5 border border-white/[0.1] text-[16px] font-bold text-[#E8DFD0] hover:bg-white/10 cursor-pointer disabled:opacity-30 disabled:cursor-default'
  const range = (
    <input
      type="range" min={min} max={max} step={step} value={value}
      aria-label={label}
      onChange={e => onChange(Number(e.target.value))}
      onPointerUp={onCommit}
      onKeyUp={onCommit}
      className="w-full accent-[#D4A017]"
    />
  )
  return (
    <div className="flex flex-col gap-1">
      <span className="flex justify-between text-[11px] font-semibold uppercase tracking-wider text-[#A8A09B]">
        {label}<span className="tabular-nums normal-case tracking-normal text-[#E8DFD0]">{display}</span>
      </span>
      {buttons ? (
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={() => nudge(-1)} disabled={value <= min} aria-label={t('gm.areaMap.smaller', { name: label })} className={stepClass}>−</button>
          {range}
          <button type="button" onClick={() => nudge(1)} disabled={value >= max} aria-label={t('gm.areaMap.bigger', { name: label })} className={stepClass}>+</button>
        </div>
      ) : range}
    </div>
  )
}

/** Escolha exclusiva em botões lado a lado (estilo, modo). */
export function Segmented<T extends string>({ options, value, onPick, label }: {
  options: Array<{ value: T; label: string }>; value: T; onPick: (v: T) => void; label: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <PanelLabel>{label}</PanelLabel>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
        {options.map(o => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            onClick={() => onPick(o.value)}
            className={`min-h-[36px] rounded-[9px] px-3 text-[12px] font-semibold border cursor-pointer transition-colors ${
              value === o.value ? 'bg-[rgba(212,160,23,0.16)] border-[#D4A017] text-[#F5F0E8]' : 'bg-white/5 border-white/[0.1] text-[#A8A09B] hover:text-[#E8DFD0]'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}
