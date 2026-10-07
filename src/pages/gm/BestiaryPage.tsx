import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Monster } from '../../types'
import { useGmStore } from '../../store/gmStore'
import { GmHeader, gmPrimaryButton, gmSecondaryButton } from '../../components/gm/GmHeader'
import { rowButton, rowDangerButton } from '../../components/gm/MonsterRow'
import { MonsterBrowser } from '../../components/gm/MonsterBrowser'
import { StatBlockModal } from '../../components/gm/StatBlockModal'
import { pickTextFile } from '../../lib/pickTextFile'
import { deliverJson } from '../../lib/deliverJson'

export function BestiaryPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { bestiary, deleteMonster, importMonsterPack, exportMonsterPack, copySrdToBestiary } = useGmStore()
  const [viewing, setViewing] = useState<Monster | null>(null)
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null)

  async function handleImport() {
    setMessage(null)
    const json = await pickTextFile()
    if (!json) return
    try {
      setMessage({ text: t('gm.packImported', { n: importMonsterPack(json) }), error: false })
    } catch {
      setMessage({ text: t('gm.invalidPack'), error: true })
    }
  }

  function handleDelete(m: Monster) {
    if (confirm(t('gm.monsterDeleteConfirm', { name: m.statblock.name }))) deleteMonster(m.id)
  }

  function handleCopy(m: Monster) {
    if (copySrdToBestiary(m.id)) setMessage({ text: t('gm.copiedToBestiary', { name: m.statblock.name }), error: false })
  }

  return (
    <div className="min-h-screen bg-[#131110] font-[Manrope,system-ui]">
      <GmHeader title={t('gm.bestiary')} backTo="/mestre" />

      <div className="max-w-[920px] mx-auto px-4 sm:px-8 py-6 pb-20">
        <p className="text-[13px] text-[#A8A09B] mb-4">{t('gm.bestiaryHint')}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          <button data-testid="monstro-novo" onClick={() => navigate('/mestre/bestiario/novo')} className={gmPrimaryButton}>
            {t('gm.newMonster')}
          </button>
          <button onClick={handleImport} className={gmSecondaryButton}>{t('gm.importPack')}</button>
          <button
            onClick={() => void deliverJson(exportMonsterPack(), `${t('gm.bestiary')}.json`)}
            disabled={bestiary.length === 0}
            className={gmSecondaryButton}
          >
            {t('gm.exportPack')}
          </button>
        </div>
        {message && (
          <p role={message.error ? 'alert' : 'status'} className={`text-[13px] mb-4 ${message.error ? 'text-[#d4564a]' : 'text-[#8fbf7f]'}`}>
            {message.text}
          </p>
        )}

        <MonsterBrowser
          onPick={setViewing}
          actions={m => m.source === 'srd' ? (
            <button data-testid="copiar-srd" onClick={() => handleCopy(m)} className={rowButton}>{t('gm.copyToBestiary')}</button>
          ) : (
            <>
              <button onClick={() => navigate(`/mestre/bestiario/${m.id}`)} className={rowButton}>{t('gm.edit')}</button>
              <button onClick={() => handleDelete(m)} className={rowDangerButton}>{t('gm.remove')}</button>
            </>
          )}
        />
      </div>

      <StatBlockModal block={viewing?.statblock ?? null} onClose={() => setViewing(null)} />
    </div>
  )
}
