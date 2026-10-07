import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Campaign } from '../../types'
import { useGmStore } from '../../store/gmStore'
import { gmSecondaryButton } from './GmHeader'
import { rowButton, rowDangerButton } from './MonsterRow'
import { MapThumbnail } from './MapThumbnail'
import { MAP_DEFAULT_HEIGHT, MAP_DEFAULT_WIDTH } from '../../constants'

/** Aba Mapas da campanha. */
export function MapTab({ campaign }: { campaign: Campaign }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { createMap, duplicateMap, deleteMap } = useGmStore()
  const [name, setName] = useState('')
  const base = `/mestre/campanha/${campaign.id}/mapa`

  function handleCreate(e: FormEvent) {
    e.preventDefault()
    const id = createMap(name.trim() || t('gm.untitledMap'), MAP_DEFAULT_WIDTH, MAP_DEFAULT_HEIGHT)
    setName('')
    navigate(`${base}/${id}`)
  }

  const sorted = [...campaign.maps].sort((a, b) => b.updated_at.localeCompare(a.updated_at))

  return (
    <section>
      <form onSubmit={handleCreate} className="flex gap-2 mb-4">
        <input
          data-testid="mapa-nome"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={t('gm.mapName')}
          aria-label={t('gm.mapName')}
          className="flex-1 min-w-0 bg-[#1A1714] border border-[rgba(212,160,23,0.25)] rounded-[9px] px-3 py-2 text-[14px] text-[#F5F0E8] placeholder:text-[#A8A09B] focus:outline-none focus:border-[#D4A017]"
        />
        <button type="submit" data-testid="mapa-criar" className={gmSecondaryButton}>{t('gm.newMap')}</button>
      </form>

      {sorted.length === 0 ? (
        <div className="text-center py-14 px-6 border border-dashed border-[rgba(212,160,23,0.25)] rounded-2xl">
          <p className="text-[#A8A09B] font-semibold">{t('gm.noMaps')}</p>
          <p className="text-[#A8A09B] text-sm mt-1">{t('gm.noMapsHint')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sorted.map(m => (
            <div key={m.id} className="vg-card p-3 flex flex-col gap-2">
              <button onClick={() => navigate(`${base}/${m.id}`)} className="text-left cursor-pointer flex flex-col gap-2">
                <MapThumbnail map={m} />
                <div>
                  <div className="font-bold text-[15px] text-[#F5F0E8] truncate">{m.name || t('gm.untitledMap')}</div>
                  <div className="text-[12px] text-[#A8A09B]">{t('gm.mapSize', { w: m.width, h: m.height })}</div>
                </div>
              </button>
              <div className="flex gap-1.5">
                <button onClick={() => navigate(`${base}/${m.id}`)} className={`${rowButton} flex-1`}>{t('gm.edit')}</button>
                <button onClick={() => duplicateMap(m.id, t('gm.copyName', { name: m.name || t('gm.untitledMap') }))} className={rowButton}>
                  {t('gm.duplicate')}
                </button>
                <button onClick={() => confirm(t('gm.mapDeleteConfirm', { name: m.name })) && deleteMap(m.id)} className={rowDangerButton}>
                  {t('gm.remove')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
