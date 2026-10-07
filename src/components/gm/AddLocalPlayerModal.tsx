import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '../ui/Modal'
import { useSheetStore } from '../../store/sheetStore'
import { gameData } from '../../data/rules'

interface AddLocalPlayerModalProps {
  open: boolean
  onClose: () => void
  /** `sheet_id` das fichas que já estão na mesa. */
  inParty: string[]
  onPick: (sheetId: string) => void
}

/** Lista as fichas prontas deste aparelho para entrar na mesa. */
export function AddLocalPlayerModal({ open, onClose, inParty, onPick }: AddLocalPlayerModalProps) {
  const { t } = useTranslation()
  const { savedSheets, loadSavedList } = useSheetStore()

  useEffect(() => {
    if (open) loadSavedList()
  }, [open, loadSavedList])

  // Rascunhos ficam de fora: a ficha ainda não tem os números que o mestre consulta.
  const ready = savedSheets.filter(s => s.complete !== false)

  return (
    <Modal open={open} onClose={onClose} title={t('gm.pickSheet')}>
      {ready.length === 0 ? (
        <p className="text-sm text-[#A8A09B] py-4 text-center">{t('gm.noLocalSheets')}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {ready.map(s => {
            const taken = inParty.includes(s.id)
            const charClass = gameData.classes.find(c => c.id === s.charClass)?.name ?? s.charClass
            return (
              <li key={s.id}>
                <button
                  data-testid="ficha-local"
                  disabled={taken}
                  onClick={() => onPick(s.id)}
                  className="w-full text-left rounded-[9px] px-3 py-2.5 bg-[#2D2520] hover:bg-[#4D4037] border border-[#B8860B]/20 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-default"
                >
                  <span className="block font-semibold text-[#F5F0E8]">{s.name || t('gm.noName')}</span>
                  <span className="block text-[12px] text-[#A8A09B]">
                    {t('gm.level', { n: s.level })} · {charClass}
                    {taken ? ` · ${t('gm.alreadyInParty')}` : ''}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </Modal>
  )
}
