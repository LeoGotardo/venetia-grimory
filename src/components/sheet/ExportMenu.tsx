import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { useSheetPdf } from '../../hooks/useSheetPdf'
import { useBackHandler } from '../../hooks/useBackHandler'
import { deliverViaShare } from '../../lib/platform'

interface ExportMenuProps {
  onExportJson: () => void
}

export function ExportMenu({ onExportJson }: ExportMenuProps) {
  const { t } = useTranslation()
  const { generatePdf, preparePdf, generating, error } = useSheetPdf()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  useBackHandler(isOpen, () => setIsOpen(false))

  // No app e no celular o arquivo sai pela folha de compartilhamento do sistema,
  // que já oferece imprimir — então a opção de impressão direta some.
  const usesShare = deliverViaShare()

  useEffect(() => {
    if (!isOpen) return
    function close(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setIsOpen(false)
    }
    function escape(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', escape)
    }
  }, [isOpen])

  function toggle() {
    setIsOpen(current => {
      if (!current) preparePdf()
      return !current
    })
  }

  const busyLabel = generating?.action === 'print' && !usesShare
    ? t('sheet.preparingPrint')
    : t('sheet.generatingPdf')

  const options = [
    ...(usesShare
      ? []
      : [
          {
            id: 'imprimir-agora',
            label: t('sheet.print'),
            hint: t('sheet.printHint'),
            action: () => generatePdf('print', 'print'),
            busy: generating?.mode === 'print' && generating.action === 'print',
          },
        ]),
    {
      id: 'pdf',
      label: usesShare ? t('sheet.sharePdf') : t('sheet.exportPdf'),
      hint: t('sheet.exportPdfHint'),
      action: () => generatePdf('export', 'download'),
      busy: generating?.mode === 'export',
    },
    {
      id: 'print',
      label: usesShare ? t('sheet.sharePrintPdf') : t('sheet.printPdf'),
      hint: t('sheet.printPdfHint'),
      action: () => generatePdf('print', 'download'),
      busy: generating?.mode === 'print' && generating.action === 'download',
    },
    {
      id: 'json',
      label: t('sheet.exportJson'),
      hint: null,
      action: () => {
        onExportJson()
        setIsOpen(false)
      },
      busy: false,
    },
  ]

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={t('sheet.export')}
        disabled={generating !== null}
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#A8A09B] hover:text-[#E8DFD0] bg-white/[0.04] border border-white/[0.08] rounded-[9px] px-2.5 sm:px-3 py-2 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-default"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 15v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4"/><path d="M7 9l5-5 5 5"/><path d="M12 4v12"/></svg>
        <span className={generating ? 'inline' : 'hidden sm:inline'}>
          {generating ? busyLabel : t('sheet.export')}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.14 }}
            className="absolute right-0 top-[calc(100%+6px)] z-30 w-[min(17rem,calc(100vw-2rem))] rounded-[11px] border border-white/[0.09] bg-[#221d18] p-1.5 shadow-xl shadow-black/40"
          >
            {options.map(option => (
              <button
                key={option.id}
                role="menuitem"
                onClick={option.action}
                disabled={generating !== null}
                className="w-full text-left rounded-[8px] px-3 py-2.5 hover:bg-white/[0.06] cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-default"
              >
                <span className="block text-[13px] font-semibold text-[#F5F0E8]">
                  {option.busy ? busyLabel : option.label}
                </span>
                {option.hint && (
                  <span className="block text-[11px] leading-snug text-[#A8A09B] mt-0.5">
                    {option.hint}
                  </span>
                )}
              </button>
            ))}
            {error && (
              <p className="px-3 py-2 text-[11px] leading-snug text-[#d4564a]">
                {t('sheet.pdfError')} {error}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
