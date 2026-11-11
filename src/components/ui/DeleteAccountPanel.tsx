import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import Button from './Button'
import { deleteAccount } from '../../services/cloudSync'
import { firebaseErrorCode, isCancelledSignIn } from '../../services/firebaseAuth'

interface DeleteAccountPanelProps {
  onCancel: () => void
  /** A conta saiu: o modal volta para a tela de entrar e mostra o aviso. */
  onDeleted: () => void
}

function deleteErrorMessage(code: string | null, t: TFunction): string {
  if (code === 'auth/user-mismatch') return t('account.deleteWrongAccount')
  if (code === 'config') return t('account.errorAppSignature')
  return t('account.deleteError')
}

/**
 * Confirmação da exclusão da conta: diz o que sai (os dados sincronizados e o
 * login) e o que fica (os dados deste aparelho). O Google pede a conta de novo
 * antes de apagar; cancelar ali não muda nada.
 */
export function DeleteAccountPanel({ onCancel, onDeleted }: DeleteAccountPanelProps) {
  const { t } = useTranslation()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setBusy(true)
    setError(null)
    try {
      await deleteAccount()
      onDeleted()
    } catch (err) {
      const code = firebaseErrorCode(err)
      if (!isCancelledSignIn(code)) {
        console.error('[conta] Falha ao excluir a conta.', err)
        setError(deleteErrorMessage(code, t))
      }
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#E8DFD0] leading-relaxed">{t('account.deleteExplain')}</p>
      <p className="text-sm text-[#A8A09B] leading-relaxed">{t('account.deleteKeepsLocal')}</p>
      <p className="text-sm text-[#A8A09B] leading-relaxed">{t('account.deleteReauth')}</p>
      {error && <p role="alert" className="text-sm text-[#E8A0A0]">{error}</p>}
      <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
        <Button variant="secondary" onClick={onCancel} disabled={busy}>
          {t('account.cancel')}
        </Button>
        <Button variant="danger" onClick={handleDelete} disabled={busy}>
          {busy ? t('account.deleting') : t('account.deleteConfirm')}
        </Button>
      </div>
    </div>
  )
}
