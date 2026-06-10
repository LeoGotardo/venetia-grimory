import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1">
        {label && <label htmlFor={inputId} className="text-sm text-[#B8860B] font-medium">{label}</label>}
        <input
          ref={ref}
          id={inputId}
          className={`bg-[#2D2520] border rounded px-3 py-2 text-[#F5F0E8] text-sm focus:outline-none focus:ring-1
            ${error ? 'border-red-500 focus:ring-red-500' : 'border-[#B8860B]/30 focus:ring-[#B8860B] focus:border-[#B8860B]'}
            placeholder:text-[#A8A09B] ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1">
        {label && <label htmlFor={inputId} className="text-sm text-[#B8860B] font-medium">{label}</label>}
        <textarea
          ref={ref}
          id={inputId}
          className={`bg-[#2D2520] border rounded px-3 py-2 text-[#F5F0E8] text-sm focus:outline-none focus:ring-1 resize-y min-h-[80px]
            ${error ? 'border-red-500 focus:ring-red-500' : 'border-[#B8860B]/30 focus:ring-[#B8860B] focus:border-[#B8860B]'}
            placeholder:text-[#A8A09B] ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'
