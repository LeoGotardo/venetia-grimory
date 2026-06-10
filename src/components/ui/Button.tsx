import { forwardRef, type ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    const base = [
      'inline-flex items-center justify-center font-semibold rounded transition-all cursor-pointer',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      // Focus: no offset gap on dark bg — single ring with shadow instead
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#2D2520]',
    ].join(' ')

    const variants = {
      primary:   'bg-[#7B1D1D] hover:bg-[#9B2C2C] active:bg-[#6B1818] text-[#F5F0E8] border border-[#B8860B]/30',
      secondary: 'bg-[#3D332D] hover:bg-[#4D4037] active:bg-[#2D2520] text-[#F5F0E8] border border-[#B8860B]/50',
      ghost:     'bg-transparent hover:bg-[#3D332D] active:bg-[#2D2520] text-[#F5F0E8]',
      danger:    'bg-red-900 hover:bg-red-800 active:bg-red-950 text-white border border-red-700/50',
    }
    const sizes = {
      sm: 'px-3 py-1.5 text-sm gap-1.5 min-h-[32px]',
      md: 'px-4 py-2 text-sm gap-2 min-h-[36px]',
      lg: 'px-6 py-3 text-base gap-2 min-h-[44px]',
    }

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
export default Button
