/** Botão de escolha das listas da vez do player (ataque, magia, item, alvo). */
export const choiceButton = (selected: boolean) =>
  `w-full text-left rounded-[9px] px-3 py-2.5 border cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-default ${
    selected ? 'border-[#D4A017] bg-[rgba(212,160,23,0.12)]' : 'border-[#B8860B]/20 bg-[#2D2520] hover:bg-[#4D4037]'
  }`

/** Campo de texto e seletor dos modais da vez. */
export const turnField =
  'w-full bg-[#2D2520] border border-[#B8860B]/30 rounded-[9px] px-3 py-2 text-[15px] text-[#F5F0E8] placeholder:text-[#A8A09B] focus:outline-none focus:border-[#D4A017]'

export const turnLegend = 'text-[13px] font-semibold text-[#E8DFD0] mb-1'
