import { useState, type FormEvent, type ReactNode } from 'react'
import { gmPrimaryButton } from './GmHeader'
import { PlusIcon } from './ornaments'

interface CreatePanelProps {
  title: string
  hint: string
  placeholder: string
  /** `data-testid` do campo e do botão (o e2e procura por eles). */
  inputTestId: string
  buttonTestId: string
  /** Conteúdo entre a dica e o campo (ex.: o tipo de mapa). */
  extra?: ReactNode
  onCreate: (name: string) => void
}

/** Coluna "criar novo" das abas da campanha: mesmo lugar e mesmo jeito em encontros e mapas. */
export function CreatePanel({ title, hint, placeholder, inputTestId, buttonTestId, extra, onCreate }: CreatePanelProps) {
  const [name, setName] = useState('')

  function submit(e: FormEvent) {
    e.preventDefault()
    onCreate(name.trim())
    setName('')
  }

  return (
    <form onSubmit={submit} className="vg-card p-6 flex flex-col gap-3 lg:sticky lg:top-[88px]">
      <h2 className="font-cinzel text-[17px] font-semibold text-[#EAD9B0]">{title}</h2>
      <p className="text-[14px] text-[#A8A09B] leading-snug">{hint}</p>
      {extra}
      <input
        data-testid={inputTestId}
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="bg-[#131110] border border-[rgba(212,160,23,0.25)] rounded-[10px] px-4 py-3 text-[16px] text-[#F5F0E8] placeholder:text-[#A8A09B] focus:outline-none focus:border-[#D4A017]"
      />
      <button type="submit" data-testid={buttonTestId} className={`${gmPrimaryButton} min-h-[46px] text-[15px]`}>
        <PlusIcon size={16} /> {title}
      </button>
    </form>
  )
}
