import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { AreaMapListItem, Campaign, GridMap } from '../../types'
import { useGmStore } from '../../store/gmStore'
import { useAreaMapStore } from '../../store/areaMapStore'
import { rowButton, rowDangerButton } from './MonsterRow'
import { CreatePanel } from './CreatePanel'
import { EmptyState, MapIcon } from './ornaments'
import { MapThumbnail } from './MapThumbnail'
import { areaTextureSwatch } from './area/areaTextures'
import { AREA_MAP_DEFAULT_HEIGHT, AREA_MAP_DEFAULT_WIDTH, MAP_DEFAULT_HEIGHT, MAP_DEFAULT_WIDTH } from '../../constants'

type MapKind = 'combat' | 'area'

type Entry =
  | { kind: 'combat'; map: GridMap; updated_at: string }
  | { kind: 'area'; map: AreaMapListItem; updated_at: string }

/** Aba Mapas da campanha: mapas de combate (grade) e mapas de área (ilustrados) juntos. */
export function MapTab({ campaign }: { campaign: Campaign }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { createMap, duplicateMap, deleteMap } = useGmStore()
  const { list: areaList, loadList, createAreaMap, duplicateAreaMap, deleteAreaMap } = useAreaMapStore()
  const [kind, setKind] = useState<MapKind>('combat')
  const base = `/mestre/campanha/${campaign.id}`

  useEffect(() => {
    void loadList(campaign.id)
  }, [campaign.id, loadList])

  const entries: Entry[] = [
    ...campaign.maps.map(map => ({ kind: 'combat' as const, map, updated_at: map.updated_at })),
    ...(areaList ?? []).map(map => ({ kind: 'area' as const, map, updated_at: map.updated_at })),
  ].sort((a, b) => b.updated_at.localeCompare(a.updated_at))

  async function handleCreate(name: string) {
    const finalName = name || t('gm.untitledMap')
    if (kind === 'combat') {
      navigate(`${base}/mapa/${createMap(finalName, MAP_DEFAULT_WIDTH, MAP_DEFAULT_HEIGHT)}`)
    } else {
      navigate(`${base}/area/${await createAreaMap(campaign.id, finalName, AREA_MAP_DEFAULT_WIDTH, AREA_MAP_DEFAULT_HEIGHT)}`)
    }
  }

  const kindChoice = (
    <div role="radiogroup" aria-label={t('gm.areaMap.kindLabel')} className="grid grid-cols-2 gap-1.5">
      {(['combat', 'area'] as const).map(k => (
        <button
          key={k}
          type="button"
          role="radio"
          aria-checked={kind === k}
          data-testid={`mapa-tipo-${k}`}
          onClick={() => setKind(k)}
          className={`min-h-[42px] rounded-[10px] text-[14px] font-semibold border cursor-pointer transition-colors ${
            kind === k ? 'bg-[rgba(212,160,23,0.16)] border-[#D4A017] text-[#F5F0E8]' : 'bg-white/5 border-white/[0.1] text-[#A8A09B] hover:text-[#E8DFD0]'
          }`}
        >
          {t(k === 'combat' ? 'gm.areaMap.kindCombat' : 'gm.areaMap.kindArea')}
        </button>
      ))}
    </div>
  )

  return (
    <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
      <div className="min-w-0 order-2 lg:order-1">
        {entries.length === 0 ? (
          <EmptyState icon={<MapIcon size={34} />} title={t('gm.noMaps')} hint={t('gm.noMapsHint')} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {entries.map(entry => {
              const m = entry.map
              const href = `${base}/${entry.kind === 'combat' ? 'mapa' : 'area'}/${m.id}`
              const name = m.name || t('gm.untitledMap')
              return (
                <div key={m.id} className="vg-card p-4 flex flex-col gap-3">
                  <button onClick={() => navigate(href)} className="text-left cursor-pointer flex flex-col gap-2">
                    <div className="relative">
                      {entry.kind === 'combat'
                        ? <MapThumbnail map={entry.map} />
                        : <AreaThumbnail item={entry.map} />}
                      <span className="absolute left-2 top-2 rounded-full bg-[#131110]/85 border border-white/[0.12] px-2 py-0.5 text-[11px] font-semibold text-[#EAD9B0]">
                        {t(entry.kind === 'combat' ? 'gm.areaMap.kindCombat' : 'gm.areaMap.kindArea')}
                      </span>
                    </div>
                    <div>
                      <div className="font-cinzel font-semibold text-[18px] text-[#F5F0E8] truncate">{name}</div>
                      <div className="text-[13px] text-[#A8A09B]">
                        {entry.kind === 'combat'
                          ? t('gm.mapSize', { w: entry.map.width, h: entry.map.height })
                          : t('gm.areaMap.elementCount', { count: entry.map.elements })}
                      </div>
                    </div>
                  </button>
                  <div className="flex gap-1.5">
                    <button onClick={() => navigate(href)} className={`${rowButton} flex-1`}>{t('gm.edit')}</button>
                    <button
                      onClick={() => {
                        const copyName = t('gm.copyName', { name })
                        if (entry.kind === 'combat') duplicateMap(m.id, copyName)
                        else void duplicateAreaMap(m.id, copyName)
                      }}
                      className={rowButton}
                    >
                      {t('gm.duplicate')}
                    </button>
                    <button
                      onClick={() => {
                        if (!confirm(t('gm.mapDeleteConfirm', { name: m.name }))) return
                        if (entry.kind === 'combat') deleteMap(m.id)
                        else void deleteAreaMap(m.id)
                      }}
                      className={rowDangerButton}
                    >
                      {t('gm.remove')}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <div className="order-1 lg:order-2">
        <CreatePanel
          title={t('gm.newMap')}
          hint={t(kind === 'combat' ? 'gm.noMapsHint' : 'gm.areaMap.hint')}
          placeholder={t('gm.mapName')}
          inputTestId="mapa-nome"
          buttonTestId="mapa-criar"
          extra={kindChoice}
          onCreate={name => void handleCreate(name)}
        />
      </div>
    </section>
  )
}

/** Miniatura simples do mapa de área: o material do fundo (o desenho completo fica no editor). */
function AreaThumbnail({ item }: { item: AreaMapListItem }) {
  return (
    <div
      aria-hidden="true"
      className="w-full aspect-[3/2] rounded-[8px] bg-[#0d0b0a] bg-repeat flex items-center justify-center"
      style={{ backgroundImage: `url(${areaTextureSwatch(item.background)})`, backgroundSize: '96px' }}
    >
      <span className="rounded-full bg-[#131110]/70 p-3 text-[#EAD9B0]"><MapIcon size={26} /></span>
    </div>
  )
}
