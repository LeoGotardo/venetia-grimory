import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Monster } from '../../types'
import { Modal } from '../ui/Modal'
import { MonsterRow } from './MonsterRow'
import { matchesSearch } from '../../lib/gm/search'
import { crValue } from '../../lib/gm/statblock'

interface MonsterPickerModalProps {
  open: boolean
  onClose: () => void
  monsters: Monster[]
  onPick: (monster: Monster) => void
}

export function MonsterPickerModal({ open, onClose, monsters, onPick }: MonsterPickerModalProps) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')

  const results = useMemo(
    () => monsters
      .filter(m => matchesSearch(m.statblock.name, query))
      .sort((a, b) => crValue(a.statblock.cr) - crValue(b.statblock.cr) || a.statblock.name.localeCompare(b.statblock.name)),
    [monsters, query],
  )

  return (
    <Modal open={open} onClose={onClose} title={t('gm.pickMonster')} wide>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder={t('gm.search')}
        aria-label={t('gm.search')}
        className="w-full mb-3 bg-[#2D2520] border border-[#B8860B]/30 rounded px-3 py-2 text-[#F5F0E8] text-sm placeholder:text-[#A8A09B] focus:outline-none focus:border-[#B8860B]"
      />
      {results.length === 0 ? (
        <p className="text-sm text-[#A8A09B] py-4 text-center">{monsters.length === 0 ? t('gm.noMonsters') : t('gm.noMatches')}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {results.map(m => <MonsterRow key={m.id} block={m.statblock} onClick={() => onPick(m)} />)}
        </div>
      )}
    </Modal>
  )
}
