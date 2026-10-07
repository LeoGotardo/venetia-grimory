import type { ReactNode, SVGProps } from 'react'

/**
 * Vocabulário visual da área do mestre: títulos com filete, estado vazio que
 * ensina e os ícones de traço. O grimório fica aqui (molduras e títulos); os
 * dados e botões continuam lisos.
 */

/** Título de seção em Cinzel com filete dourado. `align="start"` tira o filete da esquerda. */
export function SectionTitle({ children, count, align = 'center', action }: {
  children: ReactNode
  count?: number
  align?: 'center' | 'start'
  action?: ReactNode
}) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <h2 className={`gm-rule ${align === 'start' ? 'gm-rule-start' : ''} flex-1 font-cinzel text-[14px] font-semibold tracking-[0.06em] text-[#EAD9B0]`}>
        <span className="whitespace-nowrap">
          {children}
          {count != null && <span className="ml-2 font-[Manrope,system-ui] text-[12px] font-semibold text-[#A8A09B] tabular-nums">{count}</span>}
        </span>
      </h2>
      {action}
    </div>
  )
}

/** Estado vazio: ícone, uma frase do que fazer e o botão ali mesmo. */
export function EmptyState({ icon, title, hint, children }: {
  icon: ReactNode
  title: string
  hint?: string
  children?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center text-center gap-3 py-12 px-6 rounded-2xl border border-dashed border-[rgba(212,160,23,0.25)] bg-[rgba(26,23,20,0.5)]">
      <div className="text-[#D4A017] opacity-80">{icon}</div>
      <div>
        <p className="font-cinzel text-[15px] font-semibold text-[#EAD9B0]">{title}</p>
        {hint && <p className="text-[#A8A09B] text-[13px] mt-1 max-w-[46ch]">{hint}</p>}
      </div>
      {children && <div className="flex flex-wrap justify-center gap-2 mt-1">{children}</div>}
    </div>
  )
}

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function Icon({ size = 18, children, ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
      {children}
    </svg>
  )
}

export const DiceIcon = (p: IconProps) => (
  <Icon {...p}><path d="M12 2.5 20.5 7v10L12 21.5 3.5 17V7z" /><path d="M3.5 7 12 11.5 20.5 7M12 11.5v10" /><circle cx="12" cy="7" r=".9" fill="currentColor" /><circle cx="7.5" cy="13.5" r=".9" fill="currentColor" /><circle cx="16.5" cy="13.5" r=".9" fill="currentColor" /></Icon>
)
export const LockIcon = ({ open, ...p }: IconProps & { open?: boolean }) => (
  <Icon {...p}><rect x="5" y="11" width="14" height="10" rx="2" /><path d={open ? 'M8 11V7a4 4 0 0 1 7.5-2' : 'M8 11V7a4 4 0 0 1 8 0v4'} /></Icon>
)
export const PlusIcon = (p: IconProps) => <Icon {...p}><path d="M12 5v14M5 12h14" /></Icon>
export const SwordsIcon = (p: IconProps) => (
  <Icon {...p}><path d="M14.5 17.5 3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2" /><path d="M14.5 6.5 18 3h3v3l-3.5 3.5M5 14l4 4M7 17l-3 3M3 19l2 2" /></Icon>
)
export const QuillIcon = (p: IconProps) => (
  <Icon {...p}><path d="M20 3c-6 1-11 5-13 12l-2 6M7 15c4 0 8-2 10-6" /><path d="M9.5 11.5 13 8" /></Icon>
)
export const PeopleIcon = (p: IconProps) => (
  <Icon {...p}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.5-3.5 3.2-5.5 6.5-5.5s6 2 6.5 5.5" /><circle cx="17" cy="9" r="2.5" /><path d="M16.5 14.5c2.6.2 4.4 1.9 5 4.5" /></Icon>
)
export const MapIcon = (p: IconProps) => (
  <Icon {...p}><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z" /><path d="M9 4v14M15 6v14" /></Icon>
)
export const SkullIcon = (p: IconProps) => (
  <Icon {...p}><path d="M5 11a7 7 0 1 1 14 0c0 2.4-1 3.8-2 4.6V19h-3v-2h-4v2H7v-3.4C6 14.8 5 13.4 5 11z" /><circle cx="9" cy="11" r="1.6" /><circle cx="15" cy="11" r="1.6" /></Icon>
)
export const ChevronIcon = ({ open, ...p }: IconProps & { open?: boolean }) => (
  <Icon {...p} style={{ transform: open ? 'rotate(90deg)' : undefined, transition: 'transform 180ms cubic-bezier(0.22,1,0.36,1)' }}><path d="m9 6 6 6-6 6" /></Icon>
)
