import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Campaign } from '../../types'
import { useGmStore } from '../../store/gmStore'
import { rowButton, rowDangerButton } from './MonsterRow'
import { CreatePanel } from './CreatePanel'
import { EmptyState, MapIcon } from './ornaments'
import { MapThumbnail } from './MapThumbnail'
import { MAP_DEFAULT_HEIGHT, MAP_DEFAULT_WIDTH } from '../../constants'

/** Aba Mapas da campanha. */
export function MapTab({ campaign }: { campaign: Campaign }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { createMap, duplicateMap, deleteMap } = useGmStore()
  const base = `/mestre/campanha/${campaign.id}/mapa`

  const sorted = [...campaign.maps].sort((a, b) => b.updated_at.localeCompare(a.updated_at))

  return (
    <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
      <div className="min-w-0 order-2 lg:order-1">
        {sorted.length === 0 ? (
          <EmptyState icon={<MapIcon size={34} />} title={t('gm.noMaps')} hint={t('gm.noMapsHint')} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {sorted.map(m => (
              <div key={m.id} className="vg-card p-4 flex flex-col gap-3">
                <button onClick={() => navigate(`${base}/${m.id}`)} className="text-left cursor-pointer flex flex-col gap-2">
                  <MapThumbnail map={m} />
                  <div>
                    <div className="font-cinzel font-semibold text-[18px] text-[#F5F0E8] truncate">{m.name || t('gm.untitledMap')}</div>
                    <div className="text-[13px] text-[#A8A09B]">{t('gm.mapSize', { w: m.width, h: m.height })}</div>
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
      </div>
      <div className="order-1 lg:order-2">
        <CreatePanel
          title={t('gm.newMap')}
          hint={t('gm.noMapsHint')}
          placeholder={t('gm.mapName')}
          inputTestId="mapa-nome"
          buttonTestId="mapa-criar"
          onCreate={name => navigate(`${base}/${createMap(name || t('gm.untitledMap'), MAP_DEFAULT_WIDTH, MAP_DEFAULT_HEIGHT)}`)}
        />
      </div>
    </section>
  )
}
