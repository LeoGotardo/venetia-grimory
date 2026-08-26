import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { useFichaPdf } from '../../hooks/useFichaPdf'

interface MenuExportarProps {
  onExportarJSON: () => void
}

export function MenuExportar({ onExportarJSON }: MenuExportarProps) {
  const { t } = useTranslation()
  const { gerarPdf, gerando, erro } = useFichaPdf()
  const [aberto, setAberto] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!aberto) return
    function fechar(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setAberto(false)
    }
    function escape(e: KeyboardEvent) {
      if (e.key === 'Escape') setAberto(false)
    }
    document.addEventListener('mousedown', fechar)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('mousedown', fechar)
      document.removeEventListener('keydown', escape)
    }
  }, [aberto])

  const rotuloOcupado = gerando?.acao === 'imprimir'
    ? t('ficha.preparingPrint')
    : t('ficha.generatingPdf')

  const opcoes = [
    {
      id: 'imprimir-agora',
      label: t('ficha.print'),
      hint: t('ficha.printHint'),
      acao: () => gerarPdf('imprimir', 'imprimir'),
      ocupado: gerando?.modo === 'imprimir' && gerando.acao === 'imprimir',
    },
    {
      id: 'pdf',
      label: t('ficha.exportPdf'),
      hint: t('ficha.exportPdfHint'),
      acao: () => gerarPdf('exportar', 'baixar'),
      ocupado: gerando?.modo === 'exportar',
    },
    {
      id: 'imprimir',
      label: t('ficha.printPdf'),
      hint: t('ficha.printPdfHint'),
      acao: () => gerarPdf('imprimir', 'baixar'),
      ocupado: gerando?.modo === 'imprimir' && gerando.acao === 'baixar',
    },
    {
      id: 'json',
      label: t('ficha.exportJson'),
      hint: null,
      acao: () => {
        onExportarJSON()
        setAberto(false)
      },
      ocupado: false,
    },
  ]

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setAberto(a => !a)}
        aria-haspopup="menu"
        aria-expanded={aberto}
        disabled={gerando !== null}
        className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#A8A09B] hover:text-[#E8DFD0] bg-white/[0.04] border border-white/[0.08] rounded-[9px] px-3 py-2 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-default"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 15v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4"/><path d="M7 9l5-5 5 5"/><path d="M12 4v12"/></svg>
        {gerando ? rotuloOcupado : t('ficha.export')}
      </button>

      <AnimatePresence>
        {aberto && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.14 }}
            className="absolute right-0 top-[calc(100%+6px)] z-30 w-[268px] rounded-[11px] border border-white/[0.09] bg-[#221d18] p-1.5 shadow-xl shadow-black/40"
          >
            {opcoes.map(opcao => (
              <button
                key={opcao.id}
                role="menuitem"
                onClick={opcao.acao}
                disabled={gerando !== null}
                className="w-full text-left rounded-[8px] px-3 py-2 hover:bg-white/[0.06] cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-default"
              >
                <span className="block text-[13px] font-semibold text-[#F5F0E8]">
                  {opcao.ocupado ? rotuloOcupado : opcao.label}
                </span>
                {opcao.hint && (
                  <span className="block text-[11px] leading-snug text-[#A8A09B] mt-0.5">
                    {opcao.hint}
                  </span>
                )}
              </button>
            ))}
            {erro && (
              <p className="px-3 py-2 text-[11px] leading-snug text-[#d4564a]">
                {t('ficha.pdfError')} {erro}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
