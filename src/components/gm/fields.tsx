import type { ReactNode } from 'react'

/** Campos compactos dos editores do mestre — mesmo visual escuro das telas do mestre. */

const inputClass =
  'w-full bg-[#131110] border border-white/[0.1] rounded-[8px] px-2.5 py-2 text-[14px] text-[#F5F0E8] placeholder:text-[#6f6a64] focus:outline-none focus:border-[#D4A017]'

interface FieldProps {
  label: string
  hint?: string
  children: ReactNode
  className?: string
}

export function Field({ label, hint, children, className = '' }: FieldProps) {
  return (
    <label className={`flex flex-col gap-1 min-w-0 ${className}`}>
      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A8A09B]">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-[#A8A09B]">{hint}</span>}
    </label>
  )
}

interface TextFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  hint?: string
  className?: string
  multiline?: boolean
}

export function TextField({ label, value, onChange, placeholder, hint, className, multiline }: TextFieldProps) {
  return (
    <Field label={label} hint={hint} className={className}>
      {multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={`${inputClass} resize-y`}
        />
      ) : (
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={inputClass} />
      )}
    </Field>
  )
}

interface NumberFieldProps {
  label: string
  value: number | null
  /** Com `nullable`, apagar o campo devolve `null`; sem, devolve `fallback`. */
  onChange: (value: number | null) => void
  nullable?: boolean
  fallback?: number
  min?: number
  max?: number
  hint?: string
  className?: string
}

export function NumberField({ label, value, onChange, nullable, fallback = 0, min, max, hint, className }: NumberFieldProps) {
  return (
    <Field label={label} hint={hint} className={className}>
      <input
        type="number"
        inputMode="numeric"
        value={value ?? ''}
        min={min}
        max={max}
        onChange={e => {
          const text = e.target.value
          if (text === '') return onChange(nullable ? null : fallback)
          const n = Number(text)
          if (Number.isFinite(n)) onChange(n)
        }}
        className={inputClass}
      />
    </Field>
  )
}

interface SelectFieldProps<T extends string> {
  label: string
  value: T
  options: Array<{ value: T; label: string }>
  onChange: (value: T) => void
  className?: string
}

export function SelectField<T extends string>({ label, value, options, onChange, className }: SelectFieldProps<T>) {
  return (
    <Field label={label} className={className}>
      <select value={value} onChange={e => onChange(e.target.value as T)} className={inputClass}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </Field>
  )
}

export function EditorSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="vg-card p-4 sm:p-5 flex flex-col gap-3">
      <h2 className="font-extrabold text-[15px] text-[#EAD9B0]">{title}</h2>
      {children}
    </section>
  )
}
