import type { HTMLAttributes } from 'react'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'crimson' | 'gold' | 'green' | 'blue' | 'purple' | 'red'
}

export function Badge({ variant = 'default', className = '', children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-[#3D332D] text-[#F5F0E8] border-[#A8A09B]/40',
    crimson: 'bg-[#7B1D1D]/30 text-[#F5F0E8] border-[#7B1D1D]/60',
    gold:    'bg-[#B8860B]/20 text-[#D4A017] border-[#B8860B]/50',
    green:   'bg-green-900/30 text-green-300 border-green-700/50',
    blue:    'bg-blue-900/30 text-blue-300 border-blue-700/50',
    purple:  'bg-purple-900/30 text-purple-300 border-purple-700/50',
    red:     'bg-red-900/30 text-red-300 border-red-700/50',
  }
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}

export function DadoBadge({ tipo }: { tipo: string }) {
  // On-theme colors instead of generic Tailwind grays
  const colors: Record<string, string> = {
    d4:  'bg-[#3D332D] border border-[#A8A09B]/40 text-[#A8A09B]',
    d6:  'bg-green-900/60 border border-green-600/40 text-green-300',
    d8:  'bg-blue-900/60 border border-blue-600/40 text-blue-300',
    d10: 'bg-purple-900/60 border border-purple-600/40 text-purple-300',
    d12: 'bg-[#7B1D1D]/60 border border-[#7B1D1D] text-red-200',
    d20: 'bg-[#B8860B]/20 border border-[#B8860B]/50 text-[#D4A017]',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${colors[tipo] ?? 'bg-[#3D332D] border border-[#A8A09B]/40 text-[#A8A09B]'}`}>
      {tipo}
    </span>
  )
}
