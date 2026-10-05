import type { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  selected?: boolean
  hoverable?: boolean
}

export function Card({ selected, hoverable = false, className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`
        rounded-lg border bg-[#3D332D] p-4 transition-all
        ${hoverable ? 'cursor-pointer hover:shadow-lg hover:scale-[1.01]' : ''}
        ${selected
          ? 'border-[#7B1D1D] shadow-[0_0_0_2px_#7B1D1D40] bg-[#4D2020]'
          : 'border-[#B8860B]/30 hover:border-[#B8860B]/60'}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}
