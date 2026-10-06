import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Monster } from '../../types'
import { useGmStore } from '../../store/gmStore'
import { GmHeader, gmPrimaryButton, gmSecondaryButton } from '../../components/gm/GmHeader'
import { MonsterRow, rowButton, rowDangerButton } from '../../components/gm/MonsterRow'
import { StatBlockModal } from '../../components/gm/StatBlockModal'
import { matchesSearch } from '../../lib/gm/search'
import { crValue } from '../../lib/gm/statblock'
import { pickTextFile } from '../../lib/pickTextFile'
import { deliverJson } from '../../lib/deliverJson'

export function BestiaryPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { bestiary, deleteMonster, importMonsterPack, exportMonsterPack } = useGmStore()
  const [query, setQuery] = useState('')
  const [viewing, setViewing] = useState<Monster | null>(null)
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null)

  const results = useMemo(
    () => bestiary
      .filter(m => matchesSearch(m.statblock.name, query))
      .sort((a, b) => a.statblock.name.localeCompare(b.statblock.name) || crValue(a.statblock.cr) - crValue(b.statblock.cr)),
    [bestiary, query],
  )

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

        {bestiary.length > 0 && (
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('gm.search')}
            aria-label={t('gm.search')}
            className="w-full mb-4 bg-[#1A1714] border border-[rgba(212,160,23,0.25)] rounded-[11px] px-4 py-2.5 text-[14px] text-[#F5F0E8] placeholder:text-[#A8A09B] focus:outline-none focus:border-[#D4A017]"
          />
        )}

        {bestiary.length === 0 ? (
          <div className="text-center py-14 px-6 border border-dashed border-[rgba(212,160,23,0.25)] rounded-2xl">
            <p className="text-[#A8A09B] font-semibold">{t('gm.noMonsters')}</p>
            <p className="text-[#A8A09B] text-sm mt-1">{t('gm.noMonstersHint')}</p>
          </div>
        ) : results.length === 0 ? (
          <p className="text-center text-sm text-[#A8A09B] py-8">{t('gm.noMatches')}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {results.map(m => (
              <MonsterRow
                key={m.id}
                block={m.statblock}
                onClick={() => setViewing(m)}
                actions={
                  <>
                    <button onClick={() => navigate(`/mestre/bestiario/${m.id}`)} className={rowButton}>{t('gm.edit')}</button>
                    <button onClick={() => handleDelete(m)} className={rowDangerButton}>{t('gm.remove')}</button>
                  </>
                }
              />
            ))}
          </div>
        )}
      </div>

      <StatBlockModal block={viewing?.statblock ?? null} onClose={() => setViewing(null)} />
    </div>
  )
}
